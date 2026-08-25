# Architecture

Metadata-driven, single-page viewer for Islamic texts. Configuration lives in CSV files. UI supports Dhivehi, English, and Arabic.

> **Other docs:** [User Guide](USER_GUIDE.md) for readers · [API Reference](API.md) for developers · [Testing Guide](TESTING.md) for verification workflow, known non-errors, and measurement/audit traps

## The big picture

Hadithmv is a **static, CSV‑driven viewer**: no server, no database — every screen renders from CSV files fetched at runtime in the browser. Adding a book or a translation never requires code changes; it requires a CSV and a registry row.

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

| Task                               | Where                                                                 |
| ---------------------------------- | --------------------------------------------------------------------- |
| Change the toolbar / reader chrome | `src/books/reader.html` + `src/js/reader.js` + `src/css/reader.css`   |
| Add a regular book                 | README → "Add a new book"                                             |
| Add a Quran translation            | "Adding a new Quran translation" below                                |
| Change themes / colours            | `src/css/common.css` `--color-*` variables (3 themes)                 |
| Add a UI string                    | `src/js/i18n.js` (`dv`/`en`/`ar`), then the button gets `data-i18n`   |
| Wire a new modal                   | `common.js` `createModal()` + `MODAL_IDS` (must open via `openModal`) |
| Change search behaviour            | `src/js/search-utils.js` (engine) + `src/js/reader.js` (wiring)       |
| Bump the version                   | `src/js/i18n.js` `appVersion`, commit "Update to vX.Y.Z"              |
| Verify changes                     | "Verification habits" at the bottom                                   |

## Files

