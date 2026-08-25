/**
 * Hadithmv build — emits dist/ from src/.
 *
 * Run: node tools/dist-build.mjs  (from codebase/, or anywhere — paths are
 * derived from this file's location). Requires the @swc/core,
 * lightningcss and @minify-html/node devDependencies (npm install) and
 * Node 20.11+.
 *
 * Layout contract (docs/ARCHITECTURE.md "Build"):
 *   - src/books/*.html  → dist/books/  minified by @minify-html/node
 *     (structure: whitespace collapse + comment removal + spec-safe entity
 *     normalisation, e.g. << → &lt;&lt; and &gt;&gt; → >> — plus the inline
 *     <script>/<style> blocks via minify_js/minify_css, probed and adopted
 *     2026-08-25; see ARCHITECTURE.md "Why @minify-html/node"). The pages'
 *     ../css/ ../js/ refs are untouched so they resolve inside dist exactly
 *     as in src.
 *   - src/js/*.js       → dist/js/     minified in place by @swc/core
 *     (Rust terser-family — see ARCHITECTURE.md "JS minification"); the
 *     module graph and every relative path stay at the same depth, so
 *     ../../data/ (from dist/js/) and ../../static/ (from dist/js/) hit
 *     the siblings exactly as the source tree does
 *   - src/css/*.css     → dist/css/    minified in place by lightningcss
 *     (minify: true, no targets — modern baseline; see ARCHITECTURE.md
 *     "CSS minification" for the bake-off and the range-syntax note)
 *   - data/  and  static/ are NEVER copied — they deploy side by side
 *     with dist/ (web) or are embedded by the app projects' own builds
 *     (Tauri / Android) — see docs/ARCHITECTURE.md "Build"
 *
 * dist/ is generated output only: the whole tree is wiped and rebuilt
 * each run. It IS committed — the web publishes committed files as-is, so
 * build before every commit (node tools/dist-build.mjs, or double-click the
 * dist-build.bat in codebase/); an unbuilt dist is a stale site.
 */

import {
  rmSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { minify as swcMinify } from "@swc/core"; // Rust terser-family JS minifier (adopted 2026-08-25 — see ARCHITECTURE.md "JS minification")
import { transform as lightningTransform } from "lightningcss"; // Rust-native CSS minifier (adopted 2026-08-25 — see ARCHITECTURE.md "CSS minification")
import minifyHtml from "@minify-html/node"; // CJS module — exports .minify(buf, cfg)

const ROOT = fileURLToPath(new URL("..", import.meta.url)); // codebase/
const SRC = ROOT + "src/";
const DIST = ROOT + "dist/";
const REPORT = ROOT + "dist-build-report.md"; // committed size ledger (same pattern as data/search-index-report.md)
const t0 = Date.now();

// Monotonic phase timings for Build Stats (the header stamp stays wall-clock).
const tMs = { pages: 0, js: 0, css: 0, carve: 0, report: 0 };
let tLast = process.hrtime.bigint();
const mark = (k) => {
  const now = process.hrtime.bigint();
  tMs[k] = Number(now - tLast) / 1e9;
  tLast = now;
};

let totalIn = 0;
let totalOut = 0;
const rows = [];

// ── 1. Fresh dist ──────────────────────────────────────────────
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST + "books", { recursive: true });
mkdirSync(DIST + "js", { recursive: true });
mkdirSync(DIST + "css", { recursive: true });

// ── 2. Pages: minify the HTML structure (defaults: collapse whitespace,
//       remove comments, normalise entities spec-safely) + the inline
//       script/style blocks (minify_js / minify_css — the big hand-tuned
//       blocks shrank ~40-45%; all four --dist batteries stay green) ────
const htmlFiles = readdirSync(SRC + "books").filter((f) => f.endsWith(".html"));
for (const f of htmlFiles) {
  const html = readFileSync(SRC + "books/" + f, "utf8");
  const buf = minifyHtml.minify(Buffer.from(html, "utf8"), {
    minify_js: true,
    minify_css: true,
  });
  writeFileSync(DIST + "books/" + f, buf);
  const inBytes = Buffer.byteLength(html, "utf8"); // true UTF-8 bytes, not string length
  totalIn += inBytes;
  totalOut += buf.length;
  rows.push({
    name: "books/" + f,
    in: inBytes,
    out: buf.length,
    gz: gzipSync(buf, { level: 9 }).length,
    buf,
  });
}
mark("pages");

