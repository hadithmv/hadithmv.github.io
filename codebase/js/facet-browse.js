/**
 * Facet Browse Module (Authors & Periods)
 *
 * The one Authors/Periods browse used by every surface: the library-search
 * page's chips + buttons, the dashboard's functions panel + chips, and the
 * search window's All-books tab. Owns the selection state (one page load,
 * one facet state — the library page, dashboard and window on that page all
 * read/write the same state), the shared browse modals (filter input +
 * pinned thead strip + scrolling row list, trilingual rows), and the chip
 * markup. Consumers subscribe via onFacetChange and re-render their own
 * chips/results; the module re-renders its own open modals.
 *
 * The modals' ids (libAuthorsOverlay / libPeriodsOverlay) are the same on
 * every page — one page is loaded at a time, so no collisions.
 */

import { t, currentLang } from "./i18n.js";
import { authorDefs, loadAuthorDefinitions, loadBookRegistry, authorYearsText, authorCodesOf, authorPeriodOf, periodLabelEn, periodLabel, periodRangeText, periodRangeCeText, authorYearsCeText, authorAgeText } from "./book-data.js";
import { escapeHTML, normaliseForSearch } from "./search-utils.js";
import { openInfoModal } from "./book-info.js";

// ── Facet state (shared by every surface on the page) ──────────────
var _authors = [];
var _period = "";
var _subs = [];

export function facetState() {
  return { authors: _authors.slice(), period: _period };
}

/** True when any facet filter is active (the empty-scope guards use it). */
export function facetActive() {
  return _authors.length > 0 || !!_period;
}

/** Replace the whole facet state; notifies subscribers + open modals. */
export function setFacets(authors, period) {
  _authors = (authors || []).slice();
  _period = period || "";
  notify();
}

export function toggleAuthor(code) {
  var i = _authors.indexOf(code);
  if (i === -1) _authors.push(code);
  else _authors.splice(i, 1);
  notify();
}

/** Single-select bucket — clicking the active one clears it. */
export function togglePeriod(p) {
  _period = _period === p ? "" : p;
  notify();
}

export function clearFacets() {
  setFacets([], "");
}

/** Subscribe to facet changes; returns an unsubscribe function. */
export function onFacetChange(fn) {
  _subs.push(fn);
  return function () {
    var i = _subs.indexOf(fn);
    if (i !== -1) _subs.splice(i, 1);
  };
}

function notify() {
  _subs.forEach(function (fn) { fn(); });
  if (_authorsOverlay && _authorsOverlay.classList.contains("open")) renderAuthorRows();
  if (_periodsOverlay && _periodsOverlay.classList.contains("open")) renderPeriodRows();
}

/** Does this book pass the active author + period filters? (true when none) */
export function bookMatchesFacets(book) {
  var codes = authorCodesOf(book);
  if (_authors.length > 0) {
    if (!_authors.some(function (ac) { return codes.indexOf(ac) !== -1; })) return false;
  }
  if (_period) {
    if (!codes.some(function (ac) { return authorPeriodOf(ac) === _period; })) return false;
  }
  return true;
}

/** Book counts per author code and per period bucket over a book list,
 *  plus the distinct-author count per bucket — "within this period, books
 *  from this many authors". A book's author list is unique per code, so the
 *  bucket set accumulates author codes; the count of distinct keys is the
 *  answer (an author enters a bucket only via a visible book, so zero-book
 *  authors never inflate it). */
export function facetCounts(books) {
  var byAuthor = {};
  var byPeriod = {};
  var byPeriodAuthors = {};
  (books || []).forEach(function (b) {
    authorCodesOf(b).forEach(function (ac) {
      if (!byAuthor[ac]) byAuthor[ac] = 0;
      byAuthor[ac]++;
      var p = authorPeriodOf(ac);
      if (!byPeriod[p]) byPeriod[p] = 0;
      byPeriod[p]++;
      if (!byPeriodAuthors[p]) byPeriodAuthors[p] = {};
      byPeriodAuthors[p][ac] = true;
    });
  });
  var authorCounts = {};
  Object.keys(byPeriodAuthors).forEach(function (p) {
    authorCounts[p] = Object.keys(byPeriodAuthors[p]).length;
  });
  return { byAuthor: byAuthor, byPeriod: byPeriod, byPeriodAuthors: authorCounts };
}

