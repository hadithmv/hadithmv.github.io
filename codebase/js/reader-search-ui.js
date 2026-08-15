/**
 * Reader Search UI Module
 *
 * Extracted from reader.js to keep the main module under 2 000 lines.
 * The search engine behind the unified search window (js/search-window.js):
 * results rendering (buildSnippets / buildAdvResultsHTML), applySearch /
 * applySearchWindow, the RDF dictionary in-place filter
 * (applyRadheefFilter), the whole-word toggle, search history, the
 * advanced-search conditions (OPERATORS, advConditions, condition rows,
 * applyAdvancedSearch) and the search-results arrow navigation.
 * reader.js owns the state — ctx passes values, accessors and callbacks;
 * the global keyboard dispatcher, reset block and ?q= deep link stay in
 * core. The window is pure shell; all behaviour hangs off its element
 * refs (getSearchWindowUI) — this module never imports page UI modules.
 */

import { parseQuery, compileQuery, rowMatchesQueryNorm, highlightMatches, buildSnippets as buildSnippetsFromSearch, escapeHTML, linkifyURLs, addSearchHistory, getSearchHistory, removeSearchHistoryItem, clearSearchHistory, normaliseForSearch, formatThousands } from "./search-utils.js";
import { t } from "./i18n.js";
import { updatePagination } from "./reader-position.js";
import { initSearchWindow, getSearchWindowUI, getCurrentTab, searchAllBooks, openSearchWindow, setWindowCount } from "./search-window.js";

// Module-scope state — set by initSearchUI, read by the exported
// applySearch / applySearchWindow / renderAdvancedSearch /
// parseQueryWithMode (same pattern as quranState in quran-ui.js).
var ctx = null;
var searchInput = null;   // RDF header input (the in-place dictionary filter)
var winInput = null;      // search-window input
var searchResultsEl = null; // #searchWindowResults
var searchHistoryListEl = null; // #searchWindowHistoryList (items — innerHTML)
var btnWholeWord = null;
var advSearchRows = null;
var advAdd = null;
var advApply = null;
var advReset = null;
var readerContent = null;
var searchClearBtn = null;

// Visible while the header box has text (RDF books only — the window's own
// ✕ is shell-owned, syncClear).
function updateSearchClear() {
  if (searchClearBtn) searchClearBtn.classList.toggle("visible", !!searchInput.value);
}

let selectedResultIdx = -1; // index within searchResultsEl DOM children
var wholeWordMode = false;
var _searchDebounceTimer = null;
// True match count from the last search — the count header in the window
// renders from this (the window is where the count lives now).
var _lastResultCount = 0;
// The last result set and its whole-book (absolute) row map, cached by
// the search runs. Re-opening the window re-runs the query instead of
// drawing from this cache, so it only backs the count header's mirrors.
var _lastResultSet = [];
var _lastRealIdxMap = [];
var advConditions = [];
var OPERATORS = [
  { id: "equals", fn: function(cellVal, q) { return cellVal === q; }, needsValue: true },
  { id: "not", fn: function(cellVal, q) { return cellVal !== q; }, needsValue: true },
  { id: "starts", fn: function(cellVal, q) { return cellVal.indexOf(q) === 0; }, needsValue: true },
  { id: "notStarts", fn: function(cellVal, q) { return cellVal.indexOf(q) !== 0; }, needsValue: true },
  { id: "contains", fn: function(cellVal, q) { return cellVal.indexOf(q) !== -1; }, needsValue: true },
  { id: "notContains", fn: function(cellVal, q) { return cellVal.indexOf(q) === -1; }, needsValue: true },
  { id: "ends", fn: function(cellVal, q) { return cellVal.endsWith(q); }, needsValue: true },
  { id: "notEnds", fn: function(cellVal, q) { return !cellVal.endsWith(q); }, needsValue: true },
  { id: "empty", fn: function(cellVal) { return cellVal === ""; }, needsValue: false },
  { id: "notEmpty", fn: function(cellVal) { return cellVal !== ""; }, needsValue: false },
];

function buildSnippets(row, q, compiled, normRow) {
  var parsed = compiled || parseQueryWithMode(q);
  return buildSnippetsFromSearch(row, parsed, q, normRow);
}

