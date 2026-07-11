# Book Lookup System - README

This project uses a shared viewer page and a metadata registry to load books dynamically from CSV files.

## Quick start

### Add a new book

1. Update bookNames.csv:

```csv
bookCode,titleAR,titleDV,titleEN
AQD-myNewBook,كتاب جديد,ނިވަތި ފޮތް,My New Book
```

2. Create the matching CSV file:

```text
data/AQD-myNewBook.csv
```

## Core functions

### initializePageWithMetadata(callback)

```javascript
import { initializePageWithMetadata } from "../js/dbLookup.js";

initializePageWithMetadata(function (metadata) {
  // metadata.bookCode
  // metadata.titleEN
  // metadata.titleAR
  // metadata.titleDV
  // metadata.csvPath
});
```

### getPageMetadata(bookCode)

```javascript
const metadata = await getPageMetadata("AQD-qawaidulArbau");
```

### getCsvPath(bookCode)

```javascript
const csvPath = getCsvPath("AQD-qawaidulArbau");
// Returns: "../data/AQD-qawaidulArbau.csv"
```

### loadBookNames()

```javascript
const allBooks = await loadBookNames();
```

### extractTags(bookCode)

```javascript
const tags = extractTags("AQD-qawaidulArbau");
```

## File organization

```text
books/
  index.html
data/
  *.csv
js/
  dbLookup.js
bookNames.csv
docs/
```

## Metadata format

```csv
bookCode,titleAR,titleDV,titleEN
AQD-qawaidulArbau,القواعد الأربع,ހަތަރު ގަވާއިދު,Qawaidul Arbau
AQD-nawaqidulIslam,نواقض الإسلام,އިސްލާމްކަން ގެއްލޭ ކަންކަން,Nawaqidul Islam
```
