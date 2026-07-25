# Architecture

Metadata-driven, single-page viewer for Islamic texts. Configuration lives in CSV files. UI supports Dhivehi, English, and Arabic.

> **Other docs:** [User Guide](USER_GUIDE.md) for readers · [API Reference](API.md) for developers

## Files

| File                         | Purpose                                                                    |
| ---------------------------- | -------------------------------------------------------------------------- |
| `data/02-registry-bookNames.csv`      | Central registry of books (code, titles in AR/DV/EN)                       |
| `data/01-registry-bookTags.csv`       | Tag definitions (code, label) — colours auto‑generated (golden‑ratio HSL)  |
| `books/index.html`           | Dashboard — book list, search, tag filter, table/card view                 |
| `books/reader.html`          | Book viewer — loaded via `?book=CODE`                                      |
| `css/common.css`             | Shared: themes, fonts, topBar, sidebar, settings modal, tag colors        |
| `css/reader.css`             | Reader page: focus mode, toolbar, pagination, content, responsive         |
| `css/search.css`             | Reader: search bar, results dropdown, advanced search                      |
| `css/tableView.css`          | Reader: table view mode, top scrollbar, sentinels                          |
| `css/quran.css`              | Reader: Quran navigation row, dropdowns, surah overlay                     |
| `css/dashboard.css`          | Dashboard styles: grid, cards, controls, table view                        |
| `js/common.js`               | Shared init: theme, fonts, i18n, sidebar, settings, keyboard               |
| `js/catalog.js`              | Metadata loading, tag extraction, dashboard rendering                      |
| `js/reader.js`               | Book viewer: infinite scroll, toolbar, keyboard, export, clipboard         |
| `js/quran.js`                | Quran: data loading, decoration, nav, column registry, UI setup            |
| `js/csv.js`                  | Tiny CSV parser (~1 KB) — `parseCSV()`, `unparseCSV()`                     |
| `js/search.js`               | Search engine: normalisation, parsing, matching, snippets, history         |
| `js/xlsx.js`                 | XLSX writer + shared ZIP layer — `zipStore()`, `createXLSX()`, lazy‑loaded |
| `js/epub.js`                 | EPUB 3 e-book writer — `createEPUB()`, lazy-loaded on demand               |
| `js/i18n.js`                 | Translations module (dv/en/ar) — `t()`, `setLanguage()`                    |
| `font/`                      | Custom merged font (Arabic + Thaana + Latin, WOFF2 + WOFF)                 |
| `data/*.csv`                 | Per-book content files                                                     |
| `data/03-update-bookRegistry.ps1` | Auto-generates titleEN from bookCode, adds new books                       |
| `data/QRN-DATA-registry-surahSelector.csv`      | 114 surah names in AR/DV/EN with ayah counts                      |
| `data/QRN-DATA-registry-bookToggle.csv`         | Registry of all available Quran columns (source, labels, defaults) |
| `data/QRN-DATA-baseFile-1-juzNo_surahNo_ayahNo_basmalah_ayahImlai.csv` | Base Quran data: juz/surah/ayah numbers + Imlai text |
| `data/QRN-DATA-baseFile-2-ayahUthmani.csv`     | Quran text in Uthmani script                                     |

## Request flow

```text
URL: ?book=AQD-nawaqidulIslam
        │
        ▼
  catalog.js
    ├─ fetch ../data/02-registry-bookNames.csv  ──→  find row by bookCode
    ├─ fetch ../data/01-registry-bookTags.csv ──→  resolve tag badges from prefix
    └─ returns { bookCode, titleAR, titleDV, titleEN, csvPath }
        │
        ▼
  reader.js
    ├─ parseCSV(../data/AQD-nawaqidulIslam.csv)
    ├─ first row = header; col 0 = # or blank → row numbers
    ├─ build column toggle buttons
    ├─ loadInitial() → first chunk of rows
    └─ wire infinite scroll / search / toolbar / keyboard / i18n
```

