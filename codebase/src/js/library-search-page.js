/**
 * Library Search Page Module (books/library-search.html)
 * Cross-book search UI — the engine itself lives in src/js/library-search-engine.js
 * (pure module: loadScopedIndex / loadIndexMeta / searchLibraryDetailed /
 * analyseAllBooksQuery / tokenizeText) and
 * the word index in data/search-index-manifest.json + data/search-index/ (built by
 * data/08-rebuild-searchIndex.mjs).
 *
 * This page is self-initialising. It reads ?q=, ?tags= and ?books= from the
 * URL (shareable links), renders tag chips scoped to the visible books, and
 * groups results by book with inline peek previews. ?books= is the book-scope
 * picker (narrow the search to specific books; the chips narrow by category,
 * the picker by book — the two intersect in computeScope). Result deep-links
 * and peeks navigate to reader.html?book=X&row=N&q=… — the reader already
 * consumes that query (pre-highlights + scrolls to the row).
 */

import { t } from "./i18n.js";
import { loadScopedIndex, searchLibraryDetailed } from "./library-search-engine.js";
import {
  loadTagDefinitions,
  loadAuthorDefinitions,
  loadBookRegistry,
  extractTags,
} from "./book-data.js";
import {
  escapeHTML,
  addSearchHistory,
  getSearchHistory,
  removeSearchHistoryItem,
  clearSearchHistory,
  formatThousands,
} from "./search-utils.js";
import {
  initScopePicker,
  getScope,
  setScope,
  ensureSearchableBooks,
  searchableBooks,
  renderScopeShell,
  ensureScopeShell,
  renderScopePopover,
  reserveScopeCountWidth,
  scopeModalOpen,
  clearScopeFilter,
  refreshScopeLabels,
  fillTemplate,
  scopeSummaryText,
  defaultScopeCodes,
  groupBookCodes,
  scopesEqual,
} from "./library-scope-picker.js";
import {
  initSearchWindow,
  getSearchWindowUI,
  openSearchWindow,
  buildBookRowsHTML,
  setWindowCount,
  showWindowHint,
  allBooksQueryNote,
} from "./search-window.js";
import { wirePeeks } from "./library-peek.js";
import {
  facetState,
  setFacets,
  facetActive,
  clearFacets,
  onFacetChange,
  bookMatchesFacets,
  facetCounts,
  facetChipsHTML,
  onFacetChipClick,
  openAuthorsModal,
  openPeriodsModal,
} from "./facet-browse.js";

// ── Page state ───────────────────────────────────────────────
// The author/period facet state lives in src/js/facet-browse.js (shared with the
// dashboard and search window); this page keeps its tags, query and scope.
var _bookNames = null; // full registry (incl. -HDN books)
var _q = ""; // current query (trimmed)
var _selectedTags = []; // active tag chips (OR — same semantics as the grid)
var _searchTimer = null; // input debounce
var _refreshTags = null; // tag-row collapse refresh (common.js)
var _skipHistoryOnFocus = false; // true only for the initial desktop auto-focus

var el = {
  input: null,
  clear: null,
  history: null,
  tagsRow: null,
  count: null,
  results: null,
  scopeBtn: null,
  scopeOverlay: null,
  scopeTitle: null,
  scopeBody: null,
};

// ── Search window (library mode) ─────────────────────────────
// The window shares the page's state — the scope picker's selection and the
// page input's query (copied over on open) — but searches independently:
// typing in the window never touches the page behind it, which stays fully
// functional as the fallback surface.
var winInput = null;      // #searchWindowInput
var winResults = null;    // #searchWindowResults
var winHistoryList = null; // #searchWindowHistoryList (items — innerHTML)
var winHistoryClearEl = null; // #searchWindowHistoryClear (sibling — display + click)
var _winLastQ = null;     // last window query + results (language re-render, no re-search)
var _winLastResults = null;
var _winLastInfo = null;  // grammar-support report for the note
var _winLastNarrowed = false;
var _winLastScopeCount = 0;

