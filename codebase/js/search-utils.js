/**
 * Enhanced Search Engine
 *
 * Tashkeel‑insensitive, multi‑language search with wildcards, negation,
 * fuzzy matching, whole‑word, regex, and column‑scoped queries.
 * Used by both the book reader and the dashboard search.
 *
 * Exports: normaliseForSearch, escapeHTML, escapeXML, linkifyURLs,
 *          highlightMatches, parseQuery, compileQuery, rowMatchesQuery,
 *          rowMatchesQueryNorm, buildNormData, buildSnippets,
 *          addSearchHistory, getSearchHistory, removeSearchHistoryItem,
 *          clearSearchHistory, MAX_HISTORY
 */

// ── Text normalisation ──────────────────────────────────────

/**
 * Strip Arabic tashkeel, unify alif/ya/waw variants,
 * normalise Thaana thikijehi → base letters, strip the
 * Arabic definite article (guarded — see AL_RE below),
 * drop apostrophes (straight + curly) so EN transliterations
 * match: "Qur'an" ≡ "Quran" — nothing else strips them, and the
 * engine tokeniser would split on them into garbage tokens.
 * (Hyphens/underscores are NOT stripped here: the dashboard
 * strips them, the engine splits on them — either way both
 * sides of a search get the same treatment.)
 */
// Single regex pass + per-char lookup — one full scan instead of ~30
// sequential replaces. This is the hottest function in the app: it runs
// on every search keystroke, every highlight, and once per cell when
// buildNormData() precomputes the search cache.
var NORM_RE = /[ؐ-ًؚ-ٰٟۖ-ۭـ]|[أإآٱ]|ى|ؤ|'|’|‘|[ޘޝޞ]|[ޙޚ]|[ޛޜޡ]|[ޟ]|[ޠ]|[ޢ]|[ޣޤ]|[ޥ]/g;

// Arabic definite article, stripped at word start (second pass, after the
// marks are gone so the guards see the letters themselves). Refuses:
//  - before another ل — الله/اللهم/اللائي keep the whole word;
//  - unless ≥ 2 letters follow — أَلْف "thousand" and the mysterious-letter
//    "الر" keep their shape (a 1-letter remainder would be search noise).
// Word-internal ال (بال، وال، لل) is left alone — "والقرآن" stays whole,
// still consistent on both sides of a search.
var AL_RE = /(^|[^؀-ۿݐ-ݿ])ال(?!ل)(?=[؀-ۿݐ-ݿ]{2})/g;

export function normaliseForSearch(str) {
  if (!str) return "";
  var s = str.toLowerCase();
  s = s.replace(NORM_RE, function (ch) {
    // Alif → plain alif (incl. alif-wasla ٱ)
    if (ch === "أ" || ch === "إ" || ch === "آ" || ch === "ٱ") return "ا";
    // Ya → ya
    if (ch === "ى") return "ي";
    // Waw-hamza → waw
    if (ch === "ؤ") return "و";
    // Thaana thikijehi → base Thaana
    if (ch === "ޘ" || ch === "ޝ" || ch === "ޞ") return "ސ";
    if (ch === "ޙ" || ch === "ޚ") return "ހ";
    if (ch === "ޛ" || ch === "ޜ" || ch === "ޡ") return "ޒ";
    if (ch === "ޟ") return "ދ";
    if (ch === "ޠ") return "ތ";
    if (ch === "ޢ") return "އ";
    if (ch === "ޣ" || ch === "ޤ") return "ގ";
    if (ch === "ޥ") return "ވ";
    return ""; // tashkeel / tatweel
  });
  return s.replace(AL_RE, "$1");
}

// ── HTML helpers ────────────────────────────────────────────

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Escape a string for insertion into HTML. Complete set: `& < > " '` —
 * safe in text contexts AND quoted attributes (value="…", data-…="…").
 * Cell content is deliberately NOT escaped anywhere (data renders as HTML
 * by design); this is for user/URL input only. See docs/ARCHITECTURE.md
 * "HTML & DOM".
 */
export function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Number formatting ─────────────────────────────────────────

/**
 * Thousands separators for display-only numbers (search result row
 * labels, result counts, the scroll counter). Plain-digit strings only —
 * anything else (row[0] pNo values, non-numeric labels) passes through
 * unchanged.
 */
