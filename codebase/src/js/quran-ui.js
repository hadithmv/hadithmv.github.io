/**
 * Quran UI Module
 *
 * DOM setup for the Quran reader panel: surah/ayah/juz dropdowns,
 * content preset dropdown, display options, surah selector overlay,
 * on-demand column loading, presets.
 * Re-exports the quran-data.js symbols only the QRN reader needs (barrel
 * pattern). Loaded lazily: reader.js dynamic-imports this pair only when a
 * QRN-prefixed book opens, so no other book pays for it. Detection + column
 * classification live in book-data.js — shared by every book's reader
 * without pulling the Quran data modules into the critical path.
 */

// Explicit re-exports from quran-data.js (avoids silent name collisions of export *)
export {
  QRN_PRESET_MAIN, QRN_PRESET_ARABIC,
  loadQuranBaseData, loadSurahNames,
  getSurahNames, getSurahInfo, toArabicNumeral,
  decorateAyah, loadQuranBookCSV, mergeQuranData, mergeQuranDataStreamed,
  quranState,
  buildSurahListHTML, findQuranColIndices,
  getAyahNoFromRow, getRowJuz, getRowSurah, updateQuranNavDisplay,
  getSurahStartRow, getJuzStartRow,
} from "./quran-data.js";

import { QRN_PRESET_MAIN, QRN_PRESET_ARABIC, getSurahInfo,
  quranState,
  getRowJuz, getRowSurah, findQuranColIndices, loadQuranBookCSV,
  applyColumnOrder, BASE_HEADERS,
  getSurahStartRow, getJuzStartRow,
  updateQuranNavDisplay, buildSurahListHTML } from "./quran-data.js";

// Shared column smarts — now in book-data.js so every book's reader gets
// them without pulling the Quran data modules into the critical path.
import { getAllAvailableColumns, rebuildColumnSourceMap, QRN_BASE_FILE,
  QRN_BASE_STRUCT, isBaseSourceBook } from "./book-data.js";

import { normaliseForSearch } from "./search-utils.js";
import { t } from "./i18n.js";

// data-preset values on the content-modal preset buttons — must stay in sync
// with the data-preset attributes in the modal markup. Distinct from
// QRN_PRESET_MAIN / QRN_PRESET_ARABIC (the column lists those presets load).
var PRESET_MAIN = "main";
var PRESET_ALL = "all";
var PRESET_ARABIC = "arabic";
var PRESET_RESET = "reset";

