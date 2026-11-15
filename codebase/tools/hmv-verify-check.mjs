// Verify-export battery — the Tools group's Verify link, the claim parser
// (pasted provenance line + verify URL), and the query mode: current version,
// different version, unknown book, LTR layout, no page errors.
// Run: node tools/hmv-verify-check.mjs  (from codebase/, or anywhere — paths
// resolve relative to this script). Requires Node 20.11+ and Microsoft Edge.
// Env overrides: HMV_VERIFY_PORT (default 9366), HMV_VERIFY_PROFILE.
import fs from "fs";
import path from "path";
import { spawn, execSync } from "child_process";
import { pathToFileURL } from "url";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const baseDir = import.meta.dirname.replace(/\\/g, "/");
const IS_DIST = process.argv.includes("--dist");
const ROOT = baseDir + (IS_DIST ? "/../dist/books/" : "/../src/books/");
const PORT = process.env.HMV_VERIFY_PORT ? parseInt(process.env.HMV_VERIFY_PORT, 10) : 9366;
const PROFILE = process.env.HMV_VERIFY_PROFILE || process.env.TEMP + "\\hmv-verify-profile-" + Date.now();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
let checksRun = 0;
function check(name, cond, detail) {
  console.log((cond ? "PASS  " : "FAIL  ") + name + (detail !== undefined ? "   [" + String(detail).slice(0, 200) + "]" : ""));
  checksRun++;
  if (!cond) failures++;
}

