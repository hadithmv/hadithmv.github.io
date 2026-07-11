# Hadithmv — Book Viewer

A metadata-driven, single-page book viewer for Islamic texts. All configuration lives in CSV files — adding a book or a category never requires code changes.

## File structure

```text
bookNames.csv          ← Book registry (code, titles in AR/DV/EN)
tags.csv               ← Tag definitions (code, label, colors)
books/
  index.html           ← Shared viewer + dashboard (the only HTML page)
css/
  styles.css           ← All styles (light + dark themes, custom properties)
js/
  dbLookup.js          ← Metadata loader, tag extraction, dashboard renderer
  reader.js            ← Book viewer: pagination, search, toolbar, keyboard
font/
  merged-300.woff2     ← Custom merged font (Arabic + Thaana + Latin)
  merged-300.woff
data/
  *.csv                ← Per-book content files
dependencies/
  papaparse.min.js     ← CSV parsing (only dependency)
docs/
  ARCHITECTURE.md      ← System design and conventions
  DB_LOOKUP_README.md  ← API reference for dbLookup.js
```

## Quick start

### Add a new book

1. Add a row to `bookNames.csv`:

   ```csv
   bookCode,titleAR,titleDV,titleEN
   FQH-usululFiqh,أصول الفقه,އުޞޫލުލް ފިޤްހު,Usul ul-Fiqh
   ```

1. Create the data file at `data/FQH-usululFiqh.csv`.

1. Open `books/index.html?book=FQH-usululFiqh` — the book appears. The dashboard at `books/index.html` picks it up automatically.

### Add a new tag category

Add a row to `tags.csv`:

```csv
code,label,color,bg
FQH,Fiqh,#b91c1c,#fef2f2
```

Books with a `FQH-` prefix in their `bookCode` will show a "Fiqh" badge. No code needed.

## Data CSV format

Each book's CSV in `data/` can optionally include a header row for reference. The viewer detects and hides it automatically.

```csv
#,section,arabic_text,dhivehi_text,notes
1,Introduction,بسم الله...,ބިސްމި...,—
2,Chapter 1,الحمد لله...,އަލްޙަމްދު...,—
```

**Convention:** if the first field of the first row is `#`, the viewer treats it as a header — excluded from display and used to label columns in the toolbar.

## How it works

1. The page reads `?book=CODE` from the URL.
1. `dbLookup.js` loads `bookNames.csv` and `tags.csv` for metadata and badges.
1. `reader.js` loads `data/{bookCode}.csv` via PapaParse.
1. Each row renders as a vertical reading card — columns stacked top to bottom, one page at a time.

**No book selected?** The dashboard shows all registered books as a card grid.

## Reader features

### Reading view

- **Vertical layout** — each row's columns are stacked with `dir="auto"` for proper RTL/LTR rendering.
- **Footnotes divider** — the last column is separated by a decorative `◆` divider and rendered in smaller text.
- **Multi-row pages** — show 1, 2, 3, or 5 rows per page via the toolbar selector.

### Pagination

- **Page strip** — clickable page numbers with the current page highlighted. Uses `…` ellipsis for large ranges.
- **First / Last** (`««` / `»»`) and **Prev / Next** (`«` / `»`) buttons.
- **Page input** — type a number + Enter, or pick from the dropdown.
- Counter displays `ސަފްހާ X / Y`.

### Search

- Real-time filtering — matches any text in any column, case-insensitive.
- **Results dropdown** — appears below the search bar showing up to 50 matches. Each matching column gets its own row with a highlighted snippet (~300 chars of context).
- **Click** a result or press **Enter** to jump directly to that page.
- **↑ / ↓** arrows navigate the results list. **Escape** closes it.
- Match count shown as `ނަތީޖާ N` next to the search bar.
- Clear button (✕) resets to full dataset.
- Keyboard: `/` or `Ctrl+F` focuses the search bar.

### Toolbar

| Control | Description |
|---|---|
| 📋 Copy | Copy current page to clipboard with proper formatting |
| ◉ Hide diacritics | Toggle Arabic tashkeel (harakat) visibility |
| Show pages at once | Select rows per page: 1 / 2 / 3 / 5 |
| Hide columns | Per-column toggle buttons — click to show/hide any column |

### Dark mode

- Toggle button (top-right) switches between light and dark themes.
- Persisted to `localStorage`, applied before paint — no flash.
- All colors defined as CSS custom properties.

### Keyboard shortcuts

| Key | Action |
|---|---|
| `←` / `→` | Previous / next page |
| `Home` / `End` | First / last page |
| `/` or `Ctrl+F` | Focus search bar |

Arrow keys are suppressed when the search or page input is focused.

### Font

The bundled `font/merged-300.*` files provide a custom font covering Arabic, Thaana (Dhivehi), and Latin scripts. Applied via `@font-face` to all reader content, dashboard titles, and UI labels.

### Language

The UI (toolbar, nav, search, counters) is written in Dhivehi. Error messages remain in English.

## Error handling

- **Registry failed to load** — visible error message on the dashboard.
- **Book code not found** — error explains which book was requested.
- **Data CSV empty or fails** — error shown in the reader.
- **CSV parse warnings** — logged to console (non-fatal).

## Dependencies

Vendored in `dependencies/` — no CDN, no build step:

- [PapaParse](https://www.papaparse.com/) — CSV parsing

## Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — system design and conventions
- [DB_LOOKUP_README.md](docs/DB_LOOKUP_README.md) — JavaScript API reference
