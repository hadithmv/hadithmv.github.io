/**
 * Table Scroll Sync Module
 *
 * Extracted from reader.js to keep the main module under 2 000 lines.
 * The table view's top scrollbar: mirrors its horizontal scroll onto
 * the table (RTL-aware — Chrome and Firefox disagree on scrollLeft
 * sign), smooth-scrolls one column per arrow click, and supports
 * shift+wheel. Widget-only: the table DOM (top scrollbar, wrapper,
 * spacer, buttons) is created by reader.js's loadInitial, which calls
 * initTableScroll right after. reader.js owns the state — ctx passes
 * headerRow directly and hiddenColumns through an accessor, because
 * reset rebinds the array (a captured ref would go stale).
 */

// Module-scope state — set by initTableScroll, read by the exported
// refreshTableScrollWidth (same pattern as quranState in quran-ui.js).
var ctx = null;
var topScrollOuter = null;
var tableWrap = null;
var topSpacer = null;
var topScroll = null;
var COL_STEP = 150;

function getTable() {
  return tableWrap ? tableWrap.querySelector(".reader-table") : null;
}

// Compute and apply table width: first col 60px, rest 150px each.
// If total exceeds wrapper width, table overflows → scrollbar appears.
function applyTableWidth() {
  var table = getTable();
  if (!table) return 0;
  var headerRow = ctx.headerRow;
  var hiddenColumns = ctx.getHiddenColumns();
  var visCols = 0;
  if (headerRow) {
    for (var j = 0; j < headerRow.length; j++) {
      if (hiddenColumns.indexOf(j) === -1) visCols++;
    }
  }
  if (visCols === 0) return 0;
  // Estimate: first col 60px, others 150px each (used only for overflow check)
  var colWidth = 60 + (visCols - 1) * 150;
  // Reset to CSS defaults — let table-layout:auto size columns to content
  table.style.width = "";
  var ths = table.querySelectorAll("thead th");
  if (ths.length > 0) {
    ths[0].style.width = "60px"; // row-number column stays narrow
    for (var k = 1; k < ths.length; k++) {
      ths[k].style.width = ""; // let browser size by content
    }
  }
  return colWidth;
}

function refreshScrollWidth(colWidth) {
  var table = getTable();
  if (!table || !topSpacer) return;
  // Force overflow width if columns demand it
  var wrapW = tableWrap.clientWidth;
  if (wrapW > 0 && colWidth > wrapW) {
    table.style.width = colWidth + "px";
  }
  var w = parseInt(table.style.width) || table.scrollWidth;
  topSpacer.style.width = (w || table.scrollWidth) + "px";
  // Hide the whole scrollbar row when table fits without overflow
  var needed = table.scrollWidth > tableWrap.clientWidth + 1;
  topScrollOuter.style.display = needed ? "" : "none";
  // Only clip overflow when scrollbar is needed (prevents edge clipping when table fits)
  tableWrap.style.overflowX = needed ? "" : "visible";
  // Adjust th sticky offset: only reserve space when scrollbar is visible.
  // Reserve = the scrollbar row's measured height (18px default — the wrapper
  // is display:none on the first pass, so offsetHeight reads 0 then).
  var ths = table.querySelectorAll("thead th");
  var barH = topScrollOuter.offsetHeight || 18;
  var thTop = needed ? "calc(var(--table-header-top, 64px) + " + barH + "px)" : "var(--table-header-top, 64px)";
  for (var i = 0; i < ths.length; i++) {
    ths[i].style.setProperty("top", thTop);
  }
}

function syncTableTransform() {
  var table = getTable();
  if (!table) return;
  // Normalise RTL scroll position to a 0–1 fraction.
  // Chrome: scrollLeft ∈ [0, maxScroll]   Firefox: scrollLeft ∈ [-maxScroll, 0]
  var maxScroll = topScroll.scrollWidth - topScroll.clientWidth;
  if (maxScroll <= 0) { table.style.transform = ""; return; }
  var fraction = Math.abs(topScroll.scrollLeft) / maxScroll;
  var tableOverflow = table.scrollWidth - tableWrap.clientWidth;
  if (tableOverflow <= 0) { table.style.transform = ""; return; }
  var offset = fraction * tableOverflow;
  table.style.transform = "translateX(" + offset + "px)";
}

// Smooth-scroll one column width per arrow click
function smoothScrollBy(delta) {
  var start = topScroll.scrollLeft;
  var target = start + delta;
  var duration = 250; // ms
  var startTime = performance.now();
  function easeOut(progress) { return 1 - Math.pow(1 - progress, 3); }
  function animate(now) {
    var elapsed = now - startTime;
    var progress = Math.min(elapsed / duration, 1);
    topScroll.scrollLeft = start + delta * easeOut(progress);
    if (progress < 1) requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

export function initTableScroll(initCtx) {
  ctx = initCtx;
  topScrollOuter = document.getElementById("tableTopScroll");
  tableWrap = document.getElementById("tableWrap");
  topSpacer = document.getElementById("tableTopScrollInner");
  // The scrollbar lives on the inner div (so padding on outer stays clean)
  topScroll = topScrollOuter ? topScrollOuter.querySelector(".table-top-scroll-inner") : null;
  if (!topScroll || !tableWrap) return;

  // Apply width first, then set up scroll width (deferred for layout)
  var _colWidth = applyTableWidth();
  requestAnimationFrame(function () {
    refreshScrollWidth(_colWidth);
  });

  // Scroll the table when the top scrollbar moves
  topScroll.addEventListener("scroll", syncTableTransform);

  // Arrow buttons: smooth-scroll one column width per click
  var scrollFwdBtn = document.getElementById("tableScrollFwd");
  var scrollBackBtn = document.getElementById("tableScrollBack");
  if (scrollFwdBtn) {
    scrollFwdBtn.addEventListener("click", function () {
      smoothScrollBy(-COL_STEP);
    });
  }
  if (scrollBackBtn) {
    scrollBackBtn.addEventListener("click", function () {
      smoothScrollBy(COL_STEP);
    });
  }

  // Shift+wheel on the wrapper → horizontal scroll
  tableWrap.addEventListener("wheel", function (e) {
    if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      var amount = e.deltaX || e.deltaY;
      topScroll.scrollLeft += amount;
    }
  }, { passive: false });
}

// Refresh when columns are toggled / window resizes. Safe to call
// before init: the DOM lookups return null and the guards bail.
export function refreshTableScrollWidth() {
  var colWidth = applyTableWidth();
  requestAnimationFrame(function () {
    refreshScrollWidth(colWidth);
  });
}
