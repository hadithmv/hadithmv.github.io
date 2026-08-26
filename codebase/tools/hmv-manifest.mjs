/**
 * Writes dist/manifest.json — the served-tree fingerprint ledger the service
 * worker (codebase/sw.js) trusts: a map of scope-relative URL → sha256
 * fingerprint (first 16 hex) for every file the SW may serve.
 *
 * Run:  node tools/hmv-manifest.mjs   (from codebase/, or anywhere — paths
 * derive from this file's location)
 *
 * Called at the end of every script that changes served files, and directly
 * after hand-editing a registry or a note:
 *   - node tools/dist-build.mjs       (step 4c — pages/js/css/font)
 *   - python tools/hmv-font-subset.py (standalone carve runs)
 *   - data/04-update-bookRegistry.ps1 (registry rewrites)
 *   - by hand, before a data-only commit (the tiny command — no full build)
 *
 * Whole rewrite every run, never partial: fingerprints are content-derived,
 * so unchanged files emit the same bytes and only truly changed lines diff.
 * No timestamps — a no-op run is byte-identical (idempotent by construction),
 * and reverting a file reverts its line in the manifest for free.
 *
 * Deliberately absent: data/content/*.csv and data/search-index.json — the
 * app's own IndexedDB version-gates them (csv.js fetchBookCSVCached,
 * library-search-engine.js loadSearchIndex); ~105 MB of corpus must never
 * ride the SW cache. The SW passes anything not listed through untouched.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url)); // codebase/
const OUT = ROOT + "dist/manifest.json";

// (dir, predicate) pairs, walked from codebase root. The first three are the
// build's own output; the registries and notes are hand-edited served files.
const SOURCES = [
  { dir: ROOT + "dist/books", match: (f) => f.endsWith(".html") },
  { dir: ROOT + "dist/js", match: (f) => f.endsWith(".js") },
  { dir: ROOT + "dist/css", match: (f) => f.endsWith(".css") },
  { dir: ROOT + "dist/font", match: () => true },
  { dir: ROOT + "data", match: (f) => f.indexOf("-registry-") !== -1 },
  { dir: ROOT + "static/notes", match: (f) => f.endsWith(".md"), recursive: true },
];

function walk(dir, recursive) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = dir + "/" + entry.name;
    if (entry.isDirectory() && recursive) out.push(...walk(p, recursive));
    else if (entry.isFile()) out.push(p);
  }
  return out;
}

const manifest = {};
let count = 0;
for (const src of SOURCES) {
  if (!statSync(src.dir, { throwIfNoEntry: false })) {
    console.error("ERROR: " + src.dir.replace(ROOT, "") + "/ is missing — run node tools/dist-build.mjs first (or restore it)");
    process.exit(1);
  }
  for (const file of walk(src.dir, src.recursive)) {
    const key = path.relative(ROOT, file).split(path.sep).join("/");
    if (!src.match(key.split("/").pop())) continue;
    const digest = createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 16);
    manifest[key] = digest;
    count++;
  }
}
if (count === 0) {
  console.error("ERROR: no files matched — refusing to write an empty manifest");
  process.exit(1);
}

// Keys sorted; 2-space indent keeps each entry on its own diffable line.
// LF, no trailing newline — the data-file convention.
const out = JSON.stringify(manifest, null, 2);
writeFileSync(OUT, out, "utf8");

const kb = (n) => (n / 1024).toFixed(1);
const domains = Object.keys(manifest).reduce((acc, k) => {
  const d = k.split("/")[0];
  acc[d] = (acc[d] || 0) + 1;
  return acc;
}, {});
const listing = Object.entries(domains).map(([d, n]) => d + " (" + n + ")").join(" · ");
console.log(
  "manifest: " + count + " files, " + kb(Buffer.byteLength(out)) +
  " KB → dist/manifest.json — " + listing,
);
