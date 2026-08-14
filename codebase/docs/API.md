# API Reference

## Pages

| Page | Entry point | Loads |
|---|---|---|
| `books/index.html` | Inline module → `dashboard.js` | `common.js` |
| `books/reader.html` | `reader.js` | `common.js` |
| `books/library-search.html` | `library-search-page.js` (self-initialising) | `common.js` |

## Modules

| Module | Purpose |
|---|---|
| `js/common.js` | Shared init: theme, fonts, i18n, sidebar, settings, keyboard, unified modals, toast |
| `js/book-data.js` | Book registry, tag resolution, page bootstrap |
| `js/dashboard.js` | Dashboard UI: card/table grid, search, tags, sort, modals, keyboard |
| `js/pins-history.js` | Pins & history: localStorage CRUD, modal UI, sidebar wiring |
| `js/reader.js` | Book viewer core: CSV parsing, rendering, loaders, STATE, goTo, keyboard, deep links |
| `js/radheef-merge.js` | Virtual merged radheef book (RDF-all): `isMergedRadheefBook()`, `loadMergedRadheefBook()` — see below |
| `js/reader-position.js` | Reader position: pagination strip, visible-page detector, scroll block (progress, milestones, URL sync, read-history) |
| `js/reader-search-ui.js` | In-book search UI: results, history, whole-word toggle, advanced search |
| `js/table-scroll-sync.js` | Table view top scrollbar: width sync, RTL-aware transform, arrow/wheel scrolling |
| `js/library-search-page.js` | Library search page UI: `?q=`/`?tags=`, chip scoping, grouped results, peek previews |
| `js/export.js` | Export formats (15 formats) — `initExports(ctx)` receives a context object |
| `js/quran-data.js` | Quran pure data: loading, merging, decoration, column classification, source labels |
| `js/quran-ui.js` | Quran UI: dropdowns, presets, surah selector. Re‑exports quran-data.js (barrel). |
| `js/search-utils.js` | Search engine: normalisation, parsing, matching, history |
| `js/export-xlsx.js` | XLSX writer, `createXLSX()` — lazy-loaded on demand |
| `js/export-epub.js` | EPUB 3 e-book writer, `createEPUB()` — lazy-loaded on demand |
| `js/export-zip.js` | Minimal store-only ZIP writer, `zipStore()` — shared by the XLSX + EPUB writers |
| `js/i18n.js` | Translations (dv/en/ar), `t()`, `tagLabel()`, progress milestones |
| `js/csv.js` | CSV parsing, serialisation, and fetch helpers |

## csv.js

Tiny CSV utilities (~1 KB). No DOM dependencies. Imported by `book-data.js`, `reader.js`, `quran-data.js`, `quran-ui.js`, and `export.js`.

| Function | Description |
|---|---|
| `parseCSV(text)` | Parses CSV text into a 2D array. Handles quoted fields, commas inside quotes, multiline values, and `\r\n` / `\r` / `\n` line endings. |
| `unparseCSV(rows)` | Converts a 2D array back to CSV text. Quotes fields containing commas, double‑quotes, or newlines. |
| `fetchCSVRows(path)` | Fetches a CSV file, parses it, and returns a 2D array with empty rows filtered out. Single pass — `parseCSV` already skips empty rows, so no intermediate row array is built, and the raw text is released as soon as parsing completes. |
| `fetchBookCSVCached(bookCode, version, path)` | Fetches a book CSV through the on‑device IndexedDB cache (`hadithmv` DB, `books` store, keyed by `bookCode`). Cache hit + `version` match (registry content hash) → returns the stored rows with zero download/parse; mismatch or empty `version` → fetch + parse + refresh (write is fire‑and‑forget). Every failure degrades to a plain fetch. IndexedDB returns a structured clone per read, so callers may mutate the result safely. |
| `parseCSVWithHeader(text)` | Parses CSV text into an array of objects using the first row as keys. Trims both headers and values. |
| `fetchCSVObjects(path)` | Fetches a CSV file and parses it into objects via `parseCSVWithHeader`. Convenience wrapper for registry files. |

## book-data.js

### `initializePageWithMetadata(callback)`

Reader-page entry point (books/reader.html). Reads `?book=CODE` from the URL.

- No `?book=` → returns (the dashboard is initialized by `dashboard.js`)
- Book found → calls `callback(metadata)`
- Book not found → shows error

```js
import { initializePageWithMetadata } from "../js/book-data.js";

initializePageWithMetadata(async function (metadata) {
  // metadata.bookCode   — "AQD-qawaidulArbau"
  // metadata.titleEN    — "Qawaidul Arbau"
  // metadata.titleAR    — "القواعد الأربع"
  // metadata.titleDV    — "ހަތަރު ގަވާއިދު"
  // metadata.csvPath    — "../data/content/AQD-qawaidulArbau.csv"
});
```

### `loadTagDefinitions()`

Loads and caches `01-registry-bookTags.csv` → `Map<code, {label, palette}>` (palette is a golden‑ratio HSL slot index). Also injects the palette CSS. Returns the empty map on error (cached, no retry). Must resolve before `extractTags()` returns tags — the library search page awaits it before rendering chips.

### `loadBookNames()`

Fetches and caches `02-registry-bookMeta.csv`. Returns `Array` of book objects (`bookCode`, `titleAR`, `titleDV`, `titleEN`, `tags` — secondary tags, comma‑separated). Returns `[]` on error.

