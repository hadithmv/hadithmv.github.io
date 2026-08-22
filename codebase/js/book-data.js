/**
 * Book Data Module
 * Book registry, tag extraction, page metadata and bootstrap.
 * Loads metadata from 03-registry-bookMeta.csv and 01-registry-bookTags.csv.
 * All configuration lives in CSV files — no hardcoded data.
 * The dashboard UI built on this metadata lives in dashboard.js.
 */

import { fetchCSVObjects } from "./csv.js";
import { t, currentLang } from "./i18n.js";

let _bookNamesCache = null;
let _tagDefinitionsCache = null;
let _authorDefinitionsCache = null;

// ---------------------------------------------------------------------------
// Tag definitions — loaded from 01-registry-bookTags.csv
// ---------------------------------------------------------------------------

/**
 * Generate palette CSS with golden-ratio HSL slots (infinite, always distinct).
 * Inserts a <style> tag so colours auto-respond to theme changes.
 */
var _paletteCSSInjected = false;
function injectPaletteCSS(slotCount) {
  if (_paletteCSSInjected) return;
  _paletteCSSInjected = true;
  var css = "";
  for (var n = 0; n < slotCount; n++) {
    var hue = Math.round((n * 137.508) % 360);
    // Light / sepia
    css +=
      ".tag-palette-" +
      n +
      " { --tag-color: hsl(" +
      hue +
      ",55%,40%); --tag-bg: hsl(" +
      hue +
      ",40%,94%); }";
    // Dark
    css +=
      '[data-theme="dark"] .tag-palette-' +
      n +
      " { --tag-color: hsl(" +
      hue +
      ",50%,75%); --tag-bg: hsl(" +
      hue +
      ",25%,14%); }";
  }
  var style = document.createElement("style");
  style.id = "tag-palette-css";
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Load tag definitions from 01-registry-bookTags.csv.
 * Cached after first load; safe to call multiple times.
 * @returns {Promise<Object>} Map of tag code → {label: {dv,en,ar}, palette}
 */
export async function loadTagDefinitions() {
  if (_tagDefinitionsCache) {
    return _tagDefinitionsCache;
  }

  try {
    var result = await fetchCSVObjects("../data/01-registry-bookTags.csv");

    // Generate palette CSS with enough slots (tags + headroom)
    var tagCount = 0;
    for (var i = 0; i < result.length; i++) {
      if (result[i].tagCode) tagCount++;
    }
    injectPaletteCSS(Math.max(tagCount + 8, 20));

    // Build lookup map — assign each tag its palette slot in file order.
    // The slot IS the display order: chips sort by palette, not by code, so
    // the registry's hand-set row sequence drives every rendered tag row.
    // Labels are trilingual straight from the registry (tagCode,labelAR,
    // labelDV,labelEN) — tagLabel picks the right language at render time.
    _tagDefinitionsCache = {};
    var palIdx = 0;
    for (var i = 0; i < result.length; i++) {
      var row = result[i];
      if (row.tagCode) {
        _tagDefinitionsCache[row.tagCode] = {
          label: {
            dv: row.labelDV || row.tagCode,
            en: row.labelEN || row.tagCode,
            ar: row.labelAR || row.tagCode,
          },
          // Extra searchable words per language (comma-separated lists in the
          // registry) — names beyond the label that should still match the code.
          aliases: {
            dv: row.aliasesDV || "",
            en: row.aliasesEN || "",
            ar: row.aliasesAR || "",
          },
          palette: palIdx++,
        };
      }
    }
    return _tagDefinitionsCache;
  } catch (error) {
    console.error("Error loading 01-registry-bookTags.csv:", error);
    // Cache the empty result so we don't retry endlessly
    _tagDefinitionsCache = {};
    return _tagDefinitionsCache;
  }
}

/**
 * Extract tags for a book: the PRIMARY tag is the first registered prefix
 * segment of the bookCode (e.g. "HDT" in "HDT-muwattaMalik"); SECONDARY tags
 * come from the registry entry's `tags` column (comma-separated codes).
 *
 * Reads from the cached tag definitions — call loadTagDefinitions() first
 * to populate the cache, or the function returns no tags (graceful fallback).
 *
 * @param {string} bookCode - e.g. "HDT-muwattaMalik"
 * @param {Object} [entry] - the registry row (from 03-registry-bookMeta.csv);
 *   provides the `tags` column. Pass it whenever available.
 * @returns {Array<{code: string, label: Object, aliases: Object, palette: number}>}
 */
function extractTags(bookCode, entry) {
  if (!bookCode) return [];
  const defs = _tagDefinitionsCache || {};
  const codes = [];
  // Primary: first registered prefix segment (the new codes carry exactly one)
  const parts = bookCode.split("-");
  for (const p of parts) {
    if (defs[p]) { codes.push(p); break; }
  }
  // Secondary: the registry entry's tags column
  if (entry && entry.tags) {
    entry.tags.split(",").forEach((t) => {
      const code = t.trim();
      if (code && defs[code] && codes.indexOf(code) === -1) codes.push(code);
    });
  }
  return codes.map((code) => ({
    code,
    label: defs[code].label,
    aliases: defs[code].aliases,
    palette: defs[code].palette,
  }));
}

/**
 * All searchable words a book's tags contribute — the labels plus the alias
 * lists, in all three languages. This is the tag row's text that search
 * should match against the code (a query word hitting an alias or label
 * finds every book carrying that tag's code).
 *
 * @param {string} bookCode - e.g. "HDT-muwattaMalik"
 * @param {Object} [entry] - the registry row, for secondary tags (see extractTags)
 * @returns {string} space-joined words (aliases stay comma-separated inside)
 */
export function tagSearchWords(bookCode, entry) {
  var words = [];
  extractTags(bookCode, entry).forEach(function (tg) {
    ["dv", "en", "ar"].forEach(function (l) {
      if (tg.label && tg.label[l]) words.push(tg.label[l]);
      if (tg.aliases && tg.aliases[l]) words.push(tg.aliases[l]);
    });
  });
  return words.join(" ");
}

// ---------------------------------------------------------------------------
// Author definitions — loaded from 02-registry-bookAuthors.csv
// ---------------------------------------------------------------------------

/**
 * Load author definitions from 02-registry-bookAuthors.csv.
 * Cached after first load; safe to call multiple times.
 * @returns {Promise<Object>} Map of authorCode → {name: {dv,en,ar}, bornAH, diedAH}
 */
export async function loadAuthorDefinitions() {
  if (_authorDefinitionsCache) {
    return _authorDefinitionsCache;
  }
  try {
    var result = await fetchCSVObjects("../data/02-registry-bookAuthors.csv");
    _authorDefinitionsCache = {};
    for (var i = 0; i < result.length; i++) {
      var row = result[i];
      if (row.authorCode) {
        _authorDefinitionsCache[row.authorCode] = {
          name: {
            dv: row.nameDV || row.authorCode,
            en: row.nameEN || row.authorCode,
            ar: row.nameAR || row.authorCode,
          },
          bornAH: row.bornAH || "",
          diedAH: row.diedAH || "",
        };
      }
    }
    return _authorDefinitionsCache;
  } catch (error) {
    console.error("Error loading 02-registry-bookAuthors.csv:", error);
    _authorDefinitionsCache = {};
    return _authorDefinitionsCache;
  }
}

/** Sync lookup of the loaded author map ({} until loadAuthorDefinitions resolves). */
export function authorDefs() {
  return _authorDefinitionsCache || {};
}

/**
 * {y}/{b}/{d} template fill for the author year strings — the i18n keys
 * (authorDied/authorLife) carry the placeholders, filled with plain digits.
 */
function _fmtYears(str, map) {
  return str.replace(/\{(\w+)\}/g, function (_, k) {
    return map[k] != null ? map[k] : "";
  });
}

/** Hijri years text for one author def — "d. 256 AH" / "194–256 AH" / "" (living). */
export function authorYearsText(def) {
  if (!def) return "";
  if (def.bornAH && def.diedAH) return _fmtYears(t("authorLife"), { b: def.bornAH, d: def.diedAH });
  if (def.diedAH) return _fmtYears(t("authorDied"), { y: def.diedAH });
  return "";
}

// Author/period derivation — moved here from facet-browse.js so the browse
// modals and the book/author info modal share one derivation path (century
// bucket, period labels, AH/CE ranges, age). All derived at render, never
// stored; the AH→CE conversion is the standard approximation (1 Hijri year
// ≈ 0.970229 solar years, offset 621.57; rounded).

/** Author codes of a registry row ("" when the book has no author). */
export function authorCodesOf(b) {
  return ((b && b.authorCode) || "")
    .split(",")
    .map(function (s) { return s.trim(); })
    .filter(Boolean);
}

/** The modern era bucket's opening century — the 15th century AH (1401)
 *  and later (authorPeriodOf). The bucket's row name carries the open-ended
 *  "(15+)" marker and its ranges open at the century's first year. */
export var MODERN_PERIOD_CENTURY = 15;
/** 1401 — the first year of the 15th century AH (MODERN_PERIOD_CENTURY). */
var MODERN_PERIOD_FROM_AH = (MODERN_PERIOD_CENTURY - 1) * 100 + 1;

/** Period bucket of an author — death century as a string ("3"), "modern"
 *  when no death year is recorded OR the death fell in the modern era (the
 *  15th century AH, 1401, and later) — one bucket, not a numeric century
 *  and a "modern" catch-all. Buckets come from the 08 registry, not the
 *  data. */
export function authorPeriodOf(code) {
  var d = authorDefs()[code];
  if (!d || !d.diedAH) return "modern";
  var c = Math.ceil(parseInt(d.diedAH, 10) / 100);
  return c >= MODERN_PERIOD_CENTURY ? "modern" : String(c);
}

/** English period title — tooltips are English house style. */
export function periodLabelEn(p) {
  if (p === "modern") return "Modern era (15th century AH onward)";
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

/** "201–300 AH" for a century bucket — the authorLife template's {b}–{d}
 *  range, filled with the bucket's AH span; for "modern" (a bucket with a
 *  start but no closing year) the open-ended "from" form — "1401+ AH" —
 *  from the periodFromAH template, filled with the bucket's first year
 *  (the modern era opens at the 15th century AH, 1401). */
export function periodRangeText(p) {
  if (p === "modern") {
    return t("periodFromAH").replace("{y}", String(MODERN_PERIOD_FROM_AH));
  }
  var n = parseInt(p, 10);
  if (!n || n < 1) return "";
  return t("authorLife")
    .replace("{b}", String((n - 1) * 100 + 1))
    .replace("{d}", String(n * 100));
}

/** The same span in the Gregorian calendar — "817–913 CE" for bucket 3 —
 *  the authorLifeCe template filled with the bucket's endpoints converted
 *  AH → CE (the standard 1 Hijri year ≈ 0.970229 solar years approximation,
 *  offset 621.57; rounded); "modern" opens at its first year converted —
 *  "1981+ CE" (the periodFromCE template). Derived at render, never
 *  stored. */
export function periodRangeCeText(p) {
  if (p === "modern") {
    var ce = function (ah) { return Math.round(ah * 0.970229 + 621.57); };
    return t("periodFromCE").replace("{y}", String(ce(MODERN_PERIOD_FROM_AH)));
  }
  var n = parseInt(p, 10);
  if (!n || n < 1) return "";
  var ce = function (ah) { return Math.round(ah * 0.970229 + 621.57); };
  return t("authorLifeCe")
    .replace("{b}", String(ce((n - 1) * 100 + 1)))
    .replace("{d}", String(ce(n * 100)));
}

/** The author's lifetime in the Gregorian calendar, mirroring
 *  authorYearsText's missing-date handling (born+died → the authorLifeCe
 *  range; died only → the authorDiedCe single year; neither → ""). A "~"
 *  estimate in the data carries over to its CE side — the approximation
 *  cannot make an estimate precise. The same formula as periodRangeCeText. */
export function authorYearsCeText(d) {
  if (!d) return "";
  var num = function (s) { return parseInt(String(s || "").replace(/^~+/, ""), 10); };
  var ce = function (ah) { return Math.round(ah * 0.970229 + 621.57); };
  if (d.bornAH && d.diedAH) {
    return t("authorLifeCe")
      .replace("{b}", (String(d.bornAH).indexOf("~") === 0 ? "~" : "") + String(ce(num(d.bornAH))))
      .replace("{d}", String(ce(num(d.diedAH))));
  }
  if (d.diedAH) return t("authorDiedCe").replace("{y}", String(ce(num(d.diedAH))));
  return "";
}

/** The author's age — diedAH − bornAH, both required; a "~" estimate on
 *  either end carries over (the data cannot make an estimate precise); the
 *  language's year-unit shorthand follows ("86 އ." / "86 y." / "86 س.");
 *  "" when either date is missing. */
export function authorAgeText(d) {
  if (!d || !d.bornAH || !d.diedAH) return "";
  var num = function (s) { return parseInt(String(s || "").replace(/^~+/, ""), 10); };
  var age = num(d.diedAH) - num(d.bornAH);
  if (!(age > 0)) return "";
  return (String(d.bornAH).indexOf("~") === 0 || String(d.diedAH).indexOf("~") === 0 ? "~" : "") + String(age) + " " + t("facetAgeUnit");
}

/**
 * Author names for portable metadata (EPUB dc:creator): English names only,
 * no years, comma-joined — a bookshelf listing reads better without them.
 * "" when the book has no author.
 */
export function bookAuthorNames(entry) {
  var defs = _authorDefinitionsCache || {};
  var codes = ((entry && entry.authorCode) || "")
    .split(",")
    .map(function (s) { return s.trim(); })
    .filter(Boolean);
  var names = [];
  codes.forEach(function (code) {
    var d = defs[code];
    if (!d) return;
    names.push(d.name.en || d.name.ar || d.name.dv || code);
  });
  return names.join(", ");
}

/**
 * One display line for a book registry entry's authors: the name(s) in the
 * current language, each with its Hijri years — "al-Bukhari (– 256 AH)" —
 * joined for multi-author books with the script-appropriate comma (latin
 * "," in the English layout, the Arabic comma "،" in the Dhivehi/Arabic
 * ones). "" when the book has no author.
 */
export function bookAuthorLine(entry) {
  return bookAuthorParts(entry)
    .map(function (p) { return p.text; })
    .join(authorListSeparator());
}

/** The script-appropriate multi-author separator — the Latin comma in the
 *  English layout, the Arabic comma in the RTL ones. */
export function authorListSeparator() {
  return currentLang() === "en" ? ", " : "، ";
}

/**
 * The per-author display parts of a book registry entry's author list —
 * [{code, text}] in the current language, each name with its Hijri years
 * ("al-Bukhari (– 256 AH)"). The reader splits these into one button per
 * author; bookAuthorLine joins them with authorListSeparator(). [] when the
 * book has no author.
 */
export function bookAuthorParts(entry) {
  var defs = _authorDefinitionsCache || {};
  var codes = ((entry && entry.authorCode) || "")
    .split(",")
    .map(function (s) { return s.trim(); })
    .filter(Boolean);
  var l = currentLang();
  var parts = [];
  codes.forEach(function (code) {
    var d = defs[code];
    if (!d) return;
    var nm = d.name[l] || d.name.en || d.name.ar || code;
    var yrs = authorYearsText(d);
    parts.push({ code: code, text: yrs ? nm + " (" + yrs + ")" : nm });
  });
  return parts;
}

// ---------------------------------------------------------------------------
// Book registry — loaded from bookNames.csv
// ---------------------------------------------------------------------------

/**
 * Load the book registry (03-registry-bookMeta.csv) and parse it using parseCSV.
 * Uses a cache so the file is only fetched once per page load.
 * @returns {Promise<Array>} Array of book metadata objects (empty on error)
 */
export async function loadBookRegistry() {
  if (_bookNamesCache) {
    return _bookNamesCache;
  }

  try {
    _bookNamesCache = await fetchCSVObjects("../data/03-registry-bookMeta.csv");
    return _bookNamesCache;
  } catch (error) {
    console.error("Error loading 03-registry-bookMeta.csv:", error);
    return null; // null signals fetch failure (vs empty registry)
  }
}

/**
 * Look up page metadata by book code
 * @param {string} bookCode - The book code (e.g., "AQD-qawaidulArbau")
 * @returns {Promise<Object|null>} The metadata object or null if not found
 */
export async function getPageMetadata(bookCode) {
  const bookNames = await loadBookRegistry();
  if (!bookNames) return null;
  return bookNames.find((entry) => entry.bookCode === bookCode) || null;
}

/** Sync lookup — cache must already be populated (it is after page init). */
export function getBookTitleSync(bookCode) {
  if (!_bookNamesCache) return null;
  var entry = _bookNamesCache.find(function (e) {
    return e.bookCode === bookCode;
  });
  return entry ? entry.titleDV || entry.titleEN || bookCode : null;
}

/**
 * Resolve a possibly-stale book code to a current registry code. Renames
 * keep the base name and change the tag prefix (e.g. AKLQ-… → DFK-…), and
 * old codes survive in stored pins/history. Exact match wins; otherwise the
 * registry code sharing the longest dash-segment suffix, requiring 2+ shared
 * segments, or a unique 1-segment tail. Unresolvable codes come back
 * unchanged.
 */
export function resolveBookCode(code) {
  if (!_bookNamesCache || !code || code.indexOf("-") === -1) return code;
  var a = code.split("-");
  var best = null, bestSegs = 0, bestTies = 0;
  for (var i = 0; i < _bookNamesCache.length; i++) {
    var cand = _bookNamesCache[i].bookCode;
    if (cand === code) return code;
    var b = cand.split("-");
    var n = 0;
    while (n < a.length && n < b.length && a[a.length - 1 - n] === b[b.length - 1 - n]) n++;
    if (n > bestSegs) { bestSegs = n; best = cand; bestTies = 1; }
    else if (n === bestSegs && n > 0) bestTies++;
  }
  if (!best || bestSegs === 0) return code;
  return (bestSegs >= 2 || bestTies === 1) ? best : code;
}

/** Sync version lookup (registry content-hash column) — "" when unknown. */
export function getBookVersionSync(bookCode) {
  if (!_bookNamesCache) return "";
  var entry = _bookNamesCache.find(function (e) {
    return e.bookCode === bookCode;
  });
  return entry ? entry.version || "" : "";
}

/**
 * Extract tags from a bookCode.
 * Exported for use in page templates.
 */
export { extractTags };

/**
 * Get CSV path for the current page
 * @param {string} bookCode - The book code without extension
 * @returns {string} Path to the CSV file in data folder
 */
export function getCsvPath(bookCode) {
  return `../data/content/${bookCode}.csv`;
}

import { addPin, removePin, isPinned, addReadHistory, evictCandidateName } from "./pins-history.js";

// Re-export for reader.js
export { addPin, removePin, isPinned, addReadHistory, evictCandidateName };

// ---------------------------------------------------------------------------
// Page initialisation (book path — dashboard init lives in dashboard.js)
// ---------------------------------------------------------------------------

/**
 * Initialize the page with metadata for a book (?book=CODE).
 * Preloads tag definitions so extractTags() works in all downstream paths.
 * The dashboard (no ?book=) is initialized by dashboard.js instead.
 *
 * @param {Function} callback - Called with metadata object for the selected book
 */
export async function initializePageWithMetadata(callback) {
  // Preload tag + author definitions before any rendering — ensures
  // extractTags() and bookAuthorLine() have data in the book-view path.
  await loadTagDefinitions();
  await loadAuthorDefinitions();

  const urlParams = new URLSearchParams(window.location.search);
  const bookCode = urlParams.get("book");

  if (!bookCode) return; // dashboard path lives in dashboard.js

  const metadata = await getPageMetadata(bookCode);

  if (metadata) {
    metadata.csvPath = getCsvPath(bookCode);
    callback(metadata);
  } else {
    // Book not found in registry — show error
    const loading = document.getElementById("loadingMessage");
    if (loading) loading.style.display = "none";

    const error = document.getElementById("errorMessage");
    if (error) {
      error.textContent =
        `Book "${bookCode}" was not found in the registry. ` +
        `The registry may have failed to load, or the book code is incorrect.`;
      error.style.display = "block";
    }
    console.warn(`Metadata not found for book: ${bookCode}`);
  }
}
