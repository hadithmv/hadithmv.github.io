# Architecture

Metadata-driven, single-page viewer for Islamic texts. Configuration lives in CSV files. UI supports Dhivehi, English, and Arabic.

> **Other docs:** [User Guide](USER_GUIDE.md) for readers · [API Reference](API.md) for developers

## The big picture

Hadithmv is a **static, CSV‑driven viewer**: no server, no build step, no database — every screen renders from CSV files fetched at runtime in the browser. Adding a book or a translation never requires code changes; it requires a CSV and a registry row.

The data flow is one chain:

```text
data/content/*.csv → fetch + parseCSV → in‑memory rows → render (dashboard grid / reader / Quran merge)
```

- **Dashboard** reads two small registry CSVs (books, tags) and renders the collection.
- **Reader** fetches one book CSV and renders it with infinite scroll.
- **Quran reader** merges a base ayah file with per‑translation book CSVs by row index.

Everything is client‑side: search is in‑memory, pins/history/settings live in `localStorage`, and the UI is RTL‑first (see the RTL notes under "Horizontal scrolling & RTL" — there is **no root `dir="rtl"`**).

**Single source of truth:** behavior facts are described ONCE in this document. The User Guide and README summarize and link here — they never restate behavior in their own words (restating in three places is how facts drift apart and contradict each other).

## Where to look (cheat sheet)

| Task | Where |
|---|---|
| Change the toolbar / reader chrome | `books/reader.html` + `js/reader.js` + `css/reader.css` |
| Add a regular book | README → "Add a new book" |
| Add a Quran translation | "Adding a new Quran translation" below |
| Change themes / colours | `css/common.css` `--color-*` variables (3 themes) |
| Add a UI string | `js/i18n.js` (`dv`/`en`/`ar`), then the button gets `data-i18n` |
| Wire a new modal | `common.js` `createModal()` + `MODAL_IDS` (must open via `openModal`) |
| Change search behaviour | `js/search-utils.js` (engine) + `js/reader.js` (wiring) |
| Bump the version | `js/i18n.js` `appVersion`, commit "Update to vX.Y.Z" |
| Verify changes | "Verification habits" at the bottom |

## Files

| File                         | Purpose                                                                    |
| ---------------------------- | -------------------------------------------------------------------------- |
| `data/02-registry-bookMeta.csv`      | Central registry of books (code, titles in AR/DV/EN, secondary `tags` column) |
| `data/01-registry-bookTags.csv`       | Tag definitions (code, label) — colours auto‑generated (golden‑ratio HSL)  |
| `books/index.html`           | Dashboard — book list, search, tag filter, table/card view                 |
| `books/reader.html`          | Book viewer — loaded via `?book=CODE`                                      |
| `books/library-search.html`  | Library search page — self-initialising, shareable `?q=`/`?tags=` URLs     |
| `css/common.css`             | Shared: themes, fonts, topBar, sidebar, unified modals, `.dd-item` / `.dd-menu` dropdown classes, tag colors |
| `css/reader.css`             | Reader page: focus mode, toolbar, pagination, content, responsive. **Must load last** so its mobile media queries override reader-quran.css on specificity ties. |
| `css/reader-search.css`      | Reader: search bar, results dropdown, advanced search                      |
| `css/reader-table-view.css`  | Reader: table view mode, top scrollbar, sentinels                          |
| `css/reader-quran.css`       | Reader: Quran nav row, dropdowns, surah overlay. Loads before reader.css.  |
| `css/dashboard.css`          | Dashboard styles: grid, cards, controls, table view                        |
| `css/library-search.css`     | Library search page: results, peek previews                                |
| `js/common.js`               | Shared init: theme, fonts, i18n, sidebar, settings, keyboard, unified modals, toast, clipboard, LS_KEYS, createModal |
| `js/book-data.js`            | Book metadata: registry + tag loaders, tag extraction, page bootstrap |
| `js/dashboard.js`            | Dashboard UI: card/table grid, search, tags, sort, pins & history modals, keyboard |
| `js/pins-history.js`         | Pins & history: storage CRUD, modal UI, sidebar wiring |
| `js/reader.js`               | Book viewer: rendering, clipboard, toolbar, keyboard, dropdowns, focus mode |
| `js/export.js`               | Export formats (TXT, MD, JSON, CSV, TSV, PDF, PNG, Excel, EPUB, YAML, TOON, HTML, HTML Table, XML, Word) |
| `js/quran-data.js`           | Quran pure data/logic: detection, loading, merging, ayah decoration, column classification helpers |
| `js/quran-ui.js`             | Quran UI: surah/ayah/juz dropdowns, content presets, display options, surah selector. Re‑exports quran-data.js. |
| `js/csv.js`                  | Tiny CSV parser (~1 KB) — `parseCSV()`, `unparseCSV()`, `fetchCSV()`, `parseCSVWithHeader()`, `loadCSVData()` |
| `js/search-utils.js`         | Search engine: normalisation, parsing, matching, snippets, history, HTML/XML escaping |
| `js/library-search-engine.js`| Cross-book search: index loader (IndexedDB-cached) + pure query engine — `loadSearchIndex`, `searchLibrary`, `tokenizeText` (shared with the index build script) |
| `js/library-search.js`       | Library search page UI: `?q=`/`?tags=`, chips, results, peek previews      |
| `js/export-xlsx.js`          | XLSX writer — createXLSX(), inline strings, lazy-loaded |
| `js/export-epub.js`          | EPUB 3 e-book writer — createEPUB(), embedded font, lazy-loaded |
| `js/export-zip.js`           | Minimal store-only ZIP writer — zipStore(), shared by the XLSX + EPUB writers |
| `js/i18n.js`                 | Translations module (dv/en/ar) — `t()`, `setLanguage()`                    |
| `font/`                      | Custom merged font (Arabic + Thaana + Latin, WOFF2 + WOFF)                 |
| `data/content/*.csv`        | Per-book content files                                                     |
| `data/03-update-bookRegistry.ps1` | Adds new books, recomputes version hashes, sorts the registries            |
| `data/04-registry-quranSurahs.csv` | 114 surah names in AR/DV/EN with ayah counts |
| `data/05-registry-quranColumns.csv` | Registry of all available Quran columns (source, labels, defaults) |
| `data/content/QRN-DATA-baseFile-1-juzNo_surahNo_ayahNo_basmalah_ayahImlai.csv` | Base Quran data: juz/surah/ayah numbers + Imlai text |
| `data/content/QRN-DATA-baseFile-2-ayahUthmani.csv` | Quran text in Uthmani script                                     |
| `data/06-rebuild-searchIndex.mjs` | Node build script — scans every registered book, emits the word-level search index (rerun after book changes) |
| `data/search-index.json`     | Generated word-level search index — the one machine-generated data file (see "Library search") |
| `data/search-index-report.md` | Generated per-build policy report — one row per book (index id, rows, postings, indexed/skipped columns), warnings, and a postings-by-column breakdown sorted by size; commit it to diff policy changes across versions |

## Where to find things

Key functions and where they're defined. Many are re-exported through barrel modules (quran-ui.js → quran-data.js, book-data.js → pins-history.js).

| What | Module | Notes |
|---|---|---|
| Book metadata | `book-data.js` | `initializePageWithMetadata`, `loadBookNames`, `extractTags` |
| Dashboard UI | `dashboard.js` | `initializeDashboard`, `renderDashboard`, `setupDashboardControls` |
| CSV parsing | `csv.js` | `parseCSV`, `fetchCSV`, `parseCSVWithHeader`, `loadCSVData` |
| Theme, font, sidebar, settings | `common.js` | Also `window.setFocus`, `window.LS_KEYS`, `window.copyToClipboard`, `window.createModal` |
| i18n / translations | `i18n.js` | `t(key)`, `setLanguage(lang)` |
| Search engine | `search-utils.js` | `normaliseForSearch`, `parseQuery`, `compileQuery`, `rowMatchesQueryNorm`, `buildNormData`, `escapeHTML`, `escapeXML` |
| In-book search UI | `reader.js` (UI) + `search-utils.js` (shared toolkit) | search bar, dropdown results, advanced search; styles in `reader-search.css` |
| Library search | `library-search-engine.js` | `loadSearchIndex`, `searchLibrary`, `tokenizeText` (shared with the index build script) |
| Library search page | `library-search.js` | self-initialising — `?q=`/`?tags=`, chip scoping, peek previews |
| Quran data / decoration | `quran-data.js` | `decorateAyah`, `isAyahTextColumn`, `mergeQuranData`, column classification helpers |
| Quran nav / dropdowns | `quran-ui.js` | `initQuranUI(ctx)` — re-exports quran-data.js |
| Reader core | `reader.js` | Rendering, pagination, toolbar, keyboard, progress bar |
| Export formats | `export.js` | `initExports(ctx)` — TXT, MD, PDF, EPUB, etc. |
| Pins & history | `pins-history.js` | `addPin`, `addReadHistory`, `openPinsModal`, `openHistoryModal` |
| `window.openDropdown` / `closeAllDropdowns` / `registerDropdown` | `reader.js` | Shared dropdown helpers |
| `window.showToast` | `common.js` | Single toast implementation |

## Request flow

```text
URL: ?book=AQD-nawaqidulIslam
        │
        ▼
  book-data.js
    ├─ fetch ../data/02-registry-bookMeta.csv  ──→  find row by bookCode
    ├─ fetch ../data/01-registry-bookTags.csv ──→  resolve tag badges (primary prefix + tags column)
    └─ returns { bookCode, titleAR, titleDV, titleEN, csvPath }
        │
        ▼
  reader.js
    ├─ parseCSV(../data/content/AQD-nawaqidulIslam.csv)
    ├─ first row = header; col 0 = # or blank → row numbers
    ├─ build column toggle buttons
    ├─ loadInitial() → first chunk of rows
    └─ wire infinite scroll / search / toolbar / keyboard / i18n
```

No `?book=` → dashboard (`index.html`) loads `dashboard.js` (which imports `book-data.js` for the registry) → search bar, tag chips, sort row (with pins/history modal buttons, reset, view toggle, sort select), card grid of all books. Pins and history persist in `localStorage` (max 10 each) and open as modal overlays from toolbar buttons. Key behaviors:

- **Sort row** — one continuous line that scrolls horizontally when it doesn't fit (reader‑toolbar pattern: `#dashboardPanelFunctions` wrap with ◀▶ edge arrows, inner `.dash-functions-scroll` does the scrolling, arrows auto‑hide at the extremes, wheel redirects to horizontal — see "Horizontal scrolling & RTL" before touching the arrow signs)
- **Table view** — `dash-table` wrapped in `.dash-table-wrap`: `overflow-x: auto` with a hidden scrollbar, so its four columns scroll sideways instead of overflowing the page
- **Continue‑reading card** — inside the collapsible dashboard panel (above the tags), appears when no search/tag/pins filter is active, built from the most recent history entry (book title, saved position — a surah reference like `ބަޤަރާ 2 : 60` for Quran books, otherwise the localized "Page N" prefix + row number — and relative time); clicking resumes at `reader.html?book=X&row=N`. Because it lives in the collapsible panel, focus mode collapses it with the rest of the chrome
- **Pin auto‑update** — while the user reads a **pinned** book, the reader's scroll handler (debounced 2 s, guarded by `isPinned` + `_lastHistoryRow`) calls `addPin(bookCode, vRow + 1, pinLabel(...))`, piggybacking on the same timer as the history auto‑log; the URL position sync is a separate 500 ms debounce
- **`?tags=A,B`** — pre‑filters by tag codes; clicking a tag chip updates the URL via `history.replaceState`, so filtered views are bookmarkable and shareable. An `All` chip (active when no tags are selected) clears the tag filter

The dashboard panel's DOM nesting (each level is a flex container):

```text
#dashboardPanel
├── #dashboardPanelSearch
└── #collapsibleDashboardPanel          ← collapses in focus mode
    ├── #dashboardContinue              ← continue-reading card (any view, when history exists)
    ├── #dashboardPanelTags             ← tag chips
    └── #dashboardPanelFunctions        ← wrap: arrows + scroll
        ├── ▶ .scroll-arrow-start
        ├── .dash-functions-scroll      ← the scroll container
        │   ├── #dashboardResultCount
        │   └── .dash-functions-row     ← reset · view · pins · history · sort
        └── ◀ .scroll-arrow-end
```

The reader's page‑header tag badges link to `index.html?tags=CODE`, letting readers jump to the dashboard filtered by that category.

```text
┌─ Search bar ───────────────────── [✕] [Advanced] ─────────┐
│  Tags: [📌 ޕިން (3)] [Aqidah ✕] [Hadith] [Fiqh] …          │
│  Books: 12                                                  │
├─ Sort row ─────────────────────────────────────────────────┤
│  📌 Pins    🕐 History    ↺ Reset   📖 View   Sort: A-Z  │
├─ Card grid ────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ 📌 Aqidah │  │  Hadith  │  │  Quran   │                  │
│  │ Title DV  │  │ Title DV  │  │ Title DV  │                  │
│  │ Title AR  │  │ Title AR  │  │ Title AR  │                  │
│  │ N rows    │  │ N rows    │  │ N rows    │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│  …                                                          │
└─────────────────────────────────────────────────────────────┘
```

`?book=CODE` → reader (`reader.html`) loads `reader.js` → parses the book CSV, renders infinite-scroll content.

Both pages share `common.js` for theme, fonts, i18n, sidebar, settings modal, and keyboard shortcuts.

## Reader UI

### Layout

```text
┌─ Fixed topBar (z-index 101, opaque bg) ───────────────────═┐
│  ↩ Return  ↕ Focus  │  Book Title (scrollable)  │  ☰ Menu   │
│  ═══ progress bar (surah-level for QRN, milestone toasts, green border + surah-completed toast at 100%) │
├─ Sticky collapsibleReaderPanel (z-index 50) ─────────────────┤
│  readerPanelSearch       🔎 Advanced  [input]  ✕  (N)        │
│  readerPanelFunctions    📋 📌 ◉ 🔗 ↕ ↺ 📥 …               │
│  readerPanelPagination   << < [N] / [N] > >>  Tags …        │
│  readerPanelQuran (QRN)  ▶ 1 الفاتحة ◀  …                  │
├─ Reader content (scrollable) ────────────────────────────────┤
│  [Table mode] ▶ ════ scrollbar ════ ◀                       │
│  #1 …                                                        │
│  #2 …                                                        │
└──────────────────────────────────────────────────────────────┘
```

Columns are rendered in header order. A blank line separates the last `*AR` column from the first `*DV` column (AR‑ending → DV‑ending headers). A `ـــــــــــ` tatweel divider appears before any column whose header starts with `foot` (case‑insensitive — matches `foot`, `footAR`, `footDV`). Columns starting with `head`/`kitab`/`bab` render as large/medium/small bold headings respectively.

The sticky `#collapsibleReaderPanel` extends to the full width of `#readerWrapper`. `#readerContent` has its own side padding. Content width is controlled by the `--content-width` CSS variable (default 800px), set from the Settings → Width dropdown. At full width (`none`) the `data-widescreen` attribute also removes border-radius. The topBar and panel both use a `::before` pseudo-element for full-bleed background. Panel rows are horizontally centered. Search inputs cap at `max-width: 500px` so they don't stretch endlessly on wide screens.

Column header prefix → CSS class / visual treatment:

```text
CSV header          CSS class               Visual result
──────────          ──────────              ─────────────
headAR, headDV      reader-field-header     1.3rem bold
kitabAR, kitabDV    reader-field-kitab      1.2rem semi‑bold
babAR, babDV        reader-field-bab        1.1rem semi‑bold
matnAR, matnDV      reader-field-matn       normal body text
sharhAR, sharhDV    reader-field-sharh      0.9em smaller text
foot, footDV        reader-footnotes        0.9rem muted colour
                   + reader-footnote-divider  ﻿ـــــــــــ  tatweel line before
```

### Infinite scroll

Content loads in chunks: 25 rows (card mode) or 30 rows (table mode), with 50 rows in the initial table load. Sentinel elements at top and bottom trigger `IntersectionObserver` to prepend/append more rows when scrolling near edges. Pagination updates based on the most visible row (detected via `document.elementFromPoint()` for O(1) lookup, with a linear-scan fallback).

```text
┌─ sentinelTop ──────────────────┐   scrolled near the top → prependPrev()
│ [chunk] [chunk] [chunk]        │   inserts chunks ABOVE, scroll position
│ [chunk] [chunk] [chunk]        │   is preserved (scrollTop adjusted)
│ [chunk] [chunk] [chunk]        │   ← loadedStart … loadedEnd (loaded window)
│ [chunk] [chunk] [chunk]        │
└─ sentinelBottom ───────────────┘   scrolled near the bottom → appendNext()
                                     appends chunks BELOW
```

The DOM never holds the whole book — only the loaded window around the viewport (25–50 rows per chunk, one or two chunks past each edge).

### Pagination

First (`<<`) / Prev (`<`) / a number input showing current row / Next (`>`) / Last (`>>`). The input shows `total / [current]` and accepts direct row-number entry. All buttons and the input share the same height. Pagination updates are throttled to ~8 fps and skip DOM writes when values haven't changed.

### View modes

The reader supports three visual layouts, selected via a dropdown in the toolbar or cycled with the `Alt+V` key:

**Card mode** (default for most books) — Each row renders as a vertical stack of `<div class="reader-field">` cards, with a diamond ornament divider between rows. Fields are ordered by column index (left to right in the CSV header), with CSS classes applied based on column-header prefix (`head`, `kitab`, `bab`, `matn`, `sharh`, `foot`). Arabic‑Dhivehi transitions and matn‑sharh transitions get visual spacers.

**Table mode** — Available for all books. Renders as an HTML `<table>` with `table-layout: auto`, a sticky `<thead>`, and a synchronized top scrollbar. Columns size to content — the first column (row number) has a 60px minimum width and `white-space: nowrap`. RDF‑prefixed books default to table on desktop (>600px); other books default to card.

**Parallel text mode** — Two‑column grid layout that groups fields by language: columns whose headers end in `dv` go in the right column; columns whose headers end in `ar` (or are Quran ayah‑text columns) go in the left column. Neutral columns (no language suffix, e.g. `#`, bare `foot`) span full width. On mobile (≤600px) the columns stack vertically. The classification logic uses the same header‑suffix conventions (`isArDvTransition`, `isMatnSharhTransition`) already present in `renderRowHTML`.

**Horizontal scrollbar.** When column content exceeds the viewport width, a sticky horizontal scrollbar appears above the table. It sits below the reader chrome (`position: sticky; top: var(--rdf-header-top) + 2px; z-index: 6`) so it remains visible during vertical scrolling. Arrow buttons (`▶` back / `◀` forward) flank the scrollbar and scroll one column width (150px) per click with a custom `requestAnimationFrame` ease-out animation. Shift+wheel on the table area also drives horizontal scroll. The scrollbar row is hidden entirely when the table fits without overflow.

**Sticky headers.** `<th>` elements use `position: sticky`. When the horizontal scrollbar is visible their `top` offset is increased by 19px to sit below the scrollbar; when hidden they sit directly below the chrome. The offset is set dynamically via JS.

**Performance.** `table-layout: auto` lets the browser size columns by content. `border-collapse: separate; border-spacing: 0` avoids the expensive collapsing-border algorithm. `contain: layout style` isolates the table's layout from the rest of the page. `content-visibility: auto` is explicitly NOT applied to `<tr>` elements (it breaks the table layout algorithm). The table wrapper uses `overflow-x: clip` (fallback: `hidden`) so sticky positioning is not trapped by a scroll container.

### Search

Real‑time, tashkeel‑insensitive filtering via `normaliseForSearch()` — strips Arabic diacritics, normalises alif/ya/waw variants, and normalises Thaana thikijehi (Arabic‑derived letters) to base Thaana. **Thaana fili (vowel marks) are deliberately PRESERVED** — unlike Arabic diacritics they distinguish words (ކަތި ≠ ކުތި), so stripping them would cause false matches. Results dropdown with highlighted snippets mapped back to original text. Keyboard‑navigable (↑/↓/Enter/Escape). Advanced search modal for column/condition/value filters with AND/OR logic. Same normalisation used for dashboard search. A `?q=TERM` URL param (used by library-search deep links) fills the search input on load, runs the search — so the dropdown lists every match and rendered rows show the term highlighted — and jumps to the `&row=` target, or the first match when no row is given.

**Performance.** Normalisation is a single regex pass (per‑char lookup instead of ~30 sequential replaces). At book load `reader.js` precomputes a parallel structure of normalised cells (`buildNormData()`), and each search compiles its query once (`compileQuery()`) — so a full scan over 50k+ rows matches against precomputed strings with precompiled regexes, and never re‑normalises a cell or a term. The search input is debounced (120 ms), so only pauses in typing trigger a scan. Highlighting (`highlightMatches` / `buildSnippets`) maps normalised match positions back to original text with an identity fast path (`mapNormToOrig`): characters that pass through normalisation unchanged are matched with a single compare, so only the minority (tashkeel, thikijehi, case) pay a normalisation call. The Quran on‑demand column loader keeps the norm cache in sync via the `initQuranUI` ctx bridge.

### Toolbar

