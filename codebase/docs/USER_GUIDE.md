# Hadithmv — User Guide

Welcome to Hadithmv, a digital library of Islamic texts in Dhivehi, Arabic, and English.

## Features at a glance

| Category | Features |
|---|---|
| **Library** | Search across all languages, filter by tag (Aqidah, Hadith, Fiqh…) with tag‑badge chips, ⚠️ Draft badges for work‑in‑progress books, sort A→Z/Z→A, card or table view, continue‑reading card (resume your last book), pinned bookmarks, reading history with timestamps, auto‑focus search on desktop, focus mode (`z` key) |
| **Sidebar** | Navigation (library, pins, history), settings, font controls, GitHub link, FAQ, Help, Contact, scroll‑to‑top |
| **Reader** | Pagination (first/prev/page‑selector/next/last), infinite scroll, three view modes (Card / Table / Parallel text), full‑text search with wildcards/fuzzy/negation/regex/column‑scope, whole‑word toggle, search‑history dropdown, advanced search with AND/OR conditions, tashkeel toggle, copy (with formatting) / share (deep link) / export (15 formats), column visibility toggles, reset button, focus mode, progress bar with milestone toasts (25/50/75/100%), surah‑completed toast on Quran books and completion animation, scroll counter with reading percentage, URL position sync |
| **Quran** | Surah / ayah / juz navigation with searchable overlays, add translations/tafsirs from multiple books on demand with reorderable columns, content presets (Main / All / Arabic / Reset), configurable ayah decoration (braces, ayah numbers, number‑only brackets), side‑by‑side parallel text view |
| **Pins & History** | Pins with position labels (surah references for Quran, row numbers otherwise), one pin per book — the 📌 button toggles (pinned → click to unpin) and a pinned book's position follows you as you read — reorder via ▲▼, reading history with relative timestamps, confirmed clear‑all, sidebar access from both pages |
| **Export** | TXT, MD, JSON, CSV, TSV, Excel, EPUB (embedded font), PDF (print), PNG (current row), HTML, HTML Table, Word, YAML, TOON, XML |
| **Customisation** | Three themes (Light / Dark / Sepia), adjustable font size ±, font family (Hadithmv / System), content width (600/800/1000/1200/full), three UI languages (Dhivehi / English / Arabic) |
| **Keyboard** | `←` `→` prev/next row, `Home`/`End` first/last, `Alt+Z` focus mode, `Alt+T` tashkeel, `Alt+V` cycle view mode, `Alt+P` toggle pin, `Alt+S` share link, `Alt+E` export, `/` or `Ctrl+F` search, `Ctrl+Shift+F` advanced search, `Ctrl+,` settings, `Ctrl+B` back to library, `Escape` close, swipe gestures on mobile |
| **Design** | RTL‑first layout, responsive (single 600px breakpoint), no external dependencies, all colours via CSS custom properties for theming |

## Finding a Book

When you open the site, you see the **book list**. You can:

- **Search** — type in the search bar at the top (auto‑focused on desktop). It searches across all languages (Dhivehi, Arabic, English) and book codes. It works with or without Arabic diacritics (tashkeel). If nothing matches your search or tag combination, a "no books found" message appears where the grid would be.

- **Filter by tag** — click a tag chip below the search bar (e.g. Aqidah, Hadith, Draft). Click it again to remove the filter. You can select multiple tags — books matching ANY of the selected tags are shown (OR).

- **Sort** — use the dropdown on the right to sort books A→Z or Z→A. The whole sort row stays on one line — scroll it sideways (◀▶ arrows or mouse wheel) if it's too wide for the screen.

- **Switch view** — click the 📖 Table/Card button to toggle between a card grid and a table with all book details. On narrow screens the table scrolls sideways when it doesn't fit.

- **Pins & History** — click 📌 Pins or 🕐 History in the sort row to open a modal with a table of your saved positions (with reorder arrows, page, and remove) or of your recently read books (with page, time, and remove). Both are also accessible from the sidebar.

- **Reset** — the ↺ Reset button clears all filters, search, and view mode. Pins and history are **not** affected — they only clear via the confirmed "Clear all" buttons in the pins/history modals, or the "Clear pins & history" button in Settings.

When no filters are active, a **Continue reading** bar sits above the book list (in the collapsible panel with the tags and sort controls) — the most recently read book, with its saved position (a surah reference like ބަޤަރާ 2 : 60 for Quran books, otherwise "Page N") and how long ago you read it. Click it to resume exactly where you left off. It disappears while search or tag filters are active, and in focus mode (`z`).

Click any book card or table row to open it.

## Reading a Book

### Top bar

- **↩ Return** (red) — goes back to the book list
- **↕ Focus** (green) — toggles distraction‑free reading mode. Click again or press `Alt+Z` to exit.
- **Title** — the book title in the centre. Scrolls if too long.
- **☰ Menu** (blue) — opens the sidebar with navigation, pins, history, and settings.

A thin progress bar runs along the bottom of the top bar. For Quran books it tracks progress within the current surah; for other books it tracks the full book. Milestone toasts appear at 25%, 50%, and 75%. At 100% the bar turns green and a green border pulses around the screen — for Quran books this happens at each surah's end, with a "surah completed" toast naming the surah (in the current UI language). Scrolling back resets the milestones.

### Below the top bar

