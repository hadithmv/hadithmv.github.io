/**
 * Facet Browse Module (Authors & Periods)
 *
 * The one Authors/Periods browse used by every surface: the library-search
 * page's chips + buttons, the dashboard's functions panel + chips, and the
 * search window's All-books tab. Owns the selection state (one page load,
 * one facet state — the library page, dashboard and window on that page all
 * read/write the same state), the shared browse modals (filter input +
 * sticky-header table, trilingual rows), and the chip markup. Consumers
 * subscribe via onFacetChange and re-render their own chips/results; the
 * module re-renders its own open modals.
 *
 * The modals' ids (libAuthorsOverlay / libPeriodsOverlay) are the same on
 * every page — one page is loaded at a time, so no collisions.
 */

import { t, currentLang } from "./i18n.js";
import { authorDefs, loadAuthorDefinitions, loadBookRegistry, authorYearsText } from "./book-data.js";
import { escapeHTML } from "./search-utils.js";

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

/** Period display label in the current language ("3rd century AH" / modern). */
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

// Counts over the registry's visible (-HDN excluded) books — the same set
// every surface chips against. Lazy + cached; the pages pass their own list
// to facetCounts when they already hold it.
var _counts = null;
export function visibleCounts() {
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
// Filter input on top, then a table whose thead stays pinned while only the
// rows scroll (the modal body is the flex-column pins-history-body; the
// table wrap is the flex:1 scrollport).
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
    '<input id="libAuthorsFilter" type="search" class="facet-filter-input" autocomplete="off" title="Filter authors by name or code" />' +
    "</div>" +
    '<div class="facet-table-wrap"><table class="facet-table"><thead><tr>' +
    "<th></th><th></th><th></th><th></th>" +
    "</tr></thead><tbody id=\"libAuthorsList\"></tbody></table></div>";
  _authorsFilter = document.getElementById("libAuthorsFilter");
  _authorsList = document.getElementById("libAuthorsList");
  _authorsFilter.addEventListener("input", function () { renderAuthorRows(); });
  _authorsBody.addEventListener("click", function (e) {
    var row = e.target.closest(".author-browse-row");
    if (row) toggleAuthor(row.dataset.author);
  });
}

function authorsModalLabels() {
  _authorsTitle.textContent = t("libAuthorsTitle");
  _authorsFilter.placeholder = t("libAuthorsFilter");
  var ths = _authorsBody.querySelectorAll("thead th");
  ths[0].textContent = t("facetColAuthor");
  ths[1].textContent = t("facetColYears");
  ths[2].textContent = t("facetColBooks");
  ths[3].textContent = "";
}

/** The rows — registry order, only authors with visible books; the filter
 *  matches any of the three names or the code. */
