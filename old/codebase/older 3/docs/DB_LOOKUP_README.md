# dbLookup.js — API Reference

ES module that loads metadata from `bookNames.csv` and `tags.csv`, resolves book lookups, and renders the dashboard. All CSV parsing uses PapaParse.

> The book viewer (pagination, search, toolbar, clipboard, keyboard) lives in [`js/reader.js`](../js/reader.js). The translations module is [`js/i18n.js`](../js/i18n.js). This module handles only metadata and the dashboard.

## Exports

### `initializePageWithMetadata(callback)`

Main entry point. Reads `?book=CODE` from the URL, preloads tag definitions and book metadata, then either renders the dashboard or invokes the callback with metadata for the selected book.

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

| Case | Behavior |
|---|---|
| No `?book=` param | Renders the dashboard (card grid of all books) |
| Book found | Calls `callback(metadata)` |
| Book not found | Shows error with book code |
| Registry failed to load | Shows error on dashboard or reader |

### `loadBookNames()`

Fetches and caches `bookNames.csv` using PapaParse. Safe to call multiple times — subsequent calls return the cache.

```javascript
const books = await loadBookNames();
// [{ bookCode: "AQD-nawaqidulIslam", titleAR: "نواقض الإسلام", ... }, ...]
```

Returns `[]` on error. Cache is only set on success so retries work.

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

Synchronous. Splits the book code on `-`, drops the last segment (book name), and resolves remaining segments against `tags.csv`. Returns an array of tag objects with `code`, `label`, `color`, and `bg`.

```javascript
const tags = extractTags("AQD-DFK-sharhuSunnahBarbahari");
// [
//   { code: "AQD", label: "Aqidah", color: "#4f46e5", bg: "#eef2ff" },
//   { code: "DFK", label: "DFK",    color: "#7c3aed", bg: "#f5f3ff" },
// ]
```

Tags must be preloaded via `loadTagDefinitions()` (called automatically by `initializePageWithMetadata`). Returns `[]` gracefully if called before loading or if a tag code is unknown.

## Internal functions

### `loadTagDefinitions()`

Fetches and caches `tags.csv`, building a lookup map:

```javascript
{ AQD: { label: "Aqidah", color: "#4f46e5", bg: "#eef2ff" }, … }
```

Called once by `initializePageWithMetadata()` before any rendering. Cache is set on success; on failure, an empty object is cached to prevent repeated retries.

### `renderDashboard(bookNames)`

Renders the card grid from the book registry. Each card shows tag badges and titles in Arabic, Dhivehi, and English. Shows an error if the book list is empty. Hides the loading message.

## File dependencies

```text
js/dbLookup.js
  ├── reads  ../bookNames.csv       (fetch + PapaParse)
  └── reads  ../tags.csv            (fetch + PapaParse)

js/reader.js
  ├── imports js/dbLookup.js        (initializePageWithMetadata, extractTags)
  ├── imports js/i18n.js            (t)
  └── reads  ../data/*.csv          (PapaParse)

js/i18n.js
  └── (no dependencies — pure data + DOM)
```