| Row            | What it does                                                                                                                                                                                                           |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Search bar** | Find text inside the book. Supports wildcards (`*`, `?`), whole‑word (`.word`), fuzzy (`~word~`), negation (`-word`), and exact column matching (`col:2:word`). The `ab` button toggles whole‑word mode for all terms. |
| **Toolbar**    | Copy the current row, hide Arabic diacritics, share a link, switch view mode (Card / Table / Parallel), reset, export (TXT, PDF, Excel, etc.), hide columns. Swipe or scroll sideways if buttons overflow.                     |
| **Pagination** | First (`<<`), Previous (`<`), page selector, Next (`>`), Last (`>>`). The page selector is a number box — type a page and press Enter (arrow keys don't step it). The subtitle and tag badges are on the same row — scroll sideways if it's too wide.                                                              |

### Reading the Quran

When you open a Quran book (code starting with `QRN-`), extra controls appear:

- **Surah navigation** — Previous/next surah buttons or click the surah name to search all 114 surahs (a "no surahs found" message appears if nothing matches).
- **Ayah navigation** — Click the ayah input to see all ayahs in the current surah, or type a number and press Enter.
- **Juz navigation** — Same as ayah, for juz (1–30).

#### Adding columns from other Quran books

Click the **ގުރްއާން ފޮތްތައް** (Quran Books) button to open a modal listing every available column from other Quran books and translations. Check a column to add it, uncheck to hide. **The reader shows loaded columns in the order of this list** — use the ▲▼ arrows on each row to reorder (base columns — juz/surah/ayah numbers, basmalah, ayah text — stay fixed at the front). A column's new position applies immediately to the reader.

Buttons above the list quickly switch between preset configurations: **Main** (commonly used translations), **All** (every available book and column), **Arabic** (arabic only books), and **Reset** (revert to just the current book).

When columns from one or more other books are active, each book's content is prefixed with a bold label showing the book's display name (e.g. **ދިވެހި ތަރުޖަމާ:**). This makes it easy to tell which translation or tafsir each block of text comes from.

### Parallel Text View

Click the 📖 **View dropdown** in the toolbar and select **↔️ Parallel** (or press `Alt+V` until it activates). This switches to a two‑column layout:

- **Right column** — Dhivehi text: columns whose headers end in `dv` (e.g. `matnDV`, `bodyDV`, `wordDV`).
- **Left column** — Arabic text: columns whose headers end in `ar` (e.g. `matnAR`, `bodyAR`, `wordAR`) plus Quran ayah text (`ayahImlai`/`ayahUthmani`).
- **Full‑width** — Neutral columns without a language suffix (row numbers, bare `foot`, etc.) span both columns.

Each column preserves the original field styling (matn, sharh, headers, footnotes) so the reading experience is consistent. On mobile screens (≤600px) the columns stack vertically for readability.

This view is especially useful for Quran reading — you see the Arabic ayah on the left and all loaded Dhivehi translations/tafsirs stacked on the right in a clean side‑by‑side arrangement.

### Keyboard shortcuts

| Key             | Action                                 |
| --------------- | -------------------------------------- |
| `←` / `→`       | Next / previous row (RTL: content flows right→left) |
| `Home` / `End`  | First / last row                       |
| `/` or `Ctrl+F` | Focus the search bar                   |
| `Ctrl+Shift+F`  | Open advanced search                   |
| `Alt+Z`         | Toggle focus mode                      |
| `Alt+T`         | Toggle diacritics (tashkeel)           |
| `Alt+V`         | Cycle view mode (Card → Table → Parallel) |
| `Alt+P`         | Toggle bookmark (pin)                  |
| `Alt+S`         | Copy share link                        |
| `Alt+E`         | Open export menu                       |
| `Ctrl+,`        | Open settings                          |
| `Ctrl+B`        | Back to book list                      |
| `Escape`        | Close sidebar / modal / search results |
| Swipe right     | Next row (mobile)                      |
| Swipe left      | Previous row (mobile)                  |

### Focus mode

Press `Alt+Z` or click the green ↕ button to hide everything except the essential content. Press again to return.

- **On the reader page** — the search bar, toolbar, pagination, and Quran nav collapse, leaving only the book text.
- **On the dashboard** — the tag chips and sort/filter row collapse, leaving the search bar and book grid visible.

### Sharing & Copying

Your position is saved in the URL as you scroll. Copy the address bar to share the exact row you're reading.

The **📋 Copy** button copies the current row as formatted text. For Quran books, columns are grouped by source book with a book-level label (no per-column headers), and the surah reference appears in the format `[البَقَرَة 2 : 60]`.

## Sidebar

Open with the blue ☰ button. From here you can:

- Go to the book list
- Open **📌 Pins** — view and manage bookmarked positions across all books
- Open **🕐 History** — see recently read books with timestamps
- Visit the GitHub page
- Open FAQ, Help, or Contact pages
- Open **Settings**
- Scroll to the top of the page

## Settings

Open from the sidebar (⚙ Settings). You can change:

| Setting        | Options                                                                           |
| -------------- | --------------------------------------------------------------------------------- |
| **Theme**      | Light, Dark, or Sepia                                                             |
| **Width**      | Content area width — 600px, 800px, 1000px, 1200px, or Full                         |
| **Font size**  | − / + buttons to make text smaller or larger                                      |
| **Font**       | Hadithmv (custom merged font) or System font. Option names are always in English. |
| **Language**   | Dhivehi, English, or Arabic — changes all buttons and labels                      |
| **Pins & history** | "Clear pins & history" button — asks for confirmation first. |

All settings are saved automatically and remembered when you return. The ↺ Reset button in the settings header resets the settings above but does **not** clear pins or reading history — those only clear through the confirmed clear buttons.
