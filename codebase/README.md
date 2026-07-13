# Hadithmv — Book Viewer

A metadata-driven, single-page book viewer for Islamic texts. All configuration lives in CSV files — adding a book or a category never requires code changes. The UI supports Dhivehi, English, and Arabic.

## File structure

```text
bookNames.csv          ← Book registry (code, titles in AR/DV/EN)
tags.csv               ← Tag definitions (code, label, colors)
books/
  index.html           ← Shared viewer + dashboard (the only HTML page)
css/
  styles.css           ← All styles (light + dark + sepia themes, custom properties)
js/
  dbLookup.js          ← Metadata loader, tag extraction, dashboard renderer
  reader.js            ← Book viewer: infinite scroll, search, toolbar, keyboard
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

Each book's CSV can optionally include a header row. If the first field of the first row is `#`, it is treated as a header — excluded from display and used to label column toggle buttons.

```csv
#,section,arabic_text,dhivehi_text,notes
1,Introduction,بسم الله...,ބިސްމި...,—
2,Chapter 1,الحمد لله...,އަލްޙަމްދު...,—
```

## How it works

1. The page reads `?book=CODE` from the URL.
1. `dbLookup.js` loads `bookNames.csv` and `tags.csv` for metadata and badges.
1. `reader.js` loads `data/{bookCode}.csv` via PapaParse.
1. Content renders with infinite scroll — rows load as you scroll.

**No book selected?** The dashboard shows all registered books as a card grid.

## Features

### Reading view

- Columns stacked vertically with `dir="auto"` for RTL/LTR detection
- `◆` divider between rows, `ـــــــــــ` tatweel line above footnotes
- Infinite scroll — content loads automatically as you scroll
- All columns toggleable via a dropdown — including the row number
- Sticky header, search bar, toolbar, and pagination

### Pagination

- Simple: First / Prev / row-select / Next / Last
- Row select dropdown with total count: `10 / [5]`
- `ސަފްހާ:` label on the far right

### Search

- Real-time "find and jump" — search highlights matches in a dropdown, clicking jumps to that row without filtering the dataset
- Results dropdown with highlighted snippets (~300 chars of context)
- Click or Enter to jump; ↑/↓ to navigate; Escape to close
- Red bold ✕ clear button resets to full content
- Advanced search modal for column/condition/value filters with AND/OR logic — same find-and-jump behavior

### Toolbar

| Control | Description |
|---|---|
| 📋 Copy | Copy current row as formatted plain text |
| ◉ Hide diacritics | Toggle Arabic tashkeel visibility |
| ↺ Reset | Reset all reader settings to defaults |
| 📥 Export | Dropdown: TXT, MD, JSON, CSV, Word, PDF |
| Hide columns ▾ | Dropdown of per-column toggle buttons |

### Sidebar (☰)

- Navigation: Book list, GitHub, FAQ, Help, Contact
- Settings modal: Theme (Light / Dark / Sepia), Widescreen, Font size ±, Font family, Language selector
- Scroll to top
- App version and creator credit

### Focus mode

Toggled from the pagination bar or `z` key. Hides search bar, toolbar, and pagination — only the sticky header and reader content remain.

### Scroll counter

A subtle pill at the bottom-center of the screen shows `10 / 1` (total rows / current row). Appears while scrolling, fades after 2 seconds.

### Mobile

- Buttons shorten to icon + compact text (e.g. `📋 ކޮޕީ`, `◉ ފިލި`, `ކޮލަމް ▾`)
- Back link shows only `←`
- `ސަފްހާ:` label hidden
- Sticky chrome compresses for smaller screens

### Themes

Three themes selectable from the settings modal: Light, Dark, and Sepia (warm cream/beige). Persisted, no flash on load.

### Keyboard shortcuts

| Key | Action |
|---|---|
| `←` / `→` | Previous / next row |
| `Home` / `End` | First / last row |
| `/` or `Ctrl+F` | Focus search bar |
| `z` | Toggle focus mode |
| `Escape` | Close sidebar / modal |

### Internationalisation

All UI strings in [`js/i18n.js`](js/i18n.js) with `dv`, `en`, and `ar` translations. Static HTML uses `data-i18n` attributes; dynamic text uses `t()`. Language select in the settings modal. Persisted to `localStorage`.

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
