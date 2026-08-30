// Shards battery (data/search-index-manifest.json manifest + data/search-index/*.json
// per-book shards) — the scope-aware loader in src/js/library-search-engine.js:
// the manifest alone feeds the scope picker, and a search fetches only the
// shards for the books in scope. Served over HTTP (the site needs a secure
// context for its service worker), the real codebase tree with correct MIME
// types and Last-Modified/304 — the same harness as hmv-sw-check.mjs — so the
// server's hit counter can prove exactly which files each page state fetched.
// The server sends Cache-Control: no-cache: Pages' heuristic caching would
// otherwise serve ?v= shard URLs without a server round-trip and the hit
// counts would lie; the loader memoizes per shard anyway, so revalidation
// costs nothing real.
//
// A client-side recorder, installed via CDP
// (Page.addScriptToEvaluateOnNewDocument — it must be in place before any
// page script runs, so init fetches cannot race it) records every fetch the
// page attempts; the server-side hit counter is the authoritative network
// layer. The service worker controls pages after the first visit, but it
// passes everything outside dist/manifest.json straight through (sw.js:92),
// so search-index requests always reach the server and are never cache-
// served by the SW.
//
// Cold starts wipe IndexedDB deterministically, no CDP storage-domain
// dependency: the recorder snippet also checks a sessionStorage flag, and
// when set, calls indexedDB.deleteDatabase at the new document's start.
// Navigation has already closed the previous document's IDB connections, so
// the delete never blocks, and the flag is consumed on that same document —
// the app's init chain re-primes only the manifest record afterwards (the
// picker never loads shards), which is exactly the state the offline-cold
// group needs. The wipe is verified via window.__hmvWiped after each goto —
// a failed wipe fails the battery loudly rather than flaking later groups.
//
// Groups (each cold group wipes cache + IDB first):
//   G2  page load + scope-modal open fetch the manifest ONLY — the picker's
//       5 MiB→2 KB win; zero shard fetches attempted
//   G1  a scoped search (?q=…&books=X) fetches exactly X's shard, never
//       another book's; results render scoped to X
//   G0  the HDT default scope — a param-free search (?q=… only) fetches
//       exactly the HDT group's shards, never the rest; results stay within
//       the group and the scope button reports it
//   G0r the reader window's All-books tab shares the default — the window's
//       summary reports the HDT group and its cross-book search fetches
//       exactly the HDT shards
//   G4  an explicit all-books search (?q=…&books=<every visible code> —
//       the default would fetch only the HDT group) fetches every VISIBLE
//       book's shard — the page's scope is computeScope(), and -HDN books
//       are excluded from the visible list by design (they are indexed, but
//       only the search window's unscoped path — loadScopedIndex(null) —
//       covers them)
//   G3+ offline with a warm IndexedDB: the manifest load falls back to the
//       IDB copy, shards are already warm, and a re-search renders — the
//       same results as online — with zero re-downloads
//   G3− offline with a wiped IndexedDB: the standard error + Retry state,
//       never partial results
//
// Offline is simulated with a fetch stub, not Network.emulateNetworkConditions:
// the recorder rejects search-index fetches from the next document's start —
// the loader cannot distinguish that from a real network failure, so it
// exercises the exact offline code paths (manifest → cached-meta fallback
// when warm; error + Retry when cold), deterministically. A DIAG block
// (informational) probes whether the CDP emulation actually fails fetches in
// this Edge at all — if it ever does, the stub could be replaced by the real
// emulation.
//
// Run: node tools/hmv-shards-check.mjs  (from codebase/, or anywhere — paths
// resolve relative to this script). Requires Node 20.11+ and Microsoft Edge.
// Env overrides: HMV_SHARDS_PORT (default 9365), HMV_SHARDS_DEBUG_PORT (9366),
// HMV_SHARDS_PROFILE.
import fs from "fs";
import http from "http";
import path from "path";
import { spawn } from "child_process";
import { pathToFileURL } from "url";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const baseDir = import.meta.dirname.replace(/\\/g, "/");
const ROOT = path.normalize(baseDir + "/../"); // codebase root — served as the origin root
const PORT = process.env.HMV_SHARDS_PORT ? parseInt(process.env.HMV_SHARDS_PORT, 10) : 9365; // the served site
const DEBUG_PORT = process.env.HMV_SHARDS_DEBUG_PORT ? parseInt(process.env.HMV_SHARDS_DEBUG_PORT, 10) : 9366; // CDP — must differ from the site port
const PROFILE = process.env.HMV_SHARDS_PROFILE || (process.env.TEMP + "\\hmv-shards-check-profile");
const ORIGIN = "http://127.0.0.1:" + PORT;
const PAGE = ORIGIN + "/src/books/library-search.html";
const READER = ORIGIN + "/src/books/reader.html";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? "PASS  " : "FAIL  ") + name + (detail !== undefined ? "   [" + String(detail).slice(0, 200) + "]" : ""));
  if (!cond) failures++;
}

