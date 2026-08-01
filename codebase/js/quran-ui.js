/**
 * Quran UI Module
 *
 * DOM setup for the Quran reader panel: surah/ayah/juz dropdowns,
 * content preset dropdown, display options, surah selector overlay,
 * on-demand column loading, presets.
 * Re-exports all data symbols from quran-data.js (barrel pattern).
 * Imported by reader.js when a QRN-prefixed book is detected.
 */

// Explicit re-exports from quran-data.js (avoids silent name collisions of export *)
export {
  isQuranBook, QRN_PRESET_MAIN, QRN_PRESET_ARABIC,
  loadQuranBaseData, loadSurahNames,
  getSurahNames, getSurahInfo, toArabicNumeral, AYAH_TEXT_COLS,
  isAyahTextColumn, decorateAyah, loadQuranBookCSV, mergeQuranData,
  loadColumnRegistry,
  rebuildColumnSourceMap, getBookLabel, hasExternalColumns,
  getAllAvailableColumns, quranState,
  buildSurahListHTML, findQuranColIndices,
  getAyahNoFromRow, getRowJuz, getRowSurah, updateQuranNavDisplay,
  columnFieldClass, columnTdClass, isFootnoteColumn,
  isArDvTransition, isMatnSharhTransition, classifyColumnLang,
} from "./quran-data.js";

import { QRN_PRESET_MAIN, QRN_PRESET_ARABIC, getSurahInfo,
  getAllAvailableColumns, rebuildColumnSourceMap, quranState,
  getRowJuz, getRowSurah, findQuranColIndices, loadQuranBookCSV,
  applyColumnOrder, BASE_HEADERS,
  updateQuranNavDisplay, buildSurahListHTML } from "./quran-data.js";

