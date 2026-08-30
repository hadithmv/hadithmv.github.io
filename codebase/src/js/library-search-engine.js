/**
 * Library Search Module
 * Cross-book search over the machine-generated word-level index — a small
 * manifest (data/search-index.json) plus one shard per indexed book
 * (data/search-index/<bookCode>.json, built by data/08-rebuild-searchIndex.mjs).
 *
 * The manifest is meta only (~2 KB); the postings live in the shards, one
 * flat { word → packed row ranges } file per book. This module loads the
 * manifest first — the scope picker reads it alone — then only the shards
 * for the books a search actually covers, merging them into the same
 * { word → { bookId → packed } } shape the query engine consumes, and
 * answers "which books contain ALL of these words?" — AND across query
 * words, intersected with a caller-supplied book scope (the search page's
 * tag chips). Results carry the first matching row so the page can
 * deep-link to reader.html?book=X&row=N.
 *
 * Pure module — no DOM. Exports: loadSearchIndex, loadScopedIndex,
 * loadIndexMeta, searchLibrary, tokenizeText
 */

import { normaliseForSearch } from "./search-utils.js";

var INDEX_PATH = "../../data/search-index.json"; // the manifest — meta only
var SHARD_DIR = "../../data/search-index/"; // one flat {word: packed} file per book

// ── Tokenisation (SHARED with the index build script) ────────
// data/08-rebuild-searchIndex.mjs imports this function — the query side and the
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
var IDB_STORE = "index"; // store name
var IDB_KEY_PATH = "id"; // record keyPath
var IDB_ENTRY_ID = "index"; // fixed record id
var _dbPromise = null;

function openSearchDB() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise(function (resolve) {
    if (!("indexedDB" in window)) return resolve(null);
    var req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = function () {
      if (!req.result.objectStoreNames.contains(IDB_STORE)) {
        req.result.createObjectStore(IDB_STORE, { keyPath: IDB_KEY_PATH });
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
      var tx = db.transaction(IDB_STORE, "readonly").objectStore(IDB_STORE).get(IDB_ENTRY_ID);
      tx.onsuccess = function () { resolve(tx.result || null); };
      tx.onerror = function () { resolve(null); };
    });
  });
}

function idbPutIndex(meta) {
  return openSearchDB().then(function (db) {
    if (!db) return;
    return new Promise(function (resolve) {
      // Same id as the old whole-index record — put() replaces it wholesale,
      // so the pre-shard record's `words` (~16 MB) is discarded automatically.
      var tx = db.transaction(IDB_STORE, "readwrite").objectStore(IDB_STORE).put({
        id: IDB_ENTRY_ID,
        version: meta.version,
        meta: meta, // kept whole — the offline fallback needs bookIds/shards
      });
      tx.onsuccess = function () { resolve(); };
      tx.onerror = function () { resolve(); };
    });
  });
}

function idbGetShard(code) {
  return openSearchDB().then(function (db) {
    if (!db) return null;
    return new Promise(function (resolve) {
      var tx = db
        .transaction(IDB_STORE, "readonly")
        .objectStore(IDB_STORE)
        .get("shard:" + code);
      tx.onsuccess = function () { resolve(tx.result || null); };
      tx.onerror = function () { resolve(null); };
    });
  });
}

function idbPutShard(code, version, words) {
  return openSearchDB().then(function (db) {
    if (!db) return;
    return new Promise(function (resolve) {
      var tx = db.transaction(IDB_STORE, "readwrite").objectStore(IDB_STORE).put({
        id: "shard:" + code,
        version: version, // the manifest's per-book shard hash
        words: words,
      });
      tx.onsuccess = function () { resolve(); };
      tx.onerror = function () { resolve(); };
    });
  });
}

// ── Index loading ────────────────────────────────────────────
// Two stages, both scope-aware:
//   1. loadIndexMeta()   — the manifest (meta only, ~2 KB). Memoized; it is
//      the scope picker's whole dependency.
//   2. loadScopedIndex() — the manifest + the shards for the books in
//      scope, merged into one { word → { bookId: packed } } dict — the exact
//      shape the pre-shard single file had, so the query engine is untouched.
// Each stage is individually memoized and cleared on failure, so every retry
// path (the page's Retry buttons, the search window's ↺) stays honest.

var _metaPromise = null;

/**
 * Load the manifest and return its meta ({version, built, bookIds, books,
 * excluded, rows, words, shards}). Cached: on-device copy (IndexedDB) +
 * browser HTTP cache.
 *   - A conditional fetch (cache: "no-cache") revalidates against the
 *     server: unchanged → a cheap 304 and the cached meta is reused.
 *   - The manifest is ~2 KB — full JSON.parse, no head-parsing tricks.
 *   - Offline (fetch threw): the on-device meta is served as-is — it was
 *     validated against meta.version when stored. A pre-shard record (meta
 *     without `shards`) can't resolve shard versions, so it's stale and the
 *     original throw stands.
 * Failed loads are retryable — the promise is cleared so a later call
 * tries again.
 */
export function loadIndexMeta() {
  if (_metaPromise) return _metaPromise;
  _metaPromise = loadIndexMetaInner().catch(function (err) {
    _metaPromise = null;
    throw err;
  });
  return _metaPromise;
}

