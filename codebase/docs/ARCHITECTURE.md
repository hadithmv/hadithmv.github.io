# Book Lookup System Architecture

A metadata-driven, single-page viewer for Islamic texts. All configuration lives in CSV files. The UI supports Dhivehi, English, and Arabic via an i18n module.

## Files

| File               | Purpose                                                           |
| ------------------ | ----------------------------------------------------------------- |
| `bookNames.csv`    | Central registry of books (code, titles in AR/DV/EN)              |
| `tags.csv`         | Tag definitions (code, label, badge colors)                       |
| `books/index.html` | Shared viewer page and library dashboard                          |
| `css/styles.css`   | All styles: light + dark themes, sidebar, reader, toolbar, responsive |
| `js/dbLookup.js`   | Metadata loading, tag extraction, dashboard rendering             |
| `js/reader.js`     | Book viewer: pagination, search, toolbar, clipboard, keyboard     |
| `js/i18n.js`       | Translations module (dv/en/ar) — `t()`, `cycleLanguage()`        |
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
    ├─ build column toggle buttons from header or auto-names
    ├─ renderPage(0) → vertical reading card(s)
    └─ wire pagination / search / toolbar / keyboard / i18n
```

No `?book=` → `dbLookup.js` calls `renderDashboard()` → card grid of all registered books.

## Reader UI

### Layout

```text
┌─ Sidebar (☰) ──────────────────────────────────────────┐
│  Hadithmv                                    [✕]        │
│  ← Book list   📧 Contact                              │
│  ─────────────────────────                              │
│  📐 Widescreen                                          │
│  🌐 Language    ދިވެހި                                  │
│  🌙 Dark mode                                           │
│  ─────────────────────────                              │
│  Version 6.9.85 · Web                                   │
│  Made by: hadithmv                                      │
└─────────────────────────────────────────────────────────┘