// ── URL sync (?q= / ?tags= / ?books= — shareable links) ──────
function readURLParams() {
  var params = new URLSearchParams(window.location.search);
  _q = (params.get("q") || "").trim();
  var tagsParam = params.get("tags");
  if (tagsParam) {
    _selectedTags = tagsParam.split(",").map(function (x) { return x.trim(); })
      .filter(function (x) { return x; });
  }
  var authorsParam = params.get("authors");
  var periodParam = params.get("period");
  setFacets(
    authorsParam
      ? authorsParam.split(",").map(function (x) { return x.trim(); })
        .filter(function (x) { return x; })
      : [],
    periodParam === "modern" || /^\d+$/.test(periodParam) ? periodParam : ""
  );
  var booksParam = params.get("books");
  if (booksParam) {
    var books = booksParam.split(",").map(function (x) { return x.trim(); })
      .filter(function (x) { return x; });
    if (books.length > 0) {
      setScope(books);
      // The window is already built (initSearchWindow ran above) and shows
      // "All books" — this restore never passes through the picker's
      // notification, so fan the change out the same public channel the
      // picker uses (the window's summary refreshes; the page's own button
      // re-renders at init).
      window.dispatchEvent(new CustomEvent("libScopeChange"));
    }
  }
}

/** Keep ?q=, ?tags=, ?authors=, ?period= and ?books= in the address bar. */
function syncURL() {
  var params = new URLSearchParams();
  if (_q) params.set("q", _q);
  if (_selectedTags.length > 0) params.set("tags", _selectedTags.join(","));
  var facets = facetState();
  if (facets.authors.length > 0) params.set("authors", facets.authors.join(","));
  if (facets.period) params.set("period", facets.period);
  var scopeBooks = getScope();
  if (scopeBooks && scopeBooks.length > 0) {
    // ?books= stays out of the URL when the scope is the HDT default (fresh
    // state, the URL is param-free) or exactly the active chips' groups
    // (?tags= already carries that state) — the shared link must round-trip.
    var def = defaultScopeCodes();
    var skip = def && scopesEqual(scopeBooks, def);
    if (!skip && _selectedTags.length > 0) {
      var tagUnion = [];
      _selectedTags.forEach(function (tc) {
        tagUnion = tagUnion.concat(groupBookCodes(tc));
      });
      skip = tagUnion.length > 0 && scopesEqual(scopeBooks, tagUnion);
    }
    if (!skip) params.set("books", scopeBooks.join(","));
  }
  var qs = params.toString();
  history.replaceState(null, "", qs ? "?" + qs : window.location.pathname);
}

// ── Author + period helpers ──────────────────────────────────
// The author/period state, chips and browse modals live in the shared
// src/js/facet-browse.js module — this page only keeps its visible-book set.
/** Visible books only (-HDN excluded) — the set the grid filters. */
function visibleBooks() {
  return (_bookNames || []).filter(function (b) {
    return !b.bookCode.endsWith("-HDN");
  });
}

// ── Tag chips ────────────────────────────────────────────────
/** Render the chip row with counts over visible (-HDN excluded) books. */
function renderChips() {
  var visible = visibleBooks();
  var tagCounts = {};
  visible.forEach(function (b) {
    extractTags(b.bookCode, b).forEach(function (tg) {
      if (!tagCounts[tg.code])
        tagCounts[tg.code] = { label: tg.label, palette: tg.palette, count: 0 };
      tagCounts[tg.code].count++;
    });
  });
  var tagsActive = _selectedTags.length > 0;
  // The scope mirrors into the chip row: when the picker's selection is
  // exactly one tag group (the HDT default, a chip click, a ?tags= link),
  // that chip shows active and the All chip turns off — the row and the
  // scope button must never contradict each other. The check runs in the
  // same palette order the chips render, so an ambiguous scope (two tags
  // with identical book sets) picks the first in display order.
  var scopeBooks = getScope();
  var scopeGroup = null;
  if (scopeBooks) {
    Object.keys(tagCounts)
      .sort(function (a, b) {
        return tagCounts[a].palette - tagCounts[b].palette;
      })
      .some(function (code) {
        if (scopesEqual(scopeBooks, groupBookCodes(code))) {
          scopeGroup = code;
          return true;
        }
        return false;
      });
  }
  if (scopeGroup) tagsActive = true;
  var allChipHTML = window.tagAllChipHtml(tagsActive, visible.length);

  var html = Object.keys(tagCounts)
    // Palette slot = the tag registry's row position — render in the file's
    // hand-set order, not alphabetical.
    .sort(function (a, b) {
      return tagCounts[a].palette - tagCounts[b].palette;
    })
    .map(function (code) {
      var tc = tagCounts[code];
      return window.tagChipHtml(
        code,
        tc.label,
        tc.palette,
        _selectedTags.indexOf(code) !== -1 || scopeGroup === code,
        tc.count
      );
    })
    .join("");
  // Active author + period filters render as chips too (same visuals as tags —
  // the markup comes from the shared facet module, keyed via data-author /
  // data-period). Counts are over the searchable set — the same set the
  // browse modals count (see visibleCounts in facet-browse.js) — so a chip
  // count can never promise a book the library can't search.
  var facetHtml = facetChipsHTML(facetCounts(searchableBooks() || visible));
  el.tagsCollapse.innerHTML =
    '<span class="tags-label">' + t("tagsLabel") + "</span> " + allChipHTML + html + facetHtml;
  if (_refreshTags) _refreshTags();
}

