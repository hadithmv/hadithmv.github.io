// Authors & Periods browse battery — the library page's author/period
// faceting + the author line on cards, dashboard and reader header.
// Run: node tools/hmv-authors-check.mjs  (from codebase/, or anywhere — paths
// resolve relative to this script). Requires Node 20.11+ and Microsoft Edge.
// Env overrides: HMV_AUTHORS_PORT (default 9361), HMV_AUTHORS_PROFILE.
//
// Checks:
//  - library page: Authors button opens the modal with one row per author
//    (name + Hijri years, registry order); click toggles → chip + ?authors=
//  - period modal: grid buttons = the distinct death-century buckets + modern
//    (derived from 08); click sets ?period= and the chip
//  - ?authors=/?period= deep links activate chips on load
//  - scoped search: with an author active, every result card belongs to one
//    of that author's books (derived from 02)
//  - author line renders on library result cards, dashboard cards, reader
//    header ("by <nameEN> (d. <diedAH> AH)" — page driven in English)
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
const books02 = csvObjects("02-registry-bookMeta.csv");
const authors08 = csvObjects("08-registry-authors.csv").filter((a) => a.authorCode);
// EN name for an author code (from the registry — the battery runs the page in English)
const nameEN = (code) => (authors08.find((a) => a.authorCode === code) || {}).nameEN || code;
// Period bucket: death-century string, "modern" when diedAH is blank
const periodOf = (a) => (a.diedAH ? String(Math.ceil(parseInt(a.diedAH, 10) / 100)) : "modern");
const authorCodesOf = (b) => ((b && b.authorCode) || "").split(",").map((s) => s.trim()).filter(Boolean);
// The page counts over the *visible* set only (-HDN books are hidden from the
// library); mirrors visibleBooks() in library-search-page.js.
const VISIBLE_BOOKS = books02.filter((b) => !b.bookCode.endsWith("-HDN"));
// The browse lists authors with at least one visible book, in registry order.
const BROWSE_AUTHORS = authors08.filter((a) => VISIBLE_BOOKS.some((b) => authorCodesOf(b).includes(a.authorCode)));
// Period buckets over the visible authors; "modern" only when a visible author
// lacks a death year (a zero-count bucket would be pointless).
const HAS_MODERN = BROWSE_AUTHORS.some((a) => !a.diedAH);
const PERIODS = [...new Set(BROWSE_AUTHORS.map(periodOf))]
  .filter((p) => p !== "modern" || HAS_MODERN)
  .sort((a, b) =>
    a === "modern" ? 1 : b === "modern" ? -1 : parseInt(a, 10) - parseInt(b, 10));
