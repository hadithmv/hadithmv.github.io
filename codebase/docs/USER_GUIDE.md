# Hadithmv — User Guide

Welcome to Hadithmv, a digital library of Islamic texts in Dhivehi, Arabic, and English.

## Finding a Book

When you open the site, you see the **book list**. You can:

- **Search** — type in the search bar at the top (auto‑focused on desktop). It searches across all languages (Dhivehi, Arabic, English) and book codes. It works with or without Arabic diacritics (tashkeel).

- **Filter by tag** — click a tag chip below the search bar (e.g. Aqidah, Hadith, Draft). Click it again to remove the filter. You can select multiple tags — only books matching ALL selected tags are shown.

- **Sort** — use the dropdown on the right to sort books A→Z or Z→A.

- **Switch view** — click the 📖 Table/Card button to toggle between a card grid and a table with all book details.

- **Pins & History** — click 📌 Pins or 🕐 History in the sort row to open a panel of your saved positions and recently read books. Both are also accessible from the sidebar.

- **Reset** — the ↺ Reset button clears all filters, search, view mode, pins, and history.

Click any book card or table row to open it.

## Reading a Book

### Top bar

- **↩ Return** (red) — goes back to the book list
- **↕ Focus** (green) — toggles distraction‑free reading mode. Click again or press `z` to exit.
- **Title** — the book title in the centre. Scrolls if too long.
- **☰ Menu** (blue) — opens the sidebar with navigation, pins, history, and settings.

A thin progress bar runs along the bottom of the top bar. For Quran books it tracks progress within the current surah; for other books it tracks the full book. Milestone toasts appear at 25%, 50%, and 75%. At 100% the bar turns green and a green border pulses around the screen. Scrolling back resets the milestones.

### Below the top bar

| Row            | What it does                                                                                                                                                                                                           |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Search bar** | Find text inside the book. Supports wildcards (`*`, `?`), whole‑word (`.word`), fuzzy (`~word~`), negation (`-word`), and exact column matching (`col:2:word`). The `ab` button toggles whole‑word mode for all terms. |
| **Toolbar**    | Copy the current row, hide Arabic diacritics, share a link, switch view mode (Card / Table / Parallel), reset, export (TXT, PDF, Excel, etc.), hide columns. Swipe or scroll sideways if buttons overflow.                     |
| **Pagination** | First (`<<`), Previous (`<`), page selector, Next (`>`), Last (`>>`). The subtitle and tag badges are on the same row — scroll sideways if it's too wide.                                                              |

### Reading the Quran

When you open a Quran book (code starting with `QRN-`), extra controls appear:

- **Surah navigation** — Previous/next surah buttons or click the surah name to search all 114 surahs.
- **Ayah navigation** — Click the ayah input to see all ayahs in the current surah, or type a number and press Enter.
- **Juz navigation** — Same as ayah, for juz (1–30).

#### Adding columns from other Quran books

Click the **ގުރްއާން ފޮތްތައް** (Quran Books) button to see available columns from other Quran books and translations. Check a column to add it — all columns from that book appear below the current ayah text. Uncheck to hide.

Buttons at the top of the list quickly switch between preset configurations: **Main** (commonly used translations), **All** (every available book and column), **Arabic** (arabic only books), and **Reset** (revert to just the current book).

When columns from one or more other books are active, each book's content is prefixed with a bold label showing the book's display name (e.g. **ދިވެހި ތަރުޖަމާ:**). This makes it easy to tell which translation or tafsir each block of text comes from.

### Parallel Text View

Click the 📖 **View dropdown** in the toolbar and select **↔️ Parallel** (or press `v` until it activates). This switches to a two‑column layout:

- **Right column** — Dhivehi text: columns whose headers end in `dv` (e.g. `matnDV`, `bodyDV`, `wordDV`).
- **Left column** — Arabic text: columns whose headers end in `ar` (e.g. `matnAR`, `bodyAR`, `wordAR`) plus Quran ayah text (`ayahImlai`/`ayahUthmani`).
- **Full‑width** — Neutral columns without a language suffix (row numbers, bare `foot`, etc.) span both columns.

Each column preserves the original field styling (matn, sharh, headers, footnotes) so the reading experience is consistent. On mobile screens (≤600px) the columns stack vertically for readability.

This view is especially useful for Quran reading — you see the Arabic ayah on the left and all loaded Dhivehi translations/tafsirs stacked on the right in a clean side‑by‑side arrangement.

### Keyboard shortcuts

| Key             | Action                                 |
| --------------- | -------------------------------------- |
| `←` / `→`       | Previous / next row                    |
| `Home` / `End`  | First / last row                       |
| `/` or `Ctrl+F` | Focus the search bar                   |
| `Ctrl+Shift+F`  | Open advanced search                   |
| `z`             | Toggle focus mode                      |
| `t`             | Toggle diacritics (tashkeel)           |
| `v`             | Cycle view mode (Card → Table → Parallel) |
| `s`             | Copy share link                        |
| `e`             | Open export menu                       |
| `Ctrl+,`        | Open settings                          |
| `Ctrl+B`        | Back to book list                      |
| `Escape`        | Close sidebar / modal / search results |
| Swipe right     | Next row (mobile)                      |
| Swipe left      | Previous row (mobile)                  |

### Focus mode

Press `z` or click the green ↕ button to hide everything except the essential content. Press again to return.

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

All settings are saved automatically and remembered when you return.
