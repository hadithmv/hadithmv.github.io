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
│   └── index.html                  - Single entry viewer and dashboard selector
│
├── db/                             🗄️ CSV data files
│   ├── AQD-nawaqidulIslam.csv
│   ├── AQD-qawaidulArbau.csv
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

Open the viewer and select a book, or open it directly via a query parameter:

```
test/books/index.html
test/books/index.html?book=AQD-qawaidulArbau
test/books/index.html?book=AQD-nawaqidulIslam
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

Done! No code or HTML changes needed. The dashboard will automatically display the new book.

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

1. User opens `books/index.html?book=AQD-qawaidulArbau`
2. Page extracts book query param: `AQD-qawaidulArbau`
3. Looks up in `dbNames.csv` → finds metadata
4. Loads CSV from `db/AQD-qawaidulArbau.csv`
5. Renders table with metadata header

If the user opens `books/index.html` without any parameters, a dashboard index of all registered books is dynamically generated.

All handled by `js/dbLookup.js`.

## File Relationships

```
books/index.html?book=AQD-book
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
books/index.html (DataTable)
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

Since there is only one file, simply edit `books/index.html` directly. All changes will instantly apply to all books.

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
│   └── index.html
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
