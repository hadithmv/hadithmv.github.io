/**
 * Reader Module
 *
 * Book viewer: loads CSV data, renders card / table / parallel text views,
 * provides infinite scroll, pagination, full-text search, copy-to-clipboard,
 * tashkeel toggle, export (via export.js), and keyboard shortcuts.
 */

import { initializePageWithMetadata, extractTags, addPin, removePin, isPinned, addReadHistory } from "./book-data.js";
import { t, tagLabel, currentLang } from "./i18n.js";
import { normaliseForSearch, parseQuery, compileQuery, rowMatchesQueryNorm, buildNormData, highlightMatches, buildSnippets as buildSnippetsFromSearch, escapeHTML, addSearchHistory, getSearchHistory, removeSearchHistoryItem, clearSearchHistory } from "./search-utils.js";
import { fetchCSV, fetchBookCSVCached } from "./csv.js";
import { isQuranBook, mergeQuranData, loadSurahNames, loadColumnRegistry, getSurahInfo, decorateAyah, isAyahTextColumn, getBookLabel, hasExternalColumns, quranState, initQuranUI, updateQuranNavDisplay, findQuranColIndices, getAyahNoFromRow as getAyahNoFromRowQuran, getRowJuz, getRowSurah, columnFieldClass, columnTdClass, isFootnoteColumn, isArDvTransition, isMatnSharhTransition, classifyColumnLang } from "./quran-ui.js";
import { initExports } from "./export.js";

