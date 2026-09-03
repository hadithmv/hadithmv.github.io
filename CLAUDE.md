# CLAUDE.md

Guidance for Claude Code sessions on this repository — **Hadithmv**, a static
CSV-driven trilingual (Dhivehi / English / Arabic) Quran & hadith viewer on
GitHub Pages. All code, data, and docs live in `codebase/`.

## Workflow rules

- **Never commit.** The user commits via their IDE. Leave all changes
  uncommitted; `git status` should show your work when you finish.
- **Refresh the SW manifest before every commit.** `dist/manifest.json` is
  the service worker's freshness ledger (codebase/sw.js) — after any change
  to a served file, run `node tools/dist-build.mjs` (full build) or, for a
  data-only edit (registry, note, font), the tiny command
  `node tools/hmv-manifest.mjs` from `codebase/`. The build, the font
  subsetter, and the registry script all call it themselves; a stale
  manifest serves stale files to returning visitors.
- **Design questions → discuss in prose.** The user prefers plain conversation
  over structured pickers.
- **Verify encodings after any script-based rewrite**: LF (not CRLF), no BOM,
  no trailing newline on data files. Windows PowerShell 5.1 (`powershell`, not
  `pwsh`) mangles BOM-less UTF-8 — Arabic/Thaana become mojibake
  («الناس» → «Ø§Ù„Ù†Ø§Ø³»). Use `pwsh` or the Write tool for file edits.
- When measuring what the site actually serves: GitHub Pages gzips for
  `Accept-Encoding` clients; a bare `curl -I` sees raw bytes.
- **Toolbox reference**: the double-click menu (`codebase/Hadithmv Toolbox.bat`
  → `tools/hmv-toolbox.mjs`) is fully documented in `codebase/docs/TOOLBOX.md` —
  every option, the launch chain, sounds, and the pitfalls. Read it before
  touching the toolbox files or the check batteries.

## House style

- JS: ES5-ish — `var`, function expressions; match the surrounding code.
- Classes: kebab-case; ids: camelCase.
- Mobile breakpoint: 600px.
- Tooltips, errors, and status text in English (page content itself is
  trilingual per book).
- Clipped Thaana text needs a start inset — the webfont paints ~1–5px of
  start-side ink past the pen origin on horizontal letters (ސ, ޗ, …). Divs
  (overflow-hidden/ellipsis/line-clamp): `padding-inline-start`; inputs:
  `text-indent` (padding only moves the clip with the text). Current insets
  and the safe-without-inset list: `codebase/docs/ARCHITECTURE.md` "Font".
- HTML escaping: cell content renders raw as HTML **by design** — the data
  files are the trust boundary (RDF carries `<br>`/`<span>`/entities; see
  `codebase/docs/TESTING.md`). Only user/URL input (query terms) is
  escaped: `escapeHTML` covers `& < > " '` — safe in text **and**
  `value="…"`-style quoted-attribute contexts; never splice input into an
  attribute raw. Full contract: `codebase/docs/ARCHITECTURE.md` "HTML &
  DOM".
- Data files are plain text; derived structure (juz/surah/ayah, basmalah) is
  computed at load, never stored redundantly.

## Verification

Run these before declaring work done (from `codebase/`):

- `node tools/hmv-qrn-smoke.mjs` — headless-Edge smoke battery over the QRN
  reader (paths/ports are in the script header; needs Microsoft Edge).
- `node tools/hmv-info-check.mjs` — info-modal battery (title/author entry
  points, tabs, markdown renderer, in-modal search, exports; ports in the
  script header).
- `node tools/hmv-authors-check.mjs` — Authors & Periods browse battery (the
  shared facet system across library page, modals, dashboard, reader header).
- `node tools/hmv-libscope-check.mjs` — library-scope picker battery.
- `node tools/hmv-toc-scan.cjs` — reader.js TOC freshness scan.
- `node tools/hmv-stream-check.mjs` — streaming battery: stream-parser
  parity with `parseCSV` (every content CSV, seeded chunkings + callback
  delivery) + the throttled big-book UX (progress line, first rows while
  loading, gating) + the quran content-modal column loads (progress line,
  cancel, sequential presets; ports in the script header).
- `node tools/hmv-sw-check.mjs` — service-worker battery (registration,
  precache, cache-served repeat visits, offline rendering, per-file update
  propagation; serves over http://127.0.0.1 — a secure context is required
  for SWs).
- `python tools/hmv-font-subset.py --check` — corpus-vs-webfont coverage,
  after any change that adds characters (one-time `pip install fonttools
  brotli`; the tool is also the subsetter itself).
- After `node tools/dist-build.mjs`, run the four page batteries with `--dist` to
  verify the built `dist/` (info, authors, libscope, qrn-smoke).
- JS syntax: `cat src/js/<file>.js | node --check --input-type=module -`
- Expected values: **derive from the data files** via `src/js/csv.js` `parseCSV`
  (the app's own parser — its trim semantics are the byte-equality contract).
  Never hardcode Arabic/Thaana strings.

When a check fails, classify before touching product code: wrong page state?
hardcoded non-ASCII? known non-error? Only then a product defect. Reference:
**`codebase/docs/TESTING.md`** — known non-errors table, harness traps, and
the "keeping this guide alive" capture-at-discovery rule.

## Don't touch without approval

- `src/js/table-scroll-sync.js` — the scrollbar sync mechanism.
- The user's real (non-headless) Edge browser. For headless runs always use a
  fresh `--user-data-dir` and kill only Edge processes with
  `--remote-debugging-port`/headless in their command line.

## Data pipeline

- `data/04-update-bookRegistry.ps1` rewrites the book registry on every run
  (recomputes versions) — it **never** touches `01-registry-bookTags.csv`: tag
  row order is the palette slot assignment for the auto-generated colours, so
  it is hand-controlled. After changing the script, run **twice** and compare
  hashes — a byte-stable second run proves idempotency. Never split quoted
  CSV fields when hand-editing registries.
- Version = SHA-256 of the content CSV, first 12 hex, **lowercase** (compared
  case-sensitively client-side).
- After registry or book changes, regenerate the search index:
  `node data/08-rebuild-searchIndex.mjs` (or double-click
  `codebase/rebuild-index.bat`).
- Renames/swaps move names, not data: after any `git mv`, verify bytes against
  the git blob (`git show HEAD:<path> | sha256sum`) and check
  `git status --porcelain` for untracked strays at the old path.
