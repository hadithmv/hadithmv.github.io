# Book Lookup System Architecture

A metadata-driven, single-page viewer that displays multiple books without duplicating HTML or JavaScript. All configuration lives in CSV files — adding content or categories never requires code changes.

## Files

| File               | Purpose                                                        |
| ------------------ | -------------------------------------------------------------- |
| `bookNames.csv`    | Central registry of books (code, titles in AR/DV/EN)           |
| `tags.csv`         | Tag definitions (code, label, badge colors)                    |
| `books/index.html` | Shared viewer page and library dashboard                       |
| `css/styles.css`   | All presentation styles                                        |
| `js/dbLookup.js`   | Logic for loading metadata, parsing tags, and rendering the UI |
| `data/*.csv`       | Per-book content files                                         |

## How it works

1. The page reads `?book=CODE` from the URL query string.
2. `dbLookup.js` loads `bookNames.csv` (via PapaParse) and looks up the matching row.
3. It loads `tags.csv` to resolve tag badges from the book code's prefix segments.
4. It tells the caller the matching CSV path (`data/{bookCode}.csv`).
5. The page loads that CSV (via PapaParse) and renders one row at a time in a vertical reading card, with Previous/Next navigation and keyboard support.

If no `?book=` parameter is present, the page shows a **dashboard** — a card grid of all registered books with tag badges and titles in all three languages.

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

Each book's content CSV has an optional **header row**. The convention: if the first field of the first row is `#`, it is treated as a header — excluded from the displayed data. If there is no `#` header row, all rows are rendered as content.

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
