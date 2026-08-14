/**
 * Library Search Page Module (books/library-search.html)
 * Cross-book search UI — the engine itself lives in js/library-search-engine.js
 * (pure module: loadSearchIndex / searchLibrary / tokenizeText) and the word
 * index in data/search-index.json (built by data/07-rebuild-searchIndex.mjs).
 *
 * This page is self-initialising. It reads ?q=, ?tags= and ?books= from the
 * URL (shareable links), renders tag chips scoped to the visible books, and
 * groups results by book with inline peek previews. ?books= is the book-scope
 * picker (narrow the search to specific books; the chips narrow by category,
 * the picker by book — the two intersect in computeScope). Result deep-links
 * and peeks navigate to reader.html?book=X&row=N&q=… — the reader already
 * consumes that query (pre-highlights + scrolls to the row).
 */

import { tagLabel, t, currentLang } from "./i18n.js";
import { loadSearchIndex, searchLibrary } from "./library-search-engine.js";
import {
  loadTagDefinitions,
  loadBookRegistry,
  extractTags,
  tagSearchWords,
  getBookVersionSync,
  getCsvPath,
} from "./book-data.js";
import { fetchBookCSVCached } from "./csv.js";
import {
  escapeHTML,
  parseQuery,
  compileQuery,
  rowMatchesQueryNorm,
  buildNormData,
  buildSnippets,
  highlightMatches,
  addSearchHistory,
  getSearchHistory,
  removeSearchHistoryItem,
  clearSearchHistory,
  normaliseForSearch,
} from "./search-utils.js";

// ── Page state ───────────────────────────────────────────────
var _bookNames = null; // full registry (incl. -HDN books)
var _q = ""; // current query (trimmed)
var _selectedTags = []; // active tag chips (OR — same semantics as the grid)
var _selectedBooks = null; // book scope: null = every book; else explicit bookCode list
var _searchableBooks = null; // picker list — visible books that are in the search index
var _bookByCode = {}; // bookCode → registry entry (picker titles)
var _scopeFilter = ""; // picker's filter-box text
var _searchTimer = null; // input debounce
var _refreshTags = null; // tag-row collapse refresh (common.js)
var _skipHistoryOnFocus = false; // true only for the initial desktop auto-focus

var PEEK_BATCH = 8;
var _peekCache = {}; // bookCode → q → {q, allData, normAllData, compiled, matches, pos, hasRowNums}

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
  scopeFilter: null,
  scopeTypes: null,
  scopeTypesLabel: null,
  scopeChips: null,
  scopeList: null,
  scopeCount: null,
  scopeReset: null,
};

/** Substitute {k} placeholders in an i18n template string. */
function fillTemplate(key, map) {
  var s = t(key);
  for (var k in map) s = s.replace("{" + k + "}", map[k]);
  return s;
}

// ── URL sync (?q= / ?tags= / ?books= — shareable links) ──────
function readURLParams() {
  var params = new URLSearchParams(window.location.search);
  _q = (params.get("q") || "").trim();
  var tagsParam = params.get("tags");
  if (tagsParam) {
    _selectedTags = tagsParam.split(",").map(function (x) { return x.trim(); })
      .filter(function (x) { return x; });
  }
  var booksParam = params.get("books");
  if (booksParam) {
    var books = booksParam.split(",").map(function (x) { return x.trim(); })
      .filter(function (x) { return x; });
    if (books.length > 0) _selectedBooks = books;
  }
}

/** Keep ?q=, ?tags= and ?books= in the address bar — the URL stays shareable. */
function syncURL() {
  var params = new URLSearchParams();
  if (_q) params.set("q", _q);
  if (_selectedTags.length > 0) params.set("tags", _selectedTags.join(","));
  if (_selectedBooks && _selectedBooks.length > 0) params.set("books", _selectedBooks.join(","));
  var qs = params.toString();
  history.replaceState(null, "", qs ? "?" + qs : window.location.pathname);
}

