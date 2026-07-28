/**
 * Quran Module
 *
 * Data loading, ayah decoration, surah/ayah/juz navigation, column management,
 * and all DOM setup for the Quran reader panel row.
 * Imported by reader.js when a QRN-prefixed book is detected.
 */

import { parseCSV } from "./csv.js";
import { loadBookNames, getBookTitleSync } from "./catalog.js";
import { t, currentLang } from "./i18n.js";

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
var QRN_PRESET_MAIN = [
  "QRN-hadithmv",
  "QRN-rasmee-alt",
  "QRN-bakurube",
  "QRN-jaufarFaiz",
  "QRN-soabuniAshari-HDN",
];
var QRN_PRESET_ARABIC = ["QRN-muyassarAR", "QRN-mukhtasarAR"];

export function isQuranDataSource(bookCode) {
  return QRN_DATA_RE.test(bookCode);
}

// ═══════════════════════════════════════════════════════════════
// Caches
// ═══════════════════════════════════════════════════════════════

var _baseDataCache = null;
var _uthmaniDataCache = null;
var _surahNamesCache = null;
var _colRegistryCache = null;

function fetchCSV(path) {
  return fetch(path)
    .then(function (r) {
      if (!r.ok) throw Error("Failed to load " + path);
      return r.text();
    })
    .then(function (text) {
      var rows = parseCSV(text);
      return rows.filter(function (row) {
        return (
          Array.isArray(row) &&
          row.some(function (v) {
            return v !== null && v !== "";
          })
        );
      });
    });
}

// showToast is now on window (common.js)
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

export function getBaseHeaders() {
  return BASE_HEADERS.slice();
}

// ═══════════════════════════════════════════════════════════════
// Uthmani script data (loaded on demand)
// ═══════════════════════════════════════════════════════════════