// Counts over the registry's visible (-HDN excluded) books — the set the
// dashboard grids and chips against. Lazy + cached. The library surfaces
// (library-search page, search window) pass their own book list — the
// searchable set — so their counts only cover books really in the library
// (ENITRE-BOOK-excluded books like the RDF dictionaries have no postings).
var _counts = null;
export function visibleCounts(books) {
  if (books) {
    return loadAuthorDefinitions().then(function () {
      _counts = facetCounts(books);
      return _counts;
    });
  }
  if (_counts) return Promise.resolve(_counts);
  return loadAuthorDefinitions()
    .then(function () { return loadBookRegistry(); })
    .then(function (reg) {
      _counts = facetCounts((reg || []).filter(function (b) {
        return !b.bookCode.endsWith("-HDN");
      }));
      return _counts;
    });
}

// ── Chips (the tag-chip visuals, accent-tinted — see library-search.css) ──
/** Active author + period chips for a surface's chip row. */
export function facetChipsHTML(counts) {
  var html = _authors.map(function (code) {
    var d = authorDefs()[code];
    if (!d) return "";
    var l = currentLang();
    var nm = d.name[l] || d.name.en || d.name.ar || code;
    return (
      '<span class="tag-chip author-chip active" data-author="' +
      code +
      '" title="Remove filter: ' +
      (d.name.en || code) +
      '">' +
      '<span class="chip-x">✕</span>' +
      escapeHTML(nm) +
      " <small>(" +
      ((counts && counts.byAuthor[code]) || 0) +
      ")</small></span>"
    );
  }).join("");
  if (_period) {
    html +=
      '<span class="tag-chip period-chip active" data-period="' +
      _period +
      '" title="Remove filter: ' +
      periodLabelEn(_period) +
      '">' +
      '<span class="chip-x">✕</span>' +
      escapeHTML(periodLabel(_period)) +
      " <small>(" +
      ((counts && counts.byPeriod[_period]) || 0) +
      ")</small></span>";
  }
  return html;
}

/** Toggle a chip click (data-author / data-period), no-op otherwise. */
export function onFacetChipClick(e) {
  var chip = e.target.closest(".tag-chip");
  if (!chip) return;
  if (chip.dataset.author) toggleAuthor(chip.dataset.author);
  else if (chip.dataset.period) togglePeriod(chip.dataset.period);
}

// ── Browse modals ────────────────────────────────────────────────
// Filter input on top, then a pinned thead strip, then a scrollport holding
// only the rows — the scrollbar runs beside the list alone, never the thead
// (the modal body is the flex-column pins-history-body; the wrap is the
// flex:1 scrollport). The thead and the rows share one CSS grid column
// template (.facet-grid-authors / .facet-grid-periods), so the columns
// align by construction instead of by table auto-layout; the rows are grid
// divs, not <tr>s.
var _authorsOverlay = null;
var _authorsTitle = null;
var _authorsBody = null;
var _authorsFilter = null;
var _authorsFilterClear = null;
var _authorsList = null;
var _periodsOverlay = null;
var _periodsTitle = null;
var _periodsBody = null;
var _periodsFilter = null;
var _periodsFilterClear = null;
var _periodsList = null;

