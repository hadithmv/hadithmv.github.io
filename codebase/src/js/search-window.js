/**
 * Search Window Module
 *
 * The one modal search window shared by the reader and the library-search
 * page. Builds its DOM on the unified modal layer (common.js createModal —
 * Tab trap, Escape, backdrop, focus save/restore for free) and exposes
 * element refs plus open/set/tab helpers. Page modules attach behaviour:
 * reader-search-ui.js wires the this-book input/results/whole-word/advanced
 * pipeline, library-search-page.js wires its own. The All-books tab's
 * cross-book search (lazy search index, scope section from the shared
 * picker module, compact per-book rows with deep links) lives here — it is
 * window-owned machinery neither page duplicates. Never imports page UI
 * modules — behaviour flows in via initSearchWindow cfg callbacks (no
 * import cycles).
 */

import { t, tagLabel, currentLang } from "./i18n.js";
import { loadSearchIndex, searchLibrary } from "./library-search-engine.js";
import { loadBookRegistry, extractTags } from "./book-data.js";
import { escapeHTML, formatThousands, addSearchHistory } from "./search-utils.js";
import {
  getScope, fillTemplate, ensureSearchableBooks, searchableBooks,
  renderScopeShell, ensureScopeShell, renderScopePopover, clearScopeFilter,
  initScopePicker, reserveScopeCountWidth, refreshScopeLabels, scopeSummaryText,
} from "./library-scope-picker.js";
import {
  openAuthorsModal,
  openPeriodsModal,
  onFacetChange,
  facetActive,
  bookMatchesFacets,
  facetChipsHTML,
  visibleCounts,
  onFacetChipClick,
} from "./facet-browse.js";

var _ui = null;
var _registryCache = null; // reader-mode registry entries (book titles, facet scoping)
var _inputTimer = null;    // the window input's debounce — shell-owned, like syncClear
var _cfg = {
  mode: "reader",
  tabs: false,          // reader mode: true → this-book + all-books tabs
  options: true,        // whole-word + advanced row (this-book tab only)
  scope: false,         // library mode pins the scope section on regardless
  viewToggle: false,    // library mode: card/list view buttons above results
  onOpen: null,         // fired after openModal + input focus
  onOpenAdvanced: null, // fired when the advanced section expands
  onTabChange: null,    // (tab) fired on a tab switch
  onViewChange: null,   // (view) fired on a card/list switch
  onInput: null,        // (value) debounced — the page decides what a query means
  onHistoryChange: null, // () history was written by the shell — page refreshes its section
};
var _currentTab = "thisBook";

function el(id) { return document.getElementById(id); }

// JS-built DOM has no data-i18n — labels are set here and re-set on
// languagechange (same pattern as the library's scope modal).
function renderLabels() {
  el("searchWindowTitle").textContent = t("searchWindowTitle");
  el("searchWindowSideLabel").textContent = t("searchWindowSideLabel");
  el("searchWindowInput").placeholder = t("searchPlaceholder");
  el("searchWindowTabThisBook").textContent = t("searchWindowThisBook");
  el("searchWindowTabAllBooks").textContent = t("searchWindowAllBooks");
  el("searchWindowAdvLabel").textContent = t("advancedSearchTitle");
  el("searchWindowAdvToggle").textContent = "⚙ " + t("advancedSearchTitle");
  el("searchWindowHelpBtn").textContent = "❔ " + t("searchHelpTitle");
  el("searchWindowWholeWordLabel").textContent = t("searchWindowWholeWord");
  el("btnAddCondition").textContent = t("btnAddCondition");
  el("btnApplyAdvancedSearch").textContent = t("btnApplySearch");
  el("btnClearAdvancedSearch").textContent = t("btnReset");
  el("searchWindowViewCard").textContent = t("searchWindowCardView");
  el("searchWindowViewList").textContent = t("searchWindowListView");
  el("searchWindowHint").textContent = t("searchWindowOpenHint");
  el("searchWindowOpenPage").textContent = t("searchWindowOpenPage");
  el("searchWindowReset").textContent = t("libScopeReset");
  el("searchWindowHistoryLabel").textContent = t("searchWindowHistoryTitle");
  el("searchWindowHistoryClear").textContent = t("searchClearHistory");
  el("searchWindowFacetAuthors").textContent = t("libAuthors");
  el("searchWindowFacetPeriods").textContent = t("libPeriods");
  refreshScopeSummary();
  renderWindowFacetChips();
  // The count's reserved slot is language-dependent (widest of the count
  // forms) — re-reserve while the window is open. Hidden (offsetWidth 0)
  // calls would zero the reservation, so this is guarded like the scope
  // picker's scopeModalOpen().
  if (_ui && _ui.overlay.classList.contains("open")) reserveWindowCountWidth();
}

