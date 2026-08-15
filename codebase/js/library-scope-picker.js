/**
 * Library Book-Scope Picker Module
 * The ?books= scope picker, shared by books/library-search.html (the libScope
 * modal) and the search window's scope section. The picker lists only books
 * the search index actually knows (meta.bookIds): RDF dictionaries and other
 * ENTIRE-BOOK-excluded books are absent by design — they have no postings.
 *
 * One surface renders the shell at a time: renderScopeShell(target) clears the
 * previous surface's container first, because the shell's inner ids are global
 * (getElementById would return the first match while both copies exist).
 */

import { tagLabel, t, currentLang } from "./i18n.js";
import { loadSearchIndex } from "./library-search-engine.js";
import { extractTags, tagSearchWords } from "./book-data.js";
import { escapeHTML, scoreFilterTokens, normaliseForSearch } from "./search-utils.js";

// ── State ────────────────────────────────────────────────────
var _selectedBooks = null; // book scope: null = every book; else explicit bookCode list
var _searchableBooks = null; // picker list — visible books that are in the search index
var _bookByCode = {}; // bookCode → registry entry (picker titles)
var _scopeFilter = ""; // picker's filter-box text
var _cfg = null; // { bookNames(), onScopeChange() }
var _ui = {
  target: null, // element the shell currently lives in (one surface at a time)
  filter: null,
  types: null,
  typesLabel: null,
  chips: null,
  list: null,
  count: null,
  reset: null,
};

/** Substitute {k} placeholders in an i18n template string. */
export function fillTemplate(key, map) {
  var s = t(key);
  for (var k in map) s = s.replace("{" + k + "}", map[k]);
  return s;
}

/** The page handed over its onScopeChange slot; the search window's shell
 *  reacts via the window event — one callback slot is not enough for two
 *  surfaces, so every change fans out through both channels. */
function _notifyChange() {
  if (_cfg && _cfg.onScopeChange) _cfg.onScopeChange();
  window.dispatchEvent(new CustomEvent("libScopeChange"));
}

/** The page hands over its registry accessor + the scope-changed callback. */
export function initScopePicker(cfg) {
  _cfg = cfg;
}

/** Explicit book-code list, or null = every book. */
export function getScope() {
  return _selectedBooks;
}

export function setScope(list) {
  _selectedBooks = list || null;
}

export function isBookSelected(code) {
  return !!_selectedBooks && _selectedBooks.indexOf(code) !== -1;
}

/** The picker's book list, lazily derived from the index meta. */
export function ensureSearchableBooks() {
  if (_searchableBooks) return Promise.resolve();
  var bookNames = _cfg ? _cfg.bookNames() : [];
  return loadSearchIndex()
    .then(function (index) {
      var ids = index.meta.bookIds;
      _searchableBooks = bookNames.filter(function (b) {
        return !b.bookCode.endsWith("-HDN") && ids.indexOf(b.bookCode) !== -1;
      });
    })
    .catch(function () {
      // Index unavailable → fall back to every visible book (search is
      // failing anyway; the list is still honest about the registry).
      _searchableBooks = bookNames.filter(function (b) {
        return !b.bookCode.endsWith("-HDN");
      });
    })
    .then(function () {
      _bookByCode = {};
      _searchableBooks.forEach(function (b) {
        _bookByCode[b.bookCode] = b;
      });
    });
}

/** Group the searchable books by EVERY tag they carry — the same semantics as
 *  the page's tag row, not just the primary prefix tag — so a book carrying
 *  several tags appears in several groups. */
function scopeGroups() {
  var groups = {};
  var order = [];
  _searchableBooks.forEach(function (b) {
    extractTags(b.bookCode, b).forEach(function (tg) {
      var g = groups[tg.code];
      if (!g) {
        g = groups[tg.code] = { code: tg.code, label: tg.label, palette: tg.palette, codes: [] };
        order.push(tg.code);
      }
      g.codes.push(b.bookCode);
    });
  });
  // Group order follows the registry's row order (palette slot), not the code.
  order.sort(function (a, b) {
    return groups[a].palette - groups[b].palette;
  });
  return order.map(function (c) {
    return groups[c];
  });
}

function allCodes() {
  return _searchableBooks.map(function (b) {
    return b.bookCode;
  });
}

/** Update _selectedBooks for one book; a full selection collapses to null. */
function setBookSelected(code, on) {
  var all = allCodes();
  var cur = _selectedBooks ? _selectedBooks.slice() : [];
  var i = cur.indexOf(code);
  if (on && i === -1) cur.push(code);
  if (!on && i !== -1) cur.splice(i, 1);
  // Empty and full both mean "no restriction" — an empty array would pass the
  // truthy scope check in computeScope and return zero results.
  _selectedBooks = (cur.length === 0 || cur.length === all.length) ? null : cur;
  _notifyChange();
}