No `?book=` → dashboard (`index.html`) loads `catalog.js` → search bar, tag chips, sort row (with pins/history dropdowns, reset, view toggle, sort select), card grid of all books. Pins and history are persisted in `localStorage` (max 10 each) and open as dropdown panels from toolbar buttons. Pins auto‑update their row position as the user reads (piggybacking on the history timer, debounced 2s). Supports `?tags=A,B` to pre‑filter by tag codes; clicking a tag chip updates the URL via `history.replaceState` so filtered views are bookmarkable and shareable.

The reader's page‑header tag badges link to `index.html?tags=CODE`, letting readers jump to the dashboard filtered by that category.

```text
┌─ Search bar ───────────────────── [✕] [Advanced] ─────────┐
│  Tags: [📌 ޕިން (3)] [Aqidah ✕] [Hadith] [Fiqh] …          │
│  Books: 12                                                  │
├─ Sort row ─────────────────────────────────────────────────┤
│  📌 Pins ▾   🕐 History ▾   ↺ Reset   ☰≡ View   Sort: A-Z │
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
┌─ Fixed topBar (z-index 101, opaque bg, bottom border) ─────══┐
│  ↩ Return  ↕ Focus  │  Book Title (scrollable)  │  ☰ Menu   │
├─ Sticky collapsibleReaderPanel (z-index 50) ─────────────────┤
│  readerPanelSearch       🔎 Advanced  [input]  ✕  (N)        │
│  readerPanelFunctions    📋 📌 ◉ 🔗 ↕ ↺ 📥 …               │
│  readerPanelPagination   << < [N] / [N] > >>  Tags …        │
│  readerPanelQuran (QRN)  ▶ 1 الفاتحة ◀  …                  │
├─ Reader content (scrollable) ────────────────────────────────┤
│  [Table mode] ▶ ════ scrollbar ════ ◀                       │
│  #1 …                                                        │
│  #2 …                                                        │
├─ readerPanelPaginationBottom ─────────────────────────────────┤
│  << < [N] / [N] > >>                                          │
└──────────────────────────────────────────────────────────────┘
```

Columns are rendered in header order. A blank line separates the last `*AR` column from the first `*DV` column (AR‑ending → DV‑ending headers). A `ـــــــــــ` tatweel divider appears before any column whose header starts with `foot` (case‑insensitive — matches `foot`, `footAR`, `footDV`). Columns starting with `head`/`kitab`/`bab` render as large/medium/small bold headings respectively.

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

### Pagination

First (`<<`) / Prev (`<`) / a number input showing current row / Next (`>`) / Last (`>>`). The input shows `total / [current]` and accepts direct row-number entry. All buttons and the input share the same height. Pagination updates are throttled to ~8 fps and skip DOM writes when values haven't changed.

### Table mode (RDF view)

When toggled via the View button (`v` key), the reader switches from vertical cards to a horizontal `<table>` with `table-layout: auto`. Columns size to content — narrow columns for short text, wide for long text. The first column (row number) has a 60px minimum width and `white-space: nowrap`; other columns have no fixed width, letting the browser distribute space naturally.

**Horizontal scrollbar.** When column content exceeds the viewport width, a sticky horizontal scrollbar appears above the table. It sits below the reader chrome (`position: sticky; top: var(--rdf-header-top) + 2px; z-index: 6`) so it remains visible during vertical scrolling. Arrow buttons (`▶` back / `◀` forward) flank the scrollbar and scroll one column width (150px) per click with a custom `requestAnimationFrame` ease-out animation. Shift+wheel on the table area also drives horizontal scroll. The scrollbar row is hidden entirely when the table fits without overflow.

**Sticky headers.** `<th>` elements use `position: sticky`. When the horizontal scrollbar is visible their `top` offset is increased by 19px to sit below the scrollbar; when hidden they sit directly below the chrome. The offset is set dynamically via JS.

**Performance.** `table-layout: auto` lets the browser size columns by content. `border-collapse: separate; border-spacing: 0` avoids the expensive collapsing-border algorithm. `contain: layout style` isolates the table's layout from the rest of the page. `content-visibility: auto` is explicitly NOT applied to `<tr>` elements (it breaks the table layout algorithm). The table wrapper uses `overflow-x: clip` (fallback: `hidden`) so sticky positioning is not trapped by a scroll container.

