/**
 * Reader Search UI Module
 *
 * Extracted from reader.js to keep the main module under 2 000 lines.
 * The in-book search hub: results rendering (buildSnippets /
 * buildResultsHTML / buildAdvResultsHTML / updateSearchResults),
 * applySearch, the whole-word toggle, the history dropdown, the
 * advanced-search modal (OPERATORS, advConditions, condition rows,
 * applyAdvancedSearch) and the search-results arrow navigation
 * (keydown handling while the search input is focused). reader.js owns
 * the state — ctx passes values, accessors and callbacks; the global
 * keyboard dispatcher, reset block and ?q= deep link stay in core.
 */

import { parseQuery, compileQuery, rowMatchesQueryNorm, highlightMatches, buildSnippets as buildSnippetsFromSearch, escapeHTML, linkifyURLs, addSearchHistory, getSearchHistory, removeSearchHistoryItem, clearSearchHistory, normaliseForSearch } from "./search-utils.js";
import { t } from "./i18n.js";
import { updatePagination } from "./reader-position.js";

// Module-scope state — set by initSearchUI, read by the exported
// applySearch / renderAdvancedSearch / parseQueryWithMode (same pattern
// as quranState in quran-ui.js).
var ctx = null;
var searchInput = null;
var searchResultsEl = null;
var readerResultCount = null;
var searchHistoryEl = null;
var btnWholeWord = null;
var btnAdvancedSearch = null;
var advSearchOverlay = null;
var advSearchRows = null;
var readerContent = null;

let selectedResultIdx = -1; // index within searchResultsEl DOM children
var wholeWordMode = false;
var _searchDebounceTimer = null;
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
      html += '<div class="search-result" data-real="' + realIdxMap[i] + '"><span class="search-result-num">#' + rowNum + '</span><span class="search-result-snippet">' + snippets[s] + '</span></div>';
      count++;
    }
  }
  return linkifyURLs(html);
}

function buildResultsHTML(query) {
  const MAX = 50;
  const q = query.trim();
  const filteredData = ctx.getFilteredData();
  if (!q || filteredData.length === 0) return "";
  // Compile once for the whole result set — not once per row
  var compiled = parseQueryWithMode(q);
  let html = "";
  let count = 0;
  for (let i = 0; i < filteredData.length && count < MAX; i++) {
    const row = filteredData[i];
    const rowNum = row[0] || ctx.allData.indexOf(row) + 1;
    // filteredData is allData normally, but the Quran surah filter
    // swaps in a subset — index alignment only holds for allData.
    var normRow = filteredData === ctx.allData ? ctx.normAllData[i] : ctx.normAllData[ctx.allData.indexOf(row)];
    var snippets = buildSnippets(row, q, compiled, normRow);
    for (var s = 0; s < snippets.length && count < MAX; s++) {
      html +=
        '<div class="search-result" data-idx="' +
        i +
        '">' +
        '<span class="search-result-num">#' +
        rowNum +
        "</span>" +
        '<span class="search-result-snippet">' +
        snippets[s] +
        "</span>" +
        "</div>";
      count++;
    }
  }
  if (count >= MAX && count < filteredData.length) {
    html +=
      '<div class="search-result" style="color:var(--color-text-subtle);cursor:default">' +
      t("andMore") +
      "</div>";
  }
  return linkifyURLs(html);
}

