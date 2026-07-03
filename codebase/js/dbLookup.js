/**
 * Database Lookup Module
 * Loads and manages dbNames.csv metadata
 */

let dbNamesCache = null;

/**
 * Tag definitions extracted from fileName_CODE prefixes.
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
 * Extract tag codes from a fileName_CODE.
 * Tags are all leading segments separated by '-', excluding the last segment
 * (which is the actual book name). Only known tags are returned.
 * @param {string} fileNameCode - e.g. "AQD-DFK-sharhuSunnahBarbahari"
 * @returns {Array<{code: string, label: string, color: string, bg: string}>}
 */
function extractTags(fileNameCode) {
  if (!fileNameCode) return [];
  const parts = fileNameCode.split("-");
  // The last part is the book name; everything before are potential tags
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
 * Load dbNames.csv and parse it
 * @returns {Promise<Array>} Array of database name objects
 */
export async function loadDbNames() {
  if (dbNamesCache) {
    return dbNamesCache;
  }

  try {
    const response = await fetch("../dbNames.csv");
    const csv = await response.text();

    // Parse CSV manually
    const lines = csv.trim().split("\n");
    const headers = lines[0].split(",");

    const data = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === "") continue;

      const values = lines[i].split(",");
      const obj = {};

      headers.forEach((header, index) => {
        obj[header.trim()] = values[index]?.trim() || "";
      });

      data.push(obj);
    }

    dbNamesCache = data;
    return data;
  } catch (error) {
    console.error("Error loading dbNames.csv:", error);
    return [];
  }
}

/**
 * Look up page metadata by filename
 * @param {string} fileName - The filename without extension (e.g., "AQD-qawaidulArbau")
 * @returns {Promise<Object|null>} The metadata object or null if not found
 */
export async function getPageMetadata(fileName) {
  const dbNames = await loadDbNames();
  return dbNames.find((entry) => entry.fileName_CODE === fileName) || null;
}

/**
 * Extract tags from a fileName_CODE.
 * Exported for use in page templates.
 */
export { extractTags };

/**
 * Get CSV path for the current page
 * @param {string} fileName - The filename without extension
 * @returns {string} Path to the CSV file in db folder
 */
export function getCsvPath(fileName) {
  return `../db/${fileName}.csv`;
}

/**
 * Initialize page with metadata
 * @param {Function} callback - Callback function that receives the metadata
 */
export async function initializePageWithMetadata(callback) {
  const urlParams = new URLSearchParams(window.location.search);
  const fileName = urlParams.get("book");

  if (!fileName) {
    const dbNames = await loadDbNames();
    renderDashboard(dbNames);
    return;
  }

  const metadata = await getPageMetadata(fileName);

  if (metadata) {
    // Add CSV path to metadata
    metadata.csvPath = getCsvPath(fileName);
    callback(metadata);
  } else {
    console.warn(`Metadata not found for file: ${fileName}`);
    // Still provide CSV path even if metadata not found
    callback({
      fileName_CODE: fileName,
      csvPath: getCsvPath(fileName),
    });
  }
}

/**
 * Render the book selection grid
 * @param {Array} dbNames - Array of book metadata objects
 */
function renderDashboard(dbNames) {
  const loading = document.getElementById("loadingMessage");
  if (loading) loading.style.display = "none";

  const dashboard = document.getElementById("dashboardWrapper");
  if (dashboard) dashboard.style.display = "block";

  const grid = document.getElementById("bookGrid");
  if (grid) {
    grid.innerHTML = dbNames
      .map((book) => {
        const tags = extractTags(book.fileName_CODE);
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
      <a href="?book=${book.fileName_CODE}" class="book-card">
        ${tagHtml}
        <div class="title-ar">${book.bookName_AR || ""}</div>
        <div class="title-dv">${book.bookName_DV || ""}</div>
        <div class="title-en">${book.bookName_EN || book.fileName_CODE}</div>
      </a>
    `;
      })
      .join("");
  }
}
