# Hadithmv — Book Viewer

A metadata-driven, single-page book viewer for Islamic texts. All configuration lives in CSV files — adding a book or a category never requires code changes. The UI supports Dhivehi, English, and Arabic.

## File structure

```text
data/
  01-bookNames.csv     ← Book registry (code, titles in AR/DV/EN)
  02-bookTags.csv      ← Tag definitions (code, label, colors)
  03-updateBookMeta.ps1← Auto-generate titleEN, sync new books
  *.csv                ← Per-book content files
books/
  index.html           ← Shared viewer + dashboard
css/
  styles.css           ← Shared: themes, topBar, sidebar, modals, responsive
  dashboard.css        ← Dashboard: grid, cards, controls, table view
js/
  dbLookup.js          ← Metadata loader, tag extraction, dashboard renderer
  reader.js            ← Book viewer: render, toolbar, keyboard, export, clipboard
  search.js            ← Search engine: normalisation, parsing, matching, history
  i18n.js              ← Translations (dv/en/ar)
font/                  ← Custom merged font (Arabic + Thaana + Latin)
dependencies/          ← PapaParse + SheetJS mini
docs/                  ← ARCHITECTURE.md, DB_LOOKUP_README.md
```

## Quick start

### Add a new book

1. Add a row to `data/01-bookNames.csv`:

   ```csv
   bookCode,titleAR,titleDV,titleEN
   FQH-usululFiqh,أصول الفقه,އުޞޫލުލް ފިޤްހު,Usul ul-Fiqh
   ```

1. Create the data file at `data/FQH-usululFiqh.csv`.

1. Open `books/index.html?book=FQH-usululFiqh` — the book appears. The dashboard at `books/index.html` picks it up automatically.

### Add a new tag category

Add a row to `data/02-bookTags.csv`:

```csv
code,label,color,bg
FQH,Fiqh,#b91c1c,#fef2f2
```

Books with a `FQH-` prefix will show a "Fiqh" badge. No code needed.

### Book code conventions

- `DRFT-` prefix — marks a draft book (⚠️ badge), still visible on dashboard
- `-HDN` suffix — hides the book from the dashboard
- Run `data/03-updateBookMeta.ps1` to auto-generate `titleEN` from bookCode and sync new books

## Data CSV format

Each book's CSV can optionally include a header row. If the first field of the first row is `#`, it is treated as a header — excluded from display and used to label column toggle buttons.

```csv
#,section,arabic_text,dhivehi_text,notes
1,Introduction,بسم الله...,ބިސްމި...,—
2,Chapter 1,الحمد لله...,އަލްޙަމްދު...,—
```

## How it works

1. The page reads `?book=CODE` from the URL.
1. `dbLookup.js` loads `bookNames.csv` and `02-bookTags.csv` for metadata and badges.
1. `reader.js` loads `data/{bookCode}.csv` via PapaParse.
1. Content renders with infinite scroll — rows load as you scroll.

**No book selected?** The dashboard shows all registered books as a card grid.

## Features

### Reading view

- Fixed topBar with return (red), focus (green), title, and hamburger (blue) buttons — only hamburger visible on dashboard
- Sticky reader chrome below with bottom-border cutoff separating chrome from content
- Columns stacked vertically with `dir="auto"` for RTL/LTR detection
- `◆` divider between rows, `ـــــــــــ` tatweel line above footnotes
- Infinite scroll — content loads automatically as you scroll
- All columns toggleable via a dropdown
- **View toggle** — switch between vertical card view and horizontal table view (RDF/dictionary books default to table)
- Consecutive blank lines within cells collapsed to single line breaks

### Pagination

- First (`<<`) / Prev (`<`) / page select / Next (`>`) / Last (`>>`), all same height
- Subtitle and tag badges on the same row (scrolls horizontally if too wide)
- `ސަފްހާ:` label on the far right
- Centered on mobile (bottom nav), right-aligned (top nav)

### Chrome layout

All rows inside the collapsible chrome use uniform 10px spacing via flex column gap and readerChrome padding. Toolbar and pagination rows scroll horizontally with hidden scrollbar; mouse wheel is redirected to horizontal scroll. All interactive elements share `font-size: 0.85rem`, `padding: 7px`, `line-height: 1.4` for uniform height.

### Search

- Real-time "find and jump" — search highlights matches in a dropdown, clicking jumps to that row without filtering the dataset
- Tashkeel-insensitive: strips Arabic diacritics and Thaana fili before matching, normalises Arabic letter variants (أ إ آ → ا, ى → ي) and Thaana thikijehi (ޘ → ސ, etc.)
- Results dropdown with highlighted snippets (~300 chars of context), highlighting maps back to original text with tashkeel intact
- Click or Enter to jump; ↑/↓ to navigate; Escape to close
- Red bold ✕ clear button resets to full content
- Advanced search modal for column/condition/value filters with AND/OR logic — same find-and-jump behavior

### Toolbar

