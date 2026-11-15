// QR tool battery — the sidebar's collapsed Tools group and qr.html: empty state,
// generation at the default and highest error-correction levels (versions
// derived from the app's own wrapper, never hardcoded), the too-long error,
// SVG/PNG downloads, the always-white preview in the dark theme, and the
// Tools → QR link on every sidebar page.
// Run: node tools/hmv-qr-check.mjs  (from codebase/, or anywhere — paths
// resolve relative to this script). Requires Node 20.11+ and Microsoft Edge.
// Env overrides: HMV_QR_PORT (default 9365), HMV_QR_PROFILE.
import fs from "fs";
import path from "path";
import { spawn, execSync } from "child_process";
import { pathToFileURL } from "url";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const baseDir = import.meta.dirname.replace(/\\/g, "/");
const IS_DIST = process.argv.includes("--dist");
const ROOT = baseDir + (IS_DIST ? "/../dist/books/" : "/../src/books/");
const PORT = process.env.HMV_QR_PORT ? parseInt(process.env.HMV_QR_PORT, 10) : 9365;
const PROFILE = process.env.HMV_QR_PROFILE || process.env.TEMP + "\\hmv-qr-profile-" + Date.now();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
let checksRun = 0;
function check(name, cond, detail) {
  console.log((cond ? "PASS  " : "FAIL  ") + name + (detail !== undefined ? "   [" + String(detail).slice(0, 200) + "]" : ""));
  checksRun++;
  if (!cond) failures++;
}

const SRC_JS = path.join(import.meta.dirname, "..", "src", "js");
const { qrCreate } = await import(pathToFileURL(path.join(SRC_JS, "qr.js")));
const { tIn } = await import(pathToFileURL(path.join(SRC_JS, "i18n.js")));

