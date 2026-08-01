# Hadithmv — Book Viewer

A metadata-driven, single-page book viewer for Islamic texts. All configuration lives in CSV files — adding a book or a category never requires code changes. The UI supports Dhivehi, English, and Arabic.

## File structure

```text
data/
  02-registry-bookNames.csv     ← Book registry (code, titles in AR/DV/EN)
  01-registry-bookTags.csv      ← Tag definitions (code, label, colors)
  03-update-bookRegistry.ps1← Auto-generate titleEN, sync new books
  *.csv                ← Per-book content files
books/
  index.html           ← Dashboard — book list, search, tag filter, table/card view
  reader.html          ← Book viewer — loaded via ?book=CODE
css/
  common.css           ← Shared: themes, fonts, topBar, sidebar, settings modal, tag colors
  reader.css           ← Reader page: focus mode, toolbar, pagination, content, responsive
  search.css           ← Reader: search bar, results dropdown, advanced search
  tableView.css        ← Reader: table view mode, top scrollbar, sentinels
  quran.css            ← Reader: Quran navigation row, dropdowns, surah overlay
  dashboard.css        ← Dashboard: grid, cards, controls, table view
js/
  common.js            ← Shared init: theme, fonts, i18n, sidebar, settings, keyboard
  catalog.js          ← Metadata loader, tag extraction, dashboard rendering
  reader.js            ← Book viewer: render, toolbar, keyboard, export, clipboard
  quran-data.js        ← Quran: data, decoration, column registry
  quran-ui.js          ← Quran: nav, dropdowns, on-demand column loading (re-exports quran-data.js)
  csv.js               ← Tiny CSV parser (~1 KB), replaces PapaParse
  search.js            ← Search engine: normalisation, compiled queries, norm cache, matching, history
  i18n.js              ← Translations (dv/en/ar)
  xlsx.js              ← Inline XLSX writer (~2.5 KB), lazy-loaded on export
  epub.js              ← EPUB 3 e-book writer (~4 KB), lazy-loaded on export
font/                  ← Custom merged font (Arabic + Thaana + Latin)
docs/                  ← User guide, architecture, API reference
```

## Quick start

### Add a new book

1. Add a row to `data/02-registry-bookNames.csv`:

   ```csv
   bookCode,titleAR,titleDV,titleEN
   FQH-usululFiqh,أصول الفقه,އުޞޫލުލް ފިޤްހު,Usul ul-Fiqh
   ```

1. Create the data file at `data/FQH-usululFiqh.csv`.

1. Open `books/index.html?book=FQH-usululFiqh` — the book appears. The dashboard at `books/index.html` picks it up automatically.

### Add a new tag category

Add a row to `data/01-registry-bookTags.csv`:

```csv
code,label
FQH,Fiqh
```

Books with a `FQH-` prefix will show a "Fiqh" badge. No code needed. Colours are auto‑generated using golden‑ratio HSL — no limit on tags, always distinct, dark‑mode built in.

### Book code conventions

