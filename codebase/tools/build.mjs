/**
 * Hadithmv build — emits dist/ from src/.
 *
 * Run: node tools/build.mjs  (from codebase/, or anywhere — paths are
 * derived from this file's location). Requires the esbuild devDependency
 * (npm install) and Node 20.11+.
 *
 * Layout contract (docs/ARCHITECTURE.md "Build"):
 *   - src/books/*.html  → dist/books/  verbatim (their ../css/ ../js/ refs
 *     resolve inside dist)
 *   - src/js/*.js       → dist/js/     minified in place — the module
 *     graph and every relative path stay at the same depth, so
 *     ../../data/ (from dist/js/) and ../../static/ (from dist/js/) hit
 *     the siblings exactly as the source tree does
 *   - src/css/*.css     → dist/css/    minified in place
 *   - data/  and  static/ are NEVER copied — they deploy side by side
 *     with dist/ (web) or are embedded by the app projects' own builds
 *     (Tauri / Android) — see docs/ARCHITECTURE.md "Build"
 *
 * dist/ is generated output only: the whole tree is wiped and rebuilt
 * each run (cannot drift), and is gitignored.
 */

import { rmSync, mkdirSync, cpSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const ROOT = fileURLToPath(new URL("..", import.meta.url)); // codebase/
const SRC = ROOT + "src/";
const DIST = ROOT + "dist/";

// ── 1. Fresh dist ──────────────────────────────────────────────
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST + "js", { recursive: true });
mkdirSync(DIST + "css", { recursive: true });
cpSync(SRC + "books", DIST + "books", { recursive: true });

// ── 2. JS: minify in place (format esm, target esnext = no syntax
//       lowering — whitespace/syntax/identifier minification only) ──
const jsFiles = readdirSync(SRC + "js").filter((f) => f.endsWith(".js"));
let totalIn = 0;
let totalOut = 0;
const rows = [];

for (const f of jsFiles) {
  const code = readFileSync(SRC + "js/" + f, "utf8");
  const result = await esbuild.transform(code, {
    loader: "js",
    format: "esm",
    target: "esnext",
    minify: true,
    charset: "utf8", // pages are UTF-8 — keep Thaana/Arabic literal instead of \uXXXX bloat
  });
  writeFileSync(DIST + "js/" + f, result.code);
  totalIn += code.length;
  totalOut += result.code.length;
  rows.push({ name: "js/" + f, in: code.length, out: result.code.length });
}

// ── 3. CSS: minify in place (url() paths are left untouched — no
//       bundling, so ../../static/font/... keeps its depth) ──────
const cssFiles = readdirSync(SRC + "css").filter((f) => f.endsWith(".css"));
for (const f of cssFiles) {
  const code = readFileSync(SRC + "css/" + f, "utf8");
  const result = await esbuild.transform(code, { loader: "css", minify: true, charset: "utf8" });
  writeFileSync(DIST + "css/" + f, result.code);
  totalIn += code.length;
  totalOut += result.code.length;
  rows.push({ name: "css/" + f, in: code.length, out: result.code.length });
}

// ── 4. Report ──────────────────────────────────────────────────
const pct = totalIn ? ((1 - totalOut / totalIn) * 100).toFixed(1) : "0";
rows.sort((a, b) => b.in - a.in);
console.log("built dist/ from src/: " + jsFiles.length + " js, " + cssFiles.length + " css, 4 pages verbatim");
console.log("input  " + (totalIn / 1024).toFixed(1) + " KB  →  output " + (totalOut / 1024).toFixed(1) + " KB  (" + pct + "% saved)");
for (const r of rows) {
  console.log("  " + r.name.padEnd(32) + String((r.out / 1024).toFixed(1)).padStart(7) + " KB  (was " + (r.in / 1024).toFixed(1) + ")");
}
console.log("\ndeploy dist/ + static/ + data/ side by side — data/ and static/ are never in dist/");