const TEXT = "https://hadithmv.github.io/codebase/verify.html?book=DFK-tauzimullahiWaHukmuShathimih&v=0f2711a29294";
const NAV_TOOLS = tIn("navTools", "dv"); // the fresh profile's current language
const EXPECT_Q = qrCreate(TEXT, "Q");
const EXPECT_H = qrCreate(TEXT, "H");
const TOO_LONG = "x".repeat(4000);
const TOO_LONG_MSG =
  "Too long for this error-correction level — shorten the text or choose a lower level.";

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
    const setText = (v) => evalJS(`(function () {
      var el = document.getElementById('qrText');
      el.value = ${JSON.stringify(v)};
      el.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    const qrURL = pathToFileURL(ROOT + "qr.html").href;

    // ── Sidebar: the collapsed Tools group, expansion, and the click-through ──
    await goto(pathToFileURL(ROOT + "index.html").href, 1280, 900);
    const side = await evalJS(`(function () {
      var d = document.querySelector('details.sidebar-tools');
      var a = d ? d.querySelector('a[href="qr.html"]') : null;
      var s = d ? d.querySelector('summary') : null;
      return d && a && s ? { href: a.getAttribute('href'), open: d.open, summary: s.textContent.trim() } : null;
    })()`);
    check("sidebar Tools group is collapsed by default", side && side.open === false, side ? JSON.stringify(side) : "missing");
    check("sidebar Tools group carries the QR link (current language)",
      side && side.href === "qr.html" && side.summary.indexOf(NAV_TOOLS) !== -1,
      side ? JSON.stringify(side) : "missing");
    await evalJS(`document.querySelector('details.sidebar-tools summary').click()`);
    check("Tools group expands on click", await waitFor(`document.querySelector('details.sidebar-tools').open === true`));
    await evalJS(`document.querySelector('details.sidebar-tools summary').click()`);
    check("Tools group collapses on a second click", await waitFor(`document.querySelector('details.sidebar-tools').open === false`));
    await evalJS(`document.querySelector('details.sidebar-tools summary').click()`);
    await waitFor(`document.querySelector('details.sidebar-tools').open === true`);
    await evalJS(`document.querySelector('a[href="qr.html"]').click()`);
    check("sidebar QR link opens qr.html", await waitFor(`location.pathname.endsWith("/qr.html")`), await evalJS("location.pathname"));
    check("QR page initialises", await waitFor(`document.querySelector('#qrPreview .qr-empty') !== null`));
    const pageDir = await evalJS(`getComputedStyle(document.body).direction`);
    check("QR page is LTR (English-only tool)", pageDir === "ltr", pageDir);
    check("QR placeholder is set", await evalJS(`document.getElementById('qrText').placeholder.length > 0`));
    check("downloads start disabled", await evalJS(`document.getElementById('qrDownloadSvg').disabled && document.getElementById('qrDownloadPng').disabled`));

    // ── Generation: default Q, then H (expected versions from the wrapper) ──
    pageErrors.length = 0;
    await setText(TEXT);
    check("QR renders for the typed text", await waitFor(`document.querySelector('#qrPreview svg') !== null`));
    const metaQ = await evalJS(`document.getElementById('qrMeta').textContent`);
    check("QR Q: version and size match the encoder",
      metaQ.indexOf("version " + EXPECT_Q.version) !== -1 && metaQ.indexOf(EXPECT_Q.size + "×" + EXPECT_Q.size) !== -1, metaQ);
    await evalJS(`(function () {
      var s = document.getElementById('qrEcc');
      s.value = 'H';
      s.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    check("QR H: version and size update",
      await waitFor(`document.getElementById('qrMeta').textContent.indexOf(${JSON.stringify("version " + EXPECT_H.version)}) !== -1`),
      await evalJS(`document.getElementById('qrMeta').textContent`));

    // ── Capacity error ──
    await setText(TOO_LONG);
    check("too-long text shows the capacity error",
      await waitFor(`!document.getElementById('qrError').hidden`),
      await evalJS(`document.getElementById('qrError').textContent`));
    check("too-long error text", (await evalJS(`document.getElementById('qrError').textContent`)) === TOO_LONG_MSG);
    check("too-long clears the preview and disables downloads", await evalJS(`document.querySelector('#qrPreview svg') === null && document.getElementById('qrDownloadSvg').disabled && document.getElementById('qrDownloadPng').disabled`));

    // ── Downloads (captured; the real anchors never navigate) ──
    await setText(TEXT);
    await waitFor(`document.querySelector('#qrPreview svg') !== null`);
    await evalJS(`(function () {
      window.__qrCaps = [];
      window.__qrNames = [];
      var orig = URL.createObjectURL;
      URL.createObjectURL = function (b) { window.__qrCaps.push({ type: b.type, size: b.size }); return orig.call(URL, b); };
      var origClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () {
        if (this.download) { window.__qrNames.push(this.download); return; }
        return origClick.call(this);
      };
    })()`);
    await evalJS(`document.getElementById('qrDownloadSvg').click()`);
    check("SVG download lands", await waitFor(`window.__qrCaps.some(function (c) { return c.type === 'image/svg+xml' && c.size > 500; })`),
      await evalJS(`JSON.stringify(window.__qrCaps)`));
    check("SVG download is named", await evalJS(`window.__qrNames.indexOf('hadithmv-qr.svg') !== -1`), await evalJS(`JSON.stringify(window.__qrNames)`));
    await evalJS(`document.getElementById('qrDownloadPng').click()`);
    check("PNG download lands", await waitFor(`window.__qrCaps.some(function (c) { return c.type === 'image/png' && c.size > 500; })`, 20000),
      await evalJS(`JSON.stringify(window.__qrCaps)`));
    check("PNG download is named", await evalJS(`window.__qrNames.indexOf('hadithmv-qr.png') !== -1`), await evalJS(`JSON.stringify(window.__qrNames)`));

    // ── The QR preview stays white in the dark theme ──
    await evalJS(`localStorage.setItem('theme', 'dark')`);
    await goto(qrURL, 1280, 900);
    await waitFor(`document.querySelector('#qrPreview .qr-empty') !== null`);
    await setText(TEXT);
    await waitFor(`document.querySelector('#qrPreview svg') !== null`);
    const previewStyle = await evalJS(`(function () {
      return {
        bg: getComputedStyle(document.getElementById('qrPreview')).backgroundColor,
        rect: document.querySelector('#qrPreview svg rect').getAttribute('fill'),
      };
    })()`);
    check("QR stays black-on-white in the dark theme",
      previewStyle && previewStyle.bg === "rgb(255, 255, 255)" && previewStyle.rect === "#ffffff",
      JSON.stringify(previewStyle));
    check("QR page logs no errors", pageErrors.length === 0, pageErrors.join(" | "));

    // ── The other sidebar pages carry the link too ──
    for (const page of [
      { file: "library-search.html", query: "" },
      { file: "reader.html", query: "?book=AQD-usooluSiththa" },
    ]) {
      await goto(pathToFileURL(ROOT + page.file).href + page.query, 1280, 900);
      const link = await evalJS(`(function () {
        var d = document.querySelector('details.sidebar-tools');
        var a = d ? d.querySelector('a[href="qr.html"]') : null;
        return d && a ? { href: a.getAttribute('href'), open: d.open } : null;
      })()`);
      check("sidebar Tools group on " + page.file, link && link.href === "qr.html" && link.open === false, JSON.stringify(link));
    }

    console.log("\n== " + (checksRun - failures) + " / " + checksRun + " checks passed ==");
    console.log(failures ? "== FAIL ==" : "== ALL PASS ==");
  } finally {
    try { edge.kill(); } catch (e) { /* gone */ }
    await sleep(500);
    try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) { /* Edge may still hold it */ }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