function buildAdvResultsHTML(query, rows, realIdxMap) {
  var MAX = 30;
  var q = query.trim();
  if (!q || rows.length === 0) return "";
  // Compile once for the whole result set — not once per row
  var compiled = parseQueryWithMode(q);
  var html = ""; var count = 0;
  for (var i = 0; i < rows.length && count < MAX; i++) {
    var row = rows[i];
    var rowNum = row[0] || (realIdxMap[i] + 1);
    var snippets = buildSnippets(row, q, compiled, ctx.normAllData[realIdxMap[i]]);
    if (snippets.length === 0) {
      // Fallback: show first non-empty cell
      for (var c = 0; c < row.length; c++) {
        if (row[c] != null && String(row[c]).trim()) {
          snippets = [linkifyURLs(highlightMatches(String(row[c]).trim().slice(0, 200), q))];
          break;
        }
      }
    }
    for (var s = 0; s < snippets.length && count < MAX; s++) {
      html += '<div class="search-result" data-real="' + realIdxMap[i] + '"><span class="search-result-num">#' + formatThousands(rowNum) + '</span><span class="search-result-snippet">' + snippets[s] + '</span></div>';
      count++;
    }
  }
  return linkifyURLs(html);
}

// Wire result-row clicks (jump + close the window — a jump that stays
// hidden behind a modal means nothing) and reader-links (URLs in snippets
// must open, not jump). Shared by every window results render.
function wireWindowResultClicks() {
  searchResultsEl.querySelectorAll(".search-result[data-real]").forEach(function (el) {
    el.addEventListener("click", function () {
      jumpToResultRow(parseInt(el.dataset.real));
      window.closeModal("searchWindowOverlay");
    });
  });
  searchResultsEl.querySelectorAll(".search-result .reader-link").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  });
}

function showWindowResults(html) {
  searchResultsEl.innerHTML = html;
  searchResultsEl.style.display = "";
  // History stays visible while results show (user preference) — refresh it
  // so the just-written term appears; renderSearchHistory still owns the
  // empty-input placeholder.
  renderHistorySection();
  selectedResultIdx = -1;
  wireWindowResultClicks();
}

// Jump to an absolute (whole-book) result row. Search results are book-wide,
// so leave any active surah/juz filter first — the target row may not be
// inside it. One path for window clicks and keyboard Enter, so every way of
// picking a result behaves identically.
function jumpToResultRow(realIdx) {
  // A stale RDF header filter would show a subset the target row may not be
  // in — clear the box (without re-running its filter) so the full page
  // comes back and the jump lands. The highlight follows the window's query
  // (ctx.setActiveQuery, set by the search that produced this result).
  if (ctx.isRadheefBook && searchInput) searchInput.value = "";
  updateSearchClear();
  ctx.setFilteredData(ctx.allData);
  ctx.rebuildAll();
  setTimeout(function () { ctx.goTo(realIdx); }, 150);
}

// The window search engine — compute over the full book, render count +
// snippets into the window. The page itself is untouched until a result
// jump; ctx.setActiveQuery(q) is what the row renderers highlight by.
function runBookSearch(q) {
  var compiled = compileQuery(parseQueryWithMode(q));
  var tempFiltered = ctx.allData.filter(function (row, ri) {
    return rowMatchesQueryNorm(row, ctx.normAllData[ri], compiled);
  });
  _lastResultCount = tempFiltered.length;

  addSearchHistory(q);
  ctx.setActiveQuery(q);

  var realIdxMap = tempFiltered.map(function(r) { return ctx.allData.indexOf(r); });
  _lastResultSet = tempFiltered;
  _lastRealIdxMap = realIdxMap;
  // The count lives in the window's head row (scope-modal pattern), not in
  // the scrolling results pane — setWindowCount shows it beside the input.
  setWindowCount(t("resultCount") + ": " + formatThousands(tempFiltered.length));
  var html = "";
  if (tempFiltered.length === 0) {
    html +=
      '<div class="search-no-matches">' + t("noMatchesMsg") + ': "' +
      escapeHTML(q) +
      '"</div>';
  } else {
    html += buildAdvResultsHTML(q, tempFiltered, realIdxMap);
  }
  showWindowResults(html);
}

