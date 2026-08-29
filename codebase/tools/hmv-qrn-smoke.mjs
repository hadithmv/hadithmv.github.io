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
//  - nav-then-add: after surah+ayah dropdown nav, an added column must
//    widen the rendered rows (td == th), not just the thead
//  - search window: button opens the modal, results + regex + whole-word +
//    advanced + history + Escape; settings Reset no error toast
//  - imlai book renders as a standard 1-column book (no quran panel)
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { pathToFileURL } from "url";

const { parseCSV } = await import(pathToFileURL(path.join(import.meta.dirname, "..", "src", "js", "csv.js")));

// Machine-specific: path to Microsoft Edge. Adjust per machine/OS.
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const baseDir = import.meta.dirname.replace(/\\/g, "/");
const IS_DIST = process.argv.includes("--dist");
const ROOT = baseDir + (IS_DIST ? "/../dist/books/" : "/../src/books/");
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
const rows04 = parseCSV(fs.readFileSync(DATA + "05-registry-quranSurahs.csv", "utf8"));
rows04.shift();
const s02 = rows04.find((r) => r[0] === "2");
const BASM = s02[5];
const surahStarts = [];
let idx = 0;
for (const r of rows04) { surahStarts[parseInt(r[0], 10)] = idx; idx += parseInt(r[4], 10); }

const imlai = parseCSV(fs.readFileSync(DATA + "content/QRN-DATA-ayahImlai.csv", "utf8"));
imlai.shift();
const JSTARTS = [0, 148, 259, 385, 516, 640, 750, 899, 1041, 1200, 1327, 1478, 1648, 1802, 2029, 2214, 2483, 2673, 2875, 3214, 3385, 3563, 3732, 4089, 4264, 4510, 4705, 5104, 5241, 5672];

