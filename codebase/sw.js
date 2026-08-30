/* Hadithmv service worker — static code, deliberately NEVER changes.
 *
 * All version intelligence lives in dist/manifest.json, written by
 * tools/hmv-manifest.mjs: a map of scope-relative URL → sha256 fingerprint
 * for every file this worker may serve (pages, js, css, font, registries,
 * notes). The worker is the dumb executor:
 *
 *   - every visit starts with the page navigation; that request first
 *     refreshes the manifest (network-first — a tiny conditional GET, cached
 *     copy as the offline fallback), so each visit sees exactly one,
 *     internally consistent version of the site
 *   - a file is served from the cache when its stored fingerprint still
 *     matches the manifest's; otherwise it is fetched fresh, re-tagged and
 *     re-cached
 *   - offline: the last manifest + last cached copies serve the whole site
 *
 * Everything NOT in the manifest passes straight through to the network:
 * the book CSVs (data/content/…) and the search index (data/search-index-manifest.json
 * + data/search-index/ per-book shards) are owned by the app's own
 * IndexedDB version-gating (csv.js fetchBookCSVCached,
 * library-search-engine.js loadIndexMeta/loadScopedIndex) — ~105 MB of corpus
 * must never ride this cache — and src/ pages stay plain-network dev URLs.
 *
 * Registered from every page ("../../sw.js" — the codebase root, so the
 * scope covers dist/, data/ and static/). Registration fails silently on
 * file:// and inside the apps' webviews — that is expected and harmless.
 */

var FILES_CACHE = "hmv-files"; // one entry per served file, tagged with its fingerprint
var MANIFEST_CACHE = "hmv-manifest"; // the last good manifest (the offline fallback)
var MANIFEST_REFRESH_MS = 2 * 60 * 1000; // staleness window inside a long-lived session

var SCOPE = self.location.pathname.slice(0, self.location.pathname.lastIndexOf("/") + 1);
var MANIFEST_URL = SCOPE + "dist/manifest.json";

var manifest = null; // latest { "dist/js/reader.js": "abc123…", … }
var manifestPromise = null;
var manifestAt = 0;

// Scope-relative key for a request, or null when it is not under the SW.
function keyOf(request) {
  var p = new URL(request.url).pathname;
  if (p.indexOf(SCOPE) !== 0) return null;
  return p.slice(SCOPE.length);
}

// Network-first manifest load; the cached copy is the offline fallback.
async function loadManifest() {
  try {
    var resp = await fetch(MANIFEST_URL, { cache: "no-cache" });
    if (resp.ok) {
      var text = await resp.text();
      var fresh = JSON.parse(text);
      await caches.open(MANIFEST_CACHE).then(function (c) {
        return c.put(MANIFEST_URL, new Response(text, {
          headers: { "Content-Type": "application/json" },
        }));
      });
      manifestAt = Date.now();
      return fresh;
    }
    throw new Error("manifest " + resp.status);
  } catch (err) {
    var cached = await caches.match(MANIFEST_URL);
    if (cached) return cached.json();
    throw err; // no manifest anywhere — callers fail open to pass-through
  }
}

// Shared refresh promise: all concurrent requests in a visit await the SAME
// manifest, so nothing in one visit mixes two versions of the site. A
// failure resets it — the next request tries the network again.
function currentManifest() {
  if (!manifestPromise || Date.now() - manifestAt > MANIFEST_REFRESH_MS) {
    manifestPromise = loadManifest().then(
      function (m) {
        manifest = m;
        return m;
      },
      function (err) {
        manifestPromise = null;
        throw err;
      },
    );
  }
  return manifestPromise;
}

async function handle(request) {
  var key = keyOf(request);
  if (!key) return fetch(request);
  try { await currentManifest(); } catch (e) { /* pass-through below */ }
  if (!manifest || !(key in manifest)) return fetch(request); // IDB-owned or unknown → network

  var fp = manifest[key];
  var cached = await caches.match(request);
  if (cached && cached.headers.get("x-hmv-fp") === fp) return cached;

  var resp = await fetch(request);
  if (resp.ok) {
    var headers = new Headers(resp.headers);
    headers.set("x-hmv-fp", fp);
    await caches.open(FILES_CACHE).then(function (c) {
      return c.put(request, new Response(resp.clone().body, {
        status: resp.status,
        statusText: resp.statusText,
        headers: headers,
      }));
    });
  }
  return resp;
}

self.addEventListener("install", function (event) {
  // Best-effort precache of the whole manifest — visit two is instant. A
  // failed entry never blocks the install (per-file fetch handles the rest).
  event.waitUntil(
    currentManifest()
      .then(function (m) {
        return caches.open(FILES_CACHE).then(function (c) {
          return c.addAll(Object.keys(m).map(function (k) { return SCOPE + k; }));
        });
      })
      .catch(function () { /* precache is a warm-up, not a gate */ }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names
          .filter(function (n) { return n !== FILES_CACHE && n !== MANIFEST_CACHE; })
          .map(function (n) { return caches.delete(n); }),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  // Navigations refresh the manifest FIRST (network-first, cached fallback):
  // the page decision and everything after it in this visit share one fresh
  // manifest, so a deployed site is served whole, never half old half new.
  if (event.request.mode === "navigate") {
    event.respondWith(currentManifest().catch(function () {}).then(function () {
      return handle(event.request);
    }));
  } else {
    event.respondWith(handle(event.request));
  }
});
