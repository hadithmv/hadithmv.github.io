/**
 * Dashboard Module
 * The book catalog view (books/index.html): card/table grid, search, tag
 * chips, sort, pins & history modals, keyboard, focus mode, continue-reading.
 * Pure page module — the metadata layer lives in book-data.js (imported here).
 */

import { tagLabel, t } from "./i18n.js";
import {
  normaliseForSearch,
  escapeHTML,
  addSearchHistory,
  getSearchHistory,
  removeSearchHistoryItem,
  clearSearchHistory,
} from "./search-utils.js";
import { loadTagDefinitions, loadBookRegistry, extractTags } from "./book-data.js";
import {
  isPinned,
  getPinnedBooks,
  getReadHistory,
  timeAgo,
  renderPins,
  renderHistory,
} from "./pins-history.js";

// ---------------------------------------------------------------------------
// Page initialisation (dashboard only — reader bootstrap lives in book-data.js)
// ---------------------------------------------------------------------------

/**
 * Initialize the dashboard page (books/index.html).
 * Preloads tag definitions, applies any ?tags= deep-link filters, then loads
 * the registry and renders. On fetch failure, shows the error with a Retry
 * button that re-runs this — controls are only wired after a successful load,
 * so re-running never double-wires listeners.
 */
export async function initializeDashboard() {
  // Dashboard got a ?book= link — redirect to the reader
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("book")) {
    window.location.replace("reader.html" + window.location.search);
    return;
  }

  // Preload tag definitions before any rendering — ensures extractTags()
  // has data in the dashboard path.
  await loadTagDefinitions();

  // Read ?tags= from URL for pre-filtered dashboard links
  const urlTags = urlParams.get("tags");
  if (urlTags) {
    _dashFilter.tags = urlTags.split(",");
  }

  var retryBtn = document.getElementById("retryRegistry");
  if (retryBtn) {
    retryBtn.addEventListener("click", function () {
      document.getElementById("errorMessage").style.display = "none";
      retryBtn.style.display = "none";
      var lm = document.getElementById("loadingMessage");
      if (lm) lm.style.display = "";
      loadDashboard();
    });
  }

  async function loadDashboard() {
    var bookNames = await loadBookRegistry();
    if (!bookNames) {
      // Fetch failed — show error + Retry, don't render an empty dashboard
      document.getElementById("loadingMessage").style.display = "none";
      document.getElementById("errorMessage").style.display = "block";
      document.getElementById("errorMessage").textContent =
        "Failed to load the book registry. Please check your connection and try again.";
      if (retryBtn) retryBtn.style.display = "";
      return;
    }
    if (retryBtn) retryBtn.style.display = "none";
    document.getElementById("errorMessage").style.display = "none";
    renderDashboard(bookNames);
    setupDashboardControls();
  }

  await loadDashboard();
}

// ---------------------------------------------------------------------------
// Dashboard state + rendering
// ---------------------------------------------------------------------------
/**
 * Render the book selection grid.
 * Shows an error message when no books could be loaded.
 * @param {Array} bookNames - Array of book metadata objects
 */
let _lastBookNames = null;
let _dashFilter = { search: "", tags: [], sort: "az", pinsOnly: false };
let _dashTableMode = false;
let _refreshTags = null; // tag-row collapse refresh (common.js)

/** Re-render the dashboard view (cards/table). */
function refreshView() {
  renderDashboard(_lastBookNames);
}

