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
  formatThousands,
} from "./search-utils.js";
import {
  initScopePicker,
  getScope,
  setScope,
  ensureSearchableBooks,
  renderScopeShell,
  ensureScopeShell,
  renderScopePopover,
  reserveScopeCountWidth,
  scopeModalOpen,
  clearScopeFilter,
  refreshScopeLabels,
  fillTemplate,
} from "./library-scope-picker.js";
import {
  initSearchWindow,
  getSearchWindowUI,
  openSearchWindow,
  buildBookRowsHTML,
  setWindowCount,
} from "./search-window.js";

// ── Page state ───────────────────────────────────────────────
var _bookNames = null; // full registry (incl. -HDN books)
var _q = ""; // current query (trimmed)
var _selectedTags = []; // active tag chips (OR — same semantics as the grid)
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
};

// ── Search window (library mode) ─────────────────────────────
// The window shares the page's state — the scope picker's selection and the
// page input's query (copied over on open) — but searches independently:
// typing in the window never touches the page behind it, which stays fully
// functional as the fallback surface.
var winInput = null;      // #searchWindowInput
var winResults = null;    // #searchWindowResults
var winHistoryList = null; // #searchWindowHistoryList (items — innerHTML)
var _winView = "card";    // card | list (window view toggle)
var _winLastQ = null;     // last window query + results (view re-render, no re-search)
var _winLastResults = null;

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
    if (books.length > 0) setScope(books);
  }
}