const rows06 = parseCSV(fs.readFileSync(DATA + "07-registry-quranColumns.csv", "utf8"));
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
const rows02 = parseCSV(fs.readFileSync(DATA + "03-registry-bookMeta.csv", "utf8"));
const rows02Header = rows02.shift();
// Column resolved by header name, not position — 02's layout may grow
// (authorCode sits after bookCode; version is always last).
const EXP_TITLE_DV_COL = rows02Header.indexOf("titleDV");
const EXP_TITLE_DV = (rows02.find(function (r) { return r[0] === "QRN-DATA-ayahImlai"; }) || [])[EXP_TITLE_DV_COL] || "";

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
      keys: keys,
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

  // Regression guard: every 06 registry (sourceBook, sourceCol) must exist in
  // that book's CSV header AND appear in the modal — a missing registry row
  // silently removes the column from the modal, so it can never be added to
  // an open QRN book (soabuni's translation column once had no row at all).
  const rows06all = parseCSV(fs.readFileSync(DATA + "07-registry-quranColumns.csv", "utf8"));
  rows06all.shift();
  const modalKeys = new Set(modal.keys);
  const regBad = [];
  for (const r of rows06all) {
    const isStruct = r[0] === "QRN-BASE-STRUCT";
    const col = parseInt(r[1], 10);
    if (isStruct && col < 3) continue; // fixed structural keys have no modal row
    if (!isStruct) {
      const csvRows = parseCSV(fs.readFileSync(DATA + "content/" + r[0] + ".csv", "utf8"));
      if (!csvRows.length || col >= csvRows[0].length) {
        regBad.push(r[0] + ":" + r[1] + " (no column " + r[1] + " in CSV header)");
        continue;
      }
    }
    if (!modalKeys.has(r[0] + ":" + r[1])) {
      regBad.push(r[0] + ":" + r[1] + " (missing from modal list)");
    }
  }
  check("every 06 registry column exists in CSV + modal", regBad.length === 0, regBad.join("; "));

  // basmalah toggle round-trip: uncheck hides, re-check restores. Regression
  // guard — after the basefile-1 split, loadAndInsertColumn early-returned for
  // ALL QRN-BASE_STRUCT keys, so basmalah (:3, a real toggle) could be hidden
  // but never re-enabled, and its checkbox silently lied about the state.
  await evalJS(`(function () {
    var cb = document.querySelector('#qrnContentModalBody tr[data-key="QRN-BASE-STRUCT:3"] input[type=checkbox]');
    cb.click();
  })()`);
  const hid = await waitFor(`document.querySelectorAll('.reader-table th').length === 2`, 5000);
  check("basmalah uncheck hides column", hid, String(await evalJS(`document.querySelectorAll('.reader-table th').length`)) + " th");
  await evalJS(`(function () {
    var cb = document.querySelector('#qrnContentModalBody tr[data-key="QRN-BASE-STRUCT:3"] input[type=checkbox]');
    cb.click();
  })()`);
  const rest = await waitFor(`document.querySelectorAll('.reader-table th').length === 3`, 5000);
  check("basmalah re-check restores column", rest, String(await evalJS(`document.querySelectorAll('.reader-table th').length`)) + " th");

  // ── B2. Nav-then-add regression ────────────────────────────────────
  // User repro: navigate via the surah AND ayah dropdowns, then add a
  // book column — the header label appeared but the rows never gained the
  // cells. The surah filter's data slice held pre-insert row arrays and
  // column rebuilds only replaced allData's elements. applyColumnOrder now
  // rewrites rows in place, so filtered slices stay live.
  await evalJS("window.closeModal('qrnContentOverlay')");
  await goSurah(2);
  await evalJS("document.getElementById('qrnAyahInput').click()");
  await waitFor(`!!document.querySelector('#qrnAyahDropdown [data-v="255"]')`, 5000);
  await evalJS(`document.querySelector('#qrnAyahDropdown [data-v="255"]').click()`);
  await sleep(400);
  await evalJS("document.getElementById('qrnContentBtn').click()");
  await waitFor(`getComputedStyle(document.getElementById('qrnContentOverlay')).display !== 'none'`, 5000);
  await evalJS(`(function () {
    var cb = document.querySelector('#qrnContentModalBody tr[data-key="QRN-jaufarFaiz:0"] input[type=checkbox]');
    cb.click();
  })()`);
  const navAdd = await waitFor(`document.querySelectorAll('.reader-table th').length === 4`, 20000);
  const navRows = await evalJS(`(function () {
    var first = document.querySelector('.reader-table tbody tr:first-child');
    var ths = document.querySelectorAll('.reader-table th').length;
    return {
      ths: ths,
      tds: first ? first.children.length : -1,
      row: first ? parseInt(first.getAttribute("data-row") || "-1", 10) : -1,
      cell4: first && first.children[3] ? first.children[3].textContent : null,
    };
  })()`);
  check("nav-then-add: column label appears", navAdd && navRows.ths === 4, String(navRows.ths) + " th");
  check("nav-then-add: rows carry the new column", navRows.tds === navRows.ths,
    String(navRows.tds) + " td vs " + String(navRows.ths) + " th");
  const jaufar = parseCSV(fs.readFileSync(DATA + "content/QRN-jaufarFaiz.csv", "utf8"), true);
  jaufar.shift();
  // The column rebuild preserves the reading position (window around the
  // current row), so the first rendered row is NOT the top of the surah
  // anymore — identify it via its own data-row (slice index, mapped to the
  // full-book index) and expect the data-file value for THAT row. Still
  // guards the original bug: a stale pre-insert slice would render the new
  // cell empty or misaligned with the row's other cells.
  const jaufarRow = navRows.row >= 0 ? surahStarts[2] + navRows.row : -1;
  check("nav-then-add: jaufar cell matches data file",
    jaufarRow >= 0 && jaufarRow < jaufar.length &&
    unornament(navRows.cell4 || "") === unornament(jaufar[jaufarRow][0] || ""),
    (navRows.cell4 || "").slice(0, 20));
  // leave state as section B ends it: column unchecked, modal open
  // (section C clicks preset buttons inside the overlay)
  await evalJS(`(function () {
    var cb = document.querySelector('#qrnContentModalBody tr[data-key="QRN-jaufarFaiz:0"] input[type=checkbox]');
    cb.click();
  })()`);
  const navUndo = await waitFor(`document.querySelectorAll('.reader-table th').length === 3`, 10000);
  check("nav-then-add: uncheck restores base columns", navUndo, "");

  // ── C. PRESET_ALL / RESET ──────────────────────────────────────────
  console.log("== C. presets ==");
  await evalJS(`document.querySelector('#qrnContentOverlay .quran-preset-btn[data-preset="all"]').click()`);
  const grew = await waitFor(`document.querySelectorAll('.reader-table th').length > 6`, 20000);
  const thAfter = await evalJS(`document.querySelectorAll('.reader-table th').length`);
  check("preset all loads book columns", grew && thAfter > 6, String(thAfter) + " th");
  const toast = await evalJS(`(function () {
    var t = document.querySelector('.toast');
    return t && t.textContent ? t.textContent : null;
  })()`);
  check("no error toast after preset all", !toast || toast.indexOf("⚠️") === -1, toast);

  await evalJS(`document.querySelector('#qrnContentOverlay .quran-preset-btn[data-preset="reset"]').click()`);
  await waitFor(`document.querySelectorAll('.reader-table th').length === 3`, 15000);
  await sleep(400);
  const thReset = await evalJS(`document.querySelectorAll('.reader-table th').length`);
  check("preset reset back to base", thReset === 3, String(thReset) + " th");

  // ── D. search window + settings reset ──────────────────────────────
  // Search moved into the modal window (non-RDF books): the header input is
  // gone, #btnSearchWindow opens the window. The "search filters rows" check
  // is really "the table still renders (incremental render)" — window search
  // never touches the page until a result jump, so the table row count stays
  // the pre-search window (~50 rows), not 6236.
  console.log("== D. search window / settings ==");
  await evalJS(`document.getElementById('btnSearchWindow').click()`);
  // The window must actually open — a click on a dead button leaves every
  // later section-D check operating on hidden DOM (a false positive: input
  // value + event dispatch and tab clicks all work with the modal closed).
  check("D window opens from the magnifier button",
    await waitFor(`document.getElementById('searchWindowOverlay').classList.contains('open')`, 5000));
  // The head-row count's slot is reserved at open (reserveWidestText): the
  // count appearing must not shrink the input — capture the wrap width
  // while the count is empty, compare after the first count lands.
  const inputWBefore = await evalJS(`document.querySelector('.search-window-input-wrap').offsetWidth`);
  await evalJS(`(function () {
    var inp = document.getElementById('searchWindowInput');
    inp.value = 'الناس';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await waitFor(`document.getElementById('searchWindowCount').textContent !== ''`, 10000);
  await sleep(300);
  const res = await evalJS(`(function () {
    var h = document.getElementById('searchWindowCount');
    return {
      rows: document.querySelectorAll('.reader-table tbody tr').length,
      rc: h ? h.textContent.trim() : null,
    };
  })()`);
  check("search keeps table rows (incremental render)", res.rows > 0 && res.rows < 6236, JSON.stringify(res));
  check("count appears without shifting the input",
    await evalJS(`document.querySelector('.search-window-input-wrap').offsetWidth`) === inputWBefore,
    String(inputWBefore));
  check("search results render in window", res.rc !== null, res.rc);

  // regex query path — same engine, must yield the identical result set as
  // the plain term. Regression guard: the compiled regex used to carry the
  // `g` flag (default "gi"), making shared .test() calls stateful and
  // silently dropping matches (72/179 «الناس» misses in the imlai column
  // alone, pre-fix); parseQuery now strips `g`/`y`, so the two paths must
  // agree byte-for-byte.
  await evalJS(`(function () {
    var inp = document.getElementById('searchWindowInput');
    inp.value = '/الناس/';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await waitFor(`document.getElementById('searchWindowCount').textContent !== ''`, 10000);
  await sleep(300);
  const resRe = await evalJS(`(function () {
    var h = document.getElementById('searchWindowCount');
    return h ? h.textContent.trim() : null;
  })()`);
  check("regex search matches plain-term count", resRe === res.rc, resRe);

  // whole-word toggle — marks itself active and re-runs the window search
  await evalJS(`document.getElementById('searchWindowWholeWord').click()`);
  await sleep(400);
  const ww = await evalJS(`(function () {
    var btn = document.getElementById('searchWindowWholeWord');
    return {
      active: btn.classList.contains('active'),
      rc: (document.getElementById('searchWindowCount') || {}).textContent || null,
    };
  })()`);
  check("whole-word toggle active + results kept", ww.active && ww.rc !== null, JSON.stringify(ww));

  // advanced conditions — the default condition (first visible text column,
  // "contains", empty value) matches every row, so the count is the book's
  await evalJS(`document.getElementById('searchWindowAdvToggle').click()`);
  await waitFor(`document.getElementById('searchWindowAdvBody').style.display !== 'none'`, 5000);
  check("advanced condition row renders", await evalJS(`!!document.querySelector('#advancedSearchRows .advanced-search-row')`));
  await evalJS(`document.getElementById('btnApplyAdvancedSearch').click()`);
  await waitFor(`document.getElementById('searchWindowCount').textContent !== ''`, 10000);
  const advRc = await evalJS(`(document.getElementById('searchWindowCount') || {}).textContent || ''`);
  check("advanced apply runs (all rows)", advRc.indexOf("6,236") !== -1, advRc);
  await evalJS(`document.getElementById('searchWindowAdvToggle').click()`); // collapse

  // search tips — the Tips button (a full-width labelled option like
  // Advanced, not a compact "?") opens the grammar help stacked over the
  // window; Escape closes the help and the window stays open underneath
  await evalJS(`document.getElementById('searchWindowHelpBtn').click()`);
  await waitFor(`document.getElementById('searchHelpOverlay').classList.contains('open')`, 5000);
  const help = await evalJS(`(function () {
    var tips = document.querySelector('#searchHelpOverlay .modal');
    var win = document.querySelector('#searchWindowOverlay .modal');
    return {
      rows: document.querySelectorAll('#searchHelpBody .search-help-table tbody tr').length,
      terms: document.querySelectorAll('#searchHelpBody .search-help-term').length,
      headers: document.querySelectorAll('#searchHelpBody .search-help-table th').length,
      title: (document.getElementById('searchHelpTitle') || {}).textContent || '',
      btn: (document.getElementById('searchWindowHelpBtn') || {}).textContent || '',
      // shared full-size geometry — a stacked tips sheet narrower than the
      // window reads as a glitch (the one shared rule in common.css)
      tipsW: tips && tips.offsetWidth,
      winW: win && win.offsetWidth,
      // cells inherit the RTL modal direction (no per-cell dir="auto") so
      // the term column aligns on one edge; auto ragged it (Latin terms
      // went LTR/left, Thaana/Arabic went right)
      termDirs: (function () {
        var cells = document.querySelectorAll('#searchHelpBody .search-help-term');
        var d = [];
        for (var i = 0; i < cells.length; i++) d.push(getComputedStyle(cells[i]).direction);
        return d;
      })(),
      // multi-example rows: the phrase row pairs both quote styles, the
      // fuzzy row both marker ends, the wildcard row all positions + the
      // single-letter "?". Examples are one per line (a "·"-style separator
      // would read as syntax — the sheet teaches a leading-dot token).
      phraseEx: document.querySelectorAll('#searchHelpBody tbody tr')[0].querySelector('.search-help-ex').textContent,
      fuzzyEx: document.querySelectorAll('#searchHelpBody tbody tr')[2].querySelector('.search-help-ex').textContent,
      wildEx: document.querySelectorAll('#searchHelpBody tbody tr')[3].querySelector('.search-help-ex').textContent,
      // the name column: a scannable anchor before the syntax column
      names: (function () {
        var cells = document.querySelectorAll('#searchHelpBody .search-help-name');
        var n = [];
        for (var i = 0; i < cells.length; i++) n.push(cells[i].textContent);
        return n;
      })(),
      // third header must render a real label — a missing i18n key renders
      // the raw key name (t() returns the key when absent)
      header3: document.querySelectorAll('#searchHelpBody .search-help-table th')[2].textContent,
      // the table mirrors the dd-table cell idiom (8px 12px padding, panel
      // font size) — computed longhands in top/inline-end/bottom/inline-start
      // order, so the guard reads identically in RTL and LTR
      thPad: (function () {
        var s = getComputedStyle(document.querySelector('#searchHelpBody .search-help-table thead th'));
        return [s.paddingTop, s.paddingInlineEnd, s.paddingBottom, s.paddingInlineStart].join(' ');
      })(),
      // th UA-defaults to centered (browsers center table headers) — the
      // header must be explicitly aligned with its right-aligned rows
      thAlign: (function () {
        return getComputedStyle(document.querySelector('#searchHelpBody .search-help-table thead th')).textAlign;
      })(),
      tdAlign: (function () {
        return getComputedStyle(document.querySelector('#searchHelpBody .search-help-table tbody td')).textAlign;
      })(),
      // the thead wears the shared tabular band (nav-btn-bg bar + 2px
      // divider-ornament — the facet thead / dd-header recipe). The tokens
      // are resolved through a probe element so the guard holds in every
      // theme instead of hardcoding a light-mode colour.
      thBand: (function () {
        var s = getComputedStyle(document.querySelector('#searchHelpBody .search-help-table thead th'));
        var p = document.createElement('span');
        document.body.appendChild(p);
        var root = getComputedStyle(document.documentElement);
        p.style.backgroundColor = root.getPropertyValue('--color-nav-btn-bg');
        var wantBg = getComputedStyle(p).backgroundColor;
        p.style.backgroundColor = root.getPropertyValue('--color-divider-ornament');
        var wantDiv = getComputedStyle(p).backgroundColor;
        document.body.removeChild(p);
        return {
          bg: s.backgroundColor, bb: s.borderBottomWidth, bc: s.borderBottomColor,
          wantBg: wantBg, wantDiv: wantDiv
        };
      })(),
      // the two notes under the table: All-books caveat + normalisation
      note: (document.getElementById('searchHelpNote') || {}).textContent || '',
      normNote: (document.getElementById('searchHelpNormNote') || {}).textContent || '',
    };
  })()`);
  check("search tips: 7 grammar rows render",
    help.rows === 7 && help.terms === 7 && help.headers === 4 && help.title.length > 0 && help.btn.length > 0,
    JSON.stringify(help));
  check("search tips: shares the full-size modal geometry",
    help.tipsW === help.winW && help.tipsW > 400,
    "tips " + help.tipsW + "px vs window " + help.winW + "px");
  check("search tips: term cells align on one edge (all inherit RTL)",
    help.termDirs.length === 7 && help.termDirs.every(function (d) { return d === 'rtl'; }),
    JSON.stringify(help.termDirs));
  check("search tips: name column carries all 7 feature names",
    help.names.length === 7 && help.names.every(function (n) { return n.length > 0; }),
    JSON.stringify(help.names));
  check("search tips: wildcard row shows positions + the single-letter ?",
    help.wildEx.split("\n").length === 4 && help.wildEx.indexOf("?") !== -1, help.wildEx);
  check("search tips: fuzzy row shows the marker at either end",
    help.fuzzyEx.split("\n").length === 2 && help.fuzzyEx.indexOf("~") !== -1, help.fuzzyEx);
  check("search tips: phrase row pairs both quote styles",
    help.phraseEx.indexOf('"') !== -1 && help.phraseEx.indexOf("'") !== -1, help.phraseEx);
  check("search tips: All-books caveat note renders",
    help.note.length > 0, help.note);
  check("search tips: normalisation note renders",
    help.normNote.length > 0, help.normNote);
  check("search tips: Meaning header is a real label, not a raw key",
    help.header3.length > 0 && help.header3.indexOf("searchHelpColMeaning") === -1, help.header3);
  check("search tips: cells carry the dd-table padding rhythm",
    help.thPad === "8px 12px 8px 12px", help.thPad);
  check("search tips: header aligns right with its rows, not UA-centered",
    help.thAlign === 'right' && help.tdAlign === 'right',
    help.thAlign + " vs " + help.tdAlign);
  check("search tips: thead wears the shared tabular band (bar + 2px divider)",
    help.thBand.bg === help.thBand.wantBg && help.thBand.bb === '2px' && help.thBand.bc === help.thBand.wantDiv,
    JSON.stringify(help.thBand));
  await evalJS(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
  await waitFor(`!document.getElementById('searchHelpOverlay').classList.contains('open')`, 5000);
  check("search tips: Escape closes help, window stays",
    await evalJS(`document.getElementById('searchWindowOverlay').classList.contains('open')`));

  // clear → history empty state (the two queries above were recorded).
  // The modal has a FIXED height — a content swap (results → history +
  // placeholder) must not resize the centered window; the rect before and
  // after must be identical. This guards the content-driven-height
  // regression (window jumping when a history term is clicked/removed).
  const rectBeforeClear = await evalJS(`(function () {
    var r = document.querySelector('.search-window-modal').getBoundingClientRect();
    return [r.left, r.top, r.width, r.height].join(',');
  })()`);
  await evalJS(`document.getElementById('searchWindowClear').click()`);
  await waitFor(`document.querySelector('#searchWindowHistory .search-history-item') !== null`, 5000);
  const histCount = await evalJS(`document.querySelectorAll('#searchWindowHistory .search-history-item').length`);
  check("history listed in window", histCount >= 2, String(histCount));
  const rectAfterClear = await evalJS(`(function () {
    var r = document.querySelector('.search-window-modal').getBoundingClientRect();
    return [r.left, r.top, r.width, r.height].join(',');
  })()`);
  check("window does not resize on content swap", rectAfterClear === rectBeforeClear, rectBeforeClear + " → " + rectAfterClear);

  // All-books tab — cross-book search over the shared index, with the
  // scope picker rendered inside the window
  await evalJS(`document.getElementById('searchWindowTabAllBooks').click()`);
  await sleep(200);
  const allTab = await evalJS(`(function () {
    var scope = document.getElementById('searchWindowScope');
    var opts = document.getElementById('searchWindowOptions');
    return {
      active: document.getElementById('searchWindowTabAllBooks').classList.contains('active'),
      scopeShown: scope.style.display !== 'none',
      optsHidden: opts.style.display === 'none',
      summary: document.getElementById('searchWindowScopeSummary').textContent.trim(),
    };
  })()`);
  check("all-books tab: scope section on, options row off",
    allTab.active && allTab.scopeShown && allTab.optsHidden, JSON.stringify(allTab));
  check("all-books tab: scope summary label + caret",
    allTab.summary.length > 1 && allTab.summary.indexOf("▾") !== -1, allTab.summary);

  // type a query → per-book rows with deep links
  await evalJS(`(function () {
    var inp = document.getElementById('searchWindowInput');
    inp.value = 'الناس';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await waitFor(`document.querySelectorAll('#searchWindowResults .search-window-book-link').length > 0`, 15000);
  await sleep(300);
  const allRes = await evalJS(`(function () {
    var links = document.querySelectorAll('#searchWindowResults .search-window-book-link');
    var h = document.getElementById('searchWindowCount');
    return {
      n: links.length,
      href: links.length ? links[0].getAttribute('href') : null,
      rc: h ? h.textContent.trim() : null,
      counts: document.querySelectorAll('#searchWindowResults .search-window-book-count').length,
    };
  })()`);
  check("all-books: per-book rows render",
    allRes.n > 1 && allRes.counts === allRes.n, JSON.stringify(allRes));
  check("all-books: count header lists books + matches",
    allRes.rc !== null && /\d/.test(allRes.rc), allRes.rc);
  check("all-books: deep link shape",
    allRes.href !== null && /^reader\.html\?book=.+&row=\d+&q=/.test(allRes.href), allRes.href);
  const allBookRow = await evalJS(`(function () {
    var link = document.querySelector('#searchWindowResults .search-window-book-link');
    var m = link ? (link.getAttribute('href') || '').match(/book=([^&]+)/) : null;
    return m ? m[1] : null;
  })()`);
  check("all-books: rows carry book codes", allBookRow !== null, allBookRow);

  // the cross-book hop — "open in library page" shows for a cross-book query
  // with a deep-link href carrying the query (and scope when set)
  const hopLink = await evalJS(`(function () {
    var a = document.getElementById('searchWindowOpenPage');
    return a ? { shown: a.style.display !== 'none', href: a.getAttribute('href') } : null;
  })()`);
  check("all-books: open-in-library-page link",
    hopLink !== null && hopLink.shown && /^library-search\.html\?q=/.test(hopLink.href),
    JSON.stringify(hopLink));

  // scope summary → the picker opens in the libScope modal, stacked on top
  // of the window (the window stays open underneath)
  await evalJS(`document.getElementById('searchWindowScopeSummary').click()`);
  await waitFor(`document.querySelectorAll('#libScopeList .lib-scope-row input[type=checkbox]').length > 0`, 5000);
  const scopeModalState = await evalJS(`(function () {
    var m = document.getElementById('libScopeOverlay');
    var w = document.getElementById('searchWindowOverlay');
    return {
      exists: m !== null,
      modalOpen: m !== null && m.classList.contains('open'),
      windowOpen: w !== null && w.classList.contains('open'),
    };
  })()`);
  check("all-books: scope summary opens the libScope modal on top",
    scopeModalState.exists && scopeModalState.modalOpen && scopeModalState.windowOpen,
    JSON.stringify(scopeModalState));
  const scopeListed = await evalJS(`(function () {
    var want = ${JSON.stringify(allBookRow)};
    var cb = null;
    document.querySelectorAll('#libScopeList .lib-scope-row input[type=checkbox]').forEach(function (c) {
      if (c.dataset.book === want) cb = c;
    });
    if (cb) cb.click();
    return !!cb;
  })()`);
  check("all-books: scope list contains the matched book", scopeListed);

  // the scope change re-runs the all-books search — one book → one row
  await waitFor(`document.querySelectorAll('#searchWindowResults .search-window-book-link').length === 1`, 15000);
  const scopedN = await evalJS(`document.querySelectorAll('#searchWindowResults .search-window-book-link').length`);
  check("all-books: scoped search re-runs (1 book)", scopedN === 1, String(scopedN));
  const scopedSum = await evalJS(`document.getElementById('searchWindowScopeSummary').textContent.trim()`);
  check("all-books: summary reflects the scope", scopedSum !== allTab.summary, scopedSum);

  // reset the scope → all books again (reset click fires libScopeChange)
  await evalJS(`document.getElementById('libScopeReset').click()`);
  await waitFor(`document.querySelectorAll('#searchWindowResults .search-window-book-link').length > 1`, 15000);

  // close the scope modal — Escape closes the innermost (the scope modal)
  // first, leaving the window open; the later Escape closes the window
  await evalJS(`(function () {
    document.getElementById('searchWindowInput').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  })()`);
  await waitFor(`!document.getElementById('libScopeOverlay').classList.contains('open')`, 5000);
  check("all-books: Escape closes only the scope modal",
    (await evalJS(`document.getElementById('searchWindowOverlay').classList.contains('open')`)) === true);

  // back to This book — scope section off, options row back
  await evalJS(`document.getElementById('searchWindowTabThisBook').click()`);
  await sleep(200);
  const tb = await evalJS(`(function () {
    return {
      scopeHidden: document.getElementById('searchWindowScope').style.display === 'none',
      optsShown: document.getElementById('searchWindowOptions').style.display !== 'none',
      openPageHidden: document.getElementById('searchWindowOpenPage').style.display === 'none',
    };
  })()`);
  check("this-book tab: scope off, options back", tb.scopeHidden && tb.optsShown && tb.openPageHidden, JSON.stringify(tb));

  // Escape closes the window — unified modal layer handles it
  await evalJS(`(function () {
    document.getElementById('searchWindowInput').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  })()`);
  await waitFor(`!document.getElementById('searchWindowOverlay').classList.contains('open')`, 5000);

  await evalJS("document.getElementById('btnResetSettings').click()");
  await sleep(500);
  const toastR = await evalJS(`(function () {
    var t = document.querySelector('.toast');
    return t && t.textContent ? t.textContent : null;
  })()`);
  check("settings reset no error toast", !toastR || toastR.indexOf("⚠️") === -1, toastR);

  // Arrow-key navigation over the results — real CDP key events (the
  // handler gates on document.activeElement, so the input must be focused).
  // Down moves the .active highlight, clamps at the last row; Up steps
  // back; Enter jumps the page to the selected row and closes the window.
  await evalJS(`document.getElementById('btnSearchWindow').click()`);
  await waitFor(`document.getElementById('searchWindowOverlay').classList.contains('open')`, 5000);
  await evalJS(`(function () {
    var inp = document.getElementById('searchWindowInput');
    inp.value = 'الناس';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await waitFor(`document.querySelectorAll('#searchWindowResults .search-result[data-real]').length > 0`, 10000);
  await sleep(300);
  await evalJS(`document.getElementById('searchWindowInput').focus()`);
  const arrow = async (dir) => {
    const vk = dir === "ArrowDown" ? 40 : 38;
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: dir, code: dir, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: dir, code: dir, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
  };
  const activeState = () => evalJS(`(function () {
    var items = document.querySelectorAll('#searchWindowResults .search-result[data-real]');
    var active = -1;
    for (var i = 0; i < items.length; i++) if (items[i].classList.contains('active')) active = i;
    return { total: items.length, active: active };
  })()`);
  await arrow("ArrowDown");
  await sleep(150);
  const ar1 = await activeState();
  check("arrow Down selects first result", ar1.total > 0 && ar1.active === 0, JSON.stringify(ar1));
  await arrow("ArrowDown");
  await sleep(150);
  const ar2 = await activeState();
  check("arrow Down advances", ar2.active === 1, JSON.stringify(ar2));
  await arrow("ArrowUp");
  await sleep(150);
  const ar3 = await activeState();
  check("arrow Up steps back", ar3.active === 0, JSON.stringify(ar3));
  for (let i = 0; i < ar1.total + 5; i++) { await arrow("ArrowDown"); await sleep(40); }
  await sleep(200);
  const ar4 = await activeState();
  check("arrow Down clamps at last result", ar4.active === ar4.total - 1, JSON.stringify(ar4));
  const yBefore = await evalJS(`window.scrollY`);
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
  await sleep(600);
  const jump = await evalJS(`(function () {
    return { open: document.getElementById('searchWindowOverlay').classList.contains('open'), scrollY: window.scrollY };
  })()`);
  check("Enter jumps to the row and closes the window",
    !jump.open && jump.scrollY > 0, JSON.stringify({ yBefore: yBefore, after: jump }));

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

  // ── F. Thaana text-inset guard ──────────────────────────────────────
  // The Hadithmv webfont paints ~1–5px of start-side ink past the pen
  // origin on horizontal Thaana letters (ސ, ޗ, …). Every overflow-hidden /
  // ellipsis / line-clamp surface without a start inset visibly chips the
  // first glyph: divs need padding-inline-start (they clip at the padding
  // box), inputs need text-indent (the inner editor clips at the content
  // box, so padding only moves the clip with the text). If a CSS sweep
  // drops an inset, the computed styles here go stale. Background and the
  // surface list: docs/TESTING.md "Known non-errors", docs/ARCHITECTURE.md
  // "Font".
  console.log("== F. Thaana text-inset guard ==");
  await goto(ROOT + "reader.html?book=QRN-hadithmv");
  await waitFor(`(function () {
    var w = document.getElementById('readerWrapper');
    return w && getComputedStyle(w).display === 'block';
  })()`);
  const insets = await evalJS(`(function () {
    // pageTitle shelters the overflow clip on narrow screens
    var pt = getComputedStyle(document.getElementById('pageTitle')).paddingInlineStart;
    // open the surah selector for a live .quran-surah-search, then close
    document.getElementById('qrnSurahBtn').click();
    var ov = document.getElementById('qrnSurahOverlay');
    var ti = getComputedStyle(ov).display !== 'none'
      ? getComputedStyle(document.getElementById('qrnSurahSearch')).textIndent : null;
    document.getElementById('qrnSurahClose').click();
    // probe elements with the real classes — computed style only, then removed
    var wrap = document.createElement('div');
    var item = document.createElement('div'); item.className = 'search-history-item';
    var ht = document.createElement('span'); ht.className = 'hist-text'; ht.textContent = 'ސ';
    item.appendChild(ht);
    var sn = document.createElement('div'); sn.className = 'search-result-snippet'; sn.textContent = 'ޗ';
    wrap.appendChild(item); wrap.appendChild(sn);
    document.body.appendChild(wrap);
    var htPad = getComputedStyle(ht).paddingInlineStart;
    var snPad = getComputedStyle(sn).paddingInlineStart;
    wrap.remove();
    return { pt: pt, ti: ti, htPad: htPad, snPad: snPad };
  })()`);
  check("pageTitle start inset 8px", insets.pt === "8px", insets.pt);
  check("quran-surah-search text-indent 6px", insets.ti === "6px", String(insets.ti));
  check("hist-text start padding 6px", insets.htPad === "6px", insets.htPad);
  check("result-snippet start padding 8px", insets.snPad === "8px", insets.snPad);
  // The surah selector's search rides the shared search-input-wrap, so its
  // ✕ clear button mirrors on the query and restores the list — the
  // unification sweep ("no search box without a ✕") pinned here so a future
  // component rewrite can't drop it.
  await evalJS(`document.getElementById('qrnSurahBtn').click()`);
  // The total BEFORE the query filters the list — the restored-count target
  const surahTotal = await evalJS(`document.querySelectorAll('.quran-surah-item').length`);
  await evalJS(`(function () {
    var f = document.getElementById('qrnSurahSearch');
    f.value = 'ب';
    f.dispatchEvent(new Event('input'));
  })()`);
  await waitFor(`document.getElementById('qrnSurahSearchClear').classList.contains('visible')`);
  await evalJS(`document.getElementById('qrnSurahSearchClear').click()`);
  check("surah ✕ clears the box, restores the list, re-focuses", await waitFor(`(function () {
    var f = document.getElementById('qrnSurahSearch');
    return f.value === ''
      && !document.getElementById('qrnSurahSearchClear').classList.contains('visible')
      && document.querySelectorAll('.quran-surah-item').length === ${surahTotal}
      && document.activeElement === f;
  })()`), await evalJS(`document.getElementById('qrnSurahSearch').value`));
  await evalJS(`document.getElementById('qrnSurahClose').click()`);
  // dash-continue-title: mobile-only recipe (dashboard.css ≤600px) — the
  // continue row stays one line, the title ellipsizes, and the clipped
  // Thaana keeps its 6px start inset. Probed with synthetic elements at a
  // narrow viewport (the continue card needs reading history to exist).
  await send("Emulation.setDeviceMetricsOverride", { width: 480, height: 800, deviceScaleFactor: 1, mobile: false });
  await goto(ROOT + "index.html");
  await waitFor(`!!document.getElementById('dashboardWrapper')`);
  const cont = await evalJS(`(function () {
    var w = document.createElement('div');
    var c = document.createElement('div'); c.className = 'dash-continue';
    var t = document.createElement('span'); t.className = 'dash-continue-title'; t.textContent = 'ޗ';
    c.appendChild(t); w.appendChild(c); document.body.appendChild(w);
    var pad = getComputedStyle(t).paddingInlineStart;
    var wrap = getComputedStyle(c).flexWrap;
    var ovf = getComputedStyle(t).overflow;
    var ell = getComputedStyle(t).textOverflow;
    w.remove();
    return { pad: pad, wrap: wrap, ovf: ovf, ell: ell };
  })()`);
  check("mobile: dash-continue one row, title ellipsized + 6px inset",
    cont.wrap === "nowrap" && cont.ovf === "hidden" && cont.ell === "ellipsis" && cont.pad === "6px",
    cont.wrap + " / " + cont.ovf + " / " + cont.ell + " / " + cont.pad);
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

  // ── G. Completion discipline: a btnLast jump must not celebrate ─────
  // Navigation is not reading: the last-page button lands at the bottom
  // with the jump marker armed (a layout-settle event must stay muted),
  // and scrolling up a bit afterwards leaves pct at 100 (the last ~30 rows
  // round to it) while the milestone marker sits at 0 — the next event
  // used to celebrate "finished" (green .done bar + .completion-border
  // ring + toast) while moving AWAY from the end. Genuine reading to the
  // bottom must still celebrate.
  console.log("== G. completion discipline ==");
  await goto(ROOT + "reader.html?book=QRN-hadithmv");
  await waitFor(`document.getElementById('btnLast')`);
  await evalJS(`document.getElementById('btnLast').click()`);
  await waitFor(`window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 1`, 15000);
  await sleep(300);
  const afterJump = await evalJS(`(function () {
    var f = document.getElementById('readerProgressFill');
    return { ring: !!document.querySelector('.completion-border'), done: f.classList.contains('done') };
  })()`);
  check("last-page jump lands at the bottom without celebrating",
    afterJump.ring === false && afterJump.done === false, JSON.stringify(afterJump));
  // the reported repro: scroll up a bit — two nudges, then nothing must fire
  await evalJS(`scrollBy(0, -120)`);
  await sleep(250);
  await evalJS(`scrollBy(0, -120)`);
  await sleep(250);
  const afterUp = await evalJS(`(function () {
    var f = document.getElementById('readerProgressFill');
    return { ring: !!document.querySelector('.completion-border'), done: f.classList.contains('done'),
      y: Math.round(window.scrollY) };
  })()`);
  check("scrolling up after the jump does not celebrate",
    afterUp.ring === false && afterUp.done === false, JSON.stringify(afterUp));
  // positive control: a genuine scroll to the bottom still celebrates
  await evalJS(`scrollTo(0, document.documentElement.scrollHeight)`);
  await waitFor(`!!document.querySelector('.completion-border')`, 5000);
  const afterBottom = await evalJS(`(function () {
    var f = document.getElementById('readerProgressFill');
    return { ring: !!document.querySelector('.completion-border'), done: f.classList.contains('done') };
  })()`);
  check("genuine read to the bottom still celebrates",
    afterBottom.ring === true && afterBottom.done === true, JSON.stringify(afterBottom));

  ws.close();
  edge.kill();
  console.log(failures ? "== " + failures + " FAILURES ==" : "== ALL PASS ==");
  process.exit(failures ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