function ensureAuthorsModal() {
  if (_authorsOverlay) return;
  _authorsOverlay = window.createModal(
    "libAuthorsOverlay",
    "libAuthorsModalTitle",
    "libAuthorsModalBody",
    "lib-authors-modal"
  );
  _authorsTitle = document.getElementById("libAuthorsModalTitle");
  _authorsBody = document.getElementById("libAuthorsModalBody");
  _authorsBody.innerHTML =
    '<div class="facet-filter-row">' +
    '<div class="search-input-wrap">' +
    '<input id="libAuthorsFilter" type="search" class="search-input facet-filter-input" autocomplete="off" title="Filter authors by name or code" />' +
    '<button type="button" id="libAuthorsFilterClear" class="search-clear-btn" title="Clear filter" aria-label="Clear filter">✕</button>' +
    "</div>" +
    "</div>" +
    '<div class="facet-thead-row"><div class="facet-grid facet-grid-authors">' +
    '<div class="facet-thead-cell facet-col-info" title="Author info"></div>' +
    '<div class="facet-thead-cell facet-col-name"></div>' +
    '<div class="facet-thead-cell facet-col-ar"></div>' +
    '<div class="facet-thead-cell facet-col-century"></div>' +
    '<div class="facet-thead-cell facet-col-range"></div>' +
    '<div class="facet-thead-cell facet-col-age"></div>' +
    '<div class="facet-thead-cell facet-col-ce"></div>' +
    '<div class="facet-thead-cell facet-col-count"></div>' +
    '<div class="facet-thead-cell facet-col-check"></div>' +
    "</div></div>" +
    '<div class="facet-table-wrap"><div id="libAuthorsList"></div></div>';
  _authorsFilter = document.getElementById("libAuthorsFilter");
  _authorsFilterClear = document.getElementById("libAuthorsFilterClear");
  _authorsList = document.getElementById("libAuthorsList");
  _authorsFilter.addEventListener("input", function () {
    // The ✕ mirrors the query — the shared search-box component's
    // contract (search window, info modal, page searches).
    _authorsFilterClear.classList.toggle("visible", !!_authorsFilter.value);
    renderAuthorRows();
    pinFacetGeometry(); // the scrollbar can come and go with the row count
  });
  // The ✕ clears and re-fires "input" — the same re-render path as
  // typing — then focus stays in the field.
  _authorsFilterClear.addEventListener("click", function () {
    _authorsFilter.value = "";
    _authorsFilter.dispatchEvent(new Event("input", { bubbles: true }));
    _authorsFilter.focus();
  });
  _authorsBody.addEventListener("click", function (e) {
    var infoBtn = e.target.closest(".author-info-btn");
    if (infoBtn) {
      var row = infoBtn.closest(".author-browse-row");
      if (row) {
        openInfoModal({ author: row.dataset.author });
        return;
      }
    }
    var rowEl = e.target.closest(".author-browse-row");
    if (rowEl) toggleAuthor(rowEl.dataset.author);
  });
}

function authorsModalLabels() {
  _authorsTitle.textContent = t("libAuthorsTitle");
  _authorsFilter.placeholder = t("libAuthorsFilter");
  var ths = _authorsBody.querySelectorAll(".facet-thead-cell");
  ths[0].textContent = "ℹ";
  ths[1].textContent = t("facetColAuthor");
  ths[2].textContent = t("facetColAuthorAr");
  ths[3].textContent = t("facetColCentury");
  ths[4].textContent = t("facetColYears");
  ths[5].textContent = t("facetColAge");
  ths[6].textContent = t("facetColGregorian");
  ths[7].textContent = t("facetColBooks");
  ths[8].textContent = "✓";
}

/** The rows — registry order, only authors with visible books. The filter
 *  runs through normaliseForSearch, the same script-level normalizer as the
 *  library search (lowercase, hamza/tashkeel forms, Thaana dotted letters),
 *  so facet filtering feels exactly like every other filter box. */
