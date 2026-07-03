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

Done! The dashboard will automatically detect and list the new book. No HTML file creation is needed.

## How It Works

When a book page loads (e.g., `index.html?book=AQD-qawaidulArbau`):

1. The book code is extracted from the URL query parameter: `AQD-qawaidulArbau`
2. Looked up in `../dbNames.csv`
3. Metadata retrieved (book names, etc.)
4. CSV automatically loaded from `../db/AQD-qawaidulArbau.csv`
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
const metadata = await getPageMetadata("AQD-qawaidulArbau");
```

### `getCsvPath(fileName)`

Get the CSV file path for a book.

```javascript
const csvPath = getCsvPath("AQD-qawaidulArbau");
// Returns: "../db/AQD-qawaidulArbau.csv"
```

### `loadDbNames()`

Load and cache the metadata database.

```javascript
const allBooks = await loadDbNames();
```

### `extractTags(fileNameCode)`

Extract tag objects from a book's fileName_CODE (e.g., `"AQD-DFK-sharhuSunnahBarbahari"` returns tags for Aqidah and DFK).

```javascript
const tags = extractTags("AQD-qawaidulArbau");
// [{ code: "AQD", label: "Aqidah", color: "...", bg: "..." }]
```

## Tag System

The `fileName_CODE` includes **tag prefixes** (e.g., `AQD`, `HDT`, `DFK`) separated by `-`. The last segment is the book name, everything before it are tags.

**Current tags**:

| Code | Label         | Example                         |
| ---- | ------------- | ------------------------------- |
| AQD  | Aqidah        | `AQD-nawaqidulIslam`            |
| HDT  | Hadith        | `HDT-umdathulAhkam`             |
| QRN  | Quran         | —                               |
| RDF  | Radheef       | —                               |
| DFK  | DFK Publisher | `AQD-DFK-sharhuSunnahBarbahari` |
| IH   | Islamhouse    | —                               |

To add a new tag, edit `TAG_DEFINITIONS` in `js/dbLookup.js`.

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
│   └── index.html           (Viewer page and selector dashboard)
├── db/                      CSV data files
│   ├── AQD-nawaqidulIslam.csv
│   └── AQD-qawaidulArbau.csv
├── js/
│   └── dbLookup.js          (Core module)
├── old/                     Archived files
└── dbNames.csv              Metadata registry
```

## Metadata CSV Format

**File**: `../dbNames.csv`

```csv
fileName_CODE,bookName_AR,bookName_DV,bookName_EN
AQD-qawaidulArbau,القواعد الأربع,ހަތަރު ގަވާއިދު,Qawaidul Arbau
AQD-nawaqidulIslam,نواقض الإسلام,އިސްލާމްކަން ގެއްލޭ ކަންކަން,Nawaqidul Islam
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

Edit `books/index.html` directly. The changes apply to all books instantly.

### Add Custom Per-Book Configuration

Add columns to `dbNames.csv` and access via `metadata.yourColumn`.
