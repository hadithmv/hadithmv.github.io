/**
 * Database Lookup Module
 * Loads and manages 02-registry-bookNames.csv and 01-registry-bookTags.csv metadata.
 * All configuration lives in CSV files — no hardcoded data.
 */

import { tagLabel, t, currentLang } from "./i18n.js";
import { normaliseForSearch } from "./search.js";
import { parseCSV } from "./csv.js";

function parseCSVWithHeader(text) {
  var rows = parseCSV(text);
  if (rows.length === 0) return [];
  var headers = rows[0].map(function (h) { return h.trim(); });
  return rows.slice(1).map(function (row) {
    var obj = {};
    headers.forEach(function (h, i) { obj[h] = (row[i] || "").trim(); });
    return obj;
  });
}

let bookNamesCache = null;
let tagDefinitionsCache = null;

// ---------------------------------------------------------------------------
// Tag definitions — loaded from 01-registry-bookTags.csv
// ---------------------------------------------------------------------------

/**
 * Generate palette CSS with golden-ratio HSL slots (infinite, always distinct).
 * Inserts a <style> tag so colours auto-respond to theme changes.
 */
var _paletteCSSInjected = false;
function injectPaletteCSS(slotCount) {
  if (_paletteCSSInjected) return;
  _paletteCSSInjected = true;
  var css = "";
  for (var n = 0; n < slotCount; n++) {
    var hue = Math.round((n * 137.508) % 360);
    // Light / sepia
    css += '.tag-palette-' + n + ' { --tag-color: hsl(' + hue + ',55%,40%); --tag-bg: hsl(' + hue + ',40%,94%); }';
    // Dark
    css += '[data-theme="dark"] .tag-palette-' + n + ' { --tag-color: hsl(' + hue + ',50%,75%); --tag-bg: hsl(' + hue + ',25%,14%); }';
  }
  var style = document.createElement("style");
  style.id = "tag-palette-css";
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Load tag definitions from 01-registry-bookTags.csv.
 * Cached after first load; safe to call multiple times.
 * @returns {Promise<Object>} Map of tag code → {label, palette}
 */
async function loadTagDefinitions() {
  if (tagDefinitionsCache) {
    return tagDefinitionsCache;
  }

  try {
    const response = await fetch("../data/01-registry-bookTags.csv");
    if (!response.ok) {
      throw new Error(`Failed to load tags (HTTP ${response.status})`);
    }
    const csv = await response.text();

    var result = parseCSVWithHeader(csv);

    // Generate palette CSS with enough slots (tags + headroom)
    var tagCount = 0;
    for (var i = 0; i < result.length; i++) {
      if (result[i].code && result[i].code !== "PIN") tagCount++;
    }
    injectPaletteCSS(Math.max(tagCount + 8, 20));

    // Build lookup map — assign sequential palette slot to each tag (skipping PIN)
    tagDefinitionsCache = {};
    var palIdx = 0;
    for (var i = 0; i < result.length; i++) {
      var row = result[i];
      if (row.code) {
        var code = row.code;
        var palette = (code === "PIN") ? -1 : palIdx++;
        tagDefinitionsCache[code] = {
          label: row.label || code,
          palette: palette
        };
      }
    }
    return tagDefinitionsCache;
  } catch (error) {
    console.error("Error loading 01-registry-bookTags.csv:", error);
    // Cache the empty result so we don't retry endlessly
    tagDefinitionsCache = {};
    return tagDefinitionsCache;
  }
}

/**
 * Extract tag codes from a bookCode.
 * Tags are all leading segments separated by '-', excluding the last segment
 * (which is the actual book name). Only tags registered in tags.csv are returned.
 *
 * Reads from the cached tag definitions — call loadTagDefinitions() first
 * to populate the cache, or the function returns no tags (graceful fallback).
 *
 * @param {string} bookCode - e.g. "AQD-DFK-sharhuSunnahBarbahari"
 * @returns {Array<{code: string, label: string, color: string, bg: string}>}
 */
function extractTags(bookCode) {
  if (!bookCode) return [];
  const parts = bookCode.split("-");
  const tagCodes = parts.slice(0, -1);
  const defs = tagDefinitionsCache || {};
  return tagCodes
    .filter((code) => defs[code])
    .map((code) => ({
      code,
      label: defs[code].label,
      palette: defs[code].palette,
    }));
}

// ---------------------------------------------------------------------------
// Book registry — loaded from bookNames.csv
// ---------------------------------------------------------------------------

/**
 * Load bookNames.csv and parse it using parseCSV.
 * Uses a cache so the file is only fetched once per page load.
 * @returns {Promise<Array>} Array of book metadata objects (empty on error)
 */
export async function loadBookNames() {
  if (bookNamesCache) {
    return bookNamesCache;
  }

  try {
    const response = await fetch("../data/02-registry-bookNames.csv");
    if (!response.ok) {
      throw new Error(
        `Failed to load book registry (HTTP ${response.status})`,
      );
    }
    const csv = await response.text();

    var result = parseCSVWithHeader(csv);
    bookNamesCache = result;
    return result;
  } catch (error) {
    console.error("Error loading bookNames.csv:", error);
    return [];
  }
}

/**
 * Look up page metadata by book code
 * @param {string} bookCode - The book code (e.g., "AQD-qawaidulArbau")
 * @returns {Promise<Object|null>} The metadata object or null if not found
 */
export async function getPageMetadata(bookCode) {
  const bookNames = await loadBookNames();
  return bookNames.find((entry) => entry.bookCode === bookCode) || null;
}

/** Sync lookup — cache must already be populated (it is after page init). */
export function getBookTitleSync(bookCode) {
  if (!bookNamesCache) return null;
  var entry = bookNamesCache.find(function (e) { return e.bookCode === bookCode; });
  return entry ? (entry.titleDV || entry.titleEN || bookCode) : null;
}

/**
 * Extract tags from a bookCode.
 * Exported for use in page templates.
 */
export { extractTags };

/**
 * Get CSV path for the current page
 * @param {string} bookCode - The book code without extension
 * @returns {string} Path to the CSV file in data folder
 */
export function getCsvPath(bookCode) {
  return `../data/${bookCode}.csv`;
}

// ── Pins & History (localStorage) ──────────────────────────
const PINNED_KEY = "pinnedBooks";
const HISTORY_KEY = "readHistory";
const MAX_PINS = 10;
const MAX_HISTORY = 10;

export function getPinnedBooks() {
  try { return JSON.parse(localStorage.getItem(PINNED_KEY) || "[]"); } catch (_) { return []; }
}
function setPinnedBooks(arr) {
  try { localStorage.setItem(PINNED_KEY, JSON.stringify(arr)); } catch (_) {}
}
export function isPinned(bookCode) {
  return getPinnedBooks().some(function (p) { return p.bookCode === bookCode; });
}
export function addPin(bookCode, row, label) {
  var pins = getPinnedBooks();
  var idx = pins.findIndex(function (p) { return p.bookCode === bookCode; });
  if (idx !== -1) {
    pins[idx].row = row;
    if (label) pins[idx].label = label;
    pins[idx].addedAt = Date.now();
  } else {
    if (pins.length >= MAX_PINS) return false;
    var entry = { bookCode: bookCode, row: row, addedAt: Date.now() };
    if (label) entry.label = label;
    pins.push(entry);
  }
  setPinnedBooks(pins);
  return true;
}
export function removePin(bookCode) {
  setPinnedBooks(getPinnedBooks().filter(function (p) { return p.bookCode !== bookCode; }));
}
export function movePin(bookCode, dir) {
  var pins = getPinnedBooks();
  var idx = pins.findIndex(function (p) { return p.bookCode === bookCode; });
  if (idx === -1) return;
  var tgt = idx + dir;
  if (tgt < 0 || tgt >= pins.length) return;
  var tmp = pins[idx]; pins[idx] = pins[tgt]; pins[tgt] = tmp;
  setPinnedBooks(pins);
}
export function clearPins() { setPinnedBooks([]); }

export function getReadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch (_) { return []; }
}
function setReadHistory(arr) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(arr)); } catch (_) {}
}
export function addReadHistory(bookCode, row, label) {
  var h = getReadHistory().filter(function (e) { return e.bookCode !== bookCode; });
  var entry = { bookCode: bookCode, row: row, timestamp: Date.now() };
  if (label) entry.label = label;
  h.unshift(entry);
  if (h.length > MAX_HISTORY) h.pop();
  setReadHistory(h);
}
export function removeHistoryEntry(bookCode) {
  setReadHistory(getReadHistory().filter(function (e) { return e.bookCode !== bookCode; }));
}
export function clearReadHistory() { setReadHistory([]); }

