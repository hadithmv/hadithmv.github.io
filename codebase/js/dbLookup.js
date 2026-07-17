/**
 * Database Lookup Module
 * Loads and manages 01-bookNames.csv and 02-bookTags.csv metadata.
 * All configuration lives in CSV files — no hardcoded data.
 */

import { tagLabel, t, normaliseForSearch } from "./i18n.js";

let bookNamesCache = null;
let tagDefinitionsCache = null;

// ---------------------------------------------------------------------------
// Tag definitions — loaded from 02-bookTags.csv
// ---------------------------------------------------------------------------

/**
 * Load tag definitions from 02-bookTags.csv.
 * Cached after first load; safe to call multiple times.
 * @returns {Promise<Object>} Map of tag code → {label, color, bg}
 */
async function loadTagDefinitions() {
  if (tagDefinitionsCache) {
    return tagDefinitionsCache;
  }

  try {
    const response = await fetch("../data/02-bookTags.csv");
    if (!response.ok) {
      throw new Error(`Failed to load tags (HTTP ${response.status})`);
    }
    const csv = await response.text();

    const result = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      transform: (v) => v.trim(),
    });

    if (result.errors.length > 0) {
      console.warn("Tag CSV parsing warnings:", result.errors);
    }

    // Build lookup map: { AQD: {label, color, bg}, HDT: {...}, ... }
    tagDefinitionsCache = {};
    for (const row of result.data) {
      if (row.code) {
        tagDefinitionsCache[row.code] = {
          label: row.label || row.code,
          color: row.color || "#333",
          bg: row.bg || "#f5f5f5",
        };
      }
    }
    return tagDefinitionsCache;
  } catch (error) {
    console.error("Error loading 02-bookTags.csv:", error);
    // Cache the empty result so we don't retry endlessly
    tagDefinitionsCache = {};
    return tagDefinitionsCache;
  }
}

/**
 * Extract tag codes from a bookCode.
 * Tags are all leading segments separated by '-', excluding the last segment
 * (which is the actual book name). Only tags registered in tags.csv are returned.
 *
 * Reads from the cached tag definitions — call loadTagDefinitions() first
 * to populate the cache, or the function returns no tags (graceful fallback).
 *
 * @param {string} bookCode - e.g. "AQD-DFK-sharhuSunnahBarbahari"
 * @returns {Array<{code: string, label: string, color: string, bg: string}>}
 */
function extractTags(bookCode) {
  if (!bookCode) return [];
  const parts = bookCode.split("-");
  const tagCodes = parts.slice(0, -1);
  const defs = tagDefinitionsCache || {};
  return tagCodes
    .filter((code) => defs[code])
    .map((code) => ({
      code,
      label: defs[code].label,
      color: defs[code].color,
      bg: defs[code].bg,
    }));
}

// ---------------------------------------------------------------------------
// Book registry — loaded from bookNames.csv
// ---------------------------------------------------------------------------

/**
 * Load bookNames.csv and parse it using PapaParse.
 * Uses a cache so the file is only fetched once per page load.
 * @returns {Promise<Array>} Array of book metadata objects (empty on error)
 */
export async function loadBookNames() {
  if (bookNamesCache) {
    return bookNamesCache;
  }

  try {
    const response = await fetch("../data/01-bookNames.csv");
    if (!response.ok) {
      throw new Error(
        `Failed to load book registry (HTTP ${response.status})`,
      );
    }
    const csv = await response.text();

    const result = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
    });

    if (result.errors.length > 0) {
      console.warn("CSV parsing warnings:", result.errors);
    }

    bookNamesCache = result.data;
    return result.data;
  } catch (error) {
    console.error("Error loading bookNames.csv:", error);
    return [];
  }
}

/**
 * Look up page metadata by book code
 * @param {string} bookCode - The book code (e.g., "AQD-qawaidulArbau")
 * @returns {Promise<Object|null>} The metadata object or null if not found
 */
export async function getPageMetadata(bookCode) {
  const bookNames = await loadBookNames();
  return bookNames.find((entry) => entry.bookCode === bookCode) || null;
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
  return `../data/${bookCode}.csv`;
}

// ---------------------------------------------------------------------------
// Page initialisation
// ---------------------------------------------------------------------------

