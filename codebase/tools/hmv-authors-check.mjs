// Authors & Periods browse battery — the shared facet system (js/facet-browse.js)
// on every surface: library-search page chips + modals, dashboard functions
// panel + deep links, search window's All-books section, and the author line
// on cards + reader header (a dash-separated link to the filtered dashboard).
// Run: node tools/hmv-authors-check.mjs  (from codebase/, or anywhere — paths
// resolve relative to this script). Requires Node 20.11+ and Microsoft Edge.
// Env overrides: HMV_AUTHORS_PORT (default 9361), HMV_AUTHORS_PROFILE.
//
// Checks:
//  - library page: Authors button opens the modal with one row per author
//    with a searchable book (name + Arabic + Dhivehi alts + Hijri century
//    and years, registry order, filter input); click toggles → chip +
//    ?authors=
//  - period modal: table rows = the distinct death-century buckets + modern
//    (derived from 02), each row shows the century's AH range in its own
//    column, counts cover only books really in the library (searchable
//    set); click sets ?period=
//  - ?authors=/?period= deep links activate chips on load
//  - scoped search: with an author active, every result card belongs to one
//    of that author's books (derived from 03)
//  - author line renders on library result cards, dashboard cards, reader
//    header (" - <nameEN> (<born>–<died> AH)" linked to index.html?authors=)
//  - dashboard: no English title on cards, browse buttons open the shared
//    modals, ?authors=yahyaBinSharafAnNawawi pre-filters the grid
//  - search window: All-books tab shows the Authors/Periods section, the
//    buttons open the modals stacked over the window
//  - no page errors
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { pathToFileURL } from "url";

const { parseCSV } = await import(pathToFileURL(path.join(import.meta.dirname, "..", "js", "csv.js")));

// Machine-specific: path to Microsoft Edge. Adjust per machine/OS.
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const baseDir = import.meta.dirname.replace(/\\/g, "/");
const ROOT = baseDir + "/../books/";
const DATA = baseDir + "/../data/";
const PORT = process.env.HMV_AUTHORS_PORT ? parseInt(process.env.HMV_AUTHORS_PORT, 10) : 9361;
const PROFILE = process.env.HMV_AUTHORS_PROFILE || (process.env.TEMP + "\\hmv-authors-check-profile");
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
const books03 = csvObjects("03-registry-bookMeta.csv");
const authors02 = csvObjects("02-registry-bookAuthors.csv").filter((a) => a.authorCode);
// EN name for an author code (from the registry — the battery runs the page in English)
const nameEN = (code) => (authors02.find((a) => a.authorCode === code) || {}).nameEN || code;
// Period bucket: death-century string, "modern" when diedAH is blank
const periodOf = (a) => (a.diedAH ? String(Math.ceil(parseInt(a.diedAH, 10) / 100)) : "modern");
const authorCodesOf = (b) => ((b && b.authorCode) || "").split(",").map((s) => s.trim()).filter(Boolean);
// The dashboard counts over the *visible* set only (-HDN books are hidden
// from the grid); mirrors visibleBooks() in dashboard.js.
const VISIBLE_BOOKS = books03.filter((b) => !b.bookCode.endsWith("-HDN"));
// The library surfaces (library-search page, search window) count over the
// searchable set — visible books the search index knows (meta.bookIds).
// ENTIRE-BOOK-excluded books (RDF dictionaries, KNSH, …) have no postings,
// so they are absent from the library's facet counts by design; mirrors
// library-scope-picker's _searchableBooks.
const searchIndex = JSON.parse(fs.readFileSync(DATA + "search-index.json", "utf8"));
const INDEX_IDS = new Set(searchIndex.meta.bookIds);
const SEARCHABLE_BOOKS = VISIBLE_BOOKS.filter((b) => INDEX_IDS.has(b.bookCode));
// Authors with at least one visible book — the dashboard's browse list
// (registry order).
const VISIBLE_AUTHORS = authors02.filter((a) => VISIBLE_BOOKS.some((b) => authorCodesOf(b).includes(a.authorCode)));
// Authors with at least one searchable book — the library page's browse list.
const SEARCHABLE_AUTHORS = authors02.filter((a) => SEARCHABLE_BOOKS.some((b) => authorCodesOf(b).includes(a.authorCode)));
// Per-bucket book counts (a book counts once per author it carries — same as
// facetCounts in facet-browse.js) over a book set.
function periodCountsOf(books) {
  const out = {};
  books.forEach((b) => authorCodesOf(b).forEach((ac) => {
    const a = authors02.find((x) => x.authorCode === ac);
    if (!a) return;
    const p = periodOf(a);
    out[p] = (out[p] || 0) + 1;
  }));
  return out;
}
const SEARCHABLE_PERIOD_COUNTS = periodCountsOf(SEARCHABLE_BOOKS);
// Period buckets over the searchable authors; "modern" only when a searchable
// author lacks a death year (a zero-count bucket would be pointless).
const HAS_MODERN = SEARCHABLE_AUTHORS.some((a) => !a.diedAH);
const PERIODS = [...new Set(SEARCHABLE_AUTHORS.map(periodOf))]
  .filter((p) => p !== "modern" || HAS_MODERN)
  .sort((a, b) =>
    a === "modern" ? 1 : b === "modern" ? -1 : parseInt(a, 10) - parseInt(b, 10));