async function loadIndexMetaInner() {
  var cached = null;
  try {
    cached = await idbGetIndex();
  } catch (e) {
    cached = null;
  }

  var resp;
  try {
    resp = await fetch(INDEX_PATH, { cache: "no-cache" });
  } catch (e) {
    if (cached && cached.meta && cached.meta.shards) {
      return cached.meta;
    }
    throw e;
  }
  if (!resp.ok) {
    throw new Error("Failed to load the search index (" + resp.status + ")");
  }
  var meta = JSON.parse(await resp.text()).meta;
  if (!meta || !meta.shards) {
    throw new Error("Search index is corrupt (missing meta object)");
  }

  if (!(cached && cached.version === meta.version)) {
    // Fire-and-forget: don't delay the first search on the write
    idbPutIndex(meta).catch(function () {});
  }
  return meta;
}

// Per-book shard state, keyed by bookCode. _master is the merged dict — the
// same shape the monolithic index had — grown monotonically as scopes widen;
// a full session's footprint equals the old single-file parse, scoped
// sessions are strictly smaller.
var _shardPromises = {}; // "code:version" → Promise<words> (cleared on failure)
var _loadedShards = {}; // code → { version, words }
var _mergedVersions = {}; // code → version currently folded into _master
var _master = {};

function ensureShard(code, version) {
  var key = code + ":" + version;
  var p = _shardPromises[key];
  if (p) return p;
  p = ensureShardInner(code, version).catch(function (err) {
    delete _shardPromises[key];
    throw err;
  });
  _shardPromises[key] = p;
  return p;
}

async function ensureShardInner(code, version) {
  var rec = null;
  try {
    rec = await idbGetShard(code);
  } catch (e) {
    rec = null;
  }
  if (rec && rec.version === version) {
    _loadedShards[code] = { version: version, words: rec.words };
    return rec.words;
  }
  // ?v=<version> busts the HTTP cache exactly when the shard changes —
  // GitHub Pages sends no Cache-Control, so a bare URL could serve stale
  // bytes for days after a deploy while the manifest flips instantly.
  var resp = await fetch(SHARD_DIR + code + ".json?v=" + version);
  if (!resp.ok) {
    throw new Error("Failed to load the search index (" + resp.status + ")");
  }
  var words = JSON.parse(await resp.text());
  // Fire-and-forget: don't delay the first search on the write
  idbPutShard(code, version, words).catch(function () {});
  _loadedShards[code] = { version: version, words: words };
  return words;
}

/** Fold one shard's flat { word: packed } dict into _master at its bookId. */
function mergeIntoMaster(words, numericId) {
  for (var word in words) {
    var entry = _master[word];
    if (!entry) entry = _master[word] = {};
    entry[String(numericId)] = words[word];
  }
}

/** Rebuild _master from every currently-loaded shard. */
function rebuildMaster(meta) {
  _master = {};
  for (var code in _mergedVersions) {
    var s = _loadedShards[code];
    if (s) mergeIntoMaster(s.words, meta.bookIds.indexOf(code));
  }
}

/**
 * Bind a shard's code/version to its load promise. The loop calls this with
 * per-iteration values; a bare closure over the loop's var would tag every
 * loaded shard with the LAST iteration's code (and the _mergedVersions skip
 * would then fold only one shard into _master).
 */
function tagShard(code, version) {
  return function (words) {
    return { code: code, version: version, words: words };
  };
}

/**
 * Load the merged index for a set of books and return { meta, words } in the
 * shape searchLibrary consumes. scopeBookCodes: the books to cover; null /
 * absent / empty = every book in the index. Only the shards for the books in
 * scope are fetched — a scoped search never downloads the whole corpus, and
 * already-loaded shards (a wider scope, an earlier search) are reused. Any
 * needed shard failing to load rejects the whole call — result counts stay
 * truthful — and the caller's error + Retry path re-attempts just the
 * missing pieces.
 */
export function loadScopedIndex(scopeBookCodes) {
  return loadIndexMeta().then(function (meta) {
    // Scope → needed codes. A scope is user/URL input; unknown codes are
    // dropped so a garbage deep link never 404-fetches a nonexistent shard.
    var codes;
    if (scopeBookCodes && scopeBookCodes.length > 0) {
      codes = [];
      for (var i = 0; i < scopeBookCodes.length; i++) {
        var c = scopeBookCodes[i];
        if (meta.bookIds.indexOf(c) !== -1 && codes.indexOf(c) === -1) codes.push(c);
      }
    } else {
      codes = meta.bookIds;
    }

    var loads = [];
    for (var j = 0; j < codes.length; j++) {
      var code = codes[j];
      var version = meta.shards[code];
      if (!version) throw new Error("Search index is corrupt (no shard for " + code + ")");
      loads.push(
        ensureShard(code, version).then(tagShard(code, version))
      );
    }
    return Promise.all(loads).then(function (loaded) {
      for (var k = 0; k < loaded.length; k++) {
        var l = loaded[k];
        if (_mergedVersions[l.code] === l.version) continue;
        if (_mergedVersions[l.code]) {
          // A deploy changed this shard mid-session: rebuild so words that
          // DISAPPEARED from the shard leave _master too — an incremental
          // merge would keep their stale postings.
          rebuildMaster(meta);
        }
        mergeIntoMaster(l.words, meta.bookIds.indexOf(l.code));
        _mergedVersions[l.code] = l.version;
      }
      return { meta: meta, words: _master };
    });
  });
}

/** Pre-shard API: the whole index. Thin alias for any caller without a scope. */
export function loadSearchIndex() {
  return loadScopedIndex(null);
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

  var words = index.words;
  var postings = [];
  for (var i = 0; i < terms.length; i++) {
    var posting = words[terms[i]];
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
