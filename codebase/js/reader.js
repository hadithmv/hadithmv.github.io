/**
 * Reader Module
 *
 * Book viewer: loads CSV data via fetch + parseCSV, renders vertical reading cards,
 * provides pagination, full-text search, copy-to-clipboard, tashkeel toggle,
 * rows-per-page control, and per-column visibility toggles.
 */

import { initializePageWithMetadata, extractTags, addPin, removePin, isPinned, addReadHistory } from "./catalog.js";
import { t, tagLabel, currentLang } from "./i18n.js";
import { normaliseForSearch, parseQuery, rowMatchesQuery, highlightMatches, buildSnippets as buildSnippetsFromSearch, escapeHTML, addSearchHistory, getSearchHistory, removeSearchHistoryItem, clearSearchHistory, MAX_HISTORY } from "./search.js";
import { parseCSV, unparseCSV } from "./csv.js";
import { isQuranBook, mergeQuranData, loadSurahNames, loadColumnRegistry, getSurahInfo, getRowsForSurah, findAyahRow, toArabicNumeral, decorateAyah, isAyahTextColumn, getColumnDisplayName, quranState, initQuranUI, updateQuranNavDisplay, findQuranColIndices, getAyahNoFromRow as getAyahNoFromRowQuran, getRowJuz, getRowSurah } from "./quran.js";

