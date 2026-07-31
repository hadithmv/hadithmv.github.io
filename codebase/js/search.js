/**
 * Enhanced Search Engine
 *
 * Tashkeel‑insensitive, multi‑language search with wildcards, negation,
 * fuzzy matching, whole‑word, regex, and column‑scoped queries.
 * Used by both the book reader and the dashboard search.
 *
 * Exports: normaliseForSearch, parseQuery, rowMatchesQuery, matchTerm,
 *          highlightMatches, buildSnippets, escapeHTML, addSearchHistory,
 *          getSearchHistory, clearSearchHistory, MAX_HISTORY
 */

// ── Text normalisation ──────────────────────────────────────

/**
 * Strip Arabic tashkeel, unify alif/ya/waw variants,
 * normalise Thaana thikijehi → base letters.
 */
export function normaliseForSearch(str) {
  if (!str) return "";
  var s = str.toLowerCase();
  // Arabic tashkeel + tatweel
  s = s.replace(/[ؐ-ًؚ-ٰٟۖ-ۭ]/g, "");
  s = s.replace(/ـ/g, "");
  // Alif → plain alif
  s = s.replace(/[أإآ]/g, "ا");
  // Ya → ya
  s = s.replace(/ى/g, "ي");
  // Waw-hamza → waw
  s = s.replace(/ؤ/g, "و");
  // Thaana thikijehi → base Thaana
  s = s.replace(/ޘ/g, "ސ");
  s = s.replace(/ޙ/g, "ހ");
  s = s.replace(/ޚ/g, "ހ");
  s = s.replace(/ޛ/g, "ޒ");
  s = s.replace(/ޜ/g, "ޒ");
  s = s.replace(/ޝ/g, "ސ");
  s = s.replace(/ޞ/g, "ސ");
  s = s.replace(/ޟ/g, "ދ");
  s = s.replace(/ޠ/g, "ތ");
  s = s.replace(/ޡ/g, "ޒ");
  s = s.replace(/ޢ/g, "އ");
  s = s.replace(/ޣ/g, "ގ");
  s = s.replace(/ޤ/g, "ގ");
  s = s.replace(/ޥ/g, "ވ");
  return s;
}

// ── HTML helpers ────────────────────────────────────────────

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function escapeHTML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** XML mode — also escapes quotes and apostrophes. */
export function escapeXML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

// ── Highlight matching ──────────────────────────────────────

/**
 * Wrap occurrences of `query` in <mark> tags.
 * Uses normalised matching to handle tashkeel / thikijehi.
 */
export function highlightMatches(text, query) {
  if (!query) return text;
  var nq = normaliseForSearch(query);
  var nt = normaliseForSearch(text);
  if (!nq) return text;
  var result = "";
  var lastEnd = 0;
  var pos = 0;
  while (pos < nt.length) {
    var idx = nt.indexOf(nq, pos);
    if (idx === -1) break;
    var matchLen = nq.length;
    var origStart = 0, normIdx = 0;
    while (normIdx < idx && origStart < text.length) {
      if (normaliseForSearch(text[origStart]) === nt[normIdx]) normIdx++;
      origStart++;
    }
    var origEnd = origStart;
    var matchedNorm = 0;
    while (matchedNorm < matchLen && origEnd < text.length) {
      if (normaliseForSearch(text[origEnd]) === nt[idx + matchedNorm]) matchedNorm++;
      origEnd++;
    }
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
 * Check if `text` matches a single `term` with modifiers.
 */
export function matchTerm(text, term, wholeWord) {
  var nt = normaliseForSearch(text);
  var nterm = normaliseForSearch(term);
  if (!nterm) return false;

  // Fuzzy: ~term or term~
  var fuzzy = false;
  var fuzzyTerm = nterm;
  if (nterm[0] === "~") { fuzzy = true; fuzzyTerm = nterm.slice(1); }
  if (nterm[nterm.length - 1] === "~") { fuzzy = true; fuzzyTerm = nterm.slice(0, -1); }
  if (fuzzy) return fuzzyMatch(nt, fuzzyTerm, 2);

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
  try {
    return new RegExp(pattern, flags).test(nt);
  } catch (e) {
    return nt.indexOf(nterm) !== -1;
  }
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

// ── Row matching ────────────────────────────────────────────

/**
 * Check if a data row matches a parsed query.
 * Row is an array of cell values.
 */
export function rowMatchesQuery(row, parsed) {
  if (parsed.regex) {
    return row.some(function (cell) {
      return cell != null && parsed.regex.test(normaliseForSearch(String(cell)));
    });
  }

  for (var i = 0; i < parsed.include.length; i++) {
    var inc = parsed.include[i];
    var cols = inc.col !== null ? [row[inc.col]] : row;
    if (!cols.some(function (cell) {
      return cell != null && matchTerm(String(cell), inc.term, inc.wholeWord);
    })) return false;
  }
  for (var j = 0; j < parsed.exclude.length; j++) {
    var exc = parsed.exclude[j];
    var excCols = exc.col !== null ? [row[exc.col]] : row;
    if (excCols.some(function (cell) {
      return cell != null && matchTerm(String(cell), exc.term, exc.wholeWord);
    })) return false;
  }
  return true;
}

// ── Snippet builder ─────────────────────────────────────────

/**
 * Build highlighted snippets for a row, using the same search engine
 * so highlighting matches filtering exactly.
 */
export function buildSnippets(row, parsed, queryForHighlight) {
  var matchingCells = [];
  for (var i = 0; i < row.length; i++) {
    var cell = row[i];
    if (cell === null || cell === undefined) continue;
    var testRow = [];
    testRow[i] = cell;
    if (rowMatchesQuery(testRow, parsed)) {
      matchingCells.push({ text: String(cell) });
    }
  }
  if (matchingCells.length === 0) return [];

  var results = [];
  for (var m = 0; m < matchingCells.length; m++) {
    var str = matchingCells[m].text;
    var nstr = normaliseForSearch(str);
    var bestPos = -1, bestLen = 0;
    for (var t = 0; t < parsed.include.length; t++) {
      var term = parsed.include[t];
      var nterm = normaliseForSearch(term.term);
      if (!nterm) continue;
      var pos = nstr.indexOf(nterm);
      if (pos !== -1 && (bestPos === -1 || pos < bestPos)) {
        bestPos = pos; bestLen = nterm.length;
      }
    }
    if (bestPos === -1) { bestPos = 0; bestLen = Math.min(str.length, 80); }
    var origStart = 0, normIdx = 0;
    while (normIdx < bestPos && origStart < str.length) {
      if (normaliseForSearch(str[origStart]) === (nstr[normIdx] || "")) normIdx++;
      origStart++;
    }
    var origEnd = origStart, matchedNorm = 0;
    while (matchedNorm < bestLen && origEnd < str.length) {
      if (normaliseForSearch(str[origEnd]) === (nstr[bestPos + matchedNorm] || "")) matchedNorm++;
      origEnd++;
    }
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