┌─ Search bar ───────────────────────────────────────────┐
│  މި ފޮތުން ހޯދާ…                          [✕]   ނަތީޖާ N │
├─ Search results (dropdown) ─────────────────────────────┤
│  #5  …matching text from column 1…                     │
│  #5  …matching text from column 3…                     │
├─ Toolbar ──────────────────────────────────────────────┤
│  [📋 Copy] [◉ Hide diacritics] [↺ Reset]               │
│  Show pages at once: [1 ▾]   Hide columns: [#] [1] [2]…│
├─ Pagination (top) ─────────────────────────────────────┤
│  »  »»  10  …  3  2  1  ««  «     Page no.: [1 ▾]  Page 1 / 10 │
├─ Reader content ───────────────────────────────────────┤
│  #1                                                     │
│  [column 1]                                             │
│  [column 2]                                             │
│  column 3 …                                             │
│         ◆                                               │
│  footnotes                                              │
├─ Pagination (bottom) ──────────────────────────────────┤
│  »  »»  10  …  3  2  1  ««  «                Page 1 / 10 │
└─────────────────────────────────────────────────────────┘
```

### Vertical reading card

Column 0 is the row number (`#N`), toggleable via the column controls. All non‑empty, non‑hidden columns are displayed in order with `dir="auto"`. The last non‑empty column gets a decorative `◆` divider and smaller footnote styling.

When `Show pages at once` > 1, multiple rows render in a single page separated by a dashed `<hr>`.

### Pagination

- **Page strip** — clickable buttons. ≤ 9 total: all shown. > 9: first, `…`, ±2 window around current, `…`, last.
- **First / Last** (`««` / `»»`) and **Prev / Next** (`«` / `»`).
- **Page input** — type + Enter, or pick from `<datalist>` dropdown.
- Nav flows RTL (`dir="rtl"`): `» »» 10 … 1 «« «`.

### Search

Real‑time, case‑insensitive filtering against all columns. Pagination operates on the filtered set.

The **results dropdown** shows up to 50 entries — each matching column in a row produces its own entry with a ~300‑char snippet centred on the first match. Matches are highlighted with `<mark>` tags. The dropdown is keyboard‑navigable (↑/↓/Enter/Escape) and closes when clicking outside.

### Toolbar

| Control | Implementation |
|---|---|
| Copy | Builds plain text: book title (DV − AR), row numbers, blank lines between fields, `ـ` divider before footnotes. Uses `navigator.clipboard.writeText()` with `execCommand` fallback. |
| Hide diacritics | Wraps Unicode ranges U+064B–U+065F, U+0610–U+061A, U+06D6–U+06ED in `<span class="tashkeel">` during render. Toggle adds `.hide‑tashkeel` class on `#readerContent` → `display: none`. |
| Reset | Clears search, resets rowsPerPage to 1, unhides all columns, shows tashkeel, jumps to page 1, clears all `localStorage` reader settings. |
| Show pages at once | `rowsPerPage ∈ {1,2,3,5}`. `renderPage` slices `filteredData` into pages of N rows. Changing the value preserves the top‑most visible row. |
| Hide columns | Per‑index buttons built from the header row or auto‑names (`#`, `1`, `2`, …, `colNotes`). `hiddenColumns[]` persisted. Column 0 is toggleable. |

### Sidebar

Opened via the ☰ hamburger button (top‑right). Slides in from the right over a semi‑transparent overlay. Closes on ✕, overlay click, or Escape.

- **Dashboard link** → `index.html` (clears `?book`)
- **Contact link** → `contact.html`
- **Widescreen** → toggles `data-widescreen` on `<html>`, removing `max-width` from reader, page header, and dashboard
- **Language** → cycles `dv → en → ar → dv`, fires `languagechange` event
- **Dark mode** → toggles `data-theme`, persisted, applied before paint
- **Footer** → version string and creator credit

### Dark mode

CSS custom properties: `:root` (light) and `[data-theme="dark"]` (dark). A blocking `<script>` in `<head>` reads `localStorage` and sets `data-theme` before the CSS link — no flash of wrong theme.

### Widescreen mode

`[data-widescreen]` removes `max-width` constraints from `#pageHeader`, `#readerWrapper`, and `#dashboardWrapper`. The reader content borders become seamless. Persisted to `localStorage`.

### Internationalisation

All UI strings live in [`js/i18n.js`](../js/i18n.js) as a `STRINGS` dictionary with `dv`, `en`, and `ar` keys. Language is stored in `localStorage` and applied as `data-lang` on `<html>`.

- **Static text:** `data-i18n` and `data-i18n-title` attributes on HTML elements. `initI18n()` walks them on load and on every language change.
- **Dynamic text:** `t(key)` imported by `reader.js` and `dbLookup.js`. A `languagechange` CustomEvent triggers column‑toggle rebuild and page re‑render.

### Keyboard

| Key | Context | Action |
|---|---|---|
| `←` / `→` | Reader (not in inputs) | Previous / next page |
| `Home` / `End` | Reader (not in inputs) | First / last page |
| `/` or `Ctrl+F` | Anywhere | Focus search bar |
| `↑` / `↓` | Search focused | Navigate results list |
| `Enter` | Search focused + result selected | Jump to result |
| `Escape` | Search focused or sidebar open | Close dropdown / sidebar |

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

Optional `#` header row. If present, labels the column toggles. The row is excluded from display.

Without a header row, auto‑names are used: `#`, `1`, `2`, …, `colNotes`.

## Tag system

Tag codes are the hyphen‑separated prefix segments of `bookCode`, excluding the final segment (the book name). Each code is looked up in `tags.csv`. Unknown codes are silently ignored.

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
| CSV empty or fails to parse | `reader.js` → reader |
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
- **Light + dark themes** — persisted, no flash, CSS custom properties
- **RTL‑native** — nav and content flow right‑to‑left for Arabic/Dhivehi
- **Trilingual UI** — Dhivehi, English, Arabic; one click to cycle
- **Graceful errors** — failures show messages, never blank screens
- **All settings persisted** — theme, language, widescreen, rows/page, hidden columns, tashkeel
