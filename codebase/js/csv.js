/**
 * Tiny CSV parser for Hadithmv's format.
 * Handles quoted fields, commas inside quotes, and multiline values.
 * ~1 KB vs PapaParse's 22 KB.
 *
 * Usage:
 *   import { parseCSV } from "./csv.js";
 *   var rows = parseCSV(csvText);
 */
export function parseCSV(text) {
  var rows = [];
  var row = [];
  var field = "";
  var inQuote = false;

  for (var i = 0; i < text.length; i++) {
    var ch = text[i];
    var next = i + 1 < text.length ? text[i + 1] : null;

    if (inQuote) {
      if (ch === '"' && next === '"') {
        // escaped quote
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuote = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuote = true;
      } else if (ch === ',') {
        row.push(field.trim());
        field = "";
      } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        if (ch === '\r') i++; // skip \r in \r\n
        row.push(field.trim());
        // Only keep non-empty rows
        if (row.some(function (c) { return c !== ""; })) {
          rows.push(row);
        }
        row = [];
        field = "";
      } else if (ch === '\r') {
        // standalone \r
        row.push(field.trim());
        if (row.some(function (c) { return c !== ""; })) {
          rows.push(row);
        }
        row = [];
        field = "";
      } else {
        field += ch;
      }
    }
  }

  // Last field/row
  row.push(field.trim());
  if (row.some(function (c) { return c !== ""; })) {
    rows.push(row);
  }

  return rows;
}

/**
 * Convert a 2D array back to CSV text.
 */
export function unparseCSV(rows) {
  return rows.map(function (row) {
    return row.map(function (cell) {
      var s = cell == null ? "" : String(cell);
      // Quote if contains comma, quote, or newline
      if (s.indexOf(",") !== -1 || s.indexOf('"') !== -1 || s.indexOf("\n") !== -1) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    }).join(",");
  }).join("\r\n");
}
