# Hadithmv — Book Viewer

A metadata-driven, single-page book viewer for Islamic texts. All configuration lives in CSV files — adding a book or a category never requires code changes. The UI supports Dhivehi, English, and Arabic.

## File structure

```text
data/
  01-registry-bookTags.csv      ← Tag definitions (code, label, colors)
  02-registry-bookMeta.csv     ← Book registry (code, titles in AR/DV/EN, secondary tags, version hash)
  03-update-bookRegistry.ps1    ← Auto-generate titleEN, sync new books
  04-registry-quranSurahs.csv   ← 114 surah names in AR/DV/EN with ayah counts
  05-registry-quranColumns.csv  ← Quran column registry (source, labels, defaults)
  06-rebuild-searchIndex.mjs    ← Node script: builds search-index.json (rerun after book changes)
  search-index.json             ← Generated word-level search index (word → books → rows)
  content/                      ← Per-book content files (incl. Quran base data)
    *.csv                       ← One file per book
books/
  index.html                    ← Dashboard — book list, search, tag filter, table/card view
  reader.html                   ← Book viewer — loaded via ?book=CODE
  library-search.html           ← Cross-book search page — shareable ?q=/?tags= URLs
css/
  common.css                    ← Shared: themes, fonts, topBar, sidebar, settings modal, tag colors
  reader.css                    ← Reader page: focus mode, toolbar, pagination, content, responsive
  reader-search.css             ← Reader: search bar, results dropdown, advanced search
  reader-table-view.css         ← Reader: table view mode, top scrollbar, sentinels
  reader-quran.css              ← Reader: Quran navigation row, dropdowns, surah overlay
  dashboard.css                 ← Dashboard: grid, cards, controls, table view
  library-search.css            ← Library search page: results, peek previews
js/
  common.js                     ← Shared init: theme, fonts, i18n, sidebar, settings, keyboard
  book-data.js                  ← Book metadata: registry + tag loaders, page bootstrap
  pins-history.js               ← Pins & history: localStorage, modals, sidebar wiring
  dashboard.js                  ← Dashboard UI: card/table grid, search, tags, sort, keyboard
  reader.js                     ← Book viewer: render, toolbar, keyboard, export, clipboard
  quran-data.js                 ← Quran: data, decoration, column registry
  quran-ui.js                   ← Quran: nav, dropdowns, on-demand column loading (re-exports quran-data.js)
  csv.js                        ← Tiny CSV parser (~1 KB), replaces PapaParse
  search-utils.js               ← Search engine: normalisation, compiled queries, norm cache, matching, history
  library-search-engine.js      ← Cross-book search: index loader (IndexedDB-cached) + query engine
  library-search-page.js         ← Library search page UI: chips, results, peek previews
  i18n.js                       ← Translations (dv/en/ar)
  export.js                     ← Export feature: formats menu, downloads, lazy-loaded writers
  export-xlsx.js                ← Inline XLSX writer (~2.5 KB), lazy-loaded on export
  export-epub.js                ← EPUB 3 e-book writer (~4 KB), lazy-loaded on export
  export-zip.js                 ← Minimal ZIP writer (store), shared by the XLSX + EPUB writers
font/                           ← Custom merged font (Arabic + Thaana + Latin)
docs/                           ← User guide, architecture, API reference
```

## Quick start

### Add a new book

1. Add a row to `data/02-registry-bookMeta.csv` — the `tags` column holds secondary tags (comma‑separated codes from `01-registry-bookTags.csv`); the primary tag is the first segment of the `bookCode`:

   ```csv
   bookCode,titleAR,titleDV,titleEN,tags
   FQH-usululFiqh,أصول الفقه,އުޞޫލުލް ފިޤްހު,Usul ul-Fiqh,HDT
   ```

1. Create the data file at `data/content/FQH-usululFiqh.csv`.

1. Open `books/index.html?book=FQH-usululFiqh` — the book appears. The dashboard at `books/index.html` picks it up automatically.

### Add a new tag category

Add a row to `data/01-registry-bookTags.csv`:

```csv
code,label
FQH,Fiqh
```

Books with a `FQH-` prefix (primary tag) or `FQH` in their `tags` column will show a "Fiqh" badge. No code needed. Colours are auto‑generated using golden‑ratio HSL — no limit on tags, always distinct, dark‑mode built in.

