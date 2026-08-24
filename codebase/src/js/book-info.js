/**
 * Book & Author Info Module
 *
 * The two-tab info modal. Entry points: the reader's book-title click
 * (Book tab), the reader's author-line click (Author tab — the old
 * dashboard-filter jump moved inside the modal as the "show all books"
 * link), Alt+I, and the authors browse modal's per-row ℹ button (stacked
 * over the browse modal — Escape returns to it).
 *
 * Book tab: registry facts (titles, author, Hijri/Gregorian years, century,
 * age, tags) + optional markdown book notes from static/notes/works/<bookCode>.md.
 * Author tab: fact strip (years/CE/century/age) + markdown bio from
 * static/notes/authors/<authorCode>.md (auto-TOC when it has 2+ headings).
 * Works tab: the author's works (deep links into the reader) + a
 * dashboard "show all works" link — hidden when the modal has no author.
 * The same tabs + panes render as a standalone page (src/books/info.html) —
 * the deep-link target behind the modal's exports and copy-link button:
 * ?book=CODE opens the Book pane, ?author=CODE the Author pane,
 * &tab=works the Works pane.
 *
 * One bio per author, language-invariant — the same markdown shows in all
 * three site languages; per-block dir="auto" handles mixed Arabic/Thaana/
 * English bidi. The markdown subset is small by design (see
 * renderMarkdown); everything outside it renders literally, escaped first —
 * the same trust model as the CSVs: the notes files are the user's own
 * content, raw-by-design.
 *
 * The modal carries a re-targeting search bar (searches the active tab's
 * pane, matching through normaliseForSearch — the library search's
 * diacritic folding — highlighting via <mark>, one counting path) and a
 * copy-to-clipboard of the active tab. The pane exports (Word / PDF /
 * HTML Book / EPUB) reuse export.js's shared builders.
 *
 * Import edges: this module imports only i18n / book-data / search-utils /
 * common.js globals. facet-browse.js imports openInfoModal — never the
 * other way — so there is no import cycle.
 */

import { t, currentLang, tagLabel } from "./i18n.js";
import {
  loadBookRegistry,
  loadAuthorDefinitions,
  authorDefs,
  getBookTitleSync,
  bookAuthorLine,
  extractTags,
  authorCodesOf,
  authorPeriodOf,
  authorYearsText,
  authorYearsCeText,
  authorAgeText,
} from "./book-data.js";
import { escapeHTML, normaliseForSearch, highlightMatches, formatThousands } from "./search-utils.js";
import { downloadFile, buildWordHTML, buildPdfHTML, buildHtmlBook, exportEPUB } from "./export.js";

// ── State ──────────────────────────────────────────────────────
var _overlay = null;   // #infoOverlay (the .open class lives on the overlay)
var _body = null;      // #infoModalBody
var _pane = null;      // #infoPane — the modal's only scrollport
var _searchInput = null;
var _clearBtn = null;
var _countSlot = null;
var _state = null;     // { bookCode, author, counts } of the current cfg
var _activeTab = "book";
var _renderSeq = 0;    // stale-async guard: a fast tab switch aborts the old render
var _marks = [];       // the live <mark> list (search)
var _markIndex = -1;
var _notesCache = {};  // path → Promise<string|null> (null = 404/error)
var _plain = [];       // plain-text lines of the active pane (copy)
var _sections = [];    // [{title, body}] raw-text export rows of the active pane
var _exportMeta = null;  // {bookCode, titleDV, titleAR, titleEN, authorCode} for the builders
var _exportKind = "";    // the export's kind line ("Biography of the author" …) — title-page top
var _exportFacts = [];   // fact-strip lines — rendered on the export's title page
var _exportToc = null;   // markdown headings (2+) — the export's Contents page
var _exportBusy = false;
var _isPage = false;     // true on books/info.html — tab switches pushState

// ── Markdown subset renderer ───────────────────────────────────
// # → h2, ## → h3 (id="info-hN" anchors for the TOC), "- " → ul/li,
// blank-line-separated paragraphs. Inline pass on the ESCAPED text (the
// markers survive escapeHTML — it touches only & < > " '): **b** → strong,
// *i* → em, [label](url) → external link (target=_blank rel=noopener),
// [[book:CODE]] → reader.html?book=CODE titled via the registry (the code
// is plain text in the escaped source, so it is safe to splice into the
// href; the registry title is escaped for its attribute). dir="auto" per
// block so mixed Arabic/Thaana/English bidi resolves per paragraph.

