# Database Lookup System

This system provides a dynamic way to load page metadata and CSV data based on filename mapping in `dbNames.csv`.

## Files

- **dbNames.csv** - Central registry mapping filenames to book metadata
- **js/dbLookup.js** - Module that handles loading and looking up metadata
- **test/\*.html** - HTML pages that use this system

## How It Works

1. **Filename → Metadata Lookup**: When an HTML page loads, it extracts its filename (e.g., `AQD-qawaidulArbau-test`) and looks it up in `dbNames.csv`

2. **Metadata Retrieval**: The matching row provides:
   - `bookName_EN` - English name
   - `bookName_AR` - Arabic name
   - `bookName_DV` - Dhivehi name
   - `fileName_CODE` - The filename code

3. **CSV Loading**: The CSV file is automatically loaded from `db/{filename}.csv`

## Example HTML Template

```html
<script type="module">
  import { initializePageWithMetadata } from "../js/dbLookup.js";

  // Initialize page with metadata and CSV
  initializePageWithMetadata(function (metadata) {
    // metadata object contains:
    // - fileName_CODE: "AQD-qawaidulArbau-test"
    // - bookName_EN: "Qawaidul Arbau"
    // - bookName_AR: "القواعد الأربع"
    // - bookName_DV: "ހަތަރު ގަވާއިދު"
    // - csvPath: "db/AQD-qawaidulArbau-test.csv"

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

### `loadDbNames()`

Loads and caches the dbNames.csv file.

**Returns**: `Promise<Array>` - Array of metadata objects

```javascript
const allEntries = await loadDbNames();
```

### `getPageMetadata(fileName)`

Look up metadata for a specific filename.

**Parameters**:

- `fileName` (string) - Filename without extension (e.g., "AQD-qawaidulArbau-test")

**Returns**: `Promise<Object|null>` - Metadata object or null if not found

```javascript
const metadata = await getPageMetadata("AQD-qawaidulArbau-test");
console.log(metadata.bookName_EN); // "Qawaidul Arbau"
```

### `getCsvPath(fileName)`

Get the CSV path for a filename.

**Parameters**:

- `fileName` (string) - Filename without extension

**Returns**: `string` - Path to CSV file (e.g., "db/AQD-qawaidulArbau-test.csv")

```javascript
const csvPath = getCsvPath("AQD-qawaidulArbau-test");
// Returns: "db/AQD-qawaidulArbau-test.csv"
```

### `initializePageWithMetadata(callback)`

Automatically detects the current page's filename and loads its metadata. This is the main function for page initialization.

**Parameters**:

- `callback` (Function) - Function to call with metadata object

**Usage**:

```javascript
initializePageWithMetadata(function (metadata) {
  // Use metadata here
  console.log("Page:", metadata.bookName_EN);
  console.log("CSV:", metadata.csvPath);
});
```

## Adding New Pages

1. Add a new row to `dbNames.csv`:

   ```
   AQD-newbook-test,كتاب جديد,ނިވަތި ފޮތް,New Book
   ```

2. Create the corresponding CSV file in the `db/` folder:

   ```
   db/AQD-newbook-test.csv
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

Both automatically load their metadata from `dbNames.csv` and their data from `db/` folder.