function onChipsClick(e) {
  var chip = e.target.closest(".tag-chip");
  if (!chip) return;
  if (chip.dataset.author || chip.dataset.period) {
    // Author/period chips — the shared module toggles them and notifies its
    // subscribers (URL sync, chips and re-search happen there)
    onFacetChipClick(e);
    return;
  }
  var tag = chip.dataset.tag;
  if (tag === window.TAG_ALL) {
    _selectedTags = [];
    // All = every book — undo any picker scope too. Chips and the picker
    // share one scope: intersecting a tag with the HDT default would empty it.
    setScope(null);
  } else {
    var idx = _selectedTags.indexOf(tag);
    if (idx === -1) _selectedTags.push(tag);
    else _selectedTags.splice(idx, 1);
    // The chip's group replaces the picker scope (same semantics as ?tags=).
    var codes = groupBookCodes(tag);
    setScope(codes.length > 0 ? codes : null);
  }
  // applyScopeChange covers URL sync, the scope button and (when querying) the
  // re-search; the chips row re-renders after so it reflects the new state.
  applyScopeChange();
  renderChips();
}

// ── Book-scope picker (wiring) ───────────────────────────────
// The picker's machinery lives in src/js/library-scope-picker.js — state
// (_selectedBooks/_searchableBooks/_bookByCode/_scopeFilter), the shell
// renderer, the popover, and the selection helpers. The page owns the modal
// (createModal/openModal), the button, and what happens on change.

/** Scope changed → URL, button, modal, and (if querying) re-search. */
function applyScopeChange() {
  syncURL();
  renderScopeButton();
  if (scopeModalOpen()) {
    renderScopePopover();
  }
  if (_q) runSearchAndRender();
}

function renderScopeButton() {
  if (!el.scopeBtn) return;
  // "Search in: <state>" — the prefix teaches the button's purpose at a
  // glance (it controls which books the search runs in), while the state part
  // reports the current scope. Same builder as the search window's summary
  // (scopeSummaryText), so the two surfaces can't drift.
  el.scopeBtn.textContent = scopeSummaryText();
}

/** Open the book-scope modal (created lazily via the unified modal layer). */
function openScopeModal() {
  var open = function () {
    if (!el.scopeOverlay) {
      el.scopeOverlay = window.createModal("libScopeOverlay", "libScopeModalTitle", "libScopeModalBody", "lib-scope-modal");
      el.scopeTitle = document.getElementById("libScopeModalTitle");
      el.scopeBody = document.getElementById("libScopeModalBody");
    }
    ensureScopeShell(el.scopeBody); // the window may have taken the shell
    clearScopeFilter();
    el.scopeTitle.textContent = t("libScopeTitle");
    renderScopePopover();
    window.openModal("libScopeOverlay");
    reserveScopeCountWidth(); // must measure while the modal is visible
  };
  ensureSearchableBooks().then(open);
}

// ── Authors + Periods browse ─────────────────────────────────
// The browse modals (filter input + sticky-header table, trilingual rows
// with Arabic names) and the openAuthorsModal / openPeriodsModal entry points
// live in the shared src/js/facet-browse.js module — one surface on every page.

// ── Search ───────────────────────────────────────────────────
/**
 * Book codes eligible for the search: visible books (-HDN excluded) carrying
 * any active tag chip (OR — same semantics as the dashboard grid), further
 * narrowed to the book-scope picker's selection when one is active.
 */
function computeScope() {
  var visible = (_bookNames || []).filter(function (b) {
    return !b.bookCode.endsWith("-HDN");
  });
  if (_selectedTags.length > 0) {
    visible = visible.filter(function (b) {
      var codes = extractTags(b.bookCode, b).map(function (x) {
        return x.code;
      });
      return _selectedTags.some(function (tc) {
        return codes.indexOf(tc) !== -1;
      });
    });
  }
  // Author + period filters — author OR, period single-select (shared module)
  if (facetActive()) {
    visible = visible.filter(bookMatchesFacets);
  }
  var scopeBooks = getScope();
  if (scopeBooks && scopeBooks.length > 0) {
    visible = visible.filter(function (b) {
      return scopeBooks.indexOf(b.bookCode) !== -1;
    });
  }
  return visible.map(function (b) {
    return b.bookCode;
  });
}

