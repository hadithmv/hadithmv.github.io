/**
 * Quran Module
 *
 * Data loading, ayah decoration, surah/ayah/juz navigation, and column
 * management for QRN-prefixed books. Pure logic — no DOM dependencies.
 * Imported by reader.js when a Quran book is detected.
 */

import { parseCSV } from "./csv.js";
import { loadBookNames } from "./catalog.js";

// ── Detection ──
var QRN_RE = /^QRN-/;
var QRN_DATA_RE = /^QRN-DATA-/;

export function isQuranBook(bookCode) {
  return QRN_RE.test(bookCode) && !QRN_DATA_RE.test(bookCode);
}

export function isQuranDataSource(bookCode) {
  return QRN_DATA_RE.test(bookCode);
}

// ── Caches ──
var _baseDataCache = null;
var _uthmaniDataCache = null;
var _surahNamesCache = null;

// ── CSV fetch helper ──
function fetchCSV(path) {
  return fetch(path).then(function (r) {
    if (!r.ok) throw Error("Failed to load " + path);
    return r.text();
  }).then(function (text) {
    var rows = parseCSV(text);
    return rows.filter(function (row) {
      return Array.isArray(row) && row.some(function (v) { return v !== null && v !== ""; });
    });
  });
}

// ── Base data (juz, surah, ayah, basmalah, imlai) ──
var BASE_HEADERS = ["juzNo-HDN", "surahNo-HDN", "ayahNo-HDN", "basmalah", "ayahImlai"];

export function loadQuranBaseData() {
  if (_baseDataCache) return Promise.resolve(_baseDataCache);
  return fetchCSV("../data/QRN-DATA-juz_surah_ayahNo_basmalah_ayahImlai.csv")
    .then(function (rows) {
      if (rows.length > 0) rows.shift(); // strip header row
      _baseDataCache = rows; // 6236 data rows
      return rows;
    });
}

export function getBaseHeaders() {
  return BASE_HEADERS.slice();
}

// ── Uthmani script data ──
export function loadUthmaniData() {
  if (_uthmaniDataCache) return Promise.resolve(_uthmaniDataCache);
  return fetchCSV("../data/QRN-DATA-ayahUthmani.csv")
    .then(function (rows) {
      if (rows.length > 0) rows.shift(); // strip header row (now has ayahUthmani header)
      _uthmaniDataCache = rows;
      return rows;
    });
}