export function applySearch(query) {
  clearTimeout(_searchDebounceTimer); // don't re-run a stale keystroke
  var q = query.trim();
  if (!q) {
    // Full reset — the header-clear / reset path: page back to all rows,
    // highlight off, window back to its history empty state.
    ctx.setActiveQuery("");
    ctx.setFilteredData(ctx.allData);
    ctx.rebuildAll();
    searchResultsEl.innerHTML = "";
    searchResultsEl.style.display = "none";
    selectedResultIdx = -1;
    renderSearchHistory();
    return;
  }

  // RDF dictionaries: the header input filters the table instead of the
  // window — typing narrows the rows in place (full rows, all columns,
  // headers visible) and clearing restores all rows. The window still
  // browses independently via applySearchWindow.
  if (ctx.isRadheefBook) {
    applyRadheefFilter(q);
    return;
  }

  runBookSearch(q);
}

// The window's own entry (history clicks, deep link, open re-run, tab
// switch). Empty input → history empty state; the page stays untouched
// (RDF books: the header filter is independent of the window). The
// window input's debounce lives in the shell (cfg.onInput) — this function
// is only called with a settled value.
export function applySearchWindow(query) {
  var q = query.trim();
  if (!q) {
    if (!ctx.isRadheefBook) ctx.setActiveQuery("");
    // renderSearchHistory owns the empty state: placeholder in the results
    // pane, history section in the side pane.
    selectedResultIdx = -1;
    renderSearchHistory();
    return;
  }
  runBookSearch(q);
}

// RDF dictionaries (ctx.isRadheefBook): the search input filters the table
// in place. Same matcher as the window path (rowMatchesQueryNorm over
// normalized rows), so the hit set is identical — only the presentation
// differs. The scroll counter shows the match count.
function applyRadheefFilter(q) {
  var compiled = compileQuery(parseQueryWithMode(q));
  var matches = [];
  for (var ri = 0; ri < ctx.allData.length; ri++) {
    if (rowMatchesQueryNorm(ctx.allData[ri], ctx.normAllData[ri], compiled)) {
      matches.push(ctx.allData[ri]);
    }
  }
  addSearchHistory(q);
  renderHistorySection();
  ctx.setActiveQuery(q);
  ctx.setFilteredData(matches);
  ctx.rebuildAll();
  if (matches.length === 0) {
    // rebuildAll clears the content area for an empty filter — write the
    // no-matches line in after it (mirrors the window path's empty state).
    readerContent.innerHTML =
      '<div class="empty-state">' + t("noMatchesMsg") + ': "' +
      escapeHTML(q) + '"</div>';
  }
}

// Wrapper around parseQuery to respect whole-word toggle
export function parseQueryWithMode(query) {
  var result = parseQuery(query);
  if (wholeWordMode) {
    result.include.forEach(function (token) { token.wholeWord = true; });
    result.exclude.forEach(function (token) { token.wholeWord = true; });
  }
  return result;
}

// Search history — an always-visible side-pane section (user preference:
// it stays while results show, rather than acting as the empty state).
// Clicking a term fills the input and searches the window; the RDF header
// filter is deliberately not touched by history clicks. Refreshed on every
// history write (showWindowResults, applyRadheefFilter, the shell's
// all-books path via cfg.onHistoryChange) and on item removal/clear.
function renderHistorySection() {
  var searchHistoryItems = getSearchHistory();
  if (searchHistoryItems.length === 0) {
    searchHistoryListEl.innerHTML =
      '<div class="search-window-history-empty">' + t("searchWindowNoHistory") + "</div>";
    return;
  }
  searchHistoryListEl.innerHTML = searchHistoryItems.map(function (term, i) {
    return '<div class="search-history-item" data-idx="' + i + '">' +
      '<span class="hist-text">' + escapeHTML(term) + '</span>' +
      '<span class="hist-remove" data-idx="' + i + '">✕</span></div>';
  }).join("") +
  '<div class="search-history-clear">' + t("searchClearHistory") + '</div>';
  // Wire clicks
  searchHistoryListEl.querySelectorAll(".search-history-item[data-idx]").forEach(function (item) {
    item.addEventListener("click", function (e) {
      if (e.target.classList.contains("hist-remove")) return;
      winInput.value = searchHistoryItems[parseInt(this.dataset.idx)];
      getSearchWindowUI().syncClear();
      applySearchWindow(winInput.value);
    });
  });
  searchHistoryListEl.querySelectorAll(".hist-remove").forEach(function (x) {
    x.addEventListener("click", function (e) {
      e.stopPropagation();
      removeSearchHistoryItem(parseInt(this.dataset.idx));
      renderHistorySection();
    });
  });
  // Clear-all button
  var clearAll = searchHistoryListEl.querySelector(".search-history-clear");
  if (clearAll) clearAll.addEventListener("click", function () {
    clearSearchHistory();
    renderHistorySection();
  });
}

