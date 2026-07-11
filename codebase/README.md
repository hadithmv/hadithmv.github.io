# Book Viewer Project

This repository contains a metadata-driven book viewer that loads book information from a CSV registry and renders each book in a shared page template.

## Structure

```text
books/
  index.html
data/
  *.csv
js/
  dbLookup.js
docs/
  ARCHITECTURE.md
  DB_LOOKUP_README.md
bookNames.csv
old/
```

## Quick Start

### Add a new book

1. Add a row to bookNames.csv:

```csv
bookCode,titleAR,titleDV,titleEN
AQD-myBook,كتاب جديد,ނިވަތި ފޮތް,My New Book
```

2. Create the matching CSV file:

```text
data/AQD-myBook.csv
```

The dashboard and viewer will pick it up automatically.

### Open the viewer

- Open books/index.html
- Or open it with a query parameter:

```text
books/index.html?book=AQD-qawaidulArbau
```

## Main concepts

- bookNames.csv stores the registry of books.
- Each row contains bookCode, titleAR, titleDV, and titleEN.
- dbLookup.js loads the registry, resolves the selected book, and renders the dashboard.
- books/index.html displays the shared viewer UI.

## API example

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

## Documentation

- docs/ARCHITECTURE.md
- docs/DB_LOOKUP_README.md
