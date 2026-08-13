/**
 * Reader Search UI Module
 *
 * Extracted from reader.js to keep the main module under 2 000 lines.
 * The in-book search hub: results rendering (buildSnippets /
 * buildAdvResultsHTML / updateSearchResults),
 * applySearch, the whole-word toggle, the history dropdown, the
 * advanced-search modal (OPERATORS, advConditions, condition rows,
 * applyAdvancedSearch) and the search-results arrow navigation
 * (keydown handling while the search input is focused). reader.js owns
 * the state — ctx passes values, accessors and callbacks; the global
 * keyboard dispatcher, reset block and ?q= deep link stay in core.
 */

import { parseQuery, compileQuery, rowMatchesQueryNorm, highlightMatches, buildSnippets as buildSnippetsFromSearch, escapeHTML, linkifyURLs, addSearchHistory, getSearchHistory, removeSearchHistoryItem, clearSearchHistory, normaliseForSearch, formatThousands } from "./search-utils.js";
import { t } from "./i18n.js";
import { updatePagination } from "./reader-position.js";

// Module-scope state — set by initSearchUI, read by the exported
// applySearch / renderAdvancedSearch / parseQueryWithMode (same pattern
// as quranState in quran-ui.js).
var ctx = null;
var searchInput = null;
var searchResultsEl = null;
var searchHistoryEl = null;
var btnWholeWord = null;
var btnAdvancedSearch = null;
var advSearchOverlay = null;
var advSearchRows = null;
var readerContent = null;
var searchClearBtn = null;

// Visible while the box has text. Module scope so every caller can reach it:
// the input listener and clear button (inside initSearchUI) and the history
// item-click (inside renderSearchHistory) — a nested declaration there would
// be out of scope for the item click and throw.
function updateSearchClear() {
  if (searchClearBtn) searchClearBtn.classList.toggle("visible", !!searchInput.value);
}

let selectedResultIdx = -1; // index within searchResultsEl DOM children
var wholeWordMode = false;
var _searchDebounceTimer = null;
// True match count from the last applySearch — the count header in the
// results dropdown renders from this (the dropdown is where the count
// lives now that the row span is gone).
var _lastResultCount = 0;
// The last result set and its whole-book (absolute) row map, cached by
// applySearch. The focus re-render (updateSearchResults) draws from this,
// so both dropdown paths show the same book-wide list — one renderer
// (buildAdvResultsHTML + data-real) for both, nothing to drift apart.
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

function updateSearchResults(query) {
  // RDF dictionaries never show the dropdown — the input filters the table.
  if (ctx.isRadheefBook) return;
  var q = query.trim();
  var html = "";
  if (q) {
    // Count header first — the dropdown is the single home of the result
    // count. _lastResultCount mirrors the last applySearch; the input
    // value is unchanged here (any edit re-applies within the debounce).
    html =
      '<div class="search-count-header">' +
      t("resultCount") +
      ": " +
      formatThousands(_lastResultCount) +
      "</div>";
    if (_lastResultCount === 0) {
      html +=
        '<div class="search-no-matches">' +
        t("noMatchesMsg") +
        ': "' +
        escapeHTML(q) +
        '"</div>';
    } else {
      html += buildAdvResultsHTML(query, _lastResultSet, _lastRealIdxMap);
    }
  }
  searchResultsEl.innerHTML = html;
  searchResultsEl.style.display = q ? "" : "none";
  selectedResultIdx = -1;
  // Wire clicks — same absolute-row jump as applySearch's dropdown
  searchResultsEl
    .querySelectorAll(".search-result[data-real]")
    .forEach(function (el) {
      el.addEventListener("click", function () {
        jumpToResultRow(parseInt(el.dataset.real));
        searchInput.blur();
      });
    });
  // URLs in snippets are links — let them open instead of jumping to the row
  searchResultsEl.querySelectorAll(".search-result .reader-link").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  });
}

// Jump to an absolute (whole-book) result row. Search results are book-wide,
// so leave any active surah/juz filter first — the target row may not be
// inside it. One path for dropdown clicks, the focus re-render and keyboard
// Enter, so every way of picking a result behaves identically.
function jumpToResultRow(realIdx) {
  ctx.setFilteredData(ctx.allData);
  ctx.rebuildAll();
  setTimeout(function () { ctx.goTo(realIdx); }, 150);
}