// The empty-input state: a quiet placeholder in the results pane; the
// history section refreshes alongside (it is not gated on the empty state).
function renderSearchHistory() {
  setWindowCount(""); // no query → nothing to count; the head row clears
  searchResultsEl.innerHTML =
    '<div class="search-window-empty">' + t("searchWindowEmptyHint") + "</div>";
  searchResultsEl.style.display = "";
  renderHistorySection();
}

// Search-results navigation (when the window input is focused). Escape is
// handled by the unified modal layer in common.js — closing the window is
// its job, so there is no Escape branch here anymore.
function onSearchKeydown(e) {
  if (document.activeElement !== winInput) return;
  var items = searchResultsEl.querySelectorAll(
    ".search-result[data-real]",
  );
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    if (items.length === 0) return;
    if (e.key === "ArrowDown")
      selectedResultIdx = Math.min(
        selectedResultIdx + 1,
        items.length - 1,
      );
    else selectedResultIdx = Math.max(selectedResultIdx - 1, 0);
    items.forEach(function (el, i) {
      el.classList.toggle("active", i === selectedResultIdx);
    });
    if (selectedResultIdx >= 0)
      items[selectedResultIdx].scrollIntoView({ block: "nearest" });
    return;
  }
  if (
    e.key === "Enter" &&
    selectedResultIdx >= 0 &&
    items[selectedResultIdx]
  ) {
    e.preventDefault();
    jumpToResultRow(parseInt(items[selectedResultIdx].dataset.real));
    window.closeModal("searchWindowOverlay");
    return;
  }
}

// Advanced-search column list — visible columns only. The dropdown
// mirrors the table: hidden columns (per-book hiddenColumns) are not
// searchable, and the columns toggle is the single source of truth for
// what you can search — unhide a column and it appears here on the next
// window open. If every column is hidden the dropdown would be empty, so
// that pathological case falls back to the full list.
function visibleColumnIndices() {
  var hidden = ctx.getHiddenColumns();
  var out = [];
  for (var i = 0; i < ctx.maxCols; i++) {
    if (hidden.indexOf(i) === -1) out.push(i);
  }
  if (out.length === 0) {
    for (var j = 0; j < ctx.maxCols; j++) out.push(j);
  }
  return out;
}
// The default condition column: the first visible column with real
// content. Structural flags (basmalah, -hdn auto-hidden headers) are
// skipped so a fresh condition lands on the text column users mean —
// e.g. the imlai column in the Quran book, not the juz counter.
function defaultColumnIndex(cols) {
  for (var i = 0; i < cols.length; i++) {
    var label = (ctx.colLabel(cols[i]) || "").toLowerCase();
    if (label === "basmalah" || label.endsWith("-hdn")) continue;
    return cols[i];
  }
  return cols[0];
}

function renderConditionRow(condition, idx) {
  var cols = visibleColumnIndices();
  // A condition saved from an earlier open may point at a column that is
  // hidden now — clamp it so the select and the search agree.
  if (cols.indexOf(condition.col) === -1) condition.col = defaultColumnIndex(cols);
  var colOpts = "";
  for (var i = 0; i < cols.length; i++) {
    var ci = cols[i];
    colOpts += '<option value="' + ci + '"' + (condition.col === ci ? ' selected' : '') + '>' + ctx.columnLabel(ci) + '</option>';
  }
  var opOpts = "";
  OPERATORS.forEach(function(op) {
    opOpts += '<option value="' + op.id + '"' + (condition.op === op.id ? ' selected' : '') + '>' + t("cond" + op.id.charAt(0).toUpperCase() + op.id.slice(1)) + '</option>';
  });
  var needVal = OPERATORS.find(function(o){return o.id===condition.op;});
  var valDisplay = (needVal && needVal.needsValue === false) ? 'style="display:none"' : '';
  var logicHTML = idx === 0 ? '' : '<select class="adv-logic-select" data-idx="' + idx + '" data-field="logic" title="Combine with previous condition"><option value="AND"' + (condition.logic==='AND'?' selected':'') + '>' + t("advancedLogicAND") + '</option><option value="OR"' + (condition.logic==='OR'?' selected':'') + '>' + t("advancedLogicOR") + '</option></select>';
  return '<div class="advanced-search-row" data-idx="' + idx + '">' +
    logicHTML +
    '<select data-field="col" title="Column to search in">' + colOpts + '</select>' +
    '<select data-field="op" title="Match type">' + opOpts + '</select>' +
    '<input data-field="val" value="' + escapeHTML(condition.val || "") + '" placeholder="' + t("advancedValue") + '" title="Text to search for" autocomplete="off" ' + valDisplay + ' />' +
    '<button class="advanced-remove-btn" data-i18n="advancedRemove" title="Remove this condition">✕</button>' +
    '</div>';
}