function renderAuthorRows() {
  if (!_authorsList) return;
  var ft = (_authorsFilter.value || "").trim().toLowerCase();
  var counts = (_counts && _counts.byAuthor) || {};
  var defs = authorDefs();
  var l = currentLang();
  var codes = Object.keys(defs).filter(function (code) {
    if (!counts[code]) return false;
    if (!ft) return true;
    var d = defs[code];
    return [code, d.name.dv, d.name.ar, d.name.en].some(function (s) {
      return (s || "").toLowerCase().indexOf(ft) !== -1;
    });
  });
  _authorsList.innerHTML = codes.map(function (code) {
    var d = defs[code];
    var nm = d.name[l] || d.name.en || d.name.ar || code;
    var yrs = authorYearsText(d);
    var sel = _authors.indexOf(code) !== -1;
    // The other names, Arabic always included — every row shows the Arabic
    // name no matter the UI language.
    var alt = l === "ar"
      ? [d.name.dv, d.name.en]
      : [d.name.ar, l === "en" ? d.name.dv : d.name.en];
    alt = alt.filter(function (n) { return n && n !== nm; });
    return (
      '<tr class="author-browse-row' +
      (sel ? " selected" : "") +
      '" data-author="' +
      code +
      '" title="' +
      (d.name.en || code) +
      '">' +
      '<td class="facet-name"><span class="author-browse-name">' +
      escapeHTML(nm) +
      "</span>" +
      (alt.length
        ? '<span class="facet-name-alt">' + escapeHTML(alt.join(" · ")) + "</span>"
        : "") +
      "</td>" +
      '<td class="facet-years">' +
      (yrs ? escapeHTML(yrs) : "") +
      "</td>" +
      '<td class="facet-count">' +
      counts[code] +
      "</td>" +
      '<td class="facet-check">' +
      (sel ? "✓" : "") +
      "</td></tr>"
    );
  }).join("") ||
    '<tr class="facet-empty"><td colspan="4">' + t("libAuthorsNoMatch") + "</td></tr>";
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

export function openAuthorsModal() {
  visibleCounts().then(function () {
    ensureAuthorsModal();
    authorsModalLabels();
    _authorsFilter.value = "";
    renderAuthorRows();
    openFacetModal("libAuthorsOverlay");
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
    '<input id="libPeriodsFilter" type="search" class="facet-filter-input" autocomplete="off" title="Filter periods" />' +
    "</div>" +
    '<div class="facet-table-wrap"><table class="facet-table"><thead><tr>' +
    "<th></th><th></th><th></th>" +
    "</tr></thead><tbody id=\"libPeriodsList\"></tbody></table></div>";
  _periodsFilter = document.getElementById("libPeriodsFilter");
  _periodsList = document.getElementById("libPeriodsList");
  _periodsFilter.addEventListener("input", function () { renderPeriodRows(); });
  _periodsBody.addEventListener("click", function (e) {
    var row = e.target.closest(".period-browse-row");
    if (row) togglePeriod(row.dataset.period);
  });
}

function periodsModalLabels() {
  _periodsTitle.textContent = t("libPeriodsTitle");
  _periodsFilter.placeholder = t("libPeriodsFilter");
  var ths = _periodsBody.querySelectorAll("thead th");
  ths[0].textContent = t("facetColPeriod");
  ths[1].textContent = t("facetColBooks");
  ths[2].textContent = "";
}

/** The rows — distinct death-century buckets + modern, chronological order
 *  (modern last), zero-count buckets dropped. */
function renderPeriodRows() {
  if (!_periodsList) return;
  var ft = (_periodsFilter.value || "").trim().toLowerCase();
  var counts = (_counts && _counts.byPeriod) || {};
  var periods = Object.keys(counts).sort(function (a, b) {
    if (a === "modern") return 1;
    if (b === "modern") return -1;
    return parseInt(a, 10) - parseInt(b, 10);
  }).filter(function (p) {
    if (!ft) return true;
    return [periodLabel(p), periodLabelEn(p), p].some(function (s) {
      return (s || "").toLowerCase().indexOf(ft) !== -1;
    });
  });
  _periodsList.innerHTML = periods.map(function (p) {
    var sel = _period === p;
    return (
      '<tr class="period-browse-row' +
      (sel ? " selected" : "") +
      '" data-period="' +
      p +
      '" title="' +
      periodLabelEn(p) +
      '">' +
      '<td class="facet-name">' +
      escapeHTML(periodLabel(p)) +
      "</td>" +
      '<td class="facet-count">' +
      counts[p] +
      "</td>" +
      '<td class="facet-check">' +
      (sel ? "✓" : "") +
      "</td></tr>"
    );
  }).join("") ||
    '<tr class="facet-empty"><td colspan="3">' + t("libPeriodsNoMatch") + "</td></tr>";
}

export function openPeriodsModal() {
  visibleCounts().then(function () {
    ensurePeriodsModal();
    periodsModalLabels();
    _periodsFilter.value = "";
    renderPeriodRows();
    openFacetModal("libPeriodsOverlay");
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
});
