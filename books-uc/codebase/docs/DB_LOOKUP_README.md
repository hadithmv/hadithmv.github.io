# Database Lookup System - README

This system provides a **zero-duplication** way to manage book pages and CSV data using metadata-driven page generation.

## Quick Start

### For Adding a New Book

1. **Update `dbNames.csv`** (in parent directory):

   ```csv
   AQD-myNewBook,كتاب جديد,ނިވަތި ފޮތް,My New Book
   ```

2. **Create CSV data file**:
   - Place at: `../db/AQD-myNewBook.csv`

3. **Create HTML page**:
   - Copy `book-template.html` → `AQD-myNewBook.html`
   - Or use server routing to one template

Done! The page automatically loads metadata and data.

## How It Works

When a book page loads (e.g., `AQD-qawaidulArbau-test.html`):

1. Filename is extracted: `AQD-qawaidulArbau-test`
2. Looked up in `../dbNames.csv`
3. Metadata retrieved (book names, etc.)
4. CSV automatically loaded from `../db/AQD-qawaidulArbau-test.csv`
5. Table displayed with metadata header

## Core Functions

### `initializePageWithMetadata(callback)`

Main initialization function. Detects filename and loads metadata.

```javascript
import { initializePageWithMetadata } from "../js/dbLookup.js";

initializePageWithMetadata(function (metadata) {
  // metadata.bookName_EN
  // metadata.bookName_AR
  // metadata.bookName_DV
  // metadata.csvPath
});
```

### `getPageMetadata(fileName)`

Look up metadata for a specific book.

```javascript
const metadata = await getPageMetadata("AQD-qawaidulArbau-test");
```

### `getCsvPath(fileName)`

Get the CSV file path for a book.

```javascript
const csvPath = getCsvPath("AQD-qawaidulArbau-test");
// Returns: "../db/AQD-qawaidulArbau-test.csv"
```

### `loadDbNames()`

Load and cache the metadata database.

```javascript
const allBooks = await loadDbNames();
```

## File Organization

```
test/
├── docs/                    Documentation
│   ├── ARCHITECTURE.md
│   └── DB_LOOKUP_README.md
├── dependencies/            Third-party libraries
│   ├── jquery-3.7.1.min.js
│   ├── datatables.min.js
│   ├── datatables.min.css
│   └── papaparse.min.js
├── books/                   Book HTML files
│   ├── book-template.html   (Universal template)
│   ├── AQD-nawaqidulIslam-test.html
│   └── AQD-qawaidulArbau-test.html
├── db/                      CSV data files
│   ├── AQD-nawaqidulIslam-test.csv
│   └── AQD-qawaidulArbau-test.csv
├── js/
│   └── dbLookup.js          (Core module)
├── old/                     Archived files
└── dbNames.csv              Metadata registry
```

## Metadata CSV Format

**File**: `../dbNames.csv`

```csv
fileName_CODE,bookName_AR,bookName_DV,bookName_EN
AQD-qawaidulArbau-test,القواعد الأربع,ހަތަރު ގަވާއިދު,Qawaidul Arbau
AQD-nawaqidulIslam-test,نواقض الإسلام,އިސްލާމްކަން ގެއްލޭ ކަންކަން,Nawaqidul Islam
```

## Benefits

✅ DRY - No code duplication  
✅ Scalable - Add books without changing code  
✅ Maintainable - Single source of truth  
✅ Organized - Clear folder structure  
✅ Data-driven - All metadata in CSV

## Common Tasks

### Update a Book's Metadata

Edit `../dbNames.csv` and change the book names. Page automatically reflects changes on next load.

### Change CSV Path Format

Edit `getCsvPath()` in `../js/dbLookup.js`. All books use the new format.

### Update Template

Edit `books/book-template.html`. When you copy it to new files, all books get updates (or use routing for zero-copy approach).

### Add Custom Per-Book Configuration

Add columns to `dbNames.csv` and access via `metadata.yourColumn`.
