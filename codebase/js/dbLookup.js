/**
 * Database Lookup Module
 * Loads and manages dbNames.csv metadata
 */

let dbNamesCache = null;

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
  const currentPath = window.location.pathname;
  const fileName = currentPath.split("/").pop().replace(".html", "");

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