function showEmpty(messageKey) {
  el.results.innerHTML = '<div class="empty-state">' + t(messageKey) + "</div>";
  el.count.textContent = "";
  el.count.style.display = "none";
}

// True when chips, facets or the picker narrow the search below every book —
// the zero-result message and its widen action key off this.
function scopeNarrowed() {
  var scopeBooks = getScope();
  return _selectedTags.length > 0 || facetActive() ||
    !!(scopeBooks && scopeBooks.length > 0);
}

/**
 * Zero-result state for the page grid. A narrowed scope gets a message that
 * names it plus a "Search all books" action (clears every narrowing); an
 * unscoped zero is just "No results". The all-books grammar note (when the
 * query used syntax the word index can't serve) explains a zero that came
 * from the query itself.
 */
function showScopedEmpty(info, narrowed, scopeCount) {
  var msg = narrowed && scopeCount > 0
    ? fillTemplate(
        scopeCount === 1 ? "libNoResultsInScopeOne" : "libNoResultsInScope",
        { n: formatThousands(scopeCount) }
      )
    : t("libNoResults");
  el.results.innerHTML =
    allBooksQueryNote(info) +
    '<div class="empty-state">' + msg +
    (narrowed
      ? ' <button type="button" class="modal-reset-small search-widen-btn" ' +
        'title="Clear filters and search every book">' +
        t("searchAllBooksAction") + "</button>"
      : "") +
    "</div>";
  el.count.textContent = "";
  el.count.style.display = "none";
  var widen = el.results.querySelector(".search-widen-btn");
  if (widen) widen.addEventListener("click", widenPageScope);
}

/** Clear every narrowing (chips, facets, picker) and re-run the page search. */
function widenPageScope() {
  _selectedTags = [];
  setScope(null);
  // clearFacets notifies synchronously → the page's onFacetChange handler
  // syncs the URL/chips and re-runs the search; state is already widened.
  clearFacets();
  renderChips();
  syncURL();
  renderScopeButton();
  // setScope() is silent — fan out through the picker's public channel so
  // the window's summary (and any later open) shows the widened scope.
  window.dispatchEvent(new CustomEvent("libScopeChange"));
}

/** Run the search and render results (caller debounces). */
function runSearchAndRender() {
  _q = (el.input.value || "").trim();
  syncURL();
  if (!_q) {
    showEmpty("libSearchHint");
    return;
  }
  // Empty-scope guard: active tags/authors/period or a book scope that match
  // no books must NOT fall through to an unscoped search (the engine treats
  // [] as "every book").
  var scope = computeScope();
  var narrowed = scopeNarrowed();
  if (narrowed && scope.length === 0) {
    showScopedEmpty(null, true, 0);
    return;
  }
  // Record the query as it is applied — same as the reader (applySearch), so
  // typing alone lands in history; no Enter needed.
  addSearchHistory(_q, window.LS_KEYS.searchHistory);
  el.count.style.display = "none";
  el.results.innerHTML = '<div class="empty-state">' + t("libSearching") + "</div>";
  // Scope-scoped: only the shards for the books in scope are fetched.
  loadScopedIndex(scope)
    .then(function (index) {
      var out = searchLibraryDetailed(index, _q, scope);
      renderResults(out.results, _q, out.info, narrowed, scope.length);
    })
    .catch(function () {
      el.results.innerHTML =
        '<div class="empty-state">⚠️ Error: Failed to load the search index. ' +
        '<button id="libSearchRetry" class="retry-btn">↺ Retry</button></div>';
      var retryBtn = document.getElementById("libSearchRetry");
      if (retryBtn) retryBtn.addEventListener("click", runSearchAndRender);
    });
}

// ── Clear-search button ──────────────────────────────────────
// Visible while the box has text (input, history-item click, deep-link init);
// clicking it clears + resets to the hint state.
function updateSearchClear() {
  if (el.clearBtn) el.clearBtn.classList.toggle("visible", !!el.input.value);
}