function inlineMarkup(escaped) {
  var out = escaped
    .replace(/\[\[book:([A-Za-z0-9._-]+)\]\]/g, function (m, code) {
      var title = getBookTitleSync(code) || code;
      return (
        '<a href="reader.html?book=' +
        code +
        '" title="' +
        escapeHTML(title) +
        '">' +
        escapeHTML(title) +
        "</a>"
      );
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (m, label, url) {
      return (
        '<a href="' + url + '" target="_blank" rel="noopener">' + label + "</a>"
      );
    });
  return out;
}

export function renderMarkdown(src) {
  var lines = String(src || "").split(/\r?\n/);
  var html = [];
  var headings = [];
  var plain = [];
  var inList = false;
  function closeList() {
    if (inList) { html.push("</ul>"); inList = false; }
  }
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) {
      // A blank source line is a block boundary: it closes any open list
      // and stays in the plain text as a "" entry — the copy's blank line
      // between paragraphs (the exporter bodies carry the same gaps).
      closeList();
      plain.push("");
      continue;
    }
    var m;
    if ((m = /^(#{1,2})\s+(.*)$/.exec(line))) {
      closeList();
      var tag = m[1].length === 2 ? "h3" : "h2";
      headings.push(m[2]);
      html.push(
        "<" + tag + ' id="info-h' + headings.length + '" dir="auto">' +
        inlineMarkup(escapeHTML(m[2])) + "</" + tag + ">"
      );
      plain.push(m[2]);
    } else if (/^-\s+/.test(line)) {
      // dir="auto" on the UL too, not just the lis: an RTL list holding LTR
      // items renders its outside-position markers past the list's edge —
      // a phantom ~20px of pane overflow (the horizontal-scrollbar bug).
      if (!inList) { html.push('<ul dir="auto">'); inList = true; }
      var item = line.replace(/^-\s+/, "");
      html.push('<li dir="auto">' + inlineMarkup(escapeHTML(item)) + "</li>");
      plain.push(item);
    } else {
      closeList();
      html.push('<p dir="auto">' + inlineMarkup(escapeHTML(line)) + "</p>");
      plain.push(line);
    }
  }
  closeList();
  return { html: html.join("\n"), headings: headings, plainText: plain.join("\n") };
}

/** Chapter count for the Book tab — runs of the first column whose
 *  lowercased header starts with "kitab", else "bab", else the row count.
 *  Derived at load by the reader (it has the rows) and passed in via cfg —
 *  never stored, never recomputed here. */
export function computeChapterCount(rows, headerRow) {
  if (!headerRow || !rows) return null;
  var first = (headerRow[0] || "").trim().toLowerCase();
  var mode = first.indexOf("kitab") === 0 ? "kitab" : first.indexOf("bab") === 0 ? "bab" : "";
  if (!mode) return rows.length;
  var runs = 0;
  var last = null;
  for (var i = 0; i < rows.length; i++) {
    var v = (rows[i][0] || "").trim();
    if (v && v !== last) { runs++; last = v; }
  }
  return runs;
}

// ── Notes fetch ────────────────────────────────────────────────
// Filenames are the index (authorCode / bookCode); a 404 (or a file://
// fetch TypeError) is a quiet "no notes yet", not an error. Cached per
// page load — re-opening the modal must not re-fetch.
function fetchNote(path) {
  if (_notesCache[path] !== undefined) return _notesCache[path];
  _notesCache[path] = fetch(path)
    .then(function (resp) {
      if (!resp.ok) return null;
      return resp.text();
    })
    .catch(function () { return null; });
  return _notesCache[path];
}

// ── Shell — one build, two hosts (the modal overlay and the info page) ──
// The modal hosts the shell inside #infoModalBody; books/info.html hosts it
// in its own #infoPageShell container (the actions row stays in the markup
// but the page hides it via CSS — the page is a link target, not a
// workspace). The shell is wired once per page — the two hosts never
// coexist.
var _wired = false;

function ensureModal() {
  if (_overlay) return;
  window.createModal("infoOverlay", "infoModalTitle", "infoModalBody", "info-modal");
  _overlay = document.getElementById("infoOverlay");
  document.getElementById("infoModalTitle").textContent = t("infoModalTitle");
  wireShell(document.getElementById("infoModalBody"));
}

function ensurePage() {
  if (_wired) return;
  var host = document.getElementById("infoPageShell");
  if (!host) return;
  wireShell(host);
}

function wireShell(container) {
  if (_wired) return;
  _wired = true;
  _body = container;
  _body.innerHTML =
    '<div class="info-tab-band">' +
    '<div class="info-tab-row" role="tablist">' +
    '<button type="button" class="info-tab" role="tab" data-tab="book"></button>' +
    '<button type="button" class="info-tab" role="tab" data-tab="author"></button>' +
    '<button type="button" class="info-tab" role="tab" data-tab="works"></button>' +
    "</div>" +
    '<button type="button" id="infoActionsToggle" class="toolbar-btn info-actions-toggle" title="Copy & export actions" aria-label="Copy & export actions" aria-expanded="false" aria-controls="infoActions"></button>' +
    '<div class="info-actions" id="infoActions">' +
    '<button type="button" id="infoCopyBtn" class="toolbar-btn"></button>' +
    '<button type="button" id="infoCopyLinkBtn" class="toolbar-btn"></button>' +
    '<span class="info-actions-sep" aria-hidden="true"></span>' +
    '<button type="button" class="toolbar-btn info-export-btn" data-fmt="word" title="Word document">Word</button>' +
    '<button type="button" class="toolbar-btn info-export-btn" data-fmt="pdf" title="PDF for printing">PDF</button>' +
    '<button type="button" class="toolbar-btn info-export-btn" data-fmt="html" title="HTML web page">HTML</button>' +
    '<button type="button" class="toolbar-btn info-export-btn" data-fmt="epub" title="EPUB e-book">EPUB</button>' +
    "</div>" +
    "</div>" +
    '<div class="info-search-row">' +
    '<div class="search-input-wrap">' +
    '<input id="infoSearchInput" type="search" class="search-input info-search-input" autocomplete="off" />' +
    '<button type="button" id="infoSearchClear" class="search-clear-btn" title="Clear search" aria-label="Clear search">✕</button>' +
    '</div>' +
    // Match stepping wears the scroll-row triangle style (▲ ▼) while
    // keeping the up/down semantics: previous match = up, next = down.
    // Direction-neutral, so no RTL mirroring is needed.
    '<button type="button" id="infoSearchPrev" class="info-search-nav" title="Previous match (Shift+Enter)" aria-label="Previous match" disabled>&#9650;</button>' +
    '<button type="button" id="infoSearchNext" class="info-search-nav" title="Next match (Enter)" aria-label="Next match" disabled>&#9660;</button>' +
    '<span id="infoSearchCount" class="info-search-count"></span>' +
    "</div>" +
    '<div class="info-pane" id="infoPane"></div>';
  _pane = document.getElementById("infoPane");
  _searchInput = document.getElementById("infoSearchInput");
  _clearBtn = document.getElementById("infoSearchClear");
  _countSlot = document.getElementById("infoSearchCount");
  // The ✕ lives inside the input's wrap (search-window pattern): visible
  // only while there is a query; click clears the field and re-runs the
  // search (unwraps the highlights, empties the count, disables the nav).
  _clearBtn.addEventListener("click", function () {
    _searchInput.value = "";
    applySearch();
    _searchInput.focus();
  });
  document.getElementById("infoSearchPrev").addEventListener("click", function () { prevMatch(); });
  document.getElementById("infoSearchNext").addEventListener("click", function () { nextMatch(); });
  var copyBtn = document.getElementById("infoCopyBtn");
  copyBtn.title = "Copy this tab's content to the clipboard";
  copyBtn.addEventListener("click", function () {
    // Blank lines live in the array itself — the "" entries the tab
    // builders and the markdown renderer push at block boundaries (head →
    // facts → tags → notes; between markdown paragraphs), so the
    // clipboard text has gaps exactly where the sections have them.
    if (_plain.length > 0) window.copyToClipboard(_plain.join("\n"), "toastCopied");
  });
  // Copy link — the info page's URL for the active pane, the same string
  // the exports print on their title page (one source of truth, so the
  // two surfaces can never disagree). Disabled until a pane with export
  // metadata renders (showPane toggles it).
  var copyLinkBtn = document.getElementById("infoCopyLinkBtn");
  copyLinkBtn.title = "Copy a link to this page's info";
  copyLinkBtn.addEventListener("click", function () {
    var url = infoLink();
    if (url) window.copyToClipboard(url, "toastCopied");
  });
  // Mobile-only dropdown: the same 📥 export chip the reader uses; opens
  // the actions (copy + the four formats) as a menu anchored below the
  // band (desktop shows the buttons inline — the toggle is display:none
  // up there). The menu is transient, like the reader's own: an outside
  // click, picking an item, or a tab switch closes it — no persistent
  // open state. aria-expanded tracks it for assistive tech.
  var actionsToggle = document.getElementById("infoActionsToggle");
  var actionsMenu = document.getElementById("infoActions");
  function setActionsMenu(open) {
    actionsMenu.classList.toggle("open", open);
    actionsToggle.setAttribute("aria-expanded", open ? "true" : "false");
  }
  actionsToggle.addEventListener("click", function (e) {
    e.stopPropagation();
    setActionsMenu(!actionsMenu.classList.contains("open"));
  });
  document.addEventListener("click", function (e) {
    if (!actionsMenu.classList.contains("open")) return;
    if (actionsMenu.contains(e.target) || e.target === actionsToggle) return;
    setActionsMenu(false);
  });
  // Item clicks (copy or a format) run their action, then close the menu
  // (the document listener above skips clicks inside the menu).
  actionsMenu.addEventListener("click", function () { setActionsMenu(false); });
  Array.prototype.forEach.call(_body.querySelectorAll(".info-export-btn"), function (b) {
    b.addEventListener("click", function () { exportPane(this.dataset.fmt, this); });
  });
  _searchInput.addEventListener("input", function () { applySearch(); });
  _searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) prevMatch();
      else nextMatch();
    }
  });
  _body.addEventListener("click", function (e) {
    var tabBtn = e.target.closest(".info-tab");
    if (tabBtn) {
      setTab(tabBtn.dataset.tab);
      return;
    }
    var tocLink = e.target.closest(".info-toc a");
    if (tocLink) {
      // TOC links scroll the pane — no page-hash churn
      e.preventDefault();
      var id = (tocLink.getAttribute("href") || "").slice(1);
      var h = id && document.getElementById(id);
      if (h) h.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  });
}

