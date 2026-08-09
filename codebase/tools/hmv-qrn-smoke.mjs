// QRN data-layer smoke battery — see docs/TESTING.md for the
// failure-classification rules and the known non-errors table.
// Run: node tools/hmv-qrn-smoke.mjs  (from codebase/, or anywhere — paths
// resolve relative to this script). Requires Node 20.11+ and Microsoft Edge.
// Env overrides: HMV_SMOKE_PORT (default 9353), HMV_SMOKE_PROFILE (default
// %TEMP%\hmv-qrn-smoke-profile).
//
// Checks:
//  - QRN-hadithmv renders with derived base columns (3 visible: basmalah,
//    ayahImlai, translation; juz/surah/ayah auto-hidden via -HDN)
//  - juz nav 1/2/12/13/30 lands the TABLE on the right first rows; surah
//    nav 1/2/9/114; basmalah on 2:1/114:1, empty on 1:1/9:1
//  - content modal: 2 base rows keyed QRN-BASE-STRUCT:3 (basmalah) + imlai:0
//    with 05 labels, no "QRN-BASE-STRUCT" text anywhere (juz/surah/ayah are
//    fixed structural columns, not offered in the modal)
//  - PRESET_ALL loads books without an error toast; PRESET_RESET back to 3
//  - search filters; settings Reset no error toast
//  - imlai book renders as a standard 1-column book (no quran panel)
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
const PORT = process.env.HMV_SMOKE_PORT ? parseInt(process.env.HMV_SMOKE_PORT, 10) : 9353;
const PROFILE = process.env.HMV_SMOKE_PROFILE || (process.env.TEMP + "\\hmv-qrn-smoke-profile");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? "PASS  " : "FAIL  ") + name + (detail !== undefined ? "   [" + detail + "]" : ""));
  if (!cond) failures++;
}

// ── expected values straight from the data files ─────────────────────
const rows04 = parseCSV(fs.readFileSync(DATA + "04-registry-quranSurahs.csv", "utf8"));
rows04.shift();
const s02 = rows04.find((r) => r[0] === "2");
const BASM = s02[5];
const surahStarts = [];
let idx = 0;
for (const r of rows04) { surahStarts[parseInt(r[0], 10)] = idx; idx += parseInt(r[4], 10); }

const imlai = parseCSV(fs.readFileSync(DATA + "content/QRN-DATA-ayahImlai.csv", "utf8"));
imlai.shift();
const JSTARTS = [0, 148, 259, 385, 516, 640, 750, 899, 1041, 1200, 1327, 1478, 1648, 1802, 2029, 2214, 2483, 2673, 2875, 3214, 3385, 3563, 3732, 4089, 4264, 4510, 4705, 5104, 5241, 5672];

const rows06 = parseCSV(fs.readFileSync(DATA + "06-registry-quranColumns.csv", "utf8"));
rows06.shift();
const base06 = rows06.filter(function (r) { return r[0] === "QRN-BASE-STRUCT" || r[0] === "QRN-DATA-ayahImlai"; })
  .sort(function (a, b) {
    if (a[0] === b[0]) return parseInt(a[1], 10) - parseInt(b[1], 10);
    return a[0] === "QRN-BASE-STRUCT" ? -1 : 1;
  });
