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
import { formatThousands } from "./search-utils.js";
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
// Per-message quiet window: the same toast text may re-show only after 5s.
// Scrolling back still re-arms the markers (a genuine re-read celebrates
// again), but wheel/inertia bounce across a boundary — a row or two apart on
// short Quran surahs — must not instantly re-show the same toast. Keyed by
// message, not milestone value: back-to-back Quran surah completions are
// different messages (each surah names itself) and must each toast.
var _milestoneToastAt = {};
function fireMilestoneToast(msg) {
  var now = Date.now();
  if (now - (_milestoneToastAt[msg] || 0) < 5000) return false;
  _milestoneToastAt[msg] = now;
  showToast(msg);
  return true;
}

// Programmatic-jump suppression: goTo records where its smooth scroll
// will land (noteProgrammaticJump); onScroll skips milestone toasts until
// the position settles there — the arrival event itself is suppressed —
// the user's own scrolling moves away from the destination, or the 3.5s
// backstop expires (background tabs where animations stall). Navigation
// is not reading: a btnLast, page-strip, deep-link or Home/End jump must
// not celebrate "finished" (completion toast, green .done bar, flashing
// border).
var _jumpTargetY = -1;
var _jumpAt = 0;
var _jumpLastDist = Infinity;
export function noteProgrammaticJump(targetY) {
  _jumpTargetY = targetY;
  _jumpAt = Date.now();
  _jumpLastDist = Infinity;
}

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
  // Label total gets thousands separators like the scroll counter; the
  // input is type="number" so value/min/max must stay raw digits.
  return `<span class="page-of-label">${formatThousands(total)} / </span><input type="number" class="page-strip-sel toolbar-select" style="width:${w}px;text-align:center;text-align-last:center" min="1" max="${total}" value="${current}" autocomplete="off">`;
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
  // Radheef dictionaries are reference books — no reading milestones
  // (25/50/75/100% toasts) and no completion celebration (green .done
  // bar + flashing border ring); the progress bar and scroll counter
  // still work.
  var milestonesEnabled = !ctx.isRadheefBook;
  updatePagination();
  // Progress bar — surah-level for Quran, global for other books.
  // When the reader is fully scrolled to the bottom, the final row IS on
  // screen (its bottom edge touches the viewport) even though its centre can
  // never reach the viewport centre — that crossing lies past max scroll for
  // the last row of a scrollable document, so the book's final 100% could
  // never fire. Count the last row as the current one at the absolute bottom:
  // the last surah of the Quran (and the end of any filtered view or short
  // book) then completes normally. The scroll counter and URL below keep the
  // honest centre-row value.
  var pct;
  var vRow = visiblePageIndex();
  var atBottom = false;
  var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll > 0 && window.scrollY >= maxScroll - 1) {
    vRow = filteredData.length - 1;
    atBottom = true;
    // A bottom scroll arrives as a single event — there are no intermediate
    // rows to re-arm the milestone marker through, so a marker left at 100
    // by the previous surah's completion would block this one. The
    // per-message 5s toast gate dedupes bottom events instead of the marker.
    _lastMilestone = 0;
  }
  if (quranBook && filteredData.length > 0) {
    var curSurah = parseInt(filteredData[vRow][1], 10) || 0;
    var first = -1, last = 0;
    for (var r = 0; r < filteredData.length; r++) {
      var s = parseInt(filteredData[r][1], 10) || 0;
      if (s === curSurah) { if (first === -1) first = r; last = r; }
    }
    pct = last > first ? Math.round(((vRow - first) / (last - first)) * 100) : 0;
  } else {
    pct = filteredData.length > 1 ? Math.round((vRow / (filteredData.length - 1)) * 100) : 0;
  }
  document.getElementById("readerProgressFill").style.width = pct + "%";
  // Milestone toasts at 25%, 50%, 75%, 100% — reset when scrolling back.
  // The toasts are gated by fireMilestoneToast's 5s quiet window: bounce must
  // not re-show a toast (see the gate's comment at the state declarations).
  // Programmatic jumps (goTo) are muted too: while the jump's smooth scroll
  // is in flight — and on its arrival event — milestones must not fire.
  var jumpInFlight = false;
  if (_jumpTargetY !== -1) {
    // The jump's animation is done when the position reaches the recorded
    // destination — or the document's current bottom, which can move past
    // the recorded dest while sentinel rows keep loading — or moves AWAY
    // from the destination (the user took over the scroll), or the
    // backstop expires (throttled tabs where the animation stalls).
    // Until then every event belongs to the navigation, not to reading.
    var jy = window.scrollY;
    var jMaxS = document.documentElement.scrollHeight - window.innerHeight;
    var distNow = Math.abs(jy - _jumpTargetY);
    if (distNow <= 3 || Math.abs(jy - jMaxS) <= 3 || distNow > _jumpLastDist || Date.now() - _jumpAt > 3500) _jumpTargetY = -1;
    _jumpLastDist = distNow;
    jumpInFlight = true;
  }
  if (milestonesEnabled && !jumpInFlight) {
    if (pct < 25) { _lastMilestone = 0; document.getElementById("readerProgressFill").classList.remove("done"); }
    else if (pct < _lastMilestone) _lastMilestone = Math.floor(pct / 25) * 25;
  }
  // Completion: name the surah just finished (Quran) or the whole book.
  function celebrateCompletion() {
    _lastMilestone = 100;
    var completionMsg;
    if (quranBook && filteredData.length > 0) {
      // Quran progress is surah-level — name the surah just finished
      var doneRow = filteredData[vRow];
      findQuranColIndices(headerRow);
      var doneSurah = getRowSurah(doneRow, headerRow);
      var doneInfo = getSurahInfo(doneSurah);
      var lang = currentLang();
      var doneName = doneInfo ? (lang === "en" ? doneInfo.nameEN : doneInfo.nameAR) : "";
      completionMsg = "✅ " + (doneName ? doneName + " " : "") + t("surahCompleted") + " 📖";
    } else {
      completionMsg = "✅ 100% " + t("qrnCompleted") + " 📖";
    }
    // An allowed re-celebration restarts the ring; a suppressed bounce (the
    // gate's 5s quiet window) must neither toast nor stack a second border
    if (fireMilestoneToast(completionMsg)) {
      document.getElementById("readerProgressFill").classList.add("done");
      var oldRing = document.querySelector(".completion-border");
      if (oldRing) oldRing.remove();
      var ring = document.createElement("div");
      ring.className = "completion-border";
      document.body.appendChild(ring);
      setTimeout(function () { ring.remove(); }, 5000);
    }
  }
  if (atBottom) {
    // The bottom arrives as a single event with nothing to walk through —
    // evaluate only the completion. Re-running the 25/50/75 chain here would
    // re-show those toasts on every bottom bounce once their own 5s windows
    // lapse; the gate still dedupes the completion itself.
    if (milestonesEnabled && !jumpInFlight && pct >= 100 && _lastMilestone < 100) celebrateCompletion();
  } else {
    if (milestonesEnabled && !jumpInFlight && pct >= 25 && _lastMilestone < 25) { _lastMilestone = 25; fireMilestoneToast("📖 25%"); }
    if (milestonesEnabled && !jumpInFlight && pct >= 50 && _lastMilestone < 50) { _lastMilestone = 50; fireMilestoneToast("📖 50%"); }
    if (milestonesEnabled && !jumpInFlight && pct >= 75 && _lastMilestone < 75) { _lastMilestone = 75; fireMilestoneToast("📖 75%"); }
    if (milestonesEnabled && !jumpInFlight && pct >= 100 && _lastMilestone < 100) celebrateCompletion();
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
      scrollCounter.innerHTML = '<span class="scroll-counter-num">' + formatThousands(total) + '</span> / <span class="scroll-counter-num">' + formatThousands(vRow + 1) + '</span> <span class="scroll-counter-pct">' + pct + '%</span>';
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
