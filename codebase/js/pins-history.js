/**
 * Pins & History Module
 *
 * Bookmark pins (saved reading positions) and reading history log.
 * Storage CRUD + modal UI + sidebar wiring.
 * Extracted from catalog.js.
 */

import { t, currentLang } from "./i18n.js";
import { getBookTitleSync } from "./catalog.js";

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

// ── Helpers ─────────────────────────────────────────────────
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

function bookDisplayName(bookCode) {
  var title = getBookTitleSync(bookCode);
  return title || bookCode;
}

// ── Modal ───────────────────────────────────────────────────
function _ensureModal() {
  window.createModal("pinsHistoryModalOverlay", "pinsHistoryModalTitle", "pinsHistoryModalBody", "pins-history-modal");
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

export function closePinsHistoryModal() {
  window.closeModal("pinsHistoryModalOverlay");
}

// ── Sidebar wiring (reader + dashboard) ─────────────────────
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

export function renderPins() {
  var overlay = document.getElementById("pinsHistoryModalOverlay");
  if (overlay && overlay.classList.contains("open")) window.openPinsModal();
}
export function renderHistory() {
  var overlay = document.getElementById("pinsHistoryModalOverlay");
  if (overlay && overlay.classList.contains("open")) window.openHistoryModal();
}