/** The active tab's static labels — separate from render() because the
 *  tabs and the search row change with the language while the pane content
 *  changes with the state. */
function labels() {
  var tabs = _body.querySelectorAll(".info-tab");
  tabs[0].textContent = t("infoTabBook");
  tabs[1].textContent = t("infoTabAuthor");
  tabs[2].textContent = t("infoTabWorks");
  // The Works tab is the author's works — it exists only when the shell
  // has an author (the hidden attribute needs the explicit rule below;
  // the tab row's flex display would otherwise override it).
  tabs[2].hidden = !_state.author;
  Array.prototype.forEach.call(tabs, function (b) {
    b.classList.toggle("active", b.dataset.tab === _activeTab);
    b.setAttribute("aria-selected", b.dataset.tab === _activeTab ? "true" : "false");
  });
  // The band's action buttons carry language text — the copy chips and the
  // 📥 toggle (the reader's export label). Relabelled with the tabs so a
  // language switch while the modal is open leaves nothing stale. The
  // copy-link chip follows the pane's export metadata (showPane re-runs it
  // when the pane lands).
  document.getElementById("infoCopyBtn").textContent = t("btnCopyText");
  document.getElementById("infoCopyLinkBtn").textContent = t("infoCopyLink");
  document.getElementById("infoCopyLinkBtn").disabled = !_exportMeta;
  document.getElementById("infoActionsToggle").textContent = t("btnExportText");
  _searchInput.placeholder = t("infoSearchPlaceholder");
  _searchInput.title = "Search the active tab (Enter: next match, Shift+Enter: previous)";
}

function setTab(tab) {
  if (tab === _activeTab) return;
  if (tab === "works" && !_state.author) return;
  _activeTab = tab;
  labels();
  render();
  // The info page's URL follows the active tab — each switch is a history
  // entry, so back/forward step through the tabs and a refresh keeps the
  // pane. The modal never touches the host page's URL. A tab without a
  // deep-link form (a Book pane with no book) just keeps the URL.
  if (_isPage && history.pushState) {
    var q = pageQuery(tab);
    if (q) history.pushState(null, "", q);
  }
}

/** The active tab from a cfg — the explicit tab wins (the reader passes
 *  tab: "book" / "author" with the author code alongside; the info page
 *  passes ?tab=); the author fallback is only for callers that pass an
 *  author without a tab (the browse modals' ℹ button). The works tab needs
 *  an author up front — it cannot open authorless. Shared by the modal and
 *  the info page so the two surfaces resolve the same way. */
function resolveTab(cfg) {
  return cfg.tab === "author" ? "author"
    : cfg.tab === "works" && cfg.author ? "works"
    : cfg.tab === "book" ? "book"
    : cfg.author ? "author" : "book";
}