const NAWAWI = authors08.find((a) => a.authorCode === "nawawi");
const NAWAWI_BOOKS = VISIBLE_BOOKS.filter((b) => authorCodesOf(b).includes("nawawi")).map((b) => b.bookCode);
const MALIK_BOOK = books02.find((b) => b.bookCode === "HDT-muwattaMalik");
const malikRow = authors08.find((a) => a.authorCode === "malik");
// Exact en author line for Malik, per the i18n authorLife template "{b}–{d} AH":
// "Malik ibn Anas (93–179 AH)". Both born and died are present in the data.
const MALIK_LINE = nameEN("malik") + " (" + malikRow.bornAH + "–" + malikRow.diedAH + " AH)";
// Books whose authorCode is blank — the registry may leave some unattributed
// on purpose; their cards must show no author line.
const UNATTRIBUTED = books02.filter((b) => authorCodesOf(b).length === 0);

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
  // 08's nameEN + the en i18n templates.
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

  // One row per registered author, in registry order, name + years
  const rows = await evalJS(`Array.from(document.querySelectorAll('#libAuthorsModalBody .author-browse-row')).map(function(r){
    return { code: r.dataset.author, text: r.textContent, title: r.title };
  })`);
  check("author rows = visible authors", rows.length === BROWSE_AUTHORS.length, rows.length + " vs " + BROWSE_AUTHORS.length);
  check("author rows in registry order", rows.every(function (r, i) { return r.code === BROWSE_AUTHORS[i].authorCode; }),
    rows.map((r) => r.code).join(","));
  // nawawi was born 631 and died 676 — the row shows "631–676 AH" (authorLife)
  check("nawawi row has years", rows.find((r) => r.code === "nawawi").text.indexOf("676 AH") !== -1,
    rows.find((r) => r.code === "nawawi").text);

  // Click the nawawi row → selection, chip, URL
  await evalJS(`document.querySelector('#libAuthorsModalBody .author-browse-row[data-author="nawawi"]').click()`);
  await waitFor(`location.search.indexOf('authors=nawawi') !== -1`);
  check("click sets ?authors=nawawi", true, await evalJS(`location.search`));
  check("author chip active in tags row", await evalJS(
    `!!document.querySelector('#libTagsCollapse .author-chip[data-author="nawawi"].active')`));
  check("nawawi chip carries count", await evalJS(
    `document.querySelector('#libTagsCollapse .author-chip[data-author="nawawi"]').textContent.indexOf(${JSON.stringify(String(NAWAWI_BOOKS.length))}) !== -1`),
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
    `document.querySelector('#libResults .lib-result .card-author').textContent.indexOf(${JSON.stringify(nameEN("nawawi"))}) !== -1 &&
     document.querySelector('#libResults .lib-result .card-author').textContent.indexOf('676 AH') !== -1`),
    await evalJS(`document.querySelector('#libResults .lib-result .card-author').textContent`));

  // ── Library: Periods modal ────────────────────────────────────────
  await evalJS(`document.getElementById('libPeriodsBtn').click()`);
  await waitFor(`!!document.getElementById('libPeriodsOverlay') && document.getElementById('libPeriodsOverlay').classList.contains('open')`);
  const periodBtns = await evalJS(`Array.from(document.querySelectorAll('#libPeriodsModalBody .period-browse-btn')).map(function(b){
    return { period: b.dataset.period, text: b.textContent };
  })`);
  check("period grid = distinct buckets", periodBtns.map((b) => b.period).join(",") === PERIODS.join(","),
    periodBtns.map((b) => b.period).join(",") + " vs " + PERIODS.join(","));
  check("period grid sorted chronological", periodBtns.every(function (b, i) {
    return i === 0 || (periodBtns[i - 1].period === "modern" ? false :
      b.period === "modern" ? true : parseInt(b.period, 10) > parseInt(periodBtns[i - 1].period, 10));
  }), periodBtns.map((b) => b.period).join(","));

  // Select the 3rd-century bucket (bukhari died 256)
  await evalJS(`document.querySelector('#libPeriodsModalBody .period-browse-btn[data-period="3"]').click()`);
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
  await goto("file://" + ROOT + "library-search.html?authors=nawawi&period=7");
  await waitFor(`!!document.querySelector('#libTagsCollapse .author-chip[data-author="nawawi"]')`);
  check("deep link ?authors=nawawi&period=7", await evalJS(
    `!!document.querySelector('#libTagsCollapse .author-chip[data-author="nawawi"].active') &&
     !!document.querySelector('#libTagsCollapse .period-chip[data-period="7"].active')`));

  // ── Dashboard card author line ────────────────────────────────────
  await goto("file://" + ROOT + "index.html");
  await waitFor(`Array.from(document.querySelectorAll('.book-card')).some(function(c){
    return c.querySelector('.title-en') && c.querySelector('.title-en').textContent === ${JSON.stringify(MALIK_BOOK.titleEN)};
  })`);
  const cardAuthor = await evalJS(`Array.from(document.querySelectorAll('.book-card')).map(function(c){
    var t = c.querySelector('.title-en'); if (!t || t.textContent !== ${JSON.stringify(MALIK_BOOK.titleEN)}) return '';
    var a = c.querySelector('.card-author'); return a ? a.textContent : '';
  }).join('')`);
  check("dashboard card author line exact", cardAuthor === MALIK_LINE, cardAuthor + " vs " + MALIK_LINE);
  check("unattributed books exist in registry", UNATTRIBUTED.length > 0, UNATTRIBUTED.length);
  const noAuthorCard = UNATTRIBUTED.length > 0 && await evalJS(`Array.from(document.querySelectorAll('.book-card')).some(function(c){
    return c.querySelector('.title-en') && c.querySelector('.title-en').textContent === ${JSON.stringify(UNATTRIBUTED[0].titleEN)} &&
      !c.querySelector('.card-author');
  })`);
  check("unattributed book has no author line", noAuthorCard);

  // ── Reader header author line ─────────────────────────────────────
  await goto("file://" + ROOT + "reader.html?book=HDT-muwattaMalik");
  await waitFor(`document.getElementById('readerPageAuthor') && document.getElementById('readerPageAuthor').textContent.indexOf(${JSON.stringify(nameEN("malik"))}) !== -1`);
  const readerAuthor = await evalJS(`document.getElementById('readerPageAuthor').textContent`);
  check("reader header author line exact", readerAuthor === "by " + MALIK_LINE, readerAuthor + " vs by " + MALIK_LINE);

  // ── Cleanup ───────────────────────────────────────────────────────
  check("no page errors", pageErrors.length === 0, pageErrors.join("; "));
  ws.close();
  edge.kill();
  console.log(failures === 0 ? "ALL PASS" : failures + " FAILURES");
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.log("ABORT: " + e.message); process.exit(1); });
