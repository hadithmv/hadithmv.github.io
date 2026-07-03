# Database Lookup System - Zero-Duplication Architecture

This system provides a **zero-duplication** way to manage book pages and CSV data. One template + metadata = unlimited books.

## Files

- **../dbNames.csv** - Central registry mapping book codes to metadata
- **../js/dbLookup.js** - Module that handles loading, query parameter routing, and dashboard rendering
- **../books/index.html** - Single entry viewer and dashboard selector

## How It Works

1. **Filename → Metadata Lookup**: When the index page loads, it checks the URL query parameter `?book=CODE` (e.g., `?book=AQD-qawaidulArbau`) and looks it up in `dbNames.csv`.

2. **Metadata Retrieval**: The matching row provides:
   - `bookName_EN` - English name
   - `bookName_AR` - Arabic name
   - `bookName_DV` - Dhivehi name
   - `fileName_CODE` - The filename code

3. **CSV Loading**: If a book code is present, its CSV file is loaded from `../db/{filename}.csv`.

4. **Page Rendering**: The page displays the book metadata header and loads the DataTable. If no parameter is specified, a modern grid dashboard selector is rendered.

## File Structure

```
books-uc/test/
  docs/                          ← Documentation
    ARCHITECTURE.md
    DB_LOOKUP_README.md
  dependencies/                  ← Libraries
    jquery-3.7.1.min.js
    datatables.min.js
    datatables.min.css
    papaparse.min.js
  books/                         ← Book HTML files
    index.html                   ← Single entry viewer page & dashboard
  db/                            ← CSV data files
    AQD-nawaqidulIslam.csv
    AQD-qawaidulArbau.csv
  js/
    dbLookup.js                  ← Routing & lookup logic (SINGLE file to maintain)
  old/                           ← Old/archived files
```

## Single Viewer Architecture

You have **ONE single HTML page** (`books/index.html`) that serves as both the home library dashboard and the dynamic book viewer.

### How it works:

1. **No query parameters**: Opening `/books/index.html` loads the metadata registry and displays a grid of all registered books.
2. **With query parameter**: Opening `/books/index.html?book=AQD-qawaidulArbau` extracts the code `AQD-qawaidulArbau` and dynamically loads that book.

When you add a new book:

### Step 1: Add to dbNames.csv

```
AQD-myNewBook,كتاب جديد,ނިވަތި ފޮތް,My New Book
```

### Step 2: Create the CSV file

Place your CSV file at:

```
db/AQD-myNewBook.csv
```

Done! The book will dynamically appear on the library index and load correctly when clicked.

## Available Functions

### `loadDbNames()`

Loads and caches the dbNames.csv file.

```javascript
const allEntries = await loadDbNames();
```

### `getPageMetadata(fileName)`

Look up metadata for a specific filename.

```javascript
const metadata = await getPageMetadata("AQD-qawaidulArbau");
console.log(metadata.bookName_EN); // "Qawaidul Arbau"
```

### `getCsvPath(fileName)`

Get the CSV path for a filename.

```javascript
const csvPath = getCsvPath("AQD-qawaidulArbau");
// Returns: "../db/AQD-qawaidulArbau.csv"
```

### `initializePageWithMetadata(callback)`

Automatically detects the current page's filename and loads its metadata.

```javascript
initializePageWithMetadata(function (metadata) {
  console.log("Page:", metadata.bookName_EN);
  console.log("CSV:", metadata.csvPath);
});
```

### `extractTags(fileNameCode)`

Extracts tag objects from a book's fileName_CODE. Tags are the leading `-` separated segments before the book name.

```javascript
const tags = extractTags("AQD-DFK-sharhuSunnahBarbahari");
// Returns: [{ code: "AQD", label: "Aqidah", ... }, { code: "DFK", label: "DFK", ... }]
```

## Tag System

The `fileName_CODE` in `dbNames.csv` includes **tag prefixes** separated by `-`. The last segment is always the book's unique name; everything before it are tags.

### How tags work

| fileName_CODE                   | Tags        | Book Name             |
| ------------------------------- | ----------- | --------------------- |
| `AQD-nawaqidulIslam`            | Aqidah      | nawaqidulIslam        |
| `AQD-qawaidulArbau`             | Aqidah      | qawaidulArbau         |
| `HDT-umdathulAhkam`             | Hadith      | umdathulAhkam         |
| `AQD-DFK-sharhuSunnahBarbahari` | Aqidah, DFK | sharhuSunnahBarbahari |

### Adding a new tag

Define it in `js/dbLookup.js` inside the `TAG_DEFINITIONS` object:

```javascript
const TAG_DEFINITIONS = {
  AQD: { label: "Aqidah", color: "#4f46e5", bg: "#eef2ff" },
  // Add your new tag:
  NEW: { label: "New Tag", color: "#000000", bg: "#f0f0f0" },
};
```

### Where tags appear

- **Dashboard cards** (`books/index.html`): Shown as colored badges at the top of each book card
- **Book viewer header**: Shown as colored badges below the book title metadata

## Adding a New Book (Checklist)

- [ ] Add row to `../dbNames.csv` with: fileName_CODE, bookName_AR, bookName_DV, bookName_EN
- [ ] Create CSV file: `../db/{fileName_CODE}.csv`
- [ ] Test the page loads and displays correctly by visiting the index page or appending `?book=fileName_CODE`

## Key Benefits

✅ **Single Source of Truth**: Logic only in `dbLookup.js` and `index.html`  
✅ **Easy Maintenance**: Fix a bug once, applies to all books  
✅ **Scalable**: Works with 2 books or 200 books  
✅ **DRY Principle**: No code duplication  
✅ **Data Driven**: All book info in `dbNames.csv`  
✅ **Organized**: Clear separation of concerns (docs, dependencies, books, data)

## Current Pages

- **AQD-nawaqidulIslam** - Nawaqidul Islam (loaded via `?book=AQD-nawaqidulIslam`)
- **AQD-qawaidulArbau** - Qawaidul Arbau (loaded via `?book=AQD-qawaidulArbau`)

Both automatically load their metadata from `dbNames.csv` and their data from `db/` folder.
