/**
 * Library Search Module
 * Cross-book search over the machine-generated word-level index
 * (data/search-index.json, built by data/06-rebuild-index.mjs).
 *
 * The index maps normalised words → { bookId → packed row ranges }. This
 * module loads it (IndexedDB-cached, validated against meta.version via a
 * conditional fetch) and answers "which books contain ALL of these words?"
 * — AND across query words, intersected with a caller-supplied book scope
 * (the search page's tag chips). Results carry the first matching row so the
 * page can deep-link to reader.html?book=X&row=N.
 *
 * Pure module — no DOM. Exports: loadSearchIndex, searchLibrary, tokenizeText
 */

import { normaliseForSearch } from "./search-utils.js";

var INDEX_PATH = "../data/search-index.json";

// ── Tokenisation (SHARED with the index build script) ────────
// data/06-rebuild-index.mjs imports this function — the query side and the
// build side must always tokenise identically or lookups would miss.

/**
 * Split normalised text into words. \p{M} keeps Thaana fili and other
 * combining marks as part of the word — they are marks, not separators
 * (Arabic tashkeel is gone by this point, stripped by normaliseForSearch;
 * Thaana fili is not). Pure-number tokens are search noise — dropped.
 */
export function tokenizeText(normText) {
  return normText
    .split(/[^\p{L}\p{M}\p{N}]+/u)
    .filter(function (w) {
      return w && !/^\p{N}+$/u.test(w);
    });
}

// ── On-device index cache (IndexedDB) ────────────────────────
// Same pattern as the book cache in csv.js, but a separate DB so the two
// modules never contend on a version bump. The entry is keyed by a fixed
// id ("index") and validated against the index's own meta.version hash.

var IDB_NAME = "hadithmvSearch";
var IDB_VERSION = 1;
var _dbPromise = null;

function openSearchDB() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise(function (resolve) {
    if (!("indexedDB" in window)) return resolve(null);
    var req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = function () {
      if (!req.result.objectStoreNames.contains("index")) {
        req.result.createObjectStore("index", { keyPath: "id" });
      }
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { resolve(null); };
  });
  return _dbPromise;
}

function idbGetIndex() {
  return openSearchDB().then(function (db) {
    if (!db) return null;
    return new Promise(function (resolve) {
      var tx = db.transaction("index", "readonly").objectStore("index").get("index");
      tx.onsuccess = function () { resolve(tx.result || null); };
      tx.onerror = function () { resolve(null); };
    });
  });
}

function idbPutIndex(version, words) {
  return openSearchDB().then(function (db) {
    if (!db) return;
    return new Promise(function (resolve) {
      var tx = db.transaction("index", "readwrite").objectStore("index").put({
        id: "index",
        version: version,
        words: words,
      });
      tx.onsuccess = function () { resolve(); };
      tx.onerror = function () { resolve(); };
    });
  });
}

// ── Index loading ────────────────────────────────────────────

var _indexPromise = null;

/**
 * Load the search index (parse it) and return { meta, words }.
 * Cached: on-device copy (IndexedDB) + browser HTTP cache.
 *   - A conditional fetch (cache: "no-cache") revalidates against the
 *     server: unchanged → a cheap 304, no 40MB re-download.
 *   - Only the meta head is parsed from the fetched text to read the
 *     version; the full 40MB JSON.parse + store happen only when the
 *     version actually changed (or the first time).
 * Failed loads are retryable — the promise is cleared so a later call
 * tries again.
 */
export function loadSearchIndex() {
  if (_indexPromise) return _indexPromise;
  _indexPromise = loadIndexInner().catch(function (err) {
    _indexPromise = null;
    throw err;
  });
  return _indexPromise;
}

// meta has no nested braces (bookIds is an array), so this captures it whole
var META_RE = /"meta":\s*(\{[^{}]*\})/;

function parseMetaHead(text) {
  var m = text.match(META_RE);
  if (!m) throw new Error("Search index is corrupt (missing meta object)");
  return JSON.parse(m[1]);
}