// ── 3. JS: minify in place with @swc/core (module: true = esm kept,
//       default compress+mangle — terser-family; format.ecma 2022 = no
//       syntax lowering; asciiOnly false = Thaana/Arabic stay literal
//       instead of \uXXXX bloat) ──────────────────────────────────────
const jsFiles = readdirSync(SRC + "js").filter((f) => f.endsWith(".js"));
for (const f of jsFiles) {
  const code = readFileSync(SRC + "js/" + f, "utf8");
  const result = await swcMinify(code, {
    module: true,
    compress: {},
    mangle: {},
    format: { asciiOnly: false, comments: false, ecma: 2022 },
  });
  const buf = Buffer.from(result.code, "utf8");
  writeFileSync(DIST + "js/" + f, buf);
  const inBytes = Buffer.byteLength(code, "utf8"); // true UTF-8 bytes, not string length
  totalIn += inBytes;
  totalOut += buf.length;
  rows.push({
    name: "js/" + f,
    in: inBytes,
    out: buf.length,
    gz: gzipSync(buf, { level: 9 }).length,
    buf,
  });
}
mark("js");

// ── 4. CSS: minify in place with lightningcss (minify: true — merges
//       adjacent @media blocks, groups identical-declaration selectors,
//       normalises; url() paths are left untouched — no bundling, so
//       ../font/... keeps its depth (src/font/ from the source css, dist/font/
//       from the built css). No targets: modern-baseline
//       output — media queries use range syntax ((max-width:600px) →
//       (width<=600px)), which Safari <16.4 ignores (accepted — the apps'
//       WebViews are Chromium/WKWebView ≥ that floor) ─────────────────
const cssFiles = readdirSync(SRC + "css").filter((f) => f.endsWith(".css"));
for (const f of cssFiles) {
  const code = readFileSync(SRC + "css/" + f, "utf8");
  const result = await lightningTransform({
    filename: f,
    code: Buffer.from(code, "utf8"),
    minify: true,
  });
  const buf = result.code;
  writeFileSync(DIST + "css/" + f, buf);
  const inBytes = Buffer.byteLength(code, "utf8"); // true UTF-8 bytes, not string length
  totalIn += inBytes;
  totalOut += buf.length;
  rows.push({
    name: "css/" + f,
    in: inBytes,
    out: buf.length,
    gz: gzipSync(buf, { level: 9 }).length,
    buf,
  });
}
mark("css");

// ── 4b. Font carve ─────────────────────────────────────────────
// dist/ was wiped above, so dist/font/ must be re-produced. Delegate to the
// font tool: it carves src/font/ (the archived full font) down to the corpus
// union in dist/font/ and rewrites font-build-report.md. Byte-stable output —
// a build with unchanged content produces identical font bytes.
const carve = spawnSync("python", ["tools/hmv-font-subset.py"], {
  cwd: ROOT,
  encoding: "utf-8",
});
if (carve.status !== 0) {
  console.error("font carve failed (python tools/hmv-font-subset.py):");
  console.error(carve.stderr || carve.stdout || "(no output)");
  process.exit(1);
}
mark("carve");

// ── 5. Report ──────────────────────────────────────────────────
const pct = totalIn ? ((1 - totalOut / totalIn) * 100).toFixed(1) : "0";
rows.sort((a, b) => b.in - a.in);
const kb = (n) => (n / 1024).toFixed(1);
let totalGz = 0;
for (const r of rows) totalGz += r.gz;
const pctGz = totalIn ? ((1 - totalGz / totalIn) * 100).toFixed(1) : "0";
console.log(
  "built dist/ from src/: " +
    jsFiles.length +
    " js, " +
    cssFiles.length +
    " css, " +
    htmlFiles.length +
    " pages, carved font (minified)",
);
console.log(
  "input  " +
    kb(totalIn) +
    " KB  →  output " +
    kb(totalOut) +
    " KB  (" +
    pct +
    "% saved)",
);
console.log("gzip -9:  " + kb(totalGz) + " KB  (per-file sum — the web metric)");
// per-type summary — the web's three boxes; labels are the file types,
// prefixes are the real dist/ folder each type lives in (books/ = html)
const typeRows = [
  { label: "js", prefix: "js/" },
  { label: "css", prefix: "css/" },
  { label: "html", prefix: "books/" },
].map((t) => {
  const sub = rows.filter((r) => r.name.startsWith(t.prefix));
  const i = sub.reduce((s, r) => s + r.in, 0);
  const o = sub.reduce((s, r) => s + r.out, 0);
  const g = sub.reduce((s, r) => s + r.gz, 0);
  return {
    name: t.label,
    prefix: t.prefix,
    files: sub.length,
    in: i,
    out: o,
    gz: g,
    saved: ((1 - o / i) * 100).toFixed(1),
    gzSaved: ((1 - g / i) * 100).toFixed(1),
  };
});
for (const t of typeRows) {
  console.log(
    "  " +
      t.name.padEnd(7) +
      kb(t.out).padStart(7) +
      " KB  (was " +
      kb(t.in) +
      ", gz " +
      kb(t.gz) +
      ")",
  );
}
for (const r of rows) {
  console.log(
    "  " +
      r.name.padEnd(32) +
      kb(r.out).padStart(7) +
      " KB  (was " +
      kb(r.in) +
      ")",
  );
}

