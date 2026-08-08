/**
 * Library Search Page Module (books/library-search.html)
 * Cross-book search UI — the engine itself lives in js/library-search-engine.js
 * (pure module: loadSearchIndex / searchLibrary / tokenizeText) and the word
 * index in data/search-index.json (built by data/06-rebuild-searchIndex.mjs).
 *
 * This page is self-initialising. It reads ?q= and ?tags= from the URL
 * (shareable links), renders tag chips scoped to the visible books, and
 * groups results by book with inline peek previews. Result deep-links and
 * peeks navigate to reader.html?book=X&row=N&q=… — the reader already
 * consumes that query (pre-highlights + scrolls to the row).
 */

import { tagLabel, t } from "./i18n.js";
import { loadSearchIndex, searchLibrary } from "./library-search-engine.js";
import {
  loadTagDefinitions,
  loadBookNames,
  extractTags,
  getBookVersionSync,
  getCsvPath,
} from "./book-data.js";
import { fetchBookCSVCached } from "./csv.js";
import {
  escapeHTML,
  parseQuery,
  compileQuery,
  rowMatchesQueryNorm,
  buildNormData,
  buildSnippets,
  highlightMatches,
} from "./search-utils.js";

// ── Page state ───────────────────────────────────────────────
var _bookNames = null; // full registry (incl. -HDN books)
var _q = ""; // current query (trimmed)
var _selectedTags = []; // active tag chips (OR — same semantics as the grid)
var _searchTimer = null; // input debounce
var _refreshTags = null; // tag-row collapse refresh (common.js)

var PEEK_BATCH = 8;
var _peekCache = {}; // bookCode → q → {q, allData, normAllData, compiled, matches, pos, hasRowNums}

var el = {
  input: null,
  clear: null,
  tagsRow: null,
  count: null,
  results: null,
};

/** Substitute {k} placeholders in an i18n template string. */
function tpl(key, map) {
  var s = t(key);
  for (var k in map) s = s.replace("{" + k + "}", map[k]);
  return s;
}

// ── URL sync (?q= / ?tags= — shareable links) ────────────────
function readUrlParams() {
  var params = new URLSearchParams(window.location.search);
  _q = (params.get("q") || "").trim();
  var tagsParam = params.get("tags");
  if (tagsParam) {
    _selectedTags = tagsParam.split(",").map(function (x) { return x.trim(); })
      .filter(function (x) { return x; });
  }
}

/** Keep ?q= and ?tags= in the address bar — the URL stays shareable. */
function syncUrl() {
  var params = new URLSearchParams();
  if (_q) params.set("q", _q);
  if (_selectedTags.length > 0) params.set("tags", _selectedTags.join(","));
  var qs = params.toString();
  history.replaceState(null, "", qs ? "?" + qs : window.location.pathname);
}

// ── Tag chips ────────────────────────────────────────────────
/** Render the chip row with counts over visible (-HDN excluded) books. */
function renderChips() {
  var visible = (_bookNames || []).filter(function (b) {
    return !b.bookCode.endsWith("-HDN");
  });
  var tagCounts = {};
  visible.forEach(function (b) {
    extractTags(b.bookCode, b).forEach(function (tg) {
      if (!tagCounts[tg.code])
        tagCounts[tg.code] = { label: tg.label, palette: tg.palette, count: 0 };
      tagCounts[tg.code].count++;
    });
  });
  var tagsActive = _selectedTags.length > 0;
  var allChipHTML = window.tagAllChipHtml(tagsActive, visible.length);

  var html = Object.keys(tagCounts)
    .sort()
    .map(function (code) {
      var tc = tagCounts[code];
      return window.tagChipHtml(
        code,
        tc.label,
        tc.palette,
        _selectedTags.indexOf(code) !== -1,
        tc.count
      );
    })
    .join("");
  el.tagsCollapse.innerHTML =
    '<span class="dash-label">' + t("dashboardTagsLabel") + "</span> " + allChipHTML + html;
  if (_refreshTags) _refreshTags();
}

function onChipsClick(e) {
  var chip = e.target.closest(".dash-tag-chip");
  if (!chip) return;
  var tag = chip.dataset.tag;
  if (tag === "__all__") {
    _selectedTags = [];
  } else {
    var idx = _selectedTags.indexOf(tag);
    if (idx === -1) _selectedTags.push(tag);
    else _selectedTags.splice(idx, 1);
  }
  syncUrl();
  renderChips();
  if (_q) runSearch();
}

