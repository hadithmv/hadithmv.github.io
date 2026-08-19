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
 * age, tags, row/chapter counts, version) + optional markdown book notes
 * from notes/works/<bookCode>.md.
 * Author tab: fact strip (years/CE/century/age) + markdown bio from
 * notes/authors/<authorCode>.md (auto-TOC when it has 2+ headings).
 * Books tab: the author's other books (deep links into the reader) + a
 * dashboard "show all books" link — hidden when the modal has no author.
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
  periodLabel,
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
var _exportMeta = null; // {bookCode, titleDV, titleAR, titleEN, authorCode} for the builders
var _exportBusy = false;

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

// ── Modal shell ────────────────────────────────────────────────
function ensureModal() {
  if (_overlay) return;
  window.createModal("infoOverlay", "infoModalTitle", "infoModalBody", "info-modal");
  _overlay = document.getElementById("infoOverlay");
  _body = document.getElementById("infoModalBody");
  document.getElementById("infoModalTitle").textContent = t("infoModalTitle");
  _body.innerHTML =
    '<div class="info-tab-row" role="tablist">' +
    '<button type="button" class="info-tab" role="tab" data-tab="book"></button>' +
    '<button type="button" class="info-tab" role="tab" data-tab="author"></button>' +
    '<button type="button" class="info-tab" role="tab" data-tab="books"></button>' +
    "</div>" +
    '<div class="info-search-row">' +
    '<div class="search-input-wrap">' +
    '<input id="infoSearchInput" type="search" class="search-input info-search-input" autocomplete="off" />' +
    '<button type="button" id="infoSearchClear" class="search-clear-btn" title="Clear search" aria-label="Clear search">✕</button>' +
    '</div>' +
    '<button type="button" id="infoSearchPrev" class="info-search-nav" title="Previous match (Shift+Enter)" aria-label="Previous match" disabled>&#8593;</button>' +
    '<button type="button" id="infoSearchNext" class="info-search-nav" title="Next match (Enter)" aria-label="Next match" disabled>&#8595;</button>' +
    '<span id="infoSearchCount" class="info-search-count"></span>' +
    "</div>" +
    '<div class="info-pane" id="infoPane"></div>' +
    '<div class="info-footer">' +
    '<button type="button" id="infoCopyBtn" class="toolbar-btn"></button>' +
    '<span class="info-footer-sep" aria-hidden="true"></span>' +
    '<button type="button" class="toolbar-btn info-export-btn" data-fmt="word" title="Word document">Word</button>' +
    '<button type="button" class="toolbar-btn info-export-btn" data-fmt="pdf" title="PDF for printing">PDF</button>' +
    '<button type="button" class="toolbar-btn info-export-btn" data-fmt="html" title="HTML web page">HTML</button>' +
    '<button type="button" class="toolbar-btn info-export-btn" data-fmt="epub" title="EPUB e-book">EPUB</button>' +
    "</div>";
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
  copyBtn.textContent = t("btnCopyText");
  copyBtn.title = "Copy this tab's content to the clipboard";
  copyBtn.addEventListener("click", function () {
    // Blank lines live in the array itself — the "" entries the tab
    // builders and the markdown renderer push at block boundaries (head →
    // facts → tags → notes; between markdown paragraphs), so the
    // clipboard text has gaps exactly where the sections have them.
    if (_plain.length > 0) window.copyToClipboard(_plain.join("\n"), "toastCopied");
  });
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
  tabs[2].textContent = t("infoTabBooks");
  // The Books tab is the author's books — it exists only when the modal
  // has an author (the hidden attribute needs the explicit rule below;
  // the tab row's flex display would otherwise override it).
  tabs[2].hidden = !_state.author;
  Array.prototype.forEach.call(tabs, function (b) {
    b.classList.toggle("active", b.dataset.tab === _activeTab);
    b.setAttribute("aria-selected", b.dataset.tab === _activeTab ? "true" : "false");
  });
  _searchInput.placeholder = t("infoSearchPlaceholder");
  _searchInput.title = "Search the active tab (Enter: next match, Shift+Enter: previous)";
}

function setTab(tab) {
  if (tab === _activeTab) return;
  if (tab === "books" && !_state.author) return;
  _activeTab = tab;
  labels();
  render();
}

