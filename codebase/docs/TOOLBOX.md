# Toolbox

The Toolbox is the double-click launcher for the site's maintenance tasks —
building, previewing, refreshing book data, and running the pre-commit
verification battery. It is developer tooling, not part of the site itself.

## Launch chain

- `Hadithmv Toolbox.bat` is only a **door**: a bat always runs in cmd.exe, so
  the bat's whole job is to check that node exists and hand over to the menu
  (`node tools/hmv-toolbox.mjs %*` — the argument passes through, so
  `Hadithmv Toolbox.bat 5` jumps straight to the preview). Missing node gets a
  readable message instead of a cryptic error.
- **The menu (`tools/hmv-toolbox.mjs`) owns everything else** — it runs on
  node, so the same file works unchanged on Windows, macOS and Linux (only
  the double-click launcher differs per OS).
- **PowerShell is borrowed for exactly two jobs**: the registry step inside
  option 4 (the PS1) and the low failure-buzz. The menu prefers `pwsh`
  (PowerShell 7) and falls back to `powershell` — the registry script carries
  a UTF-8 BOM, so even Windows PowerShell 5.1 parses it.
- **cmd is used only for `start`** — opening the preview window, Explorer,
  Notepad and URLs.
- **Python runs the preview server** (`python` on Windows, `python3`
  elsewhere) and the font coverage check inside option 10.

## Options

| # | What it does |
| --- | --- |
| 1 | **Build the site** — the full pre-commit build into `dist/` (~1 minute); prints the size summary from `dist-build-report.md`. |
| 2 | **Rebuild search index** — after adding or changing a book, so it shows up in search. |
| 3 | **Refresh freshness** — the quick update for data-only changes: rewrites `dist/manifest.json` (the service worker's ledger) without a full build. |
| 4 | **Refresh book data** — 3 steps: registry update (the PS1 — scans `data/content/`, recomputes version hashes, sorts), search index, freshness. |
| 5 | **Preview the site** — starts Python's http.server on port 8899 in its own window and opens the built site in the browser. Reuses a server already listening on 8897–8899 instead of stacking a second one. |
| 6 | **What's changed** — `git status` summary with hints (e.g. "changed source but didn't build — run option 1"). |
| 7 | **Tidy build reports** — restores `dist-build-report.md` and `font-build-report.md` to their committed state when a build dirtied them. |
| 8 | **Open the folder** — the codebase folder in Explorer. |
| 9 | **Build and preview** — option 1 followed by option 5. |
| 10 | **Run the checks** — the seven pre-commit batteries (see below); writes `checks-report.md` and opens it in Notepad when any check fails. |
| 11 | **About / health** — site versions, tool versions on this machine; press **S** to toggle the sound. |
| 12 | **Check the live site** — compares the published version with the local source. |
| 13 | **Quit** |

The sibling bats `dist-build.bat` and `rebuild-index.bat` remain as quick
paths around options 1 and 2.

## Sounds

- **Success beep** — BEL BEL, on options 1 and 9 after a clean build, and on
  option 10 when all checks pass.
- **Failure buzz** — a low 180 Hz double beep (via the detected PowerShell),
  whenever any option fails, including option 10 with failing checks.
- Options 2–8, 11, 12 and 13 are silent on success.
- The mute flag lives in `%USERPROFILE%\.hadithmv-tools` (content `1` =
  muted) — outside the repo, so it never shows in git status. Toggled with S
  from the About screen.

## Checks (option 10)

Seven checks run in order; each opens an invisible browser (or the font
corpus) and exercises a part of the site. The report lands in
`checks-report.md` (gitignored — never dirties "what's changed", never
ships): a summary table, per-check details, run time, and a bold verdict.

1. reader smoke test — `tools/hmv-qrn-smoke.mjs`
2. info modal battery — `tools/hmv-info-check.mjs`
3. authors and periods battery — `tools/hmv-authors-check.mjs`
4. library scope battery — `tools/hmv-libscope-check.mjs`
5. service worker battery — `tools/hmv-sw-check.mjs`
6. table-of-contents scan — `tools/hmv-toc-scan.cjs`
7. font coverage check — `tools/hmv-font-subset.py --check` (skipped with a
   SKIP row when python is missing)

## Files

| File | Role |
| --- | --- |
| `Hadithmv Toolbox.bat` | Launcher — the double-click door. |
| `tools/hmv-toolbox.mjs` | The menu — all options, one function each. |
| `tools/hmv-version.mjs` | Shared version/branch/banner helper (also used by legacy CLI consumers). |
| `tools/hmv-manifest.mjs` | Writes `dist/manifest.json` — option 3, step 3 of option 4, and the tiny data-only command from CLAUDE.md. |
| `tools/dist-build.mjs`, `data/08-rebuild-searchIndex.mjs`, `tools/hmv-font-subset.py` | The workers behind options 1/2/4/9 and check 7. |
| `data/04-update-bookRegistry.ps1` | The registry script behind option 4 (see Pitfalls). |
| `checks-report.md` | Option 10 output (gitignored). |
| `dist-build-report.md`, `font-build-report.md` | Committed build size ledgers — option 7 restores them. |
| `%USERPROFILE%\.hadithmv-tools` | The sound flag (outside the repo). |

## Pitfalls — do not re-introduce

1. **Never pass a pre-quoted `start` title through node's spawn.** node
   rewrites embedded quotes, and cmd then reads a title fragment as the
   program name ("Windows cannot find 'preview'"). Build **one verbatim
   command line** and pass `windowsVerbatimArguments: true` (see the
   comments in `openExternal` and `preview`).
2. **The registry script must stay a UTF-8 BOM + pure ASCII.** Windows
   PowerShell 5.1 reads BOM-less `.ps1` files as ANSI and misparses
   multi-byte characters into cascading "Missing closing '}'" errors. Both
   the BOM and the ASCII are load-bearing; the file header says so.
3. **Keep the manual readline line-queue.** `rl.question` drops lines that
   arrive while no question is pending (piped input delivers several lines in
   one chunk) — typed answers would get eaten.
4. **Resolve `runCaptured` on `'close'`, not `'exit'`** — the last stdout
   chunk can still be in flight when `'exit'` fires.
5. **`python --version` prints to stdout on modern Python, stderr on very old
   ones** — the About screen reads whichever stream has the answer.
6. **Old consoles render ━/📚/✅ as `??`** — keep the script's own output
   pure ASCII (console fonts, not a bug).

## Related docs

- `ARCHITECTURE.md` — the build/commit rules the Toolbox exists to serve
  (the "Build" section), the service worker manifest, HTML/DOM contracts.
- `TESTING.md` — the batteries in detail, known non-errors table, harness
  traps.
- `API.md` — module documentation for the site's JS, and the notes content
  format spec.