const SRC_JS = path.join(import.meta.dirname, "..", "src", "js");
const { parseCSV } = await import(pathToFileURL(path.join(SRC_JS, "csv.js")));
const { tIn } = await import(pathToFileURL(path.join(SRC_JS, "i18n.js")));
const DATA = baseDir + "/../data/";
const REG = parseCSV(fs.readFileSync(DATA + "03-registry-bookMeta.csv", "utf8"));
const HDR = REG.shift();
const IDX = {};
HDR.forEach((h, i) => (IDX[h] = i));
const BOOK = "HDT-muwattaMalik";
const ENTRY = REG.find((r) => r[IDX.bookCode] === BOOK);
if (!ENTRY) throw new Error("fixture book missing from the registry");
const VERSION = (ENTRY[IDX.version] || "").toLowerCase();
const TITLE = ENTRY[IDX.titleEN] || BOOK;
const APP_VERSION = tIn("appVersion", "en").replace(/ \(.*\)/, "");
const NAV_VERIFY = tIn("navVerifyTool", "dv");
const READER_URL = "https://example.test/books/reader.html?book=" + BOOK;
const CAPTION = "source: v" + VERSION + " - rows: 123";
const LEGACY_LINE = "Hadithmv " + APP_VERSION + " - book " + BOOK + " - source v" + VERSION + " - 123 rows";
const VERIFY_URL = "https://example.test/books/verify.html?book=" + BOOK + "&v=" + VERSION;

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
      try { execSync("taskkill /PID " + pid + " /F /T", { stdio: "ignore" }); } catch (e) { /* gone */ }
    }
  } catch (e) { /* no listener */ }
}

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
    async function waitFor(expr, timeoutMs = 15000) {
      const t0 = Date.now();
      while (Date.now() - t0 < timeoutMs) {
        if (await evalJS(expr)) return true;
        await sleep(150);
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
      await sleep(300);
    }
    const setInput = (v) => evalJS(`(function () {
      var el = document.getElementById('verifyInput');
      el.value = ${JSON.stringify(v)};
      el.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    const verifyURL = pathToFileURL(ROOT + "verify.html").href;

    // ── Sidebar: Verify link inside the collapsed Tools group ──
    await goto(pathToFileURL(ROOT + "index.html").href, 1280, 900);
    const side = await evalJS(`(function () {
      var d = document.querySelector('details.sidebar-tools');
      var a = d ? d.querySelector('a[href="verify.html"]') : null;
      return d && a ? { href: a.getAttribute('href'), text: a.textContent.trim(), open: d.open } : null;
    })()`);
    check("sidebar Tools group carries the Verify link (current language)",
      side && side.href === "verify.html" && side.text.indexOf(NAV_VERIFY) !== -1 && side.open === false,
      side ? JSON.stringify(side) : "missing");
    await evalJS(`document.querySelector('details.sidebar-tools summary').click()`);
    await waitFor(`document.querySelector('details.sidebar-tools').open === true`);
    await evalJS(`document.querySelector('a[href="verify.html"]').click()`);
    check("sidebar Verify link opens verify.html", await waitFor(`location.pathname.endsWith("/verify.html")`), await evalJS("location.pathname"));
    check("verify page starts empty", await waitFor(`document.querySelector('.verify-empty') !== null && document.querySelector('.verify-status') === null`));

    pageErrors.length = 0;
    const dir = await evalJS(`getComputedStyle(document.body).direction`);
    check("verify page is LTR", dir === "ltr", dir);

    // ── Paste: the title-page URL + caption, a verify URL, a legacy line,
    //    and the caption alone ──
    await setInput(READER_URL + "\n" + CAPTION);
    check("title-page paste is parsed", await waitFor(`document.querySelector('.verify-status.ok') !== null`),
      await evalJS(`document.getElementById('verifyResult').textContent.slice(0, 160)`));
    const claimText = await evalJS(`document.getElementById('verifyResult').textContent`);
    check("claim shows the book title and rows", claimText.indexOf(TITLE) !== -1 && claimText.indexOf("123") !== -1, claimText.slice(0, 160));
    await setInput(VERIFY_URL);
    check("pasted verify URL is parsed", await waitFor(`document.querySelector('.verify-dl') !== null && document.getElementById('verifyResult').textContent.indexOf(${JSON.stringify("v" + VERSION)}) !== -1`),
      await evalJS(`document.getElementById('verifyResult').textContent.slice(0, 160)`));
    await setInput(LEGACY_LINE);
    check("legacy full line still parses", await waitFor(`document.querySelector('.verify-status.ok') !== null`),
      await evalJS(`document.getElementById('verifyResult').textContent.slice(0, 160)`));
    await setInput(CAPTION);
    check("caption alone identifies the current book",
      await waitFor(`document.querySelector('.verify-status.ok') !== null && document.getElementById('verifyResult').textContent.indexOf(${JSON.stringify(TITLE)}) !== -1`),
      await evalJS(`document.getElementById('verifyResult').textContent.slice(0, 160)`));
    await setInput("source: v000000000000 - rows: 123");
    check("caption with an unknown version asks for the URL",
      await waitFor(`document.querySelector('.verify-status.warn') !== null && document.getElementById('verifyResult').textContent.indexOf('Could not identify the book from source') !== -1`),
      await evalJS(`document.getElementById('verifyResult').textContent.slice(0, 160)`));

    // ── Query mode: current, different, unknown ──
    await goto(verifyURL + "?book=" + encodeURIComponent(BOOK) + "&v=" + VERSION, 1280, 900);
    check("query link reports the current version", await waitFor(`document.querySelector('.verify-status.ok') !== null`),
      await evalJS(`document.getElementById('verifyResult').textContent.slice(0, 160)`));
    check("query result names the book", (await evalJS(`document.getElementById('verifyResult').textContent`)).indexOf(TITLE) !== -1);
    await goto(verifyURL + "?book=" + encodeURIComponent(BOOK) + "&v=000000000000", 1280, 900);
    check("a different version warns", await waitFor(`document.querySelector('.verify-status.warn') !== null`),
      await evalJS(`document.getElementById('verifyResult').textContent.slice(0, 160)`));
    await goto(verifyURL + "?book=NO-suchBook&v=000000000000", 1280, 900);
    check("an unknown book is rejected", await waitFor(`document.querySelector('.verify-status.bad') !== null`),
      await evalJS(`document.getElementById('verifyResult').textContent.slice(0, 160)`));

    check("verify page logs no errors", pageErrors.length === 0, pageErrors.join(" | "));

    console.log("\n== " + (checksRun - failures) + " / " + checksRun + " checks passed ==");
    console.log(failures ? "== FAIL ==" : "== ALL PASS ==");
  } finally {
    try { edge.kill(); } catch (e) { /* gone */ }
    await sleep(500);
    try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) { /* Edge may still hold it */ }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