function renderAuthorRows() {
  if (!_authorsList) return;
  var ft = normaliseForSearch((_authorsFilter.value || "").trim());
  var counts = (_counts && _counts.byAuthor) || {};
  var defs = authorDefs();
  var l = currentLang();
  var codes = Object.keys(defs).filter(function (code) {
    if (!counts[code]) return false;
    if (!ft) return true;
    var d = defs[code];
    return [code, d.name.dv, d.name.ar, d.name.en].some(function (s) {
      return normaliseForSearch(s || "").indexOf(ft) !== -1;
    });
  });
  _authorsList.innerHTML = codes.map(function (code) {
    var d = defs[code];
    var nm = d.name[l] || d.name.en || d.name.ar || code;
    var yrs = authorYearsText(d);
    var sel = _authors.indexOf(code) !== -1;
    // The Arabic name gets its own column, shown no matter the UI language
    // (empty in the Arabic UI, where the primary name already is Arabic).
    // The name column carries the primary name only — a trailing inline run
    // would pin the name track past the range column — and the tooltip
    // lists all three names.
    var arName = l === "ar" ? "" : d.name.ar;
    var p = authorPeriodOf(code);
    // The century and the years each get their own column — the century
    // label first, unbracketed; the AH range follows bracketed, so both
    // columns stay uniform width down the list ("modern" authors have no
    // death year: no century, and the years text stands alone).
    var century = p === "modern" ? "" : periodLabel(p);
    var range = yrs ? (p === "modern" ? yrs : "(" + yrs + ")") : "";
    var ce = authorYearsCeText(d);
    var age = authorAgeText(d);
    // The cells group into line wrappers — on desktop the wrappers are
    // display: contents (the cells stay the grid's direct items, so the
    // thead/rows column contract is unchanged); on mobile they become the
    // flowing text lines of the compact layout (name · Arabic name /
    // century · years · CE · age · count · check · info — the count,
    // check and info button join the end of the dates line; their grid
    // columns are class-placed, so the DOM move never shifts the desktop
    // columns). The age — derived from the dates, like the CE span, so it
    // takes the muted tone and joins the dates line.
    return (
      '<div class="author-browse-row facet-grid-authors' +
      (sel ? " selected" : "") +
      '" data-author="' +
      code +
      '" title="' +
      [d.name.en, d.name.ar, d.name.dv].filter(Boolean).join(" · ") +
      '">' +
      '<div class="facet-line-1">' +
      '<div class="facet-name"><span class="author-browse-name">' +
      escapeHTML(nm) +
      "</span></div>" +
      '<div class="facet-name-ar">' +
      (arName ? escapeHTML(arName) : "") +
      "</div></div>" +
      '<div class="facet-line-2">' +
      '<div class="facet-century">' +
      (century ? escapeHTML(century) : "") +
      "</div>" +
      '<div class="facet-range">' +
      (range ? escapeHTML(range) : "") +
      "</div>" +
      '<div class="facet-ce">' +
      (ce ? "(" + escapeHTML(ce) + ")" : "") +
      "</div>" +
      '<div class="facet-age">' +
      (age ? facetAgeLabel() + escapeHTML(age) : "") +
      "</div>" +
      '<div class="facet-count">' +
      facetCountLabel() +
      counts[code] +
      "</div>" +
      '<div class="facet-check">' +
      (sel ? "✓" : "") +
      "</div>" +
      '<div class="facet-info"><button type="button" class="author-info-btn" title="Author info" aria-label="Author info">ℹ</button></div></div></div>'
    );
  }).join("") ||
    '<div class="facet-empty">' + t("libAuthorsNoMatch") + "</div>";
}

// The modals can be opened from a surface with another modal already open —
// the search window (its scope summary uses the same stacking) — so open on
// top when one is up, exclusively otherwise.
function openFacetModal(id) {
  var stacked = window.MODAL_IDS.some(function (mid) {
    var m = document.getElementById(mid);
    return m && m.classList.contains("open");
  });
  if (stacked) window.openModalOnTop(id);
  else window.openModal(id);
}

/** Align the pinned thead strip with the rows — two things need pinning:
 *  - --facet-gutter: the rows' grid lives inside the RTL scrollport, which
 *    right-anchors its content and takes the scrollbar's width off the left
 *    edge, so the rows' columns start ~15px right of the thead's. The thead
 *    row mirrors the gutter with padding-inline-end, so both grids are
 *    identical. Measured live: overlay scrollbars (gutter 0) and
 *    filtered-down lists (no scrollbar) stay aligned too.
 *  - the text columns: an auto track would size per-grid — the thead's
 *    short label against the rows' longer text (and each row against its
 *    neighbours) — drifting the header columns left of the rows and making
 *    the column spacing uneven. Each column is pinned to its widest content,
 *    measured nowrap (true max-content), so every grid in the modal — thead
 *    and every row — is identical.
 *  Runs on open, on language change (the widest label changes), and on
 *  filter input (the scrollbar comes and goes with the row count). */