| File                                                    | Purpose                                                                                                                                                                                                                 |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data/03-registry-bookMeta.csv`                         | Central registry of books (code, authorCode, titles in AR/DV/EN, secondary `tags` column, version)                                                                                                                      |
| `data/01-registry-bookTags.csv`                         | Tag definitions (tagCode, labelAR/labelDV/labelEN) — colours auto‑generated (golden‑ratio HSL), slot = file order = display order, hand‑controlled (03 never rewrites this file)                                        |
| `data/02-registry-bookAuthors.csv`                      | Author definitions (authorCode, nameAR/nameDV/nameEN, bornAH/diedAH) — trilingual names + Hijri years, hand‑controlled, referenced from 02's `authorCode` column                                                        |
| `src/books/index.html`                                  | Dashboard — book list, search, tag filter, table/card view                                                                                                                                                              |
| `src/books/reader.html`                                 | Book viewer — loaded via `?book=CODE`                                                                                                                                                                                   |
| `src/books/library-search.html`                         | Library search page — self-initialising, shareable `?q=`/`?tags=`/`?books=` URLs                                                                                                                                        |
| `src/css/common.css`                                    | Shared: themes, fonts, topBar, sidebar, unified modals, `.dd-item` / `.dd-menu` dropdown classes, tag colors                                                                                                            |
| `src/css/reader.css`                                    | Reader page: focus mode, toolbar, pagination, content, responsive. **Must load last** so its mobile media queries override reader-quran.css on specificity ties.                                                        |
| `src/css/reader-search.css`                             | Reader: RDF header filter, search window input/history/advanced                                                                                                                                                         |
| `src/css/search-window.css`                             | Shared search window: shell grid, tabs/scope, results pane, hint strip                                                                                                                                                  |
| `src/css/reader-table-view.css`                         | Reader: table view mode, top scrollbar, sentinels                                                                                                                                                                       |
| `src/css/reader-quran.css`                              | Reader: Quran nav row, dropdowns, surah overlay. Loads before reader.css.                                                                                                                                               |
| `src/css/dashboard.css`                                 | Dashboard styles: grid, cards, controls, table view                                                                                                                                                                     |
| `src/css/library-search.css`                            | Library search page: results, peek previews                                                                                                                                                                             |
| `src/js/common.js`                                      | Shared init: theme, fonts, i18n, sidebar, settings, keyboard, unified modals, toast, clipboard, LS_KEYS, createModal                                                                                                    |
| `src/js/book-data.js`                                   | Book metadata: registry + tag loaders, tag extraction, page bootstrap                                                                                                                                                   |
| `src/js/book-info.js`                                   | Book/author info modal **+ the src/books/info.html page**: markdown notes renderer, fact strip, auto-TOC, in-modal search, copy, copy-link, 4-format pane export (reuses `src/js/export.js`'s shared builders)          |
| `src/js/dashboard.js`                                   | Dashboard UI: card/table grid, search, tags, sort, pins & history modals, keyboard                                                                                                                                      |
| `src/js/pins-history.js`                                | Pins & history: storage CRUD, modal UI, sidebar wiring                                                                                                                                                                  |
| `src/js/reader.js`                                      | Book viewer core: rendering, loaders, STATE, goTo, keyboard, deep links                                                                                                                                                 |
| `src/js/radheef-merge.js`                               | Virtual merged radheef book (RDF-all): assembles the 8 source books in memory at load — see "Virtual merged books"                                                                                                      |
| `src/js/reader-position.js`                             | Reader position: pagination strip, progress, URL sync, history log                                                                                                                                                      |
| `src/js/search-window.js`                               | Unified search window shell: tabs, scope, all-books tab, link-row keys                                                                                                                                                  |
| `src/js/reader-search-ui.js`                            | Reader search UI: results, history, whole-word, advanced search                                                                                                                                                         |
| `src/js/table-scroll-sync.js`                           | Table view top scrollbar: width sync, RTL-aware transform, wheel scroll                                                                                                                                                 |
| `src/js/export.js`                                      | Export formats (TXT, MD, JSON, CSV, TSV, PDF, PNG, Excel, EPUB, YAML, TOON, HTML, HTML Table, XML, Word) — the PDF/HTML/Word/EPUB builders are module-scope pure functions shared with the info modal's pane export     |
| `src/js/quran-data.js`                                  | Quran pure data/logic: detection, loading, merging, ayah decoration, column classification helpers                                                                                                                      |
| `src/js/quran-ui.js`                                    | Quran UI: surah/ayah/juz dropdowns, content presets, display options, surah selector. Re‑exports quran-data.js.                                                                                                         |
| `src/js/csv.js`                                         | Tiny CSV parser (~1 KB) — `parseCSV()`, `unparseCSV()`, `fetchCSVRows()`, `parseCSVWithHeader()`, `fetchCSVObjects()`                                                                                                   |
| `src/js/search-utils.js`                                | Search engine: normalisation, parsing, matching, snippets, history, HTML/XML escaping                                                                                                                                   |
| `src/js/library-search-engine.js`                       | Cross-book search: index loader (IndexedDB-cached) + pure query engine — `loadSearchIndex`, `searchLibrary`, `tokenizeText` (shared with the index build script)                                                        |
| `src/js/library-search-page.js`                         | Library search page UI: `?q=`/`?tags=`/`?books=`, chips, results, peek previews, book-scope picker                                                                                                                      |
| `src/js/library-scope-picker.js`                        | Book-scope picker: groups/chips/rail rendered into one surface at a time                                                                                                                                                |
| `src/js/export-xlsx.js`                                 | XLSX writer — createXLSX(), inline strings, lazy-loaded                                                                                                                                                                 |
| `src/js/export-epub.js`                                 | EPUB 3 e-book writer — createEPUB(), embedded font, lazy-loaded                                                                                                                                                         |
| `src/js/export-zip.js`                                  | Minimal store-only ZIP writer — zipStore(), shared by the XLSX + EPUB writers                                                                                                                                           |
| `src/js/i18n.js`                                        | Translations module (dv/en/ar) — `t()`, `setLanguage()`                                                                                                                                                                 |
| `static/font/`                                          | Custom merged font (Arabic + Thaana + Latin, WOFF2 + WOFF)                                                                                                                                                              |
| `data/content/*.csv`                                    | Per-book content files                                                                                                                                                                                                  |
| `static/notes/works/*.md` + `static/notes/authors/*.md` | Optional book notes / author bios for the info modal — filename = book/author code, fetched lazily, 404 → "no notes yet" placeholder (see "Info modal")                                                                 |
| `data/04-update-bookRegistry.ps1`                       | Adds new books, recomputes version hashes, sorts the book registry (never touches the tag or author registries)                                                                                                         |
| `data/05-registry-quranSurahs.csv`                      | 114 surah names in AR/DV/EN with ayah counts and the per-surah basmalah                                                                                                                                                 |
| `data/07-registry-quranColumns.csv`                     | Registry of all available Quran columns (source, labels, defaults)                                                                                                                                                      |
| `data/06-registry-quranJuz.csv`                         | 30 juz cut points as `startSurah`/`startAyah`                                                                                                                                                                           |
| `data/content/QRN-DATA-ayahImlai.csv`                   | Base Quran text: one Imlai ayah per row (structure derived from 05 + 06 at load)                                                                                                                                        |
| `data/content/QRN-DATA-ayahUthmani.csv`                 | Quran text in Uthmani script                                                                                                                                                                                            |
| `data/08-rebuild-searchIndex.mjs`                       | Node build script — scans every registered book, emits the word-level search index (rerun after book changes)                                                                                                           |
| `data/search-index.json`                                | Generated word-level search index — the one machine-generated data file (see "Library search")                                                                                                                          |
| `data/search-index-report.md`                           | Generated per-build policy report — one row per book (index id, rows, postings, indexed/skipped columns), warnings, and a postings-by-column breakdown sorted by size; commit it to diff policy changes across versions |

## Where to find things

Key functions and where they're defined. Many are re-exported through barrel modules (quran-ui.js → quran-data.js, book-data.js → pins-history.js).

| What                                                             | Module                                                                                                   | Notes                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Book metadata                                                    | `book-data.js`                                                                                           | `initializePageWithMetadata`, `loadBookNames`, `extractTags`                                                                                                                                                                                                                                                                                                                                                                       |
| Dashboard UI                                                     | `dashboard.js`                                                                                           | `initializeDashboard`, `renderDashboard`, `setupDashboardControls`                                                                                                                                                                                                                                                                                                                                                                 |
| CSV parsing                                                      | `csv.js`                                                                                                 | `parseCSV`, `fetchCSVRows`, `parseCSVWithHeader`, `fetchCSVObjects`                                                                                                                                                                                                                                                                                                                                                                |
| Theme, font, sidebar, settings                                   | `common.js`                                                                                              | Also `window.setFocus`, `window.LS_KEYS`, `window.copyToClipboard`, `window.createModal`                                                                                                                                                                                                                                                                                                                                           |
| i18n / translations                                              | `i18n.js`                                                                                                | `t(key)`, `setLanguage(lang)`                                                                                                                                                                                                                                                                                                                                                                                                      |
| Search engine                                                    | `search-utils.js`                                                                                        | `normaliseForSearch`, `parseQuery`, `compileQuery`, `rowMatchesQueryNorm`, `buildNormData`, `escapeHTML`, `escapeXML`                                                                                                                                                                                                                                                                                                              |
| Search window + in-book search                                   | `search-window.js` (shell) + `reader-search-ui.js` (in-book wiring) + `search-utils.js` (shared toolkit) | `initSearchWindow(cfg)`, `openSearchWindow`, `getSearchWindowUI`, `applySearch(q)` / `applySearchWindow`, `parseQueryWithMode(q)`, `renderAdvancedSearch()` — unified modal window: This book / All books tabs, history section, whole-word toggle, advanced conditions, scope picker; navigation ownership split between the page (this-book rows) and the shell (link rows); styles in `search-window.css` + `reader-search.css` |
| Library search                                                   | `library-search-engine.js`                                                                               | `loadSearchIndex`, `searchLibrary`, `tokenizeText` (shared with the index build script)                                                                                                                                                                                                                                                                                                                                            |
| Library search page                                              | `library-search-page.js`                                                                                 | self-initialising — `?q=`/`?tags=`/`?books=`, chip + book scoping, peek previews                                                                                                                                                                                                                                                                                                                                                   |
| Quran data / decoration                                          | `quran-data.js`                                                                                          | `decorateAyah`, `isAyahTextColumn`, `mergeQuranData`, column classification helpers                                                                                                                                                                                                                                                                                                                                                |
| Quran nav / dropdowns                                            | `quran-ui.js`                                                                                            | `initQuranUI(ctx)` — re-exports quran-data.js                                                                                                                                                                                                                                                                                                                                                                                      |
| Reader core                                                      | `reader.js`                                                                                              | Rendering, loaders, `goTo`, STATE, toolbar, keyboard, deep links, focus mode                                                                                                                                                                                                                                                                                                                                                       |
| Info modal                                                       | `book-info.js`                                                                                           | `openInfoModal(cfg)`, `renderMarkdown(src)`, `computeChapterCount(rows, headerRow)` — imports only i18n / book-data / search-utils / csv / export (never facet-browse or reader — cycle prevention)                                                                                                                                                                                                                                |
| Reader position                                                  | `reader-position.js`                                                                                     | `initPosition(ctx)`, `updatePagination()`, `visiblePageIndex()` — pagination strip, scroll block (progress, milestones, URL sync, read-history)                                                                                                                                                                                                                                                                                    |
| Table scrollbar                                                  | `table-scroll-sync.js`                                                                                   | `initTableScroll(ctx)`, `refreshTableScrollWidth()` — top scrollbar, width sync, arrow/wheel scrolling                                                                                                                                                                                                                                                                                                                             |
| Export formats                                                   | `export.js`                                                                                              | `initExports(ctx)` — TXT, MD, PDF, EPUB, etc.                                                                                                                                                                                                                                                                                                                                                                                      |
| Pins & history                                                   | `pins-history.js`                                                                                        | `addPin`, `addReadHistory`, `openPinsModal`, `openHistoryModal`                                                                                                                                                                                                                                                                                                                                                                    |
| `window.openDropdown` / `closeAllDropdowns` / `registerDropdown` | `reader.js`                                                                                              | Shared dropdown helpers                                                                                                                                                                                                                                                                                                                                                                                                            |
| `window.showToast`                                               | `common.js`                                                                                              | Single toast implementation                                                                                                                                                                                                                                                                                                                                                                                                        |

## Request flow

```text
URL: ?book=AQD-nawaqidulIslam
        │
        ▼
  book-data.js
    ├─ fetch ../../data/03-registry-bookMeta.csv  ──→  find row by bookCode
    ├─ fetch ../../data/01-registry-bookTags.csv ──→  resolve tag badges (primary prefix + tags column)
    └─ returns { bookCode, titleAR, titleDV, titleEN, csvPath }
        │
        ▼
  reader.js
    ├─ standard book:  parseCSV(../../data/content/AQD-nawaqidulIslam.csv)
    ├─ virtual book:   radheef-merge.js assembles rows in memory from the
    │                  source books' CSVs (see "Virtual merged books")
    ├─ first row = header; col 0 = # or blank → row numbers
    ├─ build column toggle buttons
    ├─ loadInitial() → first chunk of rows
    └─ wire infinite scroll / search / toolbar / keyboard / i18n
```

No `?book=` → dashboard (`index.html`) loads `dashboard.js` (which imports `book-data.js` for the registry) → search bar, tag chips, functions row (pins, history, view toggle, sort, reset), card grid of all books. Pins and history persist in `localStorage` (max 10 each — at the cap, the oldest entry is evicted to make room) and open as modal overlays from toolbar buttons. Key behaviors:

- **Sort row** — one continuous line that scrolls horizontally when it doesn't fit (reader‑toolbar pattern: `#dashboardPanelFunctions` wrap with ◀▶ edge arrows, inner `.dash-functions-scroll` does the scrolling, arrows auto‑hide at the extremes, wheel redirects to horizontal — see "Horizontal scrolling & RTL" before touching the arrow signs)
- **Table view** — `dash-table` wrapped in `.dash-table-wrap`: `overflow-x: auto` with a hidden scrollbar, so its four columns scroll sideways instead of overflowing the page
- **Continue‑reading card** — inside the collapsible dashboard panel (above the tags), appears when no search/tag/pins filter is active, built from the most recent history entry (book title, saved position — a surah reference like `ބަޤަރާ 2 : 60` for Quran books, otherwise the localized "Page N" prefix + row number — and relative time); clicking resumes at `reader.html?book=X&row=N`. Because it lives in the collapsible panel, focus mode collapses it with the rest of the chrome. The slot is dropped wholesale when empty (`#dashboardContinue:empty { display: none }` — dashboard.js fills it with `""` when no history entry exists), so a 0-height slot can't reserve a phantom 6px gap that swings the search-row→toolbar spacing with localStorage state (same "gaps only between real rows" contract as the reader panel — see "Reader UI → Layout"). The "Page" prefix shortens to the single letter (`ސ`) below 600px via `ddColPageShort` — the pins/history table headers share the same `matchMedia` swap (below 600px, Sort and Remove become glyph forms `ddColSortShort`/`ddColRemoveShort`; this is what lets the mobile table shrink those columns to their content width so the book column keeps the rest — see the `@media (max-width: 600px)` widths in common.css), and `timeAgo` drops its "ago" suffix (`ކުރިން`) below 600px via `relativeMinutesShort`/`relativeHoursShort`/`relativeDaysShort`
- **Pin auto‑update** — while the user reads a **pinned** book, the reader's scroll handler (debounced 2 s, guarded by `isPinned` + `_lastHistoryRow`) calls `addPin(bookCode, absRow, pinLabel(absRow))`, piggybacking on the same timer as the history auto‑log; the URL position sync is a separate 500 ms debounce. All three writers (URL, history, pin) store **whole‑book row numbers** — surah/juz filter views are slices of `allData`, so the handler maps the visible row back with `allData.indexOf(filteredData[vRow]) + 1` before writing, because the reader's `?row=` handler reads rows against the full book at load
- **`?tags=A,B`** — pre‑filters by tag codes; clicking a tag chip updates the URL via `history.replaceState`, so filtered views are bookmarkable and shareable. An `All` chip (active when no tags are selected) clears the tag filter
- **`?books=A,B` / book‑scope picker** — narrows the search to specific books (the tag chips narrow by category; the picker by book — `computeScope` intersects both). `#libScopeBtn` beside the search box opens a **modal** (built lazily on first open through the shared modal layer — `createModal("libScopeOverlay", …)` with the `.lib-scope-modal` flex‑column variant, two panes at ≥600px — so Escape/backdrop/✕ and the focus trap come from common.js). Its label is a purpose prefix plus the current state — "Search in: All books ▾" / "Search in: 4 books ▾" (`libScopeSearchIn` + `libScopeAll`/`libScopeCountOne`/`libScopeCount`), echoing the modal title's own "search in" phrasing so the button teaches its action at a glance; its tooltip (always English) states the verb, "Choose which books to search", and `aria-haspopup="dialog"` names the opener's target. At ≥600px the modal body is a 2×2 grid: **row 1 is one pinned header** — the "Tags" pane label rightmost (over the rail), the filter and the count over the list; **row 2 is the two scrollable panes** — family chips rail on the right (RTL grid order: the first column is the rightmost), book list on the left, the rail's inline‑end border the vertical separator between them. The label and head cells both carry the header's bottom border, so it reads as one continuous rule; the label is pinned, so it never scrolls out of view with the chips. Below 600px the single column stacks: label, chips row, filter+count row, list — in that order, so the filter stays directly above the list. The rail holds one chip per tag the books carry (every tag, not just the primary prefix one — a book can appear in several groups), toggling all books carrying it; the checkbox list renders each book exactly once, under its first (alphabetically first) group — group labels whose books were all claimed by earlier groups are skipped; the labels are sticky section headers on a subtle band, so they hold position while their books scroll beneath — and the list shows the books the index actually knows — each row pairs the current‑language title with the book's Arabic title (its canonical name in every language), and the row's tooltip carries the machine code, the `?books=` value (`meta.bookIds` — ENTIRE‑BOOK‑excluded books like the RDF dictionaries never appear, the tag row's Radheef chip is a silent zero for the same reason). There is no footer and no Done/Apply button — the picker applies live on every tick, so the shared ✕ / backdrop / Escape are the only closers (a close-only button would be redundant). The count reads in the full text color at semibold — legible at a glance — and its width is pre‑reserved to its widest state (the scoped template at the most digits) via `reserveWidestText`, so ticking books never resizes the filter beside it; its template is language‑specific: English/Arabic read "N of M books selected" (selection first), Dhivehi reads total‑first — "M / N ފޮތް ހޮވިފައި". The "↺ Reset" button sits in the pinned header at the far left, on the count's line — it pairs with the count, the readout of the very selection it clears (the count summarizes the whole scope, tags and books alike, so the reset anchors to it rather than to the rail's "Tags" label) — and it is an action, not a state label: it clears the whole scope, and being outside the rail it stays reachable even when the rail is scrolled; clicking it when nothing is scoped is a no‑op (an empty selection is every book, the tag‑row "All" metaphor: nothing ticked is not a restriction, and ticking one book from "everything" narrows to exactly it). URL‑synced like `?tags=`; the picker list itself is lazy — derived from `meta.bookIds` on first open (`ensureSearchableBooks`), falling back to the visible registry on index failure
- **Tag row collapse** — the chip row clamps to one line; a "▾ More tags" button (only when the chips overflow, re‑measured on every chips render and on resize) expands it to "▴ Less tags", label swapped by `tagsShowMore`/`tagsShowFewer`. The toggle lives **in‑flow as the first item of the collapse box, right before the "Tags:" label** (the pages render the label after it as the box's second child; `initTagsCollapse` re‑inserts the button before the label on every chips render) — being at the start of the rows, it never moves when the box expands: line 1 is toggle + label + chips and the rows below span the full width. The box grows to the row width (`flex: 1 1 0%`) so the chips wrap, but is capped at `max-width: max-content` so a wide window never leaves an empty band (when the chips fit one row, nothing overflows and the button hides itself). The expanded state lives on the collapse box's class, so chip re‑renders (search, reset, language) keep it; a reload starts collapsed. The library-search page shares the same component (`#libTagsCollapse`/`#libTagsToggle`), wired by `window.initTagsCollapse` in common.js
- **Width reservation for swapping labels** — `window.reserveWidestText(el, strings)` (common.js) pins an element's `min-width` to the widest of the strings it swaps between (measured in the current language/font), so its neighbors never shift when the text changes. Used by the tag toggle (More ↔ Less), the dashboard view toggle (Card ↔ Table), the sort select (the Arabic options differ in width) and the reader pin button (📌 Pin ↔ 📌 Pinned). Every reservation is re‑measured once `document.fonts.ready` settles: with `font-display: swap` the webfont can land after a measure and widen the labels past a fallback‑measured `min-width` (the pin button grew 63→77 px on first click while this was missing). Re‑calling re‑measures too, so language changes stay covered by the normal re‑render paths. **Measure only while the element is visible** — a `display: none` ancestor reports `offsetWidth` 0, so a reservation taken before a post‑load reveal reserves 0px and the first toggle visibly jumps; the reader runs its pin reservation at the wrapper reveal (with the sticky‑chrome measurements) for exactly this reason, and the fonts.ready re‑run skips still‑hidden elements rather than clobbering a good reservation with 0. **Use it for any button/label that swaps a small fixed set of strings**; it also works on native `<select>`s (cycles the options by index — strings optional there). Dynamic text (counts, page numbers) is a different sizing problem — don't reserve widths for it

The dashboard panel's DOM nesting (each level is a flex container):

```text
#dashboardPanel
├── #dashboardPanelSearch
└── #collapsibleDashboardPanel          ← collapses in focus mode
    ├── #dashboardContinue              ← continue-reading card (any view, when history exists)
    ├── #dashboardPanelTags             ← tag chips
    │   └── #dashboardTagsCollapse        ← ▾ toggle + Tags: label + chips, clamped to one row
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
│  ↩ Return  ▾ Focus  │  Book Title (scrollable)  │  ☰ Menu   │
│  ═══ progress bar (surah-level for QRN, milestone toasts, green border + surah-completed toast at 100%) │
├─ Sticky readerPanel shell (z-index 50) ──────────────────────┤
│  readerPanelSearch       [input]  ✕  (RDF books only)         │
│  readerPanelFunctions    🔎 📋 📌 ◉ 🔗 ↕ ↺ 📥 …             │
│  readerPanelPagination   << < [N] / [N] > >>  Tags …        │
│  readerPanelQuran (QRN)  ▶ 1 الفاتحة ◀  …                  │
├─ Reader content (scrollable) ────────────────────────────────┤
│  [Table mode] ▶ ════ scrollbar ════ ◀                       │
│  #1 …                                                        │
│  #2 …                                                        │
└──────────────────────────────────────────────────────────────┘
```

Columns are rendered in header order. A blank line separates the last `*AR` column from the first `*DV` column (AR‑ending → DV‑ending headers). A `ـــــــــــ` tatweel divider appears before any column whose header starts with `foot` (case‑insensitive — matches `foot`, `footAR`, `footDV`). Columns starting with `head`/`kitab`/`bab` render as large/medium/small bold headings respectively.

The sticky `#readerPanel` shell extends to the full width of `#readerWrapper`; it contains the search row — the RDF in-place filter only, hidden for other books (their search lives in the unified window, whose button leads the functions row) — plus the collapsible `#collapsibleReaderPanel` (functions, pagination, Quran nav). `#readerContent` has its own side padding. Content width is controlled by the `--content-width` CSS variable (default 800px), set from the Settings → Width dropdown. At full width (`none`) the `data-widescreen` attribute also removes border-radius. The topBar and panel both use a `::before` pseudo-element for full-bleed background. Panel rows are horizontally centered. Search inputs cap at `max-width: 500px` so they don't stretch endlessly on wide screens.

**Panel spacing contract** — the reader, dashboard, and library pages all measure the same rhythm: 10px of air from the separator line to the first row (the shell's top padding), 6px between consecutive rows (`--section-gap`), and 12px from the last row to the line below (10px bottom padding + the 2px border line). Gaps only ever run between two real rows. The one way a gap leaks is a row that JS hides but that stays in the flow — fixed at both known sites: the hidden Quran-nav/RDF-search wraps (see "Horizontal scrolling & RTL") and `#collapsibleReaderPanel`'s `margin-top`, which is the search-row→toolbar gap on RDF books. On non-RDF books the search row is hidden by inline `display:none`, and that margin would stack on the panel's top padding — 16px of air against 12px at the bottom. It is zeroed by `#readerPanel:has(#readerPanelSearch[style*="display: none"]) #collapsibleReaderPanel { margin-top: 0 }` — the gap exists only while its partner row does, the same self-healing `:has`-inline-`display:none` pattern as the wrap rule (focus mode zeroes it as well).

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

**Horizontal scrollbar.** When column content exceeds the viewport width, a sticky horizontal scrollbar appears above the table. It sits below the reader chrome (`position: sticky; top: var(--table-header-top) + 2px; z-index: 6`) so it remains visible during vertical scrolling. Arrow buttons (`▶` back / `◀` forward) flank the scrollbar and scroll one column width (150px) per click with a custom `requestAnimationFrame` ease-out animation. Shift+Wheel on the table area also drives horizontal scroll. The scrollbar row is hidden entirely when the table fits without overflow.

**Sticky headers.** `<th>` elements use `position: sticky`. When the horizontal scrollbar is visible their `top` offset is increased by 19px to sit below the scrollbar; when hidden they sit directly below the chrome. The offset is set dynamically via JS.

**Performance.** `table-layout: auto` lets the browser size columns by content. `border-collapse: separate; border-spacing: 0` avoids the expensive collapsing-border algorithm. `contain: layout style` isolates the table's layout from the rest of the page. `content-visibility: auto` is explicitly NOT applied to `<tr>` elements (it breaks the table layout algorithm). The table wrapper uses `overflow-x: clip` (fallback: `hidden`) so sticky positioning is not trapped by a scroll container.

### Search

Real‑time, tashkeel‑insensitive filtering via `normaliseForSearch()` — strips Arabic diacritics, normalises alif/ya/waw variants, and normalises Thaana thikijehi (Arabic‑derived letters) to base Thaana. **Thaana fili (vowel marks) are deliberately PRESERVED** — unlike Arabic diacritics they distinguish words (ކަތި ≠ ކުތި), so stripping them would cause false matches. Results render as highlighted snippets mapped back to original text. Same normalisation used for dashboard search.

**The search window** (`src/js/search-window.js` + `src/css/search-window.css`) is the shared modal surface on the reader and library pages, opened from the magnifier button, `/` or `Ctrl+F` (`Ctrl+Shift+F` opens it with the advanced conditions expanded). One shell, two modes:

- **This book** (reader tab) — the window input drives the page's in-book search (`applySearch` → `applySearchWindow` in `reader-search-ui.js`); results render into `#searchWindowResults` with jump-to-row links. The window also hosts the whole-word toggle, the advanced conditions (column/condition/value filters with AND/OR logic — the old standalone advanced modal is gone), and the history section: max 20 terms under the shared `searchHistory` `localStorage` key (both pages); clicking a term fills the input, re-runs the search, and refocuses the input.
- **All books** (reader tab; also the library window's only mode) — cross-book search over the generated index (`library-search-engine.js`) with the book-scope picker (`library-scope-picker.js`) rendered into the window. Rows are deep links (`reader.html?book=CODE&row=N&q=…`); the library window adds a card/list view toggle.

**Keyboard navigation ownership.** Window navigation keys act only while the window input is focused. This-book result rows (`.search-result[data-real]`) are owned by the reader page (`onSearchKeydown`, guarded on `document.activeElement`); link rows (`.search-window-book-link`, `.lib-result`) are owned by the shell's input-level listener, which no-ops when no link rows are on screen — so the hint strip's ↑↓/Enter/Esc promise holds on every tab. Enter on a link row follows the row's `a.href`; on a this-book row it jumps and closes the window. A history-term click is a mousedown on a non-focusable row that moves focus to `<body>`; the click handlers refocus the window input so ↑↓/Enter keep acting on the fresh results.

A `?q=TERM` URL param (used by library-search deep links) fills the window query on load, runs the search — so the window lists every match and rendered rows show the term highlighted — and jumps to the `&row=` target, or the first match when no row is given. The window stays closed on load; opening it later shows the query and its results.

**RDF dictionary books filter in place.** For every `RDF-*` book (dictionaries — the merged RDF-all and its sources), the header input stays as the in-place filter: typing filters `filteredData` to the matching rows (`applyRadheefFilter` in `reader-search-ui.js`) — the table/card re-renders with only matches, the scroll counter shows the match count (e.g. `13,012 / 11`), and clearing the input restores all rows. Zero matches renders the empty-state message. The search window coexists as the advanced/browse surface: it searches independently of the in-place filter, and jumping to a result from the window clears a stale header filter value so the page shows all rows again. The `?q=` deep link filters in place on load for these books.

**Performance.** Normalisation is a single regex pass (per‑char lookup instead of ~30 sequential replaces). At book load `reader.js` precomputes a parallel structure of normalised cells (`buildNormData()`), and each search compiles its query once (`compileQuery()`) — so a full scan over 50k+ rows matches against precomputed strings with precompiled regexes, and never re‑normalises a cell or a term. The search input is debounced (120 ms), so only pauses in typing trigger a scan. Highlighting (`highlightMatches` / `buildSnippets`) maps normalised match positions back to original text with an identity fast path (`mapNormToOrig`): characters that pass through normalisation unchanged are matched with a single compare, so only the minority (tashkeel, thikijehi, case) pay a normalisation call. The Quran on‑demand column loader keeps the norm cache in sync via the `initQuranUI` ctx bridge.

### Toolbar

| Control         | Implementation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Copy            | **Standard books:** `titleDV - titleAR` header, then row text with `ـ` divider before `foot` columns, blank line between AR‑ending and DV‑ending columns, heading formatting for `head`/`kitab`/`bab` columns. **Quran books:** no book header; decorated ayah text, `[name surahNo : ayahNo]` reference, then columns grouped by source book with one book-level label per book. `navigator.clipboard.writeText()` with `execCommand` fallback.                                                                                   |
| Share           | Copies a deep link (`?book=CODE&row=N`) to the current row.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Pin             | Toggles a pin for the current position (📌 Pin ↔ 📌 Pinned; Alt+P). The label swap is width‑reserved via `reserveWidestText` — the reservation runs at the post‑load wrapper reveal (with the sticky‑chrome measurements), because `#readerWrapper` is `display: none` until then and a hidden element measures 0px. Persists in `pinnedBooks` (max 10); while pinned, the entry's row auto‑updates on the 2 s scroll debounce — see the dashboard section.                                                                        |
| Hide diacritics | Wraps Unicode diacritic ranges in `<span class="tashkeel">`. Toggle adds `.hide‑tashkeel` class → `display: none`.                                                                                                                                                                                                                                                                                                                                                                                                                 |
| View toggle     | Dropdown (📖 View) offering Card, Table, and Parallel Text layouts. Table is available for all books; RDF books default to table on desktop. Parallel view groups AR‑suffixed and DV‑suffixed columns side‑by‑side. `Alt+V` cycles through modes.                                                                                                                                                                                                                                                                                  |
| Reset           | Clears search, unhides all columns, shows tashkeel, exits focus mode, clears `reader:` localStorage.                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Export          | Dropdown: TXT, MD, JSON, CSV, TSV, YAML, TOON, XML, Excel, EPUB, Word, PDF, PNG, HTML, HTML Table. TSV is tab-separated. TOON uses expanded list per spec. Excel uses `src/js/export-xlsx.js` (lazy-loaded). EPUB uses `src/js/export-epub.js` (lazy-loaded, embedded font). PNG exports only the current visible row (2×) — see the format table. Text formats assemble the whole book as a single string + Blob in memory (fine at current book sizes, ~8MB max). All include book title, URL, Hadithmv, version, and proper formatting. |
| Hide columns    | Dropdown with per‑column toggle buttons. `hiddenColumns[]` persisted per book (`reader:hiddenColumns:{bookCode}`).                                                                                                                                                                                                                                                                                                                                                                                                                 |

#### Export formats

| Format     | Type       | Header row? | Module           | Notes                                                                              |
| ---------- | ---------- | ----------- | ---------------- | ---------------------------------------------------------------------------------- |
| TXT        | Rich text  | No          | —                | Formatted like clipboard copy                                                      |
| MD         | Rich text  | No          | —                | Markdown with `##` per row                                                         |
| JSON       | Data       | Yes         | —                | Array of arrays, header first                                                      |
| CSV        | Data       | Yes         | —                | `unparseCSV()`                                                                     |
| TSV        | Data       | Yes         | —                | Tab‑separated                                                                      |
| Excel      | Data       | Yes         | `export-xlsx.js` | Lazy‑loaded, inline strings                                                        |
| HTML       | Rich text  | No          | —                | Book reader view, styled paragraphs                                                |
| HTML Table | Data       | Yes         | —                | `<table>` with `<thead>`                                                           |
| Word       | Rich text  | No          | —                | HTML saved as `.doc`                                                               |
| EPUB       | Rich text  | No          | `export-epub.js` | Lazy‑loaded, embedded font                                                         |
| YAML       | Structured | —           | —                | `id` + `fields` per row                                                            |
| TOON       | Structured | —           | —                | Hadithmv compact notation                                                          |
| XML        | Structured | —           | —                | `<book>` / `<row>` / `<colN>`                                                      |
| PDF        | Rich text  | No          | —                | Print‑only (window print)                                                          |
| PNG        | Screenshot | —           | —                | Canvas render of the current visible row (2×) — one row only, never the whole book |

**Rule:** data formats (CSV, TSV, Excel, JSON, HTML Table) include the CSV header row. Rich‑text and structured formats do not.

The toolbar and pagination rows are wrapped in a `.horizontal-scroll-wrap` container with `padding: 0 var(--arrow-gutter, 30px)` that provides space for absolutely‑positioned ◀▶ arrow buttons at the edges. The row itself handles horizontal scrolling (`overflow-x: auto`, hidden scrollbar). Mouse wheel over the wrap is redirected to horizontal scroll on the row. When the row overflows, direction‑aware arrow buttons appear at the edges: ◀ at the end (scrolls toward end), ▶ at the start (scrolls toward start). Arrows are hidden at the appropriate extremes. Both arrow clicks and mouse‑wheel redirection animate smoothly via the same `requestAnimationFrame` loop with an ease‑out‑cubic curve (300ms). Arrow visibility updates on scroll, resize, and after the reader wrapper becomes visible.

**Position readouts — there are TWO, easily confused:**

- **Pagination strip** (top, in `updatePagination` → `pageSelectHTML`, `#readerPageNumbers`): the total/current page input (`<input class="page-strip-sel">` with a `total /` prefix, no page label). **No percentage — do not add one here.** The input is typing‑only: native number spinners are hidden (`.page-strip-sel`), arrow keys don't step it (keydown `preventDefault`), and `updatePagination` **never rebuilds `#readerPageNumbers` while the input is focused** — rebuilding would destroy focus and wipe the typed digits (focusing the box can itself trigger a scroll → `updatePagination`). Enter/blur commits via the `change` handler → `goTo`. The reader's ←/→ navigation is RTL: **left = next row, right = previous row** (do not "fix" it back to LTR).
- **Scroll pill** (bottom‑center, `#scrollCounter`, rendered in the scroll handler): `total / current` plus the muted `sc-pct` reading percentage (e.g. `27%`), using the same `pct` variable the milestone toasts use. **This is where the percentage lives** — a user‑explicit preference. Both variants (standard and the Quran surah : ayah form) carry the `sc-pct` span.

### Focus mode

Toggled via the green ▾/▴ button in the topBar or `Alt+Z`. Shared across both pages via `window.setFocus(on)` in common.js; persisted to `localStorage.focus`. Dispatches a `focuschange` CustomEvent for page‑specific layout recalculations.

**Reader:** Split like the dashboard for a shared structure, but focus hides the whole chrome: `#collapsibleReaderPanel` (functions, pagination, Quran nav) collapses via CSS Grid `grid-template-rows: 1fr → 0fr`, the search row snaps off (`display: none` — it holds the RDF books' header filter; non-RDF books hide it at load), and the shell sheds its padding and border. Only the topBar and reader content remain.

**Dashboard:** Collapses `#collapsibleDashboardPanel` (tags + functions) via `max-height` transition. The search bar stays visible. The book grid remains fully interactive.

### Themes

Three themes via `[data-theme]` attribute: `light` (default), `dark`, `sepia`. All colors are CSS custom properties. Selectable from settings modal. Persisted, applied before paint via blocking `<script>` in `<head>`.

### Settings modal

Opened from the sidebar. Cards for Appearance (theme dropdown, content width dropdown), Font (size ±, family dropdown: Hadithmv/System — always English), Language (select dropdown). The ↺ Reset button in the modal header is a **confirmed factory reset** — it clears settings, pins, and history (message: "Reset all settings, pins, and history? This cannot be undone."). The dashboard and reader resets are view-only and preserve pins/history. Modal has `overscroll-behavior: contain` and body scroll is locked when open to prevent background scroll bleed.

### Info modal

`src/js/book-info.js` owns a three-tab modal opened four ways: clicking the reader's book title, its Arabic subtitle (Dhivevi layout — a bordered page-background button sharing the author line's style rule) or `Alt+I` (Book tab), clicking the reader's author line (Author tab — the old dashboard-filter jump is gone), and the ℹ button on each author row in the Authors browse modal (Author tab, stacked over the authors modal — Escape closes innermost-first). It is a `.info-modal` variant of the shared modal layer (`createModal("infoOverlay", …)`, `openModal`/`openModalOnTop`), sharing the full-size geometry rule with the search-window modal family (`min(1200px, 95vw)`, `92vw`-capped at ≤600px) so stacked modals always measure identically. The shell is one flex band (`.info-tab-band`): the tab row inline-start, the action buttons (copy + copy-link + the four exports) inline-end — the band wraps when the two don't fit side by side, dropping the actions onto their own line, still far-end. The band's 2px underline is the active tab's seat: tabs pull down 2px (`margin-bottom: -2px` over a transparent 2px border) so the accent rests ON the line, and the floating actions (and the mobile toggle) float the same 2px above it (`margin-bottom: 2px`) instead of hugging it. ≤600px the actions collapse behind the reader's 📥 export chip (`.info-actions-toggle` — the same `btnExportText` label, `aria-expanded`/`aria-controls` on `#infoActions`) and open as an anchored dropdown menu over the search row (absolute under the band, card look — the reader's export-menu pattern; Copy and Copy link lead the menu, the hairline separates them from the four formats). The menu is transient like the reader's own — an outside click, picking an item, or a tab switch closes it; the band itself never changes size.

**The same shell doubles as a page: `src/books/info.html`.** `openInfoPage(cfg)` wires the identical tabs/panes into a `#infoPageShell` container with no overlay, and the page resolves `cfg` from its query string (`?book=CODE`, `?author=CODE`, `&tab=works`). It is the deep-link target behind every info export and the copy-link button — the exports print `infoLink()` (`INFO_PAGE_HREF` derived from `import.meta.url`, so it works from the reader, library-search, and dashboard alike). Because the page renders only registry facts + notes, a book's info never fetches its content CSV (the reader's rows/chapters counts need it — they are not part of the page); unknown codes show the quiet placeholder, a bare visit the empty-state line with the shell tucked away. The page keeps the full actions row — copy, copy-link and the four exports run here exactly as they do in the modal (the copy-link button copies the page's own deep-link URL) — and its inline styles only let the pane flow with the body; the top bar is the site's chrome — a full-bleed sticky strip whose contents sit in the centered `--content-width` column, laid out like `#topBar` (the bar itself LTR — the back button at the start, the title centered in the flex space, `safe center` on overflow; the body stays RTL for the pane below). The modal's look (RTL shell + the Hadithmv webfont) lives in the base `.modal` rule — the page has no `.modal` wrapper, so it carries `direction: rtl` + `var(--font-mixed, …)` on the body itself and loads **reader-search.css** for the search row's shared wrap (id-scoped rules never leak). Tab switches **pushState** (`?book=` / `?author=` / `&tab=works` — each switch a history entry), so the URL always names the pane, a refresh keeps it, and back/forward step through the tabs: the module's `popstate` listener (page mode only) re-resolves the query string via `openInfoPageFromLocation()`. The modal never touches the host page's URL.

- **Book tab** — facts derived from the registries at open time (titles AR/DV/EN, author line + years/century/age from `book-data.js`'s author helpers, tags via `extractTags`), plus the book's note file `static/notes/works/{bookCode}.md` when it exists (lazy fetch, 404 → quiet "No notes yet" placeholder).
- **Author tab** — the bio `static/notes/authors/{authorCode}.md` and a fact strip (AH years, CE span, century, age).
- **Works tab** — the author's other works (registry rows whose authorCodes include the code, `-HDN` variants excluded) with deep links into `reader.html?book=CODE`; the "Show all works by {name}" link goes to `index.html?authors=CODE`. A third tab, hidden when the modal has no author.
- **Notes are language-invariant** — one file per book/author shown identically in all three site languages; each paragraph/heading/list carries `dir="auto"` for mixed Arabic/Thaana/English bidi (the lists too: an RTL list holding LTR items renders its outside-position markers ~20px past the list edge — the pane's phantom horizontal overflow). The markdown subset: `#`→h2 / `##`→h3 (TOC links when 2+ headings), `-`-led lines → list, blank-line paragraphs, inline `**b**`, `*i*`, `[label](url)` (external, `_blank`), `[[book:CODE]]` (reader deep link titled via `getBookTitleSync` — DV-primary). Everything else renders literally after `escapeHTML` — same trust boundary as the CSVs.
- **In-modal search** — fixed bar re-targeting the active tab: live `<mark>` highlighting, "N matches" count before navigation and "k / N" position while stepping (the count _is_ the mark count — one counting path), ▲/▼ triangle buttons (the scroll-row triangle family; previous match = up, next = down — direction-neutral, so no RTL mirroring; the pair sits 2px apart inside the row's 10px gap, reading as one stepper) plus Enter/Shift+Enter cycle the matches, each step scrolling the pane to the term (`scrollIntoView` block `center`), quiet "No matches" line, and a clear ✕ (the search window's shared `.search-input-wrap`/`.search-clear-btn` component — visible only with a query, click clears the field and unwraps the highlights); the query survives tab switches. The same component also serves the two facet-browse modal filters, the library-scope picker's filter, and the Quran reader's surah selector — every search box in the app (info modal, dashboard, reader, library-search page, search window, both facet modals, lib scope, surah selector) shares one ✕ implementation; there is no search box without it.
- **Copy & export cover the active tab** — 📋 copies the pane's plain text (markdown markers stripped, inline markup kept literal) with blank lines **at the structural boundaries only** — the plain-text array carries `""` entries pushed by the tab builders (head → facts → tags → notes) and by the markdown renderer for blank source lines (paragraph gaps), then joins with `"\n"` — so the gaps sit exactly where the rendered sections have them, not between every line; the 🔗 copy-link button copies `infoLink()` — the same URL the exports print — raw and unescaped (the clipboard is not HTML, so a Works-tab link keeps its literal `&tab=works`; inside the exports the same query survives as `&amp;`). The format menu exports Word / PDF / HTML Book / EPUB only, reusing `src/js/export.js`'s shared builders (`buildWordHTML`/`buildPdfHTML`/`buildHtmlBook`/`exportEPUB` + `downloadFile`) fed by pane sections under a synthetic `headInfo`/`bodyInfo` header — byte-identical machinery to the reader's own exports, **kind-first filenames** (`book-info - <title>.doc`, `author-bio - <name>.doc`, `author-works - <name>.doc` — no language tag, no version stamp). Every export (reader and pane alike) opens with a **title page** — kind line (info exports only, `infoExportKind*` keys), hairline (`hr.title-sep`), the name pair (h1 at 22pt over the 17pt Arabic subtitle), hairline, `Hadithmv - v6.9.85` + the site URL **as a live link** (an `<a href>` on the Word/PDF/HTML title pages and the EPUB cover — href and text share one escaped string; `color:inherit` + no underline in the builders' CSS), then — info exports only — hairline + the fact strip (`exportExtra.facts`, out-of-band, never a section; the tags fact is dropped from the exported facts — the pane and copy keep it). The page break is a real-character `<p class="page-break">&nbsp;</p>` with `page-break-before: always` — Word ignores a page break on an empty div, so the break element carries a character. A **Contents page** follows (same break) when there are 2+ entries (the pane's markdown headings; the reader's head/kitab/bab rows), then the content on its own page; in EPUB the cover plays the title page (same group order and hairlines) and the nav doc the Contents. The pane's fact strip is a two-column grid (labels column, values column) with a colon on every label — `factRow` appends `":"` and emits label/value as sibling divs, so the grid's auto-flow pairs them row by row and the columns can never drift; the century fact is labeled (`Century:`) with the **bare number** as the value (`2`, never `Century: Century 2`); the clipboard carries the same label + bare-number shape.

### Font scaling

Two CSS custom properties are JS-set and user-adjustable; the panel pair are **derived tokens** computed from them in CSS:

| Variable                    | Default                                             | Controls                                    |
| --------------------------- | --------------------------------------------------- | ------------------------------------------- |
| `--reader-font-size`        | `1.25rem` (JS, no `:root` value)                    | Reader content text                         |
| `--reader-font-size-mobile` | `1.1rem` (JS, ×0.88 of the setting)                 | Reader content on mobile                    |
| `--panel-font-size`         | `calc(var(--reader-font-size, 1.25rem) * 0.68)`     | All panel UI text (buttons, inputs, labels) |
| `--panel-font-size-mobile`  | `calc(var(--reader-font-size, 1.25rem) * 0.612)`    | Panel UI on mobile                          |

`common.js` writes only the reader pair (before paint). The panel pair are one `:root` calc each — the old JS ×0.68-then-×0.9-rounded chain folded into CSS (the sub-pixel rounding is gone: 0.765rem = 12.24px, not the old 0.77rem) — so every panel label tracks the reader font automatically. One `@media (max-width: 600px)` block swaps `--panel-font-size` to the mobile value on `:root`, shrinking every panel label in the app at once (modals, info page, toolbars); the per-page overrides are gone. **The swap works only because nothing writes the panel tokens inline** — an inline `--panel-font-size` beats the media rule and pins the desktop tier at every width; the Settings font-reset button is included and must keep setting only the reader pair.

Button labels render at `var(--panel-font-size)`. Two fixed tiers sit outside that scale: **standalone glyph buttons** (modal-close, sidebar-close, search-clear, font-adjust, menu-btn, the back buttons, the info nav triangles) use the **glyph tier** `1rem` (16px) regardless of reader size, and **inline chevrons** (scroll arrows) use `min(var(--panel-font-size, 0.85rem), 1rem)` — they track the labels but cap at 16px so an extreme reader-font setting can't outgrow the 24px scroll pill. The reader header's author/subtitle buttons are panel-tier labels at `font-weight: 400` — meta text wearing button chrome, not the rows' semibold 600.

Controls stay a fixed `var(--control-height, 35px)` tall at any font size — only text scales. The Settings → Font ± control sets the reader pair; Reset restores their defaults. The fixed design sizes live in the `--fs-*` scale (see UI & theming → Control sizing).

### Persisted state

Settings and small state live in `localStorage` (table below). **IndexedDB** is used for exactly two things, both validated against a content-hash version stamp: the **on‑device book cache** in `csv.js` (`fetchBookCSVCached`) — parsed book CSVs stored keyed by `bookCode`, validated against the registry `version` hash — and the **search index cache** in `library-search-engine.js` (the separate `hadithmvSearch` DB, keyed by a fixed id, validated against the index's own `meta.version` hash). Cache hit + version match → read locally with zero download/parse; mismatch or empty version → fetch, parse, refresh the cache. Every failure path degrades to a plain fetch. Only book CSVs and the search index are cached (registries are small and change often). No sessionStorage or cookies. In‑memory caches (`bookNamesCache`, `tagDefinitionsCache`) are populated at startup and never written to disk.

| Key            | Where used  | Shape                                 | Notes                                           |
| -------------- | ----------- | ------------------------------------- | ----------------------------------------------- |
| `theme`        | `common.js` | `"dark"` / `"sepia"` / `""` (light)   | Applied before paint to avoid flash             |
| `contentWidth` | `common.js` | CSS value (`"800px"`, `"none"`, etc.) | Content area max‑width                          |
| `fontSize`     | `common.js` | CSS value like `"1.25rem"`            | Reader font size                                |
| `fontSystem`   | `common.js` | `"1"` or `"0"`                        | `"1"` = system font, `"0"` = Hadithmv           |
| `lang`         | `i18n.js`   | `"dv"` / `"en"` / `"ar"`              | UI language                                     |
| `focus`        | `common.js` | `"1"` or `"0"`                        | Focus mode (shared across reader and dashboard) |

| `reader:hideTashkeel` | `reader.js` | boolean (JSON) | Tashkeel visibility |
| `reader:hiddenColumns:{bookCode}` | `reader.js` | `[int, ...]` (JSON) | Indices of hidden columns — **keyed per book** (a global key leaked hidden indices across books; see the `-HDN` convention) |
| `searchHistory` | `search-utils.js` | `[string, ...]` (JSON) | Recent search queries (max 20) — **one shared store**: the reader's search window (this-book and all-books) and the library-search page all record on every applied search; key defaults when none is passed |
| `dash:searchHistory` | `search-utils.js` | `[string, ...]` (JSON) | Recent dashboard (book list) search queries (max 20) — the index page records on every applied search / history-item click |
| `pinnedBooks` | `pins-history.js` | `[{bookCode, row, addedAt}, ...]` (JSON) | Pinned books (max 10). **One entry per book.** The reader's 📌 button toggles (pin / unpin); while pinned, the entry's row auto‑updates as the user reads (the 2 s scroll debounce calls `addPin` on the pinned book — see the dashboard section). Any future multi‑pin feature must change this model |
| `readHistory` | `pins-history.js` | `[{bookCode, row, ts}, ...]` (JSON) | Reading history (max 10) |
| `reader:quranShowAyahNum` | `reader.js` | boolean (JSON) | Show ayah number decoration |
| `reader:quranShowBraces` | `reader.js` | boolean (JSON) | Show Quranic braces decoration |
| `reader:quranShowNumBrackets` | `reader.js` | boolean (JSON) | Brackets around number only (not ayah text) |

The settings reset button clears all of the above and resets language to Dhivehi. Keys prefixed with `reader:` are scoped to the reader page and are not touched by dashboard-level operations. Dashboard keys (`pinnedBooks`, `readHistory`) are separate — the prefix convention prevents accidental cross-contamination.

> **When adding new persisted state**, add a row to this table, add the key to `window.LS_KEYS` in common.js, and use a `reader:` prefix for reader‑specific keys. Prefer `window.LS_KEYS` over raw string literals for any key listed here (some older call sites still use the raw strings directly). This is the single reference for porting to desktop, mobile, or other platforms.

### Internationalisation

`src/js/i18n.js` exports `t(key)`, `setLanguage(lang)`, `initI18n()`. Static HTML uses `data-i18n` attributes; dynamic text calls `t()`. A `languagechange` CustomEvent triggers re‑render. Language persisted to `localStorage`.

### Directionality (RTL / LTR)

Two independent direction systems coexist, and confusing them is the root of most RTL bugs:

1. **UI chrome** — follows the selected UI language (dv/ar → RTL, en → LTR). `<html>` carries no `dir`; direction is set per element, so the default is LTR and every RTL element is an explicit decision.
2. **Content fields** — each field has its own language regardless of the UI language (book titles, reader rows). The reader already sets `dir` per field; `.title-*` rules carry their own `direction` (shared by book cards and library results).

Chrome elements follow this decision table:

| Situation                                                   | Mechanism                                                    |
| ----------------------------------------------------------- | ------------------------------------------------------------ |
| Layout container holding RTL chrome (input, chips rows)     | `direction: rtl` on the container                            |
| Single chrome line, language-dependent (summary, count)     | `dir="auto"`; pin `text-align` when position matters         |
| Fixed-language content field (ar/dv/en titles, reader rows) | explicit per-field direction (already the reader's pattern)  |
| All-Thaana or all-Arabic text                               | nothing needed — strong-RTL renders correctly in any context |

Why this is a silent trap: Thaana and Arabic are strong-RTL scripts, so a single word or phrase renders with correct glyphs even inside an LTR line — a wrong base direction shows up only as a reversed reading order (the eye enters at the right edge) or a mis-anchored line, neither visible at a glance. `dir="auto"` resolves the base direction from the first strong character, which is why it is the default for single-line chrome text that mixes scripts with digits (e.g. `libResultSummary`). Note that `text-align: start` follows the resolved direction — pin `text-align` explicitly wherever the line's position must be stable. `applyDocumentLang` sets both `lang` and `data-lang` on `<html>`, enabling `:lang()` selectors if generic CSS direction rules are ever needed.

### Keyboard

| Key             | Context                | Action                                              |
| --------------- | ---------------------- | --------------------------------------------------- |
| `←` / `→`       | Reader                 | Next / previous row (RTL: content flows right→left) |
| Swipe right     | Reader (mobile)        | Next row                                            |
| Swipe left      | Reader (mobile)        | Previous row                                        |
| `Home` / `End`  | Reader                 | First / last row                                    |
| `↑` / `↓`       | Search window input    | Navigate results                                    |
| `Enter`         | Search window input    | Follow the selected result                          |
| `/` or `Ctrl+F` | Anywhere               | Open search window (RDF: header filter)             |
| `Ctrl+Shift+F`  | Anywhere               | Open search window, advanced expanded               |
| `Alt+Z`         | Reader                 | Toggle focus mode (same as ▾/▴ button)              |
| `Alt+T`         | Reader                 | Toggle tashkeel                                     |
| `Alt+V`         | Reader                 | Cycle view mode (Card → Table → Parallel → Card)    |
| `Alt+P`         | Reader                 | Toggle bookmark (pin)                               |
| `Alt+S`         | Reader                 | Share link                                          |
| `Alt+E`         | Reader                 | Open export dropdown                                |
| `Alt+I`         | Reader                 | Open the info modal (Book tab)                      |
| `Ctrl+,`        | Anywhere               | Open settings                                       |
| `Ctrl+B`        | Anywhere               | Back to book list                                   |
| `Escape`        | Sidebar/modal/dropdown | Close                                               |
| `Escape`        | Dashboard search       | Clear search & blur                                 |
| `z`             | Dashboard              | Toggle focus mode                                   |
| `p`             | Dashboard              | Open pins modal                                     |
| `h`             | Dashboard              | Open history modal                                  |

Dashboard keyboard shortcuts only fire when the dashboard is visible. Tag chips, badges, book cards, table rows, toolbar buttons, and page titles all carry `title` tooltips describing their action or category.

## Data shape

### 03-registry-bookMeta.csv

| Column             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bookCode`         | Unique identifier, doubles as the data CSV filename. Format: `PRIMARY-bookName[-SUFFIX]` — the **primary tag** is the first segment, registered in `01-registry-bookTags.csv` (a book may have no primary). `-HDN` / `-DSC` are suffix flags, not tags                                                                                                                                                                                                                                                                                                                             |
| `authorCode`       | **Optional** — comma‑separated author codes from `02-registry-bookAuthors.csv` (one per contributor, e.g. `nawawi`). Drives the author line on cards (joined with the script‑appropriate comma — latin "," in English, "،" in Dhivehi/Arabic) and the reader header's one‑button‑per‑author line (each button opens that author's info), the EPUB `dc:creator`, and the shared Authors/Periods browse filters (library page, dashboard, search window). Empty = no author line. Sits **immediately after** `bookCode`, before the titles — see the version‑last invariant under 03 |
| `titleAR`          | Arabic title                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `titleDV`          | Dhivehi title                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `titleEN`          | English title (used for `<title>` and page heading)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tags`             | **Secondary tags** — comma‑separated tag codes from `01-registry-bookTags.csv` (e.g. `DFK,QRUL`). The primary tag lives in the code prefix; everything else goes in this column                                                                                                                                                                                                                                                                                                                                                                                                    |
| `excludeFromIndex` | **Optional** — comma‑separated header names to skip in the cross‑book index (case‑insensitive). `-HDN` and row‑number columns are always skipped regardless. Empty = all columns indexed. Build-only                                                                                                                                                                                                                                                                                                                                                                               |
| `version`          | **Content hash** (first 12 hex chars of SHA‑256) of the book CSV — filled by `04-update-bookRegistry.ps1` on every run. The reader validates its on‑device IndexedDB cache against it; empty = cache bypassed                                                                                                                                                                                                                                                                                                                                                                      |

**Virtual books** (e.g. `RDF-all`) have a registry row but **no content CSV** — the `version` field stays empty (03 writes it only when a file exists), and 03's missing-file warning is silenced via its `$virtualBooks` list. Rows are assembled in memory at load — see "Virtual merged books".

**`excludeFromIndex` magic value:** `ENTIRE-BOOK` (case‑insensitive) skips the whole book from the cross‑book index — it stays fully visible in the dashboard and reader but is never searchable, and its postings are not emitted at all (shrinking the index). Other names in the same cell are ignored; `ENTIRE-BOOK` wins.

### 01-registry-bookTags.csv

| Column      | Description                                                                  |
| ----------- | ---------------------------------------------------------------------------- |
| `tagCode`   | Tag code — used as a bookCode primary prefix OR a value in the `tags` column |
| `labelAR`   | Arabic display name                                                          |
| `labelDV`   | Dhivehi display name                                                         |
| `labelEN`   | English display name                                                         |
| `aliasesAR` | Extra Arabic search words (optional)                                         |
| `aliasesDV` | Extra Dhivehi search words (optional)                                        |
| `aliasesEN` | Extra English search words (optional)                                        |

Tag labels are **data, not code** — the registry is the single source of truth for all three languages (the same pattern as `03-registry-bookMeta.csv`'s `titleAR/titleDV/titleEN`). `book-data.js` loads each tag as `{label: {dv,en,ar}, aliases: {dv,en,ar}, palette}` and `tagLabel()` picks the right language at render time; `src/js/i18n.js` carries no tag strings.

**Aliases** are search-only words that should match the tag's code — names beyond the label (e.g. RDF: `Radheef,Lexicon`). Comma-separated lists go in a **quoted cell** (`"Radheef,Lexicon"`) — the parser handles quotes. They never render on badges; they join the search matching (dashboard search box + scope-modal filter, all languages at once) via `tagSearchWords()`, which appends each book's tag labels + aliases to the query haystack.

**Aliases are word-level only — script-level equivalence lives in `normaliseForSearch` (search-utils.js), not here.** The normaliser already makes labels match their hamza/tashkeel variants (أإآٱ→ا, ى→ي, ؤ→و, marks stripped), Thaana thikijehi forms (ޙ→ހ …), and the Arabic definite article (guarded word-initial ال-strip: refused before ل — الله/اللهم — and for 1-letter remainders — أَلْف). An alias that normalises to the label's own normalised form (e.g. ޙަދީސް ≡ ޙަދީޘް, القرآن ≡ قرآن, الأحاديث ⊂ الحديث) is dead weight and should not be added — the CSV keeps only genuinely different words (transliterations, plurals, synonyms, alternative spellings like ކުރްއާން where ކ ≠ ގ). Article-typed Arabic now matches through the normaliser too. **Fuzzy widens the boundary: the filter boxes are always‑fuzzy (scoreFilterTokens — length‑scaled: ≤ 2 edits for 6+ char terms, ≤ 1 for 4–5, exact below), so an alias within its term's scaled tolerance of its own label is also dead weight — the label already catches it.** Verified current state: every remaining alias is > 2 edits from its label.

Tags are auto‑assigned a colour using golden‑ratio HSL hue rotation (`n × 137.5°`), where `n` is the tag's **ordinal position among code-bearing rows**. A `<style>` tag is injected at load time with enough slots for all current tags plus headroom. Each slot has light/sepia and dark‑mode variants. Adding a new tag is just one `code,labelAR,labelDV,labelEN` row — no colour‑picking, no code, no limit on tag count. Because the slot follows tag order, the palette is stable — `04-update-bookRegistry.ps1` never rewrites this file; reordering rows by hand is the way to reorder colours. **The slot is also the display order**: every rendered tag row (dashboard chips, library-search chips, the scope-modal rail and its book groups) sorts by palette slot, so the file's row sequence is exactly the order the user sees.

**Format rules.** Blank lines are dropped by `parseCSV` (the loader's second guard, `if (row.tagCode)` in `book-data.js`, skips anything that slips through) and consume no palette slot — use them freely to group related tags. **Never add comment lines** (`# …` or any non-tag text): the parser has no comment syntax, so such a line parses as a phantom tag with a truthy code, eating a palette slot and silently shifting every colour after it. A stray `,` line is harmless (empty code → skipped).

### 02-registry-bookAuthors.csv

| Column       | Description                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `authorCode` | Author code — referenced from 02's `authorCode` column, one token per contributor, comma‑separated for co‑authored works        |
| `nameAR`     | Arabic display name                                                                                                             |
| `nameDV`     | Dhivehi display name                                                                                                            |
| `nameEN`     | English display name                                                                                                            |
| `bornAH`     | Hijri birth year (**optional** — blank when unknown)                                                                            |
| `diedAH`     | Hijri death year (**optional** — blank = living; also the **modern** era bucket: death in the 15th century AH (1401) and later) |

Author names are **data, not code** — same single-source-of-truth pattern as tags. `book-data.js` loads each author as `{name: {dv,en,ar}, bornAH, diedAH}`; `bookAuthorLine()` renders the display line ("al-Bukhari (–256 AH)") in the current language — multi-author books joined with the **script-appropriate comma** (latin "," in the English layout, the Arabic comma "،" in the Dhivehi/Arabic ones, via `authorListSeparator()`); `bookAuthorParts()` gives the same per-author pieces for the reader's one-button-per-author header; `bookAuthorNames()` the portable English names for the EPUB `dc:creator`. **Row order is the author list's display order** (chronological by death year in the current file) — hand‑controlled, never rewritten by 03.

**Years are Hijri AH**, stored as plain numerals (no "AH" suffix — that is added by the i18n template at render). The **period facet is derived, never stored**: a book's period bucket is `Math.ceil(diedAH / 100)` (the Hijri century of death), except that a death in the **15th century AH (1401) and later — and a blank `diedAH` — both land in the single `modern` era bucket** (the modern/contemporary authors are one period, not split between a "Century 15" row and a "Modern" catch-all). The `modern` bucket's row renders the open-ended "(+15)" marker on its name (the opening century — `MODERN_PERIOD_CENTURY` in `src/js/book-data.js`, the plus leading the number) and its range columns show the open-ended "from" forms: "+1401 AH" (the 15th century's first year) and the Gregorian equivalent derived by the app's own conversion (`Math.round(1401 × 0.970229 + 621.57)` = "+1981 CE"). Century labels (1st–14th) live in `src/js/i18n.js` (`century1`…`century14`, `centuryModern` = Modern / معاصر / ފަހުގެ), not in the CSV.

**Format rules.** Same as tags: blank lines are fine, no comment syntax, no trailing newline. Only authors with books in the collection render in the Authors browse modal — registry rows without books stay invisible.

### data/content/{bookCode}.csv

First row is always the header row. For a representative sample, see `AQD-nawaqidulIslam.csv` — a small file covering the common column patterns (`headAR`, `bodyAR`, `headDV`, `bodyDV`, `foot`). If column 0 is `#` or blank it's treated as row numbers (hidden from content, shown as `#N` labels in the card view). Otherwise column 0 is regular content. Column headers ending with `-HDN` (case-insensitive) are hidden by default — the reader starts with those columns toggled off (they can still be turned back on via the column dropdown). Consecutive blank lines within a cell are collapsed to a single line break; both `\r\n` (Windows) and `\n` (Unix) line endings are normalised before collapsing.

## Tag system

Every book has a **primary tag** (the first registered prefix segment of its `bookCode`) and zero or more **secondary tags** (the `tags` column in `03-registry-bookMeta.csv`, comma‑separated codes). `extractTags(bookCode, entry)` reads both: the primary from the code, the secondaries from the registry row's `tags` column. Tags drive the dashboard chips, counts, `?tags=` filter, and badges on cards and the reader header. Each code is looked up in `01-registry-bookTags.csv`; unknown codes are silently ignored.

| bookCode                    | `tags` column | Tags (primary + secondary) | Book Name             |
| --------------------------- | ------------- | -------------------------- | --------------------- |
| `AQD-nawaqidulIslam`        | _(empty)_     | Aqidah                     | nawaqidulIslam        |
| `HDT-muwattaMalik`          | `DRFT`        | Hadith, ⚠️ Draft           | muwattaMalik          |
| `AQD-sharhuSunnahBarbahari` | `DFK`         | Aqidah, DFK                | sharhuSunnahBarbahari |
| `RDF-asmaullahilHusna`      | `AQD`         | Radheef, Aqidah            | asmaullahilHusna      |

Suffix flags are pure app conventions — `-HDN` hides the book from the dashboard, `-DSC` displays rows in reverse order. At the column level, any CSV header ending with `-HDN` (e.g. `notes-HDN`) starts hidden in the reader.

**Naming conventions:**

- `DRFT-` prefix → book gets a ⚠️ Draft badge, still visible on dashboard
- `-HDN` suffix → book hidden from dashboard
- `-DSC` suffix → rows displayed in reverse order
- `KNSH-` prefix → first line of `body*` columns styled as a heading
- `RDF-` prefix → reader defaults to table view mode

## Data model at a glance

```text
03-registry-bookMeta.csv         01-registry-bookTags.csv    02-registry-bookAuthors.csv
┌─────────────────────────┐       ┌──────────────────┐       ┌──────────────────────┐
│ bookCode, titleDV/AR/EN │       │ tagCode, label   │       │ authorCode, names,   │
│ authorCode → 08         │       │ e.g. AQD→Aqidah  │       │ bornAH/diedAH (Hijri)│
│ Defines every book      │       │ palette by order │       │ e.g. bukhari         │
└──────────┬──────────────┘       └────────┬─────────┘       └───────────┬──────────┘
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
          │              ┌────────┴───────────────┐
          │         Standard book    Quran book (QRN-)
          │         {bookCode}.csv   QRN-DATA-ayah*.csv
          │                         + QRN-{translation}.csv
          │                         (merged by row index)
          │              ┌────────┴───────────────┐
          │         Virtual book (RDF-all)
          │         no CSV — radheef-merge.js
          │         assembles 8 source books
          │         (by-name projection)
          │
    localStorage
    ├── pinnedBooks, readHistory  (pins-history.js)
    ├── searchHistory            (search-utils.js — reader window + library page)
    │   dash:searchHistory        (search-utils.js — dashboard page)
    ├── reader:hiddenColumns:{bookCode} (reader.js)
    │   reader:hideTashkeel, etc.
    ├── theme, fontSize, lang,    (common.js)
    │   contentWidth, focus
    └── window.LS_KEYS            (canonical key registry)
```

## Virtual merged books

A **virtual book** has a registry row in `03-registry-bookMeta.csv` (card, tags, reader routing) but **no content CSV** — its rows are assembled in memory at load. The only current example is **`RDF-all`** (الجامع في المعاجم / އެއްކުރެވިފައިވާ ހުރިހާ ރަދީފުތައް / Collection of All Dictionaries): the combined radheef dictionary over the eight source radheef books.

`src/js/radheef-merge.js` (`loadMergedRadheefBook`) is the assembler, wired into the reader's load path (`loadBookData()` in reader.js) after the Quran branch. Contract per source book:

- **By-name projection** — every source row is projected into the merged schema `wordAR, wordDV, wordEN, meanAR, meanDV, meanEN, source`, matched **by header name**. A source column lands in the target column with the same name; columns without a same-named home (eegaal's `pNo`, nanfoiy's `gender/approvedBy/originLang`, rasmee's technical columns, …) are left out. A source's column _order_ is irrelevant.
- **Block order = `MERGED_SOURCES`, deliberate** — the 8 sources concatenate in `MERGED_SOURCES` array order: **rasmee leads** (it is the primary Dhivehi dictionary, so the merged book opens on it), then the remaining seven follow 02's alphabetical sort (case-insensitive): fahmy, asma, eegaal, maniku, misc, nanfoiyComb, W2W. The order is a design choice, not alphabetical — change it only on purpose; every consumer (row indexing, `?row=` deep links, the rasmee tint's first-block visibility) follows this array. No client-side row sorting exists anywhere; file/concat order is reading order.
- **`source` column** — each row's 7th cell carries its book's **Dhivehi title**, read from the registry at load (`getBookTitleSync`) — derived, never stored or hardcoded.
- **Caching** — sources load through the normal `fetchBookCSVCached`, each keyed by its own registry `version`, so an edit to any source book shows up here automatically with nothing to re-run; no merged file exists to go stale.
- **Index** — `excludeFromIndex: ENTIRE-BOOK` keeps the merged book out of the library search index (like all RDF books): a postings index over dictionaries would dwarf the rest of the site. Its search runs inside the reader over the loaded rows — see "Search" below (RDF books get the in-place filter).
- **Rasmee rows stand out** — rows whose `source` is the RDF-rasmee book carry `merged-row-rasmee` (`reader.js` `mergedRowRasmeeClass`, source cell compared against `getBookTitleSync("RDF-rasmee")` — content-derived, never hardcoded), tinted with the site's one content wash (`--color-wash-bg` in common.css — theme-aware, the _same_ token Arabic-original content uses via `isArabicColumn`, so both tint families share one definition and cannot drift apart) in both card and table layouts, and the `source` column renders small/muted as chrome rather than content.
- **Registry script** — 03's missing-file check is exempted for virtual books via its `$virtualBooks` list (must be kept in sync with `MERGED_SOURCES`'s home module); the version field stays empty and the row survives every run. `08-rebuild-searchIndex.mjs` reports "skip (no file)" for it.

Size reference: 152,612 merged rows in `MERGED_SOURCES` block order — 0-based block starts: rasmee 0 (53,841 rows), fahmy 53,841 (682), asma 54,523 (110), eegaal 54,633 (13,376), maniku 68,009 (2,231), misc 70,240 (41,051), nanfoiyComb 111,291 (8,784), W2W 120,075 (32,537).

## Quran data model

Books with the `QRN-` prefix (excluding `QRN-DATA-` source files) trigger Quran mode in the reader. Multiple CSV files are merged by row index — row N of every CSV corresponds to ayah N of the Quran.

An all-empty row in a QRN book is **meaningful**: it marks an ayah with no content yet (e.g. untranslated) and renders as the base columns with no book content. `loadQuranBookCSV` parses with `keepEmpty`, so these slots survive the parse and the on-device cache; `08-rebuild-searchIndex.mjs` uses the same flag so its row postings stay aligned with the reader's merged table. (Non-QRN books drop empty rows — for them an empty line is formatting, not a slot.)

### Data files

| File                           | Role                                                              | Columns                                                |
| ------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------ |
| `QRN-DATA-ayahImlai.csv`       | Base Quran text (always loaded)                                   | `ayahImlai`                                            |
| `QRN-DATA-ayahUthmani.csv`     | Uthmani script (on demand)                                        | `ayahUthmani`                                          |
| `QRN-BASE-STRUCT` (synthetic)  | Derived base columns — built at load from 04 + 05, no file exists | `juzNo-HDN, surahNo-HDN, ayahNo-HDN, basmalah`         |
| `05-registry-quranSurahs.csv`  | Surah metadata                                                    | `surahNo, nameAR, nameDV, nameEN, ayahCount, basmalah` |
| `07-registry-quranColumns.csv` | Column registry                                                   | `sourceBook, sourceCol, displayDV, displayEN`          |
| `06-registry-quranJuz.csv`     | Juz cut points                                                    | `juzNo, startSurah, startAyah`                         |
| `QRN-{name}.csv`               | Book-specific columns                                             | Varies per book                                        |

### Deriving the base columns

`QRN-DATA-ayahImlai.csv` stores only the Imlai text — one column, one row per ayah (6,236 rows). The structural columns (juz, surah, ayah number, basmalah) are **derived at load time** by `loadQuranBaseData()` from two registry tables:

- `05-registry-quranSurahs.csv` — per-surah `ayahCount` gives each surah's row span; the `basmalah` column holds the verse that opens every surah except 1 and 9.
- `06-registry-quranJuz.csv` — the standard 30 juz cut points as `startSurah,startAyah` (juz 12 opens mid-surah at 11:6, juz 13 at 12:53).

```text
05-registry-quranSurahs.csv    06-registry-quranJuz.csv    QRN-DATA-ayahImlai.csv
114 surahs (ayahCount,         30 juz cut points           (1 col, 6,236 rows)
basmalah per surah)            (startSurah, startAyah)
        └──────────────┬──────────────┘           │
                       ▼ loadQuranBaseData()      ▼
        per merged row: [juzNo-HDN, surahNo-HDN, ayahNo-HDN, basmalah, ayahImlai]
```

The derivation is a single pass over 6,236 rows with advancing surah/juz pointers — amortized O(1) per row. Surah _N_ starts after the cumulative ayah counts of surahs 1…N−1; juz _J_ starts at `surahStarts[startSurah] + startAyah − 1`; basmalah is non-empty exactly on the first ayah of surahs 2–8, 10–114. The same pass fills `_surahStartRows` / `_juzStartRows`, so `getSurahStartRow(sn)` and `getJuzStartRow(jn)` answer surah/juz range navigation in O(1) — replacing the old 6,236-row `parseInt` scans. The merged-row contract is unchanged: every merged row still carries the same first 5 columns, byte-identical to the old compiled CSV.

### Merging

Base data columns are always present. Book-specific columns are merged by row index. The `07-registry-quranColumns.csv` registry declares all available columns across all QRN books — the content modal uses this to list toggleable columns, including those from other books (loaded on demand via `loadAndInsertColumn`). Preset buttons (Main/All/Arabic/Reset) batch-toggle columns; Main and Arabic are driven by the `QRN_PRESET_MAIN` and `QRN_PRESET_ARABIC` arrays in `quran-data.js`.

**Two naming layers.** CSV headers are data identifiers AND the engine's classification keys (`ar`/`dv`/`en` suffixes for script/direction, `foot*` footnotes, `matn*`/`sharh*` card grouping, `-hdn` auto-hide). They are never translated — table/card headers show the raw identifier because it names the data, not the language. Only _selection chrome_ (the advanced-search column dropdown, the column toggle buttons) gets friendly labels, resolved by `src/js/column-labels.js` in this order: (1) the column registry above — QRN books, per current language; (2) derived from the header's camelCase tokens via the token tables in `src/js/column-tokens.js` (labels in `src/js/i18n.js` as `col*` keys); (3) raw header text as fallback. `tools/hmv-header-scan.mjs` diffs every `data/content/*.csv` header against those same token tables and fails on unmapped tokens — adding a header without a token makes the scan exit 1, so the fallback never silently grows.

```text
QRN-DATA-ayahImlai.csv (derived base cols, 6,236 rows)     QRN-bakurube.csv (6,236 rows)
┌────────────┬─────────────┬───────────┐ ┌──────────────────────────────┐
│ juzNo-HDN  │ surahNo-HDN │ ayahImlai │ │ wordAR        wordDV         │
│ ayahNo-HDN │ basmalah    │ …         │ │ …             …             │
└────────────┴─────────────┴───────────┘ └──────────────────────────────┘
      └────────── merge by row index (mergeQuranData) ──────────┘
┌────────────┬─────────────┬───────────┬──────────────────────────────┐
│ 5 base columns (fixed)   │ ayahImlai │ wordAR        wordDV         │  ← reader columns
└────────────┴─────────────┴───────────┴──────────────────────────────┘
```

Every translation CSV must have the same number of rows, in the same ayah order, as the base file — row _N_ of the translation merges into row _N_ of the reader. An untranslated ayah is an **all-empty row** (`,,,` or a blank line) — leave it in place; it renders as the base columns with no translation. `mergeQuranData` logs a console warning when a book's row count differs from the base's 6,236: a structural mistake in the CSV (rows added/removed, or a trailing newline parsing as an extra slot).

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

**Why the base columns cannot move — hardcoded indices.** Surah/ayah numbers are read at fixed positions `row[1]`/`row[2]` by index, NOT by header name, in `reader.js` (clipboard format, pin labels, scroll‑sync surah tracking) and `quran-ui.js` (`findAyahRowInFiltered`). Reordering those columns would silently break copy references, pin labels, and scroll-sync surah tracking. Do NOT "improve" these to dynamic indices as part of a refactor — it needs coordinated changes across all sites plus `findQuranColIndices` cache invalidation. (These cells are now derived from 05 + 06 at load — see "Deriving the base columns" — but they still land in `row[0..4]` of every merged row, so the positional contract is unchanged. Surah/juz _navigation_ no longer reads them: `applyQuranSurahFilter` and `goToQuranJuz` use the O(1) `getSurahStartRow` / `getJuzStartRow` accessors.)

**Adding a new Quran translation (walkthrough):**

1. Create `data/content/{bookCode}.csv` with a header row and **one row per ayah, in the same order and count as `QRN-DATA-ayahImlai.csv` (6,236 rows)** — columns merge by row index (`mergeQuranData`). Name columns with a language suffix (`*AR`, `*DV`); add `-HDN` to start hidden. Where an ayah has no content yet, leave its row empty (`,,,` or a blank line) — it renders as base columns only.
2. Register each column in `data/07-registry-quranColumns.csv` — one row per column (`sourceBook,sourceCol,displayDV,displayEN`), consecutive rows per book. The content modal lists them automatically.
3. Optionally add the book to `QRN_PRESET_MAIN` / `QRN_PRESET_ARABIC` in `src/js/quran-data.js` so the Main/Arabic preset buttons include it.
4. Register the book in `03-registry-bookMeta.csv` — or just run `data/04-update-bookRegistry.ps1`, which adds the unregistered CSV as a row with empty titles (all three titles are hand-authored), recomputes each book's version hash from its content CSV, and sorts the book registry (the tag registry is never rewritten — its row order is the palette slot assignment). Rows are rewritten verbatim — only the trailing version field is replaced — so quoted multi-value cells (tags, `excludeFromIndex`) survive untouched.

### Ayah decoration

Columns `ayahImlai` and `ayahUthmani` are rendered with configurable decoration:

| Braces | Number | Num Brackets | Output     |
| ------ | ------ | ------------ | ---------- |
| ☑      | ☑      | ☐            | `﴿text ١﴾` |
| ☑      | ☑      | ☑            | `text ﴿١﴾` |
| ☑      | ☐      | —            | `﴿text﴾`   |
| ☐      | ☑      | —            | `text ١`   |
| ☐      | ☐      | —            | `text`     |

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

Quran clipboard format: no book header line. Decorated ayah text, `[surahName surahNo : ayahNo]` reference, then columns grouped by source book — each book gets one label (from `03-registry-bookMeta.csv`) above its first column, no per-column headings.

(Table‑mode performance is documented under Reader UI → View modes → **Performance** — it is shared with the reader table, not Quran‑specific.)

## Development conventions

### UI & theming

**No external dependencies.** Everything is hand‑rolled — no npm, no CDN, no frameworks. CSS variables for theming, vanilla JS modules, a custom CSV parser (~1 KB), a custom ZIP/XLSX writer, and a custom EPUB writer. Keep it that way.

**RTL‑first.** The default text direction is `rtl` (Arabic / Dhivehi). Only UI chrome labels and English‑only text (tooltips, errors) appear LTR. New elements default to `direction: rtl` unless they are explicitly English‑only.

**CSS variables.** A value earns a var when (1) it appears in more than one place, (2) the places must stay in sync, and (3) it changes as a group. Font stacks, radius tiers, and control heights look like constants, but sync‑by‑copy drifts — six spellings of one font stack once drifted into the stylesheets. So when a value family passes the test, define it once in `:root` and consume it as `var(--name, <canonical>)` at use sites; a bare literal then becomes a grep‑checkable violation. Fallbacks are two‑tier: **value‑family tokens** (sizes, motion, radius, fonts, shadows — anything a component may be used beside) are consumed with their fallback everywhere, so a component stays self‑contained; **theme‑palette tokens** (`--color-*`) are consumed bare (`var(--color-text)`, no fallback) because the three theme blocks guarantee every colour — the palette is exactly what a theme redefines. A token with no use sites earns deletion, and a colour token you remove must be deleted from all three theme blocks at once. Never hardcode a colour: every colour comes from a CSS custom property defined in `:root` (light), `[data-theme="sepia"]`, and `[data-theme="dark"]`. If you add a new colour variable, you must define it in all three theme blocks — light, sepia, and dark. New components must be tested in all three themes to confirm they are readable and look correct. The variable naming pattern is `--color-<role>` (e.g. `--color-text`, `--color-border`, `--color-nav-btn-bg`).

**JS‑set tokens** have no `:root` value — JS writes them before paint (via `setProperty` or inline styles) and CSS consumes them with fallbacks: `--reader-font-size`/`--reader-font-size-mobile` (JS‑only; `common.js`) — the panel pair `--panel-font-size`/`--panel-font-size-mobile` are **derived, not JS‑set**: calc tokens in `:root` tracking the reader pair, and the mobile swap depends on nothing ever writing them inline (see Font scaling) — `--content-width` (reader content width, `common.js`, removed on reset), `--table-header-top` (sticky reader header offset, `reader.js`), and per‑chip `--tag-bg`/`--tag-color` (tag chip colours — inline golden‑ratio HSL styles from `book-data.js`, consumed with nested var fallbacks). These never live in the theme blocks; removing one means removing its JS setter too.

Two more var families exist purely to keep _groups_ in sync; their tokens, not the values, are the convention unit. **Z-index ladder:** every `z-index` in the stylesheets is one of the `--z-*` tokens defined in `:root` (common.css) — `--z-under` (-1, background art) through `--z-celebrate` (9998, effects), with the full ladder in between (arrow 2, base 5, sticky 6, table head 10, toolbar 50, dropdown 60, pill 100, topbar 101, sidebar overlay 199, sidebar/toast 200, modal 300). A bare `z-index` literal is a grep-checkable violation. To renumber a layer, change its token in `:root` — never a single site. **Transition durations:** every `transition` duration is one of the `--t-*` tier tokens defined in `:root` — `--t-fast` (0.1s, compact-item hovers), `--t-hover` (0.15s, standard control hovers), `--t-pop` (0.2s, toast/modal/card-lift), `--t-drawer` (0.25s, sidebar), `--t-panel` (0.3s, layout motion and theme crossfades), `--t-slow` (0.5s, progress fill). Durations change together in `:root`; the one shared easing — the expand/collapse curve `--ease-panel: cubic-bezier(0.4, 0, 0.2, 1)` — is a token too, and plain `ease` stays literal at use sites.

Besides the role palette there are three **semantic accent families**, each defined in all three themes with per-theme values: `--color-accent-*` (active menu button, dropdown checkmark — blue), `--color-focus-*` (focus-mode buttons — green), `--color-danger-*` (destructive buttons, pins badge/chips, continue bar, error text — red; `--color-error-*` aliases this family). Their hex values exist only inside the theme blocks — a component that needs an accent colour references the family vars with per-site fallbacks (`var(--color-danger-text, #dc2626)`), never a bare hex. Two more families follow the same shape: `--color-preset-*` (Quran content-modal preset buttons — one bg/text pair per preset) and `--color-success`/`--color-success-border` (progress-fill completion state, celebration border). One content-level token follows the same three-theme rule: `--color-wash-bg` — a quiet wash (a pale cool slate in light, warm sand in sepia, a lifted slate in dark) that the reader paints on content which stands apart: Arabic-original fields and cells (so Arabic text reads apart from Dhivehi at a glance — the language comes from the column-naming convention (`…AR` suffix, Quran ayah texts, basmalah) via `isArabicColumn`, no per-column registry) and the merged RDF book's Rasmee rows (`merged-row-rasmee`). One token, one treatment — the two tint families share a single definition and cannot drift apart. In card and parallel views the wash is a soft **region** (`.reader-ar-region`): the card renderer groups consecutive Arabic columns into ONE full-width region per run — `border-radius` 16px, `padding-inline: 24px 14px` (start side deliberately deepest — the webfont overhangs the pen origin ~1–5px, see Font; 24px is the max the mirror-margin trick allows before the 24px mobile gutter overflows), `padding-block: 10px` — so `headAR` + `bodyAR` read as one continuous block with no white seam between them, and short lines leave the wash full-width (no pill hugging). Footnote columns join their surrounding run or start their own region when their header is Arabic (`footAR`; unprefixed `foot` stays untinted — header convention can't tell AQD's Arabic notes from KNSH's Latin ones, by agreement). The region overhangs its chunk on both sides via `margin-inline: calc(var(--reader-gutter, 32px) * -1)`, mirroring `padding-inline: var(--reader-gutter, 32px)` so the Arabic text keeps the exact x-position of the Dhivehi fields beside it at both ends (a plain padding would shift the text; the start-side inset is deep enough to shelter the webfont's start-side ink overhang). The overhang depth is `--reader-gutter` — the reader content's horizontal padding, 32px desktop / 24px mobile, which must stay in sync with `--reader-pad` / `--reader-pad-mobile` (common.css) — so the band spans the full content column, article padding edge to padding edge, at every breakpoint. (The original design had a shallower 14px end-side overhang; it was clipped invisible and dropped, which left the wash one-sided — flush at the start edge with a page-gutter gap at the end — and shifted the Arabic line ends 14px short of the Dhivehi fields. The pocket below restored both overhangs at the gutter depth.) **The chunk pocket.** The overhang paints only because of a deliberate quirk of `.reader-chunk` (`content-visibility: auto`, see the skip-painting note): its paint containment clips children at the chunk's border box, which _cuts_ the overhang — the wash rendered exactly as wide as the field box, flush against the text with square corners. The chunk therefore gets `margin-inline: calc(var(--reader-gutter, 32px) * -1); padding-inline: var(--reader-gutter, 32px)` ("the pocket"): the margins widen the chunk's border box over both overhangs and the paddings keep the content box (fields, text) exactly where it was — the margin and padding cancel on each side — so the region's overhangs land inside the chunk's padding box — inside the clip — and paint. Non-AR chunks are unaffected (transparent background, content box unchanged). Parallel view: the AR column is already its own grid lane, so it is one region with `margin-inline: 0` (no gutter overhang); the pre-column full-width basmalah is wrapped individually. Table-mode cells keep the square wash (their own 10px cell padding; a radius would fight the row borders). Text sitting on saturated solids — active chips, confirm buttons, preset fills — uses `--color-on-solid` (white in every theme). The toast chip uses `--color-toast-*` (fixed dark in light/sepia, inverted in dark). Shadows and page chrome are also vars: `--shadow-card`/`--shadow-card-hover` hold the card/result shadow shapes (their colours stay per-theme `--color-shadow-*`), and the dashboard/library wrapper layout uses `--page-margin`/`--page-padding` with `-mobile` variants. Sticky panels hang from one shared clearance: `--topbar-clearance` is `--topbar-height` (58px, the fixed topbar's pinned bottom edge) plus `--topbar-gap` (6px of air, the same value as the row gaps). All three sticky panels — reader, dashboard, library search — lock at that offset on desktop, and each wrapper's top margin puts the panel at the same resting position (`--page-margin` for dashboard and library search, `#readerWrapper`'s `--topbar-clearance` margin-top for the reader): rest equals lock, so the top gap stays visible at every scroll position and no panel ever rides up. Because the gap is open space, the fixed topbar paints it (`#topBar::after` — full viewport width, the topbar's own background) so scrolled content never shows through the strip. All the panels share `--panel-pad` (10px, the vertical padding above their bottom border), `--panel-edge` (the 2px bottom border, `2px solid var(--color-card-hover-border)`, under the topbar and every sticky panel), and `--panel-gap` (10px — the margin between a panel's bottom border and the block below it; it equals `--panel-pad` by design so the divider carries symmetric air). Mobile drops the gap — wrapper top margins and the panels' sticky tops both fall to `--topbar-height` alone (the `-mobile` margin variants plus `--topbar-height` sticky-top overrides), so dashboard, library search and reader all start flush at the same y. Error boxes clear the topbar with `--error-clearance` (height + 24px), and the reader's wrap arrows and content padding are tokens too: `--arrow-gutter` (30px on each side of the horizontal-scroll-wrap), `--reader-pad` (12px 32px 32px) with `--reader-pad-mobile` (10px 24px 20px). Every modal/selector panel shares `--shadow-modal` (shape in `:root`, colour per theme `--color-shadow-modal`, stronger in dark mode), and modal backdrops use `--color-scrim` (per theme).

**Control sizing, spacing & radius.** Every boxed control — search inputs, buttons, selects, chips, badges, and the square icon buttons — is `var(--control-height, 35px)` tall at every breakpoint, with `line-height: var(--control-line-height, 33px)` (height minus the 2px of 1px borders; controls are border-box). Controls in one row sit `var(--control-gap, 6px)` apart; rows are separated by the same value, `var(--section-gap, 6px)`. One exception: the block directly below a sticky panel's border (the dashboard grid, library results) hangs off `--panel-gap` (10px, equal to `--panel-pad` — see the sticky-chrome paragraph above). Corners come from four radius tiers defined in `:root`: `--radius-sm` (6px — buttons, selects), `--radius-md` (8px — inputs, chips, badges, square icon buttons, dropdown menus), `--radius-lg` (12px — cards, modals), `--radius-pill` (20px — the scroll-position toast). Panel fonts use the derived `--panel-font-size` pair (calc tokens tracking `--reader-font-size` — see Font scaling; standalone glyph buttons are a fixed 1rem glyph tier outside the scale). The remaining distinct sizes form the font-size scale, one token per tier in `:root`: `--fs-micro` (0.68rem — arrows, tiny glyphs, dense table cells), `--fs-aux` (0.8rem — compact table headers), `--fs-muted` (0.9rem — meta/subtitle text, sidebar links), `--fs-text` (0.95rem — reading surfaces: table body, snippets), `--fs-title-sm` (1.1rem — sub-headings), `--fs-title` (1.15rem — page titles), `--fs-title-lg` (1.2rem — kitab tier headings), `--fs-heading` (1.3rem — sidebar title), `--fs-display` (1.5rem — chevron glyphs). The 1rem default baseline and em-relative sizes stay literal; the ornament ◆ at 0.55rem is deliberately outside the scale. All of these are defined once in `:root` (common.css) — change the standard there, never at use sites. Menu items, table cells, grids, and the mark/skeleton/scrollbar-thumb radii (2–5px) are deliberately outside the scale. Card surfaces — dashboard book cards and library search results — share one padding: `--card-padding` (16px) with a `--card-padding-mobile` (12px) variant. Card grids (dashboard book grid, reader parallel columns) share `--grid-gap` (12px — double the control-gap rhythm, so surfaces stay distinct).

**Responsive.** Single breakpoint at `max-width: 600px`. Mobile gets reduced padding, smaller font sizes, and larger tap targets — a transparent 3px `::after` overlay on boxed controls (`#topBar button`, `.toolbar-btn`, `.nav-btn`, `.col-toggle`) widens the hit area without changing the visible 35px size. Rows keep their density; on rows that scroll horizontally the vertical extension is clipped by overflow-x, so there the gain is horizontal only. The breakpoint is a sync pair: the CSS `@media (max-width: 600px)` literals must match `window.MOBILE_BP` (600, defined in common.js), which the JS uses as `window.innerWidth > window.MOBILE_BP` for desktop-only behaviours. Custom properties cannot be used in media conditions, so the two must match by convention — when one changes, change both. The reader font size is user‑adjustable via the settings modal and stored in `localStorage`.

**Font.** A single merged WOFF2 font (`static/font/merged-300.woff2`) covers Arabic, Thaana, and Latin glyphs. `font-family` stacks always list `"Hadithmv"` first, then platform fallbacks. Never load external fonts. Each family is a `--font-*` var in `:root` (common.css) — use sites are `var(--font-*, <canonical>)`, and the only literal `font-family` in the stylesheets is the `@font-face` name. Families: `--font-mixed` `"Hadithmv", "Faruma", system-ui, -apple-system, sans-serif` (any-language controls); `--font-latin` `system-ui, -apple-system, sans-serif` (Latin-only chrome); `--font-arabic` `"Hadithmv", "Traditional Arabic", "Scheherazade New", serif` (Arabic-only content); `--font-arabic-thaana` `"Hadithmv", "Traditional Arabic", "Scheherazade New", "Faruma", serif` (mixed Arabic/Thaana content); `--font-thaana` `"Hadithmv", "Faruma", "MV Boli", sans-serif` (Dhivehi titles); `--font-mono` `"Consolas", "DejaVu Sans Mono", "Courier New", monospace`. (export.js / export-epub.js embed literal stacks in generated SVG/EPUB documents — standalone files, no vars there.) Title lines: Arabic and Dhivehi share one size on every surface (cards and search results) — `calc(var(--panel-font-size[-mobile]) * var(--title-scale))`, `--title-scale: 1.2` in `:root` — while English titles stay at base; hierarchy is carried by size tier, weight, and colour. Title lines sit `--title-gap` (4px) apart, with `--title-gap-caption` (2× the base gap) before the English caption; on cards the whole title block sits at the top, with the space below coming from the card's padding.

**Start-side ink overhang.** The Hadithmv webfont paints a few horizontal
Thaana letters (ސ, ޗ, …; alef has none) with ~1–5px of ink past the pen
origin on the start side. In RTL that overhang sits at the run's right edge,
so any surface whose first glyph's pen lands on a clip edge visibly chips
the letter. Two clip rules follow: **inputs clip at the inner editor's
content box** — padding moves the text origin together with the clip line,
so only `text-indent` shelters the overhang; **divs clip at the padding
box** — `padding-inline-start` moves the origin away from the clip line and
the overhang paints into the padding. The current insets: `.search-input`
`text-indent: 6px`, `.quran-surah-search` `text-indent: 6px`,
`.search-history-item .hist-text` `padding-inline-start: 6px`,
`.search-result-snippet` `padding-inline-start: 8px`, `#topBar #pageTitle`
`padding-inline-start: 8px` (the title is `justify-content: safe center`,
so its clip only exists when the title overflows — ޙ-led titles never show
it, which is why it went unnoticed), and mobile-only
`.dash-continue-title` `padding-inline-start: 6px` (≤600px, where the
title ellipsizes to keep the continue row one line). The reader header's author
button (`#readerPageAuthor .reader-author-btn`) and the Dhivevi-layout
subtitle button (`#readerPageSubtitle .reader-subtitle-btn`) are safe without
an inset: they are content-sized (no clip), and their 12px inline padding
paints any start-side overhang inside the button. Surfaces with ≥7px of start padding
(quran table cells, pins cards, tag chips, surah list items) are safe
without insets. Insets are regression-guarded by smoke-battery section F;
measurement traps are in docs/TESTING.md "Traps from adjacent workflows".

### Horizontal scrolling & RTL

**There is NO root `dir="rtl"`.** Both pages are `<html lang="en">` with no `dir` attribute — every RTL layout comes from local `dir="rtl"` attributes on individual elements. Nothing inherits RTL, so any new element that needs it must set its own `dir`. In particular, `<input type="number">` follows the input's own direction: without an explicit `dir="rtl"` it behaves LTR (arrow keys step the wrong way) — see the pagination-strip note under "Position readouts".

The reader uses RTL (`direction: rtl`) throughout. This affects horizontal scrolling in non‑obvious ways:

**RTL scroll conventions differ by browser:**

- Chrome: `scrollLeft ∈ [0, max]` — the **start** (rightmost) sits at `max`, the **end** (leftmost) at `0`; scrolling toward the end _decreases_ it
- Firefox: `scrollLeft ∈ [-max, 0]` — the **start** (rightmost) sits at `0`, the **end** (leftmost) at `-max`; scrolling toward the end _decreases_ it
- **Both engines: scrolling toward the end always DECREASES the signed `scrollLeft`; toward the start INCREASES it.** Always use `Math.abs(scrollLeft)` for position checks, and always test scroll behavior in both browsers.

**RTL start/end terminology:**

- **Start** = beginning of content = right side in RTL
- **End** = later content = left side in RTL
- `scroll-arrow-start` (►) scrolls toward start (right). `scroll-arrow-end` (◄) scrolls toward end (left).

**`.horizontal-scroll-wrap` pattern** (used for toolbar, nav, quranNav):

```
.horizontal-scroll-wrap (display:flex, position:relative, padding:0 var(--arrow-gutter, 30px))
  ├── button.scroll-arrow.scroll-arrow-start (►)  — absolute, left:2px
  ├── .reader-panel-row   — flex:1, min-width:0, overflow-x:auto, hidden scrollbar
  └── button.scroll-arrow.scroll-arrow-end (◄)    — absolute, right:2px
```

- Arrows sit in the padding area and are absolutely positioned.
- The scrollable row is constrained to the content area by `flex:1; min-width:0`.
- `overflow:hidden` on the wrap clips content to the content area — row content CANNOT bleed into the arrow padding.
- DO NOT wrap a hidden (`display:none`) element — it has 0 dimensions and breaks layout. Wrap only after the element is visible.
- The wrap script wraps every `.reader-panel-row` at load, so rows hidden _after_ wrapping (the Quran nav row on non-Quran books — inline `display:none` in the markup; the RDF search row on every other book) keep their wrap in the flow: height 0, but the row-to-row `margin-top` still pads phantom air under the panel. Mitigation in reader.css: `.horizontal-scroll-wrap:has(> .reader-panel-row[style*="display: none"]) { display: none; }` — hides the wrap with its row, and re-shows it when the row is shown (quran-ui.js sets `style.display = ""` on show).
- Click handlers: start arrow (►) → `scrollLeft += step` (toward start/right). End arrow (◄) → `scrollLeft -= step` (toward end/left). Wheel‑down also scrolls toward the end: `scrollLeft -= deltaY`.
- **Don't re‑derive the signs — copy the reader's proven wiring**: `tableScrollBack` (▶) → `+COL_STEP`, `tableScrollFwd` (◀) → `-COL_STEP` in `reader.js`; the dashboard copy lives in `dashboard.js` (the sort row's arrows). The dashboard's `updateArrows()` uses `Math.abs(scrollLeft)` for the auto‑hide checks.
- **Exception — the reader TABLE's wheel is NOT comparable**: `tableWrap`'s wheel handler does `topScroll.scrollLeft += amount` on the _mirrored top scrollbar_, and the table follows via `translateX` from the absolute fraction (`syncTableTransform`, `Math.abs`). Different mechanism, opposite sign — do not "fix" it to match the rule above.
- Visibility: start arrow hidden when `abs(scrollLeft) < 1`. End arrow hidden when `abs(scrollLeft) > maxScroll - 2`.

**Sticky‑arrow pattern** (alternative, used for quranNav):

- Arrows are `position:sticky` children inside the scrollable flex row.
- First child (start arrow): `right:0`, sticks to right edge. Last child (end arrow): `left:0`, sticks to left edge.
- Need `align-self:stretch` + solid `background` to create a full‑height cutoff barrier.
- Need horizontal `padding` to widen the barrier beyond just the arrow symbol.

**When adding a new horizontally‑scrollable row:**

1. If it exists at page load and is visible → use `.horizontal-scroll-wrap` pattern (add to the inline script's `querySelectorAll`).
2. If it's created or shown dynamically → use the sticky‑arrow pattern, or wrap it in `.horizontal-scroll-wrap` AFTER it becomes visible.
3. Never set `wrap.style.padding = "0"` — the padding is always needed for arrow placement.
4. Never create wrapper divs inside `.reader-panel-inner` at page load for hidden elements.

### HTML & DOM

**IDs.** Element IDs use camelCase — e.g. `btnResetReader`, `searchInput`, `readerContent`. No kebab‑case or snake_case.

**Tooltips.** Every `<button>`, `<a>`, and interactive element carries a `title` tooltip describing its action. If the element has a keyboard shortcut, the tooltip includes the key in parentheses — e.g. `title="Toggle focus mode (Alt+Z)"`. Keys are written in title case (`Ctrl+B`, `Ctrl+Shift+F`). Tooltips are **always in English** and never translated.

**Inputs.** Every text/number input carries `autocomplete="off"` — the app has no form semantics, and the browser's autocomplete/autofill dropdown on an in-app modal input is noise (and can surface unrelated saved values into the search). Applies to static HTML **and** template-built inputs alike: the reader search, dashboard/library search, the surah-selector search, the Quran ayah/juz inputs, the page-strip number input (`reader-position.js`) and the advanced-search value field (`reader-search-ui.js`) all carry it. Checkboxes don't need it.

**Static text.** Any visible string in static HTML uses a `data-i18n` attribute. Dynamic text uses `t("key")`. Never hardcode a Dhivehi, Arabic, or English label directly in HTML or JS — use the i18n layer.

**HTML escaping.** Cell content renders raw as HTML **by design** — the data files are the trust boundary (RDF carries `<br>` line breaks and `<span>`/entities; e.g. `data/content/RDF-misc.csv`). Never assume a cell is plain text, and never "fix" an audit finding by escaping the render path — that would be a content regression, not a security fix. The only untrusted surface is user/URL input (query terms): input values are set via `.value` (a property assignment — the browser never parses it), and every other sink passes through `escapeHTML` or `highlightMatches` (which escapes both the surrounding text and the `<mark>` content). `escapeHTML` escapes `& < > " '` — complete since 2026-08-10 — safe in text contexts **and** quoted attributes (`value="…"`, `data-…="…"`); never splice input into an attribute raw. Known attribute sites: the advanced-search condition value (`reader-search-ui.js` renderConditionRow) and the library result card's `data-q` (`library-search-page.js`). Exports split the same way: article formats (PDF/HTML/Word) embed cells raw (they render the data format), table/XML formats escape. The info-modal notes files (`static/notes/…`) join the data files' trust boundary — raw-by-design: the markdown renderer escapes first and only the subset (`**b**`, `*i*`, `[label](url)`, `[[book:CODE]]`, `#`/`##` headings, hyphen lists) is re-interpreted; everything else renders literally (see "Info modal").

### JavaScript

**Module pattern.** All JS files are ES modules (`<script type="module">`). Heavy modules (`export-epub.js`, `export-xlsx.js`, `export-zip.js`) use dynamic `import()` — they are only fetched when the user triggers an export, keeping the initial bundle small.

**Variable style.** `var` is the default for mutable and shared closure state (function‑scoped, hoisted to the closure). `const` for read‑only DOM references and locals that never rebind. `let` only where a block‑scoped binding must rebind (loop accumulators, swap temporaries).

**Closure state (reader.js).** The reader's 1 274‑line closure centralises shared mutable state in a `STATE` object at the top. Convenience aliases (`var filteredData = STATE.filteredData`) are read‑only — mutations MUST write back: `STATE.filteredData = filteredData`. This pattern makes shared state visible at a glance without rewriting every reference to `STATE.*`. The ctx‑object pattern used by `export.js`, `quran-ui.js`, `table-scroll-sync.js`, `reader-position.js` and `reader-search-ui.js` is the same idea applied to extracted modules: each extracted module owns module‑scope state (set by its `initX(ctx)` call — the `quranState` precedent), and ctx carries plain values, callback closures, and getter/setter accessors for anything core REBINDS (`filteredData`, `hiddenColumns`, `loadedStart`/`loadedEnd` — a captured ref would go stale). Utilities (`t`, search‑utils, book‑data) are imported directly, not passed via ctx.

**Window globals.** `window.*` functions used by BOTH pages live in `common.js` (`setFocus`, `showToast`, `copyToClipboard`, etc.). Reader‑only helpers (`openDropdown`, `closeAllDropdowns`, `registerDropdown`) stay in `reader.js`. Pins/history helpers (`openPinsModal`, `openHistoryModal`) live in `pins-history.js`. Rule: before adding `window.X = …`, ask _does it serve both pages?_ YES → common.js, NO → owning module. A comment in `common.js:1‑20` documents the full inventory.

**Explicit re‑exports over `export *`.** Barrel modules (quran-ui.js) use explicit named re‑exports instead of `export *`. Adding a function to the source module requires adding it to the re‑export list — silent name collisions are impossible.

**Naming conventions.**

| Scope                      | Convention                                                                                                                     | Examples                                                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Files                      | kebab-case                                                                                                                     | `quran-data.js`, `pins-history.js`, `reader.js`                                                                                                    |
| Functions                  | camelCase                                                                                                                      | `renderRowHTML`, `buildClipboardText`                                                                                                              |
| Constants (module‑level)   | UPPER_SNAKE                                                                                                                    | `MAX_PINS`, `ROWS_PER_CHUNK`, `DEFAULT_FONT_SIZE`                                                                                                  |
| Private module‑level state | `_camelCase`                                                                                                                   | `_bookNamesCache`, `_loadedColMap`, `_historyCache`, `_lastBookNames`                                                                              |
| DOM element IDs            | camelCase                                                                                                                      | `readerContent`, `btnExport`, `dashboardPanelSearch`                                                                                               |
| CSS classes                | kebab-case + namespace                                                                                                         | `reader-field-matn`, `dash-table`, `quran-nav-btn`                                                                                                 |
| Shared CSS utilities       | `dd-` prefix                                                                                                                   | `.dd-item`, `.dd-menu`, `.dd-check` (dropdowns); `.dd-table`, `.dd-row`, `.dd-col-*` (pins/history modal table, scoped under `.pins-history-body`) |
| Custom events              | single lowercase word                                                                                                          | `readerReset`, `focuschange`, `languagechange`                                                                                                     |
| LocalStorage keys          | `reader:` prefix for reader; `dash:` for the dashboard; `searchHistory` is shared by the reader window and library-search page | `reader:hiddenColumns:{bookCode}`, `searchHistory`, `dash:searchHistory`                                                                           |

**New exports.** Each export format is an `else if (fmt === "...")` block in the export click handler in `src/js/export.js`. Follow the existing pattern: build a string or Blob, call `downloadFile()` or open a new window. Exports that produce data or table formats (CSV, TSV, Excel, JSON, HTML Table) must include the CSV header row as the first row / `<thead>`. Rich‑text exports (TXT, MD, PDF, Word, EPUB, HTML reader view) use the formatted rendering path and should not include a raw header row.

### i18n

**Key naming.** i18n keys are camelCase and describe the element or purpose — e.g. `btnExportText`, `tagAQD`, `pinsEmpty`. Add keys for all three languages (`dv`, `en`, `ar`).

**Errors and messages.** All error messages, status text, and alerts are in **English only** — they are not run through `t()` or `data-i18n`. This keeps errors readable regardless of the user's chosen UI language.

### Data & CSV

**Book code format.** `PRIMARY-bookName[-SUFFIX]`. The FIRST segment is the primary tag, matched against `01-registry-bookTags.csv`; after stripping it and the suffix flags, the remaining segment is the book name. Secondary tags live in the `tags` column of `03-registry-bookMeta.csv`, NOT in the code.

```text
"HDT-muwattaMalik"        +  registry: bookCode,authorCode,titleAR,titleDV,titleEN,tags
  │         │                                       ... ,HDT-muwattaMalik,...,...,...,...,DRFT
  │         └─ Book name (after stripping primary tag & suffix flags)
  └─ Primary tag → "Hadith" badge        tags column → "⚠️ Draft" badge (secondary)

"AQD-aqidatuNawawi-HDN"
  │        │           │
  │        │           └─ Suffix flag: hide from dashboard
  │        └─ Book name
  └─ Primary tag → "Aqidah" badge
```

**CSV column naming.** `*AR` = Arabic text, `*DV` = Dhivehi text. Heading hierarchy: `head` > `kitab` > `bab`. `matn` = main text, `sharh` = commentary, `foot` = footnotes. Column 0 = `#` means row numbers (hidden from content, shown as `#N` labels). These names drive CSS class assignment in the reader — changing a prefix changes its visual treatment.

**File naming.** A book's CSV file must match its `bookCode` exactly (e.g. `AQD-nawaqidulIslam.csv`). Control files in `data/` carry a numeric prefix for curated top-of-folder order: `NN-registry-*` for registries, grouped by domain with stable reference data first — book registries first (`01-` tags, `02-` books), the script that maintains them (`03-update-*`), then the Quran registries (`04-` surahs, `05-` juz, `06-` columns), then the global index builder (`07-rebuild-*`) — whose generated output `search-index.json` is deliberately unnumbered (machine-produced, not curated). Every control file is `NN-<verb>-<Entity>`: the entity segment deliberately uses the data model's CamelCase identifiers (`registry-bookTags`, `update-bookRegistry`, `rebuild-searchIndex`) — single-word entities show no case mixing. `QRN-DATA-ayahImlai` / `QRN-DATA-ayahUthmani` name the two Quran text sources (imlai and Uthmani scripts). The `-HDN` suffix on CSV headers hides columns by default; the `-HDN` suffix on book codes hides books from the dashboard. For a representative sample CSV, see `AQD-nawaqidulIslam.csv`.

**CSS load order.** In `reader.html`, `reader-quran.css` loads before `reader.css`. This ensures reader.css's mobile `@media` queries win specificity ties (both `0,1,0` → last one wins), so Quran nav items use the same `--panel-font-size-mobile` as all other panel controls.

**Modals.** All modals use the unified layer in `common.js`:

- **API** — `window.openModal(id)`, `window.closeModal(id)`, `window.closeAllModals()`; each overlay ID is registered in `window.MODAL_IDS`. Backdrop click and `.modal-close` are auto‑wired via `wireModal()`; new modals push their ID and wire themselves on creation.
- **Creation** — dynamic modals use `createModal(id, titleId, bodyId, extraClass)` and emit the same `.modal-header` / `.modal-title` / `.modal-close` / `.modal-body` structure as the static modals, so styling stays unified. `window.confirmModal(titleKey, messageKey, confirmKey, onConfirm)` shows a confirm dialog on the same layer (Cancel/Escape/backdrop = no; confirm button = yes, then `onConfirm()` runs).
- **Focus management** (accessibility) — `openModal` moves focus to the modal's first focusable (the ✕ close button) and remembers the trigger; `closeModal` — including the unified Escape handler — restores focus to it; a global Tab handler cycles focus within the topmost open modal so it can't wander behind the overlay. **Every modal must open via `openModal`** (not `classList.add("open")` directly) or it misses focus handling — the sidebar, advanced‑search overlay, and surah selector are separate overlay systems outside this layer.
- **Body scroll** is locked while any modal is open (`body:has(.modal-overlay.open)`).
- **List modals** — the pins/history modal renders its list as a semantic `<table class="dd-table">` (`<thead>`/`<tbody>`, `dd-col-*` classes per column, `table-layout: fixed` column widths) styled in `common.css` — identical on the dashboard and reader pages. The Quran content modal follows the same pattern with its own table.

**Dropdowns.** All dropdowns use shared helpers and shared CSS classes for visual consistency:

_Container:_ `.dd-menu` (common.css) — `position: absolute; padding, background, border, border-radius, box-shadow, z-index`. Applied alongside page‑specific positioning (e.g. `.view-mode-dropdown`, `.quran-content-dropdown`).

_Items:_ `.dd-item` (common.css) — flex row, `padding: 6px 10px`, `font-size: var(--panel-font-size)`, hover highlight, checkbox/radio accent colour. Used by view‑mode, Quran content, and display‑options dropdowns.

_Helpers:_

- `window.openDropdown(dd, anchorEl, gap)` — closes other dropdowns, positions `dd` below `anchorEl`, shows it. Default gap 4px.
- `window.closeAllDropdowns()` — hides all registered dropdowns.
- `window.registerDropdown(id, dd, anchor)` — wires outside‑click‑to‑close for a dropdown and adds its ID to the shared list.
- `trapWheel(el)` (quran-ui.js) — prevents wheel events on a dropdown from scrolling the horizontal nav row behind it.
- Dropdowns with scrollable lists use `overscroll-behavior: contain` to prevent scroll chaining at boundaries.

### Keyboard shortcuts

Any new button or action that has a keyboard shortcut documents it in the tooltip (see above) and in the [Keyboard](#keyboard) table. Shortcuts are kept discoverable — if you add a shortcut, add the tooltip.

### State

**In‑memory state — who owns what (closures are the hard part to track):**

| State                                                                            | Lives in                                | What changes it                                                                               |
| -------------------------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------- |
| `STATE` (allData, filteredData, viewMode, hiddenColumns, hideTashkeel)           | `reader.js` init closure                | load, search, column toggles, view mode, tashkeel, reset                                      |
| `normAllData`                                                                    | `reader.js` closure                     | built at load; kept in sync by `quran-ui.js` column inserts (via ctx)                         |
| `_loadedColMap` / `_colOrder` / `_pendingColumnValues`                           | `quran-ui.js` init closure              | content modal checkboxes / ▲▼; `applyColumnOrder()` rebuilds the map                          |
| `_dashFilter` / `_dashTableMode`                                                 | `dashboard.js` module scope             | dashboard search / tags / sort / reset / view toggle                                          |
| `_bookNamesCache` / `_tagDefinitionsCache`                                       | `book-data.js` module scope             | first load only (null = failed fetch)                                                         |
| `_bookCsvCache` (one‑entry)                                                      | `quran-data.js` module scope            | `loadQuranBookCSV`                                                                            |
| `_baseDataCache` / `_surahNamesCache` / `_colRegistryCache`                      | `quran-data.js` module scope            | first load only                                                                               |
| `_indexPromise`                                                                  | `library-search-engine.js` module scope | first `loadSearchIndex()` call; cleared on failure so retries work                            |
| `_q` / `_selectedTags` / `_searchTimer` / `_peekCache`                           | `library-search-page.js` module scope   | `?q=`/`?tags=` state + chip scoping / debounced input / peek cache                            |
| `quranState` (exported)                                                          | `quran-data.js`                         | nav updates, scroll sync, ayah decoration                                                     |
| `ctx` + refs (`topScrollOuter`, `tableWrap`, `topSpacer`, `topScroll`)           | `table-scroll-sync.js` module scope     | set by `initTableScroll(ctx)` in loadInitial's table branch                                   |
| `ctx` + refs (`readerContent`, `metadata`, pagination/scroll/URL timers)         | `reader-position.js` module scope       | set by `initPosition(ctx)` in initial render; `updatePagination` / `visiblePageIndex` read it |
| `ctx` + refs (search DOM, `wholeWordMode`, `selectedResultIdx`, `advConditions`) | `reader-search-ui.js` module scope      | set by `initSearchUI(ctx)` in initial render; `applySearch` / `renderAdvancedSearch` read it  |
| `_modalLastFocused`                                                              | `common.js` module scope                | `openModal` / `closeModal` (focus restore)                                                    |

**Reset flow.** The settings modal's ↺ Reset is a **confirmed factory reset** (`confirmResetAll` message): on confirm it delegates to `btnResetFont` + `btnResetReader`, clears remaining LS keys, **clears pins and history**, and dispatches `dashboardReset`. Each delegated button handles its own domain — no duplicate reset logic. The dashboard and reader resets stay view-only (pins/history preserved).

**Persisted state.** Any new `localStorage` key must be added to the [Persisted state](#persisted-state) table. This table is the single inventory for porting to desktop/mobile apps — keep it current.

### Documentation

**One source of truth.** Every fact lives in exactly one doc. When adding or changing a convention, error state, naming rule, or configuration detail, update the canonical location — never duplicate it across docs.

| Content                                                                         | Lives in           | Linked from |
| ------------------------------------------------------------------------------- | ------------------ | ----------- |
| Naming conventions (prefixes, suffixes)                                         | ARCHITECTURE       | README      |
| Error states                                                                    | ARCHITECTURE       | README      |
| Development conventions                                                         | ARCHITECTURE       | —           |
| How‑to examples (add book, tag, export, etc.)                                   | ARCHITECTURE       | —           |
| Persisted state inventory                                                       | ARCHITECTURE       | —           |
| Keyboard shortcuts                                                              | README, USER_GUIDE | —           |
| Feature overview                                                                | README             | —           |
| API signatures and Data API                                                     | API.md             | —           |
| Verification workflow, smoke battery, known non-errors, measurement/audit traps | TESTING.md         | tools/      |
| Reader instructions                                                             | USER_GUIDE         | —           |

**When adding a new fact,** put it in the right column above. If you're not sure, default to ARCHITECTURE — it's the canonical developer reference. The other docs link to it; they don't repeat it.

## How‑to examples

### Add a new book

1. Create `data/content/FQH-usululFiqh.csv` with a header row and content:
   ```csv
   #,headAR,bodyAR,headDV,bodyDV,foot
   1,باب النية,النية هي...,ނިޔަތަކީ...,—,المصدر
   ```
2. Add a line to `data/03-registry-bookMeta.csv` (the `authorCode` and `tags` columns are optional — comma‑separated codes from `02-registry-bookAuthors.csv` / `01-registry-bookTags.csv`):
   ```csv
   FQH-usululFiqh,ibn-rajab,أصول الفقه,އުސޫލުލް ފިޤްހު,Usulul Fiqh,,
   ```
3. Run `data/04-update-bookRegistry.ps1` — or the book auto‑registers on first visit via `?book=FQH-usululFiqh`.

### Add a new tag category

Add one row to `data/01-registry-bookTags.csv`. Colours are auto‑generated — just the code and the three label columns:

```csv
tagCode,labelAR,labelDV,labelEN
FQH,فقه,ފިގުހު,Fiqh
```

### Add a new author

Add one row to `data/02-registry-bookAuthors.csv`, then put the `authorCode` in the books' `authorCode` column:

```csv
authorCode,nameAR,nameDV,nameEN,bornAH,diedAH
ibn-rajab,ابن رجب,އިބްނު ރަޖަބު,Ibn Rajab,736,795
```

Rows are hand‑ordered (the current file sorts by death year — that is the browse list's display order); 03 never rewrites this file. Blank `bornAH`/`diedAH` = unknown/living; a death in the 15th century AH (1401) and later, or no death year, lands the author in the single "Modern" period bucket (never a "Century 15" row of its own).
Use the tag code as the primary prefix in a `bookCode` (e.g. `FQH-usululFiqh`) or as a secondary in the `tags` column of `03-registry-bookMeta.csv` — badges render automatically with a golden‑ratio HSL colour. No limit on tag count; colours stay perceptually distinct.

### Add a new export format

In `src/js/export.js`, add an `else if (fmt === "...")` block inside the export click handler. Data formats use `ctx.allData` with `ctx.headerRow` prepended; rich‑text formats use `ctx.allData` directly:

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

In `src/js/i18n.js`, add one entry to the `STRINGS` object with all three languages:

```js
btnMyFeature: { dv: "ތަރުޖަމާ", en: "My Feature", ar: "ميزتي" },
```

Use `data-i18n="btnMyFeature"` in static HTML, or `t("btnMyFeature")` in JS. Tooltip text is English‑only — hardcode the string.

### Add a new theme colour

Define the variable in all three theme blocks. Pick a descriptive `--color-<role>` name:

```css
:root {
  --color-accent: #2563eb;
}
[data-theme="sepia"] {
  --color-accent: #b45309;
}
[data-theme="dark"] {
  --color-accent: #60a5fa;
}
```

Use `var(--color-accent)` everywhere. Never reference the hardcoded hex directly.

## Error states

All errors show visible messages in English. Error boxes carry a central `⚠️ Error:` prefix (`.error::before` — one rule covers every box; the red background alone is invisible to screen readers). Failure toasts use `window.showErrorToast` (⚠️‑prefixed, language‑neutral). Silent failures are minimised:

| Error                         | Source                     | Behaviour                                                                                                                                                                                  |
| ----------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Registry fails to load        | `dashboard.js` → dashboard | Shows "Failed to load the book registry" with a ↺ Retry button (`loadDashboard()` re-runs; controls are wired only after success, so no duplicate listeners) instead of an empty dashboard |
| Book code not found           | `book-data.js` → reader    | Shows error message                                                                                                                                                                        |
| CSV empty or fails            | `reader.js` → reader       | `.catch()` on the fetch chain shows error                                                                                                                                                  |
| Export fails (PNG/Excel/EPUB) | `export.js`                | ⚠️ toast with format name; the Export button is disabled with a "Preparing…" label while working and restored on failure, so the user can click again                                      |
| Missing i18n key              | `i18n.js` `t()`            | `console.warn` with key name, falls back to raw key string                                                                                                                                 |
| localStorage write fails      | All modules                | Silently caught (intentional — better to degrade than crash)                                                                                                                               |
| CSV parse warnings            | Console                    | Non‑fatal                                                                                                                                                                                  |

## Verification habits

The app has no unit-test framework — the battery suite (`tools/hmv-*.mjs`, see TESTING.md) plus hand checks are the verification model:

- **JS syntax**: `node --check --input-type=module < src/js/file.js` (files are ES modules; plain `node --check` treats them as CommonJS and fails on `import`)
- **TOC freshness** (reader.js): the header banner's last `Lxxxx-Lyyyy` range must end on the file's last content line — the line number of the last line that is _not_ an `#endregion` marker (the file ends with the last region's closing marker, so a plain count would undercount by the number of markers). One-liner: `$L = Get-Content src/js/reader.js; for ($i = $L.Count - 1; $i -ge 0; $i--) { if ($L[$i] -notmatch '^\s*// #endregion') { break } }; $i + 1` — the last TOC range end must equal that. (A `Where-Object … .Count` variant is WRONG here: with N interspersed markers it can only match by coincidence.)
- **Region/TOC consistency** (reader.js): every `// #region <name>` appears in the TOC banner and every TOC entry is a real region — grep counts must match, names must match (region names are the anchors; line numbers drift). One-liner (works for single-space alignment, which a `(.+?) \s+` pattern silently misses): `$L = Get-Content src/js/reader.js; $t = ($L | Select-String '^  //   (.+?)\s+L\d+-\d+\s*$' | ForEach-Object { $_.Matches[0].Groups[1].Value }); $r = (Select-String -Path src/js/reader.js -Pattern '^\s*// #region (.+)$' | ForEach-Object { $_.Matches[0].Groups[1].Value }); "missing in TOC: $(@($r | Where-Object { $_ -notin $t }).Count)  no region: $(@($t | Where-Object { $_ -notin $r }).Count)"` — both counts must be 0.
- **CSS sanity**: brace balance (`{`/`}` counts must match) after every CSS edit
- **Dangling references**: grep for removed IDs/classes/i18n keys across `src/js/`, `src/books/`, `src/css/`
- **Import/export resolution**: `node --check` only checks syntax — a wrong import name (`import { getAyahNoFromRowQuran }` where the module exports `getAyahNoFromRow`) is a runtime `SyntaxError` that only surfaces in the browser. Cross-check every `import { … } from "./x.js"` against `x.js`'s export declarations (match `export (async )?(function|var|const|let) <name>` and `export { … }` blocks — name-only, no aliases — and remember the target's own aliased re-exports, e.g. `quran-ui.js` re-exports `getAyahNoFromRow` but reader.js historically imports it as `getAyahNoFromRowQuran` via `as`).
- **Behaviour equivalence** (search‑engine changes): copy the old module from `git show HEAD:codebase/src/js/…` and compare outputs on Arabic/Thaana test corpora (see the search‑performance notes)
- **Browser caching**: GitHub Pages serves without cache‑busting — always hard‑refresh (Ctrl+F5) after changes; stale CSS is the most common "it didn't work" cause
- **RTL**: arrow‑key stepping, scroll directions, and sticky headers behave differently per browser and per element `dir` — test number inputs and scroll rows in both Chrome and Firefox
- **Direction sanity**: after any change that adds or rewords visible text, switch to dv and to en — each line must read from the correct edge (right in dv/ar, left in en) and must not jump position (pin `text-align` when it matters)

