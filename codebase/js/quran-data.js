/**
 * Quran Data Module
 *
 * Pure data/logic: detection, loading, merging, ayah decoration, column classification.
 * 
 * Imported by quran-ui.js, reader.js, and epub.js.
 */

import { fetchCSV } from "./csv.js";
import { getBookTitleSync } from "./catalog.js";
import { currentLang } from "./i18n.js";
import { normaliseForSearch } from "./search.js";

// ═══════════════════════════════════════════════════════════════
// Detection
// ═══════════════════════════════════════════════════════════════

var QRN_RE = /^QRN-/;
var QRN_DATA_RE = /^QRN-DATA-/;

export function isQuranBook(bookCode) {
  return QRN_RE.test(bookCode) && !QRN_DATA_RE.test(bookCode);
}

// ── Content preset definitions ──────────────────────────────
// Book codes (sourceBook from QRN-DATA-registry-bookToggle.csv)
// that should be toggled on when the user clicks the preset button.
//
// Example:
//   var QRN_PRESET_MAIN    = ["QRN-hadithmv","QRN-rasmee-alt"];
//   var QRN_PRESET_ARABIC  = ["QRN-muyassarAR", "QRN-mukhtasarAR"];
//
// Leave empty if no books belong to that preset.
export var QRN_PRESET_MAIN = [
  "QRN-hadithmv",
  "QRN-rasmee-alt",
  "QRN-bakurube",
  "QRN-jaufarFaiz",
  "QRN-soabuniAshari-HDN",
];
export var QRN_PRESET_ARABIC = ["QRN-muyassarAR", "QRN-mukhtasarAR"];

// ═══════════════════════════════════════════════════════════════
// Caches
// ═══════════════════════════════════════════════════════════════

var _baseDataCache = null;
var _surahNamesCache = null;
var _colRegistryCache = null;

// ═══════════════════════════════════════════════════════════════
// Base data — juz, surah, ayah, basmalah, imlai text
// ═══════════════════════════════════════════════════════════════

var BASE_HEADERS = [
  "juzNo-HDN",
  "surahNo-HDN",
  "ayahNo-HDN",
  "basmalah",
  "ayahImlai",
];

export function loadQuranBaseData() {
  if (_baseDataCache) return Promise.resolve(_baseDataCache);
  return fetchCSV(
    "../data/QRN-DATA-baseFile-1-juzNo_surahNo_ayahNo_basmalah_ayahImlai.csv",
  ).then(function (rows) {
    if (rows.length > 0) rows.shift(); // strip header row
    _baseDataCache = rows; // 6236 data rows
    return rows;
  });
}

// ═══════════════════════════════════════════════════════════════
// Surah names
// ═══════════════════════════════════════════════════════════════

export function loadSurahNames() {
  if (_surahNamesCache) return Promise.resolve(_surahNamesCache);
  return fetchCSV("../data/QRN-DATA-registry-surahSelector.csv").then(
    function (rows) {
      if (rows.length === 0) return [];
      var header = rows.shift(); // surahNo,nameAR,nameDV,nameEN,ayahCount
      _surahNamesCache = rows.map(function (r) {
        return {
          surahNo: parseInt(r[0], 10),
          nameAR: r[1] || "",
          nameDV: r[2] || "",
          nameEN: r[3] || "",
          ayahCount: parseInt(r[4], 10),
        };
      });
      return _surahNamesCache;
    },
  );
}

export function getSurahNames() {
  return _surahNamesCache || [];
}