Prefixes and suffixes control book behaviour — badges, visibility, row order, and more. See [Architecture → Naming conventions](docs/ARCHITECTURE.md#naming-conventions) for the full list. A quick summary:

- `DRFT-` → draft badge · `-HDN` → hidden · `-DSC` → reversed rows · `KNSH-` → body heading style
- Run `data/03-update-bookRegistry.ps1` to sync new books and generate `titleEN`

## Data CSV format

The first row of each book's CSV is always the header row. If column 0 is `#` or blank, it's treated as row numbers (hidden from content, shown as `#N` labels in card view). Otherwise column 0 is regular content. Header names label the column toggle buttons.

For a representative sample, see [`data/AQD-nawaqidulIslam.csv`](data/AQD-nawaqidulIslam.csv) — it's small and covers the common column patterns (`headAR`, `bodyAR`, `headDV`, `bodyDV`, `foot`).

```csv
#,section,arabic_text,dhivehi_text,notes
1,Introduction,بسم الله...,ބިސްމި...,—
2,Chapter 1,الحمد لله...,އަލްޙަމްދު...,—
```

## How it works

1. The page reads `?book=CODE` from the URL.
1. `catalog.js` loads `02-registry-bookNames.csv` and `01-registry-bookTags.csv` for metadata and badges.
1. `reader.js` loads `data/{bookCode}.csv` via `fetch` + `parseCSV`.
1. Content renders with infinite scroll — rows load as you scroll.

**No book selected?** The dashboard shows all registered books as a card grid.

## Features

### Reading view

- Fixed topBar with return (red), focus (green), title, and hamburger (blue) buttons — only hamburger visible on dashboard
- Sticky reader chrome below with bottom-border cutoff separating chrome from content
- Columns stacked vertically with `dir="auto"` for RTL/LTR detection
- Heading hierarchy: columns starting with `head`/`kitab`/`bab` (e.g. `headAR`, `kitabDV`) rendered as large/medium/small bold headings; in plain text copy, heads get a dash-rule underline, kitabs get a `Kitab:` prefix, babs get an indented `Bab:` prefix
- `matn`/`sharh` columns: sharh (commentary) text rendered ~10% smaller than matn (main text); a `· · ·` dotted separator line inserted between matn→sharh within the same language
- Blank line inserted between the last `*AR` column and first `*DV` column
- `◆` divider between all rows (including across scroll-chunk boundaries)
- `ـــــــــــ` tatweel line before columns whose header starts with `foot`
- Infinite scroll — content loads automatically as you scroll
- All columns toggleable via a dropdown; columns whose header ends with `-HDN` start hidden
- **View toggle** — switch between vertical card view and horizontal table view (RDF/dictionary books default to table on desktop, card on mobile); table header row sticks below the toolbar when scrolling
- Consecutive blank lines within cells collapsed to single line breaks (handles both `\n` and `\r\n` endings)
- Progress bar along the topBar's bottom edge — milestone toasts at 25/50/75%, Quran books toast each completed surah by name, and at 100% a green completion border pulses around the screen

### Pagination

- First (`<<`) / Prev (`<`) / page select / Next (`>`) / Last (`>>`), all same height
- Subtitle and tag badges on the same row (scrolls horizontally if too wide)
- `ސަފްހާ:` label on the far right
- Centered on mobile (bottom nav), right-aligned (top nav)

### Chrome layout

All rows inside the collapsible panel use uniform 10px spacing via flex column gap. Toolbar and pagination rows are wrapped in `.h-scroll-wrap` containers with padded space for absolutely-positioned arrow buttons. Rows scroll horizontally (`overflow-x: auto`, hidden scrollbar); mouse wheel is redirected to horizontal scroll. All interactive elements use `em`-based padding and `line-height: 2.2`, sized via `--panel-font-size` CSS variable (tied to the reader font size control).

### Search

- Real-time "find and jump" — search highlights matches in a dropdown, clicking jumps to that row without filtering the dataset
- Query syntax: wildcards (`*`, `?`), whole-word (`.word`), fuzzy (`~word~`), negation (`-word`), column-scoped (`col:N:word`), regex (`/pattern/`)
- Tashkeel-insensitive: strips Arabic diacritics and Thaana fili before matching, normalises Arabic letter variants (أ إ آ → ا, ى → ي) and Thaana thikijehi (ޘ → ސ, etc.)
- Fast on big books: cells are normalised once at load (precomputed cache), queries are compiled once per keystroke, and the input is debounced (120 ms) — a full scan of a 50k-row book runs in a few milliseconds
- Results dropdown with highlighted snippets (~300 chars of context), highlighting maps back to original text with tashkeel intact
- Click or Enter to jump; ↑/↓ to navigate; Escape to close
- Red bold ✕ clear button resets to full content
- Advanced search modal for column/condition/value filters with AND/OR logic — same find-and-jump behavior

### Toolbar

| Control | Description |
|---|---|
| 📌 Pin | Bookmark current book + page (Alt+P) |
| 📋 Copy | Copy current row as formatted plain text |
| 🔗 Share | Copy deep link to current book + row |
| ◉ Hide diacritics | Toggle Arabic tashkeel visibility |
| 📖 Table/Card | Toggle between vertical card and horizontal table view |
| ↺ Reset | Reset all reader settings to defaults |
| 📥 Export | Dropdown: TXT, MD, JSON, CSV, TSV, YAML, TOON, XML, Excel, EPUB, Word, PDF, PNG |
| Hide columns ▾ | Dropdown of per-column toggle buttons |

Overflow buttons are accessible via ◀▶ arrow buttons that appear at the row edges — ◀ scrolls toward the end, ▶ scrolls back toward the start. Both arrow clicks and mouse-wheel redirection animate smoothly via an ease-out-cubic curve. Arrows auto-hide at the scroll extremes.

### TopBar

- Fixed bar with bottom border separator, always visible
- Dashboard: shows "ހަދީޘްއެމްވީ" branding (centered) + ☰ hamburger
- Reader: ↩ Return (red) + ↕ Focus (green) + Book Title (center) + ☰ Menu (blue)
- All three buttons: 40×40px desktop, 32×32px mobile, tinted backgrounds

### Dashboard

- **📌 Pins** — button in sort row; opens a modal listing bookmarked books as a table (▲▼ reorder arrows, page, ✕ to remove, confirmed "Clear all"; max 10); click an entry to open at the bookmarked page. A `📌 ޕިން` pins filter chip appears in the tag row (click to show only pinned books). Pinned books show a `📌 ޕިން` badge on their card. Also accessible from the sidebar.
- **🕐 History** — button in sort row; opens a modal listing recently read books as a table (book, page, relative time like "3m ago", ✕ to remove, confirmed "Clear all"; max 10; one entry per book, latest position). Also accessible from the sidebar.
- **Continue reading** — in the collapsible panel above the book list, the unfiltered view shows the most recent book from history (title, saved position, relative time); click it to resume exactly where you left off. Hidden while search/tag filters are active and in focus mode.
- Search bar — real-time filter across titleDV, titleAR, titleEN, and bookCode
- `Tags:` / `ޓެގުތައް:` label before tag chips, `Books:` / `ފޮތްތައް:` label before result count
- Tag chips — click to filter by tag (multiple = OR — a book shows if it carries any selected tag), active chips show ✕ to remove, each chip shows book count. The URL updates with `?tags=A,B` so filtered views are shareable. A `📌 ޕިން` chip (red) precedes the category tags for pinned-books filtering. Tag badges in the book reader header link back to the dashboard pre‑filtered by that tag.
- Sort dropdown — A→Z / Z←A (arrows follow reading direction). The whole sort row stays on one line — on narrow screens it scrolls horizontally via ◀▶ edge arrows or the mouse wheel (same as the reader toolbar)
- Table/Card view toggle — card grid or full-width table with clickable rows; the table scrolls sideways (hidden scrollbar) when its four columns don't fit the screen
- ↺ Reset button — clears all filters, search, and view mode (pins & history are preserved)
- Card grid flows right-to-left (`direction: rtl`)
- All controls work together: search + tags + sort combined

### Sidebar (☰)

- Blue ☰ hamburger button (always visible, opens right-side drawer)
- Navigation: Book list, GitHub, FAQ, Help, Contact
- Settings modal: Theme (Light / Dark / Sepia), Widescreen, Font size ±, Font family dropdown, Language selector, plus a confirmed "Clear pins & history" button; ↺ Reset all settings does NOT touch pins or history
- Scroll to top
- App version and creator credit

### Focus mode

Toggled from the green ↕ button in the topBar or `z` key. Collapses the entire chrome smoothly via CSS Grid transition (no max-height stutter). Padding and border also hidden. Only the topBar and reader content remain. Button shows ▼ when active.

### Sharing

The browser URL silently updates as you scroll (`?book=CODE&row=N`). Copy the address bar anytime to share your exact position. Or use the 🔗 Share button to copy a deep link. Opening a shared URL lands on the same row.

### Scroll counter

A subtle pill at the bottom-center of the screen shows `10 / 1` (total rows / current row) plus a muted reading percentage (e.g. `27%`). Appears while scrolling, fades after 2 seconds.

### Mobile

- TopBar and chrome compress: buttons shrink to 32×32px, tighter padding
- Toolbar and pagination rows scroll horizontally (hidden scrollbar, ◀▶ arrow buttons, wheel redirect)
- Pagination nav right-aligned for scrollability
- `ސަފްހާ:` label hidden
- All chrome buttons share same height and font size (0.85rem, 7px padding)
- Sidebar has `overscroll-behavior: contain` to prevent scroll bleed
- Search bar prevented from going offscreen

### Themes

Three themes selectable from the settings modal: Light, Dark, and Sepia (warm cream/beige). Persisted, no flash on load.

### Keyboard shortcuts

| Key | Context | Action |
|---|---|---|
| `←` / `→` | Reader | Previous / next row |
| `Home` / `End` | Reader | First / last row |
| `↑` / `↓` | Search focused | Navigate search results |
| `Enter` | Search focused | Select search result |
| `/` or `Ctrl+f` | Anywhere | Focus search bar |
| `Ctrl+Shift+f` | Anywhere | Open advanced search |
| `z` | Reader | Toggle focus mode (green ↕/▼ button) |
| `t` | Reader | Toggle tashkeel (diacritics) |
| `v` | Reader | Toggle card / table view |
| `p` | Reader | Toggle bookmark (pin) |
| `s` | Reader | Share link |
| `e` | Reader | Open export dropdown |
| `Escape` | Dashboard | Clear search & blur |
| `p` | Dashboard | Open pins modal |
| `h` | Dashboard | Open history modal |
| `Ctrl+,` | Anywhere | Open settings |
| `Ctrl+b` | Anywhere | Back to book list |
| `Escape` | Anywhere | Close sidebar / modal / search results |

### Exports

All text formats include book title, URL, Hadithmv, and version. TOON uses the expanded list form (`[N]:` root array). Excel uses a lazy-loaded inline writer (`js/xlsx.js`, ~2.5 KB). EPUB uses a lazy-loaded e-book writer (`js/epub.js`, ~4 KB) with embedded Hadithmv font. PNG captures only the currently visible row (2× resolution) with the Hadithmv font embedded — one row, not the whole book.

### Internationalisation

All UI strings in [`js/i18n.js`](js/i18n.js) with `dv`, `en`, and `ar` translations. Static HTML uses `data-i18n` attributes; dynamic text uses `t()`. Language select in the settings modal. Persisted to `localStorage`. **Tooltips and error messages are English-only and never translated.** Every button should have a tooltip; if it has a keyboard shortcut, the shortcut is noted in the tooltip (e.g. `title="Toggle focus (Alt+Z)"`).

## Error handling

All errors show visible messages in English — see [Architecture → Error states](docs/ARCHITECTURE.md#error-states).
- CSV parse warnings → logged to browser console (non-fatal)

## Dependencies

Zero external dependencies. No CDN, no build step:

- `js/csv.js` — tiny CSV parser (~1 KB), handles quoted fields and multiline values
- `js/xlsx.js` — inline XLSX writer (~2.5 KB), lazy-loaded only when exporting to Excel
- `js/epub.js` — inline EPUB 3 e-book writer (~4 KB), lazy-loaded only when exporting to EPUB

## Documentation

| Doc | Audience |
|---|---|
| [User Guide](docs/USER_GUIDE.md) | Readers — how to browse, search, read, and use settings |
| [Architecture](docs/ARCHITECTURE.md) | Developers & LLMs — system design, data flow, conventions |
| [API Reference](docs/API.md) | Developers — module exports, function signatures, search syntax |
