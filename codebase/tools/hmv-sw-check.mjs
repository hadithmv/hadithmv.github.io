// Service worker battery (codebase/sw.js + dist/manifest.json) — the
// fingerprint-ledger offline layer. The site is served over HTTP (a service
// worker needs a secure context — file:// and the other batteries' harness
// cannot host one), so this battery brings its own tiny static server:
// the real codebase tree, with correct MIME types and Last-Modified/304 so
// the manifest's conditional GETs behave like GitHub Pages.
//
// Run: node tools/hmv-sw-check.mjs  (from codebase/, or anywhere — paths
// resolve relative to this script). Requires Node 20.11+ and Microsoft Edge.
// No --dist mode: this battery tests the real served tree (dist/) — there is
// no src-mode equivalent of a service worker.
// Env overrides: HMV_SW_PORT (default 9367), HMV_SW_UPDATE_PORT (9368),
// HMV_SW_PROFILE.
//
// Checks:
//  S0  every page (src and dist) carries the registration snippet, pointing
//      at ../../sw.js
//  S2  dist/manifest.json is fresh and complete: every key's file exists
//      with the hashed bytes, every served file (books/js/css/font,
//      02/03-registry, all notes) is listed, and the IDB-owned files
//      (data/content/*, search-index.json) are absent — the run-before-
//      commit gate: a stale manifest fails here first
//  S1  first visit: the SW registers at the site root scope, installs, and
//      precaches the whole manifest (hmv-files + hmv-manifest caches exist)
//  S3  second visit: the SW controls the page (controller set) and serves
//      resources from cache (transferSize 0 on dist/ resources)
//  S4  offline (CDP network emulation): the page and the book still render
//      — HTML/scripts/font from the SW cache, the book from the app's own
//      IndexedDB cache
//  S5  update propagation, on a second origin: the sw.js served there is the
//      real file with MANIFEST_REFRESH_MS replaced by 0, so every visit
//      re-fetches the manifest. Visit 1 precaches a notes file; the note's
//      content and fingerprint change on disk; visit 2 re-fetches exactly
//      that file (the marker appears, and the page's JS is never re-
//      requested — unchanged fingerprints stay cache-served); visit 3 keeps
//      serving it from cache. The manifest itself is re-fetched every visit
//      (network-first) — the server's hit counter proves it.
//  S6  no page errors on any visit
import fs from "fs";
import http from "http";
import os from "os";
import path from "path";
import crypto from "crypto";
import { spawn } from "child_process";

// Machine-specific: path to Microsoft Edge. Adjust per machine/OS.
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const baseDir = import.meta.dirname.replace(/\\/g, "/");
// Normalised — the server's prefix check and the override-map keys compare
// against this exact form (path.join/path.normalize resolve to backslashes).
const ROOT = path.normalize(baseDir + "/../"); // codebase root — served as the origin root
const PORT = process.env.HMV_SW_PORT ? parseInt(process.env.HMV_SW_PORT, 10) : 9367; // the served site
const UPORT = process.env.HMV_SW_UPDATE_PORT ? parseInt(process.env.HMV_SW_UPDATE_PORT, 10) : 9368; // update-test origin
// Edge's remote-debugging port must DIFFER from the site port — the battery's
// own HTTP server holds the site port, so the debugger would never come up.
const DEBUG_PORT = process.env.HMV_SW_DEBUG_PORT ? parseInt(process.env.HMV_SW_DEBUG_PORT, 10) : 9369;
const PROFILE = process.env.HMV_SW_PROFILE || (process.env.TEMP + "\\hmv-sw-check-profile");
const NOTE_KEY = "static/notes/works/HDT-muwattaMalik.md"; // the S5 update target (a fixture)
const NOTE_PATH = ROOT + NOTE_KEY;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? "PASS  " : "FAIL  ") + name + (detail !== undefined ? "   [" + detail + "]" : ""));
  if (!cond) failures++;
}
const sha16 = (buf) => crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16);
// Clean-filter bytes — MUST mirror tools/hmv-manifest.mjs: fingerprints
// describe the committed blobs (LF under core.autocrlf), not the
// working tree (CRLF-smudged). Fonts are binary — a woff/woff2 stream
// can legally contain 0x0D 0x0A — so they are hashed AND served raw.
const LATIN1 = "latin1";
function cleanBytes(file, buf) {
  if (buf.indexOf(0x0d) === -1 || file.indexOf("/font/") !== -1) return buf;
  return Buffer.from(buf.toString(LATIN1).replace(/\r\n/g, "\n"), LATIN1);
}

