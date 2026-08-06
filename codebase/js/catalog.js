/**
 * Catalog Module
 * Book registry, tag extraction, page metadata and bootstrap.
 * Loads metadata from 02-registry-bookNames.csv and 01-registry-bookTags.csv.
 * All configuration lives in CSV files — no hardcoded data.
 * The dashboard UI built on this metadata lives in dashboard.js.
 */

import { loadCSVData } from "./csv.js";

let _bookNamesCache = null;
let _tagDefinitionsCache = null;

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
 * @returns {Promise<Object>} Map of tag code → {label, palette}
 */
export async function loadTagDefinitions() {
  if (_tagDefinitionsCache) {
    return _tagDefinitionsCache;
  }

  try {
    var result = await loadCSVData("../data/01-registry-bookTags.csv");

    // Generate palette CSS with enough slots (tags + headroom)
    var tagCount = 0;
    for (var i = 0; i < result.length; i++) {
      if (result[i].code && result[i].code !== "PIN") tagCount++;
    }
    injectPaletteCSS(Math.max(tagCount + 8, 20));

    // Build lookup map — assign sequential palette slot to each tag (skipping PIN)
    _tagDefinitionsCache = {};
    var palIdx = 0;
    for (var i = 0; i < result.length; i++) {
      var row = result[i];
      if (row.code) {
        var code = row.code;
        var palette = code === "PIN" ? -1 : palIdx++;
        _tagDefinitionsCache[code] = {
          label: row.label || code,
          palette: palette,
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
 * @param {Object} [entry] - the registry row (from 02-registry-bookNames.csv);
 *   provides the `tags` column. Pass it whenever available.
 * @returns {Array<{code: string, label: string, palette: number}>}
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
    palette: defs[code].palette,
  }));
}

// ---------------------------------------------------------------------------
// Book registry — loaded from bookNames.csv
// ---------------------------------------------------------------------------

/**
 * Load bookNames.csv and parse it using parseCSV.
 * Uses a cache so the file is only fetched once per page load.
 * @returns {Promise<Array>} Array of book metadata objects (empty on error)
 */
export async function loadBookNames() {
  if (_bookNamesCache) {
    return _bookNamesCache;
  }

  try {
    _bookNamesCache = await loadCSVData("../data/02-registry-bookNames.csv");
    return _bookNamesCache;
  } catch (error) {
    console.error("Error loading bookNames.csv:", error);
    return null; // null signals fetch failure (vs empty registry)
  }
}

/**
 * Look up page metadata by book code
 * @param {string} bookCode - The book code (e.g., "AQD-qawaidulArbau")
 * @returns {Promise<Object|null>} The metadata object or null if not found
 */
export async function getPageMetadata(bookCode) {
  const bookNames = await loadBookNames();
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

import { addPin, removePin, isPinned, addReadHistory } from "./pins-history.js";

// Re-export for reader.js
export { addPin, removePin, isPinned, addReadHistory };

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
  // Preload tag definitions before any rendering — ensures extractTags()
  // has data in the book-view path.
  await loadTagDefinitions();

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