// ── Search tips (the grammar help modal) ────────────────────
// The search grammar ("…", -word, ~fuzzy, *, ?, .word, col:N:, /…/) is
// invisible — the Tips button in the options row opens this modal, stacked
// over the window via openModalOnTop (the scope picker's pattern). It is a
// 3-column table (term | meaning | example) so the example column is
// labelled by its header; the row-floating layout drifted on mixed
// RTL/LTR tokens like "col:1:word". Cells have NO dir attribute: they
// inherit the modal's RTL direction so the whole column aligns on one edge
// — per-cell dir="auto" ragged the term column (Latin terms went LTR and
// left-aligned, Thaana/Arabic went right). A Latin token like col:1:word
// still reads left-to-right inside its cell via the bidi algorithm, the
// way every other table on the site renders mixed text. Rebuilt on
// languagechange while open so a mid-read switch doesn't leave stale text.
var HELP_FEATURES = ["Phrase", "Exclude", "Fuzzy", "Wildcard", "WholeWord", "Column", "Regex"];

function buildSearchHelp() {
  window.createModal("searchHelpOverlay", "searchHelpTitle", "searchHelpBody", "search-help");
  document.getElementById("searchHelpTitle").textContent = t("searchHelpTitle");
  // The table + notes live in a dedicated scroll region (the shared
  // full-size modal structure: pinned header, scrollable content) — a
  // tall sheet or a short viewport scrolls instead of clipping.
  document.getElementById("searchHelpBody").innerHTML =
    '<div class="search-help-scroll">' +
    '<table class="search-help-table">' +
    "<thead><tr>" +
    "<th>" + t("searchHelpColFeature") + "</th>" +
    "<th>" + t("searchHelpColTerm") + "</th>" +
    "<th>" + t("searchHelpColMeaning") + "</th>" +
    "<th>" + t("searchHelpColExample") + "</th>" +
    "</tr></thead><tbody>" +
    HELP_FEATURES.map(function (name) {
      return "<tr>" +
        '<td class="search-help-name">' + t("searchHelp" + name + "Name") + "</td>" +
        '<td class="search-help-term">' + t("searchHelp" + name + "Term") + "</td>" +
        '<td class="search-help-mean">' + t("searchHelp" + name + "Mean") + "</td>" +
        '<td class="search-help-ex">' + t("searchHelp" + name + "Ex") + "</td>" +
      "</tr>";
    }).join("") +
    "</tbody></table>" +
    '<div class="search-help-notes">' +
    '<p id="searchHelpNote" class="search-help-note">' + t("searchHelpAllBooksNote") + "</p>" +
    '<p id="searchHelpNormNote" class="search-help-note">' + t("searchHelpNormNote") + "</p>" +
    "</div>" +
    "</div>";
}

function openSearchHelp() {
  buildSearchHelp();
  window.openModalOnTop("searchHelpOverlay");
}

// The count lives between the input and the reset in the head row — when a
// search lands it must APPEAR without SHIFTING the input. Reserve a
// min-width slot sized to the widest count form (the scope modal does the
// same: S5 "no width jump on scoping"). The modal must be visible to
// measure, so this runs on open and on language change while open.
function reserveWindowCountWidth() {
  var n = formatThousands(999999); // widest realistic count (any book)
  window.reserveWidestText(_ui.count, [
    t("resultCount") + ": " + n,
    fillTemplate("libResultSummary", { a: n, b: 99 }), // all-books / library
  ]);
}

// Clear ✕ visibility tracks the input value. The shell owns the sync — it
// must hold on programmatic value sets (setSearchWindowQuery, search-module
// query writes) as well as typing. The click just clears + focuses and
// re-fires "input", so whatever debounced pipeline is wired re-runs with an
// empty query; the shell needs no knowledge of search behaviour.
function syncClear() {
  _ui.clear.classList.toggle("visible", !!_ui.input.value);
  updateOpenPageLink();
}

// Head-row result count (the scope modal's count look). Shown once a search
// has run; hidden with empty text — no search yet (or a cleared one) has
// nothing to count. Pages push their counts here instead of painting a
// header into the scrolling results pane.
// The count's slot is always present (min-width reserved at open) — the
// text lands without shifting the head row, so no display toggling.
export function setWindowCount(text) {
  _ui.count.textContent = text || "";
}

// Active author/period filters render as chips under the facet buttons —
// click-to-remove, same markup as every other surface (shared module). The
// window browses the searchable set, so its counts cover only books really
// in the library (same semantics as the library page's modals).
function renderWindowFacetChips() {
  ensureSearchableBooks().then(function () {
    visibleCounts(searchableBooks()).then(function (counts) {
      if (_ui.facetChips) _ui.facetChips.innerHTML = facetChipsHTML(counts);
    });
  });
}

