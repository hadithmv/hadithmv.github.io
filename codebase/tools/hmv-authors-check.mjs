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
//    with a searchable book (current-language name, Arabic name in its own
//    column, Hijri century and years, Gregorian (miladi) lifetime, age —
//    diedAH − bornAH, ~-aware — each in their own column, registry order,
//    filter input); click toggles → chip + ?authors=
//  - mobile (≤600px): thead folds away, rows re-flow into joined text
//    lines (name · Arabic name / century · years · CE · age / books: N ✓) —
//    the joins a dotted margin run, the CE and age muted against the plain
//    Hijri dates, the count label inline, the ✓ spaced without a dot
//  - period modal: table rows = the distinct death-century buckets + modern
//    (derived from 02), each row shows the century's AH range and its
//    Gregorian (miladi) equivalent each in their own column, the distinct
//    authors in the bucket and the book count, counts cover only books
//    really in the library (searchable set); click sets ?period=
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

// The Gregorian equivalent of an AH year — the same approximation as
// facet-browse.js's periodRangeCeText (1 Hijri year ≈ 0.970229 solar years,
// offset 621.57, rounded): a formula change in the product shows up here.
const ceFromAh = (ah) => Math.round(ah * 0.970229 + 621.57);

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
const nameAR = (code) => (authors02.find((a) => a.authorCode === code) || {}).nameAR || "";
const nameDV = (code) => (authors02.find((a) => a.authorCode === code) || {}).nameDV || "";
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
// Age = diedAH − bornAH (both required; a "~" estimate on either end carries
// over — the data cannot make an estimate precise); mirrors authorAgeText in
// facet-browse.js.
const authorAgeOf = (a) => {
  if (!a.bornAH || !a.diedAH) return "";
  const num = (s) => parseInt(String(s || "").replace(/^~+/, ""), 10);
  const age = num(a.diedAH) - num(a.bornAH);
  if (!(age > 0)) return "";
  return (String(a.bornAH).startsWith("~") || String(a.diedAH).startsWith("~") ? "~" : "") + String(age);
};
const MALIK_AGE = authorAgeOf(malikRow);
// Distinct authors per bucket over a book set — the period rows' authors
// column; mirrors byPeriodAuthors in facetCounts (an author enters a bucket
// only via a visible book, so zero-book authors never inflate it).
function periodAuthorsOf(books) {
  const sets = {};
  books.forEach((b) => authorCodesOf(b).forEach((ac) => {
    const a = authors02.find((x) => x.authorCode === ac);
    if (!a) return;
    const p = periodOf(a);
    if (!sets[p]) sets[p] = new Set();
    sets[p].add(ac);
  }));
  const out = {};
  Object.keys(sets).forEach((p) => { out[p] = sets[p].size; });
  return out;
}
const SEARCHABLE_PERIOD_AUTHORS = periodAuthorsOf(SEARCHABLE_BOOKS);
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
  // The Gregorian column mirrors the years column through the same AH→CE
  // approximation the periods grid uses (ceFromAh above): the authorLifeCe
  // template "{b}–{d} CE" for born+died, the authorDiedCe template
  // "d. {y} CE" for died-only, "" when undated; a "~" estimate in the data
  // carries over to its CE side. Data-derived per author — no hardcoded
  // dates.
  const authorCeText = (a) => {
    const num = (s) => parseInt(String(s || "").replace(/^~+/, ""), 10);
    if (a.bornAH && a.diedAH)
      return (String(a.bornAH).startsWith("~") ? "~" : "") + ceFromAh(num(a.bornAH)) + "–" + ceFromAh(num(a.diedAH)) + " CE";
    if (a.diedAH) return "d. " + ceFromAh(num(a.diedAH)) + " CE";
    return "";
  };
  const wantCe = {};
  SEARCHABLE_AUTHORS.forEach((a) => {
    const t = authorCeText(a);
    wantCe[a.authorCode] = t ? "(" + t + ")" : "";
  });
  check("author rows show the CE range", await evalJS(
    `Array.from(document.querySelectorAll('#libAuthorsModalBody .author-browse-row')).every(function(r){
      return r.querySelector('.facet-ce').textContent === ${JSON.stringify(wantCe)}[r.dataset.author];
    })`),
    await evalJS(`Array.from(document.querySelectorAll('#libAuthorsModalBody .author-browse-row')).map(function(r){ return r.dataset.author + '=' + JSON.stringify(r.querySelector('.facet-ce').textContent); }).join(' ')`));
  // The age — diedAH − bornAH, data-derived per author; "" when either date
  // is missing. The cell carries a mobile-only "Age: " label span (hidden on
  // desktop under its own thead column), stripped here like the count's.
  const wantAge = {};
  SEARCHABLE_AUTHORS.forEach((a) => { wantAge[a.authorCode] = authorAgeOf(a); });
  check("author rows show the age", await evalJS(
    `Array.from(document.querySelectorAll('#libAuthorsModalBody .author-browse-row')).every(function(r){
      var c = r.querySelector('.facet-age');
      var lbl = c.querySelector('.facet-count-label');
      return c.textContent.replace(lbl ? lbl.textContent : '', '') === ${JSON.stringify(wantAge)}[r.dataset.author];
    })`),
    await evalJS(`Array.from(document.querySelectorAll('#libAuthorsModalBody .author-browse-row')).map(function(r){ return r.dataset.author + '=' + JSON.stringify(r.querySelector('.facet-age').textContent); }).join(' ')`));
  check("malik age derived from the data", await evalJS(
    `document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="malikBinAnas"] .facet-age').textContent.indexOf(${JSON.stringify(MALIK_AGE)}) !== -1`),
    MALIK_AGE);
  check("century and years in separate columns", await evalJS(
    `document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"] .facet-century').textContent === ${JSON.stringify("Century 7")} &&
     document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"] .facet-range').textContent === ${JSON.stringify("(631–676 AH)")}`),
    rows.find((r) => r.code === "yahyaBinSharafAnNawawi").text);
  // The Arabic name gets its own column (empty in the Arabic UI, where the
  // primary name already is Arabic); the name column carries the current
  // language's name only, no trailing alt run — and the row tooltip lists
  // all three names.
  check("ar name on its own column", await evalJS(
    `document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"] .facet-name-ar').textContent === ${JSON.stringify(nameAR("yahyaBinSharafAnNawawi"))} &&
     document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"] .facet-name').textContent === ${JSON.stringify(nameEN("yahyaBinSharafAnNawawi"))} &&
     !document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"] .facet-name-alt') &&
     document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"]').title.indexOf(${JSON.stringify(nameAR("yahyaBinSharafAnNawawi"))}) !== -1 &&
     document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"]').title.indexOf(${JSON.stringify(nameDV("yahyaBinSharafAnNawawi"))}) !== -1`),
    await evalJS(`document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"]').title`));

  // The thead strip sits OUTSIDE the scrollport — the scrollbar runs beside
  // the rows alone, never the thead — and thead + rows share the grid column
  // template, so the column edges line up exactly (the "thead left" drift
  // the old table auto-layout produced). The authors grid has 8 columns:
  // name, Arabic, century, range, Gregorian, age, count, check.
  check("thead outside the scrollport", await evalJS(
    `!document.querySelector('#libAuthorsModalBody .facet-thead-row').closest('.facet-table-wrap')`));
  check("thead columns align with the rows", await evalJS(
    `(() => { var r = document.querySelector('#libAuthorsModalBody .author-browse-row'); var th = document.querySelectorAll('#libAuthorsModalBody .facet-thead-cell'); var c = r.querySelectorAll('.facet-line-1 > div, .facet-line-2 > div, .facet-line-3 > div'); return th.length === 8 && c.length === 8 && [0,1,2,3,4,5,6,7].every(function(i){ return Math.abs(th[i].getBoundingClientRect().left - c[i].getBoundingClientRect().left) < 1; }); })()`));
  // The Arabic-name and century/range/age text columns sit at the row's full
  // text size (no downscaling).
  check("text columns at full size", await evalJS(
    `(() => { var r = document.querySelector('#libAuthorsModalBody .author-browse-row'); var fs = function(sel){ return getComputedStyle(r.querySelector(sel)).fontSize; }; return fs('.facet-name-ar') === fs('.facet-name') && fs('.facet-century') === fs('.facet-name') && fs('.facet-range') === fs('.facet-name') && fs('.facet-age') === fs('.facet-name'); })()`));

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

  // Opening the modals (button click or the Alt+A / Alt+R shortcuts) lands
  // the caret in the modal's filter input — the modal opens with the search
  // bar ready to type.
  await evalJS(`document.getElementById('libAuthorsBtn').click()`);
  // The caret lands past the overlay's pop transition (--t-pop) — common.js
  // defers its focus-first past it and the facet module re-focuses after, so
  // wait for the focus to land rather than asserting synchronously.
  await waitFor(`document.getElementById('libAuthorsOverlay').classList.contains('open') && document.activeElement === document.getElementById('libAuthorsFilter')`);
  check("authors modal opens with focus in the filter", await evalJS(
    `document.activeElement === document.getElementById('libAuthorsFilter')`));
  await evalJS(`document.getElementById('libAuthorsOverlay').querySelector('.modal-close').click()`);
  await sleep(150);
  await evalJS(`document.getElementById('libPeriodsBtn').click()`);
  await waitFor(`document.getElementById('libPeriodsOverlay').classList.contains('open')`);
  check("periods modal opens with focus in the filter", await evalJS(
    `document.activeElement === document.getElementById('libPeriodsFilter')`));
  await evalJS(`document.getElementById('libPeriodsOverlay').querySelector('.modal-close').click()`);
  await sleep(150);

  await evalJS(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', altKey: true, bubbles: true }))`);
  // The caret lands past the overlay's pop transition (--t-pop) — common.js
  // defers its focus-first past it and the facet module re-focuses after, so
  // wait for the focus to land rather than asserting synchronously.
  await waitFor(`document.getElementById('libAuthorsOverlay').classList.contains('open') && document.activeElement === document.getElementById('libAuthorsFilter')`);
  check("Alt+A opens the authors modal, caret in the filter", await evalJS(
    `document.getElementById('libAuthorsOverlay').classList.contains('open') && document.activeElement === document.getElementById('libAuthorsFilter')`));
  await evalJS(`document.getElementById('libAuthorsOverlay').querySelector('.modal-close').click()`);
  await sleep(150);
  await evalJS(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', altKey: true, bubbles: true }))`);
  await waitFor(`document.getElementById('libPeriodsOverlay').classList.contains('open') && document.activeElement === document.getElementById('libPeriodsFilter')`);
  check("Alt+R opens the periods modal, caret in the filter", await evalJS(
    `document.getElementById('libPeriodsOverlay').classList.contains('open') && document.activeElement === document.getElementById('libPeriodsFilter')`));
  await evalJS(`document.getElementById('libPeriodsOverlay').querySelector('.modal-close').click()`);
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
  // The author line: the muted secondary-name tone (facet-name-ar / the EN
  // caption colour), a step above the panel size (14.28px = 0.85rem × 1.05
  // at the 16px root; change --panel-font-size or the 1.05 scale and this
  // value together), normal weight.
  check("author line muted, a step up", await evalJS(
    `(() => { var el = document.querySelector('#libResults .lib-result .card-author'); var t = document.querySelector('#libResults .lib-result .title-en'); var cs = getComputedStyle(el); var ts = getComputedStyle(t); return cs.fontSize === '14.28px' && cs.fontWeight === '400' && cs.color === ts.color; })()`),
    await evalJS(`(() => { var el = document.querySelector('#libResults .lib-result .card-author'); var t = document.querySelector('#libResults .lib-result .title-en'); var cs = getComputedStyle(el); var ts = getComputedStyle(t); return 'size=' + cs.fontSize + ' weight=' + cs.fontWeight + ' color=' + cs.color + ' mutedCaptionColor=' + ts.color; })()`));

  // ── Library: Periods modal ────────────────────────────────────────
  await evalJS(`document.getElementById('libPeriodsBtn').click()`);
  await waitFor(`!!document.getElementById('libPeriodsOverlay') && document.getElementById('libPeriodsOverlay').classList.contains('open')`);
  const periodBtns = await evalJS(`Array.from(document.querySelectorAll('#libPeriodsModalBody .period-browse-row')).map(function(b){
    return {
      period: b.dataset.period,
      text: b.textContent,
      // The count cells carry mobile-only label spans (hidden on desktop) —
      // the bare numbers are what the counts compare against. Scoped to the
      // cell: the row holds two labels now (the authors cell's comes first
      // in the DOM).
      authors: b.querySelector('.facet-authors').textContent.replace(b.querySelector('.facet-authors .facet-count-label').textContent, ''),
      count: b.querySelector('.facet-count').textContent.replace(b.querySelector('.facet-count .facet-count-label').textContent, ''),
      // The range lives in its own column, still in brackets — "(201–300
      // AH)" — the only parens in a period row. The backslashes must be
      // doubled here: a template literal cooks \( to (, which would change
      // the regex into a different match entirely.
      range: (b.querySelector('.facet-range').textContent.match(/\\(([^)]+)\\)/) || [])[1] || '',
      // The Gregorian span, same bracketed shape — "(817–913 CE)".
      ce: (b.querySelector('.facet-ce').textContent.match(/\\(([^)]+)\\)/) || [])[1] || ''
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
  // The Gregorian (miladi) equivalent of the same span, in its own column —
  // the ceFromAh approximation above, the en authorLifeCe template "{b}–{d}
  // CE"; "modern" rows have no spans.
  check("period rows show the CE range", periodBtns.every(function (b) {
    if (b.period === "modern") return b.ce === "";
    const n = parseInt(b.period, 10);
    return b.ce === ceFromAh((n - 1) * 100 + 1) + "–" + ceFromAh(n * 100) + " CE";
  }), periodBtns.map((b) => b.period + "=" + JSON.stringify(b.ce)).join(","));
  // Six thead cells over six row cells, column to column — the shared
  // grid template keeps them aligned by construction, like the authors.
  check("period thead columns align with the rows", await evalJS(
    `(() => { var r = document.querySelector('#libPeriodsModalBody .period-browse-row'); var th = document.querySelectorAll('#libPeriodsModalBody .facet-thead-cell'); var c = r.querySelectorAll('.facet-line-1 > div, .facet-line-2 > div'); return th.length === 6 && c.length === 6 && [0,1,2,3,4,5].every(function(i){ return Math.abs(th[i].getBoundingClientRect().left - c[i].getBoundingClientRect().left) < 1; }); })()`));
  // The distinct-author column — "within this period, books from this many
  // authors" — counts authors with a searchable book in the bucket (an
  // author enters a bucket only via a book, so zero-book authors never
  // inflate it; a multi-book author counts once).
  check("period row authors = distinct authors", periodBtns.every(function (b) {
    return String(SEARCHABLE_PERIOD_AUTHORS[b.period]) === b.authors;
  }), periodBtns.map((b) => b.period + "=" + b.authors + " want " + SEARCHABLE_PERIOD_AUTHORS[b.period]).join(","));
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
  // The authors grid mirrors the shape: the range column sits before the
  // count, and the width-aware caps in facet-browse.js hold the name and
  // Arabic tracks at their caps (220/240 + the width step) while the
  // namesShare formula guarantees the range keeps its 180px floor with real
  // room. The widest-column proxy doesn't hold at wide desktops: the longest
  // Thaana name is content-bound at ~265px here and can outgrow the range —
  // the invariant that matters is the floor, the room, and the caps.
  check("authors range keeps its floor, caps hold at 1280", await evalJS(
    `(() => { var r = document.querySelector('#libAuthorsModalBody .author-browse-row'); var w = function(sel){ return r.querySelector(sel).getBoundingClientRect().width; }; return w('.facet-range') >= 180 && w('.facet-range') > w('.facet-count') * 2 && w('.facet-name') <= 270 && w('.facet-name-ar') <= 290; })()`),
    await evalJS(`(() => { var r = document.querySelector('#libAuthorsModalBody .author-browse-row'); var w = function(sel){ return Math.round(r.querySelector(sel).getBoundingClientRect().width); }; return ['.facet-name', '.facet-name-ar', '.facet-century', '.facet-range', '.facet-ce', '.facet-age', '.facet-count', '.facet-check'].map(function(sel){ return sel + '=' + w(sel); }).join(' '); })()`));
  // The base .modal-body gap (16px) is dropped (the thead bar is the
  // separator between the stacked children) but the base 24px side padding
  // is kept — the header, the filter row, the thead strip and the rows all
  // sit on the same band, the search window's all-around padding. Checked
  // here, in the periods section, because both modal bodies exist by now
  // (the periods modal is built lazily on its first open).
  check("facet bodies drop the gap, keep the 24px sides", await evalJS(
    `(() => { var body = document.getElementById('libAuthorsModalBody'); var ov = body.closest('.lib-authors-modal'); var hdr = getComputedStyle(ov.querySelector('.modal-header')).paddingLeft === '24px'; var fl = getComputedStyle(body).gap === '0px' && getComputedStyle(body).paddingLeft === '24px'; var lefts = [body.querySelector('.facet-filter-row'), body.querySelector('.facet-thead-row'), body.querySelector('.facet-table-wrap')].map(function(el){ return el.offsetLeft; }); return hdr && fl && lefts[0] === lefts[1] && lefts[1] === lefts[2]; })()`),
    await evalJS(`(() => { var body = document.getElementById('libAuthorsModalBody'); return ['.modal-header', '.facet-filter-row', '.facet-thead-row', '.facet-table-wrap'].map(function(sel){ var el = body.closest('.lib-authors-modal').querySelector('.modal-header'); if (sel === '.modal-header') return sel + ' padLeft=' + getComputedStyle(el).paddingLeft; el = body.querySelector(sel); return sel + ' left=' + el.offsetLeft; }).join(' '); })()`));

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

  // ── Mobile (≤600px): thead folds away, rows join into compact lines ──
  await send("Emulation.setDeviceMetricsOverride", { width: 500, height: 800, deviceScaleFactor: 1, mobile: false });
  await goto("file://" + ROOT + "library-search.html");
  await waitFor(`document.getElementById('libAuthorsBtn')`);
  await evalJS(`document.getElementById('libAuthorsBtn').click()`);
  await waitFor(`document.getElementById('libAuthorsOverlay').classList.contains('open')`);
  // The whole thead strip folds away (its empty count/check headers would
  // otherwise float above the collapsed columns) and the row re-flows into
  // three joined lines: name · Arabic name / century · range · CE · age /
  // books: N · ✓. The row is RTL, so the pieces read right to left; each
  // line's pieces share a top, each line sits below the previous.
  check("mobile: thead folds away, name·ar join on one line", await evalJS(
    `(() => { var body = document.getElementById('libAuthorsModalBody'); var r = body.querySelector('.author-browse-row[data-author="yahyaBinSharafAnNawawi"]'); var name = r.querySelector('.facet-name').getBoundingClientRect(); var ar = r.querySelector('.facet-name-ar').getBoundingClientRect(); return getComputedStyle(body.querySelector('.facet-thead-row')).display === 'none' && Math.abs(ar.top - name.top) < 1 && ar.right < name.right && ar.right > name.left - 30; })()`),
    await evalJS(`(() => { var body = document.getElementById('libAuthorsModalBody'); var r = body.querySelector('.author-browse-row[data-author="yahyaBinSharafAnNawawi"]'); var name = r.querySelector('.facet-name').getBoundingClientRect(); var ar = r.querySelector('.facet-name-ar').getBoundingClientRect(); return 'thead=' + getComputedStyle(body.querySelector('.facet-thead-row')).display + ' nameL=' + Math.round(name.left) + ' nameR=' + Math.round(name.right) + ' arL=' + Math.round(ar.left) + ' arR=' + Math.round(ar.right) + ' arTop=' + Math.round(ar.top) + ' nameTop=' + Math.round(name.top); })()`));
  check("mobile: century·range·CE·age join on one line, count·check below", await evalJS(
    `(() => { var r = document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"]'); var c = r.querySelector('.facet-century').getBoundingClientRect(); var rg = r.querySelector('.facet-range').getBoundingClientRect(); var ce = r.querySelector('.facet-ce').getBoundingClientRect(); var ag = r.querySelector('.facet-age').getBoundingClientRect(); var ct = r.querySelector('.facet-count').getBoundingClientRect(); var ch = r.querySelector('.facet-check').getBoundingClientRect(); return Math.abs(rg.top - c.top) < 1 && Math.abs(ce.top - c.top) < 1 && Math.abs(ag.top - c.top) < 1 && ce.right < rg.right && rg.right < c.right && ag.right < ce.right && Math.abs(ct.top - ch.top) < 1 && ct.top > c.top && ct.right > ch.right; })()`),
    await evalJS(`(() => { var r = document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"]'); var w = function(sel){ var b = r.querySelector(sel).getBoundingClientRect(); return 'L' + Math.round(b.left) + 'R' + Math.round(b.right) + 'T' + Math.round(b.top); }; return ['.facet-century', '.facet-range', '.facet-ce', '.facet-age', '.facet-count', '.facet-check'].map(function(sel){ return sel + '=' + w(sel); }).join(' '); })()`));
  // The joins are a bare dot with margins — a " · " string collapses its
  // leading space at the start of the cell's line (RTL: the dot hugs the
  // previous piece); margins can't.
  check("mobile: joins are dotted with margin spacing", await evalJS(
    `(() => { var r = document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"]'); var j = function(sel){ var s = getComputedStyle(r.querySelector(sel), '::before'); return s.content !== 'none' && s.marginInlineStart === '6px' && s.marginInlineEnd === '6px'; }; return j('.facet-name-ar') && j('.facet-range') && j('.facet-ce') && j('.facet-age'); })()`),
    await evalJS(`(() => { var r = document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"]'); var j = function(sel){ var s = getComputedStyle(r.querySelector(sel), '::before'); return sel + '=' + s.content + ' m=' + s.marginInlineStart + '/' + s.marginInlineEnd; }; return ['.facet-name-ar', '.facet-range', '.facet-ce', '.facet-age'].map(j).join(' '); })()`));
  // The check gets the space without the dot — select the row (a click
  // toggles the facet; reopening re-renders the rows with the ✓ present)
  // so the spacing before the tick mark is observable: a real gap, but no
  // dot in it (a dot's footprint would push the gap past 12px).
  await evalJS(`document.getElementById('libAuthorsModalBody').querySelector('.author-browse-row[data-author="yahyaBinSharafAnNawawi"]').click()`);
  await evalJS(`document.getElementById('libAuthorsOverlay').querySelector('.modal-close').click()`);
  await sleep(150);
  await evalJS(`document.getElementById('libAuthorsBtn').click()`);
  await waitFor(`document.getElementById('libAuthorsOverlay').classList.contains('open')`);
  check("mobile: the ✓ sits off the count with the space, no dot", await evalJS(
    `(() => { var r = document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"]'); var ch = r.querySelector('.facet-check'); var s = getComputedStyle(ch, '::before'); var ct = r.querySelector('.facet-count').getBoundingClientRect(); var ra = document.createRange(); ra.selectNodeContents(ch); var g = ct.left - ra.getBoundingClientRect().right; return ch.textContent === '✓' && s.content !== 'none' && s.marginInlineStart === '6px' && g >= 5 && g < 12; })()`),
    await evalJS(`(() => { var r = document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"]'); var ch = r.querySelector('.facet-check'); var s = getComputedStyle(ch, '::before'); var ct = r.querySelector('.facet-count').getBoundingClientRect(); var ra = document.createRange(); ra.selectNodeContents(ch); var v = ra.getBoundingClientRect(); return 'check=' + JSON.stringify(ch.textContent) + ' dot=' + s.content + ' m=' + s.marginInlineStart + '/' + s.marginInlineEnd + ' gap=' + (ct.left - v.right); })()`));
  // The Hijri century and years stay plain text; the CE (miladi) side and
  // the age are the derived approximations and read muted (same tone as the
  // count).
  check("mobile: the CE and age read muted, the Hijri years plain", await evalJS(
    `(() => { var r = document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"]'); var c = function(sel){ return getComputedStyle(r.querySelector(sel)).color; }; return c('.facet-ce') !== c('.facet-century') && c('.facet-century') === c('.facet-name') && c('.facet-ce') === c('.facet-count') && c('.facet-age') === c('.facet-ce'); })()`),
    await evalJS(`(() => { var r = document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"]'); var c = function(sel){ return getComputedStyle(r.querySelector(sel)).color; }; return 'ce=' + c('.facet-ce') + ' age=' + c('.facet-age') + ' century=' + c('.facet-century') + ' name=' + c('.facet-name') + ' count=' + c('.facet-count'); })()`));
  // The count and age carry their "ފޮތް:" / "ޢުމުރު:" labels on mobile
  // (hidden on desktop under their own thead columns) — the word plus the
  // colon, so they read "books: N" / "Age: N" per language. The age label
  // lives inside the age cell; scoping both queries to their cells keeps
  // them honest (the row holds two labels now).
  const NAWAWI_SEARCHABLE = SEARCHABLE_BOOKS.filter((b) => authorCodesOf(b).includes("yahyaBinSharafAnNawawi")).length;
  check("mobile: count carries the books label", await evalJS(
    `(() => { var r = document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"]'); var label = r.querySelector('.facet-count .facet-count-label'); return getComputedStyle(label).display !== 'none' && label.textContent === 'books: ' && r.querySelector('.facet-count').textContent === 'books: ${NAWAWI_SEARCHABLE}'; })()`),
    await evalJS(`(() => { var r = document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"]'); var label = r.querySelector('.facet-count .facet-count-label'); return 'label=' + JSON.stringify(label.textContent) + ' display=' + getComputedStyle(label).display + ' cell=' + JSON.stringify(r.querySelector('.facet-count').textContent); })()`));
  check("mobile: age carries the Age label", await evalJS(
    `(() => { var r = document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"]'); var label = r.querySelector('.facet-age .facet-count-label'); return getComputedStyle(label).display !== 'none' && label.textContent === 'Age: ' && r.querySelector('.facet-age').textContent === 'Age: ${authorAgeOf(NAWAWI)}'; })()`),
    await evalJS(`(() => { var r = document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="yahyaBinSharafAnNawawi"]'); var label = r.querySelector('.facet-age .facet-count-label'); return 'label=' + JSON.stringify(label.textContent) + ' display=' + getComputedStyle(label).display + ' cell=' + JSON.stringify(r.querySelector('.facet-age').textContent); })()`));
  await evalJS(`document.getElementById('libAuthorsOverlay').querySelector('.modal-close').click()`);
  await sleep(150);
  await evalJS(`document.getElementById('libPeriodsBtn').click()`);
  await waitFor(`!!document.getElementById('libPeriodsOverlay') && document.getElementById('libPeriodsOverlay').classList.contains('open')`);
  // The periods rows drop to two joined lines: name · range · CE, then
  // authors: N · books: N · ✓ (century bucket 3 = (701–800 AH) ·
  // (817–913 CE)); the "·" before the book count separates the two numbers.
  check("mobile: periods rows join into two lines", await evalJS(
    `(() => { var body = document.getElementById('libPeriodsModalBody'); var r = body.querySelector('.period-browse-row[data-period="3"]'); var name = r.querySelector('.facet-name').getBoundingClientRect(); var rg = r.querySelector('.facet-range').getBoundingClientRect(); var ce = r.querySelector('.facet-ce').getBoundingClientRect(); var au = r.querySelector('.facet-authors').getBoundingClientRect(); var ct = r.querySelector('.facet-count').getBoundingClientRect(); var ch = r.querySelector('.facet-check').getBoundingClientRect(); return getComputedStyle(body.querySelector('.facet-thead-row')).display === 'none' && Math.abs(rg.top - name.top) < 1 && Math.abs(ce.top - name.top) < 1 && ce.right < rg.right && rg.right < name.right && Math.abs(au.top - ct.top) < 1 && Math.abs(ct.top - ch.top) < 1 && au.right > ct.right && ct.top > name.top; })()`),
    await evalJS(`(() => { var body = document.getElementById('libPeriodsModalBody'); var r = body.querySelector('.period-browse-row[data-period="3"]'); var w = function(sel){ var b = r.querySelector(sel).getBoundingClientRect(); return 'L' + Math.round(b.left) + 'R' + Math.round(b.right) + 'T' + Math.round(b.top); }; return 'thead=' + getComputedStyle(body.querySelector('.facet-thead-row')).display + ' ' + ['.facet-name', '.facet-range', '.facet-ce', '.facet-authors', '.facet-count', '.facet-check'].map(function(sel){ return sel + '=' + w(sel); }).join(' '); })()`));
  await evalJS(`document.getElementById('libPeriodsOverlay').querySelector('.modal-close').click()`);
  await sleep(150);

  // Narrow desktop (1024): the capped name/Arabic tracks leave the range +
  // count real room — the range must not collapse into the count.
  await send("Emulation.setDeviceMetricsOverride", { width: 1024, height: 800, deviceScaleFactor: 1, mobile: false });
  await goto("file://" + ROOT + "library-search.html");
  await waitFor(`document.getElementById('libAuthorsBtn')`);
  await evalJS(`document.getElementById('libAuthorsBtn').click()`);
  await waitFor(`document.getElementById('libAuthorsOverlay').classList.contains('open')`);
  check("1024px: range keeps its room", await evalJS(
    `(() => { var r = document.querySelector('#libAuthorsModalBody .author-browse-row'); var w = function(sel){ return Math.round(r.querySelector(sel).getBoundingClientRect().width); }; return w('.facet-range') > w('.facet-count') * 2 && w('.facet-name') <= 220 && w('.facet-name-ar') <= 240; })()`),
    await evalJS(`(() => { var r = document.querySelector('#libAuthorsModalBody .author-browse-row'); var w = function(sel){ return Math.round(r.querySelector(sel).getBoundingClientRect().width); }; var body = document.getElementById('libAuthorsModalBody'); var wrap = body.querySelector('.facet-table-wrap'); return ['.facet-name', '.facet-name-ar', '.facet-century', '.facet-range', '.facet-ce', '.facet-age', '.facet-count', '.facet-check'].map(function(sel){ return sel + '=' + w(sel); }).join(' ') + ' modalW=' + body.closest('.lib-authors-modal').offsetWidth + ' bodyW=' + body.offsetWidth + ' wrapOff=' + wrap.offsetWidth + ' wrapCli=' + wrap.clientWidth; })()`));
  await evalJS(`document.getElementById('libAuthorsOverlay').querySelector('.modal-close').click()`);
  await sleep(150);

  // Sub-1024 (800): the name/Arabic tracks scale down below their caps and
  // the range holds its floor — on resize the text columns yield first, the
  // range + count never cram (the 180px floor ± the 46/54 split rounding).
  await send("Emulation.setDeviceMetricsOverride", { width: 800, height: 800, deviceScaleFactor: 1, mobile: false });
  await goto("file://" + ROOT + "library-search.html");
  await waitFor(`document.getElementById('libAuthorsBtn')`);
  await evalJS(`document.getElementById('libAuthorsBtn').click()`);
  await waitFor(`document.getElementById('libAuthorsOverlay').classList.contains('open')`);
  check("800px: text columns yield, range keeps its floor", await evalJS(
    `(() => { var r = document.querySelector('#libAuthorsModalBody .author-browse-row'); var w = function(sel){ return Math.round(r.querySelector(sel).getBoundingClientRect().width); }; return w('.facet-range') >= 170 && w('.facet-name') < 220 && w('.facet-name-ar') < 240; })()`),
    await evalJS(`(() => { var r = document.querySelector('#libAuthorsModalBody .author-browse-row'); var w = function(sel){ return Math.round(r.querySelector(sel).getBoundingClientRect().width); }; return ['.facet-name', '.facet-name-ar', '.facet-range', '.facet-count'].map(function(sel){ return sel + '=' + w(sel); }).join(' '); })()`));
  await evalJS(`document.getElementById('libAuthorsOverlay').querySelector('.modal-close').click()`);
  await sleep(150);

  // Large desktop (1536): the name/Arabic caps step up past the small-desktop
  // maximums — the columns fill out with the room (the name sits at its
  // full content width; the Arabic track stays content-bound here because
  // the longest Arabic name is only ~240px in the EN UI). At this width the
  // longest Thaana name can outgrow the 1fr range — what holds is the grow
  // (the step-up still works) and the range's 180px floor.
  await send("Emulation.setDeviceMetricsOverride", { width: 1536, height: 800, deviceScaleFactor: 1, mobile: false });
  await goto("file://" + ROOT + "library-search.html");
  await waitFor(`document.getElementById('libAuthorsBtn')`);
  await evalJS(`document.getElementById('libAuthorsBtn').click()`);
  await waitFor(`document.getElementById('libAuthorsOverlay').classList.contains('open')`);
  check("1536px: text columns grow, range keeps its floor", await evalJS(
    `(() => { var r = document.querySelector('#libAuthorsModalBody .author-browse-row'); var w = function(sel){ return Math.round(r.querySelector(sel).getBoundingClientRect().width); }; return w('.facet-name') > 240 && w('.facet-name-ar') >= 240 && w('.facet-range') >= 180; })()`),
    await evalJS(`(() => { var r = document.querySelector('#libAuthorsModalBody .author-browse-row'); var w = function(sel){ return Math.round(r.querySelector(sel).getBoundingClientRect().width); }; return ['.facet-name', '.facet-name-ar', '.facet-century', '.facet-range', '.facet-ce', '.facet-age', '.facet-count', '.facet-check'].map(function(sel){ return sel + '=' + w(sel); }).join(' '); })()`));
  await evalJS(`document.getElementById('libAuthorsOverlay').querySelector('.modal-close').click()`);
  await sleep(150);
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

  // ── Cleanup ───────────────────────────────────────────────────────
  check("no page errors", pageErrors.length === 0, pageErrors.join("; "));
  ws.close();
  edge.kill();
  console.log(failures === 0 ? "ALL PASS" : failures + " FAILURES");
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.log("ABORT: " + e.message); process.exit(1); });