function updateSearchResults(query) {
  searchResultsEl.innerHTML = buildResultsHTML(query);
  searchResultsEl.style.display =
    query.trim() && ctx.getFilteredData().length > 0 ? "" : "none";
  selectedResultIdx = -1;
  // Wire clicks
  searchResultsEl
    .querySelectorAll(".search-result[data-idx]")
    .forEach(function (el) {
      el.addEventListener("click", function () {
        ctx.goTo(parseInt(this.dataset.idx));
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

export function applySearch(query) {
  clearTimeout(_searchDebounceTimer); // don't re-run a stale keystroke
  var q = query.trim();
  if (!q) {
    ctx.setFilteredData(ctx.allData);
    readerResultCount.style.display = "none";
    searchResultsEl.style.display = "none";
    ctx.rebuildAll();
    return;
  }

  var compiled = compileQuery(parseQueryWithMode(q));
  var tempFiltered = ctx.allData.filter(function (row, ri) {
    return rowMatchesQueryNorm(row, ctx.normAllData[ri], compiled);
  });

  addSearchHistory(q);
  readerResultCount.style.display = "";
  readerResultCount.textContent =
    tempFiltered.length === 0
      ? t("noResults")
      : t("resultCount") + ": " + tempFiltered.length;
  if (tempFiltered.length === 0) {
    readerContent.innerHTML =
      '<div class="empty-state">' + t("noMatchesMsg") + ': "' +
      query +
      '"</div>';
    searchResultsEl.style.display = "none";
      ctx.setLoadedStart(-1);
      ctx.setLoadedEnd(-1);
      updatePagination();
    } else {
      // Show results without filtering — clicking jumps to real row
      var realIdxMap = tempFiltered.map(function(r) { return ctx.allData.indexOf(r); });
      searchResultsEl.innerHTML = buildAdvResultsHTML(query, tempFiltered, realIdxMap);
      searchResultsEl.style.display = "";
      selectedResultIdx = -1;
      searchResultsEl.querySelectorAll(".search-result[data-real]").forEach(function (el) {
        el.addEventListener("click", function () {
          ctx.setFilteredData(ctx.allData);
          searchInput.value = query;
          ctx.rebuildAll();
          setTimeout(function () { ctx.goTo(parseInt(el.dataset.real)); }, 150);
          searchInput.blur();
        });
      });
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
      searchInput.value = searchHistoryItems[parseInt(this.dataset.idx)];
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
    ".search-result[data-idx]",
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
    ctx.goTo(parseInt(items[selectedResultIdx].dataset.idx));
    searchInput.blur();
    return;
  }
  if (e.key === "Escape") {
    searchResultsEl.style.display = "none";
    selectedResultIdx = -1;
    return;
  }
}

function renderConditionRow(condition, idx) {
  var colOpts = "";
  for (var i = 0; i < ctx.maxCols; i++) {
    colOpts += '<option value="' + i + '"' + (condition.col === i ? ' selected' : '') + '>' + ctx.colLabel(i) + '</option>';
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
    '<input data-field="val" value="' + (condition.val||'') + '" placeholder="' + t("advancedValue") + '" title="Text to search for" ' + valDisplay + ' />' +
    '<button class="advanced-remove-btn" data-i18n="advancedRemove" title="Remove this condition">✕</button>' +
    '</div>';
}

function addCondition() {
  advConditions.push({ col: 0, op: "contains", val: "", logic: "AND" });
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
    readerResultCount.style.display = "";
    readerResultCount.textContent = t("noResults");
    readerContent.innerHTML = '<div class="empty-state">' + t("noMatchesMsg") + '</div>';
    ctx.setLoadedStart(-1);
    ctx.setLoadedEnd(-1);
    updatePagination();
  } else {
    readerResultCount.style.display = "";
    readerResultCount.textContent = t("resultCount") + ": " + tempFiltered.length;
    var realIdxMap = tempFiltered.map(function(r) { return ctx.allData.indexOf(r); });
    var q = advConditions.length > 0 ? advConditions[0].val : "";
    var resHTML = q ? buildAdvResultsHTML(q, tempFiltered, realIdxMap) : "";
    if (!resHTML) {
      var limit = Math.min(tempFiltered.length, 30);
      for (var i = 0; i < limit; i++) {
        var row = tempFiltered[i];
        var rowNum = row[0] || (realIdxMap[i] + 1);
        var snip = linkifyURLs(escapeHTML(String(row[1] || row[0] || "").slice(0, 120)));
        resHTML += '<div class="search-result" data-real="' + realIdxMap[i] + '"><span class="search-result-num">#' + rowNum + '</span><span class="search-result-snippet">' + snip + '</span></div>';
      }
    }
    readerContent.innerHTML = '<div class="search-results" style="display:block;max-height:none;position:static;margin-bottom:16px">' + resHTML + '</div>';
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
  readerResultCount = document.getElementById("readerResultCount");
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
    else searchResultsEl.style.display = "";
  });
  // Debounce: one full scan per pause in typing, not one per keystroke.
  // applySearch() clears any pending timer, so explicit applies (history
  // click, whole-word toggle) can't be raced by a stale one.
  searchInput.addEventListener("input", function () {
    searchHistoryEl.style.display = "none";
    clearTimeout(_searchDebounceTimer);
    var val = this.value;
    _searchDebounceTimer = setTimeout(function () { applySearch(val); }, 120);
  });
  // Close results when clicking outside
  document.addEventListener("click", function (e) {
    if (btnWholeWord.contains(e.target) || btnAdvancedSearch.contains(e.target)) return;
    if (!searchResultsEl.contains(e.target) && e.target !== searchInput) {
      searchResultsEl.style.display = "none";
    }
  });
  // Re-open when focusing search with an active query
  searchInput.addEventListener("focus", function () {
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
