# Book Lookup System Architecture

This system uses a single shared viewer page and a metadata registry to display multiple books without duplicating HTML or JavaScript.

## Files

- bookNames.csv - Central registry of books and localized titles
- js/dbLookup.js - Logic for loading metadata, parsing tags, and rendering the dashboard
- books/index.html - Shared viewer and library dashboard

## How it works

1. The page reads the query parameter ?book=CODE.
2. It looks up the matching row in bookNames.csv.
3. It loads the corresponding CSV file from data/.
4. It renders the table and the page header using the metadata.

If no book is selected, the page shows a dashboard of all registered books.

## Data shape

Each row in bookNames.csv contains:

- bookCode
- titleAR
- titleDV
- titleEN

## Tag system

Tag prefixes are taken from the bookCode, using hyphen-separated segments before the final book name.

Examples:

| bookCode                      | Tags        | Book Name             |
| ----------------------------- | ----------- | --------------------- |
| AQD-nawaqidulIslam            | Aqidah      | nawaqidulIslam        |
| AQD-qawaidulArbau             | Aqidah      | qawaidulArbau         |
| HDT-umdathulAhkam             | Hadith      | umdathulAhkam         |
| AQD-DFK-sharhuSunnahBarbahari | Aqidah, DFK | sharhuSunnahBarbahari |

## Adding a new book

- Add a row to bookNames.csv
- Create data/{bookCode}.csv
- Open the viewer or dashboard to confirm it appears

## Key benefits

- Single source of truth for metadata
- Shared template for all books
- Easy to add new titles without duplicating pages