function addCondition() {
  advConditions.push({ col: defaultColumnIndex(visibleColumnIndices()), op: "contains", val: "", logic: "AND" });
  renderAdvancedSearch();
}
function removeCondition(idx) {
  advConditions.splice(idx, 1);
  renderAdvancedSearch();
}
export function renderAdvancedSearch() {
  if (advConditions.length === 0) addCondition();
  advSearchRows.innerHTML = advConditions.map(function(c, i) { return renderConditionRow(c, i); }).join("");
  // Wire events
  advSearchRows.querySelectorAll(".advanced-search-row").forEach(function(row) {
    var idx = parseInt(row.dataset.idx);
    row.querySelector("select[data-field=col]").addEventListener("change", function(){ advConditions[idx].col = parseInt(this.value); });
    row.querySelector("select[data-field=op]").addEventListener("change", function(){
      advConditions[idx].op = this.value;
      var opVal = this.value;
      var needVal = OPERATORS.find(function(o){return o.id===opVal;});
      var input = row.querySelector("input[data-field=val]");
      input.style.display = (needVal && needVal.needsValue === false) ? "none" : "";
    });
    row.querySelector("input[data-field=val]").addEventListener("input", function(){ advConditions[idx].val = this.value; });
    row.querySelector("select[data-field=logic]") && row.querySelector("select[data-field=logic]").addEventListener("change", function(){ advConditions[idx].logic = this.value; });
    row.querySelector(".advanced-remove-btn").addEventListener("click", function(){ removeCondition(idx); });
  });
}

function applyAdvancedSearch() {
  var rows = ctx.allData; // always filter against full data
  // Normalise each condition's value once — not once per row
  var normQs = advConditions.map(function (c) { return normaliseForSearch(c.val || ""); });
  var result = rows.filter(function(row, ri) {
    var normRow = ctx.normAllData[ri];
    // Evaluate all conditions with AND/OR logic
    var matches = advConditions.map(function(c, ci) {
      var ncell = (normRow && normRow[c.col] != null) ? normRow[c.col] : "";
      var op = OPERATORS.find(function(o){return o.id===c.op;});
      if (!op) return true;
      if (op.needsValue === false) return op.fn(ncell);
      return op.fn(ncell, normQs[ci]);
    });
    // Combine: first condition sets the baseline, subsequent use logic
    var result = matches[0];
    for (var i = 1; i < matches.length; i++) {
      if (advConditions[i].logic === "AND") result = result && matches[i];
      else result = result || matches[i];
    }
    return result;
  });
  // Results render in the window; clicking jumps to the row in the full
  // dataset (the window closes on jump).
  var tempFiltered = result;
  var q = advConditions.length > 0 ? (advConditions[0].val || "") : "";
  winInput.value = q;
  getSearchWindowUI().syncClear();
  ctx.setActiveQuery(q);
  _lastResultCount = tempFiltered.length;
  var realIdxMap = tempFiltered.map(function(r) { return ctx.allData.indexOf(r); });
  _lastResultSet = tempFiltered;
  _lastRealIdxMap = realIdxMap;
  setWindowCount(t("resultCount") + ": " + formatThousands(tempFiltered.length));
  var html = "";
  if (tempFiltered.length === 0) {
    html += '<div class="search-no-matches">' + t("noMatchesMsg") + "</div>";
  } else {
    var resHTML = q ? buildAdvResultsHTML(q, tempFiltered, realIdxMap) : "";
    if (!resHTML) {
      // No queryable first condition — fall back to the first content cell
      var limit = Math.min(tempFiltered.length, 30);
      for (var i = 0; i < limit; i++) {
        var row = tempFiltered[i];
        var rowNum = row[0] || (realIdxMap[i] + 1);
        var snip = linkifyURLs(escapeHTML(String(row[1] || row[0] || "").slice(0, 120)));
        resHTML += '<div class="search-result" data-real="' + realIdxMap[i] + '"><span class="search-result-num">#' + formatThousands(rowNum) + '</span><span class="search-result-snippet">' + snip + '</span></div>';
      }
    }
    html += resHTML;
  }
  showWindowResults(html);
}

