# Testing & Verification Guide

Companion to the headless-Edge smoke battery used to verify data-layer changes.
The battery lives at `../tools/hmv-qrn-smoke.mjs` (run `node tools/hmv-qrn-smoke.mjs`
from the codebase root; paths resolve relative to the script, and
`HMV_SMOKE_PORT` / `HMV_SMOKE_PROFILE` env vars override the defaults). The
TOC freshness scan for reader.js lives at `../tools/hmv-toc-scan.cjs`
(`node tools/hmv-toc-scan.cjs`). Its job: when a check fails, you know
**in seconds** whether it is a product bug, a test-setup problem, or a
pre-existing behavior that merely looks wrong — instead of spending an hour
re-diagnosing each one.

## When a check fails — classify first

Before touching product code, run this sequence:

1. **Is the page in the state the test assumed?** Mode (card vs table), book,
   language, loaded columns. Half of this session's false alarms were tests
   reading the wrong view (e.g. no `.reader-table` because a fresh profile
   boots in card mode).
2. **Is the expected value hardcoded non-ASCII?** Any hardcoded Arabic/Thaana
   in a test is suspect on two counts: transcription look-alikes
   (ރު vs ރް, މ vs ސ) and file-encoding corruption (see Harness traps).
   Re-derive from the data files instead.
3. **Is the behavior in the "known non-errors" table below?** If yes, the
   check itself needs fixing, not the product.
4. Only then treat it as a product defect — and confirm against the
   pre-restructure baseline (`git diff` on the touched files first).

## Known non-errors (pre-existing behaviors that look like failures)

| Observation | Why it is not a bug | Correct assertion |
|---|---|---|
| `.reader-table` missing on a fresh profile | Fresh profiles boot in **card mode** for non-radheef books (`reader.js:95`) — the table only exists after switching via View-mode dropdown → Table | Click `#btnViewMode` → `#viewModeDropdown .view-mode-option[data-mode="table"]`, then wait for a `<tr>` |
| Row count far below 6236 | Table renders **incrementally** — ~50 initial rows, 30 per chunk appended on scroll (`reader.js:780`) | `scrollTo(0, document.body.scrollHeight)` in a poll loop until `tbody tr` count is stable; 6236 rows ≈ 210 chunks — allow up to 90 s |
| `qrnAyahInput` shows a stale value after juz/surah nav | Pre-existing quirk: `goToQuranJuz` hardcodes `currentAyah = 1` (`quran-ui.js:357`) and an async scroll-sync may race it | Assert navigation via the **first rendered row's content** (imlai text at the known start row), never via the ayah input |
| Quran-nav fields "exist" on a non-Quran book | `#readerPanelQuran`, `#qrnJuzInput` etc. are **static markup on every book page**; only `initQuranUI`'s `style.display = ""` (Quran books only) reveals the panel | Check the panel's `getComputedStyle(...).display`, not element existence |
| Imlai cell text never equals the CSV value | Cells render wrapped in ﴿ … ١ ﴾ (`decorateAyah`, `quran-data.js:271`) | Strip U+FD3F/U+FD3E **and** the trailing Arabic-Indic numerals U+0660–U+0669 (the ayah number sits inside the brackets) before comparing |
| "Surah 114:1 has no basmalah" — wrong | Only surahs **1 and 9** lack the basmalah; 114:1 has it. Juz 30 opens at 78:1, which also has it | Basmalah present on 2:1/114:1/78:1; empty on 1:1/9:1 |
| English strings never match titles/labels | The page defaults to **Dhivehi**: titles, modal labels, result counts and toasts are Thaana | Never assert English UI text; read expected strings from the registries (05 displayDV, 02 titleDV) with the app's own `parseCSV` |
| Search result count differs between runs | Quick search matches **`allData`** — all loaded columns incl. hidden book columns (`reader-search-ui.js:153`). With Arabic tafseer books loaded: 841 matches for «الناس»; base columns only: 179. Empty-result text is «ނަތީޖާ 0» (no colon), results are «ނަތީޖާ: N» | Assert count relative to the column set loaded, or just > 0 and < 6236; treat "0 with no colon" as the no-results branch, not an error |
| PRESET_RESET does not restore a juz/surah slice | Reset only hides external columns (`quran-ui.js:509`); the filtered slice from navigation stays | Not a regression — confirm the slice behavior separately if it matters |

## Harness traps (test-side failures, not product bugs)

- **PS 5.1 encoding corruption.** `powershell` (Windows PowerShell) reads and
  rewrites BOM-less UTF-8 as ANSI: any file touched by a `powershell`-run
  script that contains Arabic/Thaana/emoji gets mojibake'd
  («الناس» → «Ø§Ù„Ù†Ø§Ø³», ⚠️ → «âš ï¸») and a UTF-8 BOM added. Use `pwsh`
  (PowerShell 7) or the Write tool for test-file edits; after any script
  rewrite, verify: no BOM (`[System.IO.File]::ReadAllBytes(...)[0]` ≠ 0xEF)
  and the Arabic term still greps. **A mojibake'd search term silently returns
  0 matches** — the most misleading failure mode in this session.
- **`node -e` backslash mangle.** Inline `node -e` heredocs on Windows eat
  backslashes (`C:\\Program Files` → `C:Program Files`, spawn ENOENT). Always
  write harness scripts to temp files.
- **Edit-tool `\u` normalization.** The Edit tool normalizes `\uXXXX` escape
  text when matching old_string — matching a literal escape sequence in a
  file can fail even when it looks identical. Write the file, or compose the
  escape from `[char]0x5C` in PowerShell.
- **Headless Edge CDP flakes.** Fresh `--user-data-dir` per run (deletes are
  required for a clean book list); the known
  «Cannot read properties of undefined (reading 'result')» flake → delete the
  profile dir and retry. Custom CDP properties return token strings — measure
  DOM rects instead.
- **Fresh profile = cold IndexedDB.** First run does real fetches; slow first
  loads are not hangs. Version-gated cache is per-profile, so timing between
  runs varies — use waitFor loops over fixed sleeps.

## Assertion rules

1. **Derive, never hardcode**: expected values come from the data files via
   `js/csv.js` `parseCSV` (the app's parser — its trim semantics are the
   byte-equality contract). Basmalah, surah starts, juz starts, labels,
   titles, ayah text — all file-derived.
2. **Assert content, not widgets**: first-row imlai/basmalah cells against
   the CSV, never the ayah input or scroll position.
3. **Verify against the old data first**: the pre-swap script re-implements
   the derivation loop and asserts byte-equality of every merged cell —
   any later diff that survives it is a genuine regression.
4. **Wait for state, then assert**: `waitFor` on the thing being measured
   (rows rendered, result count changed, `th` count), never `sleep` alone.