/** Update _selectedBooks for a whole type group (the popover's chips). */
function setGroupSelected(tagCode, on) {
  var gs = scopeGroups();
  var group = null;
  for (var i = 0; i < gs.length; i++) {
    if (gs[i].code === tagCode) { group = gs[i]; break; }
  }
  if (!group) return;
  var all = allCodes();
  var cur = _selectedBooks ? _selectedBooks.slice() : [];
  for (var g = 0; g < group.codes.length; g++) {
    var code = group.codes[g];
    var i = cur.indexOf(code);
    if (on && i === -1) cur.push(code);
    if (!on && i !== -1) cur.splice(i, 1);
  }
  _selectedBooks = (cur.length === 0 || cur.length === all.length) ? null : cur;
  _notifyChange();
}

function isGroupFullySelected(tagCode) {
  var gs = scopeGroups();
  for (var i = 0; i < gs.length; i++) {
    if (gs[i].code !== tagCode) continue;
    for (var j = 0; j < gs[i].codes.length; j++) {
      if (!isBookSelected(gs[i].codes[j])) return false;
    }
    return true;
  }
  return false;
}

/** Is the current surface the libScope modal, and is it open? */
export function scopeModalOpen() {
  if (!_ui.target || _ui.target.id !== "libScopeModalBody") return false;
  var ov = document.getElementById("libScopeOverlay");
  return !!ov && ov.classList.contains("open");
}

/**
 * Render the shell into target. The shell (head + empty containers) — the
 * inner lists/chips are rebuilt on filter/selection changes, so the filter
 * input keeps its focus and the reset button keeps its listener.
 */
export function renderScopeShell(target) {
  // Cross-surface clearing: only one surface may hold the shell's global ids.
  if (_ui.target && _ui.target !== target && _ui.target.parentNode) {
    _ui.target.innerHTML = "";
  }
  _ui.target = target;
  _scopeFilter = "";
  target.innerHTML =
    // One pinned header row spanning both panes: the rail's "Tags" pane label
    // rightmost (above the rail), the filter and the count over the list.
    // Everything below the header scrolls inside its own pane — the label
    // never scrolls out of view with the chips. The reset button lives in the
    // header beside the count, not in the rail: it clears the whole scope (a
    // picker-wide action, not a chip-local one) and stays reachable even when
    // the rail is scrolled — and sitting next to the "N of M books selected"
    // readout, it reads as the undo for the very state the count shows.
    // Desktop maps label and head to the grid's first row; the stacked layout
    // puts the label above the chips row, which comes above the filter row,
    // which comes above the list (the filter stays directly above the list it
    // describes).
    '<div id="libScopeTypesLabel" class="lib-scope-pane-label">' + t("libScopeTypesLabel") + "</div>" +
    // The rail: only the chips (a plain, always-visible element — no state to
    // survive a rebuild). The chips sub-container is the whole rail, so it is
    // rebuilt on filter/selection changes with no listeners to preserve.
    '<div id="libScopeTypes" class="lib-scope-types">' +
    '<span id="libScopeChips" class="lib-scope-chips"></span>' +
    "</div>" +
    '<div class="lib-scope-head">' +
    '<input type="search" id="libScopeFilter" class="search-input lib-scope-filter" ' +
    'placeholder="' + t("libScopeFilter") + '" autocomplete="off" title="Filter books" />' +
    '<div id="libScopeCount" class="lib-scope-count"></div>' +
    '<button type="button" id="libScopeReset" class="toolbar-btn lib-scope-reset">' +
    t("libScopeReset") + "</button>" +
    "</div>" +
    '<div id="libScopeList" class="lib-scope-list"></div>';
  _ui.filter = document.getElementById("libScopeFilter");
  _ui.types = document.getElementById("libScopeTypes");
  _ui.typesLabel = document.getElementById("libScopeTypesLabel");
  _ui.chips = document.getElementById("libScopeChips");
  _ui.list = document.getElementById("libScopeList");
  _ui.count = document.getElementById("libScopeCount");
  _ui.reset = document.getElementById("libScopeReset");
  _ui.filter.addEventListener("input", function () {
    _scopeFilter = this.value;
    renderScopePopover();
  });
  _ui.reset.addEventListener("click", function () {
    if (_selectedBooks === null) return; // nothing scoped → nothing to reset
    _selectedBooks = null;
    _notifyChange();
  });
  // Delegation on the containers — they survive list re-renders. No
  // outside-click handler exists for modals (backdrop click closes via
  // e.target === overlay), so a re-render detaching the clicked chip is safe.
  _ui.types.addEventListener("click", function (e) {
    var chip = e.target.closest(".tag-chip");
    if (!chip || chip.dataset.tag === window.TAG_ALL) return;
    setGroupSelected(chip.dataset.tag, !isGroupFullySelected(chip.dataset.tag));
  });
  _ui.list.addEventListener("change", function (e) {
    var cb = e.target;
    if (cb.type !== "checkbox" || !cb.dataset.book) return;
    setBookSelected(cb.dataset.book, cb.checked);
  });
}

/** Render the shell into target only if it is not already there. */
export function ensureScopeShell(target) {
  if (_ui.target !== target) renderScopeShell(target);
}

/** Empty the picker's filter box (called on modal open). */
export function clearScopeFilter() {
  _scopeFilter = "";
  if (_ui.filter) _ui.filter.value = "";
}