function pinFacetGeometry() {
  var open = ["libAuthorsOverlay", "libPeriodsOverlay"].some(function (id) {
    var m = document.getElementById(id);
    return m && m.classList.contains("open");
  });
  if (!open) return;
  Array.prototype.forEach.call(document.querySelectorAll(".facet-table-wrap"), function (wrap) {
    var ov = wrap.closest(".lib-authors-modal, .lib-periods-modal");
    if (ov) ov.style.setProperty("--facet-gutter", (wrap.offsetWidth - wrap.clientWidth) + "px");
  });
  // Both modals pin every track to its widest content (pinFacetColumn,
  // measured nowrap — true max-content), so the thead and every row share
  // one column template; the leftover width goes to the long-text
  // columns. The authors' name/Arabic pair split it 46/54, capped at
  // 220/240 — scaled down together on narrower desktops so the text
  // columns yield first and the fixed tracks never cram; on wide desktops
  // the same caps step up (up to +110px each, full at ~1450px of
  // scrollport) so the columns don't look stuck at the narrow-screen
  // maximum. The periods' century label column takes its leftover the
  // same way (the modal's only long-text track — same cap and step), so
  // both modals behave identically on resize. The range tracks are pinned
  // to their widest range text in BOTH modals (measured first, below) —
  // no 1fr anywhere: the authors' age sits directly against the years,
  // and the periods' years sit at their natural width, hugging the
  // century label ("extremely wide" was the old 1fr range absorbing the
  // modal's leftover). The fixed tracks: authors century 90 + age 48 +
  // Gregorian (measured) + count 64 + check 40 + info 36; periods
  // authors 56 —
  // short numbers, fixed in the CSS grid templates, not pinned. The
  // authors pins are still clamped to the rows' content (pinFacetColumn),
  // so nothing stretches beyond the longest name; the periods' century
  // label is short text, so its column takes the share directly instead.
  var aWrap = document.querySelector("#libAuthorsOverlay .facet-table-wrap");
  var pWrap = document.querySelector("#libPeriodsOverlay .facet-table-wrap");
  var grow = 0;
  var step = 0;
  if (aWrap) {
    var avail = aWrap.clientWidth;
    grow = Math.max(0, Math.min(1, (avail - 879) / 571));
    step = Math.round(grow * 110);
    var ceW = 0;
    Array.prototype.forEach.call(aWrap.querySelectorAll(".facet-ce, .facet-thead-cell.facet-col-ce"), function (el) {
      el.style.whiteSpace = "nowrap";
      ceW = Math.max(ceW, el.scrollWidth);
      el.style.whiteSpace = "";
    });
    var rangeW = 0;
    Array.prototype.forEach.call(aWrap.querySelectorAll(".facet-range, .facet-thead-cell.facet-col-range"), function (el) {
      el.style.whiteSpace = "nowrap";
      rangeW = Math.max(rangeW, el.scrollWidth);
      el.style.whiteSpace = "";
    });
    var ovEl = document.getElementById("libAuthorsOverlay");
    if (ovEl && rangeW > 0) ovEl.style.setProperty("--facet-range-w", rangeW + "px");
    var namesShare = avail - 90 - ceW - 48 - 64 - 40 - 36 - rangeW;
    pinFacetColumn("libAuthorsOverlay", [
      ["facet-name", "facet-col-name", "facet-name-w", (namesShare > 0 ? Math.min(220, Math.round(namesShare * 0.46)) : 0) + step],
      ["facet-name-ar", "facet-col-ar", "facet-ar-w", (namesShare > 0 ? Math.min(240, Math.round(namesShare * 0.54)) : 0) + step],
      ["facet-century", "facet-col-century", "facet-century-w"],
      ["facet-ce", "facet-col-ce", "facet-ce-w"]
    ]);
  } else if (pWrap) {
    grow = Math.max(0, Math.min(1, (pWrap.clientWidth - 879) / 571));
    step = Math.round(grow * 110);
  }
  if (pWrap) {
    var pCeW = 0;
    Array.prototype.forEach.call(pWrap.querySelectorAll(".facet-ce, .facet-thead-cell.facet-col-ce"), function (el) {
      el.style.whiteSpace = "nowrap";
      pCeW = Math.max(pCeW, el.scrollWidth);
      el.style.whiteSpace = "";
    });
    var pRangeW = 0;
    Array.prototype.forEach.call(pWrap.querySelectorAll(".facet-range, .facet-thead-cell.facet-col-range"), function (el) {
      el.style.whiteSpace = "nowrap";
      pRangeW = Math.max(pRangeW, el.scrollWidth);
      el.style.whiteSpace = "";
    });
    var pOv = document.getElementById("libPeriodsOverlay");
    if (pOv && pRangeW > 0) pOv.style.setProperty("--facet-range-w", pRangeW + "px");
    if (pOv) {
      // The century label is short text ("Century 15" ~90px), so the
      // measured-content clamp pinFacetColumn applies would never let the
      // column take the leftover — the share is set directly, floored at
      // the content (narrow windows) and capped like the authors' name.
      var pContent = 0;
      Array.prototype.forEach.call(pOv.querySelectorAll(".facet-name, .facet-thead-cell.facet-col-period"), function (el) {
        el.style.whiteSpace = "nowrap";
        pContent = Math.max(pContent, el.scrollWidth);
        el.style.whiteSpace = "";
      });
      var pShare = pWrap.clientWidth - pRangeW - pCeW - 56 - 64 - 40;
      pOv.style.setProperty("--facet-period-w", (pShare > 0 ? Math.max(pContent, Math.min(220, Math.round(pShare)) + step) : pContent) + "px");
    }
    pinFacetColumn("libPeriodsOverlay", [
      ["facet-ce", "facet-col-ce", "facet-ce-w"]
    ]);
  }
}