// Facet-scoped book codes: the visible books passing the active author/period
// filters, intersected with the picker's selection when one is active.
// null when no facets are active (callers keep their plain scope).
function facetScopedBooks() {
  if (!facetActive()) return null;
  var sc = getScope();
  var out = [];
  (_registryCache || []).forEach(function (b) {
    if (b.bookCode.endsWith("-HDN")) return;
    if (!bookMatchesFacets(b)) return;
    if (sc && sc.length > 0 && sc.indexOf(b.bookCode) === -1) return;
    out.push(b.bookCode);
  });
  return out;
}

// The cross-book hop link: shown only when the current context is
// cross-book (library mode, or the reader's All-books tab) and there is a
// query. The reader navigates (the href carries query + scope); the library
// page intercepts the click and applies the search in place (onOpenPage).
function updateOpenPageLink() {
  var crossBook = _cfg.mode === "library" || _currentTab === "allBooks";
  var q = _ui.input.value.trim();
  if (!crossBook || !q) {
    _ui.openPage.style.display = "none";
    syncFooter();
    return;
  }
  var href = "library-search.html?q=" + encodeURIComponent(q);
  var sc = getScope();
  if (sc && sc.length > 0) href += "&books=" + sc.join(",");
  _ui.openPage.href = href;
  _ui.openPage.style.display = "";
  syncFooter();
}

// The keyboard hint (↑↓/Enter/Esc) only teaches something while result rows
// are on screen — the empty state and the no-matches line have nothing to
// navigate. Pages call this from their result/empty renderers (the shell
// can't know a page's result markup); the all-books renderer here uses it
// too.
export function showWindowHint(show) {
  _ui.hint.style.display = show ? "" : "none";
  syncFooter();
}

// The footer strip is the window's status bar — it exists only while one of
// its children shows (the hint, the index status, the open-page link); an
// empty strip would leave a divider line with a blank band under it.
function syncFooter() {
  var any = _ui.hint.style.display !== "none" ||
            _ui.status.style.display !== "none" ||
            _ui.openPage.style.display !== "none";
  _ui.footer.style.display = any ? "" : "none";
}

function collapseAdvanced() {
  _ui.advBody.style.display = "none";
  _ui.advToggle.classList.remove("active");
}

function setView(view) {
  _ui.viewCard.classList.toggle("active", view === "card");
  _ui.viewList.classList.toggle("active", view === "list");
  if (_cfg.onViewChange) _cfg.onViewChange(view);
}

function setTab(tab, silent) {
  _currentTab = tab;
  var btns = _ui.tabs.querySelectorAll(".search-window-tab");
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.toggle("active", btns[i].getAttribute("data-tab") === tab);
  }
  // Section visibility: the All-books tab swaps the options row (whole-word,
  // advanced) for the scope section — cross-book search has neither
  // whole-word semantics nor per-column conditions, and the scope is its
  // only modifier. Library mode pins the scope section on (cfg.scope).
  var isAll = tab === "allBooks";
  _ui.scope.style.display = ((_cfg.tabs && isAll) || _cfg.scope === true) ? "" : "none";
  _ui.facets.style.display = ((_cfg.tabs && isAll) || _cfg.scope === true) ? "" : "none";
  if (_cfg.options !== false) {
    _ui.options.style.display = isAll ? "none" : "";
    if (isAll) collapseAdvanced();
  }
  // the hop link depends on the tab context (this-book tab: no hop)
  updateOpenPageLink();
  // silent: initSearchWindow applies the initial state without firing the
  // page callback (its refs are not wired yet at that point).
  if (!silent && _cfg.onTabChange) _cfg.onTabChange(tab);
}

// Reader-mode registry accessor. The library page owns its own registry
// variable; the shell caches the shared module-level promise result for its
// own consumers (book titles, facet scoping). Always resolves to an array
// (null on fetch failure → empty list; the search itself is failing anyway).
function registryReady() {
  return loadBookRegistry().then(function (reg) {
    if (reg) _registryCache = reg;
    return _registryCache || [];
  });
}

// The scope summary's label — same text the library page's scope button
// shows ("Search in: … ▾"), built by the picker's shared scopeSummaryText
// so the two surfaces never drift. Refresh on scope changes and language
// switches (JS-built DOM has no data-i18n).
function refreshScopeSummary() {
  _ui.scopeSummary.textContent = scopeSummaryText();
}

// Current-language title with the registry's canonical fallbacks (same
// order as the picker's scope rows).
function bookTitle(meta) {
  if (!meta) return "";
  var l = currentLang();
  var title = l === "dv" ? meta.titleDV : l === "ar" ? meta.titleAR : meta.titleEN;
  return title || meta.titleEN || meta.titleDV || meta.titleAR || "";
}

