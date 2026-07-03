# Test Directory Structure

This folder contains a metadata-driven book management system with organized dependencies, documentation, and book files.

## Folder Organization

```
test/
├── docs/                           📚 Documentation
│   ├── ARCHITECTURE.md             - System design overview
│   └── DB_LOOKUP_README.md         - Quick start & API reference
│
├── dependencies/                   📦 Third-party libraries
│   ├── jquery-3.7.1.min.js
│   ├── datatables.min.js
│   ├── datatables.min.css
│   └── papaparse.min.js
│
├── books/                          📖 Book HTML files
│   ├── book-template.html          - Universal template (use as base)
│   ├── AQD-nawaqidulIslam-test.html
│   ├── AQD-qawaidulArbau-test.html
│   └── (add more books here)
│
├── db/                             🗄️ CSV data files
│   ├── AQD-nawaqidulIslam-test.csv
│   ├── AQD-qawaidulArbau-test.csv
│   └── (add more CSVs here)
│
├── js/
│   └── dbLookup.js                 - Core metadata lookup module
│
├── old/                            🗑️ Archived/deprecated files
│
└── dbNames.csv                     📋 Metadata registry
```

## Quick Start

### Visit a Book

Open any book file directly:

```
test/books/AQD-qawaidulArbau-test.html
test/books/AQD-nawaqidulIslam-test.html
```

Each page automatically loads:

- Book metadata (names in EN, AR, DV)
- CSV data from `db/` folder
- Interactive DataTable with search/sort

### Add a New Book

1. **Add metadata to `dbNames.csv`**:

   ```csv
   AQD-myBook,كتاب جديد,ނިވަތި ފޮތް,My New Book
   ```

2. **Create CSV data file**:

   ```
   db/AQD-myBook.csv
   ```

   (With your book data)

3. **Create HTML page**:
   ```bash
   cp books/book-template.html books/AQD-myBook.html
   ```

Done! No code changes needed.

### Update Dependencies

All third-party libraries are in `dependencies/`:

- **jQuery**: `dependencies/jquery-3.7.1.min.js`
- **DataTables**: `dependencies/datatables.min.js`, `datatables.min.css`
- **PapaParse**: `dependencies/papaparse.min.js`

To upgrade: Replace the file and no HTML updates needed (all books use the same reference).

### Update Documentation

- **Architecture & Design**: `docs/ARCHITECTURE.md`
- **Quick Reference**: `docs/DB_LOOKUP_README.md`
- **This file**: `README.md`

## Key Features

✅ **Zero Code Duplication** - One template for all books  
✅ **Metadata-Driven** - All book info in CSV  
✅ **Scalable** - Add 2 or 200 books, same system  
✅ **Organized** - Clear separation of concerns  
✅ **Maintainable** - Update once, applies to all

## How It Works

1. User opens `books/AQD-qawaidulArbau-test.html`
2. Page extracts filename: `AQD-qawaidulArbau-test`
3. Looks up in `dbNames.csv` → finds metadata
4. Loads CSV from `db/AQD-qawaidulArbau-test.csv`
5. Renders table with metadata header

All handled by `js/dbLookup.js`.

## File Relationships

```
books/AQD-book.html
    ↓ loads metadata from
dbNames.csv
    ↓ finds entry
    fileName_CODE: AQD-book
    bookName_EN: Book Title
    bookName_AR: عنوان الكتاب
    bookName_DV: ފޮތުގެ ނާނو
    ↓ uses to load data from
db/AQD-book.csv
    ↓ renders in
books/AQD-book.html (DataTable)
```

## Common Tasks

### Check all available books

Edit `dbNames.csv` and see the list.

### Change a book's names

Update `dbNames.csv` - page reflects change on next load.

### Add custom metadata column

1. Add column to `dbNames.csv` (e.g., `language: ar`)
2. Access in book via `metadata.language`

### Update the template

Edit `books/book-template.html`:

```html
<!-- Copy updated template -->
cp books/book-template.html books/AQD-book.html
```

Or use server-side routing to serve one template for all URLs.

### Move/reorganize folders

Update paths in book HTML files:

```javascript
// Currently: ../dependencies/
// New path: ../../assets/js/
<script src="../../assets/js/jquery.min.js"></script>
```

## API Reference

See `docs/DB_LOOKUP_README.md` for complete function documentation.

**Main function:**

```javascript
import { initializePageWithMetadata } from "../js/dbLookup.js";

initializePageWithMetadata(function (metadata) {
  // metadata.fileName_CODE
  // metadata.bookName_EN
  // metadata.bookName_AR
  // metadata.bookName_DV
  // metadata.csvPath
});
```

## Migration Notes

**If you're moving from old structure:**

Old:

```
test/
├── AQD-qawaidulArbau-test.html
├── jquery-3.7.1.min.js
├── DB_LOOKUP_README.md
└── old files...
```

New:

```
test/
├── books/
│   └── AQD-qawaidulArbau-test.html
├── dependencies/
│   └── jquery-3.7.1.min.js
├── docs/
│   └── DB_LOOKUP_README.md
└── old/
    └── (moved old files here)
```

All book files in `books/` folder now use paths like:

- `../dependencies/jquery...` instead of `./jquery...`
- `../db/...` instead of `./db/...`
- `../js/dbLookup.js` stays the same

## Support

For questions, see:

- `docs/ARCHITECTURE.md` - System design
- `docs/DB_LOOKUP_README.md` - API reference
- `js/dbLookup.js` - Source code with comments