// ── Search history dropdown ──────────────────────────────────
// Same pattern as the reader's — and the SAME store (the shared
// searchHistory key): every applied search commits, the dropdown appears
// when the empty input is focused, items re-run on click, ✕ removes one,
// "Clear" empties all.
function renderSearchHistory() {
  var items = getSearchHistory(window.LS_KEYS.searchHistory);
  if (items.length === 0) {
    el.history.style.display = "none";
    return;
  }
  // Position below the search bar, full width (openDropdown sets the left
  // edge; pin the right edge too so the width tracks the input)
  window.openDropdown(el.history, el.input, 0);
  var sbRect = el.input.getBoundingClientRect();
  el.history.style.right = (window.innerWidth - sbRect.right) + "px";
  el.history.innerHTML = items.map(function (term, i) {
    return '<div class="search-history-item" data-idx="' + i + '">' +
      '<span class="hist-text">' + escapeHTML(term) + '</span>' +
      '<span class="hist-remove" data-idx="' + i + '">✕</span></div>';
  }).join("") +
  '<div class="search-history-clear">' + t("searchClearHistory") + '</div>';
  el.history.style.display = "";
  // Wire clicks
  el.history.querySelectorAll(".search-history-item[data-idx]").forEach(function (item) {
    item.addEventListener("click", function (e) {
      if (e.target.classList.contains("hist-remove")) return;
      // Without this the same click bubbles to the outside-click handler and
      // closes the dropdown right after it is hidden.
      e.stopPropagation();
      el.input.value = items[parseInt(this.dataset.idx)];
      updateSearchClear();
      el.history.style.display = "none";
      runSearchAndRender(); // commits the re-applied query to history
    });
  });
  el.history.querySelectorAll(".hist-remove").forEach(function (x) {
    x.addEventListener("click", function (e) {
      e.stopPropagation();
      removeSearchHistoryItem(parseInt(this.dataset.idx), window.LS_KEYS.searchHistory);
      renderSearchHistory();
    });
  });
  // Clear-all button
  var clearAll = el.history.querySelector(".search-history-clear");
  if (clearAll) clearAll.addEventListener("click", function () {
    clearSearchHistory(window.LS_KEYS.searchHistory);
    el.history.style.display = "none";
  });
}

// ── Result peek (expand to preview matching rows inline) ─────
// The peek machinery is shared with the search window and the reader's
// All-books tab — see src/js/library-peek.js.

/** Render grouped-by-book results into the results area — one compact row
 *  per book (the reader's All-books language), each with an expandable
 *  peek. */
function renderResults(results, q, info, narrowed, scopeCount) {
  if (!results || results.length === 0) {
    showScopedEmpty(info, narrowed, scopeCount);
    return;
  }
  var total = 0;
  for (var i = 0; i < results.length; i++) total += results[i].count;
  el.count.style.display = "";
  el.count.textContent = fillTemplate("libResultSummary", { a: formatThousands(total), b: results.length });
  el.results.innerHTML =
    allBooksQueryNote(info) +
    '<div class="lib-results">' +
    buildBookRowsHTML(results, q, _bookNames) +
    "</div>";

  // Wire peek toggles + paging (rows are static HTML at this point)
  wirePeeks(el.results);
}

// ── Search window (library mode) ─────────────────────────────
/** The library search history section — always visible in the side pane
 *  (same terms as the page's dropdown, own key), refreshed on every write.
 *  Clicking a term fills the window input and re-runs the window search. */
function renderWindowHistorySection() {
  var items = getSearchHistory(window.LS_KEYS.searchHistory);
  if (items.length === 0) {
    winHistoryList.innerHTML =
      '<div class="search-window-history-empty">' + t("searchWindowNoHistory") + "</div>";
    winHistoryClearEl.style.display = "none";
    return;
  }
  winHistoryList.innerHTML = items.map(function (term, i) {
    return '<div class="search-history-item" data-idx="' + i + '">' +
      '<span class="hist-text">' + escapeHTML(term) + '</span>' +
      '<span class="hist-remove" data-idx="' + i + '">✕</span></div>';
  }).join("");
  // Clear-all sits outside the scrollable list (shell-owned sibling), so
  // the list's scrollbar never spans it; shown only when there are items.
  winHistoryClearEl.style.display = "";
  winHistoryClearEl.onclick = function () {
    clearSearchHistory(window.LS_KEYS.searchHistory);
    renderWindowHistorySection();
  };
  winHistoryList.querySelectorAll(".search-history-item[data-idx]").forEach(function (item) {
    item.addEventListener("click", function (e) {
      if (e.target.classList.contains("hist-remove")) return;
      var term = items[parseInt(this.dataset.idx)];
      winInput.value = term;
      getSearchWindowUI().syncClear();
      windowSearchRun(term);
      // The mousedown itself blurred the input (a click on a non-focusable
      // row moves focus to body) — refocus so ↑↓/Enter act on the fresh
      // results (the shell's link-row navigation keys off the input).
      winInput.focus();
    });
  });
  winHistoryList.querySelectorAll(".hist-remove").forEach(function (x) {
    x.addEventListener("click", function (e) {
      e.stopPropagation();
      removeSearchHistoryItem(parseInt(this.dataset.idx), window.LS_KEYS.searchHistory);
      renderWindowHistorySection();
    });
  });
}