// ── Entry points ───────────────────────────────────────────────
// cfg: { bookCode, author, tab ("book"|"author"|"works") }.
// The browse modals' ℹ passes { author }; the reader passes the book's
// code and its first author. Re-opening while open re-renders in place —
// the stack is never double-pushed.
export function openInfoModal(cfg) {
  cfg = cfg || {};
  _state = {
    bookCode: cfg.bookCode || null,
    author: cfg.author || null,
    counts: cfg.counts || null,
  };
  _activeTab = resolveTab(cfg);
  ensureModal();
  labels();
  render();
  if (_overlay.classList.contains("open")) return;
  var stacked = window.MODAL_IDS.some(function (mid) {
    var m = document.getElementById(mid);
    return m && m.classList.contains("open");
  });
  if (stacked) window.openModalOnTop("infoOverlay");
  else window.openModal("infoOverlay");
}

/** The info page's entry point (books/info.html): the same tabs + panes as
 *  the modal, no overlay. The counts field is kept for shape parity with
 *  the modal (the pane no longer shows the derived rows·chapters line). */
export function openInfoPage(cfg) {
  cfg = cfg || {};
  _isPage = true;
  _state = {
    bookCode: cfg.bookCode || null,
    author: cfg.author || null,
    counts: cfg.counts || null,
  };
  _activeTab = resolveTab(cfg);
  ensurePage();
  labels();
  render();
}

/** The page's boot + popstate entry: parses ?book= / ?author= / &tab= from
 *  the location into the same cfg the modal takes. A bare visit (or back to
 *  one) shows the empty-state line with the shell tucked away. */
export function openInfoPageFromLocation() {
  var params = new URLSearchParams(window.location.search);
  var book = params.get("book") || "";
  var author = params.get("author") || "";
  var tab = params.get("tab") || "";
  var empty = document.getElementById("infoPageEmpty");
  var shell = document.getElementById("infoPageShell");
  if (!book && !author) {
    // Bare visit (or back to one): the empty-state line, the shell tucked
    // away — it may never have been wired (a first bare visit) or may
    // still hold the previous pane (popstate back).
    if (empty) empty.hidden = false;
    if (shell) shell.hidden = true;
    return;
  }
  if (empty) empty.hidden = true;
  if (shell) shell.hidden = false;
  openInfoPage(book
    ? { bookCode: book, author: author || null, tab: tab || "book" }
    : { bookCode: null, author: author, tab: tab || "author" });
}

// The page's tab switches pushState, so back/forward step through the
// tabs — each popstate re-resolves the query into the pane. The modal's
// host pages never trigger this: _isPage is set only on the page.
window.addEventListener("popstate", function () {
  if (_isPage) openInfoPageFromLocation();
});

// ── Render ─────────────────────────────────────────────────────
function render() {
  var seq = ++_renderSeq;
  _marks = [];
  _markIndex = -1;
  if (_activeTab === "book") renderBookTab(seq);
  else if (_activeTab === "works") renderWorksTab(seq);
  else renderAuthorTab(seq);
}

/** One label/value pair of the fact strip ("" values are dropped by the
 *  callers — an undated author shows no empty Years row). The label is
 *  escaped (i18n text) and gains a colon ("Years:") — labels sit in the
 *  strip's first column, values in the second, always as sibling pairs
 *  so the two columns never drift; the value arrives pre-escaped. */
function factRow(label, value) {
  var lab = label ? escapeHTML(label) : "";
  if (lab && lab.indexOf(":") === -1) lab += ":";
  return (
    (label ? '<div class="info-fact-label">' + lab + "</div>" : "") +
    '<div class="info-fact-value">' + value + "</div>"
  );
}

/** Replace the pane and re-run the search highlight on the fresh DOM.
 *  exportExtra feeds the export's title page: kind (the "Biography of the
 *  author …" line), facts (the fact-strip lines) and toc (the markdown
 *  headings when 2+). */
function showPane(seq, paneHtml, plain, sections, exportMeta, exportExtra) {
  if (seq !== _renderSeq) return;
  _pane.innerHTML = paneHtml;
  _plain = plain;
  _sections = sections || [];
  _exportMeta = exportMeta || null;
  _exportKind = (exportExtra && exportExtra.kind) || "";
  _exportFacts = (exportExtra && exportExtra.facts) || [];
  _exportToc = (exportExtra && exportExtra.toc) || null;
  // The copy-link chip follows the pane — placeholder panes (no book, no
  // author) have no export metadata and no link to share.
  var linkBtn = document.getElementById("infoCopyLinkBtn");
  if (linkBtn) linkBtn.disabled = !_exportMeta;
  applySearch();
}