function timeAgo(ts) {
  var diff = Date.now() - ts;
  var sec = Math.floor(diff / 1000);
  if (sec < 60) return t("relativeJustNow");
  var min = Math.floor(sec / 60);
  if (min < 60) return min + " " + t("relativeMinutes");
  var hr = Math.floor(min / 60);
  if (hr < 24) return hr + " " + t("relativeHours");
  var dy = Math.floor(hr / 24);
  return dy + " " + t("relativeDays");
}

// Eagerly load book names so bookDisplayName works on all pages
loadBookNames().then(function (list) { _lastBookNames = list; });

function bookDisplayName(bookCode) {
  if (!_lastBookNames) return bookCode;
  var entry = null;
  for (var i = 0; i < _lastBookNames.length; i++) {
    if (_lastBookNames[i].bookCode === bookCode) { entry = _lastBookNames[i]; break; }
  }
  if (!entry) return bookCode;
  var lang = currentLang();
  if (lang === "dv") return entry.titleDV || entry.titleEN || bookCode;
  if (lang === "ar") return entry.titleAR || entry.titleEN || bookCode;
  return entry.titleEN || bookCode;
}

// ── Pins & History modal ──────────────────────────────────

function _ensureModal() {
  if (document.getElementById("pinsHistoryModalOverlay")) return;
  var overlay = document.createElement("div");
  overlay.id = "pinsHistoryModalOverlay";
  overlay.className = "modal-overlay";
  overlay.innerHTML = '<div class="modal pins-history-modal" role="dialog">' +
    '<div class="modal-header">' +
      '<h2 id="pinsHistoryModalTitle"></h2>' +
      '<button class="modal-close" title="Close (Escape key)">✕</button>' +
    '</div>' +
    '<div id="pinsHistoryModalBody" class="pins-history-body"></div>' +
    '</div>';
  document.body.appendChild(overlay);
  // Unified modal wiring
  window.MODAL_IDS.push("pinsHistoryModalOverlay");
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) window.closeModal("pinsHistoryModalOverlay");
  });
  overlay.querySelector(".modal-close").addEventListener("click", function () {
    window.closeModal("pinsHistoryModalOverlay");
  });
}

