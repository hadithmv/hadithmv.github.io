# Hadithmv — Book Viewer

A metadata-driven, single-page book viewer for Islamic texts. All configuration lives in CSV files — adding a book or a category never requires code changes. The UI supports Dhivehi, English, and Arabic.

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
  i18n.js              ← Translations (Dhivehi / English / Arabic)
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

Books with a `FQH-` prefix will show a "Fiqh" badge. No code needed.

## Data CSV format

Each book's CSV can optionally include a header row for reference. If the first field of the first row is `#`, it is treated as a header — excluded from display and used to label the column toggle buttons in the toolbar.

```csv
#,section,arabic_text,dhivehi_text,notes
1,Introduction,بسم الله...,ބިސްމި...,—
2,Chapter 1,الحمد لله...,އަލްޙަމްދު...,—
```

## How it works

1. The page reads `?book=CODE` from the URL.
1. `dbLookup.js` loads `bookNames.csv` and `tags.csv` for metadata and badges.
1. `reader.js` loads `data/{bookCode}.csv` via PapaParse.
1. Each row renders as a vertical reading card — columns stacked top to bottom, one page at a time.

**No book selected?** The dashboard shows all registered books as a card grid.

## Features

### Reading view

- Columns stacked vertically with `dir="auto"` for RTL/LTR detection
- Footnotes separated by a `◆` divider
- Show 1 / 2 / 3 / 5 rows per page
- All columns toggleable — including the row number
- Back link to return to the dashboard

### Pagination

- Page strip with sliding window (±2 around current, `…` ellipsis for gaps)
- First / Last and Prev / Next buttons
- Type a page number + Enter, or pick from the dropdown
- Counter shows "Page X / Y"
- RTL nav flow: `» »» 10 … 1 «« «`

### Search

- Real-time filtering against all columns, case‑insensitive
- **Results dropdown** — each matching column gets its own row with a highlighted snippet (~300 chars of context)
- Click or Enter to jump to a result; ↑/↓ to navigate; Escape to close
- Match count shown next to the search bar

### Toolbar

| Control | Description |
|---|---|
| 📋 Copy | Copy current page as formatted plain text with book title header |
| ◉ Hide diacritics | Toggle Arabic tashkeel visibility (Unicode ranges wrapped in spans) |
| ↺ Reset | Reset all settings to defaults (search, columns, rows, tashkeel) |
| Show pages at once | Rows per page: 1 / 2 / 3 / 5 |
| Hide columns | Per-column toggle buttons (including row number) |

All toolbar settings persist to `localStorage`.

### Sidebar (☰)

- **Dashboard link** — return to the book list
- **Contact link** — `contact.html`
- **Dark mode toggle** — persisted, no flash on load
- **Widescreen toggle** — removes max-width constraints for full-width reading
- **Language toggle** — cycles Dhivehi → English → Arabic
- **App info** — version number, platform, creator credit

### Keyboard shortcuts

| Key | Action |
|---|---|
| `←` / `→` | Previous / next page |
| `Home` / `End` | First / last page |
| `/` or `Ctrl+F` | Focus search bar |
| `Escape` | Close sidebar |

Arrow keys are suppressed while the search or page input is focused.

### Font

The `font/merged-300.*` files provide a custom font covering Arabic, Thaana, and Latin scripts. Served as WOFF2 with WOFF fallback. Applied via `@font-face` to all reader content, dashboard titles, toolbar labels, and UI elements.

### Internationalisation

All UI strings are defined in [`js/i18n.js`](js/i18n.js) with Dhivehi (`dv`), English (`en`), and Arabic (`ar`) translations. Static HTML uses `data-i18n` attributes; dynamic text uses the `t()` function. The language cycles on each click of the sidebar button and is persisted to `localStorage`.

## Error handling

All errors show visible messages in English:

- Registry failed to load → error on the dashboard
- Book code not found → error in the reader
- Data CSV empty or fails → error in the reader
- CSV parse warnings → logged to browser console (non-fatal)

## Dependencies

Vendored in `dependencies/` — no CDN, no build step:

- [PapaParse](https://www.papaparse.com/) — CSV parsing

## Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — system design and conventions
- [DB_LOOKUP_README.md](docs/DB_LOOKUP_README.md) — JavaScript API reference
