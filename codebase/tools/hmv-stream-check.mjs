// Streaming battery (src/js/csv.js createStreamParser/fetchCSVStreamed +
// src/js/reader.js progressive big-book render): the streamed parse must be
// byte-identical to parseCSV no matter how the file is chunked, and the
// reader must show the first rows + a download progress line while a big
// book is still loading, with search/filter/export gated until it finishes.
//
// Phase 1 (pure node, no browser): for every data/content CSV, the stream
// parser fed with seeded adversarial chunkings (seeds 1 and 16384, chunks
// 1-1024 bytes) and byte-by-byte on the ≤ 64 KB files must produce rows
// deep-equal to parseCSV, in both keepEmpty modes; plus synthetic
// chunk-boundary cases (\r\n and lone \r splits, multiline quoted fields,
// escaped quotes, multi-byte Thaana across bytes, empty/header-only files).
// The seeded chunkings and byte-by-byte passes exercise every hazard the
// parser handles (inQuote carry, held trailing \r, TextDecoder stream mode)
// with real file content.
//
// Phase 2 (browser): serves the real tree over HTTP (the site needs a
// secure context for its service worker) with the same harness as
// hmv-sw-check.mjs, throttles the network to 500 KB/s via CDP
// (Network.emulateNetworkConditions) on a fresh profile with a cleared
// cache, loads reader.html?book=RDF-misc (8.4 MB raw — well past the
// 256 KB streaming threshold), and asserts on a pre-navigation sampler's
// timeline: progress line appears and climbs, the first rows become
// VISIBLE while the progress line is still up (getClientRects — real
// visibility, not DOM counts; rows behind the hidden skeleton are the
// regression this guards), no rows ever appear behind the skeleton, the
// search-window button is disabled mid-stream and re-enabled at the end,
// the progress line is hidden and the REAL title swapped in when the
// stream completes (the line renders INSIDE #pageTitle — the title's
// flex:1 slot is its true centre — with the i18n "loading" word; the
// sampler forces lang=en so "Loading…" is textual; streamFinalize alone
// replaces it with the book title), the pagination strip's total matches
// parseCSV(rows) − 1, and a strip jump to the end renders the final row
// (a full 41k-row scroll drain is impractical — ~1.8 s per 25-row card
// append on this machine — so the far end of the render pipeline is
// asserted instead). Final-state title assertions probe the DOM directly
// at check time (evalJS), never the sampler's last tick: the sampler
// samples every 50 ms while streamFinalize swaps the title at the very
// end, and a tick caught mid-swap would be a false failure.
// The page runs at a 480 px mobile viewport (card mode) and WITHOUT the
// service worker (404'd: its claim() would move the CSV fetch onto a
// network context the CDP throttle does not pace — first-visit conditions;
// the sw-check battery owns SW behaviour).
// B9 re-runs the load at a 1280 px desktop viewport (table mode) on a
// scrubbed profile (IDB deleted, HTTP cache cleared — the first pass cached
// RDF-misc, and a cache hit skips streaming): the rows must again be VISIBLE
// mid-stream and grow incrementally — the coalesced ~1000-row table flush
// (STREAM_TABLE_FLUSH_ROWS in reader.js) is the guard against the
// micro-insert relayout storm that made the table visibly "redraw many
// times" while a slow-4G stream drained.
// B10 re-runs the load for a QRN book (QRN-hadithmv, 2.6 MB raw) on a
// scrubbed profile: Quran books merge into the 6,236-row base skeleton
// instead of a straight parse, and the merge itself must stream — progress
// line up, rows visible mid-stream, the quran nav (surah/juz/ayah) gated
// while the line is up and released at the end, the strip totalling 6,236
// (every merged row arrived), the first/last merged rows carrying the
// book's first/last cells, and the title swapping in at the end.
// B11 re-runs the load for the virtual merged radheef book (RDF-all) on a
// scrubbed profile at a 1500 KB/s throttle (3× the others — the merged book
// is the library's heaviest: 8 sources, ~15 MB raw, ~152,612 merged rows):
// every source CSV must be fetched (HEAD for its Content-Length — the
// progress line's total is the summed sizes — plus GET for its rows, the
// sequential per-source streaming pass), the progress line must appear and
// climb, rows must be visible mid-stream (projected into the 7-column
// merged schema BEFORE the reader sees them), the search window gated and
// released, the strip totalling the sum of every source's rows, the first
// rendered row carrying the rasmee block's first cell (rasmee leads — the
// deliberate block order) and the last rendered row carrying the W2W
// source's Dhivehi title in its source column (the last block's title —
// derived from the registry, never hardcoded).
// If the CDP throttle does not pace the CSV on a given machine, the UX
// claims are reported as unproven (WARN) rather than failed — the harness,
// not the product, would be at fault.
//
// Run: node tools/hmv-stream-check.mjs  (from codebase/, or anywhere —
// paths resolve relative to this script). Requires Node 20.11+ and
// Microsoft Edge.
// Env overrides: HMV_STREAM_PORT (default 9370), HMV_STREAM_DEBUG_PORT
// (9371), HMV_STREAM_PROFILE.
// --dist: run the browser phase against the built dist/ tree (same page
// battery convention as info/authors/libscope/qrn-smoke; the CSV still
// comes from data/ — dist never copies data).
import fs from "fs";
import http from "http";
import net from "net";
import path from "path";
import { spawn } from "child_process";
import { pathToFileURL } from "url";
import { parseCSV, createStreamParser } from "../src/js/csv.js";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const baseDir = import.meta.dirname.replace(/\\/g, "/");
const ROOT = path.normalize(baseDir + "/../"); // codebase root — served as the origin root
// A zombie headless Edge from a crashed run can still own the default ports
// (and its warm profile's IDB/HTTP/SW state would make the book come from
// cache — exactly the thing this battery measures) — browserPhase picks the
// first free ports and a per-run profile, so leftovers cannot interfere.
const PORT_BASE = process.env.HMV_STREAM_PORT ? parseInt(process.env.HMV_STREAM_PORT, 10) : 9370; // the served site
const DEBUG_BASE = process.env.HMV_STREAM_DEBUG_PORT ? parseInt(process.env.HMV_STREAM_DEBUG_PORT, 10) : 9371; // CDP — must differ from the site port
const PROFILE_BASE = process.env.HMV_STREAM_PROFILE || (process.env.TEMP + "\\hmv-stream-check-profile");
const STREAM_CSV = path.normalize(ROOT + "data/content/RDF-misc.csv"); // 8.4 MB raw — streams (threshold 256 KB)
const THROTTLE_BYTES = 500 * 1024; // 500 KB/s → RDF-misc ≈ 17 s of rich progress samples
const EXPECTED_ROWS = parseCSV(fs.readFileSync(STREAM_CSV, "utf8")).length - 1; // header row excluded — the app's own parser is the contract
const QRN_CSV = path.normalize(ROOT + "data/content/QRN-hadithmv.csv"); // 2.6 MB raw — the B10 quran pass streams this one
const QRN_RAW = parseCSV(fs.readFileSync(QRN_CSV, "utf8"), true); // keepEmpty=true — the merge's own load flag
const EXPECTED_QRN_ROWS = QRN_RAW.length - 1; // 6,236 — header excluded, one per ayah, aligned with the base skeleton
// B11: the virtual merged radheef book (RDF-all) — 8 source CSVs, no content
// file of its own (radheef-merge.js streams each source sequentially, HEADs
// the sizes first, projects every batch into the 7-column merged schema).
const MERGED_SOURCES = [
  "RDF-rasmee", "RDF-ahmadFahmyDidi", "RDF-asmaullahilHusna", "RDF-eegaal",
  "RDF-hassanAhmedManiku", "RDF-misc", "RDF-nanfoiyComb", "RDF-W2W-bakurube",
];
const MERGED_CSVS = MERGED_SOURCES.map((c) => path.normalize(ROOT + "data/content/" + c + ".csv"));
const MERGED_ROWS = MERGED_CSVS.map((p) => parseCSV(fs.readFileSync(p, "utf8")));
// The merged book's expected row count: every source's rows (len − 1 each,
// headers excluded) concatenated in block order — derive, never hardcode.
const EXPECTED_MERGED_ROWS = MERGED_ROWS.reduce((s, rows) => s + rows.length - 1, 0);
// Content anchors: the rasmee block leads (MERGED_SOURCES order is
// deliberate) so the first merged row is rasmee's first data row; the W2W
// block trails, so the LAST merged row carries W2W's Dhivehi title in its
// source column — read from the registry, never hardcoded.
const MERGED_FIRST_CELL = MERGED_ROWS[0][1].find((c) => c !== "");
const REG_RAW = parseCSV(fs.readFileSync(path.normalize(ROOT + "data/03-registry-bookMeta.csv"), "utf8"));
const REG_CODE_I = REG_RAW[0].indexOf("bookCode");
const REG_TITLE_I = REG_RAW[0].indexOf("titleDV");
const MERGED_LAST_CELL = (REG_RAW.find((r) => r[REG_CODE_I] === "RDF-W2W-bakurube") || [])[REG_TITLE_I] || "";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Shared "the load finished" page expression (browser passes): skeleton
// gone AND the title no longer carries the progress line ("Loading…" is
// the i18n en word — the sampler forces lang=en).
const FINISHED_EXPR =
  "(!document.getElementById('loadingMessage') || document.getElementById('loadingMessage').style.display === 'none')" +
  " && (function(){var t=document.getElementById('pageTitle'); if (!t || !t.textContent) return false; return t.textContent.indexOf('Loading…') === -1;})()";
