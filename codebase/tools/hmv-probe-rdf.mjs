// TEMPORARY probe for the RDF family work (codes RDF-all/RDF-misc/HDT-misc,
// filtered search, rasmee tint, thousands separators). Delete after running.
// Run: node tools/hmv-probe-rdf.mjs  (from codebase/). Requires Node 20.11+
// and Microsoft Edge. Env overrides: HMV_PROBE_PORT (default 9354),
// HMV_PROBE_PROFILE (default %TEMP%\hmv-probe-rdf-profile).
import fs from "fs";
import path from "path";
import { spawn, execSync } from "child_process";
import { pathToFileURL } from "url";

const { parseCSV } = await import(pathToFileURL(path.join(import.meta.dirname, "..", "js", "csv.js")));
const { formatThousands } = await import(pathToFileURL(path.join(import.meta.dirname, "..", "js", "search-utils.js")));
const { parseQuery, compileQuery, buildNormData, rowMatchesQueryNorm } = await import(pathToFileURL(path.join(import.meta.dirname, "..", "js", "search-utils.js")));

// ── expected values straight from the data files (app's own parser) ──
const baseDir = import.meta.dirname.replace(/\\/g, "/");
const ROOT = baseDir + "/../books/";
const DATA = baseDir + "/../data/";
const PORT = process.env.HMV_PROBE_PORT ? parseInt(process.env.HMV_PROBE_PORT, 10) : 9354;
// Unique per run — a crashed run may leave the browser alive holding its
// profile; a fresh profile sidesteps the lock entirely.
const PROFILE = process.env.HMV_PROBE_PROFILE || (process.env.TEMP + "\\hmv-probe-rdf-profile-" + Date.now());
// Self-heal: kill any leftover probe Edge still listening on PORT (only our
// spawned browser ever binds it). Best-effort; the unique profile covers us.
function killLeftover() {
  try {
    const out = execSync('netstat -ano | findstr ":' + PORT + '"', { encoding: "utf8" });
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      if (line.indexOf("LISTENING") !== -1) {
        const pid = line.trim().split(/\s+/).pop();
        if (pid && /^\d+$/.test(pid)) pids.add(pid);
      }
    }
    for (const pid of pids) {
      try { execSync("taskkill /PID " + pid + " /F /T", { stdio: "ignore" }); console.log("  (killed leftover probe Edge PID " + pid + ")"); } catch (e) { /* already gone */ }
    }
  } catch (e) { /* no listener yet */ }
}
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? "PASS  " : "FAIL  ") + name + (detail !== undefined ? "   [" + String(detail).slice(0, 160) + "]" : ""));
  if (!cond) failures++;
}

const rows02 = parseCSV(fs.readFileSync(DATA + "02-registry-bookMeta.csv", "utf8"));
const rows02Header = rows02.shift();
// Column resolved by header name, not position — 02's layout may grow
// (authorCode sits after bookCode; version is always last).
const TITLE_DV_COL = rows02Header.indexOf("titleDV");
const title = (code) => { const r = rows02.find((x) => x[0] === code); return r ? r[TITLE_DV_COL] : ""; };

const src = fs.readFileSync(baseDir + "/../js/radheef-merge.js", "utf8");
const m = src.match(/MERGED_SOURCES\s*=\s*\[([\s\S]*?)\]/);
const CODES = [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
const HEADERS = ["wordAR", "wordDV", "wordEN", "meanAR", "meanDV", "meanEN", "source"];
const merged = [];
for (const code of CODES) {
  const rows = parseCSV(fs.readFileSync(DATA + "content/" + code + ".csv", "utf8"));
  const hdr = rows.shift();
  const idx = {}; hdr.forEach((h, i) => (idx[h] = i));
  const t = title(code) || code;
  for (const r of rows) {
    const tgt = HEADERS.map((n) => { const i = idx[n]; return i !== undefined ? (r[i] || "") : ""; });
    tgt[6] = t;
    merged.push(tgt);
  }
}
// 0-based block boundaries: first row of each block
const blockStart = {};
{
  let at = 0;
  for (const code of CODES) { blockStart[code] = at; at += merged.filter((r) => r[6] === (title(code) || code)).length; }
}
const rasmeeTitle = title("RDF-rasmee");
const F = (code) => blockStart[code]; // first 0-based row of block

// ކަން match list over the merged book (app's own matcher)
const norm = buildNormData(merged);
const FILTER_Q = "ކަން";
const filtCompiled = compileQuery(parseQuery(FILTER_Q));
const filtMatchIdx = [];
for (let i = 0; i < merged.length; i++) if (rowMatchesQueryNorm(merged[i], norm[i], filtCompiled)) filtMatchIdx.push(i);
const firstMatchCells = merged[filtMatchIdx[0]];

// QRN-bakurube ކަން count (dropdown count-header comma check)
const qrn = parseCSV(fs.readFileSync(DATA + "content/QRN-bakurube.csv", "utf8"));
qrn.shift();
const qrnNorm = buildNormData(qrn);
const qrnCompiled = compileQuery(parseQuery(FILTER_Q));
let qrnCount = 0;
for (let i = 0; i < qrn.length; i++) if (rowMatchesQueryNorm(qrn[i], qrnNorm[i], qrnCompiled)) qrnCount++;

// decode() mirrors what the renderer's raw-innerHTML produces: textContent
// of a rendered cell == decode(raw cell) (br -> newline, tags stripped,
// entities decoded).
function decodeCell(s) {
  return String(s)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)));
}