// ── Tag chips ────────────────────────────────────────────────
/** Render the chip row with counts over visible (-HDN excluded) books. */
function renderChips() {
  var visible = (_bookNames || []).filter(function (b) {
    return !b.bookCode.endsWith("-HDN");
  });
  var tagCounts = {};
  visible.forEach(function (b) {
    extractTags(b.bookCode, b).forEach(function (tg) {
      if (!tagCounts[tg.code])
        tagCounts[tg.code] = { label: tg.label, palette: tg.palette, count: 0 };
      tagCounts[tg.code].count++;
    });
  });
  var tagsActive = _selectedTags.length > 0;
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
        _selectedTags.indexOf(code) !== -1,
        tc.count
      );
    })
    .join("");
  el.tagsCollapse.innerHTML =
    '<span class="tags-label">' + t("tagsLabel") + "</span> " + allChipHTML + html;
  if (_refreshTags) _refreshTags();
}

function onChipsClick(e) {
  var chip = e.target.closest(".tag-chip");
  if (!chip) return;
  var tag = chip.dataset.tag;
  if (tag === window.TAG_ALL) {
    _selectedTags = [];
  } else {
    var idx = _selectedTags.indexOf(tag);
    if (idx === -1) _selectedTags.push(tag);
    else _selectedTags.splice(idx, 1);
  }
  syncURL();
  renderChips();
  if (_q) runSearchAndRender();
}

// ── Book-scope picker ────────────────────────────────────────
// The picker narrows the search to specific books (the tag chips narrow by
// category — the two intersect in computeScope). Scope lives in ?books= so a
// scoped search stays shareable. The picker lists only books the index
// actually knows (meta.bookIds): RDF dictionaries and other
// ENTIRE-BOOK-excluded books are absent by design — they have no postings.

/** The picker's book list, lazily derived from the index meta. */
function ensureSearchableBooks() {
  if (_searchableBooks) return Promise.resolve();
  return loadSearchIndex()
    .then(function (index) {
      var ids = index.meta.bookIds;
      _searchableBooks = (_bookNames || []).filter(function (b) {
        return !b.bookCode.endsWith("-HDN") && ids.indexOf(b.bookCode) !== -1;
      });
    })
    .catch(function () {
      // Index unavailable → fall back to every visible book (search is
      // failing anyway; the list is still honest about the registry).
      _searchableBooks = (_bookNames || []).filter(function (b) {
        return !b.bookCode.endsWith("-HDN");
      });
    })
    .then(function () {
      _bookByCode = {};
      _searchableBooks.forEach(function (b) {
        _bookByCode[b.bookCode] = b;
      });
    });
}

/** Group the searchable books by EVERY tag they carry — the same semantics as
 *  the page's tag row, not just the primary prefix tag — so a book carrying
 *  several tags appears in several groups. */
function scopeGroups() {
  var groups = {};
  var order = [];
  _searchableBooks.forEach(function (b) {
    extractTags(b.bookCode, b).forEach(function (tg) {
      var g = groups[tg.code];
      if (!g) {
        g = groups[tg.code] = { code: tg.code, label: tg.label, palette: tg.palette, codes: [] };
        order.push(tg.code);
      }
      g.codes.push(b.bookCode);
    });
  });
  // Group order follows the registry's row order (palette slot), not the code.
  order.sort(function (a, b) {
    return groups[a].palette - groups[b].palette;
  });
  return order.map(function (c) {
    return groups[c];
  });
}

/**
 * Is the book in the explicit selection? null (no scope) means every book is
 * searched, but nothing is ticked — same metaphor as the tag chips' "All"
 * chip: an empty selection is not a restriction. Ticking a book from the
 * "everything" state narrows to exactly that book.
 */
function isBookSelected(code) {
  return !!_selectedBooks && _selectedBooks.indexOf(code) !== -1;
}

function allCodes() {
  return _searchableBooks.map(function (b) {
    return b.bookCode;
  });
}

/** Update _selectedBooks for one book; a full selection collapses to null. */
function setBookSelected(code, on) {
  var all = allCodes();
  var cur = _selectedBooks ? _selectedBooks.slice() : [];
  var i = cur.indexOf(code);
  if (on && i === -1) cur.push(code);
  if (!on && i !== -1) cur.splice(i, 1);
  // Empty and full both mean "no restriction" — an empty array would pass the
  // truthy scope check in computeScope and return zero results.
  _selectedBooks = (cur.length === 0 || cur.length === all.length) ? null : cur;
}