| Control | Description |
|---|---|
| 📋 Copy | Copy current row as formatted plain text |
| 🔗 Share | Copy deep link to current book + row |
| ◉ Hide diacritics | Toggle Arabic tashkeel visibility |
| 📖 Table/Card | Toggle between vertical card and horizontal table view |
| ↺ Reset | Reset all reader settings to defaults |
| 📥 Export | Dropdown: TXT, MD, JSON, CSV, YAML, TOON, XML, Excel, Word, PDF, PNG |
| Hide columns ▾ | Dropdown of per-column toggle buttons |

Overflow buttons are accessible via ◀▶ arrow buttons that appear at the row edges, with a smooth glide animation on click.

### TopBar

- Fixed bar with bottom border separator, always visible
- Dashboard: shows "ހަދީޘްއެމްވީ" branding (centered) + ☰ hamburger
- Reader: ↩ Return (red) + ↕ Focus (green) + Book Title (center) + ☰ Menu (blue)
- All three buttons: 40×40px desktop, 32×32px mobile, tinted backgrounds

### Dashboard

- Search bar — real-time filter across titleDV, titleAR, titleEN, and bookCode
- Tag chips — click to filter by tag (multiple = AND), active chips show ✕ to remove, each chip shows book count
- Sort dropdown — A→Z / Z←A (arrows follow reading direction)
- Table/Card view toggle — card grid or full-width table with clickable rows
- ↺ Reset button — clears all filters, search, and view mode
- All controls work together: search + tags + sort combined

### Sidebar (☰)

- Blue ☰ hamburger button (always visible, opens right-side drawer)
- Navigation: Book list, GitHub, FAQ, Help, Contact
- Settings modal: Theme (Light / Dark / Sepia), Widescreen, Font size ±, Font family dropdown, Language selector
- Scroll to top
- App version and creator credit

### Focus mode

Toggled from the green ↕ button in the topBar or `z` key. Collapses the entire chrome smoothly via CSS Grid transition (no max-height stutter). Padding and border also hidden. Only the topBar and reader content remain. Button shows ▼ when active.

### Sharing

The browser URL silently updates as you scroll (`?book=CODE&row=N`). Copy the address bar anytime to share your exact position. Or use the 🔗 Share button to copy a deep link. Opening a shared URL lands on the same row.

### Scroll counter

A subtle pill at the bottom-center of the screen shows `10 / 1` (total rows / current row). Appears while scrolling, fades after 2 seconds.

### Mobile

- TopBar and chrome compress: buttons shrink to 32×32px, tighter padding
- Toolbar and pagination rows scroll horizontally (hidden scrollbar, wheel redirect)
- Pagination nav right-aligned for scrollability
- `ސަފްހާ:` label hidden
- All chrome buttons share same height and font size (0.85rem, 7px padding)
- Sidebar has `overscroll-behavior: contain` to prevent scroll bleed
- Search bar prevented from going offscreen

### Themes

Three themes selectable from the settings modal: Light, Dark, and Sepia (warm cream/beige). Persisted, no flash on load.

### Keyboard shortcuts

| Key | Action |
|---|---|
| `←` / `→` | Previous / next row |
| `Home` / `End` | First / last row |
| `↑` / `↓` | Navigate search results (when search focused) |
| `Enter` | Select search result |
| `/` or `Ctrl+f` | Focus search bar |
| `Ctrl+Shift+f` | Open advanced search |
| `z` | Toggle focus mode (same as green ↕/▼ button in topBar) |
| `t` | Toggle tashkeel (diacritics) |
| `v` | Toggle card / table view |
| `s` | Share link |
| `e` | Open export dropdown |
| `Ctrl+,` | Open settings |
| `Ctrl+b` | Back to book list |
| `Escape` | Close sidebar / modal / search results |

### Exports

All text formats include book title, URL, Hadithmv, and version. TOON uses the expanded list form (`[N]:` root array). Excel uses SheetJS mini (lazy-loaded, 273KB). PNG captures the visible page with the Hadithmv font embedded.

### Internationalisation

All UI strings in [`js/i18n.js`](js/i18n.js) with `dv`, `en`, and `ar` translations. Static HTML uses `data-i18n` attributes; dynamic text uses `t()`. Language select in the settings modal. Persisted to `localStorage`. Tooltip titles are English-only and never translated.

## Error handling

All errors show visible messages in English:

- Registry failed to load → error on the dashboard
- Book code not found → error in the reader
- Data CSV empty or fails → error in the reader
- CSV parse warnings → logged to browser console (non-fatal)

## Dependencies

Vendored in `dependencies/` — no CDN, no build step:

- [PapaParse](https://www.papaparse.com/) — CSV parsing
- [SheetJS mini](https://sheetjs.com/) — Excel export (lazy-loaded on demand, 273KB)

## Documentation

| Doc | Audience |
|---|---|
| [User Guide](docs/USER_GUIDE.md) | Readers — how to browse, search, read, and use settings |
| [Architecture](docs/ARCHITECTURE.md) | Developers & LLMs — system design, data flow, conventions |
| [API Reference](docs/API.md) | Developers — module exports, function signatures, search syntax |
