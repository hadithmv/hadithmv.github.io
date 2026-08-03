/**
 * Builds data/04-search-index.json — word-level postings across every book.
 *
 * Run:  node data/04-rebuild-index.mjs
 *
 * For each registered book: parse the CSV, normalise every cell with the
 * same normalisation the app's search uses (search.js), tokenise into words,
 * and record (bookCode, row) for each word. -HDN columns and the row-number
 * column are excluded. The result feeds the planned cross-book search.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { parseCSV } from "../js/csv.js";
import { normaliseForSearch } from "../js/search.js";
// Same tokeniser the query side uses (js/library-search.js) — build and
// query MUST agree on what a word is, or lookups would silently miss.
import { tokenizeText } from "../js/library-search.js";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY = path.join(DIR, "02-registry-bookNames.csv");
const OUT = path.join(DIR, "04-search-index.json");

// word → { bookId: Set<row> }   (bookId is a numeric index into bookIds[])
const index = {};
const bookIds = []; // bookCode per numeric id — postings stay compact
const bookIdOf = {}; // bookCode → id
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

for (const entry of registryRows.slice(1)) {
  const bookCode = entry[bookIdx];
  if (!bookCode) continue;
  const csvPath = path.join(DIR, bookCode + ".csv");
  if (!fs.existsSync(csvPath)) {
    console.warn("skip (no file):", bookCode);
    continue;
  }
  const rows = parseCSV(fs.readFileSync(csvPath, "utf8"));
  if (rows.length === 0) continue;
  const csvHeader = rows[0];
  const dataRows = rows.slice(1);
  const firstCol = (csvHeader[0] || "").trim();
  const hasRowNums = firstCol === "#" || firstCol === "";

  for (let r = 0; r < dataRows.length; r++) {
    const row = dataRows[r];
    // 1-based DATA POSITION, not the CSV's # column — the reader's ?row=
    // param means "1-based position in the data rows" (goTo(row-1)), and #
    // columns are not always sequential (5 books have gaps), so the CSV's #
    // value would deep-link to the wrong row. Display labels use the #
    // column; links use positions.
    const rowNum = r + 1;
    for (let c = 0; c < row.length; c++) {
      if (hasRowNums && c === 0) continue; // row-number column
      const hdr = (csvHeader[c] || "").trim().toLowerCase();
      if (hdr.endsWith("-hdn")) continue; // hidden columns are not searchable
      const cell = row[c];
      if (cell === null || cell === undefined) continue;
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
    }
    rowsScanned++;
  }
  booksScanned++;
  if (booksScanned % 10 === 0) console.log("scanned", booksScanned, "books…");
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
console.log("books:", booksScanned, "| rows:", rowsScanned, "| postings:", wordsIndexed, "| unique words:", Object.keys(words).length);
console.log("raw size:", (fs.statSync(OUT).size / 1024 / 1024).toFixed(1) + " MB");
console.log("gzip size:", (zlib.gzipSync(out).length / 1024 / 1024).toFixed(1) + " MB");
