# API Reference

## Pages

| Page | Entry point | Loads |
|---|---|---|
| `books/index.html` | Inline module → `catalog.js` | `common.js`, `papaparse` |
| `books/reader.html` | `reader.js` | `common.js`, `papaparse` |

## Modules

| Module | Purpose |
|---|---|
| `js/common.js` | Shared init: theme, fonts, i18n, sidebar, settings, keyboard |
| `js/catalog.js` | Book registry, tag resolution, dashboard rendering |
| `js/reader.js` | Book viewer: CSV parsing, rendering, pagination, export |
| `js/search.js` | Search engine: normalisation, parsing, matching, history |
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

Fetches and caches `01-bookNames.csv`. Returns `Array` of book objects (`bookCode`, `titleAR`, `titleDV`, `titleEN`). Returns `[]` on error.

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
- Run `data/03-updateBookMeta.ps1` to auto‑generate `titleEN` from `bookCode`

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