// dist-build-report.md — the committed size ledger, mirroring the shape of
// data/search-index-report.md: content version stamp, totals, build stats.
const hash = createHash("sha256");
for (const r of [...rows].sort((a, b) => a.name.localeCompare(b.name))) {
  hash.update(r.buf);
}
const pkg = JSON.parse(readFileSync(ROOT + "package.json", "utf8"));
const dv = pkg.devDependencies || {};
const stamp = new Date().toISOString();
const elapsed = ((Date.now() - t0) / 1000).toFixed(1) + " s";
const totalSecs = tMs.pages + tMs.js + tMs.css + tMs.carve + tMs.report;
const report =
  "# Dist Build Report\n\n" +
  "Regenerated by `node tools/dist-build.mjs` — machine output, do not hand-edit.\n\n" +
  "| Built in | Version |\n|---|---|\n" +
  "| " + stamp + " (" + elapsed + ") | `" + hash.digest("hex").slice(0, 16) + "` |\n\n" +
  "| Type | Files | Input | Output | Saved | Gzip (-9) | Gzip saved |\n|---|---|---|---|---|---|---|\n" +
  typeRows
    .map(
      (t) =>
        "| " + t.name + " | " + t.files + " | " + kb(t.in) + " KB | " + kb(t.out) + " KB | " +
        t.saved + "% | " + kb(t.gz) + " KB | " + t.gzSaved + "% |",
    )
    .join("\n") +
  "\n| **Total** | **" + rows.length + "** | **" + kb(totalIn) + " KB** | **" + kb(totalOut) + " KB** | **" + pct + "%** | **" + kb(totalGz) + " KB** | **" + pctGz + "%** |\n\n" +
  "## Build Stats\n\n" +
  "- Total: " + totalSecs.toFixed(1) + " s — pages " + tMs.pages.toFixed(1) + " s · js " + tMs.js.toFixed(1) +
  " s · css " + tMs.css.toFixed(1) + " s · carve " + tMs.carve.toFixed(1) + " s · report " + tMs.report.toFixed(1) + " s\n" +
  "- Node " + process.version + " · @swc/core " + (dv["@swc/core"] || "?") +
  " · lightningcss " + (dv.lightningcss || "?") + " · @minify-html/node " + (dv["@minify-html/node"] || "?") + "\n\n" +
  "## Notes\n\n" +
  "- Version = sha256 over the output bytes of all files (name-sorted), first 16 hex\n" +
  "- Sizes are true UTF-8 bytes; gzip is per-file at level 9 — GitHub Pages compresses each file separately\n" +
  "- Saved and Gzip saved are both vs Input — the pipeline story: source → minified → served\n" +
  "- data/ and static/ are never in dist/ — they deploy side by side\n" +
  "- dist/font/ is carved from src/font/ by tools/hmv-font-subset.py as part of this build — see font-build-report.md\n" +
  "- src/ stays committed, so the unminified `/codebase/src/…` URLs keep working alongside `/codebase/dist/…`\n\n" +
  "## Files\n\n" +
  typeRows
    .map(
      (t) =>
        "### " + t.name + " — " + t.files + " files\n\n" +
        "| File | Input | Output | Saved | Gzip | Gzip saved |\n|---|---|---|---|---|---|\n" +
        rows
          .filter((r) => r.name.startsWith(t.prefix))
          .map(
            (r) =>
              "| " + r.name + " | " + kb(r.in) + " KB | " + kb(r.out) + " KB | " +
              ((1 - r.out / r.in) * 100).toFixed(1) + "% | " + kb(r.gz) + " KB | " +
              ((1 - r.gz / r.in) * 100).toFixed(1) + "% |",
          )
          .join("\n"),
    )
    .join("\n\n") +
  "\n";
writeFileSync(REPORT, report);
mark("report");
console.log("wrote dist-build-report.md  (" + Buffer.byteLength(report, "utf8") + " B)");
console.log(
  "\ndeploy: commit dist/ + static/ + data/ side by side — data/ and static/ are never in dist/",
);
