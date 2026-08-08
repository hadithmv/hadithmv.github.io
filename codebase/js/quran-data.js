/**
 * Quran Data Module
 *
 * Pure data/logic: detection, loading, merging, ayah decoration, column classification.
 * 
 * Imported by quran-ui.js, reader.js, and export-epub.js.
 */

import { fetchCSVRows, fetchBookCSVCached } from "./csv.js";
import { getBookTitleSync, getBookVersionSync } from "./book-data.js";
import { currentLang } from "./i18n.js";
import { normaliseForSearch } from "./search-utils.js";

// ═══════════════════════════════════════════════════════════════
// Detection
// ═══════════════════════════════════════════════════════════════

var QRN_RE = /^QRN-/;
var QRN_DATA_RE = /^QRN-DATA-/;

export function isQuranBook(bookCode) {
  return QRN_RE.test(bookCode) && !QRN_DATA_RE.test(bookCode);
}

// ── Content preset definitions ──────────────────────────────
// Book codes (sourceBook from 05-registry-quranColumns.csv)
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
var _juzTableCache = null;

// ═══════════════════════════════════════════════════════════════
// Base data — derived structure + imlai text
// ═══════════════════════════════════════════════════════════════

// The 5 structural columns every Quran reader starts with — always first,
// never reorderable.
export var BASE_HEADERS = [
  "juzNo-HDN",
  "surahNo-HDN",
  "ayahNo-HDN",
  "basmalah",
  "ayahImlai",
];

// The base Quran book's code — its columns are structural (never hidden or
// reordered). QRN_BASE_STRUCT is a synthetic pseudo-book: the four structural
// columns (juz/surah/ayah/basmalah) have no CSV file of their own — they are
// derived at load from 04-registry-quranSurahs.csv + 07-registry-quranJuz.csv.
export var QRN_BASE_FILE = "QRN-DATA-baseFile-1-ayahImlai";
export var QRN_BASE_STRUCT = "QRN-BASE-STRUCT";

// True for the base book and the derived structural pseudo-book.
export function isBaseSourceBook(bookCode) {
  return bookCode === QRN_BASE_FILE || bookCode === QRN_BASE_STRUCT;
}

// 0-based start row of each surah/juz within the 6236 base rows (and hence
// within every merged row set — the merge never reorders or drops rows).
var _surahStartRows = null;
var _juzStartRows = null;

export function getSurahStartRow(surahNo) {
  return _surahStartRows ? _surahStartRows[surahNo] : -1;
}

export function getJuzStartRow(juzNo) {
  return _juzStartRows ? _juzStartRows[juzNo] : -1;
}

// 30-row juz start table (07-registry-quranJuz.csv).
export function loadJuzTable() {
  if (_juzTableCache) return Promise.resolve(_juzTableCache);
  return fetchCSVRows("../data/07-registry-quranJuz.csv").then(function (rows) {
    if (rows.length > 0) rows.shift(); // strip header row
    _juzTableCache = rows.map(function (r) {
      return {
        juzNo: parseInt(r[0], 10),
        startSurah: parseInt(r[1], 10),
        startAyah: parseInt(r[2], 10),
      };
    });
    return _juzTableCache;
  });
}

