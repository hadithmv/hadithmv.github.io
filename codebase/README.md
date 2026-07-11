# Hadithmv — Book Viewer

A metadata-driven, single-page book viewer for Islamic texts. All configuration lives in CSV files — adding a book or a category never requires code changes.

## File structure

```text
bookNames.csv          ← Book registry (code, titles in AR/DV/EN)
tags.csv               ← Tag definitions (code, label, colors)
books/
  index.html           ← Shared viewer + dashboard (the only HTML page)
css/
  styles.css           ← All presentation styles
js/
  dbLookup.js          ← Metadata loader, tag extraction, dashboard renderer
font/
  merged-300.woff2     ← Custom merged font (Arabic + Thaana + Latin)
  merged-300.woff
data/
  AQD-*.csv            ← Per-book data files (hadith/text content)
  HDT-*.csv
dependencies/          ← Vendored libraries (PapaParse)
docs/
  ARCHITECTURE.md      ← System design overview
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

Books with a `FQH-` prefix in their `bookCode` will now show a "Fiqh" badge. No JavaScript edits needed.

## Data CSV format

Each book's CSV in `data/` can optionally include a **header row** for the author's reference. The viewer detects and hides it automatically.

```csv
#,section,arabic_text,dhivehi_text,notes
1,Introduction,بسم الله...,ބިސްމި...,—
2,Chapter 1,الحمد لله...,އަލްޙަމްދު...,—
```

**Convention:** if the first field of the first row is `#`, the viewer treats it as a header — it is excluded from the displayed data and the rest of the row is rendered normally.

## How it works

1. The page reads `?book=CODE` from the URL query string.
2. `dbLookup.js` loads `bookNames.csv` (via PapaParse) to find the book's titles.
3. It loads `tags.csv` to resolve any category badges from the book code prefix.
4. PapaParse loads the matching `data/{bookCode}.csv`.
5. The page renders each row as a vertical reading card — one row at a time, with Previous/Next navigation and keyboard support (arrow keys).

**No book selected?** The dashboard shows all registered books as cards, grouped by tag.

## Error handling

- **Registry failed to load** → the dashboard shows a visible error message instead of a silent blank page.
- **Book code not found** → an error explains which book was requested and suggests the registry may have failed.
- **CSV parse warnings** → logged to the browser console (non-fatal).

## Dependencies

Vendored in `dependencies/` — no CDN, no build step:

- [PapaParse](https://www.papaparse.com/) — CSV parsing

## Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — system design and conventions
- [DB_LOOKUP_README.md](docs/DB_LOOKUP_README.md) — JavaScript API reference