/** Update _selectedBooks for a whole type group (the popover's chips). */
function setGroupSelected(tagCode, on) {
  var gs = scopeGroups();
  var group = null;
  for (var i = 0; i < gs.length; i++) {
    if (gs[i].code === tagCode) { group = gs[i]; break; }
  }
  if (!group) return;
  var all = allCodes();
  var cur = _selectedBooks ? _selectedBooks.slice() : [];
  for (var g = 0; g < group.codes.length; g++) {
    var code = group.codes[g];
    var i = cur.indexOf(code);
    if (on && i === -1) cur.push(code);
    if (!on && i !== -1) cur.splice(i, 1);
  }
  _selectedBooks = (cur.length === 0 || cur.length === all.length) ? null : cur;
}

function isGroupFullySelected(tagCode) {
  var gs = scopeGroups();
  for (var i = 0; i < gs.length; i++) {
    if (gs[i].code !== tagCode) continue;
    for (var j = 0; j < gs[i].codes.length; j++) {
      if (!isBookSelected(gs[i].codes[j])) return false;
    }
    return true;
  }
  return false;
}

/** Scope changed → URL, button, modal, and (if querying) re-search. */
function applyScopeChange() {
  syncURL();
  renderScopeButton();
  if (scopeModalOpen() && el.scopeList) {
    renderScopePopover();
  }
  if (_q) runSearchAndRender();
}

function renderScopeButton() {
  if (!el.scopeBtn) return;
  var label;
  if (!_selectedBooks) {
    label = t("libScopeAll");
  } else if (_selectedBooks.length === 1) {
    label = t("libScopeCountOne");
  } else {
    label = fillTemplate("libScopeCount", { n: _selectedBooks.length });
  }
  // "Search in: <state>" — the prefix teaches the button's purpose at a
  // glance (it controls which books the search runs in), while the state part
  // reports the current scope; the modal title's own "search in" phrasing.
  el.scopeBtn.textContent = t("libScopeSearchIn") + " " + label + " ▾";
}

/**
 * The modal's shell (head + empty containers) — rendered once. Only the inner
 * lists/chips are rebuilt on filter/selection changes, so the filter input
 * keeps its focus and the reset button keeps its listener.
 */
function renderScopeShell() {
  el.scopeBody.innerHTML =
    // One pinned header row spanning both panes: the rail's "Tags" pane label
    // rightmost (above the rail), the filter and the count over the list.
    // Everything below the header scrolls inside its own pane — the label
    // never scrolls out of view with the chips. The reset button lives in the
    // header beside the count, not in the rail: it clears the whole scope (a
    // picker-wide action, not a chip-local one) and stays reachable even when
    // the rail is scrolled — and sitting next to the "N of M books selected"
    // readout, it reads as the undo for the very state the count shows.
    // Desktop maps label and head to the grid's first row; the stacked layout
    // puts the label above the chips row, which comes above the filter row,
    // which comes above the list (the filter stays directly above the list it
    // describes).
    '<div id="libScopeTypesLabel" class="lib-scope-pane-label">' + t("libScopeTypesLabel") + "</div>" +
    // The rail: only the chips (a plain, always-visible element — no state to
    // survive a rebuild). The chips sub-container is the whole rail, so it is
    // rebuilt on filter/selection changes with no listeners to preserve.
    '<div id="libScopeTypes" class="lib-scope-types">' +
    '<span id="libScopeChips" class="lib-scope-chips"></span>' +
    "</div>" +
    '<div class="lib-scope-head">' +
    '<input type="search" id="libScopeFilter" class="search-input lib-scope-filter" ' +
    'placeholder="' + t("libScopeFilter") + '" autocomplete="off" title="Filter books" />' +
    '<div id="libScopeCount" class="lib-scope-count"></div>' +
    '<button type="button" id="libScopeReset" class="toolbar-btn lib-scope-reset">' +
    t("libScopeReset") + "</button>" +
    "</div>" +
    '<div id="libScopeList" class="lib-scope-list"></div>';
  el.scopeFilter = document.getElementById("libScopeFilter");
  el.scopeTypes = document.getElementById("libScopeTypes");
  el.scopeTypesLabel = document.getElementById("libScopeTypesLabel");
  el.scopeChips = document.getElementById("libScopeChips");
  el.scopeList = document.getElementById("libScopeList");
  el.scopeCount = document.getElementById("libScopeCount");
  el.scopeReset = document.getElementById("libScopeReset");
  el.scopeFilter.addEventListener("input", function () {
    _scopeFilter = this.value;
    renderScopePopover();
  });
  el.scopeReset.addEventListener("click", function () {
    if (_selectedBooks === null) return; // nothing scoped → nothing to reset
    _selectedBooks = null;
    applyScopeChange();
  });
  // Delegation on the containers — they survive list re-renders. No
  // outside-click handler exists for modals (backdrop click closes via
  // e.target === overlay), so a re-render detaching the clicked chip is safe.
  el.scopeTypes.addEventListener("click", function (e) {
    var chip = e.target.closest(".tag-chip");
    if (!chip || chip.dataset.tag === window.TAG_ALL) return;
    setGroupSelected(chip.dataset.tag, !isGroupFullySelected(chip.dataset.tag));
    applyScopeChange();
  });
  el.scopeList.addEventListener("change", function (e) {
    var cb = e.target;
    if (cb.type !== "checkbox" || !cb.dataset.book) return;
    setBookSelected(cb.dataset.book, cb.checked);
    applyScopeChange();
  });
}