window.openPinsModal = function () {
  _ensureModal();
  document.getElementById("pinsHistoryModalTitle").textContent = t("dashPinsBtn");
  var body = document.getElementById("pinsHistoryModalBody");
  body.setAttribute("data-mode", "pins");
  var pins = getPinnedBooks();
  if (pins.length === 0) {
    body.innerHTML = '<div class="dd-empty">' + t("pinsEmpty") + '</div>';
  } else {
    var html = '<div class="dd-grid">';
    html += '<div class="dd-header"><span class="dd-col-idx">' + t("ddColIdx") + '</span><span class="dd-col-sort">' + t("ddColSort") + '</span><span class="dd-col-book">' + t("ddColBook") + '</span><span class="dd-col-page">' + t("ddColPage") + '</span><span class="dd-col-remove">' + t("ddColRemove") + '</span></div>';
    for (var i = 0; i < pins.length; i++) {
      var p = pins[i];
      var name = bookDisplayName(p.bookCode);
      html += '<div class="dash-dropdown-item" data-code="' + p.bookCode + '">';
      html += '<span class="dd-col-idx">' + (i + 1) + '</span>';
      html += '<span class="dd-col-sort">';
      html += '<span class="chip-arrow' + (i === 0 ? ' chip-arrow-disabled' : '') + '" data-dir="-1" title="Move up">▲</span>';
      html += '<span class="chip-arrow' + (i === pins.length - 1 ? ' chip-arrow-disabled' : '') + '" data-dir="1" title="Move down">▼</span>';
      html += '</span>';
      html += '<a class="dd-col-book dd-link" href="reader.html?book=' + p.bookCode + '&row=' + p.row + '">' + name + '</a>';
      html += '<span class="dd-col-page">' + (p.label || p.row) + '</span>';
      html += '<span class="dd-col-remove"><span class="chip-x" data-action="remove" title="Remove">✕</span></span>';
      html += '</div>';
    }
    html += '</div><button class="dd-clear-all" id="pinsClearAll">' + t("dashboardClearAll") + '</button>';
    body.innerHTML = html;
    document.getElementById("pinsClearAll").addEventListener("click", function () { clearPins(); window.openPinsModal(); });
  }
  window.openModal("pinsHistoryModalOverlay");
  _wirePinsHistoryModal();
};