function renderDashboard(bookNames) {
  _lastBookNames = bookNames;
  const loading = document.getElementById("loadingMessage");
  if (loading) loading.style.display = "none";

  // Error state: registry is empty (failed to load or no books registered)
  if (!bookNames || bookNames.length === 0) {
    const error = document.getElementById("errorMessage");
    if (error) {
      error.textContent =
        "Unable to load the book registry. Please check your connection and try again.";
      error.style.display = "block";
    }
    return;
  }

  const dashboard = document.getElementById("dashboardWrapper");
  if (dashboard) dashboard.style.display = "block";

  // Filter out hidden books
  var visible = bookNames.filter(function (b) {
    return !b.bookCode.endsWith("-HDN");
  });

  // Apply search filter — whitespace-separated tokens, each must match at
  // least one field, in any order. Hyphens and whitespace are stripped from
  // both sides, so "RDF-rasmee" and "rdfrasmee" find the same book.
  var q = _dashFilter.search.trim();
  if (q) {
    var tokens = q
      .split(/\s+/)
      .map(function (t) {
        return normaliseForSearch(t).replace(/[\s-]/g, "");
      })
      .filter(function (t) {
        return t;
      });
    if (tokens.length > 0) {
      visible = visible.filter(function (b) {
        var haystacks = [
          normaliseForSearch(b.titleDV || "").replace(/[\s-]/g, ""),
          normaliseForSearch(b.titleAR || "").replace(/[\s-]/g, ""),
          normaliseForSearch(b.titleEN || "").replace(/[\s-]/g, ""),
          normaliseForSearch(b.bookCode || "").replace(/[\s-]/g, ""),
        ];
        return tokens.every(function (t) {
          return haystacks.some(function (h) {
            return h.indexOf(t) !== -1;
          });
        });
      });
    }
  }

  // Apply tag filter — OR: a book shows when it carries ANY selected tag
  if (_dashFilter.tags.length > 0) {
    visible = visible.filter(function (b) {
      var bookTags = extractTags(b.bookCode, b).map(function (tag) {
        return tag.code;
      });
      return _dashFilter.tags.some(function (tagCode) {
        return bookTags.indexOf(tagCode) !== -1;
      });
    });
  }

  // Apply pins-only filter
  if (_dashFilter.pinsOnly) {
    var pinnedCodes = getPinnedBooks().map(function (p) {
      return p.bookCode;
    });
    visible = visible.filter(function (b) {
      return pinnedCodes.indexOf(b.bookCode) !== -1;
    });
  }

  // Sort
  visible.sort(function (a, b) {
    var na = (a.titleEN || a.bookCode || "").toLowerCase();
    var nb = (b.titleEN || b.bookCode || "").toLowerCase();
    if (_dashFilter.sort === "az") return na < nb ? -1 : na > nb ? 1 : 0;
    return na < nb ? 1 : na > nb ? -1 : 0;
  });

  // Render tag chips
  var allVisible = bookNames.filter(function (b) {
    return !b.bookCode.endsWith("-HDN");
  });
  var tagCounts = {};
  allVisible.forEach(function (b) {
    extractTags(b.bookCode, b).forEach(function (tag) {
      if (!tagCounts[tag.code])
        tagCounts[tag.code] = { label: tag.label, palette: tag.palette, count: 0 };
      tagCounts[tag.code].count++;
    });
  });
  // Pins filter chip
  var pinnedCodes = getPinnedBooks().map(function (p) {
    return p.bookCode;
  });
  var pinnedVisible = allVisible.filter(function (b) {
    return pinnedCodes.indexOf(b.bookCode) !== -1;
  });
  var pinsChipHTML = "";
  if (pinnedVisible.length > 0) {
    var pinsActive = _dashFilter.pinsOnly;
    pinsChipHTML =
      '<span class="tag-chip' +
      (pinsActive ? " active" : "") +
      '" data-tag="pins" title="' +
      (pinsActive ? "Remove filter: Pinned" : "Filter by pinned") +
      '" style="color:' +
      (pinsActive ? "#fff" : "var(--color-danger-text)") +
      ";background:" +
      (pinsActive ? "var(--color-danger-text)" : "var(--color-danger-bg)") +
      ';border-color:var(--color-danger-text)">' +
      (pinsActive ? '<span class="chip-x">✕</span>' : "") +
      "📌 " +
      t("dashboardPinsChip") +
      " <small>(" +
      pinnedVisible.length +
      ")</small></span>";
  }

  var tagsActive = _dashFilter.tags.length > 0;
  var allChipHTML = window.tagAllChipHtml(tagsActive, allVisible.length);

  var chipsHTML = Object.keys(tagCounts)
    // Palette slot = the tag registry's row position — render in the file's
    // hand-set order, not alphabetical.
    .sort(function (a, b) {
      return tagCounts[a].palette - tagCounts[b].palette;
    })
    .map(function (code) {
      var tagCount = tagCounts[code];
      return window.tagChipHtml(
        code,
        tagCount.label,
        tagCount.palette,
        _dashFilter.tags.indexOf(code) !== -1,
        tagCount.count
      );
    })
    .join("");
  document.getElementById("dashboardTagsCollapse").innerHTML =
    pinsChipHTML + allChipHTML + chipsHTML
      ? '<span class="tags-label">' +
        t("tagsLabel") +
        "</span> " +
        pinsChipHTML +
        allChipHTML +
        chipsHTML
      : "";
  if (_refreshTags) _refreshTags();

  // Result count
  document.getElementById("dashboardResultCount").textContent =
    t("dashboardBooksLabel") + " " + visible.length;

  // Update view toggle button text — reserve the wider of Card/Table so the
  // functions row doesn't shift when the label swaps
  var viewToggleBtn = document.getElementById("dashboardViewToggle");
  if (viewToggleBtn) {
    window.reserveWidestText(viewToggleBtn, [t("btnViewToggleTable"), t("btnViewToggleCard")]);
    viewToggleBtn.textContent = t(_dashTableMode ? "btnViewToggleCard" : "btnViewToggleTable");
  }

  // ── Continue-reading card ──
  // Lives inside the collapsible dashboard panel (so focus mode collapses it
  // with the rest of the chrome). Always shown in every view — search text,
  // tag filters and pins do NOT hide it (a resume shortcut, independent of
  // the grid) — for the most recent history entry whose book is still
  // registered and visible.
  var continueHTML = "";
  {
    var hist = getReadHistory();
    if (hist.length > 0) {
      var h0 = hist[0];
      var hMeta = bookNames.find(function (b) {
        return b.bookCode === h0.bookCode;
      });
      if (hMeta && !hMeta.bookCode.endsWith("-HDN")) {
        var contTitle = hMeta.titleDV || hMeta.titleEN || hMeta.bookCode;
        continueHTML =
          '<a class="dash-continue" href="reader.html?book=' +
          h0.bookCode +
          "&row=" +
          h0.row +
          '" title="Continue reading where you left off">' +
          '<span class="dash-continue-label">' +
          t("continueReading") +
          "</span>" +
          '<span class="dash-continue-title">' +
          contTitle +
          "</span>" +
          '<span class="dash-continue-pos">' +
          // Quran books carry a self-explanatory surah reference label;
          // other books show the row number with the "Page" word — short
          // form on mobile (matchMedia, same 600px breakpoint as the CSS)
          (h0.label ||
            t(
              window.matchMedia("(max-width: 600px)").matches
                ? "ddColPageShort"
                : "ddColPage"
            ) +
              " " +
              h0.row) +
          "</span>" +
          '<span class="dash-continue-time">' +
          timeAgo(h0.timestamp) +
          "</span>" +
          "</a>";
      }
    }
  }
  var continueSlot = document.getElementById("dashboardContinue");
  if (continueSlot) continueSlot.innerHTML = continueHTML;

  // Render card grid or table
  var grid = document.getElementById("bookGrid");
  if (!grid) return;

  // Empty state — no books match the current search/tags. Render a message
  // instead of a blank grid (or a header-only table, which looks broken).
  if (visible.length === 0) {
    grid.style.display = "";
    grid.innerHTML = '<div class="empty-state">' + t("dashboardNoMatch") + "</div>";
    return;
  }

  if (_dashTableMode) {
    grid.style.display = "block";
    grid.innerHTML =
      '<div class="dash-table-wrap"><table class="dash-table"><thead><tr>' +
      "<th>" +
      t("dashboardColTitleAR") +
      "</th>" +
      "<th>" +
      t("dashboardColTitleDV") +
      "</th>" +
      "<th>" +
      t("dashboardColTitleEN") +
      "</th>" +
      "<th>" +
      t("dashboardColTags") +
      "</th></tr></thead><tbody>" +
      visible
        .map(function (book) {
          var tags = extractTags(book.bookCode, book);
          var pinnedBadge = isPinned(book.bookCode)
            ? '<span class="pin-badge" title="Pinned">📌 ޕިން</span>'
            : "";
          var tagHtml =
            pinnedBadge || tags.length > 0
              ? '<div class="dash-table-tags">' +
                pinnedBadge +
                tags
                  .map(function (tag) {
                    return (
                      '<span class="tag-badge' +
                      (tag.palette >= 0 ? " tag-palette-" + tag.palette : "") +
                      '" title="Category: ' +
                      tagLabel(tag.code, tag.label, "en") +
                      '">' +
                      tagLabel(tag.code, tag.label) +
                      "</span>"
                    );
                  })
                  .join("") +
                "</div>"
              : "";
          return (
            '<tr data-href="reader.html?book=' +
            book.bookCode +
            '" title="' +
            book.bookCode +
            '">' +
            "<td>" +
            (book.titleAR || "") +
            "</td>" +
            "<td>" +
            (book.titleDV || "") +
            "</td>" +
            "<td>" +
            (book.titleEN || "") +
            "</td>" +
            "<td>" +
            tagHtml +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table></div>";

    // Make rows clickable
    grid.querySelectorAll(".dash-table tbody tr").forEach(function (tr) {
      tr.addEventListener("click", function () {
        window.location.href = this.dataset.href;
      });
    });
  } else {
    grid.style.display = "";
    grid.innerHTML = visible
      .map(function (book) {
        var tags = extractTags(book.bookCode, book);
        var pinnedBadge = isPinned(book.bookCode)
          ? '<span class="pin-badge" title="Pinned">📌 ޕިން</span>'
          : "";
        var tagHtml =
          pinnedBadge || tags.length > 0
            ? '<div class="card-tags">' +
              pinnedBadge +
              tags
                .map(function (tag) {
                  return (
                    '<span class="tag-badge' +
                    (tag.palette >= 0 ? " tag-palette-" + tag.palette : "") +
                    '" title="Category: ' +
                    tagLabel(tag.code, tag.label, "en") +
                    '">' +
                    tagLabel(tag.code, tag.label) +
                    "</span>"
                  );
                })
                .join("") +
              "</div>"
            : "";
        return (
          '<a href="reader.html?book=' +
          book.bookCode +
          '" class="card book-card" title="' +
          book.bookCode +
          '">' +
          tagHtml +
          '<div class="title-ar">' +
          (book.titleAR || "") +
          "</div>" +
          '<div class="title-dv">' +
          (book.titleDV || "") +
          "</div>" +
          '<div class="title-en">' +
          (book.titleEN || book.bookCode) +
          "</div>" +
          "</a>"
        );
      })
      .join("");
  }
}

// ── Wire dashboard controls ──────────────────────────────────
function setupDashboardControls() {
  var searchInput = document.getElementById("dashboardSearchInput");
  var searchHistoryEl = document.getElementById("searchHistoryDropdown");
  var _skipHistoryOnFocus = false;
  var sortSelect = document.getElementById("dashboardSortSelect");
  var tagsPanel = document.getElementById("dashboardPanelTags");
  if (!searchInput) return;

  // Search history dropdown — same pattern as the reader/library-search pages:
  // every applied search commits to its own key (dash:searchHistory), focus
  // or click of the empty box opens it, item click re-applies the filter, ✕
  // removes one item, "Clear" empties all.
  function renderSearchHistory() {
    var items = getSearchHistory(window.LS_KEYS.dashSearchHistory);
    if (items.length === 0) {
      searchHistoryEl.style.display = "none";
      return;
    }
    window.openDropdown(searchHistoryEl, searchInput, 0);
    var sbRect = searchInput.getBoundingClientRect();
    searchHistoryEl.style.right = window.innerWidth - sbRect.right + "px";
    searchHistoryEl.innerHTML =
      items
        .map(function (term, i) {
          return (
            '<div class="search-history-item" data-idx="' + i + '">' +
            '<span class="hist-text">' + escapeHTML(term) + "</span>" +
            '<span class="hist-remove" data-idx="' + i + '">✕</span></div>'
          );
        })
        .join("") +
      '<div class="search-history-clear">' + t("searchClearHistory") + "</div>";
    searchHistoryEl.style.display = "";
    Array.prototype.forEach.call(
      searchHistoryEl.querySelectorAll(".search-history-item[data-idx]"),
      function (item) {
        item.addEventListener("click", function (e) {
          if (e.target.classList.contains("hist-remove")) return;
          e.stopPropagation();
          searchInput.value = items[parseInt(this.dataset.idx, 10)];
          _dashFilter.search = searchInput.value;
          updateSearchClear();
          addSearchHistory(_dashFilter.search, window.LS_KEYS.dashSearchHistory);
          searchHistoryEl.style.display = "none";
          refreshView();
        });
      }
    );
    Array.prototype.forEach.call(
      searchHistoryEl.querySelectorAll(".hist-remove"),
      function (x) {
        x.addEventListener("click", function (e) {
          e.stopPropagation();
          removeSearchHistoryItem(parseInt(this.dataset.idx, 10), window.LS_KEYS.dashSearchHistory);
          renderSearchHistory();
        });
      }
    );
    var clearAll = searchHistoryEl.querySelector(".search-history-clear");
    if (clearAll)
      clearAll.addEventListener("click", function () {
        clearSearchHistory(window.LS_KEYS.dashSearchHistory);
        searchHistoryEl.style.display = "none";
      });
  }

  // Dropdown shows when the empty box is focused OR clicked (the box is
  // auto-focused at load, so a plain click would otherwise fire no focus
  // event); typing, Escape, or outside-click closes it (registerDropdown).
  searchInput.addEventListener("focus", function () {
    if (!this.value.trim() && !_skipHistoryOnFocus) renderSearchHistory();
    _skipHistoryOnFocus = false;
  });
  searchInput.addEventListener("click", function () {
    if (!this.value.trim()) renderSearchHistory();
  });
  window.registerDropdown("searchHistoryDropdown", searchHistoryEl, searchInput);

  // Clear-search button — visible while the box has text; clears the filter
  // and restores the full grid on click (replaces the native browser X).
  var searchClearBtn = document.getElementById("dashboardSearchClear");
  function updateSearchClear() {
    if (searchClearBtn) searchClearBtn.classList.toggle("visible", !!searchInput.value);
  }
  if (searchClearBtn) searchClearBtn.addEventListener("click", function () {
    searchInput.value = "";
    _dashFilter.search = "";
    searchHistoryEl.style.display = "none";
    updateSearchClear();
    refreshView();
    searchInput.focus();
  });

  searchInput.addEventListener("input", function () {
    searchHistoryEl.style.display = "none";
    _dashFilter.search = this.value;
    updateSearchClear();
    // Record as the filter applies — same as the reader (applySearch), so
    // typing alone lands in history; no Enter needed. addSearchHistory's own
    // debounce absorbs the keystroke burst.
    addSearchHistory(this.value, window.LS_KEYS.dashSearchHistory);
    renderDashboard(_lastBookNames);
  });
  sortSelect.addEventListener("change", function () {
    _dashFilter.sort = this.value;
    refreshView();
  });
  // Native selects size to the selected option — reserve the widest option so
  // the row doesn't shift when the sort changes (the Arabic options differ in
  // width; re-measured on language change below)
  window.reserveWidestText(sortSelect);
  // Tag row collapse — the chevron appears only when the chips overflow one
  // row; refresh re-measures after every chips re-render (search/reset/lang).
  _refreshTags = window.initTagsCollapse("dashboardTagsCollapse", "dashboardTagsToggle");

  // ── Library search jump ("search in books") ────────────────
  // The button is an anchor to library-search.html; carry the search box
  // text (?q=) and any selected tag chips (?tags=) over so the page starts
  // searching with the same scope. Pins are NOT carried (the page has none).
  var libBtn = document.getElementById("dashboardLibSearch");
  if (libBtn) {
    libBtn.addEventListener("click", function (e) {
      var params = new URLSearchParams();
      var q = (searchInput.value || "").trim();
      if (q) params.set("q", q);
      if (_dashFilter.tags.length > 0)
        params.set("tags", _dashFilter.tags.join(","));
      var qs = params.toString();
      e.preventDefault();
      window.location.href = qs ? "library-search.html?" + qs : "library-search.html";
    });
  }
  tagsPanel.addEventListener("click", function (e) {
    var chip = e.target.closest(".tag-chip");
    if (!chip) return;
    var tag = chip.dataset.tag;
    if (tag === "pins") {
      _dashFilter.pinsOnly = !_dashFilter.pinsOnly;
    } else if (tag === window.TAG_ALL) {
      _dashFilter.tags = [];
    } else {
      var idx = _dashFilter.tags.indexOf(tag);
      if (idx === -1) _dashFilter.tags.push(tag);
      else _dashFilter.tags.splice(idx, 1);
    }
    // Sync URL with active tags
    var url = window.location.pathname;
    if (_dashFilter.tags.length > 0)
      url += "?tags=" + _dashFilter.tags.join(",");
    history.replaceState(null, "", url);
    refreshView();
  });

  // ── Pins & History modal triggers ─────────────────────────

  var btnPD = document.getElementById("btnPinsDropdown");
  if (btnPD)
    btnPD.addEventListener("click", function (e) {
      e.stopPropagation();
      window.openPinsModal();
    });

  var btnHD = document.getElementById("btnHistoryDropdown");
  if (btnHD)
    btnHD.addEventListener("click", function (e) {
      e.stopPropagation();
      window.openHistoryModal();
    });

  // Escape handled centrally in common.js

  var viewToggleBtn = document.getElementById("dashboardViewToggle");
  if (viewToggleBtn)
    viewToggleBtn.addEventListener("click", function () {
      _dashTableMode = !_dashTableMode;
      refreshView();
    });

  var resetBtn = document.getElementById("dashboardReset");
  if (resetBtn)
    resetBtn.addEventListener("click", function () {
      _dashFilter = {
        search: "",
        tags: [],
        sort: "az",
        pinsOnly: false,
      };
      _dashTableMode = false;
      searchInput.value = "";
      sortSelect.value = "az";
      history.replaceState(null, "", window.location.pathname);
      // NOTE: pins & history survive the dashboard reset — they only clear via
      // the modals' confirmed "Clear all" or the settings button.
      renderDashboard(_lastBookNames);
    });

  // ── Functions row horizontal scroll (arrows + wheel, reader-toolbar style) ──
  (function () {
    var wrap = document.getElementById("dashboardPanelFunctions");
    var scroller = wrap && wrap.querySelector(".dash-functions-scroll");
    if (!scroller) return;
    var startBtn = document.getElementById("dashboardFunctionScrollStart");
    var endBtn = document.getElementById("dashboardFunctionScrollEnd");
    var STEP = 240;

    function updateArrows() {
      var max = scroller.scrollWidth - scroller.clientWidth;
      var cur = Math.abs(scroller.scrollLeft); // Chrome/FF RTL both normalise here
      if (startBtn) startBtn.classList.toggle("hidden", cur < 2);
      if (endBtn) endBtn.classList.toggle("hidden", cur > max - 2);
    }

    function smoothScrollBy(delta) {
      var start = scroller.scrollLeft;
      var startTime = performance.now();
      function easeOut(k) { return 1 - Math.pow(1 - k, 3); }
      function animate(now) {
        var k = Math.min((now - startTime) / 250, 1);
        scroller.scrollLeft = start + delta * easeOut(k);
        if (k < 1) requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
    }

    // RTL scroll direction: content start is rightmost; scrolling toward the
    // end (leftward) decreases the signed scrollLeft in both engines. Same
    // convention as the reader toolbar: fwd (◀) = -STEP, back (▶) = +STEP.
    if (startBtn) startBtn.addEventListener("click", function () { smoothScrollBy(STEP); });
    if (endBtn) endBtn.addEventListener("click", function () { smoothScrollBy(-STEP); });
    scroller.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);
    // Wheel over the row → horizontal scroll (same as the reader chrome);
    // wheel-down scrolls toward the end, matching the ◀ arrow
    wrap.addEventListener(
      "wheel",
      function (e) {
        if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.preventDefault();
          scroller.scrollLeft -= e.deltaX || e.deltaY;
        }
      },
      { passive: false }
    );
    updateArrows();
  })();

  // Keyboard shortcuts (dashboard only — guards check for visible wrapper)
  document.addEventListener("keydown", function (e) {
    var wrap = document.getElementById("dashboardWrapper");
    if (!wrap || wrap.style.display === "none") return;
    // Don't intercept when typing in an input
    var isInput = window.isTypingTarget(e);
    if (
      (e.key === "/" || (e.key === "f" && (e.ctrlKey || e.metaKey))) &&
      !isInput
    ) {
      e.preventDefault();
      searchInput.focus();
    }
    if (e.key === "z" && !isInput && e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      window.setFocus(!document.documentElement.hasAttribute("data-focus"));
    }
    if (e.key === "Escape" && isInput && e.target === searchInput) {
      searchInput.value = "";
      _dashFilter.search = "";
      searchHistoryEl.style.display = "none";
      refreshView();
      searchInput.blur();
    }
    if (e.key === "p" && !isInput && e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      var pinsBtn = document.getElementById("btnPinsDropdown");
      if (pinsBtn) pinsBtn.click();
    }
    if (e.key === "h" && !isInput && e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      var historyBtn = document.getElementById("btnHistoryDropdown");
      if (historyBtn) historyBtn.click();
    }
  });

  // ── Focus mode ─────────────────────────────────────────────
  var dashBtnFocus = document.getElementById("btnFocus");
  if (dashBtnFocus) {
    dashBtnFocus.style.display = "";
    dashBtnFocus.addEventListener("click", function () {
      window.setFocus(!document.documentElement.hasAttribute("data-focus"));
    });
  }

  // Auto-focus search on desktop — skip popping the history dropdown over a
  // fresh page; it shows on any later focus/click of the empty box.
  if (window.innerWidth > window.MOBILE_BP) {
    _skipHistoryOnFocus = true;
    searchInput.focus();
  }
}

// Re-render dashboard on settings reset (if visible)
document.addEventListener("dashboardReset", function () {
  if (_lastBookNames && _lastBookNames.length > 0) {
    renderPins();
    renderHistory();
    refreshView();
  }
});

// Re-render dashboard on language change (if visible)
document.addEventListener("languagechange", function () {
  // The sort options re-translate — re-reserve the select's width
  window.reserveWidestText(document.getElementById("dashboardSortSelect"));
  if (_lastBookNames && _lastBookNames.length > 0) {
    refreshView();
  }
});
