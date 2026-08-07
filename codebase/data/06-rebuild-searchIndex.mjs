/**
 * Builds data/search-index.json — word-level postings across every book.
 *
 * Run:  node data/06-rebuild-searchIndex.mjs
 *
 * For each registered book: parse the CSV, normalise every cell with the
 * same normalisation the app's search uses (search-utils.js), tokenise into words,
 * and record (bookCode, row) for each word. -HDN columns and the row-number
 * column are excluded; an optional `indexColumns` column in the registry
 * narrows a book to exactly the listed columns. A per-book report of indexed
 * and skipped columns is printed while building and written to
 * data/search-index-report.md (policy table, warnings, postings by column).
 * The result feeds the cross-book search (js/library-search-engine.js).
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { parseCSV } from "../js/csv.js";
import { normaliseForSearch } from "../js/search-utils.js";
// Same tokeniser the query side uses (js/library-search-engine.js) — build and
// query MUST agree on what a word is, or lookups would silently miss.
import { tokenizeText } from "../js/library-search-engine.js";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY = path.join(DIR, "02-registry-bookNames.csv");
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
// Optional registry column: comma-separated header names to index. When set
// for a book, ONLY those columns are indexed (the row-number and -HDN columns
// are still always skipped). Absent/empty = all columns indexed.
const indexColIdx = header.indexOf("indexColumns");

let booksWithOverride = 0;

for (const entry of registryRows.slice(1)) {
  const bookCode = entry[bookIdx];
  if (!bookCode) continue;
  const csvPath = path.join(DIR, "content", bookCode + ".csv");
  if (!fs.existsSync(csvPath)) {
    console.warn("skip (no file):", bookCode);
    reportWarnings.push("skip (no file): " + bookCode);
    continue;
  }
  const rows = parseCSV(fs.readFileSync(csvPath, "utf8"));
  if (rows.length === 0) continue;
  const csvHeader = rows[0];
  const dataRows = rows.slice(1);
  const firstCol = (csvHeader[0] || "").trim();
  const hasRowNums = firstCol === "#" || firstCol === "";

  // Effective column set for this book, computed once from the header
  const allowedRaw = indexColIdx !== -1 ? (entry[indexColIdx] || "").trim() : "";
  const allowedList = allowedRaw
    ? allowedRaw.toLowerCase().split(",").map((s) => s.trim()).filter(Boolean)
    : null;
  if (allowedList) {
    booksWithOverride++;
    for (const name of allowedList) {
      if (!csvHeader.some((h) => (h || "").trim().toLowerCase() === name)) {
        const msg = "indexColumns lists '" + name + "' but " + bookCode + " has no such column";
        console.warn("warn: " + msg);
        reportWarnings.push(msg);
      }
    }
  }
  const colIdx = []; // column indices actually indexed
  const skipped = []; // display names of skipped columns
  for (let c = 0; c < csvHeader.length; c++) {
    const hdr = (csvHeader[c] || "").trim().toLowerCase();
    if (hasRowNums && c === 0) {
      skipped.push((csvHeader[c] || "#") + " (row numbers)");
      continue;
    }
    if (hdr.endsWith("-hdn")) {
      // hidden columns are never searchable — the reader can't show the text
      skipped.push(csvHeader[c] || "#" + c);
      continue;
    }
    if (allowedList && allowedList.indexOf(hdr) === -1) {
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
    skipped: skippedNames,
  });
}

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

const out = JSON.stringify({
  meta: {
    version: version,
    built: new Date().toISOString(),
    bookIds: bookIds, // postings use numeric ids; resolve back through this
    books: booksScanned,
    rows: rowsScanned,
    words: Object.keys(words).length,
  },
  words: words,
});

fs.writeFileSync(OUT, out, "utf8");
console.log("\nindex written:", OUT);
console.log("books:", booksScanned, "| rows:", rowsScanned, "| postings:", wordsIndexed, "| unique words:", Object.keys(words).length, "| indexColumns overrides:", booksWithOverride);
console.log("raw size:", (fs.statSync(OUT).size / 1024 / 1024).toFixed(1) + " MB");
console.log("gzip size:", (zlib.gzipSync(out).length / 1024 / 1024).toFixed(1) + " MB");

// ── Report file — the same policy as a diffable markdown table ──
const fmt = (n) => n.toLocaleString("en-US"); // thousands separators for humans
let md = "# Search index report\n\n";
md += "Regenerated by `node data/06-rebuild-searchIndex.mjs` — machine output, do not hand-edit.\n\n";
md += "Built " + new Date().toISOString() + " · version `" + version + "`\n\n";
md +=
  fmt(booksScanned) + " books · " + fmt(rowsScanned) + " rows · " + fmt(wordsIndexed) + " postings · " +
  fmt(Object.keys(words).length) + " unique words · " +
  (fs.statSync(OUT).size / 1024 / 1024).toFixed(1) + " MiB raw · " +
  (zlib.gzipSync(out).length / 1024 / 1024).toFixed(1) + " MiB gzip · " +
  booksWithOverride + " indexColumns overrides\n\n";
if (reportWarnings.length > 0) {
  md += "## Warnings\n\n";
  for (const w of reportWarnings) md += "- " + w + "\n";
  md += "\n";
}
md += "## Books\n\n";
md += "| Id | Book | Rows | Postings | Indexed | Skipped |\n|---|---|---|---|---|---|\n";
for (const e of reportEntries) {
  const id = e.id === undefined ? "-" : e.id + 1;
  md +=
    "| " + id + " | " + e.code + " | " + fmt(e.rows) + " | " + fmt(e.postings) +
    " | " + e.indexed + " | " + (e.skipped || "—") + " |\n";
}
md += "\n## Postings by column — largest first\n\n";
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
md += "\n## Notes\n\n";
md += "- `-HDN` books and columns are hidden from the dashboard and search scope.\n";
md += "- `# (row numbers)` is the CSV's position column — never indexed.\n";
md += "- An `indexColumns` registry entry narrows a book to exactly the listed columns.\n";
md += "- Ids are 1-based positions in `meta.bookIds` (what postings in search-index.json reference).\n";
const REPORT = path.join(DIR, "search-index-report.md");
fs.writeFileSync(REPORT, md, "utf8");
console.log("report written:", REPORT);
