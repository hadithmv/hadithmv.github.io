// Library-search battery: the book-scope picker (?books= + the picker
// modal, S1-S10) and the unified search window on the library page
// (S11: open, focus, card/list toggle, scope modal stacked on the window,
// scoped re-run, Escape-by-layer).
// Run: node tools/hmv-libscope-check.mjs  (from codebase/). Requires Node
// 20.11+ and Microsoft Edge. Env overrides: HMV_SCOPE_PORT (default 9357).
import fs from "fs";
import path from "path";
import { spawn, execSync } from "child_process";
import { pathToFileURL } from "url";

const baseDir = import.meta.dirname.replace(/\\/g, "/");
const IS_DIST = process.argv.includes("--dist");
const ROOT = baseDir + (IS_DIST ? "/../dist/books/" : "/../src/books/");
const PORT = process.env.HMV_SCOPE_PORT ? parseInt(process.env.HMV_SCOPE_PORT, 10) : 9357;
const PROFILE = process.env.TEMP + "\\hmv-scope-profile-" + Date.now();

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
      try { execSync("taskkill /PID " + pid + " /F /T", { stdio: "ignore" }); console.log("  (killed leftover Edge PID " + pid + ")"); } catch (e) { /* gone */ }
    }
  } catch (e) { /* no listener */ }
}
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? "PASS  " : "FAIL  ") + name + (detail !== undefined ? "   [" + String(detail).slice(0, 200) + "]" : ""));
  if (!cond) failures++;
}