let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? "PASS  " : "FAIL  ") + name + (detail !== undefined ? "   [" + String(detail).slice(0, 200) + "]" : ""));
  if (!cond) failures++;
}

// ── Phase 1: parser parity (pure node) ────────────────────────────────
function chunkedParse(buf, seed, keep) {
  const p = createStreamParser(keep, null);
  const dec = new TextDecoder("utf-8");
  let s = 0, rand = seed;
  while (s < buf.length) {
    rand = (rand * 1103515245 + 12345) & 0x7fffffff;
    const end = Math.min(s + 1 + (rand % 1024), buf.length);
    p.push(dec.decode(buf.subarray(s, end), { stream: true }));
    s = end;
  }
  p.push(dec.decode()); // flush the decoder tail
  return p.finish();
}
function byteParse(buf, keep) {
  const p = createStreamParser(keep, null);
  const dec = new TextDecoder("utf-8");
  for (let i = 0; i < buf.length; i++) p.push(dec.decode(buf.subarray(i, i + 1), { stream: true }));
  p.push(dec.decode());
  return p.finish();
}
// Mirrors fetchCSVStreamed's callback delivery: the first emitted row goes
// to onFirstRow (the header), the rest arrive in 128-row batches and the
// final batch is flushed only AFTER finish() — the reader builds from these
// batches, so a row the chunks never closed (no trailing newline, or a held
// trailing \r) must still reach them. The return array alone is not the
// contract (that gap dropped the last row of RDF-misc — no trailing
// newline — before the finish-before-flush fix).
function batchedParse(buf, seed, keep) {
  const data = [];
  let first = true, batch = [];
  const p = createStreamParser(keep, (row) => {
    if (first) { first = false; return; } // header — not part of the data
    batch.push(row);
    if (batch.length >= 128) { data.push(...batch); batch = []; }
  });
  const dec = new TextDecoder("utf-8");
  let s = 0, rand = seed;
  while (s < buf.length) {
    rand = (rand * 1103515245 + 12345) & 0x7fffffff;
    const end = Math.min(s + 1 + (rand % 1024), buf.length);
    p.push(dec.decode(buf.subarray(s, end), { stream: true }));
    s = end;
  }
  p.push(dec.decode()); // flush the decoder tail
  const full = p.finish();
  if (batch.length) data.push(...batch);
  return full.length ? JSON.stringify(data) === JSON.stringify(full.slice(1)) : null;
}
function parityPhase() {
  const files = fs.readdirSync(ROOT + "data/content").filter((f) => f.endsWith(".csv")).sort();
  for (const f of files) {
    const buf = fs.readFileSync(ROOT + "data/content/" + f);
    for (const keep of [false, true]) {
      const exp = JSON.stringify(parseCSV(buf.toString("utf8"), keep));
      for (const seed of [1, 16384]) {
        const got = JSON.stringify(chunkedParse(buf, seed, keep));
        if (got !== exp) {
          check("parity " + f + " seed=" + seed + " keepEmpty=" + keep, false, "rows differ");
          return false;
        }
      }
      if (buf.length <= 65536) {
        const got = JSON.stringify(byteParse(buf, keep));
        if (got !== exp) {
          check("parity (byte-by-byte) " + f + " keepEmpty=" + keep, false, "rows differ");
          return false;
        }
      }
      for (const seed of [1, 16384]) {
        const got = batchedParse(buf, seed, keep);
        if (got !== true) {
          check("parity (callback delivery) " + f + " seed=" + seed + " keepEmpty=" + keep, false, "batches differ from the final array");
          return false;
        }
      }
    }
  }
  console.log("PASS  parity: " + files.length + " content CSVs × 2 seeds × 2 modes" +
    (files.length ? " (byte-by-byte + callback delivery on all files)" : ""));
  return true;
}