initializePageWithMetadata(async function (metadata) {
  document.title = metadata.titleEN || metadata.bookCode;

  var quranBook = isQuranBook(metadata.bookCode);

  function loadStandardBook() {
    return fetch(metadata.csvPath)
      .then(function (r) { if (!r.ok) throw Error("Failed to load " + metadata.csvPath); return r.text(); })
      .then(function (text) {
        var data = parseCSV(text);
        data = data.filter(
          function (row) {
            return Array.isArray(row) &&
              row.some(function (value) { return value !== null && value !== ""; });
          }
        );
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
      var data = result.data;
      var headerRow = result.headerRow;
      var hasRowNums = result.hasRowNums;

      if (data.length === 0) {
        showError("No data found in CSV file: " + metadata.csvPath);
        return;
      }

      // Language-aware page header
      const pageTagsContainer = document.getElementById("pageTags");
      const pageTags = extractTags(metadata.bookCode);

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
      let hideTashkeel = LS.get("hideTashkeel", false);
      let hiddenColumns = LS.get("hiddenColumns", []);

      // Columns whose header ends with "-HDN" start hidden every session
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
      const allData = data;
      // Books ending with -DSC display rows in reverse (last-to-first)
      if (metadata.bookCode && metadata.bookCode.toUpperCase().endsWith("-DSC")) {
        allData.reverse();
      }
      let filteredData = allData;

      // DOM refs
      const searchInput = document.getElementById("searchInput");
      const searchClear = document.getElementById("searchClear");
      const searchInfo = document.getElementById("searchInfo");
      const searchResults = document.getElementById("searchResults");
      const advSearchOverlay = document.getElementById("advancedSearchOverlay");
      const advSearchRows = document.getElementById("advancedSearchRows");
      const btnTashkeel = document.getElementById("btnTashkeel");
      const btnCopy = document.getElementById("btnCopy");
      const btnReset = document.getElementById("btnReset");
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
            LS.set("hiddenColumns", hiddenColumns);
            rebuildAll();
          });
          columnToggles.appendChild(btn);
        }
        if (maxCols > 0) columnTogglesGrp.style.display = "";
      }
      buildColumnToggles();

      // Column dropdown toggle
      var btnColDropdown = document.getElementById("btnColDropdown");
      var columnDropdown = document.getElementById("columnDropdown");
      btnColDropdown.addEventListener("click", function (e) {
        e.stopPropagation();
        if (columnDropdown.style.display === "none" || !columnDropdown.style.display) {
          var btnRect = btnColDropdown.getBoundingClientRect();
          columnDropdown.style.position = "fixed";
          columnDropdown.style.left = btnRect.left + "px";
          columnDropdown.style.top = btnRect.bottom + 4 + "px";
          columnDropdown.style.display = "block";
        } else {
          columnDropdown.style.display = "none";
        }
      });
      document.addEventListener("click", function (e) {
        if (!columnDropdown.contains(e.target) && e.target !== btnColDropdown) {
          columnDropdown.style.display = "none";
        }
      });

      // ── Tashkeel helpers ────────────────────────────────────
      // Unicode ranges for Arabic diacritics / tashkeel
      const TASHKEEL_RE = /[ً-ٟؐ-ؚۖ-ۭ]+/g;

      function markupTashkeel(text) {
        return text.replace(TASHKEEL_RE, '<span class="tashkeel">$&</span>');
      }

      // ── Search highlight ───────────────────────────────────

      function escapeHTML(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
          qt += "[" + surahName + " " + surahNo + ":" + ayahNo + "]\n\n";
          // Book-specific columns
          for (var cj = 0; cj < row.length; cj++) {
            if (hiddenColumns.indexOf(cj) !== -1) continue;
            var ch2 = (headerRow && headerRow[cj]) ? headerRow[cj].toLowerCase().replace(/-hdn$/i, "").trim() : "";
            // Skip base columns
            if (ch2 === "juzno" || ch2 === "surahno" || ch2 === "ayahno" || ch2 === "basmalah" || isAyahTextColumn(ch2)) continue;
            var cv = (row[cj] != null ? String(row[cj]).trim() : "");
            if (cv) {
              var label = getColumnDisplayName(ch2, cj, headerRow);
              qt += label + ":\n" + cv + "\n\n";
            }
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
            if (prevHdr0.endsWith("ar") && colHeader0.endsWith("dv")) {
              t += "\n";
            }
            if (prevHdr0.startsWith("matn") && colHeader0.startsWith("sharh")) {
              t += "· · ·\n\n";
            }
          }
          if (!colHeader0.startsWith("foot")) {
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

      var isTableMode = metadata.bookCode && metadata.bookCode.indexOf("RDF-") === 0 && window.innerWidth > 600;
      var btnViewToggle = document.getElementById("btnViewToggle");
      btnViewToggle.textContent = t(isTableMode ? "btnViewToggleCard" : "btnViewToggleText");
      btnViewToggle.addEventListener("click", function () {
        isTableMode = !isTableMode;
        btnViewToggle.textContent = t(isTableMode ? "btnViewToggleCard" : "btnViewToggleText");
        rebuildAll();
      });

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
          if (i > 0) {
            var prevHdr = (headerRow && headerRow[fields[i - 1].index]) ? headerRow[fields[i - 1].index].toLowerCase() : "";
            if (prevHdr.endsWith("ar") && colHeader.endsWith("dv")) {
              h += `<div class="reader-ar-dv-spacer"></div>`;
            }
            if (prevHdr.startsWith("matn") && colHeader.startsWith("sharh")) {
              h += `<div class="reader-matn-sharh-separator"></div>`;
            }
          }
          if (colHeader.startsWith("foot") && fields.length > 1) {
            h += `<div class="reader-field reader-footnote-divider">ــــــــــــــــــــــــــــــــــــــــــــ</div>`;
            h += `<div class="reader-field reader-footnotes" dir="auto">${display}</div>`;
          } else {
            var fieldClass = "reader-field";
            if (colHeader.startsWith("head")) {
              fieldClass += " reader-field-header";
            } else if (colHeader.startsWith("kitab")) {
              fieldClass += " reader-field-kitab";
            } else if (colHeader.startsWith("bab")) {
              fieldClass += " reader-field-bab";
            } else if (colHeader.startsWith("matn")) {
              fieldClass += " reader-field-matn";
            } else if (colHeader.startsWith("sharh")) {
              fieldClass += " reader-field-sharh";
            }
            h += `<div class="${fieldClass}" dir="auto">${display}</div>`;
          }
        }
        return h;
      }

      function renderChunkHTML(startIdx, endIdx) {
        var h = "";
        if (isTableMode) {
          h = '<table class="rdf-table"><tbody>';
          for (var i = startIdx; i < endIdx && i < filteredData.length; i++) {
            var row = filteredData[i];
            h += '<tr class="reader-chunk" data-row="' + i + '">';
            for (var j = 0; j < row.length; j++) {
              if (hiddenColumns.indexOf(j) !== -1) { h += '<td></td>'; continue; }
              var v = (row[j] != null ? String(row[j]).trim() : "");
              var display = markupTashkeel(highlightMatches(v, searchInput.value.trim()));
              var tdClass = "";
              var tdHdr = (headerRow && headerRow[j]) ? headerRow[j].toLowerCase() : "";
              if (tdHdr.startsWith("matn")) tdClass = ' class="td-matn"';
              else if (tdHdr.startsWith("sharh")) tdClass = ' class="td-sharh"';
              h += '<td dir="auto"' + tdClass + '>' + display + '</td>';
            }
            h += '</tr>';
          }
          h += '</tbody></table>';
        } else {
          for (var i = startIdx; i < endIdx && i < filteredData.length; i++) {
            if (i > startIdx) h += `<div class="reader-divider"></div>`;
            var row = filteredData[i];
            var rowNum = hasRowNums ? (row[0] || (i + 1)) : (i + 1);
            h += `<div class="reader-chunk" data-row="${i}">`;
            h += renderRowHTML(row, rowNum);
            h += `</div>`;
          }
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
              display = markupTashkeel(highlightMatches(decorateAyah(v, ayahNo, showBraces, showAyahNum), searchInput.value.trim()));
            } else {
              display = markupTashkeel(highlightMatches(v, searchInput.value.trim()));
            }
            var tdClass = "";
            if (tdHdr.startsWith("matn")) tdClass = ' class="td-matn"';
            else if (tdHdr.startsWith("sharh")) tdClass = ' class="td-sharh"';
            h += '<td dir="auto"' + tdClass + '>' + display + '</td>';
          }
          h += '</tr>';
        }
        return h;
      }

      function loadInitial() {
        var initialRows = isTableMode ? 50 : ROWS_PER_CHUNK * 3;
        var end = Math.min(initialRows, filteredData.length);
        loadedStart = 0;
        loadedEnd = end;
        if (isTableMode) {
          var thead = "";
          if (headerRow) {
            thead = "<thead><tr>";
            for (var j = 0; j < headerRow.length; j++) {
              if (hiddenColumns.indexOf(j) !== -1) continue;
              thead += "<th>" + (headerRow[j] || "") + "</th>";
            }
            thead += "</tr></thead>";
          }
          readerContent.innerHTML =
            `<div class="rdf-top-scroll" id="rdfTopScroll"><button class="rdf-scroll-arrow" id="rdfScrollBack" title="Back to beginning">▶</button><div class="rdf-top-scroll-inner"><div class="rdf-top-scroll-spacer" id="rdfTopScrollInner"></div></div><button class="rdf-scroll-arrow" id="rdfScrollFwd" title="More columns">◀</button></div>` +
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
          var thTop = needed ? "calc(var(--rdf-header-top, 62px) + 19px)" : "var(--rdf-header-top, 62px)";
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
        var chunkSize = isTableMode ? 30 : ROWS_PER_CHUNK;
        var nextEnd = Math.min(loadedEnd + chunkSize, filteredData.length);
        if (isTableMode) {
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
        var chunkSize = isTableMode ? 30 : ROWS_PER_CHUNK;
        var nextStart = Math.max(0, loadedStart - chunkSize);
        if (isTableMode) {
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
        return `<span class="page-of-label">${total} / </span><input type="number" class="page-strip-sel toolbar-select" style="width:58px;text-align:center;text-align-last:center" min="1" max="${total}" value="${current}" autocomplete="off">`;
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

        var selHTML = pageSelectHTML(cur, total);
        var label = t("pageOf");
        document.getElementById("pageNumbers").innerHTML = selHTML;
        document.getElementById("pageNumbersBottom").innerHTML = selHTML;
        var pl = document.getElementById("pageLabel");
        if (pl) pl.textContent = label;
        var plb = document.getElementById("pageLabelBottom");
        if (plb) plb.textContent = label;

        var atFirst = visibleRow === 0;
        var atLast = visibleRow >= filteredData.length - 1;
        [
          "firstBtn",
          "prevBtn",
          "nextBtn",
          "lastBtn",
          "firstBtnBottom",
          "prevBtnBottom",
          "nextBtnBottom",
          "lastBtnBottom",
        ].forEach(function (id, i) {
          document.getElementById(id).disabled = i % 4 < 2 ? atFirst : atLast;
        });

        // Wire page strip selects (top and bottom)
        document.querySelectorAll(".page-strip-sel").forEach(function (psi) {
          if (String(psi.value) !== String(cur)) psi.value = cur;
          psi.addEventListener("change", function () {
            var v = parseInt(this.value, 10);
            if (!isNaN(v) && v >= 1) goTo(v - 1);
          });
        });
      }

      function goTo(rowIdx) {
        if (filteredData.length === 0) return;
        if (rowIdx < 0) rowIdx = 0;
        if (rowIdx >= filteredData.length) rowIdx = filteredData.length - 1;
        // Ensure row is loaded
        while (rowIdx < loadedStart) prependPrev();
        while (rowIdx >= loadedEnd) appendNext();
        var el = readerContent.querySelector('.reader-chunk[data-row="' + rowIdx + '"]');
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        updatePagination();
      }

      // ── Search ──────────────────────────────────────────────
      let selectedResultIdx = -1; // index within searchResults DOM children


      function buildSnippets(row, q) {
        var parsed = parseQueryWithMode(q);
        return buildSnippetsFromSearch(row, parsed, q);
      }

      function buildAdvResultsHTML(query, rows, realIdxMap) {
        var MAX = 30;
        var q = query.trim();
        if (!q || rows.length === 0) return "";
        var html = ""; var count = 0;
        for (var i = 0; i < rows.length && count < MAX; i++) {
          var row = rows[i];
          var rowNum = row[0] || (realIdxMap[i] + 1);
          var snippets = buildSnippets(row, q);
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
        let html = "";
        let count = 0;
        for (let i = 0; i < filteredData.length && count < MAX; i++) {
          const row = filteredData[i];
          const rowNum = row[0] || allData.indexOf(row) + 1;
          var snippets = buildSnippets(row, q);
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
        var q = query.trim();
        if (!q) {
          filteredData = allData;
          searchClear.style.display = "none";
          searchInfo.style.display = "none";
          searchResults.style.display = "none";
          rebuildAll();
          return;
        }

        var parsed = parseQueryWithMode(q);
        var tempFiltered = allData.filter(function (row) {
          return rowMatchesQuery(row, parsed);
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
            var origFiltered = filteredData;
            filteredData = tempFiltered;
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
            filteredData = origFiltered;
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
        // Position below the search bar
        var sbRect = searchInput.getBoundingClientRect();
        searchHistoryEl.style.position = "fixed";
        searchHistoryEl.style.left = sbRect.left + "px";
        searchHistoryEl.style.right = (window.innerWidth - sbRect.right) + "px";
        searchHistoryEl.style.top = sbRect.bottom + "px";
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
      searchInput.addEventListener("input", function () {
        searchHistoryEl.style.display = "none";
        applySearch(this.value);
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
        var rows = filteredData.length === 0 ? allData : allData; // always filter against full data
        var result = rows.filter(function(row) {
          if (advConditions.length === 0) return true;
          // Evaluate all conditions with AND/OR logic
          var matches = advConditions.map(function(c) {
            var cellVal = (row[c.col] !== null && row[c.col] !== undefined) ? String(row[c.col]) : "";
            var op = OPERATORS.find(function(o){return o.id===c.op;});
            if (!op) return true;
            if (op.needsValue === false) return op.fn(normaliseForSearch(cellVal));
            var q = c.val || "";
            return op.fn(normaliseForSearch(cellVal), normaliseForSearch(q));
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
        navigator.clipboard.writeText(url).then(function () {
          showToast(t("toastShared"));
        }).catch(function () {
          var ta = document.createElement("textarea");
          ta.value = url; ta.style.position = "fixed"; ta.style.left = "-9999px";
          document.body.appendChild(ta); ta.select();
          try { document.execCommand("copy"); showToast(t("toastShared")); } catch (_) {}
          document.body.removeChild(ta);
        });
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
        btnBookmark.title = pinned ? "Remove bookmark (p key)" : "Bookmark current page (p key)";
      }
      btnBookmark.addEventListener("click", function () {
        var vRow = visiblePageIndex() + 1;
        if (isPinned(metadata.bookCode)) {
          removePin(metadata.bookCode);
          showToast(t("toastUnpinned"));
        } else {
          var ok = addPin(metadata.bookCode, vRow);
          showToast(ok ? t("toastPinned") : t("toastPinned"));
        }
        updateBookmarkButton();
      });
      updateBookmarkButton();

      // ── Toolbar: copy to clipboard ──────────────────────────
      btnCopy.addEventListener("click", function () {
        var vRow = visiblePageIndex();
        var text = clipboardHeader + "\n\n" + buildClipboardText(vRow, vRow + 1);
        if (!text.trim()) return;
        navigator.clipboard
          .writeText(text)
          .then(function () {
            showToast(t("toastCopied"));
          })
          .catch(function () {
            // Fallback for older browsers / non-HTTPS
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.left = "-9999px";
            document.body.appendChild(ta);
            ta.select();
            try {
              document.execCommand("copy");
              showToast(t("toastCopied"));
            } catch (_) {
              showToast(t("toastCopyFailed"));
            }
            document.body.removeChild(ta);
          });
      });

      function showToast(msg) {
        let el = document.querySelector(".copy-toast");
        if (!el) {
          el = document.createElement("div");
          el.className = "copy-toast";
          document.body.appendChild(el);
        }
        el.textContent = msg;
        el.classList.add("show");
        clearTimeout(el._timeout);
        el._timeout = setTimeout(function () {
          el.classList.remove("show");
        }, 1500);
      }

      // ── Toolbar: focus mode ──────────────────────────────────
      var btnFocus = document.getElementById("btnFocus");
      function updateRdfHeaderTop() {
        requestAnimationFrame(function () {
          var topBar = document.getElementById("topBar");
          var chrome = document.getElementById("readerChrome");
          var top = (topBar ? topBar.offsetHeight : 62);
          if (chrome && chrome.offsetHeight > 0) top += chrome.offsetHeight;
          document.documentElement.style.setProperty("--rdf-header-top", (top - 1) + "px");
        });
      }
      function setFocus(on) {
        var html = document.documentElement;
        var btn = document.getElementById("btnFocus");
        if (on) {
          html.setAttribute("data-focus", "");
          if (btn) { btn.classList.add("active"); btn.textContent = "▼"; }
        } else {
          html.removeAttribute("data-focus");
          if (btn) { btn.classList.remove("active"); btn.textContent = "↕"; }
        }
        try { localStorage.setItem("focus", on ? "1" : "0"); } catch (_) {}
        // Wait for chrome collapse/expand transition (~300ms) then recalc
        setTimeout(updateRdfHeaderTop, 350);
      }
      if ((function(){try{return localStorage.getItem("focus")==="1"}catch(_){return false}})()) setFocus(true);
      btnFocus.addEventListener("click", function () {
        setFocus(!document.documentElement.hasAttribute("data-focus"));
      });

      // ── Toolbar: export ─────────────────────────────────────
      var btnExport = document.getElementById("btnExport");
      var exportDropdown = document.getElementById("exportDropdown");
      btnExport.addEventListener("click", function (e) {
        e.stopPropagation();
        if (exportDropdown.style.display === "none" || !exportDropdown.style.display) {
          var btnRect = btnExport.getBoundingClientRect();
          exportDropdown.style.position = "fixed";
          exportDropdown.style.left = btnRect.left + "px";
          exportDropdown.style.top = btnRect.bottom + 4 + "px";
          exportDropdown.style.display = "block";
        } else {
          exportDropdown.style.display = "none";
        }
      });
      document.addEventListener("click", function (e) {
        if (!exportDropdown.contains(e.target) && e.target !== btnExport) {
          exportDropdown.style.display = "none";
        }
      });

      function downloadFile(content, filename, mime) {
        var blob = new Blob([content], { type: mime });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url; a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      exportDropdown.querySelectorAll(".export-option").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var fmt = this.dataset.format;
          var baseName = (metadata.titleEN || metadata.bookCode || "book");
          var rows = allData;
          var rowsWithHeader = headerRow ? [headerRow].concat(rows) : rows;
          var content, filename, mime;
          var siteURL = window.location.origin + window.location.pathname + "?book=" + metadata.bookCode;
          var versionFull = t("appVersion");
          var versionText = versionFull.replace(/ \(.*\)/, "");
          var exportHeader = (metadata.titleEN || metadata.bookCode) + "\n" + metadata.titleDV + "\n" + metadata.titleAR + "\n\n" + siteURL + "\nHadithmv\n" + versionText + "\n\n" + "──────────\n\n";

          if (fmt === "txt") {
            content = exportHeader + buildClipboardText(0, rows.length);
            filename = baseName + ".txt";
            mime = "text/plain";
          } else if (fmt === "md") {
            content = "# " + (metadata.titleEN || metadata.bookCode) + "\n\n" + metadata.titleDV + "\n" + metadata.titleAR + "\n\n" + siteURL + "\n\nHadithmv\n" + versionText + "\n\n---\n\n";
            for (var i = 0; i < rows.length; i++) {
              var r = rows[i];
              content += "## " + (hasRowNums ? "#" : "") + (hasRowNums ? (r[0] || (i + 1)) : (i + 1)) + "\n\n";
              var exportStart0 = hasRowNums ? 1 : 0;
              var mdPrevHdr = "";
              for (var j = exportStart0; j < r.length; j++) {
                if (r[j] && String(r[j]).trim()) {
                  var mdHdr = (headerRow && headerRow[j]) ? headerRow[j].toLowerCase() : "";
                  if (mdPrevHdr.startsWith("matn") && mdHdr.startsWith("sharh")) content += "· · ·\n\n";
                  content += String(r[j]).trim() + "\n\n";
                  mdPrevHdr = mdHdr;
                }
              }
              content += "---\n\n";
            }
            filename = baseName + ".md";
            mime = "text/markdown";
          } else if (fmt === "json") {
            content = JSON.stringify(rowsWithHeader, null, 2);
            filename = baseName + ".json";
            mime = "application/json";
          } else if (fmt === "csv") {
            content = unparseCSV(rowsWithHeader);
            filename = baseName + ".csv";
            mime = "text/csv";
          } else if (fmt === "tsv") {
            content = rowsWithHeader.map(function (row) {
              return row.map(function (cell) {
                var s = cell == null ? "" : String(cell);
                return s.replace(/\t/g, " ").replace(/\n/g, " ");
              }).join("\t");
            }).join("\n");
            filename = baseName + ".tsv";
            mime = "text/tab-separated-values";
          } else if (fmt === "pdf") {
            var fontUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "/../font/merged-300.woff2");
            var pdfHTML = '<html dir="rtl"><head><meta charset="utf-8"><style>@page{@bottom-center{content:counter(page);font-family:Hadithmv;font-size:9pt;color:#999}} @font-face{font-family:Hadithmv;src:url(' + fontUrl + ') format("woff2");font-weight:300;font-display:block} body{font-family:Hadithmv,"Traditional Arabic","Scheherazade New",serif;font-size:14pt;line-height:2.2;padding:30px;direction:rtl;max-width:700px;margin:0 auto} h1{text-align:center;margin-bottom:8px} h2{font-size:11pt;color:#888;margin:24px 0 4px} p{margin:8px 0} hr{border:none;border-top:1px solid #ddd;margin:16px 0}</style></head><body>';
            pdfHTML += "<p style='text-align:center;font-size:9pt;color:#999'>Hadithmv - " + siteURL + " - " + versionText + "</p>";
            pdfHTML += "<h1>" + metadata.titleDV + "</h1><p style='text-align:center'>" + metadata.titleAR + "</p>";
            for (var i = 0; i < rows.length; i++) {
              var r = rows[i];
              pdfHTML += "<h2>" + (hasRowNums ? "#" : "") + (hasRowNums ? (r[0] || (i + 1)) : (i + 1)) + "</h2>";
              var fields = [];
              for (var j = (hasRowNums ? 1 : 0); j < r.length; j++) {
                if (r[j] && String(r[j]).trim()) fields.push({ value: String(r[j]).trim(), index: j });
              }
              for (var j = 0; j < fields.length; j++) {
                var colHeader2 = (headerRow && headerRow[fields[j].index]) ? headerRow[fields[j].index].toLowerCase() : "";
                if (j > 0) {
                  var prevHdr2 = (headerRow && headerRow[fields[j - 1].index]) ? headerRow[fields[j - 1].index].toLowerCase() : "";
                  if (prevHdr2.endsWith("ar") && colHeader2.endsWith("dv")) pdfHTML += "<p>&nbsp;</p>";
                  if (prevHdr2.startsWith("matn") && colHeader2.startsWith("sharh")) pdfHTML += '<p style="text-align:center;color:#bbb;margin:6px 0;font-size:8pt;letter-spacing:3px">· · ·</p>';
                }
                if (colHeader2.startsWith("foot") && fields.length > 1) pdfHTML += '<p style="color:#999;font-size:11pt">ــــــــــــــــــــــــــــــــــــــــــــ</p>';
                if (!colHeader2.startsWith("foot")) {
                  if (colHeader2.startsWith("head")) {
                    pdfHTML += '<p style="font-size:17pt;font-weight:700;margin:12px 0 2px">' + fields[j].value + '</p>';
                  } else if (colHeader2.startsWith("kitab")) {
                    pdfHTML += '<p style="font-weight:600;font-size:15pt;margin:8px 0 2px">' + fields[j].value + '</p>';
                  } else if (colHeader2.startsWith("bab")) {
                    pdfHTML += '<p style="font-weight:600;margin:6px 0 2px">' + fields[j].value + '</p>';
                  } else if (colHeader2.startsWith("sharh")) {
                    pdfHTML += '<p style="font-size:12.5pt">' + fields[j].value + '</p>';
                  } else {
                    pdfHTML += "<p>" + fields[j].value + "</p>";
                  }
                } else {
                  pdfHTML += "<p>" + fields[j].value + "</p>";
                }
              }
              pdfHTML += "<hr>";
            }
            pdfHTML += "</body></html>";
            var w = window.open("", "_blank");
            w.document.write(pdfHTML);
            w.document.close();
            w.onload = function () { w.print(); };
          } else if (fmt === "png") {
            var vRow = visiblePageIndex();
            var rc = document.getElementById("readerContent");
            var bg = getComputedStyle(rc).backgroundColor;
            var fg = getComputedStyle(rc).color;
            var chunk = rc.querySelector('.reader-chunk[data-row="' + vRow + '"]');
            if (!chunk) { exportDropdown.style.display = "none"; return; }
            // Load font as base64 so canvas isn't tainted
            fetch("../font/merged-300.woff2").then(function(r){return r.blob();}).then(function(blob){
              var reader = new FileReader();
              reader.onload = function() {
                var fontData = reader.result;
                var clone = chunk.cloneNode(true);
                var wrapper = document.createElement("div");
                wrapper.style.cssText = "position:absolute;left:0;top:0;width:600px;font-family:Hadithmv,'Traditional Arabic',serif;direction:rtl;text-align:right;background:" + bg + ";color:" + fg;
                var footerText = metadata.titleDV + "<br>" + metadata.titleAR + "<br>" + siteURL + "<br>Hadithmv · " + versionText;
                wrapper.style.cssText = "position:absolute;left:0;top:0;width:600px;font-family:Hadithmv,'Traditional Arabic',serif;direction:rtl;text-align:right;background:" + bg + ";color:" + fg + ";padding:0";
                var contentDiv = document.createElement("div");
                contentDiv.style.cssText = "padding:32px 32px 0 32px;font-size:17pt;line-height:2.3;text-align:right;direction:rtl";
                contentDiv.innerHTML = clone.outerHTML;
                var footerDiv = document.createElement("div");
                footerDiv.style.cssText = "text-align:center;padding:20px 32px;font-size:13pt;line-height:1.8;direction:rtl;margin-top:8px";
                footerDiv.textContent = metadata.titleDV + "\n" + metadata.titleAR + "\n" + siteURL + "\nHadithmv · " + versionText;
                footerDiv.style.whiteSpace = "pre-line";
                wrapper.appendChild(contentDiv);
                wrapper.appendChild(footerDiv);
                document.body.appendChild(wrapper);
                var rect = wrapper.getBoundingClientRect();
                var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + rect.width + '" height="' + rect.height + '">' +
                  '<defs><style>@font-face{font-family:Hadithmv;src:url(' + fontData + ') format("woff2");font-weight:300}</style></defs>' +
                  '<foreignObject width="100%" height="100%">' +
                  '<div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Hadithmv">' + wrapper.innerHTML + '</div>' +
                  '</foreignObject></svg>';
                var img = new Image();
                img.onload = function () {
                  var canvas = document.createElement("canvas");
                  canvas.width = rect.width * 2;
                  canvas.height = rect.height * 2;
                  var ctx = canvas.getContext("2d");
                  ctx.scale(2, 2);
                  ctx.fillStyle = bg;
                  ctx.fillRect(0, 0, rect.width, rect.height);
                  ctx.drawImage(img, 0, 0);
                  canvas.toBlob(function (b) {
                    var u = URL.createObjectURL(b);
                    var a = document.createElement("a");
                    a.href = u; a.download = baseName + ".png";
                    document.body.appendChild(a); a.click();
                    document.body.removeChild(a); URL.revokeObjectURL(u);
                    document.body.removeChild(wrapper);
                  }, "image/png");
                };
                img.src = "data:image/svg+xml," + encodeURIComponent(svg);
              };
              reader.readAsDataURL(blob);
            });
            exportDropdown.style.display = "none";
            return;
          } else if (fmt === "excel") {
            exportDropdown.style.display = "none";
            import("./xlsx.js").then(function(mod) {
              var xlsxBlob = mod.createXLSX(rowsWithHeader, baseName);
              var u = URL.createObjectURL(xlsxBlob);
              var a = document.createElement("a");
              a.href = u; a.download = baseName + ".xlsx";
              document.body.appendChild(a); a.click();
              document.body.removeChild(a); URL.revokeObjectURL(u);
            });
            return;
          } else if (fmt === "epub") {
            exportDropdown.style.display = "none";
            // Fetch font for embedding before loading the EPUB module
            fetch("../font/merged-300.woff2")
              .then(function(r) { return r.ok ? r.arrayBuffer() : null; })
              .then(function(fontBuf) {
                return import("./epub.js").then(function(mod) {
                  var epubBlob = mod.createEPUB(rows, {
                    bookCode: metadata.bookCode,
                    titleEN: metadata.titleEN,
                    titleDV: metadata.titleDV,
                    titleAR: metadata.titleAR,
                    tags: pageTags.map(function(t) { return t.code; })
                  }, {
                    siteURL: siteURL,
                    versionText: versionText,
                    fontData: fontBuf ? new Uint8Array(fontBuf) : null,
                    headerRow: headerRow
                  });
                  var u = URL.createObjectURL(epubBlob);
                  var a = document.createElement("a");
                  a.href = u; a.download = baseName + ".epub";
                  document.body.appendChild(a); a.click();
                  document.body.removeChild(a); URL.revokeObjectURL(u);
                });
              });
            return;
          } else if (fmt === "yaml") {
            var y = "# " + (metadata.titleEN || baseName) + "\n# " + metadata.titleDV + " - " + metadata.titleAR + "\n# " + siteURL + "\n# Hadithmv · " + versionText + "\n---\n";
            for (var i = 0; i < rows.length; i++) {
              var r = rows[i];
              y += "- id: " + (hasRowNums ? (r[0] || (i + 1)) : (i + 1)) + "\n  fields:\n";
              for (var j = (hasRowNums ? 1 : 0); j < r.length; j++) {
                if (r[j] != null && String(r[j]).trim()) {
                  y += "    - |\n      " + String(r[j]).trim().replace(/\n/g, "\n      ") + "\n";
                }
              }
            }
            downloadFile(y, baseName + ".yaml", "text/yaml");
          } else if (fmt === "toon") {
            var to = "[" + rows.length + "]:\n";
            for (var i = 0; i < rows.length; i++) {
              var r = rows[i];
              var vals = [];
              for (var j = 0; j < r.length; j++) {
                if (r[j] == null || String(r[j]).trim() === "") {
                  vals.push("null");
                } else {
                  var v = String(r[j]).trim();
                  vals.push(/[\s,:"\\\[\]{}]/.test(v) || v === "true" || v === "false" || v === "null" || /^-?\d+(?:\.\d+)?(?:e[+\-]?\d+)?$/i.test(v) ? JSON.stringify(v) : v);
                }
              }
              to += "  - [" + vals.length + "]: " + vals.join(",") + "\n";
            }
            downloadFile(to, baseName + ".toon", "text/plain");
          } else if (fmt === "html") {
            var htmlExport = '<!doctype html><html dir="rtl"><head><meta charset="utf-8"><title>' + (metadata.titleEN || baseName) + '</title><style>@font-face{font-family:Hadithmv;src:url(../font/merged-300.woff2) format("woff2");font-weight:300} body{font-family:Hadithmv,"Traditional Arabic","Scheherazade New",serif;font-size:14pt;line-height:2.2;padding:24px;max-width:700px;margin:0 auto;direction:rtl;background:#fff;color:#1a202c} h1{text-align:center;font-size:18pt;margin-bottom:4px} h2{font-size:11pt;color:#888;margin:28px 0 4px} p{margin:6px 0} .sharh{font-size:12.5pt} hr{border:none;border-top:1px solid #ddd;margin:20px 0} .ms-sep{text-align:center;color:#bbb;margin:10px 0;font-size:8pt;letter-spacing:3px} .hd{text-align:center;font-size:10pt;color:#999;margin-bottom:24px} .sep{text-align:center;color:#ccc;margin:20px 0}</style></head><body>';
            htmlExport += '<h1>' + metadata.titleDV + '</h1><p style="text-align:center">' + metadata.titleAR + '</p>';
            htmlExport += '<div class="hd">' + siteURL + '<br>Hadithmv · ' + versionText + '</div><hr>';
            for (var i = 0; i < rows.length; i++) {
              var r = rows[i];
              htmlExport += '<h2>#' + (hasRowNums ? (r[0] || (i + 1)) : (i + 1)) + '</h2>';
              var expPrevHdr = "";
              for (var j = (hasRowNums ? 1 : 0); j < r.length; j++) {
                if (r[j] != null && String(r[j]).trim()) {
                  var expHdr = (headerRow && headerRow[j]) ? headerRow[j].toLowerCase() : "";
                  if (expPrevHdr.startsWith("matn") && expHdr.startsWith("sharh")) htmlExport += '<div class="ms-sep">· · ·</div>';
                  if (expHdr.startsWith("sharh")) {
                    htmlExport += '<p class="sharh">' + String(r[j]).trim() + '</p>';
                  } else {
                    htmlExport += '<p>' + String(r[j]).trim() + '</p>';
                  }
                  expPrevHdr = expHdr;
                }
              }
              if (i < rows.length - 1) htmlExport += '<div class="sep">◆</div>';
            }
            htmlExport += '</body></html>';
            downloadFile(htmlExport, baseName + ".html", "text/html");
          } else if (fmt === "html-table") {
            var ht = '<!doctype html><html dir="rtl"><head><meta charset="utf-8"><title>' + (metadata.titleEN || baseName) + '</title><style>@font-face{font-family:Hadithmv;src:url(../font/merged-300.woff2) format("woff2");font-weight:300} body{font-family:Hadithmv,"Traditional Arabic","Scheherazade New",serif;font-size:12pt;line-height:1.8;padding:16px;direction:rtl;background:#fff;color:#1a202c} h1{text-align:center;font-size:16pt;margin-bottom:4px} table{width:100%;border-collapse:collapse;direction:rtl} th,td{padding:6px 8px;border:1px solid #ddd;text-align:right;vertical-align:top} th{background:#f5f5f5;font-weight:700;font-size:10pt;white-space:nowrap} .hd{text-align:center;font-size:9pt;color:#999;margin-bottom:16px}</style></head><body>';
            ht += '<h1>' + metadata.titleDV + '</h1><p style="text-align:center">' + metadata.titleAR + '</p>';
            ht += '<div class="hd">' + siteURL + '<br>Hadithmv · ' + versionText + '</div>';
            ht += '<table><thead><tr>';
            if (headerRow) {
              for (var ci = 0; ci < headerRow.length; ci++) {
                ht += '<th>' + (headerRow[ci] || "").replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</th>';
              }
            }
            ht += '</tr></thead><tbody>';
            for (var ri = 0; ri < rows.length; ri++) {
              ht += '<tr>';
              for (var cj = 0; cj < rows[ri].length; cj++) {
                var cv = rows[ri][cj] != null ? String(rows[ri][cj]).trim() : "";
                ht += '<td>' + cv.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</td>';
              }
              ht += '</tr>';
            }
            ht += '</tbody></table></body></html>';
            downloadFile(ht, baseName + "-table.html", "text/html");
          } else if (fmt === "xml") {
            var xml = '<?xml version="1.0" encoding="UTF-8"?>\n<book>\n';
            xml += '  <title><dv>' + (metadata.titleDV || "") + '</dv><ar>' + (metadata.titleAR || "") + '</ar><en>' + (metadata.titleEN || "") + '</en></title>\n';
            xml += '  <meta><url>' + siteURL + '</url><version>' + versionText + '</version></meta>\n';
            xml += '  <rows>\n';
            for (var i = 0; i < rows.length; i++) {
              var r = rows[i];
              xml += '    <row id="' + (hasRowNums ? (r[0] || (i + 1)) : (i + 1)) + '">\n';
              for (var j = (hasRowNums ? 1 : 0); j < r.length; j++) {
                if (r[j] != null && String(r[j]).trim()) {
                  xml += '      <col' + j + '>' + String(r[j]).trim().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</col' + j + '>\n';
                }
              }
              xml += '    </row>\n';
            }
            xml += '  </rows>\n</book>';
            downloadFile(xml, baseName + ".xml", "application/xml");
          } else if (fmt === "word") {
            content = '<html dir="rtl"><head><meta charset="utf-8"><style>body{font-family:"Traditional Arabic","Scheherazade New",serif;font-size:14pt;line-height:2;padding:20px;direction:rtl} h2{font-size:12pt;color:#666}</style></head><body>';
            content += '<p style="text-align:center;font-size:10pt;color:#999">Hadithmv - ' + siteURL + ' - ' + versionText + '</p>';
            content += "<h1>" + metadata.titleDV + " - " + metadata.titleAR + "</h1>";
            for (var i = 0; i < rows.length; i++) {
              var r = rows[i];
              content += "<h2>" + (hasRowNums ? "#" : "") + (hasRowNums ? (r[0] || (i + 1)) : (i + 1)) + "</h2>";
              var fields = [];
              for (var j = (hasRowNums ? 1 : 0); j < r.length; j++) {
                if (r[j] && String(r[j]).trim()) fields.push({ value: String(r[j]).trim(), index: j });
              }
              for (var j = 0; j < fields.length; j++) {
                var colHeader3 = (headerRow && headerRow[fields[j].index]) ? headerRow[fields[j].index].toLowerCase() : "";
                if (j > 0) {
                  var prevHdr3 = (headerRow && headerRow[fields[j - 1].index]) ? headerRow[fields[j - 1].index].toLowerCase() : "";
                  if (prevHdr3.endsWith("ar") && colHeader3.endsWith("dv")) content += "<p>&nbsp;</p>";
                  if (prevHdr3.startsWith("matn") && colHeader3.startsWith("sharh")) content += '<p style="text-align:center;color:#bbb;margin:6px 0;font-size:8pt;letter-spacing:3px">· · ·</p>';
                }
                if (colHeader3.startsWith("foot") && fields.length > 1) content += '<p style="color:#999;font-size:11pt">ــــــــــــــــــــــــــــــــــــــــــــ</p>';
                if (!colHeader3.startsWith("foot")) {
                  if (colHeader3.startsWith("head")) {
                    content += '<p style="font-size:17pt;font-weight:700;margin:12px 0 2px">' + fields[j].value + '</p>';
                  } else if (colHeader3.startsWith("kitab")) {
                    content += '<p style="font-weight:600;font-size:15pt;margin:8px 0 2px">' + fields[j].value + '</p>';
                  } else if (colHeader3.startsWith("bab")) {
                    content += '<p style="font-weight:600;margin:6px 0 2px">' + fields[j].value + '</p>';
                  } else if (colHeader3.startsWith("sharh")) {
                    content += '<p style="font-size:12.5pt">' + fields[j].value + '</p>';
                  } else {
                    content += "<p>" + fields[j].value + "</p>";
                  }
                } else {
                  content += "<p>" + fields[j].value + "</p>";
                }
              }
              content += "<hr>";
            }
            content += "</body></html>";
            filename = baseName + ".doc";
            mime = "application/msword";
          }
          if (content) downloadFile(content, filename, mime);
          exportDropdown.style.display = "none";
        });
      });

      // ── Toolbar: reset ──────────────────────────────────────
      btnReset.addEventListener("click", function () {
        // Clear search
        searchInput.value = "";
        applySearch("");
        // Reset rows per page
        // Show all columns
        hiddenColumns = [];
        LS.set("hiddenColumns", []);
        buildColumnToggles();
        // Show tashkeel
        hideTashkeel = false;
        LS.set("hideTashkeel", false);
        btnTashkeel.classList.remove("active");
        readerContent.classList.remove("hide-tashkeel");
        // Reset table mode to default for this book
        isTableMode = metadata.bookCode && metadata.bookCode.indexOf("RDF-") === 0 && window.innerWidth > 600;
        if (btnViewToggle) btnViewToggle.textContent = t(isTableMode ? "btnViewToggleCard" : "btnViewToggleText");
        // Go to page 1 without scrolling
        rebuildAll();
      });

      // ── Navigation: buttons ─────────────────────────────────
      [
        "firstBtn",
        "prevBtn",
        "nextBtn",
        "lastBtn",
        "firstBtnBottom",
        "prevBtnBottom",
        "nextBtnBottom",
        "lastBtnBottom",
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

        if (document.activeElement && document.activeElement.classList.contains("page-strip-sel")) return;

        var vRow = visiblePageIndex();
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          goTo(vRow - 1);
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          goTo(vRow + 1);
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
          document.getElementById("settingsOverlay").classList.add("open");
        }
        if (e.key === "e" && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          document.getElementById("btnExport").click();
        }
        if (e.key === "b" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          window.location.href = "index.html";
        }
        if (e.key === "s" && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          document.getElementById("btnShare").click();
        }
        if (e.key === "z" && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setFocus(!document.documentElement.hasAttribute("data-focus"));
        }
        if (e.key === "t" && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          btnTashkeel.click();
        }
        if (e.key === "v" && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          var vtBtn = document.getElementById("btnViewToggle");
          if (vtBtn) vtBtn.click();
        }
        if (e.key === "p" && !e.ctrlKey && !e.metaKey) {
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

      // ── Settings reset from modal → re-render ─────────────
      document.addEventListener("readerset", function () {
        ROWS_PER_CHUNK = 25;
        hideTashkeel = false;
        btnTashkeel.classList.remove("active");
        readerContent.classList.remove("hide-tashkeel");
        hiddenColumns = [];
        buildColumnToggles();
        searchInput.value = "";
        applySearch("");
        setFocus(false);
        rebuildAll();
      });

      // ── Language change → re-render ───────────────────────
      document.addEventListener("languagechange", function () {
        buildColumnToggles();
        // Update focus and view toggle button text
        var btn = document.getElementById("btnFocus");
        var on = document.documentElement.hasAttribute("data-focus");
        if (btn) btn.textContent = on ? "▼" : "↕";
        var vtBtn = document.getElementById("btnViewToggle");
        if (vtBtn) vtBtn.textContent = t(isTableMode ? "btnViewToggleCard" : "btnViewToggleText");
        if (filteredData.length > 0) rebuildAll();
      });

      // ── Quran UI ───────────────────────────────────────────
      if (quranBook) {
        var quranCtx = {
          metadata: metadata,
          headerRow: headerRow,
          allData: allData,
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
      // Scroll-driven pagination update
      var scrollCounter = document.getElementById("scrollCounter");
      var scrollTimer;
      var urlSyncTimer;
      var historyTimer;
      var _lastHistoryRow = 0;

      // Initial history log
      var _initRow = visiblePageIndex() + 1;
      addReadHistory(metadata.bookCode, _initRow);
      _lastHistoryRow = _initRow;

      window.addEventListener("scroll", function () {
        updatePagination();
        if (scrollCounter) {
          var vRow = visiblePageIndex();
          var total = filteredData.length;
          scrollCounter.innerHTML = '<span class="sc-n">' + total + '</span> / <span class="sc-n">' + (vRow + 1) + '</span>';
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
            addReadHistory(metadata.bookCode, vRow + 1);
            if (isPinned(metadata.bookCode)) addPin(metadata.bookCode, vRow + 1);
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