# Database Lookup System - Zero-Duplication Architecture

This system provides a **zero-duplication** way to manage book pages and CSV data. One template + metadata = unlimited books.

## Files

- **../dbNames.csv** - Central registry mapping filenames to book metadata
- **../js/dbLookup.js** - Module that handles loading and looking up metadata
- **../books/book-template.html** - Universal template (use as base for all books)
- **../books/\*.html** - Book pages using this system

## How It Works

1. **Filename → Metadata Lookup**: When an HTML page loads, it extracts its filename (e.g., `AQD-qawaidulArbau`) and looks it up in `dbNames.csv`

2. **Metadata Retrieval**: The matching row provides:
   - `bookName_EN` - English name (displays on page)
   - `bookName_AR` - Arabic name (displays on page)
   - `bookName_DV` - Dhivehi name (displays on page)
   - `fileName_CODE` - The filename code (for matching)

3. **CSV Loading**: The CSV file is automatically loaded from `../db/{filename}.csv`

4. **Page Rendering**: The page displays the book metadata and loads the table with CSV data

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
    book-template.html           ← Universal template
    AQD-nawaqidulIslam.html
    AQD-qawaidulArbau.html
  db/                            ← CSV data files
    AQD-nawaqidulIslam.csv
    AQD-qawaidulArbau.csv
  js/
    dbLookup.js                  ← Core logic (SINGLE file to maintain)
  old/                           ← Old/archived files
```

## Single Template Approach

You only have **ONE HTML template** (`books/book-template.html`) that all books use. When you add a new book:

### Step 1: Add to dbNames.csv

```
AQD-myNewBook,كتاب جديد,ނިވަތި ފޮތް,My New Book
```

### Step 2: Copy the CSV file

Place your CSV file at:

```
db/AQD-myNewBook.csv
```

### Step 3: Copy or Link the HTML

Either:

- **Copy** `books/book-template.html` → `books/AQD-myNewBook.html` (simplest)
- **Link** your book code to the template via routing/URL mapping (most efficient)

That's it! No code changes needed.

## Implementation Options

### Option A: Simple Copy (Easiest)

```bash
cp books/book-template.html books/AQD-myNewBook.html
```

- Simple and straightforward
- Each book has its own file (easier for traditional hosting)

### Option B: Server-Side Routing (Most Efficient)

Configure your server to route all book requests to `books/book-template.html`

- One file for all books
- Server rewrites requests based on URL pattern
- Example: `/books-uc/test/books/*.html` → `/books-uc/test/books/book-template.html`

### Option C: Build Process (Automated)

Use a script to automatically generate HTML files from the template:

```javascript
// pseudo-code
dbNames.forEach((book) => {
  generate(`books/${book.fileName_CODE}.html`, "books/book-template.html");
});
```

- Most maintainable
- Any template updates apply to all books automatically

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

## Adding a New Book (Checklist)

- [ ] Add row to `../dbNames.csv` with: fileName_CODE, bookName_AR, bookName_DV, bookName_EN
- [ ] Create CSV file: `../db/{fileName_CODE}.csv`
- [ ] Copy `books/book-template.html` to `books/{fileName_CODE}.html`
- [ ] Test the page loads and displays correctly

## Key Benefits

✅ **Single Source of Truth**: Logic only in `dbLookup.js` and `book-template.html`  
✅ **Easy Maintenance**: Fix a bug once, applies to all books  
✅ **Scalable**: Works with 2 books or 200 books  
✅ **DRY Principle**: No code duplication  
✅ **Data Driven**: All book info in `dbNames.csv`  
✅ **Organized**: Clear separation of concerns (docs, dependencies, books, data)

## Current Pages

- **AQD-nawaqidulIslam.html** - Nawaqidul Islam
- **AQD-qawaidulArbau.html** - Qawaidul Arbau

Both automatically load their metadata from `dbNames.csv` and their data from `db/` folder.