| Control         | Implementation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------                                                                                                                                                                                                                                                   |
| Copy            | **Standard books:** `titleDV - titleAR` header, then row text with `ـ` divider before `foot` columns, blank line between AR‑ending and DV‑ending columns, heading formatting for `head`/`kitab`/`bab` columns. **Quran books:** no book header; decorated ayah text, `[name surahNo : ayahNo]` reference, then columns grouped by source book with one book-level label per book. `navigator.clipboard.writeText()` with `execCommand` fallback.                                                                                   |
| Share           | Copies a deep link (`?book=CODE&row=N`) to the current row.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Hide diacritics | Wraps Unicode diacritic ranges in `<span class="tashkeel">`. Toggle adds `.hide‑tashkeel` class → `display: none`.                                                                                                                                                                                                                                                                                                                                                                                                                 |
| View toggle     | Dropdown (📖 View) offering Card, Table, and Parallel Text layouts. Table is available for all books; RDF books default to table on desktop. Parallel view groups AR‑suffixed and DV‑suffixed columns side‑by‑side. `Alt+V` cycles through modes.                                                                                                                                                                                                                                                                                  |
| Reset           | Clears search, unhides all columns, shows tashkeel, exits focus mode, clears `reader:` localStorage.                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Export          | Dropdown: TXT, MD, JSON, CSV, TSV, YAML, TOON, XML, Excel, EPUB, Word, PDF, PNG, HTML, HTML Table. TSV is tab-separated. TOON uses expanded list per spec. Excel uses `js/export-xlsx.js` (lazy-loaded). EPUB uses `js/export-epub.js` (lazy-loaded, embedded font). PNG exports only the current visible row (2×) — see the format table. Text formats assemble the whole book as a single string + Blob in memory (fine at current book sizes, ~8MB max). All include book title, URL, Hadithmv, version, and proper formatting. |
| Hide columns    | Dropdown with per‑column toggle buttons. `hiddenColumns[]` persisted per book (`reader:hiddenColumns:{bookCode}`).                                                                                                                                                                                                                                                                                                                                                                                                                 |

#### Export formats

| Format     | Type        | Header row? | Module            | Notes                                |
|-----------|-------------|-------------|------------------|--------------------------------------|
| TXT       | Rich text   | No          | —                 | Formatted like clipboard copy        |
| MD        | Rich text   | No          | —                 | Markdown with `##` per row           |
| JSON      | Data        | Yes         | —                 | Array of arrays, header first        |
| CSV       | Data        | Yes         | —                 | `unparseCSV()`                       |
| TSV       | Data        | Yes         | —                 | Tab‑separated                        |
| Excel     | Data        | Yes         | `export-xlsx.js`  | Lazy‑loaded, inline strings          |
| HTML      | Rich text   | No          | —                 | Book reader view, styled paragraphs  |
| HTML Table| Data        | Yes         | —                 | `<table>` with `<thead>`             |
| Word      | Rich text   | No          | —                 | HTML saved as `.doc`                 |
| EPUB      | Rich text   | No          | `export-epub.js`  | Lazy‑loaded, embedded font           |
| YAML      | Structured  | —           | —                 | `id` + `fields` per row              |
| TOON      | Structured  | —           | —                 | Hadithmv compact notation            |
| XML       | Structured  | —           | —                 | `<book>` / `<row>` / `<colN>`        |
| PDF       | Rich text   | No          | —                 | Print‑only (window print)            |
| PNG       | Screenshot  | —           | —                 | Canvas render of the current visible row (2×) — one row only, never the whole book |

**Rule:** data formats (CSV, TSV, Excel, JSON, HTML Table) include the CSV header row. Rich‑text and structured formats do not.

The toolbar and pagination rows are wrapped in a `.h-scroll-wrap` container with `padding: 0 30px` that provides space for absolutely‑positioned ◀▶ arrow buttons at the edges. The row itself handles horizontal scrolling (`overflow-x: auto`, hidden scrollbar). Mouse wheel over the wrap is redirected to horizontal scroll on the row. When the row overflows, direction‑aware arrow buttons appear at the edges: ◀ at the end (scrolls toward end), ▶ at the start (scrolls toward start). Arrows are hidden at the appropriate extremes. Both arrow clicks and mouse‑wheel redirection animate smoothly via the same `requestAnimationFrame` loop with an ease‑out‑cubic curve (300ms). Arrow visibility updates on scroll, resize, and after the reader wrapper becomes visible.

**Position readouts — there are TWO, easily confused:**

- **Pagination strip** (top, in `updatePagination` → `pageSelectHTML`, `#pageNumbers`): the `ސަފްހާ:` label plus the total/current page input. **No percentage — do not add one here.** The input is typing‑only: native number spinners are hidden (`.page-strip-sel`), arrow keys don't step it (keydown `preventDefault`), and `updatePagination` **never rebuilds `#pageNumbers` while the input is focused** — rebuilding would destroy focus and wipe the typed digits (focusing the box can itself trigger a scroll → `updatePagination`). Enter/blur commits via the `change` handler → `goTo`. The reader's ←/→ navigation is RTL: **left = next row, right = previous row** (do not "fix" it back to LTR).
- **Scroll pill** (bottom‑center, `#scrollCounter`, rendered in the scroll handler): `total / current` plus the muted `sc-pct` reading percentage (e.g. `27%`), using the same `pct` variable the milestone toasts use. **This is where the percentage lives** — a user‑explicit preference. Both variants (standard and the Quran surah : ayah form) carry the `sc-pct` span.

### Focus mode

Toggled via the green ↕/▼ button in the topBar or `Alt+Z`. Shared across both pages via `window.setFocus(on)` in common.js; persisted to `localStorage.focus`. Dispatches a `focuschange` CustomEvent for page‑specific layout recalculations.

**Reader:** Collapses `#collapsibleReaderPanel` smoothly via CSS Grid `grid-template-rows: 1fr → 0fr` transition. Chrome padding and border also hidden. Only the topBar and reader content remain.

**Dashboard:** Collapses `#collapsibleDashboardPanel` (tags + functions) via `max-height` transition. The search bar stays visible. The book grid remains fully interactive.

### Themes

Three themes via `[data-theme]` attribute: `light` (default), `dark`, `sepia`. All colors are CSS custom properties. Selectable from settings modal. Persisted, applied before paint via blocking `<script>` in `<head>`.

### Settings modal

Opened from the sidebar. Cards for Appearance (theme dropdown, content width dropdown), Font (size ±, family dropdown: Hadithmv/System — always English), Language (select dropdown). The ↺ Reset button in the modal header is a **confirmed factory reset** — it clears settings, pins, and history (message: "Reset all settings, pins, and history? This cannot be undone."). The dashboard and reader resets are view-only and preserve pins/history. Modal has `overscroll-behavior: contain` and body scroll is locked when open to prevent background scroll bleed.

### Font scaling

Font size is controlled via four CSS custom properties on `<html>`:

| Variable | Default | Controls |
|---|---|---|
| `--reader-font-size` | `1.25rem` | Reader content text |
| `--reader-font-size-mobile` | `0.88 × reader` | Reader content on mobile |
| `--panel-font-size` | `0.68 × reader` | All panel UI text (buttons, inputs, labels) |
| `--panel-font-size-mobile` | `0.9 × panel` | Panel UI + dashboard on mobile |

All panel buttons and inputs use `em`-based `height`, `padding`, and `line-height` so they scale proportionally with `--panel-font-size`. The Settings → Font ± control sets all four variables. Reset restores defaults.

### Persisted state