function renderBookTab(seq) {
  var code = _state.bookCode;
  loadAuthorDefinitions()
    .then(function () { return loadBookRegistry(); })
    .then(function (reg) {
      if (seq !== _renderSeq) return;
      var entry = null;
      if (code && reg) {
        for (var i = 0; i < reg.length; i++) {
          if (reg[i].bookCode === code) { entry = reg[i]; break; }
        }
      }
      var pane = [];
      var plain = [];
      var sections = [];
      var factLines = [];
      var exportMeta = null;
      var title = entry ? (entry.titleDV || entry.titleEN || code) : "";
      var titleAr = entry ? (entry.titleAR || "") : "";
      if (title) {
        pane.push(
          '<div class="info-head"><div class="info-head-title" dir="auto">' +
          escapeHTML(title) +
          "</div>" +
          (titleAr ? '<div class="info-head-ar" dir="auto">' + escapeHTML(titleAr) + "</div>" : "") +
          "</div>"
        );
        plain.push(title);
        if (titleAr) plain.push(titleAr);
        // The copy's block boundaries are "" entries — blank lines land
        // between the head, the fact strip, the tags and the notes
        // section, never inside them.
        plain.push("");
        // The head is not a section — the builders' h1 (titleDV - titleAR)
        // already carries the pane head; exporting it again duplicates it.
      }
      var facts = [];
      if (entry) {
        var authorLine = bookAuthorLine(entry);
        var codes = authorCodesOf(entry);
        exportMeta = {
          // titleDV carries the current-lang display title — the builders'
          // h1 pair is (titleDV - titleAR), the same shape as the pane head.
          bookCode: code,
          titleDV: title || code,
          titleAR: titleAr,
          titleEN: entry.titleEN || code,
          authorCode: codes.length > 0 ? codes[0] : "",
        };
        if (authorLine) {
          facts.push(factRow(t("facetColAuthor"), escapeHTML(authorLine)));
          plain.push(t("facetColAuthor") + ": " + authorLine);
          factLines.push(t("facetColAuthor") + ": " + authorLine);
        }
        var first = codes.length > 0 ? authorDefs()[codes[0]] : null;
        if (first) {
          var yrs = authorYearsText(first);
          if (yrs) {
            facts.push(factRow(t("facetColYears"), escapeHTML(yrs)));
            plain.push(t("facetColYears") + ": " + yrs);
            factLines.push(t("facetColYears") + ": " + yrs);
          }
          var ce = authorYearsCeText(first);
          if (ce) {
            facts.push(factRow(t("facetColGregorian"), escapeHTML(ce)));
            plain.push(t("facetColGregorian") + ": " + ce);
            factLines.push(t("facetColGregorian") + ": " + ce);
          }
          var p = authorPeriodOf(codes[0]);
          if (p !== "modern") {
            // The label carries the word (Century) — the value is the bare
            // number ("2"), never "Century: Century 2" doubled.
            facts.push(factRow(t("facetColCentury"), escapeHTML(String(p))));
            plain.push(t("facetColCentury") + ": " + p);
            factLines.push(t("facetColCentury") + ": " + p);
          }
          var age = authorAgeText(first);
          if (age) {
            facts.push(factRow(t("facetColAge"), escapeHTML(age)));
            plain.push(t("facetColAge") + ": " + age);
            factLines.push(t("facetColAge") + ": " + age);
          }
        }
        var tags = extractTags(code, entry);
        if (tags.length > 0) {
          var chips = tags.map(function (tag) {
            var label;
            if (currentLang() === "dv") {
              label = tagLabel(tag.code, tag.label, "dv") + " · " + tagLabel(tag.code, tag.label, "ar");
            } else {
              label = tagLabel(tag.code, tag.label);
            }
            var pal = tag.palette >= 0 ? " tag-palette-" + tag.palette : "";
            return '<span class="tag-badge' + pal + '" dir="auto">' + escapeHTML(label) + "</span>";
          }).join("");
          facts.push(factRow(t("tagsLabel").replace(":", ""), chips));
          var tagsPlain = t("tagsLabel").replace(":", "") + ": " + tags.map(function (tag) {
            return tagLabel(tag.code, tag.label);
          }).join(" · ");
          plain.push(tagsPlain);
          // The tags stay in the pane's strip and the copy — the export's
          // title-page facts drop them (a "Tags: …" line doesn't belong
          // on the exported title page).
        }
      }
      if (facts.length > 0) {
        pane.push('<div class="info-card"><div class="info-fact-strip">' + facts.join("") + "</div></div>");
        // The fact strip is untitled in the pane — the export matches; the
        // author line is already the strip's first fact. The strip is not a
        // section: its lines travel via exportExtra.facts to the export's
        // title page (the copy keeps them inline, where they belong).
        plain.push(""); // the fact strip block's boundary
      }
      var noBook = !entry;
      if (noBook) {
        pane.push('<div class="info-no-notes">' + escapeHTML(t("infoNoNotes")) + "</div>");
        plain.push(t("infoNoNotes"));
        showPane(seq, pane.join("\n"), plain);
        return;
      }
      // Notes (async — the pane shows the facts first, then the notes
      // section lands; the search re-runs when it does). All pages live in
      // src/books/, so the notes root is two levels up (../../static/notes).
      // its content share one card, the search modal's section look.
      fetchNote("../../static/notes/works/" + code + ".md").then(function (text) {
        if (seq !== _renderSeq) return;
        var card = [
          '<div class="info-card">',
          '<div class="info-section-label">' + escapeHTML(t("infoBookNotesLabel")) + "</div>",
        ];
        if (text && text.trim()) {
          var md = renderMarkdown(text);
          // .info-md carries the markdown typography (line-height, heading
          // sizes, paragraph/list margins, link colour) — same wrapper the
          // author tab's bio uses.
          card.push('<div class="info-md">' + md.html + "</div>");
          if (md.plainText) {
            plain.push(t("infoBookNotesLabel"));
            plain.push(""); // the section label's boundary
            plain.push(md.plainText);
          }
          sections.push({ title: t("infoBookNotesLabel"), body: md.plainText });
        } else {
          card.push('<div class="info-no-notes">' + escapeHTML(t("infoNoNotes")) + "</div>");
          plain.push(t("infoBookNotesLabel"));
          plain.push("");
          plain.push(t("infoNoNotes"));
          sections.push({ title: t("infoBookNotesLabel"), body: t("infoNoNotes") });
        }
        card.push("</div>");
        pane.push(card.join(""));
        showPane(seq, pane.join("\n"), plain, sections, exportMeta, {
          kind: t("infoExportKindBook"),
          facts: factLines.length > 0 ? factLines : null,
          toc: null,
        });
      });
    });
}

/** The author's code for the pane: _state.author as-is, else the first
 *  author of the _state.bookCode's registry row (the reader's title-click
 *  path). Resolves into then(code) — null when there is none. The derived
 *  code is cached on _state so the Author and Works tabs agree without
 *  re-deriving. Multi-author books open on the first author. */
function resolveAuthorCode(seq, then) {
  var code = _state.author;
  if (code) { then(code); return; }
  loadBookRegistry().then(function (reg) {
    if (seq !== _renderSeq) return;
    var c = null;
    if (reg) {
      for (var i = 0; i < reg.length; i++) {
        if (reg[i].bookCode === _state.bookCode) {
          var codes = authorCodesOf(reg[i]);
          if (codes.length > 0) c = codes[0];
          break;
        }
      }
    }
    _state.author = c;
    then(c);
  });
}

function renderAuthorTab(seq) {
  resolveAuthorCode(seq, function (code) { showAuthorPane(seq, code); });
}