async function loadIndexInner() {
  var cached = null;
  try {
    cached = await idbGetIndex();
  } catch (e) {
    cached = null;
  }

  var resp = await fetch(INDEX_PATH, { cache: "no-cache" });
  if (!resp.ok) {
    throw new Error("Failed to load the search index (" + resp.status + ")");
  }
  var text = await resp.text();
  var meta = parseMetaHead(text);

  if (cached && cached.version === meta.version) {
    return { meta: meta, words: cached.words };
  }

  var words = JSON.parse(text).words;
  // Fire-and-forget: don't delay the first search on the write
  idbPutIndex(meta.version, words).catch(function () {});
  return { meta: meta, words: words };
}

// ── Query engine (pure) ──────────────────────────────────────

/**
 * Expand a packed row-range string ("1-5,8,12") into a sorted array of
 * row numbers.
 */
function rangesToArray(packed) {
  var out = [];
  var parts = packed.split(",");
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];
    var dash = p.indexOf("-");
    var a = dash === -1 ? +p : +p.slice(0, dash);
    var b = dash === -1 ? a : +p.slice(dash + 1);
    for (var n = a; n <= b; n++) out.push(n);
  }
  return out;
}

/** Sorted-array intersection — both inputs ascending. */
function intersectSorted(a, b) {
  var out = [];
  var i = 0;
  var j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { out.push(a[i]); i++; j++; }
    else if (a[i] < b[j]) i++;
    else j++;
  }
  return out;
}

/**
 * Search the library index for a query.
 *
 * @param {Object} index - parsed index ({meta, words}) from loadSearchIndex()
 * @param {string} query - raw query text; tokenised with tokenizeText()
 * @param {string[]} [scopeBookCodes] - book codes to limit the search to
 *   (e.g. tag-scoped, -HDN excluded). Omit / empty = every book in the index.
 * @returns {Array<{bookCode, count, firstRow}>} books with at least one
 *   matching row, sorted by match count descending. Empty when the query has
 *   no searchable terms or nothing matched.
 */
export function searchLibrary(index, query, scopeBookCodes) {
  if (!index || !index.words) return [];
  var terms = tokenizeText(normaliseForSearch(query || ""));
  if (terms.length === 0) return [];

  var W = index.words;
  var postings = [];
  for (var i = 0; i < terms.length; i++) {
    var posting = W[terms[i]];
    if (!posting) return []; // a term exists nowhere → no row can contain all terms
    postings.push(posting);
  }

  // Resolve scope (book codes → numeric ids). "3" is a string key.
  var bookIds = index.meta.bookIds;
  var allowed = null; // null = all
  if (scopeBookCodes && scopeBookCodes.length > 0) {
    allowed = {};
    for (var s = 0; s < scopeBookCodes.length; s++) {
      var id = bookIds.indexOf(scopeBookCodes[s]);
      if (id !== -1) allowed[id] = true;
    }
  }

  // Iterate the term whose posting reaches the fewest books (after scope)
  var pivot = null;
  for (var t = 0; t < postings.length; t++) {
    var pBooks = Object.keys(postings[t]);
    var pCount = 0;
    for (var k = 0; k < pBooks.length; k++) {
      if (!allowed || allowed[pBooks[k]]) pCount++;
    }
    if (pivot === null || pCount < pivot.count) {
      pivot = { index: t, count: pCount };
    }
    if (pCount === 0) return [];
  }

  var results = [];
  var pivotPosting = postings[pivot.index];
  var pivotBooks = Object.keys(pivotPosting);
  for (var b = 0; b < pivotBooks.length; b++) {
    var bookKey = pivotBooks[b];
    if (allowed && !allowed[bookKey]) continue;
    var rows = rangesToArray(pivotPosting[bookKey]);
    for (var w = 0; w < postings.length; w++) {
      if (w === pivot.index) continue;
      var other = postings[w][bookKey];
      if (!other) { rows = []; break; } // word absent in this book
      rows = intersectSorted(rows, rangesToArray(other));
      if (rows.length === 0) break;
    }
    if (rows.length === 0) continue;
    results.push({
      bookCode: bookIds[+bookKey],
      count: rows.length,
      firstRow: rows[0],
    });
  }

  results.sort(function (a, b) { return b.count - a.count; });
  return results;
}
