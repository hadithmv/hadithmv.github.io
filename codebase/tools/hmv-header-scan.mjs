// Header-label audit: lists CSV headers in data/content/ whose camelCase
// tokens have no entry in src/js/column-tokens.js (the tables
// src/js/column-labels.js uses to derive display labels). This is OPTIONAL
// tidying, not a gate: an unmapped header falls back to its raw identifier in
// the advanced-search column dropdown and the column toggles — the same
// identifier the table header shows — so a new book's columns work
// immediately and nothing is blocked.
//
// Usage: node tools/hmv-header-scan.mjs
// Exit:  0 = every header is curated, 1 = uncurated headers exist (the audit
//        result, not a build failure) or a data problem
//
// When you want to clear a header, add its token to src/js/column-tokens.js
// (and a col* entry in src/js/i18n.js), or list the header in DELIBERATE_RAW
// below to record a conscious decision to leave it raw.
//
// DELIBERATE_RAW: headers we intentionally leave as raw text. Today: none —
// the trailing empty field in IH-manKhalaqaniWaLimaza.csv never reaches the
// app (parseCSV trims trailing empties), and unknownTokens("") returns []
// anyway as a defensive case.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { unknownTokens } from "../src/js/column-tokens.js";
import { parseCSV } from "../src/js/csv.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = path.join(ROOT, "data", "content");
const DELIBERATE_RAW = {}; // exact header text → reason

let failures = 0;
let uncurated = 0;
let filesChecked = 0;
let headersChecked = 0;
const seen = new Map(); // header → {files, unknown}

for (const name of fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".csv")).sort()) {
  const filePath = path.join(CONTENT_DIR, name);
  const rows = parseCSV(fs.readFileSync(filePath, "utf8"));
  if (rows.length === 0) {
    console.log("EMPTY " + name);
    failures++;
    continue;
  }
  filesChecked++;
  const header = rows[0];
  for (const hdr of header) {
    headersChecked++;
    if (!seen.has(hdr)) seen.set(hdr, { files: [], unknown: null });
    const entry = seen.get(hdr);
    entry.files.push(name);
    if (entry.unknown === null) {
      entry.unknown = unknownTokens(hdr);
      if (entry.unknown.length > 0 && DELIBERATE_RAW[hdr]) entry.unknown = [];
    }
  }
}

// Report in first-seen order (stable, matches data file sort order).
for (const [hdr, entry] of seen) {
  const label = hdr === "" ? "(empty)" : hdr;
  if (entry.unknown.length > 0) {
    uncurated++;
    console.log(
      "UNCURATED " + label + " -> [" + entry.unknown.join(", ") + "]  in " + entry.files.join(", ")
    );
  } else {
    console.log("ok      " + label);
  }
}
console.log(
  "\n" + filesChecked + " files, " + seen.size + " distinct headers, " +
  headersChecked + " header cells" + (uncurated ? ", " + uncurated + " uncurated" : ", all curated")
);
if (uncurated) {
  console.log(
    "Optional cleanup: add tokens to src/js/column-tokens.js (with col* labels in " +
    "src/js/i18n.js), or list the header in DELIBERATE_RAW with a reason. Raw fallback " +
    "is by design, so this is not a build failure."
  );
}
if (failures || uncurated) process.exit(1);