function renderWorksTab(seq) {
  resolveAuthorCode(seq, function (code) { showWorksPane(seq, code); });
}

function showAuthorPane(seq, code) {
  var pane = [];
  var plain = [];
  var sections = [];
  var factLines = [];
  loadAuthorDefinitions().then(function () {
    if (seq !== _renderSeq) return;
    var def = code ? authorDefs()[code] : null;
    if (!def) {
      pane.push('<div class="info-no-notes">' + escapeHTML(t("infoNoNotes")) + "</div>");
      plain.push(t("infoNoNotes"));
      showPane(seq, pane.join("\n"), plain);
      return;
    }
    var l = currentLang();
    var name = def.name[l] || def.name.en || def.name.ar || code;
    var nameAr = def.name.ar && l !== "ar" ? def.name.ar : "";
    var exportMeta = {
      // The author pane is its own "book" for the builders — the code
      // doubles as the filename/EPUB id, the name pair as the h1.
      bookCode: code,
      titleDV: name,
      titleAR: nameAr,
      titleEN: def.name.en || name,
      authorCode: code,
    };
    pane.push(
      '<div class="info-head"><div class="info-head-title" dir="auto">' +
      escapeHTML(name) +
      "</div>" +
      (nameAr ? '<div class="info-head-ar" dir="auto">' + escapeHTML(nameAr) + "</div>" : "") +
      "</div>"
    );
    plain.push(name);
    if (nameAr) plain.push(nameAr);
    plain.push(""); // the head block's boundary
    // The head is not a section — the builders' h1 (titleDV - titleAR)
    // already carries the pane head; exporting it again duplicates the name.
    var facts = [];
    var yrs = authorYearsText(def);
    if (yrs) {
      facts.push(factRow(t("facetColYears"), escapeHTML(yrs)));
      plain.push(t("facetColYears") + ": " + yrs);
      factLines.push(t("facetColYears") + ": " + yrs);
    }
    var ce = authorYearsCeText(def);
    if (ce) {
      facts.push(factRow(t("facetColGregorian"), escapeHTML(ce)));
      plain.push(t("facetColGregorian") + ": " + ce);
      factLines.push(t("facetColGregorian") + ": " + ce);
    }
    var p = authorPeriodOf(code);
    if (p !== "modern") {
      // The label carries the word (Century) — the value is the bare
      // number ("2"), never "Century: Century 2" doubled.
      facts.push(factRow(t("facetColCentury"), escapeHTML(String(p))));
      plain.push(t("facetColCentury") + ": " + p);
      factLines.push(t("facetColCentury") + ": " + p);
    }
    var age = authorAgeText(def);
    if (age) {
      facts.push(factRow(t("facetColAge"), escapeHTML(age)));
      plain.push(t("facetColAge") + ": " + age);
      factLines.push(t("facetColAge") + ": " + age);
    }
    if (facts.length > 0) {
      pane.push('<div class="info-card"><div class="info-fact-strip">' + facts.join("") + "</div></div>");
      // The fact strip is untitled in the pane — the export matches (the
      // h1 already names the author; a repeating title would duplicate it).
      // The strip is not a section: its lines travel via exportExtra.facts
      // to the export's title page (the copy keeps them inline).
      plain.push(""); // the fact strip block's boundary
    }

    // The bio section — label and content share one card, the search
    // modal's section look.
    fetchNote("../../static/notes/authors/" + code + ".md").then(function (text) {
      if (seq !== _renderSeq) return;
      var card = [
        '<div class="info-card">',
        '<div class="info-section-label">' + escapeHTML(t("infoAuthorBioLabel")) + "</div>",
      ];
      var md = null;
      if (text && text.trim()) md = renderMarkdown(text);
      if (md && md.headings.length > 0) {
        // Auto-TOC — only with 2+ headings (a single section heading needs
        // no table of contents)
        if (md.headings.length >= 2) {
          var toc = ['<nav class="info-toc"><div class="info-toc-title">' + escapeHTML(t("infoToc")) + "</div>"];
          for (var i = 0; i < md.headings.length; i++) {
            toc.push('<a href="#info-h' + (i + 1) + '">' + escapeHTML(md.headings[i]) + "</a>");
          }
          toc.push("</nav>");
          card.push(toc.join(""));
        }
        card.push('<div class="info-md">' + md.html + "</div>");
        plain.push(t("infoAuthorBioLabel"));
        plain.push(""); // the section label's boundary
        plain.push(md.plainText);
        sections.push({ title: t("infoAuthorBioLabel"), body: md.plainText });
      } else if (md) {
        card.push('<div class="info-md">' + md.html + "</div>");
        plain.push(t("infoAuthorBioLabel"));
        plain.push(""); // the section label's boundary
        plain.push(md.plainText);
        sections.push({ title: t("infoAuthorBioLabel"), body: md.plainText });
      } else {
        card.push('<div class="info-no-notes">' + escapeHTML(t("infoNoNotes")) + "</div>");
        plain.push(t("infoAuthorBioLabel"));
        plain.push(""); // the section label's boundary
        plain.push(t("infoNoNotes"));
        sections.push({ title: t("infoAuthorBioLabel"), body: t("infoNoNotes") });
      }
      card.push("</div>");
      pane.push(card.join(""));
      // The author's works live on their own Works tab (renderWorksTab) —
      // the Author tab is the facts + bio.
      showPane(seq, pane.join("\n"), plain, sections, exportMeta, {
        kind: t("infoExportKindAuthor"),
        facts: factLines.length > 0 ? factLines : null,
        toc: (md && md.headings.length >= 2) ? md.headings : null,
      });
    });
  });
}

