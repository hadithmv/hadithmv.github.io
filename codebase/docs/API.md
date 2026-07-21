# API Reference

## Pages

| Page | Entry point | Loads |
|---|---|---|
| `books/index.html` | Inline module → `catalog.js` | `common.js` |
| `books/reader.html` | `reader.js` | `common.js` |

## Modules

| Module | Purpose |
|---|---|
| `js/common.js` | Shared init: theme, fonts, i18n, sidebar, settings, keyboard |
| `js/catalog.js` | Book registry, tag resolution, dashboard rendering |
| `js/reader.js` | Book viewer: CSV parsing, rendering, pagination, export |
| `js/search.js` | Search engine: normalisation, parsing, matching, history |
| `js/xlsx.js` | XLSX writer, `createXLSX()` — lazy-loaded on demand |
| `js/epub.js` | EPUB 3 e-book writer, `createEPUB()` — lazy-loaded on demand |
| `js/i18n.js` | Translations (dv/en/ar), `t()`, `tagLabel()` |

## catalog.js

### `initializePageWithMetadata(callback)`

Main entry point. Reads `?book=CODE` from the URL.

- No `?book=` → renders the dashboard
- Book found → calls `callback(metadata)`
- Book not found → shows error

```js
import { initializePageWithMetadata } from "../js/catalog.js";

initializePageWithMetadata(async function (metadata) {
  // metadata.bookCode   — "AQD-qawaidulArbau"
  // metadata.titleEN    — "Qawaidul Arbau"
  // metadata.titleAR    — "القواعد الأربع"
  // metadata.titleDV    — "ހަތަރު ގަވާއިދު"
  // metadata.csvPath    — "../data/AQD-qawaidulArbau.csv"
});
```

### `loadBookNames()`

Fetches and caches `02-bookNames.csv`. Returns `Array` of book objects (`bookCode`, `titleAR`, `titleDV`, `titleEN`). Returns `[]` on error.

### `getPageMetadata(bookCode)`

Looks up a single book by code. Returns the metadata object or `null`.

### `getCsvPath(bookCode)`

Returns the data CSV path: `"../data/" + bookCode + ".csv"`.

### `extractTags(bookCode)`

Splits the book code on `-`, strips known tag prefixes and suffix flags (`-HDN`, `-DRAFT`), resolves remaining segments against the tag registry. Returns `Array<{code, label, color, bg}>`.

```js
extractTags("AQD-DFK-sharhuSunnahBarbahari");
// [{code:"AQD", label:"Aqidah", color:"#4f46e5", bg:"#eef2ff"},
//  {code:"DFK", label:"DFK",    color:"#7c3aed", bg:"#f5f3ff"}]
```

### Dashboard state

- `_dashFilter` — `{ search, tags[], sort }` — current filter state
- `_dashTableMode` — `boolean` — card grid vs table view
- `setupDashboardControls()` — wires search, tag chips, sort, and view toggle DOM events

### Naming conventions

- `DRFT-` prefix → Draft badge (⚠️), visible on dashboard
- `-HDN` suffix → hidden from dashboard
- Run `data/03-updateBookMeta.ps1` to auto‑generate `titleEN` from `bookCode`, rename `* - Sheet1.csv` files (replacing existing targets), and register new books

---

## search.js

Pure logic. No DOM dependencies. Imported by both `catalog.js` and `reader.js`.

### `normaliseForSearch(str)`

Normalises text for comparison:

- Strips Arabic tashkeel and tatweel
- Normalises alif variants (`أ إ آ` → `ا`), ya (`ى` → `ي`), waw‑hamza (`ؤ` → `و`)
- Normalises Thaana thikijehi (`ޘ→ސ`, `ޙ→ހ`, etc.)

Used by both dashboard search and book search.

### `parseQuery(query)`

Parses a query string into structured tokens.

```js
parseQuery("الله -رسول .سلام col:2:بسم");
// {
//   include: [
//     {term:"الله", wholeWord:false, fuzzy:false, col:null},
//     {term:"سلام", wholeWord:true,  fuzzy:false, col:null},
//     {term:"بسم",  wholeWord:false, fuzzy:false, col:2}
//   ],
//   exclude: [
//     {term:"رسول", wholeWord:false, fuzzy:false, col:null}
//   ]
// }
```

**Syntax reference:**

| Syntax | Meaning |
|---|---|
| `word` | Normal substring match |
| `.word` | Whole‑word match |
| `-word` | Exclude |
| `~word~` | Fuzzy (Levenshtein ≤ 2) |
| `*` / `?` | Wildcard (any / one char) |
| `col:N:word` | Scope to column N |
| `/pattern/flags` | Explicit regex |

### `rowMatchesQuery(row, parsed)`

Checks if a data row (array of cell values) matches a parsed query. Include terms use AND logic; exclude terms filter out matches.

### `matchTerm(text, term, wholeWord)`

Tests a single term against a text string. Handles wildcards, whole‑word boundaries (Unicode‑aware via `\p{L}`), and fuzzy matching.

### `highlightMatches(text, query)`

Wraps occurrences of the query in `<mark>` tags. Uses normalised matching to handle tashkeel/thikijehi — positions are mapped back to the original text.

### `buildSnippets(row, parsed, queryForHighlight)`

Finds matching cells in a row using `rowMatchesQuery`, then builds highlighted snippets (~300 chars around each match). Returns `Array<string>`.

### Search history

| Function | Description |
|---|---|
| `getSearchHistory()` | Returns array of recent queries |
| `addSearchHistory(query)` | Debounced (800ms) — adds only completed searches |
| `removeSearchHistoryItem(index)` | Removes one entry |
| `clearSearchHistory()` | Clears all history |
| `MAX_HISTORY` | Max entries (20) |