### Search

Real‑time, tashkeel‑insensitive filtering via `normaliseForSearch()` — strips Arabic diacritics, normalises alif/ya/waw variants, strips Thaana fili (vowel marks), and normalises Thaana thikijehi (Arabic‑derived letters) to base Thaana. Results dropdown with highlighted snippets mapped back to original text. Keyboard‑navigable (↑/↓/Enter/Escape). Advanced search modal for column/condition/value filters with AND/OR logic. Same normalisation used for dashboard search.

### Toolbar

| Control         | Implementation                                                                                                                                                                                                                                                                   |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Copy            | **Standard books:** `titleDV - titleAR` header, then row text with `ـ` divider before `foot` columns, blank line between AR‑ending and DV‑ending columns, heading formatting for `head`/`kitab`/`bab` columns. **Quran books:** no book header; decorated ayah text, `[name surahNo : ayahNo]` reference, then columns grouped by source book with one book-level label per book. `navigator.clipboard.writeText()` with `execCommand` fallback. |
| Share           | Copies a deep link (`?book=CODE&row=N`) to the current row.                                                                                                                                                                                                                      |
| Hide diacritics | Wraps Unicode diacritic ranges in `<span class="tashkeel">`. Toggle adds `.hide‑tashkeel` class → `display: none`.                                                                                                                                                               |
| View toggle     | Switches between vertical card mode and horizontal table mode. RDF-prefixed books default to table on desktop (>600px), card on mobile. Applies to all books.                                                                                                                                                        |
| Reset           | Clears search, unhides all columns, shows tashkeel, exits focus mode, clears `reader:` localStorage.                                                                                                                                                                             |
| Export          | Dropdown: TXT, MD, JSON, CSV, TSV, YAML, TOON, XML, Excel, EPUB, Word, PDF, PNG. TSV is tab-separated. TOON uses expanded list per spec. Excel uses `js/xlsx.js` (lazy-loaded). EPUB uses `js/epub.js` (lazy-loaded, embedded font). All include book title, URL, Hadithmv, version, and proper formatting. |
| Hide columns    | Dropdown with per‑column toggle buttons. `hiddenColumns[]` persisted.                                                                                                                                                                                                            |

#### Export formats

| Format     | Type        | Header row? | Module        | Notes                                |
|-----------|-------------|-------------|---------------|--------------------------------------|
| TXT       | Rich text   | No          | —             | Formatted like clipboard copy        |
| MD        | Rich text   | No          | —             | Markdown with `##` per row           |
| JSON      | Data        | Yes         | —             | Array of arrays, header first        |
| CSV       | Data        | Yes         | —             | `unparseCSV()`                       |
| TSV       | Data        | Yes         | —             | Tab‑separated                        |
| Excel     | Data        | Yes         | `xlsx.js`     | Lazy‑loaded, inline strings          |
| HTML      | Rich text   | No          | —             | Book reader view, styled paragraphs  |
| HTML Table| Data        | Yes         | —             | `<table>` with `<thead>`             |
| Word      | Rich text   | No          | —             | HTML saved as `.doc`                 |
| EPUB      | Rich text   | No          | `epub.js`     | Lazy‑loaded, embedded font           |
| YAML      | Structured  | —           | —             | `id` + `fields` per row              |
| TOON      | Structured  | —           | —             | Hadithmv compact notation            |
| XML       | Structured  | —           | —             | `<book>` / `<row>` / `<colN>`        |
| PDF       | Rich text   | No          | —             | Print‑only (window print)            |
| PNG       | Screenshot  | —           | —             | Canvas render of visible card        |

**Rule:** data formats (CSV, TSV, Excel, JSON, HTML Table) include the CSV header row. Rich‑text and structured formats do not.