// ── Search ───────────────────────────────────────────────────
/**
 * Book codes eligible for the search: visible books (-HDN excluded) carrying
 * any active tag chip (OR — same semantics as the dashboard grid).
 */
function computeScope() {
  var visible = (_bookNames || []).filter(function (b) {
    return !b.bookCode.endsWith("-HDN");
  });
  if (_selectedTags.length > 0) {
    visible = visible.filter(function (b) {
      var codes = extractTags(b.bookCode, b).map(function (x) {
        return x.code;
      });
      return _selectedTags.some(function (tc) {
        return codes.indexOf(tc) !== -1;
      });
    });
  }
  return visible.map(function (b) {
    return b.bookCode;
  });
}

function showEmpty(messageKey) {
  el.results.innerHTML = '<div class="dash-empty">' + t(messageKey) + "</div>";
  el.count.textContent = "";
  el.count.style.display = "none";
}

/** Run the search and render results (caller debounces). */
function runSearch() {
  _q = (el.input.value || "").trim();
  syncUrl();
  if (!_q) {
    showEmpty("libSearchHint");
    return;
  }
  // Empty-scope guard: active tags that match no books must NOT fall through
  // to an unscoped search (the engine treats [] as "every book").
  var scope = computeScope();
  if (_selectedTags.length > 0 && scope.length === 0) {
    showEmpty("libNoResults");
    return;
  }
  el.count.style.display = "none";
  el.results.innerHTML = '<div class="dash-empty">' + t("libSearching") + "</div>";
  loadSearchIndex()
    .then(function (index) {
      renderResults(searchLibrary(index, _q, scope), _q);
    })
    .catch(function () {
      el.results.innerHTML =
        '<div class="dash-empty">⚠️ Error: Failed to load the search index. ' +
        '<button id="libSearchRetry" class="retry-btn">↺ Retry</button></div>';
      var rb = document.getElementById("libSearchRetry");
      if (rb) rb.addEventListener("click", runSearch);
    });
}

// ── Result peek (expand to preview matching rows inline) ─────
// Clicking ▾ on a result fetches THAT book (through the on-device IndexedDB
// cache — instant once opened before), runs the reader's exact search
// machinery over it, and shows the first few matching rows as highlighted
// snippets with a "Show next" pager. Each snippet deep-links to its row.

/** Load the book + compute all matching positions (cached per book+query). */
function peekEnsureData(bookCode, q) {
  var cached = _peekCache[bookCode] && _peekCache[bookCode][q];
  if (cached && cached.q === q) return Promise.resolve(cached);
  return fetchBookCSVCached(
    bookCode,
    getBookVersionSync(bookCode),
    getCsvPath(bookCode),
  ).then(function (rows) {
    if (!rows || rows.length < 2) throw new Error("Book has no content");
    var allData = rows.slice(1);
    var normAllData = buildNormData(allData);
    var compiled = compileQuery(parseQuery(q));
    var matches = [];
    for (var i = 0; i < allData.length; i++) {
      if (rowMatchesQueryNorm(allData[i], normAllData[i], compiled)) {
        matches.push(i);
      }
    }
    var entry = {
      q: q,
      allData: allData,
      normAllData: normAllData,
      compiled: compiled,
      matches: matches,
      pos: 0,
      hasRowNums:
        (rows[0][0] || "").trim() === "#" || (rows[0][0] || "").trim() === "",
    };
    (_peekCache[bookCode] = _peekCache[bookCode] || {})[q] = entry;
    return entry;
  });
}

/** One matching row as a highlighted, clickable snippet. */
function peekItemHTML(entry, q, bookCode, position) {
  var row = entry.allData[position];
  var label = entry.hasRowNums ? row[0] || position + 1 : position + 1;
  var snippets = buildSnippets(
    row,
    entry.compiled,
    q,
    entry.normAllData[position],
  );
  var text = snippets[0] || "";
  if (!text) {
    // Fallback: first non-row-number cell, raw highlight
    var cell = "";
    for (var c = 0; c < row.length; c++) {
      if (entry.hasRowNums && c === 0) continue;
      if (row[c]) { cell = row[c]; break; }
    }
    text = highlightMatches(String(cell).slice(0, 240), q);
  }
  return (
    '<a class="lib-peek-item" href="reader.html?book=' +
    bookCode +
    "&row=" +
    (position + 1) +
    "&q=" +
    encodeURIComponent(q) +
    '" title="' +
    bookCode +
    " row " +
    (position + 1) +
    '">' +
    '<span class="lib-peek-num">#' +
    label +
    "</span>" +
    '<span class="lib-peek-text">' +
    text +
    "</span></a>"
  );
}