// All-books search — the cross-book index path. Loading state and failures
// land in the footer status line (calmer than flashing the results area);
// the retry button re-runs loadSearchIndex, which clears its promise on
// failure so a retry is a fresh fetch.
export function searchAllBooks(query) {
  var q = query.trim();
  if (!q) return;
  _ui.status.style.display = "";
  _ui.status.textContent = t("searchWindowIndexLoading");
  syncFooter(); // the strip lives on the status while the index loads
  registryReady()
    .then(function () {
      return Promise.all([loadSearchIndex(), ensureSearchableBooks()]);
    })
    .then(function (out) {
      var index = out[0];
      // The window is one surface, so all-books terms land in the same
      // reader history as this-book terms (written once the search runs —
      // same timing as runBookSearch).
      addSearchHistory(q);
      if (_cfg.onHistoryChange) _cfg.onHistoryChange();
      var fb = facetScopedBooks();
      if (fb !== null && fb.length === 0) {
        // Facets exclude every book (possibly vs the picker scope) — show no
        // matches, never fall through to an unscoped search (the engine
        // treats [] as "every book")
        _ui.status.style.display = "none";
        syncFooter();
        renderAllBooksResults([], q);
        return;
      }
      var results = searchLibrary(index, q, fb !== null ? fb : getScope());
      _ui.status.style.display = "none";
      syncFooter(); // the strip's life is now the hint's / open-page's
      renderAllBooksResults(results, q);
    })
    .catch(function () {
      // textContent wipes any previous retry button — the last failure wins.
      _ui.status.textContent = t("searchWindowIndexError") + " ";
      var retry = document.createElement("button");
      retry.type = "button";
      retry.className = "modal-reset-small search-window-status-retry";
      retry.textContent = "↺ Retry"; // errors are English (house style)
      retry.addEventListener("click", function () {
        var v = _ui.input.value;
        if (!v.trim()) return;
        _ui.status.textContent = t("searchWindowIndexLoading");
        loadSearchIndex()
          .then(function (index) {
            addSearchHistory(v);
            if (_cfg.onHistoryChange) _cfg.onHistoryChange();
            var results = searchLibrary(index, v, getScope());
            _ui.status.style.display = "none";
            syncFooter(); // the strip's life is now the hint's / open-page's
            renderAllBooksResults(results, v);
          })
          .catch(function () {});
      });
      _ui.status.appendChild(retry);
    });
}

// Compact per-book rows: current-language title, tag badges, match count,
// deep link to the book's first match (reader.html?book=&row=&q= — the
// library page's card pattern). No data-real rows — these are links, not
// jumps, so no result-click wiring. Shared by the reader's All-books tab
// (registry cache) and the library window's list view (page registry).
export function buildBookRowsHTML(results, q, bookNames) {
  var html = "";
  for (var r = 0; r < results.length; r++) {
    var res = results[r];
    var meta = null;
    if (bookNames) {
      for (var m = 0; m < bookNames.length; m++) {
        if (bookNames[m].bookCode === res.bookCode) { meta = bookNames[m]; break; }
      }
    }
    var tags = meta ? extractTags(meta.bookCode, meta) : [];
    var tagHtml = "";
    for (var g = 0; g < tags.length; g++) {
      tagHtml += '<span class="tag-badge' +
        (tags[g].palette >= 0 ? " tag-palette-" + tags[g].palette : "") +
        '" title="Category: ' + tagLabel(tags[g].code, tags[g].label, "en") + '">' +
        tagLabel(tags[g].code, tags[g].label) + "</span>";
    }
    var link = "reader.html?book=" + res.bookCode + "&row=" + res.firstRow +
      "&q=" + encodeURIComponent(q);
    html += '<a class="search-window-book-link" href="' + link +
      '" title="' + res.bookCode + '">' +
      '<span class="search-window-book-title">' +
      escapeHTML(bookTitle(meta) || res.bookCode) + "</span>" +
      (tagHtml ? '<span class="search-window-book-tags">' + tagHtml + "</span>" : "") +
      '<span class="search-window-book-count">' +
      fillTemplate("libBookMatches", { n: formatThousands(res.count) }) + "</span></a>";
  }
  return html;
}

function renderAllBooksResults(results, q) {
  var total = 0;
  for (var i = 0; i < results.length; i++) total += results[i].count;
  setWindowCount(fillTemplate("libResultSummary", { a: formatThousands(total), b: results.length }));
  var html = "";
  if (results.length === 0) {
    html += '<div class="search-no-matches">' + t("noMatchesMsg") + ': "' +
      escapeHTML(q) + '"</div>';
  } else {
    html += buildBookRowsHTML(results, q, _registryCache);
  }
  _ui.results.innerHTML = html;
  _ui.results.style.display = "";
  // No history hiding here — the section is always visible (see the
  // buildShell comment). A display:none on this tab stuck forever: nothing
  // ever re-showed it, so Reset (back to this-book) read as a wiped history.
  // The keyboard hint appears with the rows (they are Enter-openable
  // links); the no-matches line hides it.
  showWindowHint(results.length > 0);
}

