/**
 * Library Search Module
 * Cross-book search over the machine-generated word-level index — a small
 * manifest (data/search-index-manifest.json) plus one shard per indexed book
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
 * loadIndexMeta, searchLibrary, searchLibraryDetailed, analyseAllBooksQuery,
 * tokenizeText, PREFIX_MIN_CHARS
 */

import { normaliseForSearch, parseQuery } from "./search-utils.js";

var INDEX_PATH = "../../data/search-index-manifest.json"; // the manifest — meta only
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

/** Sorted-array difference (a without b) — both inputs ascending, unique. */
function differenceSorted(a, b) {
  var out = [];
  var i = 0;
  var j = 0;
  while (i < a.length) {
    if (j >= b.length) { out.push(a[i]); i++; continue; }
    if (a[i] === b[j]) { i++; j++; }
    else if (a[i] < b[j]) { out.push(a[i]); i++; }
    else j++;
  }
  return out;
}

/** Pack a sorted, unique row array back into the index's "1-5,8" form. */
function packRanges(rows) {
  var parts = [];
  var start = rows[0];
  var prev = rows[0];
  for (var i = 1; i < rows.length; i++) {
    var v = rows[i];
    if (v === prev) continue;
    if (v === prev + 1) { prev = v; continue; }
    parts.push(start === prev ? String(start) : start + "-" + prev);
    start = prev = v;
  }
  parts.push(start === prev ? String(start) : start + "-" + prev);
  return parts.join(",");
}

// ── Prefix expansion ────────────────────────────────────────

/**
 * Shortest normalised word that implicitly expands to its longer forms.
 * Every word matches exactly at any length; from this length up, a bare
 * word also matches every indexed word beginning with it. `.word` opts a
 * word out of the expansion at any length. The floor keeps 1–2 letter
 * beginnings from turning a query into a corpus sweep (އ matches 34,781
 * words / 39,752 rows; އެ 10,490 / 35,500; އެކ 1,426 / 16,586 — see
 * docs/ARCHITECTURE.md).
 */
export var PREFIX_MIN_CHARS = 3;

/**
 * Merge every indexed word beginning with `prefix` into one posting, limited
 * to the resolved scope. Returns null when no in-scope book has a match.
 * The scan is linear over the merged word list — the measured cost at the
 * 3-character floor is tens of milliseconds (docs/ARCHITECTURE.md).
 */
function collectPrefixPosting(words, prefix, allowed) {
  var byBook = null;
  for (var w in words) {
    if (w.lastIndexOf(prefix, 0) !== 0) continue; // startsWith, ES5
    var posting = words[w];
    for (var bookKey in posting) {
      if (allowed && !allowed[bookKey]) continue;
      var rows = rangesToArray(posting[bookKey]);
      if (!byBook) byBook = {};
      var bag = byBook[bookKey];
      if (!bag) byBook[bookKey] = rows;
      else {
        for (var r = 0; r < rows.length; r++) bag.push(rows[r]);
      }
    }
  }
  if (!byBook) return null;
  var out = {};
  for (var key in byBook) {
    out[key] = packRanges(byBook[key].sort(function (x, y) { return x - y; }));
  }
  return out;
}

/**
 * Resolve one analysed term to a posting. Exact at any length; a 3+-character
 * bare word additionally unions every indexed word beginning with it (the
 * exact word is one of those, so the prefix posting covers both). `.word`
 * (wholeWord) is exact-only — the precision escape hatch. Scope filtering
 * happens inside the prefix union so out-of-scope shards already merged into
 * _master never leak into a narrowed search.
 */
function resolveTermPosting(words, term, allowed) {
  if (term.wholeWord || term.word.length < PREFIX_MIN_CHARS) {
    return words[term.word] || null;
  }
  return collectPrefixPosting(words, term.word, allowed);
}

// ── Query analysis ──────────────────────────────────────────

/**
 * Parse an all-books query into word terms plus a support report.
 *
 * The cross-book index is a word postings list, so unlike the in-book
 * matcher (rowMatchesQueryNorm in search-utils.js) it cannot evaluate every
 * grammar construct. Matching keeps the index's precision and adds one
 * deliberate relaxation:
 *   - every word matches exactly, at any length;
 *   - a bare word of PREFIX_MIN_CHARS+ normalised characters ALSO matches
 *     every indexed word beginning with it — އެކަލޭގެފާނ finds
 *     އެކަލޭގެފާނު and the word's other inflections. `.word` opts out
 *     (exact only, any length). Exclusions follow the same rule — a 3+
 *     character `-word` subtracts the expanded set.
 * The rest of the grammar degrades to the literal words, reporting the
 * approximation through flags so each renderer can show a note:
 *   - quoted phrase → its words, ANDed (word order is not enforced);
 *   - `~fuzzy~` → the literal word (no edit tolerance at index level);
 *   - `*`/`?` wildcards → the literal fragments around them;
 *   - `col:N:` → the term without the column restriction.
 * A `/regex/` query has no words to degrade to: it reports `regexOnly` and
 * yields no results (the UI explains). An exclude-only query cannot be
 * listed either — the index knows where a word IS, not where it is not —
 * so it reports `excludeOnly` and yields no results. A query whose only
 * missing include word is shorter than the expansion floor reports
 * `shortWordMiss` on the search result (searchLibraryDetailed), so the UI
 * can say "keep typing" instead of a bare no-results line.
 *
 * Lengths are measured on normalised tokens; every indexed script (Thaana,
 * Arabic, Latin) is BMP, so `word.length` is the codepoint count.
 *
 * @param {string} query - raw query text
 * @returns {{includeWords: string[], excludeWords: string[],
 *   includeTerms: Array<{word: string, wholeWord: boolean}>,
 *   excludeTerms: Array<{word: string, wholeWord: boolean}>,
 *   regexOnly: boolean, excludeOnly: boolean, approximated: boolean,
 *   shortWordMiss: boolean}}
 */