function showWorksPane(seq, code) {
  var pane = [];
  var plain = [];
  var sections = [];
  loadAuthorDefinitions().then(function () {
    if (seq !== _renderSeq) return;
    var def = code ? authorDefs()[code] : null;
    if (!def) {
      pane.push('<div class="info-no-notes">' + escapeHTML(t("infoNoNotes")) + "</div>");
      plain.push(t("infoNoNotes"));
      showPane(seq, pane.join("\n"), plain);
      return;
    }
    var l = currentLang();
    var name = def.name[l] || def.name.en || def.name.ar || code;
    var nameAr = def.name.ar && l !== "ar" ? def.name.ar : "";
    var exportMeta = {
      // Same "the author pane is its own book" shape as the Author tab.
      bookCode: code,
      titleDV: name,
      titleAR: nameAr,
      titleEN: def.name.en || name,
      authorCode: code,
    };
    pane.push(
      '<div class="info-head"><div class="info-head-title" dir="auto">' +
      escapeHTML(name) +
      "</div>" +
      (nameAr ? '<div class="info-head-ar" dir="auto">' + escapeHTML(nameAr) + "</div>" : "") +
      "</div>"
    );
    plain.push(name);
    if (nameAr) plain.push(nameAr);
    plain.push(""); // the head block's boundary
    // The head is not a section — the builders' h1 (titleDV - titleAR)
    // already carries the pane head; exporting it again duplicates the name.
    loadBookRegistry().then(function (reg) {
      if (seq !== _renderSeq) return;
      // Registry rows carrying this code, duplicates (-HDN variants)
      // excluded — same rule as the browse counts. Deep links into the
      // reader; the dashboard "show all" link replaces the old
      // reader-author-line dashboard jump.
      var books = [];
      if (reg) {
        for (var i = 0; i < reg.length; i++) {
          var b = reg[i];
          if (b.bookCode.indexOf("-HDN") !== -1) continue;
          if (authorCodesOf(b).indexOf(code) !== -1) books.push(b);
        }
      }
      if (books.length === 0) {
        pane.push('<div class="info-card"><div class="info-no-notes">' +
          escapeHTML(t("infoNoNotes")) + "</div></div>");
        plain.push(t("infoNoNotes"));
        showPane(seq, pane.join("\n"), plain, sections, exportMeta, {
          kind: t("infoExportKindWorks"),
          facts: null,
          toc: null,
        });
        return;
      }
      var listLabel = t("infoWorksByAuthor").replace("{name}", name);
      plain.push(listLabel); // the label precedes the rows — the copy order contract
      plain.push(""); // the rows block's boundary
      var rows = [];
      var bookLines = [];
      for (var j = 0; j < books.length; j++) {
        var b = books[j];
        var bt = getBookTitleSync(b.bookCode);
        var bar = b.titleAR || "";
        rows.push(
          '<a class="info-book-row" href="reader.html?book=' + b.bookCode + '">' +
          '<span class="info-book-title" dir="auto">' + escapeHTML(bt) + "</span>" +
          (bar ? '<span class="info-book-ar" dir="auto">' + escapeHTML(bar) + "</span>" : "") +
          "</a>"
        );
        plain.push(bt + (bar ? " — " + bar : ""));
        bookLines.push(bt + (bar ? " — " + bar : ""));
      }
      var showAll = t("infoShowAllWorks").replace("{name}", name);
      pane.push(
        '<div class="info-card">' +
        '<div class="info-section-label">' + escapeHTML(listLabel) + "</div>" +
        '<div class="info-books-list">' + rows.join("") + "</div>" +
        '<a class="info-show-all" href="index.html?authors=' + code + '">' +
        escapeHTML(showAll) +
        "</a>" +
        "</div>"
      );
      plain.push(""); // the rows block's end — the show-all line stands apart
      plain.push(showAll);
      bookLines.push(showAll + " — index.html?authors=" + code);
      sections.push({ title: listLabel, body: bookLines.join("\n") });
      showPane(seq, pane.join("\n"), plain, sections, exportMeta, {
        kind: t("infoExportKindWorks"),
        facts: null,
        toc: null,
      });
    });
  });
}

// ── Search ─────────────────────────────────────────────────────
// Case-insensitive matching through normaliseForSearch (the library
// search's diacritic folding — Arabic hamza/tashkeel and Thaana thikijehi
// all fold), highlighted via <mark> — the count is the number of marks,
// one counting path, so it can never drift from what is highlighted.
// Per-leaf-node matching: a query spanning an inline element boundary
// won't match across nodes — accepted subset.
// Navigation: Enter / the ↓ button step forward, Shift+Enter / the ↑
// button step back, always wrapping, scrolling the pane to the mark
// (block "center" — a find-bar jump, so the user is visibly taken to the
// term). The count slot shows the total ("N matches") before any
// navigation and the position ("k / N") while stepping.

/** Strip the previous query's highlight (marks and the wrapper spans the
 *  highlighter leaves behind) so the DOM is back to the rendered text
 *  before the next pass — a changed query must not compound marks or nest
 *  wrappers. */
function unwrapHighlights() {
  Array.prototype.forEach.call(_pane.querySelectorAll("mark, .info-hm-wrap"), function (el) {
    var t = document.createTextNode(el.textContent);
    el.parentNode.replaceChild(t, el);
  });
}

function applySearch() {
  var q = _searchInput.value;
  _clearBtn.classList.toggle("visible", !!q);
  _marks = [];
  _markIndex = -1;
  unwrapHighlights();
  var nq = normaliseForSearch(q);
  if (!nq) {
    updateSearchUI();
    return;
  }
  var walker = document.createTreeWalker(_pane, NodeFilter.SHOW_TEXT);
  var nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(function (node) {
    if (normaliseForSearch(node.nodeValue).indexOf(nq) === -1) return;
    var span = document.createElement("span");
    span.className = "info-hm-wrap";
    span.innerHTML = highlightMatches(node.nodeValue, q);
    node.parentNode.replaceChild(span, node);
  });
  _marks = Array.prototype.slice.call(_pane.querySelectorAll("mark"));
  updateSearchUI();
}

/** The count slot + the prev/next buttons — one place, driven by the mark
 *  list, so the UI can never drift from what is highlighted. */