function pinFacetColumn(overlayId, pairs) {
  var ov = document.getElementById(overlayId);
  if (!ov) return;
  pairs.forEach(function (pair) {
    var cells = Array.prototype.slice.call(ov.querySelectorAll("." + pair[0]));
    var head = ov.querySelector(".facet-thead-cell." + pair[1]);
    if (head) cells.push(head);
    var w = 0;
    cells.forEach(function (el) {
      el.style.whiteSpace = "nowrap";
      w = Math.max(w, el.scrollWidth);
      el.style.whiteSpace = "";
    });
    // The caps keep the range + count columns from being squeezed out:
    // uncapped, the longest names (Thaana names in the dv UI run long
    // too) would swallow the modal on narrower desktop widths — they wrap
    // within the pinned track instead (break-word on .facet-name and
    // .facet-name-ar), the full name still in the row tooltip.
    var cap = pair[3];
    if (w > 0) ov.style.setProperty("--" + pair[2], (cap && w > cap ? cap : w) + "px");
  });
}

// Focus the modal's filter once the modal is focusable: the overlay's pop
// transition computes as visibility:hidden for ~--t-pop (common.js defers
// its own focus-first past it), so the synchronous focus attempt below
// silently fails and the deferred one re-lands it past the transition —
// after common.js's close-✕ focus, so the input wins. Same pattern as the
// search window's input focus.
function deferFacetFocus(filterEl, overlayEl) {
  try { filterEl.focus(); } catch (_) {}
  var pop = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--t-pop")) || 0.2;
  window.setTimeout(function () {
    if (!overlayEl.classList.contains("open")) return;
    try { filterEl.focus(); } catch (_) {}
  }, pop * 1000 + 10);
}

/** Open the authors browse. books (optional) = the surface's book set —
 *  omitted on the dashboard (registry-visible), the searchable list on the
 *  library page and the search window (see visibleCounts). */