export function initQuranUI(ctx) {
  var readerPanelQuran = document.getElementById("readerPanelQuran");
  if (!readerPanelQuran) return;
  readerPanelQuran.style.display = "";

  var LS = ctx.LS;
  var metadata = ctx.metadata;
  var headerRow = ctx.headerRow;
  var allData = ctx.allData;

  // Load toggle state
  var showAyahNum = LS.get(window.LS_KEYS.readerQuranShowAyahNum, true);
  var showBraces = LS.get(window.LS_KEYS.readerQuranShowBraces, true);
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
  var ayahDropdown = document.createElement("div");
  ayahDropdown.id = "qrnAyahDropdown";
  // dd-menu carries the opaque card background — without it the dropdown
  // is transparent and page text shows through behind its items
  ayahDropdown.className = "quran-content-dropdown dd-menu";
  ayahDropdown.style.display = "none";
  ayahDropdown.style.position = "absolute";
  ayahDropdown.style.left = "0";
  ayahDropdown.style.maxHeight = "200px";
  ayahDropdown.style.overflowY = "auto";
  ayahDropdown.style.minWidth = "60px";
  ayahInput.parentNode.style.position = "relative";
  ayahInput.parentNode.appendChild(ayahDropdown);

  function openAyahDropdown() {
    var max = parseInt(ayahInput.max, 10) || 7;
    var html = "";
    for (var i = 1; i <= max; i++) {
      html +=
        '<div class="quran-content-item dd-item" data-v="' + i + '">' + i + "</div>";
    }
    ayahDropdown.innerHTML = html;
    window.openDropdown(ayahDropdown, ayahInput, 2);
    ayahDropdown.style.minWidth = "50px";
    ayahDropdown.style.maxWidth = "80px";
    ayahDropdown.querySelectorAll(".quran-content-item").forEach(function (el) {
      el.addEventListener("click", function () {
        ayahDropdown.style.display = "none";
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
  ayahDropdown.addEventListener("click", function (e) {
    e.stopPropagation();
    _justSelected = true;
  });

  // ── Juz navigation ──
  var juzInput = document.getElementById("qrnJuzInput");
  var juzDropdown = document.createElement("div");
  juzDropdown.id = "qrnJuzDropdown";
  // dd-menu carries the opaque card background — without it the dropdown
  // is transparent and page text shows through behind its items
  juzDropdown.className = "quran-content-dropdown dd-menu";
  juzDropdown.style.display = "none";
  juzDropdown.style.position = "absolute";
  juzDropdown.style.left = "0";
  juzDropdown.style.maxHeight = "200px";
  juzDropdown.style.overflowY = "auto";
  juzDropdown.style.minWidth = "60px";
  juzInput.parentNode.style.position = "relative";
  juzInput.parentNode.appendChild(juzDropdown);

  function openJuzDropdown() {
    var html = "";
    for (var i = 1; i <= 30; i++) {
      html +=
        '<div class="quran-content-item dd-item" data-v="' + i + '">' + i + "</div>";
    }
    juzDropdown.innerHTML = html;
    window.openDropdown(juzDropdown, juzInput, 2);
    juzDropdown.style.minWidth = "50px";
    juzDropdown.style.maxWidth = "80px";
    juzDropdown.querySelectorAll(".quran-content-item").forEach(function (el) {
      el.addEventListener("click", function () {
        juzDropdown.style.display = "none";
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
  juzDropdown.addEventListener("click", function (e) {
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
  var quranDisplayDropdown = document.getElementById("qrnDisplayDropdown");
  trapWheel(quranDisplayDropdown);
  qrnDisplayBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    if (quranDisplayDropdown.style.display === "block") {
      quranDisplayDropdown.style.display = "none";
      return;
    }
    window.openDropdown(quranDisplayDropdown, qrnDisplayBtn);
    quranDisplayDropdown.style.maxWidth =
      Math.min(
        220,
        window.innerWidth - qrnDisplayBtn.getBoundingClientRect().left - 16,
      ) + "px";
  });

  var ayahNumCB = document.getElementById("qrnToggleAyahNum");
  var bracesCB = document.getElementById("qrnToggleBraces");
  var numBracketsCB = document.getElementById("qrnToggleNumberBrackets");
  ayahNumCB.checked = LS.get(window.LS_KEYS.readerQuranShowAyahNum, true);
  bracesCB.checked = LS.get(window.LS_KEYS.readerQuranShowBraces, true);
  numBracketsCB.checked = LS.get(window.LS_KEYS.readerQuranShowNumBrackets, false);
  updateNumBracketsRow();

  function updateNumBracketsRow() {
    var row = document.getElementById("qrnNumberBracketsRow");
    row.style.display = bracesCB.checked && ayahNumCB.checked ? "" : "none";
  }

  ayahNumCB.addEventListener("change", function () {
    LS.set(window.LS_KEYS.readerQuranShowAyahNum, this.checked);
    updateNumBracketsRow();
    ctx.rebuildAll();
  });
  bracesCB.addEventListener("change", function () {
    LS.set(window.LS_KEYS.readerQuranShowBraces, this.checked);
    updateNumBracketsRow();
    ctx.rebuildAll();
  });
  numBracketsCB.addEventListener("change", function () {
    LS.set(window.LS_KEYS.readerQuranShowNumBrackets, this.checked);
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
  var qrnSurahSearch = document.getElementById("qrnSurahSearch");
  var qrnSurahSearchClear = document.getElementById("qrnSurahSearchClear");
  qrnSurahSearch.addEventListener("input", function () {
    // The ✕ mirrors the query — the shared search-box component's
    // contract (the reader search, the search window, the facet filters).
    qrnSurahSearchClear.classList.toggle("visible", !!this.value);
    renderSurahList(this.value);
  });
  // The ✕ clears and re-fires "input" — the same re-render path as
  // typing — then focus stays in the field.
  qrnSurahSearchClear.addEventListener("click", function () {
    qrnSurahSearch.value = "";
    qrnSurahSearch.dispatchEvent(new Event("input", { bubbles: true }));
    qrnSurahSearch.focus();
  });

  // ── Outside click closes all Quran dropdowns ──
  document.addEventListener("click", function (e) {
    if (
      ayahDropdown &&
      ayahDropdown.style.display === "block" &&
      !ayahDropdown.contains(e.target) &&
      e.target !== ayahInput
    ) {
      ayahDropdown.style.display = "none";
    }
    if (
      juzDropdown &&
      juzDropdown.style.display === "block" &&
      !juzDropdown.contains(e.target) &&
      e.target !== juzInput
    ) {
      juzDropdown.style.display = "none";
    }
    if (
      quranDisplayDropdown &&
      quranDisplayDropdown.style.display === "block" &&
      !quranDisplayDropdown.contains(e.target) &&
      e.target !== qrnDisplayBtn
    ) {
      quranDisplayDropdown.style.display = "none";
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
    quranState.currentJuz = juzNo;
    document.getElementById("qrnJuzInput").value = juzNo;
    // The juz table's start rows make this a slice instead of a 6236-row scan.
    var start = getJuzStartRow(juzNo);
    if (start >= 0) {
      var end = juzNo < 30 ? getJuzStartRow(juzNo + 1) : allData.length;
      ctx.setFilteredData(allData.slice(start, end));
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
    // The surah start-row table makes this a slice instead of a 6236-row scan.
    var start = getSurahStartRow(sn);
    var info = getSurahInfo(sn);
    if (start >= 0 && info) {
      ctx.setFilteredData(allData.slice(start, start + info.ayahCount));
    }
    ctx.rebuildAll();
  }

  // ── Surah selector ──

  function openSurahSelector() {
    window.closeAllDropdowns && window.closeAllDropdowns();
    var overlay = document.getElementById("qrnSurahOverlay");
    overlay.style.display = "flex";
    document.getElementById("qrnSurahSearch").value = "";
    document.getElementById("qrnSurahSearchClear").classList.remove("visible");
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
      html = '<div class="quran-surah-empty">' + t("qrnNoMatch") + "</div>";
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
    var availableCols = getAllAvailableColumns();
    for (var i = 0; i < availableCols.length; i++) {
      _colOrder.push(availableCols[i].sourceBook + ":" + availableCols[i].sourceCol);
    }
  })();
  var _pendingColumnValues = {}; // key → {name, values, normValues} awaiting applyColumnOrder

  // In-flight external-book column load (content modal). External books load
  // one download at a time: the gate disables every checkbox + preset button
  // while one runs (sequential presets), the status line shows the book and
  // %, and the Cancel button aborts the current fetch.
  var _columnAbort = null;     // AbortController of the in-flight load
  var _loadInProgress = false; // gate: modal controls disabled while loading
  var _columnBook = null;      // book currently downloading (reopen refresh)

  function colLabelFor(key) {
    var availableCols = getAllAvailableColumns();
    for (var i = 0; i < availableCols.length; i++) {
      if (availableCols[i].sourceBook + ":" + availableCols[i].sourceCol === key) {
        return availableCols[i].displayDV || availableCols[i].displayEN;
      }
    }
    return key;
  }
  function isBaseKey(key) {
    return key.indexOf(QRN_BASE_STRUCT + ":") === 0 ||
      key.indexOf(QRN_BASE_FILE + ":") === 0;
  }
  // The fixed structural pseudo-book columns (juz/surah/ayah) have no CSV
  // file and no toggle in the modal — this is the no-op set for both the
  // content-list render and loadAndInsertColumn. Basmalah (QRN-BASE-STRUCT:3)
  // is NOT in it: it's a real column with a real toggle that must be
  // re-enablable (it unhides through loadAndInsertColumn's loaded-map path).
  function isFixedStructuralKey(key) {
    return key === QRN_BASE_STRUCT + ":0" ||
      key === QRN_BASE_STRUCT + ":1" ||
      key === QRN_BASE_STRUCT + ":2";
  }

  // Create the modal once — the unified layer wires backdrop, close, Escape.
  window.createModal("qrnContentOverlay", "qrnContentModalTitle", "qrnContentModalBody", "quran-content-modal");
  document.getElementById("qrnContentModalBody").innerHTML =
    '<div class="quran-content-presets">' +
      '<button class="quran-preset-btn" data-preset="' + PRESET_MAIN + '"></button>' +
      '<button class="quran-preset-btn" data-preset="' + PRESET_ALL + '"></button>' +
      '<button class="quran-preset-btn" data-preset="' + PRESET_ARABIC + '"></button>' +
      '<button class="quran-preset-btn" data-preset="' + PRESET_RESET + '"></button>' +
    '</div>' +
    // Status line for external-book downloads: the book code + % (the shared
    // .loading-progress spans) and the Cancel button. Hidden unless a load is
    // in flight — the display dance lives in reader-quran.css, where an
    // author display:flex would otherwise override the UA [hidden] rule.
    '<div id="qrnColumnStatus" class="quran-column-status" hidden>' +
      '<span class="loading-progress"><span id="qrnColumnStatusText"></span> ' +
        '<span class="loading-progress-pct" id="qrnColumnStatusPct"></span></span>' +
      '<button type="button" id="qrnColumnCancel" class="quran-column-cancel">' +
        t("confirmCancel") + '</button>' +
    '</div>' +
    // The header row lives in its own wrapper above the scrollable wrap —
    // the wrap's scrollbar spans only the list, never the pinned header
    // (a sticky thead inside the scroller would keep its scrollbar
    // spanning the header zone).
    '<div class="quran-content-table-head"><table class="quran-content-table">' +
      '<thead><tr>' +
        '<th class="quran-col-check">✓</th>' +
        '<th class="quran-col-label" id="qrnColThColumn"></th>' +
        '<th class="quran-col-move" id="qrnColThOrder"></th>' +
      '</tr></thead>' +
    '</table></div>' +
    '<div class="quran-content-table-wrap"><table class="quran-content-table">' +
      '<tbody id="qrnContentList"></tbody>' +
    '</table></div>';

  function updateQuranContentLabels() {
    document.getElementById("qrnContentModalTitle").textContent = t("qrnContent");
    document.getElementById("qrnColThColumn").textContent = t("advancedColumn");
    document.getElementById("qrnColThOrder").textContent = t("ddColSort");
    document.querySelectorAll("#qrnContentOverlay .quran-preset-btn").forEach(function (btn) {
      var key = "qrnPreset" + btn.dataset.preset.charAt(0).toUpperCase() + btn.dataset.preset.slice(1);
      btn.textContent = t(key);
    });
    document.getElementById("qrnColumnCancel").textContent = t("confirmCancel");
  }
  updateQuranContentLabels();
  document.addEventListener("languagechange", updateQuranContentLabels);

  // Preset buttons are static in the modal — wire once
  document.querySelectorAll("#qrnContentOverlay .quran-preset-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var preset = this.dataset.preset;
      if (_loadInProgress) return; // belt — the gate disables the buttons anyway
      var hiddenCols = ctx.getHiddenColumns();
      var targets = [];
      if (preset === PRESET_ALL) {
        // Registry order, sequential — the queue below loads one book's
        // columns at a time (the per-book parse cache makes the 2nd+ column
        // of a book instant).
        var availableCols = getAllAvailableColumns();
        for (var i = 0; i < availableCols.length; i++) {
          targets.push([availableCols[i].sourceBook, availableCols[i].sourceCol]);
        }
      } else {
        // Hide all external columns
        Object.keys(_loadedColMap).forEach(function (k) {
          var idx = _loadedColMap[k];
          if (idx === undefined) return;
          var parts = k.split(":");
          var sourceBook = parts.slice(0, -1).join(":");
          if (!isBaseSourceBook(sourceBook) && sourceBook !== metadata.bookCode) {
            if (hiddenCols.indexOf(idx) === -1) hiddenCols.push(idx);
          }
        });
        if (preset === PRESET_RESET) {
          ctx.rebuildAll();
          renderQuranContentList();
          return;
        }
        // Load preset-specific books, book by book
        var presetBooks = preset === PRESET_MAIN ? QRN_PRESET_MAIN : QRN_PRESET_ARABIC;
        var presetCols = getAllAvailableColumns();
        for (var p = 0; p < presetBooks.length; p++) {
          for (var c = 0; c < presetCols.length; c++) {
            if (presetCols[c].sourceBook === presetBooks[p]) {
              targets.push([presetCols[c].sourceBook, presetCols[c].sourceCol]);
            }
          }
        }
      }
      ctx.rebuildAll();
      renderQuranContentList();
      // Sequential queue: beginColumnLoad gates the modal while one download
      // runs, each insert's settle advances the queue, and a cancel (aborted
      // signal) stops it — landed columns stay. The null guard matters:
      // instant targets (basmalah/imlai/already-loaded) early-return without
      // creating a controller.
      var idx = 0;
      function next() {
        if (idx >= targets.length || (_columnAbort && _columnAbort.signal.aborted)) {
          endColumnLoad();
          ctx.rebuildAll();
          renderQuranContentList();
          return;
        }
        var t = targets[idx++];
        beginColumnLoad(t[0]);
        loadAndInsertColumn(t[0], t[1]).then(next);
      }
      next();
    });
  });

  // Cancel button: abort the in-flight download. Silent by design — the
  // column simply doesn't land (columns already landed by a preset stay).
  document.getElementById("qrnColumnCancel").addEventListener("click", function () {
    if (!_loadInProgress) return;
    if (_columnAbort) _columnAbort.abort();
    endColumnLoad();
  });

  function openQuranContentModal() {
    window.closeAllDropdowns();
    renderQuranContentList();
    // A load can outlive a modal close — show its status again on reopen.
    if (_loadInProgress && _columnBook) showColumnStatus(_columnBook);
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
    var hiddenCols = ctx.getHiddenColumns();
    var html = "";
    for (var i = 0; i < _colOrder.length; i++) {
      var key = _colOrder[i];
      // Juz/surah/ayah are fixed structural columns: auto-hidden (-HDN),
      // never reorderable, and their checkbox is a no-op — don't offer them
      // in the modal. Basmalah (QRN-BASE-STRUCT:3) and the imlai row stay:
      // real toggles.
      if (isFixedStructuralKey(key)) continue;
      var parts = key.split(":");
      var sourceBook = parts.slice(0, -1).join(":");
      var sourceCol = parseInt(parts[parts.length - 1], 10);
      var colIdx = _loadedColMap[key];
      var isLoaded = colIdx !== undefined;
      var checked = isLoaded && hiddenCols.indexOf(colIdx) === -1 ? "checked" : "";
      var base = isBaseKey(key);
      html +=
        '<tr class="quran-content-item" data-key="' + key + '">' +
        '<td class="quran-col-check"><input type="checkbox" data-source="' +
        sourceBook + '" data-col="' + sourceCol + '" ' + checked +
        (_loadInProgress ? " disabled" : "") + "></td>" +
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
          if (_loadInProgress) return; // belt — gated boxes can't fire change
          beginColumnLoad(sourceBook);
          var loadPromise = loadAndInsertColumn(sourceBook, sourceCol);
          var myAbort = _columnAbort; // assigned synchronously by the load
          loadPromise.then(function () {
            // endColumnLoad restores the truth: a landed insert re-renders
            // the box checked, a cancel re-renders it unchecked. The identity
            // guard keeps a stale settle from clearing a newer load's gate.
            if (_columnAbort === myAbort) endColumnLoad();
          });
        } else {
          hideLoadedColumn(sourceBook, sourceCol);
        }
      });
    });
    // Reorder buttons (disabled ones are skipped)
    list.querySelectorAll(".chip-arrow:not(.chip-arrow-disabled)").forEach(function (arrowEl) {
      arrowEl.addEventListener("click", function () {
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
      if (!isBaseSourceBook(parts[0]) && parts[0] !== metadata.bookCode) {
        saved[k] = _loadedColMap[k];
      }
    }
    _loadedColMap = {};
    for (var sk in saved) {
      _loadedColMap[sk] = saved[sk];
    }
    // Map base columns by header name. Keys must match
    // 07-registry-quranColumns.csv (sourceBook:colIdx): the structural
    // columns belong to the QRN-BASE-STRUCT pseudo-book, the imlai text to
    // the 1-column imlai book.
    var baseNames = ["juzno", "surahno", "ayahno", "basmalah", "ayahimlai"];
    for (var i = 0; i < headerRow.length; i++) {
      var hdr = (headerRow[i] || "").replace(/-hdn$/i, "").trim().toLowerCase();
      for (var b = 0; b < baseNames.length; b++) {
        if (hdr === baseNames[b]) {
          _loadedColMap[(b < 4 ? QRN_BASE_STRUCT : QRN_BASE_FILE) + ":" + (b < 4 ? b : 0)] = i;
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

  // ── On-demand column load helpers (content modal) ──

  function showColumnStatus(bookCode) {
    _columnBook = bookCode;
    var status = document.getElementById("qrnColumnStatus");
    if (status) status.hidden = false;
    document.getElementById("qrnColumnStatusText").textContent = "Loading " + bookCode + "…";
    document.getElementById("qrnColumnStatusPct").textContent = "0%";
  }
  function updateColumnStatus(bookCode, fraction) {
    showColumnStatus(bookCode);
    document.getElementById("qrnColumnStatusPct").textContent = Math.round(fraction * 100) + "%";
  }
  function hideColumnStatus() {
    var status = document.getElementById("qrnColumnStatus");
    if (status) status.hidden = true;
  }
  // The gate: in place, no re-render. A re-render would recompute the ticked
  // box's checked state from _loadedColMap, which doesn't contain the
  // in-flight column yet, and visually untick it mid-download.
  function setColumnGate(on) {
    _loadInProgress = on;
    document.querySelectorAll("#qrnContentList input[type=checkbox]").forEach(function (cb) {
      cb.disabled = on;
    });
    document.querySelectorAll("#qrnContentOverlay .quran-preset-btn").forEach(function (btn) {
      btn.disabled = on;
    });
  }
  function beginColumnLoad(bookCode) {
    setColumnGate(true);
    showColumnStatus(bookCode);
  }
  // Idempotent: called from the cancel button and from every load settle.
  function endColumnLoad() {
    _columnBook = null;
    setColumnGate(false);
    renderQuranContentList(); // restores truth: landed → checked, cancelled → not
    hideColumnStatus();
  }

  function loadAndInsertColumn(sourceBook, sourceCol) {
    // Juz/surah/ayah have no CSV file and no modal toggle — a no-op for
    // them only. Basmalah (QRN-BASE-STRUCT:3) falls through to the
    // loaded-map unhide path below: hiding it (hideLoadedColumn) must be
    // reversible, and PRESET_ALL must be able to restore it.
    if (isFixedStructuralKey(sourceBook + ":" + sourceCol)) return Promise.resolve();
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
    // streamOpts give the download a progress line and a Cancel: onProgress
    // updates the status pct, the signal aborts the fetch mid-stream. A
    // cancelled load settles silently — no toast, no column, no IDB write
    // (the put happens only after the fetch resolves).
    var myAbort = new AbortController();
    _columnAbort = myAbort;
    return loadQuranBookCSV(sourceBook, {
      signal: myAbort.signal,
      onProgress: function (fraction) { updateColumnStatus(sourceBook, fraction); },
    })
      .then(function (book) {
        // A cancel can land after the body was read but before this settle
        // (the final synchronous parse can't be interrupted) — never commit
        // a column for an aborted load.
        if (myAbort.signal.aborted) return;
        var rows = book.allData;
        var csvHeader = book.headerRow;
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
      .catch(function (err) {
        // User cancel: silent by design. A real failure keeps the error
        // toast — and logs the reason, which the toast deliberately hides.
        if (myAbort.signal.aborted) return;
        console.error("Quran column load failed (" + sourceBook + "):", err);
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
    var hiddenCols = ctx.getHiddenColumns();
    hiddenCols.length = 0;
    for (var h = 0; h < res.hiddenColumns.length; h++) hiddenCols.push(res.hiddenColumns[h]);
    _pendingColumnValues = {};
    rebuildColumnSourceMap(_loadedColMap);
    ctx.rebuildAll();
  }

  function hideLoadedColumn(sourceBook, sourceCol) {
    var key = sourceBook + ":" + sourceCol;
    if (_loadedColMap[key] !== undefined) {
      var idx = _loadedColMap[key];
      var hiddenCols = ctx.getHiddenColumns();
      if (hiddenCols.indexOf(idx) === -1) hiddenCols.push(idx);
      ctx.rebuildAll();
    }
  }
}