The toolbar and pagination rows are wrapped in a `.h-scroll-wrap` container with `padding: 0 30px` that provides space for absolutely‑positioned ◀▶ arrow buttons at the edges. The row itself handles horizontal scrolling (`overflow-x: auto`, hidden scrollbar). Mouse wheel over the wrap is redirected to horizontal scroll on the row. When the row overflows, direction‑aware arrow buttons appear at the edges: ◀ at the end (scrolls toward end), ▶ at the start (scrolls toward start). Arrows are hidden at the appropriate extremes. Both arrow clicks and mouse‑wheel redirection animate smoothly via the same `requestAnimationFrame` loop with an ease‑out‑cubic curve (300ms). Arrow visibility updates on scroll, resize, and after the reader wrapper becomes visible.

### Focus mode

Toggled via the green ↕/▼ button in the topBar or `z` key. Collapses the chrome smoothly via CSS Grid `grid-template-rows: 1fr → 0fr` transition (no max-height stutter). Chrome padding and border also hidden. Bottom nav hidden. Only the topBar and reader content remain.

### Themes

Three themes via `[data-theme]` attribute: `light` (default), `dark`, `sepia`. All colors are CSS custom properties. Selectable from settings modal. Persisted, applied before paint via blocking `<script>` in `<head>`.

### Settings modal

Opened from the sidebar. Cards for Appearance (theme dropdown, widescreen toggle), Font (size ±, family dropdown: Hadithmv/System — always English), and Language (select dropdown). Reset button in the modal header clears all settings including reader state, pins, and history and restores CSS variable defaults. Modal has `overscroll-behavior: contain` and body scroll is locked when open to prevent background scroll bleed.

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

All client-side state is stored in `localStorage`. No sessionStorage, cookies, or IndexedDB are used. In‑memory caches (`bookNamesCache`, `tagDefinitionsCache`) are populated at startup and never written to disk.

| Key | Where used | Shape | Notes |
|-----|-----------|-------|-------|
| `theme` | `common.js` | `"dark"` / `"sepia"` / `""` (light) | Applied before paint to avoid flash |
| `widescreen` | `common.js` | `"1"` or absent | Toggle state |
| `fontSize` | `common.js` | CSS value like `"1.25rem"` | Reader font size |
| `fontSystem` | `common.js` | `"1"` or `"0"` | `"1"` = system font, `"0"` = Hadithmv |
| `lang` | `i18n.js` | `"dv"` / `"en"` / `"ar"` | UI language |
| `focus` | `reader.js` | `"1"` or `"0"` | Focus reading mode |
| `reader:rowsPerPage` | `reader.js` | number (JSON) | Rows per page |
| `reader:hideTashkeel` | `reader.js` | boolean (JSON) | Tashkeel visibility |
| `reader:hiddenColumns` | `reader.js` | `[int, ...]` (JSON) | Indices of hidden columns |
| `reader:searchHistory` | `search.js` | `[string, ...]` (JSON) | Recent search queries (max 20) |
| `pinnedBooks` | `catalog.js` | `[{bookCode, row, addedAt}, ...]` (JSON) | Pinned books (max 10). Row auto‑updates as user reads |
| `readHistory` | `catalog.js` | `[{bookCode, row, ts}, ...]` (JSON) | Reading history (max 10) |
| `reader:quranShowAyahNum` | `quran.js` | boolean (JSON) | Show ayah number decoration |
| `reader:quranShowBraces` | `quran.js` | boolean (JSON) | Show Quranic braces decoration |
| `reader:quranShowNumBrackets` | `quran.js` | boolean (JSON) | Brackets around number only (not ayah text) |

The settings reset button clears all of the above except `lang`.

> **When adding new persisted state**, add a row to this table. This is the single reference for porting to desktop, mobile, or other platforms.

### Internationalisation

`js/i18n.js` exports `t(key)`, `setLanguage(lang)`, `initI18n()`. Static HTML uses `data-i18n` attributes; dynamic text calls `t()`. A `languagechange` CustomEvent triggers re‑render. Language persisted to `localStorage`.

### Keyboard

