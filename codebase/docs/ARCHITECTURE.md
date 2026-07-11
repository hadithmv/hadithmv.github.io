# Book Lookup System Architecture

A metadata-driven, single-page viewer that displays multiple books without duplicating HTML or JavaScript. All configuration lives in CSV files — adding content or categories never requires code changes.

## Files

| File               | Purpose                                                        |
| ------------------ | -------------------------------------------------------------- |
| `bookNames.csv`    | Central registry of books (code, titles in AR/DV/EN)           |
| `tags.csv`         | Tag definitions (code, label, badge colors)                    |
| `books/index.html` | Shared viewer page and library dashboard                       |
| `css/styles.css`   | All presentation styles (light + dark themes via custom props) |
| `js/dbLookup.js`   | Logic for loading metadata, parsing tags, and rendering the UI |
| `font/`            | Custom merged font (Arabic + Thaana + Latin, WOFF2 + WOFF)     |
| `data/*.csv`       | Per-book content files                                         |
| `dependencies/`    | Vendored libraries (PapaParse only)                            |

## How it works

1. The page reads `?book=CODE` from the URL query string.
1. `dbLookup.js` loads `bookNames.csv` (via PapaParse) and looks up the matching row.
1. It loads `tags.csv` to resolve tag badges from the book code's prefix segments.
1. It tells the caller the matching CSV path (`data/{bookCode}.csv`).
1. The page loads that CSV (via PapaParse), detects and skips any `#` header row, then renders one row at a time as a vertical reading card.

If no `?book=` parameter is present, the page shows a **dashboard** — a card grid of all registered books with tag badges and titles in all three languages.

## Reader UI

### Vertical reading card

Each CSV row is rendered as a stacked set of fields, one page at a time. Column 0 is shown as the `#N` heading. All non-empty columns (1 through N-1) are displayed in order with `dir="auto"` for automatic RTL/LTR detection. The **last non-empty column** is separated by a decorative `◆` divider and rendered in a smaller footnotes style.

### Pagination

A full pagination bar sits above and below the reader content:

- **First / Last** (`««` / `»»`) — jump to boundaries.
- **Previous / Next** (`«` / `»`) — step one page.
- **Page number strip** — clickable buttons:
  - ≤ 9 total pages: all shown.
  - > 9 pages: first page, `…` ellipsis, a window of ±2 around current, `…` ellipsis, last page.
- **Page input** (top bar only) — type a number + Enter, or pick from the `<datalist>` dropdown.
- Counter displays "Page X of Y" (with match count appended when searching).

### Search

A search bar above the top navigation filters rows in real-time:

- Matches any text in any column, case-insensitive.
- Pagination operates within the filtered set.
- Clear button (✕) resets to full dataset.
- "No matches" state shown when the filter yields zero rows.
- Keyboard: `/` or `Ctrl+F` focuses the search bar.

### Dark mode

A fixed toggle button (top-right) switches between light and dark themes. Theme preference is persisted in `localStorage` and applied before the first paint via a blocking `<script>` in `<head>` (no flash). All colors are CSS custom properties under `:root` (light) and `[data-theme="dark"]` (dark).

### Keyboard shortcuts

| Key               | Action                  |
| ----------------- | ----------------------- |
| `←` / `→`         | Previous / next page    |
| `Home` / `End`    | First / last page       |
| `/` or `Ctrl+F`   | Focus search bar        |

Arrow keys are suppressed while the search input or page input is focused, so normal typing is never interrupted.

## Data shape

### bookNames.csv

| Column     | Description                                            |
| ---------- | ------------------------------------------------------ |
| `bookCode` | Unique identifier, also used for the data CSV filename |
| `titleAR`  | Arabic title                                           |
| `titleDV`  | Dhivehi title                                          |
| `titleEN`  | English title                                          |

### tags.csv

| Column  | Description                                     |
| ------- | ----------------------------------------------- |
| `code`  | Tag code (matches a prefix segment in bookCode) |
| `label` | Display name                                    |
| `color` | Text color (CSS hex)                            |
| `bg`    | Background color (CSS hex)                      |

### data/{bookCode}.csv

Each book's content CSV has an optional **header row**. Convention: if the first field of the first row is `#`, it is a header — excluded from the displayed data.

```csv
#,section,arabic_text,dhivehi_text,notes
1,Introduction,بسم الله...,ބިސްމި...,—
2,Chapter 1,الحمد لله...,އަލްޙަމްދު...,—
```

If there is no `#` header row, all rows are rendered as content directly.

## Tag system

Tag codes are extracted from the `bookCode` by splitting on `-` and taking all segments **except the last** (which is the book name). Each code is looked up in `tags.csv` for its display label and colors. Unknown codes are silently ignored.

Examples:

| bookCode                        | Tags        | Book Name             |
| ------------------------------- | ----------- | --------------------- |
| `AQD-nawaqidulIslam`            | Aqidah      | nawaqidulIslam        |
| `AQD-qawaidulArbau`             | Aqidah      | qawaidulArbau         |
| `HDT-umdathulAhkam`             | Hadith      | umdathulAhkam         |
| `AQD-DFK-sharhuSunnahBarbahari` | Aqidah, DFK | sharhuSunnahBarbahari |

## Error states

Three error paths are handled with visible messages (no silent blank pages):

- **Registry fails to load:** "Unable to load the book registry. Please check your connection."
- **Book code not found:** "Book X was not found in the registry."
- **Data CSV empty or fails:** "No data found in CSV file: …" or "Error loading CSV: …"

## Adding a new book

1. Add a row to `bookNames.csv`.
1. Create `data/{bookCode}.csv` (with an optional `#` header row).
1. Open the viewer or dashboard — it appears automatically.

## Adding a new tag category

1. Add a row to `tags.csv`.
1. Use the new code as a prefix in any `bookCode` — badges render automatically.

## Key benefits

- **Single source of truth** for book metadata and tag definitions
- **Shared template** — one HTML page for all books
- **Zero code changes** — adding books or categories is CSV-only
- **Graceful errors** — failures show messages, not blank screens
- **Light + dark themes** — persisted preference, no flash on load
