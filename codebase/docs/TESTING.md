# Testing & Verification Guide

Companion to the headless-Edge smoke battery used to verify data-layer changes.
The battery lives at `../tools/hmv-qrn-smoke.mjs` (run `node tools/hmv-qrn-smoke.mjs`
from the codebase root; paths resolve relative to the script, and
`HMV_SMOKE_PORT` / `HMV_SMOKE_PROFILE` env vars override the defaults). The
TOC freshness scan for reader.js lives at `../tools/hmv-toc-scan.cjs`
(`node tools/hmv-toc-scan.cjs`). The Authors & Periods browse battery lives at
`../tools/hmv-authors-check.mjs` (`node tools/hmv-authors-check.mjs`;
`HMV_AUTHORS_PORT` / `HMV_AUTHORS_PROFILE` env vars override the defaults) —
it covers the shared facet system on every surface: library-page chips +
filter/table modals (the desktop columns — the leading muted 1-based
index renumbering from 1 over the filtered list (under a bare "#"
header), the derived age with its
year-unit shorthand (`86 y.`) placed right after the years, before the
Gregorian span, both modals' range columns content-pinned so the years
hug what follows — the authors' age touching the years, the periods'
years hugging the century label (the "far/wide" looks were the 1fr range
absorbing the modal's leftover width) — the books counts reading bold in
the name's colour like the name column (only the books count's mobile
label carries the weight — the age/authors labels stay plain; the
periods' first column is bold the same way), the modern bucket's row
showing its open-ended forms — the "(+15)" name marker, the "+1401 AH"
range and the "+1981 CE" Gregorian, the CE derived via the battery's own
`ceFromAh(1401)` conversion, never hardcoded — the ✓ thead headers centered
over the rows, the info header ℹ geometrically centered over the row
buttons — a left-edge match alone is not enough: the shared 8px 12px cell
padding leaves a 12px content box in the info column's 36px track, and a
24px button cannot fit one, so the overflowing inline anchors to the
line's start edge and spills ~6px off the header's center (the cell
carries `padding-inline: 0` for exactly that reason) — the dash-led
died-only years, their dash glued to the year (`–256 AH` / `–865 CE` —
the same dash the born–died range uses between its years, the
`authorDied` template's `{y}` slot), the modern author's century cell
reading the century label with the leading plus ("Century +15"), and
both filters' result counts — the search window's "match: N" pattern,
always visible over the shown rows (the full list with an empty
filter), the slot width pre-reserved at open so the count's digit
changes never shift the input — the periods grid's authors track placed right after the years, the thead
cells paired to the row cells column by column — class-paired, since the
rows' DOM order keeps the mobile lines — and the single-band assertion
that the row cells all sit on one grid row (a column-only pin would let
the sparse auto-placer walk its cursor back on the DOM/visual swap and
drop the swapped cells into a second band) — and the ≤600px joined-line
rows: the count (with its inline label) joining the end of the dates
line, dotted joins, muted CE and age, spaced ✓), dashboard
buttons + `?authors=` deep links + the no-English-title cards, the reader
header's per-author buttons (one button per author — the multi-author Razi
fixture — each opening its own Author tab, joined with the
script-appropriate comma: the Latin comma in the English layout, the Arabic
comma in Dhivehi/Arabic, on cards and header alike), and the search
window's All-books facet section (modals stack over the window).
The info-modal battery lives at `../tools/hmv-info-check.mjs`
(`node tools/hmv-info-check.mjs`; `HMV_INFO_PORT` / `HMV_INFO_PROFILE` env
vars override the defaults). The service-worker battery lives at
`../tools/hmv-sw-check.mjs` (`node tools/hmv-sw-check.mjs`; `HMV_SW_PORT` /
`HMV_SW_UPDATE_PORT` / `HMV_SW_PROFILE` env vars override the defaults).
Unlike the others it serves the tree over HTTP (`http://127.0.0.1` — a
service worker needs a secure context, so file:// cannot host one) with
correct MIME types and Last-Modified/304 revalidation, and its Edge
`--remote-debugging-port` must differ from the site port (the battery's own
server holds it). It covers: the registration snippet on every page (S0),
manifest freshness/completeness — the run-before-commit gate (S2),
register/install/precache (S1), cache-served repeat visits with zero
transfer (S3), offline page + book rendering via CDP network emulation (S4),
per-file fingerprint update propagation — a changed note is re-fetched on
the next visit while unchanged files are never re-requested, and the
manifest itself is re-fetched network-first every visit (S5) — and no page
errors (S6). The streaming battery lives at `../tools/hmv-stream-check.mjs`
(`node tools/hmv-stream-check.mjs`; `HMV_STREAM_PORT` / `HMV_STREAM_DEBUG_PORT` /
`HMV_STREAM_PROFILE` env vars override the defaults). Phase 1 (pure node,
no browser) proves the chunk-fed stream parser (`createStreamParser`) is
byte-identical to `parseCSV` over every `data/content` CSV — seeded
adversarial chunkings, byte-by-byte on the ≤ 64 KB files, and a
callback-delivery pass that mirrors `fetchCSVStreamed`'s batching — plus
synthetic chunk-boundary cases (`\r\n`/lone-`\r` splits, multiline quoted
fields, `""` across chunks, multi-byte Thaana/Arabic splits). Phase 2
(browser) serves the tree over HTTP like sw-check, throttles the network to
500 KB/s via CDP `Network.emulateNetworkConditions` on a fresh profile,
loads `reader.html?book=RDF-misc` (8.4 MB raw — past the 256 KB streaming
threshold) at a 480 px mobile viewport (card mode), and asserts on a
pre-navigation sampler's timeline: the CSV download is actually paced (B2 —
the harness, not the product, is at fault if not), the `Loading… N%`
progress line appears and climbs (B3), the first rows become VISIBLE while
the progress line is still up (B4 — the sampler measures `getClientRects()`,
real visibility: a reader built behind the hidden skeleton once made
streaming invisible while every DOM-count assertion passed, so B4b also
guards that no row ever appears while the skeleton is still up), the
search-window button is disabled mid-stream and re-enabled at the end (B5),
the pagination strip's total equals `parseCSV(rows) − 1` and the progress
line is hidden again (B6 — the strip shows the "…" stub until the stream
ends, then the real total; the line renders INSIDE `#pageTitle` — the
title's `flex:1` slot is its true centre — with the i18n "loading" word
(the sampler forces `lang=en` so "Loading…" is textual): B4c asserts the
title never shows the REAL book title while the line is up, and B6 probes
the title straight on the DOM at check time (evalJS — the sampler's last
tick can race `streamFinalize`'s swap) and asserts it reads as the book
title once the drain ends), a strip jump to the
end renders the final row (B7), and the page logged no errors (B8). B9 then
scrubs for a **table-mode** pass: it navigates to a same-origin scrub page
(`/__b9-scrub__` — a bare 404 would render as an opaque origin and deny
IndexedDB), deletes the `hadithmv` IDB database, clears the HTTP cache, and
reloads the same book at a 1280 px viewport to assert rows are visible and
grow incrementally while the line is up, the drain completes with the strip
at the real total, the line hidden, and gating released. **B10** scrubs
again and loads `reader.html?book=QRN-hadithmv` (2.6 MB raw) at the 480 px
viewport: the Quran loader merges into the 6,236-row base skeleton instead
of a straight parse, and the merge itself must stream — progress line up,
rows visible mid-stream, the quran surah/ayah/juz nav gated while the line
is up and released at the end (a mid-stream jump would freeze the reader on
a partial slice), the strip totalling `parseCSV(rows) − 1` = 6,236 (every
merged row arrived), the first/last rendered cards carrying the book's
first/last CSV cells (merge alignment at both ends of the dataset), and no
page errors. **B11** scrubs once more and loads
`reader.html?book=RDF-all` — the virtual merged radheef book, no content CSV
of its own (radheef-merge.js assembles the combined view from 8 source
books) — re-throttled to 1500 KB/s (3× the single-book passes; the merged
load is ~15 MB raw): the sequential per-source streaming must engage
(progress line up and climbing — its total is the summed HEAD
Content-Lengths; rows visible mid-stream, projected into the 7-column
merged schema before the reader sees them; every source fetched, HEAD +
GET), the search window gated and released, the strip totalling the sum of
every source's rows (152,612 — derived from the CSVs via the app's own
parser, never hardcoded), the first rendered card carrying the rasmee
block's first cell (rasmee leads — the deliberate block order) and the last
rendered card carrying the W2W block's Dhivehi title in its source column
(read from the registry's `titleDV`), and no page errors. **B12** drives the
QRN content modal's on-demand external-book column loads (the last
"download everything, then pop" path — the reader's own streaming never
covered the modal): on scrubbed profiles, ticking an external book's column
shows the modal's status footer with the book code and a climbing % (the
label is the interface language's `t("loading")` + code; the footer is an
out-of-flow overlay pinned to the modal's bottom edge, and the cancel pass
captures the clicked row's viewport top before the tick and asserts it has
not moved while the footer shows nor after it hides — the regression guard
for the list shifting under the cursor; the
cancel pass re-throttles to 250 KB/s — ~7.7 s for QRN-muyassarAR — so the
abort lands mid-flight), the modal gates while a download runs (other
checkboxes and the preset buttons disabled — the sequential-preset
guarantee), the Cancel button drops the in-flight column silently (no
error toast, no late insert), a full download lands the column and releases
the gate, and the arabic preset loads its two books strictly sequentially
(proven from the status line's pct timeline — one book's 0→100 climb
finishes before the next book's begins; a fetch wrapper can't prove this,
it only sees response headers, which the throttle barely paces). A page
script records every toast (text + timestamp) so a "no error toast" FAIL
names the offending message, and console.error entries are captured with
their arguments (the app's catch logs the reason the toast hides). The
B12/B12b "no page errors" checks tolerate Chromium's racy internal abort
rejection — `AbortError: BodyStreamBuffer was aborted`, attributed to the
Cancel click's `abort()` call — a known non-error (table row below); a
failure carrying that message with app frames (csv.js / quran-ui.js beyond
the click) would be a real defect again. One
trail this surfaced: a "column landed" that is only the `-1` marker — the
commit threw inside `applyColumnOrder` (row 0, `normAllData` missing) and
the settle re-render checked the box from the marker. That was a real
product bug: the streaming reader built norm data only for batches after
the seed (`reader.js` `buildReader` — the seed's norm rows are now built
there too), leaving `normAllData` short by the first batch, so every
on-demand column insert on a streamed book failed this way. If the
throttle doesn't pace the downloads
the claims are reported WARN, not FAIL — the established harness-fault
convention. The product yields
to the event loop on every streamed chunk (`setTimeout(res, 0)` in the
`fetchCSVStreamed` read loop) so the progress line and the drain's timers
always get a turn — a burst must drain on bounded 50 ms ticks (up to 4 table
inserts per tick), never one synchronous backlog loop. The service worker is 404'd
(SW fetches run on a network context the CDP throttle does not pace — the
sw-check battery owns SW behaviour), and the server sends an explicit
Content-Length (Node's `writeHead()`+`end(buf)` shape otherwise sends
chunked, which drops `fetchCSVStreamed` to its whole-file fallback — no
progress, no early rows, no gating; a missing trailing newline in the real
RDF-misc file once dropped its last row, caught by B6/B7). Another whole-file
trigger worth knowing: `file://` responses carry no Content-Length at all
(verified in headless Edge — the stream guard sees total 0 and falls back),
so a local double-click preview never streams, no matter the book size;
only HTTP(S) engages streaming. The batteries always serve HTTP for exactly
this reason. The four page
batteries (info, authors,
libscope, qrn-smoke) take `--dist` to run against the built `dist/` tree
(after `node tools/dist-build.mjs`) — the page root repoints to `dist/books/`
while `static/`/`data/` stay siblings, and S8b's golden comparison
normalises the embedded tree name so the minified pages/js/css are still
byte-checked (`src/` runs stay the byte-identity baseline; the pages are
minified by @minify-html/node — structure + inline script/style blocks via
`minify_js`/`minify_css`). It drives both entry points on the reader
(title click + Alt+I → Book tab, author line → Author tab) and the
authors-modal ℹ affordance (stacking, Escape order), the fact strips
(data-derived via `parseCSV`), the markdown renderer against the notes
fixtures (auto-TOC, deep links), the Works tab (a third tab, hidden
without an author, holding the works list + dashboard link), the in-modal
search (count == `<mark>`s on both tabs, Enter cycling, no-match, query
survives tab switches, the clear ✕ mirroring the query), copy
(monkey-patched `window.copyToClipboard`, exact plain-text compare with a
string built from data files — blank lines only at the structural
boundaries, the `""` entries the tab builders and the markdown renderer
push), the copy-link chip (the raw info-page URL — `?book=` / `?author=`
/ `&tab=works`, unescaped on the clipboard), the
four pane exports (blob-captured via a patched `URL.createObjectURL` —
their title pages carry the info-page URL as a live `<a href>`, escaped
in the bytes — and the reader's Word golden
`tools/golden/reader-word.doc` is re-diffed as the S8b byte-identity
guard on export.js's shared builders), the **src/books/info.html page** (S13:
`?author=`/`&tab=works`/`?book=` deep links render the same panes with no
overlay and no content-CSV fetch — no derived-meta line — unknown codes
show the placeholder, a bare visit the empty state (the shell tucked
away), a zero-book author still gets a Works tab; the page must also
carry the modal's look itself — computed `direction: rtl` + the
Hadithmv webfont on the body and the shared flex/rtl search wrap
(reader-search.css loaded; there is no `.modal` wrapper to inherit
from), its top bar must read like `#topBar` (an LTR `--content-width`
column inside the full-bleed sticky strip — the back button start-side,
the title centered in the flex space, geometry-checked), the actions
row must stay (its 6 buttons — copy, copy-link, the four exports —
visible at desktop width, the 📥 toggle hidden above 600px) — and the
URL must follow the tabs: tab clicks pushState
(`?author=…` → `?author=…&tab=works`), back/forward step through the
panes from the query string; the goldens themselves must be re-captured
whenever the title-page/cover markup changes, since the reader's four
exports share it), the 600px shared-geometry layout (the info
modal must measure identically to the search window; the pane scrolls
vertically with no horizontal overflow — the RTL-list marker and
unbreakable-string guards; the actions collapse behind the 📥 toggle at
600px — opens a dropdown menu (copy + copy-link + the four formats) that
closes on a tab switch, on selection, and on outside clicks, and sits
inline in the tab band with the toggle hidden at 1280px), and the
busy-export "Preparing…" label swap.
The column-label coverage scan lives at
`../tools/hmv-header-scan.mjs` (`node tools/hmv-header-scan.mjs`): it walks
every `data/content/*.csv` header and diffs it against the token tables in
`src/js/column-tokens.js` (the same tables `src/js/column-labels.js` uses to derive
display labels for the advanced-search column dropdown and the column
toggles). An unknown token means that header would silently fall back to
its raw identifier in the selection chrome — add a token (plus a `col*`
entry in `src/js/i18n.js`) or list it in `DELIBERATE_RAW` with a reason.
The font-coverage check lives at `../tools/hmv-font-subset.py`
(`python tools/hmv-font-subset.py --check`; one-time
`python -m pip install fonttools brotli`). It rescans the corpus the same
way the subsetter does — `data/**/*.csv` + `data/**/*.json`,
`static/notes/**/*.md`, `src/books/*.html`, `src/js/*.js`, `src/css/*.css`,
decoded like the browser
sees it (HTML entities, JS `\u` escapes) — and diffs the result against the
committed fonts' cmap. Coverage contract: **no corpus character the source
font covered may be missing from the subset** (GSUB/GPOS survive intact —
Arabic shaping is part of the deal). Characters the source never covered
(now 326: control codes, Quranic marks, transliteration letters, emoji)
fall back to system fonts exactly as before — the tool prints them, and
fails only on a regression. The full run (no `--check`) rewrites the fonts
and writes `font-build-report.md` (codebase root — a committed, diffable
ledger: corpus stats, per-flavor before→after sizes, coverage, sha256);
output is byte-stable across runs (run twice, compare the printed sha256),
and the tool refuses to re-subset an already-carved font — the full original
lives archived at `src/font/` (committed once, never overwritten; the carve
writes `dist/font/`), so a future content addition is: `--check` fails → run
the tool → it re-carves from `src/font/` with the grown corpus and rewrites
the report. `dist-build.mjs` runs the carve at the end of every build — dist/
is wiped first, so a rebuilt tree always ships a fresh subset.
Run it after any change that introduces characters: a new book, notes, i18n
keys, export writers, HTML/CSS content. Exit code 0/1, no browser needed. Its
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
| Imlai cell text never equals the CSV value | Cells render wrapped in ﴿ … ١ ﴾ (`decorateAyah`, `quran-data.js:212`) | Strip U+FD3F/U+FD3E **and** the trailing Arabic-Indic numerals U+0660–U+0669 (the ayah number sits inside the brackets) before comparing |
| "Surah 114:1 has no basmalah" — wrong | Only surahs **1 and 9** lack the basmalah; 114:1 has it. Juz 30 opens at 78:1, which also has it | Basmalah present on 2:1/114:1/78:1; empty on 1:1/9:1 |
| English strings never match titles/labels | The page defaults to **Dhivehi**: titles, modal labels, result counts and toasts are Thaana | Never assert English UI text; read expected strings from the registries (05 displayDV, 02 titleDV) with the app's own `parseCSV` |
| Search result count differs between runs | Quick search matches **`allData`** — all loaded columns incl. hidden book columns (`runBookSearch` in reader-search-ui.js). With Arabic tafseer books loaded: 841 matches for «الناس»; base columns only: 179. Empty-result text is «ނަތީޖާ 0» (no colon), results are «ނަތީޖާ: N» | Assert count relative to the column set loaded, or just > 0 and < 6236; treat "0 with no colon" as the no-results branch, not an error |
| PRESET_RESET does not restore a juz/surah slice | Reset only hides external columns (`quran-ui.js` PRESET_RESET branch); the filtered slice from navigation stays | Not a regression — confirm the slice behavior separately if it matters |
| A Thaana term's first glyph looks chipped on a history item / result snippet / title / surah-search input | The Hadithmv webfont paints ~1–5px of **start-side ink past the pen origin** on horizontal Thaana letters (ސ, ޗ, … — alef has none). Any surface that clips (overflow-hidden, ellipsis, line-clamp, or an input's inner editor) cuts that overhang when the run's origin sits at the clip edge; the clip is invisible when the surface has a start inset. The fixed surfaces carry their insets (`.hist-text` 6px, `.search-result-snippet` 8px, `.quran-surah-search` `text-indent: 6px`, `#pageTitle` 8px) — the battery's section F asserts them | Computed styles, not pixels: section F of `hmv-qrn-smoke.mjs`, or `getComputedStyle(...).paddingInlineStart` / `.textIndent` on the four surfaces. A bare pixel probe needs a **clipped-vs-visible reference pair** (same box, overflow forced visible) — see the mirror traps below |
| A security audit claims reflected XSS via `?q=` or unescaped cells | Not exploitable. Every `?q=` → innerHTML sink escapes (`input.value` is a property assignment; the no-matches line uses `escapeHTML(q)`; snippets pass through `highlightMatches`, which escapes text and `<mark>` content). Cells render raw as HTML **by design** — the data files are the trust boundary (RDF carries `<br>`/`<span>`/entities, e.g. `data/content/RDF-misc.csv`). The one raw-attribute spot (`data-q="…"` in library-search cards) can't fire: a payload must tokenize into real search-index words (`tokenizeText` splits on every non-letter/mark/number char; `searchLibrary` ANDs), and index words never contain `"`/`<` — zero `onmouseover`/`onerror`/`javascript:` tokens in any data file (verified 2026-08-10). Audit line numbers routinely don't match this codebase — re-anchor each citation to the working tree first | Trace each sink, then grep `data/` for the payload tokens (the engine's matching gate is decisive); if the payload can't match a row, it can't render. `escapeHTML` covers `& < > " '` — safe in text and quoted attributes |
| `RDF-all` is registered in 02 but has no CSV in `data/content/` | **Virtual book by design**: no content file exists — `src/js/radheef-merge.js` assembles its rows in memory from the eight source radheef books (see ARCHITECTURE.md → "Virtual merged books"). 03's missing-file warning is silenced via its `$virtualBooks` list; 08-rebuild-searchIndex.mjs reports "skip (no file)" in the report's Warnings; the 02 version field stays empty | Assert the merged behavior instead: 7 headers (`wordAR…source`), row count = sum of the 8 sources' rows (152,612), per-block counts by searching each source's Dhivehi title (the `source` column is searchable), block order via `?row=` deep links (e.g. row 5000 lands inside rasmee — rasmee leads `MERGED_SOURCES`; fahmy starts at row 53,842 1-based, and the first untinted row is 53,842) |
| A **non-RDF** reader search leaves the table showing **all rows** | Search runs in the modal window (the header input exists for RDF books only) and — like the old dropdown — **never filters** `filteredData`; typing renders count + snippets in the window, clicking a result jumps the table to the row (`jumpToResultRow` in reader-search-ui.js). RDF books are different by design: typing **does** filter in place (`applyRadheefFilter`), clearing restores all rows, and the scroll counter shows the match count | Read the match count from `#searchWindowCount` in the window's pinned head row (`ނަތީޖާ: N` — no colon = the zero-result branch; the element exists from shell build, hidden/empty until a search runs), not from table rows or the scroll counter; a result row's `data-real` is its global `allData` index. For RDF books assert the filter instead: row count drops to the match count, first row = expected first match, clear restores row 1 |
| The **library window's** cards differ from the page's (no peek ▾, its own count) | The window renders the same `searchLibrary` results but **without peek toggles** (`resultCardHTML(..., withPeek=false)` — peek ids `btn-peek-CODE` would collide with the page's cards), inside `#searchWindowResults`. Scope changes from **either** surface re-run both (shared picker state fans out via the `libScopeChange` window event); the card↔list toggle re-renders the **cached** results — no re-search, no history write; the window copies the page's query once on open, then searches independently (the page's own input keeps working behind it) | Query `#searchWindowResults` for `.lib-result` (card) / `.search-window-book-link` (list), expect **0** `.lib-peek-toggle` there, and read the count from the head row's `#searchWindowCount`. After a scope tick both `#libResults` and the window re-render. The list view's deep links go to `reader.html?book=CODE&row=<firstRow>&q=…` |
| A modal opens but `document.activeElement` never becomes what `openModal` focused | The overlay's pop transition (`--t-pop`, common.css:519-529) leaves the modal **computed as `visibility: hidden` for its whole duration** — Blink silently drops every `focus()` called in that window (getComputedStyle says hidden while the fade-in is actually painted). `openModal` (common.js) and the search window's `openSearchWindow` (search-window.js) defer their focus calls past it (~`--t-pop` + 10/30 ms) | `waitFor` the intended focus target (`document.activeElement.id === …`), never assert focus synchronously right after the `open` class appears |
| `hmv-authors-check` first run reports "modal opens with focus in the filter [active=BUTTON]" (expected INPUT) | Deferred-focus race: the focus lands ~`--t-pop`+10 ms after open (common.js), and on a fast-loading page the test's wait can sample `activeElement` inside that defer window on the first attempt. The modal opens and works; re-running against the identical build passes | Retry the assertion once — a pass on rerun against the same bytes is a pass. Failing on **every** rerun of identical output would be a real defect — file it |
| `hmv-libscope-check` S6 "filtered rows contain bukhari" fails with non-bukhari codes in the list | The picker's filter is **always-fuzzy on titles + tag words** (`scoreFilterTokens`: 6+-char tokens tolerate 2 edits; only the **code** is exact-only — library-scope-picker.js:352-377). «bukhari» legitimately fuzzy-matches **"Barbahari"** (window `bahari` = insert u + sub a→k) and **"by Abu Khaithamah"** (window `bu khai` = delete space + insert r). Books whose titles/tags land inside the budget (e.g. the DFK titles added with a registry update) make an assertion that checks **only codes** fail even though the page is correct | Derive the expected visible set with the app's own `scoreFilterTokens` over the current registry (in-page dynamic `import('../js/search-utils.js')` + `book-data.js` — the probe pattern), or assert the specific expected codes — never "every code contains the query" |
| `hmv-info-check` S8b "reader Word export byte-identical to the golden" fails with a small size delta (e.g. 38000 vs 38016) | The golden is a **byte capture** (`tools/golden/reader-word.doc`, captured via `hmv-golden-capture.mjs`), and the export embeds fields that live in the **data**, not the code: the book's Arabic title and the version footer. A data update (registry version bump, or a title gaining tashkeel — «الأصول الستة» → «الأُصُولُ السَّتَّةُ» = +16 bytes) staleness the golden even when the export is exactly right. Run the probe diff (dump live export vs golden, find the differing region) to confirm the delta is data — a title/version change — not builder output | Recapture the golden with `tools/hmv-golden-capture.mjs` after any data change that touches exported fields (titles, version). The `/dist/books/` → `/src/books/` normalisation only covers the site URL, not the data |
| `hmv-stream-check` B12/B12b "no page errors" reports `AbortError: BodyStreamBuffer was aborted` at the Cancel click's `AbortController.abort()` (quran-ui.js) — **intermittent** (~2/3 of mid-body cancels at 250 KB/s, 2026-09-03) | Chromium's fetch-abort machinery fires a **racy internal unhandled rejection** when a cancel lands mid-body on a streamed fetch: the promise lives inside the body-stream implementation and its report's stack is attributed to the task that called `abort()` (the cancel click listener — no app frame is involved). Nothing is visible in the page UX (no toast, no UI breakage — verified: a page-side `unhandledrejection` listener + `AbortController` patch during failing runs saw the cancel itself clean) and the cancel stays silent by design. The app's own abort path throws `AbortError: "Aborted"` (csv.js `abortError()`) — textually distinct — and no other "no page errors" check in the suite ever aborts a mid-body fetch, so the filter cannot mask a real app failure | The B12/B12b checks filter entries containing `BodyStreamBuffer was aborted` (`appErrors()` in hmv-stream-check.mjs); B8/B9/B10/B11/B12c check `pageErrors` raw. If a failure ever shows that message with **app** frames (csv.js / quran-ui.js beyond the click), it is a real defect again — report it |

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
- **Same-second `Last-Modified` collisions in `hmv-sw-check` S5.** The S5
  update origin answers 304 when `If-Modified-Since` matches, and serializes
  mtime at **second** granularity (`toUTCString`). If the battery's two
  `writeV` calls land within the same wall-clock second, their bumped mtimes
  serialize to the identical string — the browser's revalidation gets a 304,
  the SW's manifest refresh and the note re-fetch silently fall back to the
  cached v1, and **both** "S5 visit 2" and "S5 visit 3" fail with the old
  note's byte count (e.g. 278 bytes) even though the product is correct.
  `writeV` bumps each version's stamp by `+ v * 1000` ms so the strings can
  never collide; if the visits ever fail again with identical byte counts on
  both lines, suspect a second same-second path (the bump drift) before the
  product.
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
- **An unasserted `waitFor` after a click is a false-positive trap.** A click
  whose open-result is waited for but never `check`ed lets the whole section
  run against **hidden DOM** — input `.value` sets, `input` event dispatches,
  tab/vie-w toggle clicks and even the final Escape close all succeed with the
  modal never opened (the Escape check passes because the overlay was never
  open). This is exactly how the reader's magnifier button stayed dead for
  weeks while the smoke + probe batteries stayed green — every check except
  "is it open" was DOM-manipulation that doesn't need the modal. Rule: any
  click whose effect is a modal/overlay must immediately `check(waitFor(open))`.
- **A synchronous focus assert right after `waitFor(open)` races the
  deferred focus.** Modals defer their caret past the pop transition
  (`--t-pop`; `deferFacetFocus` and friends), so `waitFor(open)` + an
  immediate `activeElement === …` check fails ~half the runs under render
  load — the focus lands ~200 ms after `open`. Wait for the focus
  *inside* the waitFor (`open && document.activeElement === …`), like the
  Alt+A check does, instead of asserting synchronously.
- **Every battery section must start with its own `goto`.** A section that
  skips navigation inherits whatever page the previous section last loaded —
  section G's `#btnLast` click died on `index.html` (null element) because
  section F's mobile probe had navigated to the dashboard. A section header
  (`console.log("== X ==")`) is the cue: page load + waitFor its root
  element first.
- **`pathToFileURL` URL-encodes `?`.** Building a deep-link URL as
  `pathToFileURL(ROOT + "book.html?q=…")` encodes the `?` into `%3F` — the
  browser treats the whole string as a filename and serves the file-not-found
  page (every element lookup then fails on nulls, e.g. `#btnSearchWindow`).
  Build the base URL with `pathToFileURL` and append the query string after:
  `const url = pathToFileURL(ROOT + "book.html").href; url + "?q=" + …`.
- **`createModal` extra classes land on the modal element, not the overlay.**
  `createModal(id, title, body, extraClass)` builds `class="modal <extra>"` —
  the extra class is on the modal itself, so a CSS selector written as a
  descendant (`.search-window-modal .modal`) **never matches**, and the whole
  rule block silently dies. The search window rendered at the base
  `.modal` 340px width for weeks while its shell CSS was dead — no battery
  asserted width, so nothing caught it. Select the class directly
  (`.search-window-modal`) — as `library-search.css` does for
  `.lib-scope-modal` — and reserve descendant forms for real descendants
  (`.search-window-modal .modal-body` is fine). S11's two-column geometry
  checks are the guard: they fail the moment the shell rules stop applying.
- **The modal layer is exclusive; stacked opens are opt-in.** `openModal`
  calls `closeAllModals()` first — only one modal can be open through it.
  The search window's scope summary opens the libScope modal **on top**
  (`openModalOnTop`), so both overlays are `.open` at once. Traps: an Escape
  dispatch now closes the **innermost** modal (the scope one) first — a check
  that asserts the window closed after one Escape fails; the stacked modal
  must be closed (or its Escape asserted first) before asserting the window's
  close. The stacking guards are S11's "opens the libScope modal on top" +
  "Escape closes the scope modal only" and the smoke's same-named checks.
  Both overlays share `--z-modal`, so the later-created (last in `MODAL_IDS`)
  paints on top — keep batteries' Escape expectations in creation order.
- **`el.click()` never moves focus — focus-sensitive probes need real mouse
  events.** A synthetic `.click()` fires the element's handlers without the
  browser's pointer pipeline, so `document.activeElement` does not change the
  way it does for a real mousedown on a non-focusable row (which blurs the
  focused input and moves focus to `<body>`). The window's ↑↓/Enter navigation
  is guarded on `document.activeElement === winInput` (`onSearchKeydown`), and
  the history-term click handlers exist precisely to refocus after that blur —
  a probe driven by `el.click()` sees the input still focused and reports
  everything fine, while a real click loses the keys. This is how the
  round-16 history-click bug survived the first probe: every flow "worked"
  until `Input.dispatchMouseEvent` (mousePressed + mouseReleased) reproduced
  the failure. Rule: any probe whose subject is focus-dependent — keyboard
  navigation off the window input, anything that focuses a target on open —
  must click with real CDP mouse events and snapshot `document.activeElement`
  (tag + id + class) immediately after each click, before dispatching keys.
- **Stream-battery B10/B11/B12 stalls are an environmental fetch stall —
  retry, don't debug.** (B12's WARNs — "modal throttle did not pace the
  download", "B12 gate probe skipped", "B12c pct never paced mid-range" —
  are the same harness-fault class: the CDP throttle did not pace the
  modal's download on that machine. They must never be reported as product
  failures.) Against `--dist`, the throttled big-book section occasionally
  stalls: the progress line freezes **below 100%** (observed B10 at 78%,
  B11 at 67/94/95%), the in-page sampler's timeline ends mid-stream, and
  ~70 s of main-thread timer blackout follows (a CDP `Debugger.pause` fired
  during the blackout times out at 30 s — the main thread is stuck in native
  code, not JS). The page then recovers — the battery's 120 s in-page waitFor
  fires and its probes run — but the fetch stays dead. Every product cost is
  bounded: the fire-and-forget IDB puts at source-completion boundaries are
  exonerated (measured 31 ms / 122 ms serialization+commit for 21 MB /
  78 MB), drains are bounded, the parser is linear. The stalled observation
  arrays are byte-identical across failures and pass on the immediate rerun —
  the frozen positions (B10 p=24/51/78% at t=10291/11692/13093) are the
  deterministic throttle pace × a timing-based block, not a data trigger.
  Tally: dist runs 1-4 flaked (B10 2×, B11 3×), runs 5-7 all green; src 3/3
  green; no page errors in any run. Suspect a Chromium fetch/throttle
  interaction — the stream loop has no read timeout
  (`await reader.read()` hangs forever on a stalled socket), so a stalled
  network becomes a hang instead of an error. **Discriminator: an
  environmental stall freezes progress <100% with the sampler dead → retry
  (kill the leftover headless Edge, fresh `--user-data-dir`, rerun). The old
  drain-wedge class froze at exactly =100% with the gate never released →
  that one is a product bug — do not retry, file it.**

## Traps from adjacent workflows

Not headless-battery traps, but the same class of failure — a measurement or
audit step that looks like a product problem. Same rule: classify before
blaming the product.

- **GitHub Pages gzip fools size analysis.** Pages gzips for clients that send
  `Accept-Encoding: gzip, deflate, br` (all browsers do); a bare `curl -I`
  sends no header, gets raw bytes and no `Content-Encoding`, and looks exactly
  like "server doesn't compress". Verified 2026-08-30: the search-index
  manifest is 1.9 KB over the wire vs 4.8 KB raw, and a full all-books search
  totals ~6.0 MB gz of shards vs ~19.4 MB raw. Correct: probe with
  `-H "Accept-Encoding: gzip"` (or `--compressed`) and read `Content-Encoding`;
  the browser's `resp.text()` is unaffected — decompression is transparent.
- **`git mv` moves names, not data.** After any rename/swap of data files,
  verify bytes against the git blob (`git show HEAD:<path> | sha256sum` vs the
  working file), and read verification output literally — an earlier check
  echoed the header from the file *named* "05-registry-quranSurahs.csv" and it
  was misread as proof. Also check `git status --porcelain` for **untracked
  strays at the old path**: an editor with the old file open can re-save and
  recreate it after a `git mv` (seen 2026-08-07 with 02-registry-bookNames.csv
  — content was byte-identical; close the old tab in the editor).
- **Registry regeneration must be idempotent.** `data/04-update-bookRegistry.ps1`
  rewrites only the book registry on every run (recomputes version hashes). It
  never rewrites `01-registry-bookTags.csv` or `02-registry-bookAuthors.csv` — tag
  row order is the palette slot assignment for the auto-generated colours, and
  author row order is the Authors browse list's display order, so both are
  hand-controlled (tags since 2026-08-14; before that every run re-sorted tags,
  shifting colours). After any change to the script, run it twice and compare
  hashes — a byte-stable second run proves idempotency. **Invariant:** `version`
  is ALWAYS the last column of 02 — the version swap matches a trailing hex
  field, which is only safe because nothing can follow it (a quoted cell can't
  end in a hex match). New columns (like `authorCode`, which sits immediately
  after `bookCode`) go BEFORE it; never after. The version swap replaces only
  the trailing 12-hex token on the raw row; never split quoted fields — a split
  mangles quoted comma-bearing cells (a quoted titleEN `, with` lost its space)
  and an uppercase-versions run forced a one-time cache re-download for every
  visitor (versions compare case-sensitively at csv.js:163). The editor re-saves
  02 as LF over script output — check file mtimes before trusting a "before"
  hash.
  The script's `$virtualBooks` list (RDF-all today) exempts virtual books
  from the missing-file warning — keep it in sync with radheef-merge.js's
  `MERGED_SOURCES` (add/remove a book in both, or 03 will warn on the merged
  book's deliberately absent CSV, or 02 will carry a row with a stale hash
  contract).
- **`01-registry-bookTags.csv` has no comment syntax.** Blank lines are
  dropped by `parseCSV` (csv.js) and consume no palette slot — slots count
  only code-bearing rows (`if (row.tagCode)` in book-data.js), so blank-line
  grouping never shifts colours. A `#` comment line (or any non-tag text on
  its own line) parses as a phantom tag with a truthy code: it eats a palette
  slot and silently recolours every tag after it. Never add one — verify
  unexpected colour changes against a git diff of this file first (seen
  2026-08-14 when the tag sort was removed: the file's order became the
  palette's order).
- **`02-registry-bookAuthors.csv` follows the same rules.** No comment syntax, no
  trailing newline; blank `bornAH`/`diedAH` cells mean unknown/living — and a
  death in the 15th century AH (1401) and later — lands the author in the
  single `modern` period bucket (there is no "Century 15" row). An author code
  referenced from 02 but missing from 08 renders no author line (bookAuthorLine
  skips unresolvable codes) — the Authors browse modal only lists authors with
  ≥1 book, so a dangling code shows up as a silent gap, not an error. The
  period facet is derived client-side (`Math.ceil(diedAH/100)` with the modern
  merge) — never store the century in the CSV, or the two can drift. The
  `modern` bucket's periods-modal row renders the open-ended forms by
  construction — name + "(+15)" (the opening century, the plus leading the
  number), range "+1401 ހ." (the
  century's first year), Gregorian "+1981 މ." (derived from 1401 AH by the
  app's own AH→CE conversion, never hardcoded) — so an assertion change to a
  hardcoded "1981" would break the battery's `ceFromAh(1401)` derivation the
  moment the conversion changes; derive it the way the battery does.
- **Batteries must resolve 02 columns by header name, not position.** 02's
  layout is free to grow between `bookCode` and `version` (the version-last
  invariant), so a positional read of `03-registry-bookMeta.csv` in a tool
  (e.g. `rows02[r][2]` for titleDV) silently returns the wrong column after
  an insertion (seen 2026-08-16: the `authorCode` insert made a smoke-battery
  expected-title check read titleAR as titleDV — the page rendered correctly,
  the battery was wrong). Derive `header.indexOf("titleDV")` once and index
  with it.
- **`core.autocrlf` hides CRLF-tainted data files from git.** With
  `core.autocrlf=true` (this repo), git normalizes CRLF→LF before hashing, so
  a working file whose line endings were CRLF-ized (Windows editor re-save)
  shows 0 changes in `git status`/`diff` while its disk bytes differ from
  the committed blob — sha256sum of the file ≠ `git show HEAD:<path> |
  sha256sum`. Verified 2026-08-09: 47/62 content CSVs were CRLF-tainted
  (`QRN-*` and `RDF-*` fully — 6,236 CRs each — most others a few lines; `file`
  samples the start and misses low CR counts, don't trust its "clean"
  verdict). Consequences: `04-update-bookRegistry.ps1` computes versions with
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
  strip only `\r\n` pairs (`sed 's/\r$//'`). 04-update-bookRegistry.ps1
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
  token with word boundaries across `src/books/*.html` **and** `src/js/*.js`;
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
- **Headless pages without `Page.bringToFront` produce no frames — so no
  scroll events and a frozen incremental render.** In `--headless=new` CDP
  sessions, a backgrounded page never gets a BeginFrame: `window.scrollTo`
  moves `scrollY` (the position updates in the snapshot) but the viewport
  scroll **event never dispatches** (25 s+ waitFor), the scroll counter stays
  empty, and the sentinel-driven chunk renderer stalls at the first ~75
  chunks (`scrollHeight` stuck at ~5,031 while the same page reaches
  ~11,863 after bringToFront). Symptoms can also look app-side (input
  listener "dead", counter "never populates") — rule it out first with a
  capture-phase `scroll` counter or by dispatching a synthetic event (which
  works because it bypasses the engine entirely). Fix: `Page.bringToFront`
  right after navigating (and before scrolling); `scroll-behavior: smooth`
  on `html` (common.css:332) makes programmatic scrolls animations whose
  events are the first to vanish. Verified 2026-08-13 on the RDF-all probe
  (the smoke battery's fixed wait-based checks predate this and pass
  because its profile boots the tab as the active target).

## Assertion rules

1. **Derive, never hardcode**: expected values come from the data files via
   `src/js/csv.js` `parseCSV` (the app's parser — its trim semantics are the
   byte-equality contract). Basmalah, surah starts, juz starts, labels,
   titles, ayah text — all file-derived.
2. **Assert content, not widgets**: first-row imlai/basmalah cells against
   the CSV, never the ayah input or scroll position.
3. **Verify against the old data first**: the pre-swap script re-implements
   the derivation loop and asserts byte-equality of every merged cell —
   any later diff that survives it is a genuine regression.
4. **Wait for state, then assert**: `waitFor` on the thing being measured
   (rows rendered, result count changed, `th` count), never `sleep` alone.
5. **Widest-column proxies break when the fixed-track budget changes**:
   a "column X is the widest" check survives only while a 1fr track can
   outbid the content-clamped tracks — the last 1fr is gone (both modals'
   ranges are content-pinned like the Gregorian track, so the periods
   "widest range" proxy died with it). Assert the invariants the pins
   actually guarantee (a pinned range's content size and its adjacency to
   the track beside it — the authors' age, the periods' century label —
   the caps) and update the check's comment, rather than re-timing a
   formula to revive a widest claim.

## Capturing clipboard & export bytes

Headless Edge cannot read the real clipboard, and export blobs never touch
disk — so the info-modal battery asserts those paths through **captures**,
not the browser's own surfaces:

- **Clipboard** — `window.copyToClipboard` is monkey-patched (installed per
  page load) to record the text argument; the assertion compares it
  byte-exactly against the expected plain-text lines derived from the data
  files and the notes fixtures (via `parseCSV` + fs reads — the
  "derive, never hardcode" rule applies to copy text too). Never try to
  read `navigator.clipboard` in the harness — the headless profile has no
  permissions and the result is a rejected promise, not a value.
- **Blobs** — `URL.createObjectURL` is patched to trap `type`/`size` and
  the bytes (`b.arrayBuffer()`), so a `downloadFile` call is observable
  without a real download. `downloadFile` passes a **bare Blob** — there is
  no `.name` to assert. Word/PDF/HTML are synchronous; EPUB is async (font
  fetch + dynamic `import()`), so wait for the new entry specifically:
  record `capLen = window.__cap.length` before the click and wait for
  `length === capLen + 1 && bytes` — a wait matching any prior blob's type
  can succeed on a **stale capture** from an earlier export.
- **PDF popup** — `window.open` is faked to a recording stub; the popup's
  `document.write` input is the export HTML. The battery asserts the
  version footer + book link inside it, never a real print dialog.
- **Golden regression** — the captured Word bytes are written to disk and
  diffed against `tools/golden/reader-word.doc` (re-captured by
  `tools/hmv-golden-capture.mjs` before export-affecting changes; the
  golden's header comment lists when to re-run). EPUB goldens cannot be
  byte-diffed — the container embeds a timestamp inside deflate-compressed
  data — so EPUB checks stay structural (PK header, stored `mimetype`,
  embedded font).
- **Navigation wipes hooks** — patches are installed per page load; a
  battery section that navigates must re-install them before any capture.

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
