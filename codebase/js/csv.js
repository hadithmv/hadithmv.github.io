/**
 * Tiny CSV parser for Hadithmv's format.
 * Handles quoted fields, commas inside quotes, and multiline values.
 * ~1 KB vs PapaParse's 22 KB.
 *
 * Usage:
 *   import { parseCSV } from "./csv.js";
 *   var rows = parseCSV(csvText);
 */
export function parseCSV(text) {
  var rows = [];
  var row = [];
  var field = "";
  var inQuote = false;

  for (var i = 0; i < text.length; i++) {
    var ch = text[i];
    var next = i + 1 < text.length ? text[i + 1] : null;

    if (inQuote) {
      if (ch === '"' && next === '"') {
        // escaped quote
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuote = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuote = true;
      } else if (ch === ',') {
        row.push(field.trim());
        field = "";
      } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        if (ch === '\r') i++; // skip \r in \r\n
        row.push(field.trim());
        // Only keep non-empty rows
        if (row.some(function (c) { return c !== ""; })) {
          rows.push(row);
        }
        row = [];
        field = "";
      } else if (ch === '\r') {
        // standalone \r
        row.push(field.trim());
        if (row.some(function (c) { return c !== ""; })) {
          rows.push(row);
        }
        row = [];
        field = "";
      } else {
        field += ch;
      }
    }
  }

  // Last field/row
  row.push(field.trim());
  if (row.some(function (c) { return c !== ""; })) {
    rows.push(row);
  }

  return rows;
}

/**
 * Fetch a CSV file, parse it, and filter out empty rows.
 */
export async function fetchCSVRows(path) {
  var resp = await fetch(path);
  if (!resp.ok) throw new Error("Failed to load " + path + " (" + resp.status + ")");
  var text = await resp.text();
  // parseCSV already skips empty rows — no second filter pass or throwaway
  // array. The `text` string is a local, so it is garbage-collected as soon
  // as this returns (the decoded row arrays are the only thing retained).
  return parseCSV(text);
}

/**
 * Parse CSV text into an array of objects using the first row as headers.
 */
export function parseCSVWithHeader(text) {
  var rows = parseCSV(text);
  if (rows.length === 0) return [];
  var headers = rows[0].map(function (h) { return h.trim(); });
  return rows.slice(1).map(function (row) {
    var obj = {};
    headers.forEach(function (h, i) { obj[h] = (row[i] || "").trim(); });
    return obj;
  });
}

/**
 * Fetch a CSV file and parse it into objects using the first row as headers.
 */
export async function fetchCSVObjects(path) {
  var resp = await fetch(path);
  if (!resp.ok) throw new Error("Failed to load " + path + " (" + resp.status + ")");
  var text = await resp.text();
  return parseCSVWithHeader(text);
}

// ── On-device book cache (IndexedDB) ─────────────────────────
// Parsed book CSVs are stored on the device so repeat visits skip the
// download + parse entirely. The registry's `version` column (content hash
// of each book CSV) guards staleness: if the file changed, the hash differs
// and the cache is refreshed. Every failure path degrades to a plain fetch.

var IDB_NAME = "hadithmv";
var BOOKS_STORE = "books";
var _idbPromise = null;

function openCacheDB() {
  if (_idbPromise) return _idbPromise;
  _idbPromise = new Promise(function (resolve) {
    if (!("indexedDB" in window)) return resolve(null);
    var req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = function () {
      req.result.createObjectStore(BOOKS_STORE, { keyPath: "bookCode" });
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { resolve(null); };
  });
  return _idbPromise;
}

function idbGet(bookCode) {
  return openCacheDB().then(function (db) {
    if (!db) return null;
    return new Promise(function (resolve) {
      var tx = db.transaction(BOOKS_STORE, "readonly").objectStore(BOOKS_STORE).get(bookCode);
      tx.onsuccess = function () { resolve(tx.result || null); };
      tx.onerror = function () { resolve(null); };
    });
  });
}

function idbPut(bookCode, version, rows) {
  return openCacheDB().then(function (db) {
    if (!db) return;
    return new Promise(function (resolve) {
      var tx = db.transaction("books", "readwrite").objectStore("books").put({
        bookCode: bookCode,
        version: version,
        rows: rows,
      });
      tx.onsuccess = function () { resolve(); };
      tx.onerror = function () { resolve(); };
    });
  });
}

/**
 * Fetch a book CSV through the on-device cache.
 * `version` is the registry's content-hash column; empty string bypasses the
 * cache (no trust). Returns the parsed 2D array — same shape as fetchCSVRows.
 * IndexedDB returns a fresh structured-clone per read, so callers may mutate
 * the result (e.g. shift() the header) without corrupting the stored copy.
 */
export async function fetchBookCSVCached(bookCode, version, path) {
  if (version) {
    var cached = await idbGet(bookCode);
    if (cached && cached.version === version) {
      return cached.rows;
    }
  }
  var rows = await fetchCSVRows(path);
  if (version) {
    // Fire-and-forget: don't delay first render on the write
    idbPut(bookCode, version, rows).catch(function () {});
  }
  return rows;
}

/**
 * Convert a 2D array back to CSV text.
 */
export function unparseCSV(rows) {
  return rows.map(function (row) {
    return row.map(function (cell) {
      var s = cell == null ? "" : String(cell);
      // Quote if contains comma, quote, or newline
      if (s.indexOf(",") !== -1 || s.indexOf('"') !== -1 || s.indexOf("\n") !== -1) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    }).join(",");
  }).join("\r\n");
}
