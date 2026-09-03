# Toolbox

The Toolbox is the double-click launcher for the site's maintenance tasks —
building, previewing, refreshing book data, and running the pre-commit
verification battery. It is developer tooling, not part of the site itself.

At a glance — the 18 options by job: build the site (1), rebuild the
search index (2), refresh the freshness manifest (3), refresh book
data (4), preview locally (5, 8), see what git would commit (6), open
the codebase folder (7) or the notes folder (12), run the pre-commit
checks (9), about / health (10), live-site status (11), new book /
finish registration / add author (13–15), sound / restart / quit
(16–18).

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
  elsewhere) and the font coverage check inside option 9.

## Options

| # | What it does |
| --- | --- |
| 1 | **Build the site** — the full pre-commit build into `dist/` (~1 minute); prints the size summary from `dist-build-report.md`, then asks whether to run the checks. |
| 2 | **Rebuild search index** — the search words only; a new book goes through option 4 (registry + index + freshness in one). |
| 3 | **Refresh freshness** — the quick update for data-only changes: rewrites `dist/manifest.json` (the service worker's ledger) without a full build. |
| 4 | **Refresh book data** — 3 steps: registry update (the PS1 — scans `data/content/`, recomputes version hashes, sorts), search index, freshness; each step is marked done/failed as it finishes. |
| 5 | **Preview the site** — starts Python's http.server on port 8899 in its own window and opens the built site in the browser. When one is already running on 8897–8899: Enter opens it, S stops the server. On a network it also prints the LAN address, so a phone on the same wifi can open the preview. |
| 6 | **What's changed** — colour-coded `git status` summary (staged green, unstaged/untracked red, git-style) with hints (e.g. "changed source but didn't build — run option 1") and git's own size line ("N files changed, M insertions(+), K deletions(-)"; tracked changes only); the menu row's hint shows how many files git would put in your next commit — "(nothing to commit)" when clean. |
| 7 | **Open the folder** — the codebase folder in Explorer. |
| 8 | **Build and preview** — option 1 followed by option 5. |
| 9 | **Run the checks** — the eight pre-commit batteries, or a single one of your choosing (see below); writes `checks-report.md`, opens it in Notepad when any check fails, and offers to open it when all pass; **O** opens the last report without running anything. |
| 10 | **About / health check** — site versions, tool versions, preview-server state, corpus size (books + authors from the registries), when the checks last ran with their verdict, and the sound state. |
| 11 | **Check the live site** — compares the published version with the local source; offers the live site itself, and the GitHub Actions page when the live site is behind. |
| 12 | **Open the notes folder** — the hand-authored markdown (authors + works) in `static/notes/`. |
| 13 | **New book** — copies a chosen template into `data/content/` under a new book code and prints the checklist (content → author → tag → option 4 → registry row → font → build), then offers to fill the registry row with you (option 14). |
| 14 | **Finish a book registration** — fills or edits a book's row in `03-registry-bookMeta.csv`: the three titles, the author code (checked against 02), the tags. The version is recomputed from the content CSV — never typed. Refreshes the manifest. |
| 15 | **Add an author** — appends a row to `02-registry-bookAuthors.csv` (code, the three names, AH years), checks for duplicates, refreshes the manifest. |
| 16 | **Sound on/off** — mutes the success beeps and the failure buzz; the row shows the current state (the flag lives in `%USERPROFILE%\.hadithmv-tools`, outside the repo). |
| 17 | **Restart** — starts the menu over in place: re-checks the tools (a dimmed row lights up if python or git appeared), re-reads the sound flag, redraws the banner. |
| 18 | **Quit** |

The sibling bats `dist-build.bat` and `rebuild-index.bat` remain as quick
paths around options 1 and 2.

## The banner

The menu's banner reads the site version from `src/js/i18n.js` via
`tools/hmv-version.mjs` — the same source the site's own sidebar shows, with
the " (Web)" suffix dropped for the console — in cyan, followed by a
dash-separated branch name in plain white (clamped to 12 chars); the padding
is computed in the menu itself. It warns when there is no built copy yet
("run option 1") and when the built copy is behind the source (the same
state the About screen reports). Options whose tools are missing on this
machine (python for option 5, git for option 6) appear dimmed —
picking one still runs and explains. The parenthetical hints in the rows
are dimmed too, and all start in the same column, so the list scans at a
glance — except the two hints that carry live state: the sound row's
(dim `(now on)`, amber `(now off)` when muted) and the What's-changed
row's (amber when files await, dim `(nothing to commit)` when clean).
Dim hyphen rules (the same rule the footer uses) split the list into five
job groups without renumbering anything — build/refresh (1–4), local
preview & status (5–8), verify & health (9–11), content (12–15), the menu
itself (16–18) — so the blocks scan as units.
Below the menu, a footer line shows state at a glance: when the checks
last ran and their verdict, when the site was last built (the size
report's timestamp), and whether a preview server is running.
A failed verdict names the failing check(s) — e.g. `checks: failed
(sw-check) today 10:28`. The verdict word is coloured by meaning: fresh
green, stale amber (a passed run more than a week old), failed red.
Under it, a dim tip line notes that Ctrl+C quits from anywhere.

## Sounds

- **Success beep** — BEL BEL, on options 1 and 8 after a clean build, and on
  option 9 when all checks pass.
- **Failure buzz** — a low 180 Hz double beep (via the detected PowerShell),
  whenever any option fails, including option 9 with failing checks.
- Options 2–7 and 10–13 are silent on success; 14 and 15 beep once the
  row is written and the freshness file refreshed; 16 plays the success
  beep on unmute, so you hear what you turned back on; 17 (Restart) is
  silent; 18 (Quit) just exits.
- The mute flag lives in `%USERPROFILE%\.hadithmv-tools` (content `1` =
  muted) — outside the repo, so it never shows in git status. Toggled with
  option 16 (Sound on/off); the row's hint shows the state (`(now off)` in
  amber when muted) and the About screen shows it too — the menu footer
  deliberately does not repeat it.

## Checks (option 9)

Eight checks run in order; each opens an invisible browser (or the font
corpus) and exercises a part of the site. Press Enter for all eight,
1–8 for just that one, or O to open the last report without running
anything — the report marks the rest SKIP and the verdict names the
check. The report lands in `checks-report.md` (gitignored — never
dirties "what's changed", never ships): a summary table, per-check details,
run time, and a bold verdict. The report opens itself in Notepad when any
check fails; after an all-pass run the menu asks whether to open it. As
each battery finishes, its own line appears — PASS or FAIL with the time
it took — and the console summary line then ends with the total run time
(e.g. "All checks passed. - 3m 12s"). While a battery runs, the menu
shows a small ASCII spinner whenever it falls silent — its browser work
is quiet for long stretches between section lines — and the build
(option 1) spins the same way during its ~1 minute of silence. After a
few seconds of spinning it starts counting up the elapsed seconds
("building - 42s"), so the menu only shows a spinner — and tells time —
when nothing else is moving.

1. reader smoke test — `tools/hmv-qrn-smoke.mjs`
2. info modal battery — `tools/hmv-info-check.mjs`
3. authors and periods battery — `tools/hmv-authors-check.mjs`
4. library scope battery — `tools/hmv-libscope-check.mjs`
5. service worker battery — `tools/hmv-sw-check.mjs`
6. table-of-contents scan — `tools/hmv-toc-scan.cjs`
7. streaming battery — `tools/hmv-stream-check.mjs` (big-book CSV parse
   parity + the throttled first-content UX on reader.html + the quran
   content-modal column loads: progress, cancel, sequential presets)
8. font coverage check — `tools/hmv-font-subset.py --check` (skipped with a
   SKIP row when python is missing)

## Files

| File | Role |
| --- | --- |
| `Hadithmv Toolbox.bat` | Launcher — the double-click door. |
| `tools/hmv-toolbox.mjs` | The menu — all options, one function each. |
| `tools/hmv-version.mjs` | Shared version/branch/banner helper (also used by legacy CLI consumers). |
| `tools/hmv-manifest.mjs` | Writes `dist/manifest.json` — option 3, step 3 of option 4, and the tiny data-only command from CLAUDE.md. |
| `tools/dist-build.mjs`, `data/08-rebuild-searchIndex.mjs`, `tools/hmv-font-subset.py` | The workers behind options 1/2/4/9 and check 8. |
| `data/04-update-bookRegistry.ps1` | The registry script behind option 4 (see Pitfalls). |
| `checks-report.md` | Option 10 output (gitignored). |
| `dist-build-report.md`, `font-build-report.md` | Committed build size ledgers — the build rewrites them; option 1 reads the summary from the first. |
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
7. **The launcher sets `chcp 65001`** — without it, Arabic/Thaana answers to
   the option 15/16 prompts arrive in the console's old codepage and get
   written into the registries as mojibake. Keep that line in the bat.

## Related docs

- `ARCHITECTURE.md` — the build/commit rules the Toolbox exists to serve
  (the "Build" section), the service worker manifest, HTML/DOM contracts.
- `TESTING.md` — the batteries in detail, known non-errors table, harness
  traps.
- `API.md` — module documentation for the site's JS, and the notes content
  format spec.
