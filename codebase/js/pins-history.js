/**
 * Pins & History Module
 *
 * Bookmark pins (saved reading positions) and reading history log.
 * Storage CRUD + modal UI + sidebar wiring.
 * Extracted from book-data.js.
 */

import { t } from "./i18n.js";
import { getBookTitleSync, resolveBookCode } from "./book-data.js";

// ── Storage ─────────────────────────────────────────────────
const PINNED_KEY = window.LS_KEYS.pinnedBooks;
const HISTORY_KEY = window.LS_KEYS.readHistory;
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
  var evictedName = null;
  if (idx !== -1) {
    pins[idx].row = row;
    if (label) pins[idx].label = label;
    pins[idx].addedAt = Date.now();
  } else {
    if (pins.length >= MAX_PINS) {
      // Full — evict the oldest pin (last in the newest-first list) to make
      // room, mirroring read history's cap behaviour. Return its display name
      // so the caller can tell the user what was dropped.
      evictedName = bookDisplayName(pins.pop().bookCode);
    }
    var entry = { bookCode: bookCode, row: row, addedAt: Date.now() };
    if (label) entry.label = label;
    // Newest pin lands at the top — same ordering as the read-history modal.
    // Updates to an existing pin (the reader's auto-update) keep its position.
    pins.unshift(entry);
  }
  setPinnedBooks(pins);
  return evictedName;
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
  var historyItems = getReadHistory().filter(function (e) { return e.bookCode !== bookCode; });
  var entry = { bookCode: bookCode, row: row, timestamp: Date.now() };
  if (label) entry.label = label;
  historyItems.unshift(entry);
  if (historyItems.length > MAX_HISTORY) historyItems.pop();
  setReadHistory(historyItems);
}
export function removeHistoryEntry(bookCode) {
  setReadHistory(getReadHistory().filter(function (e) { return e.bookCode !== bookCode; }));
}
export function clearReadHistory() { setReadHistory([]); }

// ── Helpers ─────────────────────────────────────────────────
export function timeAgo(ts) {
  var diff = Date.now() - ts;
  var sec = Math.floor(diff / 1000);
  if (sec < 60) return t("relativeJustNow");
  // Mobile drops the "ago" suffix (ކުރިން) — short unit forms, same 600px
  // matchMedia breakpoint as the rest of the chrome
  var short = window.matchMedia("(max-width: 600px)").matches;
  var min = Math.floor(sec / 60);
  if (min < 60) return min + " " + t(short ? "relativeMinutesShort" : "relativeMinutes");
  var hr = Math.floor(min / 60);
  if (hr < 24) return hr + " " + t(short ? "relativeHoursShort" : "relativeHours");
  var dy = Math.floor(hr / 24);
  return dy + " " + t(short ? "relativeDaysShort" : "relativeDays");
}

function bookDisplayName(bookCode) {
  // Stored codes can predate a rename (tag-prefix change) — resolve first
  var title = getBookTitleSync(resolveBookCode(bookCode));
  return title || bookCode;
}

// ── Modal ───────────────────────────────────────────────────
function _ensureModal() {
  window.createModal("pinsHistoryModalOverlay", "pinsHistoryModalTitle", "pinsHistoryModalBody", "pins-history-modal");
}

export function openPinsModal() {
  _ensureModal();
  document.getElementById("pinsHistoryModalTitle").textContent = t("dashboardPinsBtn");
  var body = document.getElementById("pinsHistoryModalBody");
  body.setAttribute("data-mode", "pins");
  var pins = getPinnedBooks();
  if (pins.length === 0) {
    body.innerHTML = '<div class="dd-empty">' + t("pinsEmpty") + '</div>';
  } else {
    var html = '<table class="dd-table">';
    html += '<thead><tr>';
    html += '<th class="dd-col-idx">' + t("ddColIdx") + '</th>';
    html += '<th class="dd-col-sort">' + t("ddColSort") + '</th>';
    html += '<th class="dd-col-book">' + t("ddColBook") + '</th>';
    html += '<th class="dd-col-page">' + t(window.matchMedia("(max-width: 600px)").matches ? "ddColPageShort" : "ddColPage") + '</th>';
    html += '<th class="dd-col-remove">' + t("ddColRemove") + '</th>';
    html += '</tr></thead><tbody>';
    for (var i = 0; i < pins.length; i++) {
      var p = pins[i];
      var name = bookDisplayName(p.bookCode);
      html += '<tr class="dd-row" data-code="' + p.bookCode + '">';
      html += '<td class="dd-col-idx">' + (i + 1) + '</td>';
      html += '<td class="dd-col-sort">';
      html += '<span class="chip-arrow' + (i === 0 ? ' chip-arrow-disabled' : '') + '" data-dir="-1" title="Move up">▲</span>';
      html += '<span class="chip-arrow' + (i === pins.length - 1 ? ' chip-arrow-disabled' : '') + '" data-dir="1" title="Move down">▼</span>';
      html += '</td>';
      html += '<td class="dd-col-book"><a class="dd-link" href="reader.html?book=' + resolveBookCode(p.bookCode) + '&row=' + p.row + '">' + name + '</a></td>';
      html += '<td class="dd-col-page">' + (p.label || p.row) + '</td>';
      html += '<td class="dd-col-remove"><span class="chip-x" data-action="remove" title="Remove">✕</span></td>';
      html += '</tr>';
    }
    html += '</tbody></table><button class="dd-clear-all" id="pinsClearAll">' + t("dashboardClearAll") + '</button>';
    body.innerHTML = html;
    document.getElementById("pinsClearAll").addEventListener("click", function () {
      window.confirmModal("dashboardPinsBtn", "confirmAreYouSure", "dashboardClearAll", function () {
        clearPins();
        window.openPinsModal();
      });
    });
  }
  window.openModal("pinsHistoryModalOverlay");
  _wirePinsHistoryModal();
};