import { normaliseForSearch } from "./search.js";
import { t } from "./i18n.js";

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
  // dd-menu carries the opaque card background — without it the dropdown
  // is transparent and page text shows through behind its items
  ayahDD.className = "quran-content-dropdown dd-menu";
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
        '<div class="quran-content-item dd-item" data-v="' + i + '">' + i + "</div>";
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
  // dd-menu carries the opaque card background — without it the dropdown
  // is transparent and page text shows through behind its items
  juzDD.className = "quran-content-dropdown dd-menu";
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
        '<div class="quran-content-item dd-item" data-v="' + i + '">' + i + "</div>";
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

  // ── Content modal ──
  document
    .getElementById("qrnContentBtn")
    .addEventListener("click", function () {
      openQuranContentModal();
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
    var jIdx = findQuranColIndices(headerRow).juzIdx;
    quranState.currentJuz = juzNo;
    document.getElementById("qrnJuzInput").value = juzNo;
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
    var html = buildSurahListHTML(query, quranState.currentSurah);
    // Empty state — the query matched no surah (no query = full list, never empty)
    if (!html && query && query.trim()) {
      html = '<div class="qrn-surah-empty">' + t("qrnNoMatch") + "</div>";
    }
    list.innerHTML = html;
    list.querySelectorAll(".quran-surah-item").forEach(function (el) {
      el.addEventListener("click", function () {
        var surahNo = parseInt(this.dataset.surah, 10);
        closeSurahSelector();
        goToQuranSurah(surahNo);
      });
    });
  }

  // ── Content modal ──

  // Stop wheel events on dropdowns from scrolling the horizontal nav row
  function trapWheel(el) {
    el.addEventListener("wheel", function (e) {
      e.stopPropagation();
    });
  }

  // Ordered list of every available column (registry order by default).
  // The reader shows loaded columns in this order — the modal's ▲▼ buttons
  // reorder it, and inserted columns land at their list position.
  var _colOrder = [];
  (function () {
    var all = getAllAvailableColumns();
    for (var i = 0; i < all.length; i++) {
      _colOrder.push(all[i].sourceBook + ":" + all[i].sourceCol);
    }
  })();
  var _pendingColumnValues = {}; // key → {name, values, normValues} awaiting applyColumnOrder

  function colLabelFor(key) {
    var all = getAllAvailableColumns();
    for (var i = 0; i < all.length; i++) {
      if (all[i].sourceBook + ":" + all[i].sourceCol === key) {
        return all[i].displayDV || all[i].displayEN;
      }
    }
    return key;
  }
  function isBaseKey(key) {
    return key.indexOf("QRN-DATA-baseFile-1-") === 0;
  }

  // Create the modal once — the unified layer wires backdrop, close, Escape.
  window.createModal("qrnContentOverlay", "qrnContentModalTitle", "qrnContentModalBody", "quran-content-modal");
  document.getElementById("qrnContentModalBody").innerHTML =
    '<div class="quran-content-presets">' +
      '<button class="quran-preset-btn" data-preset="main"></button>' +
      '<button class="quran-preset-btn" data-preset="all"></button>' +
      '<button class="quran-preset-btn" data-preset="arabic"></button>' +
      '<button class="quran-preset-btn" data-preset="reset"></button>' +
    '</div>' +
    '<div class="quran-content-table-wrap"><table class="quran-content-table">' +
      '<thead><tr>' +
        '<th class="quran-col-check">✓</th>' +
        '<th class="quran-col-label" id="qrnColThColumn"></th>' +
        '<th class="quran-col-move" id="qrnColThOrder"></th>' +
      '</tr></thead>' +
      '<tbody id="qrnContentList"></tbody>' +
    '</table></div>';

  function updateQuranContentLabels() {
    document.getElementById("qrnContentModalTitle").textContent = t("qrnContent");
    document.getElementById("qrnColThColumn").textContent = t("advColumn");
    document.getElementById("qrnColThOrder").textContent = t("ddColSort");
    document.querySelectorAll("#qrnContentOverlay .quran-preset-btn").forEach(function (btn) {
      var key = "qrnPreset" + btn.dataset.preset.charAt(0).toUpperCase() + btn.dataset.preset.slice(1);
      btn.textContent = t(key);
    });
  }
  updateQuranContentLabels();
  document.addEventListener("languagechange", updateQuranContentLabels);

  // Preset buttons are static in the modal — wire once
  document.querySelectorAll("#qrnContentOverlay .quran-preset-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var preset = this.dataset.preset;
      var hc = ctx.getHiddenColumns();
      if (preset === "all") {
        var all = getAllAvailableColumns();
        all.forEach(function (col) {
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
        var all2 = getAllAvailableColumns();
        all2.forEach(function (col) {
          if (col.sourceBook === sb) loadAndInsertColumn(sb, col.sourceCol);
        });
      });
      ctx.rebuildAll();
      renderQuranContentList();
    });
  });

  function openQuranContentModal() {
    window.closeAllDropdowns();
    renderQuranContentList();
    window.openModal("qrnContentOverlay");
  }

  function moveColumn(key, dir) {
    var idx = _colOrder.indexOf(key);
    var tgt = idx + dir;
    if (idx < 0 || tgt < 0 || tgt >= _colOrder.length) return;
    // Base (structural) columns stay fixed at the front
    if (isBaseKey(key) || isBaseKey(_colOrder[tgt])) return;
    var tmp = _colOrder[idx];
    _colOrder[idx] = _colOrder[tgt];
    _colOrder[tgt] = tmp;
    if (_loadedColMap[key] !== undefined) rebuildColumnOrder();
    renderQuranContentList();
  }

  function renderQuranContentList() {
    var list = document.getElementById("qrnContentList");
    var hc = ctx.getHiddenColumns();
    var html = "";
    for (var i = 0; i < _colOrder.length; i++) {
      var key = _colOrder[i];
      var parts = key.split(":");
      var sourceBook = parts.slice(0, -1).join(":");
      var sourceCol = parseInt(parts[parts.length - 1], 10);
      var colIdx = _loadedColMap[key];
      var isLoaded = colIdx !== undefined;
      var checked = isLoaded && hc.indexOf(colIdx) === -1 ? "checked" : "";
      var base = isBaseKey(key);
      html +=
        '<tr class="quran-content-item" data-key="' + key + '">' +
        '<td class="quran-col-check"><input type="checkbox" data-source="' +
        sourceBook + '" data-col="' + sourceCol + '" ' + checked + "></td>" +
        '<td class="quran-col-label"><span>' + colLabelFor(key) + "</span></td>" +
        '<td class="quran-col-move">' +
        '<span class="chip-arrow' + (base || i === 0 ? " chip-arrow-disabled" : "") +
        '" data-action="move-up" title="Move up">▲</span>' +
        '<span class="chip-arrow' + (base || i === _colOrder.length - 1 ? " chip-arrow-disabled" : "") +
        '" data-action="move-down" title="Move down">▼</span>' +
        "</td></tr>";
    }
    list.innerHTML = html;
    list.querySelectorAll("input[type=checkbox]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        var sourceBook = this.dataset.source;
        var sourceCol = parseInt(this.dataset.col, 10);
        if (this.checked) {
          var label = this.closest("tr").querySelector(".quran-col-label span");
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
    // Reorder buttons (disabled ones are skipped)
    list.querySelectorAll(".chip-arrow:not(.chip-arrow-disabled)").forEach(function (ar) {
      ar.addEventListener("click", function () {
        var tr = this.closest("tr");
        moveColumn(tr.dataset.key, this.dataset.action === "move-up" ? -1 : 1);
      });
    });
  }

  // ── On‑demand column loading ──

  var _loadedColMap = {};

  // Initial mapping only — after the first user action (insert/move),
  // applyColumnOrder() owns the map and keeps it in sync with headerRow.
  _buildLoadedColMap();

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
    // loadQuranBookCSV keeps a one-entry parse cache — inserting several
    // columns from the same book fetches and parses that book's CSV once.
    return loadQuranBookCSV(sourceBook)
      .then(function (book) {
        var rows = book.data;
        var csvHeader = book.header;
        if (rows.length === 0) return;
        if (sourceCol >= csvHeader.length) return;
        // Stash the column's values; rebuildColumnOrder() places it at its
        // position in the list order instead of appending to the reader.
        var vals = [];
        var normVals = [];
        for (var r = 0; r < allData.length; r++) {
          var v =
            rows[r] && rows[r][sourceCol] != null
              ? String(rows[r][sourceCol]).trim()
              : "";
          vals.push(v);
          normVals.push(v ? normaliseForSearch(v) : "");
        }
        _loadedColMap[key] = -1; // loaded marker; real index assigned by the rebuild
        _pendingColumnValues[key] = {
          name: csvHeader[sourceCol],
          values: vals,
          normValues: normVals,
        };
        rebuildColumnOrder();
        renderQuranContentList();
      })
      .catch(function () {
        window.showErrorToast("Could not load “" + sourceBook + "”");
      });
  }

  /**
   * Rebuild the reader's column layout from _colOrder (the modal's order).
   * Handles both reorders and freshly inserted columns (via _pendingColumnValues).
   * Applies the result in place — reader.js holds the same array references,
   * so headerRow / allData / norm rows / hiddenColumns are mutated, not replaced.
   */
  function rebuildColumnOrder() {
    var res = applyColumnOrder({
      baseCount: BASE_HEADERS.length,
      headerRow: headerRow,
      allData: allData,
      normAllData: ctx.normAllData,
      loadedMap: _loadedColMap,
      hiddenColumns: ctx.getHiddenColumns(),
      order: _colOrder,
      pending: _pendingColumnValues,
    });
    headerRow.length = 0;
    for (var i = 0; i < res.headerRow.length; i++) headerRow.push(res.headerRow[i]);
    for (var r = 0; r < allData.length; r++) allData[r] = res.allData[r];
    if (ctx.normAllData) {
      for (var r2 = 0; r2 < ctx.normAllData.length; r2++) {
        ctx.normAllData[r2] = res.normAllData[r2];
      }
    }
    _loadedColMap = res.loadedMap;
    var hc = ctx.getHiddenColumns();
    hc.length = 0;
    for (var h = 0; h < res.hiddenColumns.length; h++) hc.push(res.hiddenColumns[h]);
    _pendingColumnValues = {};
    rebuildColumnSourceMap(_loadedColMap);
    ctx.rebuildAll();
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