const Q = "ކަން"; // Dhivehi word the probe battery already proved matches books

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
    if (!target) { console.log("NO_TARGET"); return; }

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
    async function waitFor(expr, timeoutMs = 60000) {
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
      await send("Page.bringToFront").catch(function () {});
      await sleep(400);
    }

    const pageURL = pathToFileURL(ROOT + "library-search.html").href;

    // ── S1: fresh load, set UI language to English, reload ──
    await goto(pageURL, 1280, 900);
    await evalJS(`localStorage.setItem('lang', 'en')`);
    await goto(pageURL + "?q=" + encodeURIComponent(Q), 1280, 900);
    check("S1 results render", await waitFor(`document.querySelectorAll('.lib-result').length > 0`), "no result cards");
    check("S1 button label = All books", (await evalJS(`document.getElementById('libScopeBtn').textContent`)) === "Search in: All books ▾");
    // The tooltip is the only always-English explainer of the button's action —
    // it must teach the verb ("choose which books"), not describe the result.
    check("S1 button tooltip teaches the action", (await evalJS(`document.getElementById('libScopeBtn').getAttribute('title')`)) === "Choose which books to search");
    check("S1 no books param", (await evalJS(`new URLSearchParams(location.search).has('books')`)) === false);

    // ── S2: open the scope modal ──
    await evalJS(`document.getElementById('libScopeBtn').click()`);
    check("S2 modal opens", await waitFor(`document.getElementById('libScopeOverlay').classList.contains('open')`));
    const rows2 = await evalJS(`document.querySelectorAll('#libScopeList .lib-scope-row').length`);
    const groups2 = await evalJS(`document.querySelectorAll('#libScopeList .lib-scope-group-label').length`);
    const chips2 = await evalJS(`document.querySelectorAll('#libScopeTypes .tag-chip').length`);
    check("S2 list ≥ 40 books", rows2 >= 40, rows2);
    check("S2 ≥ 5 type groups", groups2 >= 5, groups2);
    check("S2 ≥ 5 type chips", chips2 >= 5, chips2);
    // Rows pair the current-language title with the Arabic title as the
    // secondary line; the machine code moved to the row's tooltip.
    check("S2 rows show Arabic title, tooltip = code", (await evalJS(`(function () {
      var r = document.querySelector('#libScopeList .lib-scope-row');
      var sub = r.querySelector('.lib-scope-sub');
      return r.getAttribute('title') === r.dataset.book && !!sub && sub.textContent.length > 0 && sub.textContent !== r.dataset.book;
    })()`)) === true);
    // The sub-line must use the muted text token (readable, secondary) at
    // the panel size — same contract as the count, resolved against :root so
    // it holds in every theme.
    check("S2 sub-line readable (muted token, panel size)", (await evalJS(`(function () {
      var s = getComputedStyle(document.querySelector('#libScopeList .lib-scope-row .lib-scope-sub'));
      var token = getComputedStyle(document.documentElement).getPropertyValue('--color-text-muted').trim();
      var m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(token);
      if (!m) return false;
      var rgb = 'rgb(' + parseInt(m[1], 16) + ', ' + parseInt(m[2], 16) + ', ' + parseInt(m[3], 16) + ')';
      return s.color === rgb && s.fontSize === getComputedStyle(document.getElementById('libScopeFilter')).fontSize;
    })()`)) === true);
    // expectation mirrors src/js/i18n.js libScopeTitle.en
    check("S2 modal title", (await evalJS(`document.getElementById('libScopeModalTitle').textContent`)) === "Select books to search in", await evalJS(`document.getElementById('libScopeModalTitle').textContent`));
    check("S2 count shows total (unscoped)", (await evalJS(`document.getElementById('libScopeCount').textContent`)) === rows2 + " books", await evalJS(`document.getElementById('libScopeCount').textContent`));
    check("S2 filter uses the shared input style", (await evalJS(`(function () {
      var s = getComputedStyle(document.getElementById('libScopeFilter'), '::placeholder');
      return s.fontWeight === '700' && s.opacity === '1';
    })()`)) === true, "placeholder must be bold subtle like the search box");
    // ── S2b: desktop two-pane grid — the family rail sits right of the list ──
    const paneRects = await evalJS(`(function () {
      var t = document.getElementById('libScopeTypes').getBoundingClientRect();
      var l = document.getElementById('libScopeList').getBoundingClientRect();
      var m = document.querySelector('.lib-scope-modal').getBoundingClientRect();
      return { tLeft: Math.round(t.left), lRight: Math.round(l.right), w: Math.round(m.width) };
    })()`);
    check("S2b rail right of the list", paneRects.tLeft >= paneRects.lRight, JSON.stringify(paneRects));
    check("S2b modal widened on desktop", paneRects.w > 600, paneRects.w);
    // ── S2c: one pinned header row — Tags label over the rail, filter and
    // count over the list; below it both panes scroll (no footer, no close
    // button) ──
    check("S2c rail has a Tags label", (await evalJS(`document.getElementById('libScopeTypesLabel').textContent`)) === "Tags", await evalJS(`document.getElementById('libScopeTypesLabel').textContent`));
    const headRects = await evalJS(`(function () {
      var f = document.getElementById('libScopeFilter').getBoundingClientRect();
      var c = document.getElementById('libScopeCount').getBoundingClientRect();
      var l = document.getElementById('libScopeList').getBoundingClientRect();
      var g = document.getElementById('libScopeTypesLabel').getBoundingClientRect();
      var r = document.getElementById('libScopeReset').getBoundingClientRect();
      var t = document.getElementById('libScopeTypes').getBoundingClientRect();
      return { fLeft: Math.round(f.left), fRight: Math.round(f.right), fTop: Math.round(f.top), fBottom: Math.round(f.bottom), lLeft: Math.round(l.left), lRight: Math.round(l.right), cTop: Math.round(c.top), cBottom: Math.round(c.bottom), cLeft: Math.round(c.left), lTop: Math.round(l.top), gTop: Math.round(g.top), gBottom: Math.round(g.bottom), gLeft: Math.round(g.left), rTop: Math.round(r.top), rBottom: Math.round(r.bottom), rLeft: Math.round(r.left), tTop: Math.round(t.top), cW: document.getElementById('libScopeCount').offsetWidth, fW: document.getElementById('libScopeFilter').offsetWidth };
    })()`);
    check("S2c filter above the book list", headRects.fLeft >= headRects.lLeft && headRects.fRight <= headRects.lRight && headRects.fBottom <= headRects.lTop, JSON.stringify(headRects));
    check("S2c count beside the filter", headRects.cTop >= headRects.fTop - 2 && headRects.cBottom <= headRects.fBottom + 2 && headRects.cLeft <= headRects.fLeft, JSON.stringify(headRects));
    // The label occupies the header row (its cell is the row's full height —
    // the filter band sits centered inside it), over the rail (right of the
    // list), and its cell ends above the rail, so the rail can scroll without
    // taking the label with it. The reset hangs off the row's far left, on
    // the count's line — RTL order puts it left of the count, the readout it
    // clears.
    check("S2c label shares the header line with the filter", headRects.gTop <= headRects.fTop && headRects.gBottom >= headRects.fBottom && headRects.gLeft >= headRects.lRight, JSON.stringify(headRects));
    check("S2c reset beside the count (leftmost)", headRects.rTop >= headRects.fTop - 2 && headRects.rBottom <= headRects.fBottom + 2 && headRects.rLeft <= headRects.cLeft, JSON.stringify(headRects));
    check("S2c label stays above the rail", headRects.gBottom <= headRects.tTop, JSON.stringify(headRects));
    // The count must use the full text token (readable, semibold) at the
    // filter's font size — resolve --color-text on :root and compare
    // rgb-to-rgb, so the check holds in every theme.
    check("S2c count readable (text token, semibold, panel size)", (await evalJS(`(function () {
      var c = getComputedStyle(document.getElementById('libScopeCount'));
      var token = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
      var m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(token);
      if (!m) return false;
      var rgb = 'rgb(' + parseInt(m[1], 16) + ', ' + parseInt(m[2], 16) + ', ' + parseInt(m[3], 16) + ')';
      var f = getComputedStyle(document.getElementById('libScopeFilter'));
      return c.color === rgb && c.fontWeight === '600' && c.fontSize === f.fontSize;
    })()`)) === true);
    check("S2c no footer", (await evalJS(`document.querySelector('.lib-scope-foot') === null`)) === true);
    check("S2c no Done button", (await evalJS(`document.getElementById('libScopeDone') === null`)) === true);

    // ── S3: tick the first result's book → scoped ──
    const firstBook = await evalJS(`document.querySelector('.lib-result').dataset.book`);
    check("S3 a book matched the query", !!firstBook, firstBook);
    await evalJS(`(function () {
      var cb = document.querySelector('#libScopeList input[data-book="${firstBook}"]');
      cb.checked = true;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    check("S3 books param = " + firstBook, await waitFor(`new URLSearchParams(location.search).get('books') === ${JSON.stringify(firstBook)}`));
    check("S3 button label = 1 book", (await evalJS(`document.getElementById('libScopeBtn').textContent`)) === "Search in: 1 book ▾");
    check("S3 results scoped to one book", await waitFor(`(function () {
      var cards = document.querySelectorAll('.lib-result');
      return cards.length > 0 && Array.prototype.every.call(cards, function (c) { return c.dataset.book === ${JSON.stringify(firstBook)}; });
    })()`));
    check("S3 summary says 1 book", (await evalJS(`document.getElementById('libResultCount').textContent`)).indexOf(" in 1 book") !== -1, await evalJS(`document.getElementById('libResultCount').textContent`));
    check("S3 checkbox stays checked", (await evalJS(`document.querySelector('#libScopeList input[data-book="${firstBook}"]').checked`)) === true);
    check("S3 modal stays open after tick", (await evalJS(`document.getElementById('libScopeOverlay').classList.contains('open')`)) === true);
    check("S3 no RDF books listed", (await evalJS(`Array.prototype.some.call(document.querySelectorAll('#libScopeList .lib-scope-code'), function (s) { return s.textContent.indexOf('RDF-') === 0; })`)) === false);

    // ── S4: type-group chip (QRN) toggles the whole family on, then off ──
    await evalJS(`document.querySelector('#libScopeTypes .tag-chip[data-tag="QRN"]').click()`);
    check("S4 modal stays open after chip click", (await evalJS(`document.getElementById('libScopeOverlay').classList.contains('open')`)) === true);
    const qrnInList = await evalJS(`(function () {
      return Array.prototype.filter.call(document.querySelectorAll('#libScopeList .lib-scope-row'), function (r) {
        return r.dataset.book.indexOf('QRN-') === 0;
      }).map(function (r) { return r.dataset.book; });
    })()`);
    const qrnParam = await evalJS(`new URLSearchParams(location.search).get('books') || ''`);
    const allQrn = qrnInList.every((c) => qrnParam.split(",").indexOf(c) !== -1);
    check("S4 QRN chip selects every QRN book", allQrn && qrnInList.length > 0 && qrnParam.split(",").length === qrnInList.length, qrnParam);
    check("S4 button shows family count", (await evalJS(`document.getElementById('libScopeBtn').textContent`)) === "Search in: " + qrnInList.length + " books ▾", qrnInList.length);
    await evalJS(`document.querySelector('#libScopeTypes .tag-chip[data-tag="QRN"]').click()`);
    // Regression for the empty-array bug: untoggling a full family must land on
    // null (all books), never [] — an empty array passes the truthy scope check
    // in computeScope and returns zero results while the URL says "all".
    check("S4b second click untoggles (back to all)", await waitFor(`(function () {
      return !new URLSearchParams(location.search).has('books')
        && document.getElementById('libScopeBtn').textContent === 'Search in: All books ▾'
        && document.querySelectorAll('.lib-result').length > 1;
    })()`));

    // ── S5: reset → all books again ──
    check("S5 reset always visible (unscoped)", (await evalJS(`document.getElementById('libScopeReset').style.display !== 'none'`)) === true);
    // The reset clears the whole scope, so it lives in the pinned header beside
    // the count — the readout of the very selection it clears — not in the
    // rail, which can scroll out from under it.
    check("S5 reset sits beside the count (pinned header)", (await evalJS(`document.getElementById('libScopeReset').parentElement.querySelector('#libScopeCount') !== null`)) === true);
    await evalJS(`document.querySelector('#libScopeTypes .tag-chip[data-tag="QRN"]').click()`);
    check("S5 reset says what it does", (await evalJS(`document.getElementById('libScopeReset').textContent`)) === "↺ Reset");
    check("S5 count shows scoped total", (await evalJS(`document.getElementById('libScopeCount').textContent`)) === qrnInList.length + " of " + rows2 + " books selected", await evalJS(`document.getElementById('libScopeCount').textContent`));
    // The count's width was pre-reserved to its widest state (S2c) — going
    // unscoped→scoped must not change the count or the filter beside it.
    check("S5 no width jump on scoping", await waitFor(`Math.abs(document.getElementById('libScopeCount').offsetWidth - ${headRects.cW}) <= 1 && Math.abs(document.getElementById('libScopeFilter').offsetWidth - ${headRects.fW}) <= 1`), headRects.cW + "→" + await evalJS(`document.getElementById('libScopeCount').offsetWidth`));
    await evalJS(`document.getElementById('libScopeReset').click()`);
    check("S5 books param gone", await waitFor(`!new URLSearchParams(location.search).has('books')`));
    check("S5 button back to All books", (await evalJS(`document.getElementById('libScopeBtn').textContent`)) === "Search in: All books ▾");
    check("S5 results widen again", await waitFor(`document.querySelectorAll('.lib-result').length > 1`));
    check("S5 reset still visible (scoped)", (await evalJS(`document.getElementById('libScopeReset').style.display !== 'none'`)) === true);

    // ── S6: filter box narrows the list ──
    const totalRows = await evalJS(`document.querySelectorAll('#libScopeList .lib-scope-row').length`);
    await evalJS(`(function () {
      var f = document.getElementById('libScopeFilter');
      f.value = 'bukhari';
      f.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    const filtRows = await evalJS(`(function () {
      var rows = document.querySelectorAll('#libScopeList .lib-scope-row');
      return { n: rows.length, codes: Array.prototype.map.call(rows, function (r) { return r.dataset.book; }) };
    })()`);
    check("S6 filter narrows list", filtRows.n > 0 && filtRows.n < totalRows, totalRows + " → " + filtRows.n);
    check("S6 filtered rows contain bukhari", filtRows.codes.every((c) => c.toLowerCase().indexOf("bukhari") !== -1), filtRows.codes.join(","));
    // The filter rides the shared search-input-wrap — the same search-box
    // component as every other filter — so its ✕ clear button mirrors on
    // the query and restores the full list.
    check("S6b clear ✕ shows with a query", (await evalJS(`document.getElementById('libScopeFilterClear').classList.contains('visible')`)) === true);
    await evalJS(`document.getElementById('libScopeFilterClear').click()`);
    check("S6b ✕ clears the box, restores rows, and re-focuses", await waitFor(`(function () {
      return document.getElementById('libScopeFilter').value === ''
        && !document.getElementById('libScopeFilterClear').classList.contains('visible')
        && document.querySelectorAll('#libScopeList .lib-scope-row').length === ${totalRows}
        && document.activeElement === document.getElementById('libScopeFilter');
    })()`));

    // ── S7: Escape closes the modal (shared modal layer) ──
    await evalJS(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
    check("S7 Escape closes modal", await waitFor(`!document.getElementById('libScopeOverlay').classList.contains('open')`));

    // ── S7x: ✕ closes the modal and keeps the live-applied scope ──
    // (no Done/Apply button exists — the picker applies on every tick, so the
    // shared ✕/backdrop/Escape are the only closers; scope must survive them)
    await evalJS(`document.querySelector('#libScopeTypes .tag-chip[data-tag="QRN"]').click()`);
    await evalJS(`document.querySelector('.modal-close').click()`);
    check("S7x ✕ closes modal", await waitFor(`!document.getElementById('libScopeOverlay').classList.contains('open')`));
    check("S7x scope kept after ✕", await waitFor(`new URLSearchParams(location.search).has('books')`));

    // ── S8: deep link ?books= restores the scope ──
    await goto(pageURL + "?q=" + encodeURIComponent(Q) + "&books=" + firstBook, 1280, 900);
    check("S8 deep-link button label", await waitFor(`document.getElementById('libScopeBtn').textContent === 'Search in: 1 book ▾'`));
    await evalJS(`document.getElementById('libScopeBtn').click()`);
    check("S8 deep-link modal opens", await waitFor(`document.getElementById('libScopeOverlay').classList.contains('open')`));
    check("S8 deep-link checkbox checked", await waitFor(`document.querySelector('#libScopeList input[data-book="${firstBook}"]') !== null`));
    check("S8 deep-link checkbox state", (await evalJS(`document.querySelector('#libScopeList input[data-book="${firstBook}"]').checked`)) === true);
    check("S8 deep-link results scoped", (await evalJS(`Array.prototype.every.call(document.querySelectorAll('.lib-result'), function (c) { return c.dataset.book === ${JSON.stringify(firstBook)}; })`)) === true);
    check("S8 no error toast", (await evalJS(`(function(){var t=document.querySelector('.toast');return !t||t.textContent.indexOf('⚠️')===-1})()`)) === true);

    // ── S9: mobile viewport — modal fits inside the window ──
    await goto(pageURL, 390, 844);
    await evalJS(`document.getElementById('libScopeBtn').click()`);
    // the modal shell is created lazily (async on first open — no ?q= here, so
    // the searchable-books index loads first); null-check before touching it
    await waitFor(`document.getElementById('libScopeOverlay') !== null && document.getElementById('libScopeOverlay').classList.contains('open')`);
    const mobileRect = await evalJS(`(function () {
      var m = document.querySelector('.lib-scope-modal');
      var r = m.getBoundingClientRect();
      return { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom), w: window.innerWidth, h: window.innerHeight };
    })()`);
    check("S9 modal fits mobile viewport", mobileRect.left >= 0 && mobileRect.right <= mobileRect.w && mobileRect.top >= 0 && mobileRect.bottom <= mobileRect.h, JSON.stringify(mobileRect));
    const mobPane = await evalJS(`(function () {
      var g = document.getElementById('libScopeTypesLabel').getBoundingClientRect();
      var t = document.getElementById('libScopeTypes').getBoundingClientRect();
      var h = document.querySelector('.lib-scope-head').getBoundingClientRect();
      var l = document.getElementById('libScopeList').getBoundingClientRect();
      return { gBottom: Math.round(g.bottom), tTop: Math.round(t.top), tBottom: Math.round(t.bottom), hTop: Math.round(h.top), hBottom: Math.round(h.bottom), lTop: Math.round(l.top) };
    })()`);
    check("S9b mobile stacks label, chips, filter, list", mobPane.gBottom <= mobPane.tTop && mobPane.tBottom <= mobPane.hTop && mobPane.hBottom <= mobPane.lTop, JSON.stringify(mobPane));

    // ── S9c: desktop short window — the rail scrolls as ONE column; it must
    // not pack its overflow into a second column (a wrapped column flex does
    // exactly that instead of scrolling — the two-column regression) ──
    await goto(pageURL, 1280, 440);
    await evalJS(`document.getElementById('libScopeBtn').click()`);
    await waitFor(`document.getElementById('libScopeOverlay') !== null && document.getElementById('libScopeOverlay').classList.contains('open')`);
    check("S9c rail scrolls in one column", await waitFor(`(function () {
      var t = document.getElementById('libScopeTypes');
      var s = getComputedStyle(t);
      return s.overflowY === 'auto' && s.flexWrap === 'nowrap' && t.scrollHeight > t.clientHeight + 4 && t.scrollWidth <= t.clientWidth + 4;
    })()`));
    // The rail is now actually overflowing — scroll it and prove the pinned
    // Tags label above it does not move (the regression this whole layout
    // exists to fix).
    check("S9c label pinned while the rail scrolls", await waitFor(`(function () {
      var t = document.getElementById('libScopeTypes');
      var l = document.getElementById('libScopeTypesLabel');
      var before = l.getBoundingClientRect().top;
      t.scrollTop = 9999;
      return t.scrollTop > 0 && Math.abs(l.getBoundingClientRect().top - before) < 1;
    })()`));
    // The rail is scrolled to its end — the reset button lives in the pinned
    // header (with the label), so it must still be fully inside the modal,
    // unlike the chips which scrolled out of view.
    check("S9c reset visible while the rail is scrolled", await waitFor(`(function () {
      var r = document.getElementById('libScopeReset');
      if (r.offsetParent === null) return false;
      var b = r.getBoundingClientRect();
      var m = document.getElementById('libScopeOverlay').getBoundingClientRect();
      return b.top >= m.top && b.bottom <= m.bottom && b.left >= m.left && b.right <= m.right;
    })()`));

    // ── S11: the unified search window on the library page ──
    console.log("== S11. search window ==");
    await goto(pageURL + "?q=" + encodeURIComponent(Q), 1280, 900);
    await evalJS(`document.getElementById('btnSearchWindow').click()`);
    check("S11 window opens", await waitFor(`document.getElementById('searchWindowOverlay').classList.contains('open')`, 5000));
    // The modal's pop transition keeps the overlay computed as
    // visibility:hidden for ~0.2s — focus lands only after it flips visible.
    check("S11 window focuses the input",
      await waitFor(`document.activeElement && document.activeElement.id === 'searchWindowInput'`, 5000));
    const winInit = await evalJS(`(function () {
      return {
        scopeShown: document.getElementById('searchWindowScope').style.display !== 'none',
        viewShown: document.getElementById('searchWindowView').style.display !== 'none',
        optsHidden: document.getElementById('searchWindowOptions').style.display === 'none',
        query: document.getElementById('searchWindowInput').value,
      };
    })()`);
    check("S11 window surfaces (scope + view on, options off)",
      winInit.scopeShown && winInit.viewShown && winInit.optsHidden, JSON.stringify(winInit));
    check("S11 window inherits the page query", winInit.query === Q, winInit.query);

    // card view renders — the window's own cards, no peek toggles
    await waitFor(`document.querySelectorAll('#searchWindowResults .lib-result').length > 1`, 15000);
    const cards = await evalJS(`(function () {
      var r = document.getElementById('searchWindowResults');
      return {
        n: r.querySelectorAll('.lib-result').length,
        peeks: r.querySelectorAll('.lib-peek-toggle').length,
        rc: (document.getElementById('searchWindowCount') || {}).textContent || null,
      };
    })()`);
    check("S11 card view renders in window", cards.n > 1 && cards.peeks === 0, JSON.stringify(cards));
    check("S11 window count header", cards.rc !== null && /\d/.test(cards.rc), cards.rc);

    // list view toggle — compact rows, cards gone, button active
    await evalJS(`document.getElementById('searchWindowViewList').click()`);
    await waitFor(`document.querySelectorAll('#searchWindowResults .search-window-book-link').length > 1`, 10000);
    const listView = await evalJS(`(function () {
      var r = document.getElementById('searchWindowResults');
      return {
        n: r.querySelectorAll('.search-window-book-link').length,
        cards: r.querySelectorAll('.lib-result').length,
        active: document.getElementById('searchWindowViewList').classList.contains('active'),
      };
    })()`);
    check("S11 list view renders", listView.n > 1 && listView.cards === 0 && listView.active, JSON.stringify(listView));

    // back to card view
    await evalJS(`document.getElementById('searchWindowViewCard').click()`);
    await waitFor(`document.querySelectorAll('#searchWindowResults .lib-result').length > 1`, 10000);
    check("S11 back to card view",
      await evalJS(`document.getElementById('searchWindowViewCard').classList.contains('active')`));

    // window → page hop: a NEW term typed in the window applies to the page
    // in place — the page input, its card grid and the URL all take it over,
    // and the window closes (the library page owns onOpenPage)
    await evalJS(`(function () {
      var inp = document.getElementById('searchWindowInput');
      inp.value = 'الناس';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    await waitFor(`document.querySelectorAll('#searchWindowResults .lib-result').length > 0`, 15000);
    check("S11 hop link shows for cross-book query",
      await evalJS(`document.getElementById('searchWindowOpenPage').style.display !== 'none'`));
    await evalJS(`document.getElementById('searchWindowOpenPage').click()`);
    check("S11 hop closes window",
      await waitFor(`!document.getElementById('searchWindowOverlay').classList.contains('open')`, 5000));
    const hop = await evalJS(`(function () {
      return {
        input: document.getElementById('libSearchInput').value,
        url: window.location.search,
        cards: document.querySelectorAll('#libResults .lib-result').length,
      };
    })()`);
    check("S11 hop applies the query to the page",
      hop.input === "الناس" && hop.url.indexOf(encodeURIComponent("الناس")) !== -1 && hop.cards > 1,
      JSON.stringify(hop));
    // reopen the window for the scope section below
    await evalJS(`document.getElementById('btnSearchWindow').click()`);
    check("S11 window reopens after hop",
      await waitFor(`document.getElementById('searchWindowOverlay').classList.contains('open')`, 5000));

    // scope summary → the picker opens in the libScope modal, stacked ON TOP
    // of the window (openModalOnTop): the window keeps its query and results
    // underneath
    await evalJS(`document.getElementById('searchWindowScopeSummary').click()`);
    check("S11 scope shell in window",
      await waitFor(`document.querySelectorAll('#libScopeList .lib-scope-row').length > 0`, 5000));
    check("S11 window scope opens the libScope modal on top",
      await evalJS(`(function () {
        var m = document.getElementById('libScopeOverlay');
        var w = document.getElementById('searchWindowOverlay');
        return m !== null && m.classList.contains('open') &&
               w !== null && w.classList.contains('open');
      })()`));

    // scope the window search by ticking the first card's book
    const tickBook = await evalJS(`(function () {
      var code = document.querySelector('#searchWindowResults .lib-result').dataset.book;
      var cb = null;
      document.querySelectorAll('#libScopeList .lib-scope-row input[type=checkbox]').forEach(function (c) {
        if (c.dataset.book === code) cb = c;
      });
      if (cb) cb.click();
      return { found: !!cb, code: code };
    })()`);
    check("S11 window scope tick book", tickBook.found, tickBook.code);
    check("S11 scoped window search re-runs (1 card)",
      await waitFor(`document.querySelectorAll('#searchWindowResults .lib-result').length === 1`, 15000));
    check("S11 window summary reflects scope",
      (await evalJS(`document.getElementById('searchWindowScopeSummary').textContent`)).indexOf("1 book") !== -1);

    // reset the scope → all books again
    await evalJS(`document.getElementById('libScopeReset').click()`);
    check("S11 window scope reset restores",
      await waitFor(`document.querySelectorAll('#searchWindowResults .lib-result').length > 1`, 15000));

    // Desktop geometry — the two-column body: the side pane (controls) sits
    // beside the main pane (results), narrower than it, both inside the
    // modal. The window is RTL, so the side pane is the right-hand column:
    // side.left >= main.right means the main pane's right edge meets the
    // side pane's left edge (with the gap between them).
    const geom = await evalJS(`(function () {
      var s = document.getElementById('searchWindowSide').getBoundingClientRect();
      var m = document.getElementById('searchWindowMain').getBoundingClientRect();
      var o = document.getElementById('searchWindowOverlay').getBoundingClientRect();
      return {
        beside: Math.abs(s.top - m.top) < 2 && s.left >= m.right,
        mainWider: m.width > s.width,
        insideModal: s.left >= o.left && s.right <= o.right &&
                     m.left >= o.left && m.right <= o.right,
        // history is a side-pane section, never the results column's content
        historyInSide: document.getElementById('searchWindowSide')
          .contains(document.getElementById('searchWindowHistory')),
      };
    })()`);
    check("S11 window two-column geometry",
      geom.beside && geom.mainWider && geom.insideModal && geom.historyInSide, JSON.stringify(geom));

    // Close the scope modal first — Escape closes the innermost (the scope
    // modal), leaving the window open; a second Escape closes the window.
    // The page behind is untouched throughout.
    await evalJS(`document.getElementById('searchWindowInput').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
    check("S11 Escape closes the scope modal only",
      await waitFor(`!document.getElementById('libScopeOverlay').classList.contains('open')`, 5000));
    check("S11 window stays open under the scope modal",
      (await evalJS(`document.getElementById('searchWindowOverlay').classList.contains('open')`)) === true);
    await evalJS(`document.getElementById('searchWindowInput').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
    check("S11 Escape closes window",
      await waitFor(`!document.getElementById('searchWindowOverlay').classList.contains('open')`, 5000));
    const pageIntact = await evalJS(`(function () {
      return {
        cards: document.querySelectorAll('#libResults .lib-result').length,
        count: (document.getElementById('libResultCount') || {}).textContent || '',
      };
    })()`);
    check("S11 page behind intact", pageIntact.cards > 1 && pageIntact.count.length > 0, JSON.stringify(pageIntact));

    // Mobile geometry — the ≤600px collapse: the side pane stacks above the
    // main pane at full modal width.
    await goto(pageURL + "?q=" + encodeURIComponent(Q), 390, 844);
    await evalJS(`document.getElementById('btnSearchWindow').click()`);
    check("S11 mobile window opens",
      await waitFor(`document.getElementById('searchWindowOverlay').classList.contains('open')`, 5000));
    const geomM = await evalJS(`(function () {
      var s = document.getElementById('searchWindowSide').getBoundingClientRect();
      var m = document.getElementById('searchWindowMain').getBoundingClientRect();
      var mod = document.querySelector('.search-window-modal').getBoundingClientRect();
      var w = mod.width;
      return {
        stacked: s.top < m.top,
        fullWidth: s.width > w * 0.85 && m.width > w * 0.85,
        insideModal: s.left >= mod.left && s.right <= mod.right &&
                     m.left >= mod.left && m.right <= mod.right,
      };
    })()`);
    check("S11 mobile window stacked geometry",
      geomM.stacked && geomM.fullWidth && geomM.insideModal, JSON.stringify(geomM));
    await evalJS(`document.getElementById('searchWindowInput').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);

    // ── S10: no page errors anywhere ──
    check("S10 no page errors", pageErrors.length === 0, pageErrors.join(" | "));

    console.log(failures === 0 ? "\nALL PASS (" + (0) + " failures)" : "\n" + failures + " FAILURES");
  } finally {
    edge.kill();
  }
}

main().then((r) => process.exit(failures === 0 ? 0 : 1));