### `getPageMetadata(bookCode)`

Looks up a single book by code (async). Returns the metadata object or `null`.

### `getBookTitleSync(bookCode)`

Synchronous lookup — returns `titleDV` (or `titleEN`) for a book code. Requires the book registry to already be loaded (it is after page init). Returns `null` if the cache isn't populated or the book isn't found. Used by `quran-data.js` for source-book labels and `pins-history.js` for modal book names.

### `resolveBookCode(bookCode)`

Resolves a possibly-stale book code to a current registry code. Renames keep the base name and change the tag prefix (e.g. `AKLQ-…` → `DFK-…`), and old codes survive in stored pins/history — the pins/history modal runs every stored code through this before showing a title or building a `reader.html?book=…&row=…` link. Exact match wins; otherwise the registry code sharing the longest dash-segment suffix — requiring 2+ shared segments, or a unique 1-segment tail; ambiguous matches (two candidates claim the same tail) return the code unchanged. Returns the input unchanged when the registry isn't loaded or nothing matches.

### `getCsvPath(bookCode)`

Returns the data CSV path: `"../data/content/" + bookCode + ".csv"`.

### `getBookVersionSync(bookCode)`

Synchronous version lookup — returns the registry's `version` hash for a book ("" when the cache isn't populated or the book is missing). Used by the reader and Quran loader to validate the IndexedDB cache.

### `extractTags(bookCode, entry?)`

Returns a book's tags: the PRIMARY is the first registered prefix segment of the `bookCode`; SECONDARY tags come from the registry entry's `tags` column (comma‑separated codes). Pass the registry row (`entry`) whenever available (book-data and reader both have it in scope). Returns `Array<{code, label, palette}>` (palette is an integer index used with `.tag-palette-N` CSS classes).

```js
extractTags("HDT-muwattaMalik", { tags: "DRFT" });
// [{code:"HDT", label:"Hadith", palette: 0},
//  {code:"DRFT", label:"Draft", palette: 1}]
```

Dashboard state and rendering moved to `dashboard.js` when the module was split out of book-data.js — see below.

### Naming conventions

- `DRFT-` prefix → Draft badge (⚠️), visible on dashboard
- `-HDN` suffix → hidden from dashboard
- Run `data/03-update-bookRegistry.ps1` to auto‑generate `titleEN` from `bookCode`, rename `* - Sheet1.csv` files (replacing existing targets), register new books, and sort the book registry by `bookCode` (the tag registry is never rewritten)

---

## dashboard.js

Dashboard page UI (books/index.html) — built on the metadata layer in `book-data.js`. Split out of book-data.js so the metadata module keeps no dashboard UI.

| Function | Description |
|---|---|
| `initializeDashboard()` | Page entry point. `?book=` links redirect to the reader; otherwise preloads tag definitions, applies `?tags=` deep-link filters, loads the registry, then renders. On registry fetch failure, shows the error with a ↺ Retry button (re-runs the load; controls are wired only after a successful load, so no duplicate listeners). |
| `renderDashboard(bookNames)` | Renders the card grid or table view, tag chips with counts, result count, and the continue-reading card. |
| `setupDashboardControls()` | Wires search, tag chips, sort, view toggle, pins/history modals, the library-search jump, scroll arrows, and keyboard shortcuts. |

Module state: `_dashFilter` — `{ search, tags[], sort, pinsOnly }` — current filter state; `_dashTableMode` — `boolean` — card grid vs table view. Re-renders on `dashboardReset` and `languagechange` (when visible).

---

## pins-history.js

Pins & history: localStorage CRUD + modal UI + sidebar wiring. Extracted from book-data.js. Imported by `book-data.js` (re‑exports `addPin`, `removePin`, `isPinned`, `addReadHistory` for reader.js). Stored book codes can predate a rename (tag-prefix change), so the modal resolves every entry via `resolveBookCode()` — both the displayed title (`bookDisplayName`) and the jump links use the resolved code.

| Function | Description |
|---|---|
| `getPinnedBooks()` / `getReadHistory()` | Returns the full pins/history arrays from localStorage. |
| `addPin(bookCode, row, label?)` | Adds or updates a pin. **One entry per book** — calling it for an already‑pinned book updates the existing entry's row/label rather than adding a second (an update keeps the pin's position in the list). In practice this path is exercised by the reader's position auto‑update while reading; the reader's 📌 button itself TOGGLES (calls `removePin` when already pinned). At the cap (10) the **oldest pin is evicted** to make room (mirroring read history) and its display name is returned — the caller shows a replacement toast; returns `null` when nothing was evicted. Optional `label` stores a human‑readable position (e.g. `"البَقَرَة 5:2"`). `row` is a 1‑based **whole‑book** data position — the same `?row=` contract as deep links; callers writing from filtered views (surah/juz) must map the row back to the full book first. **New pins are prepended** — newest first, the same ordering as read history. |
| `removePin(bookCode)` | Removes a pin by book code. |
| `isPinned(bookCode)` | Returns `true` if the book is currently pinned. |
| `addReadHistory(bookCode, row, label?)` | Prepends an entry to reading history (max 10 — the oldest is dropped when full). Same `row` convention as `addPin`. |
| `clearPins()` / `clearReadHistory()` | Clears all pins or history. |
| `openPinsModal()` | Opens the pins modal overlay with reorder/remove/click-to-jump. Also on `window` for legacy callers. |
| `openHistoryModal()` | Opens the history modal with timestamps and clear-all. Also on `window` for legacy callers. |