function buildShell() {
  window.createModal("searchWindowOverlay", "searchWindowTitle", "searchWindowBody", "search-window-modal");
  var body = el("searchWindowBody");
  body.innerHTML =
    // Header row — the scope modal's pattern: the input shares the row with
    // the result count and the reset, so it does not own the full width.
    // RTL row (the modal is dir=rtl): input rightmost, count beside it,
    // reset at the far left — same order as the libScope head row. The
    // count reuses the scope modal's count look (.lib-scope-count); the
    // reset reuses its button (.toolbar-btn lib-scope-reset).
    // Desktop (≥601px) maps the four siblings onto a two-column grid — the
    // same geometry as the scope modal: the side pane's heading above the
    // pane (like libScopeTypesLabel above the rail), the input row above
    // the results column only (like the filter above libScopeList). RTL
    // grid order: the first sibling is the rightmost column.
    '<div class="search-window-side-label" id="searchWindowSideLabel"></div>' +
    '<div class="search-window-input-row">' +
      '<div class="search-input-wrap search-window-input-wrap">' +
        '<input id="searchWindowInput" type="search" class="search-input" autocomplete="off" dir="rtl" ' +
          'title="Search (* wildcard, ? char, -exclude, ~fuzzy~, .wholeword, /regex/)" />' +
        '<button type="button" id="searchWindowClear" class="search-clear-btn" title="Clear search" aria-label="Clear search">✕</button>' +
      '</div>' +
      '<span id="searchWindowCount" class="lib-scope-count"></span>' +
      '<button type="button" id="searchWindowReset" class="toolbar-btn lib-scope-reset" title="Reset search">↺ Reset</button>' +
    '</div>' +
    // Desktop two-column body: the controls (tabs, options, view, advanced,
    // scope) and the search-history section live in the side pane; the
    // results and status footer fill the main pane. On ≤600px the grid
    // collapses to a single stacked column (css/search-window.css).
      '<div class="search-window-side" id="searchWindowSide">' +
        '<div class="search-window-tabs" id="searchWindowTabs">' +
          '<button id="searchWindowTabThisBook" class="search-window-tab" data-tab="thisBook"></button>' +
          '<button id="searchWindowTabAllBooks" class="search-window-tab" data-tab="allBooks"></button>' +
        '</div>' +
        '<div class="search-window-options" id="searchWindowOptions">' +
          '<button id="searchWindowWholeWord" class="search-window-opt" title="Whole-word match">' +
            '<span class="search-window-ww">ab</span>' +
            '<span class="search-window-opt-label" id="searchWindowWholeWordLabel"></span>' +
          '</button>' +
          '<button id="searchWindowAdvToggle" class="search-window-opt" title="Advanced search (Ctrl+Shift+F)"></button>' +
          '<button id="searchWindowHelpBtn" class="search-window-opt" title="Search tips"></button>' +
        '</div>' +
        '<div class="search-window-view" id="searchWindowView" style="display:none">' +
          '<button id="searchWindowViewCard" class="search-window-opt" title="Card view"></button>' +
          '<button id="searchWindowViewList" class="search-window-opt" title="List view"></button>' +
        '</div>' +
        '<div class="search-window-adv" id="searchWindowAdvBody" style="display:none">' +
          '<div class="search-window-adv-label" id="searchWindowAdvLabel"></div>' +
          '<div id="advancedSearchRows"></div>' +
          '<button id="btnAddCondition" class="modal-reset-small" title="Add another search condition"></button>' +
          '<div class="search-window-adv-actions">' +
            '<button id="btnApplyAdvancedSearch" class="advanced-apply-btn" title="Run advanced search"></button>' +
            '<button id="btnClearAdvancedSearch" class="modal-reset-small" title="Reset all conditions"></button>' +
          '</div>' +
        '</div>' +
        '<div class="search-window-scope" id="searchWindowScope" style="display:none">' +
          '<button id="searchWindowScopeSummary" class="search-window-scope-summary"></button>' +
        '</div>' +
        // Authors/Periods facets — visible with the scope (cross-book search
        // only). The buttons open the shared browse modals; active filters
        // render as chips under them (click to remove).
        '<div class="search-window-facets" id="searchWindowFacets" style="display:none">' +
          '<div class="search-window-facet-btns">' +
            '<button id="searchWindowFacetAuthors" class="search-window-opt" title="Browse and filter by author"></button>' +
            '<button id="searchWindowFacetPeriods" class="search-window-opt" title="Browse and filter by period"></button>' +
          '</div>' +
          '<div class="search-window-facet-chips" id="searchWindowFacetChips"></div>' +
        '</div>' +
        // History is a "recent searches" section of the controls pane — the
        // main pane is the results column. The label is a shell child (the
        // page modules re-render only the list, so it survives innerHTML
        // wipes and language switches via renderLabels).
        // Always visible: history is a live side-pane section, not an
        // empty-state (user preference — it stays while results show).
        '<div id="searchWindowHistory" class="search-window-history">' +
          '<div class="search-window-history-label" id="searchWindowHistoryLabel"></div>' +
          '<div class="search-window-history-list" id="searchWindowHistoryList"></div>' +
          // Clear-all is a sibling of the scrollable list (not its last row),
          // so the list's scrollbar never spans it. The page modules toggle
          // its visibility and wire the click.
          '<button id="searchWindowHistoryClear" class="search-history-clear" style="display:none"></button>' +
        '</div>' +
      '</div>' +
      '<div class="search-window-main" id="searchWindowMain">' +
        '<div id="searchWindowResults" class="search-results search-window-results" style="display:none"></div>' +
        '<div class="search-window-footer" id="searchWindowFooter">' +
          // The cross-book hop: "open in library page" — the reader
          // navigates (its href carries query + scope); the library page
          // intercepts the click and applies the search in place
          // (cfg.onOpenPage). Hidden on the this-book tab / empty input.
          '<a id="searchWindowOpenPage" class="search-window-open-page" style="display:none" href="library-search.html"></a>' +
          '<span id="searchWindowHint"></span>' +
          '<span id="searchWindowStatus" class="search-window-status" style="display:none"></span>' +
        '</div>' +
      '</div>';

  _ui = {
    overlay: el("searchWindowOverlay"),
    title: el("searchWindowTitle"),
    body: body,
    sideLabel: el("searchWindowSideLabel"),
    input: el("searchWindowInput"),
    clear: el("searchWindowClear"),
    count: el("searchWindowCount"),
    reset: el("searchWindowReset"),
    options: el("searchWindowOptions"),
    view: el("searchWindowView"),
    viewCard: el("searchWindowViewCard"),
    viewList: el("searchWindowViewList"),
    wholeWord: el("searchWindowWholeWord"),
    advToggle: el("searchWindowAdvToggle"),
    helpBtn: el("searchWindowHelpBtn"),
    advBody: el("searchWindowAdvBody"),
    advRows: el("advancedSearchRows"),
    advAdd: el("btnAddCondition"),
    advApply: el("btnApplyAdvancedSearch"),
    advReset: el("btnClearAdvancedSearch"),
    tabs: el("searchWindowTabs"),
    tabThis: el("searchWindowTabThisBook"),
    tabAll: el("searchWindowTabAllBooks"),
    scope: el("searchWindowScope"),
    scopeSummary: el("searchWindowScopeSummary"),
    facets: el("searchWindowFacets"),
    facetAuthors: el("searchWindowFacetAuthors"),
    facetPeriods: el("searchWindowFacetPeriods"),
    facetChips: el("searchWindowFacetChips"),
    results: el("searchWindowResults"),
    history: el("searchWindowHistory"),
    historyList: el("searchWindowHistoryList"),
    historyClear: el("searchWindowHistoryClear"),
    footer: el("searchWindowFooter"),
    openPage: el("searchWindowOpenPage"),
    hint: el("searchWindowHint"),
    status: el("searchWindowStatus"),
    setTab: setTab,
    syncClear: syncClear,
  };

  renderLabels();
  document.addEventListener("languagechange", function () {
    renderLabels();
    // the scope picker's own labels (filter placeholder, reset, group names)
    // re-render for whichever surface holds the shell; the modal's title is
    // set fresh on every open
    refreshScopeLabels();
    // the search-tips modal re-renders in place when open (its language is
    // the reader's, which just changed)
    if (el("searchHelpOverlay") && el("searchHelpOverlay").classList.contains("open")) {
      buildSearchHelp();
    }
  });

  // The window input is the one shared surface — the debounce lives here
  // (same 120ms as the header box), routing through cfg.onInput so whichever
  // page owns the window decides what a query means.
  _ui.input.addEventListener("input", function () {
    syncClear();
    clearTimeout(_inputTimer);
    var val = this.value;
    _inputTimer = setTimeout(function () {
      if (_cfg.onInput) _cfg.onInput(val);
    }, 120);
  });
  _ui.clear.addEventListener("click", function () {
    _ui.input.value = "";
    syncClear();
    _ui.input.dispatchEvent(new Event("input", { bubbles: true }));
    _ui.input.focus();
  });

  // Link-row keyboard navigation (the All-books tab's rows and the library
  // window's cards/list rows). The input's own listener fires before any
  // page document-level handler, and it no-ops when no link rows are on
  // screen — this-book results (.search-result[data-real]) stay owned by
  // the reader page. The hint strip's ↑↓/Enter promise holds on every tab.
  _ui.input.addEventListener("keydown", function (e) {
    if (!_ui.overlay.classList.contains("open")) return;
    var rows = _ui.results.querySelectorAll(
      ".search-window-book-link, .lib-result",
    );
    if (rows.length === 0) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      var idx = -1;
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].classList.contains("active")) { idx = i; break; }
      }
      idx = e.key === "ArrowDown"
        ? Math.min(idx + 1, rows.length - 1)
        : Math.max(idx - 1, 0);
      for (var j = 0; j < rows.length; j++) {
        rows[j].classList.toggle("active", j === idx);
      }
      rows[idx].scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      var cur = null;
      for (var k = 0; k < rows.length; k++) {
        if (rows[k].classList.contains("active")) { cur = rows[k]; break; }
      }
      if (!cur) return;
      e.preventDefault();
      // Cards wrap their link inside; the All-books rows ARE the link.
      var a = cur.classList.contains("search-window-book-link")
        ? cur
        : cur.querySelector(".lib-result-link");
      if (a && a.href) window.location.href = a.href;
    }
  });

  // Head-row reset — the scope modal's pattern: one button restores the
  // surface's default state. The shell owns the chrome (query, advanced,
  // tab); the page owns its search state (whole-word flag, conditions),
  // which cfg.onReset clears. The input event re-runs the page's pipeline
  // with an empty query, landing on its empty/history state.
  _ui.reset.addEventListener("click", function () {
    _ui.input.value = "";
    collapseAdvanced();
    setTab("thisBook");
    syncClear();
    _ui.input.dispatchEvent(new Event("input", { bubbles: true }));
    _ui.input.focus();
    if (_cfg.onReset) _cfg.onReset();
  });

  // The cross-book hop: the library page applies the search in place
  // (onOpenPage); the reader lets the link navigate — its href already
  // carries the query and scope (updateOpenPageLink).
  _ui.openPage.addEventListener("click", function (e) {
    if (_cfg.onOpenPage) {
      e.preventDefault();
      _cfg.onOpenPage(_ui.input.value.trim());
    }
  });

  // Tabs — the shell swaps section visibility; the page decides what a
  // switch means via onTabChange.
  _ui.tabThis.addEventListener("click", function () { setTab("thisBook"); });
  _ui.tabAll.addEventListener("click", function () { setTab("allBooks"); });

  // Card/list view (library mode) — visual switch only; the page re-renders
  // its cached results via onViewChange.
  _ui.viewCard.addEventListener("click", function () { setView("card"); });
  _ui.viewList.addEventListener("click", function () { setView("list"); });

  // Advanced expander — onOpenAdvanced fires on every expand, so condition
  // rows render fresh against the current column layout.
  _ui.advToggle.addEventListener("click", function () {
    var open = _ui.advBody.style.display !== "none";
    if (open) {
      collapseAdvanced();
    } else {
      _ui.advBody.style.display = "";
      _ui.advToggle.classList.add("active");
      if (_cfg.onOpenAdvanced) _cfg.onOpenAdvanced();
      // The expanded section pushes the sections below it down the pane —
      // bring it fully into view (no-op when it already fits).
      _ui.advBody.scrollIntoView({ block: "nearest" });
    }
  });

  // Search tips — the grammar help, stacked over the window (the scope
  // modal's pattern: the window keeps its query and results underneath).
  _ui.helpBtn.addEventListener("click", openSearchHelp);

  // Scope summary — opens the scope picker in the real libScope modal
  // (the same centered, two-pane modal the library page's button opens),
  // stacked ON TOP of the window via openModalOnTop: the window keeps its
  // query and results underneath, and closes back onto them. The picker
  // renders into the modal body — the shell module still renders into
  // exactly one surface at a time. The modal is created lazily (idempotent
  // createModal: the library page may have created it already with the
  // same ids).
  _ui.scopeSummary.addEventListener("click", function () {
    registryReady().then(function () {
      window.createModal("libScopeOverlay", "libScopeModalTitle", "libScopeModalBody", "lib-scope-modal");
      var body = document.getElementById("libScopeModalBody");
      var title = document.getElementById("libScopeModalTitle");
      if (title) title.textContent = t("libScopeTitle");
      ensureScopeShell(body);
      clearScopeFilter();
      ensureSearchableBooks().then(function () {
        renderScopePopover();
        window.openModalOnTop("libScopeOverlay");
        reserveScopeCountWidth(); // must measure while the modal is visible
      });
    });
  });

  // Scope changes fan out from the picker module (page callback + this
  // event). The window refreshes its summary and re-filters the current
  // results — the scope applies even while the picker body is collapsed.
  // Reader mode: re-run the All-books search (shell-owned machinery).
  // Library mode: the page owns its search pipeline (computeScope includes
  // tag chips), so delegate through cfg.onInput when the window is open.
  window.addEventListener("libScopeChange", function () {
    refreshScopeSummary();
    // Keep the picker's own surface fresh too (chips rail, count) — the page
    // re-renders via its onScopeChange callback, but when the modal is opened
    // from the window there is no page callback, so the shell would keep
    // showing the pre-click selection. No-op when the modal is closed
    // (renderScopePopover guards on the picker's list ref).
    renderScopePopover();
    if (_currentTab === "allBooks" && _ui.input.value.trim()) {
      searchAllBooks(_ui.input.value);
    } else if (
      _cfg.mode === "library" &&
      _ui.overlay.classList.contains("open") &&
      _ui.input.value.trim() &&
      _cfg.onInput
    ) {
      _cfg.onInput(_ui.input.value);
    }
  });

  // Authors/Periods browse — the shared facet modals, stacked on top of the
  // window (same as the scope summary); the chips under the buttons remove
  // active filters on click. The modals count the searchable set (the window
  // browses the index, so its counts cover only books really in the library).
  _ui.facetAuthors.addEventListener("click", function () {
    ensureSearchableBooks().then(function () { openAuthorsModal(searchableBooks()); });
  });
  _ui.facetPeriods.addEventListener("click", function () {
    ensureSearchableBooks().then(function () { openPeriodsModal(searchableBooks()); });
  });
  _ui.facetChips.addEventListener("click", onFacetChipClick);

  // Facet changes (shared module — chips, browse modals on any surface)
  // re-render this section's chips and re-run the current cross-book search
  // so the window's results match the filters (mirrors libScopeChange above).
  onFacetChange(function () {
    renderWindowFacetChips();
    if (!_ui.input.value.trim()) return;
    if (_currentTab === "allBooks") {
      searchAllBooks(_ui.input.value);
    } else if (
      _cfg.mode === "library" &&
      _ui.overlay.classList.contains("open") &&
      _cfg.onInput
    ) {
      _cfg.onInput(_ui.input.value);
    }
  });
}