export function loadUthmaniData() {
  if (_uthmaniDataCache) return Promise.resolve(_uthmaniDataCache);
  return fetchCSV("../data/QRN-DATA-baseFile-2-ayahUthmani.csv").then(
    function (rows) {
      if (rows.length > 0) rows.shift(); // strip header row (now has ayahUthmani header)
      _uthmaniDataCache = rows;
      return rows;
    },
  );
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

var AYAH_TEXT_COLS = /^ayah(imlai|uthmani)$/i;

export function isAyahTextColumn(header) {
  return AYAH_TEXT_COLS.test((header || "").trim());
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

export function loadQuranBookCSV(bookCode) {
  return fetchCSV("../data/" + bookCode + ".csv").then(function (rows) {
    if (rows.length === 0) return { header: [], data: [] };
    var header = rows.shift();
    return { header: header, data: rows };
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

export function getColumnDisplayName(sourceBook, sourceCol) {
  var reg = _colRegistryCache || [];
  for (var i = 0; i < reg.length; i++) {
    if (reg[i].sourceBook === sourceBook && reg[i].sourceCol === sourceCol) {
      return reg[i].displayDV || reg[i].displayEN;
    }
  }
  return sourceBook + ":" + sourceCol;
}

// Map: colIndex → {sourceBook, sourceCol}
var _columnSourceMap = null;
export function getColumnSourceMap() {
  return _columnSourceMap;
}
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

export function getRowsForSurah(surahNo, baseData) {
  var start = -1,
    end = -1;
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
  var start = -1,
    end = -1;
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
    if (
      parseInt(baseData[i][1], 10) === surahNo &&
      parseInt(baseData[i][2], 10) === ayahNo
    ) {
      return i;
    }
  }
  return -1;
}

// ═══════════════════════════════════════════════════════════════
// Surah list HTML (used by the surah selector overlay)
// ═══════════════════════════════════════════════════════════════

function normaliseForSearchQuery(str) {
  // Strip Arabic tashkeel, normalise alif, map Thaana thikijehi
  return str
    .toLowerCase()
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۭ]/g, "")
    .replace(/ـ/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ޘ/g, "ސ")
    .replace(/ޙ/g, "ހ")
    .replace(/ޚ/g, "ހ")
    .replace(/ޛ/g, "ޒ")
    .replace(/ޜ/g, "ޒ")
    .replace(/ޝ/g, "ސ")
    .replace(/ޞ/g, "ސ")
    .replace(/ޟ/g, "ދ")
    .replace(/ޠ/g, "ތ")
    .replace(/ޡ/g, "ޒ")
    .replace(/ޢ/g, "އ")
    .replace(/ޣ/g, "ގ")
    .replace(/ޤ/g, "ގ")
    .replace(/ޥ/g, "ވ");
}

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
      var haystack =
        s.nameAR + " " + s.nameDV + " " + s.nameEN + " " + s.surahNo;
      if (normaliseForSearchQuery(haystack).indexOf(nq) === -1) continue;
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
export function initQuranUI(ctx) {
  var readerPanelQuran = document.getElementById("readerPanelQuran");
  if (!readerPanelQuran) return;
  readerPanelQuran.style.display = "";

  var LS = ctx.LS;
  var metadata = ctx.metadata;
  var headerRow = ctx.headerRow;
  var allData = ctx.allData;

  // Load toggle state
  var showAyahNum = LS.get("quranShowAyahNum", true);
  var showBraces = LS.get("quranShowBraces", true);
  document
    .getElementById("qrnToggleAyahNum")
    .classList.toggle("active", showAyahNum);
  document
    .getElementById("qrnToggleBraces")
    .classList.toggle("active", showBraces);

  updateQuranNavDisplay();

  // ── Surah navigation ──
  document
    .getElementById("qrnSurahPrev")
    .addEventListener("click", function () {
      if (quranState.currentSurah > 1)
        goToQuranSurah(quranState.currentSurah - 1);
    });
  document
    .getElementById("qrnSurahNext")
    .addEventListener("click", function () {
      if (quranState.currentSurah < 114)
        goToQuranSurah(quranState.currentSurah + 1);
    });
  document
    .getElementById("qrnSurahBtn")
    .addEventListener("click", openSurahSelector);

  // ── Ayah navigation ──
  var ayahInput = document.getElementById("qrnAyahInput");
  var ayahDD = document.createElement("div");
  ayahDD.id = "qrnAyahDropdown";
  ayahDD.className = "quran-content-dropdown";
  ayahDD.style.display = "none";
  ayahDD.style.position = "absolute";
  ayahDD.style.left = "0";
  ayahDD.style.maxHeight = "200px";
  ayahDD.style.overflowY = "auto";
  ayahDD.style.minWidth = "60px";
  ayahInput.parentNode.style.position = "relative";
  ayahInput.parentNode.appendChild(ayahDD);

  function openAyahDropdown() {
    var max = parseInt(ayahInput.max, 10) || 7;
    var html = "";
    for (var i = 1; i <= max; i++) {
      html +=
        '<div class="quran-content-item" data-v="' + i + '">' + i + "</div>";
    }
    ayahDD.innerHTML = html;
    window.openDropdown(ayahDD, ayahInput, 2);
    ayahDD.style.minWidth = "50px";
    ayahDD.style.maxWidth = "80px";
    ayahDD.querySelectorAll(".quran-content-item").forEach(function (el) {
      el.addEventListener("click", function () {
        ayahDD.style.display = "none";
        goToQuranAyah(parseInt(this.dataset.v, 10));
      });
    });
  }

  document.getElementById("qrnAyahPrev").addEventListener("click", function () {
    var v = parseInt(ayahInput.value, 10);
    if (v > 1) goToQuranAyah(v - 1);
  });
  document.getElementById("qrnAyahNext").addEventListener("click", function () {
    var v = parseInt(ayahInput.value, 10);
    var info = getSurahInfo(quranState.currentSurah);
    var maxAyah = info ? info.ayahCount : 7;
    if (v < maxAyah) goToQuranAyah(v + 1);
  });
  ayahInput.addEventListener("change", function () {
    var v = parseInt(this.value, 10);
    if (v >= 1) goToQuranAyah(v);
  });
  var _justSelected = false;
  ayahInput.addEventListener("click", function (e) {
    e.stopPropagation();
    if (!_justSelected) openAyahDropdown();
    _justSelected = false;
  });
  ayahInput.addEventListener("focus", function () {
    this.select();
    if (!_justSelected) openAyahDropdown();
    _justSelected = false;
  });
  ayahDD.addEventListener("click", function (e) {
    e.stopPropagation();
    _justSelected = true;
  });

  // ── Juz navigation ──
  var juzInput = document.getElementById("qrnJuzInput");
  var juzDD = document.createElement("div");
  juzDD.id = "qrnJuzDropdown";
  juzDD.className = "quran-content-dropdown";
  juzDD.style.display = "none";
  juzDD.style.position = "absolute";
  juzDD.style.left = "0";
  juzDD.style.maxHeight = "200px";
  juzDD.style.overflowY = "auto";
  juzDD.style.minWidth = "60px";
  juzInput.parentNode.style.position = "relative";
  juzInput.parentNode.appendChild(juzDD);

  function openJuzDropdown() {
    var html = "";
    for (var i = 1; i <= 30; i++) {
      html +=
        '<div class="quran-content-item" data-v="' + i + '">' + i + "</div>";
    }
    juzDD.innerHTML = html;
    window.openDropdown(juzDD, juzInput, 2);
    juzDD.style.minWidth = "50px";
    juzDD.style.maxWidth = "80px";
    juzDD.querySelectorAll(".quran-content-item").forEach(function (el) {
      el.addEventListener("click", function () {
        juzDD.style.display = "none";
        goToQuranJuz(parseInt(this.dataset.v, 10));
      });
    });
  }

  document.getElementById("qrnJuzPrev").addEventListener("click", function () {
    var v = parseInt(juzInput.value, 10);
    if (v > 1) goToQuranJuz(v - 1);
  });
  document.getElementById("qrnJuzNext").addEventListener("click", function () {
    var v = parseInt(juzInput.value, 10);
    if (v < 30) goToQuranJuz(v + 1);
  });
  juzInput.addEventListener("change", function () {
    var v = parseInt(this.value, 10);
    if (v >= 1 && v <= 30) goToQuranJuz(v);
  });
  var _justSelectedJuz = false;
  juzInput.addEventListener("click", function (e) {
    e.stopPropagation();
    if (!_justSelectedJuz) openJuzDropdown();
    _justSelectedJuz = false;
  });
  juzInput.addEventListener("focus", function () {
    this.select();
    if (!_justSelectedJuz) openJuzDropdown();
    _justSelectedJuz = false;
  });
  juzDD.addEventListener("click", function (e) {
    e.stopPropagation();
    _justSelectedJuz = true;
  });

  // ── Content dropdown ──
  trapWheel(document.getElementById("qrnContentDropdown"));
  document
    .getElementById("qrnContentBtn")
    .addEventListener("click", function (e) {
      e.stopPropagation();
      toggleQuranContentDropdown();
    });

  // ── Display options dropdown ──
  var qrnDisplayBtn = document.getElementById("qrnDisplayBtn");
  var qrnDisplayDD = document.getElementById("qrnDisplayDropdown");
  trapWheel(qrnDisplayDD);
  qrnDisplayBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    if (qrnDisplayDD.style.display === "block") {
      qrnDisplayDD.style.display = "none";
      return;
    }
    window.openDropdown(qrnDisplayDD, qrnDisplayBtn);
    qrnDisplayDD.style.maxWidth =
      Math.min(
        220,
        window.innerWidth - qrnDisplayBtn.getBoundingClientRect().left - 16,
      ) + "px";
  });

  var ayahNumCB = document.getElementById("qrnToggleAyahNum");
  var bracesCB = document.getElementById("qrnToggleBraces");
  var numBracketsCB = document.getElementById("qrnToggleNumBrackets");
  ayahNumCB.checked = LS.get("quranShowAyahNum", true);
  bracesCB.checked = LS.get("quranShowBraces", true);
  numBracketsCB.checked = LS.get("quranShowNumBrackets", false);
  updateNumBracketsRow();

  function updateNumBracketsRow() {
    var row = document.getElementById("qrnNumBracketsRow");
    row.style.display = bracesCB.checked && ayahNumCB.checked ? "" : "none";
  }

  ayahNumCB.addEventListener("change", function () {
    LS.set("quranShowAyahNum", this.checked);
    updateNumBracketsRow();
    ctx.rebuildAll();
  });
  bracesCB.addEventListener("change", function () {
    LS.set("quranShowBraces", this.checked);
    updateNumBracketsRow();
    ctx.rebuildAll();
  });
  numBracketsCB.addEventListener("change", function () {
    LS.set("quranShowNumBrackets", this.checked);
    ctx.rebuildAll();
  });

  // ── Surah selector overlay ──
  document
    .getElementById("qrnSurahClose")
    .addEventListener("click", closeSurahSelector);
  document
    .getElementById("qrnSurahOverlay")
    .addEventListener("click", function (e) {
      if (e.target === this) closeSurahSelector();
    });
  document
    .getElementById("qrnSurahSearch")
    .addEventListener("input", function () {
      renderSurahList(this.value);
    });

  // ── Outside click closes all Quran dropdowns ──
  document.addEventListener("click", function (e) {
    var dd = document.getElementById("qrnContentDropdown");
    var btn = document.getElementById("qrnContentBtn");
    if (
      dd &&
      dd.style.display === "block" &&
      !dd.contains(e.target) &&
      e.target !== btn
    ) {
      dd.style.display = "none";
    }
    if (
      ayahDD &&
      ayahDD.style.display === "block" &&
      !ayahDD.contains(e.target) &&
      e.target !== ayahInput
    ) {
      ayahDD.style.display = "none";
    }
    if (
      juzDD &&
      juzDD.style.display === "block" &&
      !juzDD.contains(e.target) &&
      e.target !== juzInput
    ) {
      juzDD.style.display = "none";
    }
    var dd2 = document.getElementById("qrnDisplayDropdown");
    if (
      dd2 &&
      dd2.style.display === "block" &&
      !dd2.contains(e.target) &&
      e.target !== qrnDisplayBtn
    ) {
      dd2.style.display = "none";
    }
  });

  // ── Navigation actions ──

  function goToQuranSurah(surahNo) {
    findQuranColIndices(headerRow);
    quranState.currentSurah = surahNo;
    quranState.currentAyah = 1;
    document.getElementById("qrnAyahInput").value = 1;
    var info = getSurahInfo(surahNo);
    document.getElementById("qrnAyahInput").max = info ? info.ayahCount : 7;
    applyQuranSurahFilter();
    var fd = ctx.getFilteredData();
    if (fd.length > 0) {
      quranState.currentJuz = getRowJuz(fd[0], headerRow);
    }
    updateQuranNavDisplay();
  }

  function goToQuranAyah(ayahNo) {
    findQuranColIndices(headerRow);
    var info = getSurahInfo(quranState.currentSurah);
    var maxAyah = info ? info.ayahCount : 7;
    if (ayahNo < 1) ayahNo = 1;
    if (ayahNo > maxAyah) ayahNo = maxAyah;
    quranState.currentAyah = ayahNo;
    document.getElementById("qrnAyahInput").value = ayahNo;
    var rowIdx = findAyahRowInFiltered(quranState.currentSurah, ayahNo);
    if (rowIdx >= 0) {
      ctx.goTo(rowIdx);
      quranState.currentJuz = getRowJuz(
        ctx.getFilteredData()[rowIdx],
        headerRow,
      );
    }
    updateQuranNavDisplay();
  }

  function goToQuranJuz(juzNo) {
    findQuranColIndices(headerRow);
    quranState.currentJuz = juzNo;
    document.getElementById("qrnJuzInput").value = juzNo;
    var jIdx = _juzIdx;
    if (jIdx >= 0) {
      ctx.setFilteredData(
        allData.filter(function (row) {
          return parseInt(row[jIdx], 10) === juzNo;
        }),
      );
    }
    var fd = ctx.getFilteredData();
    if (fd.length > 0) {
      var firstRow = fd[0];
      quranState.currentSurah = getRowSurah(firstRow, headerRow);
      quranState.currentAyah = 1;
      document.getElementById("qrnAyahInput").value = 1;
    }
    ctx.rebuildAll();
    updateQuranNavDisplay();
  }

  function findAyahRowInFiltered(surahNo, ayahNo) {
    var fd = ctx.getFilteredData();
    for (var i = 0; i < fd.length; i++) {
      var row = fd[i];
      if (parseInt(row[1], 10) === surahNo && parseInt(row[2], 10) === ayahNo) {
        return i;
      }
    }
    return -1;
  }

  function applyQuranSurahFilter() {
    var sn = quranState.currentSurah;
    ctx.setFilteredData(
      allData.filter(function (row) {
        return parseInt(row[1], 10) === sn;
      }),
    );
    ctx.rebuildAll();
  }

  // ── Surah selector ──

  function openSurahSelector() {
    window.closeAllDropdowns && window.closeAllDropdowns();
    var overlay = document.getElementById("qrnSurahOverlay");
    overlay.style.display = "flex";
    document.getElementById("qrnSurahSearch").value = "";
    renderSurahList("");
    setTimeout(function () {
      document.getElementById("qrnSurahSearch").focus();
    }, 50);
  }

  function closeSurahSelector() {
    document.getElementById("qrnSurahOverlay").style.display = "none";
  }

  function renderSurahList(query) {
    var list = document.getElementById("qrnSurahList");
    list.innerHTML = buildSurahListHTML(query, quranState.currentSurah);
    list.querySelectorAll(".quran-surah-item").forEach(function (el) {
      el.addEventListener("click", function () {
        var surahNo = parseInt(this.dataset.surah, 10);
        closeSurahSelector();
        goToQuranSurah(surahNo);
      });
    });
  }

  // ── Content dropdown ──

  // Stop wheel events on dropdowns from scrolling the horizontal nav row
  function trapWheel(el) {
    el.addEventListener("wheel", function (e) {
      e.stopPropagation();
    });
  }

  function toggleQuranContentDropdown() {
    var dd = document.getElementById("qrnContentDropdown");
    if (dd.style.display === "block") {
      dd.style.display = "none";
      return;
    }
    renderQuranContentList();
    var btn = document.getElementById("qrnContentBtn");
    window.openDropdown(dd, btn);
    dd.style.left = Math.max(8, btn.getBoundingClientRect().left) + "px";
  }

  function renderQuranContentList() {
    _buildLoadedColMap();
    var list = document.getElementById("qrnContentList");
    var allCols = getAllAvailableColumns();
    var html = '<div class="quran-content-presets">';
    html +=
      '<button class="quran-preset-btn" data-preset="main">' +
      t("qrnPresetMain") +
      "</button>";
    html +=
      '<button class="quran-preset-btn" data-preset="all">' +
      t("qrnPresetAll") +
      "</button>";
    html +=
      '<button class="quran-preset-btn" data-preset="arabic">' +
      t("qrnPresetArabic") +
      "</button>";
    html +=
      '<button class="quran-preset-btn" data-preset="reset">' +
      t("qrnPresetReset") +
      "</button>";
    html += "</div>";
    for (var j = 0; j < allCols.length; j++) {
      var col = allCols[j];
      var key = col.sourceBook + ":" + col.sourceCol;
      var colIdx = _loadedColMap[key];
      var isLoaded = colIdx !== undefined;
      var hiddenColumns = ctx.getHiddenColumns();
      var checked =
        isLoaded && hiddenColumns.indexOf(colIdx) === -1 ? "checked" : "";
      html +=
        '<label class="quran-content-item">' +
        '<input type="checkbox" data-source="' +
        col.sourceBook +
        '" data-col="' +
        col.sourceCol +
        '" ' +
        checked +
        ">" +
        "<span>" +
        (col.displayDV || col.displayEN) +
        "</span></label>";
    }
    list.innerHTML = html;
    list.querySelectorAll("input[type=checkbox]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        var sourceBook = this.dataset.source;
        var sourceCol = parseInt(this.dataset.col, 10);
        if (this.checked) {
          var label = this.parentNode.querySelector("span");
          var origText = label.textContent;
          this.disabled = true;
          label.textContent = t("loading");
          loadAndInsertColumn(sourceBook, sourceCol).finally(function () {
            cb.disabled = false;
            label.textContent = origText;
          });
        } else {
          hideLoadedColumn(sourceBook, sourceCol);
        }
      });
    });
    // Preset buttons
    list.querySelectorAll(".quran-preset-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var preset = this.dataset.preset;
        var hc = ctx.getHiddenColumns();
        if (preset === "all") {
          allCols.forEach(function (col) {
            loadAndInsertColumn(col.sourceBook, col.sourceCol);
          });
          ctx.rebuildAll();
          renderQuranContentList();
          return;
        }
        // Hide all external columns
        Object.keys(_loadedColMap).forEach(function (k) {
          var idx = _loadedColMap[k];
          if (idx === undefined) return;
          var parts = k.split(":");
          var sb = parts.slice(0, -1).join(":");
          if (
            sb !==
              "QRN-DATA-baseFile-1-juzNo_surahNo_ayahNo_basmalah_ayahImlai" &&
            sb !== metadata.bookCode
          ) {
            if (hc.indexOf(idx) === -1) hc.push(idx);
          }
        });
        if (preset === "reset") {
          ctx.rebuildAll();
          renderQuranContentList();
          return;
        }
        // Load preset-specific books
        var targets = preset === "main" ? QRN_PRESET_MAIN : QRN_PRESET_ARABIC;
        targets.forEach(function (sb) {
          allCols.forEach(function (col) {
            if (col.sourceBook === sb) loadAndInsertColumn(sb, col.sourceCol);
          });
        });
        ctx.rebuildAll();
        renderQuranContentList();
      });
    });
  }

  // ── On‑demand column loading ──

  var _loadedColMap = {};

  function _buildLoadedColMap() {
    var saved = {};
    for (var k in _loadedColMap) {
      var parts = k.split(":");
      if (
        parts[0] !==
          "QRN-DATA-baseFile-1-juzNo_surahNo_ayahNo_basmalah_ayahImlai" &&
        parts[0] !== metadata.bookCode
      ) {
        saved[k] = _loadedColMap[k];
      }
    }
    _loadedColMap = {};
    for (var sk in saved) {
      _loadedColMap[sk] = saved[sk];
    }
    // Map base columns by header name
    var baseNames = ["juzno", "surahno", "ayahno", "basmalah", "ayahimlai"];
    for (var i = 0; i < headerRow.length; i++) {
      var hdr = (headerRow[i] || "").replace(/-hdn$/i, "").trim().toLowerCase();
      for (var b = 0; b < baseNames.length; b++) {
        if (hdr === baseNames[b]) {
          _loadedColMap[
            "QRN-DATA-baseFile-1-juzNo_surahNo_ayahNo_basmalah_ayahImlai:" + b
          ] = i;
        }
      }
    }
    // Map current-book columns by position
    var allCols = getAllAvailableColumns();
    var bookColIdx = 0;
    for (var j2 = baseNames.length; j2 < headerRow.length; j2++) {
      var taken = false;
      for (var mk in _loadedColMap) {
        if (_loadedColMap[mk] === j2) {
          taken = true;
          break;
        }
      }
      if (taken) continue;
      for (var c = 0; c < allCols.length; c++) {
        if (
          allCols[c].sourceBook === metadata.bookCode &&
          allCols[c].sourceCol === bookColIdx
        ) {
          _loadedColMap[metadata.bookCode + ":" + bookColIdx] = j2;
          bookColIdx++;
          break;
        }
      }
    }
    rebuildColumnSourceMap(_loadedColMap);
  }

  function loadAndInsertColumn(sourceBook, sourceCol) {
    var key = sourceBook + ":" + sourceCol;
    var hiddenColumns = ctx.getHiddenColumns();
    if (_loadedColMap[key] !== undefined) {
      var idx = _loadedColMap[key];
      var pos = hiddenColumns.indexOf(idx);
      if (pos !== -1) hiddenColumns.splice(pos, 1);
      ctx.rebuildAll();
      return Promise.resolve();
    }
    return fetch("../data/" + sourceBook + ".csv")
      .then(function (r) {
        if (!r.ok) throw Error("Failed to load " + sourceBook);
        return r.text();
      })
      .then(function (text) {
        var rows = parseCSV(text);
        if (rows.length === 0) return;
        var csvHeader = rows.shift();
        if (sourceCol >= csvHeader.length) return;
        var colName = csvHeader[sourceCol];
        var insertAt = headerRow.length;
        headerRow.splice(insertAt, 0, colName);
        for (var r = 0; r < allData.length; r++) {
          var val =
            rows[r] && rows[r][sourceCol] != null
              ? String(rows[r][sourceCol]).trim()
              : "";
          allData[r].splice(insertAt, 0, val);
        }
        _loadedColMap[key] = insertAt;
        rebuildColumnSourceMap(_loadedColMap);
        var hc = ctx.getHiddenColumns();
        var hp = hc.indexOf(insertAt);
        if (hp !== -1) hc.splice(hp, 1);
        ctx.rebuildAll();
        renderQuranContentList();
      })
      .catch(function () {
        showToast("Could not load “" + sourceBook + "”");
      });
  }

  function hideLoadedColumn(sourceBook, sourceCol) {
    var key = sourceBook + ":" + sourceCol;
    if (_loadedColMap[key] !== undefined) {
      var idx = _loadedColMap[key];
      var hc = ctx.getHiddenColumns();
      if (hc.indexOf(idx) === -1) hc.push(idx);
      ctx.rebuildAll();
    }
  }
}