/**
 * Initialize page with metadata.
 * When no book is selected, renders the dashboard.
 * When a book is selected, invokes the callback with metadata.
 *
 * Preloads tag definitions so extractTags() works in all downstream paths.
 *
 * @param {Function} callback - Called with metadata object for the selected book
 */
export async function initializePageWithMetadata(callback) {
  // Preload tag definitions before any rendering — ensures extractTags()
  // has data in both the dashboard path and the book-view path.
  await loadTagDefinitions();

  const urlParams = new URLSearchParams(window.location.search);
  const bookCode = urlParams.get("book");

  if (!bookCode) {
    const bookNames = await loadBookNames();
    renderDashboard(bookNames);
    setupDashboardControls();
    return;
  }

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

/**
 * Render the book selection grid.
 * Shows an error message when no books could be loaded.
 * @param {Array} bookNames - Array of book metadata objects
 */
let _lastBookNames = null;
let _dashFilter = { search: "", tags: [], sort: "az" };
let _dashTableMode = false;

function renderDashboard(bookNames) {
  _lastBookNames = bookNames;
  const loading = document.getElementById("loadingMessage");
  if (loading) loading.style.display = "none";

  // Error state: registry is empty (failed to load or no books registered)
  if (!bookNames || bookNames.length === 0) {
    const error = document.getElementById("errorMessage");
    if (error) {
      error.textContent =
        "Unable to load the book registry. Please check your connection and try again.";
      error.style.display = "block";
    }
    return;
  }

  const dashboard = document.getElementById("dashboardWrapper");
  if (dashboard) dashboard.style.display = "block";

  // Filter out hidden books
  var visible = bookNames.filter(function (b) { return !b.bookCode.endsWith("-HDN"); });

  // Apply search filter
  var q = _dashFilter.search.trim();
  if (q) {
    var nq = normaliseForSearch(q);
    visible = visible.filter(function (b) {
      return normaliseForSearch(b.titleDV || "").indexOf(nq) !== -1 ||
             normaliseForSearch(b.titleAR || "").indexOf(nq) !== -1 ||
             normaliseForSearch(b.titleEN || "").indexOf(nq) !== -1 ||
             normaliseForSearch(b.bookCode || "").indexOf(nq) !== -1;
    });
  }

  // Apply tag filter
  if (_dashFilter.tags.length > 0) {
    visible = visible.filter(function (b) {
      var bookTags = extractTags(b.bookCode).map(function (t) { return t.code; });
      return _dashFilter.tags.every(function (tc) { return bookTags.indexOf(tc) !== -1; });
    });
  }

  // Sort
  visible.sort(function (a, b) {
    var na = (a.titleEN || a.bookCode || "").toLowerCase();
    var nb = (b.titleEN || b.bookCode || "").toLowerCase();
    if (_dashFilter.sort === "az") return na < nb ? -1 : na > nb ? 1 : 0;
    return na < nb ? 1 : na > nb ? -1 : 0;
  });

  // Render tag chips
  var allVisible = bookNames.filter(function (b) { return !b.bookCode.endsWith("-HDN"); });
  var tagCounts = {};
  allVisible.forEach(function (b) {
    extractTags(b.bookCode).forEach(function (t) {
      if (!tagCounts[t.code]) tagCounts[t.code] = { label: t.label, color: t.color, bg: t.bg, count: 0 };
      tagCounts[t.code].count++;
    });
  });
  var chipsHTML = Object.keys(tagCounts).sort().map(function (code) {
    var tc = tagCounts[code];
    var active = _dashFilter.tags.indexOf(code) !== -1;
    return '<span class="dash-tag-chip' + (active ? ' active' : '') + '" data-tag="' + code + '" style="color:' + (active ? '#fff' : tc.color) + ';background:' + (active ? tc.color : tc.bg) + ';border-color:' + tc.color + '">' +
      (active ? '<span class="chip-x">✕</span>' : '') + tagLabel(code, tc.label) + ' <small>(' + tc.count + ')</small></span>';
  }).join("");
  document.getElementById("dashboardTagChips").innerHTML = chipsHTML;

  // Result count
  document.getElementById("dashboardResultCount").textContent = visible.length + " " + t("dashboardBooks");

  // Update view toggle button text
  var vt = document.getElementById("dashboardViewToggle");
  if (vt) vt.textContent = t(_dashTableMode ? "btnViewToggleCard" : "btnViewToggleText");

  // Render card grid or table
  var grid = document.getElementById("bookGrid");
  if (!grid) return;

  if (_dashTableMode) {
    grid.style.display = "block";
    grid.innerHTML = '<table class="dash-table"><thead><tr>' +
      '<th>' + t("dashColTitleAR") + '</th>' +
      '<th>' + t("dashColTitleDV") + '</th>' +
      '<th>' + t("dashColTitleEN") + '</th>' +
      '<th>' + t("dashColTags") + '</th></tr></thead><tbody>' +
      visible.map(function (book) {
        var tags = extractTags(book.bookCode);
        var tagHtml = tags.length > 0
          ? '<div class="dash-table-tags">' + tags.map(function (t) {
              return '<span class="tag-badge" style="color:' + t.color + ';background:' + t.bg + '">' + tagLabel(t.code, t.label) + '</span>';
            }).join("") + '</div>'
          : "";
        return '<tr data-href="?book=' + book.bookCode + '">' +
          '<td>' + (book.titleAR || "") + '</td>' +
          '<td>' + (book.titleDV || "") + '</td>' +
          '<td>' + (book.titleEN || "") + '</td>' +
          '<td>' + tagHtml + '</td></tr>';
      }).join("") + '</tbody></table>';

    // Make rows clickable
    grid.querySelectorAll(".dash-table tbody tr").forEach(function (tr) {
      tr.addEventListener("click", function () {
        window.location.href = this.dataset.href;
      });
    });
  } else {
    grid.style.display = "";
    grid.innerHTML = visible.map(function (book) {
      var tags = extractTags(book.bookCode);
      var tagHtml = tags.length > 0
        ? '<div class="card-tags">' + tags.map(function (t) {
            return '<span class="tag-badge" style="color:' + t.color + ';background:' + t.bg + '">' + tagLabel(t.code, t.label) + '</span>';
          }).join("") + '</div>'
        : "";
      return '<a href="?book=' + book.bookCode + '" class="book-card">' +
        tagHtml +
        '<div class="title-ar">' + (book.titleAR || "") + '</div>' +
        '<div class="title-dv">' + (book.titleDV || "") + '</div>' +
        '<div class="title-en">' + (book.titleEN || book.bookCode) + '</div>' +
        '</a>';
    }).join("");
  }
}

// ── Wire dashboard controls ──────────────────────────────────
function setupDashboardControls() {
  var si = document.getElementById("dashboardSearch");
  var sc = document.getElementById("dashboardSearchClear");
  var ss = document.getElementById("dashboardSort");
  var tc = document.getElementById("dashboardTagChips");
  if (!si) return;

  si.addEventListener("input", function () {
    _dashFilter.search = this.value;
    sc.style.display = this.value ? "" : "none";
    renderDashboard(_lastBookNames);
  });
  sc.addEventListener("click", function () {
    si.value = "";
    _dashFilter.search = "";
    sc.style.display = "none";
    renderDashboard(_lastBookNames);
    si.focus();
  });
  ss.addEventListener("change", function () {
    _dashFilter.sort = this.value;
    renderDashboard(_lastBookNames);
  });
  tc.addEventListener("click", function (e) {
    var chip = e.target.closest(".dash-tag-chip");
    if (!chip) return;
    var tag = chip.dataset.tag;
    var idx = _dashFilter.tags.indexOf(tag);
    if (idx === -1) _dashFilter.tags.push(tag);
    else _dashFilter.tags.splice(idx, 1);
    renderDashboard(_lastBookNames);
  });

  var vt = document.getElementById("dashboardViewToggle");
  if (vt) vt.addEventListener("click", function () {
    _dashTableMode = !_dashTableMode;
    renderDashboard(_lastBookNames);
  });

  var dr = document.getElementById("dashboardReset");
  if (dr) dr.addEventListener("click", function () {
    _dashFilter = { search: "", tags: [], sort: "az" };
    _dashTableMode = false;
    si.value = "";
    sc.style.display = "none";
    ss.value = "az";
    renderDashboard(_lastBookNames);
    si.focus();
  });
}

// Re-render dashboard on language change (if visible)
document.addEventListener("languagechange", function () {
  if (_lastBookNames && _lastBookNames.length > 0) {
    renderDashboard(_lastBookNames);
  }
});