Settings and small state live in `localStorage` (table below). **IndexedDB** is used for exactly two things, both validated against a content-hash version stamp: the **on‑device book cache** in `csv.js` (`fetchBookCSVCached`) — parsed book CSVs stored keyed by `bookCode`, validated against the registry `version` hash — and the **search index cache** in `library-search-engine.js` (the separate `hadithmvSearch` DB, keyed by a fixed id, validated against the index's own `meta.version` hash). Cache hit + version match → read locally with zero download/parse; mismatch or empty version → fetch, parse, refresh the cache. Every failure path degrades to a plain fetch. Only book CSVs and the search index are cached (registries are small and change often). No sessionStorage or cookies. In‑memory caches (`bookNamesCache`, `tagDefinitionsCache`) are populated at startup and never written to disk.

| Key | Where used | Shape | Notes |
|-----|-----------|-------|-------|
| `theme` | `common.js` | `"dark"` / `"sepia"` / `""` (light) | Applied before paint to avoid flash |
| `contentWidth` | `common.js` | CSS value (`"800px"`, `"none"`, etc.) | Content area max‑width |
| `fontSize` | `common.js` | CSS value like `"1.25rem"` | Reader font size |
| `fontSystem` | `common.js` | `"1"` or `"0"` | `"1"` = system font, `"0"` = Hadithmv |
| `lang` | `i18n.js` | `"dv"` / `"en"` / `"ar"` | UI language |
| `focus` | `common.js` | `"1"` or `"0"` | Focus mode (shared across reader and dashboard) |

| `reader:hideTashkeel` | `reader.js` | boolean (JSON) | Tashkeel visibility |
| `reader:hiddenColumns:{bookCode}` | `reader.js` | `[int, ...]` (JSON) | Indices of hidden columns — **keyed per book** (a global key leaked hidden indices across books; see the `-HDN` convention) |
| `reader:searchHistory` | `search-utils.js` | `[string, ...]` (JSON) | Recent search queries (max 20) |
| `pinnedBooks` | `pins-history.js` | `[{bookCode, row, addedAt}, ...]` (JSON) | Pinned books (max 10). **One entry per book.** The reader's 📌 button toggles (pin / unpin); while pinned, the entry's row auto‑updates as the user reads (the 2 s scroll debounce calls `addPin` on the pinned book — see the dashboard section). Any future multi‑pin feature must change this model |
| `readHistory` | `pins-history.js` | `[{bookCode, row, ts}, ...]` (JSON) | Reading history (max 10) |
| `reader:quranShowAyahNum` | `reader.js` | boolean (JSON) | Show ayah number decoration |
| `reader:quranShowBraces` | `reader.js` | boolean (JSON) | Show Quranic braces decoration |
| `reader:quranShowNumBrackets` | `reader.js` | boolean (JSON) | Brackets around number only (not ayah text) |

The settings reset button clears all of the above and resets language to Dhivehi. Keys prefixed with `reader:` are scoped to the reader page and are not touched by dashboard-level operations. Dashboard keys (`pinnedBooks`, `readHistory`) are separate — the prefix convention prevents accidental cross-contamination.

> **When adding new persisted state**, add a row to this table, add the key to `window.LS_KEYS` in common.js, and use a `reader:` prefix for reader‑specific keys. Prefer `window.LS_KEYS` over raw string literals for any key listed here (some older call sites still use the raw strings directly). This is the single reference for porting to desktop, mobile, or other platforms.

### Internationalisation

`js/i18n.js` exports `t(key)`, `setLanguage(lang)`, `initI18n()`. Static HTML uses `data-i18n` attributes; dynamic text calls `t()`. A `languagechange` CustomEvent triggers re‑render. Language persisted to `localStorage`.

### Directionality (RTL / LTR)

Two independent direction systems coexist, and confusing them is the root of most RTL bugs:

1. **UI chrome** — follows the selected UI language (dv/ar → RTL, en → LTR). `<html>` carries no `dir`; direction is set per element, so the default is LTR and every RTL element is an explicit decision.
2. **Content fields** — each field has its own language regardless of the UI language (book titles, reader rows). The reader already sets `dir` per field; `.title-*` / `.lib-title-*` rules carry their own `direction`.

Chrome elements follow this decision table:

| Situation                                                   | Mechanism                                                    |
| ----------------------------------------------------------- | ------------------------------------------------------------ |
| Layout container holding RTL chrome (input, chips rows)     | `direction: rtl` on the container                            |
| Single chrome line, language-dependent (summary, count)     | `dir="auto"`; pin `text-align` when position matters         |
| Fixed-language content field (ar/dv/en titles, reader rows) | explicit per-field direction (already the reader's pattern)  |
| All-Thaana or all-Arabic text                               | nothing needed — strong-RTL renders correctly in any context |

Why this is a silent trap: Thaana and Arabic are strong-RTL scripts, so a single word or phrase renders with correct glyphs even inside an LTR line — a wrong base direction shows up only as a reversed reading order (the eye enters at the right edge) or a mis-anchored line, neither visible at a glance. `dir="auto"` resolves the base direction from the first strong character, which is why it is the default for single-line chrome text that mixes scripts with digits (e.g. `libResultSummary`). Note that `text-align: start` follows the resolved direction — pin `text-align` explicitly wherever the line's position must be stable. `applyDocumentLang` sets both `lang` and `data-lang` on `<html>`, enabling `:lang()` selectors if generic CSS direction rules are ever needed.

### Keyboard

| Key             | Context                | Action                                 |
| --------------- | ---------------------- | -------------------------------------- |
| `←` / `→`       | Reader                 | Next / previous row (RTL: content flows right→left) |
| Swipe right | Reader (mobile)     | Next row |
| Swipe left  | Reader (mobile)     | Previous row |
| `Home` / `End`  | Reader                 | First / last row                       |
| `↑` / `↓`       | Search focused         | Navigate results                       |
| `Enter`         | Search focused         | Select result                          |
| `/` or `Ctrl+f` | Anywhere               | Focus search bar                       |
| `Ctrl+Shift+f`  | Anywhere               | Open advanced search                   |
| `Alt+z`         | Reader                 | Toggle focus mode (same as ↕/▼ button) |
| `Alt+t`         | Reader                 | Toggle tashkeel                        |
| `Alt+v`         | Reader                 | Cycle view mode (Card → Table → Parallel → Card) |
| `Alt+p`         | Reader                 | Toggle bookmark (pin)                  |
| `Alt+s`         | Reader                 | Share link                             |
| `Alt+e`         | Reader                 | Open export dropdown                   |
| `Ctrl+,`        | Anywhere               | Open settings                          |
| `Ctrl+b`        | Anywhere               | Back to book list                      |
| `Escape`        | Sidebar/modal/dropdown | Close                                  |
| `Escape`        | Dashboard search       | Clear search & blur                    |
| `z`             | Dashboard              | Toggle focus mode                      |
| `p`             | Dashboard              | Open pins modal                        |
| `h`             | Dashboard              | Open history modal                     |

Dashboard keyboard shortcuts only fire when the dashboard is visible. Tag chips, badges, book cards, table rows, toolbar buttons, and page titles all carry `title` tooltips describing their action or category.

## Data shape

### 02-registry-bookMeta.csv

| Column     | Description                                         |
| ---------- | --------------------------------------------------- |
| `bookCode` | Unique identifier, doubles as the data CSV filename. Format: `PRIMARY-bookName[-SUFFIX]` — the **primary tag** is the first segment, registered in `01-registry-bookTags.csv` (a book may have no primary). `-HDN` / `-DSC` are suffix flags, not tags |
| `titleAR`  | Arabic title                                        |
| `titleDV`  | Dhivehi title                                       |
| `titleEN`  | English title (used for `<title>` and page heading) |
| `tags`     | **Secondary tags** — comma‑separated tag codes from `01-registry-bookTags.csv` (e.g. `DFK,QRUL`). The primary tag lives in the code prefix; everything else goes in this column |
| `excludeColumns` | **Optional** — comma‑separated header names to skip in the cross‑book index (case‑insensitive). `-HDN` and row‑number columns are always skipped regardless. Empty = all columns indexed. Build-only |
| `version`  | **Content hash** (first 12 hex chars of SHA‑256) of the book CSV — filled by `03-update-bookRegistry.ps1` on every run. The reader validates its on‑device IndexedDB cache against it; empty = cache bypassed |

**`excludeColumns` magic value:** `ENTIRE-BOOK` (case‑insensitive) skips the whole book from the cross‑book index — it stays fully visible in the dashboard and reader but is never searchable, and its postings are not emitted at all (shrinking the index). Other names in the same cell are ignored; `ENTIRE-BOOK` wins.

### 01-registry-bookTags.csv

| Column  | Description                                              |
| ------- | -------------------------------------------------------- |
| `code`  | Tag code — used as a bookCode primary prefix OR a value in the `tags` column |
| `label` | Display name for the badge                               |

Tags are auto‑assigned a colour using golden‑ratio HSL hue rotation (`n × 137.5°`). A `<style>` tag is injected at load time with enough slots for all current tags plus headroom. Each slot has light/sepia and dark‑mode variants. Adding a new tag is just `code,label` — no colour‑picking, no limit on tag count. The PIN entry exists only to document the pin chip colour; it uses hardcoded red and is not part of the rotation.

### data/content/{bookCode}.csv

First row is always the header row. For a representative sample, see `AQD-nawaqidulIslam.csv` — a small file covering the common column patterns (`headAR`, `bodyAR`, `headDV`, `bodyDV`, `foot`). If column 0 is `#` or blank it's treated as row numbers (hidden from content, shown as `#N` labels in the card view). Otherwise column 0 is regular content. Column headers ending with `-HDN` (case-insensitive) are hidden by default — the reader starts with those columns toggled off (they can still be turned back on via the column dropdown). Consecutive blank lines within a cell are collapsed to a single line break; both `\r\n` (Windows) and `\n` (Unix) line endings are normalised before collapsing.

## Tag system

Every book has a **primary tag** (the first registered prefix segment of its `bookCode`) and zero or more **secondary tags** (the `tags` column in `02-registry-bookMeta.csv`, comma‑separated codes). `extractTags(bookCode, entry)` reads both: the primary from the code, the secondaries from the registry row's `tags` column. Tags drive the dashboard chips, counts, `?tags=` filter, and badges on cards and the reader header. Each code is looked up in `01-registry-bookTags.csv`; unknown codes are silently ignored.

| bookCode                    | `tags` column | Tags (primary + secondary) | Book Name       |
| --------------------------- | ------------- | -------------------------- | --------------- |
| `AQD-nawaqidulIslam`        | *(empty)*     | Aqidah                     | nawaqidulIslam  |
| `HDT-muwattaMalik`          | `DRFT`        | Hadith, ⚠️ Draft           | muwattaMalik    |
| `AQD-sharhuSunnahBarbahari` | `DFK`         | Aqidah, DFK                | sharhuSunnahBarbahari |
| `RDF-asmaullahilHusna`      | `AQD`         | Radheef, Aqidah            | asmaullahilHusna |

Suffix flags are pure app conventions — `-HDN` hides the book from the dashboard, `-DSC` displays rows in reverse order. At the column level, any CSV header ending with `-HDN` (e.g. `notes-HDN`) starts hidden in the reader.

**Naming conventions:**

- `DRFT-` prefix → book gets a ⚠️ Draft badge, still visible on dashboard
- `-HDN` suffix → book hidden from dashboard
- `-DSC` suffix → rows displayed in reverse order
- `KNSH-` prefix → first line of `body*` columns styled as a heading
- `RDF-` prefix → reader defaults to table view mode

## Data model at a glance

```text
02-registry-bookMeta.csv         01-registry-bookTags.csv
┌─────────────────────────┐       ┌──────────────────┐
│ bookCode, titleDV/AR/EN │       │ code, label      │
│ Defines every book      │       │ e.g. AQD→Aqidah  │
└──────────┬──────────────┘       └────────┬─────────┘
           │                              │
           └──────────┬───────────────────┘
                      │
              book-data.js / pins-history.js
                      │
          ┌───────────┴───────────┐
          │                       │
     dashboard.js (index)   Reader (reader.html)
     book grid / table      ?book=CODE → loads CSV
          │                       │
          │              ┌────────┴────────┐
          │         Standard book     Quran book (QRN-)
          │         {bookCode}.csv    QRN-DATA-baseFile-*.csv
          │                          + QRN-{translation}.csv
          │                          (merged by row index)
          │
    localStorage
    ├── pinnedBooks, readHistory  (pins-history.js)
    ├── reader:searchHistory      (search-utils.js)
    ├── reader:hiddenColumns:{bookCode} (reader.js)
    │   reader:hideTashkeel, etc.
    ├── theme, fontSize, lang,    (common.js)
    │   contentWidth, focus
    └── window.LS_KEYS            (canonical key registry)
```

## Quran data model

Books with the `QRN-` prefix (excluding `QRN-DATA-` source files) trigger Quran mode in the reader. Multiple CSV files are merged by row index — row N of every CSV corresponds to ayah N of the Quran.

### Data files

| File | Role | Columns |
|------|------|---------|
| `QRN-DATA-baseFile-1-juzNo_surahNo_ayahNo_basmalah_ayahImlai.csv` | Base data (always loaded) | `juzNo-HDN, surahNo-HDN, ayahNo-HDN, basmalah, ayahImlai` |
| `QRN-DATA-baseFile-2-ayahUthmani.csv` | Uthmani script (on demand) | `ayahUthmani` |
| `04-registry-quranSurahs.csv` | Surah metadata | `surahNo, nameAR, nameDV, nameEN, ayahCount` |
| `05-registry-quranColumns.csv` | Column registry | `sourceBook, sourceCol, displayDV, displayEN` |
| `QRN-{name}.csv` | Book-specific columns | Varies per book |

### Merging

Base data columns are always present. Book-specific columns are merged by row index. The `05-registry-quranColumns.csv` registry declares all available columns across all QRN books — the content modal uses this to list toggleable columns, including those from other books (loaded on demand via `loadAndInsertColumn`). Preset buttons (Main/All/Arabic/Reset) batch-toggle columns; Main and Arabic are driven by the `QRN_PRESET_MAIN` and `QRN_PRESET_ARABIC` arrays in `quran-data.js`.

```text
QRN-DATA-baseFile-1 (6,236 rows)         QRN-bakurube.csv (6,236 rows)
┌────────────┬─────────────┬───────────┐ ┌──────────────────────────────┐
│ juzNo-HDN  │ surahNo-HDN │ ayahImlai │ │ wordAR        wordDV         │
│ ayahNo-HDN │ basmalah    │ …         │ │ …             …             │
└────────────┴─────────────┴───────────┘ └──────────────────────────────┘
      └────────── merge by row index (mergeQuranData) ──────────┘
┌────────────┬─────────────┬───────────┬──────────────────────────────┐
│ 5 base columns (fixed)   │ ayahImlai │ wordAR        wordDV         │  ← reader columns
└────────────┴─────────────┴───────────┴──────────────────────────────┘
```

Every translation CSV must have the same number of rows, in the same ayah order, as the base file — row *N* of the translation merges into row *N* of the reader.

**Column loading.** `loadQuranBookCSV()` keeps a one‑entry parse cache (most recent book only): each translation CSV is fetched and parsed at most once per session, so inserting several columns from the same book — or a preset hitting multiple books — does not re‑download or re‑parse the whole file per column. The registry groups each book's columns together, so consecutive inserts hit the cache.

**Column ordering.** The content modal (unified `createModal` layer) shows a reorderable table — checkboxes and ▲▼ buttons per row, presets fixed above a scrollable list. `_colOrder` (registry order by default) is the single source of truth for reader column order: `applyColumnOrder()` (pure, in `quran-data.js`) rebuilds header, rows, the norm cache, and hidden indices from it, so loaded columns appear in the list's order rather than insertion order. Base columns are fixed first; moving a loaded column reorders the reader immediately. The `-1` marker in the loaded map tags a pending insert until the rebuild assigns its real index.

```text
_colOrder (all available columns, list order)
   │  keep only loaded keys (map value ≥ 0; -1 = pending insert w/ stashed values)
   ▼
ordered loaded keys
   │  applyColumnOrder({headerRow, allData, normAllData, loadedMap, hiddenColumns, order, pending})
   ▼
fresh header, rows, norm rows, hidden indices
   │  applied in place — reader.js shares the same array references
   ▼
reader shows columns in list order
```

**Why the base columns cannot move — hardcoded indices.** Surah/ayah numbers are read at fixed positions `row[1]`/`row[2]` by index, NOT by header name, in 8 places: `reader.js` (clipboard format, pin labels, scroll‑sync surah tracking) and `quran-ui.js` (`findAyahRowInFiltered`, `applyQuranSurahFilter`). Reordering those columns would silently break surah navigation, ayah jumps, copy references, and pin labels. Do NOT "improve" these to dynamic indices as part of a refactor — it needs coordinated changes across all 8 sites plus `findQuranColIndices` cache invalidation.

**Adding a new Quran translation (walkthrough):**

1. Create `data/content/{bookCode}.csv` with a header row and **one row per ayah, in the same order and count as `QRN-DATA-baseFile-1-…` (6,236 rows)** — columns merge by row index (`mergeQuranData`). Name columns with a language suffix (`*AR`, `*DV`); add `-HDN` to start hidden.
2. Register each column in `data/05-registry-quranColumns.csv` — one row per column (`sourceBook,sourceCol,displayDV,displayEN`), consecutive rows per book. The content modal lists them automatically.
3. Optionally add the book to `QRN_PRESET_MAIN` / `QRN_PRESET_ARABIC` in `js/quran-data.js` so the Main/Arabic preset buttons include it.
4. Register the book in `02-registry-bookMeta.csv` — or just run `data/03-update-bookRegistry.ps1`, which adds the unregistered CSV as a row with empty titles (all three titles are hand-authored), recomputes each book's version hash from its content CSV, and sorts both registries. Rows are rewritten verbatim — only the trailing version field is replaced — so quoted multi-value cells (tags, `excludeColumns`) survive untouched.

### Ayah decoration

Columns `ayahImlai` and `ayahUthmani` are rendered with configurable decoration:

| Braces | Number | Num Brackets | Output |
|--------|--------|-------------|--------|
| ☑ | ☑ | ☐ | `﴿text ١﴾` |
| ☑ | ☑ | ☑ | `text ﴿١﴾` |
| ☑ | ☐ | — | `﴿text﴾` |
| ☐ | ☑ | — | `text ١` |
| ☐ | ☐ | — | `text` |

## Quran reader

QRN‑specific UI — everything the reader adds for Quran books. Pure data logic lives in "Quran data model" above; the module split mirrors the code (`quran-data.js` pure vs `quran-ui.js` DOM).

### Quran navigation

A navigation row (`readerPanelQuran`) appears inside the collapsible reader panel for QRN books:

  - **Surah selector**: button showing `{N} {nameAR}`, click opens a searchable overlay of all 114 surahs
  - **Ayah selector**: number input with prev/next arrows and a dropdown list on click/focus
  - **Juz selector**: number input with prev/next arrows and a dropdown list on click/focus (1–30)
  - **Content modal**: checkboxes + ▲▼ reorder for all columns from the registry; changes apply immediately (see "Column ordering" under Merging)
  - **Display dropdown** (`﴿١﴾ ▾`): three checkboxes controlling ayah decoration (braces, ayah number, number-position)
  - `﴿ ﴾` — wraps ayah in Quranic braces
  - `١٢٣` — appends ayah number in Arabic numerals
  - `﴿١٢٣﴾` — number-only brackets: `text ﴿١﴾` instead of `﴿text ١﴾`

Navigation syncs on scroll: the visible ayah's surah, ayah, and juz update automatically. Changing any selector updates the others (e.g. changing surah recalculates juz).

### Clipboard

Quran clipboard format: no book header line. Decorated ayah text, `[surahName surahNo : ayahNo]` reference, then columns grouped by source book — each book gets one label (from `02-registry-bookMeta.csv`) above its first column, no per-column headings.

(Table‑mode performance is documented under Reader UI → View modes → **Performance** — it is shared with the reader table, not Quran‑specific.)

## Development conventions

### UI & theming

**No external dependencies.** Everything is hand‑rolled — no npm, no CDN, no frameworks. CSS variables for theming, vanilla JS modules, a custom CSV parser (~1 KB), a custom ZIP/XLSX writer, and a custom EPUB writer. Keep it that way.

**RTL‑first.** The default text direction is `rtl` (Arabic / Dhivehi). Only UI chrome labels and English‑only text (tooltips, errors) appear LTR. New elements default to `direction: rtl` unless they are explicitly English‑only.

**CSS variables.** A value earns a var when (1) it appears in more than one place, (2) the places must stay in sync, and (3) it changes as a group. Font stacks, radius tiers, and control heights look like constants, but sync‑by‑copy drifts — six spellings of one font stack once drifted into the stylesheets. So when a value family passes the test, define it once in `:root` and use `var(--name, <canonical>)` at every site; a bare literal then becomes a grep‑checkable violation. Never hardcode a colour: every colour comes from a CSS custom property defined in `:root` (light), `[data-theme="sepia"]`, and `[data-theme="dark"]`. If you add a new colour variable, you must define it in all three theme blocks — light, sepia, and dark. New components must be tested in all three themes to confirm they are readable and look correct. The variable naming pattern is `--color-<role>` (e.g. `--color-text`, `--color-border`, `--color-nav-btn-bg`).

Two more var families exist purely to keep *groups* in sync; their tokens, not the values, are the convention unit. **Z-index ladder:** every `z-index` in the stylesheets is one of the `--z-*` tokens defined in `:root` (common.css) — `--z-under` (-1, background art) through `--z-celebrate` (9998, effects), with the full ladder in between (arrow 2, base 5, sticky 6, table head 10, toolbar 50, dropdown 60, pill 100, topbar 101, sidebar overlay 199, sidebar/toast 200, modal 300). A bare `z-index` literal is a grep-checkable violation. To renumber a layer, change its token in `:root` — never a single site. **Transition durations:** every `transition` duration is one of the `--t-*` tier tokens defined in `:root` — `--t-fast` (0.1s, compact-item hovers), `--t-hover` (0.15s, standard control hovers), `--t-pop` (0.2s, toast/modal/card-lift), `--t-drawer` (0.25s, sidebar), `--t-panel` (0.3s, layout motion and theme crossfades), `--t-slow` (0.5s, progress fill). Durations change together in `:root`; the one shared easing — the expand/collapse curve `--ease-panel: cubic-bezier(0.4, 0, 0.2, 1)` — is a token too, and plain `ease` stays literal at use sites.

Besides the role palette there are three **semantic accent families**, each defined in all three themes with per-theme values: `--color-accent-*` (active menu button, dropdown checkmark — blue), `--color-focus-*` (focus-mode buttons — green), `--color-danger-*` (destructive buttons, pins badge/chips, continue bar, error text — red; `--color-error-*` aliases this family). Their hex values exist only inside the theme blocks — a component that needs an accent colour references the family vars with per-site fallbacks (`var(--color-danger-text, #dc2626)`), never a bare hex. The copy-toast chip uses `--color-toast-*` (fixed dark in light/sepia, inverted in dark). Shadows and page chrome are also vars: `--shadow-card`/`--shadow-card-hover` hold the card/result shadow shapes (their colours stay per-theme `--color-shadow-*`), and the dashboard/library wrapper layout uses `--page-margin`/`--page-padding` with `-mobile` variants. Every modal/selector panel shares `--shadow-modal` (shape in `:root`, colour per theme `--color-shadow-modal`, stronger in dark mode), and modal backdrops use `--color-scrim` (per theme).

**Control sizing, spacing & radius.** Every boxed control — search inputs, buttons, selects, chips, badges, and the square icon buttons — is `var(--control-height, 35px)` tall at every breakpoint, with `line-height: var(--control-line-height, 33px)` (height minus the 2px of 1px borders; controls are border-box). Controls in one row sit `var(--control-gap, 6px)` apart; rows and panels are separated by `var(--section-gap, 10px)`. Corners come from four radius tiers defined in `:root`: `--radius-sm` (6px — buttons, selects), `--radius-md` (8px — inputs, chips, badges, square icon buttons, dropdown menus), `--radius-lg` (12px — cards, modals), `--radius-pill` (20px — the scroll-position toast). Panel fonts use `--panel-font-size` (0.85rem, `--panel-font-size-mobile` 0.78rem). All of these are defined once in `:root` (common.css) — change the standard there, never at use sites. Menu items, table cells, grids, and the mark/skeleton/scrollbar-thumb radii (2–5px) are deliberately outside the scale. Card surfaces — dashboard book cards and library search results — share one padding: `--card-padding` (24px) with a `--card-padding-mobile` (16px) variant.

**Responsive.** Single breakpoint at `max-width: 600px`. Mobile gets reduced padding, smaller font sizes, and larger tap targets. The breakpoint is a sync pair: the CSS `@media (max-width: 600px)` literals must match `window.MOBILE_BP` (600, defined in common.js), which the JS uses as `window.innerWidth > window.MOBILE_BP` for desktop-only behaviours. Custom properties cannot be used in media conditions, so the two must match by convention — when one changes, change both. The reader font size is user‑adjustable via the settings modal and stored in `localStorage`.

**Font.** A single merged WOFF2 font (`font/merged-300.woff2`) covers Arabic, Thaana, and Latin glyphs. `font-family` stacks always list `"Hadithmv"` first, then platform fallbacks. Never load external fonts. Each family is a `--font-*` var in `:root` (common.css) — use sites are `var(--font-*, <canonical>)`, and the only literal `font-family` in the stylesheets is the `@font-face` name. Families: `--font-mixed` `"Hadithmv", "Faruma", system-ui, -apple-system, sans-serif` (any-language controls); `--font-latin` `system-ui, -apple-system, sans-serif` (Latin-only chrome); `--font-arabic` `"Hadithmv", "Traditional Arabic", "Scheherazade New", serif` (Arabic-only content); `--font-arabic-thaana` `"Hadithmv", "Traditional Arabic", "Scheherazade New", "Faruma", serif` (mixed Arabic/Thaana content); `--font-thaana` `"Hadithmv", "Faruma", "MV Boli", sans-serif` (Dhivehi titles); `--font-mono` `"Consolas", "DejaVu Sans Mono", "Courier New", monospace`. (export.js / export-epub.js embed literal stacks in generated SVG/EPUB documents — standalone files, no vars there.) Title lines: Arabic and Dhivehi share one size on every surface (cards and search results) — `calc(var(--panel-font-size[-mobile]) * var(--title-scale))`, `--title-scale: 1.2` in `:root` — while English titles stay at base; hierarchy is carried by size tier, weight, and colour. Title lines sit `--title-gap` (4px) apart, with `--title-gap-caption` (2× the base gap) before the English caption; on cards the whole title block sits at the top, with the space below coming from the card's padding.

### Horizontal scrolling & RTL

**There is NO root `dir="rtl"`.** Both pages are `<html lang="en">` with no `dir` attribute — every RTL layout comes from local `dir="rtl"` attributes on individual elements. Nothing inherits RTL, so any new element that needs it must set its own `dir`. In particular, `<input type="number">` follows the input's own direction: without an explicit `dir="rtl"` it behaves LTR (arrow keys step the wrong way) — see the pagination-strip note under "Position readouts".

The reader uses RTL (`direction: rtl`) throughout. This affects horizontal scrolling in non‑obvious ways:

**RTL scroll conventions differ by browser:**

- Chrome: `scrollLeft ∈ [0, max]` — the **start** (rightmost) sits at `max`, the **end** (leftmost) at `0`; scrolling toward the end *decreases* it
- Firefox: `scrollLeft ∈ [-max, 0]` — the **start** (rightmost) sits at `0`, the **end** (leftmost) at `-max`; scrolling toward the end *decreases* it
- **Both engines: scrolling toward the end always DECREASES the signed `scrollLeft`; toward the start INCREASES it.** Always use `Math.abs(scrollLeft)` for position checks, and always test scroll behavior in both browsers.

**RTL start/end terminology:**
- **Start** = beginning of content = right side in RTL
- **End** = later content = left side in RTL
- `scroll-arrow-start` (►) scrolls toward start (right). `scroll-arrow-end` (◄) scrolls toward end (left).

**`.h-scroll-wrap` pattern** (used for toolbar, nav, quranNav):
```
.h-scroll-wrap (display:flex, position:relative, padding:0 30px)
  ├── button.scroll-arrow.scroll-arrow-start (►)  — absolute, left:2px
  ├── .readerPanel-row   — flex:1, min-width:0, overflow-x:auto, hidden scrollbar
  └── button.scroll-arrow.scroll-arrow-end (◄)    — absolute, right:2px
```
- Arrows sit in the padding area and are absolutely positioned.
- The scrollable row is constrained to the content area by `flex:1; min-width:0`.
- `overflow:hidden` on the wrap clips content to the content area — row content CANNOT bleed into the arrow padding.
- DO NOT wrap a hidden (`display:none`) element — it has 0 dimensions and breaks layout. Wrap only after the element is visible.
- Click handlers: start arrow (►) → `scrollLeft += step` (toward start/right). End arrow (◄) → `scrollLeft -= step` (toward end/left). Wheel‑down also scrolls toward the end: `scrollLeft -= deltaY`.
- **Don't re‑derive the signs — copy the reader's proven wiring**: `rdfScrollBack` (▶) → `+COL_STEP`, `rdfScrollFwd` (◀) → `-COL_STEP` in `reader.js`; the dashboard copy lives in `dashboard.js` (the sort row's arrows). The dashboard's `updateArrows()` uses `Math.abs(scrollLeft)` for the auto‑hide checks.
- **Exception — the reader TABLE's wheel is NOT comparable**: `tableWrap`'s wheel handler does `topScroll.scrollLeft += amount` on the *mirrored top scrollbar*, and the table follows via `translateX` from the absolute fraction (`syncTableTransform`, `Math.abs`). Different mechanism, opposite sign — do not "fix" it to match the rule above.
- Visibility: start arrow hidden when `abs(scrollLeft) < 1`. End arrow hidden when `abs(scrollLeft) > maxScroll - 2`.

**Sticky‑arrow pattern** (alternative, used for quranNav):
- Arrows are `position:sticky` children inside the scrollable flex row.
- First child (start arrow): `right:0`, sticks to right edge. Last child (end arrow): `left:0`, sticks to left edge.
- Need `align-self:stretch` + solid `background` to create a full‑height cutoff barrier.
- Need horizontal `padding` to widen the barrier beyond just the arrow symbol.

**When adding a new horizontally‑scrollable row:**
1. If it exists at page load and is visible → use `.h-scroll-wrap` pattern (add to the inline script's `querySelectorAll`).
2. If it's created or shown dynamically → use the sticky‑arrow pattern, or wrap it in `.h-scroll-wrap` AFTER it becomes visible.
3. Never set `wrap.style.padding = "0"` — the padding is always needed for arrow placement.
4. Never create wrapper divs inside `.readerPanel-inner` at page load for hidden elements.

### HTML & DOM

**IDs.** Element IDs use camelCase — e.g. `btnResetReader`, `searchInput`, `readerContent`. No kebab‑case or snake_case.

**Tooltips.** Every `<button>`, `<a>`, and interactive element carries a `title` tooltip describing its action. If the element has a keyboard shortcut, the tooltip includes the key in parentheses — e.g. `title="Toggle focus mode (Alt+Z)"`. Tooltips are **always in English** and never translated.

**Static text.** Any visible string in static HTML uses a `data-i18n` attribute. Dynamic text uses `t("key")`. Never hardcode a Dhivehi, Arabic, or English label directly in HTML or JS — use the i18n layer.

### JavaScript

**Module pattern.** All JS files are ES modules (`<script type="module">`). Heavy modules (`export-epub.js`, `export-xlsx.js`, `export-zip.js`) use dynamic `import()` — they are only fetched when the user triggers an export, keeping the initial bundle small.

**Variable style.** `var` is used for function‑scoped variables throughout the codebase. `let` and `const` appear only in newer, self‑contained additions.

**Closure state (reader.js).** The reader's ~1 800‑line closure centralises shared mutable state in a `STATE` object at the top. Convenience aliases (`var filteredData = STATE.filteredData`) are read‑only — mutations MUST write back: `STATE.filteredData = filteredData`. This pattern makes shared state visible at a glance without rewriting every reference to `STATE.*`. The ctx‑object pattern used by `export.js` and `quran-ui.js` is the same idea applied to extracted modules.

**Window globals.** `window.*` functions used by BOTH pages live in `common.js` (`setFocus`, `showToast`, `copyToClipboard`, etc.). Reader‑only helpers (`openDropdown`, `closeAllDropdowns`, `registerDropdown`) stay in `reader.js`. Pins/history helpers (`openPinsModal`, `openHistoryModal`) live in `pins-history.js`. Rule: before adding `window.X = …`, ask *does it serve both pages?* YES → common.js, NO → owning module. A comment in `common.js:1‑20` documents the full inventory.

**Explicit re‑exports over `export *`.** Barrel modules (quran-ui.js) use explicit named re‑exports instead of `export *`. Adding a function to the source module requires adding it to the re‑export list — silent name collisions are impossible.

**Naming conventions.**

| Scope | Convention | Examples |
|---|---|---|
| Files | kebab-case | `quran-data.js`, `pins-history.js`, `reader.js` |
| Functions | camelCase | `renderRowHTML`, `buildClipboardText` |
| Constants (module‑level) | UPPER_SNAKE | `MAX_PINS`, `ROWS_PER_CHUNK`, `DEFAULT_FONT_SIZE` |
| Private module‑level state | `_camelCase` | `_bookNamesCache`, `_loadedColMap`, `_searchHistory`, `_lastBookNames` |
| DOM element IDs | camelCase | `readerContent`, `btnExport`, `dashboardPanelSearch` |
| CSS classes | kebab-case + namespace | `reader-field-matn`, `dash-table`, `quran-nav-btn` |
| Shared CSS utilities | `dd-` prefix | `.dd-item`, `.dd-menu`, `.dd-check` (dropdowns); `.dd-table`, `.dd-row`, `.dd-col-*` (pins/history modal table, scoped under `.pins-history-body`) |
| Custom events | single lowercase word | `readerReset`, `focuschange`, `languagechange` |
| LocalStorage keys | `reader:` prefix for reader | `reader:hiddenColumns:{bookCode}`, `reader:searchHistory` |

**New exports.** Each export format is an `else if (fmt === "...")` block in the export click handler in `js/export.js`. Follow the existing pattern: build a string or Blob, call `downloadFile()` or open a new window. Exports that produce data or table formats (CSV, TSV, Excel, JSON, HTML Table) must include the CSV header row as the first row / `<thead>`. Rich‑text exports (TXT, MD, PDF, Word, EPUB, HTML reader view) use the formatted rendering path and should not include a raw header row.

### i18n

**Key naming.** i18n keys are camelCase and describe the element or purpose — e.g. `btnExportText`, `tagAQD`, `pinsEmpty`. Add keys for all three languages (`dv`, `en`, `ar`).

**Errors and messages.** All error messages, status text, and alerts are in **English only** — they are not run through `t()` or `data-i18n`. This keeps errors readable regardless of the user's chosen UI language.

### Data & CSV

**Book code format.** `PRIMARY-bookName[-SUFFIX]`. The FIRST segment is the primary tag, matched against `01-registry-bookTags.csv`; after stripping it and the suffix flags, the remaining segment is the book name. Secondary tags live in the `tags` column of `02-registry-bookMeta.csv`, NOT in the code.

```text
"HDT-muwattaMalik"        +  registry: bookCode,titleAR,titleDV,titleEN,tags
  │         │                                       ... ,HDT-muwattaMalik,...,...,...,DRFT
  │         └─ Book name (after stripping primary tag & suffix flags)
  └─ Primary tag → "Hadith" badge        tags column → "⚠️ Draft" badge (secondary)

"AQD-aqidatuNawawi-HDN"
  │        │           │
  │        │           └─ Suffix flag: hide from dashboard
  │        └─ Book name
  └─ Primary tag → "Aqidah" badge
```

**CSV column naming.** `*AR` = Arabic text, `*DV` = Dhivehi text. Heading hierarchy: `head` > `kitab` > `bab`. `matn` = main text, `sharh` = commentary, `foot` = footnotes. Column 0 = `#` means row numbers (hidden from content, shown as `#N` labels). These names drive CSS class assignment in the reader — changing a prefix changes its visual treatment.

**File naming.** A book's CSV file must match its `bookCode` exactly (e.g. `AQD-nawaqidulIslam.csv`). Control files in `data/` carry a numeric prefix for curated top-of-folder order: `NN-registry-*` for registries, grouped by domain with stable reference data first — book registries first (`01-` tags, `02-` books), the script that maintains them (`03-update-*`), then the Quran registries (`04-` surahs, `05-` columns), then the global index builder (`06-rebuild-*`) — whose generated output `search-index.json` is deliberately unnumbered (machine-produced, not curated). Every control file is `NN-<verb>-<Entity>`: the entity segment deliberately uses the data model's CamelCase identifiers (`registry-bookTags`, `update-bookRegistry`, `rebuild-searchIndex`) — single-word entities show no case mixing. `QRN-DATA-baseFile-{N}-*` names the Quran content sources. The `-HDN` suffix on CSV headers hides columns by default; the `-HDN` suffix on book codes hides books from the dashboard. For a representative sample CSV, see `AQD-nawaqidulIslam.csv`.

**CSS load order.** In `reader.html`, `reader-quran.css` loads before `reader.css`. This ensures reader.css's mobile `@media` queries win specificity ties (both `0,1,0` → last one wins), so Quran nav items use the same `--panel-font-size-mobile` as all other panel controls.

**Modals.** All modals use the unified layer in `common.js`:

- **API** — `window.openModal(id)`, `window.closeModal(id)`, `window.closeAllModals()`; each overlay ID is registered in `window.MODAL_IDS`. Backdrop click and `.modal-close` are auto‑wired via `wireModal()`; new modals push their ID and wire themselves on creation.
- **Creation** — dynamic modals use `createModal(id, titleId, bodyId, extraClass)` and emit the same `.modal-header` / `.modal-title` / `.modal-close` / `.modal-body` structure as the static modals, so styling stays unified. `window.confirmModal(titleKey, messageKey, confirmKey, onConfirm)` shows a confirm dialog on the same layer (Cancel/Escape/backdrop = no; confirm button = yes, then `onConfirm()` runs).
- **Focus management** (accessibility) — `openModal` moves focus to the modal's first focusable (the ✕ close button) and remembers the trigger; `closeModal` — including the unified Escape handler — restores focus to it; a global Tab handler cycles focus within the topmost open modal so it can't wander behind the overlay. **Every modal must open via `openModal`** (not `classList.add("open")` directly) or it misses focus handling — the sidebar, advanced‑search overlay, and surah selector are separate overlay systems outside this layer.
- **Body scroll** is locked while any modal is open (`body:has(.modal-overlay.open)`).
- **List modals** — the pins/history modal renders its list as a semantic `<table class="dd-table">` (`<thead>`/`<tbody>`, `dd-col-*` classes per column, `table-layout: fixed` column widths) styled in `common.css` — identical on the dashboard and reader pages. The Quran content modal follows the same pattern with its own table.

**Dropdowns.** All dropdowns use shared helpers and shared CSS classes for visual consistency:

*Container:* `.dd-menu` (common.css) — `position: absolute; padding, background, border, border-radius, box-shadow, z-index`. Applied alongside page‑specific positioning (e.g. `.view-mode-dropdown`, `.quran-content-dropdown`).

*Items:* `.dd-item` (common.css) — flex row, `padding: 6px 10px`, `font-size: var(--panel-font-size)`, hover highlight, checkbox/radio accent colour. Used by view‑mode, Quran content, and display‑options dropdowns.

*Helpers:*
- `window.openDropdown(dd, anchorEl, gap)` — closes other dropdowns, positions `dd` below `anchorEl`, shows it. Default gap 4px.
- `window.closeAllDropdowns()` — hides all registered dropdowns.
- `window.registerDropdown(id, dd, anchor)` — wires outside‑click‑to‑close for a dropdown and adds its ID to the shared list.
- `trapWheel(el)` (quran-ui.js) — prevents wheel events on a dropdown from scrolling the horizontal nav row behind it.
- Dropdowns with scrollable lists use `overscroll-behavior: contain` to prevent scroll chaining at boundaries.

### Keyboard shortcuts

Any new button or action that has a keyboard shortcut documents it in the tooltip (see above) and in the [Keyboard](#keyboard) table. Shortcuts are kept discoverable — if you add a shortcut, add the tooltip.

### State

**In‑memory state — who owns what (closures are the hard part to track):**

| State | Lives in | What changes it |
|---|---|---|
| `STATE` (allData, filteredData, viewMode, hiddenColumns, hideTashkeel) | `reader.js` init closure | load, search, column toggles, view mode, tashkeel, reset |
| `normAllData` | `reader.js` closure | built at load; kept in sync by `quran-ui.js` column inserts (via ctx) |
| `_loadedColMap` / `_colOrder` / `_pendingColumnValues` | `quran-ui.js` init closure | content modal checkboxes / ▲▼; `applyColumnOrder()` rebuilds the map |
| `_dashFilter` / `_dashTableMode` | `dashboard.js` module scope | dashboard search / tags / sort / reset / view toggle |
| `_bookNamesCache` / `_tagDefinitionsCache` | `book-data.js` module scope | first load only (null = failed fetch) |
| `_bookCsvCache` (one‑entry) | `quran-data.js` module scope | `loadQuranBookCSV` |
| `_baseDataCache` / `_surahNamesCache` / `_colRegistryCache` | `quran-data.js` module scope | first load only |
| `_indexPromise` | `library-search-engine.js` module scope | first `loadSearchIndex()` call; cleared on failure so retries work |
| `_q` / `_selectedTags` / `_searchTimer` / `_peekCache` | `library-search.js` module scope | `?q=`/`?tags=` state + chip scoping / debounced input / peek cache |
| `quranState` (exported) | `quran-data.js` | nav updates, scroll sync, ayah decoration |
| `_modalLastFocused` | `common.js` module scope | `openModal` / `closeModal` (focus restore) |

**Reset flow.** The settings modal's ↺ Reset is a **confirmed factory reset** (`confirmResetAll` message): on confirm it delegates to `btnResetFont` + `btnResetReader`, clears remaining LS keys, **clears pins and history**, and dispatches `dashboardReset`. Each delegated button handles its own domain — no duplicate reset logic. The dashboard and reader resets stay view-only (pins/history preserved).

**Persisted state.** Any new `localStorage` key must be added to the [Persisted state](#persisted-state) table. This table is the single inventory for porting to desktop/mobile apps — keep it current.

### Documentation

**One source of truth.** Every fact lives in exactly one doc. When adding or changing a convention, error state, naming rule, or configuration detail, update the canonical location — never duplicate it across docs.

| Content | Lives in | Linked from |
|---------|----------|-------------|
| Naming conventions (prefixes, suffixes) | ARCHITECTURE | README |
| Error states | ARCHITECTURE | README |
| Development conventions | ARCHITECTURE | — |
| How‑to examples (add book, tag, export, etc.) | ARCHITECTURE | — |
| Persisted state inventory | ARCHITECTURE | — |
| Keyboard shortcuts | README, USER_GUIDE | — |
| Feature overview | README | — |
| API signatures and Data API | API.md | — |
| Reader instructions | USER_GUIDE | — |

**When adding a new fact,** put it in the right column above. If you're not sure, default to ARCHITECTURE — it's the canonical developer reference. The other docs link to it; they don't repeat it.

## How‑to examples

### Add a new book

1. Create `data/content/FQH-usululFiqh.csv` with a header row and content:
   ```csv
   #,headAR,bodyAR,headDV,bodyDV,foot
   1,باب النية,النية هي...,ނިޔަތަކީ...,—,المصدر
   ```
2. Add a line to `data/02-registry-bookMeta.csv` (the `tags` column is optional — secondary tags only):
   ```csv
   FQH-usululFiqh,أصول الفقه,އުސޫލުލް ފިޤްހު,Usulul Fiqh,
   ```
3. Run `data/03-update-bookRegistry.ps1` — or the book auto‑registers on first visit via `?book=FQH-usululFiqh`.

### Add a new tag category

Add one row to `data/01-registry-bookTags.csv`. Colours are auto‑generated — just `code` and `label`:
```csv
code,label
FQH,Fiqh
```
Use the tag code as the primary prefix in a `bookCode` (e.g. `FQH-usululFiqh`) or as a secondary in the `tags` column of `02-registry-bookMeta.csv` — badges render automatically with a golden‑ratio HSL colour. No limit on tag count; colours stay perceptually distinct.

### Add a new export format

In `js/export.js`, add an `else if (fmt === "...")` block inside the export click handler. Data formats use `ctx.allData` with `ctx.headerRow` prepended; rich‑text formats use `ctx.allData` directly:
```js
} else if (fmt === "newfmt") {
  var rowsWithHdr = ctx.headerRow ? [ctx.headerRow].concat(ctx.allData) : ctx.allData;
  content = myFormatBuilder(rowsWithHdr);   // include headers
  filename = baseName + ".ext";
  mime = "application/x-myformat";
}
```
Heavy modules use dynamic `import()` so they only load on demand (see `export-xlsx.js` and `export-epub.js`).

### Add a new i18n key

In `js/i18n.js`, add one entry to the `STRINGS` object with all three languages:
```js
btnMyFeature: { dv: "ތަރުޖަމާ", en: "My Feature", ar: "ميزتي" },
```
Use `data-i18n="btnMyFeature"` in static HTML, or `t("btnMyFeature")` in JS. Tooltip text is English‑only — hardcode the string.

### Add a new theme colour

Define the variable in all three theme blocks. Pick a descriptive `--color-<role>` name:
```css
:root                              { --color-accent: #2563eb; }
[data-theme="sepia"]               { --color-accent: #b45309; }
[data-theme="dark"]                { --color-accent: #60a5fa; }
```
Use `var(--color-accent)` everywhere. Never reference the hardcoded hex directly.

## Error states

All errors show visible messages in English. Error boxes carry a central `⚠️ Error:` prefix (`.error::before` — one rule covers every box; the red background alone is invisible to screen readers). Failure toasts use `window.showErrorToast` (⚠️‑prefixed, language‑neutral). Silent failures are minimised:

| Error | Source | Behaviour |
|---|---|---|
| Registry fails to load | `dashboard.js` → dashboard | Shows "Failed to load the book registry" with a ↺ Retry button (`loadDashboard()` re-runs; controls are wired only after success, so no duplicate listeners) instead of an empty dashboard |
| Book code not found | `book-data.js` → reader | Shows error message |
| CSV empty or fails | `reader.js` → reader | `.catch()` on the fetch chain shows error |
| Export fails (PNG/Excel/EPUB) | `export.js` | ⚠️ toast with format name; the Export button is disabled with a "Preparing…" label while working and restored on failure, so the user can click again |
| Missing i18n key | `i18n.js` `t()` | `console.warn` with key name, falls back to raw key string |
| localStorage write fails | All modules | Silently caught (intentional — better to degrade than crash) |
| CSV parse warnings | Console | Non‑fatal |

## Verification habits

The app has no test suite or build step — changes are verified by hand:

- **JS syntax**: `node --check --input-type=module < js/file.js` (files are ES modules; plain `node --check` treats them as CommonJS and fails on `import`)
- **CSS sanity**: brace balance (`{`/`}` counts must match) after every CSS edit
- **Dangling references**: grep for removed IDs/classes/i18n keys across `js/`, `books/`, `css/`
- **Behaviour equivalence** (search‑engine changes): copy the old module from `git show HEAD:codebase/js/…` and compare outputs on Arabic/Thaana test corpora (see the search‑performance notes)
- **Browser caching**: GitHub Pages serves without cache‑busting — always hard‑refresh (Ctrl+F5) after changes; stale CSS is the most common "it didn't work" cause
- **RTL**: arrow‑key stepping, scroll directions, and sticky headers behave differently per browser and per element `dir` — test number inputs and scroll rows in both Chrome and Firefox
- **Direction sanity**: after any change that adds or rewords visible text, switch to dv and to en — each line must read from the correct edge (right in dv/ar, left in en) and must not jump position (pin `text-align` when it matters)

## Adding content

### New book

1. Add a row to `data/02-registry-bookMeta.csv`.
1. Create `data/content/{bookCode}.csv` with a header row as the first row.
1. Open the viewer — it appears automatically.

### New tag category

1. Add a row to `data/01-registry-bookTags.csv` with `code,label`. Colours are auto‑generated — no need to pick hex values.
1. Use the code as the primary prefix in a `bookCode`, or add it to a book's `tags` column — badges render automatically.

## Key benefits

- **Single source of truth** — book metadata and tag definitions in CSV files
- **Shared template** — one HTML page for all books
- **Zero code changes** — adding books or categories is CSV‑only
- **Three themes** — light, dark, sepia; persisted, no flash
- **RTL‑native** — nav and content flow right‑to‑left for Arabic/Dhivehi
- **Trilingual UI** — Dhivehi, English, Arabic
- **Infinite scroll** — seamless reading, no page breaks
- **All settings persisted** — theme, language, content width, font size, font family, hidden columns, tashkeel

## Library search (cross-book)

"Search in books" — a dedicated page (`books/library-search.html`) that searches across every book at once via a machine‑generated word index, instead of downloading and scanning book files in the browser. The dashboard's 🔎 button (carrying the box text as `?q=` and the selected tag chips as `?tags=`; pins are not carried) and the sidebar entry on every page jump to it.

### The index

`data/06-rebuild-searchIndex.mjs` (Node — run `node data/06-rebuild-searchIndex.mjs` after book changes, chain it after the PS1) scans every registered book once, offline, and emits `data/search-index.json` — word‑level postings of `bookId + row`, where `bookId` is a numeric index into `meta.bookIds` (full codes never repeat per entry). Built with the app's own parser and normaliser (`parseCSV`, `normaliseForSearch`) and the SAME tokeniser the query side uses (`tokenizeText` in library-search-engine.js — build and query MUST agree on what a word is, so the script imports it rather than re‑implementing). `-HDN` columns and the row‑number column are excluded; an optional `excludeColumns` registry column (comma‑separated header names) skips those columns — `-HDN` and the row‑number column still win regardless; the magic value `ENTIRE-BOOK` skips the whole book (no postings, and it is listed under `## Excluded books` in the report). The build prints **one report line per book** (row count, indexed columns, skipped columns) and writes the same info to `data/search-index-report.md` (markdown table with per-book postings — the policy as a diffable file, committed alongside the index) so the whole indexing policy is eyeballable at a glance, and an `excludeColumns` entry that matches no column warns. The build times itself — elapsed, per‑phase breakdown (index / pack / write), rows·postings per second, heap, node version — printed to the console and mirrored in the report's `## Build stats` section. Rows are packed as ranges (`"1-5,8,12"`); pure‑number tokens are dropped; `meta.version` (first 16 hex chars of the payload's SHA‑256) stamps the file for cache validation. **Row numbers are 1‑based DATA POSITIONS** (the reader's `?row=` contract — `goTo(row-1)`) — NOT the CSV's `#` column, which is not always sequential (5 books have gaps); the index would deep-link to the wrong row otherwise. The `#` column is display-only.

The file's shape — real excerpt (`bookIds` truncated, three of one word's postings shown):

```json
{
  "meta": {
    "version": "5c9f6bc7140eba42",
    "built": "2026-08-06T15:08:57.409Z",
    "bookIds": ["AQD-aqidatuNawawi-HDN", "AQD-aqidatuRaziyain", "…"],
    "books": 62,
    "rows": 226076,
    "words": 484751
  },
  "words": {
    "المقدمة": { "0": "1,26,82,87,90-91", "7": "1-3", "9": "1-11", "…": "…" },
    "…": "…"
  }
}
```

Posting keys are indices into `meta.bookIds` — `"7": "1-3"` reads "data positions 1–3 of `meta.bookIds[7]`" (`AQD-usooluThalaatha`). `rows` counts scanned rows across books; `words` counts unique tokens.

Current size: 62 books, 226k rows, ~485k unique words — 39.7MB raw, 12.7MB gzipped. GitHub Pages on‑the‑fly gzips JSON for clients that accept it: a browser's `fetch()` (which always sends `Accept-Encoding: gzip, deflate, br`) receives `Content-Encoding: gzip` and ~13.8MB instead of the 41.6MB raw file, decompressed transparently by the browser — so the loader's `resp.text()` is unaffected. (Probing with `curl -I` without an `Accept-Encoding` header shows the raw size and no `Content-Encoding`; that's a client‑side header, not a server config.) The full file still re‑downloads whenever `meta.version` changes. Whole‑word matching only — substring, fuzzy, and regex stay in‑book (see "What's deliberately different" below).

### The loader

`js/library-search-engine.js` — a pure module (no DOM). `loadSearchIndex()` fetches the index with a conditional request (`cache: "no-cache"` → a cheap 304 when unchanged), parses only the meta head to read the version (the full 40MB `JSON.parse` happens only on version change), and serves the parsed words from the on‑device IndexedDB copy (`hadithmvSearch` DB — deliberately separate from the book cache in csv.js so the two modules never contend on a version bump). Failed loads are retryable. `searchLibrary(index, query, scopeBookCodes)` normalises + tokenises the query (same `tokenizeText` as the build), looks up each word's postings, ANDs them at row level, intersects with the scope (book codes — the page passes visible books ∩ tag chips), and returns per‑book `{bookCode, count, firstRow}` sorted by match count.

### The UI

The page (module `js/library-search.js`, styles `css/library-search.css`) reads `?q=` and `?tags=` from the URL (shareable links — typing, chip toggles, and clear keep the address bar in sync via `replaceState`). Tag chips scope the search (OR — a book is searched if it carries any selected tag); `-HDN` books are excluded from scopes; a scope that matches no books renders "No results" rather than falling through to an unscoped search (the engine treats `[]` as "every book"). Results group by book (tag badges, localized titles, match count), ranked by count, and deep‑link to `reader.html?book=X&row=N&q=TERM` (first match, term pre‑highlighted — the proven pins/history path plus the `?q=` param below). Each result has a ▾ **peek** (per‑book preview): it fetches that ONE book — through the IndexedDB book cache, instant once opened before — runs the same compiled-query scan, and shows the first 8 matching rows as highlighted snippets with a "Show next N" pager (the scan produces all matches up front, so paging is just slicing); every snippet deep‑links to its exact row. Peek results are cached per book+query so collapse/re‑open and re‑searching don't refetch. The index itself loads lazily on the first search (with a "Searching…" state and a ⚠️ Error + ↺ Retry path). On the dashboard, the 🔎 button is a plain jump to the page (carrying the box text as `?q=` and the selected tag chips as `?tags=`; pins are not carried); the dashboard search bar is title‑filtering only and no longer loads the index.

### What's deliberately different from in-book search

- **Whole-word only.** The index matches whole normalised words — `رحم` does NOT find الرحمن (in-book substring search does). No wildcards/fuzzy/regex/column scoping cross-book.
- **AND across words.** A result row contains every query word (in-book queries are substring-based, which is a different match model).
- **Book-level results; snippets on demand.** The index stores rows, not text — results show book summaries with counts, and the per-book peek (above) fetches the book on demand to show actual highlighted snippets, so content previews exist without making the search itself download anything. A click lands on the first matching row with the term pre-highlighted (the `?q=` param below) and the search dropdown listing every match; the reader's own search covers further in-book precision.
- **Snapshot semantics.** The index is built from a point-in-time scan; the `meta.version` hash invalidates stale cached copies.

### Planned (not yet built)

These are agreed designs, written down so they survive. None of this exists in the code yet.

- **Substring (n‑gram) index variant** — 3‑4 char chunks + stored words, 30‑80MB vs 10‑20MB word‑level — if whole‑word matching ever proves limiting.
