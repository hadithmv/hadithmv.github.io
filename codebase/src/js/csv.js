/**
 * Tiny CSV parser for Hadithmv's format.
 * Handles quoted fields, commas inside quotes, and multiline values.
 * ~1 KB vs PapaParse's 22 KB.
 *
 * Usage:
 *   import { parseCSV } from "./csv.js";
 *   var rows = parseCSV(csvText);           // drops fully-empty rows
 *   var rows = parseCSV(csvText, true);     // keeps them (QRN skeleton books)
 */
export function parseCSV(text, keepEmpty) {
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
        // Only keep non-empty rows — unless keepEmpty (QRN books: an empty
        // row is an untranslated ayah slot, not formatting)
        if (keepEmpty || row.some(function (c) { return c !== ""; })) {
          rows.push(row);
        }
        row = [];
        field = "";
      } else if (ch === '\r') {
        // standalone \r
        row.push(field.trim());
        if (keepEmpty || row.some(function (c) { return c !== ""; })) {
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
  if (keepEmpty || row.some(function (c) { return c !== ""; })) {
    rows.push(row);
  }

  return rows;
}

/**
 * Fetch a CSV file and parse it. Empty rows are dropped unless keepEmpty is
 * set — QRN books are 6,236-slot skeletons whose empty rows are untranslated
 * ayahs and must survive the parse.
 */
export async function fetchCSVRows(path, keepEmpty) {
  var resp = await fetch(path);
  if (!resp.ok) throw new Error("Failed to load " + path + " (" + resp.status + ")");
  var text = await resp.text();
  // parseCSV already handles empty rows — no second filter pass or throwaway
  // array. The `text` string is a local, so it is garbage-collected as soon
  // as this returns (the decoded row arrays are the only thing retained).
  return parseCSV(text, keepEmpty);
}

// ── Streaming CSV parse (big books) ─────────────────────────
// The reader streams large books so the first rows render before the whole
// file has downloaded (reader.js). Same row semantics as parseCSV — identical
// trims, keepEmpty rule and `""` escaping — but consumes chunked input: a
// row is emitted as soon as the characters that form it have arrived.
//
// Two chunk-boundary hazards, both handled here:
//   - multi-byte Thaana/Arabic split across chunks → the caller feeds the
//     decoder with TextDecoder({stream:true}), which buffers partial
//     sequences; the parser itself only ever sees whole characters.
//   - a `\r` that might be the first half of `\r\n` across a chunk boundary
//     → a trailing `\r` outside quotes is held back until the next chunk.
//   - multiline quoted fields (verified in the data — up to 392 lines) →
//     the CSV inQuote flag carries across chunks; a record is only emitted
//     when it has fully arrived.
// The tail logic replicates parseCSV exactly, including its trailing-empty-
// row behaviour with keepEmpty — the two parses are byte-for-byte identical
// (guarded by tools/hmv-stream-check.mjs over every data/content CSV).

export function createStreamParser(keepEmpty, onRow) {
  var rows = []; // complete rows — also the final resolve value (header first)
  var row = [];
  var field = "";
  var inQuote = false;
  var buf = ""; // unprocessed tail (nothing after the last emitted row)

  function emit() {
    if (keepEmpty || row.some(function (c) { return c !== ""; })) {
      rows.push(row);
      if (onRow) onRow(row);
    }
    row = [];
    field = "";
  }

  function scan() {
    var i = 0;
    while (i < buf.length) {
      var ch = buf[i];
      var next = i + 1 < buf.length ? buf[i + 1] : null;
      if (inQuote) {
        if (ch === '"' && next === '"') {
          field += '"'; // escaped quote
          i++;
        } else if (ch === '"') {
          if (i === buf.length - 1) break; // hold — may be the first half of "" across chunks
          inQuote = false;
        } else {
          field += ch;
        }
      } else if (ch === '"') {
        inQuote = true;
      } else if (ch === ",") {
        row.push(field.trim());
        field = "";
      } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
        if (ch === "\r") i++; // skip \r in \r\n
        row.push(field.trim());
        emit();
      } else if (ch === "\r") {
        if (i === buf.length - 1) break; // hold — may be \r\n across chunks
        row.push(field.trim());
        emit();
      } else {
        field += ch;
      }
      i++;
    }
    buf = buf.slice(i); // drop the processed prefix; a held \r stays
  }

  return {
    push: function (chunk) {
      buf += chunk;
      scan();
    },
    finish: function () {
      // Replicate parseCSV's tail: a held \r is a row end, then the final
      // field/row is pushed (an empty trailing row when the file ends with
      // a newline — kept only under keepEmpty, exactly like parseCSV).
      if (buf === "\r") {
        row.push(field.trim());
        emit();
        buf = "";
      }
      row.push(field.trim());
      emit();
      return rows;
    },
  };
}

// Responses below this many compressed bytes keep the whole-file path
// (fetch + text + parseCSV) — streaming's early-row win only matters once
// the download is large enough to notice; repeat visits come from IndexedDB
// anyway. 256 KB gz ≈ 0.7–2 MB of Thaana/Arabic text.
var STREAM_MIN_BYTES = 256 * 1024;

// Thrown (and rethrown) when opts.signal aborts a fetchCSVStreamed call.
// Named AbortError to match the DOMException fetch itself raises on abort —
// callers can treat both the same way.
function abortError() {
  var e = new Error("Aborted");
  e.name = "AbortError";
  return e;
}

