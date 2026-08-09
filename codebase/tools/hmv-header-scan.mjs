// Header-coverage scan: every CSV header in data/content/ must be fully
// mappable to a display label by js/column-labels.js. It walks all content
// files, tokenizes each header with the SAME tokenizer the mapper uses, and
// reports any header whose tokens the mapper does not know (those would
// silently fall back to the raw identifier in the advanced-search dropdown
// and column toggles).
//
// Usage: node tools/hmv-header-scan.mjs
// Exit:  0 = all headers mapped, 1 = unknown tokens (or a data problem)
//
// When this reports an unknown token, add it to js/column-tokens.js (and a
// col* entry in js/i18n.js) or to DELIBERATE_RAW below if it must stay raw.
//
// DELIBERATE_RAW: headers we intentionally leave as raw text. Today: none —
// the trailing empty field in IH-manKhalaqaniWaLimaza.csv never reaches the
// app (parseCSV trims trailing empties), and unknownTokens("") returns []
// anyway as a defensive case.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { unknownTokens } from "../js/column-tokens.js";
import { parseCSV } from "../js/csv.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = path.join(ROOT, "data", "content");
const DELIBERATE_RAW = {}; // exact header text → reason

let failures = 0;
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
    failures++;
    console.log(
      "UNKNOWN " + label + " -> [" + entry.unknown.join(", ") + "]  in " + entry.files.join(", ")
    );
  } else {
    console.log("ok      " + label);
  }
}
console.log(
  "\n" + filesChecked + " files, " + seen.size + " distinct headers, " +
  headersChecked + " header cells" + (failures ? ", " + failures + " with unknown tokens" : ", all mapped")
);
if (failures) {
  console.log(
    "Fix: add tokens to js/column-labels.js (with col* labels in js/i18n.js), " +
    "or list the header in DELIBERATE_RAW with a reason."
  );
  process.exit(1);
}
