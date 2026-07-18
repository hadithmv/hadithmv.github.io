# Architecture

Metadata-driven, single-page viewer for Islamic texts. Configuration lives in CSV files. UI supports Dhivehi, English, and Arabic.

> **Other docs:** [User Guide](USER_GUIDE.md) for readers · [API Reference](API.md) for developers

## Files

| File                         | Purpose                                                                    |
| ---------------------------- | -------------------------------------------------------------------------- |
| `data/01-bookNames.csv`      | Central registry of books (code, titles in AR/DV/EN)                       |
| `data/02-bookTags.csv`       | Tag definitions (code, label, badge colors)                                |
| `books/index.html`           | Dashboard — book list, search, tag filter, table/card view                 |
| `books/reader.html`          | Book viewer — loaded via `?book=CODE`                                      |
| `css/styles.css`             | Shared styles: themes, topBar, sidebar, modals, responsive                 |
| `css/dashboard.css`          | Dashboard styles: grid, cards, controls, table view                        |
| `js/common.js`               | Shared init: theme, fonts, i18n, sidebar, settings, keyboard               |
| `js/catalog.js`              | Metadata loading, tag extraction, dashboard rendering                      |
| `js/reader.js`               | Book viewer: infinite scroll, toolbar, keyboard, export, clipboard         |
| `js/csv.js`                  | Tiny CSV parser (~1 KB) — `parseCSV()`, `unparseCSV()`                     |
| `js/search.js`               | Search engine: normalisation, parsing, matching, snippets, history         |
| `js/xlsx.js`                 | XLSX writer + shared ZIP layer — `zipStore()`, `createXLSX()`, lazy‑loaded |
| `js/epub.js`                 | EPUB 3 e-book writer — `createEPUB()`, lazy-loaded on demand               |
| `js/i18n.js`                 | Translations module (dv/en/ar) — `t()`, `setLanguage()`                    |
| `font/`                      | Custom merged font (Arabic + Thaana + Latin, WOFF2 + WOFF)                 |
| `data/*.csv`                 | Per-book content files                                                     |
| `data/03-updateBookMeta.ps1` | Auto-generates titleEN from bookCode, adds new books                       |

## Request flow

```text
URL: ?book=AQD-nawaqidulIslam
        │
        ▼
  catalog.js
    ├─ fetch ../data/01-bookNames.csv  ──→  find row by bookCode
    ├─ fetch ../data/02-bookTags.csv ──→  resolve tag badges from prefix
    └─ returns { bookCode, titleAR, titleDV, titleEN, csvPath }
        │
        ▼
  reader.js
    ├─ parseCSV(../data/AQD-nawaqidulIslam.csv)
    ├─ skip # header row if present
    ├─ build column toggle buttons
    ├─ loadInitial() → first chunk of rows
    └─ wire infinite scroll / search / toolbar / keyboard / i18n
```

No `?book=` → dashboard (`index.html`) loads `catalog.js` → search bar, tag chips, sort/table toggle, card grid of all books.

`?book=CODE` → reader (`reader.html`) loads `reader.js` → parses the book CSV, renders infinite-scroll content.

Both pages share `common.js` for theme, fonts, i18n, sidebar, settings modal, and keyboard shortcuts.

## Reader UI

### Layout

```text
┌─ Fixed topBar (z-index 101, opaque bg, bottom border) ───────┐
│  ↩ Return  ↕ Focus  │  Book Title (scrollable)  │  ☰ Menu   │
├─ Sticky chrome (z-index 50, bottom-border cut) ──────────────┤
│  Search bar: 🔎 Advanced, input, ✕ clear, match count       │
│  Toolbar: Copy, Tashkeel, Share, View, Reset, Export, etc.  │
│  Pagination: ސަފްހާ: << < 10/[5] > >>  Subtitle + Tags     │
├─ Reader content (scrollable) ────────────────────────────────┤
│  #1                                                          │
│  column 1 …                                                  │
│  column 2 …                                                  │
│       ــــــــــــــــــــــــــــــــــــــــــــ           │
│  footnotes                                                   │
│         ◆                                                    │
│  #2                                                          │
│  …                                                           │
├─ Pagination (bottom) ────────────────────────────────────────┤
│  << < 10/[5] > >>                                            │
└──────────────────────────────────────────────────────────────┘
```

### Infinite scroll

Content loads in chunks of 2 rows. Sentinel elements at top and bottom trigger `IntersectionObserver` to prepend/append more rows when scrolling near edges. Pagination updates based on the most visible row.

### Pagination

Simple: First (`<<`) / Prev (`<`) / a `<select>` dropdown of all rows / Next (`>`) / Last (`>>`). The select shows `10 / [5]` (total rows / current row). All buttons and the select share the same height. Centered on mobile. `ސަފްހާ:` label sits to the right.

### Search

Real‑time, tashkeel‑insensitive filtering via `normaliseForSearch()` — strips Arabic diacritics, normalises alif/ya/waw variants, strips Thaana fili (vowel marks), and normalises Thaana thikijehi (Arabic‑derived letters) to base Thaana. Results dropdown with highlighted snippets mapped back to original text. Keyboard‑navigable (↑/↓/Enter/Escape). Advanced search modal for column/condition/value filters with AND/OR logic. Same normalisation used for dashboard search.

