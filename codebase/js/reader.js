/**
 * Reader Module
 *
 * Book viewer: loads CSV data, renders card / table / parallel text views,
 * provides infinite scroll, pagination, full-text search, copy-to-clipboard,
 * tashkeel toggle, export (via export.js), and keyboard shortcuts.
 */

import { initializePageWithMetadata, extractTags, addPin, removePin, isPinned } from "./book-data.js";
import { t, tagLabel, currentLang } from "./i18n.js";
import { compileQuery, rowMatchesQueryNorm, buildNormData, highlightMatches, linkifyURLs } from "./search-utils.js";
import { fetchBookCSVCached } from "./csv.js";
import { isQuranBook, mergeQuranData, loadSurahNames, loadColumnRegistry, getSurahInfo, decorateAyah, isAyahTextColumn, getColumnSourceBook, getColumnSourceBookTitle, hasExternalColumns, quranState, initQuranUI, updateQuranNavDisplay, findQuranColIndices, getAyahNoFromRow as getAyahNoFromRowQuran, getRowJuz, getRowSurah, columnFieldClass, columnTdClass, isFootnoteColumn, isArDvTransition, isMatnSharhTransition, classifyColumnLang } from "./quran-ui.js";
import { initExports } from "./export.js";
import { initTableScroll, refreshTableScrollWidth } from "./table-scroll-sync.js";
import { columnDisplayLabel } from "./column-labels.js";
import { initPosition, updatePagination, visiblePageIndex } from "./reader-position.js";
import { initSearchUI, applySearch, renderAdvancedSearch, parseQueryWithMode } from "./reader-search-ui.js";