## Build (dist/)

`node tools/build.mjs` (needs the esbuild, lightningcss and
@minify-html/node devDependencies — `npm install` once in `codebase/`)
emits `dist/` from `src/`:

- `src/books/*.html` → `dist/books/`, minified by **@minify-html/node**
  (structure: whitespace collapse + comment removal + spec-safe entity
  normalisation, e.g. `<<` → `&lt;&lt;` and `&gt;&gt;` → `>>` — plus the
  inline `<script>`/`<style>` blocks via `minify_js`/`minify_css`, see
  "Why @minify-html/node"). The pages' `../css/` `../js/` refs resolve
  inside dist exactly as in src
- `src/js/*.js` → `dist/js/`, minified **in place** by esbuild (format esm,
  target esnext — no syntax lowering) — the module graph and every relative
  path stay at the same depth, so `../../data/` and `../../static/` from
  `dist/js/` hit the siblings exactly as the source tree does (no bundling,
  no path rewriting)
- `src/css/*.css` → `dist/css/`, minified **in place** by **lightningcss**
  (`minify: true`, no targets — modern-baseline output; see "Why
  lightningcss"). `url()` paths are untouched, so `../../static/font/...`
  keeps its depth
- `data/` and `static/` are **never copied** — they deploy side by side with
  `dist/` (web) or are embedded by the app projects' own builds (Tauri /
  Android assemble their own bundles — the copy logic lives there, not here)

