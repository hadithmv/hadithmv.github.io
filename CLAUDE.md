# CLAUDE.md

Guidance for Claude Code sessions on this repository — **Hadithmv**, a static
CSV-driven trilingual (Dhivehi / English / Arabic) Quran & hadith viewer on
GitHub Pages. All code, data, and docs live in `codebase/`.

## Workflow rules

- **Never commit.** The user commits via their IDE. Leave all changes
  uncommitted; `git status` should show your work when you finish.
- **Design questions → discuss in prose.** The user prefers plain conversation
  over structured pickers.
- **Verify encodings after any script-based rewrite**: LF (not CRLF), no BOM,
  no trailing newline on data files. Windows PowerShell 5.1 (`powershell`, not
  `pwsh`) mangles BOM-less UTF-8 — Arabic/Thaana become mojibake
  («الناس» → «Ø§Ù„Ù†Ø§Ø³»). Use `pwsh` or the Write tool for file edits.
- When measuring what the site actually serves: GitHub Pages gzips for
  `Accept-Encoding` clients; a bare `curl -I` sees raw bytes.

## House style

- JS: ES5-ish — `var`, function expressions; match the surrounding code.
- Classes: kebab-case; ids: camelCase.
- Mobile breakpoint: 600px.
- Tooltips, errors, and status text in English (page content itself is
  trilingual per book).
- Data files are plain text; derived structure (juz/surah/ayah, basmalah) is
  computed at load, never stored redundantly.

## Verification

Run these before declaring work done (from `codebase/`):

- `node tools/hmv-qrn-smoke.mjs` — headless-Edge smoke battery over the QRN
  reader (paths/ports are in the script header; needs Microsoft Edge).
- `node tools/hmv-toc-scan.cjs` — reader.js TOC freshness scan.
- JS syntax: `cat js/<file>.js | node --check --input-type=module -`
- Expected values: **derive from the data files** via `js/csv.js` `parseCSV`
  (the app's own parser — its trim semantics are the byte-equality contract).
  Never hardcode Arabic/Thaana strings.

When a check fails, classify before touching product code: wrong page state?
hardcoded non-ASCII? known non-error? Only then a product defect. Reference:
**`codebase/docs/TESTING.md`** — known non-errors table, harness traps, and
the "keeping this guide alive" capture-at-discovery rule.

## Don't touch without approval

- `js/table-scroll-sync.js` — the scrollbar sync mechanism.
- The user's real (non-headless) Edge browser. For headless runs always use a
  fresh `--user-data-dir` and kill only Edge processes with
  `--remote-debugging-port`/headless in their command line.

## Data pipeline

- `data/03-update-bookRegistry.ps1` rewrites **both** registries on every run
  (recomputes versions, re-sorts tags). After changing it, run **twice** and
  compare hashes — a byte-stable second run proves idempotency. Never split
  quoted CSV fields when hand-editing registries.
- Version = SHA-256 of the content CSV, first 12 hex, **lowercase** (compared
  case-sensitively client-side).
- After registry or book changes, regenerate the search index:
  `node data/07-rebuild-searchIndex.mjs`.
- Renames/swaps move names, not data: after any `git mv`, verify bytes against
  the git blob (`git show HEAD:<path> | sha256sum`) and check
  `git status --porcelain` for untracked strays at the old path.
