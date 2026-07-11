# Database Lookup System

This system provides a dynamic way to load page metadata and CSV data based on filename mapping in `bookNames.csv`.

## Files

- **bookNames.csv** - Central registry mapping filenames to book metadata
- **js/dbLookup.js** - Module that handles loading and looking up metadata
- **test/\*.html** - HTML pages that use this system

## How It Works

1. **Filename → Metadata Lookup**: When an HTML page loads, it extracts its filename (e.g., `AQD-qawaidulArbau-test`) and looks it up in `bookNames.csv`

2. **Metadata Retrieval**: The matching row provides:
   - `titleEN` - English name
   - `titleAR` - Arabic name
   - `titleDV` - Dhivehi name
   - `bookCode` - The book code

3. **CSV Loading**: The CSV file is automatically loaded from `data/{filename}.csv`

## Example HTML Template

```html
<script type="module">
  import { initializePageWithMetadata } from "../js/dbLookup.js";

  // Initialize page with metadata and CSV
  initializePageWithMetadata(function (metadata) {
    // metadata object contains:
    // - bookCode: "AQD-qawaidulArbau-test"
    // - titleEN: "Qawaidul Arbau"
    // - titleAR: "القواعد الأربع"
    // - titleDV: "ހަތަރު ގަވާއިދު"
    // - csvPath: "data/AQD-qawaidulArbau-test.csv"

    const csvUrl = metadata.csvPath;

    Papa.parse(csvUrl, {
      download: true,
      header: false,
      dynamicTyping: true,
      complete: function (results) {
        // Process your CSV data here
      },
    });
  });
</script>
```

## Available Functions

### `loadBookNames()`

Loads and caches the bookNames.csv file.

**Returns**: `Promise<Array>` - Array of metadata objects

```javascript
const allEntries = await loadBookNames();
```

### `getPageMetadata(bookCode)`

Look up metadata for a specific book code.

**Parameters**:

- `bookCode` (string) - Book code without extension (e.g., "AQD-qawaidulArbau-test")

**Returns**: `Promise<Object|null>` - Metadata object or null if not found

```javascript
const metadata = await getPageMetadata("AQD-qawaidulArbau-test");
console.log(metadata.titleEN); // "Qawaidul Arbau"
```

### `getCsvPath(bookCode)`

Get the CSV path for a book code.

**Parameters**:

- `bookCode` (string) - Book code without extension

**Returns**: `string` - Path to CSV file (e.g., "data/AQD-qawaidulArbau-test.csv")

```javascript
const csvPath = getCsvPath("AQD-qawaidulArbau-test");
// Returns: "data/AQD-qawaidulArbau-test.csv"
```

### `initializePageWithMetadata(callback)`

Automatically detects the current page's filename and loads its metadata. This is the main function for page initialization.

**Parameters**:

- `callback` (Function) - Function to call with metadata object

**Usage**:

```javascript
initializePageWithMetadata(function (metadata) {
  // Use metadata here
  console.log("Page:", metadata.titleEN);
  console.log("CSV:", metadata.csvPath);
});
```

## Adding New Pages

1. Add a new row to `bookNames.csv`:

   ```
   AQD-newbook-test,كتاب جديد,ނިވަތި ފޮތް,New Book
   ```

2. Create the corresponding CSV file in the `data/` folder:

   ```
   data/AQD-newbook-test.csv
   ```

3. Create the HTML file with the same filename:

   ```html
   <script type="module">
     import { initializePageWithMetadata } from "../js/dbLookup.js";

     initializePageWithMetadata(function (metadata) {
       const csvUrl = metadata.csvPath;
       // Load and display your data
     });
   </script>
   ```

That's it! The system will automatically find the metadata and load the correct CSV file.

## Current Test Pages

- **AQD-nawaqidulIslam-test.html** - Nawaqidul Islam
- **AQD-qawaidulArbau-test.html** - Qawaidul Arbau

Both automatically load their metadata from `bookNames.csv` and their data from `data/` folder.
