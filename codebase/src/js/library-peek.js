/**
 * Cross-book result peeks — the ▾ preview under a per-book result row.
 *
 * Shared by every surface that renders the cross-book result language: the
 * library search page, its search window, and the reader's All-books tab.
 * buildBookRowsHTML (search-window.js) emits the row + toggle + empty panel;
 * wirePeeks(container) attaches the behaviour. Clicking ▾ fetches THAT book
 * (through the on-device IndexedDB cache — instant once opened before), runs
 * the reader's exact search machinery over it, and shows the first few
 * matching rows as highlighted snippets with a "Show next" pager. Each
 * snippet deep-links to its row.
 *
 * One peek open at a time: the open row's line pins (position: sticky) while
 * its snippets scroll, so the book identity and the ▾ stay reachable; two
 * pinned lines would fight for the same slot. Opening a peek also resets the
 * view to its start — the previous peek's scroll offset would otherwise
 * carry over and leave the new one showing its tail.
 */

import { t } from "./i18n.js";
import { fetchBookCSVCached } from "./csv.js";
import { getBookVersionSync, getCsvPath } from "./book-data.js";
import {
  parseQuery,
  compileQuery,
  rowMatchesQueryNorm,
  buildNormData,
  buildSnippets,
  highlightMatches,
} from "./search-utils.js";
import { fillTemplate } from "./library-scope-picker.js";

var PEEK_BATCH = 8;
var _peekCache = {}; // bookCode → q → {q, allData, normAllData, compiled, matches, pos, hasRowNums}

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
  // Cached render (collapse/re-open): keep the pager exactly as it was —
  // hiding it here stranded the "Show next" button after the first collapse.
  if (items.childElementCount > 0) return;
  var moreBtn = peek.querySelector(".lib-peek-more");
  if (moreBtn) moreBtn.style.display = "none";
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

/**
 * Align an opening peek's row to its pinned slot, so the peek always starts
 * at its first snippet. The offset must come from the row, not the line:
 * a pinned line's rect is already at the slot no matter how deep its
 * snippets are scrolled, so it cannot tell the viewport has carried over.
 */
function scrollPeekToStart(root) {
  var line = root.querySelector(".lib-result-line");
  if (!line) return;
  // A peek-open line is sticky; its computed top is the slot to align to.
  var slot = parseFloat(getComputedStyle(line).top) || 0;
  // The windows scroll their results pane; on the library page no ancestor
  // scrolls and the document itself does.
  var scroller = null;
  for (
    var node = root.parentElement;
    node && node !== document.body;
    node = node.parentElement
  ) {
    var overflowY = getComputedStyle(node).overflowY;
    if (overflowY === "auto" || overflowY === "scroll") {
      scroller = node;
      break;
    }
  }
  var top = root.getBoundingClientRect().top;
  if (scroller) {
    scroller.scrollTop += top - scroller.getBoundingClientRect().top - slot;
  } else {
    // Direct scrollTop assignment, not window.scrollBy: the document sets
    // `scroll-behavior: smooth`, which would turn this reset into a glide
    // toward a target measured before the new peek's content loads. Property
    // sets are instant by spec, so the reset lands where it was measured.
    (document.scrollingElement || document.documentElement).scrollTop +=
      top - slot;
  }
}

/** Collapse one row's peek (the arrow rotates back, panel hidden). */
function closePeek(root) {
  root.classList.remove("peek-open");
  var peek = root.querySelector(".lib-peek");
  if (peek) peek.style.display = "none";
}

function togglePeek(root, bookCode, q, container) {
  if (root.classList.contains("peek-open")) {
    closePeek(root);
    return;
  }
  // Single-open: close any other expanded row first.
  var openRows = container.querySelectorAll(".lib-result.peek-open");
  for (var i = 0; i < openRows.length; i++) closePeek(openRows[i]);
  root.classList.add("peek-open");
  var peek = root.querySelector(".lib-peek");
  if (peek) peek.style.display = "";
  openPeek(root, bookCode, q);
  scrollPeekToStart(root);
}

/**
 * Bring every peek row in `container` to life. Called by each host right
 * after it writes buildBookRowsHTML output into the DOM (rows are static
 * HTML at that point); re-rendering simply calls it again.
 */
export function wirePeeks(container) {
  if (!container) return;
  container.querySelectorAll(".lib-result").forEach(function (root) {
    var bookCode = root.dataset.book;
    var q = root.dataset.q;
    var toggle = root.querySelector(".lib-peek-toggle");
    if (toggle)
      toggle.addEventListener("click", function () {
        togglePeek(root, bookCode, q, container);
      });
    var more = root.querySelector(".lib-peek-more");
    if (more)
      more.addEventListener("click", function () {
        var entry = _peekCache[bookCode] && _peekCache[bookCode][q];
        if (entry)
          peekRenderBatch(root.querySelector(".lib-peek"), entry, q, bookCode);
      });
  });
}
