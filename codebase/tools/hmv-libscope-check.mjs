// Temporary probe for the library-search book-scope picker (?books= + the
// picker popover). Delete after running — or keep as the library-search
// battery if it earns its keep.
// Run: node tools/hmv-libscope-check.mjs  (from codebase/). Requires Node
// 20.11+ and Microsoft Edge. Env overrides: HMV_SCOPE_PORT (default 9357).
import fs from "fs";
import path from "path";
import { spawn, execSync } from "child_process";
import { pathToFileURL } from "url";

const baseDir = import.meta.dirname.replace(/\\/g, "/");
const ROOT = baseDir + "/../books/";
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
    check("S1 button label = All books", (await evalJS(`document.getElementById('libScopeBtn').textContent`)) === "All books ▾");
    check("S1 no books param", (await evalJS(`new URLSearchParams(location.search).has('books')`)) === false);

    // ── S2: open the popover ──
    await evalJS(`document.getElementById('libScopeBtn').click()`);
    check("S2 popover visible", await waitFor(`document.getElementById('libScopePopover').style.display !== 'none'`));
    const rows2 = await evalJS(`document.querySelectorAll('#libScopeList .lib-scope-row').length`);
    const groups2 = await evalJS(`document.querySelectorAll('#libScopeList .lib-scope-group-label').length`);
    const chips2 = await evalJS(`document.querySelectorAll('#libScopeTypes .tag-chip').length`);
    check("S2 list ≥ 40 books", rows2 >= 40, rows2);
    check("S2 ≥ 5 type groups", groups2 >= 5, groups2);
    check("S2 ≥ 5 type chips", chips2 >= 5, chips2);
    check("S2 footer shows total (unscoped)", (await evalJS(`document.getElementById('libScopeFoot').textContent`)) === rows2 + " books", await evalJS(`document.getElementById('libScopeFoot').textContent`));
    check("S2 filter uses the shared input style", (await evalJS(`(function () {
      var s = getComputedStyle(document.getElementById('libScopeFilter'), '::placeholder');
      return s.fontWeight === '700' && s.opacity === '1';
    })()`)) === true, "placeholder must be bold subtle like the search box");

    // ── S3: tick the first result's book → scoped ──
    const firstBook = await evalJS(`document.querySelector('.lib-result').dataset.book`);
    check("S3 a book matched the query", !!firstBook, firstBook);
    await evalJS(`(function () {
      var cb = document.querySelector('#libScopeList input[data-book="${firstBook}"]');
      cb.checked = true;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    check("S3 books param = " + firstBook, await waitFor(`new URLSearchParams(location.search).get('books') === ${JSON.stringify(firstBook)}`));
    check("S3 button label = 1 book", (await evalJS(`document.getElementById('libScopeBtn').textContent`)) === "1 book ▾");
    check("S3 results scoped to one book", await waitFor(`(function () {
      var cards = document.querySelectorAll('.lib-result');
      return cards.length > 0 && Array.prototype.every.call(cards, function (c) { return c.dataset.book === ${JSON.stringify(firstBook)}; });
    })()`));
    check("S3 summary says 1 book", (await evalJS(`document.getElementById('libResultCount').textContent`)).indexOf(" in 1 book") !== -1, await evalJS(`document.getElementById('libResultCount').textContent`));
    check("S3 checkbox stays checked", (await evalJS(`document.querySelector('#libScopeList input[data-book="${firstBook}"]').checked`)) === true);
    check("S3 no RDF books listed", (await evalJS(`Array.prototype.some.call(document.querySelectorAll('#libScopeList .lib-scope-code'), function (s) { return s.textContent.indexOf('RDF-') === 0; })`)) === false);

    // ── S4: type-group chip (QRN) toggles the whole family on, then off ──
    await evalJS(`document.querySelector('#libScopeTypes .tag-chip[data-tag="QRN"]').click()`);
    check("S4 popover stays open after chip click", (await evalJS(`document.getElementById('libScopePopover').style.display !== 'none'`)) === true);
    const qrnInList = await evalJS(`(function () {
      return Array.prototype.filter.call(document.querySelectorAll('#libScopeList .lib-scope-row'), function (r) {
        return r.dataset.book.indexOf('QRN-') === 0;
      }).map(function (r) { return r.dataset.book; });
    })()`);
    const qrnParam = await evalJS(`new URLSearchParams(location.search).get('books') || ''`);
    const allQrn = qrnInList.every((c) => qrnParam.split(",").indexOf(c) !== -1);
    check("S4 QRN chip selects every QRN book", allQrn && qrnInList.length > 0 && qrnParam.split(",").length === qrnInList.length, qrnParam);
    check("S4 button shows family count", (await evalJS(`document.getElementById('libScopeBtn').textContent`)) === qrnInList.length + " books ▾", qrnInList.length);
    await evalJS(`document.querySelector('#libScopeTypes .tag-chip[data-tag="QRN"]').click()`);
    // Regression for the empty-array bug: untoggling a full family must land on
    // null (all books), never [] — an empty array passes the truthy scope check
    // in computeScope and returns zero results while the URL says "all".
    check("S4b second click untoggles (back to all)", await waitFor(`(function () {
      return !new URLSearchParams(location.search).has('books')
        && document.getElementById('libScopeBtn').textContent === 'All books ▾'
        && document.querySelectorAll('.lib-result').length > 1;
    })()`));

    // ── S5: reset → all books again ──
    check("S5 reset hidden when unscoped", (await evalJS(`document.getElementById('libScopeReset').style.display === 'none'`)) === true);
    await evalJS(`document.querySelector('#libScopeTypes .tag-chip[data-tag="QRN"]').click()`);
    check("S5 reset visible when scoped", await waitFor(`document.getElementById('libScopeReset').style.display !== 'none'`));
    await evalJS(`document.getElementById('libScopeReset').click()`);
    check("S5 books param gone", await waitFor(`!new URLSearchParams(location.search).has('books')`));
    check("S5 button back to All books", (await evalJS(`document.getElementById('libScopeBtn').textContent`)) === "All books ▾");
    check("S5 results widen again", await waitFor(`document.querySelectorAll('.lib-result').length > 1`));
    check("S5 reset hidden again", (await evalJS(`document.getElementById('libScopeReset').style.display === 'none'`)) === true);

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
    await evalJS(`document.getElementById('libScopeFilter').value = ''`);

    // ── S7: Escape closes the popover ──
    await evalJS(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
    check("S7 Escape closes popover", await waitFor(`document.getElementById('libScopePopover').style.display === 'none'`));

    // ── S8: deep link ?books= restores the scope ──
    await goto(pageURL + "?q=" + encodeURIComponent(Q) + "&books=" + firstBook, 1280, 900);
    check("S8 deep-link button label", await waitFor(`document.getElementById('libScopeBtn').textContent === '1 book ▾'`));
    await evalJS(`document.getElementById('libScopeBtn').click()`);
    check("S8 deep-link checkbox checked", await waitFor(`document.querySelector('#libScopeList input[data-book="${firstBook}"]') !== null`));
    check("S8 deep-link checkbox state", (await evalJS(`document.querySelector('#libScopeList input[data-book="${firstBook}"]').checked`)) === true);
    check("S8 deep-link results scoped", (await evalJS(`Array.prototype.every.call(document.querySelectorAll('.lib-result'), function (c) { return c.dataset.book === ${JSON.stringify(firstBook)}; })`)) === true);
    check("S8 no error toast", (await evalJS(`(function(){var t=document.querySelector('.toast');return !t||t.textContent.indexOf('⚠️')===-1})()`)) === true);

    // ── S9: mobile viewport — popover stays inside the window ──
    await goto(pageURL, 390, 844);
    await evalJS(`document.getElementById('libScopeBtn').click()`);
    await waitFor(`document.getElementById('libScopePopover').style.display !== 'none'`);
    const mobileRect = await evalJS(`(function () {
      var r = document.getElementById('libScopePopover').getBoundingClientRect();
      return { left: Math.round(r.left), right: Math.round(r.right), w: window.innerWidth };
    })()`);
    check("S9 popover fits mobile width", mobileRect.left >= 0 && mobileRect.right <= mobileRect.w, JSON.stringify(mobileRect));

    // ── S10: no page errors anywhere ──
    check("S10 no page errors", pageErrors.length === 0, pageErrors.join(" | "));

    console.log(failures === 0 ? "\nALL PASS (" + (0) + " failures)" : "\n" + failures + " FAILURES");
  } finally {
    edge.kill();
  }
}

main().then((r) => process.exit(failures === 0 ? 0 : 1));