/** The window's empty state — a quiet placeholder in the results pane; the
 *  history section is not gated on it (always visible). */
function renderWindowHistory() {
  setWindowCount(""); // no query → nothing to count; the head row clears
  showWindowHint(false); // nothing to navigate — the strip collapses
  winResults.innerHTML =
    '<div class="search-window-empty">' + t("searchWindowEmptyHint") + "</div>";
  winResults.style.display = "";
  renderWindowHistorySection();
}

/** Render the window's search results — the same compact one-line rows and
 *  the same expandable peek as the page and the reader's All-books tab. */
function renderWindowResults(results, q, info, narrowed, scopeCount) {
  _winLastQ = q;
  _winLastResults = results;
  _winLastInfo = info || null;
  _winLastNarrowed = !!narrowed;
  _winLastScopeCount = scopeCount || 0;
  var total = 0;
  for (var i = 0; i < results.length; i++) total += results[i].count;
  // The count lives in the window's head row (scope-modal pattern) — the
  // results pane is rows only.
  setWindowCount(fillTemplate("libResultSummary", { a: formatThousands(total), b: results.length }));
  var html = allBooksQueryNote(info);
  if (results.length === 0) {
    // Same escape hatch as the page grid: name the narrowed scope and offer
    // to widen (a zero inside "16 books" usually means one filter too many).
    var msg = narrowed && scopeCount > 0
      ? fillTemplate(
          scopeCount === 1 ? "libNoResultsInScopeOne" : "libNoResultsInScope",
          { n: formatThousands(scopeCount) }
        )
      : t("libNoResults");
    html += '<div class="search-no-matches">' + msg + ': "' +
      escapeHTML(q) + '"' +
      (narrowed
        ? ' <button type="button" class="modal-reset-small search-widen-btn" ' +
          'title="Clear filters and search every book">' +
          t("searchAllBooksAction") + "</button>"
        : "") +
      "</div>";
  } else {
    html += buildBookRowsHTML(results, q, _bookNames);
  }
  winResults.innerHTML = html;
  winResults.style.display = "";
  wirePeeks(winResults);
  var widen = winResults.querySelector(".search-widen-btn");
  if (widen) widen.addEventListener("click", function () { widenWindowScope(); });
  // The keyboard hint appears with the rows; the no-matches line hides it
  // (and the strip collapses).
  showWindowHint(results.length > 0);
}

// Window zero → widen. Clearing the facets notifies synchronously (the page
// grid + this window re-run through their subscriptions); setScope(null) and
// the tag clear land before the notification so it sees the widened state.
// setScope() is silent, so fan the change out through the picker's public
// channel too — the window's summary and popover refresh, and its
// library-mode branch re-runs the open window through cfg.onInput.
function widenWindowScope() {
  _selectedTags = [];
  setScope(null);
  clearFacets();
  renderChips();
  syncURL();
  renderScopeButton();
  window.dispatchEvent(new CustomEvent("libScopeChange"));
}

/** Run the window search — the same pipeline as the page's runSearchAndRender
 *  (computeScope includes tag chips + the picker scope, history on its own
 *  key), rendering into the window. */
function windowSearchRun(q) {
  setWindowCount(""); // the head row shows the count only once a run lands
  var scope = computeScope();
  var narrowed = scopeNarrowed();
  if (narrowed && scope.length === 0) {
    renderWindowResults([], q, null, true, 0);
    return;
  }
  addSearchHistory(q, window.LS_KEYS.searchHistory);
  renderWindowHistorySection(); // history stays visible while the search runs
  winResults.innerHTML = '<div class="empty-state">' + t("libSearching") + "</div>";
  winResults.style.display = "";
  // Scope-scoped: only the shards for the books in scope are fetched —
  // a tag-scoped window search never downloads the whole corpus.
  loadScopedIndex(scope)
    .then(function (index) {
      var out = searchLibraryDetailed(index, q, scope);
      renderWindowResults(out.results, q, out.info, narrowed, scope.length);
    })
    .catch(function () {
      winResults.innerHTML =
        '<div class="empty-state">⚠️ Error: Failed to load the search index. ' +
        '<button id="winLibSearchRetry" class="retry-btn">↺ Retry</button></div>';
      var retryBtn = document.getElementById("winLibSearchRetry");
      if (retryBtn) retryBtn.addEventListener("click", function () { windowSearchRun(q); });
    });
}

/** Window input routing (the shell debounces; settled values land here). */
function windowSearch(value) {
  var q = value.trim();
  if (!q) { renderWindowHistory(); return; }
  windowSearchRun(q);
}

/** Window open — copy the page's query over (one surface, shared state),
 *  then run it; empty → the history empty state. */