// Window open with text → re-run the query against the active tab (the
// page behind may have changed since the last run); empty → history empty
// state.
function onWindowOpen() {
  var v = winInput.value.trim();
  if (!v) { renderSearchHistory(); return; }
  if (getCurrentTab() === "allBooks") searchAllBooks(v);
  else applySearchWindow(v);
}

// Window input routing — the shell debounces every change and hands the
// settled value here; the active tab decides the target: this-book search
// over the current book, all-books over the shared cross-book index.
function onWindowInput(value) {
  var q = value.trim();
  if (!q) { applySearchWindow(""); return; }
  if (getCurrentTab() === "allBooks") searchAllBooks(value);
  else applySearchWindow(value);
}

// Tab switch — re-run the current query against the tab's target. An empty
// query falls back to the history empty state either way.
function onWindowTabChange() {
  var v = winInput.value;
  if (!v.trim()) { applySearchWindow(""); return; }
  if (getCurrentTab() === "allBooks") searchAllBooks(v);
  else applySearchWindow(v);
}

// Wires all search UI into the window shell. Called from reader.js once,
// after the book data is loaded.
export function initSearchUI(initCtx) {
  ctx = initCtx;
  var ui = initSearchWindow({
    mode: "reader",
    tabs: true, // this-book + all-books (cross-book search index)
    onOpen: onWindowOpen,
    onOpenAdvanced: renderAdvancedSearch,
    onInput: onWindowInput,
    onTabChange: onWindowTabChange,
    onHistoryChange: renderHistorySection, // shell's all-books path writes history
    // Head-row reset: the shell clears input/tab/advanced and fires this —
    // the page restores its own search state (whole-word flag, conditions).
    // The input event has already re-run the pipeline with an empty query,
    // so the window is back on its history empty state when this runs.
    onReset: function () {
      wholeWordMode = false;
      btnWholeWord.classList.remove("active");
      advConditions = [];
      renderAdvancedSearch();
    },
  });
  searchInput = document.getElementById("readerSearchInput");
  winInput = ui.input;
  searchResultsEl = ui.results;
  searchHistoryListEl = ui.historyList;
  btnWholeWord = ui.wholeWord;
  advSearchRows = ui.advRows;
  advAdd = ui.advAdd;
  advApply = ui.advApply;
  advReset = ui.advReset;
  readerContent = document.getElementById("readerContent");
  searchClearBtn = document.getElementById("readerSearchClear");

  // Magnifier button — opens the search window for every book. RDF books
  // keep the header filter *and* the window; other books have only the
  // window (the keyboard paths live in reader.js).
  var btnSearchWindow = document.getElementById("btnSearchWindow");
  if (btnSearchWindow) btnSearchWindow.addEventListener("click", function () {
    openSearchWindow();
  });

  // Whole-word toggle — re-runs whichever surface holds a live query.
  btnWholeWord.addEventListener("click", function () {
    wholeWordMode = !wholeWordMode;
    btnWholeWord.classList.toggle("active", wholeWordMode);
    if (winInput.value.trim()) applySearchWindow(winInput.value);
    else if (searchInput.value.trim()) applySearch(searchInput.value); // RDF header filter
  });

  // Header input — RDF books only (reader.js hides the wrap for every
  // other book). In-place table filter, one full scan per pause in typing.
  searchInput.addEventListener("input", function () {
    clearTimeout(_searchDebounceTimer);
    var val = this.value;
    updateSearchClear();
    _searchDebounceTimer = setTimeout(function () { applySearch(val); }, 120);
  });
  // Clear-search button — visible while the box has text; clears the
  // filter and resets the reader view on click.
  searchClearBtn.addEventListener("click", function () {
    searchInput.value = "";
    updateSearchClear();
    applySearch("");
    searchInput.focus();
  });

  // The window input is shell-owned (debounce + syncClear); cfg.onInput
  // receives settled values — no listener here.

  // Search-results arrow navigation (when the window input is focused)
  document.addEventListener("keydown", onSearchKeydown);

  // Advanced search wiring — the buttons live in the window shell.
  advAdd.addEventListener("click", addCondition);
  advApply.addEventListener("click", applyAdvancedSearch);
  advReset.addEventListener("click", function () {
    advConditions = [];
    renderAdvancedSearch();
  });
}