---

## search-utils.js

Pure logic. No DOM dependencies. Imported by `book-data.js`, `reader.js`, `quran-data.js`, `export-xlsx.js`, `export-epub.js`, and `export.js`.

### `escapeHTML(str)` / `escapeXML(str)`

HTML‑entity escaping. `escapeHTML` escapes `&`, `<`, `>`. `escapeXML` also escapes `"` and `'` (needed by export-xlsx.js and export-epub.js for XML output).

### `linkifyURLs(html)`

Turns `https://` URLs in **already‑escaped** HTML into `<a class="reader-link" target="_blank" rel="noopener noreferrer" dir="auto">` links. Runs after highlighting, so `<mark>`/tashkeel spans and attributes are left intact (matches are skipped when inside a tag); trailing Latin/Arabic punctuation stays outside the link. Used by the reader's card/parallel/table renderers and the in‑book search results. `&` in URLs is safe — it arrives as `&amp;`, which browsers decode back in the `href`.

### `normaliseForSearch(str)`

Normalises text for comparison:

- Strips Arabic tashkeel and tatweel
- Normalises alif variants (`أ إ آ` → `ا`), ya (`ى` → `ي`), waw‑hamza (`ؤ` → `و`)
- Normalises Thaana thikijehi (`ޘ→ސ`, `ޙ→ހ`, etc.)
- Implemented as a single regex pass with a per‑char lookup (was ~30 sequential replaces) — the hottest function in the app, so it is built for speed

Used by both dashboard search and book search.

### `formatThousands(n)`

Comma-grouped thousands for **display only** (regex on plain-digit input, passthrough otherwise): search-result `#N` labels, the results-dropdown/advanced count headers, and the reader's scroll counter (`152,612 / 4`). Never used for any numeric computation.

### `parseQuery(query)`

Parses a query string into structured tokens.

```js
parseQuery("الله -رسول .سلام col:2:بسم");
// {
//   include: [
//     {term:"الله", wholeWord:false, fuzzy:false, col:null},
//     {term:"سلام", wholeWord:true,  fuzzy:false, col:null},
//     {term:"بسم",  wholeWord:false, fuzzy:false, col:2}
//   ],
//   exclude: [
//     {term:"رسول", wholeWord:false, fuzzy:false, col:null}
//   ]
// }
```

**Syntax reference:**

| Syntax | Meaning |
|---|---|
| `word` | Normal substring match |
| `.word` | Whole‑word match |
| `-word` | Exclude |
| `~word~` | Fuzzy (Levenshtein ≤ 2) |
| `*` / `?` | Wildcard (any / one char) |
| `col:N:word` | Scope to column N |
| `/pattern/flags` | Explicit regex |

### `rowMatchesQuery(row, parsed)`

Checks if a data row (array of cell values) matches a parsed query. Include terms use AND logic; exclude terms filter out matches. Accepts either a raw `parseQuery` result or a compiled one (`compileQuery`).

### `compileQuery(parsed)`

Compiles a parsed query once — normalises each term and precompiles its regex — so a full‑dataset scan never re‑normalises terms or rebuilds `RegExp`s per cell. Returns the same shape as `parseQuery` plus `compiled: true`. Feed it to `rowMatchesQuery` / `rowMatchesQueryNorm` / `buildSnippets`.

### `rowMatchesQueryNorm(row, normRow, compiled)`

Norm‑aware variant of `rowMatchesQuery`: matches against the precomputed normalised cells from `buildNormData()` and a compiled query. Pass `normRow = null` to fall back to on‑the‑fly normalisation (identical behaviour to `rowMatchesQuery`).

### `buildNormData(rows)`

Precomputes a parallel structure of normalised cells for every row (null/undefined cells stay `null`). Built once at book load in `reader.js` and reused by every search keystroke — this is what keeps full‑scan searches fast on big books. The Quran on‑demand column loader keeps it in sync via the `quran-ui.js` ctx bridge.

### `matchTerm(text, term, wholeWord)`

Tests a single term against a text string. Handles wildcards, whole‑word boundaries (Unicode‑aware via `\p{L}`), and fuzzy matching.

### `highlightMatches(text, query)`

Wraps occurrences of the query in `<mark>` tags. Uses normalised matching to handle tashkeel/thikijehi — positions are mapped back to the original text.

### `buildSnippets(row, parsed, queryForHighlight, normRow?)`

Finds matching cells in a row, then builds highlighted snippets (~300 chars around each match). Returns `Array<string>`. `parsed` may be a raw or compiled query; `normRow` is the optional precomputed normalised cell row (from `buildNormData`) to skip re‑normalisation.

### Search history

| Function | Description |
|---|---|
| `getSearchHistory()` | Returns array of recent queries |
| `addSearchHistory(query)` | Debounced (800ms) — adds only completed searches |
| `removeSearchHistoryItem(index)` | Removes one entry |
| `clearSearchHistory()` | Clears all history |
| `MAX_HISTORY` | Max entries (20) |

Saved to `localStorage` under `reader:searchHistory`.

---

## library-search-engine.js