| Key             | Context                | Action                                 |
| --------------- | ---------------------- | -------------------------------------- |
| `←` / `→`       | Reader                 | Previous / next row                    |
| `Home` / `End`  | Reader                 | First / last row                       |
| `↑` / `↓`       | Search focused         | Navigate results                       |
| `Enter`         | Search focused         | Select result                          |
| `/` or `Ctrl+f` | Anywhere               | Focus search bar                       |
| `Ctrl+Shift+f`  | Anywhere               | Open advanced search                   |
| `z`             | Reader                 | Toggle focus mode (same as ↕/▼ button) |
| `t`             | Reader                 | Toggle tashkeel                        |
| `v`             | Reader                 | Toggle card/table view                 |
| `p`             | Reader                 | Toggle bookmark (pin)                  |
| `s`             | Reader                 | Share link                             |
| `e`             | Reader                 | Open export dropdown                   |
| `Ctrl+,`        | Anywhere               | Open settings                          |
| `Ctrl+b`        | Anywhere               | Back to book list                      |
| `Escape`        | Sidebar/modal/dropdown | Close                                  |
| `Escape`        | Dashboard search       | Clear search & blur                    |
| `p`             | Dashboard              | Toggle pins dropdown                   |
| `h`             | Dashboard              | Toggle history dropdown                |

Dashboard keyboard shortcuts only fire when the dashboard is visible. Tag chips, badges, book cards, table rows, toolbar buttons, and page titles all carry `title` tooltips describing their action or category.

## Data shape

### 02-registry-bookNames.csv

| Column     | Description                                         |
| ---------- | --------------------------------------------------- |
| `bookCode` | Unique identifier, doubles as the data CSV filename |
| `titleAR`  | Arabic title                                        |
| `titleDV`  | Dhivehi title                                       |
| `titleEN`  | English title (used for `<title>` and page heading) |

### 01-registry-bookTags.csv

| Column  | Description                                              |
| ------- | -------------------------------------------------------- |
| `code`  | Tag code — matches a hyphen‑separated prefix in bookCode |
| `label` | Display name for the badge                               |

Tags are auto‑assigned a colour using golden‑ratio HSL hue rotation (`n × 137.5°`). A `<style>` tag is injected at load time with enough slots for all current tags plus headroom. Each slot has light/sepia and dark‑mode variants. Adding a new tag is just `code,label` — no colour‑picking, no limit on tag count. The PIN entry exists only to document the pin chip colour; it uses hardcoded red and is not part of the rotation.

### data/{bookCode}.csv

First row is always the header row. For a representative sample, see `AQD-nawaqidulIslam.csv` — a small file covering the common column patterns (`headAR`, `bodyAR`, `headDV`, `bodyDV`, `foot`). If column 0 is `#` or blank it's treated as row numbers (hidden from content, shown as `#N` labels in the card view). Otherwise column 0 is regular content. Column headers ending with `-HDN` (case-insensitive) are hidden by default — the reader starts with those columns toggled off (they can still be turned back on via the column dropdown). Consecutive blank lines within a cell are collapsed to a single line break; both `\r\n` (Windows) and `\n` (Unix) line endings are normalised before collapsing.

## Tag system

Tag codes are hyphen‑separated prefix segments of `bookCode`, excluding the final segment. Suffix flags like `-HDN` are stripped before extracting the book name (and also hide the book from the dashboard). At the column level, any CSV header ending with `-HDN` (e.g. `notes-HDN`) starts hidden in the reader. Each code is looked up in `01-registry-bookTags.csv`. Unknown codes silently ignored.

| bookCode                        | Tags             | Book Name             |
| ------------------------------- | ---------------- | --------------------- |
| `AQD-nawaqidulIslam`            | Aqidah           | nawaqidulIslam        |
| `AQD-qawaidulArbau`             | Aqidah           | qawaidulArbau         |
| `HDT-umdathulAhkam`             | Hadith           | umdathulAhkam         |
| `AQD-DFK-sharhuSunnahBarbahari` | Aqidah, DFK      | sharhuSunnahBarbahari |
| `DRFT-AQD-aqidahNawawi`         | ⚠️ Draft, Aqidah | aqidahNawawi          |

**Naming conventions:**