window.openHistoryModal = function () {
  _ensureModal();
  document.getElementById("pinsHistoryModalTitle").textContent = t("dashHistoryBtn");
  var body = document.getElementById("pinsHistoryModalBody");
  body.setAttribute("data-mode", "history");
  var history = getReadHistory();
  if (history.length === 0) {
    body.innerHTML = '<div class="dd-empty">' + t("historyEmpty") + '</div>';
  } else {
    var html = '<div class="dd-grid">';
    html += '<div class="dd-header"><span class="dd-col-book">' + t("ddColBook") + '</span><span class="dd-col-page">' + t("ddColPage") + '</span><span class="dd-col-time">' + t("ddColTime") + '</span><span class="dd-col-remove">' + t("ddColRemove") + '</span></div>';
    for (var i = 0; i < history.length; i++) {
      var h = history[i];
      var name = bookDisplayName(h.bookCode);
      html += '<div class="dash-dropdown-item" data-code="' + h.bookCode + '">';
      html += '<a class="dd-col-book dd-link" href="reader.html?book=' + h.bookCode + '&row=' + h.row + '">' + name + '</a>';
      html += '<span class="dd-col-page">' + (h.label || h.row) + '</span>';
      html += '<span class="dd-col-time">' + timeAgo(h.timestamp) + '</span>';
      html += '<span class="dd-col-remove"><span class="chip-x" data-action="remove" title="Remove">✕</span></span>';
      html += '</div>';
    }
    html += '</div><button class="dd-clear-all" id="historyClearAll">' + t("dashboardClearAll") + '</button>';
    body.innerHTML = html;
    document.getElementById("historyClearAll").addEventListener("click", function () { clearReadHistory(); window.openHistoryModal(); });
  }
  window.openModal("pinsHistoryModalOverlay");
  _wirePinsHistoryModal();
};

function closePinsHistoryModal() {
  window.closeModal("pinsHistoryModalOverlay");
}

// Wire sidebar links on both reader and dashboard
(function () {
  var sp = document.getElementById("sidebarPins");
  if (sp) sp.addEventListener("click", function () {
    var sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.remove("open");
    var sOverlay = document.getElementById("sidebarOverlay");
    if (sOverlay) sOverlay.classList.remove("open");
    window.openPinsModal();
  });
  var sh = document.getElementById("sidebarHistory");
  if (sh) sh.addEventListener("click", function () {
    var sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.remove("open");
    var sOverlay = document.getElementById("sidebarOverlay");
    if (sOverlay) sOverlay.classList.remove("open");
    window.openHistoryModal();
  });
})();

function _wirePinsHistoryModal() {
  var body = document.getElementById("pinsHistoryModalBody");
  if (!body) return;
  body.querySelectorAll(".chip-x[data-action='remove']").forEach(function (x) {
    x.addEventListener("click", function (e) {
      e.stopPropagation();
      var item = x.closest(".dash-dropdown-item");
      if (item) {
        if (item.querySelector(".dd-col-sort")) {
          removePin(item.dataset.code); window.openPinsModal();
        } else {
          removeHistoryEntry(item.dataset.code); window.openHistoryModal();
        }
      }
    });
  });
  body.querySelectorAll(".chip-arrow:not(.chip-arrow-disabled)").forEach(function (arrow) {
    arrow.addEventListener("click", function (e) {
      e.stopPropagation();
      var item = arrow.closest(".dash-dropdown-item");
      if (item) { movePin(item.dataset.code, parseInt(arrow.dataset.dir, 10)); window.openPinsModal(); }
    });
  });
}

function renderPins() {
  var overlay = document.getElementById("pinsHistoryModalOverlay");
  if (overlay && overlay.classList.contains("open")) window.openPinsModal();
}
function renderHistory() {
  var overlay = document.getElementById("pinsHistoryModalOverlay");
  if (overlay && overlay.classList.contains("open")) window.openHistoryModal();
}

