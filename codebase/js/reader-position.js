/**
 * Reader Position Module
 *
 * Extracted from reader.js to keep the main module under 2 000 lines.
 * Everything that answers "where am I": the pagination strip
 * (pageSelectHTML, updatePagination — throttled, and it skips DOM
 * writes when nothing changed), the visible-row detector
 * (visiblePageIndex), and the scroll-driven position block (progress
 * bar, milestone toasts, scroll counter, URL sync, read-history
 * auto-log + pin update). reader.js owns the state — ctx passes
 * values, accessors and callbacks; goTo, the renderers, loaders and
 * the deep-link block stay in core.
 */

import { t, currentLang } from "./i18n.js";
import { addReadHistory, isPinned, addPin } from "./book-data.js";
import { quranState, findQuranColIndices, getRowSurah, getRowJuz, getSurahInfo, getAyahNoFromRow as getAyahNoFromRowQuran, updateQuranNavDisplay } from "./quran-ui.js";

// Module-scope state — set by initPosition, read by the exported
// updatePagination and visiblePageIndex (same pattern as quranState
// in quran-ui.js).
var ctx = null;
var readerContent = null;
var metadata = null;

// Pagination throttle + change-detection state
var _lastPagUpdate = 0;
var _lastPagCur = -1;
var _lastPagTotal = -1;

// Scroll-block state (progress, milestones, URL sync, history log)
var scrollCounter = null;
var scrollTimer;
var urlSyncTimer;
var historyTimer;
var _lastHistoryRow = 0;
var _lastMilestone = 0;

export function visiblePageIndex() {
  // Fast path: use elementFromPoint at viewport centre (O(1) vs O(n) scan)
  var viewMid = window.innerHeight / 2;
  var el = document.elementFromPoint(window.innerWidth / 2, viewMid);
  if (el) {
    var row = el.closest('.reader-chunk');
    if (row && row.dataset.row) return parseInt(row.dataset.row);
  }
  // Fallback: linear scan (rarely reached)
  var chunks = readerContent.querySelectorAll(".reader-chunk");
  if (chunks.length === 0) return 0;
  var best = 0, bestTop = Infinity;
  var viewH = window.innerHeight;
  for (var i = 0; i < chunks.length; i++) {
    var cr = chunks[i].getBoundingClientRect();
    var mid = cr.top + cr.height / 2;
    var dist = Math.abs(mid - viewMid);
    if (dist < bestTop) { bestTop = dist; best = parseInt(chunks[i].dataset.row); }
    // Early exit: once we've passed the viewport, remaining rows are further away
    if (cr.top > viewH && dist > bestTop) break;
  }
  return best;
}

function pageSelectHTML(current, total) {
  if (total <= 1) return "";
  // Number input is O(1) — a <select> with one <option> per row is O(n) and
  // kills performance on large books (5 000+ <option> elements rendered twice).
  var w = Math.max(58, String(total).length * 18 + 10);
  return `<span class="page-of-label">${total} / </span><input type="number" class="page-strip-sel toolbar-select" style="width:${w}px;text-align:center;text-align-last:center" min="1" max="${total}" value="${current}" autocomplete="off">`;
}

export function updatePagination() {
  var now = performance.now();
  if (now - _lastPagUpdate < 120) return; // throttle to ~8 fps — enough for page indicator
  _lastPagUpdate = now;

  var filteredData = ctx.getFilteredData();
  var quranBook = ctx.quranBook;
  var headerRow = ctx.headerRow;
  const total = filteredData.length;
  const visibleRow = visiblePageIndex();
  const cur = visibleRow + 1; // 1-based row number

  // Skip DOM updates if nothing changed
  if (cur === _lastPagCur && total === _lastPagTotal) return;
  _lastPagCur = cur;
  _lastPagTotal = total;

  // Sync Quran nav with scroll position
  if (quranBook && visibleRow >= 0 && visibleRow < filteredData.length) {
    var scrollRow = filteredData[visibleRow];
    findQuranColIndices(headerRow);
    var scrollSurah = getRowSurah(scrollRow, headerRow);
    var scrollJuz = getRowJuz(scrollRow, headerRow);
    if (scrollSurah !== quranState.currentSurah) {
      quranState.currentSurah = scrollSurah;
      quranState.currentAyah = 1;
      var info = getSurahInfo(scrollSurah);
      if (info) document.getElementById("qrnAyahInput").max = info.ayahCount;
    }
    quranState.currentJuz = scrollJuz;
    var ayahNo = getAyahNoFromRowQuran(scrollRow, headerRow);
    if (ayahNo > 0) quranState.currentAyah = ayahNo;
    updateQuranNavDisplay();
  }

  var atFirst = visibleRow === 0;
  var atLast = visibleRow >= filteredData.length - 1;
  [
    "btnFirst",
    "btnPrev",
    "btnNext",
    "btnLast",
  ].forEach(function (id, i) {
    document.getElementById(id).disabled = i < 2 ? atFirst : atLast;
  });

  // While the user is typing in the page strip, DON'T rebuild it —
  // replacing the input destroys focus and wipes the typed digits
  // (focusing the box can itself trigger a scroll → updatePagination).
  var stripFocused = document.activeElement &&
    document.activeElement.classList &&
    document.activeElement.classList.contains("page-strip-sel");
  if (stripFocused) return;

  var selHTML = pageSelectHTML(cur, total);
  document.getElementById("readerPageNumbers").innerHTML = selHTML;

  // Wire page strip selects
  document.querySelectorAll(".page-strip-sel").forEach(function (psi) {
    if (String(psi.value) !== String(cur)) psi.value = cur;
    // No arrow stepping in the input — it is for typing a target page;
    // the arrow keys belong to reading navigation (handled globally)
    psi.addEventListener("keydown", function (e) {
      if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
      }
    });
    psi.addEventListener("change", function () {
      var v = parseInt(this.value, 10);
      if (!isNaN(v) && v >= 1) ctx.goTo(v - 1);
    });
  });
}