- `DRFT-` prefix → book gets a ⚠️ Draft badge, still visible on dashboard
- `-HDN` suffix → book hidden from dashboard
- `-DSC` suffix → rows displayed in reverse order; stripped from derived `titleEN`
- When adding a new suffix flag, add it to `$suffixFlags` in `03-update-bookRegistry.ps1` so `titleEN` is generated correctly
- `KNSH-` prefix → first line of `body*` columns styled as a heading; `titleEN` gets a `Kunnaasha ` prefix
- `RDF-` prefix (without `AQD-`) → `titleEN` gets a `Radheef ` prefix

## Quran data model

Books with the `QRN-` prefix (excluding `QRN-DATA-` source files) trigger Quran mode in the reader. Multiple CSV files are merged by row index — row N of every CSV corresponds to ayah N of the Quran.

### Data files

| File | Role | Columns |
|------|------|---------|
| `QRN-DATA-baseFile-1-juzNo_surahNo_ayahNo_basmalah_ayahImlai.csv` | Base data (always loaded) | `juzNo, surahNo, ayahNo, basmalah, ayahImlai` |
| `QRN-DATA-baseFile-2-ayahUthmani.csv` | Uthmani script (on demand) | `ayahUthmani` |
| `QRN-DATA-registry-surahSelector.csv` | Surah metadata | `surahNo, nameAR, nameDV, nameEN, ayahCount` |
| `QRN-DATA-registry-bookToggle.csv` | Column registry | `sourceBook, sourceCol, displayDV, displayEN` |
| `QRN-{name}.csv` | Book-specific columns | Varies per book |

### Merging

Base data columns are always present. Book-specific columns are merged by row index. The `QRN-DATA-registry-bookToggle.csv` registry declares all available columns across all QRN books — the content dropdown uses this to list toggleable columns, including those from other books (loaded on demand via `loadAndInsertColumn`).

### Quran navigation

A navigation row (`readerPanelQuran`) appears inside the collapsible reader panel for QRN books:

  - **Surah selector**: button showing `{N} {nameAR}`, click opens a searchable overlay of all 114 surahs
  - **Ayah selector**: number input with prev/next arrows and a dropdown list on click/focus
  - **Juz selector**: number input with prev/next arrows and a dropdown list on click/focus (1–30)
  - **Content dropdown**: checkboxes for all columns from the registry; changes apply immediately
  - **Display dropdown** (`﴿١﴾ ▾`): three checkboxes controlling ayah decoration (braces, ayah number, number-position)
  - `﴿ ﴾` — wraps ayah in Quranic braces
  - `١٢٣` — appends ayah number in Arabic numerals
  - `﴿١٢٣﴾` — number-only brackets: `text ﴿١﴾` instead of `﴿text ١﴾`

Navigation syncs on scroll: the visible ayah's surah, ayah, and juz update automatically. Changing any selector updates the others (e.g. changing surah recalculates juz).

### Ayah decoration

Columns `ayahImlai` and `ayahUthmani` are rendered with configurable decoration:

| Braces | Number | Num Brackets | Output |
|--------|--------|-------------|--------|
| ☑ | ☑ | ☐ | `﴿text ١﴾` |
| ☑ | ☑ | ☑ | `text ﴿١﴾` |
| ☑ | ☐ | — | `﴿text﴾` |
| ☐ | ☑ | — | `text ١` |
| ☐ | ☐ | — | `text` |

### Clipboard

Quran clipboard format: no book header line. Decorated ayah text, `[surahName surahNo : ayahNo]` reference, then columns grouped by source book — each book gets one label (from `02-registry-bookNames.csv`) above its first column, no per-column headings.

### Performance

`table-layout: auto` lets columns size to content. `border-collapse: separate` avoids the expensive collapsing-border algorithm. `contain: layout style` on `.rdf-table` isolates layout. `content-visibility: auto` is explicitly excluded from `<tr>` (breaks table layout). The table wrapper uses `overflow-x: clip` (fallback: `hidden`) so sticky `<th>` elements aren't trapped by a scroll container. A sticky horizontal scrollbar at the top of the table provides horizontal scrolling for wide tables.

## Development conventions

### UI & theming