export function getSurahInfo(surahNo) {
  var names = getSurahNames();
  for (var i = 0; i < names.length; i++) {
    if (names[i].surahNo === surahNo) return names[i];
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// Arabic numerals
// ═══════════════════════════════════════════════════════════════

var AR_NUMS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicNumeral(n) {
  var s = String(n);
  var result = "";
  for (var i = 0; i < s.length; i++) {
    result += AR_NUMS[parseInt(s[i], 10)] || s[i];
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
// Ayah decoration
// ═══════════════════════════════════════════════════════════════

export var AYAH_TEXT_COLS = /^ayah(imlai|uthmani)$/i;

export function isAyahTextColumn(header) {
  return AYAH_TEXT_COLS.test((header || "").trim());
}

// ── Column classification helpers ────────────────────────────
// Shared across card/parallel/table renderers and all export formats.

/** Returns the reader-field-* CSS class suffix for a column header, or "". */
export function columnFieldClass(hdr) {
  if (hdr.startsWith("head")) return "reader-field-header";
  if (hdr.startsWith("kitab")) return "reader-field-kitab";
  if (hdr.startsWith("bab")) return "reader-field-bab";
  if (hdr.startsWith("matn")) return "reader-field-matn";
  if (hdr.startsWith("sharh")) return "reader-field-sharh";
  return "";
}

/** Returns the td-* class for table mode, or "". */
export function columnTdClass(hdr) {
  if (hdr.startsWith("matn")) return ' class="td-matn"';
  if (hdr.startsWith("sharh")) return ' class="td-sharh"';
  return "";
}

export function isFootnoteColumn(hdr) { return hdr.startsWith("foot"); }
export function isArDvTransition(prevHdr, currHdr) { return prevHdr.endsWith("ar") && currHdr.endsWith("dv"); }
export function isMatnSharhTransition(prevHdr, currHdr) { return prevHdr.startsWith("matn") && currHdr.startsWith("sharh"); }

/** Classify a column as "ar", "dv", or "neutral" for parallel text view. */
export function classifyColumnLang(hdr, isQuranBook) {
  if (isQuranBook && isAyahTextColumn(hdr)) return "ar";
  if (hdr.endsWith("ar")) return "ar";
  if (hdr.endsWith("dv")) return "dv";
  return "neutral";
}

export function decorateAyah(
  text,
  ayahNo,
  showBraces,
  showAyahNum,
  numBrackets,
) {
  var result = text;
  var numStr = showAyahNum ? " " + toArabicNumeral(ayahNo) : "";
  if (showBraces && showAyahNum && numBrackets) {
    // Number-only brackets: text ﴿١﴾
    result = text + " ﴿" + toArabicNumeral(ayahNo) + "﴾";
  } else if (showBraces) {
    // Full brackets: ﴿text ١﴾ or ﴿text﴾
    result = "﴿" + text + numStr + "﴾";
  } else {
    // No brackets: text ١ or text
    result = text + numStr;
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
// Data merging
// ═══════════════════════════════════════════════════════════════

// One-entry parse cache: the content dropdown inserts columns one at a time,
// but the registry lists each book's columns together — so consecutive
// inserts from the same book reuse this instead of re-fetching and re-parsing
// the whole CSV per column. Bounded: only the most recent book is retained.
var _bookCsvCache = null; // { bookCode, header, data }

export function loadQuranBookCSV(bookCode) {
  if (_bookCsvCache && _bookCsvCache.bookCode === bookCode) {
    return Promise.resolve(_bookCsvCache);
  }
  return fetchCSV("../data/" + bookCode + ".csv").then(function (rows) {
    if (rows.length === 0) return { header: [], data: [] };
    var header = rows.shift();
    _bookCsvCache = { bookCode: bookCode, header: header, data: rows };
    return _bookCsvCache;
  });
}

export function mergeQuranData(bookCode) {
  return Promise.all([
    loadQuranBaseData(),
    loadQuranBookCSV(bookCode),
    loadSurahNames(),
  ]).then(function (results) {
    var baseRows = results[0];
    var bookData = results[1];

    // Build synthetic header
    var headerRow = BASE_HEADERS.slice();
    if (bookData.header) {
      for (var i = 0; i < bookData.header.length; i++) {
        headerRow.push(bookData.header[i]);
      }
    }

    // Merge rows by index
    var merged = [];
    for (var r = 0; r < baseRows.length; r++) {
      var mrow = baseRows[r].slice(); // copy base columns
      if (bookData.data && bookData.data[r]) {
        for (var c = 0; c < bookData.data[r].length; c++) {
          mrow.push(bookData.data[r][c] || "");
        }
      }
      merged.push(mrow);
    }

    return { headerRow: headerRow, allData: merged };
  });
}

// ═══════════════════════════════════════════════════════════════
// Column registry
// ═══════════════════════════════════════════════════════════════

export function loadColumnRegistry() {
  if (_colRegistryCache) return Promise.resolve(_colRegistryCache);
  return fetchCSV("../data/QRN-DATA-registry-bookToggle.csv").then(
    function (rows) {
      if (rows.length === 0) return [];
      rows.shift(); // strip header
      _colRegistryCache = rows.map(function (r) {
        return {
          sourceBook: r[0] || "",
          sourceCol: parseInt(r[1], 10) || 0,
          displayDV: r[2] || "",
          displayEN: r[3] || "",
        };
      });
      return _colRegistryCache;
    },
  );
}

// Map: colIndex → {sourceBook, sourceCol}
var _columnSourceMap = null;
export function rebuildColumnSourceMap(loadedColMap) {
  _columnSourceMap = {};
  for (var key in loadedColMap) {
    var idx = loadedColMap[key];
    var parts = key.split(":");
    var sourceBook = parts.slice(0, -1).join(":");
    var sourceCol = parseInt(parts[parts.length - 1], 10);
    _columnSourceMap[idx] = { sourceBook: sourceBook, sourceCol: sourceCol };
  }
}

// Get the human-readable label for any non-base book column
export function getBookLabel(colIndex) {
  if (!_columnSourceMap || !_columnSourceMap[colIndex]) return null;
  var info = _columnSourceMap[colIndex];
  if (
    info.sourceBook ===
    "QRN-DATA-baseFile-1-juzNo_surahNo_ayahNo_basmalah_ayahImlai"
  )
    return null;
  return getBookTitleSync(info.sourceBook) || info.sourceBook;
}

// True when any column from a book other than current or base is loaded
export function hasExternalColumns(currentBookCode) {
  if (!_columnSourceMap) return false;
  for (var idx in _columnSourceMap) {
    var info = _columnSourceMap[idx];
    if (
      info.sourceBook !==
        "QRN-DATA-baseFile-1-juzNo_surahNo_ayahNo_basmalah_ayahImlai" &&
      info.sourceBook !== currentBookCode
    ) {
      return true;
    }
  }
  return false;
}

export function getAllAvailableColumns() {
  return (_colRegistryCache || []).slice();
}

// ═══════════════════════════════════════════════════════════════
// Shared state
// ═══════════════════════════════════════════════════════════════

export var quranState = {
  currentSurah: 1,
  currentAyah: 1,
  currentJuz: 1,
  showAyahNum: true,
  showBraces: true,
};

// ═══════════════════════════════════════════════════════════════
// Surah / ayah / juz range helpers (work against base data)
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// Surah list HTML (used by the surah selector overlay)
// ═══════════════════════════════════════════════════════════════

export function buildSurahListHTML(query, currentSurah) {
  var names = getSurahNames();
  var nq = "";
  if (query && query.trim()) {
    nq = normaliseForSearch(query.trim());
  }
  var html = "";
  for (var i = 0; i < names.length; i++) {
    var s = names[i];
    if (nq) {
      var haystack =
        s.nameAR + " " + s.nameDV + " " + s.nameEN + " " + s.surahNo;
      if (normaliseForSearch(haystack).indexOf(nq) === -1) continue;
    }
    var active = s.surahNo === currentSurah ? " active" : "";
    html +=
      '<div class="quran-surah-item' +
      active +
      '" data-surah="' +
      s.surahNo +
      '">' +
      '<span class="quran-surah-item-no">' +
      s.surahNo +
      "</span>" +
      '<span class="quran-surah-item-ar">' +
      s.nameAR +
      "</span>" +
      '<span class="quran-surah-item-dv">' +
      s.nameDV +
      "</span>" +
      '<span class="quran-surah-item-en">' +
      s.nameEN +
      "</span>" +
      "</div>";
  }
  return html;
}

// ═══════════════════════════════════════════════════════════════
// Column index helpers (used by reader.js during render & scroll)
// ═══════════════════════════════════════════════════════════════

var _juzIdx = -1,
  _surahIdx = -1,
  _ayahIdx = -1;

export function findQuranColIndices(headerRow) {
  if (_juzIdx >= 0)
    return { juzIdx: _juzIdx, surahIdx: _surahIdx, ayahIdx: _ayahIdx };
  if (!headerRow) return { juzIdx: -1, surahIdx: -1, ayahIdx: -1 };
  for (var j = 0; j < headerRow.length; j++) {
    var h = (headerRow[j] || "").trim().toLowerCase().replace(/-hdn$/i, "");
    if (h === "juzno") _juzIdx = j;
    if (h === "surahno") _surahIdx = j;
    if (h === "ayahno") _ayahIdx = j;
  }
  return { juzIdx: _juzIdx, surahIdx: _surahIdx, ayahIdx: _ayahIdx };
}

export function getAyahNoFromRow(row, headerRow) {
  findQuranColIndices(headerRow);
  if (_ayahIdx >= 0 && _ayahIdx < row.length) {
    return parseInt(row[_ayahIdx], 10) || 0;
  }
  return 0;
}

export function getRowJuz(row, headerRow) {
  findQuranColIndices(headerRow);
  if (_juzIdx < 0 || !row) return 1;
  return parseInt(row[_juzIdx], 10) || 1;
}

export function getRowSurah(row, headerRow) {
  findQuranColIndices(headerRow);
  if (_surahIdx < 0 || !row) return 1;
  return parseInt(row[_surahIdx], 10) || 1;
}

// ═══════════════════════════════════════════════════════════════
// Nav display update (called by reader.js scroll sync)
// ═══════════════════════════════════════════════════════════════

export function updateQuranNavDisplay() {
  var sn = quranState.currentSurah;
  var info = getSurahInfo(sn);
  var lang = currentLang();
  var surahName = info ? (lang === "en" ? info.nameEN : info.nameAR) : "";
  var surahLabel = document.getElementById("qrnSurahLabel");
  if (surahLabel) surahLabel.textContent = sn + " " + surahName;
  var ayahInput = document.getElementById("qrnAyahInput");
  if (ayahInput) {
    if (info) ayahInput.max = info.ayahCount;
    ayahInput.value = quranState.currentAyah;
  }
  var juzInput = document.getElementById("qrnJuzInput");
  if (juzInput) juzInput.value = quranState.currentJuz;
}

// ═══════════════════════════════════════════════════════════════
// Quran UI setup — surah/ayah/juz selectors, content & display
// dropdowns, surah selector overlay, on‑demand column loading
// ═══════════════════════════════════════════════════════════════

/**
 * @param {Object} ctx — reader state bridge
 *   ctx.metadata         — { bookCode }
 *   ctx.headerRow        — column header array (mutable)
 *   ctx.allData          — all rows (mutable)
 *   ctx.getFilteredData  — () => filteredData
 *   ctx.setFilteredData  — (v) => { filteredData = v }
 *   ctx.getHiddenColumns — () => hiddenColumns
 *   ctx.rebuildAll       — () => void
 *   ctx.goTo             — (rowIdx) => void
 *   ctx.LS               — { get(key, def), set(key, val) }
 */