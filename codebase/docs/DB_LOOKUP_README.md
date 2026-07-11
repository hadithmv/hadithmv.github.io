# dbLookup.js — API Reference

ES module that loads metadata from `bookNames.csv` and `tags.csv`, resolves book lookups, and renders the dashboard. All CSV parsing uses PapaParse.

> The book viewer (pagination, search, toolbar, clipboard, keyboard) lives in [`js/reader.js`](../js/reader.js). This module handles only metadata and the dashboard.

## Exports

### `initializePageWithMetadata(callback)`

Main entry point. Reads `?book=CODE` from the URL, preloads tag definitions and book metadata, then either renders the dashboard or invokes the callback.

```javascript
import { initializePageWithMetadata } from "../js/dbLookup.js";

initializePageWithMetadata(async function (metadata) {
  // metadata.bookCode   — e.g. "AQD-qawaidulArbau"
  // metadata.titleEN    — "Qawaidul Arbau"
  // metadata.titleAR    — "القواعد الأربع"
  // metadata.titleDV    — "ހަތަރު ގަވާއިދު"
  // metadata.csvPath    — "../data/AQD-qawaidulArbau.csv"
});
```

**No `?book=` param** → renders the dashboard (card grid of all books).
**Book found** → calls `callback(metadata)`.
**Book not found or registry failed** → shows an error message.

### `loadBookNames()`

Fetches and caches `bookNames.csv`. Safe to call multiple times.

```javascript
const books = await loadBookNames();
// [{ bookCode: "AQD-nawaqidulIslam", titleAR: "نواقض الإسلام", ... }, ...]
```

Returns `[]` on error.

### `getPageMetadata(bookCode)`

Looks up a single book by code.

```javascript
const meta = await getPageMetadata("AQD-qawaidulArbau");
// { bookCode, titleAR, titleDV, titleEN } or null
```

### `getCsvPath(bookCode)`

Returns the path to a book's data CSV.

```javascript
getCsvPath("AQD-qawaidulArbau");
// → "../data/AQD-qawaidulArbau.csv"
```

### `extractTags(bookCode)`

Synchronous. Splits the book code on `-`, drops the last segment (book name), and resolves remaining segments against `tags.csv`.

```javascript
const tags = extractTags("AQD-DFK-sharhuSunnahBarbahari");
// [
//   { code: "AQD", label: "Aqidah", color: "#4f46e5", bg: "#eef2ff" },
//   { code: "DFK", label: "DFK",    color: "#7c3aed", bg: "#f5f3ff" },
// ]
```

Tags must be preloaded via `loadTagDefinitions()` (called automatically by `initializePageWithMetadata`). Returns `[]` if called before loading.

## Internal functions

### `loadTagDefinitions()`

Fetches and caches `tags.csv`, building a lookup map of `{ code → { label, color, bg } }`.

### `renderDashboard(bookNames)`

Renders the card grid from the book registry. Shows an error if the list is empty.

## File dependencies

```text
js/dbLookup.js
  ├── reads ../bookNames.csv    (fetch + PapaParse)
  └── reads ../tags.csv         (fetch + PapaParse)

js/reader.js
  ├── imports dbLookup.js       (initializePageWithMetadata, extractTags)
  └── reads ../data/*.csv       (PapaParse)
```