Saved to `localStorage` under `reader:searchHistory`.

---

## i18n.js

### `t(key)`

Returns the translated string for `key` in the current language.

### `setLanguage(lang)`

Sets language (`"dv"`, `"en"`, `"ar"`). Persists to `localStorage`. Dispatches `languagechange` event.

### `currentLang()`

Returns the current language code.

### `tagLabel(code, fallback, lang?)`

Returns the translated label for a tag code. Falls back to the CSV label, then the code itself.

### `initI18n()`

Processes all `data-i18n` attributes in the DOM and sets initial language from `localStorage`.

---

## reader.js

Consumes the above modules. Key internal functions:

| Function | Description |
|---|---|
| `applySearch(query)` | Runs the search engine, updates results dropdown and match count |
| `renderSearchHistory()` | Populates and positions the history dropdown |
| `setFocus(on)` | Toggles focus mode, animates chrome via CSS Grid |
| `goTo(rowIdx)` | Scrolls to a specific row, lazy‑loading chunks as needed |
| `loadInitial()` | Renders the first chunk of rows |
| `rebuildAll()` | Re‑renders all visible rows (used after settings change) |
| `updatePagination()` | Syncs pagination UI with current scroll position |
| `renderPageTags()` | Renders tag badges in the reader header |

---

## epub.js

Lazy-loaded module — only fetched when the user chooses EPUB export. Zero dependencies (reuses `zipStore` from `xlsx.js`).

### `createEPUB(rows, meta, opts)`

Generates a valid EPUB 3 e-book Blob. Each book row becomes a chapter. The Hadithmv font is optionally embedded for offline reading.

- `rows` — 2D array of cell values
- `meta` — `{bookCode, titleEN, titleDV, titleAR, tags}`
- `opts` — `{siteURL, versionText, fontData?: Uint8Array}`
- Returns `Blob` with MIME type `application/epub+zip`

Structure: `mimetype` (first, uncompressed) · `META-INF/container.xml` · `OEBPS/content.opf` (Dublin Core metadata) · `OEBPS/nav.xhtml` (EPUB 3 TOC) · `OEBPS/cover.xhtml` · `OEBPS/chXXX.xhtml` (one per row) · `OEBPS/styles.css` · `OEBPS/fonts/hadithmv.woff2` (if embedded).

```js
import("./epub.js").then(mod => {
  const blob = mod.createEPUB(allData, {
    bookCode: "AQD-nawaqidulIslam",
    titleEN: "Nawaqid ul-Islam",
    titleDV: "ނަވާޤިޟުލް އިސްލާމް",
    titleAR: "نواقض الإسلام",
    tags: ["AQD"]
  }, { siteURL, versionText, fontData: new Uint8Array(fontBuf) });
  // download blob…
});
```

---

## xlsx.js

Lazy-loaded module — only fetched when the user chooses Excel export. Zero dependencies. Also provides the shared ZIP layer for `epub.js`.

### `zipStore(files)`

Store-only ZIP writer. Takes `[{name: string, data: Uint8Array}]`, returns `Uint8Array`.

### `createXLSX(rows, sheetName)`

Generates a valid `.xlsx` (Office Open XML) spreadsheet Blob.

- `rows` — 2D array of cell values (`null`/`undefined` → empty cell)
- `sheetName` — sheet name, sanitised to ≤31 chars with `[ ] : * ? / \\` removed
- Returns `Blob` with MIME type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

Uses inline strings (no shared-strings table) and store-only ZIP (no compression). The ZIP bundles five XML files: `[Content_Types].xml`, `_rels/.rels`, `xl/workbook.xml`, `xl/_rels/workbook.xml.rels`, `xl/worksheets/sheet1.xml`.

```js
import("./xlsx.js").then(mod => {
  const blob = mod.createXLSX(allData, "MySheet");
  // download blob…
});
```

## Data API (HTTP GET)

No JSON endpoints. All data is CSV — one source of truth, no duplication. If you need JSON, fetch the CSV and parse it yourself. Base URL: `https://hadithmv.github.io/codebase/`

### Book registry

```http
GET data/02-bookNames.csv
```
Columns: `bookCode,titleAR,titleDV,titleEN`. One row per registered book.

### Tag definitions

```http
GET data/01-bookTags.csv
```
Columns: `code,label`. Colours are auto‑generated client‑side using golden‑ratio HSL — unlimited tags, always distinct.

### Book content

```http
GET data/{bookCode}.csv
```
First row is the column header. Column 0 is `#` (row numbers) or regular content. Headers ending in `*AR` are Arabic, `*DV` are Dhivehi. Standard CSV: comma‑delimited, quoted fields, `\r\n` line endings.

### Parsing

Every language has a CSV parser. Here's how to get started:

```js
// JavaScript — fetch + parse to array of arrays
const csv = await fetch(url).then(r => r.text());
const rows = csv.trim().split(/\r?\n/).map(line => {
  const cols = []; let cur = "", inQ = false;
  for (const c of line) {
    if (inQ) { if (c === '"') inQ = false; else cur += c; }
    else { if (c === '"') inQ = true; else if (c === ',') { cols.push(cur); cur = ""; } else cur += c; }
  }
  cols.push(cur); return cols;
});
```

```python
# Python — stdlib csv module
import csv, urllib.request
with urllib.request.urlopen(url) as r:
    rows = list(csv.reader(r.read().decode().splitlines()))
```

```bash
# curl into any CSV tool
curl -s https://hadithmv.github.io/codebase/data/02-bookNames.csv | csvlook
```

No authentication, no rate limiting, no CORS — static files on GitHub Pages.
