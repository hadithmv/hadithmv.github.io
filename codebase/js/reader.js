/**
 * Reader Module
 *
 * Book viewer: loads CSV data via PapaParse, renders vertical reading cards,
 * provides pagination, full-text search, copy-to-clipboard, tashkeel toggle,
 * rows-per-page control, and per-column visibility toggles.
 */

import {
  initializePageWithMetadata,
  extractTags,
} from "./dbLookup.js";

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

      // Populate page header
      document.getElementById("pageTitle").textContent =
        metadata.titleEN || metadata.bookCode;
      document.getElementById("pageSubtitle").textContent =
        metadata.titleAR || "";
      document.getElementById("pageSubsubtitle").textContent =
        metadata.titleDV || "";

      // Render tags in page header
      const pageTagsContainer = document.getElementById("pageTags");
      const tags = extractTags(metadata.bookCode);
      if (tags.length > 0) {
        pageTagsContainer.innerHTML = tags
          .map(
            (t) =>
              `<span class="tag-badge" style="color:${t.color};background:${t.bg}">${t.label}</span>`,
          )
          .join("");
      }

      // ── Settings (persisted) ────────────────────────────────
      const LS = {
        get(key, fallback) {
          try { const v = localStorage.getItem("reader:" + key); return v !== null ? JSON.parse(v) : fallback; }
          catch (_) { return fallback; }
        },
        set(key, val) {
          try { localStorage.setItem("reader:" + key, JSON.stringify(val)); } catch (_) {}
        },
      };

      let rowsPerPage   = LS.get("rowsPerPage", 1);
      let hideTashkeel  = LS.get("hideTashkeel", false);
      let hiddenColumns = LS.get("hiddenColumns", []);

      // ── Reader state ────────────────────────────────────────
      const allData = data;
      let filteredData   = allData;
      let currentPage    = 0;

      // DOM refs
      const searchInput     = document.getElementById("searchInput");
      const searchClear     = document.getElementById("searchClear");
      const searchInfo      = document.getElementById("searchInfo");
      const pageInput       = document.getElementById("pageInput");
      const pageList        = document.getElementById("pageList");
      const pageOfTotal     = document.getElementById("pageOfTotal");
      const pageOfTotalBtm  = document.getElementById("pageOfTotalBottom");
      const selRowsPerPage  = document.getElementById("selRowsPerPage");
      const btnTashkeel     = document.getElementById("btnTashkeel");
      const btnCopy         = document.getElementById("btnCopy");
      const columnToggles   = document.getElementById("columnToggles");
      const columnTogglesGrp= document.getElementById("columnTogglesGroup");
      const readerContent   = document.getElementById("readerContent");

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
        if (idx === maxCols - 1) return "Notes";
        return "C" + (idx + 1);
      }

      // ── Column toggle buttons ───────────────────────────────
      function buildColumnToggles() {
        columnToggles.innerHTML = "";
        for (let i = 1; i < maxCols; i++) {
          const btn = document.createElement("button");
          btn.className = "col-toggle" + (hiddenColumns.indexOf(i) !== -1 ? " off" : "");
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
        if (maxCols > 1) columnTogglesGrp.style.display = "";
      }
      buildColumnToggles();

      // ── Tashkeel helpers ────────────────────────────────────
      // Unicode ranges for Arabic diacritics / tashkeel
      const TASHKEEL_RE = /[ً-ٟؐ-ؚۖ-ۭ]+/g;

      function markupTashkeel(text) {
        return text.replace(TASHKEEL_RE, '<span class="tashkeel">$&</span>');
      }

      // ── Total pages (respects rowsPerPage) ─────────────────
      function totalPages() {
        return Math.ceil(filteredData.length / rowsPerPage);
      }

      // ── Render current page ─────────────────────────────────
      function renderPage(pageIdx) {
        const start = pageIdx * rowsPerPage;
        const rows  = filteredData.slice(start, start + rowsPerPage);
        if (rows.length === 0) {
          readerContent.innerHTML = "";
          updatePagination();
          return;
        }

        let html = "";
        for (let r = 0; r < rows.length; r++) {
          if (r > 0) html += `<hr class="reader-page-sep" />`;
          const row = rows[r];
          const rowNum = row[0] || (start + r + 1);
          html += `<div class="reader-row-num">#${rowNum}</div>`;

          // Collect visible, non-empty columns (skip col 0)
          const fields = [];
          for (let i = 1; i < row.length; i++) {
            if (hiddenColumns.indexOf(i) !== -1) continue;
            const v = row[i];
            if (v !== null && v !== undefined && String(v).trim() !== "") {
              fields.push({ value: String(v).trim(), index: i });
            }
          }

          for (let i = 0; i < fields.length; i++) {
            const display = markupTashkeel(fields[i].value);
            if (i === fields.length - 1 && fields.length > 1) {
              html += `<div class="reader-divider"></div>`;
              html += `<div class="reader-field reader-footnotes" dir="auto">${display}</div>`;
            } else {
              html += `<div class="reader-field" dir="auto">${display}</div>`;
            }
          }
        }

        readerContent.innerHTML = html;
        updatePagination();
        readerContent.scrollIntoView({ behavior: "smooth", block: "start" });
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
        const end   = Math.min(total - 1, current + 2);
        for (let p = start; p <= end; p++) h += pageBtn(p, p === current);
        if (current < total - 3) h += `<span class="page-ellipsis">…</span>`;
        h += pageBtn(total, current === total);
        return h;
      }

      function updatePagination() {
        const total = totalPages();
        const cur   = currentPage + 1; // 1-based

        const strip = pageNumbersHTML(cur, total);
        document.getElementById("pageNumbers").innerHTML = strip;
        document.getElementById("pageNumbersBottom").innerHTML = strip;

        document.querySelectorAll(".page-num").forEach(function (btn) {
          btn.addEventListener("click", function () {
            goTo(parseInt(this.dataset.page) - 1);
          });
        });

        const atFirst = currentPage === 0;
        const atLast  = currentPage === total - 1;
        [
          "firstBtn","prevBtn","nextBtn","lastBtn",
          "firstBtnBottom","prevBtnBottom","nextBtnBottom","lastBtnBottom",
        ].forEach(function (id, i) {
          document.getElementById(id).disabled = i % 4 < 2 ? atFirst : atLast;
        });

        let cnt = `Page ${cur} of ${total}`;
        const query = searchInput.value.trim();
        if (query && total !== Math.ceil(allData.length / rowsPerPage)) {
          cnt += ` · ${filteredData.length} match${filteredData.length === 1 ? "" : "es"}`;
        }
        if (pageOfTotal) pageOfTotal.textContent = cnt;
        if (pageOfTotalBtm)
          pageOfTotalBtm.textContent = `Page ${cur} of ${total}`;

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
      }

      // ── Search ──────────────────────────────────────────────
      function applySearch(query) {
        const q = query.trim();
        if (!q) {
          filteredData = allData;
          currentPage = 0;
          searchClear.style.display = "none";
          searchInfo.style.display = "none";
        } else {
          const lower = q.toLowerCase();
          filteredData = allData.filter(function (row) {
            return row.some(function (cell) {
              return (
                cell !== null && cell !== undefined &&
                String(cell).toLowerCase().indexOf(lower) !== -1
              );
            });
          });
          currentPage = 0;
          searchClear.style.display = "";
          searchInfo.style.display = "";
          searchInfo.textContent = filteredData.length === 0
            ? "No matches"
            : filteredData.length + " match" + (filteredData.length === 1 ? "" : "es");
        }
        if (filteredData.length === 0) {
          readerContent.innerHTML =
            '<div class="reader-no-results">No rows match "' + query + '"</div>';
          updatePagination();
        } else {
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

      // ── Toolbar: rows per page ──────────────────────────────
      selRowsPerPage.addEventListener("change", function () {
        const oldRows = rowsPerPage;
        const firstRowIdx = currentPage * oldRows;    // top row currently visible
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
        const text = readerContent.innerText.trim();
        if (!text) return;
        navigator.clipboard.writeText(text).then(function () {
          showToast("Copied!");
        }).catch(function () {
          // Fallback for older browsers / non-HTTPS
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed"; ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); showToast("Copied!"); }
          catch (_) { showToast("Copy failed"); }
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

      // ── Navigation: buttons ─────────────────────────────────
      [
        "firstBtn","prevBtn","nextBtn","lastBtn",
        "firstBtnBottom","prevBtnBottom","nextBtnBottom","lastBtnBottom",
      ].forEach(function (id) {
        const delta = id.indexOf("first") === 0 ? -1e9
                    : id.indexOf("prev")  === 0 ? -1
                    : id.indexOf("next")  === 0 ? 1
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
        if (
          document.activeElement === searchInput ||
          document.activeElement === pageInput
        ) return;

        if (e.key === "ArrowLeft")  { e.preventDefault(); goTo(currentPage - 1); }
        if (e.key === "ArrowRight") { e.preventDefault(); goTo(currentPage + 1); }
        if (e.key === "Home")       { e.preventDefault(); goTo(0); }
        if (e.key === "End")        { e.preventDefault(); goTo(totalPages() - 1); }
        if (e.key === "/" || (e.key === "f" && (e.ctrlKey || e.metaKey))) {
          e.preventDefault();
          searchInput.focus();
          searchInput.select();
        }
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