### Book code conventions

A book code carries exactly ONE tag — the primary — as its first segment (`HDT-muwattaMalik`); any further tags live in the `tags` column of the registry. Prefixes and suffixes control book behaviour — badges, visibility, row order, and more. See [Architecture → Naming conventions](docs/ARCHITECTURE.md#naming-conventions) for the full list. A quick summary:

- `DRFT-` → draft badge (or in `tags`) · `-HDN` → hidden · `-DSC` → reversed rows · `KNSH-` → body heading style
- Run `data/03-update-bookRegistry.ps1` to sync new books and generate `titleEN` (it preserves the `tags` column)

## Data CSV format

The first row of each book's CSV is always the header row. If column 0 is `#` or blank, it's treated as row numbers (hidden from content, shown as `#N` labels in card view). Otherwise column 0 is regular content. Header names label the column toggle buttons.

For a representative sample, see [`data/content/AQD-nawaqidulIslam.csv`](data/content/AQD-nawaqidulIslam.csv) — it's small and covers the common column patterns (`headAR`, `bodyAR`, `headDV`, `bodyDV`, `foot`).

```csv
#,headAR,bodyAR,headDV,bodyDV,foot
1,[الشرك في عبادة الله],"بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
اعْلَمْ أَنَّ مِنْ أَعْظَمِ نَوَاقِضِ الإِسْلَامِ عَشَرَةً…",[ﷲ އަށް އަޅުކަން ކުރުމުގައި ޝަރީކު ކުރުން],…
2,[من جعل بينه وبين الله وسائط],الثَّانِي: مَنْ جَعَلَ بَيْنَهُ وَبَيْنَ اللَّهِ وَسَائِطَ…,[މެދުވެރިން],…
```

Note the first row's `bodyAR` cell spans two lines — quoted cells may contain newlines; the reader collapses consecutive blank lines inside them.

## How it works

1. The page reads `?book=CODE` from the URL.
1. `book-data.js` loads `02-registry-bookMeta.csv` and `01-registry-bookTags.csv` for metadata and badges.
1. `reader.js` loads `data/content/{bookCode}.csv` via `fetch` + `parseCSV`.
1. Content renders with infinite scroll — rows load as you scroll.

**No book selected?** The dashboard shows all registered books as a card grid.

## Running locally

The site is fully static — no build step, no dependencies. Serve the `codebase/` folder over HTTP (the data loads via `fetch`, which `file://` blocks):

```bash
cd codebase
python -m http.server 8000
# or: npx serve .
```

Then open `http://localhost:8000/books/index.html`.

## Deploying

This repo **is** the GitHub Pages site (`hadithmv.github.io`) — pushing to `main` deploys automatically. The app lives at `hadithmv.github.io/codebase/books/`.

**Version ritual:** the version string (e.g. `v6.9.85 (Web)`) lives in `js/i18n.js` under `appVersion` (shown in the sidebar footer and export headers). Bump it whenever you ship a release, and title the release commit `Update to vX.Y.Z`.

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
- Centered on mobile (bottom nav), right-aligned (top nav)

### Chrome layout

All rows inside the collapsible panel use uniform 10px spacing via flex column gap. Toolbar and pagination rows are wrapped in `.h-scroll-wrap` containers with padded space for absolutely-positioned arrow buttons. Rows scroll horizontally (`overflow-x: auto`, hidden scrollbar); mouse wheel is redirected to horizontal scroll. All interactive elements use `em`-based padding and `line-height: 2.2`, sized via `--panel-font-size` CSS variable (tied to the reader font size control).

### Search

- Real-time "find and jump" — search highlights matches in a dropdown, clicking jumps to that row without filtering the dataset
- Query syntax: wildcards (`*`, `?`), whole-word (`.word`), fuzzy (`~word~`), negation (`-word`), column-scoped (`col:N:word`), regex (`/pattern/`)
- Tashkeel-insensitive: strips Arabic diacritics before matching, normalises Arabic letter variants (أ إ آ → ا, ى → ي) and Thaana thikijehi (Arabic‑derived letters → their base forms, e.g. ޘ → ސ). **Thaana fili (vowel marks) are deliberately preserved** — they distinguish words (ކަތި ≠ ކުތި), unlike Arabic diacritics
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
- Reader: ↩ Return (red) + ▾ Focus (green) + Book Title (center) + ☰ Menu (blue)
- All three buttons: 40×40px desktop, 32×32px mobile, tinted backgrounds

### Dashboard

- **📌 Pins** — button in sort row; opens a modal listing bookmarked books as a table (▲▼ reorder arrows, page, ✕ to remove, confirmed "Clear all"; max 10); click an entry to open at the bookmarked page. A `📌 ޕިން` pins filter chip appears in the tag row (click to show only pinned books). Pinned books show a `📌 ޕިން` badge on their card. Also accessible from the sidebar.
- **🕐 History** — button in sort row; opens a modal listing recently read books as a table (book, page, relative time like "3m ago", ✕ to remove, confirmed "Clear all"; max 10; one entry per book, latest position). Also accessible from the sidebar.
- **Continue reading** — in the collapsible panel above the book list, shows the most recent book from history (title, saved position, relative time) in every view; click it to resume exactly where you left off. Search and tag filters do not hide it — the card is a resume shortcut, independent of the book grid. Focus mode collapses the panel with it.
- Search bar — real-time filter across titleDV, titleAR, titleEN, and bookCode
- **🔎 Search in books** — button next to the search bar opens the library search page (`library-search.html`), carrying the current search text as `?q=` and any selected tag chips as `?tags=`; there the query runs against a machine-generated word index (whole-word, AND across words); the tag chips scope the search; results group by book with match counts and deep-link to the first matching row with the term pre-highlighted (`reader.html?book=X&row=N&q=TERM`); each result has a ▾ preview showing the first matching rows as highlighted snippets (paged with "Show next N"), every snippet linking to its exact row. Also reachable from the sidebar on every page; the URL stays shareable (`?q=…&tags=…`)
- `Tags:` / `ޓެގުތައް:` label before tag chips, `Books:` / `ފޮތްތައް:` label before result count
- Tag chips — click to filter by tag (multiple = OR — a book shows if it carries any selected tag), active chips show ✕ to remove, each chip shows book count. An `All` chip (highlighted when no tags are selected) clears the tag filter. The URL updates with `?tags=A,B` so filtered views are shareable. A `📌 ޕިން` chip (red) precedes the category tags for pinned-books filtering. Tag badges in the book reader header link back to the dashboard pre‑filtered by that tag.
- Sort dropdown — A→Z / Z←A (arrows follow reading direction). The whole sort row stays on one line — on narrow screens it scrolls horizontally via ◀▶ edge arrows or the mouse wheel (same as the reader toolbar)
- Table/Card view toggle — card grid or full-width table with clickable rows; the table scrolls sideways (hidden scrollbar) when its four columns don't fit the screen
- ↺ Reset button — clears all filters, search, and view mode (pins & history are preserved)
- Card grid flows right-to-left (`direction: rtl`)
- All controls work together: search + tags + sort combined

### Sidebar (☰)

- Blue ☰ hamburger button (always visible, opens right-side drawer)
- Navigation: Book list, Search in books, Pins, History, GitHub, FAQ, Help, Contact
- Settings modal: Theme (Light / Dark / Sepia), Widescreen, Font size ±, Font family dropdown, Language selector; ↺ Reset all settings is a confirmed factory reset — settings, pins, and history (the dashboard and reader resets are view-only and preserve pins/history)
- Scroll to top
- App version and creator credit

### Focus mode

Toggled from the green ▾ button in the topBar or the `Alt+Z` key (reader) / `z` key (dashboard). Collapses the entire chrome smoothly via CSS Grid transition (no max-height stutter). Padding and border also hidden. Only the topBar and reader content remain. Button shows ▴ (rotated) when active.

### Sharing

The browser URL silently updates as you scroll (`?book=CODE&row=N`). Copy the address bar anytime to share your exact position. Or use the 🔗 Share button to copy a deep link. Opening a shared URL lands on the same row.

### Scroll counter

A subtle pill at the bottom-center of the screen shows `10 / 1` (total rows / current row) plus a muted reading percentage (e.g. `27%`). Appears while scrolling, fades after 2 seconds.

### Mobile

- TopBar and chrome compress: buttons shrink to 32×32px, tighter padding
- Toolbar and pagination rows scroll horizontally (hidden scrollbar, ◀▶ arrow buttons, wheel redirect)
- Pagination nav right-aligned for scrollability
- All chrome buttons share same height and font size (0.85rem, 7px padding)
- Sidebar has `overscroll-behavior: contain` to prevent scroll bleed
- Search bar prevented from going offscreen

### Themes

Three themes selectable from the settings modal: Light, Dark, and Sepia (warm cream/beige). Persisted, no flash on load.

### Keyboard shortcuts

| Key | Context | Action |
|---|---|---|
| `←` / `→` | Reader | Next / previous row (RTL: content flows right→left) |
| `Home` / `End` | Reader | First / last row |
| `↑` / `↓` | Search focused | Navigate search results |
| `Enter` | Search focused | Select search result |
| `/` or `Ctrl+F` | Anywhere | Focus search bar |
| `Ctrl+Shift+F` | Anywhere | Open advanced search |
| `Alt+Z` | Reader | Toggle focus mode (green ▾/▴ button) |
| `Alt+T` | Reader | Toggle tashkeel (diacritics) |
| `Alt+V` | Reader | Toggle card / table view |
| `Alt+P` | Reader | Toggle bookmark (pin) |
| `Alt+S` | Reader | Share link |
| `Alt+E` | Reader | Open export dropdown |
| `Escape` | Dashboard | Clear search & blur |
| `p` | Dashboard | Open pins modal |
| `h` | Dashboard | Open history modal |
| `Ctrl+,` | Anywhere | Open settings |
| `Ctrl+B` | Anywhere | Back to book list |
| `Escape` | Anywhere | Close sidebar / modal / search results |

### Exports

All text formats include book title, URL, Hadithmv, and version. TOON uses the expanded list form (`[N]:` root array). Excel uses a lazy-loaded inline writer (`js/export-xlsx.js`, ~2.5 KB). EPUB uses a lazy-loaded e-book writer (`js/export-epub.js`, ~4 KB) with embedded Hadithmv font. PNG captures only the currently visible row (2× resolution) with the Hadithmv font embedded — one row, not the whole book. While an export is preparing, the Export button shows a "Preparing…" label and is disabled — large exports (54k rows, EPUB + font) take seconds, and the busy state prevents duplicate downloads from double-clicks.

### Internationalisation

All UI strings in [`js/i18n.js`](js/i18n.js) with `dv`, `en`, and `ar` translations. Static HTML uses `data-i18n` attributes; dynamic text uses `t()`. Language select in the settings modal. Persisted to `localStorage`. **Tooltips and error messages are English-only and never translated.** Every button should have a tooltip; if it has a keyboard shortcut, the shortcut is noted in the tooltip with the key in title case (e.g. `title="Toggle focus (Alt+Z)"`, `Ctrl+B`, `Ctrl+Shift+F`).

## Error handling

All errors show visible messages in English, with a ⚠️ Error: prefix on error boxes and ⚠️ on failure toasts — see [Architecture → Error states](docs/ARCHITECTURE.md#error-states).
- Registry-load failure → error message with a ↺ Retry button (re-fetches without a page refresh)
- CSV parse warnings → logged to browser console (non-fatal)

## Dependencies

Zero external dependencies. No CDN, no build step:

- `js/csv.js` — tiny CSV parser (~1 KB), handles quoted fields and multiline values
- `js/export-xlsx.js` — inline XLSX writer (~2.5 KB), lazy-loaded only when exporting to Excel
- `js/export-epub.js` — inline EPUB 3 e-book writer (~4 KB), lazy-loaded only when exporting to EPUB
- `js/export-zip.js` — minimal store-only ZIP writer (~1.5 KB), shared by the XLSX and EPUB writers

## Documentation

| Doc | Audience |
|---|---|
| [User Guide](docs/USER_GUIDE.md) | Readers — how to browse, search, read, and use settings |
| [Architecture](docs/ARCHITECTURE.md) | Developers & LLMs — system design, data flow, conventions |
| [API Reference](docs/API.md) | Developers — module exports, function signatures, search syntax |