export function formatThousands(n) {
  var s = String(n);
  return /^\d+$/.test(s) ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : s;
}

// ── URL linkification ─────────────────────────────────────────

/**
 * Turn https:// URLs in ALREADY-ESCAPED html (highlight <mark> / tashkeel
 * spans may be present) into <a> links. Matches only URL runs outside tags,
 * so span markup and attributes are untouched. Trailing punctuation — Latin
 * or Arabic — stays outside the link. The URL text is the escaped source
 * text, so an href gets `&amp;` for `&` and still resolves to the real URL.
 */
export function linkifyURLs(html) {
  if (!html || html.indexOf("http") === -1) return html;
  var re = /https?:\/\/[^\s<>"']+/gi;
  var out = "";
  var last = 0;
  var m;
  while ((m = re.exec(html)) !== null) {
    var before = html.slice(0, m.index);
    if (before.lastIndexOf("<") > before.lastIndexOf(">")) continue; // inside a tag
    var url = m[0].replace(/[.,;:!?،؛)\]}]+$/, "");
    var trailing = m[0].slice(url.length);
    out += html.slice(last, m.index);
    out += '<a class="reader-link" href="' + url + '" target="_blank" rel="noopener noreferrer" dir="auto">' + url + "</a>";
    out += trailing;
    last = m.index + m[0].length;
  }
  return out + html.slice(last);
}

/** XML mode — also escapes quotes and apostrophes. */
export function escapeXML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

// ── Highlight matching ──────────────────────────────────────

/**
 * Map a run of the normalised string back to original characters —
 * the per-char hot path of highlighting. Identity comparison is the
 * fast path: chars that pass through normalisation unchanged are matched
 * with one char compare + branch, so only the minority that actually
 * differ (tashkeel, thikijehi, case) pay a normalisation call.
 * `ntOffset`/`targetLen` address a run of `nt` (e.g. the query's
 * normalised text at a given position).
 */
function mapNormToOrig(lower, nt, start, ntOffset, targetLen) {
  var matched = 0;
  var i = start;
  while (matched < targetLen && i < lower.length) {
    if (lower[i] === nt[ntOffset + matched]) matched++;
    else if (normaliseForSearch(lower[i]) === nt[ntOffset + matched]) matched++;
    i++;
  }
  return i;
}

/**
 * Wrap occurrences of `query` in <mark> tags.
 * Uses normalised matching to handle tashkeel / thikijehi.
 */
export function highlightMatches(text, query) {
  if (!query) return text;
  var nq = normaliseForSearch(query);
  var nt = normaliseForSearch(text);
  if (!nq) return text;
  // Lowercase once: normalisation is case-folding + char mapping, so
  // identity against `nt` catches most chars without any normalisation call.
  var lower = text.toLowerCase();
  var result = "";
  var lastEnd = 0;
  var pos = 0;
  while (pos < nt.length) {
    var idx = nt.indexOf(nq, pos);
    if (idx === -1) break;
    var matchLen = nq.length;
    var origStart = mapNormToOrig(lower, nt, 0, 0, idx);
    var origEnd = mapNormToOrig(lower, nt, origStart, idx, matchLen);
    result += escapeHTML(text.slice(lastEnd, origStart));
    result += "<mark>" + escapeHTML(text.slice(origStart, origEnd)) + "</mark>";
    lastEnd = origEnd;
    pos = idx + matchLen;
  }
  result += escapeHTML(text.slice(lastEnd));
  return result;
}

// ── Matching engine ─────────────────────────────────────────

/**
 * Compile a term once: normalised text, fuzzy flag, and the compiled
 * regex. The old path re-normalised the term and rebuilt the RegExp for
 * EVERY cell — O(rows × cols) term normalisations per keystroke.
 */
