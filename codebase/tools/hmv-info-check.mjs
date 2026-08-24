// Book & Author info modal battery (src/js/book-info.js) — the two-tab modal on
// every entry point: reader book-title click (Book tab), reader author-line
// click (Author tab), Alt+I, and the authors browse modal's per-row ℹ button
// (stacked — Escape closes the info modal first, then the browse modal).
// Covers the pane content (facts derived from 02/03 + the content CSV, notes
// from the fixture markdown, the bio's auto-TOC), the re-targeting search
// (count == number of <mark>s, query survives tab switches, no-match, clear),
// the copy button (monkey-patched clipboard capture), the four pane exports
// (patched URL.createObjectURL / window.open blob captures) and the reader
// Word-export byte regression against tools/golden/reader-word.doc (guards
// the Phase 2 export.js shared-builder refactor).
// Run: node tools/hmv-info-check.mjs  (from codebase/, or anywhere — paths
// resolve relative to this script). Requires Node 20.11+ and Microsoft Edge.
// Env overrides: HMV_INFO_PORT (default 9365), HMV_INFO_PROFILE.
//
// Checks:
//  S1  reader title click → Book tab: title pair, author/years/CE/century/
//      age/tags fact rows, rows·chapters·version meta line, markdown notes
//  S2  a book with no notes file shows the quiet "No notes yet" placeholder
//      (and an author without a bio gets one on the Author tab too; the
//      Works tab still renders)
//  S3  reader author-line click → Author tab: fact strip, bio with auto-TOC
//      (3 headings → 3 links; a TOC click scrolls, no hash churn)
//  S3b the Works tab (a third tab, hidden without an author): the works
//      list with deep links, the in-modal dashboard "show all" link
//  S4  tab switching re-renders the pane; the search query survives it
//  S5  search: live highlight, count == number of <mark>s (one counting
//      path), Enter/Shift+Enter and the ↑/↓ buttons step "k / N" through
//      the matches, the pane scrolls to each term; focus stays in the input
//  S6  no-match → muted "No matches"; clearing empties the count slot;
//      the clear ✕ mirrors the query and click-clears (search-window pattern)
//  S7  copy captures the active tab's plain text exactly (book + author +
//      works tabs); the copy-link chip captures the raw info-page URL
//      (?book=… / ?author=… / &tab=works) — the exports' anchor sibling
//  S8  exports: Word/HTML blob bytes + names, EPUB (PK + mimetype + the
//      async disable/re-enable of the action buttons), PDF popup document —
//      all carry the siteURL info-page link and the version footer
//  S8b reader Word export byte-identical to tools/golden/reader-word.doc
//  S9  authors modal ℹ button stacks the info modal; Escape closes the
//      info modal first, then the browse modal
//  S10 Alt+I opens the info modal on the Book tab
//  S11 mobile (600px): the modal fills the viewport, no horizontal scroll;
//      the actions collapse behind the 📥 toggle — it opens a dropdown
//      menu (copy + the four formats) that closes on a tab switch, on
//      selection, and on outside clicks; at 1280px the actions sit inline
//      in the tab band, toggle hidden
//  S12 no page errors
//  S13 books/info.html page: the deep links behind the modal's exports —
//      ?author=CODE renders the Author pane as a page (no overlay, no
//      content-CSV fetch), &tab=works the Works pane, ?book=CODE the Book
//      pane, an unknown code the placeholder, a bare visit the empty state;
//      the page carries the modal's RTL + webfont itself (reader-search.css
//      for the search row); tab switches pushState the query and
//      back/forward re-render from it
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { pathToFileURL } from "url";

const { parseCSV } = await import(pathToFileURL(path.join(import.meta.dirname, "..", "src", "js", "csv.js")));

// The Gregorian equivalent of an AH year — the same approximation as
// book-data.js's authorYearsCeText (1 Hijri year ≈ 0.970229 solar years,
// offset 621.57, rounded).
const ceFromAh = (ah) => Math.round(ah * 0.970229 + 621.57);
// Display thousands separators — same as search-utils formatThousands.
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// Machine-specific: path to Microsoft Edge. Adjust per machine/OS.
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const baseDir = import.meta.dirname.replace(/\\/g, "/");
const IS_DIST = process.argv.includes("--dist");
const ROOT = baseDir + (IS_DIST ? "/../dist/books/" : "/../src/books/");
const DATA = baseDir + "/../data/";
const NOTES = baseDir + "/../static/notes/";
const GOLDEN = path.join(baseDir, "golden");
const PORT = process.env.HMV_INFO_PORT ? parseInt(process.env.HMV_INFO_PORT, 10) : 9365;
const PROFILE = process.env.HMV_INFO_PROFILE || (process.env.TEMP + "\\hmv-info-check-profile");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? "PASS  " : "FAIL  ") + name + (detail !== undefined ? "   [" + detail + "]" : ""));
  if (!cond) failures++;
}