// ---------------------------------------------------------------------------
// Page initialisation
// ---------------------------------------------------------------------------

/**
 * Initialize page with metadata.
 * When no book is selected, renders the dashboard.
 * When a book is selected, invokes the callback with metadata.
 *
 * Preloads tag definitions so extractTags() works in all downstream paths.
 *
 * @param {Function} callback - Called with metadata object for the selected book
 */
export async function initializePageWithMetadata(callback) {
  // Preload tag definitions before any rendering — ensures extractTags()
  // has data in both the dashboard path and the book-view path.
  await loadTagDefinitions();

  const urlParams = new URLSearchParams(window.location.search);
  const bookCode = urlParams.get("book");

  if (!bookCode) {
    const bookNames = await loadBookNames();
    // Read ?tags= from URL for pre-filtered dashboard links
    var urlTags = urlParams.get("tags");
    if (urlTags) { _dashFilter.tags = urlTags.split(","); }
    renderDashboard(bookNames);
    setupDashboardControls();
    return;
  }

  const metadata = await getPageMetadata(bookCode);

  if (metadata) {
    metadata.csvPath = getCsvPath(bookCode);
    callback(metadata);
  } else {
    // Book not found in registry — show error
    const loading = document.getElementById("loadingMessage");
    if (loading) loading.style.display = "none";

    const error = document.getElementById("errorMessage");
    if (error) {
      error.textContent =
        `Book "${bookCode}" was not found in the registry. ` +
        `The registry may have failed to load, or the book code is incorrect.`;
      error.style.display = "block";
    }
    console.warn(`Metadata not found for book: ${bookCode}`);
  }
}

/**
 * Render the book selection grid.
 * Shows an error message when no books could be loaded.
 * @param {Array} bookNames - Array of book metadata objects
 */
