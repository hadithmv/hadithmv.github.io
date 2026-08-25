/**
 * Builds data/search-index.json — word-level postings across every book.
 *
 * Run:  node data/08-rebuild-searchIndex.mjs
 *
 * For each registered book: parse the CSV, normalise every cell with the
 * same normalisation the app's search uses (search-utils.js), tokenise into words,
 * and record (bookCode, row) for each word. -HDN columns and the row-number
 * column are excluded; an optional `excludeFromIndex` column in the registry
 * skips the listed columns — the magic value `ENTIRE-BOOK` skips the whole
 * book. A per-book report of indexed and skipped columns
 * is printed while building and written to data/search-index-report.md
 * (policy table, warnings, build stats, postings by column). The result feeds the
 * cross-book search (js/library-search-engine.js).
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import { parseCSV } from "../src/js/csv.js";
import { normaliseForSearch } from "../src/js/search-utils.js";
// Same tokeniser the query side uses (src/js/library-search-engine.js) — build
// and query MUST agree on what a word is, or lookups would silently miss.
import { tokenizeText } from "../src/js/library-search-engine.js";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY = path.join(DIR, "03-registry-bookMeta.csv");
const OUT = path.join(DIR, "search-index.json");

// word → { bookId: Set<row> }   (bookId is a numeric index into bookIds[])
const index = {};
const bookIds = []; // bookCode per numeric id — postings stay compact
const bookIdOf = {}; // bookCode → id
const bookPostings = {}; // bookCode → posting count (for the report)
const colPostings = {}; // bookCode → { column → posting count } (for the report)
const reportEntries = []; // per-book rows for data/search-index-report.md
const reportWarnings = []; // build warnings, mirrored into the report file
let booksScanned = 0;
let rowsScanned = 0;
let wordsIndexed = 0;

function addWord(word, bookId, row) {
  let books = index[word];
  if (!books) books = index[word] = {};
  let rows = books[bookId];
  if (!rows) rows = books[bookId] = new Set();
  rows.add(row);
}

const registryRows = parseCSV(fs.readFileSync(REGISTRY, "utf8"));
const header = registryRows[0];
const bookIdx = header.indexOf("bookCode");
// Optional registry column: comma-separated header names to SKIP. When set
// for a book, those columns are not indexed (the row-number and -HDN columns
// are still always skipped regardless). Absent/empty = all columns indexed.
const excludeFromIdx = header.indexOf("excludeFromIndex");

let booksWithExclusions = 0;
let booksExcluded = 0; // books skipped entirely via the ENTIRE-BOOK magic token
const excludedEntries = []; // report rows for data/search-index-report.md

const tIndexStart = performance.now(); // build timing — parse + index phase

for (const entry of registryRows.slice(1)) {
  const bookCode = entry[bookIdx];
  if (!bookCode) continue;
  const csvPath = path.join(DIR, "content", bookCode + ".csv");
  if (!fs.existsSync(csvPath)) {
    console.warn("skip (no file):", bookCode);
    reportWarnings.push("skip (no file): " + bookCode);
    continue;
  }
  // QRN books are 6,236-slot skeletons — an empty row is an untranslated ayah,
  // not formatting. Keep those rows so postings' row numbers match the reader's
  // merged table, which keeps them via the same flag (loadQuranBookCSV).
  const isQRN = bookCode.indexOf("QRN-") === 0;
  const rows = parseCSV(fs.readFileSync(csvPath, "utf8"), isQRN);
  if (rows.length === 0) continue;
  const csvHeader = rows[0];
  const dataRows = rows.slice(1);

  // Columns to skip for this book, computed once from the header
  const excludedRaw = excludeFromIdx !== -1 ? (entry[excludeFromIdx] || "").trim() : "";
  const excludedList = excludedRaw
    ? excludedRaw.toLowerCase().split(",").map((s) => s.trim()).filter(Boolean)
    : null;
  // Magic token: exclude the WHOLE book — no postings, never searchable, but
  // the book stays registered and readable (dashboard/reader are unaffected).
  // Other names in the same cell are ignored (the token wins).
  const hasEntireBook = excludedList && excludedList.indexOf("entire-book") !== -1;
  if (hasEntireBook) {
    booksExcluded++;
    booksScanned++;
    console.log(bookCode + ": ENTIRE-BOOK — excluded from index");
    excludedEntries.push({ code: bookCode, rows: dataRows.length });
    continue;
  }
  if (excludedList) {
    booksWithExclusions++;
    for (const name of excludedList) {
      if (!csvHeader.some((h) => (h || "").trim().toLowerCase() === name)) {
        const msg = "excludeFromIndex lists '" + name + "' but " + bookCode + " has no such column";
        console.warn("warn: " + msg);
        reportWarnings.push(msg);
      }
    }
  }
  const colIdx = []; // column indices actually indexed
  const skipped = []; // display names of skipped columns
  for (let c = 0; c < csvHeader.length; c++) {
    const hdr = (csvHeader[c] || "").trim().toLowerCase();
    // Row-number columns are never indexed: the leading `#`/empty column, or
    // any column literally named `#` (some books keep it after the source
    // column) — it stays "(row numbers)" in the report, never "(excluded)".
    if (hdr === "#" || (hdr === "" && c === 0)) {
      skipped.push(csvHeader[c] || "#");
      continue;
    }
    if (hdr.endsWith("-hdn")) {
      // hidden columns are never searchable — the reader can't show the text
      skipped.push(csvHeader[c] || "#" + c);
      continue;
    }
    if (excludedList && excludedList.indexOf(hdr) !== -1) {
      skipped.push(csvHeader[c] || "#" + c);
      continue;
    }
    colIdx.push(c);
  }
  if (colIdx.length === 0) {
    const msg = bookCode + " indexes no columns";
    console.warn("warn: " + msg);
    reportWarnings.push(msg);
  }

  for (let r = 0; r < dataRows.length; r++) {
    const row = dataRows[r];
    // 1-based DATA POSITION, not the CSV's # column — the reader's ?row=
    // param means "1-based position in the data rows" (goTo(row-1)), and #
    // columns are not always sequential (5 books have gaps), so the CSV's #
    // value would deep-link to the wrong row. Display labels use the #
    // column; links use positions.
    const rowNum = r + 1;
    for (const c of colIdx) {
      const cell = row[c];
      if (cell === null || cell === undefined) continue;
      const colName = csvHeader[c] || "#" + c;
      const norm = normaliseForSearch(String(cell));
      if (!norm) continue;
      let bid = bookIdOf[bookCode];
      if (bid === undefined) {
        bid = bookIdOf[bookCode] = bookIds.length;
        bookIds.push(bookCode);
      }
      const words = tokenizeText(norm);
      for (const w of words) {
        addWord(w, bid, rowNum);
        wordsIndexed++;
      }
      bookPostings[bookCode] = (bookPostings[bookCode] || 0) + words.length;
      let bookCols = colPostings[bookCode];
      if (!bookCols) bookCols = colPostings[bookCode] = {};
      bookCols[colName] = (bookCols[colName] || 0) + words.length;
    }
    rowsScanned++;
  }
  booksScanned++;
  // One report line per book — eyeball the whole indexing policy at a glance
  const colNames = colIdx.map((c) => csvHeader[c] || "#" + c).join(", ");
  const skippedNames = skipped.join(", ");
  const skipNote = skippedNames ? " | skipped: " + skippedNames : "";
  console.log(bookCode + ": " + dataRows.length + " rows | indexed: " + colNames + skipNote);
  reportEntries.push({
    id: bookIdOf[bookCode], // 0-based id in meta.bookIds; undefined if nothing was indexed
    code: bookCode,
    rows: dataRows.length,
    postings: bookPostings[bookCode] || 0,
    indexed: colNames,
    skippedCount: skipped.length,
    skipped: skippedNames,
  });
}

const tIndexEnd = performance.now(); // index phase done — postings in memory

// Pack rows as sorted ranges ("1-5,8,12") to shrink the file
function packRows(rowSet) {
  const nums = [...rowSet].sort((a, b) => a - b);
  const parts = [];
  let start = nums[0], prev = nums[0];
  for (let i = 1; i <= nums.length; i++) {
    const n = nums[i];
    if (n !== prev + 1) {
      parts.push(start === prev ? String(start) : start + "-" + prev);
      start = n;
    }
    prev = n;
  }
  return parts.join(",");
}

const words = {};
for (const [word, books] of Object.entries(index)) {
  const byBook = {};
  for (const [bookId, rowSet] of Object.entries(books)) {
    byBook[bookId] = packRows(rowSet);
  }
  words[word] = byBook;
}

// Version = hash of the payload — the loader validates its cache against it
const payload = JSON.stringify(words);
const version = crypto.createHash("sha256").update(payload).digest("hex").slice(0, 16);
const tPayloadEnd = performance.now(); // payload stringified + hashed — pack phase done

const out = JSON.stringify({
  meta: {
    version: version,
    built: new Date().toISOString(),
    bookIds: bookIds, // postings use numeric ids; resolve back through this
    books: booksScanned,
    excluded: booksExcluded, // books skipped via excludeFromIndex: ENTIRE-BOOK
    rows: rowsScanned,
    words: Object.keys(words).length,
  },
  words: words,
});

fs.writeFileSync(OUT, out, "utf8");
const tEnd = performance.now(); // all build work done
const phaseIndex = tIndexEnd - tIndexStart;
const phasePack = tPayloadEnd - tIndexEnd;
const phaseWrite = tEnd - tPayloadEnd;
const totalMs = tEnd - tIndexStart;
const fmtSec = (ms) => (ms / 1000).toFixed(1) + " s";
const fmtRate = (n, ms) => Math.round((n / ms) * 1000).toLocaleString("en-US");
const heapMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0);
console.log("\nindex written:", OUT);
console.log("books:", booksScanned, "| rows:", rowsScanned, "| postings:", wordsIndexed, "| unique words:", Object.keys(words).length, "| excludeFromIndex:", booksWithExclusions, "| excluded books:", booksExcluded);
const rawBytes = fs.statSync(OUT).size;
const gzBytes = zlib.gzipSync(out).length;
const rawMB = (rawBytes / 1024 / 1024).toFixed(1);
const gzipMB = (gzBytes / 1024 / 1024).toFixed(1);
const gzipSaved = (100 * (1 - gzBytes / rawBytes)).toFixed(1);
console.log("raw size:", rawMB + " MB");
console.log("gzip size:", gzipMB + " MB (" + gzipSaved + "% saved)");
console.log("elapsed: " + fmtSec(totalMs) + " | " + fmtRate(rowsScanned, phaseIndex) + " rows/s | " + fmtRate(wordsIndexed, phaseIndex) + " postings/s");
console.log("phases: index " + fmtSec(phaseIndex) + " · pack " + fmtSec(phasePack) + " · write " + fmtSec(phaseWrite));
console.log("heap used: " + heapMB + " MB | node " + process.version);

// ── Report file — the same policy as a diffable markdown table ──
const fmt = (n) => n.toLocaleString("en-US"); // thousands separators for humans
let md = "# Search Index Report\n\n";
md += "Regenerated by `node data/08-rebuild-searchIndex.mjs` — machine output, do not hand-edit.\n\n";
md += "| Built in | Version |\n|---|---|\n";
md += "| " + new Date().toISOString() + " (" + (totalMs / 1000).toFixed(1) + " s) | `" + version + "` |\n\n";
md += "| Books | Rows | Postings | Unique words | Raw | Gzip | Gzip saved | ExcludeColumns | Excluded books |\n";
md += "|---|---|---|---|---|---|---|---|---|\n";
md += "| " + fmt(booksScanned) + " | " + fmt(rowsScanned) + " | " + fmt(wordsIndexed) + " | " +
  fmt(Object.keys(words).length) + " | " + rawMB + " MiB | " + gzipMB + " MiB | " + gzipSaved + "% | " +
  booksWithExclusions + " | " + booksExcluded + " |\n\n";
md += "## Build Stats\n\n";
md += "- Total: " + fmtSec(totalMs) + " — index " + fmtSec(phaseIndex) + " · pack " + fmtSec(phasePack) + " · write " + fmtSec(phaseWrite) + "\n";
md += "- " + fmtRate(rowsScanned, phaseIndex) + " rows/s · " + fmtRate(wordsIndexed, phaseIndex) + " postings/s\n";
md += "- Heap used: " + heapMB + " MB · node " + process.version + "\n\n";
md += "## Notes\n\n";
md += "- `-HDN` books and columns are hidden from the dashboard and search scope.\n";
md += "- `# (row numbers)` is the CSV's position column — never indexed.\n";
md += "- An `excludeFromIndex` registry entry skips the listed columns.\n";
md += "- `excludeFromIndex: ENTIRE-BOOK` skips the whole book — it stays in the dashboard and reader but is never searchable.\n";
md += "- Ids are 1-based positions in `meta.bookIds` (what postings in search-index.json reference).\n\n";
if (reportWarnings.length > 0) {
  md += "## Warnings\n\n";
  for (const w of reportWarnings) md += "- " + w + "\n";
  md += "\n";
}
md += "## Books\n\n";
md += "| Id | Book | Rows | Postings | Indexed | Skipped count | Skipped |\n|---|---|---|---|---|---|---|\n";
for (const e of reportEntries) {
  const id = e.id === undefined ? "-" : e.id + 1;
  md +=
    "| " + id + " | " + e.code + " | " + fmt(e.rows) + " | " + fmt(e.postings) +
    " | " + e.indexed + " | " + e.skippedCount + " | " + (e.skipped || "—") + " |\n";
}
if (booksExcluded > 0) {
  md += "\n## Excluded Books\n\n";
  md += "| Book | Rows |\n|---|---|\n";
  for (const e of excludedEntries) {
    md += "| " + e.code + " | " + fmt(e.rows) + " |\n";
  }
}
md += "\n## Postings by Column — Largest First\n\n";
md += "| Id | Book | Column | Postings | Share |\n|---|---|---|---|---|\n";
const colEntries = [];
for (const [bookCode, cols] of Object.entries(colPostings)) {
  for (const [column, count] of Object.entries(cols)) {
    colEntries.push({ id: bookIdOf[bookCode], book: bookCode, column: column, postings: count });
  }
}
colEntries.sort((a, b) => b.postings - a.postings || (a.book < b.book ? -1 : a.book > b.book ? 1 : 0));
for (const e of colEntries) {
  const share = (e.postings / wordsIndexed) * 100;
  const shareTxt = share < 0.05 ? "<0.1%" : share.toFixed(1) + "%";
  md +=
    "| " + (e.id === undefined ? "-" : e.id + 1) + " | " + e.book + " | " + e.column +
    " | " + fmt(e.postings) + " | " + shareTxt + " |\n";
}
const REPORT = path.join(DIR, "search-index-report.md");
fs.writeFileSync(REPORT, md + "\n", "utf8");
console.log("report written:", REPORT);