const NAWAWI = authors02.find((a) => a.authorCode === "yahyaBinSharafAnNawawi");
const NAWAWI_BOOKS = VISIBLE_BOOKS.filter((b) => authorCodesOf(b).includes("yahyaBinSharafAnNawawi")).map((b) => b.bookCode);
const MALIK_BOOK = books03.find((b) => b.bookCode === "HDT-muwattaMalik");
const malikRow = authors02.find((a) => a.authorCode === "malikBinAnas");
// Exact en author line for Malik, per the i18n authorLife template "{b}–{d} AH":
// "Malik bin Anas (93–179 AH)". Both born and died are present in the data.
const MALIK_LINE = nameEN("malikBinAnas") + " (" + malikRow.bornAH + "–" + malikRow.diedAH + " AH)";
// Books whose authorCode is blank — the registry may leave some unattributed
// on purpose; their cards must show no author line.
const UNATTRIBUTED = books03.filter((b) => authorCodesOf(b).length === 0);

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
    if (m.result && m.result.exceptionDetails) throw new Error("EXC: " + m.result.exceptionDetails.text);
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

  // Run the page in English — the battery derives its expected strings from
  // 02's nameEN + the en i18n templates.
  const setLang = async () => {
    await goto("file://" + ROOT + "library-search.html");
    await evalJS(`localStorage.setItem('lang','en')`);
  };
  await setLang();

  // ── Library: Authors modal ───────────────────────────────────────
  await goto("file://" + ROOT + "library-search.html");
  await waitFor(`document.getElementById('libAuthorsBtn') && !!document.getElementById('libTagsCollapse').children.length`);
  check("authors button present", await evalJS(`!!document.getElementById('libAuthorsBtn')`));

  await evalJS(`document.getElementById('libAuthorsBtn').click()`);
  await waitFor(`!!document.getElementById('libAuthorsOverlay') && document.getElementById('libAuthorsOverlay').classList.contains('open')`);
  check("authors modal opens", await evalJS(`document.getElementById('libAuthorsOverlay').classList.contains('open')`));

  // One row per author with a searchable book (books really in the library),
  // in registry order, name + years
  const rows = await evalJS(`Array.from(document.querySelectorAll('#libAuthorsModalBody .author-browse-row')).map(function(r){
    return { code: r.dataset.author, text: r.textContent, title: r.title };
  })`);
  check("author rows = searchable authors", rows.length === SEARCHABLE_AUTHORS.length, rows.length + " vs " + SEARCHABLE_AUTHORS.length);
  check("author rows in registry order", rows.every(function (r, i) { return r.code === SEARCHABLE_AUTHORS[i].authorCode; }),
    rows.map((r) => r.code).join(","));
  // nawawi was born 631 and died 676 AH. The century and the years each get
  // their own column: the century label first, unbracketed ("Century 7"),
  // the AH range next, bracketed ("(631–676 AH)", the authorLife template).
  check("nawawi row has years", rows.find((r) => r.code === "yahyaBinSharafAnNawawi").text.indexOf("676 AH") !== -1,
    rows.find((r) => r.code === "yahyaBinSharafAnNawawi").text);
  check("century and years in separate columns", await evalJS(
    `document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"] .facet-century').textContent === ${JSON.stringify("Century 7")} &&
     document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"] .facet-range').textContent === ${JSON.stringify("(631–676 AH)")}`),
    rows.find((r) => r.code === "yahyaBinSharafAnNawawi").text);
  // The alt-name run carries Arabic + Dhivehi only — English is the primary
  // name in the en UI, so it must not repeat in the row — and a " · " leads
  // the run so the primary and the alt scripts never butt together.
  check("author alt names have no English", await evalJS(
    `!document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"] .facet-name-alt').textContent.match(/[a-zA-Z]/) &&
     document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"] .facet-name-alt').textContent.indexOf(" · ") === 0`),
    await evalJS(`document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"] .facet-name-alt').textContent`));

  // The thead strip sits OUTSIDE the scrollport — the scrollbar runs beside
  // the rows alone, never the thead — and thead + rows share the grid column
  // template, so the column edges line up exactly (the "thead left" drift
  // the old table auto-layout produced). The authors grid has 5 columns:
  // name, century, range, count, check.
  check("thead outside the scrollport", await evalJS(
    `!document.querySelector('#libAuthorsModalBody .facet-thead-row').closest('.facet-table-wrap')`));
  check("thead columns align with the rows", await evalJS(
    `(() => { var th = document.querySelectorAll('#libAuthorsModalBody .facet-thead-cell'); var c = document.querySelector('#libAuthorsModalBody .author-browse-row').children; return th.length === 5 && c.length === 5 && [0,1,2,3,4].every(function(i){ return Math.abs(th[i].getBoundingClientRect().left - c[i].getBoundingClientRect().left) < 1; }); })()`));
  // The alt-name run and the century/range text columns sit at the row's
  // full text size (no downscaling).
  check("alt names and text columns at full size", await evalJS(
    `(() => { var r = document.querySelector('#libAuthorsModalBody .author-browse-row'); var fs = function(sel){ return getComputedStyle(r.querySelector(sel)).fontSize; }; return fs('.facet-name-alt') === fs('.facet-name') && fs('.facet-century') === fs('.facet-name') && fs('.facet-range') === fs('.facet-name'); })()`));

  // Click the nawawi row → selection, chip, URL
  await evalJS(`document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"]').click()`);
  await waitFor(`location.search.indexOf('authors=yahyaBinSharafAnNawawi') !== -1`);
  check("click sets ?authors=yahyaBinSharafAnNawawi", true, await evalJS(`location.search`));
  check("author chip active in tags row", await evalJS(
    `!!document.querySelector('#libTagsCollapse .author-chip[data-author="yahyaBinSharafAnNawawi"].active')`));
  check("nawawi chip carries count", await evalJS(
    `document.querySelector('#libTagsCollapse .author-chip[data-author="yahyaBinSharafAnNawawi"]').textContent.indexOf(${JSON.stringify(String(NAWAWI_BOOKS.length))}) !== -1`),
    NAWAWI_BOOKS.length);
  await evalJS(`document.getElementById('libAuthorsOverlay').querySelector('.modal-close').click()`);
  await sleep(150);

  // ── Scoped search: results ⊆ that author's books ─────────────────
  // Query proven by the libscope battery; the author chip must narrow it.
  await evalJS(`document.getElementById('libSearchInput').value = 'الناس';` +
    `document.getElementById('libSearchInput').dispatchEvent(new Event('input'));`);
  await waitFor(`!!document.querySelector('#libResults .lib-result')`);
  const resultBooks = await evalJS(`Array.from(document.querySelectorAll('#libResults .lib-result')).map(function(r){return r.dataset.book;})`);
  check("scoped search yields results", resultBooks.length > 0, resultBooks.length);
  check("scoped search results all by nawawi", resultBooks.every((c) => NAWAWI_BOOKS.indexOf(c) !== -1), resultBooks.join(","));
  check("author line on result card", await evalJS(
    `document.querySelector('#libResults .lib-result .card-author').textContent.indexOf(${JSON.stringify(nameEN("yahyaBinSharafAnNawawi"))}) !== -1 &&
     document.querySelector('#libResults .lib-result .card-author').textContent.indexOf('676 AH') !== -1`),
    await evalJS(`document.querySelector('#libResults .lib-result .card-author').textContent`));

  // ── Library: Periods modal ────────────────────────────────────────
  await evalJS(`document.getElementById('libPeriodsBtn').click()`);
  await waitFor(`!!document.getElementById('libPeriodsOverlay') && document.getElementById('libPeriodsOverlay').classList.contains('open')`);
  const periodBtns = await evalJS(`Array.from(document.querySelectorAll('#libPeriodsModalBody .period-browse-row')).map(function(b){
    return {
      period: b.dataset.period,
      text: b.textContent,
      count: b.querySelector('.facet-count').textContent,
      // The range lives in its own column, still in brackets — "(201–300
      // AH)" — the only parens in a period row. The backslashes must be
      // doubled here: a template literal cooks \( to (, which would change
      // the regex into a different match entirely.
      range: (b.querySelector('.facet-range').textContent.match(/\\(([^)]+)\\)/) || [])[1] || ''
    };
  })`);
  check("period rows = distinct buckets", periodBtns.map((b) => b.period).join(",") === PERIODS.join(","),
    periodBtns.map((b) => b.period).join(",") + " vs " + PERIODS.join(","));
  check("period rows sorted chronological", periodBtns.every(function (b, i) {
    return i === 0 || (periodBtns[i - 1].period === "modern" ? false :
      b.period === "modern" ? true : parseInt(b.period, 10) > parseInt(periodBtns[i - 1].period, 10));
  }), periodBtns.map((b) => b.period).join(","));
  // Each row shows the century's AH span bracketed in its own column —
  // "Century 3" | "(201–300 AH)" — the en authorLife template "{b}–{d}
  // AH" filled with the bucket's span, e.g. ((3-1)*100+1)–(3*100)); "modern"
  // rows have no range.
  check("period rows show the AH range", periodBtns.every(function (b) {
    if (b.period === "modern") return b.range === "";
    const n = parseInt(b.period, 10);
    return b.range === ((n - 1) * 100 + 1) + "–" + (n * 100) + " AH";
  }), periodBtns.map((b) => b.period + "=" + JSON.stringify(b.range) + " in " + JSON.stringify(b.text)).join(","));
  // Counts cover books really in the library (searchable set) — e.g. century
  // 15 counts the albani, qahtani, jaufarFaiz and ibnulUthaymeen books but not
  // maniku's ENTIRE-BOOK-excluded RDF dictionary.
  check("period row counts = searchable books", periodBtns.every(function (b) {
    return String(SEARCHABLE_PERIOD_COUNTS[b.period]) === b.count;
  }), periodBtns.map((b) => b.period + "=" + b.count + " want " + SEARCHABLE_PERIOD_COUNTS[b.period]).join(","));
  // The label column is the short one; the range column is the wide 1fr one.
  check("period range column is the widest", await evalJS(
    `document.querySelector('#libPeriodsModalBody .period-browse-row .facet-range').getBoundingClientRect().width >
     document.querySelector('#libPeriodsModalBody .period-browse-row .facet-name').getBoundingClientRect().width`));
  // The base .modal-body gap (16px) and side padding would float the filter
  // row, thead bar and list apart and in from the modal edges — the browse
  // bodies drop both, matching the scope modal's flush stack. Checked here,
  // in the periods section, because both modal bodies exist by now (the
  // periods modal is built lazily on its first open).
  check("facet modal bodies have no gaps", await evalJS(
    `getComputedStyle(document.getElementById('libAuthorsModalBody')).gap === '0px' &&
     getComputedStyle(document.getElementById('libPeriodsModalBody')).gap === '0px'`));

  // Select the Century-3 bucket (bukhari died 256)
  await evalJS(`document.querySelector('#libPeriodsModalBody .period-browse-row[data-period="3"]').click()`);
  await waitFor(`location.search.indexOf('period=3') !== -1`);
  check("period click sets ?period=3", true, await evalJS(`location.search`));
  check("period chip active", await evalJS(`!!document.querySelector('#libTagsCollapse .period-chip[data-period="3"].active')`));
  await evalJS(`document.getElementById('libPeriodsOverlay').querySelector('.modal-close').click()`);
  await sleep(150);

  // Clear the filters via the chips (✕) — the query itself stays
  await evalJS(`document.querySelector('#libTagsCollapse .author-chip').click(); document.querySelector('#libTagsCollapse .period-chip').click();`);
  await waitFor(`location.search.indexOf('authors=') === -1 && location.search.indexOf('period=') === -1`);
  check("chip clicks clear authors+period", await evalJS(
    `location.search.indexOf('authors=') === -1 && location.search.indexOf('period=') === -1`),
    await evalJS(`location.search`));

  // ── Deep links activate chips on load ────────────────────────────
  // nawawi died 676 AH → 7th-century bucket
  await goto("file://" + ROOT + "library-search.html?authors=yahyaBinSharafAnNawawi&period=7");
  await waitFor(`!!document.querySelector('#libTagsCollapse .author-chip[data-author="yahyaBinSharafAnNawawi"]')`);
  check("deep link ?authors=yahyaBinSharafAnNawawi&period=7", await evalJS(
    `!!document.querySelector('#libTagsCollapse .author-chip[data-author="yahyaBinSharafAnNawawi"].active') &&
     !!document.querySelector('#libTagsCollapse .period-chip[data-period="7"].active')`));

  // ── Dashboard: cards, browse buttons, deep links ──────────────────
  await goto("file://" + ROOT + "index.html");
  await waitFor(`Array.from(document.querySelectorAll('.book-card')).some(function(c){
    return c.getAttribute('href').indexOf(${JSON.stringify(MALIK_BOOK.bookCode)}) !== -1;
  })`);
  check("dashboard cards have no English title", await evalJS(
    `Array.from(document.querySelectorAll('.book-card')).every(function(c){ return !c.querySelector('.title-en'); })`));
  const malikCardAuthor = await evalJS(`Array.from(document.querySelectorAll('.book-card')).map(function(c){
    if (c.getAttribute('href').indexOf(${JSON.stringify(MALIK_BOOK.bookCode)}) === -1) return '';
    var a = c.querySelector('.card-author'); return a ? a.textContent : '';
  }).join('')`);
  check("dashboard card author line exact", malikCardAuthor === MALIK_LINE, malikCardAuthor + " vs " + MALIK_LINE);
  check("unattributed books exist in registry", UNATTRIBUTED.length > 0, UNATTRIBUTED.length);
  const noAuthorCard = UNATTRIBUTED.length > 0 && await evalJS(`Array.from(document.querySelectorAll('.book-card')).some(function(c){
    return c.getAttribute('href').indexOf(${JSON.stringify(UNATTRIBUTED[0].bookCode)}) !== -1 && !c.querySelector('.card-author');
  })`);
  check("unattributed book has no author line", noAuthorCard);

  // The functions-panel browse buttons open the shared modals (with the
  // filter input narrowing the rows)
  await waitFor(`!!document.getElementById('dashAuthorsBtn')`);
  await evalJS(`document.getElementById('dashAuthorsBtn').click()`);
  await waitFor(`!!document.getElementById('libAuthorsOverlay') && document.getElementById('libAuthorsOverlay').classList.contains('open')`);
  check("dashboard authors button opens modal", await evalJS(`document.getElementById('libAuthorsOverlay').classList.contains('open')`));
  const dashRows = await evalJS(`document.querySelectorAll('#libAuthorsModalBody .author-browse-row').length`);
  check("dashboard modal rows = visible authors", dashRows === VISIBLE_AUTHORS.length, dashRows + " vs " + VISIBLE_AUTHORS.length);
  const hasFilter = await evalJS(`!!document.getElementById('libAuthorsFilter')`);
  check("authors modal has filter input", hasFilter);
  await evalJS(`document.getElementById('libAuthorsFilter').value = 'nawawi';
    document.getElementById('libAuthorsFilter').dispatchEvent(new Event('input'));`);
  await waitFor(`document.querySelectorAll('#libAuthorsList .author-browse-row').length === 1`);
  check("authors filter input narrows rows", await evalJS(`document.querySelectorAll('#libAuthorsList .author-browse-row').length === 1`));
  await evalJS(`document.getElementById('libAuthorsOverlay').querySelector('.modal-close').click()`);
  await sleep(150);
  await evalJS(`document.getElementById('dashPeriodsBtn').click()`);
  await waitFor(`!!document.getElementById('libPeriodsOverlay') && document.getElementById('libPeriodsOverlay').classList.contains('open')`);
  check("dashboard periods button opens modal", await evalJS(`document.getElementById('libPeriodsOverlay').classList.contains('open')`));
  await evalJS(`document.getElementById('libPeriodsOverlay').querySelector('.modal-close').click()`);
  await sleep(150);

  // ?authors=yahyaBinSharafAnNawawi pre-filters the grid to that author's visible books
  await goto("file://" + ROOT + "index.html?authors=yahyaBinSharafAnNawawi");
  await waitFor(`!!document.querySelector('#dashboardTagsCollapse .author-chip[data-author="yahyaBinSharafAnNawawi"]')`);
  check("dashboard deep link ?authors=yahyaBinSharafAnNawawi chip", await evalJS(
    `!!document.querySelector('#dashboardTagsCollapse .author-chip[data-author="yahyaBinSharafAnNawawi"].active')`));
  const authorCards = await evalJS(`Array.from(document.querySelectorAll('.book-card')).map(function(c){
    return (c.getAttribute('href').match(/book=([^&]+)/) || [])[1];
  })`);
  check("dashboard author filter = nawawi's books",
    authorCards.length === NAWAWI_BOOKS.length &&
    authorCards.every((code) => NAWAWI_BOOKS.indexOf(code) !== -1),
    authorCards.join(","));

  // ── Reader header author line (dash-separated link) ───────────────
  await goto("file://" + ROOT + "reader.html?book=HDT-muwattaMalik");
  await waitFor(`document.getElementById('readerPageAuthor') && document.getElementById('readerPageAuthor').textContent.indexOf(${JSON.stringify(nameEN("malikBinAnas"))}) !== -1`);
  const readerAuthor = await evalJS(`document.getElementById('readerPageAuthor').textContent`);
  check("reader header author line exact", readerAuthor === " - " + MALIK_LINE, readerAuthor + " vs - " + MALIK_LINE);
  const readerHref = await evalJS(`document.getElementById('readerPageAuthor').querySelector('a').getAttribute('href')`);
  check("reader author links to filtered dashboard", readerHref === "index.html?authors=malikBinAnas", readerHref);

  // ── Search window: Authors/Periods on the All-books tab ───────────
  await goto("file://" + ROOT + "reader.html?book=HDT-arbaoonNawawi");
  await waitFor(`!!document.getElementById('btnSearchWindow')`);
  await evalJS(`document.getElementById('btnSearchWindow').click()`);
  await waitFor(`!!document.getElementById('searchWindowOverlay') && document.getElementById('searchWindowOverlay').classList.contains('open')`);
  await evalJS(`document.getElementById('searchWindowTabAllBooks').click()`);
  await waitFor(`document.getElementById('searchWindowFacets').style.display !== 'none'`);
  check("search window All-books shows facets", await evalJS(
    `document.getElementById('searchWindowFacets').style.display !== 'none' &&
     !!document.getElementById('searchWindowFacetAuthors') &&
     !!document.getElementById('searchWindowFacetPeriods')`));
  // The facet modal stacks over the window (openModalOnTop path)
  await evalJS(`document.getElementById('searchWindowFacetAuthors').click()`);
  await waitFor(`!!document.getElementById('libAuthorsOverlay') && document.getElementById('libAuthorsOverlay').classList.contains('open')`);
  check("window authors button opens modal", await evalJS(
    `document.getElementById('libAuthorsOverlay').classList.contains('open') &&
     document.getElementById('searchWindowOverlay').classList.contains('open')`),
    await evalJS(`'win=' + document.getElementById('searchWindowOverlay').classList.contains('open') + ' auth=' + document.getElementById('libAuthorsOverlay').classList.contains('open')`));
  await evalJS(`document.getElementById('libAuthorsOverlay').querySelector('.modal-close').click()`);
  await sleep(150);
  await evalJS(`document.getElementById('searchWindowOverlay').querySelector('.modal-close').click()`);
  await sleep(150);

  // ── Cleanup ───────────────────────────────────────────────────────
  check("no page errors", pageErrors.length === 0, pageErrors.join("; "));
  ws.close();
  edge.kill();
  console.log(failures === 0 ? "ALL PASS" : failures + " FAILURES");
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.log("ABORT: " + e.message); process.exit(1); });