**Why @minify-html/node** (decided 2026-08-25 after a four-way bake-off,
recorded so the choice doesn't get re-litigated blind). Candidates:
html-minifier-terser 7.2.0 (effectively unmaintained — no releases since
2023, ReDoS CVEs), html-minifier-next 8.1.0 (its actively-maintained fork;
byte-identical output), htmlnano (PostHTML-based), @minify-html/node
(Rust/WASM). tdewolff/minify (Go) was rejected as the wrong ecosystem.
Each was run with an equivalent structure-only config (whitespace +
comments + boolean attrs; inline script/style and entities untouched) and
scored on four pages: raw + gzip bytes, determinism (run twice, sha256
compare), content preservation (sentinels `data-i18n` / `../js/` / `../css/`
/ `<<` / `>>` plus non-ASCII counts), then all four `--dist` batteries
against each distinct output — all three distinct sets passed. Totals:
minify-html **63.8 KB → 40.3 KB (−36.9% raw, −17.9% gzip)**, terser/next
42.5 KB (−33.4% / −16.4%), htmlnano 43.3 KB (−32.2% / −15.7%). Takeaway:
minify-html wins on bytes at zero config and handles the reader's literal
`<<` chevron natively — the terser family needs
`ignoreCustomFragments: [/<{2}/, />{2}/]` to even parse that construct
(documented escape hatch if ever reintroduced). html-minifier-next is the
recorded fallback if a pure-JS dependency is ever wanted. Inline blocks:
`minify_js`/`minify_css` are **on** (adopted 2026-08-25 after a probe —
the earlier "never minify inline content" rule predates it). The probe
found the structure-only pass left dist non-uniform: the reader's
scroll-arrow IIFE and info's shell CSS block were 4-5 KB of hand-tuned,
comment-dense inline code (the only comments surviving into dist, since
esbuild strips the external files'). Enabling the flags cut info.html's
gzip 42% and reader's 7.6% (−5.7 KB raw / −1.2 KB gz across the four
pages), every minified block passes `node --check`, and all four `--dist`
batteries stay green. minify-js is conservative (comments stripped,
identifiers kept), so the inline code reads like its esbuild-minified
siblings — the "same code minified two ways" concern is cosmetic only.

**Why lightningcss** (the CSS minifier; adopted 2026-08-25 after a five-way
bake-off, recorded so the choice doesn't get re-litigated blind).
Candidates: esbuild (the incumbent), lightningcss (Rust native), csso,
cssnano, clean-css. Each ran with an equivalent minify-only config (no
targets, no prefixing, no autoprefixer) over the 8 CSS files — 193,005
bytes raw input — and was scored on raw + gzip bytes, determinism (run
twice, sha256 compare — all five deterministic), and content preservation
(a sentinel audit: selectors, `--vars`, `@font-face` family names,
keyframes, `url()` depths, non-ASCII counts). Scoreboard (out bytes;
gz = gzip -9 of the minified output):

| candidate | raw | raw saved | gzip |
| --- | --- | --- | --- |
| esbuild (incumbent) | 100,566 | 47.9% | 20,808 |
| **lightningcss** | **98,562** | **48.9%** | **20,659** |
| csso | 97,555 | 49.5% | 21,008 |
| cssnano | 98,330 | 49.1% | 20,853 |
| clean-css | 102,134 | 47.1% | 20,928 |

lightningcss is the **only strict improvement** — it wins both metrics.
csso's best raw is its worst gzip, and the loss is structural, not noise:
its declaration-merging removes exactly the repetition gzip feeds on.
Consumer math settles it — the web ships gzip (Pages gzips for
Accept-Encoding clients; a bare `curl -I` sees raw bytes), the Android APK
zip-DEFLATEs its assets (same compression family as gzip — csso loses there
too), and Tauri embeds CSS raw: csso's only win is ≈3 KB against a
≈105 MB data tier, 0.003%.

lightningcss's minify pass merges adjacent identical `@media` blocks,
groups identical-declaration selectors, normalises `::before` → `:before`
and `nth-child(1)` → `:first-child`, and rewrites `(max-width:600px)` →
`(width<=600px)` **range syntax** (Media Queries L4). That last one is the
only behavioural risk: Safari <16.4 ignores range syntax, so a query
rewritten that way silently dies there. Accepted deliberately — no browser
targets are set (modern baseline), the apps' WebViews are Chromium/
WKWebView ≥ that floor, and the site's own breakpoint (600px) is unaffected
in every browser that renders it.

The battery round: both finalists (lightningcss, csso) initially failed the
**same two** `--dist` assertions — S6 (libscope filter) and S8b (info Word
golden) — which looked like a CSS regression; a decisive experiment
(restoring the esbuild dist reproduced the identical failures) exonerated
both candidates. The failures were stale test expectations, not output
defects. S6's picker filter is **always-fuzzy on titles + tag words**
(`scoreFilterTokens`: 6+-char tokens tolerate 2 edits; only the code is
exact-only), so «bukhari» legitimately hits Barbahari (window `bahari`) and
"by Abu Khaithamah" (window `bu khai`) — DFK books registered 2026-08-22 —
and the assertion now derives its expected set from the app's own scoring
over the picker's own book list. S8b's golden was a byte capture from
00:14; the 09:13 data update («الأصول الستة» → «الأُصُولُ السَّتَّةُ»,
+16 bytes) staled it — recaptured. Both rows are in TESTING.md's known
non-errors table. End state: dist 823.2 KB → 361.7 KB (56.1% saved;
363.7 KB under esbuild), common.css 92.2 KB → 47.9 KB.

The whole tree is wiped and rebuilt each run (generated output cannot drift)
and is gitignored (`/codebase/dist/` in the repo root .gitignore). Run the
batteries against the build: `node tools/hmv-{info,authors,libscope,qrn-smoke}-check.mjs --dist`
— the harness repoints the page root at `dist/books/` while `static/` and
`data/` stay siblings; the info battery's golden comparison (S8b) normalises
the embedded tree name in the exported bytes, so the minified builders are
still byte-checked. The TOC/header scans and the golden capture remain
src-based by design (they read source structure).

## Adding content

### New book

1. Add a row to `data/03-registry-bookMeta.csv`.
1. Create `data/content/{bookCode}.csv` with a header row as the first row.
1. Open the viewer — it appears automatically.

### New tag category

1. Add a row to `data/01-registry-bookTags.csv` with `tagCode,labelAR,labelDV,labelEN`. Colours are auto‑generated — no need to pick hex values.
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

"Search in books" — a dedicated page (`src/books/library-search.html`) that searches across every book at once via a machine‑generated word index, instead of downloading and scanning book files in the browser. The dashboard's 🔎 button (carrying the box text as `?q=`, the selected tag chips as `?tags=` and the active author/period facets as `?authors=` / `?period=`; pins are not carried) and the sidebar entry on every page jump to it.

### The index

`data/08-rebuild-searchIndex.mjs` (Node — run `node data/08-rebuild-searchIndex.mjs` after book changes, chain it after the PS1) scans every registered book once, offline, and emits `data/search-index.json` — word‑level postings of `bookId + row`, where `bookId` is a numeric index into `meta.bookIds` (full codes never repeat per entry). Built with the app's own parser and normaliser (`parseCSV`, `normaliseForSearch`) and the SAME tokeniser the query side uses (`tokenizeText` in library-search-engine.js — build and query MUST agree on what a word is, so the script imports it rather than re‑implementing). `-HDN` columns and the row‑number column are excluded; an optional `excludeFromIndex` registry column (comma‑separated header names) skips those columns — `-HDN` and the row‑number column still win regardless; the magic value `ENTIRE-BOOK` skips the whole book (no postings, and it is listed under `## Excluded Books` in the report). The build prints **one report line per book** (row count, indexed columns, skipped columns) and writes the same info to `data/search-index-report.md` (markdown table with per-book postings — the policy as a diffable file, committed alongside the index) so the whole indexing policy is eyeballable at a glance, and an `excludeFromIndex` entry that matches no column warns. The build times itself — elapsed, per‑phase breakdown (index / pack / write), rows·postings per second, heap, node version — printed to the console and mirrored in the report's `## Build Stats` section. Rows are packed as ranges (`"1-5,8,12"`); pure‑number tokens are dropped; `meta.version` (first 16 hex chars of the payload's SHA‑256) stamps the file for cache validation. **Row numbers are 1‑based DATA POSITIONS** (the reader's `?row=` contract — `goTo(row-1)`) — NOT the CSV's `#` column, which is not always sequential (5 books have gaps); the index would deep-link to the wrong row otherwise. The `#` column is display-only.

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

`src/js/library-search-engine.js` — a pure module (no DOM). `loadSearchIndex()` fetches the index with a conditional request (`cache: "no-cache"` → a cheap 304 when unchanged), parses only the meta head to read the version (the full 40MB `JSON.parse` happens only on version change), and serves the parsed words from the on‑device IndexedDB copy (`hadithmvSearch` DB — deliberately separate from the book cache in csv.js so the two modules never contend on a version bump). Failed loads are retryable. `searchLibrary(index, query, scopeBookCodes)` normalises + tokenises the query (same `tokenizeText` as the build), looks up each word's postings, ANDs them at row level, intersects with the scope (book codes — the page passes visible books ∩ tag chips), and returns per‑book `{bookCode, count, firstRow}` sorted by match count.

### The UI

The page (module `src/js/library-search-page.js`, styles `src/css/library-search.css`) reads `?q=` and `?tags=` from the URL (shareable links — typing, chip toggles, and clear keep the address bar in sync via `replaceState`). Tag chips scope the search (OR — a book is searched if it carries any selected tag); `-HDN` books are excluded from scopes; a scope that matches no books renders "No results" rather than falling through to an unscoped search (the engine treats `[]` as "every book").

**Authors & Periods facets.** The page's ✍️ Authors / 🗓️ Periods buttons open the browse modals, but the state, chips and modals themselves live in one shared module — `src/js/facet-browse.js` — used by the library page, the dashboard's functions panel (same buttons + chips, filtering the card grid) and the search window's All-books tab (facet scope intersects the index search). `?authors=` (comma list, OR) and `?period=` (century number or `modern`) deep-link on both the library page and the dashboard. Selection semantics: author = any of the book's `authorCode` tokens; period = the death-century bucket of any of its authors (`Math.ceil(diedAH/100)`, or `modern` — 15th century AH and later, or no death year). The modals are one design everywhere: a filter input (matches any of the three names or the code) with a result count beside it — the search window's "match: N" pattern ("ނަތީޖާ: N" / "نتيجة: N"), always visible and reading the shown rows (the full list with an empty filter), the slot width pre-reserved at open so the count's digit changes never shift the input — above a table whose header stays sticky while only the rows scroll; author rows lead with a muted, tabular 1-based index (the row's position in the currently shown list — renumbered when the filter narrows it — under a bare "#" header cell), then show the current-language name, the other two names (Arabic always included), the Hijri years and, right after them, the derived age (diedAH − bornAH; a `~` estimate on either end carries over, blank when a date is missing, the language's year-unit shorthand appended — އ. / y. / س.; muted like the CE) and the Gregorian (miladi) equivalent (derived at render with the same AH→CE approximation as the periods grid; a `~` estimate carries over; the CE side reads in the muted tone while the Hijri dates stay plain; a died-only author leads the years with the same bare dash the born–died range uses between its years — `–179 ހ.`, glued to the year like the range's own dash), in the 08 registry's row order; period rows are the distinct buckets, chronological — the years, the distinct-author count (an author enters a bucket only via a book, so zero-book authors never inflate it) right after them, then the Gregorian span — each row carrying the count of distinct authors with a book in the bucket, and the modern bucket's row showing the open-ended "(+15)" marker on its name (the 15th-century-AH opening century, the plus leading the number) with its range and Gregorian cells at the open-ended "from" forms ("+1401 ހ." / "+1981 މ."). On narrow screens (≤600px) the header strip folds away entirely and each row re-flows into compact joined lines — index · name · Arabic name / century · years · CE · age · "ފޮތް: N" ✓, the index leading its line (the periods rows have no index, so their name keeps the dot-free line lead), the count and its tick joining the end of the dates line (periods: label · years · CE / authors · "ފޮތް: N" ✓, the authors count leading its line unjoined) — the count labels (ފޮތް, Authors, Age) hidden on desktop under their own header columns. The books count reads like the name column in both modals — same weight (600) and the same colour by inheritance (neither has a colour of its own; both pick up the row's text colour, the accent-blue selected state included); the mobile count labels (ފޮތް, Authors, Age) inherit their cells' weight, so only the books count's label reads bold in the name's colour while the age and authors labels stay plain captions of their muted figures; the periods' century label (its first column) is bold like the authors' name. Both modals' Hijri range columns are content-pinned — no `1fr` anywhere — so the years sit at their natural width and hug what follows: the authors' age, and the periods' century label (which takes the leftover width the way the authors' names do).

The grids (thead strip + rows share the tracks; the variable ones pinned by
`pinFacetGeometry` to the widest cell — `--facet-*-w`, caps in parentheses):

| Track     | Authors                                                                                                                                                                                                                | Periods                                                                                                       | Pinned                                                                                                                                                                                                                                         |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index`   | 1, 2, 3… — the row's position in the shown (filtered) list; muted, tabular numerals; the thead cell carries a bare `#` (`title="Row number"`)                                                                          | —                                                                                                             | 44px (fixed)                                                                                                                                                                                                                                   |
| `name`    | current-language name (tooltip lists all three)                                                                                                                                                                        | century label (`centuryN`)                                                                                    | `--facet-name-w` (220) / `--facet-period-w`                                                                                                                                                                                                    |
| `name-ar` | Arabic name — empty in the Arabic UI                                                                                                                                                                                   | —                                                                                                             | `--facet-ar-w` (240)                                                                                                                                                                                                                           |
| `century` | death century, unbracketed — the modern bucket's cell reads `Century +15` (the `periodFromCentury` template — the century label with the leading plus, the same `+` the modern row's name marker and from-forms carry) | —                                                                                                             | content-pinned (93px today — the +15 label is the longest cell, measured like the range)                                                                                                                                                       |
| `range`   | `(born–died ހ.)`                                                                                                                                                                                                       | `(span ހ.)`                                                                                                   | `--facet-range-w`, measured nowrap like the Gregorian track — no `1fr` in either modal: the age sits directly against the years, and the periods' years sit at their natural width, hugging the century label (which takes the leftover width) |
| `age`     | diedAH − bornAH — blank when either is missing, a `~` carries over; muted like the CE, the year-unit shorthand appended (`86 އ.` / `86 y.` / `86 س.`) — sits right after the years, before the Gregorian span          | —                                                                                                             | 48px (fixed)                                                                                                                                                                                                                                   |
| `authors` | —                                                                                                                                                                                                                      | distinct authors with a searchable book in the bucket — sits right after the years, before the Gregorian span | 56px (fixed)                                                                                                                                                                                                                                   |
| `ce`      | `(born–died CE)`, muted                                                                                                                                                                                                | `(span CE)`, muted                                                                                            | `--facet-ce-w`, measured first                                                                                                                                                                                                                 |
| `count`   | `ފޮތް: N` — bold (600) and the same colour as the name column (both inherit the row's); the label goes inline on mobile and inherits the cell — only this label reads bold                                             | same                                                                                                          | 64px                                                                                                                                                                                                                                           |
| `check`   | ✓ when selected — the thead cell carries the same ✓, centered                                                                                                                                                          | same                                                                                                          | 40px                                                                                                                                                                                                                                           |

One row, both viewports (the real Malik bin Anas row — 02 registry values,
the CE span and the age the AH→CE / diedAH − bornAH derivations of the
periods grid):

```
Desktop — the grid, thead over rows, columns aligned by construction (the
index is the row's position in the shown list — Malik leads the registry,
so 1):
┌────┬──────────────────────────┬─────────────────────────┬──────────┬──────────────┬──────────┬────────────┬──────┬────┐
│ #  │ Name                     │ Arabic                  │ Century  │ Years        │ ޢުމުރު    │ Miladi     │ ފޮތް │ ✓  │
├────┼──────────────────────────┼─────────────────────────┼──────────┼──────────────┼──────────┼────────────┼──────┼────┤
│ 1  │ މާލިކު ބިން އަނަސް          │ مالِكُ بْنُ أَنَسِ المَدَنِيُّ │ Century 2 │ (93–179 ހ.) │ 86 އ.    │ (712–795 CE) │ 1    │ ✓  │
└────┴──────────────────────────┴─────────────────────────┴──────────┴──────────────┴──────────┴────────────┴──────┴────┘

The same period's row (bucket 2 — the age column's sibling feature, the
distinct-author count; here Malik's is the only book in the bucket — the
authors track sits right after the years, before the Gregorian span; the
row cells are placed into their desktop columns AND rows explicitly —
their DOM order keeps the mobile lines, and a column-only pin would let
the grid's sparse auto-placer walk its cursor back on the DOM/visual swap
and drop the swapped cells into a second band, the "two subrows" look):
┌───────────┬──────────────┬────────────┬──────────────┬──────┬────┐
│ Century   │ Years        │ Authors    │ Miladi       │ ފޮތް │ ✓  │
├───────────┼──────────────┼────────────┼──────────────┼──────┼────┤
│ Century 2 │ (101–200 ހ.)│ 1          │ (720–816 CE) │ 1    │ ✓  │
└───────────┴──────────────┴────────────┴──────────────┴──────┴────┘

Mobile (≤600px) — the strip folds away, the rows re-flow into flowing
lines (the wrappers are display:contents on desktop, so the grids above
are untouched there); the joins are a bare · with margins (a " · " string
would lose its leading space to inline white-space collapsing at the start
of the cell's line), the ✓ gets the spacing without a dot. Both modals:
two lines — the authors' count (carrying its ފޮތް label) and ✓ join the
end of the dates line; the periods' authors count leads its line unjoined;
the authors' index leads line 1 (no dot — it has nothing before it):
    1 · މާލިކު ބިން އަނަސް · مالِكُ بْنُ أَنَسِ المَدَنِيُّ
    Century 2 · (93–179 ހ.) · (712–795 CE) · ޢުމުރު: 86 އ. · ފޮތް: 1 ✓
    Century 2 · (93–179 ހ.) · (712–795 CE)
    މުއައްލިފުން: 1 · ފޮތް: 1 ✓
```

Counts everywhere (chips, rows) are over the visible (`-HDN`-excluded) registry. Results group by book (tag badges, localized titles, match count), ranked by count, and deep‑link to `reader.html?book=X&row=N&q=TERM` (first match, term pre‑highlighted — the proven pins/history path plus the `?q=` param below). Each result has a ▾ **peek** (per‑book preview): it fetches that ONE book — through the IndexedDB book cache, instant once opened before — runs the same compiled-query scan, and shows the first 8 matching rows as highlighted snippets with a "Show next N" pager (the scan produces all matches up front, so paging is just slicing); every snippet deep‑links to its exact row. Peek results are cached per book+query so collapse/re‑open and re‑searching don't refetch. The index itself loads lazily on the first search (with a "Searching…" state and a ⚠️ Error + ↺ Retry path). On the dashboard, the 🔎 button is a plain jump to the page (carrying the box text as `?q=` and the selected tag chips as `?tags=`; pins are not carried); the dashboard search bar is title‑filtering only and no longer loads the index.

### What's deliberately different from in-book search

- **Whole-word only.** The index matches whole normalised words — `رحم` does NOT find الرحمن (in-book substring search does). No wildcards/fuzzy/regex/column scoping cross-book.
- **AND across words.** A result row contains every query word (in-book queries are substring-based, which is a different match model).
- **Book-level results; snippets on demand.** The index stores rows, not text — results show book summaries with counts, and the per-book peek (above) fetches the book on demand to show actual highlighted snippets, so content previews exist without making the search itself download anything. A click lands on the first matching row with the term pre-highlighted — the `?q=` param fills the reader's search window, which lists every match (the window's All-books tab runs the same cross-book search from the reader); in-book search covers further precision.
- **Snapshot semantics.** The index is built from a point-in-time scan; the `meta.version` hash invalidates stale cached copies.

### Planned (not yet built)

These are agreed designs, written down so they survive. None of this exists in the code yet.

- **Substring (n‑gram) index variant** — 3‑4 char chunks + stored words, 30‑80MB vs 10‑20MB word‑level — if whole‑word matching ever proves limiting.