**No external dependencies.** Everything is hand‑rolled — no npm, no CDN, no frameworks. CSS variables for theming, vanilla JS modules, a custom CSV parser (~1 KB), a custom ZIP/XLSX writer, and a custom EPUB writer. Keep it that way.

**RTL‑first.** The default text direction is `rtl` (Arabic / Dhivehi). Only UI chrome labels and English‑only text (tooltips, errors) appear LTR. New elements default to `direction: rtl` unless they are explicitly English‑only.

**CSS variables.** Never hardcode a colour. Every colour comes from a CSS custom property defined in `:root` (light), `[data-theme="sepia"]`, and `[data-theme="dark"]`. If you add a new colour variable, you must define it in all three theme blocks — light, sepia, and dark. New components must be tested in all three themes to confirm they are readable and look correct. The variable naming pattern is `--color-<role>` (e.g. `--color-text`, `--color-border`, `--color-nav-btn-bg`).

**Responsive.** Single breakpoint at `max-width: 600px`. Mobile gets reduced padding, smaller font sizes, and larger tap targets. The reader font size is user‑adjustable via the settings modal and stored in `localStorage`.

**Font.** A single merged WOFF2 font (`font/merged-300.woff2`) covers Arabic, Thaana, and Latin glyphs. `font-family` stacks always list `"Hadithmv"` first, then platform fallbacks. Never load external fonts.

### Horizontal scrolling & RTL

The reader uses RTL (`direction: rtl`) throughout. This affects horizontal scrolling in non‑obvious ways:

**RTL scroll conventions differ by browser:**
- Chrome: `scrollLeft = 0` at the rightmost (start), goes **positive** when scrolling left toward end
- Firefox: `scrollLeft = 0` at the rightmost (start), goes **negative** when scrolling left toward end
- Always use `Math.abs(scrollLeft)` for position checks. Always test scroll behavior in both browsers.

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
- Click handlers: start arrow (►) → `scrollLeft -= 200` (toward start/right). End arrow (◄) → `scrollLeft += 200` (toward end/left).
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

**IDs.** Element IDs use camelCase — e.g. `btnReset`, `searchInput`, `readerContent`, `pinsDropdown`. No kebab‑case or snake_case.

**Tooltips.** Every `<button>`, `<a>`, and interactive element carries a `title` tooltip describing its action. If the element has a keyboard shortcut, the tooltip includes the key in parentheses — e.g. `title="Toggle focus mode (z key)"`. Tooltips are **always in English** and never translated.

**Static text.** Any visible string in static HTML uses a `data-i18n` attribute. Dynamic text uses `t("key")`. Never hardcode a Dhivehi, Arabic, or English label directly in HTML or JS — use the i18n layer.

### JavaScript

**Module pattern.** All JS files are ES modules (`<script type="module">`). Heavy modules (`epub.js`, `xlsx.js`) use dynamic `import()` — they are only fetched when the user triggers an export, keeping the initial bundle small.

**Variable style.** `var` is used for function‑scoped variables throughout the codebase. `let` and `const` appear only in newer, self‑contained additions.

**New exports.** Each export format is an `else if (fmt === "...")` block in the export click handler in `reader.js`. Follow the existing pattern: build a string or Blob, call `downloadFile()` or open a new window. Exports that produce data or table formats (CSV, TSV, Excel, JSON, HTML Table) must include the CSV header row as the first row / `<thead>`. Rich‑text exports (TXT, MD, PDF, Word, EPUB, HTML reader view) use the formatted rendering path and should not include a raw header row.

### i18n

**Key naming.** i18n keys are camelCase and describe the element or purpose — e.g. `btnExportText`, `tagAQD`, `pinsEmpty`. Add keys for all three languages (`dv`, `en`, `ar`).

**Errors and messages.** All error messages, status text, and alerts are in **English only** — they are not run through `t()` or `data-i18n`. This keeps errors readable regardless of the user's chosen UI language.

### Data & CSV

**Book code format.** `TAG1-TAG2-bookName-SUFFIX`. Tag prefixes are matched against `01-registry-bookTags.csv`. After stripping known tags and suffix flags, the remaining segment is the book name.