// ── S0: the registration snippet on every page ──────────────────────
// Matches the essential tokens, not literal source: the dist pages carry
// the minified snippet (swc rewrites the quotes to backticks and collapses
// the try/catch braces), the src pages the verbatim one.
{
  let ok = true;
  const trees = [["src/books/", "src"], ["dist/books/", "dist"]];
  for (const [dir, label] of trees) {
    for (const f of fs.readdirSync(ROOT + dir).filter((n) => n.endsWith(".html"))) {
      const html = fs.readFileSync(ROOT + dir + f, "utf8");
      if (!(html.includes("serviceWorker") && html.includes("register(") && html.includes("../../sw.js"))) {
        ok = false;
        console.log("  missing snippet: " + label + "/books/" + f);
      }
    }
  }
  check("S0 registration snippet on all src and dist pages", ok);
}

// ── S2: the manifest matches the tree ───────────────────────────────
function expectedManifest() {
  const map = {};
  const add = (abs) => { map[path.relative(ROOT, abs).split(path.sep).join("/")] = sha16(cleanBytes(abs, fs.readFileSync(abs))); };
  for (const f of fs.readdirSync(ROOT + "dist/books").filter((n) => n.endsWith(".html"))) add(ROOT + "dist/books/" + f);
  for (const f of fs.readdirSync(ROOT + "dist/js").filter((n) => n.endsWith(".js"))) add(ROOT + "dist/js/" + f);
  for (const f of fs.readdirSync(ROOT + "dist/css").filter((n) => n.endsWith(".css"))) add(ROOT + "dist/css/" + f);
  for (const f of fs.readdirSync(ROOT + "dist/font")) add(ROOT + "dist/font/" + f);
  for (const f of fs.readdirSync(ROOT + "data").filter((n) => n.indexOf("-registry-") !== -1)) add(ROOT + "data/" + f);
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = dir + "/" + e.name;
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".md")) add(p);
    }
  };
  walk(ROOT + "static/notes");
  return map;
}
{
  const onDisk = JSON.parse(fs.readFileSync(ROOT + "dist/manifest.json", "utf8"));
  const expected = expectedManifest();
  const diskKeys = Object.keys(onDisk);
  const expKeys = Object.keys(expected).sort();
  const mismatch = [];
  for (const k of expKeys) if (onDisk[k] !== expected[k]) mismatch.push(k + " (" + onDisk[k] + " vs " + expected[k] + ")");
  for (const k of diskKeys) if (!(k in expected)) mismatch.push(k + " (not in tree)");
  const sorted = diskKeys.slice().sort().join(",") === expKeys.join(",");
  check("S2 manifest lists every served file with a matching fingerprint", mismatch.length === 0 && sorted,
    mismatch.slice(0, 3).join("; ") || diskKeys.length + " files");
  check("S2 manifest covers the four domains (books/js/css/font, data, notes)",
    ["dist/books", "dist/js", "dist/css", "dist/font", "data", "static/notes"].every((d) =>
      diskKeys.some((k) => k.startsWith(d + "/"))),
    diskKeys.map((k) => k.split("/")[0]).filter((v, i, a) => a.indexOf(v) === i).join(", "));
  check("S2 IDB-owned files stay out (no data/content/, no search-index.json)",
    !diskKeys.some((k) => k.startsWith("data/content/") || k.indexOf("search-index") !== -1));
}

