# Book Lookup System Architecture

A metadata-driven, single-page viewer for Islamic texts. All configuration lives in CSV files. The UI supports Dhivehi, English, and Arabic via an i18n module.

## Files

| File               | Purpose                                                           |
| ------------------ | ----------------------------------------------------------------- |
| `bookNames.csv`    | Central registry of books (code, titles in AR/DV/EN)              |
| `tags.csv`         | Tag definitions (code, label, badge colors)                       |
| `books/index.html` | Shared viewer page and library dashboard                          |
| `css/styles.css`   | All styles: light + dark + sepia themes, sidebar, reader, responsive |
| `js/dbLookup.js`   | Metadata loading, tag extraction, dashboard rendering             |
| `js/reader.js`     | Book viewer: infinite scroll, search, toolbar, clipboard, keyboard |
| `js/i18n.js`       | Translations module (dv/en/ar) — `t()`, `setLanguage()`          |
| `font/`            | Custom merged font (Arabic + Thaana + Latin, WOFF2 + WOFF)        |
| `data/*.csv`       | Per-book content files                                            |
| `dependencies/`    | PapaParse only                                                    |

## Request flow

```text
URL: ?book=AQD-nawaqidulIslam
        │
        ▼
  dbLookup.js
    ├─ fetch ../bookNames.csv  ──→  find row by bookCode
    ├─ fetch ../tags.csv       ──→  resolve tag badges from prefix
    └─ returns { bookCode, titleAR, titleDV, titleEN, csvPath }
        │
        ▼
  reader.js
    ├─ Papa.parse(../data/AQD-nawaqidulIslam.csv)
    ├─ skip # header row if present
    ├─ build column toggle buttons
    ├─ loadInitial() → first chunk of rows
    └─ wire infinite scroll / search / toolbar / keyboard / i18n
```

No `?book=` → `dbLookup.js` calls `renderDashboard()` → card grid of all registered books.

## Reader UI

### Layout

```text
┌─ Sticky chrome ───────────────────────────────────────────┐
│  Page header: back link, title, subtitle + tags, counter   │
│  Search bar: input, ✕ clear, match count                  │
│  Toolbar: Copy, Hide diacritics, Reset, Hide columns ▾    │
│  Pagination: ސަފްހާ: «« « 10/[5] » »»  Focus btn         │
├─ Reader content (scrollable) ─────────────────────────────┤
│  #1                                                        │
│  [column 1]                                                │
│  [column 2]                                                │
│  column 3 …                                                │
│       ــــــــــــــــــــــــــــــــــــــــــــ         │
│  footnotes                                                 │
│         ◆                                                  │
│  #2                                                        │
│  …                                                         │
├─ Pagination (bottom) ─────────────────────────────────────┤
│  ސަފްހާ: «« « 10/[5] » »»                                │
└────────────────────────────────────────────────────────────┘
```

### Infinite scroll

Content loads in chunks of 2 rows. Sentinel elements at top and bottom trigger `IntersectionObserver` to prepend/append more rows when scrolling near edges. Pagination updates based on the most visible row.

### Pagination

Simple: First / Prev / a `<select>` dropdown of all rows / Next / Last. The select shows `10 / [5]` (total rows / current row). `ސަފްހާ:` label sits to the right of First/Prev.

### Search

Real‑time, case‑insensitive filtering against all columns. Results dropdown with highlighted snippets. Keyboard‑navigable (↑/↓/Enter/Escape). Advanced search modal for column/condition/value filters with AND/OR logic.

### Toolbar

| Control | Implementation |
|---|---|
| Copy | Builds formatted plain text from the visible row: book title header, blank lines between fields, `ـ` divider before footnotes. `navigator.clipboard.writeText()` with `execCommand` fallback. |
| Hide diacritics | Wraps Unicode diacritic ranges in `<span class="tashkeel">`. Toggle adds `.hide‑tashkeel` class → `display: none`. |
| Reset | Clears search, unhides all columns, shows tashkeel, exits focus mode, clears `reader:` localStorage. |
| Export | Dropdown with TXT, MD, JSON, CSV, Word, PDF. Each includes Hadithmv header, URL, version, book title, and proper formatting with tatweel dividers. |
| Hide columns | Dropdown with per‑column toggle buttons. `hiddenColumns[]` persisted. |

### Focus mode

Toggled via pagination bar button or `z` key. Hides search bar, toolbar, and pagination bars. Sticky header with title and expand button remains. `[data-focus]` CSS attribute.

### Themes

Three themes via `[data-theme]` attribute: `light` (default), `dark`, `sepia`. All colors are CSS custom properties. Selectable from settings modal. Persisted, applied before paint via blocking `<script>` in `<head>`.

### Settings modal

Opened from the sidebar. Cards for Appearance (theme dropdown, widescreen toggle), Font (size ±, family toggle Hadithmv/System), and Language (select dropdown). Reset button in the modal header clears all settings.

### Internationalisation

`js/i18n.js` exports `t(key)`, `setLanguage(lang)`, `initI18n()`. Static HTML uses `data-i18n` attributes; dynamic text calls `t()`. A `languagechange` CustomEvent triggers re‑render. Language persisted to `localStorage`.

### Keyboard

| Key | Context | Action |
|---|---|---|
| `←` / `→` | Reader | Previous / next row |
| `Home` / `End` | Reader | First / last row |
| `/` or `Ctrl+F` | Anywhere | Focus search bar |
| `z` | Reader | Toggle focus mode |
| `Escape` | Sidebar/modal open | Close |

## Data shape

### bookNames.csv

| Column     | Description                                         |
| ---------- | --------------------------------------------------- |
| `bookCode` | Unique identifier, doubles as the data CSV filename |
| `titleAR`  | Arabic title                                        |
| `titleDV`  | Dhivehi title                                       |
| `titleEN`  | English title (used for `<title>` and page heading) |

### tags.csv

| Column  | Description                                              |
| ------- | -------------------------------------------------------- |
| `code`  | Tag code — matches a hyphen‑separated prefix in bookCode |
| `label` | Display name for the badge                               |
| `color` | Text color (CSS hex)                                     |
| `bg`    | Background color (CSS hex)                               |

### data/{bookCode}.csv

Optional `#` header row for column labels. Excluded from display.

## Tag system

Tag codes are hyphen‑separated prefix segments of `bookCode`, excluding the final segment. Each code is looked up in `tags.csv`. Unknown codes silently ignored.

| bookCode                        | Tags        | Book Name             |
| ------------------------------- | ----------- | --------------------- |
| `AQD-nawaqidulIslam`            | Aqidah      | nawaqidulIslam        |
| `AQD-qawaidulArbau`             | Aqidah      | qawaidulArbau         |
| `HDT-umdathulAhkam`             | Hadith      | umdathulAhkam         |
| `AQD-DFK-sharhuSunnahBarbahari` | Aqidah, DFK | sharhuSunnahBarbahari |

## Error states

All errors show visible messages in English:

| Error | Source |
|---|---|
| Registry fails to load | `dbLookup.js` → dashboard |
| Book code not found | `dbLookup.js` → reader |
| CSV empty or fails | `reader.js` → reader |
| CSV parse warnings | Console (non‑fatal) |

## Adding content

### New book

1. Add a row to `bookNames.csv`.
1. Create `data/{bookCode}.csv` with an optional `#` header row.
1. Open the viewer — it appears automatically.

### New tag category

1. Add a row to `tags.csv`.
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
