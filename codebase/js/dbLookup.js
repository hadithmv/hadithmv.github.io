/**
 * Database Lookup Module
 * Loads and manages bookNames.csv metadata
 */

let bookNamesCache = null;

/**
 * Tag definitions extracted from bookCode prefixes.
 * Each tag code maps to a display label and badge colors.
 * Add new tags here as needed.
 */
const TAG_DEFINITIONS = {
  AQD: { label: "Aqidah", color: "#4f46e5", bg: "#eef2ff" },
  HDT: { label: "Hadith", color: "#059669", bg: "#ecfdf5" },
  QRN: { label: "Quran", color: "#d97706", bg: "#fffbeb" },
  RDF: { label: "Radheef", color: "#dc2626", bg: "#fef2f2" },
  DFK: { label: "DFK", color: "#7c3aed", bg: "#f5f3ff" },
  IH: { label: "Islamhouse", color: "#0891b2", bg: "#ecfeff" },
};

/**
 * Extract tag codes from a bookCode.
 * Tags are all leading segments separated by '-', excluding the last segment
 * (which is the actual book name). Only known tags are returned.
 * @param {string} bookCode - e.g. "AQD-DFK-sharhuSunnahBarbahari"
 * @returns {Array<{code: string, label: string, color: string, bg: string}>}
 */
function extractTags(bookCode) {
  if (!bookCode) return [];
  const parts = bookCode.split("-");
  const tagCodes = parts.slice(0, -1);
  return tagCodes
    .filter((code) => TAG_DEFINITIONS[code])
    .map((code) => ({
      code,
      label: TAG_DEFINITIONS[code].label,
      color: TAG_DEFINITIONS[code].color,
      bg: TAG_DEFINITIONS[code].bg,
    }));
}

/**
 * Load bookNames.csv and parse it
 * @returns {Promise<Array>} Array of book metadata objects
 */
export async function loadBookNames() {
  if (bookNamesCache) {
    return bookNamesCache;
  }

  try {
    const response = await fetch("../bookNames.csv");
    const csv = await response.text();

    const lines = csv.trim().split("\n");
    if (lines.length === 0) return [];

    const headers = lines[0].split(",").map((header) => header.trim());

    const data = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === "") continue;

      const values = lines[i].split(",");
      const obj = {};

      headers.forEach((header, index) => {
        obj[header] = values[index]?.trim() || "";
      });

      data.push(obj);
    }

    bookNamesCache = data;
    return data;
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

/**
 * Initialize page with metadata
 * @param {Function} callback - Callback function that receives the metadata
 */
export async function initializePageWithMetadata(callback) {
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
    console.warn(`Metadata not found for book: ${bookCode}`);
    callback({
      bookCode,
      csvPath: getCsvPath(bookCode),
    });
  }
}

/**
 * Render the book selection grid
 * @param {Array} bookNames - Array of book metadata objects
 */
function renderDashboard(bookNames) {
  const loading = document.getElementById("loadingMessage");
  if (loading) loading.style.display = "none";

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
