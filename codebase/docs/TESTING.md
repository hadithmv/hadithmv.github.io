# Testing & Verification Guide

Companion to the headless-Edge smoke battery used to verify data-layer changes.
The battery lives at `../tools/hmv-qrn-smoke.mjs` (run `node tools/hmv-qrn-smoke.mjs`
from the codebase root; paths resolve relative to the script, and
`HMV_SMOKE_PORT` / `HMV_SMOKE_PROFILE` env vars override the defaults). The
TOC freshness scan for reader.js lives at `../tools/hmv-toc-scan.cjs`
(`node tools/hmv-toc-scan.cjs`). The column-label coverage scan lives at
`../tools/hmv-header-scan.mjs` (`node tools/hmv-header-scan.mjs`): it walks
every `data/content/*.csv` header and diffs it against the token tables in
`js/column-tokens.js` (the same tables `js/column-labels.js` uses to derive
display labels for the advanced-search column dropdown and the column
toggles). An unknown token means that header would silently fall back to
its raw identifier in the selection chrome — add a token (plus a `col*`
entry in `js/i18n.js`) or list it in `DELIBERATE_RAW` with a reason. Its
job: when a check fails, you know
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
| --- | --- | --- |
| `.reader-table` missing on a fresh profile | Fresh profiles boot in **card mode** for non-radheef books (`reader.js:95`) — the table only exists after switching via View-mode dropdown → Table | Click `#btnViewMode` → `#viewModeDropdown .view-mode-option[data-mode="table"]`, then wait for a `<tr>` |
| Row count far below 6236 | Table renders **incrementally** — ~50 initial rows, 30 per chunk appended on scroll (`reader.js:780`) | `scrollTo(0, document.body.scrollHeight)` in a poll loop until `tbody tr` count is stable; 6236 rows ≈ 210 chunks — allow up to 90 s |
| A QRN book shows rows with **empty book cells** (base columns only) | QRN books are 6,236-slot skeletons: an all-empty row marks an untranslated ayah and is preserved by design (`keepEmpty` parse in `loadQuranBookCSV` + cache record). The empty cells at those slots are the intended "no translation yet" state — not missing data | Expect empty book cells exactly at the untranslated slots (soabuni 89, jaufar 1,837; e.g. soabuni 99:7, jaufar's 2,900-ish gap, 114 untranslated ayahs). A `mergeQuranData` console warning ("merge will misalign") is a **genuine** structural error — fix the CSV (row count ≠ 6,236), not the test |
| `qrnAyahInput` shows a stale value after juz/surah nav | Pre-existing quirk: `goToQuranJuz` hardcodes `currentAyah = 1` (`quran-ui.js:357`) and an async scroll-sync may race it | Assert navigation via the **first rendered row's content** (imlai text at the known start row), never via the ayah input |
| Quran-nav fields "exist" on a non-Quran book | `#readerPanelQuran`, `#qrnJuzInput` etc. are **static markup on every book page**; only `initQuranUI`'s `style.display = ""` (Quran books only) reveals the panel | Check the panel's `getComputedStyle(...).display`, not element existence |
| Imlai cell text never equals the CSV value | Cells render wrapped in ﴿ … ١ ﴾ (`decorateAyah`, `quran-data.js:271`) | Strip U+FD3F/U+FD3E **and** the trailing Arabic-Indic numerals U+0660–U+0669 (the ayah number sits inside the brackets) before comparing |
| "Surah 114:1 has no basmalah" — wrong | Only surahs **1 and 9** lack the basmalah; 114:1 has it. Juz 30 opens at 78:1, which also has it | Basmalah present on 2:1/114:1/78:1; empty on 1:1/9:1 |
| English strings never match titles/labels | The page defaults to **Dhivehi**: titles, modal labels, result counts and toasts are Thaana | Never assert English UI text; read expected strings from the registries (05 displayDV, 02 titleDV) with the app's own `parseCSV` |
| Search result count differs between runs | Quick search matches **`allData`** — all loaded columns incl. hidden book columns (`reader-search-ui.js:166`). With Arabic tafseer books loaded: 841 matches for «الناس»; base columns only: 179. Empty-result text is «ނަތީޖާ 0» (no colon), results are «ނަތީޖާ: N» | Assert count relative to the column set loaded, or just > 0 and < 6236; treat "0 with no colon" as the no-results branch, not an error |
| PRESET_RESET does not restore a juz/surah slice | Reset only hides external columns (`quran-ui.js:509`); the filtered slice from navigation stays | Not a regression — confirm the slice behavior separately if it matters |
| A Thaana term's first glyph looks chipped on a history item / result snippet / title / surah-search input | The Hadithmv webfont paints ~1–5px of **start-side ink past the pen origin** on horizontal Thaana letters (ސ, ޗ, … — alef has none). Any surface that clips (overflow-hidden, ellipsis, line-clamp, or an input's inner editor) cuts that overhang when the run's origin sits at the clip edge; the clip is invisible when the surface has a start inset. The fixed surfaces carry their insets (`.hist-text` 6px, `.search-result-snippet` 8px, `.quran-surah-search` `text-indent: 6px`, `#pageTitle` 8px) — the battery's section F asserts them | Computed styles, not pixels: section F of `hmv-qrn-smoke.mjs`, or `getComputedStyle(...).paddingInlineStart` / `.textIndent` on the four surfaces. A bare pixel probe needs a **clipped-vs-visible reference pair** (same box, overflow forced visible) — see the mirror traps below |
| A security audit claims reflected XSS via `?q=` or unescaped cells | Not exploitable. Every `?q=` → innerHTML sink escapes (`input.value` is a property assignment; the no-matches line uses `escapeHTML(q)`; snippets pass through `highlightMatches`, which escapes text and `<mark>` content). Cells render raw as HTML **by design** — the data files are the trust boundary (RDF carries `<br>`/`<span>`/entities, e.g. `data/content/RDF-all.csv`). The one raw-attribute spot (`data-q="…"` in library-search cards) can't fire: a payload must tokenize into real search-index words (`tokenizeText` splits on every non-letter/mark/number char; `searchLibrary` ANDs), and index words never contain `"`/`<` — zero `onmouseover`/`onerror`/`javascript:` tokens in any data file (verified 2026-08-10). Audit line numbers routinely don't match this codebase — re-anchor each citation to the working tree first | Trace each sink, then grep `data/` for the payload tokens (the engine's matching gate is decisive); if the payload can't match a row, it can't render. `escapeHTML` covers `& < > " '` — safe in text and quoted attributes |

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
- **`exceptionDetails.text` is only "Uncaught".** When `Runtime.evaluate`
  throws, `.text` carries just the word "Uncaught" — the real error lives in
  `.exceptionDetails.exception.description`. A throw with no visible cause is
  one line of debug output away; include the description in the throw.
- **Windowed-probe scale discipline.** Any headless window used for pixel
  measurement must set `Emulation.setDeviceMetricsOverride({width, height,
  deviceScaleFactor: 1, mobile: false})` **before** navigation and capture at
  scale 1 — otherwise Windows display scaling (1.5×) corrupts every
  measurement. And await `document.fonts.ready` (with `.catch(() => false)`)
  before screenshots, or the webfont isn't loaded and glyph metrics are
  fallback.
- **Fresh profile = cold IndexedDB.** First run does real fetches; slow first
  loads are not hangs. Version-gated cache is per-profile, so timing between
  runs varies — use waitFor loops over fixed sleeps.

## Traps from adjacent workflows

Not headless-battery traps, but the same class of failure — a measurement or
audit step that looks like a product problem. Same rule: classify before
blaming the product.

- **GitHub Pages gzip fools size analysis.** Pages gzips for clients that send
  `Accept-Encoding: gzip, deflate, br` (all browsers do); a bare `curl -I`
  sends no header, gets raw bytes and no `Content-Encoding`, and looks exactly
  like "server doesn't compress". Verified 2026-08-07: search-index.json is
  13.77MB over the wire vs 41.65MB raw. Correct: probe with
  `-H "Accept-Encoding: gzip"` (or `--compressed`) and read `Content-Encoding`;
  the browser's `resp.text()` is unaffected — decompression is transparent.
- **`git mv` moves names, not data.** After any rename/swap of data files,
  verify bytes against the git blob (`git show HEAD:<path> | sha256sum` vs the
  working file), and read verification output literally — an earlier check
  echoed the header from the file *named* "04-registry-quranSurahs.csv" and it
  was misread as proof. Also check `git status --porcelain` for **untracked
  strays at the old path**: an editor with the old file open can re-save and
  recreate it after a `git mv` (seen 2026-08-07 with 02-registry-bookNames.csv
  — content was byte-identical; close the old tab in the editor).
- **Registry regeneration must be idempotent.** `data/03-update-bookRegistry.ps1`
  rewrites **both** registries on every run (recomputes version hashes,
  re-sorts tags, which shifts palette colours — documented behavior). After any
  change to the script, run it twice and compare hashes — a byte-stable second
  run proves idempotency. The version swap replaces only the trailing 12-hex
  token on the raw row; never split quoted fields — a split mangles quoted
  comma-bearing cells (a quoted titleEN `, with` lost its space) and an
  uppercase-versions run forced a one-time cache re-download for every visitor
  (versions compare case-sensitively at csv.js:163). The editor re-saves 02 as
  LF over script output — check file mtimes before trusting a "before" hash.
- **`core.autocrlf` hides CRLF-tainted data files from git.** With
  `core.autocrlf=true` (this repo), git normalizes CRLF→LF before hashing, so
  a working file whose line endings were CRLF-ized (Windows editor re-save)
  shows 0 changes in `git status`/`diff` while its disk bytes differ from
  the committed blob — sha256sum of the file ≠ `git show HEAD:<path> |
  sha256sum`. Verified 2026-08-09: 47/62 content CSVs were CRLF-tainted
  (`QRN-*` and `RDF-*` fully — 6,236 CRs each — most others a few lines; `file`
  samples the start and misses low CR counts, don't trust its "clean"
  verdict). Consequences: `03-update-bookRegistry.ps1` computes versions with
  `Get-FileHash` on raw disk bytes, so registry versions silently tracked the
  CRLF bytes and no longer equal the deployed blob's hash — the client treats
  the version as an opaque cache key (`csv.js:162`), so this is truthfulness
  hygiene, not a cache bug, but line-ending-only re-saves churn versions and
  force needless one-time re-downloads. Detection: `wc -c` vs
  `tr -d '\r' | wc -c` (delta = CR count) — but CRs come in two flavors and
  the delta alone doesn't tell them apart. **Line-ending CRLF pairs are
  editor taint; bare CRs (0x0D not followed by LF) inside quoted CSV fields
  are legitimate data** — 10 files carry them (DFK-kitabulIlmAbiKhaithama 193,
  HDT-bulughulMaram-FULL-HDN 128, HDT-bulughulMaram 59,
  IH-huquqDaathIlaihalFitra 21, IH-mukhtasarTauhidilAsmaWaSifat 7,
  HDT-arbaoonNawawi 6, DFK-sharhuSunnahBarbahari 2, HDT-HBK-sunanAbiDawud 1,
  RDF-ahmadFahmyDidi 1, RDF-asmaullahilHusna 1; verified 2026-08-09), so a
  blanket `tr -d '\r'` is **NOT byte-safe** — it corrupts those files. Fix:
  strip only `\r\n` pairs (`sed 's/\r$//'`). 03-update-bookRegistry.ps1
  self-heals: a byte-level `\r\n`→`\n` pass (Latin-1 round-trip, bare CRs
  preserved) normalizes any tainted file before hashing, so versions describe
  the LF form that will be deployed, not the tainted disk bytes. 8 files were
  committed with CRLF line endings (DFK-sharhuSunnahBarbahari,
  HDT-HBK-sunanAbiDawud, HDT-bulughulMaram, HDT-bulughulMaram-FULL-HDN,
  IH-huquqDaathIlaihalFitra, IH-mukhtasarTauhidilAsmaWaSifat,
  RDF-ahmadFahmyDidi, RDF-asmaullahilHusna); their disk files are LF now and
  the registry versions are the LF-form hashes, so after the next commit
  those 8 books re-download once per visitor, then stabilize. Static audits against
  HTML miss classes only present in JS strings — the Tier 2 sweep deleted two
  live rules (`.modal-overlay` base, `.card` surface; `class="card book-card"`
  in dashboard.js:408, `class="card lib-result"` in library-search-page.js:381;
  both restored verbatim from HEAD). Correct procedure: (1) grep the bare class
  token with word boundaries across `books/*.html` **and** `js/*.js`;
  (2) watch pairs where a `.open`/`.hover`/`.active` variant survives but its
  base was deleted — the base is almost certainly still live; (3) re-serve and
  eyeball index + reader + library-search after any CSS sweep.
- **Text-clip pixel probes need a clipped-vs-visible reference pair.** To
  measure the webfont's start-side overhang clip (known non-errors row above),
  shoot the real element and a reference with the identical box but
  `overflow: visible` (or, for inputs, an identical span mirror) — the
  rightmost-ink delta is the clip. Traps that corrupted these probes:
  (1) **transparent probe elements read the page behind them** — an unset
  background lets unrelated content bleed into the shot (a "−6px overhang"
  turned out to be the page's own text); give probes opaque backgrounds and
  place a white underlay behind any mirror that floats over dark page chrome
  (modals, backdrops), sized **past** the shot margins — a content-box mirror
  is wider than the source rect by its padding, so an underlay that only
  covers the rect leaves a sliver of page ink at the shot's edge;
  (2) **mirror the padding physically-correct in RTL** — the reference's
  physical padding is `padding: 0 <inlineStart> 0 <inlineEnd>` (right gets
  inline-start); a swapped mirror inflated the measured overhang to ~11px and
  faked a "no CSS lever works" verdict that held for a session;
  (3) **the clip only exists where the run touches the clip edge** —
  safe-center flex text never clips while it fits (force an overflowing
  width), and the reader's real title starts with ޙ, which has no overhang
  (force a ޗ-led string to exercise the mechanism); (4) **inputs clip at the
  inner editor's content box** (padding moves the clip with the text —
  `text-indent` only), **divs clip at the padding box** (padding works).
  These rules are what the current insets encode: divs use
  `padding-inline-start`, inputs use `text-indent`.
- **Security-audit claims must be re-anchored to the working tree.** Audit
  findings cite line numbers that routinely don't exist in this codebase
  (e.g. "reader-search-ui.js:170-174, reader.js:1251" turned out to be
  click-wiring and `break;`). Verify each cited line against the current
  file before assessing, then trace the data flow sink by sink. For
  search-mediated claims, the decisive gate is the search engine itself:
  `tokenizeText` splits on every non-letter/mark/number character and
  `searchLibrary` ANDs tokens against the word index (a missing token
  returns `[]`), so a payload containing `"`, `<`, or handler syntax can
  never match any row — grep `data/` for the payload tokens instead of
  building browser probes. And remember cells render raw as HTML **by
  design**: "unescaped cells" is the content format (RDF carries
  `<br>`/`<span>`/entities), not a defect — the trust boundary is the repo, so the
  real question for any such claim is *where does the input come from*.
  Verified 2026-08-10: the `?q=`/advanced-value/data-q audit was
  classification-only (no product change needed for the claims), and
  `escapeHTML` was completed to cover quotes for the attribute sites.
- **Hidden-wrapper measurements read 0.** `offsetWidth` is 0 while any
  ancestor is `display: none` — a `min-width` reservation (or any width
  measure) taken before a post-load reveal silently reserves 0px, and the
  first interaction visibly jumps: the pin button reserved 0px at load and
  grew 63→77px on the first click (the click's re-measure fixed it until the
  next load — the "keeps regressing" pattern). The reader's `#readerWrapper`
  stays `display: none` until the book loads, so chrome measurements must run
  after the reveal, with the sticky-chrome group (`updateTableHeaderTop`,
  `updateScrollPadding`, `updateBookmarkButton`); `reserveWidestText`'s
  fonts.ready re-measure also skips still-hidden elements (offsetWidth 0) so
  it can't clobber a good reservation with 0. Verified 2026-08-12.
- **`font-display: swap` can stale a measured min-width.** The fallback font
  renders first; any reservation measured before the webfont lands is too
  narrow once the swap-in widens the label, so the button grows on the first
  toggle even when it was visible at measure time. `reserveWidestText` now
  re-measures every reservation after `document.fonts.ready` (covers both the
  swap-in and the font-failure path); probes measuring glyph widths must do
  the same before screenshots (see the windowed-probe rule above). Verified
  2026-08-12 with the pin button.

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

## Keeping this guide alive

The table and traps below are only as good as the last false alarm they
caught. When a check fails and the root cause turns out to be **not the
product**, record it in the same session, while the context is fresh:

- **Test-setup problem** → add a line to *Harness traps* with the exact
  symptom (e.g. the mojibake signature «Ø§Ù„Ù†Ø§Ø³»), or to *Traps from
  adjacent workflows* when it's a measurement/audit step rather than the
  battery, so the next person recognizes it in seconds instead of
  re-diagnosing.
- **Pre-existing behavior** → add a row to *Known non-errors* with all three
  columns — observation, why it is not a bug, and what to assert instead. A
  row without the "correct assertion" column is just a rumor.
- **Expectation genuinely changed** (the product intentionally behaves
  differently now) → update the affected checks in `../tools/hmv-qrn-smoke.mjs`
  in the same change; prefer a comment over silently deleting a check, so
  `git log` on the battery explains why the expectation moved.