### Toolbar

| Control         | Implementation                                                                                                                                                                                                                                                                   |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Copy            | Builds formatted plain text from the visible row: book title header, blank lines between fields, `ـ` divider before footnotes. `navigator.clipboard.writeText()` with `execCommand` fallback.                                                                                    |
| Share           | Copies a deep link (`?book=CODE&row=N`) to the current row.                                                                                                                                                                                                                      |
| Hide diacritics | Wraps Unicode diacritic ranges in `<span class="tashkeel">`. Toggle adds `.hide‑tashkeel` class → `display: none`.                                                                                                                                                               |
| View toggle     | Switches between vertical card mode and horizontal table mode. RDF-prefixed books default to table. Applies to all books.                                                                                                                                                        |
| Reset           | Clears search, unhides all columns, shows tashkeel, exits focus mode, clears `reader:` localStorage.                                                                                                                                                                             |
| Export          | Dropdown: TXT, MD, JSON, CSV, YAML, TOON, XML, Excel, EPUB, Word, PDF, PNG. TOON uses expanded list per spec. Excel uses `js/xlsx.js` (lazy-loaded). EPUB uses `js/epub.js` (lazy-loaded, embedded font). All include book title, URL, Hadithmv, version, and proper formatting. |
| Hide columns    | Dropdown with per‑column toggle buttons. `hiddenColumns[]` persisted.                                                                                                                                                                                                            |

The toolbar and pagination rows are wrapped in a `.h-scroll-wrap` container with `padding: 0 30px` that provides space for absolutely‑positioned ◀▶ arrow buttons at the edges. The row itself handles horizontal scrolling (`overflow-x: auto`, hidden scrollbar). Mouse wheel over the wrap is redirected to horizontal scroll on the row. When the row overflows, direction‑aware arrow buttons appear at the edges: ◀ at the end (scrolls toward end), ▶ at the start (scrolls toward start). Arrows are hidden at the appropriate extremes. Both arrow clicks and mouse‑wheel redirection animate smoothly via the same `requestAnimationFrame` loop with an ease‑out‑cubic curve (300ms). Arrow visibility updates on scroll, resize, and after the reader wrapper becomes visible.

### Focus mode

Toggled via the green ↕/▼ button in the topBar or `z` key. Collapses the chrome smoothly via CSS Grid `grid-template-rows: 1fr → 0fr` transition (no max-height stutter). Chrome padding and border also hidden. Bottom nav hidden. Only the topBar and reader content remain.

### Themes

Three themes via `[data-theme]` attribute: `light` (default), `dark`, `sepia`. All colors are CSS custom properties. Selectable from settings modal. Persisted, applied before paint via blocking `<script>` in `<head>`.

### Settings modal

Opened from the sidebar. Cards for Appearance (theme dropdown, widescreen toggle), Font (size ±, family dropdown: Hadithmv/System — always English), and Language (select dropdown). Reset button in the modal header clears all settings. Modal has `overscroll-behavior: contain` and body scroll is locked when open to prevent background scroll bleed.

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
| `s`             | Reader                 | Share link                             |
| `e`             | Reader                 | Open export dropdown                   |
| `Ctrl+,`        | Anywhere               | Open settings                          |
| `Ctrl+b`        | Anywhere               | Back to book list                      |
| `Escape`        | Sidebar/modal/dropdown | Close                                  |

## Data shape

### bookNames.csv

| Column     | Description                                         |
| ---------- | --------------------------------------------------- |
| `bookCode` | Unique identifier, doubles as the data CSV filename |
| `titleAR`  | Arabic title                                        |
| `titleDV`  | Dhivehi title                                       |
| `titleEN`  | English title (used for `<title>` and page heading) |

### 02-bookTags.csv

| Column  | Description                                              |
| ------- | -------------------------------------------------------- |
| `code`  | Tag code — matches a hyphen‑separated prefix in bookCode |
| `label` | Display name for the badge                               |
| `color` | Text color (CSS hex)                                     |
| `bg`    | Background color (CSS hex)                               |

Pick colours from distinct hue zones so no two tags look alike. Current palette: indigo (AQD), emerald (HDT), amber (QRN), brown (QRNU), violet (RDF), slate (DFK), cyan (IH), red (DRFT), orange (AKLQ), blue (ATHR).

### data/{bookCode}.csv

Optional `#` header row for column labels. Excluded from display.

## Tag system

Tag codes are hyphen‑separated prefix segments of `bookCode`, excluding the final segment. Suffix flags like `-HDN` are also stripped before extracting the book name. Each code is looked up in `02-bookTags.csv`. Unknown codes silently ignored.

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
- `-DRAFT` suffix (legacy) → also hidden, same as `-HDN`

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

1. Add a row to `bookNames.csv`.
1. Create `data/{bookCode}.csv` with an optional `#` header row.
1. Open the viewer — it appears automatically.

### New tag category

1. Add a row to `data/02-bookTags.csv`.
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