// ── formatThousands unit checks ──────────────────────────────────────
check("fmt 0", formatThousands("0") === "0");
check("fmt 999", formatThousands("999") === "999");
check("fmt 1000", formatThousands("1000") === "1,000");
check("fmt 1234567", formatThousands("1234567") === "1,234,567");
check("fmt 13012", formatThousands("13012") === "13,012");
check("fmt 152612", formatThousands("152612") === "152,612");
check("fmt passthrough", formatThousands("abc") === "abc" && formatThousands("12a") === "12a" && formatThousands("") === "");
check("fmt number input", formatThousands(1000) === "1,000");

// ── headless Edge ────────────────────────────────────────────────────
async function main() {
  killLeftover();
  fs.rmSync(PROFILE, { recursive: true, force: true });
  const edge = spawn(EDGE, [
    "--headless=new", "--disable-gpu", "--no-first-run",
    "--allow-file-access-from-files",
    "--user-data-dir=" + PROFILE,
    "--remote-debugging-port=" + PORT,
    "about:blank",
  ], { stdio: "ignore" });

  try {
  let target = null;
  for (let i = 0; i < 60; i++) {
    try {
      const list = JSON.parse(await (await fetch("http://127.0.0.1:" + PORT + "/json")).text());
      target = list.find((t) => t.type === "page");
      if (target) break;
    } catch (e) { /* not up yet */ }
    await sleep(200);
  }
  if (!target) { console.log("NO_TARGET"); return false; }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const pageErrors = [];
  ws.onmessage = (ev) => {
    const mm = JSON.parse(ev.data);
    if (mm.id && pending.has(mm.id)) { pending.get(mm.id)(mm); pending.delete(mm.id); }
    if (mm.method === "Runtime.exceptionThrown") {
      pageErrors.push((mm.params.exceptionDetails.exception && mm.params.exceptionDetails.exception.description || mm.params.exceptionDetails.text || "?").split("\n")[0]);
    }
    if (mm.method === "Runtime.consoleAPICalled" && mm.params.type === "error") {
      pageErrors.push("console.error: " + mm.params.args.map((a) => a.value || a.description || "").join(" ").slice(0, 200));
    }
  };
  await new Promise((r) => (ws.onopen = r));
  const send = (method, params = {}) =>
    new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send("Runtime.enable");

  async function evalJS(expr) {
    const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.result && r.result.exceptionDetails) {
      const d = r.result.exceptionDetails.exception;
      throw new Error("EXC: " + (d && d.description ? d.description : r.result.exceptionDetails.text));
    }
    return r.result.result.value;
  }
  async function waitFor(expr, timeoutMs = 30000) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
      if (await evalJS(expr)) return true;
      await sleep(200);
    }
    return false;
  }
  async function goto(url, width, height) {
    await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    await send("Page.navigate", { url });
    await evalJS(`new Promise((res) => {
      const t0 = Date.now();
      (function poll() {
        if (document.readyState === 'complete' && document.body && document.body.children.length > 2) return res(true);
        if (Date.now() - t0 > 20000) return res(false);
        setTimeout(poll, 100);
      })();
    })`);
    await sleep(300);
    // bringToFront: without it headless pages get no BeginFrames — IO/scroll
    // callbacks stall at rendering boundaries, and clicks racing a poll can
    // land mid-callback (T1b's btnFirst/btnPrev went dead without this).
    await send("Page.bringToFront").catch(function () {});
    await sleep(400);
  }
  async function noErrorToast(name) {
    const toast = await evalJS(`(function () {
      var t = document.querySelector('.toast');
      return t ? t.textContent : "";
    })()`);
    check(name, toast.indexOf("⚠️") === -1, toast);
  }
  async function typeQuery(q) {
    await evalJS(`(function () {
      var el = document.getElementById('readerSearchInput');
      el.value = ${JSON.stringify(q)};
      el.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    await sleep(900); // 120ms debounce + render
  }
  async function typeWindowQuery(q) {
    await evalJS(`(function () {
      var el = document.getElementById('searchWindowInput');
      el.value = ${JSON.stringify(q)};
      el.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    await sleep(900); // 120ms debounce + render
  }
  async function closeSearchWindow() {
    await evalJS(`(function () {
      var inp = document.getElementById('searchWindowInput');
      inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    })()`);
    await waitFor(`!document.getElementById('searchWindowOverlay').classList.contains('open')`, 5000);
  }
  async function readRow(i) {
    // decoded cells of tr[data-row=i] (table view) or chunk data-row (card)
    return await evalJS(`(function () {
      var tr = document.querySelector('[data-row="${i}"]');
      if (!tr) return null;
      return Array.prototype.map.call(tr.children, function (td) { return td.textContent; });
    })()`);
  }

  // ══ T1: RDF-all loads, table view, correct first block ══
  await goto(ROOT + "reader.html?book=RDF-all", 1280, 800);
  check("T1 table view", await waitFor(`!!document.querySelector('.reader-table tbody tr')`), "no table rows");
  check("T1 no error toast", await evalJS(`(function(){var t=document.querySelector('.toast');return !t||t.textContent.indexOf('⚠️')===-1})()`));
  const row0 = await readRow(0);
  check("T1 first row = rasmee block", row0 && row0[6] === title("RDF-rasmee"), row0 && row0[6]);
  const stripText = await evalJS(`document.getElementById('readerPageNumbers').textContent`);
  check("T1 page strip comma total", stripText.indexOf("152,612") !== -1, stripText);

  // ── T1b/T1c: pagination buttons + far-jump windowing + scroll-up ──
  // Regression guards: (1) every button used to map to the last row — the
  // delta check tested indexOf("first")===0 against btn* ids, so all four
  // fell through to 1e9; (2) far jumps chunked through every row — a 13s
  // freeze and the whole 152k-row book in the DOM on RDF-all. The fix:
  // explicit ids + goTo rebuilds a ~400-row window around the target.
  // Assert the WINDOW (which row it spans), not the strip — the smooth
  // scrollIntoView animation never advances in headless (throttled rAF), so
  // scroll-driven strip updates can't settle there.
  const btnRes = await evalJS(`(async function () {
    var windowInfo = function () {
      var rows = document.querySelectorAll('.reader-chunk');
      return { first: rows[0] ? rows[0].dataset.row : null, count: rows.length, hasLast: !!document.querySelector('tr[data-row="152611"]') };
    };
    var t0 = performance.now();
    document.getElementById('btnNext').click();
    var nextMs = Math.round(performance.now() - t0);
    var next = windowInfo();
    var t1 = performance.now();
    document.getElementById('btnLast').click();
    var lastMs = Math.round(performance.now() - t1);
    var last = windowInfo();
    // T1c: scroll-up from the mid-book (end) window must prepend earlier rows
    var se = document.scrollingElement;
    document.documentElement.style.scrollBehavior = "auto";
    se.scrollTop = 100;
    await new Promise(function (r) { var t0 = Date.now(); (function poll() {
      if (document.querySelectorAll('.reader-chunk').length > last.count || Date.now() - t0 > 5000) return r();
      setTimeout(poll, 100);
    })(); });
    var rows = document.querySelectorAll('.reader-chunk');
    var up = { count: rows.length, firstRow: rows[0].dataset.row, y: Math.round(se.scrollTop) };
    document.getElementById('btnFirst').click();
    var first = windowInfo();
    document.getElementById('btnPrev').click();
    var prev = windowInfo();
    return JSON.stringify({ nextMs: nextMs, next: next, lastMs: lastMs, last: last, up: up, first: first, prev: prev });
  })()`);
  const B = JSON.parse(btnRes);
  check("T1b btnNext stays near start", B.next.first === "0" && B.next.count <= 700, btnRes);
  check("T1b btnLast targets the end", B.last.hasLast && B.last.first !== undefined && parseInt(B.last.first, 10) > 152000, btnRes);
  check("T1b btnLast windowed DOM (≤700 rows)", B.last.count <= 700, btnRes);
  check("T1b btnLast fast (<2s)", B.lastMs < 2000, btnRes);
  check("T1c scroll-up grows window", B.up.count > B.last.count, btnRes);
  check("T1c window extended upward", B.up.firstRow !== undefined && parseInt(B.up.firstRow, 10) < 152411, btnRes);
  // Anchoring: the inserted chunk height (~1,000–3,000px) must be added to
  // the scroll position, not snapped back to the window top (~100).
  check("T1c viewport anchored (no snap)", B.up.y > 1000, btnRes);
  check("T1b btnFirst returns to start", B.first.first === "0" && B.first.count <= 700, btnRes);
  check("T1b btnPrev stays near start", B.prev.first === "0" || parseInt(B.prev.first, 10) <= 2, btnRes);

  // ── T1d: RDF-all at the bottom — no completion celebration ──
  // Reference books don't get milestone toasts or the completion ring
  // (green .done bar + flashing border): the progress bar still fills,
  // but nothing celebrates. Guards reader-position.js's milestonesEnabled.
  const botRes = await evalJS(`(async function () {
    var toast = document.querySelector('.toast');
    if (toast) toast.remove();
    var se = document.scrollingElement;
    document.documentElement.style.scrollBehavior = "auto";
    // The previous clicks' last smooth scrollIntoView may still be running —
    // an instant scrollTop assignment does NOT cancel it in headless, and the
    // animation's next frame drags the position back mid-jump. Wait for 100ms
    // of stillness first, then jump.
    var last = -1, stableSince = Date.now(), tEnd = Date.now() + 10000;
    while (Date.now() - stableSince < 100 && Date.now() < tEnd) {
      var y = se.scrollTop;
      if (y !== last) { last = y; stableSince = Date.now(); }
      await new Promise(function (r) { setTimeout(r, 40); });
    }
    se.scrollTop = 0;
    se.scrollTop = se.scrollHeight;
    await new Promise(function (r) { setTimeout(r, 300); });
    var fill = document.getElementById('readerProgressFill');
    return JSON.stringify({
      border: !!document.querySelector('.completion-border'),
      done: fill ? fill.classList.contains('done') : null,
      fillW: fill ? fill.style.width : null,
      toast: (document.querySelector('.toast') || {}).textContent || ""
    });
  })()`);
  const D = JSON.parse(botRes);
  check("T1d RDF bottom: no completion border", !D.border, botRes);
  check("T1d RDF bottom: progress not .done", !D.done, botRes);
  check("T1d RDF bottom: progress still fills", D.fillW !== null && parseInt(D.fillW, 10) > 90, botRes);
  check("T1d RDF bottom: no completion toast", D.toast.indexOf("100%") === -1, botRes);

  // ══ T9: programmatic jump never celebrates; natural arrival does ══
  // On a non-Radheef book (milestones enabled): a btnLast jump lands with
  // no completion toast, no .done bar, no border ring — milestones
  // celebrate READING, not navigation (reader-position.js
  // noteProgrammaticJump). A natural scroll to the bottom afterwards
  // still celebrates.
  await goto(ROOT + "reader.html?book=HDT-misc", 1280, 800);
  check("T9 HDT-misc loads", await waitFor(`!!document.querySelector('.reader-chunk')`), "no rows");
  const T9 = await evalJS(`(async function () {
    document.getElementById('btnLast').click();
    var se = document.scrollingElement;
    // wait for the jump's smooth scroll to settle (100ms of stillness)
    var last = -1, stableSince = Date.now(), tEnd = Date.now() + 10000;
    while (Date.now() - stableSince < 100 && Date.now() < tEnd) {
      var y = se.scrollTop;
      if (y !== last) { last = y; stableSince = Date.now(); }
      await new Promise(function (r) { setTimeout(r, 40); });
    }
    var after = {
      border: !!document.querySelector('.completion-border'),
      done: document.getElementById('readerProgressFill').classList.contains('done'),
      toast: (document.querySelector('.toast') || {}).textContent || ""
    };
    // natural arrival: back to the top, then scroll to the very bottom
    document.documentElement.style.scrollBehavior = "auto";
    se.scrollTop = 0;
    await new Promise(function (r) { setTimeout(r, 100); });
    se.scrollTop = se.scrollHeight;
    await new Promise(function (r) { setTimeout(r, 300); });
    var natural = {
      border: !!document.querySelector('.completion-border'),
      done: document.getElementById('readerProgressFill').classList.contains('done'),
      toast: (document.querySelector('.toast') || {}).textContent || ""
    };
    return JSON.stringify({ after: after, natural: natural });
  })()`);
  const T9R = JSON.parse(T9);
  check("T9 jump to last page: no celebration", !T9R.after.border && !T9R.after.done && T9R.after.toast.indexOf("100%") === -1, T9);
  check("T9 natural bottom scroll: celebrates", T9R.natural.border && T9R.natural.done, T9);

  // ══ T2: block boundaries via ?row= deep links (1-based) ══
  async function atRow(rowNum) {
    await goto(ROOT + "reader.html?book=RDF-all&row=" + rowNum, 1280, 800);
    return await waitFor(`!!document.querySelector('tr[data-row="${rowNum - 1}"]')`);
  }
  await atRow(F("RDF-misc") + 1);
  check("T2 misc block starts", (await readRow(F("RDF-misc")))[6] === title("RDF-misc"), (await readRow(F("RDF-misc"))) && (await readRow(F("RDF-misc")))[6]);
  await atRow(F("RDF-rasmee") + 1);
  check("T2 rasmee block starts", (await readRow(F("RDF-rasmee")))[6] === rasmeeTitle);
  await atRow(F("RDF-W2W-bakurube") + 1);
  check("T2 W2W block starts", (await readRow(F("RDF-W2W-bakurube")))[6] === title("RDF-W2W-bakurube"));

  // ══ T3: rasmee tint + muted source (table view) ══
  // Rasmee leads the merged book (MERGED_SOURCES), so its block spans rows
  // 0..53840. Row 0's checks run first — then a deep link into fahmy's
  // block (the next block) for the no-tint check: incremental rendering
  // only materializes rows near the navigated target, so row 53841 only
  // exists in the DOM after navigating to it.
  await atRow(F("RDF-rasmee") + 1);
  const clsRasmee = await evalJS(`document.querySelector('tr[data-row="${F("RDF-rasmee")}"]').className`);
  check("T3 rasmee row has merged-row-rasmee", clsRasmee.indexOf("merged-row-rasmee") !== -1, clsRasmee);
  // The tint is the site's one content wash (--color-wash-bg, shared with
  // the AR regions/cells) — derive the expected value from the app via a
  // probe element instead of hardcoding a theme color.
  const tintBg = await evalJS(`(function () {
    var probe = document.createElement('div');
    probe.style.background = 'var(--color-wash-bg)';
    document.body.appendChild(probe);
    var expected = getComputedStyle(probe).backgroundColor;
    probe.remove();
    var bg = getComputedStyle(document.querySelector('tr[data-row="${F("RDF-rasmee")}"] td.td-source')).backgroundColor;
    return JSON.stringify({ expected: expected, bg: bg });
  })()`);
  const T3B = JSON.parse(tintBg);
  check("T3 rasmee row uses the unified wash", T3B.expected !== "rgba(0, 0, 0, 0)" && T3B.bg === T3B.expected, tintBg);
  const sizes = await evalJS(`(function () {
    var tr = document.querySelector('tr[data-row="${F("RDF-rasmee")}"]');
    var src = tr.querySelector('td.td-source');
    return [getComputedStyle(src).fontSize, getComputedStyle(tr.children[1]).fontSize];
  })()`);
  check("T3 source col smaller", sizes[0] && sizes[1] && parseFloat(sizes[0]) < parseFloat(sizes[1]), sizes.join(" vs "));
  await atRow(F("RDF-ahmadFahmyDidi") + 1);
  const clsNext = await evalJS(`document.querySelector('tr[data-row="${F("RDF-ahmadFahmyDidi")}"]').className`);
  check("T3 first non-rasmee row has no tint", clsNext.indexOf("merged-row-rasmee") === -1, clsNext);

  // ══ T4: filtered search (table view, 1280px) ══
  await goto(ROOT + "reader.html?book=RDF-all", 1280, 800);
  await waitFor(`!!document.querySelector('.reader-table tbody tr')`);
  await typeQuery(FILTER_Q);
  // The results dropdown is gone — search moved into the modal window; the
  // RDF header input keeps its in-place filter with no dropdown behind it.
  check("T4 no dropdown element for RDF", await evalJS(`document.getElementById('searchResultsDropdown') === null`));
  const f0 = await readRow(0);
  let cellsMatch = !!f0 && f0.length === 7;
  for (let c = 0; c < 7 && cellsMatch; c++) cellsMatch = f0[c] === decodeCell(firstMatchCells[c]);
  check("T4 first filtered row = expected first match", cellsMatch, f0 && f0[6]);
  // counter shows match count (table mode: scroll event on window may not fire — skip here, T6 covers card)
  await evalJS(`document.getElementById('readerSearchClear').click()`);
  await sleep(500);
  const cleared = await readRow(0);
  check("T4 clear restores all rows", cleared && cleared[6] === title("RDF-rasmee"), cleared && cleared[6]);
  await typeQuery("ޚޚޚޚޚ");
  check("T4 zero matches -> empty state", await waitFor(`!!document.querySelector('#readerContent .empty-state')`));
  await evalJS(`document.getElementById('readerSearchClear').click()`);
  await sleep(500);
  const afterClear = await readRow(0);
  check("T4 clear after zero matches restores", afterClear && afterClear[6] === title("RDF-rasmee"));

  // ══ T5: ?q= deep link filters on load ══
  await goto(ROOT + "reader.html?book=RDF-all&q=" + encodeURIComponent(FILTER_Q), 1280, 800);
  await waitFor(`!!document.querySelector('.reader-table tbody tr')`);
  const dq0 = await readRow(0);
  let dqMatch = !!dq0 && dq0.length === 7;
  for (let c = 0; c < 7 && dqMatch; c++) dqMatch = dq0[c] === decodeCell(firstMatchCells[c]);
  check("T5 ?q= filters on load", dqMatch, dq0 && dq0[6]);
  check("T5 no dropdown element for RDF", await evalJS(`document.getElementById('searchResultsDropdown') === null`));
  check("T5 no error toast", await evalJS(`(function(){var t=document.querySelector('.toast');return !t||t.textContent.indexOf('⚠️')===-1})()`));

  // ══ T7 (before the heavy card-mode renders): non-RDF books search in
  // the modal window — results there, table untouched (regression) ══
  async function forceTableMode() {
    // Fresh profiles boot in card mode for non-radheef books (reader.js:95)
    await evalJS("(function () { var b = document.getElementById('btnViewMode'); if (b) b.click(); })()");
    await waitFor(`getComputedStyle(document.getElementById('viewModeDropdown')).display === 'block'`, 5000);
    await evalJS(`(function () {
      var o = document.querySelector('#viewModeDropdown .view-mode-option[data-mode="table"]');
      if (o) o.click();
    })()`);
    return waitFor(`document.querySelectorAll('.reader-table tbody tr').length > 0`, 15000);
  }
  async function firstRowText() {
    return await evalJS(`(function () {
      var tr = document.querySelector('.reader-table tbody tr');
      return tr ? tr.textContent : null;
    })()`);
  }
  await goto(ROOT + "reader.html?book=QRN-bakurube", 1280, 800);
  await waitFor(`(function () {
    var w = document.getElementById('readerWrapper');
    return w && getComputedStyle(w).display === 'block';
  })()`);
  check("T7 table present", await forceTableMode());
  const before = await firstRowText();
  await evalJS(`document.getElementById('btnSearchWindow').click()`);
  check("T7 window opens from the button",
    await waitFor(`document.getElementById('searchWindowOverlay').classList.contains('open')`, 5000));
  await typeWindowQuery(FILTER_Q);
  const countHeader = await evalJS(`document.getElementById('searchWindowCount').textContent`);
  check("T7 count header has comma 2,624", countHeader.indexOf("2,624") !== -1, countHeader.slice(0, 60));
  const afterQ = await firstRowText();
  check("T7 table not filtered by window search", before !== null && before === afterQ, "");
  const label1 = await evalJS(`(function () {
    var el = document.querySelector('#searchWindowResults .search-result .search-result-num');
    return el ? el.textContent : null;
  })()`);
  check("T7 result label #1", label1 === "#1", label1);
  await closeSearchWindow();

  // ══ T7b: RDF — window jump clears a stale header filter ══
  // The in-place header filter and the window coexist (Phase 2): with the
  // filter active, a window search + jump must clear the header box (the
  // target row may not be in the filtered subset) and land on the match.
  // NOTE: the filtered view stamps data-row by position within the matches
  // array, so the window's data-real (global allData index) is compared
  // against filtMatchIdx[0] computed in Node — never against the filtered
  // row's data-row.
  await goto(ROOT + "reader.html?book=RDF-all", 1280, 800);
  check("T7b RDF table boots", await waitFor(`!!document.querySelector('.reader-table tbody tr')`), "no table rows");
  await typeQuery(FILTER_Q);
  check("T7b header filter active", await evalJS(`document.getElementById('readerSearchInput').value === ${JSON.stringify(FILTER_Q)}`), "");
  await evalJS(`document.getElementById('btnSearchWindow').click()`);
  check("T7b window opens from the button",
    await waitFor(`document.getElementById('searchWindowOverlay').classList.contains('open')`, 5000));
  await typeWindowQuery(FILTER_Q);
  const windowFirstReal = await evalJS(`(function () {
    var el = document.querySelector('#searchWindowResults .search-result');
    return el ? el.dataset.real : null;
  })()`);
  check("T7b window first match = global first match", String(windowFirstReal) === String(filtMatchIdx[0]), windowFirstReal + " vs " + filtMatchIdx[0]);
  await evalJS(`document.querySelector('#searchWindowResults .search-result').click()`);
  await waitFor(`document.getElementById('readerSearchInput').value === ''`, 5000);
  check("T7b jump cleared stale filter box", await evalJS(`document.getElementById('readerSearchInput').value === ''`), "");
  check("T7b jump landed on the match", await waitFor(`!!document.querySelector('[data-row="${filtMatchIdx[0]}"]')`, 5000), filtMatchIdx[0]);
  check("T7b window closed after jump", await evalJS(`!document.getElementById('searchWindowOverlay').classList.contains('open')`), "");

  // ══ T6: card mode — rasmee tint, commas in scroll counter ══
  await goto(ROOT + "reader.html?book=RDF-all&row=" + (F("RDF-rasmee") + 1), 400, 800);
  check("T6 card mode", await waitFor(`!!document.querySelector('.reader-chunk[data-row="${F("RDF-rasmee")}"]')`));
  const cardInfo = await evalJS(`(function () {
    var chunk = document.querySelector('.reader-chunk[data-row="${F("RDF-rasmee")}"]');
    if (!chunk) return null;
    var srcField = chunk.querySelector('.reader-field-source');
    return {
      cls: chunk.className,
      srcText: srcField ? srcField.textContent : null,
      sizes: srcField ? [getComputedStyle(srcField).fontSize, getComputedStyle(chunk.querySelector('.reader-field')).fontSize] : null,
    };
  })()`);
  check("T6 card chunk tint class", cardInfo && cardInfo.cls.indexOf("merged-row-rasmee") !== -1, cardInfo && cardInfo.cls);
  check("T6 card source field muted+label", cardInfo && cardInfo.srcText === rasmeeTitle && cardInfo.sizes && parseFloat(cardInfo.sizes[0]) < parseFloat(cardInfo.sizes[1]), cardInfo && cardInfo.srcText);
  // commas: filtered counter (13,012 matches)
  async function pageSnapshot() {
    return await evalJS(`(function () {
      var c = document.getElementById('scrollCounter');
      var rc = document.getElementById('readerContent');
      var inp = document.getElementById('readerSearchInput');
      var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
      return JSON.stringify({
        text: c ? c.textContent : null, cls: c ? c.className : null, y: window.scrollY, h: document.scrollingElement.scrollHeight,
        href: location.href, chunks: document.querySelectorAll('.reader-chunk').length,
        tableRows: document.querySelectorAll('.reader-table tbody tr').length,
        contentChildren: rc ? rc.childElementCount : null,
        inputVal: inp ? inp.value : null,
        title: document.title,
        navType: nav ? nav.type : null,
      });
    })()`);
  }
  async function counterAfter(extraPrep, expect) {
    await goto(ROOT + "reader.html?book=RDF-all", 400, 800);
    await waitFor(`document.querySelectorAll('.reader-chunk').length > 0`);
    if (extraPrep) await extraPrep();
    console.log("  pre-scroll:", await pageSnapshot());
    // The app sets html { scroll-behavior: smooth } (common.css) — in headless
    // the programmatic scroll becomes an animation whose scroll events may
    // never flush. Override to an instant scroll so the event fires.
    await evalJS(`document.documentElement.style.scrollBehavior = "auto";`);
    await evalJS(`window.__probeReal = 0; window.addEventListener('scroll', function () { window.__probeReal++; }, { capture: true });`);
    await evalJS(`window.scrollTo(0, 600);`);
    // Headless quirk: without bringToFront the page may not produce frames,
    // so viewport-scroll events never get dispatched.
    await send("Page.bringToFront").catch(function () {});
    // The 152k-row build blocks the main thread — the scroll event only
    // dispatches once it frees. Wait for the counter to actually show the
    // expected total rather than sleeping a fixed amount.
    const ok = await waitFor(`(function () {
      var c = document.getElementById('scrollCounter');
      return !!c && c.textContent.indexOf(${JSON.stringify(expect)}) !== -1;
    })()`, 25000);
    let synthetic = null;
    if (!ok) {
      // Attempt 1: a genuine user scroll — CDP wheel goes through the
      // compositor→main-thread path like a real wheel event.
      await send("Input.dispatchMouseEvent", { type: "mouseWheel", x: 200, y: 400, deltaY: 600 });
      const okWheel = await waitFor(`(function () {
        var c = document.getElementById('scrollCounter');
        return !!c && c.textContent.indexOf(${JSON.stringify(expect)}) !== -1;
      })()`, 4000);
      if (okWheel) {
        synthetic = "WHEEL WORKED";
      } else {
        // Attempt 2: a synthetic event drives the same onScroll directly.
        await evalJS(`window.dispatchEvent(new Event('scroll'));`);
        const ok2 = await waitFor(`(function () {
          var c = document.getElementById('scrollCounter');
          return !!c && c.textContent.indexOf(${JSON.stringify(expect)}) !== -1;
        })()`, 4000);
        synthetic = ok2 ? "SYNTHETIC WORKED" : "SYNTHETIC FAILED";
      }
    }
    const state = await pageSnapshot();
    return [ok, state + " realScrollEvents:" + await evalJS(`window.__probeReal`) + " PAGE-ERRORS:[" + pageErrors.splice(0).join(" | ") + "] " + (synthetic || "")];
  }
  const [okF, stateF] = await counterAfter(async function () {
    await typeQuery(FILTER_Q);
    await waitFor(`document.querySelectorAll('.reader-chunk').length > 0`);
  }, "13,012");
  console.log("DIAG-F:", stateF);
  check("T6 counter shows comma total 13,012", okF, stateF.slice(0, 260));
  const [okU, stateU] = await counterAfter(null, "152,612");
  console.log("DIAG-U:", stateU);
  check("T6 counter shows comma total 152,612", okU, stateU.slice(0, 260));

  // ══ T8: renamed standalone books render ══
  // RDF-misc defaults to table view; HDT-misc (non-RDF) boots in card view.
  await goto(ROOT + "reader.html?book=RDF-misc", 1280, 800);
  check("T8 RDF-misc renders", await waitFor(`!!document.querySelector('.reader-table tbody tr')`));
  check("T8 RDF-misc no error toast", await evalJS(`(function(){var t=document.querySelector('.toast');return !t||t.textContent.indexOf('⚠️')===-1})()`));
  await goto(ROOT + "reader.html?book=HDT-misc", 1280, 800);
  check("T8 HDT-misc renders", await waitFor(`document.querySelectorAll('.reader-chunk').length > 0`));
  check("T8 HDT-misc no error toast", await evalJS(`(function(){var t=document.querySelector('.toast');return !t||t.textContent.indexOf('⚠️')===-1})()`));

  console.log(failures === 0 ? "\nALL PASS" : "\n" + failures + " FAILURES");
  return failures === 0;
  } finally {
    edge.kill();
    await sleep(600); // let the browser die and release the profile lock
  }
}
main()
  .then(function (ok) { process.exit(ok ? 0 : 1); })
  .catch(function (e) { console.log("PROBE CRASH: " + e.message); process.exit(1); });