export function applySearch(query) {
  clearTimeout(_searchDebounceTimer); // don't re-run a stale keystroke
  var q = query.trim();
  if (!q) {
    ctx.setFilteredData(ctx.allData);
    searchResultsEl.style.display = "none";
    ctx.rebuildAll();
    return;
  }

  // RDF dictionaries: filter the table instead of showing the dropdown —
  // typing narrows the rows in place (full rows, all columns, headers
  // visible) and clearing restores all rows. See applyRadheefFilter.
  if (ctx.isRadheefBook) {
    applyRadheefFilter(q);
    return;
  }

  var compiled = compileQuery(parseQueryWithMode(q));
  var tempFiltered = ctx.allData.filter(function (row, ri) {
    return rowMatchesQueryNorm(row, ctx.normAllData[ri], compiled);
  });
  _lastResultCount = tempFiltered.length;

  addSearchHistory(q);
  if (tempFiltered.length === 0) {
    // The count lives in the dropdown now — show it even for zero hits,
    // with a no-matches line under the header. The content empty-state
    // stays as the persistent "nothing here" indicator.
    searchResultsEl.innerHTML =
      '<div class="search-count-header">' + t("resultCount") + ": 0</div>" +
      '<div class="search-no-matches">' + t("noMatchesMsg") + ': "' +
      escapeHTML(query) +
      '"</div>';
    searchResultsEl.style.display = "";
    selectedResultIdx = -1;
    readerContent.innerHTML =
      '<div class="empty-state">' + t("noMatchesMsg") + ': "' +
      escapeHTML(query) +
      '"</div>';
      ctx.setLoadedStart(-1);
      ctx.setLoadedEnd(-1);
      updatePagination();
    } else {
      // Show results without filtering — clicking jumps to real row
      var realIdxMap = tempFiltered.map(function(r) { return ctx.allData.indexOf(r); });
      _lastResultSet = tempFiltered;
      _lastRealIdxMap = realIdxMap;
      searchResultsEl.innerHTML =
        '<div class="search-count-header">' + t("resultCount") + ": " +
        formatThousands(tempFiltered.length) +
        "</div>" +
        buildAdvResultsHTML(query, tempFiltered, realIdxMap);
      searchResultsEl.style.display = "";
      selectedResultIdx = -1;
      searchResultsEl.querySelectorAll(".search-result[data-real]").forEach(function (el) {
        el.addEventListener("click", function () {
          jumpToResultRow(parseInt(el.dataset.real));
          searchInput.blur();
        });
      });
    }
  }

