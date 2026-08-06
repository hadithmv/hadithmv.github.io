/**
 * Dashboard Module
 * The book catalog view (books/index.html): card/table grid, search, tag
 * chips, sort, pins & history modals, keyboard, focus mode, continue-reading.
 * Pure page module — the metadata layer lives in book-data.js (imported here).
 */

import { tagLabel, t } from "./i18n.js";
import { normaliseForSearch } from "./search-utils.js";
import { loadTagDefinitions, loadBookNames, extractTags } from "./book-data.js";
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
    var bookNames = await loadBookNames();
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

  // Apply search filter
  var q = _dashFilter.search.trim();
  if (q) {
    var nq = normaliseForSearch(q);
    visible = visible.filter(function (b) {
      return (
        normaliseForSearch(b.titleDV || "").indexOf(nq) !== -1 ||
        normaliseForSearch(b.titleAR || "").indexOf(nq) !== -1 ||
        normaliseForSearch(b.titleEN || "").indexOf(nq) !== -1 ||
        normaliseForSearch(b.bookCode || "").indexOf(nq) !== -1
      );
    });
  }

  // Apply tag filter — OR: a book shows when it carries ANY selected tag
  if (_dashFilter.tags.length > 0) {
    visible = visible.filter(function (b) {
      var bookTags = extractTags(b.bookCode, b).map(function (t) {
        return t.code;
      });
      return _dashFilter.tags.some(function (tc) {
        return bookTags.indexOf(tc) !== -1;
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
    extractTags(b.bookCode, b).forEach(function (t) {
      if (!tagCounts[t.code])
        tagCounts[t.code] = { label: t.label, palette: t.palette, count: 0 };
      tagCounts[t.code].count++;
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
      '<span class="dash-tag-chip' +
      (pinsActive ? " active" : "") +
      '" data-tag="__pins__" title="' +
      (pinsActive ? "Remove filter: Pinned" : "Filter by pinned") +
      '" style="color:' +
      (pinsActive ? "#fff" : "var(--color-danger-text)") +
      ";background:" +
      (pinsActive ? "var(--color-danger-text)" : "var(--color-danger-bg)") +
      ';border-color:var(--color-danger-text)">' +
      (pinsActive ? '<span class="chip-x">✕</span>' : "") +
      "📌 " +
      t("dashPinsChip") +
      " <small>(" +
      pinnedVisible.length +
      ")</small></span>";
  }

  var tagsActive = _dashFilter.tags.length > 0;
  var allChipHTML =
    '<span class="dash-tag-chip' +
    (tagsActive ? "" : " active") +
    '" data-tag="__all__" title="' +
    (tagsActive ? "Clear all tag filters" : "Showing all books") +
    '">' +
    t("tagFilterAll") +
    " <small>(" +
    allVisible.length +
    ")</small></span>";

  var chipsHTML = Object.keys(tagCounts)
    .sort()
    .map(function (code) {
      var tc = tagCounts[code];
      var active = _dashFilter.tags.indexOf(code) !== -1;
      var chipTitle = active
        ? "Remove filter: " + tc.label
        : "Filter by " + tc.label;
      var palClass = tc.palette >= 0 ? " tag-palette-" + tc.palette : "";
      return (
        '<span class="dash-tag-chip' +
        (active ? " active" : "") +
        palClass +
        '" data-tag="' +
        code +
        '" title="' +
        chipTitle +
        '">' +
        (active ? '<span class="chip-x">✕</span>' : "") +
        tagLabel(code, tc.label) +
        " <small>(" +
        tc.count +
        ")</small></span>"
      );
    })
    .join("");
  document.getElementById("dashboardPanelTags").innerHTML =
    pinsChipHTML + allChipHTML + chipsHTML
      ? '<span class="dash-label">' +
        t("dashboardTagsLabel") +
        "</span> " +
        pinsChipHTML +
        allChipHTML +
        chipsHTML
      : "";

  // Result count
  document.getElementById("dashboardResultCount").textContent =
    t("dashboardBooksLabel") + " " + visible.length;

  // Update view toggle button text
  var vt = document.getElementById("dashboardViewToggle");
  if (vt)
    vt.textContent = t(
      _dashTableMode ? "btnViewToggleCard" : "btnViewToggleText",
    );

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
          // other books show the row number with the "Page" word
          (h0.label || t("ddColPage") + " " + h0.row) +
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
    grid.innerHTML = '<div class="dash-empty">' + t("dashboardNoMatch") + "</div>";
    return;
  }

  if (_dashTableMode) {
    grid.style.display = "block";
    grid.innerHTML =
      '<div class="dash-table-wrap"><table class="dash-table"><thead><tr>' +
      "<th>" +
      t("dashColTitleAR") +
      "</th>" +
      "<th>" +
      t("dashColTitleDV") +
      "</th>" +
      "<th>" +
      t("dashColTitleEN") +
      "</th>" +
      "<th>" +
      t("dashColTags") +
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
                  .map(function (t) {
                    return (
                      '<span class="tag-badge' +
                      (t.palette >= 0 ? " tag-palette-" + t.palette : "") +
                      '" title="Category: ' +
                      tagLabel(t.code, t.label, "en") +
                      '">' +
                      tagLabel(t.code, t.label) +
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
                .map(function (t) {
                  return (
                    '<span class="tag-badge' +
                    (t.palette >= 0 ? " tag-palette-" + t.palette : "") +
                    '" title="Category: ' +
                    tagLabel(t.code, t.label, "en") +
                    '">' +
                    tagLabel(t.code, t.label) +
                    "</span>"
                  );
                })
                .join("") +
              "</div>"
            : "";
        return (
          '<a href="reader.html?book=' +
          book.bookCode +
          '" class="book-card" title="' +
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
  var si = document.getElementById("dashboardSearch");
  var sc = document.getElementById("dashboardSearchClear");
  var ss = document.getElementById("dashboardSort");
  var tc = document.getElementById("dashboardPanelTags");
  if (!si) return;

  si.addEventListener("input", function () {
    _dashFilter.search = this.value;
    sc.style.display = this.value ? "" : "none";
    renderDashboard(_lastBookNames);
  });
  sc.addEventListener("click", function () {
    si.value = "";
    _dashFilter.search = "";
    sc.style.display = "none";
    refreshView();
    si.focus();
  });
  ss.addEventListener("change", function () {
    _dashFilter.sort = this.value;
    refreshView();
  });

  // ── Library search jump ("search in books") ────────────────
  // The button is an anchor to library-search.html; carry the search box
  // text (?q=) and any selected tag chips (?tags=) over so the page starts
  // searching with the same scope. Pins are NOT carried (the page has none).
  var libBtn = document.getElementById("dashboardLibSearch");
  if (libBtn) {
    libBtn.addEventListener("click", function (e) {
      var params = new URLSearchParams();
      var q = (si.value || "").trim();
      if (q) params.set("q", q);
      if (_dashFilter.tags.length > 0)
        params.set("tags", _dashFilter.tags.join(","));
      var qs = params.toString();
      e.preventDefault();
      window.location.href = qs ? "library-search.html?" + qs : "library-search.html";
    });
  }
  tc.addEventListener("click", function (e) {
    var chip = e.target.closest(".dash-tag-chip");
    if (!chip) return;
    var tag = chip.dataset.tag;
    if (tag === "__pins__") {
      _dashFilter.pinsOnly = !_dashFilter.pinsOnly;
    } else if (tag === "__all__") {
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

  var vt = document.getElementById("dashboardViewToggle");
  if (vt)
    vt.addEventListener("click", function () {
      _dashTableMode = !_dashTableMode;
      refreshView();
    });

  var dr = document.getElementById("dashboardReset");
  if (dr)
    dr.addEventListener("click", function () {
      _dashFilter = {
        search: "",
        tags: [],
        sort: "az",
        pinsOnly: false,
      };
      _dashTableMode = false;
      si.value = "";
      sc.style.display = "none";
      ss.value = "az";
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
    var startBtn = document.getElementById("dashFuncScrollStart");
    var endBtn = document.getElementById("dashFuncScrollEnd");
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
      si.focus();
    }
    if (e.key === "z" && !isInput && e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      window.setFocus(!document.documentElement.hasAttribute("data-focus"));
    }
    if (e.key === "Escape" && isInput && e.target === si) {
      si.value = "";
      _dashFilter.search = "";
      sc.style.display = "none";
      refreshView();
      si.blur();
    }
    if (e.key === "p" && !isInput && e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      var bpd = document.getElementById("btnPinsDropdown");
      if (bpd) bpd.click();
    }
    if (e.key === "h" && !isInput && e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      var bhd = document.getElementById("btnHistoryDropdown");
      if (bhd) bhd.click();
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

  // Auto-focus search on desktop
  if (window.innerWidth > 600) si.focus();
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
  if (_lastBookNames && _lastBookNames.length > 0) {
    refreshView();
  }
});