function onWindowOpen() {
  var v = el.input.value.trim();
  winInput.value = el.input.value;
  getSearchWindowUI().syncClear();
  if (!v) { renderWindowHistory(); return; }
  windowSearchRun(v);
}

/** Window → page hop: apply the window's query to the page and close the
 *  window — the page's input, row list and URL are the full-page form of
 *  the same search (one search, two looks). */
function onWindowOpenPage(q) {
  if (!q) return;
  el.input.value = q;
  updateSearchClear();
  window.closeModal("searchWindowOverlay");
  runSearchAndRender();
}

// ── Page initialisation ──────────────────────────────────────
async function init() {
  el.input = document.getElementById("libSearchInput");
  el.tagsRow = document.getElementById("libTagsRow");
  el.tagsCollapse = document.getElementById("libTagsCollapse");
  el.tagsToggle = document.getElementById("libTagsToggle");
  el.count = document.getElementById("libResultCount");
  el.results = document.getElementById("libResults");
  el.history = document.getElementById("searchHistoryDropdown");
  el.clearBtn = document.getElementById("libSearchClear");
  if (!el.input) return;

  // The open peek's line sticks under the sticky panel on this page; its
  // offset is the panel's live height (chips wrap, focus mode collapses the
  // tag row, language/font settings resize it). A ResizeObserver covers all
  // of them; the window host sticks at its scrollport top and never reads it.
  var panel = document.getElementById("libPanel");
  if (panel && window.ResizeObserver) {
    var syncPeekOffset = function () {
      el.results.style.setProperty(
        "--lib-peek-panel-h",
        panel.getBoundingClientRect().height + "px"
      );
    };
    syncPeekOffset();
    new ResizeObserver(syncPeekOffset).observe(panel);
  }

  initScopePicker({
    onScopeChange: applyScopeChange,
    // Default scope: HDT books on a fresh visit (no ?books= / ?tags= state).
    // The All chip, the reset button, or any picker interaction undoes it.
    defaultTag: "HDT",
  });

  // The search window (library mode): shares the page's scope state, its
  // own input + result rows. The page stays fully functional behind it.
  var ui = initSearchWindow({
    mode: "library",
    tabs: false,
    options: false,  // no whole-word / advanced conditions on this page
    scope: true,     // the scope section is always visible here
    onOpen: onWindowOpen,
    onInput: windowSearch,
    onOpenPage: onWindowOpenPage,
  });
  winInput = ui.input;
  winResults = ui.results;
  winHistoryList = ui.historyList;
  winHistoryClearEl = ui.historyClear;

  readURLParams();
  el.input.value = _q;
  updateSearchClear();

  // History dropdown: shown when the empty input is focused or clicked
  // (the box is auto-focused at load, so a plain click would otherwise never
  // fire a focus event), closed by outside-click (registerDropdown below),
  // typing, or Escape.
  el.input.addEventListener("focus", function () {
    if (!this.value.trim() && !_skipHistoryOnFocus) renderSearchHistory();
    _skipHistoryOnFocus = false;
  });
  el.input.addEventListener("click", function () {
    if (!this.value.trim()) renderSearchHistory();
  });
  window.registerDropdown("searchHistoryDropdown", el.history, el.input);

  // Clear-search button — visible while the box has text; clears the search
  // and resets to the hint state on click (replaces the native browser X).
  if (el.clearBtn) el.clearBtn.addEventListener("click", function () {
    el.input.value = "";
    updateSearchClear();
    runSearchAndRender();
    el.input.focus();
  });

  // Debounced search while typing (the scope modal can't be open here — the
  // overlay blocks the page — so no need to close it)
  el.input.addEventListener("input", function () {
    el.history.style.display = "none";
    clearTimeout(_searchTimer);
    updateSearchClear();
    _searchTimer = setTimeout(runSearchAndRender, 150);
  });

  // Tag chips (scoping)
  el.tagsRow.addEventListener("click", onChipsClick);
  _refreshTags = window.initTagsCollapse("libTagsCollapse", "libTagsToggle");

  // Book-scope picker (button opens the scope modal)
  el.scopeBtn = document.getElementById("libScopeBtn");
  if (el.scopeBtn) {
    renderScopeButton();
    el.scopeBtn.addEventListener("click", openScopeModal);
  }

  // Authors + Periods browse buttons — the modals count over the searchable
  // set (books really in the library), the same set the facets filter.
  var btnAuthors = document.getElementById("libAuthorsBtn");
  if (btnAuthors) btnAuthors.addEventListener("click", function () {
    ensureSearchableBooks().then(function () { openAuthorsModal(searchableBooks()); });
  });
  var btnPeriods = document.getElementById("libPeriodsBtn");
  if (btnPeriods) btnPeriods.addEventListener("click", function () {
    ensureSearchableBooks().then(function () { openPeriodsModal(searchableBooks()); });
  });

  // Search window button — opens the shared modal window
  var btnWindow = document.getElementById("btnSearchWindow");
  if (btnWindow) btnWindow.addEventListener("click", function () {
    openSearchWindow();
  });

  // Language change → re-render chips + results (+ picker labels; the picker
  // module relabels its current surface — modal body or window scope section)
  document.addEventListener("languagechange", function () {
    renderChips();
    if (el.scopeTitle) el.scopeTitle.textContent = t("libScopeTitle");
    refreshScopeLabels();
    // An open browse modal re-renders in the new language via the facet
    // module's own languagechange listener
    if (_q) runSearchAndRender();
    // The window's own labels re-render via the shell's languagechange
    // listener; its cached results re-render here (no re-search).
    if (_winLastQ && _winLastResults) {
      renderWindowResults(_winLastResults, _winLastQ, _winLastInfo,
        _winLastNarrowed, _winLastScopeCount);
    }
  });

  // Focus mode button (collapse chips + count, keep the search visible)
  var btnFocus = document.getElementById("btnFocus");
  if (btnFocus) {
    btnFocus.style.display = "";
    btnFocus.addEventListener("click", function () {
      window.setFocus(!document.documentElement.hasAttribute("data-focus"));
    });
  }

  // Keyboard: / or Ctrl+F focuses the input, Escape clears it, Alt+Z toggles
  // focus mode (Ctrl+, settings / Ctrl+b back are handled in common.js)
  document.addEventListener("keydown", function (e) {
    var isInput = window.isTypingTarget(e);
    if (
      (e.key === "/" || (e.key === "f" && (e.ctrlKey || e.metaKey))) &&
      !isInput
    ) {
      e.preventDefault();
      el.input.focus();
      el.input.select();
    }
    if (e.key === "z" && !isInput && e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      window.setFocus(!document.documentElement.hasAttribute("data-focus"));
    }
    // Enter commits the query into the search history (the debounced
    // search-as-you-type still runs on every pause — Enter just records it)
    if (e.key === "Enter" && e.target === el.input) {
      e.preventDefault();
      clearTimeout(_searchTimer);
      var q = el.input.value.trim();
      if (!q) return;
      el.history.style.display = "none";
      runSearchAndRender();
    }
    // Escape closes the scope modal via the shared modal layer (common.js)
    if (e.key === "Escape" && isInput && e.target === el.input) {
      el.input.value = "";
      _q = "";
      syncURL();
      el.history.style.display = "none";
      showEmpty("libSearchHint");
      el.input.blur();
    }
  });

  // Registries feed the chips + scoping + result titles
  await loadTagDefinitions();
  await loadAuthorDefinitions();
  _bookNames = await loadBookRegistry();
  // The searchable book list (registry ∩ index) — the set the author/period
  // facets count over, so the counts only cover books really in the library.
  await ensureSearchableBooks();

  // A ?tags= share link scopes the picker to the tag groups too — chips and
  // the picker share one scope (intersecting a tag with the HDT default would
  // empty the search). Runs after ensureSearchableBooks: the groups need the
  // searchable list. The picker's default scope also settles here, so the
  // scope button re-renders with its true label.
  if (_selectedTags.length > 0) {
    var tagCodes = [];
    _selectedTags.forEach(function (tc) {
      tagCodes = tagCodes.concat(groupBookCodes(tc));
    });
    setScope(tagCodes.length > 0 ? tagCodes : null);
    // The picker's default notify above already showed the HDT group in the
    // window's summary — this restore replaces the scope, so refresh every
    // surface the same way the picker would (the window's summary; the
    // page's button re-renders just below).
    window.dispatchEvent(new CustomEvent("libScopeChange"));
  }
  renderScopeButton();

  // Facet changes (chips, browse modals, the search window — the one shared
  // facet state) re-sync the URL, chips and results
  onFacetChange(function () {
    syncURL();
    renderChips();
    if (_q) runSearchAndRender();
  });

  renderChips();

  // Run the shared ?q= search (or show the hint)
  if (_q) runSearchAndRender();
  else showEmpty("libSearchHint");

  // Auto-focus search on desktop — skip popping the history dropdown over a
  // fresh page; it appears on any later focus of the empty input.
  if (window.innerWidth > window.MOBILE_BP) {
    _skipHistoryOnFocus = true;
    el.input.focus();
  }
}

init();
