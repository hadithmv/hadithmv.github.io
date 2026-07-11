/**
 * Database Lookup Module
 * Loads and manages bookNames.csv and tags.csv metadata.
 * All configuration lives in CSV files — no hardcoded data.
 */

let bookNamesCache = null;
let tagDefinitionsCache = null;

// ---------------------------------------------------------------------------
// Tag definitions — loaded from tags.csv
// ---------------------------------------------------------------------------

/**
 * Load tag definitions from tags.csv.
 * Cached after first load; safe to call multiple times.
 * @returns {Promise<Object>} Map of tag code → {label, color, bg}
 */
async function loadTagDefinitions() {
  if (tagDefinitionsCache) {
    return tagDefinitionsCache;
  }

  try {
    const response = await fetch("../tags.csv");
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
    console.error("Error loading tags.csv:", error);
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
    const response = await fetch("../bookNames.csv");
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
function renderDashboard(bookNames) {
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

  const grid = document.getElementById("bookGrid");
  if (grid) {
    grid.innerHTML = bookNames
      .map((book) => {
        const tags = extractTags(book.bookCode);
        const tagHtml =
          tags.length > 0
            ? `<div class="card-tags">${tags
                .map(
                  (t) =>
                    `<span class="tag-badge" style="color:${t.color};background:${t.bg}">${t.label}</span>`,
                )
                .join("")}</div>`
            : "";
        return `
      <a href="?book=${book.bookCode}" class="book-card">
        ${tagHtml}
        <div class="title-ar">${book.titleAR || ""}</div>
        <div class="title-dv">${book.titleDV || ""}</div>
        <div class="title-en">${book.titleEN || book.bookCode}</div>
      </a>
    `;
      })
      .join("");
  }
}