// ── expected values straight from the data files ─────────────────────
function csvObjects(file) {
  const rows = parseCSV(fs.readFileSync(DATA + file, "utf8"));
  const hdr = rows.shift();
  return rows.map((r) => Object.fromEntries(hdr.map((h, i) => [h, r[i]])));
}
const authors02 = csvObjects("02-registry-bookAuthors.csv").filter((a) => a.authorCode);
const books03 = csvObjects("03-registry-bookMeta.csv");
const nameEN = (code) => (authors02.find((a) => a.authorCode === code) || {}).nameEN || code;
const nameAR = (code) => (authors02.find((a) => a.authorCode === code) || {}).nameAR || "";
const malikRow = authors02.find((a) => a.authorCode === "malikBinAnas");
const muwatta = books03.find((b) => b.bookCode === "HDT-muwattaMalik");
// Author line and fact values on the Book tab — the same derivations as
// book-data.js (the authorLife "{b}–{d} AH" template, the CE approximation,
// the "Century N" period label, diedAH − bornAH with the "y." unit).
const MALIK_LINE = nameEN("malikBinAnas") + " (" + malikRow.bornAH + "–" + malikRow.diedAH + " AH)";
const MALIK_YEARS = malikRow.bornAH + "–" + malikRow.diedAH + " AH";
const MALIK_CE = ceFromAh(parseInt(malikRow.bornAH, 10)) + "–" + ceFromAh(parseInt(malikRow.diedAH, 10)) + " CE";
const MALIK_AGE = String(parseInt(malikRow.diedAH, 10) - parseInt(malikRow.bornAH, 10)) + " y.";
// Rows/chapters/version once fed the Book tab's meta line; the line was
// removed (it demanded the content CSV — the info page renders registry
// facts only), so the battery asserts its absence (S1) instead of its
// content. No content CSV is read at all here.
// The tags row — the PRIMARY tag (the first registered bookCode prefix
// segment, HDT) plus the registry entry's tags column (DRFT), each with its
// EN label from 01, joined " · " in the plain text; the chips themselves
// render concatenated (no separator between chips).
const tags01 = csvObjects("01-registry-bookTags.csv").filter((t) => t.tagCode);
const muwattaCodes = ["HDT", ...(muwatta.tags || "").split(",").map((s) => s.trim()).filter(Boolean)];
const tagLabelEn = (code) => (tags01.find((t) => t.tagCode === code) || {}).labelEN || code;
const M_TAGS = "Tags: " + muwattaCodes.map(tagLabelEn).join(" · ");
const M_TAGS_CHIPS = muwattaCodes.map(tagLabelEn).join("");
// The markdown fixtures' plain text — mirrors renderMarkdown's plain path
// (heading markers and "- " prefixes stripped, inline markers kept literal;
// blank source lines stay as "" — the renderer's paragraph-gap separators,
// a blank line in the copy between markdown blocks) so the copy
// assertions stay exact.
function markdownPlain(src) {
  return String(src || "").split(/\r?\n/).map(function (line) {
    const l = line.trim();
    if (!l) return "";
    const m = /^(#{1,2})\s+(.*)$/.exec(l);
    if (m) return m[2];
    if (/^-\s+/.test(l)) return l.replace(/^-\s+/, "");
    return l;
  }).join("\n");
}
const BOOK_NOTES_PLAIN = markdownPlain(fs.readFileSync(NOTES + "works/HDT-muwattaMalik.md", "utf8"));
const BIO_PLAIN = markdownPlain(fs.readFileSync(NOTES + "authors/malikBinAnas.md", "utf8"));
// The author tab's books list — registry rows carrying the code, -HDN
// duplicates excluded, same rule as the browse counts.
const MALIK_BOOKS = books03.filter((b) => b.bookCode.indexOf("-HDN") === -1 &&
  ((b.authorCode || "").split(",").map((s) => s.trim()).filter(Boolean).indexOf("malikBinAnas") !== -1));
// The books list shows the DV title (getBookTitleSync is DV-primary — the
// modal's display convention, same as the Book-tab head) with the AR subline.
const BOOK_LINE = (b) => (b.titleDV || b.titleEN || b.bookCode) + " — " + (b.titleAR || "");
// The exports' version footer — t("appVersion").en "v6.9.85 (Web)" with the
// "(…)" suffix stripped by exportPane.
const VERSION_TEXT = "v6.9.85";
// The exact plain text the copy button captures on each tab — the same
// line order renderBookTab/showAuthorPane/showBooksPane build. Entries
// are single-newline separated; the "" entries are the blank lines the
// builders push at block boundaries (head → facts → tags → notes) and
// the markdown renderer's paragraph gaps — so the clipboard text has
// gaps exactly where the sections have them. The books list lives on its
// own tab, so the Author tab stops after the bio.
const BOOK_TAB_PLAIN = [
  muwatta.titleDV, muwatta.titleAR, "",
  "Author: " + MALIK_LINE,
  "Years: " + MALIK_YEARS,
  "Gregorian: " + MALIK_CE,
  "Century: 2", // the label carries the word — the value is the bare number
  "Age: " + MALIK_AGE,
  M_TAGS, "", // the tags sit inside the fact strip — one block with the facts
  "Book notes", "",
  BOOK_NOTES_PLAIN,
].join("\n");
const AUTHOR_TAB_PLAIN = [
  nameEN("malikBinAnas"), nameAR("malikBinAnas"), "",
  "Years: " + MALIK_YEARS,
  "Gregorian: " + MALIK_CE,
  "Century: 2", // the label carries the word — the value is the bare number
  "Age: " + MALIK_AGE, "",
  "Bio", "",
  BIO_PLAIN,
].join("\n");
const WORKS_TAB_PLAIN = [
  nameEN("malikBinAnas"), nameAR("malikBinAnas"), "",
  "Works by " + nameEN("malikBinAnas"), "",
  BOOK_LINE(muwatta), "",
  "Show all works by " + nameEN("malikBinAnas"),
].join("\n");

// The export-capture hooks — blob bytes are trapped on URL.createObjectURL
// (bytes arrive via arrayBuffer), the PDF popup via a fake window.open that
// records document.write input. Installed per page load (navigation wipes
// the window hooks).
const PATCH_EXPORTS = `(function () {
  window.__cap = [];
  var origUrl = URL.createObjectURL;
  URL.createObjectURL = function (b) {
    var url = origUrl.call(URL, b);
    var idx = window.__cap.length;
    window.__cap.push({ type: b.type, name: b.name || "", size: b.size });
    b.arrayBuffer().then(function (buf) { window.__cap[idx].bytes = Array.from(new Uint8Array(buf)); });
    return url;
  };
  window.__pdf = [];
  window.open = function () {
    return {
      document: {
        write: function (s) { window.__pdf.push(s); },
        close: function () {}
      },
      onload: null,
      print: function () {}
    };
  };
})()`;

async function main() {
  fs.rmSync(PROFILE, { recursive: true, force: true });
  const edge = spawn(EDGE, [
    "--headless=new", "--disable-gpu", "--no-first-run",
    "--allow-file-access-from-files",
    "--user-data-dir=" + PROFILE,
    "--remote-debugging-port=" + PORT,
    "about:blank",
  ], { stdio: "ignore" });

  let target = null;
  for (let i = 0; i < 60; i++) {
    try {
      const list = JSON.parse(await (await fetch("http://127.0.0.1:" + PORT + "/json")).text());
      target = list.find((t) => t.type === "page");
      if (target) break;
    } catch (e) { /* not up yet */ }
    await sleep(200);
  }
  if (!target) { console.log("NO_TARGET"); edge.kill(); process.exit(1); }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const pageErrors = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === "Runtime.exceptionThrown") pageErrors.push(m.params.exceptionDetails.text || "exception");
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") pageErrors.push("console.error");
  };
  await new Promise((r) => (ws.onopen = r));
  const send = (method, params = {}) =>
    new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

  async function evalJS(expr) {
    const m = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
    if (m.result && m.result.exceptionDetails) {
      const d = m.result.exceptionDetails.exception && m.result.exceptionDetails.exception.description
        ? m.result.exceptionDetails.exception.description : m.result.exceptionDetails.text;
      throw new Error("EXC: " + d);
    }
    return m.result.result.value;
  }

  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

  async function goto(url) {
    await send("Page.navigate", { url });
    await evalJS(`new Promise((res) => {
      const t0 = Date.now();
      (function poll() {
        if (document.readyState === 'complete' && document.body && document.body.children.length > 2) return res(true);
        if (Date.now() - t0 > 20000) return res(false);
        setTimeout(poll, 100);
      })();
    })`);
    await sleep(400);
  }

  async function waitFor(expr, timeout) {
    return evalJS(`new Promise((res) => {
      const t0 = Date.now();
      (function poll() {
        try { if ((${expr})) return res(true); } catch (e) {}
        if (Date.now() - t0 > ${timeout || 15000}) return res(false);
        setTimeout(poll, 100);
      })();
    })`);
  }

  // The reader fixture (muwatta) — the battery runs the page in English and
  // derives its expected strings from 02/03 + the notes fixtures.
  await goto("file://" + ROOT + "reader.html?book=HDT-muwattaMalik");
  await evalJS(`localStorage.setItem('lang','en')`);
  await goto("file://" + ROOT + "reader.html?book=HDT-muwattaMalik");
  await waitFor(`document.querySelector('#readerContent .reader-chunk')`);

  // ── S1: title click → Book tab ─────────────────────────────────────
  await evalJS(`document.getElementById('pageTitle').click()`);
  await waitFor(`!!document.getElementById('infoOverlay') && document.getElementById('infoOverlay').classList.contains('open')`);
  // The pane renders async (author definitions → registry → notes fetch) —
  // wait for the notes section label before asserting anything in it.
  await waitFor(`!!document.querySelector('#infoPane .info-section-label')`);
  check("S1 title click opens the info modal on the Book tab", await evalJS(
    `document.getElementById('infoOverlay').classList.contains('open') &&
     document.querySelector('#infoModalBody .info-tab[data-tab="book"]').classList.contains('active')`));
  check("S1 head shows the current-lang title pair", await evalJS(
    `document.querySelector('#infoPane .info-head-title').textContent === ${JSON.stringify(muwatta.titleDV)} &&
     document.querySelector('#infoPane .info-head-ar').textContent === ${JSON.stringify(muwatta.titleAR)}`),
    await evalJS(`document.querySelector('#infoPane .info-head-title').textContent + ' / ' + document.querySelector('#infoPane .info-head-ar').textContent`));
  // The fact strip — label/value pairs, one after another directly inside
  // the strip (factRow emits sibling divs; there is no row wrapper).
  const factOf = (label) => `(function () {
    var kids = Array.prototype.slice.call(document.querySelectorAll('#infoPane .info-fact-strip > div'));
    for (var i = 0; i < kids.length; i++) {
      if (kids[i].className === 'info-fact-label' && kids[i].textContent === ${JSON.stringify(label)}) {
        return kids[i + 1] ? kids[i + 1].textContent : '';
      }
    }
    return '';
  })()`;
  check("S1 fact strip: author line", await evalJS(factOf("Author:")) === MALIK_LINE, await evalJS(factOf("Author:")));
  check("S1 fact strip: Hijri years", await evalJS(factOf("Years:")) === MALIK_YEARS, await evalJS(factOf("Years:")));
  check("S1 fact strip: Gregorian years", await evalJS(factOf("Gregorian:")) === MALIK_CE, await evalJS(factOf("Gregorian:")));
  // The century chip has its label back — "Century:" over the bare number
  // ("2"), never "Century: Century 2" doubled. Label/value divs stay
  // sibling pairs, so the strip's two columns (labels, then values) never
  // drift — the label-less chip that once shifted every later pair is gone.
  const centuryProbe = `(function () {
    var kids = Array.prototype.slice.call(document.querySelectorAll('#infoPane .info-fact-strip > div'));
    var labeled = kids.filter(function (k) { return k.className === 'info-fact-label' && k.textContent === 'Century:'; }).length;
    var bare = kids.filter(function (k) { return k.className === 'info-fact-value' && k.textContent === '2'; }).length;
    return labeled === 1 && bare === 1;
  })()`;
  check("S1 fact strip: century — labeled, value is the bare number", await evalJS(centuryProbe),
    await evalJS(`Array.prototype.slice.call(document.querySelectorAll('#infoPane .info-fact-strip > div')).map(function (d) { return d.className + '=' + d.textContent; }).join(' | ')`));
  check("S1 fact strip: age", await evalJS(factOf("Age:")) === MALIK_AGE, await evalJS(factOf("Age:")));
  check("S1 fact strip: tag chips (primary HDT + secondary DRFT)", await evalJS(factOf("Tags:")) === M_TAGS_CHIPS, await evalJS(factOf("Tags:")));
  check("S1 no derived-meta line (rows · chapters · version removed)", await evalJS(
    `!document.querySelector('#infoPane .info-meta')`));
  check("S1 notes section: label + the two fixture paragraphs", await evalJS(
    `document.querySelector('#infoPane .info-section-label').textContent === "Book notes" &&
     document.querySelectorAll('#infoPane .info-md p').length === 2`));

  // ── S4/S5/S6: tab switching + search (same session — no reload) ────
  // The Author tab first (needed by S3's assertions), then back — S4.
  await evalJS(`document.querySelector('#infoModalBody .info-tab[data-tab="author"]').click()`);
  await waitFor(`!!document.querySelector('#infoPane .info-toc')`);

  // ── S3: author tab ────────────────────────────────────────────────
  check("S3 head carries the current-lang name pair", await evalJS(
    `document.querySelector('#infoPane .info-head-title').textContent === ${JSON.stringify(nameEN("malikBinAnas"))} &&
     document.querySelector('#infoPane .info-head-ar').textContent === ${JSON.stringify(nameAR("malikBinAnas"))}`),
    await evalJS(`document.querySelector('#infoPane .info-head-title').textContent + ' / ' + document.querySelector('#infoPane .info-head-ar').textContent`));
  check("S3 fact strip: years · CE · century · age", await evalJS(
    `(() => { var kids = Array.prototype.slice.call(document.querySelectorAll('#infoPane .info-fact-strip > div')); var get = function(l){ for (var i = 0; i < kids.length; i++){ if (kids[i].className === 'info-fact-label' && kids[i].textContent === l) return kids[i + 1] ? kids[i + 1].textContent : ''; } return ''; }; return get('Years:') === ${JSON.stringify(MALIK_YEARS)} && get('Gregorian:') === ${JSON.stringify(MALIK_CE)} && get('Century:') === '2' && get('Age:') === ${JSON.stringify(MALIK_AGE)}; })()`),
    await evalJS(`(() => { var kids = Array.prototype.slice.call(document.querySelectorAll('#infoPane .info-fact-strip > div')); var get = function(l){ for (var i = 0; i < kids.length; i++){ if (kids[i].className === 'info-fact-label' && kids[i].textContent === l) return kids[i + 1] ? kids[i + 1].textContent : ''; } return ''; }; return ['Years:','Gregorian:','Century:','Age:'].map(get).join(' | '); })()`));
  // The bio's auto-TOC — the fixture has 3 headings → a "Contents" nav with
  // one link per heading, anchored to the heading ids.
  check("S3 auto-TOC: 3 links over the 3 fixture headings", await evalJS(
    `(() => { var toc = Array.from(document.querySelectorAll('#infoPane .info-toc a')); var ids = ['info-h1','info-h2','info-h3']; return document.querySelector('#infoPane .info-toc-title').textContent === 'Contents' && toc.length === 3 && toc[0].textContent === 'Life' && toc[1].textContent === 'The Muwatta' && toc[2].textContent === 'Legacy' && toc.every(function(a, i){ return a.getAttribute('href') === '#' + ids[i] && !!document.getElementById(ids[i]); }); })()`),
    await evalJS(`Array.from(document.querySelectorAll('#infoPane .info-toc a')).map(function(a){ return a.textContent + '->' + a.getAttribute('href'); }).join(' ')`));
  // A TOC click scrolls the pane and must not churn the URL hash.
  const hashBefore = await evalJS(`location.hash`);
  await evalJS(`document.querySelector('#infoPane .info-toc a').click()`);
  await sleep(300);
  check("S3 TOC click leaves the hash alone", await evalJS(`location.hash`) === hashBefore, await evalJS(`location.hash`));

  // ── S3b: the Works tab — the author's works, one tab over ──────────
  // The works list lives on its own tab (the Author tab is facts + bio);
  // the tab exists only when the modal carries an author.
  await evalJS(`document.querySelector('#infoModalBody .info-tab[data-tab="works"]').click()`);
  await waitFor(`!!document.querySelector('#infoPane .info-books-list')`);
  check("S3b works tab is a third tab, active after the click", await evalJS(
    `document.querySelectorAll('#infoModalBody .info-tab').length === 3 &&
     document.querySelector('#infoModalBody .info-tab[data-tab="works"]').classList.contains('active') &&
     !document.querySelector('#infoModalBody .info-tab[data-tab="works"]').hidden`));
  check("S3b works tab head carries the author name pair", await evalJS(
    `document.querySelector('#infoPane .info-head-title').textContent === ${JSON.stringify(nameEN("malikBinAnas"))} &&
     document.querySelector('#infoPane .info-head-ar').textContent === ${JSON.stringify(nameAR("malikBinAnas"))}`));
  // The works list — muwatta only (registry), one deep-linked row.
  check("S3b works list: one row, deep-linked into the reader", await evalJS(
    `(() => { var rows = document.querySelectorAll('#infoPane .info-book-row'); var labels = Array.from(document.querySelectorAll('#infoPane .info-section-label')).map(function (l) { return l.textContent; }); return labels.indexOf('Works by ${nameEN("malikBinAnas")}') !== -1 && rows.length === 1 && rows[0].getAttribute('href') === 'reader.html?book=HDT-muwattaMalik' && rows[0].querySelector('.info-book-title').textContent === ${JSON.stringify(muwatta.titleDV)} && rows[0].querySelector('.info-book-ar').textContent === ${JSON.stringify(muwatta.titleAR)}; })()`),
    await evalJS(`Array.from(document.querySelectorAll('#infoPane .info-book-row')).map(function(r){ return r.getAttribute('href') + ' ' + r.textContent; }).join('; ')`));
  check("S3b in-modal dashboard link", await evalJS(
    `document.querySelector('#infoPane .info-show-all').getAttribute('href') === 'index.html?authors=malikBinAnas' &&
     document.querySelector('#infoPane .info-show-all').textContent === 'Show all works by ${nameEN("malikBinAnas")}'`),
    await evalJS(`document.querySelector('#infoPane .info-show-all').getAttribute('href')`));
  // Back to the Author tab — the next sections pick up from here.
  await evalJS(`document.querySelector('#infoModalBody .info-tab[data-tab="author"]').click()`);
  await waitFor(`!!document.querySelector('#infoPane .info-toc')`);

  // ── S4: switching back to the Book tab re-renders the pane ─────────
  await evalJS(`document.querySelector('#infoModalBody .info-tab[data-tab="book"]').click()`);
  await waitFor(`document.querySelector('#infoPane .info-head-title').textContent === ${JSON.stringify(muwatta.titleDV)}`);
  check("S4 book tab re-rendered", await evalJS(
    `document.querySelector('#infoModalBody .info-tab[data-tab="book"]').classList.contains('active') &&
     !document.querySelector('#infoPane .info-toc')`));

  // ── S5: search on the Book tab — highlight + one counting path ─────
  // "Malik" matches the author fact row + the notes' "Imam Malik" →
  // 2 marks, "2 matches".
  await evalJS(`(function () {
    var inp = document.getElementById('infoSearchInput');
    inp.value = 'Malik';
    inp.dispatchEvent(new Event('input'));
  })()`);
  await sleep(150);
  check("S5 search count == number of <mark>s (2 matches)", await evalJS(
    `document.querySelectorAll('#infoPane mark').length === 2 &&
     document.getElementById('infoSearchCount').textContent === '2 matches'`),
    await evalJS(`document.getElementById('infoSearchCount').textContent + ' marks=' + document.querySelectorAll('#infoPane mark').length`));
  // Diacritic folding — "مالك" matches the Arabic head only (the kasra in
  // the head pair's Arabic folds away): 1 mark.
  await evalJS(`(function () {
    var inp = document.getElementById('infoSearchInput');
    inp.value = 'مالك';
    inp.dispatchEvent(new Event('input'));
  })()`);
  await sleep(150);
  check("S5 search folds diacritics (Arabic query, 1 mark)", await evalJS(
    `document.querySelectorAll('#infoPane mark').length === 1 &&
     document.getElementById('infoSearchCount').textContent === '1 matches'`),
    await evalJS(`document.getElementById('infoSearchCount').textContent + ' marks=' + document.querySelectorAll('#infoPane mark').length`));
  // Enter steps to the match — with one match the counter switches from
  // the total to the position "1 / 1" and the nav buttons stay disabled.
  await evalJS(`(function () {
    var inp = document.getElementById('infoSearchInput');
    inp.focus();
    inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  })()`);
  await sleep(100);
  check("S5 Enter advances without error, focus stays in the input", await evalJS(
    `document.activeElement === document.getElementById('infoSearchInput') &&
     document.querySelectorAll('#infoPane mark').length === 1 &&
     document.getElementById('infoSearchCount').textContent === '1 / 1' &&
     document.getElementById('infoSearchPrev').disabled &&
     document.getElementById('infoSearchNext').disabled`));
  // N/M stepping — a two-mark query ("Malik": the author fact row + the
  // notes' "Imam Malik"): the buttons arm, Enter moves 1/2 → 2/2, and the
  // pane scrolls so the second mark (in the notes section) is visible —
  // the user is taken to each term. Shift+Enter steps back, wrapping.
  await evalJS(`(function () {
    var inp = document.getElementById('infoSearchInput');
    inp.value = 'Malik';
    inp.dispatchEvent(new Event('input'));
  })()`);
  await sleep(150);
  check("S5 nav buttons arm with 2+ matches, counter back to the total", await evalJS(
    `document.getElementById('infoSearchCount').textContent === '2 matches' &&
     !document.getElementById('infoSearchPrev').disabled &&
     !document.getElementById('infoSearchNext').disabled`));
  await evalJS(`(function () {
    var inp = document.getElementById('infoSearchInput');
    inp.focus();
    inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  })()`);
  await sleep(100);
  check("S5 Enter takes you to match 1 / 2", await evalJS(
    `document.getElementById('infoSearchCount').textContent === '1 / 2'`),
    await evalJS(`document.getElementById('infoSearchCount').textContent`));
  await evalJS(`(function () {
    var inp = document.getElementById('infoSearchInput');
    inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  })()`);
  await sleep(200);
  check("S5 second Enter: 2 / 2 and the pane brought the notes mark into view", await evalJS(
    `(function () {
       var count = document.getElementById('infoSearchCount').textContent === '2 / 2';
       var marks = document.querySelectorAll('#infoPane mark');
       var m = marks[1].getBoundingClientRect();
       var p = document.getElementById('infoPane').getBoundingClientRect();
       return count && m.top >= p.top && m.bottom <= p.bottom;
     })()`),
    await evalJS(`'count=' + document.getElementById('infoSearchCount').textContent + ' scrollTop=' + document.getElementById('infoPane').scrollTop`));
  await evalJS(`(function () {
    var inp = document.getElementById('infoSearchInput');
    inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true }));
  })()`);
  await sleep(100);
  check("S5 Shift+Enter wraps back to 1 / 2", await evalJS(
    `document.getElementById('infoSearchCount').textContent === '1 / 2'`),
    await evalJS(`document.getElementById('infoSearchCount').textContent`));
  // Restore the Arabic query for the tab-switch continuity check below.
  await evalJS(`(function () {
    var inp = document.getElementById('infoSearchInput');
    inp.value = 'مالك';
    inp.dispatchEvent(new Event('input'));
  })()`);
  await sleep(150);
  // The query survives a tab switch and re-matches against the new pane:
  // on the Author tab "مالك" hits the Arabic head pair + the bio's Arabic
  // line (the works row's Arabic subline lives on the Works tab now).
  await evalJS(`document.querySelector('#infoModalBody .info-tab[data-tab="author"]').click()`);
  await waitFor(`document.querySelector('#infoPane .info-head-title').textContent === ${JSON.stringify(nameEN("malikBinAnas"))}`);
  check("S5 query survives the tab switch", await evalJS(
    `document.getElementById('infoSearchInput').value === 'مالك' &&
     document.querySelectorAll('#infoPane mark').length > 1`),
    await evalJS(`'input=' + document.getElementById('infoSearchInput').value + ' marks=' + document.querySelectorAll('#infoPane mark').length`));

  // ── S6: no-match and clear ─────────────────────────────────────────
  await evalJS(`(function () {
    var inp = document.getElementById('infoSearchInput');
    inp.value = 'zzzz';
    inp.dispatchEvent(new Event('input'));
  })()`);
  await sleep(150);
  check("S6 no-match → muted 'No matches', zero marks", await evalJS(
    `document.getElementById('infoSearchCount').textContent === 'No matches' &&
     document.querySelectorAll('#infoPane mark').length === 0`),
    await evalJS(`document.getElementById('infoSearchCount').textContent`));
  await evalJS(`(function () {
    var inp = document.getElementById('infoSearchInput');
    inp.value = '';
    inp.dispatchEvent(new Event('input'));
  })()`);
  await sleep(150);
  check("S6 clearing empties the count slot", await evalJS(
    `document.getElementById('infoSearchCount').textContent === '' &&
     document.querySelectorAll('#infoPane mark').length === 0`));
  // The ✕ (search-window pattern) mirrors the query: visible only while
  // there is one; click clears the field and re-runs the search (unwraps
  // the highlights, empties the count, disables the nav buttons).
  await evalJS(`(function () {
    var inp = document.getElementById('infoSearchInput');
    inp.value = 'Malik';
    inp.dispatchEvent(new Event('input'));
  })()`);
  await sleep(150);
  check("S6 clear ✕ appears with a query", await evalJS(
    `document.getElementById('infoSearchClear').classList.contains('visible') &&
     document.getElementById('infoSearchClear').textContent === '✕'`));
  await evalJS(`document.getElementById('infoSearchClear').click()`);
  await sleep(150);
  check("S6 clear ✕ empties input, count, marks, nav", await evalJS(
    `document.getElementById('infoSearchInput').value === '' &&
     !document.getElementById('infoSearchClear').classList.contains('visible') &&
     document.getElementById('infoSearchCount').textContent === '' &&
     document.querySelectorAll('#infoPane mark').length === 0 &&
     document.getElementById('infoSearchPrev').disabled &&
     document.getElementById('infoSearchNext').disabled`));

  // ── S7: copy — patched clipboard capture, exact plain text ─────────
  // Headless clipboard is unreliable — the capture happens at the
  // window.copyToClipboard call site (the module's own clipboard entry).
  await evalJS(`window.copyToClipboard = function (text) { window.__copied = text; };`);
  await evalJS(`document.getElementById('infoCopyBtn').click()`);
  await sleep(100);
  check("S7 author-tab copy = exact plain text", await evalJS(`window.__copied === ${JSON.stringify(AUTHOR_TAB_PLAIN)}`),
    await evalJS(`(window.__copied || '').slice(0, 80).replace(/\\n/g, '|')`));
  await evalJS(`document.querySelector('#infoModalBody .info-tab[data-tab="works"]').click()`);
  await waitFor(`!!document.querySelector('#infoPane .info-books-list')`);
  await evalJS(`document.getElementById('infoCopyBtn').click()`);
  await sleep(100);
  check("S7 works-tab copy = exact plain text", await evalJS(`window.__copied === ${JSON.stringify(WORKS_TAB_PLAIN)}`),
    await evalJS(`(window.__copied || '').slice(0, 80).replace(/\\n/g, '|')`));
  await evalJS(`document.querySelector('#infoModalBody .info-tab[data-tab="book"]').click()`);
  await waitFor(`document.querySelector('#infoPane .info-head-title').textContent === ${JSON.stringify(muwatta.titleDV)}`);
  await evalJS(`document.getElementById('infoCopyBtn').click()`);
  await sleep(100);
  check("S7 book-tab copy = exact plain text", await evalJS(`window.__copied === ${JSON.stringify(BOOK_TAB_PLAIN)}`),
    await evalJS(`(window.__copied || '').slice(0, 80).replace(/\\n/g, '|')`));
  // The copy-link chip copies the info page's URL for the active pane — the
  // same string the exports print (path-tail match: the drive letter and
  // case come from the browser's own script URL resolution).
  const copyLink = () => evalJS(`document.getElementById('infoCopyLinkBtn').click()`);
  const copiedHas = (tail) => evalJS(`(window.__copied || '').indexOf(${JSON.stringify(tail)}) !== -1`);
  await copyLink();
  await sleep(100);
  check("S7 copy-link on the book tab → info.html?book=…", await copiedHas("books/info.html?book=HDT-muwattaMalik"),
    await evalJS(`window.__copied || ''`));
  await evalJS(`document.querySelector('#infoModalBody .info-tab[data-tab="author"]').click()`);
  await waitFor(`document.querySelector('#infoPane .info-head-title').textContent === ${JSON.stringify(nameEN("malikBinAnas"))}`);
  await copyLink();
  await sleep(100);
  check("S7 copy-link on the author tab → info.html?author=…", await copiedHas("books/info.html?author=malikBinAnas"),
    await evalJS(`window.__copied || ''`));
  await evalJS(`document.querySelector('#infoModalBody .info-tab[data-tab="works"]').click()`);
  await waitFor(`!!document.querySelector('#infoPane .info-books-list')`);
  await copyLink();
  await sleep(100);
  check("S7 copy-link on the works tab → info.html?author=…&tab=works", await copiedHas("books/info.html?author=malikBinAnas&tab=works"),
    await evalJS(`window.__copied || ''`));
  // Back to the book tab — the export section picks up from here.
  await evalJS(`document.querySelector('#infoModalBody .info-tab[data-tab="book"]').click()`);
  await waitFor(`document.querySelector('#infoPane .info-head-title').textContent === ${JSON.stringify(muwatta.titleDV)}`);

  // ── S8: the four pane exports (patched blob/popup captures) ────────
  await evalJS(PATCH_EXPORTS);
  const clickExport = (fmt) => evalJS(`document.querySelector('#infoModalBody .info-export-btn[data-fmt="${fmt}"]').click()`);
  const capEntry = (type) => evalJS(`window.__cap.find(function (e) { return e.type === ${JSON.stringify(type)} && e.bytes; })`);
  const capPdf = () => evalJS(`window.__pdf[0]`);
  const waitBytes = (type, timeout) => waitFor(`window.__cap.some(function (e) { return e.type === ${JSON.stringify(type)} && e.bytes; })`, timeout || 20000);
  const waitPdf = () => waitFor(`window.__pdf.length === 1`, 20000);
  const contains = (entry, str) => entry && entry.bytes && (Buffer.from(entry.bytes).includes(Buffer.from(str, "utf8")));

  // Word — synchronous blob (application/msword). The blobs carry no .name
  // (downloadFile hands the bare Blob to the browser — same as the reader);
  // the type + the content are the contract.
  await clickExport("word");
  await waitBytes("application/msword");
  const wordEntry = await capEntry("application/msword");
  check("S8 Word: type, info-page book link, kind line + brand/version + the DV title h1", wordEntry &&
    wordEntry.type === "application/msword" && contains(wordEntry, "info.html?book=HDT-muwattaMalik") &&
    contains(wordEntry, VERSION_TEXT) && contains(wordEntry, muwatta.titleDV) &&
    contains(wordEntry, "Description of the book") && contains(wordEntry, "Hadithmv - " + VERSION_TEXT),
    (wordEntry ? wordEntry.size + "B" : "no blob"));
  // The title page's group separators + the page-break p are structural —
  // the golden covers their bytes; these guards keep the elements in place
  // (the break must be a real character p — Word drops an empty div break).
  check("S8 Word: title-sep hairlines + page-break p present, tags absent from the export", wordEntry &&
    contains(wordEntry, "title-sep") && contains(wordEntry, "page-break") && !contains(wordEntry, "Tags:"),
    (wordEntry ? wordEntry.size + "B" : "no blob"));
  // HTML Book — same path, text/html blob
  await clickExport("html");
  await waitBytes("text/html");
  const htmlEntry = await capEntry("text/html");
  check("S8 HTML: type, title + version", htmlEntry && htmlEntry.type === "text/html" &&
    contains(htmlEntry, muwatta.titleDV) && contains(htmlEntry, VERSION_TEXT),
    (htmlEntry ? htmlEntry.size + "B" : "no blob"));
  // PDF — captured popup document (the print window is never opened)
  await clickExport("pdf");
  await waitPdf();
  const pdfHtml = await capPdf();
  check("S8 PDF: popup document carries the info-page link + version", pdfHtml &&
    pdfHtml.indexOf("<html") !== -1 && pdfHtml.indexOf("info.html?book=HDT-muwattaMalik") !== -1 &&
    pdfHtml.indexOf(VERSION_TEXT) !== -1, (pdfHtml || "").length + " chars");
  // EPUB — async (font fetch + dynamic import); the footer disables while
  // it runs and re-enables when the blob lands. The content is
  // deflate-compressed, so the checks are the stored mimetype (the only
  // uncompressed member) + the embedded font's weight (>100KB).
  await clickExport("epub");
  const busyNow = await evalJS(`Array.from(document.querySelectorAll('#infoModalBody .info-actions button')).every(function (b) { return b.disabled; })`);
  const busyLabel = await evalJS(`document.querySelector('#infoModalBody .info-export-btn[data-fmt="epub"]').textContent`);
  await waitBytes("application/epub+zip", 30000);
  const epubEntry = await capEntry("application/epub+zip");
  const epubBytes = epubEntry ? Buffer.from(epubEntry.bytes) : Buffer.alloc(0);
  const epubBusyAfter = await evalJS(`Array.from(document.querySelectorAll('#infoModalBody .info-actions button')).some(function (b) { return !b.disabled; })`);
  const busyLabelAfter = await evalJS(`document.querySelector('#infoModalBody .info-export-btn[data-fmt="epub"]').textContent`);
  check("S8 EPUB: PK zip, stored mimetype, embedded font", epubEntry &&
    epubEntry.type === "application/epub+zip" && epubBytes.length > 100000 &&
    epubBytes[0] === 0x50 && epubBytes[1] === 0x4b && // "PK"
    epubBytes.includes(Buffer.from("application/epub+zip")),
    (epubEntry ? epubEntry.size + "B" : "no blob"));
  check("S8 EPUB: footer disables during the async export, re-enables after", busyNow && epubBusyAfter,
    busyNow + " / " + epubBusyAfter);
  // The clicked button's label swaps to the "Preparing…" wording while it
  // works and restores when the blob lands (the reader export's feedback).
  check("S8 EPUB: busy label shows while exporting, restores after", busyLabel === "Preparing…" && busyLabelAfter === "EPUB",
    busyLabel + " → " + busyLabelAfter);
  // The author/works panes export under the author's own code — it doubles
  // as the builders' bookCode, so the siteURL points at the info page
  // (?author=… / &tab=works — the query survives in the export's HTML as
  // &amp;, since the anchor's href and text share the escaped string).
  // The wait targets the NEXT entry past the current count — an earlier
  // capture (the book-tab Word) already satisfies the type.
  await evalJS(`document.querySelector('#infoModalBody .info-tab[data-tab="author"]').click()`);
  await waitFor(`document.querySelector('#infoPane .info-head-title').textContent === ${JSON.stringify(nameEN("malikBinAnas"))}`);
  const capLen = await evalJS(`window.__cap.length`);
  await clickExport("word");
  await waitFor(`window.__cap.length === ${capLen} + 1 && window.__cap[${capLen}].bytes`, 30000);
  const authorWord = await evalJS(`window.__cap[${capLen}]`);
  check("S8 author pane Word: bio + kind line + Contents page inside, info-page link", authorWord &&
    contains(authorWord, "Life") && contains(authorWord, "info.html?author=malikBinAnas") &&
    contains(authorWord, "Biography of the author") && contains(authorWord, "Contents") &&
    contains(authorWord, "Century: 2"),
    (authorWord ? authorWord.size + "B" : "no blob"));
  // The works list exports from its own tab — same capture pattern.
  const capLen2 = await evalJS(`window.__cap.length`);
  await evalJS(`document.querySelector('#infoModalBody .info-tab[data-tab="works"]').click()`);
  await waitFor(`!!document.querySelector('#infoPane .info-books-list')`);
  await clickExport("word");
  await waitFor(`window.__cap.length === ${capLen2} + 1 && window.__cap[${capLen2}].bytes`, 30000);
  const booksWord = await evalJS(`window.__cap[${capLen2}]`);
  check("S8 works-tab Word: kind line + works list + show-all inside, info-page link", booksWord &&
    contains(booksWord, "The author's works") &&
    contains(booksWord, "Works by " + nameEN("malikBinAnas")) &&
    contains(booksWord, "Show all works by " + nameEN("malikBinAnas")) &&
    contains(booksWord, "info.html?author=malikBinAnas&amp;tab=works"),
    (booksWord ? booksWord.size + "B" : "no blob"));
  await evalJS(`document.getElementById('infoOverlay').querySelector('.modal-close').click()`);
  await sleep(150);

  // ── S8b: reader Word-export byte regression vs the golden ──────────
  // The Phase 2 shared-builder refactor must leave the reader's exports
  // byte-identical — this is the capture from BEFORE the refactor (see
  // tools/hmv-golden-capture.mjs), diffed against the live export now.
  await goto("file://" + ROOT + "reader.html?book=AQD-usooluSiththa");
  await waitFor(`document.querySelector('#readerContent .reader-chunk')`);
  await evalJS(PATCH_EXPORTS);
  await evalJS(`document.getElementById('btnExport').click()`);
  await sleep(200);
  await evalJS(`document.querySelector('.export-option[data-format="word"]').click()`);
  await waitBytes("application/msword", 20000);
  const readerWord = await capEntry("application/msword");
  const golden = fs.readFileSync(path.join(GOLDEN, "reader-word.doc"));
  let live = readerWord ? Buffer.from(readerWord.bytes) : Buffer.alloc(0);
  if (IS_DIST) {
    // The export embeds the page's own location twice (page URL + info
    // link); running from dist/ makes those read /dist/books/ instead of
    // /src/books/. Normalise the tree name so the byte guard still proves
    // the minified builders emit output identical to the golden's.
    live = Buffer.from(live.toString("utf8").replace(/\/dist\/books\//g, "/src/books/"), "utf8");
  }
  check("S8b reader Word export byte-identical to the golden", golden.equals(live),
    golden.length + " vs " + live.length + " bytes");

  // ── S9: authors-modal ℹ stacks the info modal; Escape unwinds ──────
  await goto("file://" + ROOT + "library-search.html");
  await waitFor(`document.getElementById('libAuthorsBtn') && !!document.getElementById('libTagsCollapse').children.length`);
  await evalJS(`document.getElementById('libAuthorsBtn').click()`);
  await waitFor(`!!document.getElementById('libAuthorsOverlay') && document.getElementById('libAuthorsOverlay').classList.contains('open')`);
  await evalJS(`document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="malikBinAnas"] .author-info-btn').click()`);
  await waitFor(`!!document.getElementById('infoOverlay') && document.getElementById('infoOverlay').classList.contains('open')`);
  await waitFor(`!!document.querySelector('#infoPane .info-toc')`);
  check("S9 ℹ button stacks the info modal over the authors modal", await evalJS(
    `document.getElementById('infoOverlay').classList.contains('open') &&
     document.getElementById('libAuthorsOverlay').classList.contains('open') &&
     document.querySelector('#infoPane .info-head-title').textContent === ${JSON.stringify(nameEN("malikBinAnas"))}`));
  // Escape closes innermost first — the info modal, then the browse modal.
  await evalJS(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
  await sleep(150);
  check("S9 first Escape closes the info modal only", await evalJS(
    `!document.getElementById('infoOverlay').classList.contains('open') &&
     document.getElementById('libAuthorsOverlay').classList.contains('open')`));
  await evalJS(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
  await sleep(150);
  check("S9 second Escape closes the authors modal", await evalJS(
    `!document.getElementById('libAuthorsOverlay').classList.contains('open')`));

  // ── S10: Alt+I opens the modal on the Book tab ─────────────────────
  await goto("file://" + ROOT + "reader.html?book=HDT-muwattaMalik");
  await waitFor(`document.querySelector('#readerContent .reader-chunk')`);
  await evalJS(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'i', altKey: true, bubbles: true }))`);
  await waitFor(`!!document.getElementById('infoOverlay') && document.getElementById('infoOverlay').classList.contains('open')`);
  check("S10 Alt+I opens the info modal on the Book tab", await evalJS(
    `document.getElementById('infoOverlay').classList.contains('open') &&
     document.querySelector('#infoModalBody .info-tab[data-tab="book"]').classList.contains('active')`));

  // ── S11: mobile 600px ──────────────────────────────────────────────
  await send("Emulation.setDeviceMetricsOverride", { width: 600, height: 800, deviceScaleFactor: 1, mobile: false });
  await goto("file://" + ROOT + "reader.html?book=HDT-muwattaMalik");
  await waitFor(`document.querySelector('#readerContent .reader-chunk')`);
  await evalJS(`document.getElementById('pageTitle').click()`);
  await waitFor(`!!document.getElementById('infoOverlay') && document.getElementById('infoOverlay').classList.contains('open')`);
  await waitFor(`!!document.querySelector('#infoPane .info-section-label')`);
  // The info modal shares the full-size geometry rule with the search
  // window (both 92vw-capped at mobile by the base .modal max-width) — the
  // two must measure identically. No page horizontal scroll; the pane (the
  // modal's only scrollport) scrolls vertically and its content fits
  // horizontally (no horizontal scrollbar — the RTL-list marker bug this
  // battery guards). scrollWidth is content width even with overflow-x
  // hidden, so scrollWidth <= clientWidth is a real fit check.
  check("S11 info modal matches the search window's geometry at 600px", await evalJS(
    `(() => {
      function rect(id) {
        var el = document.querySelector(id + ' .modal');
        var r = el.getBoundingClientRect();
        return [r.left, r.right, r.top, r.bottom].map(function (v) { return Math.round(v); }).join(',');
      }
      var i = rect('#infoOverlay');
      var pane = document.getElementById('infoPane');
      return i !== '0,0,0,0' && document.documentElement.scrollWidth <= 600 &&
        pane.scrollHeight >= pane.clientHeight && pane.scrollWidth <= pane.clientWidth;
    })()`),
    await evalJS(`(() => { var m = document.querySelector('#infoOverlay .modal').getBoundingClientRect(); var p = document.getElementById('infoPane'); return 'info=' + Math.round(m.left) + '-' + Math.round(m.right) + ' scrollW=' + document.documentElement.scrollWidth + ' paneSW=' + p.scrollWidth + ' paneCW=' + p.clientWidth + ' paneH=' + p.clientHeight + ' paneSH=' + p.scrollHeight; })()`));
  check("S11 mobile: actions collapsed behind the toggle", await evalJS(
    `(() => { var t = document.getElementById('infoActionsToggle').getBoundingClientRect(); var a = document.getElementById('infoActions').getBoundingClientRect(); return t.width > 0 && t.height > 0 && a.width === 0 && a.height === 0; })()`),
    await evalJS(`(() => { var t = document.getElementById('infoActionsToggle').getBoundingClientRect(); var a = document.getElementById('infoActions').getBoundingClientRect(); return 'toggle=' + Math.round(t.width) + 'x' + Math.round(t.height) + ' actions=' + Math.round(a.width) + 'x' + Math.round(a.height); })()`));
  await evalJS(`document.getElementById('infoActionsToggle').click()`);
  await sleep(50);
  check("S11 toggle opens the menu inside the modal", await evalJS(
    `(() => { var m = document.querySelector('#infoOverlay .modal').getBoundingClientRect(); return Array.from(document.querySelectorAll('#infoModalBody .info-actions button')).every(function (b) { var r = b.getBoundingClientRect(); return r.left >= m.left && r.right <= m.right; }); })()`),
    await evalJS(`(() => { var m = document.querySelector('#infoOverlay .modal').getBoundingClientRect(); return Array.from(document.querySelectorAll('#infoModalBody .info-actions button')).map(function (b) { var r = b.getBoundingClientRect(); return b.textContent + '=' + Math.round(r.left) + '-' + Math.round(r.right); }).join(' ') + ' modal=' + Math.round(m.left) + '-' + Math.round(m.right); })()`));
  // The author tab's bio carries the RTL-list (ul dir="auto") — the pane
  // must stay overflow-free there too (the 20px marker spill this guards).
  await evalJS(`document.querySelector('#infoModalBody .info-tab[data-tab="author"]').click()`);
  await waitFor(`!!document.querySelector('#infoPane .info-toc')`);
  check("S11 the menu closes on a tab switch", await evalJS(
    `(() => { var a = document.getElementById('infoActions').getBoundingClientRect(); return a.width === 0 && a.height === 0; })()`));
  check("S11 author tab: no horizontal pane overflow (RTL-list marker bug)", await evalJS(
    `(() => { var p = document.getElementById('infoPane'); return p.scrollWidth <= p.clientWidth; })()`),
    await evalJS(`(() => { var p = document.getElementById('infoPane'); return 'paneSW=' + p.scrollWidth + ' paneCW=' + p.clientWidth; })()`));
  // The tab switch left the menu closed — open it, then the toggle closes it.
  await evalJS(`document.getElementById('infoActionsToggle').click()`);
  await sleep(50);
  await evalJS(`document.getElementById('infoActionsToggle').click()`);
  await sleep(50);
  check("S11 toggle closes the menu again", await evalJS(
    `(() => { var a = document.getElementById('infoActions').getBoundingClientRect(); return a.width === 0 && a.height === 0; })()`));
  // Picking a format runs the export and closes the menu (the Word path is
  // synchronous; the headless page just creates a blob URL — no dialog).
  await evalJS(`document.getElementById('infoActionsToggle').click()`);
  await sleep(50);
  await evalJS(`document.querySelector('#infoModalBody .info-actions .info-export-btn[data-fmt="word"]').click()`);
  await sleep(50);
  check("S11 picking a format closes the menu", await evalJS(
    `(() => { var a = document.getElementById('infoActions').getBoundingClientRect(); return a.width === 0 && a.height === 0; })()`));
  // An outside click (the pane) closes it like any dropdown.
  await evalJS(`document.getElementById('infoActionsToggle').click()`);
  await sleep(50);
  await evalJS(`document.getElementById('infoPane').click()`);
  await sleep(50);
  check("S11 clicking outside the menu closes it", await evalJS(
    `(() => { var a = document.getElementById('infoActions').getBoundingClientRect(); return a.width === 0 && a.height === 0; })()`));
  await evalJS(`(() => { var el = document.querySelector('#infoOverlay .modal'); var r = el.getBoundingClientRect(); window.__infoRect = [r.left, r.right, r.top, r.bottom].map(function (v) { return Math.round(v); }).join(','); })()`);
  await evalJS(`document.getElementById('infoOverlay').querySelector('.modal-close').click()`);
  await sleep(150);
  await evalJS(`document.getElementById('btnSearchWindow').click()`);
  await waitFor(`!!document.getElementById('searchWindowOverlay') && document.getElementById('searchWindowOverlay').classList.contains('open')`);
  check("S11 …and the search window measures the same", await evalJS(
    `(() => { var el = document.querySelector('#searchWindowOverlay .modal'); var r = el.getBoundingClientRect(); var sw = [r.left, r.right, r.top, r.bottom].map(function (v) { return Math.round(v); }).join(','); return sw === window.__infoRect; })()`),
    await evalJS(`(() => { var el = document.querySelector('#searchWindowOverlay .modal'); var r = el.getBoundingClientRect(); return 'info=' + window.__infoRect + ' search=' + [r.left, r.right, r.top, r.bottom].map(function (v) { return Math.round(v); }).join(','); })()`));
  await evalJS(`document.getElementById('searchWindowOverlay').querySelector('.modal-close').click()`);
  await sleep(150);
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  // The same modal at desktop width: the actions sit inline in the band
  // (the toggle is display:none) — the S11 mobile checks above proved the
  // collapsed state, this one proves the untouched desktop layout.
  await evalJS(`document.getElementById('pageTitle').click()`);
  await waitFor(`!!document.getElementById('infoOverlay') && document.getElementById('infoOverlay').classList.contains('open')`);
  check("S11 desktop: actions inline in the tab band, toggle hidden", await evalJS(
    `(() => { var t = document.getElementById('infoActionsToggle').getBoundingClientRect(); var a = document.getElementById('infoActions').getBoundingClientRect(); return t.width === 0 && t.height === 0 && a.width > 0 && a.height > 0; })()`),
    await evalJS(`(() => { var t = document.getElementById('infoActionsToggle').getBoundingClientRect(); var a = document.getElementById('infoActions').getBoundingClientRect(); return 'toggle=' + Math.round(t.width) + 'x' + Math.round(t.height) + ' actions=' + Math.round(a.width) + 'x' + Math.round(a.height); })()`));
  await evalJS(`document.getElementById('infoOverlay').querySelector('.modal-close').click()`);
  await sleep(150);

  // ── S2: quiet "No notes yet" placeholders ─────────────────────────
  // A book with no notes file (HDT-arbaoonNawawi) and an author with no
  // bio (yahyaBinSharafAnNawawi — the notes directory holds only the two
  // fixtures) — each surface shows the placeholder, never an error.
  await goto("file://" + ROOT + "reader.html?book=HDT-arbaoonNawawi");
  await waitFor(`document.querySelector('#readerContent .reader-chunk')`);
  await evalJS(`document.getElementById('pageTitle').click()`);
  await waitFor(`!!document.getElementById('infoOverlay') && document.getElementById('infoOverlay').classList.contains('open')`);
  await waitFor(`document.querySelectorAll('#infoPane .info-no-notes').length === 1`);
  check("S2 book without notes shows the placeholder", await evalJS(
    `document.querySelector('#infoPane .info-no-notes').textContent === 'No notes yet'`));
  await evalJS(`document.querySelector('#infoModalBody .info-tab[data-tab="author"]').click()`);
  await waitFor(`document.querySelectorAll('#infoPane .info-no-notes').length === 1`);
  check("S2 author without a bio gets its placeholder too", await evalJS(
    `document.querySelector('#infoPane .info-no-notes').textContent === 'No notes yet'`));
  // The works list lives on its own tab — it renders even without a bio.
  await evalJS(`document.querySelector('#infoModalBody .info-tab[data-tab="works"]').click()`);
  await waitFor(`!!document.querySelector('#infoPane .info-books-list')`);
  check("S2 works tab renders without a bio", await evalJS(
    `document.querySelectorAll('#infoPane .info-book-row').length >= 1`));

  // ── S13: the info page (books/info.html) ──────────────────────────
  // The deep-link target behind the modal's exports and copy-link: the
  // shared shell renders as a page — no overlay, no content-CSV fetch
  // (the Book pane asserts the derived-meta line never renders).
  await goto("file://" + ROOT + "info.html?author=malikBinAnas");
  await waitFor(`document.querySelector('#infoPageShell #infoPane .info-head-title').textContent === ${JSON.stringify(nameEN("malikBinAnas"))}`);
  check("S13 author deep link renders the Author pane as a page (no overlay)", await evalJS(
    `document.querySelector('#infoPageShell #infoPane .info-head-title').textContent === ${JSON.stringify(nameEN("malikBinAnas"))} &&
     !document.getElementById('infoOverlay')`));
  check("S13 …with the bio's 3-link auto-TOC", await evalJS(
    `document.querySelectorAll('#infoPageShell #infoPane .info-toc a').length === 3`));
  // The page carries the modal's look itself — the base .modal rule (RTL
  // shell, the Hadithmv webfont) is modal-only, and the search row needs
  // reader-search.css's wrap. All three must be in place or the page
  // renders Times New Roman in LTR with a broken search bar.
  check("S13 page shell: RTL + the app webfont (modal look)", await evalJS(
    `getComputedStyle(document.body).direction === 'rtl' &&
     getComputedStyle(document.body).fontFamily.indexOf('Hadithmv') !== -1 &&
     getComputedStyle(document.getElementById('infoPane')).fontFamily.indexOf('Hadithmv') !== -1`),
    await evalJS(`getComputedStyle(document.body).direction + ' / ' + getComputedStyle(document.body).fontFamily.slice(0, 40)`));
  check("S13 top bar: the site's centered column — back button start-side, title centered", await evalJS(
    `(() => {
      var inner = document.querySelector('.info-page-top-inner').getBoundingClientRect();
      var bar = document.querySelector('.info-page-top').getBoundingClientRect();
      var b = document.getElementById('infoPageBack').getBoundingClientRect();
      var t = document.querySelector('.info-page-top h1');
      var tr = t.getBoundingClientRect();
      return getComputedStyle(document.querySelector('.info-page-top-inner')).direction === 'ltr' &&
        getComputedStyle(t).direction === 'rtl' &&
        b.left < tr.left &&
        Math.abs((tr.left + tr.right) / 2 - (inner.left + inner.right) / 2) < 40 &&
        Math.abs(bar.left) < 1 && bar.width >= inner.width;
    })()`),
    await evalJS(`(() => {
      var inner = document.querySelector('.info-page-top-inner').getBoundingClientRect();
      var b = document.getElementById('infoPageBack').getBoundingClientRect();
      var t = document.querySelector('.info-page-top h1').getBoundingClientRect();
      return 'col=' + Math.round(inner.left) + '..' + Math.round(inner.right) +
        ' btn=' + Math.round(b.left) + ' titleC=' + Math.round((t.left + t.right) / 2) +
        ' colC=' + Math.round((inner.left + inner.right) / 2);
    })()`));
  check("S13 the actions row stays: copy + copy-link + the four exports", await evalJS(
    `(() => {
      var a = document.getElementById('infoActions').getBoundingClientRect();
      var t = document.getElementById('infoActionsToggle').getBoundingClientRect();
      return a.width > 0 && a.height > 0 && t.width === 0 && t.height === 0 &&
        document.querySelectorAll('#infoPageShell #infoActions button').length === 6;
    })()`),
    await evalJS(`(() => {
      var a = document.getElementById('infoActions').getBoundingClientRect();
      return 'actions=' + Math.round(a.width) + 'x' + Math.round(a.height) +
        ' buttons=' + Array.from(document.querySelectorAll('#infoPageShell #infoActions button')).map(function (b) { return b.textContent; }).join('|');
    })()`));
  check("S13 search row uses the shared input wrap (reader-search.css)", await evalJS(
    `(() => { var w = getComputedStyle(document.querySelector('#infoPageShell .search-input-wrap')); return w.display === 'flex' && w.direction === 'rtl'; })()`),
    await evalJS(`getComputedStyle(document.querySelector('#infoPageShell .search-input-wrap')).display + ' / ' + getComputedStyle(document.querySelector('#infoPageShell .search-input-wrap')).direction`));
  // The Works tab — the modal's exports point here via &tab=works.
  await evalJS(`document.querySelector('#infoPageShell .info-tab[data-tab="works"]').click()`);
  await waitFor(`!!document.querySelector('#infoPageShell #infoPane .info-books-list')`);
  check("S13 works tab deep link: row + reader deep link + show-all", await evalJS(
    `(() => {
      var rows = Array.from(document.querySelectorAll('#infoPageShell #infoPane .info-book-row'));
      var all = document.querySelector('#infoPageShell #infoPane .info-show-all');
      return rows.length === 1 &&
        rows[0].getAttribute('href') === 'reader.html?book=HDT-muwattaMalik' &&
        !!all && all.getAttribute('href') === 'index.html?authors=malikBinAnas' &&
        all.textContent === ${JSON.stringify("Show all works by " + nameEN("malikBinAnas"))};
    })()`),
    await evalJS(`document.querySelector('#infoPageShell #infoPane').textContent.slice(0, 160)`));
  // Tab switches pushState — the URL follows the pane (the page's reason to
  // exist is shareable deep links), and back/forward re-resolve it.
  check("S13 works click → ?author=…&tab=works in the address bar", await evalJS(
    `location.search === '?author=malikBinAnas&tab=works'`),
    await evalJS(`location.search`));
  await evalJS(`document.querySelector('#infoPageShell .info-tab[data-tab="author"]').click()`);
  await waitFor(`!!document.querySelector('#infoPageShell #infoPane .info-toc')`);
  check("S13 author click → ?author=… (tab param dropped)", await evalJS(
    `location.search === '?author=malikBinAnas'`),
    await evalJS(`location.search`));
  await evalJS(`history.back()`);
  await waitFor(`location.search === '?author=malikBinAnas&tab=works' && !!document.querySelector('#infoPageShell #infoPane .info-books-list')`);
  check("S13 back → the Works pane re-renders from the URL", await evalJS(
    `location.search === '?author=malikBinAnas&tab=works' &&
     !!document.querySelector('#infoPageShell #infoPane .info-books-list')`));
  await evalJS(`history.back()`);
  await waitFor(`location.search === '?author=malikBinAnas' && !!document.querySelector('#infoPageShell #infoPane .info-toc')`);
  check("S13 back again → the Author pane re-renders from the URL", await evalJS(
    `location.search === '?author=malikBinAnas' &&
     !!document.querySelector('#infoPageShell #infoPane .info-toc')`));
  // The Book pane — same pane as the modal's, minus the derived-meta line
  // (the reader's counts need the content CSV; the page fetches nothing).
  await goto("file://" + ROOT + "info.html?book=HDT-muwattaMalik");
  await waitFor(`document.querySelector('#infoPageShell #infoPane .info-head-title').textContent === ${JSON.stringify(muwatta.titleDV)}`);
  check("S13 book deep link: head + notes render, no derived-meta line", await evalJS(
    `document.querySelector('#infoPageShell #infoPane .info-head-title').textContent === ${JSON.stringify(muwatta.titleDV)} &&
     !document.querySelector('#infoPageShell #infoPane .info-meta') &&
     document.querySelectorAll('#infoPageShell #infoPane .info-md p').length === 2`),
    await evalJS(`document.querySelector('#infoPageShell #infoPane').textContent.slice(0, 160)`));
  await goto("file://" + ROOT + "info.html?book=noSuchBook");
  await waitFor(`!!document.querySelector('#infoPageShell #infoPane .info-no-notes')`);
  check("S13 unknown book code → the placeholder", await evalJS(
    `document.querySelector('#infoPageShell #infoPane .info-no-notes').textContent === 'No notes yet'`));
  await goto("file://" + ROOT + "info.html");
  await waitFor(`!document.getElementById('infoPageEmpty').hidden`);
  check("S13 bare visit → the empty-state line, shell tucked away", await evalJS(
    `!document.getElementById('infoPageEmpty').hidden &&
     document.getElementById('infoPageShell').hidden`));
  // A zero-book author (if the data has one): the Author pane + Works tab
  // still render — the info page was built for exactly this case.
  const zeroBook = authors02.find((a) => !books03.some((b) =>
    b.bookCode.indexOf("-HDN") !== -1 ? false :
    (b.authorCode || "").split(",").map((s) => s.trim()).filter(Boolean).indexOf(a.authorCode) !== -1));
  if (zeroBook) {
    await goto("file://" + ROOT + "info.html?author=" + zeroBook.authorCode);
    await waitFor(`document.querySelector('#infoPageShell #infoPane .info-head-title').textContent === ${JSON.stringify(nameEN(zeroBook.authorCode))}`);
    check("S13 zero-book author: Author pane renders, works tab shows the placeholder", await evalJS(
      `document.querySelector('#infoPageShell #infoPane .info-head-title').textContent === ${JSON.stringify(nameEN(zeroBook.authorCode))}`));
  } else {
    check("S13 zero-book author: no such author in the current data (skipped)", true, "no zero-book author in 02/03");
  }

  // ── Cleanup ────────────────────────────────────────────────────────
  check("S12 no page errors", pageErrors.length === 0, pageErrors.join("; "));
  ws.close();
  edge.kill();
  console.log(failures === 0 ? "ALL PASS" : failures + " FAILURES");
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.log("ABORT: " + e.message); process.exit(1); });
