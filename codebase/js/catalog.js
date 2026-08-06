/**
 * Catalog Module
 * Book registry, tag extraction, dashboard rendering.
 * Loads metadata from 02-registry-bookNames.csv and 01-registry-bookTags.csv.
 * All configuration lives in CSV files — no hardcoded data.
 */

import { tagLabel, t } from "./i18n.js";
import {
  normaliseForSearch,
  escapeHTML,
  parseQuery,
  compileQuery,
  rowMatchesQueryNorm,
  buildNormData,
  buildSnippets,
  highlightMatches,
} from "./search.js";
import { loadCSVData, fetchBookCSVCached } from "./csv.js";
import { loadSearchIndex, searchLibrary } from "./library-search.js";

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
async function loadTagDefinitions() {
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

import {
  isPinned,
  getPinnedBooks,
  addPin,
  removePin,
  addReadHistory,
  getReadHistory,
  timeAgo,
  renderPins,
  renderHistory,
} from "./pins-history.js";

// Re-export for reader.js
export { addPin, removePin, isPinned, addReadHistory };

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

  // Load the registry and render the dashboard. On fetch failure, show the
  // error with a Retry button that re-runs this — controls are only wired
  // after a successful load, so re-running never double-wires listeners.
  async function loadDashboard() {
    var bookNames = await loadBookNames();
    var retryBtn = document.getElementById("retryRegistry");
    if (!bookNames) {
      // Fetch failed — show error + Retry, don't render an empty dashboard
      document.getElementById("loadingMessage").style.display = "none";
      document.getElementById("errorMessage").style.display = "block";
      document.getElementById("errorMessage").textContent =
        "Failed to load the book registry. Please check your connection and try again.";
      if (retryBtn) retryBtn.style.display = "";
      return;
    }
    if (retryBtn) retryBtn.style.display = "none";
    document.getElementById("errorMessage").style.display = "none";
    renderDashboard(bookNames);
    setupDashboardControls();
  }

  var retryBtnEl = document.getElementById("retryRegistry");
  if (retryBtnEl) {
    retryBtnEl.addEventListener("click", function () {
      document.getElementById("errorMessage").style.display = "none";
      retryBtnEl.style.display = "none";
      var lm = document.getElementById("loadingMessage");
      if (lm) lm.style.display = "";
      loadDashboard();
    });
  }

  if (!bookCode) {
    // Read ?tags= from URL for pre-filtered dashboard links
    var urlTags = urlParams.get("tags");
    if (urlTags) {
      _dashFilter.tags = urlTags.split(",");
    }
    await loadDashboard();
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
let _dashFilter = { search: "", tags: [], sort: "az", pinsOnly: false, libSearch: false };
let _dashTableMode = false;

// ── Library search (cross-book) mode ─────────────────────────
// "Search in books" runs the query against the machine-generated word index
// (js/library-search.js) instead of filtering titles. Tag chips still scope
// the search; results group by book and deep-link to the first match.

var _libSearchTimer = null;

/** Substitute {k} placeholders in an i18n template string. */
function tpl(key, map) {
  var s = t(key);
  for (var k in map) s = s.replace("{" + k + "}", map[k]);
  return s;
}

function inLibSearch() {
  return _dashFilter.libSearch;
}

/** Re-render whichever view is active — card/table grid or library results. */
function refreshView() {
  if (inLibSearch()) runLibrarySearch();
  else renderDashboard(_lastBookNames);
}

/** Keep the toggle button and input placeholder in sync with the mode. */
function updateLibModeUI() {
  var libBtn = document.getElementById("dashboardLibSearch");
  var si = document.getElementById("dashboardSearch");
  if (libBtn) libBtn.classList.toggle("active", inLibSearch());
  if (si)
    si.placeholder = inLibSearch()
      ? t("libSearchPlaceholder")
      : t("dashboardSearchPlaceholder");
}

/**
 * Book codes eligible for a library search: visible books (-HDN excluded)
 * carrying any active tag chip (OR — same semantics as the grid).
 */
function computeLibScope() {
  var visible = (_lastBookNames || []).filter(function (b) {
    return !b.bookCode.endsWith("-HDN");
  });
  if (_dashFilter.tags.length > 0) {
    visible = visible.filter(function (b) {
      var codes = extractTags(b.bookCode, b).map(function (x) {
        return x.code;
      });
      return _dashFilter.tags.some(function (tc) {
        return codes.indexOf(tc) !== -1;
      });
    });
  }
  return visible.map(function (b) {
    return b.bookCode;
  });
}

/** Run the library search and render results (caller debounces). */
function runLibrarySearch() {
  if (!inLibSearch()) return; // stale debounce fired after mode switched off
  var grid = document.getElementById("bookGrid");
  var rc = document.getElementById("dashboardResultCount");
  var q = (_dashFilter.search || "").trim();
  if (!q) {
    grid.style.display = "";
    grid.innerHTML = '<div class="dash-empty">' + t("libSearchHint") + "</div>";
    if (rc) rc.textContent = "";
    return;
  }
  grid.style.display = "";
  grid.innerHTML = '<div class="dash-empty">' + t("libSearching") + "</div>";
  if (rc) rc.textContent = "";
  loadSearchIndex()
    .then(function (index) {
      if (!inLibSearch()) return; // user exited while the index loaded
      renderLibraryResults(grid, rc, searchLibrary(index, q, computeLibScope()), q);
    })
    .catch(function () {
      if (!inLibSearch()) return;
      grid.style.display = "";
      grid.innerHTML =
        '<div class="dash-empty">⚠️ Error: Failed to load the search index. ' +
        '<button id="libSearchRetry" class="retry-btn">↺ Retry</button></div>';
      var rb = document.getElementById("libSearchRetry");
      if (rb) rb.addEventListener("click", runLibrarySearch);
    });
}

// ── Result peek (expand to preview matching rows inline) ─────
// Clicking ▾ on a result fetches THAT book (through the on-device IndexedDB
// cache — instant once opened before), runs the reader's exact search
// machinery over it, and shows the first few matching rows as highlighted
// snippets with a "Show next" pager. Each snippet deep-links to its row.

var PEEK_BATCH = 8;
var _peekCache = {}; // bookCode → q → {q, allData, normAllData, compiled, matches, pos, hasRowNums}

/** Load the book + compute all matching positions (cached per book+query). */
function peekEnsureData(bookCode, q) {
  var cached = _peekCache[bookCode] && _peekCache[bookCode][q];
  if (cached && cached.q === q) return Promise.resolve(cached);
  return fetchBookCSVCached(
    bookCode,
    getBookVersionSync(bookCode),
    getCsvPath(bookCode),
  ).then(function (rows) {
    if (!rows || rows.length < 2) throw new Error("Book has no content");
    var allData = rows.slice(1);
    var normAllData = buildNormData(allData);
    var compiled = compileQuery(parseQuery(q));
    var matches = [];
    for (var i = 0; i < allData.length; i++) {
      if (rowMatchesQueryNorm(allData[i], normAllData[i], compiled)) {
        matches.push(i);
      }
    }
    var entry = {
      q: q,
      allData: allData,
      normAllData: normAllData,
      compiled: compiled,
      matches: matches,
      pos: 0,
      hasRowNums:
        (rows[0][0] || "").trim() === "#" || (rows[0][0] || "").trim() === "",
    };
    _peekCache[key] = entry;
    return entry;
  });
}

/** One matching row as a highlighted, clickable snippet. */
function peekItemHTML(entry, q, bookCode, position) {
  var row = entry.allData[position];
  var label = entry.hasRowNums ? row[0] || position + 1 : position + 1;
  var snippets = buildSnippets(
    row,
    entry.compiled,
    q,
    entry.normAllData[position],
  );
  var text = snippets[0] || "";
  if (!text) {
    // Fallback: first non-row-number cell, raw highlight
    var cell = "";
    for (var c = 0; c < row.length; c++) {
      if (entry.hasRowNums && c === 0) continue;
      if (row[c]) { cell = row[c]; break; }
    }
    text = highlightMatches(String(cell).slice(0, 240), q);
  }
  return (
    '<a class="lib-peek-item" href="reader.html?book=' +
    bookCode +
    "&row=" +
    (position + 1) +
    "&q=" +
    encodeURIComponent(q) +
    '" title="' +
    bookCode +
    " row " +
    (position + 1) +
    '">' +
    '<span class="lib-peek-num">#' +
    label +
    "</span>" +
    '<span class="lib-peek-text">' +
    text +
    "</span></a>"
  );
}

/** Append the next batch of matches into the peek, update the pager. */
function peekRenderBatch(peekEl, entry, q, bookCode) {
  var items = peekEl.querySelector(".lib-peek-items");
  var moreBtn = peekEl.querySelector(".lib-peek-more");
  if (!items) return;
  var batch = entry.matches.slice(entry.pos, entry.pos + PEEK_BATCH);
  entry.pos += batch.length;
  var html = "";
  for (var i = 0; i < batch.length; i++) {
    html += peekItemHTML(entry, q, bookCode, batch[i]);
  }
  items.insertAdjacentHTML("beforeend", html);
  if (moreBtn) {
    if (entry.pos >= entry.matches.length) {
      moreBtn.style.display = "none";
    } else {
      moreBtn.style.display = "";
      moreBtn.textContent = tpl("libShowNext", {
        n: Math.min(PEEK_BATCH, entry.matches.length - entry.pos),
      });
    }
  }
}

/** Load + render the first peek batch into an open peek. */
function openPeek(root, bookCode, q) {
  var peek = root.querySelector(".lib-peek");
  var items = peek.querySelector(".lib-peek-items");
  var moreBtn = peek.querySelector(".lib-peek-more");
  if (moreBtn) moreBtn.style.display = "none";
  if (items.childElementCount > 0) return; // already rendered (collapse/re-open)
  items.innerHTML = '<div class="lib-peek-loading">' + t("libSearching") + "</div>";
  peekEnsureData(bookCode, q)
    .then(function (entry) {
      if (!root.classList.contains("peek-open")) return; // closed while loading
      entry.pos = 0;
      items.innerHTML = "";
      peekRenderBatch(peek, entry, q, bookCode);
    })
    .catch(function () {
      if (!root.classList.contains("peek-open")) return;
      items.innerHTML =
        '<div class="lib-peek-loading">⚠️ Error: Failed to load the book. ' +
        '<button class="retry-btn" data-peek-retry="1">↺ Retry</button></div>';
      var rb = items.querySelector("[data-peek-retry]");
      if (rb)
        rb.addEventListener("click", function () {
          items.innerHTML = "";
          openPeek(root, bookCode, q);
        });
    });
}

function togglePeek(root, bookCode, q) {
  var peek = root.querySelector(".lib-peek");
  var toggle = root.querySelector(".lib-peek-toggle");
  var open = root.classList.toggle("peek-open");
  if (toggle) toggle.textContent = open ? "▴" : "▾";
  if (open) {
    peek.style.display = "";
    openPeek(root, bookCode, q);
  } else {
    peek.style.display = "none";
  }
}

/** Render grouped-by-book results into the grid area. */
function renderLibraryResults(grid, rc, results, q) {
  if (!results || results.length === 0) {
    grid.style.display = "";
    grid.innerHTML = '<div class="dash-empty">' + t("libNoResults") + "</div>";
    if (rc) rc.textContent = "";
    return;
  }
  var total = 0;
  for (var i = 0; i < results.length; i++) total += results[i].count;
  if (rc)
    rc.textContent = tpl("libResultSummary", { a: total, b: results.length });
  grid.style.display = "";
  grid.innerHTML =
    '<div class="lib-results">' +
    results
      .map(function (r) {
        var meta = (_lastBookNames || []).find(function (b) {
          return b.bookCode === r.bookCode;
        });
        var tags = meta ? extractTags(meta.bookCode, meta) : [];
        var tagHtml =
          tags.length > 0
            ? '<div class="card-tags">' +
              tags
                .map(function (tg) {
                  return (
                    '<span class="tag-badge' +
                    (tg.palette >= 0 ? " tag-palette-" + tg.palette : "") +
                    '" title="Category: ' +
                    tagLabel(tg.code, tg.label, "en") +
                    '">' +
                    tagLabel(tg.code, tg.label) +
                    "</span>"
                  );
                })
                .join("") +
              "</div>"
            : "";
        var link =
          "reader.html?book=" +
          r.bookCode +
          "&row=" +
          r.firstRow +
          "&q=" +
          encodeURIComponent(q);
        return (
          '<div class="lib-result" data-book="' +
          r.bookCode +
          '" data-q="' +
          escapeHTML(q) +
          '">' +
          '<div class="lib-result-top">' +
          '<a class="lib-result-link" href="' +
          link +
          '" title="' +
          r.bookCode +
          '">' +
          tagHtml +
          '<div class="lib-title-ar">' +
          escapeHTML(meta ? meta.titleAR || "" : "") +
          "</div>" +
          '<div class="lib-title-dv">' +
          escapeHTML(meta ? meta.titleDV || "" : "") +
          "</div>" +
          '<div class="lib-title-en">' +
          escapeHTML(meta ? meta.titleEN || r.bookCode : r.bookCode) +
          "</div>" +
          '<div class="lib-result-meta">' +
          tpl("libBookMatches", { n: r.count }) +
          "</div>" +
          "</a>" +
          '<button class="toolbar-btn lib-peek-toggle" title="Preview matches in this book">▾</button>' +
          "</div>" +
          '<div class="lib-peek" style="display:none">' +
          '<div class="lib-peek-items"></div>' +
          '<button class="toolbar-btn lib-peek-more" style="display:none"></button>' +
          "</div>" +
          "</div>"
        );
      })
      .join("") +
    "</div>";

  // Wire peek toggles + paging (rows are static HTML at this point)
  grid.querySelectorAll(".lib-result").forEach(function (root) {
    var bookCode = root.dataset.book;
    var peekQ = root.dataset.q;
    var toggle = root.querySelector(".lib-peek-toggle");
    if (toggle)
      toggle.addEventListener("click", function () {
        togglePeek(root, bookCode, peekQ);
      });
    var more = root.querySelector(".lib-peek-more");
    if (more)
      more.addEventListener("click", function () {
        var entry = _peekCache[bookCode] && _peekCache[bookCode][peekQ];
        if (entry)
          peekRenderBatch(root.querySelector(".lib-peek"), entry, peekQ, bookCode);
      });
  });
}

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
  var visible = bookNames.filter(function (b) {
    return !b.bookCode.endsWith("-HDN");
  });

  // Apply search filter
  var q = _dashFilter.search.trim();
  if (q) {
    var nq = normaliseForSearch(q);
    visible = visible.filter(function (b) {
      return (
        normaliseForSearch(b.titleDV || "").indexOf(nq) !== -1 ||
        normaliseForSearch(b.titleAR || "").indexOf(nq) !== -1 ||
        normaliseForSearch(b.titleEN || "").indexOf(nq) !== -1 ||
        normaliseForSearch(b.bookCode || "").indexOf(nq) !== -1
      );
    });
  }

  // Apply tag filter — OR: a book shows when it carries ANY selected tag
  if (_dashFilter.tags.length > 0) {
    visible = visible.filter(function (b) {
      var bookTags = extractTags(b.bookCode, b).map(function (t) {
        return t.code;
      });
      return _dashFilter.tags.some(function (tc) {
        return bookTags.indexOf(tc) !== -1;
      });
    });
  }

  // Apply pins-only filter
  if (_dashFilter.pinsOnly) {
    var pinnedCodes = getPinnedBooks().map(function (p) {
      return p.bookCode;
    });
    visible = visible.filter(function (b) {
      return pinnedCodes.indexOf(b.bookCode) !== -1;
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
  var allVisible = bookNames.filter(function (b) {
    return !b.bookCode.endsWith("-HDN");
  });
  var tagCounts = {};
  allVisible.forEach(function (b) {
    extractTags(b.bookCode, b).forEach(function (t) {
      if (!tagCounts[t.code])
        tagCounts[t.code] = { label: t.label, palette: t.palette, count: 0 };
      tagCounts[t.code].count++;
    });
  });
  // Pins filter chip
  var pinnedCodes = getPinnedBooks().map(function (p) {
    return p.bookCode;
  });
  var pinnedVisible = allVisible.filter(function (b) {
    return pinnedCodes.indexOf(b.bookCode) !== -1;
  });
  var pinsChipHTML = "";
  if (pinnedVisible.length > 0) {
    var pinsActive = _dashFilter.pinsOnly;
    pinsChipHTML =
      '<span class="dash-tag-chip' +
      (pinsActive ? " active" : "") +
      '" data-tag="__pins__" title="' +
      (pinsActive ? "Remove filter: Pinned" : "Filter by pinned") +
      '" style="color:' +
      (pinsActive ? "#fff" : "#dc2626") +
      ";background:" +
      (pinsActive ? "#dc2626" : "#fef2f2") +
      ';border-color:#dc2626">' +
      (pinsActive ? '<span class="chip-x">✕</span>' : "") +
      "📌 " +
      t("dashPinsChip") +
      " <small>(" +
      pinnedVisible.length +
      ")</small></span>";
  }

  var chipsHTML = Object.keys(tagCounts)
    .sort()
    .map(function (code) {
      var tc = tagCounts[code];
      var active = _dashFilter.tags.indexOf(code) !== -1;
      var chipTitle = active
        ? "Remove filter: " + tc.label
        : "Filter by " + tc.label;
      var palClass = tc.palette >= 0 ? " tag-palette-" + tc.palette : "";
      return (
        '<span class="dash-tag-chip' +
        (active ? " active" : "") +
        palClass +
        '" data-tag="' +
        code +
        '" title="' +
        chipTitle +
        '">' +
        (active ? '<span class="chip-x">✕</span>' : "") +
        tagLabel(code, tc.label) +
        " <small>(" +
        tc.count +
        ")</small></span>"
      );
    })
    .join("");
  document.getElementById("dashboardPanelTags").innerHTML =
    pinsChipHTML + chipsHTML
      ? '<span class="dash-label">' +
        t("dashboardTagsLabel") +
        "</span> " +
        pinsChipHTML +
        chipsHTML
      : "";

  // Result count
  document.getElementById("dashboardResultCount").textContent =
    t("dashboardBooksLabel") + " " + visible.length;

  // Update view toggle button text
  var vt = document.getElementById("dashboardViewToggle");
  if (vt)
    vt.textContent = t(
      _dashTableMode ? "btnViewToggleCard" : "btnViewToggleText",
    );

  // ── Continue-reading card ──
  // Lives inside the collapsible dashboard panel (so focus mode collapses it
  // with the rest of the chrome), only in the unfiltered view, for the most
  // recent history entry whose book is still registered and visible.
  var continueHTML = "";
  if (
    !_dashFilter.search.trim() &&
    _dashFilter.tags.length === 0 &&
    !_dashFilter.pinsOnly
  ) {
    var hist = getReadHistory();
    if (hist.length > 0) {
      var h0 = hist[0];
      var hMeta = bookNames.find(function (b) {
        return b.bookCode === h0.bookCode;
      });
      if (hMeta && !hMeta.bookCode.endsWith("-HDN")) {
        var contTitle = hMeta.titleDV || hMeta.titleEN || hMeta.bookCode;
        continueHTML =
          '<a class="dash-continue" href="reader.html?book=' +
          h0.bookCode +
          "&row=" +
          h0.row +
          '" title="Continue reading where you left off">' +
          '<span class="dash-continue-label">' +
          t("continueReading") +
          "</span>" +
          '<span class="dash-continue-title">' +
          contTitle +
          "</span>" +
          '<span class="dash-continue-pos">' +
          // Quran books carry a self-explanatory surah reference label;
          // other books show the row number with the "Page" word
          (h0.label || t("ddColPage") + " " + h0.row) +
          "</span>" +
          '<span class="dash-continue-time">' +
          timeAgo(h0.timestamp) +
          "</span>" +
          "</a>";
      }
    }
  }
  var continueSlot = document.getElementById("dashboardContinue");
  if (continueSlot) continueSlot.innerHTML = continueHTML;

  // Render card grid or table
  var grid = document.getElementById("bookGrid");
  if (!grid) return;

  // Empty state — no books match the current search/tags. Render a message
  // instead of a blank grid (or a header-only table, which looks broken).
  if (visible.length === 0) {
    grid.style.display = "";
    grid.innerHTML = '<div class="dash-empty">' + t("dashboardNoMatch") + "</div>";
    return;
  }

  if (_dashTableMode) {
    grid.style.display = "block";
    grid.innerHTML =
      '<div class="dash-table-wrap"><table class="dash-table"><thead><tr>' +
      "<th>" +
      t("dashColTitleAR") +
      "</th>" +
      "<th>" +
      t("dashColTitleDV") +
      "</th>" +
      "<th>" +
      t("dashColTitleEN") +
      "</th>" +
      "<th>" +
      t("dashColTags") +
      "</th></tr></thead><tbody>" +
      visible
        .map(function (book) {
          var tags = extractTags(book.bookCode, book);
          var pinnedBadge = isPinned(book.bookCode)
            ? '<span class="pin-badge" title="Pinned">📌 ޕިން</span>'
            : "";
          var tagHtml =
            pinnedBadge || tags.length > 0
              ? '<div class="dash-table-tags">' +
                pinnedBadge +
                tags
                  .map(function (t) {
                    return (
                      '<span class="tag-badge' +
                      (t.palette >= 0 ? " tag-palette-" + t.palette : "") +
                      '" title="Category: ' +
                      tagLabel(t.code, t.label, "en") +
                      '">' +
                      tagLabel(t.code, t.label) +
                      "</span>"
                    );
                  })
                  .join("") +
                "</div>"
              : "";
          return (
            '<tr data-href="reader.html?book=' +
            book.bookCode +
            '" title="' +
            book.bookCode +
            '">' +
            "<td>" +
            (book.titleAR || "") +
            "</td>" +
            "<td>" +
            (book.titleDV || "") +
            "</td>" +
            "<td>" +
            (book.titleEN || "") +
            "</td>" +
            "<td>" +
            tagHtml +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table></div>";

    // Make rows clickable
    grid.querySelectorAll(".dash-table tbody tr").forEach(function (tr) {
      tr.addEventListener("click", function () {
        window.location.href = this.dataset.href;
      });
    });
  } else {
    grid.style.display = "";
    grid.innerHTML = visible
      .map(function (book) {
        var tags = extractTags(book.bookCode, book);
        var pinnedBadge = isPinned(book.bookCode)
          ? '<span class="pin-badge" title="Pinned">📌 ޕިން</span>'
          : "";
        var tagHtml =
          pinnedBadge || tags.length > 0
            ? '<div class="card-tags">' +
              pinnedBadge +
              tags
                .map(function (t) {
                  return (
                    '<span class="tag-badge' +
                    (t.palette >= 0 ? " tag-palette-" + t.palette : "") +
                    '" title="Category: ' +
                    tagLabel(t.code, t.label, "en") +
                    '">' +
                    tagLabel(t.code, t.label) +
                    "</span>"
                  );
                })
                .join("") +
              "</div>"
            : "";
        return (
          '<a href="reader.html?book=' +
          book.bookCode +
          '" class="book-card" title="' +
          book.bookCode +
          '">' +
          tagHtml +
          '<div class="title-ar">' +
          (book.titleAR || "") +
          "</div>" +
          '<div class="title-dv">' +
          (book.titleDV || "") +
          "</div>" +
          '<div class="title-en">' +
          (book.titleEN || book.bookCode) +
          "</div>" +
          "</a>"
        );
      })
      .join("");
  }
}

// ── Wire dashboard controls ──────────────────────────────────
function setupDashboardControls() {
  var si = document.getElementById("dashboardSearch");
  var sc = document.getElementById("dashboardSearchClear");
  var ss = document.getElementById("dashboardSort");
  var tc = document.getElementById("dashboardPanelTags");
  if (!si) return;

  si.addEventListener("input", function () {
    _dashFilter.search = this.value;
    sc.style.display = this.value ? "" : "none";
    if (inLibSearch()) {
      clearTimeout(_libSearchTimer);
      _libSearchTimer = setTimeout(runLibrarySearch, 150);
    } else {
      renderDashboard(_lastBookNames);
    }
  });
  sc.addEventListener("click", function () {
    si.value = "";
    _dashFilter.search = "";
    sc.style.display = "none";
    refreshView();
    si.focus();
  });
  ss.addEventListener("change", function () {
    _dashFilter.sort = this.value;
    refreshView();
  });

  // ── Library search toggle ("search in books") ──────────────
  var libBtn = document.getElementById("dashboardLibSearch");
  if (libBtn) {
    libBtn.addEventListener("click", function () {
      _dashFilter.libSearch = !_dashFilter.libSearch;
      updateLibModeUI();
      if (inLibSearch()) {
        clearTimeout(_libSearchTimer);
        runLibrarySearch();
      } else {
        clearTimeout(_libSearchTimer);
        renderDashboard(_lastBookNames);
      }
    });
  }
  tc.addEventListener("click", function (e) {
    var chip = e.target.closest(".dash-tag-chip");
    if (!chip) return;
    var tag = chip.dataset.tag;
    if (tag === "__pins__") {
      _dashFilter.pinsOnly = !_dashFilter.pinsOnly;
    } else {
      var idx = _dashFilter.tags.indexOf(tag);
      if (idx === -1) _dashFilter.tags.push(tag);
      else _dashFilter.tags.splice(idx, 1);
    }
    // Sync URL with active tags
    var url = window.location.pathname;
    if (_dashFilter.tags.length > 0)
      url += "?tags=" + _dashFilter.tags.join(",");
    history.replaceState(null, "", url);
    refreshView();
  });

  // ── Pins & History modal triggers ─────────────────────────

  var btnPD = document.getElementById("btnPinsDropdown");
  if (btnPD)
    btnPD.addEventListener("click", function (e) {
      e.stopPropagation();
      window.openPinsModal();
    });

  var btnHD = document.getElementById("btnHistoryDropdown");
  if (btnHD)
    btnHD.addEventListener("click", function (e) {
      e.stopPropagation();
      window.openHistoryModal();
    });

  // Escape handled centrally in common.js

  var vt = document.getElementById("dashboardViewToggle");
  if (vt)
    vt.addEventListener("click", function () {
      _dashTableMode = !_dashTableMode;
      refreshView();
    });

  var dr = document.getElementById("dashboardReset");
  if (dr)
    dr.addEventListener("click", function () {
      _dashFilter = {
        search: "",
        tags: [],
        sort: "az",
        pinsOnly: false,
        libSearch: false,
      };
      _dashTableMode = false;
      si.value = "";
      sc.style.display = "none";
      ss.value = "az";
      updateLibModeUI();
      history.replaceState(null, "", window.location.pathname);
      // NOTE: pins & history survive the dashboard reset — they only clear via
      // the modals' confirmed "Clear all" or the settings button.
      renderDashboard(_lastBookNames);
    });

  // ── Functions row horizontal scroll (arrows + wheel, reader-toolbar style) ──
  (function () {
    var wrap = document.getElementById("dashboardPanelFunctions");
    var scroller = wrap && wrap.querySelector(".dash-functions-scroll");
    if (!scroller) return;
    var startBtn = document.getElementById("dashFuncScrollStart");
    var endBtn = document.getElementById("dashFuncScrollEnd");
    var STEP = 240;

    function updateArrows() {
      var max = scroller.scrollWidth - scroller.clientWidth;
      var cur = Math.abs(scroller.scrollLeft); // Chrome/FF RTL both normalise here
      if (startBtn) startBtn.classList.toggle("hidden", cur < 2);
      if (endBtn) endBtn.classList.toggle("hidden", cur > max - 2);
    }

    function smoothScrollBy(delta) {
      var start = scroller.scrollLeft;
      var startTime = performance.now();
      function easeOut(k) { return 1 - Math.pow(1 - k, 3); }
      function animate(now) {
        var k = Math.min((now - startTime) / 250, 1);
        scroller.scrollLeft = start + delta * easeOut(k);
        if (k < 1) requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
    }

    // RTL scroll direction: content start is rightmost; scrolling toward the
    // end (leftward) decreases the signed scrollLeft in both engines. Same
    // convention as the reader toolbar: fwd (◀) = -STEP, back (▶) = +STEP.
    if (startBtn) startBtn.addEventListener("click", function () { smoothScrollBy(STEP); });
    if (endBtn) endBtn.addEventListener("click", function () { smoothScrollBy(-STEP); });
    scroller.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);
    // Wheel over the row → horizontal scroll (same as the reader chrome);
    // wheel-down scrolls toward the end, matching the ◀ arrow
    wrap.addEventListener(
      "wheel",
      function (e) {
        if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.preventDefault();
          scroller.scrollLeft -= e.deltaX || e.deltaY;
        }
      },
      { passive: false }
    );
    updateArrows();
  })();

  // Keyboard shortcuts (dashboard only — guards check for visible wrapper)
  document.addEventListener("keydown", function (e) {
    var wrap = document.getElementById("dashboardWrapper");
    if (!wrap || wrap.style.display === "none") return;
    // Don't intercept when typing in an input
    var isInput = window.isTypingTarget(e);
    if (
      (e.key === "/" || (e.key === "f" && (e.ctrlKey || e.metaKey))) &&
      !isInput
    ) {
      e.preventDefault();
      si.focus();
    }
    if (e.key === "z" && !isInput && e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      window.setFocus(!document.documentElement.hasAttribute("data-focus"));
    }
    if (e.key === "Escape" && isInput && e.target === si) {
      si.value = "";
      _dashFilter.search = "";
      sc.style.display = "none";
      refreshView();
      si.blur();
    }
    if (e.key === "p" && !isInput && e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      var bpd = document.getElementById("btnPinsDropdown");
      if (bpd) bpd.click();
    }
    if (e.key === "h" && !isInput && e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      var bhd = document.getElementById("btnHistoryDropdown");
      if (bhd) bhd.click();
    }
  });

  // ── Focus mode ─────────────────────────────────────────────
  var dashBtnFocus = document.getElementById("btnFocus");
  if (dashBtnFocus) {
    dashBtnFocus.style.display = "";
    dashBtnFocus.addEventListener("click", function () {
      window.setFocus(!document.documentElement.hasAttribute("data-focus"));
    });
  }

  // Auto-focus search on desktop
  if (window.innerWidth > 600) si.focus();
}

// Re-render dashboard on settings reset (if visible)
document.addEventListener("dashboardReset", function () {
  if (_lastBookNames && _lastBookNames.length > 0) {
    renderPins();
    renderHistory();
    refreshView();
  }
});

// Re-render dashboard on language change (if visible)
document.addEventListener("languagechange", function () {
  if (_lastBookNames && _lastBookNames.length > 0) {
    updateLibModeUI();
    refreshView();
  }
});
