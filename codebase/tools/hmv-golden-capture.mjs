// Golden capture for the reader's file-based exports — Word (.doc),
// HTML Book (.html), EPUB (.epub) blob bytes plus the PDF popup's document
// HTML. Run BEFORE refactoring js/export.js: the captured bytes are the
// byte-identity contract for the Phase 2 shared-builder refactor, and
// hmv-info-check.mjs's S8b re-captures the Word export and diffs it against
// tools/golden/reader-word.doc.
//
// Re-run deliberately (and commit the new goldens) after any change that
// alters export output — a version bump (the version footer is part of every
// export), an export-header edit, a builder refactor.
//
// Run: node tools/hmv-golden-capture.mjs  (from codebase/, or anywhere —
// paths resolve relative to this script). Requires Node 20.11+ and Edge.
// Env overrides: HMV_CAPTURE_PORT (default 9362), HMV_CAPTURE_PROFILE,
// HMV_CAPTURE_BOOK (default AQD-usooluSiththa — small, but its head/foot
// columns and AR→DV transitions exercise the builders' branch families).
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

// Machine-specific: path to Microsoft Edge. Adjust per machine/OS.
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const baseDir = import.meta.dirname.replace(/\\/g, "/");
const ROOT = baseDir + "/../books/";
const PORT = process.env.HMV_CAPTURE_PORT ? parseInt(process.env.HMV_CAPTURE_PORT, 10) : 9362;
const PROFILE = process.env.HMV_CAPTURE_PROFILE || (process.env.TEMP + "\\hmv-golden-capture-profile");
const GOLDEN = path.join(baseDir, "golden");
const BOOK = process.env.HMV_CAPTURE_BOOK || "AQD-usooluSiththa";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  fs.rmSync(PROFILE, { recursive: true, force: true });
  fs.mkdirSync(GOLDEN, { recursive: true });
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

  await goto("file://" + ROOT + "reader.html?book=" + BOOK);
  await evalJS(`localStorage.setItem('lang','en')`);
  // Reload with the language pinned — the version footer reads t("appVersion")
  await goto("file://" + ROOT + "reader.html?book=" + BOOK);
  await waitFor(`document.querySelector('#readerContent .reader-chunk')`);

  // Patch the capture hooks BEFORE any export runs: blobs are trapped on
  // URL.createObjectURL (bytes arrive via arrayBuffer), the PDF popup via a
  // fake window.open that records document.write input.
  await evalJS(`(function () {
    window.__cap = [];
    var origUrl = URL.createObjectURL;
    URL.createObjectURL = function (b) {
      var url = origUrl.call(URL, b);
      var idx = window.__cap.length;
      window.__cap.push({ type: b.type, name: b.name || "", size: b.size });
      b.arrayBuffer().then(function (buf) { window.__cap[idx].bytes = Array.from(new Uint8Array(buf)); });
      return url;
    };
    window.__pdf = [];
    window.open = function () {
      return {
        document: {
          write: function (s) { window.__pdf.push(s); },
          close: function () {}
        },
        onload: null,
        print: function () {}
      };
    };
  })()`);

  async function clickFormat(fmt) {
    await evalJS(`document.getElementById('btnExport').click()`);
    await sleep(200);
    await evalJS(`document.querySelector('.export-option[data-format="${fmt}"]').click()`);
  }

  // Word — synchronous blob; wait for the msword bytes
  await clickFormat("word");
  await waitFor(`window.__cap.some(function (e) { return e.type === 'application/msword' && e.bytes; })`, 20000);
  const wordEntry = await evalJS(`window.__cap.find(function (e) { return e.type === 'application/msword' && e.bytes; })`);
  fs.writeFileSync(path.join(GOLDEN, "reader-word.doc"), Buffer.from(wordEntry.bytes));

  // HTML Book — same path, text/html blob
  await clickFormat("html");
  await waitFor(`window.__cap.some(function (e) { return e.type === 'text/html' && e.bytes; })`, 20000);
  const htmlEntry = await evalJS(`window.__cap.find(function (e) { return e.type === 'text/html' && e.bytes; })`);
  fs.writeFileSync(path.join(GOLDEN, "reader-html-book.html"), Buffer.from(htmlEntry.bytes));

  // EPUB — async (font fetch + dynamic import)
  await clickFormat("epub");
  await waitFor(`window.__cap.some(function (e) { return e.type === 'application/epub+zip' && e.bytes; })`, 30000);
  const epubEntry = await evalJS(`window.__cap.find(function (e) { return e.type === 'application/epub+zip' && e.bytes; })`);
  fs.writeFileSync(path.join(GOLDEN, "reader-epub.epub"), Buffer.from(epubEntry.bytes));

  // PDF — captured popup document (the print window is never opened)
  await clickFormat("pdf");
  await waitFor(`window.__pdf.length === 1`, 20000);
  const pdfHtml = await evalJS(`window.__pdf[0]`);
  fs.writeFileSync(path.join(GOLDEN, "reader-pdf.html"), pdfHtml);

  ws.close();
  edge.kill();
  console.log("GOLDEN CAPTURED -> " + GOLDEN);
  console.log("  word  " + wordEntry.size + " bytes");
  console.log("  html  " + htmlEntry.size + " bytes");
  console.log("  epub  " + epubEntry.size + " bytes");
  console.log("  pdf   " + pdfHtml.length + " chars");
}

main().catch((e) => { console.log("ABORT: " + e.message); process.exit(1); });
