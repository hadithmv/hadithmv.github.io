/**
 * Virtual Merged Radheef Book (RDF-all)
 *
 * The combined radheef dictionary is a VIRTUAL book: it has a registry row in
 * 02-registry-bookMeta.csv (card, tags, reader routing) but no content CSV.
 * Opening it loads the eight source radheef books through the normal
 * version-gated cache (fetchBookCSVCached) and assembles the combined view in
 * memory — nothing is stored, duplicated, or re-generated.
 *
 *   - Column layout: the 7 named columns MERGED_HEADERS. Every source row is
 *     projected into them BY HEADER NAME — a source column lands in the target
 *     column with the same name; columns without a same-named home (eegaal's
 *     pNo, nanfoiy's gender/approvedBy/originLang, rasmee's technical columns,
 *     ...) are simply left out. A source's column order is irrelevant.
 *   - Block order: sources concatenate in MERGED_SOURCES order, which mirrors
 *     the registry's alphabetical sort (03-update-bookRegistry.ps1).
 *   - source column: each row's 7th cell carries its book's Dhivehi title,
 *     read from the registry at load (getBookTitleSync) — derived, never
 *     stored or hardcoded.
 *   - Caching: each source is cached in IndexedDB keyed by its own version, so
 *     edits to any source book show up here automatically — nothing to re-run.
 *
 * Index: the merged book is excluded from the library search index
 * (excludeFromIndex = ENTIRE-BOOK, like all RDF books) — a postings index over
 * dictionaries would dwarf the rest of the site. Its search runs inside the
 * reader over the loaded rows; no index involved.
 *
 * The registry script (03) is exempted from warning about RDF-all's missing
 * content file via its $virtualBooks list — keep the two in sync.
 */

import { fetchBookCSVCached } from "./csv.js";
import { getBookVersionSync, getBookTitleSync, getCsvPath } from "./book-data.js";

var MERGED_BOOK_CODE = "RDF-all";

// The combined book's column schema — every source maps into these by name.
var MERGED_HEADERS = ["wordAR", "wordDV", "wordEN", "meanAR", "meanDV", "meanEN", "source"];

// Block order: the Rasmee dictionary leads — it's the primary Dhivehi
// dictionary, so the merged book opens on it — then the remaining seven
// sources follow registry order (02 sorts alphabetically by code,
// case-insensitive): fahmy, asma, eegaal, maniku, misc, nanfoiyComb, W2W.
// The order is deliberate, not alphabetical — change it only on purpose;
// every consumer (row indexing, ?row= deep links, the rasmee tint's
// first-block visibility) follows this array.
var MERGED_SOURCES = [
  "RDF-rasmee",
  "RDF-ahmadFahmyDidi",
  "RDF-asmaullahilHusna",
  "RDF-eegaal",
  "RDF-hassanAhmedManiku",
  "RDF-misc",
  "RDF-nanfoiyComb",
  "RDF-W2W-bakurube",
];

export function isMergedRadheefBook(bookCode) {
  return bookCode === MERGED_BOOK_CODE;
}

/**
 * Load the merged radheef book. Resolves to the same shape as
 * reader.js's loadStandardBook: { data, headerRow, hasRowNums }.
 * A source that fails or has no rows is skipped; if nothing loads, data is
 * empty and the reader's existing "No data found" path takes over.
 */
export function loadMergedRadheefBook() {
  var fetches = MERGED_SOURCES.map(function (code) {
    return fetchBookCSVCached(code, getBookVersionSync(code) || "", getCsvPath(code))
      .then(function (rows) {
        return { code: code, rows: rows };
      });
  });
  return Promise.all(fetches).then(function (parts) {
    var data = [];
    for (var p = 0; p < parts.length; p++) {
      var code = parts[p].code;
      var rows = parts[p].rows;
      if (!rows || rows.length === 0) continue;
      var headerRow = rows.shift();
      var idx = {};
      for (var h = 0; h < headerRow.length; h++) {
        idx[headerRow[h]] = h;
      }
      var title = getBookTitleSync(code) || code;
      for (var r = 0; r < rows.length; r++) {
        var src = rows[r];
        var tgt = [];
        for (var c = 0; c < MERGED_HEADERS.length; c++) {
          var name = MERGED_HEADERS[c];
          var i = idx[name];
          tgt.push(i !== undefined ? (src[i] || "") : "");
        }
        tgt[MERGED_HEADERS.length - 1] = title; // source column
        data.push(tgt);
      }
    }
    return { data: data, headerRow: MERGED_HEADERS, hasRowNums: false };
  });
}