// RDF dictionaries (ctx.isRadheefBook): the search input filters the table
// instead of opening the results dropdown. Same matcher as the dropdown
// path (rowMatchesQueryNorm over normalized rows), so the hit set is
// identical — only the presentation differs. The dropdown stays hidden
// throughout; the scroll counter shows the match count.
function applyRadheefFilter(q) {
  var compiled = compileQuery(parseQueryWithMode(q));
  var matches = [];
  for (var ri = 0; ri < ctx.allData.length; ri++) {
    if (rowMatchesQueryNorm(ctx.allData[ri], ctx.normAllData[ri], compiled)) {
      matches.push(ctx.allData[ri]);
    }
  }
  addSearchHistory(q);
  searchResultsEl.style.display = "none";
  ctx.setFilteredData(matches);
  ctx.rebuildAll();
  if (matches.length === 0) {
    // rebuildAll clears the content area for an empty filter — write the
    // no-matches line in after it (mirrors the dropdown path's empty state).
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

// Search history dropdown
function renderSearchHistory() {
  var searchHistoryItems = getSearchHistory();
  if (searchHistoryItems.length === 0) {
    searchHistoryEl.style.display = "none";
    return;
  }
  // Position below the search bar, full width
  window.openDropdown(searchHistoryEl, searchInput, 0);
  var sbRect = searchInput.getBoundingClientRect();
  searchHistoryEl.style.right = (window.innerWidth - sbRect.right) + "px";
  searchHistoryEl.innerHTML = searchHistoryItems.map(function (term, i) {
    return '<div class="search-history-item" data-idx="' + i + '">' +
      '<span class="hist-text">' + escapeHTML(term) + '</span>' +
      '<span class="hist-remove" data-idx="' + i + '">✕</span></div>';
  }).join("") +
  '<div class="search-history-clear">' + t("searchClearHistory") + '</div>';
  searchHistoryEl.style.display = "";
  // Wire clicks
  searchHistoryEl.querySelectorAll(".search-history-item[data-idx]").forEach(function (item) {
    item.addEventListener("click", function (e) {
      if (e.target.classList.contains("hist-remove")) return;
      // Without this the same click bubbles to the outside-click handler and
      // closes the results dropdown that applySearch just opened.
      e.stopPropagation();
      searchInput.value = searchHistoryItems[parseInt(this.dataset.idx)];
      updateSearchClear();
      applySearch(searchInput.value);
      searchHistoryEl.style.display = "none";
    });
  });
  searchHistoryEl.querySelectorAll(".hist-remove").forEach(function (x) {
    x.addEventListener("click", function (e) {
      e.stopPropagation();
      removeSearchHistoryItem(parseInt(this.dataset.idx));
      renderSearchHistory();
    });
  });
  // Clear-all button
  var clearAll = searchHistoryEl.querySelector(".search-history-clear");
  if (clearAll) clearAll.addEventListener("click", function () {
    clearSearchHistory();
    searchHistoryEl.style.display = "none";
  });
}

// Search-results navigation (when search input is focused)
function onSearchKeydown(e) {
  if (document.activeElement !== searchInput) return;
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
    searchInput.blur();
    return;
  }
  if (e.key === "Escape") {
    searchResultsEl.style.display = "none";
    searchHistoryEl.style.display = "none";
    selectedResultIdx = -1;
    return;
  }
}

// Advanced-search column list — visible columns only. The dropdown
// mirrors the table: hidden columns (per-book hiddenColumns) are not
// searchable, and the columns toggle is the single source of truth for
// what you can search — unhide a column and it appears here on the next
// modal open. If every column is hidden the dropdown would be empty, so
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
  // Show results inline — clicking jumps to row in full dataset
  var tempFiltered = result;
  advSearchOverlay.classList.remove("open");
  if (tempFiltered.length === 0) {
    readerContent.innerHTML = '<div class="empty-state">' + t("noMatchesMsg") + '</div>';
    ctx.setLoadedStart(-1);
    ctx.setLoadedEnd(-1);
    updatePagination();
  } else {
    var realIdxMap = tempFiltered.map(function(r) { return ctx.allData.indexOf(r); });
    var q = advConditions.length > 0 ? advConditions[0].val : "";
    var resHTML = q ? buildAdvResultsHTML(q, tempFiltered, realIdxMap) : "";
    if (!resHTML) {
      var limit = Math.min(tempFiltered.length, 30);
      for (var i = 0; i < limit; i++) {
        var row = tempFiltered[i];
        var rowNum = row[0] || (realIdxMap[i] + 1);
        var snip = linkifyURLs(escapeHTML(String(row[1] || row[0] || "").slice(0, 120)));
        resHTML += '<div class="search-result" data-real="' + realIdxMap[i] + '"><span class="search-result-num">#' + formatThousands(rowNum) + '</span><span class="search-result-snippet">' + snip + '</span></div>';
      }
    }
    // Count line at the top of the inline block — the search-row span is
    // gone, so this is where the advanced search shows its total.
    readerContent.innerHTML = '<div class="search-results" style="display:block;max-height:none;position:static;margin-bottom:16px">' + '<div class="search-count-header">' + t("resultCount") + ": " + formatThousands(tempFiltered.length) + '</div>' + resHTML + '</div>';
    ctx.setLoadedStart(-1);
    ctx.setLoadedEnd(-1);
    updatePagination();
    var resultEls = readerContent.querySelectorAll(".search-result[data-real]");
    // URLs in snippets are links — let them open instead of jumping to the row
    readerContent.querySelectorAll(".search-result .reader-link").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    });
    resultEls.forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.stopPropagation();
        var targetRow = parseInt(el.dataset.real);
        var sq = advConditions.length > 0 ? (advConditions[0].val || "") : "";
        searchInput.value = sq;
        ctx.setFilteredData(ctx.allData);
        ctx.loadInitial();
        ctx.observeSentinels();
        setTimeout(function () { ctx.goTo(targetRow); }, 150);
        searchInput.blur();
      });
    });
  }
}