```text
"DRFT-AQD-sharhuSunnahBarbahari-HDN"
  │    │          │                │
  │    │          │                └─ Suffix flag: hide from dashboard
  │    │          └─ Book name (after stripping tags & suffixes)
  │    └─ Tag prefix → "Aqidah" badge
  └─ Tag prefix → "⚠️ Draft" badge

"AQD-nawaqidulIslam"
  │        │
  │        └─ Book name
  └─ Tag prefix → "Aqidah" badge
```

**CSV column naming.** `*AR` = Arabic text, `*DV` = Dhivehi text. Heading hierarchy: `head` > `kitab` > `bab`. `matn` = main text, `sharh` = commentary, `foot` = footnotes. Column 0 = `#` means row numbers (hidden from content, shown as `#N` labels). These names drive CSS class assignment in the reader — changing a prefix changes its visual treatment.

**File naming.** A book's CSV file must match its `bookCode` exactly (e.g. `AQD-nawaqidulIslam.csv`). Data files use numeric prefixes for load order (`02-registry-bookNames.csv`, `01-registry-bookTags.csv`). For a representative sample CSV, see `AQD-nawaqidulIslam.csv`.

### Keyboard shortcuts

Any new button or action that has a keyboard shortcut documents it in the tooltip (see above) and in the [Keyboard](#keyboard) table. Shortcuts are kept discoverable — if you add a shortcut, add the tooltip.

### State

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

1. Create `data/FQH-usululFiqh.csv` with a header row and content:
   ```csv
   #,headAR,bodyAR,headDV,bodyDV,foot
   1,باب النية,النية هي...,ނިޔަތަކީ...,—,المصدر
   ```
2. Add a line to `data/02-registry-bookNames.csv`:
   ```csv
   FQH-usululFiqh,أصول الفقه,އުސޫލުލް ފިޤްހު,Usulul Fiqh
   ```
3. Run `data/03-update-bookRegistry.ps1` — or the book auto‑registers on first visit via `?book=FQH-usululFiqh`.

### Add a new tag category

Add one row to `data/01-registry-bookTags.csv`. Colours are auto‑generated — just `code` and `label`:
```csv
code,label
FQH,Fiqh
```
Use the tag code as a prefix in any `bookCode` (e.g. `FQH-usululFiqh`) — badges render automatically with a golden‑ratio HSL colour. No limit on tag count; colours stay perceptually distinct.

### Add a new export format

In `js/reader.js`, add an `else if (fmt === "...")` block inside the export click handler. Data formats use `rowsWithHeader`; rich‑text formats use `rows`:
```js
} else if (fmt === "newfmt") {
  content = myFormatBuilder(rowsWithHeader);   // include headers
  filename = baseName + ".ext";
  mime = "application/x-myformat";
}
```
Heavy modules use dynamic `import()` so they only load on demand (see `xlsx.js` and `epub.js`).

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

All errors show visible messages in English:

| Error                  | Source                   |
| ---------------------- | ------------------------ |
| Registry fails to load | `catalog.js` → dashboard |
| Book code not found    | `catalog.js` → reader    |
| CSV empty or fails     | `reader.js` → reader     |
| CSV parse warnings     | Console (non‑fatal)      |

## Adding content

### New book

1. Add a row to `data/02-registry-bookNames.csv`.
1. Create `data/{bookCode}.csv` with a header row as the first row.
1. Open the viewer — it appears automatically.

### New tag category

1. Add a row to `data/01-registry-bookTags.csv` with `code,label`. Colours are auto‑generated — no need to pick hex values.
1. Use the code as a prefix in any `bookCode` — badges render automatically.

## Key benefits

- **Single source of truth** — book metadata and tag definitions in CSV files
- **Shared template** — one HTML page for all books
- **Zero code changes** — adding books or categories is CSV‑only
- **Three themes** — light, dark, sepia; persisted, no flash
- **RTL‑native** — nav and content flow right‑to‑left for Arabic/Dhivehi
- **Trilingual UI** — Dhivehi, English, Arabic
- **Infinite scroll** — seamless reading, no page breaks
- **All settings persisted** — theme, language, widescreen, font size, font family, hidden columns, tashkeel
