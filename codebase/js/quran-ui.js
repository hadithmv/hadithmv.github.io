/**
 * Quran Reader UI Module
 *
 * Surah/ayah/juz navigation, content column management,
 * display options (braces/numbers), surah selector overlay.
 * All DOM setup for the Quran reader panel row.
 */

import { quranState, getSurahInfo, getAllAvailableColumns, buildSurahListHTML, getColumnDisplayName } from "./quran.js";
import { t, currentLang } from "./i18n.js";
import { parseCSV } from "./csv.js";

// ── Column index cache (shared with reader.js via exports) ──
var _juzIdx = -1, _surahIdx = -1, _ayahIdx = -1;

export function findQuranColIndices(headerRow) {
  if (_juzIdx >= 0) return { juzIdx: _juzIdx, surahIdx: _surahIdx, ayahIdx: _ayahIdx };
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

/**
 * Initialise all Quran UI elements.
 *
 * @param {Object} ctx — reader context bridge
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
/**
 * Update the surah/ayah/juz label elements from quranState.
 * Called by reader.js scroll sync and internally after navigation.
 */
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
  document.getElementById("qrnToggleAyahNum").classList.toggle("active", showAyahNum);
  document.getElementById("qrnToggleBraces").classList.toggle("active", showBraces);

  updateQuranNavDisplay();

  // ── Surah navigation ──
  document.getElementById("qrnSurahPrev").addEventListener("click", function () {
    if (quranState.currentSurah > 1) goToQuranSurah(quranState.currentSurah - 1);
  });
  document.getElementById("qrnSurahNext").addEventListener("click", function () {
    if (quranState.currentSurah < 114) goToQuranSurah(quranState.currentSurah + 1);
  });
  document.getElementById("qrnSurahBtn").addEventListener("click", openSurahSelector);

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
      html += '<div class="quran-content-item" data-v="' + i + '">' + i + '</div>';
    }
    ayahDD.innerHTML = html;
    var ir = ayahInput.getBoundingClientRect();
    ayahDD.style.position = "fixed";
    ayahDD.style.top = ir.bottom + 2 + "px";
    ayahDD.style.left = ir.left + "px";
    ayahDD.style.minWidth = "50px";
    ayahDD.style.maxWidth = "80px";
    ayahDD.style.display = "block";
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
  ayahInput.addEventListener("click", function (e) { e.stopPropagation(); if (!_justSelected) openAyahDropdown(); _justSelected = false; });
  ayahInput.addEventListener("focus", function () { this.select(); if (!_justSelected) openAyahDropdown(); _justSelected = false; });
  ayahDD.addEventListener("click", function (e) { e.stopPropagation(); _justSelected = true; });

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
      html += '<div class="quran-content-item" data-v="' + i + '">' + i + '</div>';
    }
    juzDD.innerHTML = html;
    var jr = juzInput.getBoundingClientRect();
    juzDD.style.position = "fixed";
    juzDD.style.top = jr.bottom + 2 + "px";
    juzDD.style.left = jr.left + "px";
    juzDD.style.minWidth = "50px";
    juzDD.style.maxWidth = "80px";
    juzDD.style.display = "block";
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
  juzInput.addEventListener("click", function (e) { e.stopPropagation(); if (!_justSelectedJuz) openJuzDropdown(); _justSelectedJuz = false; });
  juzInput.addEventListener("focus", function () { this.select(); if (!_justSelectedJuz) openJuzDropdown(); _justSelectedJuz = false; });
  juzDD.addEventListener("click", function (e) { e.stopPropagation(); _justSelectedJuz = true; });

  // ── Content dropdown ──
  document.getElementById("qrnContentBtn").addEventListener("click", function (e) {
    e.stopPropagation();
    toggleQuranContentDropdown();
  });

  // ── Display options dropdown ──
  var qrnDisplayBtn = document.getElementById("qrnDisplayBtn");
  var qrnDisplayDD = document.getElementById("qrnDisplayDropdown");
  qrnDisplayBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    if (qrnDisplayDD.style.display === "block") { qrnDisplayDD.style.display = "none"; return; }
    // Position fixed to escape overflow clipping
    var btnRect = qrnDisplayBtn.getBoundingClientRect();
    qrnDisplayDD.style.position = "fixed";
    qrnDisplayDD.style.top = btnRect.bottom + 4 + "px";
    qrnDisplayDD.style.right = "auto";
    qrnDisplayDD.style.left = btnRect.left + "px";
    qrnDisplayDD.style.maxWidth = Math.min(220, window.innerWidth - btnRect.left - 16) + "px";
    qrnDisplayDD.style.display = "block";
  });
  // Load initial checkbox states
  var ayahNumCB = document.getElementById("qrnToggleAyahNum");
  var bracesCB = document.getElementById("qrnToggleBraces");
  var numBracketsCB = document.getElementById("qrnToggleNumBrackets");
  ayahNumCB.checked = LS.get("quranShowAyahNum", true);
  bracesCB.checked = LS.get("quranShowBraces", true);
  numBracketsCB.checked = LS.get("quranShowNumBrackets", false);
  updateNumBracketsRow();

  function updateNumBracketsRow() {
    // Only show number-brackets option when both braces and number are on
    var row = document.getElementById("qrnNumBracketsRow");
    row.style.display = (bracesCB.checked && ayahNumCB.checked) ? "" : "none";
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
  document.getElementById("qrnSurahClose").addEventListener("click", closeSurahSelector);
  document.getElementById("qrnSurahOverlay").addEventListener("click", function (e) {
    if (e.target === this) closeSurahSelector();
  });
  document.getElementById("qrnSurahSearch").addEventListener("input", function () {
    renderSurahList(this.value);
  });

  // ── Outside click closes all Quran dropdowns ──
  document.addEventListener("click", function (e) {
    var dd = document.getElementById("qrnContentDropdown");
    var btn = document.getElementById("qrnContentBtn");
    if (dd && dd.style.display === "block" && !dd.contains(e.target) && e.target !== btn) {
      dd.style.display = "none";
    }
    if (ayahDD && ayahDD.style.display === "block" && !ayahDD.contains(e.target) && e.target !== ayahInput) {
      ayahDD.style.display = "none";
    }
    if (juzDD && juzDD.style.display === "block" && !juzDD.contains(e.target) && e.target !== juzInput) {
      juzDD.style.display = "none";
    }
    var dd2 = document.getElementById("qrnDisplayDropdown");
    if (dd2 && dd2.style.display === "block" && !dd2.contains(e.target) && e.target !== qrnDisplayBtn) {
      dd2.style.display = "none";
    }
  });

  // ── Navigation actions ──────────────────────────────────────

  function goToQuranSurah(surahNo) {
    findQuranColIndices(headerRow);
    quranState.currentSurah = surahNo;
    quranState.currentAyah = 1;
    document.getElementById("qrnAyahInput").value = 1;
    var info = getSurahInfo(surahNo);
    document.getElementById("qrnAyahInput").max = info ? info.ayahCount : 7;
    applyQuranSurahFilter();
    // Sync juz from first row of this surah
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
      // Sync juz from this ayah's row
      quranState.currentJuz = getRowJuz(ctx.getFilteredData()[rowIdx], headerRow);
    }
    updateQuranNavDisplay();
  }

  function goToQuranJuz(juzNo) {
    findQuranColIndices(headerRow);
    quranState.currentJuz = juzNo;
    document.getElementById("qrnJuzInput").value = juzNo;
    var jIdx = _juzIdx;
    if (jIdx >= 0) {
      ctx.setFilteredData(allData.filter(function (row) {
        return parseInt(row[jIdx], 10) === juzNo;
      }));
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
    ctx.setFilteredData(allData.filter(function (row) {
      return parseInt(row[1], 10) === sn;
    }));
    ctx.rebuildAll();
  }

  // ── Surah selector ──
  function openSurahSelector() {
    var overlay = document.getElementById("qrnSurahOverlay");
    overlay.style.display = "flex";
    document.getElementById("qrnSurahSearch").value = "";
    renderSurahList("");
    setTimeout(function () { document.getElementById("qrnSurahSearch").focus(); }, 50);
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
  function toggleQuranContentDropdown() {
    var dd = document.getElementById("qrnContentDropdown");
    if (dd.style.display === "block") { dd.style.display = "none"; return; }
    renderQuranContentList();
    // Position relative to viewport, clamped within screen bounds
    var btnRect = document.getElementById("qrnContentBtn").getBoundingClientRect();
    dd.style.position = "fixed";
    dd.style.top = btnRect.bottom + 4 + "px";
    dd.style.right = "auto";
    dd.style.left = Math.max(8, btnRect.left) + "px";
    dd.style.maxWidth = Math.min(window.innerWidth - Math.max(8, btnRect.left) - 16, 320) + "px";
    dd.style.display = "block";
  }

  function renderQuranContentList() {
    _buildLoadedColMap();
    var list = document.getElementById("qrnContentList");
    var allCols = getAllAvailableColumns();
    var html = "";
    for (var j = 0; j < allCols.length; j++) {
      var col = allCols[j];
      var key = col.sourceBook + ":" + col.sourceCol;
      var colIdx = _loadedColMap[key];
      var isLoaded = colIdx !== undefined;
      var hiddenColumns = ctx.getHiddenColumns();
      var checked = isLoaded && hiddenColumns.indexOf(colIdx) === -1 ? "checked" : "";
      html += '<label class="quran-content-item">' +
        '<input type="checkbox" data-source="' + col.sourceBook + '" data-col="' + col.sourceCol + '" ' + checked + '>' +
        '<span>' + (col.displayDV || col.displayEN) + '</span></label>';
    }
    list.innerHTML = html;
    list.querySelectorAll("input[type=checkbox]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        var sourceBook = this.dataset.source;
        var sourceCol = parseInt(this.dataset.col, 10);
        if (this.checked) {
          loadAndInsertColumn(sourceBook, sourceCol);
        } else {
          hideLoadedColumn(sourceBook, sourceCol);
        }
      });
    });
  }

  var _loadedColMap = {};

  function _buildLoadedColMap() {
    // Preserve externally-loaded entries (not base, not current book)
    var saved = {};
    for (var k in _loadedColMap) {
      var parts = k.split(":");
      if (parts[0] !== "QRN-DATA-juz_surah_ayahNo_basmalah_ayahImlai" && parts[0] !== metadata.bookCode) {
        saved[k] = _loadedColMap[k];
      }
    }
    _loadedColMap = {};
    for (var sk in saved) { _loadedColMap[sk] = saved[sk]; }
    // Map base columns by header name
    var baseNames = ["juzno", "surahno", "ayahno", "basmalah", "ayahimlai"];
    for (var i = 0; i < headerRow.length; i++) {
      var hdr = (headerRow[i] || "").replace(/-hdn$/i, "").trim().toLowerCase();
      for (var b = 0; b < baseNames.length; b++) {
        if (hdr === baseNames[b]) {
          _loadedColMap["QRN-DATA-juz_surah_ayahNo_basmalah_ayahImlai:" + b] = i;
        }
      }
    }
    // Map current-book columns by position (they follow base columns)
    var allCols = getAllAvailableColumns();
    var bookColIdx = 0;
    for (var j2 = baseNames.length; j2 < headerRow.length; j2++) {
      // Skip positions already claimed by external entries
      var taken = false;
      for (var mk in _loadedColMap) { if (_loadedColMap[mk] === j2) { taken = true; break; } }
      if (taken) continue;
      // Find the next current-book column from the registry
      for (var c = 0; c < allCols.length; c++) {
        if (allCols[c].sourceBook === metadata.bookCode && allCols[c].sourceCol === bookColIdx) {
          _loadedColMap[metadata.bookCode + ":" + bookColIdx] = j2;
          bookColIdx++;
          break;
        }
      }
    }
  }

  function loadAndInsertColumn(sourceBook, sourceCol) {
    var key = sourceBook + ":" + sourceCol;
    var hiddenColumns = ctx.getHiddenColumns();
    // If already loaded, just unhide
    if (_loadedColMap[key] !== undefined) {
      var idx = _loadedColMap[key];
      var pos = hiddenColumns.indexOf(idx);
      if (pos !== -1) hiddenColumns.splice(pos, 1);
      ctx.rebuildAll();
      return;
    }
    // Fetch CSV and insert column at end of headerRow
    fetch("../data/" + sourceBook + ".csv")
      .then(function (r) { if (!r.ok) throw Error("Failed to load " + sourceBook); return r.text(); })
      .then(function (text) {
        var rows = parseCSV(text);
        if (rows.length === 0) return;
        var csvHeader = rows.shift();
        if (sourceCol >= csvHeader.length) return;
        var colName = csvHeader[sourceCol];
        var insertAt = headerRow.length;
        headerRow.splice(insertAt, 0, colName);
        for (var r = 0; r < allData.length; r++) {
          var val = (rows[r] && rows[r][sourceCol] != null) ? String(rows[r][sourceCol]).trim() : "";
          allData[r].splice(insertAt, 0, val);
        }
        _loadedColMap[key] = insertAt;
        // Ensure the new column is visible (not in hiddenColumns)
        var hc = ctx.getHiddenColumns();
        var hp = hc.indexOf(insertAt);
        if (hp !== -1) hc.splice(hp, 1);
        ctx.rebuildAll();
        // Re-open dropdown so checkbox state reflects the loaded column
        renderQuranContentList();
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