// Wires all search UI. Called from reader.js once, before the toolbar
// and keyboard-shortcut wiring, at the point where the old inline search
// block ran.
export function initSearchUI(initCtx) {
  ctx = initCtx;
  searchInput = document.getElementById("readerSearchInput");
  searchResultsEl = document.getElementById("searchResultsDropdown");
  searchHistoryEl = document.getElementById("searchHistoryDropdown");
  btnWholeWord = document.getElementById("btnWholeWord");
  btnAdvancedSearch = document.getElementById("btnAdvancedSearch");
  advSearchOverlay = document.getElementById("advancedSearchOverlay");
  advSearchRows = document.getElementById("advancedSearchRows");
  readerContent = document.getElementById("readerContent");

  btnWholeWord.style.display = "";
  btnWholeWord.addEventListener("click", function () {
    wholeWordMode = !wholeWordMode;
    btnWholeWord.classList.toggle("active", wholeWordMode);
    if (searchInput.value.trim()) applySearch(searchInput.value);
  });

  searchInput.addEventListener("focus", function () {
    if (!this.value.trim()) renderSearchHistory();
    else if (!ctx.isRadheefBook) searchResultsEl.style.display = "";
  });
  // Clicking an already-focused box fires no focus event — re-trigger here so
  // the history dropdown also opens on a plain click of the empty input.
  searchInput.addEventListener("click", function () {
    if (!this.value.trim()) renderSearchHistory();
  });
  // Clear-search button — visible while the box has text; clears the search
  // and resets the reader view on click (replaces the native browser X).
  searchClearBtn = document.getElementById("readerSearchClear");
  if (searchClearBtn) searchClearBtn.addEventListener("click", function () {
    searchInput.value = "";
    updateSearchClear();
    applySearch("");
    searchInput.focus();
  });
  // Debounce: one full scan per pause in typing, not one per keystroke.
  // applySearch() clears any pending timer, so explicit applies (history
  // click, whole-word toggle) can't be raced by a stale one.
  searchInput.addEventListener("input", function () {
    searchHistoryEl.style.display = "none";
    clearTimeout(_searchDebounceTimer);
    var val = this.value;
    updateSearchClear();
    _searchDebounceTimer = setTimeout(function () { applySearch(val); }, 120);
  });
  // Close results when clicking outside
  document.addEventListener("click", function (e) {
    if (btnWholeWord.contains(e.target) || btnAdvancedSearch.contains(e.target)) return;
    if (!searchResultsEl.contains(e.target) && e.target !== searchInput) {
      searchResultsEl.style.display = "none";
    }
  });
  // Search-history dropdown — outside-click-to-close, same as the library
  // and dashboard pages. (The results dropdown above keeps its own narrower
  // handler: the whole-word / advanced buttons re-run the search and must
  // not close it; history has no such reopen path, so the shared helper fits.)
  window.registerDropdown("searchHistoryDropdown", searchHistoryEl, searchInput);
  // Re-open when focusing search with an active query
  searchInput.addEventListener("focus", function () {
    if (ctx.isRadheefBook) return; // filtered table — no dropdown to re-open
    if (this.value.trim() && ctx.getFilteredData().length > 0) {
      updateSearchResults(this.value);
    }
  });

  // Search-results arrow navigation (when the search input is focused)
  document.addEventListener("keydown", onSearchKeydown);

  // Advanced search modal wiring
  document.getElementById("btnAdvancedSearch").addEventListener("click", function () {
    renderAdvancedSearch();
    advSearchOverlay.classList.add("open");
  });
  document.getElementById("advancedSearchClose").addEventListener("click", function () {
    advSearchOverlay.classList.remove("open");
  });
  advSearchOverlay.addEventListener("click", function (e) { if (e.target === advSearchOverlay) advSearchOverlay.classList.remove("open"); });
  document.getElementById("btnAddCondition").addEventListener("click", addCondition);
  document.getElementById("btnApplyAdvancedSearch").addEventListener("click", applyAdvancedSearch);
  document.getElementById("btnClearAdvancedSearch").addEventListener("click", function () {
    advConditions = [];
    renderAdvancedSearch();
  });
}