function scopeRowHTML(code) {
  var b = _bookByCode[code];
  var title = "";
  if (b) {
    var l = currentLang();
    title = l === "dv" ? b.titleDV : l === "ar" ? b.titleAR : b.titleEN;
    if (!title) title = b.titleEN || b.titleDV || b.titleAR || "";
  }
  // The secondary line is the book's Arabic title — its canonical name in
  // every language; the row's tooltip carries the machine code (the ?books=
  // value) for power users sharing links.
  return (
    '<label class="lib-scope-row" data-book="' + code + '" title="' + code + '">' +
    '<input type="checkbox" data-book="' + code + '"' +
    (isBookSelected(code) ? " checked" : "") + " />" +
    '<span class="lib-scope-title">' + escapeHTML(title || code) + "</span>" +
    '<span class="lib-scope-sub">' + escapeHTML(b && b.titleAR ? b.titleAR : "") + "</span></label>"
  );
}

export function renderScopePopover() {
  if (!_searchableBooks || !_ui.list) return;
  var groups = scopeGroups();
  var total = allCodes().length;
  var selCount = _selectedBooks ? _selectedBooks.length : total;
  _ui.chips.innerHTML = groups.map(function (g) {
    return window.tagChipHtml(g.code, g.label, g.palette, isGroupFullySelected(g.code), g.codes.length);
  }).join("");
  var f = normaliseForSearch(_scopeFilter.toLowerCase());
  var html = [];
  // The rail's chips show every tag a book carries, so a book belongs to
  // several groups — but the list is a picker, not a taxonomy: each book
  // renders exactly once, under its first group (groups run in the tag
  // registry's file order, which is also the palette/display order); a
  // group label whose books were all claimed by earlier groups is skipped.
  // The filter is always-fuzzy, exact-ranked (scoreFilterTokens, same as
  // the dashboard box): titles + tag words may match within 1–2 edits, the
  // code is exact-only — a 2-edit match on a code is a different book.
  // Exact hits float to the top of their group; the sort is stable, so
  // equal scores keep the registry's hand-set display order.
  var seen = {};
  var scores = {};
  groups.forEach(function (g) {
    var shown = g.codes.filter(function (code) {
      if (seen[code]) return false;
      seen[code] = true;
      if (!f) return true;
      var b = _bookByCode[code];
      var s = scoreFilterTokens(
        [f],
        [
          // normaliseForSearch: same script-level equivalence as the
          // dashboard (hamza/tashkeel forms, Thaana dotted letters), then
          // lowercase for Latin case-insensitivity. Tag words (labels +
          // aliases, all languages) — a query hitting a tag's text finds
          // every book carrying that tag's code.
          normaliseForSearch(((b ? (b.titleAR || "") + " " + (b.titleDV || "") + " " + (b.titleEN || "") : "") +
            (b ? " " + tagSearchWords(code, b) : "")).toLowerCase())
        ],
        normaliseForSearch(code.toLowerCase())
      );
      if (s >= 0) scores[code] = s;
      return s >= 0;
    });
    shown.sort(function (a, b) {
      var sa = scores[a] || 0;
      var sb = scores[b] || 0;
      return sa - sb; // stable: equal scores keep registry order
    });
    if (shown.length === 0) return;
    html.push('<div class="lib-scope-group-label">' + tagLabel(g.code, g.label) + "</div>");
    shown.forEach(function (code) {
      html.push(scopeRowHTML(code));
    });
  });
  _ui.list.innerHTML = html.join("") ||
    '<div class="lib-scope-none">' + t("libScopeNoMatch") + "</div>";
  // Unscoped → "44 books"; scoped → "4 of 44 books selected"
  _ui.count.textContent = _selectedBooks
    ? fillTemplate("libScopeFoot", { n: selCount, m: total })
    : fillTemplate("libScopeCount", { n: total });
}

/**
 * Pin the count's width to its widest state so ticking books never resizes
 * the filter beside it — the same swap-stability contract as
 * window.reserveWidestText elsewhere. The count's shapes are enumerable: the
 * unscoped "N books" and the scoped "S of N books selected" templates, with
 * the most digits (S = N-1) giving the widest — so the reservation is exact,
 * not a guess. The modal must be visible to measure, so this runs right
 * after openModal and on language change while the modal is open.
 */
export function reserveScopeCountWidth() {
  var t = allCodes().length;
  var s = t > 1 ? t - 1 : 1;
  window.reserveWidestText(_ui.count, [
    fillTemplate("libScopeCount", { n: t }),
    fillTemplate("libScopeFoot", { n: s, m: t })
  ]);
}

/** Language switch: relabel the current surface; reserve while the modal is open. */
export function refreshScopeLabels() {
  if (!_ui.target) return;
  if (_ui.typesLabel) _ui.typesLabel.textContent = t("libScopeTypesLabel");
  if (_ui.filter) _ui.filter.placeholder = t("libScopeFilter");
  if (_ui.reset) _ui.reset.textContent = t("libScopeReset");
  if (scopeModalOpen()) reserveScopeCountWidth(); // templates changed
}