// Scroll-driven position: progress bar, milestone toasts, scroll
// counter, URL sync, read-history auto-log + pin update.
function onScroll() {
  var filteredData = ctx.getFilteredData();
  var quranBook = ctx.quranBook;
  var headerRow = ctx.headerRow;
  updatePagination();
  // Progress bar — surah-level for Quran, global for other books
  var pct;
  if (quranBook && filteredData.length > 0) {
    var vRow = visiblePageIndex();
    var curSurah = parseInt(filteredData[vRow][1], 10) || 0;
    var first = -1, last = 0;
    for (var r = 0; r < filteredData.length; r++) {
      var s = parseInt(filteredData[r][1], 10) || 0;
      if (s === curSurah) { if (first === -1) first = r; last = r; }
    }
    pct = last > first ? Math.round(((vRow - first) / (last - first)) * 100) : 0;
  } else {
    pct = filteredData.length > 1 ? Math.round((visiblePageIndex() / (filteredData.length - 1)) * 100) : 0;
  }
  document.getElementById("readerProgressFill").style.width = pct + "%";
  // Milestone toasts at 25%, 50%, 75%, 100% — reset when scrolling back
  if (pct < 25) { _lastMilestone = 0; document.getElementById("readerProgressFill").classList.remove("done"); }
  else if (pct < _lastMilestone) _lastMilestone = Math.floor(pct / 25) * 25;
  if (pct >= 25 && _lastMilestone < 25) { _lastMilestone = 25; showToast("📖 25%"); }
  if (pct >= 50 && _lastMilestone < 50) { _lastMilestone = 50; showToast("📖 50%"); }
  if (pct >= 75 && _lastMilestone < 75) { _lastMilestone = 75; showToast("📖 75%"); }
  if (pct >= 100 && _lastMilestone < 100) {
    _lastMilestone = 100;
    if (quranBook && filteredData.length > 0) {
      // Quran progress is surah-level — name the surah just finished
      var doneRow = filteredData[vRow];
      findQuranColIndices(headerRow);
      var doneSurah = getRowSurah(doneRow, headerRow);
      var doneInfo = getSurahInfo(doneSurah);
      var lang = currentLang();
      var doneName = doneInfo ? (lang === "en" ? doneInfo.nameEN : doneInfo.nameAR) : "";
      showToast("✅ " + (doneName ? doneName + " " : "") + t("surahCompleted") + " 📖");
    } else {
      showToast("✅ 100% " + t("qrnCompleted") + " 📖");
    }
    document.getElementById("readerProgressFill").classList.add("done");
    var ring = document.createElement("div");
    ring.className = "completion-border";
    document.body.appendChild(ring);
    setTimeout(function () { ring.remove(); }, 5000);
  }
  if (scrollCounter) {
    var vRow = visiblePageIndex();
    if (quranBook && filteredData.length > 0) {
      var scRow = filteredData[vRow];
      findQuranColIndices(headerRow);
      var scSurah = getRowSurah(scRow, headerRow);
      var scAyah = getAyahNoFromRowQuran(scRow, headerRow);
      var scInfo = getSurahInfo(scSurah);
      var scName = scInfo ? scInfo.nameAR : "";
      scrollCounter.innerHTML = scName + ' <span class="scroll-counter-num">' + scSurah + '</span> : <span class="scroll-counter-num">' + scAyah + '</span> <span class="scroll-counter-pct">' + pct + '%</span>';
    } else {
      var total = filteredData.length;
      scrollCounter.innerHTML = '<span class="scroll-counter-num">' + total + '</span> / <span class="scroll-counter-num">' + (vRow + 1) + '</span> <span class="scroll-counter-pct">' + pct + '%</span>';
    }
    scrollCounter.classList.add("show");
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () {
      scrollCounter.classList.remove("show");
    }, 2000);
  }
  // URL/history/pin rows must be whole-book indices: the reader's ?row=
  // handler reads them against the full book at load, and surah/juz filter
  // views are slices of allData — map the filtered index back first.
  var absRow = Math.max(1, ctx.allData.indexOf(filteredData[vRow]) + 1);
  // Sync URL with current position (debounced 500ms)
  clearTimeout(urlSyncTimer);
  urlSyncTimer = setTimeout(function () {
    var newURL = window.location.pathname + "?book=" + metadata.bookCode + "&row=" + absRow;
    history.replaceState(null, "", newURL);
  }, 500);
  // History auto-log + pin update (debounced 2s, row must change)
  if (absRow !== _lastHistoryRow) {
    clearTimeout(historyTimer);
    historyTimer = setTimeout(function () {
      addReadHistory(metadata.bookCode, absRow, ctx.pinLabel(absRow));
      if (isPinned(metadata.bookCode)) addPin(metadata.bookCode, absRow, ctx.pinLabel(absRow));
      _lastHistoryRow = absRow;
    }, 2000);
  }
}

// Registers the scroll listener + initial history log. Called from
// reader.js's initial render BEFORE loadInitial — the table branch calls
// updatePagination(), so the module's ctx must exist by then.
export function initPosition(initCtx) {
  ctx = initCtx;
  readerContent = document.getElementById("readerContent");
  metadata = ctx.metadata;
  scrollCounter = document.getElementById("scrollCounter");

  // Initial history log
  var _initRow = visiblePageIndex() + 1;
  addReadHistory(metadata.bookCode, _initRow, ctx.pinLabel(_initRow));
  _lastHistoryRow = _initRow;

  window.addEventListener("scroll", onScroll, { passive: true });
}