// ── Entry point ────────────────────────────────────────────────
// cfg: { bookCode, author, tab ("book"|"author"), counts: {rows, chapters} }.
// The browse modals' ℹ passes { author }; the reader passes the book's
// code, its first author and the row/chapter counts. Re-opening while open
// re-renders in place — the stack is never double-pushed.
export function openInfoModal(cfg) {
  cfg = cfg || {};
  _state = {
    bookCode: cfg.bookCode || null,
    author: cfg.author || null,
    counts: cfg.counts || null,
  };
  // The explicit tab wins (the reader passes tab: "book" / "author" with the
  // author code alongside); the author fallback is only for callers that
  // pass an author without a tab (the browse modals' ℹ button). The books
  // tab needs an author up front — it cannot open authorless.
  _activeTab = cfg.tab === "author" ? "author"
    : cfg.tab === "books" && cfg.author ? "books"
    : cfg.tab === "book" ? "book"
    : cfg.author ? "author" : "book";
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

// ── Render ─────────────────────────────────────────────────────
function render() {
  var seq = ++_renderSeq;
  _marks = [];
  _markIndex = -1;
  if (_activeTab === "book") renderBookTab(seq);
  else if (_activeTab === "books") renderBooksTab(seq);
  else renderAuthorTab(seq);
}

/** One label/value pair of the fact strip ("" values are dropped by the
 *  callers — an undated author shows no empty Years row). The label is
 *  escaped (i18n text); the value arrives pre-escaped from the callers. */
function factRow(label, value) {
  return (
    '<div class="info-fact-label">' + escapeHTML(label) + "</div>" +
    '<div class="info-fact-value">' + value + "</div>"
  );
}

/** Replace the pane and re-run the search highlight on the fresh DOM. */
function showPane(seq, paneHtml, plain, sections, exportMeta) {
  if (seq !== _renderSeq) return;
  _pane.innerHTML = paneHtml;
  _plain = plain;
  _sections = sections || [];
  _exportMeta = exportMeta || null;
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
        sections.push({ title: title, body: titleAr });
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
            facts.push(factRow(t("facetColCentury"), escapeHTML(periodLabel(p))));
            plain.push(t("facetColCentury") + ": " + periodLabel(p));
            factLines.push(t("facetColCentury") + ": " + periodLabel(p));
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
          factLines.push(tagsPlain);
        }
      }
      if (facts.length > 0) {
        pane.push('<div class="info-card"><div class="info-fact-strip">' + facts.join("") + "</div></div>");
        sections.push({ title: authorLine || title, body: factLines.join("\n") });
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
      // books/, so the notes root is one level up. The section label and
      // its content share one card, the search modal's section look.
      fetchNote("../notes/works/" + code + ".md").then(function (text) {
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
        showPane(seq, pane.join("\n"), plain, sections, exportMeta);
      });
    });
}

/** The author's code for the pane: _state.author as-is, else the first
 *  author of the _state.bookCode's registry row (the reader's title-click
 *  path). Resolves into then(code) — null when there is none. The derived
 *  code is cached on _state so the Author and Books tabs agree without
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

function renderBooksTab(seq) {
  resolveAuthorCode(seq, function (code) { showBooksPane(seq, code); });
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
    sections.push({ title: name, body: nameAr });
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
      facts.push(factRow(t("facetColCentury"), escapeHTML(periodLabel(p))));
      plain.push(t("facetColCentury") + ": " + periodLabel(p));
      factLines.push(t("facetColCentury") + ": " + periodLabel(p));
    }
    var age = authorAgeText(def);
    if (age) {
      facts.push(factRow(t("facetColAge"), escapeHTML(age)));
      plain.push(t("facetColAge") + ": " + age);
      factLines.push(t("facetColAge") + ": " + age);
    }
    if (facts.length > 0) {
      pane.push('<div class="info-card"><div class="info-fact-strip">' + facts.join("") + "</div></div>");
      sections.push({ title: name, body: factLines.join("\n") });
      plain.push(""); // the fact strip block's boundary
    }

    // The bio section — label and content share one card, the search
    // modal's section look.
    fetchNote("../notes/authors/" + code + ".md").then(function (text) {
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
      // The author's books live on their own Books tab (renderBooksTab) —
      // the Author tab is the facts + bio.
      showPane(seq, pane.join("\n"), plain, sections, exportMeta);
    });
  });
}

function showBooksPane(seq, code) {
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
    sections.push({ title: name, body: nameAr });
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
        showPane(seq, pane.join("\n"), plain, sections, exportMeta);
        return;
      }
      var listLabel = t("infoBooksByAuthor").replace("{name}", name);
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
      var showAll = t("infoShowAllBooks").replace("{name}", name);
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
      showPane(seq, pane.join("\n"), plain, sections, exportMeta);
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
// paragraphs; EPUB gets one chapter per section. The sections are raw text
// (the copy source), so search highlights never leak into the files.

function paneRows() {
  return _sections.map(function (s) { return [s.title, s.body]; });
}

/** Busy state — EPUB is async (font fetch + dynamic import); disable the
 *  whole footer so a slow export can't double-fire or race a tab switch.
 *  The clicked button's label swaps to the "Preparing…" wording while it
 *  works (the reader export's feedback pattern), restored on completion. */
function setExportBusy(on, btn) {
  _exportBusy = on;
  Array.prototype.forEach.call(_body.querySelectorAll(".info-footer button"), function (b) {
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

function exportPane(fmt, btn) {
  if (_exportBusy || _sections.length === 0 || !_exportMeta) return;
  var meta = _exportMeta;
  var baseName = meta.titleEN || meta.bookCode || "info";
  var siteURL = window.location.origin + window.location.pathname + "?book=" + (meta.bookCode || "");
  var versionFull = t("appVersion");
  var versionText = versionFull.replace(/ \(.*\)/, "");
  var cfg = {
    rows: paneRows(),
    headerRow: ["headInfo", "bodyInfo"],
    hasRowNums: false,
    metadata: meta,
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
    exportEPUB(cfg, siteURL)
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
  if (!_overlay || !_overlay.classList.contains("open")) return;
  labels();
  render();
});
