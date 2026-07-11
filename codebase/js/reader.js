/**
 * Reader Module
 *
 * Initialises the book viewer: loads CSV data via PapaParse, renders one
 * row at a time as a vertical reading card, and provides pagination and
 * full-text search.
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
      if (data.length > 0 && data[0][0] === "#") {
        data.shift();
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

      // ── Reader state ──────────────────────────────────────
      const allData = data;
      let filteredData = allData;
      let currentIndex = 0;
      const searchInput    = document.getElementById("searchInput");
      const searchClear    = document.getElementById("searchClear");
      const searchInfo     = document.getElementById("searchInfo");
      const pageInput      = document.getElementById("pageInput");
      const pageList       = document.getElementById("pageList");
      const pageOfTotal    = document.getElementById("pageOfTotal");
      const pageOfTotalBtm = document.getElementById("pageOfTotalBottom");

      function totalPages() {
        return filteredData.length;
      }

      // ── Render current page ────────────────────────────────
      function renderPage(index) {
        const row = filteredData[index];
        if (!row) return;

        const rowNum = row[0] || index + 1;
        let html = `<div class="reader-row-num">#${rowNum}</div>`;
        const fields = [];
        for (let i = 1; i < row.length; i++) {
          const v = row[i];
          if (v !== null && v !== undefined && String(v).trim() !== "") {
            fields.push({ value: String(v).trim() });
          }
        }
        for (let i = 0; i < fields.length; i++) {
          if (i === fields.length - 1 && fields.length > 1) {
            html += `<div class="reader-divider"></div>`;
            html +=
              `<div class="reader-field reader-footnotes" dir="auto">${fields[i].value}</div>`;
          } else {
            html +=
              `<div class="reader-field" dir="auto">${fields[i].value}</div>`;
          }
        }
        document.getElementById("readerContent").innerHTML = html;

        updatePagination();
        document
          .getElementById("readerContent")
          .scrollIntoView({ behavior: "smooth", block: "start" });
      }

      // ── Pagination UI ──────────────────────────────────────
      function pageBtn(page, active) {
        return `<button class="page-num${active ? " active" : ""}" data-page="${page}">${page}</button>`;
      }

      function pageNumbersHTML(current, total) {
        if (total <= 1) return "";
        if (total <= 9) {
          let h = "";
          for (let p = 1; p <= total; p++) {
            h += pageBtn(p, p === current);
          }
          return h;
        }
        // Sliding window: first … window … last
        let h = pageBtn(1, current === 1);
        if (current > 4) h += `<span class="page-ellipsis">…</span>`;

        const start = Math.max(2, current - 2);
        const end = Math.min(total - 1, current + 2);
        for (let p = start; p <= end; p++) {
          h += pageBtn(p, p === current);
        }

        if (current < total - 3)
          h += `<span class="page-ellipsis">…</span>`;
        h += pageBtn(total, current === total);
        return h;
      }

      function updatePagination() {
        const total = totalPages();
        const cur = currentIndex + 1; // 1-based for display

        // Page strip
        const strip = pageNumbersHTML(cur, total);
        document.getElementById("pageNumbers").innerHTML = strip;
        document.getElementById("pageNumbersBottom").innerHTML = strip;

        // Wire page-number click handlers
        document.querySelectorAll(".page-num").forEach(function (btn) {
          btn.addEventListener("click", function () {
            goTo(parseInt(this.dataset.page) - 1);
          });
        });

        // Edge buttons
        const atFirst = currentIndex === 0;
        const atLast = currentIndex === total - 1;
        document.getElementById("firstBtn").disabled = atFirst;
        document.getElementById("prevBtn").disabled = atFirst;
        document.getElementById("nextBtn").disabled = atLast;
        document.getElementById("lastBtn").disabled = atLast;
        document.getElementById("firstBtnBottom").disabled = atFirst;
        document.getElementById("prevBtnBottom").disabled = atFirst;
        document.getElementById("nextBtnBottom").disabled = atLast;
        document.getElementById("lastBtnBottom").disabled = atLast;

        // Counter text
        let cnt = `Page ${cur} of ${total}`;
        const query = searchInput.value.trim();
        if (query && total !== allData.length) {
          cnt += ` · ${total} match${total === 1 ? "" : "es"}`;
        }
        if (pageOfTotal) pageOfTotal.textContent = cnt;
        if (pageOfTotalBtm)
          pageOfTotalBtm.textContent = `Page ${cur} of ${total}`;

        // Page input
        if (pageInput) {
          pageInput.max = total;
          pageInput.value = cur;
        }

        // Datalist — rebuild when total changes
        if (pageList && pageList.options.length !== total) {
          pageList.innerHTML = "";
          for (let p = 1; p <= total; p++) {
            const opt = document.createElement("option");
            opt.value = p;
            pageList.appendChild(opt);
          }
        }
      }

      function goTo(index) {
        const total = totalPages();
        if (total === 0) return;
        if (index < 0) index = 0;
        if (index >= total) index = total - 1;
        currentIndex = index;
        renderPage(currentIndex);
      }

      // ── Search ─────────────────────────────────────────────
      function applySearch(query) {
        const q = query.trim();
        if (!q) {
          filteredData = allData;
          currentIndex = 0;
          searchClear.style.display = "none";
          searchInfo.style.display = "none";
        } else {
          const lower = q.toLowerCase();
          filteredData = allData.filter(function (row) {
            return row.some(function (cell) {
              return (
                cell !== null &&
                cell !== undefined &&
                String(cell)
                  .toLowerCase()
                  .indexOf(lower) !== -1
              );
            });
          });
          currentIndex = 0;
          searchClear.style.display = "";
          searchInfo.style.display = "";
          if (filteredData.length === 0) {
            searchInfo.textContent = "No matches";
          } else {
            searchInfo.textContent =
              filteredData.length +
              " match" +
              (filteredData.length === 1 ? "" : "es");
          }
        }
        if (filteredData.length === 0) {
          document.getElementById("readerContent").innerHTML =
            '<div class="reader-no-results">No rows match "' +
            query +
            '"</div>';
          updatePagination();
        } else {
          renderPage(currentIndex);
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

      // ── Navigation: buttons ────────────────────────────────
      document
        .getElementById("firstBtn")
        .addEventListener("click", function () {
          goTo(0);
        });
      document
        .getElementById("prevBtn")
        .addEventListener("click", function () {
          goTo(currentIndex - 1);
        });
      document
        .getElementById("nextBtn")
        .addEventListener("click", function () {
          goTo(currentIndex + 1);
        });
      document
        .getElementById("lastBtn")
        .addEventListener("click", function () {
          goTo(totalPages() - 1);
        });
      document
        .getElementById("firstBtnBottom")
        .addEventListener("click", function () {
          goTo(0);
        });
      document
        .getElementById("prevBtnBottom")
        .addEventListener("click", function () {
          goTo(currentIndex - 1);
        });
      document
        .getElementById("nextBtnBottom")
        .addEventListener("click", function () {
          goTo(currentIndex + 1);
        });
      document
        .getElementById("lastBtnBottom")
        .addEventListener("click", function () {
          goTo(totalPages() - 1);
        });

      // ── Navigation: page input ─────────────────────────────
      pageInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          const v = parseInt(pageInput.value, 10);
          if (!isNaN(v) && v >= 1 && v <= totalPages()) {
            goTo(v - 1);
          } else {
            pageInput.value = currentIndex + 1;
          }
        }
      });
      pageInput.addEventListener("change", function () {
        const v = parseInt(pageInput.value, 10);
        if (!isNaN(v) && v >= 1 && v <= totalPages()) {
          goTo(v - 1);
        } else {
          pageInput.value = currentIndex + 1;
        }
      });

      // ── Keyboard ───────────────────────────────────────────
      document.addEventListener("keydown", function onKey(e) {
        if (
          document.activeElement === searchInput ||
          document.activeElement === pageInput
        )
          return;

        if (e.key === "ArrowLeft") {
          e.preventDefault();
          goTo(currentIndex - 1);
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          goTo(currentIndex + 1);
        }
        if (e.key === "Home") {
          e.preventDefault();
          goTo(0);
        }
        if (e.key === "End") {
          e.preventDefault();
          goTo(totalPages() - 1);
        }
        if (
          e.key === "/" ||
          (e.key === "f" && (e.ctrlKey || e.metaKey))
        ) {
          e.preventDefault();
          searchInput.focus();
          searchInput.select();
        }
      });

      // Initial render
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