initializePageWithMetadata(async function (metadata) {
  // ═══════════════════════════════════════════════════════════════
  // SECTIONS (in order):
  //   L16-60    Book loading (standard CSV or Quran merge)
  //   L61-108   Page header, tag badges, language-aware titles
  //   L109-140  Persisted settings (LS wrapper, -HDN column init)
  //   L141-248  Reader state, column toggles, dropdown infrastructure
  //   L249-260  Tashkeel helpers
  //   L261-353  Clipboard formatting (rowText)
  //   L354-398  View mode dropdown (card / table / parallel)
  //   L399-470  Card row renderer (renderRowHTML)
  //   L471-585  Parallel row renderer (renderParallelRowHTML)
  //   L586-645  Chunk + table-row renderers
  //   L646-918  Infinite scroll, pagination, table scrollbar
  //   L919-1080 Search UI (results, history, advanced search)
  //   L1081-1468 Toolbar (tashkeel, share, pin, copy, focus)
  //   L1469-1481 Export (delegated to export.js via initExports ctx)
  //   L1482-1545 Reset view
  //   L1546-1660 Keyboard shortcuts
  //   L1661-1690 Touch swipe
  //   L1691-1849 Progress bar, scroll counter, URL sync, history
  // ═══════════════════════════════════════════════════════════════
  document.title = metadata.titleEN || metadata.bookCode;

  var quranBook = isQuranBook(metadata.bookCode);

  function loadStandardBook() {
    // On-device cache (IndexedDB): repeat visits skip download + parse;
    // metadata.version (registry content hash) guards staleness.
    return fetchBookCSVCached(metadata.bookCode, metadata.version || "", metadata.csvPath)
      .then(function (data) {
        if (data.length === 0) return { data: data, headerRow: null, hasRowNums: false };
        var headerRow = data.shift();
        var firstCol = (headerRow[0] || "").trim();
        var hasRowNums = (firstCol === "#" || firstCol === "");
        return { data: data, headerRow: headerRow, hasRowNums: hasRowNums };
      });
  }

  function loadQuranBook() {
    return Promise.all([loadSurahNames(), loadColumnRegistry()]).then(function () {
      return mergeQuranData(metadata.bookCode).then(function (merged) {
        return { data: merged.allData, headerRow: merged.headerRow, hasRowNums: false };
      });
    });
  }

  (quranBook ? loadQuranBook() : loadStandardBook())
    .then(function (result) {
      // ═══════════════════════════════════════════════════════════════
      // SHARED MUTABLE STATE — every function in this closure reads or
      // writes some of these. Keep them grouped here so you can see what
      // is shared at a glance. New closure variables should either go
      // here (if mutable + shared) or be a local const (if read-only).
      //
      // Convenience aliases (e.g. `var filteredData = STATE.filteredData`)
      // are READ-ONLY — use them for reading but write back to STATE
      // whenever the value changes:  STATE.filteredData = filteredData;
      // ═══════════════════════════════════════════════════════════════
      var STATE = {
        // Data
        allData: null,
        filteredData: null,

        // View
        viewMode: (metadata.bookCode && metadata.bookCode.indexOf("RDF-") === 0 && window.innerWidth > window.MOBILE_BP) ? "table" : "card",

        // Columns
        hiddenColumns: [],
        hideTashkeel: false,
        headerRow: null,
        hasRowNums: false,
      };
      // Read-only from result
      var data = result.data;
      STATE.headerRow = result.headerRow;
      STATE.hasRowNums = result.hasRowNums;
      var headerRow = STATE.headerRow;
      var hasRowNums = STATE.hasRowNums;

      if (data.length === 0) {
        showError("No data found in CSV file: " + metadata.csvPath);
        return;
      }

      // Language-aware page header
      const pageTagsContainer = document.getElementById("pageTags");
      const pageTags = extractTags(metadata.bookCode, metadata);

      function renderPageTags() {
        var lang = currentLang();
        pageTagsContainer.innerHTML = pageTags.map(function (t) {
          var label;
          if (lang === "dv") {
            label = tagLabel(t.code, t.label, "dv") + " · " + tagLabel(t.code, t.label, "ar");
          } else {
            label = tagLabel(t.code, t.label);
          }
          var palClass = (t.palette >= 0) ? ' tag-palette-' + t.palette : '';
          return '<a href="index.html?tags=' + t.code + '" class="tag-badge' + palClass + '" title="Show all ' + tagLabel(t.code, t.label, "en") + ' books">' + label + '</a>';
        }).join("");
      }

      function updatePageHeader() {
        var lang = currentLang();
        var pageTitle = document.getElementById("pageTitle");
        var pageSubtitle = document.getElementById("pageSubtitle");
        var pageSubRow = document.getElementById("pageSubRow");

        if (lang === "en") {
          pageTitle.textContent = metadata.titleEN || metadata.bookCode;
          pageTitle.title = "Book name";
          pageTitle.dir = "ltr";
          pageSubtitle.style.display = "none";
          pageSubRow.style.display = "";
          pageSubRow.style.margin = "0 0 0 0";
        } else if (lang === "dv") {
          pageTitle.textContent = metadata.titleDV || metadata.bookCode;
          pageTitle.title = "Book name";
          pageTitle.dir = "rtl";
          pageSubtitle.textContent = metadata.titleAR || "";
          pageSubtitle.title = "Book name in Arabic";
          pageSubtitle.style.display = "";
          pageSubtitle.dir = "rtl";
          pageSubRow.style.display = "flex";
          pageSubRow.style.margin = "0 0 0 0";
          pageSubRow.dir = "";
        } else if (lang === "ar") {
          pageTitle.textContent = metadata.titleAR || metadata.bookCode;
          pageTitle.title = "Book name";
          pageTitle.dir = "rtl";
          pageSubtitle.style.display = "none";
          pageSubRow.style.display = "";
          pageSubRow.style.margin = "0 0 0 0";
        }
        renderPageTags();
      }

      updatePageHeader();
      document.addEventListener("languagechange", updatePageHeader);

      // Clipboard header — book title line (always DV - AR)
      const clipboardHeader = metadata.titleDV + " - " + metadata.titleAR;

      // ── Settings (persisted) ────────────────────────────────
      const LS = {
        get(key, fallback) {
          try {
            const v = localStorage.getItem("reader:" + key);
            return v !== null ? JSON.parse(v) : fallback;
          } catch (_) {
            return fallback;
          }
        },
        set(key, val) {
          try {
            localStorage.setItem("reader:" + key, JSON.stringify(val));
          } catch (_) {}
        },
      };

      var ROWS_PER_CHUNK = 25;
      STATE.hideTashkeel = LS.get("hideTashkeel", false);
      // Per-book key: a global hiddenColumns list leaks indices from the
      // previous book into the next (e.g. bodyAR stays hidden because column
      // 2 was hidden in the last book). Reset fixes it — now it can't happen.
      STATE.hiddenColumns = LS.get("hiddenColumns:" + metadata.bookCode, []);
      var hideTashkeel = STATE.hideTashkeel;
      var hiddenColumns = STATE.hiddenColumns;

      // ── -HDN convention ──────────────────────────────────────
      // Any CSV column header ending in "-HDN" (case-insensitive) is hidden by
      // default — the reader starts with those columns toggled off. Users can
      // turn them back on via the column dropdown. Used for technical/metadata
      // columns (juzNo-HDN, surahNo-HDN, ayahNo-HDN) and books with -HDN suffix.
      // If you name a new CSV column `something-HDN`, it automatically starts hidden.
      if (headerRow) {
        // Remove stale indices from localStorage that don't exist in current header
        hiddenColumns = hiddenColumns.filter(function (idx) { return idx < headerRow.length; });
        for (let i = 0; i < headerRow.length; i++) {
          var hdr = (headerRow[i] || "").trim().toLowerCase();
          if (hdr.endsWith("-hdn") && hiddenColumns.indexOf(i) === -1) {
            hiddenColumns.push(i);
          }
        }
      }

      // ── Reader state ────────────────────────────────────────
      STATE.allData = data;
      // Books ending with -DSC display rows in reverse (last-to-first)
      if (metadata.bookCode && metadata.bookCode.toUpperCase().endsWith("-DSC")) {
        STATE.allData.reverse();
      }
      var allData = STATE.allData;
      var filteredData = STATE.filteredData = STATE.allData;
      // Precomputed normalised copies of every cell (parallel to allData).
      // Search and snippet building read these instead of re-normalising
      // every cell on every keystroke — the main win on big books.
      // Kept in sync with quran-ui.js column insertion via the ctx bridge.
      var normAllData = buildNormData(allData);

      // DOM refs
      const searchInput = document.getElementById("searchInput");
      const searchClear = document.getElementById("searchClear");
      const searchInfo = document.getElementById("searchInfo");
      const searchResults = document.getElementById("searchResults");
      const advSearchOverlay = document.getElementById("advancedSearchOverlay");
      const advSearchRows = document.getElementById("advancedSearchRows");
      const btnTashkeel = document.getElementById("btnTashkeel");
      const btnCopy = document.getElementById("btnCopy");
      const btnResetReader = document.getElementById("btnResetReader");
      const columnToggles = document.getElementById("columnToggles");
      const columnTogglesGrp = document.getElementById("columnTogglesGroup");
      const readerContent = document.getElementById("readerContent");

      // Init UI controls from persisted state
      if (hideTashkeel) {
        btnTashkeel.classList.add("active");
        readerContent.classList.add("hide-tashkeel");
      }

      // ── Column info ─────────────────────────────────────────
      const maxCols = allData.reduce((m, r) => Math.max(m, r.length), 0);
      function colLabel(idx) {
        if (headerRow && headerRow[idx]) return headerRow[idx];
        return "" + (idx + 1);
      }

      // ── Column toggle buttons ───────────────────────────────
      function buildColumnToggles() {
        columnToggles.innerHTML = "";
        for (let i = 0; i < maxCols; i++) {
          const btn = document.createElement("button");
          btn.className =
            "col-toggle" + (hiddenColumns.indexOf(i) !== -1 ? " off" : "");
          btn.textContent = colLabel(i);
          btn.title = "Toggle column " + colLabel(i);
          btn.addEventListener("click", function () {
            const pos = hiddenColumns.indexOf(i);
            if (pos === -1) {
              hiddenColumns.push(i);
              btn.classList.add("off");
            } else {
              hiddenColumns.splice(pos, 1);
              btn.classList.remove("off");
            }
            LS.set("hiddenColumns:" + metadata.bookCode, hiddenColumns);
            rebuildAll();
          });
          columnToggles.appendChild(btn);
        }
        if (maxCols > 0) columnTogglesGrp.style.display = "";
      }
      buildColumnToggles();

      // Shared: close all dropdowns (columns, export, Quran ayah/juz/content/display, surah overlay)
      var _ddIds = ["columnDropdown", "exportDropdown", "searchHistory", "qrnAyahDropdown", "qrnJuzDropdown", "qrnDisplayDropdown", "qrnSurahOverlay"];

      window.closeAllDropdowns = function () {
        _ddIds.forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.style.display = "none";
        });
      };

      // Shared: open a dropdown positioned below its anchor
      window.openDropdown = function (dd, anchorEl, gap) {
        window.closeAllDropdowns();
        var r = anchorEl.getBoundingClientRect();
        dd.style.position = "fixed";
        dd.style.top = r.bottom + (gap || 4) + "px";
        dd.style.left = r.left + "px";
        dd.style.display = "block";
      };

      // Wire the outside-click-to-close handler for a dropdown
      window.registerDropdown = function (id, dd, anchor) {
        if (_ddIds.indexOf(id) === -1) _ddIds.push(id);
        document.addEventListener("click", function (e) {
          if (!dd.contains(e.target) && e.target !== anchor) {
            dd.style.display = "none";
          }
        });
      };

      // Column dropdown toggle
      var btnColDropdown = document.getElementById("btnColDropdown");
      var columnDropdown = document.getElementById("columnDropdown");
      btnColDropdown.addEventListener("click", function (e) {
        e.stopPropagation();
        if (columnDropdown.style.display === "none" || !columnDropdown.style.display) {
          window.openDropdown(columnDropdown, btnColDropdown);
        } else {
          columnDropdown.style.display = "none";
        }
      });
      window.registerDropdown("columnDropdown", columnDropdown, btnColDropdown);

      // ── Tashkeel helpers ────────────────────────────────────
      // Unicode ranges for Arabic diacritics / tashkeel
      const TASHKEEL_RE = /[ً-ٟؐ-ؚۖ-ۭ]+/g;

      function markupTashkeel(text) {
        return text.replace(TASHKEEL_RE, '<span class="tashkeel">$&</span>');
      }

      // ── Infinite-scroll render ──────────────────────────────
      let loadedStart = -1, loadedEnd = -1;

      function rowText(row, rowNum) {
        // ── Quran clipboard format ──
        if (quranBook) {
          var qt = "";
          var surahNo = parseInt(row[1], 10) || 0; // surahNo-HDN at col 1
          var ayahNo = parseInt(row[2], 10) || 0; // ayahNo-HDN at col 2
          var info = getSurahInfo(surahNo);
          var surahName = info ? info.nameAR : "";
          // Ayah text: find ayahImlai or ayahUthmani column
          for (var ci = 0; ci < row.length; ci++) {
            if (hiddenColumns.indexOf(ci) !== -1) continue;
            var ch = (headerRow && headerRow[ci]) ? headerRow[ci].toLowerCase() : "";
            if (isAyahTextColumn(ch)) {
              var av = (row[ci] != null ? String(row[ci]).trim() : "");
              if (av) {
                var cb = LS.get("quranShowBraces", true);
                var cn = LS.get("quranShowAyahNum", true);
                var cnb = LS.get("quranShowNumBrackets", false);
                qt += decorateAyah(av, ayahNo, cb, cn, cnb);
                break;
              }
            }
          }
          if (qt) qt += "\n";
          qt += "[" + surahName + " " + surahNo + " : " + ayahNo + "]\n\n";
          // Book-specific columns — grouped by source book
          var lastBook = "";
          for (var cj = 0; cj < row.length; cj++) {
            if (hiddenColumns.indexOf(cj) !== -1) continue;
            var ch2 = (headerRow && headerRow[cj]) ? headerRow[cj].toLowerCase().replace(/-hdn$/i, "").trim() : "";
            // Skip base columns
            if (ch2 === "juzno" || ch2 === "surahno" || ch2 === "ayahno" || ch2 === "basmalah" || isAyahTextColumn(ch2)) continue;
            var cv = (row[cj] != null ? String(row[cj]).trim() : "");
            if (!cv) continue;
            var bookLabel = getBookLabel(cj) || metadata.titleDV;
            if (bookLabel && bookLabel !== lastBook) {
              qt += bookLabel + ":\n";
              lastBook = bookLabel;
            }
            qt += cv + "\n\n";
          }
          return qt;
        }
        // ── Standard clipboard format ──
        var t = "";
        if (hasRowNums && hiddenColumns.indexOf(0) === -1) {
          t += `#${rowNum}\n\n`;
        }
        var fields = [];
        var fieldStart = hasRowNums ? 1 : 0;
        for (var i = fieldStart; i < row.length; i++) {
          if (hiddenColumns.indexOf(i) !== -1) continue;
          var v = row[i];
          if (v !== null && v !== undefined && String(v).trim() !== "") {
            var val = String(v).trim().replace(/\r\n/g, "\n").replace(/\n{2,}/g, "\n");
            fields.push({ value: val, index: i });
          }
        }
        for (var i = 0; i < fields.length; i++) {
          var colHeader0 = (headerRow && headerRow[fields[i].index]) ? headerRow[fields[i].index].toLowerCase() : "";
          if (colHeader0.startsWith("foot") && fields.length > 1) {
            t += "ــــــــــــــــــــــــــــــــــــــــــــ\n";
          }
          if (i > 0) {
            var prevHdr0 = (headerRow && headerRow[fields[i - 1].index]) ? headerRow[fields[i - 1].index].toLowerCase() : "";
            if (isArDvTransition(prevHdr0, colHeader0)) { t += "\n"; }
            if (isMatnSharhTransition(prevHdr0, colHeader0)) { t += "· · ·\n\n"; }
          }
          if (!isFootnoteColumn(colHeader0)) {
            if (colHeader0.startsWith("head")) {
              t += fields[i].value + "\n───────────\n\n";
            } else if (colHeader0.startsWith("kitab")) {
              t += "Kitab: " + fields[i].value + "\n\n";
            } else if (colHeader0.startsWith("bab")) {
              t += "  Bab: " + fields[i].value + "\n\n";
            } else {
              t += fields[i].value + "\n\n";
            }
          } else {
            t += fields[i].value + "\n\n";
          }
        }
        return t;
      }

      var viewMode = STATE.viewMode;      // canonical: STATE.viewMode

      function updateViewModeUI() {
        var trigger = document.getElementById("btnViewMode");
        if (trigger) {
          trigger.textContent = t("btnViewMode") + " ▾";
        }
        // Check only the current mode's checkbox, uncheck others
        var cbs = document.querySelectorAll('#viewModeDropdown input[type="checkbox"]');
        for (var ci = 0; ci < cbs.length; ci++) {
          cbs[ci].checked = (cbs[ci].getAttribute("data-mode") === viewMode);
        }
      }

      // ── View mode dropdown ──
      var btnViewMode = document.getElementById("btnViewMode");
      var viewModeDropdown = document.getElementById("viewModeDropdown");
      if (btnViewMode && viewModeDropdown) {
        btnViewMode.addEventListener("click", function (e) {
          e.stopPropagation();
          window.closeAllDropdowns();
          if (viewModeDropdown.style.display === "none" || !viewModeDropdown.style.display) {
            var r = btnViewMode.getBoundingClientRect();
            viewModeDropdown.style.position = "fixed";
            viewModeDropdown.style.top = (r.bottom + 4) + "px";
            viewModeDropdown.style.left = r.left + "px";
            viewModeDropdown.style.display = "block";
            updateViewModeUI();
          } else {
            viewModeDropdown.style.display = "none";
          }
        });
        window.registerDropdown("viewModeDropdown", viewModeDropdown, btnViewMode);
        var modeOptions = viewModeDropdown.querySelectorAll(".view-mode-option");
        for (var mi = 0; mi < modeOptions.length; mi++) {
          modeOptions[mi].addEventListener("click", function (e) {
            e.stopPropagation();
            var mode = this.getAttribute("data-mode");
            if (mode !== viewMode) {
              STATE.viewMode = viewMode = mode;
              updateViewModeUI();
              rebuildAll();
            }
            viewModeDropdown.style.display = "none";
          });
        }
      }
      updateViewModeUI();

      // ── Quran helpers ──────────────────────────────────────
      function getAyahNoFromRow(row) {
        return getAyahNoFromRowQuran(row, headerRow);
      }

      function renderRowHTML(row, rowNum) {
        var h = "";
        if (hasRowNums && hiddenColumns.indexOf(0) === -1) {
          h += `<div class="reader-row-num">#${rowNum}</div>`;
        }
        var fields = [];
        var fieldStart = hasRowNums ? 1 : 0;
        for (var i = fieldStart; i < row.length; i++) {
          if (hiddenColumns.indexOf(i) !== -1) continue;
          var v = row[i];
          if (v !== null && v !== undefined && String(v).trim() !== "") {
            var val = String(v).trim().replace(/\r\n/g, "\n").replace(/\n{2,}/g, "\n");
            fields.push({ value: val, index: i });
          }
        }
        var query = searchInput.value.trim();
        var lastExtBook = "";
        for (var i = 0; i < fields.length; i++) {
          var colIdx = fields[i].index;
          var rawVal = fields[i].value;
          var colHeader = (headerRow && headerRow[colIdx]) ? headerRow[colIdx].toLowerCase() : "";
          // Quran: decorate ayah text columns with braces + ayah number
          var display;
          if (quranBook && isAyahTextColumn(colHeader)) {
            var ayahNo = getAyahNoFromRow(row);
            var showBraces = LS.get("quranShowBraces", true);
            var showAyahNum = LS.get("quranShowAyahNum", true);
            display = markupTashkeel(highlightMatches(decorateAyah(rawVal, ayahNo, showBraces, showAyahNum, LS.get("quranShowNumBrackets", false)), query));
          } else {
            display = markupTashkeel(highlightMatches(rawVal, query));
          }
          // KNSH books: first line of body column is a heading
          if (metadata.bookCode && metadata.bookCode.toUpperCase().startsWith("KNSH-") && colHeader.startsWith("body")) {
            var nlIdx = display.indexOf("\n");
            if (nlIdx !== -1) {
              display = '<span class="knhs-body-header">' + display.slice(0, nlIdx) + '</span>' + display.slice(nlIdx);
            }
          }
          // Quran: insert source-book label when crossing into a new book (only if external books are loaded)
          if (quranBook && hasExternalColumns(metadata.bookCode)) {
            var bookLabel = getBookLabel(colIdx);
            if (bookLabel && bookLabel !== lastExtBook) {
              h += '<div class="reader-quran-book-label">' + bookLabel + ':</div>';
              lastExtBook = bookLabel;
            } else if (!bookLabel) {
              lastExtBook = "";
            }
          }
          if (i > 0) {
            var prevHdr = (headerRow && headerRow[fields[i - 1].index]) ? headerRow[fields[i - 1].index].toLowerCase() : "";
            if (isArDvTransition(prevHdr, colHeader)) {
              h += `<div class="reader-ar-dv-spacer"></div>`;
            }
            if (isMatnSharhTransition(prevHdr, colHeader)) {
              h += `<div class="reader-matn-sharh-separator"></div>`;
            }
          }
          if (isFootnoteColumn(colHeader) && fields.length > 1) {
            h += `<div class="reader-field reader-footnote-divider">ــــــــــــــــــــــــــــــــــــــــــــ</div>`;
            h += `<div class="reader-field reader-footnotes" dir="auto">${display}</div>`;
          } else {
            var fieldClass = "reader-field" + (columnFieldClass(colHeader) ? " " + columnFieldClass(colHeader) : "");
            h += `<div class="${fieldClass}" dir="auto">${display}</div>`;
          }
        }
        return h;
      }

      function renderParallelRowHTML(row, rowNum) {
        var h = "";
        // Row number (neutral — full width above)
        if (hasRowNums && hiddenColumns.indexOf(0) === -1) {
          h += '<div class="reader-row-num">#' + rowNum + '</div>';
        }

        // Collect visible non-empty fields
        var fields = [];
        var fieldStart = hasRowNums ? 1 : 0;
        for (var fi = fieldStart; fi < row.length; fi++) {
          if (hiddenColumns.indexOf(fi) !== -1) continue;
          var fv = row[fi];
          if (fv !== null && fv !== undefined && String(fv).trim() !== "") {
            fields.push({ value: String(fv).trim().replace(/\r\n/g, "\n").replace(/\n{2,}/g, "\n"), index: fi });
          }
        }

        var query = searchInput.value.trim();

        // Helper: classify a column as AR, DV, or neutral
        function classify(colIdx) {
          var hdr = (headerRow && headerRow[colIdx]) ? headerRow[colIdx].toLowerCase() : "";
          return classifyColumnLang(hdr, quranBook);
        }

        // Helper: render one field's display HTML
        function fieldHTML(rawVal, colIdx) {
          var hdr = (headerRow && headerRow[colIdx]) ? headerRow[colIdx].toLowerCase() : "";
          var d;
          if (quranBook && isAyahTextColumn(hdr)) {
            var ayahNo = getAyahNoFromRow(row);
            var showBraces = LS.get("quranShowBraces", true);
            var showAyahNum = LS.get("quranShowAyahNum", true);
            d = markupTashkeel(highlightMatches(decorateAyah(rawVal, ayahNo, showBraces, showAyahNum, LS.get("quranShowNumBrackets", false)), query));
          } else {
            d = markupTashkeel(highlightMatches(rawVal, query));
          }
          if (metadata.bookCode && metadata.bookCode.toUpperCase().startsWith("KNSH-") && hdr.startsWith("body")) {
            var nlIdx = d.indexOf("\n");
            if (nlIdx !== -1) d = '<span class="knhs-body-header">' + d.slice(0, nlIdx) + '</span>' + d.slice(nlIdx);
          }
          return d;
        }

        // Partition fields into AR, DV, neutral (pre/post)
        var arF = [], dvF = [], preN = [], postN = [];
        var seenLang = false;
        for (var pi = 0; pi < fields.length; pi++) {
          var cl = classify(fields[pi].index);
          if (cl === "neutral") {
            (seenLang ? postN : preN).push(fields[pi]);
          } else {
            seenLang = true;
            (cl === "ar" ? arF : dvF).push(fields[pi]);
          }
        }

        var lastExtBook = "";

        // Render a group of fields with optional book labels
        function renderFieldGroup(fg) {
          var gh = "";
          for (var gi = 0; gi < fg.length; gi++) {
            var gIdx = fg[gi].index;
            var gHdr = (headerRow && headerRow[gIdx]) ? headerRow[gIdx].toLowerCase() : "";
            var gDisplay = fieldHTML(fg[gi].value, gIdx);
            // Quran book labels
            if (quranBook && hasExternalColumns(metadata.bookCode)) {
              var gLabel = getBookLabel(gIdx);
              if (gLabel && gLabel !== lastExtBook) {
                gh += '<div class="reader-quran-book-label">' + gLabel + ':</div>';
                lastExtBook = gLabel;
              } else if (!gLabel) { lastExtBook = ""; }
            }
            if (isFootnoteColumn(gHdr) && fg.length > 1) {
              gh += '<div class="reader-field reader-footnote-divider">ــــــــــــــــــــــــــــــــــــــــــــ</div>';
              gh += '<div class="reader-field reader-footnotes" dir="auto">' + gDisplay + '</div>';
            } else {
              var gCls = "reader-field" + (columnFieldClass(gHdr) ? " " + columnFieldClass(gHdr) : "");
              gh += '<div class="' + gCls + '" dir="auto">' + gDisplay + '</div>';
            }
          }
          return gh;
        }

        // Pre-language neutral fields (full width above)
        h += renderFieldGroup(preN);

        // Side-by-side language columns
        // RTL grid: first child → right side, second child → left side
        // User wants DV on right, AR on left
        if (arF.length > 0 || dvF.length > 0) {
          h += '<div class="parallel-columns">';
          // DV column (right — first child in RTL grid)
          h += '<div class="parallel-dv-col">';
          h += dvF.length > 0 ? renderFieldGroup(dvF) : '<div class="parallel-empty"></div>';
          h += '</div>';
          // AR column (left — second child in RTL grid)
          h += '<div class="parallel-ar-col">';
          h += arF.length > 0 ? renderFieldGroup(arF) : '<div class="parallel-empty"></div>';
          h += '</div>';
          h += '</div>';
        }

        // Post-language neutral fields (full width below)
        h += renderFieldGroup(postN);

        return h;
      }

      function renderChunkHTML(startIdx, endIdx) {
        var h = "";
        var renderFn = viewMode === "parallel" ? renderParallelRowHTML : renderRowHTML;
        for (var i = startIdx; i < endIdx && i < filteredData.length; i++) {
          if (i > startIdx) h += `<div class="reader-divider"></div>`;
          var row = filteredData[i];
          var rowNum = hasRowNums ? (row[0] || (i + 1)) : (i + 1);
          h += `<div class="reader-chunk" data-row="${i}">`;
          h += renderFn(row, rowNum);
          h += `</div>`;
        }
        return h;
      }

      function renderTableRows(startIdx, endIdx) {
        var h = "";
        for (var i = startIdx; i < endIdx && i < filteredData.length; i++) {
          var row = filteredData[i];
          h += '<tr class="reader-chunk" data-row="' + i + '">';
          for (var j = 0; j < row.length; j++) {
            if (hiddenColumns.indexOf(j) !== -1) continue;
            var v = (row[j] != null ? String(row[j]).trim() : "");
            var tdHdr = (headerRow && headerRow[j]) ? headerRow[j].toLowerCase() : "";
            var display;
            if (quranBook && isAyahTextColumn(tdHdr)) {
              var ayahNo = getAyahNoFromRow(row);
              var showBraces = LS.get("quranShowBraces", true);
              var showAyahNum = LS.get("quranShowAyahNum", true);
              display = markupTashkeel(highlightMatches(decorateAyah(v, ayahNo, showBraces, showAyahNum, LS.get("quranShowNumBrackets", false)), searchInput.value.trim()));
            } else {
              display = markupTashkeel(highlightMatches(v, searchInput.value.trim()));
            }
            var tdClass = "";
            tdClass = columnTdClass(tdHdr);
            h += '<td dir="auto"' + tdClass + '>' + display + '</td>';
          }
          h += '</tr>';
        }
        return h;
      }

      function loadInitial() {
        var initialRows = viewMode === "table" ? 50 : ROWS_PER_CHUNK * 3;
        var end = Math.min(initialRows, filteredData.length);
        loadedStart = 0;
        loadedEnd = end;
        if (viewMode === "table") {
          var thead = "";
          if (headerRow) {
            thead = "<thead><tr>";
            for (var j = 0; j < headerRow.length; j++) {
              if (hiddenColumns.indexOf(j) !== -1) continue;
              thead += "<th>" + (headerRow[j] || "") + "</th>";
            }
            thead += "</tr></thead>";
          }
          // ── Table DOM structure (IDs referenced by setupTableScroll, appendNext, prependPrev) ──
          // DO NOT rename: #rdfTopScroll, #rdfScrollBack, #rdfScrollFwd, #rdfTableWrap, #rdfBody, #sentinelBottom
          readerContent.innerHTML =
            `<div class="rdf-top-scroll" id="rdfTopScroll"><button class="scroll-arrow" id="rdfScrollBack" title="Back to beginning">▶</button><div class="rdf-top-scroll-inner"><div class="rdf-top-scroll-spacer" id="rdfTopScrollInner"></div></div><button class="scroll-arrow" id="rdfScrollFwd" title="More columns">◀</button></div>` +
            `<div class="rdf-table-wrap" id="rdfTableWrap"><table class="rdf-table">${thead}<tbody id="rdfBody"></tbody></table></div>` +
            `<div id="sentinelBottom" class="reader-sentinel"></div>`;
          document.getElementById("rdfBody").innerHTML = renderTableRows(0, end);
          setupTableScroll();
        } else {
          readerContent.innerHTML =
            `<div id="sentinelTop" class="reader-sentinel"></div>` +
            renderChunkHTML(0, end) +
            `<div id="sentinelBottom" class="reader-sentinel"></div>`;
        }
        updatePagination();
      }

      function buildClipboardText(startIdx, endIdx) {
        var t = "";
        for (var i = startIdx; i < endIdx && i < filteredData.length; i++) {
          if (i > startIdx) t += "\n──────────\n\n";
          var row = filteredData[i];
          var rowNum = hasRowNums ? (row[0] || (i + 1)) : (i + 1);
          t += rowText(row, rowNum);
        }
        return t.trim();
      }

      function expandIfOverflowing() {
        // Defer read to rAF to avoid forced sync layout during row insertion
        requestAnimationFrame(function () {
          var rw = document.getElementById("readerWrapper");
          var rc = document.getElementById("readerContent");
          if (!rw || !rc) return;
          if (rc.scrollWidth > rw.clientWidth) {
            rw.style.maxWidth = (window.innerWidth - 20) + "px";
          }
        });
      }

      // ── Top scrollbar + horizontal scroll setup ──────────────
      function setupTableScroll() {
        var topScrollOuter = document.getElementById("rdfTopScroll");
        var tableWrap = document.getElementById("rdfTableWrap");
        var topSpacer = document.getElementById("rdfTopScrollInner");
        // The scrollbar lives on the inner div (so padding on outer stays clean)
        var topScroll = topScrollOuter ? topScrollOuter.querySelector(".rdf-top-scroll-inner") : null;
        if (!topScroll || !tableWrap) return;

        function getTable() {
          return tableWrap.querySelector(".rdf-table");
        }

        // Compute and apply table width: first col 60px, rest 150px each.
        // If total exceeds wrapper width, table overflows → scrollbar appears.
        function applyTableWidth() {
          var table = getTable();
          if (!table) return 0;
          var visCols = 0;
          if (headerRow) {
            for (var j = 0; j < headerRow.length; j++) {
              if (hiddenColumns.indexOf(j) === -1) visCols++;
            }
          }
          if (visCols === 0) return 0;
          // Estimate: first col 60px, others 150px each (used only for overflow check)
          var colWidth = 60 + (visCols - 1) * 150;
          // Reset to CSS defaults — let table-layout:auto size columns to content
          table.style.width = "";
          var ths = table.querySelectorAll("thead th");
          if (ths.length > 0) {
            ths[0].style.width = "60px"; // row-number column stays narrow
            for (var k = 1; k < ths.length; k++) {
              ths[k].style.width = ""; // let browser size by content
            }
          }
          return colWidth;
        }

        function refreshScrollWidth(colWidth) {
          var table = getTable();
          if (!table || !topSpacer) return;
          // Force overflow width if columns demand it
          var wrapW = tableWrap.clientWidth;
          if (wrapW > 0 && colWidth > wrapW) {
            table.style.width = colWidth + "px";
          }
          var w = parseInt(table.style.width) || table.scrollWidth;
          topSpacer.style.width = (w || table.scrollWidth) + "px";
          // Hide the whole scrollbar row when table fits without overflow
          var needed = table.scrollWidth > tableWrap.clientWidth + 1;
          topScrollOuter.style.display = needed ? "" : "none";
          // Only clip overflow when scrollbar is needed (prevents edge clipping when table fits)
          tableWrap.style.overflowX = needed ? "" : "visible";
          // Adjust th sticky offset: only reserve space when scrollbar is visible
          var ths = table.querySelectorAll("thead th");
          var thTop = needed ? "calc(var(--rdf-header-top, 64px) + 19px)" : "var(--rdf-header-top, 64px)";
          for (var i = 0; i < ths.length; i++) {
            ths[i].style.setProperty("top", thTop);
          }
        }

        function syncTableTransform() {
          var table = getTable();
          if (!table) return;
          // Normalise RTL scroll position to a 0–1 fraction.
          // Chrome: scrollLeft ∈ [0, maxScroll]   Firefox: scrollLeft ∈ [-maxScroll, 0]
          var maxScroll = topScroll.scrollWidth - topScroll.clientWidth;
          if (maxScroll <= 0) { table.style.transform = ""; return; }
          var fraction = Math.abs(topScroll.scrollLeft) / maxScroll;
          var tableOverflow = table.scrollWidth - tableWrap.clientWidth;
          if (tableOverflow <= 0) { table.style.transform = ""; return; }
          var offset = fraction * tableOverflow;
          table.style.transform = "translateX(" + offset + "px)";
        }

        // Apply width first, then set up scroll width (deferred for layout)
        var _colWidth = applyTableWidth();
        requestAnimationFrame(function () {
          refreshScrollWidth(_colWidth);
        });

        // Scroll the table when the top scrollbar moves
        topScroll.addEventListener("scroll", syncTableTransform);

        // Arrow buttons: smooth-scroll one column width per click
        var COL_STEP = 150;
        function smoothScrollBy(delta) {
          var start = topScroll.scrollLeft;
          var target = start + delta;
          var duration = 250; // ms
          var startTime = performance.now();
          function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
          function animate(now) {
            var elapsed = now - startTime;
            var t = Math.min(elapsed / duration, 1);
            topScroll.scrollLeft = start + delta * easeOut(t);
            if (t < 1) requestAnimationFrame(animate);
          }
          requestAnimationFrame(animate);
        }
        var scrollFwdBtn = document.getElementById("rdfScrollFwd");
        var scrollBackBtn = document.getElementById("rdfScrollBack");
        if (scrollFwdBtn) {
          scrollFwdBtn.addEventListener("click", function () {
            smoothScrollBy(-COL_STEP);
          });
        }
        if (scrollBackBtn) {
          scrollBackBtn.addEventListener("click", function () {
            smoothScrollBy(COL_STEP);
          });
        }

        // Shift+wheel on the wrapper → horizontal scroll
        tableWrap.addEventListener("wheel", function (e) {
          if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            e.preventDefault();
            var amount = e.deltaX || e.deltaY;
            topScroll.scrollLeft += amount;
          }
        }, { passive: false });

        // Refresh when columns are toggled
        window.__rdfRefreshScrollWidth = function () {
          var cw = applyTableWidth();
          requestAnimationFrame(function () {
            refreshScrollWidth(cw);
          });
        };
      }

      function appendNext() {
        if (loadedEnd >= filteredData.length) return;
        var chunkSize = viewMode === "table" ? 30 : ROWS_PER_CHUNK;
        var nextEnd = Math.min(loadedEnd + chunkSize, filteredData.length);
        if (viewMode === "table") {
          var body = document.getElementById("rdfBody");
          body.insertAdjacentHTML("beforeend", renderTableRows(loadedEnd, nextEnd));
          requestAnimationFrame(function () {
            if (window.__rdfRefreshScrollWidth) window.__rdfRefreshScrollWidth();
          });
        } else {
          var sentinel = document.getElementById("sentinelBottom");
          sentinel.insertAdjacentHTML("beforebegin", `<div class="reader-divider"></div>` + renderChunkHTML(loadedEnd, nextEnd));
        }
        loadedEnd = nextEnd;
        expandIfOverflowing();
      }

      function prependPrev() {
        if (loadedStart <= 0) return;
        var chunkSize = viewMode === "table" ? 30 : ROWS_PER_CHUNK;
        var nextStart = Math.max(0, loadedStart - chunkSize);
        if (viewMode === "table") {
          var body = document.getElementById("rdfBody");
          body.insertAdjacentHTML("afterbegin", renderTableRows(nextStart, loadedStart));
          requestAnimationFrame(function () {
            if (window.__rdfRefreshScrollWidth) window.__rdfRefreshScrollWidth();
          });
        } else {
          var prevH = readerContent.scrollHeight;
          var sentinel = document.getElementById("sentinelTop");
          sentinel.insertAdjacentHTML("afterend", renderChunkHTML(nextStart, loadedStart) + `<div class="reader-divider"></div>`);
          readerContent.scrollTop += readerContent.scrollHeight - prevH;
        }
        loadedStart = nextStart;
      }

      function visiblePageIndex() {
        // Fast path: use elementFromPoint at viewport centre (O(1) vs O(n) scan)
        var viewMid = window.innerHeight / 2;
        var el = document.elementFromPoint(window.innerWidth / 2, viewMid);
        if (el) {
          var row = el.closest('.reader-chunk');
          if (row && row.dataset.row) return parseInt(row.dataset.row);
        }
        // Fallback: linear scan (rarely reached)
        var chunks = readerContent.querySelectorAll(".reader-chunk");
        if (chunks.length === 0) return 0;
        var best = 0, bestTop = Infinity;
        var viewH = window.innerHeight;
        for (var i = 0; i < chunks.length; i++) {
          var cr = chunks[i].getBoundingClientRect();
          var mid = cr.top + cr.height / 2;
          var dist = Math.abs(mid - viewMid);
          if (dist < bestTop) { bestTop = dist; best = parseInt(chunks[i].dataset.row); }
          // Early exit: once we've passed the viewport, remaining rows are further away
          if (cr.top > viewH && dist > bestTop) break;
        }
        return best;
      }

      // IntersectionObserver for auto-load
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          if (e.target.id === "sentinelBottom") appendNext();
          if (e.target.id === "sentinelTop") prependPrev();
        });
      }, { rootMargin: "300px" });

      function observeSentinels() {
        var st = document.getElementById("sentinelTop");
        var sb = document.getElementById("sentinelBottom");
        if (st) io.observe(st);
        if (sb) io.observe(sb);
      }

      // Rebuild entire content (used after search / settings change)
      function rebuildAll() {
        if (filteredData.length === 0) {
          readerContent.innerHTML = "";
          loadedStart = loadedEnd = -1;
          updatePagination();
          return;
        }
        loadInitial();
        observeSentinels();
      }

      // ── Pagination UI ───────────────────────────────────────
      function pageSelectHTML(current, total) {
        if (total <= 1) return "";
        // Number input is O(1) — a <select> with one <option> per row is O(n) and
        // kills performance on large books (5 000+ <option> elements rendered twice).
        var w = Math.max(58, String(total).length * 18 + 10);
        return `<span class="page-of-label">${total} / </span><input type="number" class="page-strip-sel toolbar-select" style="width:${w}px;text-align:center;text-align-last:center" min="1" max="${total}" value="${current}" autocomplete="off">`;
      }

      var _lastPagUpdate = 0;
      var _lastPagCur = -1;
      var _lastPagTotal = -1;
      function updatePagination() {
        var now = performance.now();
        if (now - _lastPagUpdate < 120) return; // throttle to ~8 fps — enough for page indicator
        _lastPagUpdate = now;

        const total = filteredData.length;
        const visibleRow = visiblePageIndex();
        const cur = visibleRow + 1; // 1-based row number

        // Skip DOM updates if nothing changed
        if (cur === _lastPagCur && total === _lastPagTotal) return;
        _lastPagCur = cur;
        _lastPagTotal = total;

        // Sync Quran nav with scroll position
        if (quranBook && visibleRow >= 0 && visibleRow < filteredData.length) {
          var scrollRow = filteredData[visibleRow];
          findQuranColIndices(headerRow);
          var scrollSurah = getRowSurah(scrollRow, headerRow);
          var scrollJuz = getRowJuz(scrollRow, headerRow);
          if (scrollSurah !== quranState.currentSurah) {
            quranState.currentSurah = scrollSurah;
            quranState.currentAyah = 1;
            var info = getSurahInfo(scrollSurah);
            if (info) document.getElementById("qrnAyahInput").max = info.ayahCount;
          }
          quranState.currentJuz = scrollJuz;
          var ayahNo = getAyahNoFromRowQuran(scrollRow, headerRow);
          if (ayahNo > 0) quranState.currentAyah = ayahNo;
          updateQuranNavDisplay();
        }

        var atFirst = visibleRow === 0;
        var atLast = visibleRow >= filteredData.length - 1;
        [
          "firstBtn",
          "prevBtn",
          "nextBtn",
          "lastBtn",
        ].forEach(function (id, i) {
          document.getElementById(id).disabled = i < 2 ? atFirst : atLast;
        });

        // While the user is typing in the page strip, DON'T rebuild it —
        // replacing the input destroys focus and wipes the typed digits
        // (focusing the box can itself trigger a scroll → updatePagination).
        var stripFocused = document.activeElement &&
          document.activeElement.classList &&
          document.activeElement.classList.contains("page-strip-sel");
        if (stripFocused) return;

        var selHTML = pageSelectHTML(cur, total);
        var label = t("pageOf");
        document.getElementById("pageNumbers").innerHTML = selHTML;
        var pl = document.getElementById("pageLabel");
        if (pl) pl.textContent = label;

        // Wire page strip selects
        document.querySelectorAll(".page-strip-sel").forEach(function (psi) {
          if (String(psi.value) !== String(cur)) psi.value = cur;
          // No arrow stepping in the input — it is for typing a target page;
          // the arrow keys belong to reading navigation (handled globally)
          psi.addEventListener("keydown", function (e) {
            if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault();
            }
          });
          psi.addEventListener("change", function () {
            var v = parseInt(this.value, 10);
            if (!isNaN(v) && v >= 1) goTo(v - 1);
          });
        });
      }

      function updateScrollPadding() {
        var topBar = document.getElementById("topBar");
        var panel = document.getElementById("collapsibleReaderPanel");
        var offset = (topBar ? topBar.offsetHeight : 62) + (panel ? panel.offsetHeight : 0);
        document.documentElement.style.scrollPaddingTop = offset + "px";
      }
      function goTo(rowIdx) {
        if (filteredData.length === 0) return;
        if (rowIdx < 0) rowIdx = 0;
        if (rowIdx >= filteredData.length) rowIdx = filteredData.length - 1;
        // Ensure row is loaded
        while (rowIdx < loadedStart) prependPrev();
        while (rowIdx >= loadedEnd) appendNext();
        updateScrollPadding();
        var el = readerContent.querySelector('.reader-chunk[data-row="' + rowIdx + '"]');
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        updatePagination();
      }

      // ── Search ──────────────────────────────────────────────
      let selectedResultIdx = -1; // index within searchResults DOM children


      function buildSnippets(row, q, compiled, normRow) {
        var parsed = compiled || parseQueryWithMode(q);
        return buildSnippetsFromSearch(row, parsed, q, normRow);
      }

      function buildAdvResultsHTML(query, rows, realIdxMap) {
        var MAX = 30;
        var q = query.trim();
        if (!q || rows.length === 0) return "";
        // Compile once for the whole result set — not once per row
        var compiled = parseQueryWithMode(q);
        var html = ""; var count = 0;
        for (var i = 0; i < rows.length && count < MAX; i++) {
          var row = rows[i];
          var rowNum = row[0] || (realIdxMap[i] + 1);
          var snippets = buildSnippets(row, q, compiled, normAllData[realIdxMap[i]]);
          if (snippets.length === 0) {
            // Fallback: show first non-empty cell
            for (var c = 0; c < row.length; c++) {
              if (row[c] != null && String(row[c]).trim()) {
                snippets = [highlightMatches(String(row[c]).trim().slice(0, 200), q)];
                break;
              }
            }
          }
          for (var s = 0; s < snippets.length && count < MAX; s++) {
            html += '<div class="search-result" data-real="' + realIdxMap[i] + '"><span class="search-result-num">#' + rowNum + '</span><span class="search-result-snippet">' + snippets[s] + '</span></div>';
            count++;
          }
        }
        return html;
      }

      function buildResultsHTML(query) {
        const MAX = 50;
        const q = query.trim();
        if (!q || filteredData.length === 0) return "";
        // Compile once for the whole result set — not once per row
        var compiled = parseQueryWithMode(q);
        let html = "";
        let count = 0;
        for (let i = 0; i < filteredData.length && count < MAX; i++) {
          const row = filteredData[i];
          const rowNum = row[0] || allData.indexOf(row) + 1;
          // filteredData is allData normally, but the Quran surah filter
          // swaps in a subset — index alignment only holds for allData.
          var normRow = filteredData === allData ? normAllData[i] : normAllData[allData.indexOf(row)];
          var snippets = buildSnippets(row, q, compiled, normRow);
          for (var s = 0; s < snippets.length && count < MAX; s++) {
            html +=
              '<div class="search-result" data-idx="' +
              i +
              '">' +
              '<span class="search-result-num">#' +
              rowNum +
              "</span>" +
              '<span class="search-result-snippet">' +
              snippets[s] +
              "</span>" +
              "</div>";
            count++;
          }
        }
        if (count >= MAX && count < filteredData.length) {
          html +=
            '<div class="search-result" style="color:var(--color-text-subtle);cursor:default">' +
            t("andMore") +
            "</div>";
        }
        return html;
      }

      function updateSearchResults(query) {
        searchResults.innerHTML = buildResultsHTML(query);
        searchResults.style.display =
          query.trim() && filteredData.length > 0 ? "" : "none";
        selectedResultIdx = -1;
        // Wire clicks
        searchResults
          .querySelectorAll(".search-result[data-idx]")
          .forEach(function (el) {
            el.addEventListener("click", function () {
              goTo(parseInt(this.dataset.idx));
              searchInput.blur();
            });
          });
      }

      function applySearch(query) {
        clearTimeout(_searchDebounceTimer); // don't re-run a stale keystroke
        var q = query.trim();
        if (!q) {
          filteredData = allData;
          searchClear.style.display = "none";
          searchInfo.style.display = "none";
          searchResults.style.display = "none";
          rebuildAll();
          return;
        }

        var compiled = compileQuery(parseQueryWithMode(q));
        var tempFiltered = allData.filter(function (row, ri) {
          return rowMatchesQueryNorm(row, normAllData[ri], compiled);
        });

        addSearchHistory(q);
        searchClear.style.display = "";
        searchInfo.style.display = "";
        searchInfo.textContent =
          tempFiltered.length === 0
            ? t("noResults")
            : t("resultCount") + ": " + tempFiltered.length;
        if (tempFiltered.length === 0) {
          readerContent.innerHTML =
            '<div class="reader-no-results">' + t("noMatchesMsg") + ': "' +
            query +
            '"</div>';
          searchResults.style.display = "none";
            loadedStart = loadedEnd = -1;
            updatePagination();
          } else {
            // Show results without filtering — clicking jumps to real row
            var realIdxMap = tempFiltered.map(function(r) { return allData.indexOf(r); });
            searchResults.innerHTML = buildAdvResultsHTML(query, tempFiltered, realIdxMap);
            searchResults.style.display = "";
            selectedResultIdx = -1;
            searchResults.querySelectorAll(".search-result[data-real]").forEach(function (el) {
              el.addEventListener("click", function () {
                filteredData = allData;
                searchInput.value = query;
                rebuildAll();
                setTimeout(function () { goTo(parseInt(el.dataset.real)); }, 150);
                searchInput.blur();
              });
            });
          }
        }

      var wholeWordMode = false;
      var btnWholeWord = document.getElementById("btnWholeWord");

      // Wrapper around parseQuery to respect whole-word toggle
      function parseQueryWithMode(query) {
        var result = parseQuery(query);
        if (wholeWordMode) {
          result.include.forEach(function (t) { t.wholeWord = true; });
          result.exclude.forEach(function (t) { t.wholeWord = true; });
        }
        return result;
      }

      btnWholeWord.style.display = "";
      btnWholeWord.addEventListener("click", function () {
        wholeWordMode = !wholeWordMode;
        btnWholeWord.classList.toggle("active", wholeWordMode);
        if (searchInput.value.trim()) applySearch(searchInput.value);
      });

      // Search history dropdown
      var searchHistoryEl = document.getElementById("searchHistory");

      function renderSearchHistory() {
        var history = getSearchHistory();
        if (history.length === 0) {
          searchHistoryEl.style.display = "none";
          return;
        }
        // Position below the search bar, full width
        window.openDropdown(searchHistoryEl, searchInput, 0);
        var sbRect = searchInput.getBoundingClientRect();
        searchHistoryEl.style.right = (window.innerWidth - sbRect.right) + "px";
        searchHistoryEl.innerHTML = history.map(function (h, i) {
          return '<div class="search-history-item" data-idx="' + i + '">' +
            '<span class="hist-text">' + escapeHTML(h) + '</span>' +
            '<span class="hist-remove" data-idx="' + i + '">✕</span></div>';
        }).join("") +
        '<div class="search-history-clear">' + t("searchClearHistory") + '</div>';
        searchHistoryEl.style.display = "";
        // Wire clicks
        searchHistoryEl.querySelectorAll(".search-history-item[data-idx]").forEach(function (item) {
          item.addEventListener("click", function (e) {
            if (e.target.classList.contains("hist-remove")) return;
            searchInput.value = history[parseInt(this.dataset.idx)];
            applySearch(searchInput.value);
            searchHistoryEl.style.display = "none";
          });
        });
        searchHistoryEl.querySelectorAll(".hist-remove").forEach(function (x) {
          x.addEventListener("click", function (e) {
            e.stopPropagation();
            removeSearchHistoryItem(parseInt(this.dataset.idx));
            renderSearchHistory();
          });
        });
        // Clear-all button
        var clearAll = searchHistoryEl.querySelector(".search-history-clear");
        if (clearAll) clearAll.addEventListener("click", function () {
          clearSearchHistory();
          searchHistoryEl.style.display = "none";
        });
      }

      searchInput.addEventListener("focus", function () {
        if (!this.value.trim()) renderSearchHistory();
        else searchResults.style.display = "";
      });
      // Debounce: one full scan per pause in typing, not one per keystroke.
      // applySearch() clears any pending timer, so explicit applies (clear
      // button, history click, whole-word toggle) can't be raced by a stale one.
      var _searchDebounceTimer = null;
      searchInput.addEventListener("input", function () {
        searchHistoryEl.style.display = "none";
        clearTimeout(_searchDebounceTimer);
        var val = this.value;
        _searchDebounceTimer = setTimeout(function () { applySearch(val); }, 120);
      });
      searchClear.addEventListener("click", function () {
        searchInput.value = "";
        applySearch("");
        searchInput.focus();
      });
      // Close results when clicking outside
      document.addEventListener("click", function (e) {
        if (btnWholeWord.contains(e.target) || btnAdvancedSearch.contains(e.target)) return;
        if (!searchResults.contains(e.target) && e.target !== searchInput) {
          searchResults.style.display = "none";
        }
      });
      // Re-open when focusing search with an active query
      searchInput.addEventListener("focus", function () {
        if (this.value.trim() && filteredData.length > 0) {
          updateSearchResults(this.value);
        }
      });

      // ── Advanced Search ────────────────────────────────────
      var OPERATORS = [
        { id: "equals", fn: function(cellVal, q) { return cellVal === q; }, needsValue: true },
        { id: "not", fn: function(cellVal, q) { return cellVal !== q; }, needsValue: true },
        { id: "starts", fn: function(cellVal, q) { return cellVal.indexOf(q) === 0; }, needsValue: true },
        { id: "notStarts", fn: function(cellVal, q) { return cellVal.indexOf(q) !== 0; }, needsValue: true },
        { id: "contains", fn: function(cellVal, q) { return cellVal.indexOf(q) !== -1; }, needsValue: true },
        { id: "notContains", fn: function(cellVal, q) { return cellVal.indexOf(q) === -1; }, needsValue: true },
        { id: "ends", fn: function(cellVal, q) { return cellVal.endsWith(q); }, needsValue: true },
        { id: "notEnds", fn: function(cellVal, q) { return !cellVal.endsWith(q); }, needsValue: true },
        { id: "empty", fn: function(cellVal) { return cellVal === ""; }, needsValue: false },
        { id: "notEmpty", fn: function(cellVal) { return cellVal !== ""; }, needsValue: false },
      ];

      function renderConditionRow(condition, idx) {
        var colOpts = "";
        for (var i = 0; i < maxCols; i++) {
          colOpts += '<option value="' + i + '"' + (condition.col === i ? ' selected' : '') + '>' + colLabel(i) + '</option>';
        }
        var opOpts = "";
        OPERATORS.forEach(function(op) {
          opOpts += '<option value="' + op.id + '"' + (condition.op === op.id ? ' selected' : '') + '>' + t("cond" + op.id.charAt(0).toUpperCase() + op.id.slice(1)) + '</option>';
        });
        var needVal = OPERATORS.find(function(o){return o.id===condition.op;});
        var valDisplay = (needVal && needVal.needsValue === false) ? 'style="display:none"' : '';
        var logicHTML = idx === 0 ? '' : '<select class="adv-logic-select" data-idx="' + idx + '" data-field="logic" title="Combine with previous condition"><option value="AND"' + (condition.logic==='AND'?' selected':'') + '>' + t("advLogicAND") + '</option><option value="OR"' + (condition.logic==='OR'?' selected':'') + '>' + t("advLogicOR") + '</option></select>';
        return '<div class="adv-search-row" data-idx="' + idx + '">' +
          logicHTML +
          '<select data-field="col" title="Column to search in">' + colOpts + '</select>' +
          '<select data-field="op" title="Match type">' + opOpts + '</select>' +
          '<input data-field="val" value="' + (condition.val||'') + '" placeholder="' + t("advValue") + '" title="Text to search for" ' + valDisplay + ' />' +
          '<button class="adv-remove-btn" data-i18n="advRemove" title="Remove this condition">✕</button>' +
          '</div>';
      }

      var advConditions = [];
      function addCondition() {
        advConditions.push({ col: 0, op: "contains", val: "", logic: "AND" });
        renderAdvancedSearch();
      }
      function removeCondition(idx) {
        advConditions.splice(idx, 1);
        renderAdvancedSearch();
      }
      function renderAdvancedSearch() {
        if (advConditions.length === 0) addCondition();
        advSearchRows.innerHTML = advConditions.map(function(c, i) { return renderConditionRow(c, i); }).join("");
        // Wire events
        advSearchRows.querySelectorAll(".adv-search-row").forEach(function(row) {
          var idx = parseInt(row.dataset.idx);
          row.querySelector("select[data-field=col]").addEventListener("change", function(){ advConditions[idx].col = parseInt(this.value); });
          row.querySelector("select[data-field=op]").addEventListener("change", function(){
            advConditions[idx].op = this.value;
            var opVal = this.value;
            var needVal = OPERATORS.find(function(o){return o.id===opVal;});
            var input = row.querySelector("input[data-field=val]");
            input.style.display = (needVal && needVal.needsValue === false) ? "none" : "";
          });
          row.querySelector("input[data-field=val]").addEventListener("input", function(){ advConditions[idx].val = this.value; });
          row.querySelector("select[data-field=logic]") && row.querySelector("select[data-field=logic]").addEventListener("change", function(){ advConditions[idx].logic = this.value; });
          row.querySelector(".adv-remove-btn").addEventListener("click", function(){ removeCondition(idx); });
        });
      }

      function applyAdvancedSearch() {
        var rows = allData; // always filter against full data
        // Normalise each condition's value once — not once per row
        var normQs = advConditions.map(function (c) { return normaliseForSearch(c.val || ""); });
        var result = rows.filter(function(row, ri) {
          var normRow = normAllData[ri];
          // Evaluate all conditions with AND/OR logic
          var matches = advConditions.map(function(c, ci) {
            var ncell = (normRow && normRow[c.col] != null) ? normRow[c.col] : "";
            var op = OPERATORS.find(function(o){return o.id===c.op;});
            if (!op) return true;
            if (op.needsValue === false) return op.fn(ncell);
            return op.fn(ncell, normQs[ci]);
          });
          // Combine: first condition sets the baseline, subsequent use logic
          var result = matches[0];
          for (var i = 1; i < matches.length; i++) {
            if (advConditions[i].logic === "AND") result = result && matches[i];
            else result = result || matches[i];
          }
          return result;
        });
        // Show results inline — clicking jumps to row in full dataset
        var tempFiltered = result;
        advSearchOverlay.classList.remove("open");
        if (tempFiltered.length === 0) {
          searchInfo.style.display = "";
          searchInfo.textContent = t("noResults");
          searchClear.style.display = "";
          readerContent.innerHTML = '<div class="reader-no-results">' + t("noMatchesMsg") + '</div>';
          loadedStart = loadedEnd = -1;
          updatePagination();
        } else {
          searchInfo.style.display = "";
          searchInfo.textContent = t("resultCount") + ": " + tempFiltered.length;
          searchClear.style.display = "";
          var realIdxMap = tempFiltered.map(function(r) { return allData.indexOf(r); });
          var q = advConditions.length > 0 ? advConditions[0].val : "";
          var resHTML = q ? buildAdvResultsHTML(q, tempFiltered, realIdxMap) : "";
          if (!resHTML) {
            var limit = Math.min(tempFiltered.length, 30);
            for (var i = 0; i < limit; i++) {
              var row = tempFiltered[i];
              var rowNum = row[0] || (realIdxMap[i] + 1);
              var snip = String(row[1] || row[0] || "").slice(0, 120);
              resHTML += '<div class="search-result" data-real="' + realIdxMap[i] + '"><span class="search-result-num">#' + rowNum + '</span><span class="search-result-snippet">' + snip + '</span></div>';
            }
          }
          readerContent.innerHTML = '<div class="search-results" style="display:block;max-height:none;position:static;margin-bottom:16px">' + resHTML + '</div>';
          loadedStart = loadedEnd = -1;
          updatePagination();
          var resultEls = readerContent.querySelectorAll(".search-result[data-real]");
          resultEls.forEach(function (el) {
            el.addEventListener("click", function (e) {
              e.stopPropagation();
              var targetRow = parseInt(el.dataset.real);
              var sq = advConditions.length > 0 ? (advConditions[0].val || "") : "";
              searchInput.value = sq;
              filteredData = allData;
              loadInitial();
              observeSentinels();
              setTimeout(function () { goTo(targetRow); }, 150);
              searchInput.blur();
            });
          });
        }
      }

      // Open advanced search
      document.getElementById("btnAdvancedSearch").addEventListener("click", function () {
        renderAdvancedSearch();
        advSearchOverlay.classList.add("open");
      });
      document.getElementById("advancedSearchClose").addEventListener("click", function () {
        advSearchOverlay.classList.remove("open");
      });
      advSearchOverlay.addEventListener("click", function (e) { if (e.target === advSearchOverlay) advSearchOverlay.classList.remove("open"); });
      document.getElementById("btnAddCondition").addEventListener("click", addCondition);
      document.getElementById("btnApplyAdvancedSearch").addEventListener("click", applyAdvancedSearch);
      document.getElementById("btnClearAdvancedSearch").addEventListener("click", function () {
        advConditions = [];
        renderAdvancedSearch();
      });

      // ── Toolbar: tashkeel toggle ────────────────────────────
      btnTashkeel.addEventListener("click", function () {
        hideTashkeel = !hideTashkeel;
        LS.set("hideTashkeel", hideTashkeel);
        if (hideTashkeel) {
          readerContent.classList.add("hide-tashkeel");
          btnTashkeel.classList.add("active");
        } else {
          readerContent.classList.remove("hide-tashkeel");
          btnTashkeel.classList.remove("active");
        }
        // Re-render to apply/remove markup
        if (filteredData.length > 0) rebuildAll();
      });

      // ── Toolbar: share ─────────────────────────────────────
      document.getElementById("btnShare").addEventListener("click", function () {
        var vRow = visiblePageIndex();
        var url = window.location.origin + window.location.pathname + "?book=" + metadata.bookCode + "&row=" + (vRow + 1);
        window.copyToClipboard(url, "toastShared");
      });

      // ── Toolbar: pin toggle ──────────────────────────────────
      var btnBookmark = document.getElementById("btnBookmark");
      function updateBookmarkButton() {
        var pinned = isPinned(metadata.bookCode);
        if (pinned) {
          btnBookmark.classList.add("active");
          btnBookmark.innerHTML = t("btnBookmarkPinned");
        } else {
          btnBookmark.classList.remove("active");
          btnBookmark.innerHTML = t("btnBookmarkText");
        }
        btnBookmark.title = pinned ? "Remove bookmark (Alt+P)" : "Bookmark current page (Alt+P)";
      }
      function pinLabel(vRow) {
        if (!quranBook || filteredData.length === 0) return null;
        var row = filteredData[vRow - 1];
        if (!row) return null;
        var surahNo = parseInt(row[1], 10) || 0;
        var ayahNo = parseInt(row[2], 10) || 0;
        var info = getSurahInfo(surahNo);
        var surahName = info ? info.nameAR : "";
        return surahName + " " + ayahNo + ":" + surahNo;
      }
      btnBookmark.addEventListener("click", function () {
        var vRow = visiblePageIndex() + 1;
        if (isPinned(metadata.bookCode)) {
          removePin(metadata.bookCode);
          showToast(t("toastUnpinned"));
        } else {
          var ok = addPin(metadata.bookCode, vRow, pinLabel(vRow));
          showToast(ok ? t("toastPinned") : t("toastPinned"));
        }
        updateBookmarkButton();
      });
      updateBookmarkButton();

      // ── Toolbar: copy to clipboard ──────────────────────────
      btnCopy.addEventListener("click", function () {
        var vRow = visiblePageIndex();
        var body = buildClipboardText(vRow, vRow + 1);
        var text = quranBook ? body : (clipboardHeader + "\n\n" + body);
        if (!text.trim()) return;
        window.copyToClipboard(text, "toastCopied", "toastCopyFailed");
      });


      // ── Toolbar: focus mode ──────────────────────────────────
      var btnFocus = document.getElementById("btnFocus");
      function updateRdfHeaderTop() {
        requestAnimationFrame(function () {
          var topBar = document.getElementById("topBar");
          var chrome = document.getElementById("collapsibleReaderPanel");
          var top = (topBar ? topBar.offsetHeight : 62);
          if (chrome && chrome.offsetHeight > 0) top += chrome.offsetHeight;
          document.documentElement.style.setProperty("--rdf-header-top", top + "px");
        });
      }
      // Reader-specific post-focus recalculation
      window.addEventListener("focuschange", function () {
        setTimeout(function () { updateRdfHeaderTop(); updateScrollPadding(); }, 350);
      });
      btnFocus.addEventListener("click", function () {
        window.setFocus(!document.documentElement.hasAttribute("data-focus"));
      });

      // ── Toolbar: export ─────────────────────────────────────
      initExports({
        allData: allData,
        headerRow: headerRow,
        hasRowNums: hasRowNums,
        metadata: metadata,
        pageTags: pageTags,
        buildClipboardText: buildClipboardText,
        visiblePageIndex: visiblePageIndex,
        t: t,
      });

      // ── Toolbar: reset view ─────────────────────────────────
      // Shared reset block — used by the toolbar Reset button and by the
      // settings-modal "Reset settings" (dispatches the readerReset event).
      function resetReaderDefaults() {
        // Clear search
        searchInput.value = "";
        applySearch("");
        // Reset to -HDN convention only
        hiddenColumns = [];
        if (headerRow) {
          for (var i = 0; i < headerRow.length; i++) {
            if ((headerRow[i] || "").toLowerCase().endsWith("-hdn")) hiddenColumns.push(i);
          }
        }
        LS.set("hiddenColumns:" + metadata.bookCode, hiddenColumns);
        buildColumnToggles();
        // Show tashkeel
        hideTashkeel = false;
        LS.set("hideTashkeel", false);
        btnTashkeel.classList.remove("active");
        readerContent.classList.remove("hide-tashkeel");
        // Reset Quran display settings
        if (quranBook) {
          LS.set("quranShowBraces", true);
          LS.set("quranShowAyahNum", true);
          LS.set("quranShowNumBrackets", false);
          var cb;
          if ((cb = document.getElementById("qrnToggleBraces"))) cb.checked = true;
          if ((cb = document.getElementById("qrnToggleAyahNum"))) cb.checked = true;
          if ((cb = document.getElementById("qrnToggleNumBrackets"))) cb.checked = false;
          var row = document.getElementById("qrnNumBracketsRow");
          if (row) row.style.display = (document.getElementById("qrnToggleBraces").checked && document.getElementById("qrnToggleAyahNum").checked) ? "" : "none";
        }
        // Exit focus mode
        window.setFocus(false);
        rebuildAll();
      }

      btnResetReader.addEventListener("click", function () {
        // Reset view mode to default for this book
        STATE.viewMode = viewMode = (metadata.bookCode && metadata.bookCode.indexOf("RDF-") === 0 && window.innerWidth > window.MOBILE_BP) ? "table" : "card";
        updateViewModeUI();
        resetReaderDefaults();
      });

      // ── Navigation: buttons ─────────────────────────────────
      [
        "firstBtn",
        "prevBtn",
        "nextBtn",
        "lastBtn",
      ].forEach(function (id) {
        const delta =
          id.indexOf("first") === 0
            ? -1e9
            : id.indexOf("prev") === 0
              ? -1
              : id.indexOf("next") === 0
                ? 1
                : 1e9;
        document.getElementById(id).addEventListener("click", function () {
          if (delta === -1e9) goTo(0);
          else if (delta === 1e9) goTo(filteredData.length - 1);
          else goTo(visiblePageIndex() + delta);
        });
      });

      // ── Navigation: page strip input handled in updatePagination ─

      // ── Keyboard ────────────────────────────────────────────
      document.addEventListener("keydown", function onKey(e) {
        // Search-results navigation (when search input is focused)
        if (document.activeElement === searchInput) {
          var items = searchResults.querySelectorAll(
            ".search-result[data-idx]",
          );
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (items.length === 0) return;
            if (e.key === "ArrowDown")
              selectedResultIdx = Math.min(
                selectedResultIdx + 1,
                items.length - 1,
              );
            else selectedResultIdx = Math.max(selectedResultIdx - 1, 0);
            items.forEach(function (el, i) {
              el.classList.toggle("active", i === selectedResultIdx);
            });
            if (selectedResultIdx >= 0)
              items[selectedResultIdx].scrollIntoView({ block: "nearest" });
            return;
          }
          if (
            e.key === "Enter" &&
            selectedResultIdx >= 0 &&
            items[selectedResultIdx]
          ) {
            e.preventDefault();
            goTo(parseInt(items[selectedResultIdx].dataset.idx));
            searchInput.blur();
            return;
          }
          if (e.key === "Escape") {
            searchResults.style.display = "none";
            selectedResultIdx = -1;
            return;
          }
          return;
        }

        // Don't fire navigation/action shortcuts while typing in any input
        // (search input and page-strip input are both covered by this guard)
        if (window.isTypingTarget(e)) return;

        var vRow = visiblePageIndex();
        // RTL convention: content flows right→left, so the LEFT arrow goes to
        // the next row and the RIGHT arrow goes to the previous row
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          goTo(vRow + 1);
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          goTo(vRow - 1);
        }
        if (e.key === "Home") {
          e.preventDefault();
          goTo(0);
        }
        if (e.key === "End") {
          e.preventDefault();
          goTo(filteredData.length - 1);
        }
        if (e.key === "," && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          window.openModal("settingsOverlay");
        }
        if (e.key === "e" && e.altKey && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          document.getElementById("btnExport").click();
        }
        if (e.key === "b" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          window.location.href = "index.html";
        }
        if (e.key === "s" && e.altKey && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          document.getElementById("btnShare").click();
        }
        if (e.key === "z" && e.altKey && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          window.setFocus(!document.documentElement.hasAttribute("data-focus"));
        }
        if (e.key === "t" && e.altKey && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          btnTashkeel.click();
        }
        if (e.key === "v" && e.altKey && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          // Cycle: card → table → parallel → card
          if (viewMode === "card") {
            STATE.viewMode = viewMode = "table";
          } else if (viewMode === "table") {
            STATE.viewMode = viewMode = "parallel";
          } else {
            STATE.viewMode = viewMode = "card";
          }
          updateViewModeUI();
          rebuildAll();
        }
        if (e.key === "p" && e.altKey && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          if (btnBookmark) btnBookmark.click();
        }
        if (e.key === "F" && e.shiftKey && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          document.getElementById("advancedSearchOverlay").classList.add("open");
          renderAdvancedSearch();
        }
        if (e.key === "/" || (e.key === "f" && (e.ctrlKey || e.metaKey))) {
          e.preventDefault();
          searchInput.focus();
          searchInput.select();
        }
      });

      // ── Touch swipe left/right → prev/next row ──────────────
      (function () {
        var startX = 0, startY = 0, swiping = false;
        readerContent.addEventListener("touchstart", function (e) {
          if (e.touches.length !== 1) return;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          swiping = true;
        }, { passive: true });
        readerContent.addEventListener("touchend", function (e) {
          if (!swiping) return;
          swiping = false;
          var dx = (e.changedTouches[0] ? e.changedTouches[0].clientX : startX) - startX;
          var dy = Math.abs((e.changedTouches[0] ? e.changedTouches[0].clientY : startY) - startY);
          if (Math.abs(dx) < 50 || Math.abs(dx) < dy) return; // min 50px, must be horizontal
          var vRow = visiblePageIndex();
          if (dx > 0 && vRow < filteredData.length - 1) goTo(vRow + 1);
          else if (dx < 0 && vRow > 0) goTo(vRow - 1);
        });
      })();

      // ── Settings reset from modal → re-render ─────────────
      document.addEventListener("readerReset", function () {
        ROWS_PER_CHUNK = 25;
        resetReaderDefaults();
      });

      // ── Language change → re-render ───────────────────────
      document.addEventListener("languagechange", function () {
        buildColumnToggles();
        // Update focus and view toggle button text
        var btn = document.getElementById("btnFocus");
        var on = document.documentElement.hasAttribute("data-focus");
        if (btn) btn.textContent = on ? "▼" : "↕";
        updateViewModeUI();
        if (filteredData.length > 0) rebuildAll();
      });

      // ── Quran UI ───────────────────────────────────────────
      if (quranBook) {
        var quranCtx = {
          metadata: metadata,
          headerRow: headerRow,
          allData: allData,
          normAllData: normAllData, // parallel normalised cells — kept in sync on column insert
          getFilteredData: function () { return filteredData; },
          setFilteredData: function (v) { filteredData = v; },
          getHiddenColumns: function () { return hiddenColumns; },
          rebuildAll: rebuildAll,
          goTo: goTo,
          LS: LS
        };
        initQuranUI(quranCtx);
      }
      // ── Initial render ──────────────────────────────────────
      loadInitial();
      observeSentinels();
      document.addEventListener("languagechange", function () {
        if (quranBook) updateQuranNavDisplay();
      });
      updateRdfHeaderTop();
      expandIfOverflowing();
      window.addEventListener("resize", function () { updateRdfHeaderTop(); expandIfOverflowing(); if (window.__rdfRefreshScrollWidth) window.__rdfRefreshScrollWidth(); });
      // Handle shared URL with &row= parameter
      var sharedRow = parseInt(new URLSearchParams(window.location.search).get("row"), 10);
      if (sharedRow >= 1 && sharedRow <= filteredData.length) {
        setTimeout(function () { goTo(sharedRow - 1); }, 200);
      }
      // ?q=TERM — deep link that opens the book with the term pre-highlighted
      // (library-search results link here with &row=). Reuses the normal search
      // path: fill the input and run applySearch so the results dropdown and
      // highlight state are active, then jump to the target row — or the first
      // match when no &row= is given.
      var sharedQuery = new URLSearchParams(window.location.search).get("q");
      if (sharedQuery) {
        searchInput.value = sharedQuery;
        applySearch(sharedQuery);
        var compiledQ = compileQuery(parseQueryWithMode(sharedQuery));
        var firstMatchRow = -1;
        for (var qr = 0; qr < allData.length; qr++) {
          if (rowMatchesQueryNorm(allData[qr], normAllData[qr], compiledQ)) {
            firstMatchRow = qr;
            break;
          }
        }
        if (firstMatchRow >= 0) {
          rebuildAll(); // re-render with the term highlighted (input value set above)
          var qTarget = sharedRow >= 1 && sharedRow <= filteredData.length ? sharedRow - 1 : firstMatchRow;
          setTimeout(function () { goTo(qTarget); }, 200);
        }
      }
      // Scroll-driven pagination update
      var scrollCounter = document.getElementById("scrollCounter");
      var scrollTimer;
      var urlSyncTimer;
      var historyTimer;
      var _lastHistoryRow = 0;
      var _lastMilestone = 0;

      // Initial history log
      var _initRow = visiblePageIndex() + 1;
      addReadHistory(metadata.bookCode, _initRow, pinLabel(_initRow));
      _lastHistoryRow = _initRow;

      window.addEventListener("scroll", function () {
        updatePagination();
        // Progress bar — surah-level for Quran, global for other books
        var pct;
        if (quranBook && filteredData.length > 0) {
          var vRow = visiblePageIndex();
          var curSurah = parseInt(filteredData[vRow][1], 10) || 0;
          var first = -1, last = 0;
          for (var r = 0; r < filteredData.length; r++) {
            var s = parseInt(filteredData[r][1], 10) || 0;
            if (s === curSurah) { if (first === -1) first = r; last = r; }
          }
          pct = last > first ? Math.round(((vRow - first) / (last - first)) * 100) : 0;
        } else {
          pct = filteredData.length > 1 ? Math.round((visiblePageIndex() / (filteredData.length - 1)) * 100) : 0;
        }
        document.getElementById("readerProgressFill").style.width = pct + "%";
        // Milestone toasts at 25%, 50%, 75%, 100% — reset when scrolling back
        if (pct < 25) { _lastMilestone = 0; document.getElementById("readerProgressFill").classList.remove("done"); }
        else if (pct < _lastMilestone) _lastMilestone = Math.floor(pct / 25) * 25;
        if (pct >= 25 && _lastMilestone < 25) { _lastMilestone = 25; showToast("📖 25%"); }
        if (pct >= 50 && _lastMilestone < 50) { _lastMilestone = 50; showToast("📖 50%"); }
        if (pct >= 75 && _lastMilestone < 75) { _lastMilestone = 75; showToast("📖 75%"); }
        if (pct >= 100 && _lastMilestone < 100) {
          _lastMilestone = 100;
          if (quranBook && filteredData.length > 0) {
            // Quran progress is surah-level — name the surah just finished
            var doneRow = filteredData[vRow];
            findQuranColIndices(headerRow);
            var doneSurah = getRowSurah(doneRow, headerRow);
            var doneInfo = getSurahInfo(doneSurah);
            var lang = currentLang();
            var doneName = doneInfo ? (lang === "en" ? doneInfo.nameEN : doneInfo.nameAR) : "";
            showToast("✅ " + (doneName ? doneName + " " : "") + t("surahCompleted") + " 📖");
          } else {
            showToast("✅ 100% " + t("qrnCompleted") + " 📖");
          }
          document.getElementById("readerProgressFill").classList.add("done");
          var ring = document.createElement("div");
          ring.className = "completion-border";
          document.body.appendChild(ring);
          setTimeout(function () { ring.remove(); }, 5000);
        }
        if (scrollCounter) {
          var vRow = visiblePageIndex();
          if (quranBook && filteredData.length > 0) {
            var scRow = filteredData[vRow];
            findQuranColIndices(headerRow);
            var scSurah = getRowSurah(scRow, headerRow);
            var scAyah = getAyahNoFromRowQuran(scRow, headerRow);
            var scInfo = getSurahInfo(scSurah);
            var scName = scInfo ? scInfo.nameAR : "";
            scrollCounter.innerHTML = scName + ' <span class="sc-n">' + scSurah + '</span> : <span class="sc-n">' + scAyah + '</span> <span class="sc-pct">' + pct + '%</span>';
          } else {
            var total = filteredData.length;
            scrollCounter.innerHTML = '<span class="sc-n">' + total + '</span> / <span class="sc-n">' + (vRow + 1) + '</span> <span class="sc-pct">' + pct + '%</span>';
          }
          scrollCounter.classList.add("show");
          clearTimeout(scrollTimer);
          scrollTimer = setTimeout(function () {
            scrollCounter.classList.remove("show");
          }, 2000);
        }
        // Sync URL with current position (debounced 500ms)
        clearTimeout(urlSyncTimer);
        urlSyncTimer = setTimeout(function () {
          var newURL = window.location.pathname + "?book=" + metadata.bookCode + "&row=" + (vRow + 1);
          history.replaceState(null, "", newURL);
        }, 500);
        // History auto-log + pin update (debounced 2s, row must change)
        if (vRow + 1 !== _lastHistoryRow) {
          clearTimeout(historyTimer);
          historyTimer = setTimeout(function () {
            addReadHistory(metadata.bookCode, vRow + 1, pinLabel(vRow + 1));
            if (isPinned(metadata.bookCode)) addPin(metadata.bookCode, vRow + 1, pinLabel(vRow + 1));
            _lastHistoryRow = vRow + 1;
          }, 2000);
        }
      }, { passive: true });

      // Reveal everything at once
      document.getElementById("loadingMessage").style.display = "none";
      document.getElementById("topBarBrand").style.display = "none";
      document.getElementById("backToDashboard").style.display = "";
      document.getElementById("btnFocus").style.display = "";
      document.getElementById("pageTitle").style.display = "";
      document.getElementById("readerWrapper").style.display = "block";
      updateScrollPadding();
      // Scroll arrows can't detect overflow while #readerWrapper was hidden
      if (window._initScrollArrows) window._initScrollArrows();
    }).catch(function (err) {
      showError("Error loading CSV: " + err);
    });
});

function showError(message) {
  document.getElementById("loadingMessage").style.display = "none";
  document.getElementById("errorMessage").textContent = message;
  document.getElementById("errorMessage").style.display = "block";
  console.error(message);
}