/**
 * Streaming fetch + parse for large CSVs. Same final result as
 * fetchCSVRows — the full 2D array, header row first — but for large
 * responses it consumes the body in chunks: opts.onFirstRow fires when the
 * header has parsed, opts.onRows gets batches of data rows as they land,
 * opts.onProgress gets 0..1 from Content-Length vs bytes read (clamped —
 * the browser reports decompressed bytes against the compressed total).
 * opts.signal aborts the download: an already-aborted signal rejects
 * immediately, a mid-stream abort drops the result (the pending read also
 * rejects natively), and an abort that lands after the body was fully read
 * still discards it. One caveat: a cancel arriving inside the final
 * synchronous parser.finish() cannot interrupt the parse (no workers) —
 * callers that commit shared state should re-check signal.aborted after the
 * promise settles, and skip the commit.
 * Small responses, missing Content-Length, or no ReadableStream/TextDecoder
 * support fall back to the exact whole-file behaviour, callbacks never fire.
 */
export async function fetchCSVStreamed(path, keepEmpty, opts) {
  var signal = opts && opts.signal;
  var resp = await fetch(path, signal ? { signal: signal } : undefined);
  if (!resp.ok) throw new Error("Failed to load " + path + " (" + resp.status + ")");
  var total = parseInt(resp.headers.get("content-length") || "0", 10) || 0;
  if (total < STREAM_MIN_BYTES || !resp.body || !resp.body.getReader || !("TextDecoder" in window)) {
    var text = await resp.text();
    if (signal && signal.aborted) throw abortError();
    return parseCSV(text, keepEmpty);
  }
  var first = true;
  var batch = [];
  var parser = createStreamParser(keepEmpty, function (row) {
    if (first) {
      first = false;
      if (opts && opts.onFirstRow) opts.onFirstRow(row);
      return;
    }
    batch.push(row);
    if (batch.length >= 128) {
      if (opts && opts.onRows) opts.onRows(batch);
      batch = [];
    }
  });
  var reader = resp.body.getReader();
  var decoder = new TextDecoder("utf-8");
  var got = 0;
  while (true) {
    if (signal && signal.aborted) {
      try { reader.cancel(); } catch (e) {}
      throw abortError();
    }
    var r = await reader.read();
    if (r.done) break;
    got += r.value.byteLength;
    if (opts && opts.onProgress && total) {
      opts.onProgress(Math.min(1, got / total));
    }
    parser.push(decoder.decode(r.value, { stream: true }));
    // Yield one macrotask per chunk: buffered reads resolve as microtasks, so
    // a fast network can feed the whole file in a burst (the service worker's
    // fetch context even bypasses DevTools' network throttling) — a
    // microtask-bound loop would starve timers AND paints, and the reader's
    // rows would never show until the drain ends. One 0 ms timeout per chunk
    // is negligible; it lets the reader paint between batches.
    await new Promise(function (res) { setTimeout(res, 0); });
  }
  // A cancel can land after the body was fully read (during the final parse,
  // which can't be interrupted) — the fetch itself may even have resolved.
  // Drop the result here; the caller's post-settle signal check closes the
  // same hole on the committing side.
  if (signal && signal.aborted) throw abortError();
  parser.push(decoder.decode()); // flush decoder tail
  // finish() can still emit rows the chunks never closed: a trailing lone \r
  // held for the \r\n check, or a final row with no trailing newline. They
  // must reach onRows — finish BEFORE the final batch flush, or the last row
  // is orphaned in `batch` (the reader would render one row short; the
  // returned array stays complete either way).
  var full = parser.finish();
  if (batch.length > 0) {
    if (opts && opts.onRows) opts.onRows(batch);
  }
  return full;
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

function idbPut(bookCode, version, rows, keepEmpty) {
  return openCacheDB().then(function (db) {
    if (!db) return;
    return new Promise(function (resolve) {
      var tx = db.transaction("books", "readwrite").objectStore("books").put({
        bookCode: bookCode,
        version: version,
        rows: rows,
        keepEmpty: keepEmpty,
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
 * `keepEmpty` is part of the cache contract: a stored record parsed with a
 * different mode is a cache miss — the file hash alone can't tell those two
 * parses apart. Both sides normalize with `|| false` so an absent field
 * (old records, or records stored by flag-less callers) means drop mode and
 * matches other drop-mode requests; `true` never matches drop mode.
 * `streamOpts` ({ onFirstRow, onRows, onProgress }) opts into the streaming
 * path for large responses (fetchCSVStreamed); omit it for the exact
 * whole-file behaviour. A cache hit never streams — repeat visits are
 * instant. The stored record is the same in both paths (full array, header
 * first — the put happens after the stream completes).
 */
export async function fetchBookCSVCached(bookCode, version, path, keepEmpty, streamOpts) {
  if (version) {
    var cached = await idbGet(bookCode);
    if (cached && cached.version === version && (cached.keepEmpty || false) === (keepEmpty || false)) {
      return cached.rows;
    }
  }
  var rows = streamOpts
    ? await fetchCSVStreamed(path, keepEmpty, streamOpts)
    : await fetchCSVRows(path, keepEmpty);
  if (version) {
    // Fire-and-forget: don't delay first render on the write
    idbPut(bookCode, version, rows, keepEmpty).catch(function () {});
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