export function analyseAllBooksQuery(query) {
  var parsed = parseQuery(query || "");
  var info = {
    includeWords: [],
    excludeWords: [],
    includeTerms: [],
    excludeTerms: [],
    regexOnly: false,
    excludeOnly: false,
    approximated: false,
    shortWordMiss: false,
  };
  if (parsed.regex) {
    info.regexOnly = true;
    return info;
  }

  function addWords(term, bag, terms) {
    var tokens = tokenizeText(normaliseForSearch(term.term));
    for (var i = 0; i < tokens.length; i++) {
      var word = tokens[i];
      if (bag.indexOf(word) === -1) bag.push(word);
      var entry = null;
      for (var j = 0; j < terms.length; j++) {
        if (terms[j].word === word) { entry = terms[j]; break; }
      }
      if (entry) entry.wholeWord = entry.wholeWord || term.wholeWord;
      else terms.push({ word: word, wholeWord: term.wholeWord });
    }
  }
  function analyseTerm(term, bag, terms) {
    if (term.col !== null) info.approximated = true;
    if (term.fuzzy) info.approximated = true;
    if (/[*?]/.test(term.term)) info.approximated = true;
    if (/\s/.test(term.term)) info.approximated = true; // quoted phrase
    addWords(term, bag, terms);
  }

  for (var i = 0; i < parsed.include.length; i++) {
    analyseTerm(parsed.include[i], info.includeWords, info.includeTerms);
  }
  for (var j = 0; j < parsed.exclude.length; j++) {
    analyseTerm(parsed.exclude[j], info.excludeWords, info.excludeTerms);
  }
  if (info.includeWords.length === 0 && info.excludeWords.length > 0) {
    info.excludeOnly = true;
  }
  return info;
}

/**
 * Search the library index for a query, with the query-support report the
 * renderers use to show the all-books grammar note.
 *
 * Plain include/exclude terms resolve exactly at any length and, at 3+
 * normalised characters, also union every indexed word beginning with them
 * (PREFIX_MIN_CHARS; `.word` opts out). Prefix unions are filtered to the
 * scope inside the union itself, so a narrowed search stays narrowed even
 * though _master carries shards from earlier, wider loads.
 *
 * @param {Object} index - parsed index ({meta, words}) from loadSearchIndex()
 * @param {string} query - raw query text; parsed by analyseAllBooksQuery()
 * @param {string[]} [scopeBookCodes] - book codes to limit the search to
 *   (e.g. tag-scoped, -HDN excluded). Omit / empty = every book in the index.
 * @returns {{results: Array<{bookCode, count, firstRow}>, info: Object}}
 *   results: books with at least one matching row, sorted by match count
 *   descending; empty when the query has no searchable terms, a term exists
 *   nowhere, or nothing matched. info: see analyseAllBooksQuery();
 *   `shortWordMiss` is set here when a 1–2 character include word is not
 *   itself indexed (no expansion is possible at that length).
 */
export function searchLibraryDetailed(index, query, scopeBookCodes) {
  var info = analyseAllBooksQuery(query);
  if (!index || !index.words) return { results: [], info: info };
  if (info.regexOnly || info.includeWords.length === 0) {
    return { results: [], info: info };
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

  var words = index.words;
  var postings = [];
  for (var i = 0; i < info.includeTerms.length; i++) {
    var term = info.includeTerms[i];
    var posting = resolveTermPosting(words, term, allowed);
    if (!posting) {
      // A short word can only be exact (no expansion), so a miss at that
      // length is "too short to expand and not itself indexed" — the UI
      // tells the user to keep typing. Missing longer words just miss.
      if (term.word.length < PREFIX_MIN_CHARS && !words[term.word]) {
        info.shortWordMiss = true;
      }
      return { results: [], info: info }; // a term exists nowhere in scope → no row can contain all terms
    }
    postings.push(posting);
  }
  // Exclusions only subtract where the term exists; a term absent from the
  // resolved scope excludes nothing.
  var excludePostings = [];
  for (var e = 0; e < info.excludeTerms.length; e++) {
    var ep = resolveTermPosting(words, info.excludeTerms[e], allowed);
    if (ep) excludePostings.push(ep);
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
    if (pCount === 0) return { results: [], info: info };
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
    // Exclusions subtract per book — the row must contain every include
    // word and none of the exclude words (searchLibrary used to treat
    // "-word" as a positive term because the raw tokeniser dropped the
    // minus; parseQuery keeps the semantics).
    for (var x = 0; x < excludePostings.length && rows.length > 0; x++) {
      var exRows = excludePostings[x][bookKey];
      if (exRows) rows = differenceSorted(rows, rangesToArray(exRows));
    }
    if (rows.length === 0) continue;
    results.push({
      bookCode: bookIds[+bookKey],
      count: rows.length,
      firstRow: rows[0],
    });
  }

  results.sort(function (a, b) { return b.count - a.count; });
  return { results: results, info: info };
}

/**
 * Array-only wrapper around searchLibraryDetailed — the historical API for
 * callers that don't render the grammar note.
 *
 * @returns {Array<{bookCode, count, firstRow}>}
 */
export function searchLibrary(index, query, scopeBookCodes) {
  return searchLibraryDetailed(index, query, scopeBookCodes).results;
}