function scopeRowHTML(code) {
  var b = _bookByCode[code];
  var title = "";
  if (b) {
    var l = currentLang();
    title = l === "dv" ? b.titleDV : l === "ar" ? b.titleAR : b.titleEN;
    if (!title) title = b.titleEN || b.titleDV || b.titleAR || "";
  }
  // The secondary line is the book's Arabic title — its canonical name in
  // every language; the row's tooltip carries the machine code (the ?books=
  // value) for power users sharing links.
  return (
    '<label class="lib-scope-row" data-book="' + code + '" title="' + code + '">' +
    '<input type="checkbox" data-book="' + code + '"' +
    (isBookSelected(code) ? " checked" : "") + " />" +
    '<span class="lib-scope-title">' + escapeHTML(title || code) + "</span>" +
    '<span class="lib-scope-sub">' + escapeHTML(b && b.titleAR ? b.titleAR : "") + "</span></label>"
  );
}

function renderScopePopover() {
  if (!_searchableBooks || !el.scopeList) return;
  var groups = scopeGroups();
  var total = allCodes().length;
  var selCount = _selectedBooks ? _selectedBooks.length : total;
  el.scopeChips.innerHTML = groups.map(function (g) {
    return window.tagChipHtml(g.code, g.label, g.palette, isGroupFullySelected(g.code), g.codes.length);
  }).join("");
  var f = normaliseForSearch(_scopeFilter.toLowerCase());
  var html = [];
  // The rail's chips show every tag a book carries, so a book belongs to
  // several groups — but the list is a picker, not a taxonomy: each book
  // renders exactly once, under its first group (groups run in the tag
  // registry's file order, which is also the palette/display order); a
  // group label whose books were all claimed by earlier groups is skipped.
  var seen = {};
  groups.forEach(function (g) {
    var shown = g.codes.filter(function (code) {
      if (seen[code]) return false;
      seen[code] = true;
      if (!f) return true;
      var b = _bookByCode[code];
      var hay = normaliseForSearch(((b ? (b.titleAR || "") + " " + (b.titleDV || "") + " " + (b.titleEN || "") : "") +
        " " + code +
        // Tag words (labels + aliases, all languages) — a query hitting a
        // tag's text finds every book carrying that tag's code.
        // normaliseForSearch: same script-level equivalence as the dashboard
        // (hamza/tashkeel forms, Thaana dotted letters), then lowercase for
        // Latin case-insensitivity.
        (b ? " " + tagSearchWords(code, b) : "")).toLowerCase());
      return hay.indexOf(f) !== -1;
    });
    if (shown.length === 0) return;
    html.push('<div class="lib-scope-group-label">' + tagLabel(g.code, g.label) + "</div>");
    shown.forEach(function (code) {
      html.push(scopeRowHTML(code));
    });
  });
  el.scopeList.innerHTML = html.join("") ||
    '<div class="lib-scope-none">' + t("libScopeNoMatch") + "</div>";
  // Unscoped → "44 books"; scoped → "4 of 44 books selected"
  el.scopeCount.textContent = _selectedBooks
    ? fillTemplate("libScopeFoot", { n: selCount, m: total })
    : fillTemplate("libScopeCount", { n: total });
}

function scopeModalOpen() {
  return !!el.scopeOverlay && el.scopeOverlay.classList.contains("open");
}