function ensureBuilt() {
  if (!_ui) buildShell();
}

export function initSearchWindow(cfg) {
  _cfg = cfg || _cfg;
  ensureBuilt();
  _ui.tabs.style.display = _cfg.tabs ? "" : "none";
  if (_cfg.options === false) _ui.options.style.display = "none";
  _ui.view.style.display = _cfg.viewToggle ? "" : "none";
  // Apply the initial tab's section visibility without firing the page
  // callback (its refs are not wired yet at init time).
  setTab(_currentTab, true);
  setView("card");
  if (_cfg.mode === "reader") {
    // The reader's All-books tab shares the scope picker; the library page
    // inits its own (it owns the libScope modal and button). No page
    // callback — the shell reacts through the libScopeChange event.
    initScopePicker({});
  }
  return _ui;
}

export function getSearchWindowUI() {
  ensureBuilt();
  return _ui;
}

export function getCurrentTab() {
  return _currentTab;
}

// Open the window. opts.openAdvanced expands the advanced section right
// away (Ctrl+Shift+F path). Focus lands on the input — openModal focuses
// the close ✕ first (focusFirstInModal), so re-focus here right after.
export function openSearchWindow(opts) {
  opts = opts || {};
  ensureBuilt();
  window.openModal("searchWindowOverlay");
  syncClear();
  reserveWindowCountWidth(); // modal visible — pin the count slot now
  // Focus the input once the modal is focusable: the overlay's pop
  // transition computes as visibility:hidden for ~--t-pop (common.js defers
  // its own focus-first past it), so the synchronous focus attempt below
  // silently fails and the deferred one re-lands it past the transition —
  // after common.js's close-✕ focus, so the input wins.
  try { _ui.input.focus(); _ui.input.select(); } catch (_) {}
  var pop = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--t-pop")) || 0.2;
  window.setTimeout(function () {
    if (!_ui.overlay.classList.contains("open")) return;
    try { _ui.input.focus(); _ui.input.select(); } catch (_) {}
  }, pop * 1000 + 30);
  if (opts.openAdvanced && _ui.advBody.style.display === "none") {
    _ui.advBody.style.display = "";
    _ui.advToggle.classList.add("active");
    if (_cfg.onOpenAdvanced) _cfg.onOpenAdvanced();
    _ui.advBody.scrollIntoView({ block: "nearest" });
  }
  if (_cfg.onOpen) _cfg.onOpen();
}

// Programmatic query set (?q= deep-link path) — the window may be closed;
// opening it later shows the query and re-runs it via cfg.onOpen.
export function setSearchWindowQuery(q) {
  ensureBuilt();
  _ui.input.value = q || "";
  syncClear();
}