function updateSearchUI() {
  var n = _marks.length;
  var hasNav = n > 1;
  document.getElementById("infoSearchPrev").disabled = !hasNav;
  document.getElementById("infoSearchNext").disabled = !hasNav;
  if (n === 0) {
    _countSlot.textContent = _searchInput.value ? t("infoNoMatch") : "";
    return;
  }
  _countSlot.textContent = _markIndex >= 0
    ? String(_markIndex + 1) + " / " + String(n)
    : t("libBookMatches").replace("{n}", String(n));
}

/** Step to the next/previous highlight, wrapping, and take the user there. */
function goMatch(dir) {
  if (_marks.length === 0) return;
  _markIndex = (_markIndex + dir + _marks.length) % _marks.length;
  _marks[_markIndex].scrollIntoView({ block: "center" });
  updateSearchUI();
}

function nextMatch() { goMatch(1); }
function prevMatch() { goMatch(-1); }

// ── Export ──────────────────────────────────────────────────────
// The four file formats (Word / PDF / HTML Book / EPUB — the reader's full
// set, minus its other 11) run through export.js's shared builders with the
// pane as the "book": each section is one row [title, body] under the
// synthetic header ["headInfo","bodyInfo"], no row numbers — the existing
// headinfo/bodyinfo heuristics style the titles big and the bodies as
// paragraphs; EPUB gets one chapter per section. Every export opens with a
// title page: the kind line ("Biography of the author" …), the pane's name
// pair, the fact strip, then the brand/version/URL — and a Contents page
// (the markdown headings, 2+ only) when the pane has one. The pane head is
// not a section (the builders' title page carries it) and the fact strip is
// not a section either — its lines ride exportExtra.facts. The sections are
// raw text (the copy source), so search highlights never leak into the
// files.

function paneRows() {
  return _sections.map(function (s) { return [s.title, s.body]; });
}

/** Busy state — EPUB is async (font fetch + dynamic import); disable the
 *  whole actions group (the tab band's buttons — copy + the four exports,
 *  one container on desktop and mobile alike) so a slow export can't
 *  double-fire or race a tab switch. The clicked button's label swaps to
 *  the "Preparing…" wording while it works (the reader export's feedback
 *  pattern), restored on completion. */
function setExportBusy(on, btn) {
  _exportBusy = on;
  Array.prototype.forEach.call(_body.querySelectorAll(".info-actions button"), function (b) {
    if (on && b === btn) {
      b.dataset.origText = b.textContent;
      b.textContent = t("exportPreparing");
    } else if (!on && b.dataset.origText) {
      b.textContent = b.dataset.origText;
      delete b.dataset.origText;
    }
    b.disabled = on;
  });
}

/** The info page's own URL, derived from this module's script URL — the
 *  modal can print/share info links from any host page (reader, library
 *  search, dashboard) without knowing which page it sits on (the old
 *  location.pathname splice tied the link to the host page — the author
 *  panes printed "?book=<author code>", a dead link). The Book pane links
 *  ?book=; the Author/Works panes ?author= (the export meta's code doubles
 *  as the author code there), with &tab=works for the Works pane. */
var INFO_PAGE_HREF = new URL("../books/info.html", import.meta.url).href;

/** The page's query string for a tab — relative, so pushState and the
 *  address bar agree whatever the base URL (file:// or https://). A tab
 *  with no deep-link form (a Book pane with no book) returns "". */
function pageQuery(tab) {
  if (tab === "book" && _state.bookCode) return "?book=" + _state.bookCode;
  if (!_state.author) return "";
  return "?author=" + _state.author + (tab === "works" ? "&tab=works" : "");
}

function infoLink() {
  var meta = _exportMeta;
  if (!meta) return "";
  var q = pageQuery(_activeTab);
  return q ? INFO_PAGE_HREF + q : "";
}

function exportPane(fmt, btn) {
  if (_exportBusy || _sections.length === 0 || !_exportMeta) return;
  var meta = _exportMeta;
  // Kind-first filename — every info export announces its kind up front
  // (book-info / author-bio / author-works), so downloads sort by family
  // and the three panes never collide with each other or with the reader's
  // title-only names.
  var kind = _activeTab === "author" ? "author-bio"
    : _activeTab === "works" ? "author-works"
    : "book-info";
  var baseName = kind + " - " + (meta.titleEN || meta.bookCode || "info");
  var siteURL = infoLink();
  var versionFull = t("appVersion");
  var versionText = versionFull.replace(/ \(.*\)/, "");
  var cfg = {
    rows: paneRows(),
    headerRow: ["headInfo", "bodyInfo"],
    hasRowNums: false,
    metadata: meta,
    kindTitle: _exportKind || "",
    titleFacts: _exportFacts.length > 0 ? _exportFacts : null,
    toc: _exportToc && _exportToc.length >= 2 ? _exportToc : null,
    tocTitle: t("infoToc"),
  };
  setExportBusy(true, btn);
  if (fmt === "word") {
    downloadFile(buildWordHTML(cfg, siteURL, versionText), baseName + ".doc", "application/msword");
    setExportBusy(false);
  } else if (fmt === "pdf") {
    var pdfHTML = buildPdfHTML(cfg, siteURL, versionText);
    var win = window.open("", "_blank");
    if (!win) { window.showErrorToast("PDF export failed — popup blocked"); setExportBusy(false); return; }
    win.document.write(pdfHTML);
    win.document.close();
    win.onload = function () { win.print(); };
    setExportBusy(false);
  } else if (fmt === "html") {
    downloadFile(buildHtmlBook(cfg, siteURL, versionText), baseName + ".html", "text/html");
    setExportBusy(false);
  } else if (fmt === "epub") {
    exportEPUB(cfg, siteURL, versionText)
      .then(function (epubBlob) {
        downloadFile(epubBlob, baseName + ".epub", "application/epub+zip");
        setExportBusy(false);
      })
      .catch(function () { window.showErrorToast("EPUB export failed"); setExportBusy(false); });
  }
}

// Open modals re-render in the new language (labels + pane + re-run the
// search — the query survives the re-render)
document.addEventListener("languagechange", function () {
  if (!_wired) return;
  if (_overlay && !_overlay.classList.contains("open")) return;
  labels();
  render();
});