// ── Expected sets — derived from the on-disk manifest and shards ──────
// (the app's own data files are the contract; never hardcode book codes)
const MANIFEST = JSON.parse(fs.readFileSync(ROOT + "data/search-index-manifest.json", "utf8")).meta;
const ALL_BOOKS = MANIFEST.bookIds;
// The page's search scope is computeScope() — the visible books, -HDN
// excluded (library-search-page.js) — so the page never requests the -HDN
// shards; only the search window's unscoped path (loadScopedIndex(null))
// covers all 65. The battery's expected sets follow the page's semantics.
const VISIBLE_BOOKS = ALL_BOOKS.filter((c) => !c.endsWith("-HDN"));
// The HDT default scope — the picker's group semantics (extractTags: the
// first registered prefix segment + the registry's tags column) over the
// searchable books (registry ∩ index meta, -HDN excluded), derived from the
// data files so the battery never hardcodes book codes.
const { parseCSVWithHeader } = await import(pathToFileURL(path.join(import.meta.dirname, "..", "src", "js", "csv.js")));
const REG_BOOKS = parseCSVWithHeader(fs.readFileSync(ROOT + "data/03-registry-bookMeta.csv", "utf8"));
const REG_TAGS = parseCSVWithHeader(fs.readFileSync(ROOT + "data/01-registry-bookTags.csv", "utf8"));
const TAG_CODES = new Set(REG_TAGS.map((t) => t.tagCode));
function tagsOf(row) {
  const codes = [];
  const parts = row.bookCode.split("-");
  for (const p of parts) {
    if (TAG_CODES.has(p)) { codes.push(p); break; }
  }
  if (row.tags) {
    row.tags.split(",").forEach((tg) => {
      const c = tg.trim();
      if (c && TAG_CODES.has(c) && codes.indexOf(c) === -1) codes.push(c);
    });
  }
  return codes;
}
const HDT_SCOPE = REG_BOOKS.filter((b) =>
  !b.bookCode.endsWith("-HDN") && ALL_BOOKS.includes(b.bookCode) && tagsOf(b).includes("HDT")
).map((b) => b.bookCode);
const SCOPE_BOOK = "HDT-muwattaMalik"; // the G1 scoped-search book
// The hit-counter keys are normalized (backslashes on Windows) — build the
// prefixes with path.normalize, never string concat with "/".
const manifestKey = path.normalize(ROOT + "data/search-index-manifest.json");
const shardDirKey = path.normalize(ROOT + "data/search-index/");
const shardKey = (code) => path.normalize(ROOT + "data/search-index/" + code + ".json");
// Query words derived from the scope book's own shard: the shard keys ARE the
// app's normalised tokens, and normaliseForSearch is idempotent, so querying
// a key round-trips to itself — guaranteed hits, derived not guessed.
const WORDS = Object.keys(JSON.parse(fs.readFileSync(shardKey(SCOPE_BOOK), "utf8")))
  .filter((k) => k.length >= 3 && !/^\p{N}+$/u.test(k));
const W = WORDS[0];
const W2 = WORDS.find((w) => w !== W);
const W3 = WORDS.find((w) => w !== W && w !== W2);
if (!ALL_BOOKS.includes(SCOPE_BOOK)) {
  console.log("FAIL  setup: " + SCOPE_BOOK + " not in the manifest's bookIds");
  process.exit(1);
}
if (!W || !W2 || !W3) {
  console.log("FAIL  setup: not enough query words in " + SCOPE_BOOK + "'s shard");
  process.exit(1);
}