export function openAuthorsModal(books) {
  visibleCounts(books).then(function () {
    ensureAuthorsModal();
    authorsModalLabels();
    _authorsFilter.value = "";
    _authorsFilterClear.classList.remove("visible"); // query reset → ✕ hidden
    renderAuthorRows();
    openFacetModal("libAuthorsOverlay");
    pinFacetGeometry();
    deferFacetFocus(_authorsFilter, _authorsOverlay);
  });
}

function ensurePeriodsModal() {
  if (_periodsOverlay) return;
  _periodsOverlay = window.createModal(
    "libPeriodsOverlay",
    "libPeriodsModalTitle",
    "libPeriodsModalBody",
    "lib-periods-modal"
  );
  _periodsTitle = document.getElementById("libPeriodsModalTitle");
  _periodsBody = document.getElementById("libPeriodsModalBody");
  _periodsBody.innerHTML =
    '<div class="facet-filter-row">' +
    '<div class="search-input-wrap">' +
    '<input id="libPeriodsFilter" type="search" class="search-input facet-filter-input" autocomplete="off" title="Filter periods" />' +
    '<button type="button" id="libPeriodsFilterClear" class="search-clear-btn" title="Clear filter" aria-label="Clear filter">✕</button>' +
    "</div>" +
    "</div>" +
    '<div class="facet-thead-row"><div class="facet-grid facet-grid-periods">' +
    '<div class="facet-thead-cell facet-col-period"></div>' +
    '<div class="facet-thead-cell facet-col-range"></div>' +
    '<div class="facet-thead-cell facet-col-authors"></div>' +
    '<div class="facet-thead-cell facet-col-ce"></div>' +
    '<div class="facet-thead-cell facet-col-count"></div>' +
    '<div class="facet-thead-cell facet-col-check"></div>' +
    "</div></div>" +
    '<div class="facet-table-wrap"><div id="libPeriodsList"></div></div>';
  _periodsFilter = document.getElementById("libPeriodsFilter");
  _periodsFilterClear = document.getElementById("libPeriodsFilterClear");
  _periodsList = document.getElementById("libPeriodsList");
  _periodsFilter.addEventListener("input", function () {
    _periodsFilterClear.classList.toggle("visible", !!_periodsFilter.value);
    renderPeriodRows();
    pinFacetGeometry();
  });
  _periodsFilterClear.addEventListener("click", function () {
    _periodsFilter.value = "";
    _periodsFilter.dispatchEvent(new Event("input", { bubbles: true }));
    _periodsFilter.focus();
  });
  _periodsBody.addEventListener("click", function (e) {
    var row = e.target.closest(".period-browse-row");
    if (row) togglePeriod(row.dataset.period);
  });
}

function periodsModalLabels() {
  _periodsTitle.textContent = t("libPeriodsTitle");
  _periodsFilter.placeholder = t("libPeriodsFilter");
  var ths = _periodsBody.querySelectorAll(".facet-thead-cell");
  ths[0].textContent = t("facetColCentury");
  ths[1].textContent = t("facetColYears");
  ths[2].textContent = t("facetColAuthors");
  ths[3].textContent = t("facetColGregorian");
  ths[4].textContent = t("facetColBooks");
  ths[5].textContent = "✓";
}

/** The mobile label span ("word: " — hidden on desktop, where the cell sits
 *  under its own thead column; shown inline on mobile, where the thead folds
 *  away and the bare number would float alone). */
function facetLabelSpan(word) {
  return '<span class="facet-count-label">' + escapeHTML(word + ": ") + "</span>";
}

/** The per-row count's mobile label — the word from libScopeCount. */
function facetCountLabel() {
  return facetLabelSpan(t("libScopeCount").replace("{n}", "").trim());
}

/** The periods authors cell's mobile label — the facetColAuthors word. */
function facetAuthorsLabel() {
  return facetLabelSpan(t("facetColAuthors"));
}

/** The author age cell's mobile label — the facetColAge word. */
function facetAgeLabel() {
  return facetLabelSpan(t("facetColAge"));
}

/** The rows — distinct death-century buckets + modern, chronological order
 *  (modern last), zero-count buckets dropped. The filter runs through
 *  normaliseForSearch like the authors filter (see renderAuthorRows). */