/**
 * Pin the count's width to its widest state so ticking books never resizes
 * the filter beside it — the same swap-stability contract as
 * window.reserveWidestText elsewhere. The count's shapes are enumerable: the
 * unscoped "N books" and the scoped "S of N books selected" templates, with
 * the most digits (S = N-1) giving the widest — so the reservation is exact,
 * not a guess. The modal must be visible to measure, so this runs right
 * after openModal and on language change while the modal is open.
 */
function reserveScopeCountWidth() {
  var t = allCodes().length;
  var s = t > 1 ? t - 1 : 1;
  window.reserveWidestText(el.scopeCount, [
    fillTemplate("libScopeCount", { n: t }),
    fillTemplate("libScopeFoot", { n: s, m: t })
  ]);
}

/** Open the book-scope modal (created lazily via the unified modal layer). */
function openScopeModal() {
  var open = function () {
    if (!el.scopeOverlay) {
      el.scopeOverlay = window.createModal("libScopeOverlay", "libScopeModalTitle", "libScopeModalBody", "lib-scope-modal");
      el.scopeTitle = document.getElementById("libScopeModalTitle");
      el.scopeBody = document.getElementById("libScopeModalBody");
      renderScopeShell();
    }
    el.scopeTitle.textContent = t("libScopeTitle");
    _scopeFilter = "";
    if (el.scopeFilter) el.scopeFilter.value = "";
    renderScopePopover();
    window.openModal("libScopeOverlay");
    reserveScopeCountWidth(); // must measure while the modal is visible
  };
  if (!_searchableBooks) {
    ensureSearchableBooks().then(open);
    return;
  }
  open();
}

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
  if (_selectedBooks && _selectedBooks.length > 0) {
    visible = visible.filter(function (b) {
      return _selectedBooks.indexOf(b.bookCode) !== -1;
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

/** Run the search and render results (caller debounces). */
function runSearchAndRender() {
  _q = (el.input.value || "").trim();
  syncURL();
  if (!_q) {
    showEmpty("libSearchHint");
    return;
  }
  // Empty-scope guard: active tags or a book scope that match no books must
  // NOT fall through to an unscoped search (the engine treats [] as
  // "every book").
  var scope = computeScope();
  if ((_selectedTags.length > 0 || (_selectedBooks && _selectedBooks.length > 0)) && scope.length === 0) {
    showEmpty("libNoResults");
    return;
  }
  // Record the query as it is applied — same as the reader (applySearch), so
  // typing alone lands in history; no Enter needed.
  addSearchHistory(_q, window.LS_KEYS.libSearchHistory);
  el.count.style.display = "none";
  el.results.innerHTML = '<div class="empty-state">' + t("libSearching") + "</div>";
  loadSearchIndex()
    .then(function (index) {
      renderResults(searchLibrary(index, _q, scope), _q);
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
// Same pattern as the reader's: every applied search commits (own key —
// lib:searchHistory), the dropdown appears when the empty input is focused,
// items re-run on click, ✕ removes one, "Clear" empties all.
function renderSearchHistory() {
  var items = getSearchHistory(window.LS_KEYS.libSearchHistory);
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
      removeSearchHistoryItem(parseInt(this.dataset.idx), window.LS_KEYS.libSearchHistory);
      renderSearchHistory();
    });
  });
  // Clear-all button
  var clearAll = el.history.querySelector(".search-history-clear");
  if (clearAll) clearAll.addEventListener("click", function () {
    clearSearchHistory(window.LS_KEYS.libSearchHistory);
    el.history.style.display = "none";
  });
}

// ── Result peek (expand to preview matching rows inline) ─────
// Clicking ▾ on a result fetches THAT book (through the on-device IndexedDB
// cache — instant once opened before), runs the reader's exact search
// machinery over it, and shows the first few matching rows as highlighted
// snippets with a "Show next" pager. Each snippet deep-links to its row.

/** Load the book + compute all matching positions (cached per book+query). */
function peekEnsureData(bookCode, q) {
  var cached = _peekCache[bookCode] && _peekCache[bookCode][q];
  if (cached && cached.q === q) return Promise.resolve(cached);
  // QRN books are 6,236-slot skeletons — empty rows are untranslated ayahs.
  // The peek's row numbers must match the reader's merged table (and the
  // index postings), which keep those rows, so parse them with keepEmpty.
  return fetchBookCSVCached(
    bookCode,
    getBookVersionSync(bookCode),
    getCsvPath(bookCode),
    bookCode.indexOf("QRN-") === 0,
  ).then(function (rows) {
    if (!rows || rows.length < 2) throw new Error("Book has no content");
    var allData = rows.slice(1);
    var normAllData = buildNormData(allData);
    var compiled = compileQuery(parseQuery(q));
    var matches = [];
    for (var i = 0; i < allData.length; i++) {
      if (rowMatchesQueryNorm(allData[i], normAllData[i], compiled)) {
        matches.push(i);
      }
    }
    var entry = {
      q: q,
      allData: allData,
      normAllData: normAllData,
      compiled: compiled,
      matches: matches,
      pos: 0,
      hasRowNums:
        (rows[0][0] || "").trim() === "#" || (rows[0][0] || "").trim() === "",
    };
    (_peekCache[bookCode] = _peekCache[bookCode] || {})[q] = entry;
    return entry;
  });
}

/** One matching row as a highlighted, clickable snippet. */
function peekItemHTML(entry, q, bookCode, position) {
  var row = entry.allData[position];
  var label = entry.hasRowNums ? row[0] || position + 1 : position + 1;
  var snippets = buildSnippets(
    row,
    entry.compiled,
    q,
    entry.normAllData[position],
  );
  var text = snippets[0] || "";
  if (!text) {
    // Fallback: first non-row-number cell, raw highlight
    var cell = "";
    for (var c = 0; c < row.length; c++) {
      if (entry.hasRowNums && c === 0) continue;
      if (row[c]) { cell = row[c]; break; }
    }
    text = highlightMatches(String(cell).slice(0, 240), q);
  }
  return (
    '<a class="lib-peek-item" href="reader.html?book=' +
    bookCode +
    "&row=" +
    (position + 1) +
    "&q=" +
    encodeURIComponent(q) +
    '" title="' +
    bookCode +
    " row " +
    (position + 1) +
    '">' +
    '<span class="lib-peek-num">#' +
    label +
    "</span>" +
    '<span class="lib-peek-text">' +
    text +
    "</span></a>"
  );
}

/** Append the next batch of matches into the peek, update the pager. */
function peekRenderBatch(peekEl, entry, q, bookCode) {
  var items = peekEl.querySelector(".lib-peek-items");
  var moreBtn = peekEl.querySelector(".lib-peek-more");
  if (!items) return;
  var batch = entry.matches.slice(entry.pos, entry.pos + PEEK_BATCH);
  entry.pos += batch.length;
  var html = "";
  for (var i = 0; i < batch.length; i++) {
    html += peekItemHTML(entry, q, bookCode, batch[i]);
  }
  items.insertAdjacentHTML("beforeend", html);
  if (moreBtn) {
    if (entry.pos >= entry.matches.length) {
      moreBtn.style.display = "none";
    } else {
      moreBtn.style.display = "";
      moreBtn.textContent = fillTemplate("libShowNext", {
        n: Math.min(PEEK_BATCH, entry.matches.length - entry.pos),
      });
    }
  }
}

/** Load + render the first peek batch into an open peek. */
function openPeek(root, bookCode, q) {
  var peek = root.querySelector(".lib-peek");
  var items = peek.querySelector(".lib-peek-items");
  var moreBtn = peek.querySelector(".lib-peek-more");
  if (moreBtn) moreBtn.style.display = "none";
  if (items.childElementCount > 0) return; // already rendered (collapse/re-open)
  items.innerHTML = '<div class="lib-peek-loading">' + t("libSearching") + "</div>";
  peekEnsureData(bookCode, q)
    .then(function (entry) {
      if (!root.classList.contains("peek-open")) return; // closed while loading
      entry.pos = 0;
      items.innerHTML = "";
      peekRenderBatch(peek, entry, q, bookCode);
    })
    .catch(function () {
      if (!root.classList.contains("peek-open")) return;
      items.innerHTML =
        '<div class="lib-peek-loading">⚠️ Error: Failed to load the book. ' +
        '<button class="retry-btn" data-peek-retry="1">↺ Retry</button></div>';
      var retryBtn = items.querySelector("[data-peek-retry]");
      if (retryBtn)
        retryBtn.addEventListener("click", function () {
          items.innerHTML = "";
          openPeek(root, bookCode, q);
        });
    });
}

function togglePeek(root, bookCode, q) {
  var peek = root.querySelector(".lib-peek");
  var toggle = root.querySelector(".lib-peek-toggle");
  var open = root.classList.toggle("peek-open");
  if (toggle) toggle.textContent = open ? "▴" : "▾";
  if (open) {
    peek.style.display = "";
    openPeek(root, bookCode, q);
  } else {
    peek.style.display = "none";
  }
}

/** Render grouped-by-book results into the results area. */
function renderResults(results, q) {
  if (!results || results.length === 0) {
    showEmpty("libNoResults");
    return;
  }
  var total = 0;
  for (var i = 0; i < results.length; i++) total += results[i].count;
  el.count.style.display = "";
  el.count.textContent = fillTemplate("libResultSummary", { a: total, b: results.length });
  el.results.innerHTML =
    '<div class="lib-results">' +
    results
      .map(function (r) {
        var meta = (_bookNames || []).find(function (b) {
          return b.bookCode === r.bookCode;
        });
        var tags = meta ? extractTags(meta.bookCode, meta) : [];
        var tagHtml =
          tags.length > 0
            ? '<div class="card-tags">' +
              tags
                .map(function (tg) {
                  return (
                    '<span class="tag-badge' +
                    (tg.palette >= 0 ? " tag-palette-" + tg.palette : "") +
                    '" title="Category: ' +
                    tagLabel(tg.code, tg.label, "en") +
                    '">' +
                    tagLabel(tg.code, tg.label) +
                    "</span>"
                  );
                })
                .join("") +
              "</div>"
            : "";
        var link =
          "reader.html?book=" +
          r.bookCode +
          "&row=" +
          r.firstRow +
          "&q=" +
          encodeURIComponent(q);
        return (
          '<div class="card lib-result" data-book="' +
          r.bookCode +
          '" data-q="' +
          escapeHTML(q) +
          '">' +
          '<div class="lib-result-top">' +
          '<a class="lib-result-link" href="' +
          link +
          '" title="' +
          r.bookCode +
          '">' +
          tagHtml +
          '<div class="title-ar">' +
          escapeHTML(meta ? meta.titleAR || "" : "") +
          "</div>" +
          '<div class="title-dv">' +
          escapeHTML(meta ? meta.titleDV || "" : "") +
          "</div>" +
          '<div class="title-en">' +
          escapeHTML(meta ? meta.titleEN || r.bookCode : r.bookCode) +
          "</div>" +
          '<div class="lib-result-meta">' +
          fillTemplate("libBookMatches", { n: r.count }) +
          "</div>" +
          "</a>" +
          '<button class="toolbar-btn lib-peek-toggle" title="Preview matches in this book">▾</button>' +
          "</div>" +
          '<div class="lib-peek" style="display:none">' +
          '<div class="lib-peek-items"></div>' +
          '<button class="toolbar-btn lib-peek-more" style="display:none"></button>' +
          "</div>" +
          "</div>"
        );
      })
      .join("") +
    "</div>";

  // Wire peek toggles + paging (rows are static HTML at this point)
  el.results.querySelectorAll(".lib-result").forEach(function (root) {
    var bookCode = root.dataset.book;
    var peekQ = root.dataset.q;
    var toggle = root.querySelector(".lib-peek-toggle");
    if (toggle)
      toggle.addEventListener("click", function () {
        togglePeek(root, bookCode, peekQ);
      });
    var more = root.querySelector(".lib-peek-more");
    if (more)
      more.addEventListener("click", function () {
        var entry = _peekCache[bookCode] && _peekCache[bookCode][peekQ];
        if (entry)
          peekRenderBatch(root.querySelector(".lib-peek"), entry, peekQ, bookCode);
      });
  });
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

  // Language change → re-render chips + results (+ picker placeholder)
  document.addEventListener("languagechange", function () {
    renderChips();
    if (el.scopeTitle) el.scopeTitle.textContent = t("libScopeTitle");
    if (el.scopeTypesLabel) el.scopeTypesLabel.textContent = t("libScopeTypesLabel");
    if (el.scopeFilter) el.scopeFilter.placeholder = t("libScopeFilter");
    if (el.scopeReset) el.scopeReset.textContent = t("libScopeReset");
    if (scopeModalOpen()) reserveScopeCountWidth(); // templates changed
    if (_q) runSearchAndRender();
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
  _bookNames = await loadBookRegistry();
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