// ── the tiny static server (codebase root as origin root) ──────────
const MIME = {
  ".js": "text/javascript", ".html": "text/html", ".css": "text/css",
  ".csv": "text/csv", ".json": "application/json", ".md": "text/markdown",
  ".woff2": "font/woff2", ".woff": "font/woff", ".txt": "text/plain",
};
function makeServer(port, overrides, hits) {
  // overrides: Map<served absolute path, temp file to serve instead> —
  // the S5 update origin swaps sw.js, the manifest and the note this way.
  const server = http.createServer((req, res) => {
    try {
      const u = new URL(req.url, "http://127.0.0.1:" + port);
      const abs = path.normalize(path.join(ROOT, decodeURIComponent(u.pathname)));
      if (abs.indexOf(ROOT) !== 0) { res.writeHead(403); res.end(); return; }
      const src = overrides && overrides.has(abs) ? overrides.get(abs) : abs;
      if (hits) hits[abs] = (hits[abs] || 0) + 1;
      if (!fs.existsSync(src) || fs.statSync(src).isDirectory()) { res.writeHead(404); res.end(); return; }
      const mtime = fs.statSync(src).mtime.toUTCString();
      res.setHeader("Last-Modified", mtime);
      if (req.headers["if-modified-since"] === mtime) { res.writeHead(304); res.end(); return; }
      const buf = cleanBytes(src, fs.readFileSync(src));
      res.writeHead(200, { "Content-Type": MIME[path.extname(src)] || "application/octet-stream" });
      res.end(buf);
    } catch (e) {
      res.writeHead(500);
      res.end(String(e));
    }
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

// ── launch Edge and drive it over CDP (harness as hmv-info-check) ──
async function main() {
  fs.rmSync(PROFILE, { recursive: true, force: true });
  const servers = [await makeServer(PORT)];
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
      if (m.result && m.result.exceptionDetails) {
        const d = m.result.exceptionDetails.exception && m.result.exceptionDetails.exception.description
          ? m.result.exceptionDetails.exception.description : m.result.exceptionDetails.text;
        throw new Error("EXC: " + d);
      }
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
          if (Date.now() - t0 > ${timeout || 20000}) return res(false);
          setTimeout(poll, 100);
        })();
      })`);
    }

    const reader = "http://127.0.0.1:" + PORT + "/dist/books/reader.html?book=HDT-muwattaMalik";

    // ── S1: first visit — registration, install, precache ──────────
    await goto(reader);
    await waitFor(`navigator.serviceWorker && navigator.serviceWorker.ready.then(function(){return true;}, function(){return true;})`);
    check("S1 service worker registered at the site root scope", await evalJS(
      `navigator.serviceWorker.getRegistration().then(function (r) {
        return r && r.scope === location.origin + '/';
      })`));
    await waitFor(`caches.keys().then(function (k) { return k.indexOf('hmv-files') !== -1 && k.indexOf('hmv-manifest') !== -1; })`);
    check("S1 install precached the whole manifest (hmv-files + hmv-manifest caches)",
      await evalJS(`caches.keys().then(function (k) { return k.indexOf('hmv-files') !== -1 && k.indexOf('hmv-manifest') !== -1; })`));
    check("S1 precache holds files", await evalJS(
      `caches.open('hmv-files').then(function (c) { return c.keys().then(function (k) { return k.length; }); })`) >= 5,
      await evalJS(`caches.open('hmv-files').then(function (c) { return c.keys().then(function (k) { return k.length; }); })`) + " entries");

    // ── S3: second visit — controlled, served from cache ───────────
    await goto(reader);
    await waitFor(`!!navigator.serviceWorker.controller`);
    check("S3 SW controls the page on the second visit", await evalJS(`!!navigator.serviceWorker.controller`));
    const zeroTx = await evalJS(`(function () {
      return performance.getEntriesByType('resource').filter(function (e) {
        return e.name.indexOf('/dist/') !== -1 && e.transferSize === 0;
      }).length;
    })()`);
    check("S3 dist resources served from cache (transferSize 0)", zeroTx > 0, zeroTx + " cached entries");

    // ── S4: offline — page and book still render ───────────────────
    await send("Network.enable");
    await send("Network.emulateNetworkConditions", { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
    await goto(reader);
    const offlineBook = await waitFor(`document.querySelectorAll('#readerContent .reader-chunk').length > 0`);
    check("S4 offline: page + book render (SW cache + IndexedDB)", offlineBook);
    await send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });

    // ── S5: update propagation on the second origin ────────────────
    // The real sw.js with only the staleness constant forced to 0 — every
    // navigation must re-fetch the manifest. Guard: if the constant ever
    // moves, the replace no-ops and the test fails loudly instead of lying.
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hmv-sw-update-"));
    const realSw = fs.readFileSync(ROOT + "sw.js", "utf8");
    if (!realSw.includes("MANIFEST_REFRESH_MS = 2 * 60 * 1000")) {
      console.log("FAIL  S5 setup: MANIFEST_REFRESH_MS constant moved in sw.js");
      failures++;
    }
    const sw0 = realSw.replace("MANIFEST_REFRESH_MS = 2 * 60 * 1000", "MANIFEST_REFRESH_MS = 0");
    const tmpSw = path.join(tmp, "sw.js");
    fs.writeFileSync(tmpSw, sw0);
    const tmpManifest = path.join(tmp, "manifest.json");
    const tmpNote = path.join(tmp, "note.md");
    const realNote = fs.readFileSync(NOTE_PATH, "utf8");
    const realManifest = JSON.parse(fs.readFileSync(ROOT + "dist/manifest.json", "utf8"));
    const writeV = (v) => {
      fs.writeFileSync(tmpNote, realNote + "\n<!-- SWCHECK-" + v + " -->\n");
      const m = JSON.parse(JSON.stringify(realManifest));
      m[NOTE_KEY] = sha16(cleanBytes(NOTE_PATH, fs.readFileSync(tmpNote)));
      fs.writeFileSync(tmpManifest, JSON.stringify(m, null, 2));
      // Force distinct Last-Modified stamps: filesystem mtime granularity
      // could otherwise make v2 look unchanged to a revalidation (304), and
      // the SW would never see the new fingerprint.
      const bump = new Date(Date.now() + 60000);
      fs.utimesSync(tmpNote, bump, bump);
      fs.utimesSync(tmpManifest, bump, bump);
    };
    const overrides = new Map([
      [path.normalize(ROOT + "sw.js"), tmpSw],
      [path.normalize(ROOT + "dist/manifest.json"), tmpManifest],
      [path.normalize(ROOT + NOTE_KEY), tmpNote],
    ]);
    const hits = {};
    servers.push(await makeServer(UPORT, overrides, hits));
    const readerU = "http://127.0.0.1:" + UPORT + "/dist/books/reader.html?book=HDT-muwattaMalik";
    const fetchNote = `fetch("/static/notes/works/HDT-muwattaMalik.md").then(function (r) { return r.text(); })`;

    writeV(1);
    await goto(readerU);
    await waitFor(`!!navigator.serviceWorker.controller || navigator.serviceWorker.ready.then(function(){return true;}, function(){return true;})`);
    await waitFor(`caches.keys().then(function (k) { return k.indexOf('hmv-files') !== -1; })`);
    const v1 = await evalJS(fetchNote);
    check("S5 visit 1: note precached and served (v1)", v1.indexOf("SWCHECK-1") !== -1, v1.length + " bytes");
    const jsHitsV1 = hits[path.normalize(ROOT + "dist/js/reader.js")] || 0;

    writeV(2);
    await goto(readerU);
    await waitFor(`!!navigator.serviceWorker.controller`);
    const v2 = await evalJS(fetchNote);
    check("S5 visit 2: changed note re-fetched per its fingerprint (v2)", v2.indexOf("SWCHECK-2") !== -1 && v2.indexOf("SWCHECK-1") === -1,
      v2.length + " bytes");
    const jsHitsV23 = hits[path.normalize(ROOT + "dist/js/reader.js")] || 0;
    check("S5 visit 2: unchanged files NOT re-downloaded (reader.js served from cache)",
      jsHitsV23 === jsHitsV1, jsHitsV1 + " → " + jsHitsV23 + " requests");

    await goto(readerU);
    await waitFor(`!!navigator.serviceWorker.controller`);
    const v3 = await evalJS(fetchNote);
    check("S5 visit 3: unchanged note still served from cache (v2)", v3.indexOf("SWCHECK-2") !== -1, v3.length + " bytes");
    check("S5 the manifest is re-fetched network-first on every visit", (hits[path.normalize(ROOT + "dist/manifest.json")] || 0) >= 3,
      hits[path.normalize(ROOT + "dist/manifest.json")] + " fetches");

    fs.rmSync(tmp, { recursive: true, force: true });

    // ── S6: no page errors ─────────────────────────────────────────
    check("S6 no page errors", pageErrors.length === 0, pageErrors.slice(0, 3).join(" | "));

    edge.kill();
  } finally {
    for (const s of servers) if (s) s.close();
    if (edge.exitCode === null) edge.kill();
  }
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.log("BATTERY ERROR: " + e); process.exit(1); });