// ── the tiny static server (codebase root as origin root) ──────────
const MIME = {
  ".js": "text/javascript", ".html": "text/html", ".css": "text/css",
  ".csv": "text/csv", ".json": "application/json", ".md": "text/markdown",
  ".woff2": "font/woff2", ".woff": "font/woff", ".txt": "text/plain",
};
function makeServer(port, hits) {
  const server = http.createServer((req, res) => {
    try {
      const u = new URL(req.url, "http://127.0.0.1:" + port);
      const abs = path.normalize(path.join(ROOT, decodeURIComponent(u.pathname)));
      if (abs.indexOf(ROOT) !== 0) { res.writeHead(403); res.end(); return; }
      if (hits) hits[abs] = (hits[abs] || 0) + 1;
      if (!fs.existsSync(abs) || fs.statSync(abs).isDirectory()) { res.writeHead(404); res.end(); return; }
      const mtime = fs.statSync(abs).mtime.toUTCString();
      res.setHeader("Last-Modified", mtime);
      res.setHeader("Cache-Control", "no-cache"); // see the header comment
      if (req.headers["if-modified-since"] === mtime) { res.writeHead(304); res.end(); return; }
      res.writeHead(200, { "Content-Type": MIME[path.extname(abs)] || "application/octet-stream" });
      res.end(fs.readFileSync(abs));
    } catch (e) {
      res.writeHead(500);
      res.end(String(e));
    }
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

// ── pre-navigation recorder — installed BEFORE the first goto ────────
// Records every fetch the page attempts (URL as passed) — the server's hits
// are the authoritative layer, the recorder proves what the page asked for
// even when a request never reaches the network (a cache serve, or offline).
// Also performs the flagged IndexedDB wipe at new-document start: navigation
// has closed the previous document's connections, so deleteDatabase never
// blocks; __hmvWiped reports the outcome for verification.
const FETCH_RECORDER = `(function () {
  window.__fetched = [];
  var offline = sessionStorage.getItem('hmvShardsOffline') === '1';
  if (offline) sessionStorage.removeItem('hmvShardsOffline');
  var orig = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : (input && input.url) || String(input);
    window.__fetched.push(url);
    // Simulated offline: a rejected fetch is indistinguishable from a real
    // network failure to the loader, so the offline groups exercise the
    // exact same code paths — cached-meta fallback when warm, error + Retry
    // when cold. The DIAG block records whether the CDP emulation could do
    // this for real.
    if (offline && url.indexOf('/data/search-index') !== -1) {
      return Promise.reject(new TypeError('Failed to fetch (simulated offline)'));
    }
    return orig(input, init);
  };
  if (sessionStorage.getItem('hmvShardsWipe') === '1') {
    sessionStorage.removeItem('hmvShardsWipe');
    var d = indexedDB.deleteDatabase('hadithmvSearch');
    d.onsuccess = function () { window.__hmvWiped = true; };
    d.onerror = function () { window.__hmvWiped = 'error'; };
    d.onblocked = function () { window.__hmvWiped = 'blocked'; };
  }
})()`;

async function main() {
  fs.rmSync(PROFILE, { recursive: true, force: true });
  const hits = {};
  const servers = [await makeServer(PORT, hits)];
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
    // A raw send that surfaces CDP errors (the plain send resolves even on
    // error — a silently dropped command would flake the battery).
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
    async function waitFor(expr, timeout = 20000, interval = 100) {
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
          if (Date.now() - t0 > 20000) return res(false);
          setTimeout(poll, 100);
        })();
      })`);
      await sleep(400);
    }

    // Recorder first — before the first navigation, so init fetches cannot
    // race it; Page/Network for the clear command and offline emulation.
    await sendChecked("Page.enable");
    await sendChecked("Runtime.enable");
    await sendChecked("Network.enable");
    await sendChecked("Page.addScriptToEvaluateOnNewDocument", { source: FETCH_RECORDER });

    // Cold start per group: arm the next document's start-time IDB wipe (see
    // the recorder comment) and drop the HTTP cache (belt — the server's
    // no-cache header is the braces). The SW's own caches never hold
    // search-index files, so they need no clearing. The wipe is VERIFIED
    // after the group's goto — a wipe that silently no-ops would corrupt
    // every later group's evidence.
    const coldStart = async () => {
      await sendChecked("Network.clearBrowserCache");
      await evalJS(`sessionStorage.setItem('hmvShardsWipe', '1')`);
    };
    // Arm the fetch stub for the NEXT document: the recorder consumes the
    // flag at document start and rejects every search-index fetch from then
    // on — the deterministic offline (see the header comment).
    const goOffline = async () => {
      await evalJS(`sessionStorage.setItem('hmvShardsOffline', '1')`);
    };
    // Call right after a cold group's goto: the recorder's wipe has run by
    // the time the page is interactive — assert it, loudly.
    const verifyWipe = async (label) => {
      const w = await waitFor(`window.__hmvWiped === true`, 5000);
      check("setup: IDB wiped before " + label, w, String(await evalJS(`window.__hmvWiped`)));
    };
    const shardHits = () => Object.keys(hits).filter((k) => k.indexOf(shardDirKey) === 0);
    const shardDelta = (before) => shardHits().filter((k) => before.indexOf(k) === -1);
    const codeOf = (key) => path.basename(key).replace(/\.json$/, "");
    const clientShardCodes = () => evalJS(`window.__fetched.map(function (u) {
      var p; try { p = new URL(u, location.href).pathname; } catch (e) { p = u; }
      return p;
    }).filter(function (p) { return p.indexOf('/data/search-index/') === 0; })
      .map(function (p) { return p.slice(p.lastIndexOf('/') + 1, -5); })`);
    const pageSearch = (word, withObserver) => evalJS(`(function () {
      var inp = document.getElementById('libSearchInput');
      ${withObserver ? `
      // The warm-path search can render entirely from memory — the "searching"
      // empty-state lasts tens of milliseconds and no poll can catch it. A
      // MutationObserver records the fact of the re-render instead: any
      // innerHTML replacement of the results area (empty-state or cards)
      // fires it, even if the state it set was instantly replaced.
      window.__researched = 0;
      var obs = new MutationObserver(function () { window.__researched++; });
      obs.observe(document.getElementById('libResults'), { childList: true });` : ""}
      inp.value = ${JSON.stringify(word)};
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    const resultsCount = () => evalJS(`(document.getElementById('libResultCount') || {}).textContent || ''`);
    // The offline emulation must be verified, not assumed: if it silently
    // no-ops, "offline" searches run over the network and every offline
    // assertion lies. The probe bypasses all caches (no-store), so any
    // resolution proves the network stack's state.
    const offlineProbe = () => evalJS(
      `fetch(${JSON.stringify(ORIGIN + "/data/search-index-manifest.json")}, { cache: "no-store" })
        .then(function () { return "online"; }, function () { return "offline"; })`);
    // Count of index records (1 manifest + N shards). A freshly-created empty
    // DB (a wiped one reopened) has no store — report -1 rather than throw.
    const idbRecordCount = () => evalJS(`new Promise(function (res) {
      var req = indexedDB.open('hadithmvSearch');
      req.onsuccess = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains('index')) { res(-1); db.close(); return; }
        var tx = db.transaction('index', 'readonly').objectStore('index').count();
        tx.onsuccess = function () { res(tx.result); db.close(); };
        tx.onerror = function () { res(-1); db.close(); };
      };
      req.onerror = function () { res(-1); };
    })`);

    // ── G2: page + scope-modal open fetch the manifest only ──────────
    await goto(PAGE, 1280, 900);
    // The startup path (ensureSearchableBooks) reads the manifest; opening
    // the picker proves the modal itself is served by it — and no postings.
    await evalJS(`document.getElementById('libScopeBtn').click()`);
    await waitFor(`document.getElementById('libScopeOverlay') !== null && document.getElementById('libScopeOverlay').classList.contains('open')`);
    await waitFor(`document.querySelectorAll('#libScopeList .lib-scope-row').length > 0`);
    check("G2 modal lists books from the manifest", await evalJS(`document.querySelectorAll('#libScopeList .lib-scope-row').length`) >= 40);
    check("G2 manifest fetched, zero shards fetched", (hits[manifestKey] || 0) >= 1 && shardHits().length === 0,
      "manifest " + (hits[manifestKey] || 0) + " hit(s), shards " + shardHits().length);
    check("G2 client: no shard fetch attempted", (await clientShardCodes()).length === 0);

    // ── DIAG (informational): does the CDP offline emulation bite at all? ──
    // The offline groups use the deterministic fetch stub, so this only
    // records whether Network.emulateNetworkConditions could serve future
    // groups (and how the service worker's pass-through interacts with it).
    try {
      console.log("DIAG Network.emulateNetworkConditions (informational):");
      console.log("  probe online (sanity)     :", await offlineProbe());
      await sendChecked("Network.emulateNetworkConditions", { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
      console.log("  probe emulated            :", await offlineProbe(), "(offline = the emulation bites)");
      await sendChecked("Network.setBypassServiceWorker", { bypass: true });
      console.log("  probe emulated, SW bypass :", await offlineProbe(), "(offline = bypass restores it)");
      await sendChecked("Network.setBypassServiceWorker", { bypass: false });
      await sendChecked("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    } catch (e) {
      console.log("DIAG unavailable:", e.message);
    }

    // ── G1: a scoped search fetches exactly that book's shard ─────────
    await coldStart();
    const g1Before = shardHits().slice();
    await goto(PAGE + "?q=" + encodeURIComponent(W) + "&books=" + SCOPE_BOOK, 1280, 900);
    await verifyWipe("G1");
    const g1Rendered = await waitFor(`document.querySelectorAll('#libResults .lib-result').length > 0`);
    const g1Shards = shardDelta(g1Before);
    check("G1 scoped search fetches exactly one shard",
      g1Rendered && g1Shards.length === 1 && g1Shards[0] === shardKey(SCOPE_BOOK), codeOf(g1Shards[0] || "") + " fetched");
    check("G1 client: only the scoped shard attempted", (await clientShardCodes()).join(",") === SCOPE_BOOK,
      (await clientShardCodes()).join(","));
    check("G1 results render, scoped to the book", await evalJS(
      `(function () {
        var cards = document.querySelectorAll('#libResults .lib-result');
        return cards.length > 0 && Array.prototype.every.call(cards, function (c) { return c.dataset.book === ${JSON.stringify(SCOPE_BOOK)}; });
      })()`));
    check("G1 manifest revalidated", (hits[manifestKey] || 0) >= 2, "manifest " + (hits[manifestKey] || 0) + " hit(s)");

    // ── G0: the default scope — a param-free search fetches only HDT ────
    // The library page defaults the picker to the HDT group (defaultTag
    // "HDT" in initScopePicker); a fresh ?q= load fetches exactly that
    // group's shards — never all 63 — and the scope button reports the
    // group. The group includes books carrying HDT as a SECONDARY tag (the
    // registry's tags column — extractTags semantics), e.g. IH-…
    // -HDT. English is pinned first so the button label asserts verbatim.
    // muwatta was fetched in G1, so its G0 revalidation hit sits in the
    // baseline and the delta excludes it by construction.
    await coldStart();
    const g0Before = shardHits().slice();
    await goto(PAGE, 1280, 900);
    await verifyWipe("G0"); // the armed wipe runs at THIS document's start
    await evalJS(`localStorage.setItem('lang', 'en')`);
    await goto(PAGE + "?q=" + encodeURIComponent(W), 1280, 900);
    const g0Rendered = await waitFor(`document.querySelectorAll('#libResults .lib-result').length > 0`);
    const g0Shards = shardDelta(g0Before);
    const g0Baseline = g0Before.filter((k) => k.indexOf(shardDirKey) === 0);
    const g0Expected = HDT_SCOPE.map(shardKey);
    const g0Fetched = g0Shards.concat(g0Baseline);
    const g0Missing = g0Expected.filter((k) => g0Fetched.indexOf(k) === -1);
    const g0Extras = g0Shards.filter((k) => g0Expected.indexOf(k) === -1);
    check("G0 results render within the default scope", g0Rendered && await evalJS(`(function () {
      var cards = document.querySelectorAll('#libResults .lib-result');
      return cards.length > 0 && Array.prototype.every.call(cards, function (c) {
        return ${JSON.stringify(HDT_SCOPE)}.indexOf(c.dataset.book) !== -1;
      });
    })()`));
    check("G0 default scope fetches exactly the HDT group's shards",
      g0Rendered && g0Missing.length === 0 && g0Shards.length === g0Expected.length - g0Baseline.length,
      g0Shards.length + " of " + g0Expected.length + " HDT shards" +
      (g0Missing.length ? " — missing: " + g0Missing.map(codeOf).join(",") : ""));
    check("G0 no non-HDT shard fetches", g0Extras.length === 0, g0Extras.map(codeOf).join(",") || "none");
    check("G0 scope button shows the HDT count", await waitFor(
      `document.getElementById('libScopeBtn').textContent === ${JSON.stringify("Search in: " + HDT_SCOPE.length + " books ▾")}`));
    check("G0 no books param (default scope stays param-free)",
      (await evalJS(`new URLSearchParams(location.search).has('books')`)) === false);

    // ── G0r: the reader window's All-books tab defaults to the HDT group ─
    // The reader page inits the same picker with the same HDT default
    // (initSearchWindow's reader branch), so the All-books tab's cross-book
    // search (searchAllBooks → getScope()) fetches exactly the HDT group's
    // shards and the window's scope summary reports the group. G0 fetched
    // the same 16 shards, so every G0r fetch lands inside the baseline —
    // the client-side attempt list is the fetch evidence (see below).
    await coldStart();
    const g0rBefore = shardHits().slice();
    await goto(READER + "?book=" + SCOPE_BOOK, 1280, 900);
    await verifyWipe("G0r"); // the armed wipe runs at THIS document's start
    await evalJS(`localStorage.setItem('lang', 'en')`);
    await evalJS(`document.getElementById('btnSearchWindow').click()`);
    await waitFor(`document.getElementById('searchWindowOverlay').classList.contains('open')`);
    await evalJS(`document.getElementById('searchWindowTabAllBooks').click()`);
    check("G0r window summary shows the HDT count", await waitFor(
      `document.getElementById('searchWindowScopeSummary').textContent === ${JSON.stringify("Search in: " + HDT_SCOPE.length + " books ▾")}`, 20000));
    await evalJS(`(function () {
      var inp = document.getElementById('searchWindowInput');
      inp.value = ${JSON.stringify(W2)};
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    // The window's all-books results are book-group rows (search-window-
    // book-link — the library page's card view is a page-side render), so
    // the row count is the render signal. G0 fetched the same 16 shards, so
    // every G0r shard fetch lands inside the baseline: the client-side
    // attempt list below is the fetch evidence, not the delta.
    const g0rRendered = await waitFor(`document.querySelectorAll('#searchWindowResults .search-window-book-link').length > 0`, 20000);
    const g0rShards = shardDelta(g0rBefore);
    const g0rBaseline = g0rBefore.filter((k) => k.indexOf(shardDirKey) === 0);
    const g0rExpected = HDT_SCOPE.map(shardKey);
    const g0rFetched = g0rShards.concat(g0rBaseline);
    const g0rMissing = g0rExpected.filter((k) => g0rFetched.indexOf(k) === -1);
    const g0rExtras = g0rShards.filter((k) => g0rExpected.indexOf(k) === -1);
    check("G0r reader All-books search fetches exactly the HDT group's shards",
      g0rRendered && g0rMissing.length === 0 && g0rShards.length === g0rExpected.length - g0rBaseline.length,
      g0rShards.length + " new of " + g0rExpected.length + " HDT shards (baseline " + g0rBaseline.length + ")" +
      (g0rMissing.length ? " — missing: " + g0rMissing.map(codeOf).join(",") : ""));
    check("G0r no non-HDT shard fetches", g0rExtras.length === 0, g0rExtras.map(codeOf).join(",") || "none");
    check("G0r client: exactly the HDT shards attempted", await evalJS(`(function () {
      var scope = ${JSON.stringify(HDT_SCOPE)};
      var codes = window.__fetched.map(function (u) {
        var p; try { p = new URL(u, location.href).pathname; } catch (e) { p = u; }
        return p;
      }).filter(function (p) { return p.indexOf('/data/search-index/') === 0; })
        .map(function (p) { return p.slice(p.lastIndexOf('/') + 1, -5); });
      return codes.length === scope.length && codes.every(function (c) { return scope.indexOf(c) !== -1; });
    })()`), (await clientShardCodes()).join(","));
    check("G0r reader results scoped to the HDT group", await evalJS(`(function () {
      var rows = document.querySelectorAll('#searchWindowResults .search-window-book-link');
      var scope = ${JSON.stringify(HDT_SCOPE)};
      return rows.length > 0 && Array.prototype.every.call(rows, function (r) {
        return scope.indexOf(new URL(r.href, location.href).searchParams.get('book')) !== -1;
      });
    })()`));

    // ── G4: an explicit all-books search fetches every VISIBLE shard ────
    // The page's scope is computeScope() — the visible books (-HDN
    // excluded) — so the expected set is the visible ones, not the index's
    // 65; the -HDN shards are only ever fetched by the search window's
    // unscoped path. ?books= makes the scope explicit (a param-free page
    // defaults to the HDT group — see G0). muwatta was fetched in G1, so
    // its G4 revalidation hit sits in the baseline and the delta excludes
    // it by construction.
    await coldStart();
    const g4Before = shardHits().slice();
    await goto(PAGE + "?q=" + encodeURIComponent(W) + "&books=" + VISIBLE_BOOKS.join(","), 1280, 900);
    await verifyWipe("G4");
    const g4Rendered = await waitFor(`document.querySelectorAll('#libResults .lib-result').length > 0`);
    const g4Shards = shardDelta(g4Before);
    const g4Baseline = g4Before.filter((k) => k.indexOf(shardDirKey) === 0);
    const g4Expected = VISIBLE_BOOKS.map(shardKey);
    const g4Fetched = g4Shards.concat(g4Baseline);
    const g4Missing = g4Expected.filter((k) => g4Fetched.indexOf(k) === -1);
    const g4Extras = g4Shards.filter((k) => g4Expected.indexOf(k) === -1);
    check("G4 results render", g4Rendered);
    check("G4 unscoped search fetches every visible book's shard",
      g4Rendered && g4Missing.length === 0 && g4Shards.length === g4Expected.length - g4Baseline.length,
      g4Shards.length + " of " + g4Expected.length + " shards" +
      (g4Missing.length ? " — missing: " + g4Missing.map(codeOf).join(",") : ""));
    check("G4 no extra shard fetches", g4Extras.length === 0,
      g4Extras.map(codeOf).join(",") || g4Shards.length + " new hits");
    const g4Client = await clientShardCodes();
    const g4ClientMissing = VISIBLE_BOOKS.filter((c) => g4Client.indexOf(c) === -1);
    check("G4 client: every visible shard attempted",
      g4Client.sort().join(",") === VISIBLE_BOOKS.slice().sort().join(","),
      g4Client.length + " attempts" + (g4ClientMissing.length ? " — never attempted: " + g4ClientMissing.join(",") : ""));
    // The shard writes are fire-and-forget — hold the IDB until all records
    // (1 manifest + N shards) are in, so G3+ starts warm for real.
    check("G4 every visible shard + manifest cached in IDB",
      await waitFor(`new Promise(function (res) {
        var req = indexedDB.open('hadithmvSearch');
        req.onsuccess = function () {
          var db = req.result;
          if (!db.objectStoreNames.contains('index')) { res(-1); db.close(); return; }
          var tx = db.transaction('index', 'readonly').objectStore('index').count();
          tx.onsuccess = function () { res(tx.result); db.close(); };
          tx.onerror = function () { res(-1); db.close(); };
        };
        req.onerror = function () { res(-1); };
      }).then(function (n) { return n === ${1 + VISIBLE_BOOKS.length}; })`, 20000),
      await idbRecordCount() + " records");
    check("G4 IDB holds exactly the manifest + every visible shard", await evalJS(`new Promise(function (res) {
      var req = indexedDB.open('hadithmvSearch');
      req.onsuccess = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains('index')) { res([]); db.close(); return; }
        var g = db.transaction('index', 'readonly').objectStore('index').getAllKeys();
        g.onsuccess = function () { res(g.result); db.close(); };
        g.onerror = function () { res([]); db.close(); };
      };
      req.onerror = function () { res([]); };
    }).then(function (ids) {
      return JSON.stringify(ids.sort()) === ${JSON.stringify(JSON.stringify(VISIBLE_BOOKS.map((c) => "shard:" + c).concat(["index"]).sort()))};
    })`), "ids");

    // ── G3+ offline with a warm IndexedDB ─────────────────────────────
    // Reload online first (fresh document = empty in-memory merge): the
    // search must run entirely from IDB — the manifest revalidates (one
    // conditional GET), shards are never re-downloaded. Then the offline
    // phase: the fetch stub rejects search-index requests from the next
    // document's start, so the manifest load falls back to the IDB copy,
    // the shards are already warm, and a re-search renders the same
    // results with zero network use.
    const g3Before = shardHits().slice();
    await goto(PAGE + "?q=" + encodeURIComponent(W3), 1280, 900);
    const g3Reloaded = await waitFor(`document.querySelectorAll('#libResults .lib-result').length > 0`);
    check("G3+ reload reuses IDB shards (zero re-downloads)", g3Reloaded && shardDelta(g3Before).length === 0);
    const countOnline = await resultsCount();
    await goOffline();
    await goto(PAGE + "?q=" + encodeURIComponent(W3), 1280, 900);
    check("setup: offline fetch-stub verified (G3+)", (await offlineProbe()) === "offline", await offlineProbe());
    const g3oRendered = await waitFor(`document.querySelectorAll('#libResults .lib-result').length > 0`, 15000);
    check("G3+ offline reload renders from the warm IDB", g3oRendered);
    await pageSearch(W3, true);
    // A warm-path re-search can render entirely from memory — the searching
    // empty-state lasts tens of milliseconds and no poll can catch it; the
    // MutationObserver proves a fresh search actually re-rendered, and the
    // count equality then proves the offline run produced the same results.
    const freshRun = await waitFor(`window.__researched >= 1`, 5000, 40);
    const renderedOffline = await waitFor(`document.querySelectorAll('#libResults .lib-result').length > 0`, 15000);
    check("G3+ offline search re-renders (warm IDB)", freshRun && renderedOffline,
      freshRun ? "fresh run rendered" : "no fresh search observed");
    check("G3+ offline results equal the online run", (await resultsCount()) === countOnline,
      await resultsCount() + " vs " + countOnline);
    check("G3+ no shard re-fetched offline", shardDelta(g3Before).length === 0);

    // ── G3− offline with a wiped IndexedDB ────────────────────────────
    // A FRESH document is essential: the in-memory master dict would serve
    // the search and mask the missing on-device cache. The armed wipe runs
    // at this document's start; the init chain then re-primes ONLY the
    // manifest record (ensureSearchableBooks — the picker never loads
    // shards), so the offline search still finds every shard missing and
    // must fall to the error + Retry state.
    await coldStart();
    await goOffline();
    await goto(PAGE, 1280, 900);
    await verifyWipe("G3−");
    // The picker's list proves the init chain completed (its manifest load
    // fell back to the registry-visible books under the stub); Escape closes
    // the modal again.
    await evalJS(`document.getElementById('libScopeBtn').click()`);
    await waitFor(`document.querySelectorAll('#libScopeList .lib-scope-row').length > 0`);
    await evalJS(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
    check("setup: offline fetch-stub verified (G3−)", (await offlineProbe()) === "offline", await offlineProbe());
    await pageSearch(W3);
    check("G3− offline cold search → error + Retry",
      await waitFor(`document.getElementById('libSearchRetry') !== null`, 10000));
    check("G3− no partial results", await evalJS(`document.querySelectorAll('#libResults .lib-result').length === 0`));

    check("S no page errors", pageErrors.length === 0, pageErrors.slice(0, 3).join(" | "));

    console.log(failures === 0 ? "\nALL PASS" : "\n" + failures + " FAILURES");
    edge.kill();
  } finally {
    for (const s of servers) if (s) s.close();
    if (edge.exitCode === null) edge.kill();
  }
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.log("BATTERY ERROR: " + e); process.exit(1); });