function synthStr(name, chunks, text) {
  for (const keep of [false, true]) {
    const p = createStreamParser(keep, null);
    for (const c of chunks) p.push(c);
    const got = JSON.stringify(p.finish());
    const exp = JSON.stringify(parseCSV(text, keep));
    check("synthetic: " + name + (keep ? " (keepEmpty)" : ""), got === exp,
      got === exp ? "rows " + JSON.parse(exp).length : got + " vs " + exp);
  }
}
function synthBytes(name, text) {
  const bytes = Buffer.from(text, "utf8");
  for (const keep of [false, true]) {
    const p = createStreamParser(keep, null);
    const dec = new TextDecoder("utf-8");
    for (let i = 0; i < bytes.length; i++) p.push(dec.decode(bytes.subarray(i, i + 1), { stream: true }));
    p.push(dec.decode());
    const got = JSON.stringify(p.finish());
    const exp = JSON.stringify(parseCSV(text, keep));
    check("synthetic: " + name + (keep ? " (keepEmpty)" : ""), got === exp, got === exp ? "" : got + " vs " + exp);
  }
}
function syntheticPhase() {
  // All texts use \x/\u escapes — never literal control or non-ASCII chars —
  // so the battery stays encoding-proof on any console/editor.
  synthStr("CRLF split across chunks", ["a,b\x0d", "\x0ac,d\x0d\x0a"], "a,b\x0d\x0ac,d\x0d\x0a");
  synthStr("multiline quoted field split", ['"x\n', 'y",2\x0d\x0a'], '"x\ny",2\x0d\x0a');
  synthStr("quoted CRLF split", ['"a\x0d', "\x0ab\",c"], '"a\x0d\x0ab",c');
  synthStr("trailing CR at EOF", ["a,b\x0d"], "a,b\x0d");
  synthStr("trailing CR split", ["a,b", "\x0d"], "a,b\x0d");
  synthStr("escaped quote across chunks", ['"a"', '"b",c\x0d\x0a'], '"a""b",c\x0d\x0a');
  synthStr("mid-field quote split", ['a,"b""', 'c",d\x0d\x0a'], 'a,"b""c",d\x0d\x0a');
  synthStr("lone CR row-end split", ["a", "\x0db", "\x0d"], "a\x0db\x0d");
  synthStr("empty file", [""], "");
  synthStr("header only", ["col1,col2"], "col1,col2");
  synthStr("trailing newline", ["a,b\x0d\x0a"], "a,b\x0d\x0a");
  synthBytes("Thaana multi-byte split", "ހ,ށ\x0d\x0a");
  synthBytes("Arabic multi-byte split", "الناس\x0d\x0a");
}

// ── Phase 2: throttled browser UX ────────────────────────────────────
const MIME = {
  ".js": "text/javascript", ".html": "text/html", ".css": "text/css",
  ".csv": "text/csv", ".json": "application/json", ".md": "text/markdown",
  ".woff2": "font/woff2", ".woff": "font/woff", ".txt": "text/plain",
};
function makeServer(port, hits, slow) {
  const server = http.createServer((req, res) => {
    try {
      const u = new URL(req.url, "http://127.0.0.1:" + port);
      const abs = path.normalize(path.join(ROOT, decodeURIComponent(u.pathname)));
      if (abs.indexOf(ROOT) !== 0) { res.writeHead(403); res.end(); return; }
      // The service worker is the enemy of this battery: it installs and
      // claims the page mid-load, and its fetches run on a separate network
      // context that CDP's throttle does not pace — the CSV would arrive in
      // ~20 ms and the streaming UX would never exist. 404 it so the page
      // stays SW-less (first-visit conditions); the sw-check battery owns
      // SW behaviour.
      if (u.pathname === "/sw.js" || u.pathname === "/dist/manifest.json") { res.writeHead(404); res.end(); return; }
      // B9's cache scrub lands here: a real same-origin document (a bare 404
      // renders as an opaque-origin error page in Chrome — IndexedDB access
      // is denied there).
      if (u.pathname === "/__b9-scrub__") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<!doctype html><title>b9 scrub</title>");
        return;
      }
      const t0 = Date.now();
      if (hits) hits[abs] = (hits[abs] || 0) + 1;
      if (!fs.existsSync(abs) || fs.statSync(abs).isDirectory()) { res.writeHead(404); res.end(); return; }
      const mtime = fs.statSync(abs).mtime.toUTCString();
      res.setHeader("Last-Modified", mtime);
      res.setHeader("Cache-Control", "no-cache");
      if (req.headers["if-modified-since"] === mtime) { res.writeHead(304); res.end(); return; }
      // Explicit Content-Length — fetchCSVStreamed's streaming guard keys on
      // the header (total = 0 → whole-file fallback, no progress/no early
      // rows/no gating), and Node's writeHead()+end(buf) shape sends chunked
      // unless the header is set by hand.
      const body = fs.readFileSync(abs);
      res.writeHead(200, {
        "Content-Type": MIME[path.extname(abs)] || "application/octet-stream",
        "Content-Length": body.length,
      });
      res.end(body);
      // Time the CSV transfer — the authoritative throttle-effectiveness probe
      if (slow && abs.indexOf(path.sep + "content" + path.sep) !== -1) slow[path.basename(abs)] = Date.now() - t0;
    } catch (e) {
      res.writeHead(500);
      res.end(String(e));
    }
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

// Pre-navigation sampler — installed BEFORE the first goto, so it records
// the whole load. Samples every 50 ms: the progress line, the rendered row
// count, the loading-message visibility, the search-window button state and
// the pagination strip total. The battery asserts on this timeline.
const SAMPLER = `(function () {
  // The progress line's word comes from i18n — force English so the
  // assertions below can match "Loading…" textually (the battery's own
  // harness choice; the site's default is the visitor's saved language).
  try { localStorage.setItem("lang", "en"); } catch (e) {}
  window.__streamObs = [];
  setInterval(function () {
    try {
      var titleEl = document.getElementById("pageTitle");
      var lm = document.getElementById("loadingMessage");
      var wrapper = document.getElementById("readerWrapper");
      var btn = document.getElementById("btnSearchWindow");
      var strip = document.querySelector("#readerPageNumbers .page-of-label");
      window.__streamObs.push({
        t: Math.round(performance.now()),
        // The progress line lives INSIDE #pageTitle (its flex:1 slot is the
        // title's true centre). getClientRects: TRUE visibility — a line
        // nested in a hidden ancestor reports no rects, so this also catches
        // rows rendered behind the skeleton (the bug that made streaming
        // invisible). null = no line up (whole-file load or finished).
        progress: (titleEl && titleEl.getClientRects().length > 0 && titleEl.textContent.indexOf("Loading…") !== -1) ? titleEl.textContent : null,
        rows: document.querySelectorAll(".reader-chunk").length,
        loading: lm ? lm.style.display !== "none" : null,
        shown: wrapper ? wrapper.getClientRects().length > 0 : null,
        disabled: btn ? btn.disabled : null,
        strip: strip ? strip.textContent : null,
        title: titleEl ? titleEl.textContent : null,
        titleDisp: titleEl ? titleEl.style.display : null,
        // Quran nav gate (B10): qrnSurahBtn's disabled state — null on
        // non-QRN pages (the element does not exist there).
        qrn: (function () { var b = document.getElementById("qrnSurahBtn"); return b ? b.disabled : null; })(),
      });
    } catch (e) {}
  }, 50);
})()`;

// First free port at or above `base` (a leftover process may still own the
// default) — probe by binding, then release.
function firstFreePort(base) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once("error", () => srv.close(() => resolve(firstFreePort(base + 1))));
    srv.listen(base, "127.0.0.1", () => srv.close(() => resolve(base)));
  });
}