function compileTerm(term, wholeWord, fuzzyFlag) {
  var nterm = normaliseForSearch(term);
  var fuzzy = !!fuzzyFlag;
  var fuzzyTerm = nterm;
  // Fuzzy: ~term or term~. parseQuery strips the markers and sets the flag;
  // the inline markers are also handled here so raw terms work either way.
  if (nterm[0] === "~") { fuzzy = true; fuzzyTerm = nterm.slice(1); }
  if (nterm[nterm.length - 1] === "~") { fuzzy = true; fuzzyTerm = nterm.slice(0, -1); }
  var re = null;
  if (!fuzzy) {
    // Build regex from term (support * and ? wildcards)
    var pattern = "";
    for (var i = 0; i < nterm.length; i++) {
      var ch = nterm[i];
      if (ch === "*") pattern += ".*";
      else if (ch === "?") pattern += ".";
      else pattern += escapeRegex(ch);
    }
    var flags = "iu";
    if (wholeWord) {
      pattern = "(^|[^\\p{L}])(" + pattern + ")([^\\p{L}]|$)";
    }
    try { re = new RegExp(pattern, flags); } catch (e) { re = null; }
  }
  return { nterm: nterm, fuzzy: fuzzy, fuzzyTerm: fuzzyTerm, re: re };
}

/** Match a pre-normalised cell against a compiled term. */
function matchCompiled(normText, term) {
  if (!term.nterm) return false;
  if (term.fuzzy) return fuzzyMatch(normText, term.fuzzyTerm, 2);
  if (term.re) return term.re.test(normText);
  return normText.indexOf(term.nterm) !== -1;
}

function fuzzyMatch(text, pattern, maxDist) {
  var tLen = text.length;
  var pLen = pattern.length;
  if (Math.abs(tLen - pLen) > maxDist) return false;
  for (var s = 0; s < tLen - pLen + maxDist + 1; s++) {
    if (levenshtein(text.slice(s, Math.min(s + pLen + maxDist, tLen)), pattern, maxDist) <= maxDist) return true;
  }
  return false;
}

function levenshtein(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  var prev = [];
  for (var i = 0; i <= b.length; i++) prev[i] = i;
  for (var i = 1; i <= a.length; i++) {
    var curr = [i];
    var minInRow = i;
    for (var j = 1; j <= b.length; j++) {
      var cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      if (curr[j] < minInRow) minInRow = curr[j];
    }
    if (minInRow > max) return max + 1;
    prev = curr;
  }
  return prev[b.length];
}

// ── Query parser ────────────────────────────────────────────

/**
 * Parse a query string into structured tokens.
 *
 * Syntax:
 *   word         – normal match
 *   .word        – whole‑word match
 *   -word        – exclude
 *   ~word~        – fuzzy (1–2 char tolerance)
 *   * / ?        – wildcard
 *   col:N:word   – scope to column N
 *   /pattern/fl  – explicit regex (the pattern is normalised like any
 *                  query term — regexes test the normalised text, so the
 *                  pattern gets the same treatment or «/الناس/» would
 *                  diverge from the plain term once ال is stripped)
 */
export function parseQuery(query) {
  var result = { include: [], exclude: [] };
  if (!query || !query.trim()) return result;

  var regexMatch = query.match(/^\/(.+?)\/([gimsu]*)$/);
  if (regexMatch) {
    try {
      // The compiled regex is ONE object shared across every cell and row of
      // a search, and only ever .test()ed. A `g`/`y` flag makes test()
      // stateful (lastIndex persists between calls), so a later cell whose
      // match sits before the inherited lastIndex silently fails — order-
      // dependent false negatives (72/179 real misses on «/الناس/»). The
      // engine wants "does this cell match anywhere": strip those flags.
      result.regex = new RegExp(normaliseForSearch(regexMatch[1]), (regexMatch[2] || "i").replace(/[gy]/g, ""));
    } catch (e) { result.regex = null; }
    return result;
  }

  var tokens = [];
  var re = /"([^"]+)"|'([^']+)'|(\S+)/g;
  var m;
  while ((m = re.exec(query)) !== null) {
    tokens.push(m[1] || m[2] || m[3]);
  }

  tokens.forEach(function (token) {
    var exclude = false;
    var wholeWord = false;
    var fuzzy = false;
    var col = null;

    if (token[0] === "-") { exclude = true; token = token.slice(1); }
    if (token[0] === ".") { wholeWord = true; token = token.slice(1); }

    var colMatch = token.match(/^col:(\d+):(.+)/);
    if (colMatch) { col = parseInt(colMatch[1]); token = colMatch[2]; }

    if (token[0] === "~" || token[token.length - 1] === "~") {
      fuzzy = true;
      if (token[0] === "~") token = token.slice(1);
      if (token[token.length - 1] === "~") token = token.slice(0, -1);
    }

    if (token) {
      (exclude ? result.exclude : result.include).push({
        term: token, wholeWord: wholeWord, fuzzy: fuzzy, col: col
      });
    }
  });

  return result;
}

