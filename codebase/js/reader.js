/**
 * Reader Module
 *
 * Book viewer: loads CSV data via PapaParse, renders vertical reading cards,
 * provides pagination, full-text search, copy-to-clipboard, tashkeel toggle,
 * rows-per-page control, and per-column visibility toggles.
 */

import { initializePageWithMetadata, extractTags } from "./dbLookup.js";
import { t, tagLabel, currentLang } from "./i18n.js";

initializePageWithMetadata(async function (metadata) {
  document.title = metadata.titleEN || metadata.bookCode;

  Papa.parse(metadata.csvPath, {
    download: true,
    header: false,
    dynamicTyping: true,
    complete: function (results) {
      const data = results.data.filter(
        (row) =>
          Array.isArray(row) &&
          row.some((value) => value !== null && value !== ""),
      );

      if (data.length === 0) {
        showError("No data found in CSV file: " + metadata.csvPath);
        return;
      }

      // Detect and remove a header row (convention: first field is "#")
      let headerRow = null;
      if (data.length > 0 && data[0][0] === "#") {
        headerRow = data.shift();
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
          return '<span class="tag-badge" style="color:' + t.color + ';background:' + t.bg + '">' + label + '</span>';
        }).join("");
      }

      function updatePageHeader() {
        var lang = currentLang();
        var pageTitle = document.getElementById("pageTitle");
        var pageSubtitle = document.getElementById("pageSubtitle");
        var pageSubRow = document.getElementById("pageSubRow");

        var pageHeader = document.getElementById("pageHeader");
        if (lang === "en") {
          pageHeader.style.display = "";
          pageTitle.textContent = metadata.titleEN || metadata.bookCode;
          pageTitle.dir = "ltr";
          pageTitle.style.margin = "";
          pageSubtitle.style.display = "none";
          pageSubRow.style.display = "";
          pageSubRow.style.justifyContent = "";
          pageSubRow.style.margin = "";
        } else if (lang === "dv") {
          pageHeader.style.display = "flex";
          pageHeader.style.flexDirection = "column";
          pageHeader.style.alignItems = "flex-end";
          pageHeader.style.paddingTop = "8px";
          pageTitle.textContent = metadata.titleDV || metadata.bookCode;
          pageTitle.dir = "rtl";
          pageTitle.style.margin = "0 56px 6px 0";
          pageSubtitle.textContent = metadata.titleAR || "";
          pageSubtitle.style.display = "";
          pageSubtitle.dir = "rtl";
          pageSubRow.style.display = "flex";
          pageSubRow.style.justifyContent = "flex-end";
          pageSubRow.style.margin = "0 56px 0 0";
          pageSubRow.style.gap = "10px";
          pageSubRow.dir = "";
          pageSubtitle.style.order = "2";
          pageTagsContainer.style.order = "1";
        } else if (lang === "ar") {
          pageHeader.style.display = "";
          pageTitle.textContent = metadata.titleAR || metadata.bookCode;
          pageTitle.dir = "rtl";
          pageTitle.style.margin = "";
          pageSubtitle.style.display = "none";
          pageSubRow.style.display = "";
          pageSubRow.style.justifyContent = "";
          pageSubRow.style.margin = "";
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

      let rowsPerPage = LS.get("rowsPerPage", 1);
      let hideTashkeel = LS.get("hideTashkeel", false);
      let hiddenColumns = LS.get("hiddenColumns", []);

      // ── Reader state ────────────────────────────────────────
      const allData = data;
      let filteredData = allData;
      let currentPage = 0;

      // DOM refs
      const searchInput = document.getElementById("searchInput");
      const searchClear = document.getElementById("searchClear");
      const searchInfo = document.getElementById("searchInfo");
      const searchResults = document.getElementById("searchResults");
      const pageInput = document.getElementById("pageInput");
      const pageList = document.getElementById("pageList");
      const pageOfTotal = document.getElementById("pageOfTotal");
      const pageOfTotalBtm = document.getElementById("pageOfTotalBottom");
      const selRowsPerPage = document.getElementById("selRowsPerPage");
      const btnTashkeel = document.getElementById("btnTashkeel");
      const btnCopy = document.getElementById("btnCopy");
      const btnReset = document.getElementById("btnReset");
      const columnToggles = document.getElementById("columnToggles");
      const columnTogglesGrp = document.getElementById("columnTogglesGroup");
      const readerContent = document.getElementById("readerContent");

      // Init UI controls from persisted state
      selRowsPerPage.value = rowsPerPage;
      if (hideTashkeel) {
        btnTashkeel.classList.add("active");
        readerContent.classList.add("hide-tashkeel");
      }

      // ── Column info ─────────────────────────────────────────
      const maxCols = allData.reduce((m, r) => Math.max(m, r.length), 0);
      function colLabel(idx) {
        if (headerRow && headerRow[idx]) return headerRow[idx];
        if (idx === 0) return "#";
        if (idx === maxCols - 1) return t("colNotes");
        return "" + idx;
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
            renderPage(currentPage);
          });
          columnToggles.appendChild(btn);
        }
        if (maxCols > 0) columnTogglesGrp.style.display = "";
      }
      buildColumnToggles();

      // ── Tashkeel helpers ────────────────────────────────────
      // Unicode ranges for Arabic diacritics / tashkeel
      const TASHKEEL_RE = /[ً-ٟؐ-ؚۖ-ۭ]+/g;

      function markupTashkeel(text) {
        return text.replace(TASHKEEL_RE, '<span class="tashkeel">$&</span>');
      }

      // ── Search highlight ───────────────────────────────────
      function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }

      function highlightMatches(text, query) {
        if (!query) return text;
        const re = new RegExp("(" + escapeRegex(query) + ")", "gi");
        return text.replace(re, "<mark>$1</mark>");
      }

      // ── Total pages (respects rowsPerPage) ─────────────────
      function totalPages() {
        return Math.ceil(filteredData.length / rowsPerPage);
      }

      // ── Render current page ─────────────────────────────────
      let pageText = ""; // plain-text copy of current page (no tashkeel spans)

      function renderPage(pageIdx) {
        const start = pageIdx * rowsPerPage;
        const rows = filteredData.slice(start, start + rowsPerPage);
        if (rows.length === 0) {
          readerContent.innerHTML = "";
          pageText = "";
          updatePagination();
          return;
        }

        let html = "";
        let text = clipboardHeader + "\n\n";
        for (let r = 0; r < rows.length; r++) {
          if (r > 0) {
            html += `<hr class="reader-page-sep" />`;
            text += "\n";
          }
          const row = rows[r];
          const rowNum = row[0] || start + r + 1;
          if (hiddenColumns.indexOf(0) === -1) {
            html += `<div class="reader-row-num">#${rowNum}</div>`;
            text += `#${rowNum}\n\n`;
          }

          // Collect visible, non-empty columns (skip col 0)
          const fields = [];
          for (let i = 1; i < row.length; i++) {
            if (hiddenColumns.indexOf(i) !== -1) continue;
            const v = row[i];
            if (v !== null && v !== undefined && String(v).trim() !== "") {
              fields.push({ value: String(v).trim(), index: i });
            }
          }

          const query = searchInput.value.trim();
          for (let i = 0; i < fields.length; i++) {
            const display = markupTashkeel(
              highlightMatches(fields[i].value, query),
            );
            if (i === fields.length - 1 && fields.length > 1) {
              html += `<div class="reader-divider"></div>`;
              html += `<div class="reader-field reader-footnotes" dir="auto">${display}</div>`;
              text += "ــــــــــــــــــــــــــــــــــــــــــــ\n";
            } else {
              html += `<div class="reader-field" dir="auto">${display}</div>`;
            }
            text += fields[i].value + "\n\n";
          }
        }

        readerContent.innerHTML = html;
        pageText = text.trim();
        updatePagination();
      }

      // ── Pagination UI ───────────────────────────────────────
      function pageBtn(page, active) {
        return `<button class="page-num${active ? " active" : ""}" data-page="${page}">${page}</button>`;
      }

      function pageNumbersHTML(current, total) {
        if (total <= 1) return "";
        if (total <= 9) {
          let h = "";
          for (let p = 1; p <= total; p++) h += pageBtn(p, p === current);
          return h;
        }
        let h = pageBtn(1, current === 1);
        if (current > 4) h += `<span class="page-ellipsis">…</span>`;
        const start = Math.max(2, current - 2);
        const end = Math.min(total - 1, current + 2);
        for (let p = start; p <= end; p++) h += pageBtn(p, p === current);
        if (current < total - 3) h += `<span class="page-ellipsis">…</span>`;
        h += pageBtn(total, current === total);
        return h;
      }

      function updatePagination() {
        const total = totalPages();
        const cur = currentPage + 1; // 1-based

        const strip = pageNumbersHTML(cur, total);
        document.getElementById("pageNumbers").innerHTML = strip;
        document.getElementById("pageNumbersBottom").innerHTML = strip;

        document.querySelectorAll(".page-num").forEach(function (btn) {
          btn.addEventListener("click", function () {
            goTo(parseInt(this.dataset.page) - 1);
          });
        });

        const atFirst = currentPage === 0;
        const atLast = currentPage === total - 1;
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

        let cnt = `${t("pageOf")} ${cur} / ${total}`;
        if (pageOfTotal) pageOfTotal.textContent = cnt;
        if (pageOfTotalBtm)
          pageOfTotalBtm.textContent = `${t("pageOf")} ${cur} / ${total}`;

        if (pageInput) {
          pageInput.max = total;
          pageInput.value = cur;
        }

        if (pageList && pageList.options.length !== total) {
          pageList.innerHTML = "";
          for (let p = 1; p <= total; p++) {
            const opt = document.createElement("option");
            opt.value = p;
            pageList.appendChild(opt);
          }
        }
      }

      function goTo(pageIdx) {
        const total = totalPages();
        if (total === 0) return;
        if (pageIdx < 0) pageIdx = 0;
        if (pageIdx >= total) pageIdx = total - 1;
        currentPage = pageIdx;
        renderPage(currentPage);
        readerContent.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      // ── Search ──────────────────────────────────────────────
      let selectedResultIdx = -1; // index within searchResults DOM children

      function buildSnippets(row, q) {
        // Return one snippet per matching column
        const lower = q.toLowerCase();
        var results = [];
        for (let i = 0; i < row.length; i++) {
          const cell = row[i];
          if (cell === null || cell === undefined) continue;
          const str = String(cell);
          const pos = str.toLowerCase().indexOf(lower);
          if (pos === -1) continue;
          var start = Math.max(0, pos - 150);
          var end = Math.min(str.length, pos + q.length + 150);
          var snip =
            (start > 0 ? "…" : "") +
            str.slice(start, end) +
            (end < str.length ? "…" : "");
          results.push(highlightMatches(snip, q));
        }
        return results;
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
        const q = query.trim();
        if (!q) {
          filteredData = allData;
          currentPage = 0;
          searchClear.style.display = "none";
          searchInfo.style.display = "none";
          searchResults.style.display = "none";
        } else {
          const lower = q.toLowerCase();
          filteredData = allData.filter(function (row) {
            return row.some(function (cell) {
              return (
                cell !== null &&
                cell !== undefined &&
                String(cell).toLowerCase().indexOf(lower) !== -1
              );
            });
          });
          currentPage = 0;
          searchClear.style.display = "";
          searchInfo.style.display = "";
          searchInfo.textContent =
            filteredData.length === 0
              ? t("noResults")
              : t("resultCount") + ": " + filteredData.length;
        }
        if (filteredData.length === 0) {
          readerContent.innerHTML =
            '<div class="reader-no-results">' + t("noMatchesMsg") + ': "' +
            query +
            '"</div>';
          pageText = t("noMatchesMsg") + ': "' + query + '"';
          searchResults.style.display = "none";
          updatePagination();
        } else {
          updateSearchResults(query);
          renderPage(currentPage);
        }
      }

      searchInput.addEventListener("input", function () {
        applySearch(this.value);
      });
      searchClear.addEventListener("click", function () {
        searchInput.value = "";
        applySearch("");
        searchInput.focus();
      });
      // Close results when clicking outside
      document.addEventListener("click", function (e) {
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

      // ── Toolbar: rows per page ──────────────────────────────
      selRowsPerPage.addEventListener("change", function () {
        const oldRows = rowsPerPage;
        const firstRowIdx = currentPage * oldRows; // top row currently visible
        rowsPerPage = parseInt(this.value, 10) || 1;
        LS.set("rowsPerPage", rowsPerPage);
        currentPage = Math.floor(firstRowIdx / rowsPerPage);
        renderPage(currentPage);
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
        if (filteredData.length > 0) renderPage(currentPage);
      });

      // ── Toolbar: copy to clipboard ──────────────────────────
      btnCopy.addEventListener("click", function () {
        const text = pageText;
        if (!text) return;
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

      // ── Toolbar: reset ──────────────────────────────────────
      btnReset.addEventListener("click", function () {
        // Clear search
        searchInput.value = "";
        applySearch("");
        // Reset rows per page
        rowsPerPage = 1;
        selRowsPerPage.value = 1;
        LS.set("rowsPerPage", 1);
        // Show all columns
        hiddenColumns = [];
        LS.set("hiddenColumns", []);
        buildColumnToggles();
        // Show tashkeel
        hideTashkeel = false;
        LS.set("hideTashkeel", false);
        btnTashkeel.classList.remove("active");
        readerContent.classList.remove("hide-tashkeel");
        // Go to page 1 without scrolling
        currentPage = 0;
        renderPage(0);
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
          else if (delta === 1e9) goTo(totalPages() - 1);
          else goTo(currentPage + delta);
        });
      });

      // ── Navigation: page input ──────────────────────────────
      pageInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          const v = parseInt(pageInput.value, 10);
          if (!isNaN(v) && v >= 1 && v <= totalPages()) goTo(v - 1);
          else pageInput.value = currentPage + 1;
        }
      });
      pageInput.addEventListener("change", function () {
        const v = parseInt(pageInput.value, 10);
        if (!isNaN(v) && v >= 1 && v <= totalPages()) goTo(v - 1);
        else pageInput.value = currentPage + 1;
      });

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

        if (document.activeElement === pageInput) return;

        if (e.key === "ArrowLeft") {
          e.preventDefault();
          goTo(currentPage - 1);
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          goTo(currentPage + 1);
        }
        if (e.key === "Home") {
          e.preventDefault();
          goTo(0);
        }
        if (e.key === "End") {
          e.preventDefault();
          goTo(totalPages() - 1);
        }
        if (e.key === "/" || (e.key === "f" && (e.ctrlKey || e.metaKey))) {
          e.preventDefault();
          searchInput.focus();
          searchInput.select();
        }
      });

      // ── Language change → re-render ───────────────────────
      document.addEventListener("languagechange", function () {
        buildColumnToggles();
        if (filteredData.length > 0) renderPage(currentPage);
      });

      // ── Initial render ──────────────────────────────────────
      renderPage(0);

      // Reveal everything at once
      document.getElementById("loadingMessage").style.display = "none";
      document.getElementById("pageHeader").style.display = "block";
      document.getElementById("readerWrapper").style.display = "block";
    },
    error: function (err) {
      showError("Error loading CSV: " + err);
    },
  });
});

function showError(message) {
  document.getElementById("loadingMessage").style.display = "none";
  document.getElementById("errorMessage").textContent = message;
  document.getElementById("errorMessage").style.display = "block";
  console.error(message);
}