// Builds the 6236 x 5 base rows. The structural columns are derived, never
// stored: surah/ayah from cumulative ayahCounts, juz from the juz table,
// basmalah by rule (first ayah of surah, except surahs 1 and 9). The imlai
// text comes from the 1-column QRN-DATA-baseFile-1-ayahImlai book, fetched
// through the version-gated cache like any other book.
export function loadQuranBaseData() {
  if (_baseDataCache) return Promise.resolve(_baseDataCache);
  return Promise.all([
    loadSurahNames(),
    loadJuzTable(),
    loadQuranBookCSV(QRN_BASE_FILE),
  ]).then(function (results) {
    var surahs = results[0];
    var juzTable = results[1];
    var imlaiRows = results[2].allData || [];

    // Start rows from cumulative ayahCounts and the juz table.
    var surahStarts = [];
    var juzStarts = [];
    var rowIdx = 0;
    for (var s = 0; s < surahs.length; s++) {
      surahStarts[surahs[s].surahNo] = rowIdx;
      rowIdx += surahs[s].ayahCount;
    }
    for (var j = 0; j < juzTable.length; j++) {
      juzStarts[juzTable[j].juzNo] =
        surahStarts[juzTable[j].startSurah] + (juzTable[j].startAyah - 1);
    }

    // One pass derives all 5 columns. The juz pointer only advances, so the
    // while loop is amortized O(1) per row (at most 30 advances total).
    var total = rowIdx; // == 6236
    var rows = new Array(total);
    var surahPtr = 0;
    var ayahInSurah = 1;
    var juzPtr = 0;
    for (var r = 0; r < total; r++) {
      while (
        juzPtr + 1 < juzTable.length &&
        juzStarts[juzTable[juzPtr + 1].juzNo] <= r
      ) {
        juzPtr++;
      }
      var info = surahs[surahPtr];
      var basmalah =
        ayahInSurah === 1 && info.surahNo !== 1 && info.surahNo !== 9
          ? info.basmalah || ""
          : "";
      rows[r] = [
        String(juzTable[juzPtr].juzNo),
        String(info.surahNo),
        String(ayahInSurah),
        basmalah,
        (imlaiRows[r] || [])[0] || "", // imlai CSV row = one cell
      ];
      if (ayahInSurah >= info.ayahCount) {
        surahPtr++;
        ayahInSurah = 1;
      } else {
        ayahInSurah++;
      }
    }

    _surahStartRows = surahStarts;
    _juzStartRows = juzStarts;
    _baseDataCache = rows;
    return rows;
  });
}

// ═══════════════════════════════════════════════════════════════
// Surah names
// ═══════════════════════════════════════════════════════════════