export function openHistoryModal() {
  _ensureModal();
  document.getElementById("pinsHistoryModalTitle").textContent = t("dashboardHistoryBtn");
  var body = document.getElementById("pinsHistoryModalBody");
  body.setAttribute("data-mode", "history");
  var history = getReadHistory();
  if (history.length === 0) {
    body.innerHTML = '<div class="dd-empty">' + t("historyEmpty") + '</div>';
  } else {
    var html = '<table class="dd-table">';
    html += '<thead><tr>';
    html += '<th class="dd-col-book">' + t("ddColBook") + '</th>';
    html += '<th class="dd-col-page">' + t(window.matchMedia("(max-width: 600px)").matches ? "ddColPageShort" : "ddColPage") + '</th>';
    html += '<th class="dd-col-time">' + t("ddColTime") + '</th>';
    html += '<th class="dd-col-remove">' + t("ddColRemove") + '</th>';
    html += '</tr></thead><tbody>';
    for (var i = 0; i < history.length; i++) {
      var entry = history[i];
      var name = bookDisplayName(entry.bookCode);
      html += '<tr class="dd-row" data-code="' + entry.bookCode + '">';
      html += '<td class="dd-col-book"><a class="dd-link" href="reader.html?book=' + resolveBookCode(entry.bookCode) + '&row=' + entry.row + '">' + name + '</a></td>';
      html += '<td class="dd-col-page">' + (entry.label || entry.row) + '</td>';
      html += '<td class="dd-col-time">' + timeAgo(entry.timestamp) + '</td>';
      html += '<td class="dd-col-remove"><span class="chip-x" data-action="remove" title="Remove">✕</span></td>';
      html += '</tr>';
    }
    html += '</tbody></table><button class="dd-clear-all" id="historyClearAll">' + t("dashboardClearAll") + '</button>';
    body.innerHTML = html;
    document.getElementById("historyClearAll").addEventListener("click", function () {
      window.confirmModal("dashboardHistoryBtn", "confirmAreYouSure", "dashboardClearAll", function () {
        clearReadHistory();
        window.openHistoryModal();
      });
    });
  }
  window.openModal("pinsHistoryModalOverlay");
  _wirePinsHistoryModal();
};

// Also expose on window for legacy callers (sidebar links, dashboard buttons)
window.openPinsModal = openPinsModal;
window.openHistoryModal = openHistoryModal;

// ── Sidebar wiring (reader + dashboard) ─────────────────────
(function () {
  var sidebarPinsBtn = document.getElementById("sidebarPins");
  if (sidebarPinsBtn) sidebarPinsBtn.addEventListener("click", function () {
    var sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.remove("open");
    var sOverlay = document.getElementById("sidebarOverlay");
    if (sOverlay) sOverlay.classList.remove("open");
    window.openPinsModal();
  });
  var sidebarHistoryBtn = document.getElementById("sidebarHistory");
  if (sidebarHistoryBtn) sidebarHistoryBtn.addEventListener("click", function () {
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
      var item = x.closest(".dd-row");
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
      var item = arrow.closest(".dd-row");
      if (item) { movePin(item.dataset.code, parseInt(arrow.dataset.dir, 10)); window.openPinsModal(); }
    });
  });
}

export function renderPins() {
  var overlay = document.getElementById("pinsHistoryModalOverlay");
  if (overlay && overlay.classList.contains("open")) window.openPinsModal();
}
export function renderHistory() {
  var overlay = document.getElementById("pinsHistoryModalOverlay");
  if (overlay && overlay.classList.contains("open")) window.openHistoryModal();
}