initializePageWithMetadata(async function (metadata) {
  // ═══════════════════════════════════════════════════════════════
  // SECTIONS — fold with #region/#endregion; names are the anchors,
  // line numbers below are approximate (freshness check pins the last).
  //   Book loading (standard CSV or Quran merge)           L46-114
  //   Page header, tag badges, language-aware titles       L117-175
  //   Persisted settings (LS wrapper, -HDN column init)    L178-224
  //   Reader state, column toggles, dropdown infrastructure L227-313
  //   Tashkeel helpers                                     L316-323
  //   Clipboard formatting (rowText)                       L326-413
  //   View mode dropdown (card / table / parallel)         L416-464
  //   Quran helpers                                        L467-471
  //   Card row renderer (renderRowHTML)                    L474-548
  //   Parallel row renderer (renderParallelRowHTML)        L551-663
  //   Chunk + table-row renderers                          L666-707
  //   Infinite scroll + table scrollbar                    L710-833
  //   Navigation (goTo, scroll padding)                    L836-856
  //   Search UI (wiring — module: reader-search-ui.js)     L859-885
  //   Toolbar (tashkeel, share, pin, copy, focus, export, reset) L888-1040
  //   Keyboard shortcuts (incl. navigation buttons)        L1043-1146
  //   Touch swipe                                          L1149-1169
  //   Settings reset + language change                     L1172-1185
  //   Quran UI (initQuranUI ctx)                           L1188-1208
  //   Initial render (deep links, reveal)                  L1211-1277
  //   Module-level helpers (showError)                     L1280-1286
  // ═══════════════════════════════════════════════════════════════
  // #region Book loading (standard CSV or Quran merge)
  document.title = metadata.titleEN || metadata.bookCode;

  var quranBook = isQuranBook(metadata.bookCode);

  // Radheef books (RDF-*) default to table view on desktop — their rows are
  // single-field entries that read better as a table.
  function isRadheefBook(bookCode) {
    return !!bookCode && bookCode.indexOf("RDF-") === 0;
  }

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
        viewMode: (isRadheefBook(metadata.bookCode) && window.innerWidth > window.MOBILE_BP) ? "table" : "card",

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
      // #endregion

      // #region Page header, tag badges, language-aware titles
      // Language-aware page header
      const pageTagsContainer = document.getElementById("readerPageTags");
      const pageTags = extractTags(metadata.bookCode, metadata);

      function renderPageTags() {
        var lang = currentLang();
        pageTagsContainer.innerHTML = pageTags.map(function (tag) {
          var label;
          if (lang === "dv") {
            label = tagLabel(tag.code, tag.label, "dv") + " · " + tagLabel(tag.code, tag.label, "ar");
          } else {
            label = tagLabel(tag.code, tag.label);
          }
          var palClass = (tag.palette >= 0) ? ' tag-palette-' + tag.palette : '';
          return '<a href="index.html?tags=' + tag.code + '" class="tag-badge' + palClass + '" title="Show all ' + tagLabel(tag.code, tag.label, "en") + ' books">' + label + '</a>';
        }).join("");
      }

      function updatePageHeader() {
        var lang = currentLang();
        var pageTitle = document.getElementById("pageTitle");
        var pageSubtitle = document.getElementById("readerPageSubtitle");
        var pageSubRow = document.getElementById("readerPageSubRow");

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
      // #endregion

      // #region Persisted settings (LS wrapper, -HDN column init)
      // ── Settings (persisted) ────────────────────────────────
      const LS = {
        get(key, fallback) {
          try {
            // Accept full "reader:"-prefixed keys (window.LS_KEYS constants)
            // or bare keys (e.g. per-book "hiddenColumns:") — never double-prefix.
            const fullKey = key.indexOf("reader:") === 0 ? key : "reader:" + key;
            const v = localStorage.getItem(fullKey);
            return v !== null ? JSON.parse(v) : fallback;
          } catch (_) {
            return fallback;
          }
        },
        set(key, val) {
          try {
            const fullKey = key.indexOf("reader:") === 0 ? key : "reader:" + key;
            localStorage.setItem(fullKey, JSON.stringify(val));
          } catch (_) {}
        },
      };

      var ROWS_PER_CHUNK = 25;
      STATE.hideTashkeel = LS.get(window.LS_KEYS.readerHideTashkeel, false);
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
      // #endregion

      // #region Reader state, column toggles, dropdown infrastructure
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
      const searchInput = document.getElementById("readerSearchInput");
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
            "toolbar-btn col-toggle" + (hiddenColumns.indexOf(i) !== -1 ? " off" : "");
          var dispLabel = columnDisplayLabel(i, colLabel(i));
          btn.textContent = dispLabel;
          btn.title = "Toggle column " + dispLabel;
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

      // Shared dropdown helpers (openDropdown / closeAllDropdowns /
      // registerDropdown) live in common.js — the library-search page uses
      // them too. Keep the page's close-all id list here; the quran-nav
      // dropdowns are created later, so closeAllDropdowns resolves ids lazily.
      ["columnDropdown", "exportDropdown", "searchHistoryDropdown",
       "qrnAyahDropdown", "qrnJuzDropdown", "qrnDisplayDropdown",
       "qrnSurahOverlay"].forEach(function (id) {
        window.registerDropdownId(id);
      });

      // Column dropdown toggle
      var btnColumnDropdown = document.getElementById("btnColumnDropdown");
      var columnDropdown = document.getElementById("columnDropdown");
      btnColumnDropdown.addEventListener("click", function (e) {
        e.stopPropagation();
        if (columnDropdown.style.display === "none" || !columnDropdown.style.display) {
          window.openDropdown(columnDropdown, btnColumnDropdown);
        } else {
          columnDropdown.style.display = "none";
        }
      });
      window.registerDropdown("columnDropdown", columnDropdown, btnColumnDropdown);
      // #endregion

      // #region Tashkeel helpers
      // ── Tashkeel helpers ────────────────────────────────────
      // Unicode ranges for Arabic diacritics / tashkeel
      const TASHKEEL_RE = /[ً-ٟؐ-ؚۖ-ۭ]+/g;

      function markupTashkeel(text) {
        return text.replace(TASHKEEL_RE, '<span class="tashkeel">$&</span>');
      }
      // #endregion

      // #region Clipboard formatting (rowText)
      // ── Clipboard formatting (rowText) ──────────────────────
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
              var ayahValue = (row[ci] != null ? String(row[ci]).trim() : "");
              if (ayahValue) {
                var showBraces = LS.get(window.LS_KEYS.readerQuranShowBraces, true);
                var showAyahNum = LS.get(window.LS_KEYS.readerQuranShowAyahNum, true);
                var showNumBrackets = LS.get(window.LS_KEYS.readerQuranShowNumBrackets, false);
                qt += decorateAyah(ayahValue, ayahNo, showBraces, showAyahNum, showNumBrackets);
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
            var colHeader2 = (headerRow && headerRow[cj]) ? headerRow[cj].toLowerCase().replace(/-hdn$/i, "").trim() : "";
            // Skip base columns
            if (colHeader2 === "juzno" || colHeader2 === "surahno" || colHeader2 === "ayahno" || colHeader2 === "basmalah" || isAyahTextColumn(colHeader2)) continue;
            var cellValue = (row[cj] != null ? String(row[cj]).trim() : "");
            if (!cellValue) continue;
            var colSourceTitle = getColumnSourceBookTitle(cj) || metadata.titleDV;
            if (colSourceTitle && colSourceTitle !== lastBook) {
              qt += colSourceTitle + ":\n";
              lastBook = colSourceTitle;
            }
            qt += cellValue + "\n\n";
          }
          return qt;
        }
        // ── Standard clipboard format ──
        var text = "";
        if (hasRowNums && hiddenColumns.indexOf(0) === -1) {
          text += `#${rowNum}\n\n`;
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
            text += "ــــــــــــــــــــــــــــــــــــــــــــ\n";
          }
          if (i > 0) {
            var prevHdr0 = (headerRow && headerRow[fields[i - 1].index]) ? headerRow[fields[i - 1].index].toLowerCase() : "";
            if (isArDvTransition(prevHdr0, colHeader0)) { text += "\n"; }
            if (isMatnSharhTransition(prevHdr0, colHeader0)) { text += "· · ·\n\n"; }
          }
          if (!isFootnoteColumn(colHeader0)) {
            if (colHeader0.startsWith("head")) {
              text += fields[i].value + "\n───────────\n\n";
            } else if (colHeader0.startsWith("kitab")) {
              text += "Kitab: " + fields[i].value + "\n\n";
            } else if (colHeader0.startsWith("bab")) {
              text += "  Bab: " + fields[i].value + "\n\n";
            } else {
              text += fields[i].value + "\n\n";
            }
          } else {
            text += fields[i].value + "\n\n";
          }
        }
        return text;
      }
      // #endregion

      // #region View mode dropdown (card / table / parallel)
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
      // #endregion

      // #region Quran helpers
      // ── Quran helpers ──────────────────────────────────────
      function getAyahNoFromRow(row) {
        return getAyahNoFromRowQuran(row, headerRow);
      }
      // #endregion

      // #region Card row renderer (renderRowHTML)
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
            var showBraces = LS.get(window.LS_KEYS.readerQuranShowBraces, true);
            var showAyahNum = LS.get(window.LS_KEYS.readerQuranShowAyahNum, true);
            display = markupTashkeel(highlightMatches(decorateAyah(rawVal, ayahNo, showBraces, showAyahNum, LS.get(window.LS_KEYS.readerQuranShowNumBrackets, false)), query));
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
          // Long tokens (URLs) become links — runs after highlight/tashkeel
          // markup so spans stay intact
          display = linkifyURLs(display);
          // Quran: insert source-book label when crossing into a new book (only if external books are loaded)
          if (quranBook && hasExternalColumns(metadata.bookCode)) {
            var colSourceTitle = getColumnSourceBookTitle(colIdx);
            if (colSourceTitle && colSourceTitle !== lastExtBook) {
              // No label for the Uthmani-script column — redundant beside the
              // base imlai column; every other book still labels its group.
              if (getColumnSourceBook(colIdx) !== "QRN-DATA-ayahUthmani") {
                h += '<div class="reader-quran-book-label">' + colSourceTitle + ':</div>';
                lastExtBook = colSourceTitle;
              }
            } else if (!colSourceTitle) {
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
      // #endregion

      // #region Parallel row renderer (renderParallelRowHTML)
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
            var showBraces = LS.get(window.LS_KEYS.readerQuranShowBraces, true);
            var showAyahNum = LS.get(window.LS_KEYS.readerQuranShowAyahNum, true);
            d = markupTashkeel(highlightMatches(decorateAyah(rawVal, ayahNo, showBraces, showAyahNum, LS.get(window.LS_KEYS.readerQuranShowNumBrackets, false)), query));
          } else {
            d = markupTashkeel(highlightMatches(rawVal, query));
          }
          if (metadata.bookCode && metadata.bookCode.toUpperCase().startsWith("KNSH-") && hdr.startsWith("body")) {
            var nlIdx = d.indexOf("\n");
            if (nlIdx !== -1) d = '<span class="knhs-body-header">' + d.slice(0, nlIdx) + '</span>' + d.slice(nlIdx);
          }
          return linkifyURLs(d);
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
            // Quran book labels (skipped for the Uthmani-script column)
            if (quranBook && hasExternalColumns(metadata.bookCode)) {
              var groupLabel = getColumnSourceBookTitle(gIdx);
              if (groupLabel && groupLabel !== lastExtBook) {
                if (getColumnSourceBook(gIdx) !== "QRN-DATA-ayahUthmani") {
                  gh += '<div class="reader-quran-book-label">' + groupLabel + ':</div>';
                  lastExtBook = groupLabel;
                }
              } else if (!groupLabel) { lastExtBook = ""; }
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
      // #endregion

      // #region Chunk + table-row renderers
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
            var colHeader = (headerRow && headerRow[j]) ? headerRow[j].toLowerCase() : "";
            var display;
            if (quranBook && isAyahTextColumn(colHeader)) {
              var ayahNo = getAyahNoFromRow(row);
              var showBraces = LS.get(window.LS_KEYS.readerQuranShowBraces, true);
              var showAyahNum = LS.get(window.LS_KEYS.readerQuranShowAyahNum, true);
              display = markupTashkeel(highlightMatches(decorateAyah(v, ayahNo, showBraces, showAyahNum, LS.get(window.LS_KEYS.readerQuranShowNumBrackets, false)), searchInput.value.trim()));
            } else {
              display = markupTashkeel(highlightMatches(v, searchInput.value.trim()));
            }
            display = linkifyURLs(display);
            var tdClass = "";
            tdClass = columnTdClass(colHeader);
            h += '<td dir="auto"' + tdClass + '>' + display + '</td>';
          }
          h += '</tr>';
        }
        return h;
      }
      // #endregion

      // #region Infinite scroll + table scrollbar
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
          // ── Table DOM structure (IDs wired through initTableScroll in table-scroll-sync.js,
          // and appendNext, prependPrev in this module) ──
          // Family was rdf* (Radheef shorthand — Radheef books default to table view); renamed to
          // table* because this is the generic table view. Rename in lockstep across the three
          // functions: #tableTopScroll, #tableScrollBack, #tableScrollFwd, #tableWrap, #tableBody,
          // #sentinelBottom
          readerContent.innerHTML =
            `<div class="table-top-scroll" id="tableTopScroll"><button class="scroll-arrow" id="tableScrollBack" title="Back to beginning">▶</button><div class="table-top-scroll-inner"><div class="table-top-scroll-spacer" id="tableTopScrollInner"></div></div><button class="scroll-arrow" id="tableScrollFwd" title="More columns">◀</button></div>` +
            `<div class="table-wrap" id="tableWrap"><table class="reader-table">${thead}<tbody id="tableBody"></tbody></table></div>` +
            `<div id="sentinelBottom" class="reader-sentinel"></div>`;
          document.getElementById("tableBody").innerHTML = renderTableRows(0, end);
          initTableScroll({ headerRow: headerRow, getHiddenColumns: function () { return hiddenColumns; } });
        } else {
          readerContent.innerHTML =
            `<div id="sentinelTop" class="reader-sentinel"></div>` +
            renderChunkHTML(0, end) +
            `<div id="sentinelBottom" class="reader-sentinel"></div>`;
        }
        updatePagination();
      }

      function buildClipboardText(startIdx, endIdx) {
        var text = "";
        for (var i = startIdx; i < endIdx && i < filteredData.length; i++) {
          if (i > startIdx) text += "\n──────────\n\n";
          var row = filteredData[i];
          var rowNum = hasRowNums ? (row[0] || (i + 1)) : (i + 1);
          text += rowText(row, rowNum);
        }
        return text.trim();
      }

      function expandIfOverflowing() {
        // Defer read to rAF to avoid forced sync layout during row insertion
        requestAnimationFrame(function () {
          var wrapperEl = document.getElementById("readerWrapper");
          var contentEl = document.getElementById("readerContent");
          if (!wrapperEl || !contentEl) return;
          if (contentEl.scrollWidth > wrapperEl.clientWidth) {
            wrapperEl.style.maxWidth = (window.innerWidth - 20) + "px";
          }
        });
      }

      function appendNext() {
        if (loadedEnd >= filteredData.length) return;
        var chunkSize = viewMode === "table" ? 30 : ROWS_PER_CHUNK;
        var nextEnd = Math.min(loadedEnd + chunkSize, filteredData.length);
        if (viewMode === "table") {
          var body = document.getElementById("tableBody");
          body.insertAdjacentHTML("beforeend", renderTableRows(loadedEnd, nextEnd));
          requestAnimationFrame(function () {
            refreshTableScrollWidth();
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
          var body = document.getElementById("tableBody");
          body.insertAdjacentHTML("afterbegin", renderTableRows(nextStart, loadedStart));
          requestAnimationFrame(function () {
            refreshTableScrollWidth();
          });
        } else {
          var prevH = readerContent.scrollHeight;
          var sentinel = document.getElementById("sentinelTop");
          sentinel.insertAdjacentHTML("afterend", renderChunkHTML(nextStart, loadedStart) + `<div class="reader-divider"></div>`);
          readerContent.scrollTop += readerContent.scrollHeight - prevH;
        }
        loadedStart = nextStart;
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
      // #endregion

      // #region Navigation (goTo, scroll padding)
      function updateScrollPadding() {
        var topBar = document.getElementById("topBar");
        var panel = document.getElementById("readerPanel");
        // Measured, not parsed: --topbar-clearance is a calc() token string, so
        // parseFloat can't resolve it — measure the panel's pinned bottom edge
        var offset = (panel && panel.offsetHeight > 0) ? panel.getBoundingClientRect().bottom : (topBar ? topBar.offsetHeight : 62) + 6;
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
      // #endregion

      // #region Search UI (wiring — module: reader-search-ui.js)
      // ── Search ──────────────────────────────────────────────
      // Search, the whole-word toggle, the history dropdown, the advanced
      // search modal and the search-results arrow navigation all live in
      // reader-search-ui.js; wired here once, before the toolbar and the
      // keyboard shortcuts.
      initSearchUI({
        allData: allData,
        normAllData: normAllData,
        maxCols: maxCols,
        colLabel: colLabel,
        // Display label for the advanced-search column dropdown: registry
        // (QRN) → derived from header tokens → raw header. Table/card
        // headers keep raw identifiers; this is selection chrome only.
        columnLabel: function (i) { return columnDisplayLabel(i, colLabel(i)); },
        getHiddenColumns: function () { return hiddenColumns; },
        getFilteredData: function () { return filteredData; },
        setFilteredData: function (v) { filteredData = v; },
        getLoadedStart: function () { return loadedStart; },
        setLoadedStart: function (v) { loadedStart = v; },
        getLoadedEnd: function () { return loadedEnd; },
        setLoadedEnd: function (v) { loadedEnd = v; },
        rebuildAll: rebuildAll,
        loadInitial: loadInitial,
        observeSentinels: observeSentinels,
        goTo: goTo,
      });
      // #endregion

      // #region Toolbar (tashkeel, share, pin, copy, focus, export, reset)
      // ── Toolbar: tashkeel toggle ────────────────────────────
      btnTashkeel.addEventListener("click", function () {
        hideTashkeel = !hideTashkeel;
        STATE.hideTashkeel = hideTashkeel; // aliases are read-only views — write back
        LS.set(window.LS_KEYS.readerHideTashkeel, hideTashkeel);
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
        // The pin labels differ in width (ޕިން vs ޕިންވެފަ) — reserve the
        // wider one so toggling never resizes the button. Idempotent;
        // re-measures on language changes.
        window.reserveWidestText(btnBookmark, [t("btnBookmarkText"), t("btnBookmarkPinned")]);
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
      function updateTableHeaderTop() {
        requestAnimationFrame(function () {
          var topBar = document.getElementById("topBar");
          var chrome = document.getElementById("readerPanel");
          // The table area starts at the sticky panel's bottom edge; the panel
          // pins at its rest position, so the rect is the same at rest and while
          // scrolling. (--topbar-clearance is a calc() token — parseFloat can't
          // resolve it, so measure the DOM instead of reading the custom prop.)
          var top = (chrome && chrome.offsetHeight > 0) ? chrome.getBoundingClientRect().bottom : (topBar ? topBar.offsetHeight : 62) + 6;
          document.documentElement.style.setProperty("--table-header-top", top + "px");
        });
      }
      // Reader-specific post-focus recalculation
      window.addEventListener("focuschange", function () {
        setTimeout(function () { updateTableHeaderTop(); updateScrollPadding(); }, 350);
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
        STATE.hiddenColumns = hiddenColumns; // aliases are read-only views — write back
        LS.set("hiddenColumns:" + metadata.bookCode, hiddenColumns);
        buildColumnToggles();
        // Show tashkeel
        hideTashkeel = false;
        STATE.hideTashkeel = false; // aliases are read-only views — write back
        LS.set(window.LS_KEYS.readerHideTashkeel, false);
        btnTashkeel.classList.remove("active");
        readerContent.classList.remove("hide-tashkeel");
        // Reset Quran display settings
        if (quranBook) {
          LS.set(window.LS_KEYS.readerQuranShowBraces, true);
          LS.set(window.LS_KEYS.readerQuranShowAyahNum, true);
          LS.set(window.LS_KEYS.readerQuranShowNumBrackets, false);
          var cbEl;
          if ((cbEl = document.getElementById("qrnToggleBraces"))) cbEl.checked = true;
          if ((cbEl = document.getElementById("qrnToggleAyahNum"))) cbEl.checked = true;
          if ((cbEl = document.getElementById("qrnToggleNumberBrackets"))) cbEl.checked = false;
          var row = document.getElementById("qrnNumberBracketsRow");
          if (row) row.style.display = (document.getElementById("qrnToggleBraces").checked && document.getElementById("qrnToggleAyahNum").checked) ? "" : "none";
        }
        // Exit focus mode
        window.setFocus(false);
        rebuildAll();
      }

      btnResetReader.addEventListener("click", function () {
        // Reset view mode to default for this book
        STATE.viewMode = viewMode = (isRadheefBook(metadata.bookCode) && window.innerWidth > window.MOBILE_BP) ? "table" : "card";
        updateViewModeUI();
        resetReaderDefaults();
      });
      // #endregion

      // #region Keyboard shortcuts (incl. navigation buttons)
      // ── Navigation: buttons ─────────────────────────────────
      [
        "btnFirst",
        "btnPrev",
        "btnNext",
        "btnLast",
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
        // Search-results navigation while the search input is focused is
        // handled in reader-search-ui.js (its keydown listener runs first)
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
      // #endregion

      // #region Touch swipe
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
      // #endregion

      // #region Settings reset + language change
      // ── Settings reset from modal → re-render ─────────────
      document.addEventListener("readerReset", function () {
        ROWS_PER_CHUNK = 25;
        resetReaderDefaults();
      });

      // ── Language change → re-render ───────────────────────
      document.addEventListener("languagechange", function () {
        buildColumnToggles();
        // Update view toggle button text (focus button glyph is static HTML, rotates via CSS)
        updateViewModeUI();
        if (filteredData.length > 0) rebuildAll();
      });
      // #endregion

      // #region Quran UI (initQuranUI ctx)
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
        // initQuranUI builds the column source map (_columnSourceMap), which
        // columnDisplayLabel reads for registry labels — rebuild the toggles
        // now so QRN books show registry labels, not derived ones.
        buildColumnToggles();
      }
      // #endregion

      // #region Initial render (deep links, reveal)
      // ── Initial render ──────────────────────────────────────
      // Position tracking (pagination strip, progress, scroll counter, URL
      // sync, read-history) lives in reader-position.js — wired BEFORE
      // loadInitial, because the table branch calls updatePagination() and
      // the module needs its ctx by then (null ctx would throw).
      initPosition({
        metadata: metadata,
        quranBook: quranBook,
        headerRow: headerRow,
        getFilteredData: function () { return filteredData; },
        pinLabel: pinLabel,
        goTo: goTo,
      });
      loadInitial();
      observeSentinels();
      document.addEventListener("languagechange", function () {
        if (quranBook) updateQuranNavDisplay();
      });
      expandIfOverflowing();
      window.addEventListener("resize", function () { updateTableHeaderTop(); expandIfOverflowing(); refreshTableScrollWidth(); });
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
      // Reveal everything at once
      document.getElementById("loadingMessage").style.display = "none";
      document.getElementById("topBarBrand").style.display = "none";
      document.getElementById("backToDashboard").style.display = "";
      document.getElementById("btnFocus").style.display = "";
      document.getElementById("pageTitle").style.display = "";
      document.getElementById("readerWrapper").style.display = "block";
      // Measure the sticky chrome (topbar + collapsible panel) only now —
      // while the wrapper was display:none the panel measured 0, so the
      // bar/thead would pin behind the panel instead of below it
      updateTableHeaderTop();
      updateScrollPadding();
      // Scroll arrows can't detect overflow while #readerWrapper was hidden
      if (window.initScrollArrows) window.initScrollArrows();
    }).catch(function (err) {
      showError("Error loading CSV: " + err);
    });
});
// #endregion

// #region Module-level helpers (showError)
function showError(message) {
  document.getElementById("loadingMessage").style.display = "none";
  document.getElementById("errorMessage").textContent = message;
  document.getElementById("errorMessage").style.display = "block";
  console.error(message);
}
// #endregion