// ── Compiled queries ────────────────────────────────────────

/**
 * Compile a parsed query so a scan needs no re-normalisation and no
 * regex rebuild. Same shape as parseQuery's result (plus `compiled: true`);
 * pass it to rowMatchesQuery / rowMatchesQueryNorm / buildSnippets.
 */
export function compileQuery(parsed) {
  var compiled = { regex: parsed.regex, include: [], exclude: [], compiled: true };
  for (var i = 0; i < parsed.include.length; i++) {
    var inc = parsed.include[i];
    compiled.include.push({ col: inc.col, term: compileTerm(inc.term, inc.wholeWord, inc.fuzzy) });
  }
  for (var j = 0; j < parsed.exclude.length; j++) {
    var exc = parsed.exclude[j];
    compiled.exclude.push({ col: exc.col, term: compileTerm(exc.term, exc.wholeWord, exc.fuzzy) });
  }
  return compiled;
}

/**
 * True when a single cell (at column `idx`) passes a compiled query —
 * the per-cell test buildSnippets uses. Column-scoped terms only count
 * when the term's column IS this cell's column (missing columns never match).
 */
function matchesCell(compiled, normCell, idx) {
  if (compiled.regex) return compiled.regex.test(normCell);
  for (var i = 0; i < compiled.include.length; i++) {
    var t = compiled.include[i];
    if (t.col !== null && t.col !== idx) return false;
    if (!matchCompiled(normCell, t.term)) return false;
  }
  for (var j = 0; j < compiled.exclude.length; j++) {
    var e = compiled.exclude[j];
    if (e.col !== null && e.col !== idx) continue;
    if (matchCompiled(normCell, e.term)) return false;
  }
  return true;
}

// ── Row matching ────────────────────────────────────────────

/**
 * Check if a data row matches a parsed query.
 * Row is an array of cell values.
 */
export function rowMatchesQuery(row, parsed) {
  var compiled = parsed && parsed.compiled ? parsed : compileQuery(parsed);
  return rowMatchesQueryNorm(row, null, compiled);
}

/**
 * Precomputed-normalisation variant: `normRow` is the parallel structure
 * from buildNormData() — pass null to fall back to on-the-fly normalisation
 * (same behaviour as rowMatchesQuery). `compiled` comes from compileQuery().
 */
export function rowMatchesQueryNorm(row, normRow, compiled) {
  if (compiled.regex) {
    return row.some(function (cell, i) {
      var normCell = normRow ? normRow[i] : (cell != null ? normaliseForSearch(String(cell)) : null);
      return normCell != null && compiled.regex.test(normCell);
    });
  }

  for (var i = 0; i < compiled.include.length; i++) {
    var inc = compiled.include[i];
    var cols = inc.col !== null ? [row[inc.col]] : row;
    var matched = false;
    for (var j = 0; j < cols.length; j++) {
      var cell = cols[j];
      var normCell = normRow
        ? (inc.col !== null ? normRow[inc.col] : normRow[j])
        : (cell != null ? normaliseForSearch(String(cell)) : null);
      if (normCell != null && matchCompiled(normCell, inc.term)) { matched = true; break; }
    }
    if (!matched) return false;
  }
  for (var k = 0; k < compiled.exclude.length; k++) {
    var exc = compiled.exclude[k];
    var excCols = exc.col !== null ? [row[exc.col]] : row;
    for (var l = 0; l < excCols.length; l++) {
      var eCell = excCols[l];
      var excNormCell = normRow
        ? (exc.col !== null ? normRow[exc.col] : normRow[l])
        : (eCell != null ? normaliseForSearch(String(eCell)) : null);
      if (excNormCell != null && matchCompiled(excNormCell, exc.term)) return false;
    }
  }
  return true;
}

// ── Precomputed normalisation ───────────────────────────────