/** Append the next batch of matches into the peek, update the pager. */
function peekRenderBatch(peekEl, entry, q, bookCode) {
  var items = peekEl.querySelector(".lib-peek-items");
  var moreBtn = peekEl.querySelector(".lib-peek-more");
  if (!items) return;
  var batch = entry.matches.slice(entry.pos, entry.pos + PEEK_BATCH);
  entry.pos += batch.length;
  var html = "";
  for (var i = 0; i < batch.length; i++) {
    html += peekItemHTML(entry, q, bookCode, batch[i]);
  }
  items.insertAdjacentHTML("beforeend", html);
  if (moreBtn) {
    if (entry.pos >= entry.matches.length) {
      moreBtn.style.display = "none";
    } else {
      moreBtn.style.display = "";
      moreBtn.textContent = tpl("libShowNext", {
        n: Math.min(PEEK_BATCH, entry.matches.length - entry.pos),
      });
    }
  }
}

/** Load + render the first peek batch into an open peek. */
function openPeek(root, bookCode, q) {
  var peek = root.querySelector(".lib-peek");
  var items = peek.querySelector(".lib-peek-items");
  var moreBtn = peek.querySelector(".lib-peek-more");
  if (moreBtn) moreBtn.style.display = "none";
  if (items.childElementCount > 0) return; // already rendered (collapse/re-open)
  items.innerHTML = '<div class="lib-peek-loading">' + t("libSearching") + "</div>";
  peekEnsureData(bookCode, q)
    .then(function (entry) {
      if (!root.classList.contains("peek-open")) return; // closed while loading
      entry.pos = 0;
      items.innerHTML = "";
      peekRenderBatch(peek, entry, q, bookCode);
    })
    .catch(function () {
      if (!root.classList.contains("peek-open")) return;
      items.innerHTML =
        '<div class="lib-peek-loading">⚠️ Error: Failed to load the book. ' +
        '<button class="retry-btn" data-peek-retry="1">↺ Retry</button></div>';
      var rb = items.querySelector("[data-peek-retry]");
      if (rb)
        rb.addEventListener("click", function () {
          items.innerHTML = "";
          openPeek(root, bookCode, q);
        });
    });
}

function togglePeek(root, bookCode, q) {
  var peek = root.querySelector(".lib-peek");
  var toggle = root.querySelector(".lib-peek-toggle");
  var open = root.classList.toggle("peek-open");
  if (toggle) toggle.textContent = open ? "▴" : "▾";
  if (open) {
    peek.style.display = "";
    openPeek(root, bookCode, q);
  } else {
    peek.style.display = "none";
  }
}

/** Render grouped-by-book results into the results area. */
function renderResults(results, q) {
  if (!results || results.length === 0) {
    showEmpty("libNoResults");
    return;
  }
  var total = 0;
  for (var i = 0; i < results.length; i++) total += results[i].count;
  el.count.style.display = "";
  el.count.textContent = tpl("libResultSummary", { a: total, b: results.length });
  el.results.innerHTML =
    '<div class="lib-results">' +
    results
      .map(function (r) {
        var meta = (_bookNames || []).find(function (b) {
          return b.bookCode === r.bookCode;
        });
        var tags = meta ? extractTags(meta.bookCode, meta) : [];
        var tagHtml =
          tags.length > 0
            ? '<div class="card-tags">' +
              tags
                .map(function (tg) {
                  return (
                    '<span class="tag-badge' +
                    (tg.palette >= 0 ? " tag-palette-" + tg.palette : "") +
                    '" title="Category: ' +
                    tagLabel(tg.code, tg.label, "en") +
                    '">' +
                    tagLabel(tg.code, tg.label) +
                    "</span>"
                  );
                })
                .join("") +
              "</div>"
            : "";
        var link =
          "reader.html?book=" +
          r.bookCode +
          "&row=" +
          r.firstRow +
          "&q=" +
          encodeURIComponent(q);
        return (
          '<div class="card lib-result" data-book="' +
          r.bookCode +
          '" data-q="' +
          escapeHTML(q) +
          '">' +
          '<div class="lib-result-top">' +
          '<a class="lib-result-link" href="' +
          link +
          '" title="' +
          r.bookCode +
          '">' +
          tagHtml +
          '<div class="lib-title-ar">' +
          escapeHTML(meta ? meta.titleAR || "" : "") +
          "</div>" +
          '<div class="lib-title-dv">' +
          escapeHTML(meta ? meta.titleDV || "" : "") +
          "</div>" +
          '<div class="lib-title-en">' +
          escapeHTML(meta ? meta.titleEN || r.bookCode : r.bookCode) +
          "</div>" +
          '<div class="lib-result-meta">' +
          tpl("libBookMatches", { n: r.count }) +
          "</div>" +
          "</a>" +
          '<button class="toolbar-btn lib-peek-toggle" title="Preview matches in this book">▾</button>' +
          "</div>" +
          '<div class="lib-peek" style="display:none">' +
          '<div class="lib-peek-items"></div>' +
          '<button class="toolbar-btn lib-peek-more" style="display:none"></button>' +
          "</div>" +
          "</div>"
        );
      })
      .join("") +
    "</div>";

  // Wire peek toggles + paging (rows are static HTML at this point)
  el.results.querySelectorAll(".lib-result").forEach(function (root) {
    var bookCode = root.dataset.book;
    var peekQ = root.dataset.q;
    var toggle = root.querySelector(".lib-peek-toggle");
    if (toggle)
      toggle.addEventListener("click", function () {
        togglePeek(root, bookCode, peekQ);
      });
    var more = root.querySelector(".lib-peek-more");
    if (more)
      more.addEventListener("click", function () {
        var entry = _peekCache[bookCode] && _peekCache[bookCode][peekQ];
        if (entry)
          peekRenderBatch(root.querySelector(".lib-peek"), entry, peekQ, bookCode);
      });
  });
}

