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
 * normalise Thaana thikijehi → base letters.
 */
// Single regex pass + per-char lookup — one full scan instead of ~30
// sequential replaces. This is the hottest function in the app: it runs
// on every search keystroke, every highlight, and once per cell when
// buildNormData() precomputes the search cache.
var NORM_RE = /[ؐ-ًؚ-ٰٟۖ-ۭـ]|[أإآ]|ى|ؤ|[ޘޝޞ]|[ޙޚ]|[ޛޜޡ]|[ޟ]|[ޠ]|[ޢ]|[ޣޤ]|[ޥ]/g;

export function normaliseForSearch(str) {
  if (!str) return "";
  var s = str.toLowerCase();
  return s.replace(NORM_RE, function (ch) {
    // Alif → plain alif
    if (ch === "أ" || ch === "إ" || ch === "آ") return "ا";
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
}

// ── HTML helpers ────────────────────────────────────────────

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function escapeHTML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
 *   /pattern/fl  – explicit regex
 */
export function parseQuery(query) {
  var result = { include: [], exclude: [] };
  if (!query || !query.trim()) return result;

  var regexMatch = query.match(/^\/(.+?)\/([gimsu]*)$/);
  if (regexMatch) {
    try { result.regex = new RegExp(regexMatch[1], regexMatch[2] || "gi"); } catch (e) { result.regex = null; }
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

export var MAX_HISTORY = 20;

var _searchHistory = null;
var _historySaveTimer = null;

function _loadHistory() {
  if (_searchHistory) return _searchHistory;
  try {
    _searchHistory = JSON.parse(localStorage.getItem(window.LS_KEYS.readerSearchHistory) || "[]");
  } catch (e) {
    _searchHistory = [];
  }
  return _searchHistory;
}

function _saveHistory() {
  try { localStorage.setItem(window.LS_KEYS.readerSearchHistory, JSON.stringify(_searchHistory)); } catch (e) {}
}

export function getSearchHistory() {
  return _loadHistory().slice();
}

export function addSearchHistory(query) {
  var q = query.trim();
  if (!q) return;
  clearTimeout(_historySaveTimer);
  _historySaveTimer = setTimeout(function () {
    _loadHistory();
    _searchHistory = _searchHistory.filter(function (h) { return h !== q; });
    _searchHistory.unshift(q);
    if (_searchHistory.length > MAX_HISTORY) _searchHistory.pop();
    _saveHistory();
  }, 800);
}

export function removeSearchHistoryItem(index) {
  _loadHistory();
  _searchHistory.splice(index, 1);
  _saveHistory();
}

export function clearSearchHistory() {
  _searchHistory = [];
  _saveHistory();
}