// visible base rows only — juz/surah/ayah (QRN-BASE-STRUCT:0..2) are not
// offered in the modal; basmalah (3) and imlai stay
const expLabels = base06.filter(function (r) {
  return !(r[0] === "QRN-BASE-STRUCT" && parseInt(r[1], 10) < 3);
}).map(function (r) { return r[2]; });
const rows02 = parseCSV(fs.readFileSync(DATA + "02-registry-bookMeta.csv", "utf8"));
rows02.shift();
const EXP_TITLE_DV = (rows02.find(function (r) { return r[0] === "QRN-DATA-ayahImlai"; }) || [])[2] || "";

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
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
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
    await sleep(500);
  }

  async function waitFor(expr, timeout) {
    return evalJS(`new Promise((res) => {
      const t0 = Date.now();
      (function poll() {
        try { if ((${expr})) return res(true); } catch (e) {}
        if (Date.now() - t0 > ${timeout || 20000}) return res(false);
        setTimeout(poll, 100);
      })();
    })`);
  }

  async function forceTableMode() {
    // Fresh profiles boot in card mode for non-radheef books (reader.js:95) —
    // switch to table mode for the column assertions.
    await evalJS("(function () { var b = document.getElementById('btnViewMode'); if (b) b.click(); })()");
    await waitFor(`getComputedStyle(document.getElementById('viewModeDropdown')).display === 'block'`, 5000);
    await evalJS(`(function () {
      var o = document.querySelector('#viewModeDropdown .view-mode-option[data-mode="table"]');
      if (o) o.click();
    })()`);
    return waitFor(`document.querySelectorAll('.reader-table tbody tr').length > 0`, 15000);
  }

  async function firstRowCells() {
    return evalJS(`Array.from(document.querySelectorAll('.reader-table tbody tr')[0].querySelectorAll('td')).map(function (t) { return t.textContent; })`);
  }
  // strip ﴿ ﴾ (decorateAyah quran-data.js:285) and the trailing Arabic
  // numeral (e.g. " ٦") that sits inside the brackets
  const unornament = (s) => (s || "").replace(/[\uFD3F\uFD3E]/g, "").replace(/[\u0660-\u0669]+$/g, "").trim();
  async function navState() {
    return evalJS(`(function () {
      var l = document.getElementById('qrnSurahLabel');
      return {
        juz: document.getElementById('qrnJuzInput').value,
        ayah: document.getElementById('qrnAyahInput').value,
        surah: l ? l.textContent.trim() : null,
      };
    })()`);
  }

  // ── A. QRN-hadithmv: derived columns, nav, basmalah ─────────────────
  console.log("== A. QRN-hadithmv ==");
  await goto(ROOT + "reader.html?book=QRN-hadithmv");
  await waitFor(`(function () {
    var w = document.getElementById('readerWrapper');
    return w && getComputedStyle(w).display === 'block';
  })()`);
  check("quran nav panel visible", await evalJS(`(function () {
    var p = document.getElementById('readerPanelQuran');
    return p && getComputedStyle(p).display !== 'none';
  })()`));
  await forceTableMode();
  await sleep(300);

  const headers = await evalJS(`Array.from(document.querySelectorAll('.reader-table th')).map(function (t) { return t.textContent.trim(); })`);
  console.log("th:", JSON.stringify(headers));
  check("3 visible columns (basmalah + ayahImlai + translation)", headers.length === 3, headers.join("|"));
  check("no -HDN header rendered", !headers.some((h) => /-HDN/i.test(h)), "");
  check("has basmalah header", headers.indexOf("basmalah") !== -1, "");
  check("has ayahImlai header", headers.indexOf("ayahImlai") !== -1, "");

  const first = await firstRowCells();
  check("1:1 basmalah cell empty", first[0] === "", JSON.stringify(first[0]));
  check("1:1 imlai cell = first ayah", unornament(first[1]) === imlai[0][0], unornament(first[1]).slice(0, 18));
  check("1:1 translation non-empty", !!first[2], first[2] ? first[2].slice(0, 18) : "empty");

  // juz landing: the table's first row must be the juz's start row.
  // Order 2/12/13/30 first, 1 last (view already starts at 1:1).
  const juzCases = [[2, 2, 142], [12, 11, 6], [13, 12, 53], [30, 78, 1], [1, 1, 1]];
  for (const [j, s, a] of juzCases) {
    await evalJS(`(function () {
      var el = document.getElementById('qrnJuzInput');
      el.value = ${j};
      el.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    await sleep(450);
    const st = await navState();
    const cells = await firstRowCells();
    const imlaiOk = unornament(cells[1]) === imlai[JSTARTS[j - 1]][0];
    const basmOk = j === 30 ? cells[0] === BASM : cells[0] === ""; // juz 30 opens at 78:1
    check("juz " + j + " lands on " + s + ":" + a,
      st.juz === String(j) && st.surah.indexOf(s + " ") === 0 && imlaiOk && basmOk,
      JSON.stringify({ st: st, imlai: imlaiOk, basm: cells[0] ? "present" : "empty" }));
  }

  async function goSurah(sn) {
    await evalJS("document.getElementById('qrnSurahBtn').click()");
    await waitFor(`!!document.querySelector('#qrnSurahOverlay [data-surah="${sn}"]')`, 5000);
    await evalJS(`document.querySelector('#qrnSurahOverlay [data-surah="${sn}"]').click()`);
    await sleep(400);
  }

  await goSurah(2);
  let st = await navState();
  let cells = await firstRowCells();
  check("surah 2 nav lands 2:1", st.surah.indexOf("2 ") === 0, JSON.stringify(st));
  check("2:1 basmalah + imlai", cells[0] === BASM && unornament(cells[1]) === imlai[surahStarts[2]][0], (cells[0] || "").slice(0, 12));

  await goSurah(9);
  st = await navState();
  cells = await firstRowCells();
  check("surah 9 nav lands 9:1", st.surah.indexOf("9 ") === 0, JSON.stringify(st));
  check("9:1 basmalah empty + imlai right", cells[0] === "" && unornament(cells[1]) === imlai[surahStarts[9]][0], unornament(cells[1]).slice(0, 12));

  await goSurah(114);
  st = await navState();
  cells = await firstRowCells();
  check("surah 114 nav lands 114:1", st.surah.indexOf("114 ") === 0, JSON.stringify(st));
  check("114:1 basmalah + imlai", cells[0] === BASM && unornament(cells[1]) === imlai[surahStarts[114]][0], unornament(cells[1]).slice(0, 12));

  await goSurah(1);
  st = await navState();
  cells = await firstRowCells();
  check("surah 1 nav lands 1:1", st.surah.indexOf("1 ") === 0 && cells[0] === "", JSON.stringify(st));

  // ── B. Content modal: base keys, labels, no struct text ────────────
  console.log("== B. content modal ==");
  await evalJS("document.getElementById('qrnContentBtn').click()");
  await waitFor(`getComputedStyle(document.getElementById('qrnContentOverlay')).display !== 'none'`, 5000);
  await sleep(300);
  const modal = await evalJS(`(function () {
    var rows = Array.from(document.querySelectorAll('#qrnContentModalBody tr[data-key]'));
    var keys = rows.map(function (r) { return r.dataset.key; });
    return {
      struct: keys.filter(function (k) { return k.indexOf('QRN-BASE-STRUCT:') === 0; }).length,
      imlai: keys.filter(function (k) { return k === 'QRN-DATA-ayahImlai:0'; }).length,
      total: keys.length,
      baseLabels: rows.filter(function (r) {
        return r.dataset.key.indexOf('QRN-BASE-STRUCT:') === 0 || r.dataset.key === 'QRN-DATA-ayahImlai:0';
      }).map(function (r) { return r.textContent.trim().replace(/[\u25B2\u25BC]/g, '').replace(/\s+/g, ' '); }),
      bodyText: document.body.innerText,
    };
  })()`);
  check("1 structural row (QRN-BASE-STRUCT:3 basmalah)", modal.struct === 1, String(modal.struct));
  check("1 imlai row (QRN-DATA-ayahImlai:0)", modal.imlai === 1, String(modal.imlai));
  check("2 base rows total", modal.struct + modal.imlai === 2, String(modal.total) + " rows total");
  check("no QRN-BASE-STRUCT text anywhere", modal.bodyText.indexOf("QRN-BASE-STRUCT") === -1, "");
  check("base labels match 05 registry (dv)", JSON.stringify(modal.baseLabels) === JSON.stringify(expLabels), JSON.stringify(modal.baseLabels));

  // ── C. PRESET_ALL / RESET ──────────────────────────────────────────
  console.log("== C. presets ==");
  await evalJS(`document.querySelector('#qrnContentOverlay .quran-preset-btn[data-preset="all"]').click()`);
  const grew = await waitFor(`document.querySelectorAll('.reader-table th').length > 6`, 20000);
  const thAfter = await evalJS(`document.querySelectorAll('.reader-table th').length`);
  check("preset all loads book columns", grew && thAfter > 6, String(thAfter) + " th");
  const toast = await evalJS(`(function () {
    var t = document.querySelector('.copy-toast');
    return t && t.textContent ? t.textContent : null;
  })()`);
  check("no error toast after preset all", !toast || toast.indexOf("⚠️") === -1, toast);

  await evalJS(`document.querySelector('#qrnContentOverlay .quran-preset-btn[data-preset="reset"]').click()`);
  await waitFor(`document.querySelectorAll('.reader-table th').length === 3`, 15000);
  await sleep(400);
  const thReset = await evalJS(`document.querySelectorAll('.reader-table th').length`);
  check("preset reset back to base", thReset === 3, String(thReset) + " th");

  // ── D. search + settings reset ─────────────────────────────────────
  console.log("== D. search / settings ==");
  await evalJS(`(function () {
    var inp = document.getElementById('readerSearchInput');
    inp.value = 'الناس';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await waitFor(`document.querySelector('#searchResultsDropdown .search-count-header') !== null`, 10000);
  await sleep(300);
  const res = await evalJS(`(function () {
    var h = document.querySelector('#searchResultsDropdown .search-count-header');
    return {
      rows: document.querySelectorAll('.reader-table tbody tr').length,
      rc: h ? h.textContent.trim() : null,
    };
  })()`);
  check("search filters rows", res.rows > 0 && res.rows < 6236, JSON.stringify(res));
  await evalJS(`(function () {
    var inp = document.getElementById('readerSearchInput');
    inp.value = '';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await sleep(500);

  await evalJS("document.getElementById('btnResetSettings').click()");
  await sleep(500);
  const toastR = await evalJS(`(function () {
    var t = document.querySelector('.copy-toast');
    return t && t.textContent ? t.textContent : null;
  })()`);
  check("settings reset no error toast", !toastR || toastR.indexOf("⚠️") === -1, toastR);

  // ── E. imlai book as a standard 1-column book ──────────────────────
  console.log("== E. imlai book standalone ==");
  await goto(ROOT + "reader.html?book=QRN-DATA-ayahImlai");
  await waitFor(`(function () {
    var w = document.getElementById('readerWrapper');
    return w && getComputedStyle(w).display === 'block';
  })()`);
  await forceTableMode();
  await sleep(300);
  const std = await evalJS(`(function () {
    var p = document.getElementById('readerPanelQuran');
    return {
      quranPanel: !!p && getComputedStyle(p).display !== 'none',
      headers: Array.from(document.querySelectorAll('.reader-table th')).map(function (t) { return t.textContent.trim(); }),
      rows: document.querySelectorAll('.reader-table tbody tr').length,
      title: (document.getElementById('pageTitle') || {}).textContent || '',
    };
  })()`);
  check("no quran nav panel", !std.quranPanel, String(std.quranPanel));
  check("single ayahImlai column", std.headers.length === 1 && std.headers[0] === "ayahImlai", JSON.stringify(std.headers));
  check("book title from 02 (dv)", std.title.indexOf(EXP_TITLE_DV) !== -1, std.title);

  // incremental render — scroll to bottom to load all chunks (30 rows each)
  const allLoaded = await waitFor(`(function () {
    scrollTo(0, document.body.scrollHeight);
    return document.querySelectorAll('.reader-table tbody tr').length >= 6236;
  })()`, 90000);
  const rowsFinal = await evalJS(`document.querySelectorAll('.reader-table tbody tr').length`);
  check("6236 rows rendered after scroll", allLoaded && rowsFinal === 6236, String(rowsFinal));
  const lastText = await evalJS(`(function () {
    var trs = document.querySelectorAll('.reader-table tbody tr');
    var last = trs[trs.length - 1].querySelectorAll('td');
    return last[0] ? last[0].textContent : '';
  })()`);
  check("last row = 6236th imlai", unornament(lastText) === imlai[6235][0], lastText);

  ws.close();
  edge.kill();
  console.log(failures ? "== " + failures + " FAILURES ==" : "== ALL PASS ==");
  process.exit(failures ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
