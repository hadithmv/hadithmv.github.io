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
import { authorDefs, loadAuthorDefinitions, loadBookRegistry, authorYearsText } from "./book-data.js";
import { escapeHTML, normaliseForSearch } from "./search-utils.js";

// ── Facet state (shared by every surface on the page) ──────────────
var _authors = [];
var _period = "";
var _subs = [];

/** Author codes of a registry row ("" when the book has no author). */
export function authorCodesOf(b) {
  return ((b && b.authorCode) || "")
    .split(",")
    .map(function (s) { return s.trim(); })
    .filter(Boolean);
}

/** Period bucket of an author — death century as a string ("3"), "modern" when
 *  no death year is recorded. Buckets come from the 08 registry, not the data. */
export function authorPeriodOf(code) {
  var d = authorDefs()[code];
  if (!d || !d.diedAH) return "modern";
  return String(Math.ceil(parseInt(d.diedAH, 10) / 100));
}

/** English period title — tooltips are English house style. */
export function periodLabelEn(p) {
  if (p === "modern") return "Authors without a recorded death year";
  var n = parseInt(p, 10);
  var s = n % 100 >= 11 && n % 100 <= 13 ? "th"
    : n % 10 === 1 ? "st"
    : n % 10 === 2 ? "nd"
    : n % 10 === 3 ? "rd"
    : "th";
  return "Died in the " + n + s + " century AH";
}

/** Period display label in the current language ("Century 3" / modern). */
export function periodLabel(p) {
  return p === "modern" ? t("centuryModern") : t("century" + p);
}

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

/** Book counts per author code and per period bucket over a book list. */
export function facetCounts(books) {
  var byAuthor = {};
  var byPeriod = {};
  (books || []).forEach(function (b) {
    authorCodesOf(b).forEach(function (ac) {
      if (!byAuthor[ac]) byAuthor[ac] = 0;
      byAuthor[ac]++;
      var p = authorPeriodOf(ac);
      if (!byPeriod[p]) byPeriod[p] = 0;
      byPeriod[p]++;
    });
  });
  return { byAuthor: byAuthor, byPeriod: byPeriod };
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
var _authorsList = null;
var _periodsOverlay = null;
var _periodsTitle = null;
var _periodsBody = null;
var _periodsFilter = null;
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
    '<input id="libAuthorsFilter" type="search" class="search-input facet-filter-input" autocomplete="off" title="Filter authors by name or code" />' +
    "</div>" +
    '<div class="facet-thead-row"><div class="facet-grid facet-grid-authors">' +
    '<div class="facet-thead-cell facet-col-name"></div>' +
    '<div class="facet-thead-cell facet-col-ar"></div>' +
    '<div class="facet-thead-cell facet-col-century"></div>' +
    '<div class="facet-thead-cell facet-col-range"></div>' +
    '<div class="facet-thead-cell facet-col-count"></div>' +
    '<div class="facet-thead-cell facet-col-check"></div>' +
    "</div></div>" +
    '<div class="facet-table-wrap"><div id="libAuthorsList"></div></div>';
  _authorsFilter = document.getElementById("libAuthorsFilter");
  _authorsList = document.getElementById("libAuthorsList");
  _authorsFilter.addEventListener("input", function () {
    renderAuthorRows();
    pinFacetGeometry(); // the scrollbar can come and go with the row count
  });
  _authorsBody.addEventListener("click", function (e) {
    var row = e.target.closest(".author-browse-row");
    if (row) toggleAuthor(row.dataset.author);
  });
}