// ── Surah names ──
export function loadSurahNames() {
  if (_surahNamesCache) return Promise.resolve(_surahNamesCache);
  return fetchCSV("../data/QRN-DATA-surahNames.csv")
    .then(function (rows) {
      if (rows.length === 0) return [];
      var header = rows.shift(); // surahNo,nameAR,nameDV,nameEN,ayahCount
      _surahNamesCache = rows.map(function (r) {
        return {
          surahNo: parseInt(r[0], 10),
          nameAR: r[1] || "",
          nameDV: r[2] || "",
          nameEN: r[3] || "",
          ayahCount: parseInt(r[4], 10)
        };
      });
      return _surahNamesCache;
    });
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

// ── Arabic numerals ──
var AR_NUMS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicNumeral(n) {
  var s = String(n);
  var result = "";
  for (var i = 0; i < s.length; i++) {
    result += AR_NUMS[parseInt(s[i], 10)] || s[i];
  }
  return result;
}

// ── Ayah decoration ──
var AYAH_TEXT_COLS = /^ayah(imlai|uthmani)$/i;

export function isAyahTextColumn(header) {
  return AYAH_TEXT_COLS.test((header || "").trim());
}

export function decorateAyah(text, ayahNo, showBraces, showAyahNum, numBrackets) {
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

// ── Data merging ──
export function loadQuranBookCSV(bookCode) {
  return fetchCSV("../data/" + bookCode + ".csv")
    .then(function (rows) {
      if (rows.length === 0) return { header: [], data: [] };
      var header = rows.shift();
      return { header: header, data: rows };
    });
}

export function mergeQuranData(bookCode) {
  return Promise.all([
    loadQuranBaseData(),
    loadQuranBookCSV(bookCode),
    loadSurahNames()
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

// ── Column registry ──
var _colRegistryCache = null;

export function loadColumnRegistry() {
  if (_colRegistryCache) return Promise.resolve(_colRegistryCache);
  return fetchCSV("../data/QRN-DATA-columns.csv")
    .then(function (rows) {
      if (rows.length === 0) return [];
      rows.shift(); // strip header
      _colRegistryCache = rows.map(function (r) {
        return {
          sourceBook: r[0] || "",
          sourceCol: parseInt(r[1], 10) || 0,
          displayDV: r[2] || "",
          displayEN: r[3] || ""
        };
      });
      return _colRegistryCache;
    });
}

export function getColumnDisplayName(sourceBook, sourceCol) {
  var reg = _colRegistryCache || [];
  for (var i = 0; i < reg.length; i++) {
    if (reg[i].sourceBook === sourceBook && reg[i].sourceCol === sourceCol) {
      return reg[i].displayDV || reg[i].displayEN;
    }
  }
  return sourceBook + ":" + sourceCol;
}

export function getAllAvailableColumns() {
  return (_colRegistryCache || []).slice();
}

// ── Quran state ──
export var quranState = {
  currentSurah: 1,
  currentAyah: 1,
  currentJuz: 1,
  showAyahNum: true,
  showBraces: true
};

// ── Surah/ayah/juz range helpers ──
export function getRowsForSurah(surahNo, baseData) {
  var start = -1, end = -1;
  for (var i = 0; i < baseData.length; i++) {
    var s = parseInt(baseData[i][1], 10);
    if (s === surahNo) {
      if (start === -1) start = i;
      end = i + 1;
    } else if (start !== -1) {
      break;
    }
  }
  return { start: start, end: end };
}

export function getRowsForJuz(juzNo, baseData) {
  var start = -1, end = -1;
  for (var i = 0; i < baseData.length; i++) {
    var j = parseInt(baseData[i][0], 10);
    if (j === juzNo) {
      if (start === -1) start = i;
      end = i + 1;
    } else if (start !== -1) {
      break;
    }
  }
  return { start: start, end: end };
}

export function findAyahRow(surahNo, ayahNo, baseData) {
  for (var i = 0; i < baseData.length; i++) {
    if (parseInt(baseData[i][1], 10) === surahNo && parseInt(baseData[i][2], 10) === ayahNo) {
      return i;
    }
  }
  return -1;
}

// ── Build surah list for dropdown ──
export function buildSurahListHTML(query, currentSurah) {
  var names = getSurahNames();
  var nq = "";
  if (query && query.trim()) {
    nq = normaliseForSearchQuery(query.trim());
  }
  var html = "";
  for (var i = 0; i < names.length; i++) {
    var s = names[i];
    if (nq) {
      var haystack = s.nameAR + " " + s.nameDV + " " + s.nameEN + " " + s.surahNo;
      if (normaliseForSearchQuery(haystack).indexOf(nq) === -1) continue;
    }
    var active = s.surahNo === currentSurah ? " active" : "";
    html += '<div class="quran-surah-item' + active + '" data-surah="' + s.surahNo + '">' +
      '<span class="quran-surah-item-no">' + s.surahNo + '</span>' +
      '<span class="quran-surah-item-ar">' + s.nameAR + '</span>' +
      '<span class="quran-surah-item-dv">' + s.nameDV + '</span>' +
      '<span class="quran-surah-item-en">' + s.nameEN + '</span>' +
      '</div>';
  }
  return html;
}

// Reuse search.js normalisation for surah search
function normaliseForSearchQuery(str) {
  // Strip Arabic tashkeel, normalise alif, map Thaana thikijehi
  return str
    .toLowerCase()
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۭ]/g, "")
    .replace(/ـ/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ޘ/g, "ސ").replace(/ޙ/g, "ހ").replace(/ޚ/g, "ހ")
    .replace(/ޛ/g, "ޒ").replace(/ޜ/g, "ޒ").replace(/ޝ/g, "ސ")
    .replace(/ޞ/g, "ސ").replace(/ޟ/g, "ދ").replace(/ޠ/g, "ތ")
    .replace(/ޡ/g, "ޒ").replace(/ޢ/g, "އ").replace(/ޣ/g, "ގ")
    .replace(/ޤ/g, "ގ").replace(/ޥ/g, "ވ");
}