/**
 * Build a parallel structure of normalised cells for every row — the
 * search/highlight path then never re-normalises per keystroke.
 * null/undefined cells stay null (missing cells); empty strings
 * normalise to "" so wildcard-only queries still behave as before.
 */
export function buildNormData(rows) {
  var out = new Array(rows.length);
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var normCells = new Array(r.length);
    for (var j = 0; j < r.length; j++) {
      var c = r[j];
      normCells[j] = (c === null || c === undefined) ? null : normaliseForSearch(String(c));
    }
    out[i] = normCells;
  }
  return out;
}

// ── Snippet builder ─────────────────────────────────────────

/**
 * Build highlighted snippets for a row, using the same search engine
 * so highlighting matches filtering exactly.
 */
export function buildSnippets(row, parsed, queryForHighlight, normRow) {
  // `parsed` may be a raw parseQuery result or a compiled one; `normRow`
  // is the precomputed normalised cell structure (optional).
  var compiled = parsed && parsed.compiled ? parsed : compileQuery(parsed);
  var matchingCells = [];
  for (var i = 0; i < row.length; i++) {
    var cell = row[i];
    if (cell === null || cell === undefined) continue;
    var normCell = normRow ? normRow[i] : normaliseForSearch(String(cell));
    if (matchesCell(compiled, normCell, i)) {
      matchingCells.push({ text: String(cell), norm: normCell });
    }
  }
  if (matchingCells.length === 0) return [];

  var results = [];
  for (var m = 0; m < matchingCells.length; m++) {
    var str = matchingCells[m].text;
    var normStr = matchingCells[m].norm;
    var bestPos = -1, bestLen = 0;
    for (var t = 0; t < compiled.include.length; t++) {
      var term = compiled.include[t];
      var nterm = term.term.nterm;
      if (!nterm) continue;
      var pos = normStr.indexOf(nterm);
      if (pos !== -1 && (bestPos === -1 || pos < bestPos)) {
        bestPos = pos; bestLen = nterm.length;
      }
    }
    if (bestPos === -1) { bestPos = 0; bestLen = Math.min(str.length, 80); }
    var lower = str.toLowerCase();
    var origStart = mapNormToOrig(lower, normStr, 0, 0, bestPos);
    var origEnd = mapNormToOrig(lower, normStr, origStart, bestPos, bestLen);
    var start = Math.max(0, origStart - 150);
    var end = Math.min(str.length, origEnd + 150);
    var snip =
      (start > 0 ? "…" : "") +
      str.slice(start, end) +
      (end < str.length ? "…" : "");
    results.push(highlightMatches(snip, queryForHighlight || ""));
  }
  return results;
}

// ── Search history ──────────────────────────────────────────
// Stores are per-key: the reader and library-search pages keep separate
// histories; a missing key means the reader's.

export var MAX_HISTORY = 20;

var _historyCache = {}; // key → array
var _historySaveTimers = {}; // key → timer

function _historyKey(key) {
  return key || window.LS_KEYS.readerSearchHistory;
}

function _loadHistory(key) {
  var k = _historyKey(key);
  if (!_historyCache[k]) {
    try {
      _historyCache[k] = JSON.parse(localStorage.getItem(k) || "[]");
    } catch (e) {
      _historyCache[k] = [];
    }
  }
  return _historyCache[k];
}

function _saveHistory(key) {
  var k = _historyKey(key);
  try { localStorage.setItem(k, JSON.stringify(_historyCache[k])); } catch (e) {}
}

export function getSearchHistory(key) {
  return _loadHistory(key).slice();
}

export function addSearchHistory(query, key) {
  var q = query.trim();
  if (!q) return;
  var k = _historyKey(key);
  clearTimeout(_historySaveTimers[k]);
  _historySaveTimers[k] = setTimeout(function () {
    var hist = _loadHistory(k);
    hist = hist.filter(function (h) { return h !== q; });
    hist.unshift(q);
    if (hist.length > MAX_HISTORY) hist.pop();
    _historyCache[k] = hist;
    _saveHistory(k);
  }, 800);
}

export function removeSearchHistoryItem(index, key) {
  var hist = _loadHistory(key);
  hist.splice(index, 1);
  _saveHistory(key);
}

export function clearSearchHistory(key) {
  _historyCache[_historyKey(key)] = [];
  _saveHistory(key);
}