// ── Page initialisation ──────────────────────────────────────
async function init() {
  el.input = document.getElementById("libSearchInput");
  el.clear = document.getElementById("libSearchClear");
  el.tagsRow = document.getElementById("libTagsRow");
  el.tagsCollapse = document.getElementById("libTagsCollapse");
  el.tagsToggle = document.getElementById("libTagsToggle");
  el.count = document.getElementById("libCount");
  el.results = document.getElementById("libResults");
  if (!el.input) return;

  readUrlParams();
  el.input.value = _q;
  el.clear.style.display = _q ? "" : "none";

  // Clear button
  el.clear.addEventListener("click", function () {
    el.input.value = "";
    _q = "";
    syncUrl();
    el.clear.style.display = "none";
    showEmpty("libSearchHint");
    el.input.focus();
  });

  // Debounced search while typing
  el.input.addEventListener("input", function () {
    el.clear.style.display = this.value ? "" : "none";
    clearTimeout(_searchTimer);
    _searchTimer = setTimeout(runSearch, 150);
  });

  // Tag chips (scoping)
  el.tagsRow.addEventListener("click", onChipsClick);
  _refreshTags = window.initTagsCollapse("libTagsCollapse", "libTagsToggle");

  // Language change → re-render chips + results
  document.addEventListener("languagechange", function () {
    renderChips();
    if (_q) runSearch();
  });

  // Focus mode button (collapse chips + count, keep the search visible)
  var btnFocus = document.getElementById("btnFocus");
  if (btnFocus) {
    btnFocus.style.display = "";
    btnFocus.addEventListener("click", function () {
      window.setFocus(!document.documentElement.hasAttribute("data-focus"));
    });
  }

  // Keyboard: / or Ctrl+F focuses the input, Escape clears it, Alt+Z toggles
  // focus mode (Ctrl+, settings / Ctrl+b back are handled in common.js)
  document.addEventListener("keydown", function (e) {
    var isInput = window.isTypingTarget(e);
    if (
      (e.key === "/" || (e.key === "f" && (e.ctrlKey || e.metaKey))) &&
      !isInput
    ) {
      e.preventDefault();
      el.input.focus();
      el.input.select();
    }
    if (e.key === "z" && !isInput && e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      window.setFocus(!document.documentElement.hasAttribute("data-focus"));
    }
    if (e.key === "Escape" && isInput && e.target === el.input) {
      el.input.value = "";
      _q = "";
      syncUrl();
      el.clear.style.display = "none";
      showEmpty("libSearchHint");
      el.input.blur();
    }
  });

  // Registries feed the chips + scoping + result titles
  await loadTagDefinitions();
  _bookNames = await loadBookNames();
  renderChips();

  // Run the shared ?q= search (or show the hint)
  if (_q) runSearch();
  else showEmpty("libSearchHint");

  // Auto-focus search on desktop
  if (window.innerWidth > window.MOBILE_BP) el.input.focus();
}

init();