Cross-book search: loads the machine-generated word index (`data/search-index.json`) and answers "which books contain all of these words?". Pure module — no DOM. Used by the library search page (`library-search-page.js`) and by the index build script (`data/07-rebuild-searchIndex.mjs` imports `tokenizeText` so build and query agree on what a word is).

### `loadSearchIndex()`

Returns `Promise<{meta, words}>`. Fetches the index with a conditional request (`cache: "no-cache"` → a cheap 304 when the file is unchanged), parses only the meta head to read the version, and serves the parsed words from the on-device IndexedDB copy (`hadithmvSearch` DB) when the version matches; the full 40MB `JSON.parse` + store happen only on version change (or first load). Failed loads are retryable — the promise is cleared on failure so a later call tries again.

### `searchLibrary(index, query, scopeBookCodes?)`

Pure query against a parsed index. Normalises + tokenises the query (whole words only, AND across words at row level), intersects with `scopeBookCodes` (omit for every book in the index), and returns per-book results `Array<{bookCode, count, firstRow}>` sorted by match count descending — `[]` when the query has no searchable terms or nothing matched. `count` is the number of matching rows; `firstRow` is the first one, as a **1-based data position** (the reader's `?row=` contract — the index stores positions, not CSV `#` values, which are not always sequential) for deep links. Word lookup is exact — `رحم` does not find الرحمن (substring matching stays in-book).

### `tokenizeText(normText)`

Splits normalised text into words — `\p{L}\p{M}\p{N}` runs, so Thaana fili (combining marks) stay part of the word; pure-number tokens are dropped. Shared with the index build script: the query side and the build side MUST agree on what a word is.

---

## library-search-page.js

The `books/library-search.html` page module — self-initialising (runs `init()` on load), exports nothing.

- **URL params** — `?q=TERM` prefills and immediately runs the search; `?tags=A,B` activates tag chips. Typing, chip toggles, and clear keep the address bar in sync via `history.replaceState` — the URL stays shareable.
- **Flow** — reads params → awaits `loadTagDefinitions()` + `loadBookNames()` (book-data.js) → renders tag chips (counts over visible books, `-HDN` excluded) → searches when `_q` is set, otherwise shows the type-hint.
- **Empty-scope guard** — active tags matching no books render "No results" instead of passing `[]` to `searchLibrary` (which would mean "every book").
- **Keyboard** — `/` or `Ctrl+F` focuses the input, `Escape` in the input clears it, `Alt+Z` toggles focus mode (collapses chips + count). `Ctrl+,` settings / `Ctrl+B` back are handled by common.js.
- **Peek previews** — per-book expandable snippets (8 per batch, "Show next N" pager), cached per book+query in module scope (two-level `_peekCache[bookCode][q]` — cache write fixes the old book-data.js bug where `key` was undefined and nothing was ever stored), deep-linking `reader.html?book=X&row=N&q=…`.

---

## i18n.js

### `t(key)`

Returns the translated string for `key` in the current language.

### `setLanguage(lang)`

Sets language (`"dv"`, `"en"`, `"ar"`). Persists to `localStorage`. Dispatches `languagechange` event.

### `currentLang()`

Returns the current language code.

### `tagLabel(code, fallback, lang?)`

Returns the translated label for a tag code. Falls back to the CSV label, then the code itself.

### `initI18n()`

Processes all `data-i18n` attributes in the DOM and sets initial language from `localStorage`.

### `window.showToast(msg)`

Shows a brief toast message at the bottom of the screen. Single shared implementation in `common.js` — used by reader, quran, and book-data modules. Auto-dismisses after 2.5s.

### `window.showErrorToast(msg)`

Failure variant of `showToast` — prepends a ⚠️ marker (language‑neutral, so it works with translated messages too). Use this for every failure toast; success toasts stay plain.

### `window.copyToClipboard(text, successKey, failKey?)`

Copies text to the clipboard. Tries `navigator.clipboard.writeText()` first; falls back to a hidden textarea + `execCommand("copy")` for older browsers. Shows a toast with the given i18n keys for success/failure.

### `window.LS_KEYS`

Centralised object of all localStorage key strings. Keys include `theme`, `fontSize`, `fontSystem`, `contentWidth`, `lang`, `focus`, `pinnedBooks`, `readHistory`, `readerPrefix`, and several `reader:*-prefixed` keys. Defined in common.js; available globally. Prefer these over raw string literals for any listed key (some older call sites still use the raw strings directly).

### `window.createModal(id, titleId, bodyId, extraClass?)`

Creates a modal overlay dynamically (for modals not in static HTML). Appends to body, registers with `window.MODAL_IDS`, wires backdrop-click and close-button via `wireModal`. The generated overlay carries the standard `.modal-title` / `.modal-body` classes, matching the static modals. Returns the overlay element. Used by `pins-history.js` for the pins/history modal.

### Unified modal layer

All modals (settings, font, pins/history) share the same open/close/Escape pattern.

| Function | Description |
|---|---|
| `window.openModal(id)` | Closes all other modals, then opens the one with the given overlay ID. Moves focus into the modal (first focusable) and remembers the trigger so close restores it. |
| `window.closeModal(id)` | Closes a specific modal by overlay ID and restores focus to the element that opened it. |
| `window.closeAllModals()` | Closes every registered modal. |
| `window.MODAL_IDS` | Array of registered modal overlay IDs. Pins/history self-registers on first open. |

`wireModal(id)` in common.js auto-wires backdrop-click-to-close and the `.modal-close` button for any modal at page load. Dynamically-created modals (pins/history) wire themselves on creation.

---

## quran-data.js

Pure data/logic — no DOM dependencies. Detection, CSV loading, data merging, ayah decoration, column classification, registry lookups. Imported by `quran-ui.js`, `reader.js`, and `export-epub.js`.

## quran-ui.js

DOM-heavy UI — `initQuranUI(ctx)`. Surah/ayah/juz dropdowns, content presets, display options, surah selector overlay, on-demand column loading. Re-exports the `quran-data.js` symbols (barrel pattern). Statically imported by `reader.js`.

### `loadQuranBaseData()`

Memoized. Derives the base structure — `[juzNo-HDN, surahNo-HDN, ayahNo-HDN, basmalah, ayahImlai]` per row, 6,236 rows — at load time from three sources: Imlai text via `loadQuranBookCSV(QRN-DATA-ayahImlai.csv)` (version-gated IndexedDB cache), surah spans and the per-surah basmalah from `04-registry-quranSurahs.csv`, juz cut points from `05-registry-quranJuz.csv`. Structural cells are `String`-typed to match CSV byte semantics. Also fills the O(1) lookup tables behind `getSurahStartRow` / `getJuzStartRow`.

### `getSurahStartRow(surahNo)` / `getJuzStartRow(juzNo)`

O(1) lookups into the start-row tables built by `loadQuranBaseData`; return `-1` before the base data is loaded. A juz range's end is the next juz's start row (or `allData.length` after juz 30); a surah's end is its start plus its `ayahCount`. Slice indices equal base-row indices — merge never reorders rows, so these work even with book columns inserted.

### `mergeQuranData(bookCode)`

Loads base data + the current book's CSV + surah names, then merges into a single `{headerRow, allData}`. Base columns come first, then book-specific columns appended.

### `loadQuranBookCSV(bookCode)`

Fetches and parses one translation/tafsir book CSV into `{header, data}`. Keeps a one‑entry cache (most recent book only): the content modal inserts columns one at a time, but the registry lists each book's columns together, so consecutive inserts from the same book reuse the cache instead of re‑fetching and re‑parsing the whole file per column. Memory stays bounded — only one book's parsed rows are retained at a time.

### `applyColumnOrder(state)`

Pure column‑layout rebuild — the heart of the content modal's reorder feature. Takes `{baseCount, headerRow, allData, normAllData?, loadedMap, hiddenColumns, order, pending?}` and returns a fresh `{headerRow, allData, normAllData, loadedMap, hiddenColumns}` where:

- Base columns (first `baseCount`) keep their fixed front positions
- Loaded columns appear in `order` (the modal's list order) — not insertion order
- `loadedMap` entries with value `-1` are pending inserts carried by `pending` (key → `{name, values, normValues}`), placed at their list position
- Hidden indices are remapped to follow their columns

`quran-ui.js` applies the result in place (the reader holds the same array references) and rebuilds the reader.

### `loadColumnRegistry()`

Fetches `06-registry-quranColumns.csv` — a registry of all available Quran columns across all books. Each entry has `sourceBook`, `sourceCol`, `displayDV`, `displayEN`.

### Content presets

`QRN_PRESET_MAIN` and `QRN_PRESET_ARABIC` arrays in `quran-data.js` define which source books (by book code) are included in the Main and Arabic preset buttons in the content modal. Edit these arrays to change which books are shown. Reset clears all externals; All shows everything.

### Content modal ordering

The content modal (`quran-ui.js`) lists every available column in `_colOrder` (registry order by default) with checkboxes and ▲▼ reorder buttons. The reader's column layout is always rebuilt from this order via `applyColumnOrder` — so loaded columns appear in the list's order, not the order they were added. Base columns (juz/surah/ayah numbers, basmalah, ayah text) are fixed at the front; only their checkboxes are active. Moving a loaded column reorders the reader immediately; moving an unloaded one sets where it lands when checked. The modal is created once via `window.createModal` with the unified modal layer (backdrop, close, Escape).

### `getBookLabel(colIndex)`

Returns the book-level title (from `02-registry-bookMeta.csv`) for the source book that column `colIndex` belongs to. Returns `null` for base data columns. Falls back to the raw book code if the book isn't in the registry. Used by the card renderer and clipboard exporter to label each book's content.

### `getColumnSourceBook(colIndex)`

Returns the source book code that column `colIndex` belongs to (or `null` for base data columns). The renderer uses this to skip the source-book label for the Uthmani-script column.

### `hasExternalColumns(currentBookCode)`

Returns `true` when any column from a book other than `currentBookCode` or the base data is loaded. The renderer uses this to decide whether to show source-book labels.

### `rebuildColumnSourceMap(loadedColMap)`

Rebuilds the source map from the internal `loadedColMap`. Called automatically after column loading — consumer code should not need to invoke this.

### `decorateAyah(text, ayahNo, showBraces, showAyahNum, numBrackets)`

Wraps ayah text in `﴿ ﴾` braces and appends the ayah number (as Arabic numeral). Respects user display preferences from localStorage.

### `isAyahTextColumn(header)`

Returns `true` if the column header is an ayah text column (`ayahimlai`, `ayahuthmani`).

### Column classification helpers

Shared across card/parallel/table renderers and all export formats. Imported by `reader.js` and `export-epub.js`.

| Function | Returns | Description |
|---|---|---|
| `columnFieldClass(hdr)` | `""` or CSS class | Maps header prefix (`head`/`kitab`/`bab`/`matn`/`sharh`) to `reader-field-*` class |
| `columnTdClass(hdr, isQuran)` | `""` or HTML attr | Maps header prefix + language to ` class="td-matn"` / ` class="td-sharh"` / ` class="td-ar"` for table mode |
| `isFootnoteColumn(hdr)` | boolean | `true` if header starts with `foot` |
| `isArDvTransition(prev, curr)` | boolean | `true` if `prev` ends with `ar` and `curr` ends with `dv` |
| `isMatnSharhTransition(prev, curr)` | boolean | `true` if `prev` starts with `matn` and `curr` starts with `sharh` |
| `classifyColumnLang(hdr, isQuran)` | `"ar"` / `"dv"` / `"neutral"` | Language classification for parallel text view |
| `isArabicColumn(hdr, isQuran)` | boolean | `true` for Arabic content columns (`…AR` suffix, Quran ayah texts, `basmalah`) — drives the reader's content wash (`--color-wash-bg`, the site's one tint token shared with RDF-all's `merged-row-rasmee` rows) on `.reader-ar-region` in card/parallel views and `td.td-ar` in table mode |

### `findQuranColIndices(headerRow)`

Finds the indices of juz/surah/ayah columns in the header. Cached.

### `getAyahNoFromRow(row, headerRow)`, `getRowJuz(row, headerRow)`, `getRowSurah(row, headerRow)`

Extract ayah, juz, and surah numbers from a data row.

### `updateQuranNavDisplay()`

Syncs the surah/ayah/juz inputs and labels with `quranState`.

### Navigation helpers

| Function | Description |
|---|---|
| `getSurahInfo(surahNo)` | Returns `{nameAR, nameDV, nameEN, ayahCount}` |
| `buildSurahListHTML(query, currentSurah)` | Renders searchable surah selector HTML |
| `toArabicNumeral(n)` | Converts a number to Arabic-Indic numerals (١٢٣) |

### `quranState`

Shared mutable state object:

```js
{ currentSurah: 1, currentAyah: 1, currentJuz: 1 }
```

---

## reader.js

Consumes `reader-position.js`, `reader-search-ui.js`, `table-scroll-sync.js`, `quran-ui.js`, `search-utils.js`, `i18n.js`, `book-data.js`, `csv.js`, `export.js`. Key internal functions (search/position/scrollbar APIs live in their own modules below):

| Function | Description |
|---|---|
| `window.setFocus(on)` | (common.js) Toggles `data-focus` on `<html>`, updates `#btnFocus`, persists to LS, dispatches `focuschange` event. Shared across both pages. |
| `goTo(rowIdx)` | Scrolls to a specific row, lazy‑loading chunks as needed |
| `loadInitial()` | Renders the first chunk of rows |
| `rebuildAll()` | Re‑renders all visible rows (used after settings change) |
| `renderPageTags()` | Renders tag badges in the reader header |
| `renderRowHTML(row, rowNum)` | Card‑view row renderer — builds vertical `<div>` stack with field classes and spacers. |
| `renderParallelRowHTML(row, rowNum)` | Parallel‑view row renderer — partitions fields by language suffix (`ar`/`dv`) into a two‑column grid. |
| `rowText(row, rowNum)` | Formats a row for clipboard copy — decorated ayah text for Quran, header‑aware formatting for other books. |
| `updateViewModeUI()` | Syncs the 📖 View dropdown trigger button and checkboxes with the current `viewMode` (mutual exclusion). |
| `window.closeAllDropdowns()` | Closes all registered dropdowns at once. |
| `window.openDropdown(dd, anchorEl, gap)` | Closes other dropdowns, positions `dd` below `anchorEl` with the given gap (default 4px), and shows it. Used by all dropdown toggles. |
| `window.registerDropdown(id, dd, anchor)` | Registers a dropdown ID and wires its outside‑click‑to‑close handler. The ID is added to the shared close list automatically. |
| `trapWheel(el)` (quran-ui.js) | Stops wheel events on `el` from propagating — prevents dropdown scroll from hijacking the horizontal `.quran-nav` row. |

### Events

| Event | Dispatched by | Listened by | Purpose |
|---|---|---|---|
| `readerReset` | `common.js` (btnResetSettings) | `reader.js` | Delegates reader‑specific reset to the reader module (view mode, hidden columns, tashkeel, Quran display) without tight coupling. |
| `dashboardReset` | `common.js` (btnResetSettings) | `dashboard.js` | Delegates dashboard‑specific reset (pins, history, search, filters) without tight coupling. |
| `languagechange` | `i18n.js` | All modules | Triggers UI re‑render when the user changes language. |
| `focuschange` | `common.js` (`window.setFocus`) | reader.js, dashboard.js | Fires after focus mode toggles. Reader uses it to recalc `--table-header-top` and scroll padding; dashboard uses it for optional layout adjustments. |

### Clipboard format

- **Standard books** — header line `titleDV - titleAR` followed by row text with column separators (AR/DV spacer, matn/sharh divider, footnote divider).
- **Quran books** — no book header line. Ayah text decorated with `﴿ ﴾` braces, surah reference `[name surahNo : ayahNo]`, then columns grouped by source book with a book-level label (from `02-registry-bookMeta.csv`) above each book's columns. Per-column headers are omitted.

---

## radheef-merge.js

The virtual merged radheef book (`RDF-all`) — a registry book with **no content CSV**; its rows are assembled in memory at load from the eight source radheef books (see ARCHITECTURE.md → "Virtual merged books" for the design contract). Imported by `reader.js` only.

| Function | Description |
| --- | --- |
| `isMergedRadheefBook(bookCode)` | `true` for `RDF-all` (the only virtual book today). Used by `reader.js`'s `loadBookData()` to pick the virtual load path. |
| `loadMergedRadheefBook()` | Fetches the 8 sources via `fetchBookCSVCached` (each keyed by its own registry `version`), projects every row by header name into `wordAR, wordDV, wordEN, meanAR, meanDV, meanEN, source`, and resolves `{ data, headerRow, hasRowNums: false }` — the same shape as `loadStandardBook`. `source` carries each row's book's Dhivehi title from the registry; blocks concatenate in `MERGED_SOURCES` order (registry order). A source that fails or has no rows is skipped; if nothing loads, `data` is empty and the reader's "No data found" path takes over. |

---

## reader-position.js

Reader position: the pagination strip, the visible-row detector, and the scroll-driven block (progress bar, milestone toasts, scroll counter, URL sync, read-history auto-log + pin update). Extracted from reader.js. Owns module-scope state set by `initPosition(ctx)`; reads core-owned values through ctx accessors. Imports `t`/`currentLang` (i18n), `addReadHistory`/`isPinned`/`addPin` (book-data), and quran-ui helpers.

### `initPosition(ctx)`

Registers the window scroll listener (`{ passive: true }`) and logs the initial read-history entry. ctx: `{ metadata, quranBook, headerRow, allData, getFilteredData, pinLabel, goTo }` — `metadata`/`quranBook`/`headerRow`/`allData` are direct refs (never rebound); `getFilteredData` is an accessor because search reassigns `filteredData`; `pinLabel`/`goTo` are callbacks. Called from reader.js's initial render **before** `loadInitial` — the table branch calls `updatePagination()`, so the module's ctx must exist by then.

The URL sync, read-history auto-log and pin auto-update all store **whole-book row numbers**: surah/juz filter views are slices of `allData`, so the scroll handler maps the visible row back via `allData.indexOf(filteredData[vRow]) + 1` before writing — the reader's `?row=` handler reads rows against the full book at load (filters never appear in the URL). The Share button and the 📌 bookmark handler in reader.js follow the same convention, and `pinLabel` takes the same 1-based whole-book row.

### `updatePagination()`

Syncs the page strip, First/Prev/Next/Last buttons and the Quran nav row with the current scroll position. Throttled to ~8 fps; skips DOM writes when nothing changed; skips the page-strip rebuild while its number input is focused. Used by the toolbar call sites in reader.js and internally by the scroll handler.

### `visiblePageIndex()`

Visible row index: `elementFromPoint` fast path at viewport centre, linear-scan fallback. Exported for reader.js (toolbar buttons, export ctx) and used internally.

## reader-search-ui.js

In-book search UI: type-ahead results dropdown, search history, whole-word toggle, advanced search modal, arrow-key navigation while the search input is focused. Extracted from reader.js; imports `updatePagination` from reader-position.js and the search engine from search-utils.js. For `RDF-*` books (dictionaries) the dropdown is replaced by the in-place filter — see `applyRadheefFilter` below.

### `initSearchUI(ctx)`

Wires the search input, whole-word toggle, history dropdown, advanced search modal and the search-nav `document` keydown listener (registered first, so it runs ahead of reader.js's global keydown while the input is focused). ctx: `{ allData, normAllData, maxCols, colLabel, getFilteredData, setFilteredData, getLoadedStart, setLoadedStart, getLoadedEnd, setLoadedEnd, rebuildAll, loadInitial, observeSentinels, goTo }` — `allData`/`normAllData`/`maxCols` direct refs (never rebound); the getter/setter pairs cover variables search reassigns (`filteredData`, `loadedStart`/`loadedEnd`).

### `applySearch(query)`

Runs the search engine, updates the results dropdown and match count. Used by reader.js's settings reset and the `?q=` deep-link block. For RDF books it takes an early branch to `applyRadheefFilter(query)` instead.

### `applyRadheefFilter(query)`

RDF-family in-place filter: compiles the query (whole-word toggle honoured), filters `ctx.setFilteredData(matches)` and `ctx.rebuildAll()`s so only matching rows render — no dropdown, no result list. Clearing the input restores all rows; zero matches renders the empty-state message; the scroll counter shows the match count (comma-formatted). History is added on input like the normal flow. The `?q=` deep link filters through the same path on load.

### `renderAdvancedSearch()`

Opens the advanced search modal with its condition rows (AND/OR, operators, values). Used by the Ctrl+Shift+F keyboard shortcut in reader.js.

### `parseQueryWithMode(query)`

Parses a raw query string into the internal query shape, including the whole-word marker. Used by reader.js's `?q=` deep-link block.

## table-scroll-sync.js

Table view's top scrollbar widget: mirrors its horizontal scroll onto the table (RTL-aware — Chrome and Firefox disagree on `scrollLeft` sign), smooth-scrolls one column per arrow click, supports shift+wheel. The widget DOM is created by reader.js's `loadInitial` (table branch), which calls `initTableScroll` right after. Imports nothing.

### `initTableScroll(ctx)`

Resolves the widget DOM (`#tableTopScroll`, `#tableWrap`, `#tableTopScrollInner`, arrow buttons) and wires scroll/click/wheel listeners. ctx: `{ headerRow, getHiddenColumns }` — the accessor because the settings reset rebinds `hiddenColumns` (a captured ref would go stale).

### `refreshTableScrollWidth()`

Recomputes table and spacer widths and scrollbar visibility after column toggles or window resize. Safe to call before init — the DOM lookups return null and the guards bail. Called by reader.js's resize listener and the append/prepend loaders.

---

## export-epub.js

Lazy-loaded module — only fetched when the user chooses EPUB export. Imports `zipStore` from `export-zip.js`, `escapeXML` from `search-utils.js`, and column helpers from `quran-ui.js`.

### `createEPUB(rows, meta, opts)`

Generates a valid EPUB 3 e-book Blob. Each book row becomes a chapter. The Hadithmv font is optionally embedded for offline reading.

- `rows` — 2D array of cell values
- `meta` — `{bookCode, titleEN, titleDV, titleAR}`
- `opts` — `{siteURL, fontData?: Uint8Array}`
- Returns `Blob` with MIME type `application/epub+zip`

Structure: `mimetype` (first, uncompressed) · `META-INF/container.xml` · `OEBPS/content.opf` (Dublin Core metadata) · `OEBPS/nav.xhtml` (EPUB 3 TOC) · `OEBPS/cover.xhtml` · `OEBPS/chXXX.xhtml` (one per row) · `OEBPS/styles.css` · `OEBPS/fonts/hadithmv.woff2` (if embedded).

```js
import("./export-epub.js").then(mod => {
  const blob = mod.createEPUB(allData, {
    bookCode: "AQD-nawaqidulIslam",
    titleEN: "Nawaqid ul-Islam",
    titleDV: "ނަވާޤިޟުލް އިސްލާމް",
    titleAR: "نواقض الإسلام"
  }, { siteURL, fontData: new Uint8Array(fontBuf) });
  // download blob…
});
```

---

## export-xlsx.js

Lazy-loaded module — only fetched when the user chooses Excel export. Imports `escapeXML` from `search-utils.js` and `zipStore` from `export-zip.js`.

### `createXLSX(rows, sheetName)`

Generates a valid `.xlsx` (Office Open XML) spreadsheet Blob.

- `rows` — 2D array of cell values (`null`/`undefined` → empty cell)
- `sheetName` — sheet name, sanitised to ≤31 chars with `[ ] : * ? / \\` removed
- Returns `Blob` with MIME type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

Uses inline strings (no shared-strings table) and store-only ZIP (no compression). The ZIP bundles five XML files: `[Content_Types].xml`, `_rels/.rels`, `xl/workbook.xml`, `xl/_rels/workbook.xml.rels`, `xl/worksheets/sheet1.xml`.

```js
import("./export-xlsx.js").then(mod => {
  const blob = mod.createXLSX(allData, "MySheet");
  // download blob…
});
```

## export-zip.js

Minimal store-only ZIP writer — shared by the XLSX and EPUB writers (EPUB is a ZIP of XHTML + XML metadata). Lazy-loaded with whichever writer needs it.

### `zipStore(files)`

Store-only ZIP writer. Takes `[{name: string, data: Uint8Array}]`, returns `Uint8Array`.

## Data API (HTTP GET)

No JSON endpoints. All data is CSV — one source of truth, no duplication. If you need JSON, fetch the CSV and parse it yourself. Base URL: `https://hadithmv.github.io/codebase/`

### Book registry

```http
GET data/02-registry-bookMeta.csv
```
Columns: `bookCode,titleAR,titleDV,titleEN,tags`. One row per registered book. The `tags` column holds secondary tag codes (comma‑separated); the primary tag is the first segment of `bookCode`.

### Tag definitions

```http
GET data/01-registry-bookTags.csv
```
Columns: `code,label`. Colours are auto‑generated client‑side using golden‑ratio HSL — unlimited tags, always distinct.

### Book content

```http
GET data/content/{bookCode}.csv
```
First row is the column header. Column 0 is `#` (row numbers) or regular content. Headers ending in `*AR` are Arabic, `*DV` are Dhivehi. Standard CSV: comma‑delimited, quoted fields, `\r\n` line endings.

### Parsing

Every language has a CSV parser. Here's how to get started:

```js
// JavaScript — fetch + parse to array of arrays
const csv = await fetch(url).then(r => r.text());
const rows = csv.trim().split(/\r?\n/).map(line => {
  const cols = []; let cur = "", inQ = false;
  for (const c of line) {
    if (inQ) { if (c === '"') inQ = false; else cur += c; }
    else { if (c === '"') inQ = true; else if (c === ',') { cols.push(cur); cur = ""; } else cur += c; }
  }
  cols.push(cur); return cols;
});
```

```python
# Python — stdlib csv module
import csv, urllib.request
with urllib.request.urlopen(url) as r:
    rows = list(csv.reader(r.read().decode().splitlines()))
```

```bash
# curl into any CSV tool
curl -s https://hadithmv.github.io/codebase/data/02-registry-bookMeta.csv | csvlook
```

No authentication, no rate limiting, no CORS — static files on GitHub Pages.