function authorsModalLabels() {
  _authorsTitle.textContent = t("libAuthorsTitle");
  _authorsFilter.placeholder = t("libAuthorsFilter");
  var ths = _authorsBody.querySelectorAll(".facet-thead-cell");
  ths[0].textContent = t("facetColAuthor");
  ths[1].textContent = t("facetColAuthorAr");
  ths[2].textContent = t("facetColCentury");
  ths[3].textContent = t("facetColYears");
  ths[4].textContent = t("facetColBooks");
  ths[5].textContent = "";
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
    return (
      '<div class="author-browse-row facet-grid-authors' +
      (sel ? " selected" : "") +
      '" data-author="' +
      code +
      '" title="' +
      [d.name.en, d.name.ar, d.name.dv].filter(Boolean).join(" · ") +
      '">' +
      '<div class="facet-name"><span class="author-browse-name">' +
      escapeHTML(nm) +
      "</span></div>" +
      '<div class="facet-name-ar">' +
      (arName ? escapeHTML(arName) : "") +
      "</div>" +
      '<div class="facet-century">' +
      (century ? escapeHTML(century) : "") +
      "</div>" +
      '<div class="facet-range">' +
      (range ? escapeHTML(range) : "") +
      "</div>" +
      '<div class="facet-count">' +
      counts[code] +
      "</div>" +
      '<div class="facet-check">' +
      (sel ? "✓" : "") +
      "</div></div>"
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
  // [row-cell class, thead-cell class, custom property, cap] per modal —
  // the authors grid pins its name, Arabic and century tracks; the range
  // is the wide 1fr column, the one before the count — same shape as the
  // periods grid, which pins its label column (the century label is
  // short, so the range is 1fr there too). The name and Arabic tracks are
  // capped (240/280) so the longest names can't dominate on narrower
  // desktop widths and squeeze the range + count to nothing.
  pinFacetColumn("libAuthorsOverlay", [
    ["facet-name", "facet-col-name", "facet-name-w", 240],
    ["facet-name-ar", "facet-col-ar", "facet-ar-w", 280],
    ["facet-century", "facet-col-century", "facet-century-w"]
  ]);
  pinFacetColumn("libPeriodsOverlay", [
    ["facet-name", "facet-col-period", "facet-period-w"]
  ]);
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

/** Open the authors browse. books (optional) = the surface's book set —
 *  omitted on the dashboard (registry-visible), the searchable list on the
 *  library page and the search window (see visibleCounts). */
export function openAuthorsModal(books) {
  visibleCounts(books).then(function () {
    ensureAuthorsModal();
    authorsModalLabels();
    _authorsFilter.value = "";
    renderAuthorRows();
    openFacetModal("libAuthorsOverlay");
    pinFacetGeometry();
    _authorsFilter.focus();
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
    '<input id="libPeriodsFilter" type="search" class="search-input facet-filter-input" autocomplete="off" title="Filter periods" />' +
    "</div>" +
    '<div class="facet-thead-row"><div class="facet-grid facet-grid-periods">' +
    '<div class="facet-thead-cell facet-col-period"></div>' +
    '<div class="facet-thead-cell facet-col-range"></div>' +
    '<div class="facet-thead-cell facet-col-count"></div>' +
    '<div class="facet-thead-cell facet-col-check"></div>' +
    "</div></div>" +
    '<div class="facet-table-wrap"><div id="libPeriodsList"></div></div>';
  _periodsFilter = document.getElementById("libPeriodsFilter");
  _periodsList = document.getElementById("libPeriodsList");
  _periodsFilter.addEventListener("input", function () {
    renderPeriodRows();
    pinFacetGeometry();
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
  ths[2].textContent = t("facetColBooks");
  ths[3].textContent = "";
}

/** "201–300 AH" for a century bucket — the authorLife template's {b}–{d}
 *  range, filled with the bucket's AH span; "" for "modern" (no range). */
function periodRangeText(p) {
  if (p === "modern") return "";
  var n = parseInt(p, 10);
  if (!n || n < 1) return "";
  return t("authorLife")
    .replace("{b}", String((n - 1) * 100 + 1))
    .replace("{d}", String(n * 100));
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
    return [periodLabel(p), periodLabelEn(p), p, range].some(function (s) {
      return normaliseForSearch(s || "").indexOf(ft) !== -1;
    });
  });
  _periodsList.innerHTML = periods.map(function (p) {
    var sel = _period === p;
    var range = periodRangeText(p);
    // The century label is the row's name; the AH span gets its own column,
    // bracketed, so both columns stay uniform width down the list
    // ("modern" has no span — the range cell stays empty).
    return (
      '<div class="period-browse-row facet-grid-periods' +
      (sel ? " selected" : "") +
      '" data-period="' +
      p +
      '" title="' +
      periodLabelEn(p) +
      '">' +
      '<div class="facet-name">' +
      escapeHTML(periodLabel(p)) +
      "</div>" +
      '<div class="facet-range">' +
      (range ? "(" + escapeHTML(range) + ")" : "") +
      "</div>" +
      '<div class="facet-count">' +
      counts[p] +
      "</div>" +
      '<div class="facet-check">' +
      (sel ? "✓" : "") +
      "</div></div>"
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
    renderPeriodRows();
    openFacetModal("libPeriodsOverlay");
    pinFacetGeometry();
    _periodsFilter.focus();
  });
}

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