export function loadSurahNames() {
  if (_surahNamesCache) return Promise.resolve(_surahNamesCache);
  return fetchCSVRows("../data/04-registry-quranSurahs.csv").then(
    function (rows) {
      if (rows.length === 0) return [];
      var header = rows.shift(); // surahNo,nameAR,nameDV,nameEN,ayahCount,basmalah
      _surahNamesCache = rows.map(function (r) {
        return {
          surahNo: parseInt(r[0], 10),
          nameAR: r[1] || "",
          nameDV: r[2] || "",
          nameEN: r[3] || "",
          ayahCount: parseInt(r[4], 10),
          basmalah: r[5] || "",
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
var _bookCsvCache = null; // { bookCode, headerRow, allData }

export function loadQuranBookCSV(bookCode) {
  if (_bookCsvCache && _bookCsvCache.bookCode === bookCode) {
    return Promise.resolve(_bookCsvCache);
  }
  return fetchBookCSVCached(bookCode, getBookVersionSync(bookCode), "../data/content/" + bookCode + ".csv").then(function (rows) {
    if (rows.length === 0) return { headerRow: [], allData: [] };
    var headerRow = rows.shift();
    _bookCsvCache = { bookCode: bookCode, headerRow: headerRow, allData: rows };
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

    // Build synthetic headerRow
    var headerRow = BASE_HEADERS.slice();
    if (bookData.headerRow) {
      for (var i = 0; i < bookData.headerRow.length; i++) {
        headerRow.push(bookData.headerRow[i]);
      }
    }

    // Merge rows by index
    var merged = [];
    for (var r = 0; r < baseRows.length; r++) {
      var mrow = baseRows[r].slice(); // copy base columns
      if (bookData.allData && bookData.allData[r]) {
        for (var c = 0; c < bookData.allData[r].length; c++) {
          mrow.push(bookData.allData[r][c] || "");
        }
      }
      merged.push(mrow);
    }

    return { headerRow: headerRow, allData: merged };
  });
}

// ═══════════════════════════════════════════════════════════════
// Column ordering — the reader's column layout is always rebuilt
// from an ordered list of column keys (the content modal's order)
// ═══════════════════════════════════════════════════════════════

/**
 * Rebuild a reader's column layout from an ordered list of column keys.
 * Pure data logic — the quran-ui modal feeds it state and applies the
 * result in place (reader.js holds the same array references).
 *
 * state:
 *   baseCount     — BASE_HEADERS.length (structural columns, fixed first)
 *   headerRow     — current header array
 *   allData       — current rows
 *   normAllData   — parallel normalised rows (optional)
 *   loadedMap     — key → current column index (-1 marks a pending insert)
 *   hiddenColumns — current hidden indices
 *   order         — ordered list of ALL available column keys
 *   pending       — freshly inserted columns: key → {name, values, normValues}
 *
 * Returns a fresh { headerRow, allData, normAllData, loadedMap, hiddenColumns }.
 */
export function applyColumnOrder(state) {
  var baseCount = state.baseCount;
  var oldMap = state.loadedMap;
  var oldHeader = state.headerRow;
  var order = state.order;
  var pending = state.pending || {};
  var hidden = state.hiddenColumns;
  var rows = state.allData;
  var normRows = state.normAllData || null;

  // Loaded keys in list order (pending inserts included). Base keys are
  // structural — they keep their fixed front positions and are NOT re-listed.
  var ordered = [];
  for (var i = 0; i < order.length; i++) {
    var k = order[i];
    if (oldMap[k] !== undefined && (oldMap[k] < 0 || oldMap[k] >= baseCount)) {
      ordered.push(k);
    }
  }

  var newHeader = oldHeader.slice(0, baseCount);
  for (var j = 0; j < ordered.length; j++) {
    var colKey = ordered[j];
    var pendingCol = pending[colKey];
    newHeader.push(pendingCol ? pendingCol.name : oldHeader[oldMap[colKey]]);
  }

  var newAll = new Array(rows.length);
  var newNorm = normRows ? new Array(rows.length) : null;
  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    var nrow = normRows ? normRows[r] : null;
    var newRow = new Array(baseCount + ordered.length);
    var newNormRow = newNorm ? new Array(baseCount + ordered.length) : null;
    for (var c = 0; c < baseCount; c++) {
      newRow[c] = row[c];
      if (newNormRow) newNormRow[c] = nrow[c];
    }
    for (var j2 = 0; j2 < ordered.length; j2++) {
      var colKey2 = ordered[j2];
      var pendingCol2 = pending[colKey2];
      var at = baseCount + j2;
      if (pendingCol2) {
        newRow[at] = pendingCol2.values[r];
        if (newNormRow) newNormRow[at] = pendingCol2.normValues[r];
      } else {
        newRow[at] = row[oldMap[colKey2]];
        if (newNormRow) newNormRow[at] = nrow[oldMap[colKey2]];
      }
    }
    newAll[r] = newRow;
    if (newNormRow) newNorm[r] = newNormRow;
  }

  // Remap loaded/hidden indices. Base columns keep their fixed positions;
  // everything else follows the list order.
  var newMap = {};
  var newHidden = [];
  for (var b = 0; b < baseCount; b++) {
    for (var kb in oldMap) {
      if (oldMap[kb] === b) { newMap[kb] = b; break; }
    }
    if (hidden.indexOf(b) !== -1) newHidden.push(b);
  }
  for (var j3 = 0; j3 < ordered.length; j3++) {
    var colKey3 = ordered[j3];
    var idx = baseCount + j3;
    newMap[colKey3] = idx;
    if (oldMap[colKey3] !== -1 && hidden.indexOf(oldMap[colKey3]) !== -1) newHidden.push(idx);
  }

  return {
    headerRow: newHeader,
    allData: newAll,
    normAllData: newNorm,
    loadedMap: newMap,
    hiddenColumns: newHidden,
  };
}

// ═══════════════════════════════════════════════════════════════
// Column registry
// ═══════════════════════════════════════════════════════════════

export function loadColumnRegistry() {
  if (_colRegistryCache) return Promise.resolve(_colRegistryCache);
  return fetchCSVRows("../data/05-registry-quranColumns.csv").then(
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
export function getColumnSourceBookTitle(colIndex) {
  if (!_columnSourceMap || !_columnSourceMap[colIndex]) return null;
  var info = _columnSourceMap[colIndex];
  if (isBaseSourceBook(info.sourceBook)) return null;
  return getBookTitleSync(info.sourceBook) || info.sourceBook;
}

// True when any column from a book other than current or base is loaded
export function hasExternalColumns(currentBookCode) {
  if (!_columnSourceMap) return false;
  for (var idx in _columnSourceMap) {
    var info = _columnSourceMap[idx];
    if (!isBaseSourceBook(info.sourceBook) && info.sourceBook !== currentBookCode) {
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