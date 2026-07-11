# Book Lookup System Architecture

A metadata-driven, single-page viewer for Islamic texts. All configuration lives in CSV files — adding content or categories never requires code changes. The UI is in Dhivehi; error messages are in English.

## Files

| File               | Purpose                                                       |
| ------------------ | ------------------------------------------------------------- |
| `bookNames.csv`    | Central registry of books (code, titles in AR/DV/EN)          |
| `tags.csv`         | Tag definitions (code, label, badge colors)                   |
| `books/index.html` | Shared viewer page and library dashboard                      |
| `css/styles.css`   | All styles: light + dark themes, reader, toolbar, responsive  |
| `js/dbLookup.js`   | Metadata loading, tag extraction, dashboard rendering         |
| `js/reader.js`     | Book viewer: pagination, search, toolbar, clipboard, keyboard |
| `font/`            | Custom merged font (Arabic + Thaana + Latin, WOFF2 + WOFF)    |
| `data/*.csv`       | Per-book content files                                        |
| `dependencies/`    | PapaParse only                                                |

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
    ├─ renderPage(0) → vertical reading card
    └─ wire pagination / search / toolbar / keyboard
```

No `?book=` → `dbLookup.js` calls `renderDashboard()` → card grid of all registered books.

## Reader UI

### Layout

```text
┌─ Search bar ──────────────────────────────────────────────┐
│  މި ފޮތުން ހޯދާ…                            [✕]  ނަތީޖާ N │
├─ Search results (dropdown, visible while searching) ──────┤
│  #5  …matching text from column 1 with <mark>…           │
│  #5  …matching text from column 3 with <mark>…           │
│  #8  …matching text from column 2 with <mark>…           │
├─ Toolbar ─────────────────────────────────────────────────┤
│  [📋 ކޮޕީ ކުރޭ] [◉ ފިލި ފޮރުވާ]           │
│  އެއްފަހަރާ ދައްކަންވީ ކިތައް ސަފްހާ: [1 ▾]               │
│  ކޮލަމް ފޮރުވާ: [#] [1] [2] [3] [4] [ނޯޓު]        │
├─ Pagination (top) ────────────────────────────────┤
│  »  »»  10  …  3  2  1  ««  «     މިހާރުގެ ސަފްހާ [1 ▾]  ސަފްހާ 1 / 10 │
├─ Reader content ──────────────────────────────────┤
│  #1                                                │
│  [column 1]                                        │
│  [column 2]                                        │
│  column 3 …                                        │
│  column 4 …                                        │
│         ◆                                          │
│  footnotes                                         │
├─ Pagination (bottom) ─────────────────────────────┤
│  »  »»  10  …  3  2  1  ««  «     ސަފްހާ 1 / 10   │
└────────────────────────────────────────────────────┘
```

### Vertical reading card

Column 0 is the row number (`#N`), toggleable via the column controls. All non-empty columns are displayed in order with `dir="auto"` for automatic RTL/LTR detection. The last non-empty column is separated by a decorative `◆` divider and rendered as footnotes.

### Pagination

- **Page strip** — clickable buttons. ≤ 9 pages: all shown. > 9: first, `…`, ±2 window around current, `…`, last.
- **First / Last** (`««` / `»»`) and **Prev / Next** (`«` / `»`).
- **Page input** — type + Enter, or pick from `<datalist>` dropdown. Top nav only.
- Nav flows RTL (`dir="rtl"`) to match Arabic: `» »» 10 … 1 «« «`.
- Counter: `ސަފްހާ X / Y`. Match count appears separately next to the search bar.

### Search

Real-time filtering against all columns, case-insensitive. Pagination operates on the filtered set. `/` or `Ctrl+F` focuses the input.

A **results dropdown** appears below the search bar showing up to 50 matches. Each matching column in a row gets its own entry with a ~300-char snippet and `<mark>` highlighting. Click a result or press Enter to jump directly to that page. ↑/↓ arrows navigate the list; Escape closes it. Match count is shown as `ނަތީޖާ N` (or `ނަތީޖާ 0` when none).

### Toolbar

| Control            | Implementation                                                                                                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Copy               | Builds plain text from fields with book title header, blank lines between fields, and `ـ` divider before footnotes. Uses `navigator.clipboard.writeText()` with `execCommand` fallback. |
| Hide diacritics    | Wraps Unicode ranges U+064B–U+065F, U+0610–U+061A, U+06D6–U+06ED in `<span class="tashkeel">`. Toggle adds `.hide-tashkeel` class → CSS `display: none`.                                |
| Show pages at once | Changes `rowsPerPage` (1/2/3/5). `renderPage` slices the filtered data into pages of N rows, separated by dashed `<hr>`.                                                                |
| Hide columns       | Per-index toggle buttons. Hidden indices stored in `hiddenColumns[]`. `renderPage` skips hidden columns. Column 0 (row number) is toggleable.                                           |

All toolbar settings persist to `localStorage` under `reader:` keys.

### Dark mode

CSS custom properties under `:root` (light) and `[data-theme="dark"]` (dark). Toggle button applies `data-theme` attribute on `<html>`. Preference saved to `localStorage` and restored via blocking `<script>` in `<head>` before CSS paints — no flash.

### Keyboard

| Key             | Action               |
| --------------- | -------------------- |
| `←` / `→`       | Previous / next page |
| `Home` / `End`  | First / last page    |
| `/` or `Ctrl+F` | Focus search bar     |

Suppressed while search or page input is focused.

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
| `code`  | Tag code — matches a hyphen-separated prefix in bookCode |
| `label` | Display name for the badge                               |
| `color` | Text color (CSS hex)                                     |
| `bg`    | Background color (CSS hex)                               |

### data/{bookCode}.csv

Optional `#` header row. If present, column labels are taken from it for the toolbar toggles. The row itself is excluded from display.

```csv
#,section,arabic_text,dhivehi_text,notes
1,Introduction,بسم الله...,ބިސްމި...,—
```

Without a header row, auto-names are used: `#`, `1`, `2`, …, `ނޯޓު`.

## Tag system

Tag codes are the hyphen-separated prefix segments of `bookCode`, excluding the final segment (the book name). Each code is looked up in `tags.csv`. Unknown codes are silently ignored.

| bookCode                        | Tags        | Book Name             |
| ------------------------------- | ----------- | --------------------- |
| `AQD-nawaqidulIslam`            | Aqidah      | nawaqidulIslam        |
| `AQD-qawaidulArbau`             | Aqidah      | qawaidulArbau         |
| `HDT-umdathulAhkam`             | Hadith      | umdathulAhkam         |
| `AQD-DFK-sharhuSunnahBarbahari` | Aqidah, DFK | sharhuSunnahBarbahari |

## Error states

All error paths show visible messages in English (no silent blank screens):

- **Registry fails:** "Unable to load the book registry. Please check your connection and try again."
- **Book not found:** "Book X was not found in the registry. The registry may have failed to load, or the book code is incorrect."
- **CSV empty/fails:** "No data found in CSV file: …" / "Error loading CSV: …"

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
- **Zero code changes** — adding books or categories is CSV-only
- **Light + dark themes** — persisted, no flash
- **RTL-native** — nav flows right-to-left to match Arabic/Dhivehi reading direction
- **Graceful errors** — failures show messages, not blank screens