function renderPeriodRows() {
  if (!_periodsList) return;
  var ft = normaliseForSearch((_periodsFilter.value || "").trim());
  var counts = (_counts && _counts.byPeriod) || {};
  var periods = Object.keys(counts).sort(function (a, b) {
    if (a === "modern") return 1;
    if (b === "modern") return -1;
    return parseInt(a, 10) - parseInt(b, 10);
  }).filter(function (p) {
    if (!ft) return true;
    var range = periodRangeText(p);
    var rangeCe = periodRangeCeText(p);
    return [periodLabel(p), periodLabelEn(p), p, range, rangeCe].some(function (s) {
      return normaliseForSearch(s || "").indexOf(ft) !== -1;
    });
  });
  _periodsList.innerHTML = periods.map(function (p) {
    var sel = _period === p;
    var range = periodRangeText(p);
    var rangeCe = periodRangeCeText(p);
    // The century label is the row's name; the AH and Gregorian spans get
    // their own bracketed columns, so both stay uniform width down the
    // list ("modern" has no spans — the range and CE cells stay empty).
    // The distinct-author count opens the mobile count line (the "·" join
    // on the count separates the two numbers), then the book count.
    var authors = (_counts && _counts.byPeriodAuthors && _counts.byPeriodAuthors[p]) || 0;
    return (
      '<div class="period-browse-row facet-grid-periods' +
      (sel ? " selected" : "") +
      '" data-period="' +
      p +
      '" title="' +
      periodLabelEn(p) +
      '">' +
      '<div class="facet-line-1">' +
      '<div class="facet-name">' +
      escapeHTML(periodLabel(p)) +
      "</div>" +
      '<div class="facet-range">' +
      (range ? "(" + escapeHTML(range) + ")" : "") +
      "</div>" +
      '<div class="facet-ce">' +
      (rangeCe ? "(" + escapeHTML(rangeCe) + ")" : "") +
      "</div></div>" +
      '<div class="facet-line-2">' +
      '<div class="facet-authors">' +
      facetAuthorsLabel() +
      authors +
      "</div>" +
      '<div class="facet-count">' +
      facetCountLabel() +
      counts[p] +
      "</div>" +
      '<div class="facet-check">' +
      (sel ? "✓" : "") +
      "</div></div></div>"
    );
  }).join("") ||
    '<div class="facet-empty">' + t("libPeriodsNoMatch") + "</div>";
}

/** Open the periods browse. books (optional) — same semantics as
 *  openAuthorsModal. */
export function openPeriodsModal(books) {
  visibleCounts(books).then(function () {
    ensurePeriodsModal();
    periodsModalLabels();
    _periodsFilter.value = "";
    _periodsFilterClear.classList.remove("visible"); // query reset → ✕ hidden
    renderPeriodRows();
    openFacetModal("libPeriodsOverlay");
    pinFacetGeometry();
    deferFacetFocus(_periodsFilter, _periodsOverlay);
  });
}

// Keyboard: Alt+A opens the Authors browse, Alt+R the Periods browse —
// the same Alt+letter pattern as the page shortcuts (Alt+Z focus mode,
// Alt+P pins/position, …). Opening while another modal is up closes it
// (openModal semantics); ignored while typing. The modals open with the
// filter input focused, so the shortcut lands the caret straight in the
// search bar.
document.addEventListener("keydown", function (e) {
  if (!e.altKey || e.ctrlKey || e.metaKey || window.isTypingTarget(e)) return;
  if (e.key === "a") {
    e.preventDefault();
    openAuthorsModal();
  } else if (e.key === "r") {
    e.preventDefault();
    openPeriodsModal();
  }
});

// Open modals re-render in the new language (labels + rows)
document.addEventListener("languagechange", function () {
  if (_authorsOverlay && _authorsOverlay.classList.contains("open")) {
    authorsModalLabels();
    renderAuthorRows();
  }
  if (_periodsOverlay && _periodsOverlay.classList.contains("open")) {
    periodsModalLabels();
    renderPeriodRows();
  }
  pinFacetGeometry(); // the widest years text changes with the language
});