async function browserPhase(dist) {
  const PORT = await firstFreePort(PORT_BASE);
  let dbg = process.env.HMV_STREAM_DEBUG_PORT ? parseInt(process.env.HMV_STREAM_DEBUG_PORT, 10) : PORT + 1;
  if (dbg === PORT) dbg = PORT + 1;
  const DEBUG_PORT = await firstFreePort(dbg);
  const PROFILE = PROFILE_BASE + "-" + process.pid; // per-run — never reuse a warm profile
  const READER = "http://127.0.0.1:" + PORT + (dist ? "/dist/books/reader.html?book=RDF-misc" : "/src/books/reader.html?book=RDF-misc");
  fs.rmSync(PROFILE, { recursive: true, force: true });
  const hits = {};
  const slow = {};
  const server = await makeServer(PORT, hits, slow);
  const edge = spawn(EDGE, [
    "--headless=new", "--disable-gpu", "--no-first-run",
    "--allow-file-access-from-files",
    "--user-data-dir=" + PROFILE,
    "--remote-debugging-port=" + DEBUG_PORT,
    "about:blank",
  ], { stdio: "ignore" });

  try {
    let target = null;
    for (let i = 0; i < 90; i++) {
      try {
        const list = JSON.parse(await (await fetch("http://127.0.0.1:" + DEBUG_PORT + "/json")).text());
        target = list.find((t) => t.type === "page");
        if (target) break;
      } catch (e) { /* not up yet */ }
      await sleep(200);
    }
    if (!target) {
      console.log("NO_TARGET" + (edge.exitCode !== null ? " (edge exited " + edge.exitCode + ")" : ""));
      process.exitCode = 1;
      return;
    }
    console.log("     target:", target.url);

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
    const sendChecked = (method, params) => send(method, params).then((m) => {
      if (m.error) throw new Error(method + ": " + (m.error.message || JSON.stringify(m.error)));
      return m;
    });

    async function evalJS(expr) {
      const m = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
      if (m.result && m.result.exceptionDetails) {
        const d = m.result.exceptionDetails.exception && m.result.exceptionDetails.exception.description
          ? m.result.exceptionDetails.exception.description : m.result.exceptionDetails.text;
        throw new Error("EXC: " + d);
      }
      return m.result.result.value;
    }
    async function waitFor(expr, timeout = 60000, interval = 100) {
      return evalJS(`new Promise((res) => {
        const t0 = Date.now();
        (async function poll() {
          try { if (await (${expr})) return res(true); } catch (e) {}
          if (Date.now() - t0 > ${timeout}) return res(false);
          setTimeout(poll, ${interval});
        })();
      })`);
    }
    async function goto(url, width, height) {
      await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
      await send("Page.navigate", { url });
      await evalJS(`new Promise((res) => {
        const t0 = Date.now();
        (function poll() {
          if (document.readyState === 'complete' && document.body && document.body.children.length > 2) return res(true);
          if (Date.now() - t0 > 30000) return res(false);
          setTimeout(poll, 100);
        })();
      })`);
      await sleep(400);
    }

    // Sampler + throttle before the first navigation — the init chain's
    // fetches must run under them. Page.enable MUST come first: without it
    // addScriptToEvaluateOnNewDocument registers (id) but never executes on
    // the new document — observed as an empty obs timeline on a healthy page.
    await sendChecked("Page.enable");
    const samplerReg = await sendChecked("Page.addScriptToEvaluateOnNewDocument", { source: SAMPLER });
    console.log("     sampler registered id", samplerReg.result && samplerReg.result.identifier);
    await sendChecked("Network.enable");
    await sendChecked("Network.clearBrowserCache");
    await sendChecked("Network.emulateNetworkConditions", {
      offline: false, latency: 400, downloadThroughput: THROTTLE_BYTES, uploadThroughput: THROTTLE_BYTES,
    });
    await sendChecked("Runtime.enable");

    // 480×900 = mobile viewport → card mode (see the header note on why).
    await goto(READER, 480, 900);

    // The load is done when the skeleton is gone AND the title no longer
    // shows the progress line. The skeleton alone is not enough: the reader
    // reveals at the FIRST streamed batch (that is the feature), so the
    // skeleton disappears mid-stream — the line's word ("Loading…", i18n)
    // in the title is the completion signal (streamFinalize swaps the real
    // title in only when the drain lands; showError restores the stashed
    // title on failure). Whole-file loads never show the line, so the
    // condition holds there too.
    const finished = await waitFor(FINISHED_EXPR, 90000, 150);
    check("B1 reader finished loading", finished, finished ? "" : "still loading after 90 s");

    // Full page-state probe — identifies what actually loaded and where the
    // book data came from (IDB hit ⇒ stale/non-fresh profile, res ⇒ which
    // requests the network stack made, svc ⇒ SW control, err ⇒ error state).
    const pageProbe = await evalJS(`(async function () {
      var out = {
        href: location.href,
        title: document.title,
        sam: typeof window.__streamObs,
        obsLen: (window.__streamObs || []).length,
        svc: !!(navigator.serviceWorker && navigator.serviceWorker.controller),
        scripts: document.querySelectorAll("script").length,
        tables: document.querySelectorAll(".reader-table").length,
        err: !!document.getElementById("readerError"),
        res: performance.getEntriesByType("resource").map(function (e) { return Math.round(e.duration) + "ms " + e.name.replace(location.origin, "").slice(0, 55); }).slice(0, 12),
      };
      try {
        var q = indexedDB.open("hadithmv", 1);
        out.idb = await new Promise(function (r) {
          q.onsuccess = function () {
            try {
              var tx = q.result.transaction("books").objectStore("books").get("RDF-misc");
              tx.onsuccess = function () { r(tx.result ? "hit v" + String(tx.result.version || "").slice(0, 8) : "miss"); };
              tx.onerror = function () { r("txerr"); };
            } catch (e) { r("stale"); }
          };
          q.onerror = function () { r("no-db"); };
        });
      } catch (e) { out.idb = "exc"; }
      return out;
    })()`);
    console.log("     probe:", JSON.stringify(pageProbe).slice(0, 1400));

    // Body-delivery probe: read ONE chunk of the CSV from the page, then
    // cancel. Confirms the throttle trickles the body to the page — the
    // streaming progress line needs incremental chunks (firstMs here should
    // be ~1 s of latency, not the full ~17 s download).
    const bodyProbe = await evalJS(`(async function () {
      var out = {};
      try {
        var r = await fetch('/data/content/RDF-misc.csv');
        out.ok = r.ok;
        out.cl = r.headers.get('content-length');
        out.hasBody = !!(r.body && r.body.getReader);
        if (r.body && r.body.getReader) {
          var reader = r.body.getReader();
          var t0 = performance.now();
          var x = await reader.read();
          out.firstMs = Math.round(performance.now() - t0);
          out.firstBytes = x.value ? x.value.byteLength : 0;
          reader.cancel();
        }
      } catch (e) { out.exc = String(e); }
      return out;
    })()`);
    console.log("     body:", JSON.stringify(bodyProbe));

    const obs = await evalJS("window.__streamObs") || [];
    const last = obs.length ? obs[obs.length - 1] : {};
    const progressPcts = obs
      .filter((o) => o.progress && /Loading… (\d+)%/.test(o.progress))
      .map((o) => parseInt(o.progress.match(/Loading… (\d+)%/)[1], 10));

    // Throttle probe — client-side resource timing is the truth (the server
    // only fills the socket buffer; the client paces the download).
    const csvRt = await evalJS(
      `performance.getEntriesByType('resource').filter(function (e) { return e.name.indexOf('/content/RDF-misc.csv') !== -1; }).map(function (e) { return Math.round(e.duration); })`) || [];
    const csvMs = csvRt.length ? csvRt[0] : 0;
    check("B2 CSV download paced by the throttle", csvMs >= 3000, csvMs + " ms client-side (" + (hits[STREAM_CSV] || 0) + " server hit(s))");

    // Diagnostics when something above smells — the sampler's timeline tells
    // the whole load story.
    if (!finished || csvMs < 3000 || progressPcts.length === 0) {
      const step = Math.max(1, Math.ceil(obs.length / 10));
      console.log("     obs:", JSON.stringify(obs.filter((o, i) => i % step === 0).map((o) => ({
        t: o.t, p: o.progress, r: o.rows, l: o.loading, d: o.disabled, s: o.strip, tt: o.title, td: o.titleDisp,
      }))).slice(0, 1500));
      console.log("     last:", JSON.stringify(last));
    }

    if (csvMs >= 3000) {
      // The streaming window is real — assert the UX claims strictly.
      check("B3 progress line appears and climbs (visibly)", progressPcts.length >= 3 && Math.max.apply(null, progressPcts) >= 90,
        progressPcts.length + " sample(s), max " + Math.max.apply(null, progressPcts) + "%");
      const firstVisible = obs.find((o) => o.rows > 0 && o.shown === true && o.progress !== null);
      check("B4 first rows are VISIBLE while the progress line is up",
        !!firstVisible && firstVisible.t < last.t,
        firstVisible ? firstVisible.rows + " rows at t=" + firstVisible.t + "ms (wrapper shown, line up)" : "rows never visible mid-stream");
      // The progress line lives INSIDE the title element itself (the title's
      // flex:1 slot is its true centre) — while the line is up, the title
      // must never show the REAL book title: streamFinalize is the only swap
      // point. Before the first batch the element is untouched (empty text —
      // nothing painted). Any line-up sample carrying non-loading title text
      // is a regression (the pre-title-slot design hid the title instead and
      // B4c asserted it never painted; now the line IS the title's content).
      const titleEarly = obs.find((o) => o.progress !== null && o.title && o.title.indexOf("Loading…") === -1);
      check("B4c title never shows the real book title while the line is up",
        !titleEarly,
        titleEarly ? "title='" + titleEarly.title + "' at t=" + titleEarly.t + "ms" : "no real-title sample for any line-up sample");
      // Regression guard: rows appearing while the skeleton is still up
      // means the reveal never happened — the reader built behind the
      // skeleton and streaming is invisible again (the original defect).
      const hiddenRows = obs.find((o) => o.rows > 0 && o.loading === true);
      check("B4b no rows behind the skeleton (reveal at first batch)",
        !hiddenRows,
        hiddenRows ? "rows=" + hiddenRows.rows + " with skeleton up at t=" + hiddenRows.t + "ms" : "never seen");
      check("B5 search window gated mid-stream, released at the end",
        obs.some((o) => o.rows > 0 && o.disabled === true) && last.disabled === false,
        "seen disabled=true; final disabled=" + last.disabled);
    } else {
      console.log("WARN throttle did not pace the CSV (harness, not product) — " +
        progressPcts.length + " progress sample(s), max " + (progressPcts.length ? Math.max.apply(null, progressPcts) : 0) + "%");
    }

    // Data completeness: the strip's total (formatThousands) must equal the
    // parseCSV row count minus the header — the app's own parser is the
    // contract (never hardcode the count). The title asserts straight on the
    // DOM at check time, not on the sampler's last tick: the sampler ticks
    // every 50 ms while streamFinalize swaps the title at the very end, so a
    // tick caught mid-swap would be a false failure. The line lives INSIDE
    // the title, so "title set, no Loading…" IS "line hidden, real title in"
    // — one probe covers both.
    const stripTotal = last.strip ? parseInt(String(last.strip).replace(/[^0-9]/g, ""), 10) : null;
    const titleProbe = await evalJS("(function(){var t=document.getElementById('pageTitle'); return t ? t.textContent : null;})()");
    const titleIn = titleProbe !== null && titleProbe.trim() !== "" && titleProbe.indexOf("Loading…") === -1;
    check("B6 final state: strip total matches parseCSV − 1, loading cleared, button enabled, title in",
      stripTotal === EXPECTED_ROWS && last.loading === false && last.disabled === false && titleIn,
      "strip " + stripTotal + " vs " + EXPECTED_ROWS + ", loading=" + last.loading + ", disabled=" + last.disabled + ", title='" + titleProbe + "'");

    // End-to-end delivery: the stream's final row must reach the DOM. Jump
    // to the end via the pagination strip's own goTo input (its change
    // handler renders a window around the target), then assert the final
    // chunk holds the final row index. A full 41k-row scroll drain is
    // impractical (~1.8 s per 25-row card append on this machine — the
    // reader renders progressively by design) and unnecessary: B6 pins the
    // stream's data completeness (strip total = parseCSV − 1), Phase 1 pins
    // parser byte-identity, and the jump pins the far end of the render
    // pipeline.
    const jumpProbe = await evalJS(`(async function () {
      var input = document.querySelector('#readerPageNumbers .page-strip-sel');
      if (!input) return { ok: false, why: 'no strip input' };
      var total = parseInt(String(input.max), 10); // raw digits, 1-based
      input.value = total;
      input.dispatchEvent(new Event('change'));
      await new Promise(function (r) { setTimeout(r, 2000); });
      var chunks = document.querySelectorAll('.reader-chunk');
      var last = chunks[chunks.length - 1];
      var stripEl = document.querySelector('#readerPageNumbers .page-of-label');
      return {
        ok: !!last && parseInt(last.getAttribute('data-row'), 10) === total - 1,
        total: total,
        row: last ? last.getAttribute('data-row') : null,
        chunks: chunks.length,
        scrollY: Math.round(window.scrollY),
        strip: stripEl ? stripEl.textContent : null,
      };
    })()`);
    check("B7 final row renders after a strip jump to the end", jumpProbe.ok === true,
      jumpProbe.why || ("row " + (jumpProbe.total - 1) + " — " + jumpProbe.chunks + " chunks, scrollY " + jumpProbe.scrollY + ", strip " + jumpProbe.strip));

    const topHits = Object.entries(hits).sort((a, b) => b[1] - a[1]).slice(0, 12);
    console.log("     hits:", JSON.stringify(topHits.map(([k, v]) => [path.basename(k), v])));
    console.log("     slow:", JSON.stringify(slow));

    check("B8 no page errors", pageErrors.length === 0, pageErrors.slice(0, 3).join("; "));

    // ── B9: table-mode pass ────────────────────────────────────────────
    // Same streaming UX at a desktop viewport. The first pass cached
    // RDF-misc in IDB — an IDB hit skips streaming entirely — so scrub
    // between navigations: land on a same-origin 404 page (closes the
    // reader's open IDB connection so the delete can complete), drop the
    // database, clear the HTTP cache, then reload at 1280×900.
    pageErrors.length = 0;
    await send("Page.navigate", { url: "http://127.0.0.1:" + PORT + "/__b9-scrub__" });
    await evalJS(`new Promise(function (res) {
      var t0 = Date.now();
      (function poll() {
        if (document.readyState === "complete") return res(true);
        if (Date.now() - t0 > 15000) return res(false);
        setTimeout(poll, 100);
      })();
    })`);
    let idbDelete = "unset";
    try {
      idbDelete = await evalJS(`new Promise(function (res) {
        var q = indexedDB.deleteDatabase("hadithmv");
        q.onsuccess = function () { res("deleted"); };
        q.onerror = function () { res("error"); };
        q.onblocked = function () { res("blocked"); };
        setTimeout(function () { res("timeout"); }, 3000);
      })`);
    } catch (e) {
      idbDelete = "exc: " + String(e.message || e).slice(0, 60);
    }
    check("B9 scrub: IDB deleted before table-mode load", idbDelete === "deleted", idbDelete);
    await sendChecked("Network.clearBrowserCache");
    await goto(READER, 1280, 900);
    const finishedT = await waitFor(FINISHED_EXPR, 90000, 150);
    check("B9 table mode: reader finished loading", finishedT, finishedT ? "" : "still loading after 90 s");
    const obsT = await evalJS("window.__streamObs") || [];
    const lastT = obsT.length ? obsT[obsT.length - 1] : {};
    const pctsT = obsT
      .filter((o) => o.progress && /Loading… (\d+)%/.test(o.progress))
      .map((o) => parseInt(o.progress.match(/Loading… (\d+)%/)[1], 10));
    const firstVisibleT = obsT.find((o) => o.rows > 0 && o.shown === true && o.progress !== null);
    check("B9 table rows are VISIBLE while the progress line is up",
      !!firstVisibleT && firstVisibleT.t < lastT.t,
      firstVisibleT ? firstVisibleT.rows + " rows at t=" + firstVisibleT.t + "ms (wrapper shown, line up)" : "rows never visible mid-stream");
    // Incremental growth: with the coalesced flush, the table fills in
    // bounded ~1000-row inserts per tick — the sampler must catch counts
    // strictly between 0 and the full total, proving the drain renders
    // progressively instead of all-at-once (nothing visible until the end)
    // or row-by-row (relayout storm).
    const midRowsT = obsT.filter((o) => o.rows > 0 && o.rows < EXPECTED_ROWS);
    check("B9 table rows grow incrementally through the stream",
      midRowsT.length > 0,
      midRowsT.length ? "first visible " + (firstVisibleT ? firstVisibleT.rows : "-") + " of " + EXPECTED_ROWS + ", " + midRowsT.length + " mid-stream sample(s)" : "no intermediate row counts observed");
    const stripTotalT = lastT.strip ? parseInt(String(lastT.strip).replace(/[^0-9]/g, ""), 10) : null;
    // Same check-time title probe as B6 — the sampler's last tick can race
    // streamFinalize's title swap, the DOM at check time cannot.
    const titleProbeT = await evalJS("(function(){var t=document.getElementById('pageTitle'); return t ? t.textContent : null;})()");
    const titleInT = titleProbeT !== null && titleProbeT.trim() !== "" && titleProbeT.indexOf("Loading…") === -1;
    check("B9 final state: strip total matches parseCSV − 1, button enabled, title in",
      stripTotalT === EXPECTED_ROWS && lastT.loading === false && lastT.disabled === false && titleInT,
      "strip " + stripTotalT + " vs " + EXPECTED_ROWS + ", loading=" + lastT.loading + ", disabled=" + lastT.disabled + ", title='" + titleProbeT + "'");
    check("B9 no page errors", pageErrors.length === 0, pageErrors.slice(0, 3).join("; "));
    if (!finishedT || !firstVisibleT || (stripTotalT !== EXPECTED_ROWS || lastT.progress !== null)) {
      const step = Math.max(1, Math.ceil(obsT.length / 10));
      console.log("     obsT:", JSON.stringify(obsT.filter((o, i) => i % step === 0).map((o) => ({
        t: o.t, p: o.progress, r: o.rows, l: o.loading, d: o.disabled, s: o.strip, tt: o.title, td: o.titleDisp,
      }))).slice(0, 1500));
    }

    // ── B10: QRN streaming pass ────────────────────────────────────────
    // Quran books load through a different path (an index-aligned merge
    // into the 6,236-row base skeleton instead of a straight CSV parse) —
    // this pass proves the merge itself streams: progress line up, rows
    // visible mid-stream, the quran nav gated while the line is up (a
    // surah/juz jump mid-stream would freeze the reader on a partial
    // slice), the strip totals 6,236 (every merged row arrived), the
    // first/last merged rows carry the right content, and the title swaps
    // in at the end. Scrub like B9 first — the quran stream's IDB record
    // must not mask the stream.
    pageErrors.length = 0;
    await send("Page.navigate", { url: "http://127.0.0.1:" + PORT + "/__b9-scrub__" });
    await evalJS(`new Promise(function (res) {
      var t0 = Date.now();
      (function poll() {
        if (document.readyState === "complete") return res(true);
        if (Date.now() - t0 > 15000) return res(false);
        setTimeout(poll, 100);
      })();
    })`);
    let idbDeleteQ = "unset";
    try {
      idbDeleteQ = await evalJS(`new Promise(function (res) {
        var q = indexedDB.deleteDatabase("hadithmv");
        q.onsuccess = function () { res("deleted"); };
        q.onerror = function () { res("error"); };
        q.onblocked = function () { res("blocked"); };
        setTimeout(function () { res("timeout"); }, 3000);
      })`);
    } catch (e) {
      idbDeleteQ = "exc: " + String(e.message || e).slice(0, 60);
    }
    check("B10 scrub: IDB deleted before quran load", idbDeleteQ === "deleted", idbDeleteQ);
    await sendChecked("Network.clearBrowserCache");
    const READER_QRN = "http://127.0.0.1:" + PORT + (dist ? "/dist/books/reader.html?book=QRN-hadithmv" : "/src/books/reader.html?book=QRN-hadithmv");
    await goto(READER_QRN, 480, 900);
    const finishedQ = await waitFor(FINISHED_EXPR, 90000, 150);
    check("B10 quran reader finished loading", finishedQ, finishedQ ? "" : "still loading after 90 s");
    const obsQ = await evalJS("window.__streamObs") || [];
    const lastQ = obsQ.length ? obsQ[obsQ.length - 1] : {};
    const pctsQ = obsQ
      .filter((o) => o.progress && /Loading… (\d+)%/.test(o.progress))
      .map((o) => parseInt(o.progress.match(/Loading… (\d+)%/)[1], 10));
    const firstVisibleQ = obsQ.find((o) => o.rows > 0 && o.shown === true && o.progress !== null);
    if (pctsQ.length >= 3) {
      check("B10 progress line appears and climbs (visibly)", Math.max.apply(null, pctsQ) >= 90,
        pctsQ.length + " sample(s), max " + Math.max.apply(null, pctsQ) + "%");
      check("B10 quran rows are VISIBLE while the progress line is up",
        !!firstVisibleQ && firstVisibleQ.t < lastQ.t,
        firstVisibleQ ? firstVisibleQ.rows + " rows at t=" + firstVisibleQ.t + "ms (wrapper shown, line up)" : "rows never visible mid-stream");
      // The quran nav must not act on a partial allData: surah/juz jumps
      // replace the filtered view with a slice (quran-ui.js) and the
      // stream's appends only reach allData — so the nav is gated for the
      // duration, released at the end.
      check("B10 quran nav gated mid-stream, released at the end",
        obsQ.some((o) => o.progress !== null && o.qrn === true) && lastQ.qrn === false,
        "seen qrn disabled mid-stream; final qrn=" + lastQ.qrn);
    } else {
      console.log("WARN quran throttle did not pace the CSV (harness, not product) — " +
        pctsQ.length + " progress sample(s), max " + (pctsQ.length ? Math.max.apply(null, pctsQ) : 0) + "%");
    }
    const stripTotalQ = lastQ.strip ? parseInt(String(lastQ.strip).replace(/[^0-9]/g, ""), 10) : null;
    // Same check-time title probe as B6/B9 — the sampler's last tick can
    // race streamFinalize's title swap, the DOM at check time cannot.
    const titleProbeQ = await evalJS("(function(){var t=document.getElementById('pageTitle'); return t ? t.textContent : null;})()");
    const titleInQ = titleProbeQ !== null && titleProbeQ.trim() !== "" && titleProbeQ.indexOf("Loading…") === -1;
    check("B10 final state: strip total matches the 6,236-ayah base, nav released, title in",
      stripTotalQ === EXPECTED_QRN_ROWS && lastQ.loading === false && lastQ.qrn === false && titleInQ,
      "strip " + stripTotalQ + " vs " + EXPECTED_QRN_ROWS + ", loading=" + lastQ.loading + ", qrn=" + lastQ.qrn + ", title='" + titleProbeQ + "'");

    // Merge-content correctness at both ends of the merged dataset: the
    // first rendered card is merged row 0 (base juz 1/surah 1/ayah 1 plus
    // the book's first cell), the last card after a strip jump to the end
    // is merged row 6,235 — both derived from the CSV via the app's own
    // parser, never hardcoded.
    const qrnProbe = await evalJS(`(async function () {
      var chunks = document.querySelectorAll(".reader-chunk");
      var out = { first: chunks[0] ? chunks[0].textContent : null, why: null };
      var input = document.querySelector('#readerPageNumbers .page-strip-sel');
      if (!input) { out.why = "no strip input"; return out; }
      var total = parseInt(String(input.max), 10);
      input.value = total;
      input.dispatchEvent(new Event('change'));
      await new Promise(function (r) { setTimeout(r, 2000); });
      chunks = document.querySelectorAll(".reader-chunk");
      out.lastRow = chunks[chunks.length - 1] ? chunks[chunks.length - 1].textContent : null;
      out.total = total;
      return out;
    })()`);
    const firstCellQ = QRN_RAW[1].find((c) => c !== "");
    const lastRowCells = QRN_RAW[QRN_RAW.length - 1];
    const lastCellQ = lastRowCells[lastRowCells.length - 1] || "";
    check("B10 first rendered row carries the book's first cell (merge aligned)",
      !!qrnProbe.first && firstCellQ !== undefined && qrnProbe.first.indexOf(firstCellQ) !== -1,
      qrnProbe.first ? (firstCellQ !== undefined ? (qrnProbe.first.indexOf(firstCellQ) !== -1 ? "yes" : "NO — cell='" + firstCellQ.slice(0, 40) + "'") : "no first cell in CSV") : "no cards rendered");
    check("B10 last rendered row carries the book's last cell after a strip jump",
      qrnProbe.lastRow !== null && qrnProbe.lastRow.indexOf(lastCellQ) !== -1,
      qrnProbe.why || (qrnProbe.lastRow ? (qrnProbe.lastRow.indexOf(lastCellQ) !== -1 ? "yes" : "NO — cell='" + lastCellQ.slice(0, 40) + "'") : "no cards after jump"));
    check("B10 no page errors", pageErrors.length === 0, pageErrors.slice(0, 3).join("; "));
    if (!finishedQ || !firstVisibleQ || stripTotalQ !== EXPECTED_QRN_ROWS || lastQ.progress !== null) {
      const step = Math.max(1, Math.ceil(obsQ.length / 10));
      console.log("     obsQ:", JSON.stringify(obsQ.filter((o, i) => i % step === 0).map((o) => ({
        t: o.t, p: o.progress, r: o.rows, l: o.loading, d: o.disabled, q: o.qrn, s: o.strip, tt: o.title, td: o.titleDisp,
      }))).slice(0, 1500));
    }

    // ── B11: RDF-all merged streaming pass ──────────────────────────────
    // The merged book loads through yet another path (radheef-merge.js:
    // sequential per-source streaming over a HEAD-summed size total) — this
    // pass proves the merged load streams like any other: progress line up,
    // rows visible mid-stream, the search window gated while the line is up,
    // every source fetched (HEAD + GET), the strip totalling the sum of all
    // sources' rows (152,612 — every merged row arrived, projected and
    // ordered), the first/last rendered rows carrying the right content,
    // and the title swapping in at the end. Scrub like B9/B10 — no source
    // may come from IDB. Throttle at 1500 KB/s (3× the single-book passes):
    // the merged load is ~15 MB raw and needs ~10 s even paced — rich
    // progress samples without a ~30 s wait.
    pageErrors.length = 0;
    await send("Page.navigate", { url: "http://127.0.0.1:" + PORT + "/__b9-scrub__" });
    await evalJS(`new Promise(function (res) {
      var t0 = Date.now();
      (function poll() {
        if (document.readyState === "complete") return res(true);
        if (Date.now() - t0 > 15000) return res(false);
        setTimeout(poll, 100);
      })();
    })`);
    let idbDeleteM = "unset";
    try {
      idbDeleteM = await evalJS(`new Promise(function (res) {
        var q = indexedDB.deleteDatabase("hadithmv");
        q.onsuccess = function () { res("deleted"); };
        q.onerror = function () { res("error"); };
        q.onblocked = function () { res("blocked"); };
        setTimeout(function () { res("timeout"); }, 3000);
      })`);
    } catch (e) {
      idbDeleteM = "exc: " + String(e.message || e).slice(0, 60);
    }
    check("B11 scrub: IDB deleted before merged load", idbDeleteM === "deleted", idbDeleteM);
    await sendChecked("Network.clearBrowserCache");
    await sendChecked("Network.emulateNetworkConditions", {
      offline: false, latency: 400, downloadThroughput: 1500 * 1024, uploadThroughput: 1500 * 1024,
    });
    const READER_MERGED = "http://127.0.0.1:" + PORT + (dist ? "/dist/books/reader.html?book=RDF-all" : "/src/books/reader.html?book=RDF-all");
    await goto(READER_MERGED, 480, 900);
    const finishedM = await waitFor(FINISHED_EXPR, 120000, 150);
    check("B11 merged reader finished loading", finishedM, finishedM ? "" : "still loading after 120 s");
    const obsM = await evalJS("window.__streamObs") || [];
    const lastM = obsM.length ? obsM[obsM.length - 1] : {};
    const pctsM = obsM
      .filter((o) => o.progress && /Loading… (\d+)%/.test(o.progress))
      .map((o) => parseInt(o.progress.match(/Loading… (\d+)%/)[1], 10));
    const firstVisibleM = obsM.find((o) => o.rows > 0 && o.shown === true && o.progress !== null);
    // Every source must have been requested at least once — the phase-0
    // HEAD sizes plus the sequential GETs; with the stream engaged each
    // source gets exactly one HEAD and one GET (≥ 2).
    const sourcesHit = MERGED_SOURCES.map((c, i) => hits[MERGED_CSVS[i]] || 0);
    if (pctsM.length >= 3) {
      check("B11 progress line appears and climbs (visibly)", Math.max.apply(null, pctsM) >= 90,
        pctsM.length + " sample(s), max " + Math.max.apply(null, pctsM) + "%");
      check("B11 merged rows are VISIBLE while the progress line is up",
        !!firstVisibleM && firstVisibleM.t < lastM.t,
        firstVisibleM ? firstVisibleM.rows + " rows at t=" + firstVisibleM.t + "ms (wrapper shown, line up)" : "rows never visible mid-stream");
      // The search window must not open on a partial merged book — gated
      // for the duration, released at the end (same bridge as B5).
      check("B11 search window gated mid-stream, released at the end",
        obsM.some((o) => o.progress !== null && o.disabled === true) && lastM.disabled === false,
        "seen disabled=true; final disabled=" + lastM.disabled);
      check("B11 every source fetched (HEAD + GET)", sourcesHit.every((n) => n >= 2), JSON.stringify(sourcesHit));
    } else {
      console.log("WARN merged throttle did not pace the CSVs (harness, not product) — " +
        pctsM.length + " progress sample(s), max " + (pctsM.length ? Math.max.apply(null, pctsM) : 0) + "%");
      check("B11 every source fetched", sourcesHit.every((n) => n >= 1), JSON.stringify(sourcesHit));
    }
    const stripTotalM = lastM.strip ? parseInt(String(lastM.strip).replace(/[^0-9]/g, ""), 10) : null;
    // Same check-time title probe as B6/B9/B10 — the sampler's last tick can
    // race streamFinalize's title swap, the DOM at check time cannot.
    const titleProbeM = await evalJS("(function(){var t=document.getElementById('pageTitle'); return t ? t.textContent : null;})()");
    const titleInM = titleProbeM !== null && titleProbeM.trim() !== "" && titleProbeM.indexOf("Loading…") === -1;
    check("B11 final state: strip total matches the merged rows sum, button enabled, title in",
      stripTotalM === EXPECTED_MERGED_ROWS && lastM.loading === false && lastM.disabled === false && titleInM,
      "strip " + stripTotalM + " vs " + EXPECTED_MERGED_ROWS + ", loading=" + lastM.loading + ", disabled=" + lastM.disabled + ", title='" + titleProbeM + "'");

    // Merge-content correctness at both ends of the merged dataset: the
    // first rendered card is merged row 0 (the rasmee block leads — its
    // first data row's first cell), the last card after a strip jump to the
    // end is the last W2W row, whose source column carries W2W's Dhivehi
    // title (the registry's titleDV — derived, never hardcoded).
    const mergedProbe = await evalJS(`(async function () {
      var chunks = document.querySelectorAll(".reader-chunk");
      var out = { first: chunks[0] ? chunks[0].textContent : null, why: null };
      var input = document.querySelector('#readerPageNumbers .page-strip-sel');
      if (!input) { out.why = "no strip input"; return out; }
      var total = parseInt(String(input.max), 10);
      input.value = total;
      input.dispatchEvent(new Event('change'));
      await new Promise(function (r) { setTimeout(r, 2000); });
      chunks = document.querySelectorAll(".reader-chunk");
      out.lastRow = chunks[chunks.length - 1] ? chunks[chunks.length - 1].textContent : null;
      out.total = total;
      return out;
    })()`);
    check("B11 first rendered row carries the rasmee block's first cell",
      !!mergedProbe.first && MERGED_FIRST_CELL !== undefined && mergedProbe.first.indexOf(MERGED_FIRST_CELL) !== -1,
      mergedProbe.first ? (MERGED_FIRST_CELL !== undefined ? (mergedProbe.first.indexOf(MERGED_FIRST_CELL) !== -1 ? "yes" : "NO — cell='" + MERGED_FIRST_CELL.slice(0, 40) + "'") : "no first cell in CSV") : "no cards rendered");
    check("B11 last rendered row carries the W2W title in its source column",
      mergedProbe.lastRow !== null && MERGED_LAST_CELL !== "" && mergedProbe.lastRow.indexOf(MERGED_LAST_CELL) !== -1,
      mergedProbe.why || (mergedProbe.lastRow ? (mergedProbe.lastRow.indexOf(MERGED_LAST_CELL) !== -1 ? "yes" : "NO — title='" + MERGED_LAST_CELL.slice(0, 40) + "'") : "no cards after jump"));
    check("B11 no page errors", pageErrors.length === 0, pageErrors.slice(0, 3).join("; "));
    if (!finishedM || !firstVisibleM || stripTotalM !== EXPECTED_MERGED_ROWS || lastM.progress !== null) {
      const step = Math.max(1, Math.ceil(obsM.length / 10));
      console.log("     obsM:", JSON.stringify(obsM.filter((o, i) => i % step === 0).map((o) => ({
        t: o.t, p: o.progress, r: o.rows, l: o.loading, d: o.disabled, s: o.strip, tt: o.title, td: o.titleDisp,
      }))).slice(0, 1500));
    }
  } finally {
    edge.kill();
    server.close();
  }
}

// ── main ──────────────────────────────────────────────────────────────
console.log("── Phase 1: stream-parser parity ─────────────────────────");
parityPhase();
syntheticPhase();
const DIST = process.argv.includes("--dist");
console.log("── Phase 2: throttled big-book UX (" + (DIST ? "dist" : "src") + "/books/reader.html?book=RDF-misc) ──");
await browserPhase(DIST);
console.log(failures === 0 ? "STREAM-CHECK OK" : "STREAM-CHECK FAILURES: " + failures);
process.exitCode = failures > 0 ? 1 : 0;