/** Keep ?q=, ?tags= and ?books= in the address bar — the URL stays shareable. */
function syncURL() {
  var params = new URLSearchParams();
  if (_q) params.set("q", _q);
  if (_selectedTags.length > 0) params.set("tags", _selectedTags.join(","));
  var scopeBooks = getScope();
  if (scopeBooks && scopeBooks.length > 0) params.set("books", scopeBooks.join(","));
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

// ── Book-scope picker (wiring) ───────────────────────────────
// The picker's machinery lives in js/library-scope-picker.js — state
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
  var scopeBooks = getScope();
  var label;
  if (!scopeBooks) {
    label = t("libScopeAll");
  } else if (scopeBooks.length === 1) {
    label = t("libScopeCountOne");
  } else {
    label = fillTemplate("libScopeCount", { n: scopeBooks.length });
  }
  // "Search in: <state>" — the prefix teaches the button's purpose at a
  // glance (it controls which books the search runs in), while the state part
  // reports the current scope; the modal title's own "search in" phrasing.
  el.scopeBtn.textContent = t("libScopeSearchIn") + " " + label + " ▾";
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
  var scopeBooks = getScope();
  if ((_selectedTags.length > 0 || (scopeBooks && scopeBooks.length > 0)) && scope.length === 0) {
    showEmpty("libNoResults");
    return;
  }
  // Record the query as it is applied — same as the reader (applySearch), so
  // typing alone lands in history; no Enter needed.
  addSearchHistory(_q, window.LS_KEYS.searchHistory);
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

/** One result card's markup, shared by the page and the window's card view.
 *  The page cards carry the expandable peek (withPeek); the window's omit it
 *  — no peek buttons there (their ids would collide with the page's cards). */
function resultCardHTML(r, q, withPeek) {
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
    (withPeek
      ? '<button class="toolbar-btn lib-peek-toggle" title="Preview matches in this book">▾</button>'
      : "") +
    "</div>" +
    (withPeek
      ? '<div class="lib-peek" style="display:none">' +
        '<div class="lib-peek-items"></div>' +
        '<button class="toolbar-btn lib-peek-more" style="display:none"></button>' +
        "</div>"
      : "") +
    "</div>"
  );
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
    results.map(function (r) { return resultCardHTML(r, q, true); }).join("") +
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

// ── Search window (library mode) ─────────────────────────────
/** The library search history section — always visible in the side pane
 *  (same terms as the page's dropdown, own key), refreshed on every write.
 *  Clicking a term fills the window input and re-runs the window search. */
function renderWindowHistorySection() {
  var items = getSearchHistory(window.LS_KEYS.searchHistory);
  winHistoryList.innerHTML = items.length === 0
    ? '<div class="search-window-history-empty">' + t("searchWindowNoHistory") + "</div>"
    : items.map(function (term, i) {
        return '<div class="search-history-item" data-idx="' + i + '">' +
          '<span class="hist-text">' + escapeHTML(term) + '</span>' +
          '<span class="hist-remove" data-idx="' + i + '">✕</span></div>';
      }).join("") +
      '<div class="search-history-clear">' + t("searchClearHistory") + '</div>';
  winHistoryList.querySelectorAll(".search-history-item[data-idx]").forEach(function (item) {
    item.addEventListener("click", function (e) {
      if (e.target.classList.contains("hist-remove")) return;
      var term = items[parseInt(this.dataset.idx)];
      winInput.value = term;
      getSearchWindowUI().syncClear();
      windowSearchRun(term);
    });
  });
  winHistoryList.querySelectorAll(".hist-remove").forEach(function (x) {
    x.addEventListener("click", function (e) {
      e.stopPropagation();
      removeSearchHistoryItem(parseInt(this.dataset.idx), window.LS_KEYS.searchHistory);
      renderWindowHistorySection();
    });
  });
  var clearAll = winHistoryList.querySelector(".search-history-clear");
  if (clearAll) clearAll.addEventListener("click", function () {
    clearSearchHistory(window.LS_KEYS.searchHistory);
    renderWindowHistorySection();
  });
}

/** The window's empty state — a quiet placeholder in the results pane; the
 *  history section is not gated on it (always visible). */
function renderWindowHistory() {
  setWindowCount(""); // no query → nothing to count; the head row clears
  winResults.innerHTML =
    '<div class="search-window-empty">' + t("searchWindowEmptyHint") + "</div>";
  winResults.style.display = "";
  renderWindowHistorySection();
}

/** Render the window's search results (card view or compact list view). */
function renderWindowResults(results, q) {
  _winLastQ = q;
  _winLastResults = results;
  var total = 0;
  for (var i = 0; i < results.length; i++) total += results[i].count;
  // The count lives in the window's head row (scope-modal pattern) — the
  // results pane is rows only.
  setWindowCount(fillTemplate("libResultSummary", { a: formatThousands(total), b: results.length }));
  var html = "";
  if (results.length === 0) {
    html += '<div class="search-no-matches">' + t("libNoResults") + "</div>";
  } else if (_winView === "list") {
    html += buildBookRowsHTML(results, q, _bookNames);
  } else {
    html += '<div class="lib-results">' +
      results.map(function (r) { return resultCardHTML(r, q, false); }).join("") +
      "</div>";
  }
  winResults.innerHTML = html;
  winResults.style.display = "";
}

/** Run the window search — the same pipeline as the page's runSearchAndRender
 *  (computeScope includes tag chips + the picker scope, history on its own
 *  key), rendering into the window. */
function windowSearchRun(q) {
  setWindowCount(""); // the head row shows the count only once a run lands
  var scope = computeScope();
  var scopeBooks = getScope();
  if ((_selectedTags.length > 0 || (scopeBooks && scopeBooks.length > 0)) && scope.length === 0) {
    renderWindowResults([], q);
    return;
  }
  addSearchHistory(q, window.LS_KEYS.searchHistory);
  renderWindowHistorySection(); // history stays visible while the search runs
  winResults.innerHTML = '<div class="empty-state">' + t("libSearching") + "</div>";
  winResults.style.display = "";
  loadSearchIndex()
    .then(function (index) {
      renderWindowResults(searchLibrary(index, q, scope), q);
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
 *  window — the page's input, card grid and URL are the full-page form of
 *  the same search (one search, two looks). */
function onWindowOpenPage(q) {
  if (!q) return;
  el.input.value = q;
  updateSearchClear();
  window.closeModal("searchWindowOverlay");
  runSearchAndRender();
}

/** Card/list toggle — re-render the cached results, no re-search. */
function onWindowViewChange(view) {
  _winView = view;
  if (_winLastQ && _winLastResults) renderWindowResults(_winLastResults, _winLastQ);
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

  initScopePicker({
    bookNames: function () { return _bookNames; },
    onScopeChange: applyScopeChange,
  });

  // The search window (library mode): shares the page's scope state, its
  // own input + card/list views. The page stays fully functional behind it.
  var ui = initSearchWindow({
    mode: "library",
    tabs: false,
    options: false,  // no whole-word / advanced conditions on this page
    scope: true,     // the scope section is always visible here
    viewToggle: true,
    onOpen: onWindowOpen,
    onInput: windowSearch,
    onViewChange: onWindowViewChange,
    onOpenPage: onWindowOpenPage,
  });
  winInput = ui.input;
  winResults = ui.results;
  winHistoryList = ui.historyList;

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
    if (_q) runSearchAndRender();
    // The window's own labels re-render via the shell's languagechange
    // listener; its cached results re-render here (no re-search).
    if (_winLastQ && _winLastResults) renderWindowResults(_winLastResults, _winLastQ);
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