let _lastBookNames = null;
let _dashFilter = { search: "", tags: [], sort: "az", pinsOnly: false };
let _dashTableMode = false;

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
  var visible = bookNames.filter(function (b) { return !b.bookCode.endsWith("-HDN"); });

  // Apply search filter
  var q = _dashFilter.search.trim();
  if (q) {
    var nq = normaliseForSearch(q);
    visible = visible.filter(function (b) {
      return normaliseForSearch(b.titleDV || "").indexOf(nq) !== -1 ||
             normaliseForSearch(b.titleAR || "").indexOf(nq) !== -1 ||
             normaliseForSearch(b.titleEN || "").indexOf(nq) !== -1 ||
             normaliseForSearch(b.bookCode || "").indexOf(nq) !== -1;
    });
  }

  // Apply tag filter
  if (_dashFilter.tags.length > 0) {
    visible = visible.filter(function (b) {
      var bookTags = extractTags(b.bookCode).map(function (t) { return t.code; });
      return _dashFilter.tags.every(function (tc) { return bookTags.indexOf(tc) !== -1; });
    });
  }

  // Apply pins-only filter
  if (_dashFilter.pinsOnly) {
    var pinnedCodes = getPinnedBooks().map(function (p) { return p.bookCode; });
    visible = visible.filter(function (b) { return pinnedCodes.indexOf(b.bookCode) !== -1; });
  }

  // Sort
  visible.sort(function (a, b) {
    var na = (a.titleEN || a.bookCode || "").toLowerCase();
    var nb = (b.titleEN || b.bookCode || "").toLowerCase();
    if (_dashFilter.sort === "az") return na < nb ? -1 : na > nb ? 1 : 0;
    return na < nb ? 1 : na > nb ? -1 : 0;
  });

  // Render tag chips
  var allVisible = bookNames.filter(function (b) { return !b.bookCode.endsWith("-HDN"); });
  var tagCounts = {};
  allVisible.forEach(function (b) {
    extractTags(b.bookCode).forEach(function (t) {
      if (!tagCounts[t.code]) tagCounts[t.code] = { label: t.label, palette: t.palette, count: 0 };
      tagCounts[t.code].count++;
    });
  });
  // Pins filter chip
  var pinnedCodes = getPinnedBooks().map(function (p) { return p.bookCode; });
  var pinnedVisible = allVisible.filter(function (b) { return pinnedCodes.indexOf(b.bookCode) !== -1; });
  var pinsChipHTML = "";
  if (pinnedVisible.length > 0) {
    var pinsActive = _dashFilter.pinsOnly;
    pinsChipHTML = '<span class="dash-tag-chip' + (pinsActive ? ' active' : '') + '" data-tag="__pins__" title="' + (pinsActive ? 'Remove filter: Pinned' : 'Filter by pinned') + '" style="color:' + (pinsActive ? '#fff' : '#dc2626') + ';background:' + (pinsActive ? '#dc2626' : '#fef2f2') + ';border-color:#dc2626">' +
      (pinsActive ? '<span class="chip-x">✕</span>' : '') + '📌 ' + t("dashPinsChip") + ' <small>(' + pinnedVisible.length + ')</small></span>';
  }

  var chipsHTML = Object.keys(tagCounts).sort().map(function (code) {
    var tc = tagCounts[code];
    var active = _dashFilter.tags.indexOf(code) !== -1;
    var chipTitle = active ? "Remove filter: " + tc.label : "Filter by " + tc.label;
    var palClass = (tc.palette >= 0) ? ' tag-palette-' + tc.palette : '';
    return '<span class="dash-tag-chip' + (active ? ' active' : '') + palClass + '" data-tag="' + code + '" title="' + chipTitle + '">' +
      (active ? '<span class="chip-x">✕</span>' : '') + tagLabel(code, tc.label) + ' <small>(' + tc.count + ')</small></span>';
  }).join("");
  document.getElementById("dashboardPanelTags").innerHTML = (pinsChipHTML + chipsHTML)
    ? '<span class="dash-label">' + t("dashboardTagsLabel") + '</span> ' + pinsChipHTML + chipsHTML
    : "";

  // Result count
  document.getElementById("dashboardResultCount").textContent = t("dashboardBooksLabel") + " " + visible.length;

  // Update view toggle button text
  var vt = document.getElementById("dashboardViewToggle");
  if (vt) vt.textContent = t(_dashTableMode ? "btnViewToggleCard" : "btnViewToggleText");

  // Render card grid or table
  var grid = document.getElementById("bookGrid");
  if (!grid) return;

  if (_dashTableMode) {
    grid.style.display = "block";
    grid.innerHTML = '<table class="dash-table"><thead><tr>' +
      '<th>' + t("dashColTitleAR") + '</th>' +
      '<th>' + t("dashColTitleDV") + '</th>' +
      '<th>' + t("dashColTitleEN") + '</th>' +
      '<th>' + t("dashColTags") + '</th></tr></thead><tbody>' +
      visible.map(function (book) {
        var tags = extractTags(book.bookCode);
        var pinnedBadge = isPinned(book.bookCode) ? '<span class="pin-badge" title="Pinned">📌 ޕިން</span>' : '';
        var tagHtml = (pinnedBadge || tags.length > 0)
          ? '<div class="dash-table-tags">' + pinnedBadge + tags.map(function (t) {
              return '<span class="tag-badge' + (t.palette >= 0 ? ' tag-palette-' + t.palette : '') + '" title="Category: ' + tagLabel(t.code, t.label, 'en') + '">' + tagLabel(t.code, t.label) + '</span>';
            }).join("") + '</div>'
          : "";
        return '<tr data-href="reader.html?book=' + book.bookCode + '" title="' + book.bookCode + '">' +
          '<td>' + (book.titleAR || "") + '</td>' +
          '<td>' + (book.titleDV || "") + '</td>' +
          '<td>' + (book.titleEN || "") + '</td>' +
          '<td>' + tagHtml + '</td></tr>';
      }).join("") + '</tbody></table>';

    // Make rows clickable
    grid.querySelectorAll(".dash-table tbody tr").forEach(function (tr) {
      tr.addEventListener("click", function () {
        window.location.href = this.dataset.href;
      });
    });
  } else {
    grid.style.display = "";
    grid.innerHTML = visible.map(function (book) {
      var tags = extractTags(book.bookCode);
      var pinnedBadge = isPinned(book.bookCode) ? '<span class="pin-badge" title="Pinned">📌 ޕިން</span>' : '';
      var tagHtml = (pinnedBadge || tags.length > 0)
        ? '<div class="card-tags">' + pinnedBadge + tags.map(function (t) {
            return '<span class="tag-badge' + (t.palette >= 0 ? ' tag-palette-' + t.palette : '') + '" title="Category: ' + tagLabel(t.code, t.label, 'en') + '">' + tagLabel(t.code, t.label) + '</span>';
          }).join("") + '</div>'
        : "";
      return '<a href="reader.html?book=' + book.bookCode + '" class="book-card" title="' + book.bookCode + '">' +
        tagHtml +
        '<div class="title-ar">' + (book.titleAR || "") + '</div>' +
        '<div class="title-dv">' + (book.titleDV || "") + '</div>' +
        '<div class="title-en">' + (book.titleEN || book.bookCode) + '</div>' +
        '</a>';
    }).join("");
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
    renderDashboard(_lastBookNames);
    si.focus();
  });
  ss.addEventListener("change", function () {
    _dashFilter.sort = this.value;
    renderDashboard(_lastBookNames);
  });
  tc.addEventListener("click", function (e) {
    var chip = e.target.closest(".dash-tag-chip");
    if (!chip) return;
    var tag = chip.dataset.tag;
    if (tag === "__pins__") {
      _dashFilter.pinsOnly = !_dashFilter.pinsOnly;
    } else {
      var idx = _dashFilter.tags.indexOf(tag);
      if (idx === -1) _dashFilter.tags.push(tag);
      else _dashFilter.tags.splice(idx, 1);
    }
    // Sync URL with active tags
    var url = window.location.pathname;
    if (_dashFilter.tags.length > 0) url += "?tags=" + _dashFilter.tags.join(",");
    history.replaceState(null, "", url);
    renderDashboard(_lastBookNames);
  });

  // ── Pins & History modal triggers ─────────────────────────

  var btnPD = document.getElementById("btnPinsDropdown");
  if (btnPD) btnPD.addEventListener("click", function (e) {
    e.stopPropagation();
    window.openPinsModal();
  });

  var btnHD = document.getElementById("btnHistoryDropdown");
  if (btnHD) btnHD.addEventListener("click", function (e) {
    e.stopPropagation();
    window.openHistoryModal();
  });


  // Escape handled centrally in common.js

  var vt = document.getElementById("dashboardViewToggle");
  if (vt) vt.addEventListener("click", function () {
    _dashTableMode = !_dashTableMode;
    renderDashboard(_lastBookNames);
  });

  var dr = document.getElementById("dashboardReset");
  if (dr) dr.addEventListener("click", function () {
    _dashFilter = { search: "", tags: [], sort: "az", pinsOnly: false };
    _dashTableMode = false;
    si.value = "";
    sc.style.display = "none";
    ss.value = "az";
    history.replaceState(null, "", window.location.pathname);
    clearPins();
    clearReadHistory();
    renderPins();
    renderHistory();
    renderDashboard(_lastBookNames);
    si.focus();
  });

  // Keyboard shortcuts (dashboard only — guards check for visible wrapper)
  document.addEventListener("keydown", function (e) {
    var wrap = document.getElementById("dashboardWrapper");
    if (!wrap || wrap.style.display === "none") return;
    // Don't intercept when typing in an input
    var tag = (e.target.tagName || "").toLowerCase();
    var isInput = (tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable);
    if ((e.key === "/" || (e.key === "f" && (e.ctrlKey || e.metaKey))) && !isInput) {
      e.preventDefault();
      si.focus();
    }
    if (e.key === "Escape" && isInput && e.target === si) {
      si.value = "";
      _dashFilter.search = "";
      sc.style.display = "none";
      renderDashboard(_lastBookNames);
      si.blur();
    }
    if (e.key === "p" && !isInput && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      var bpd = document.getElementById("btnPinsDropdown");
      if (bpd) bpd.click();
    }
    if (e.key === "h" && !isInput && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      var bhd = document.getElementById("btnHistoryDropdown");
      if (bhd) bhd.click();
    }
  });

  // Auto-focus search on desktop
  if (window.innerWidth > 600) si.focus();
}

// Re-render dashboard on settings reset (if visible)
document.addEventListener("dashboardReset", function () {
  if (_lastBookNames && _lastBookNames.length > 0) {
    renderPins();
    renderHistory();
    renderDashboard(_lastBookNames);
  }
});

// Re-render dashboard on language change (if visible)
document.addEventListener("languagechange", function () {
  if (_lastBookNames && _lastBookNames.length > 0) {
    renderDashboard(_lastBookNames);
  }
});
