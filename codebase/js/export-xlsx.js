/**
 * Tiny XLSX writer (~2.5 KB)
 *
 * Generates valid .xlsx (Office Open XML) spreadsheets.
 * Imports escapeXML from search-utils.js and zipStore from export-zip.js.
 * Lazy-loaded only when the user exports to Excel — never loaded otherwise.
 *
 * XLSX is a ZIP of XML files:
 *   [Content_Types].xml  _rels/.rels  xl/workbook.xml
 *   xl/_rels/workbook.xml.rels  xl/worksheets/sheet1.xml
 *
 * ZIP uses store (no compression) — fast to build, small enough for
 * text-heavy spreadsheets.  Inline strings avoid a shared-strings table.
 */

import { escapeXML as xmlEsc } from "./search-utils.js";
import { zipStore } from "./export-zip.js";

// ── Public API ───────────────────────────────────────────────────

/**
 * Create an XLSX spreadsheet Blob.
 * @param {Array<Array<*>>} rows  — 2D array of values (null/undefined → empty cell)
 * @param {string} [sheetName]    — sheet name (sanitised to 31 chars, special chars removed)
 * @returns {Blob}  application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
 */
export function createXLSX(rows, sheetName) {
  var enc = new TextEncoder();

  // 0→A, 1→B, … 25→Z, 26→AA …
  function colRef(n) {
    var s = ''; n++;
    while (n > 0) { n--; s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26); }
    return s;
  }

  var safeName = (sheetName || 'Sheet1').replace(/[\[\]:*?\/\\]/g, '').slice(0, 31) || 'Sheet1';

  // ── Sheet XML  (inline strings — no shared-strings table) ──
  var sheet = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    sheet += '<row r="' + (i + 1) + '">';
    for (var j = 0; j < row.length; j++) {
      var val = row[j] != null ? String(row[j]) : '';
      sheet += '<c r="' + colRef(j) + (i + 1) + '" t="inlineStr"><is><t xml:space="preserve">' + xmlEsc(val) + '</t></is></c>';
    }
    sheet += '</row>';
  }
  sheet += '</sheetData></worksheet>';

  // ── Workbook XML ──
  var wb = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    '<sheets><sheet name="' + xmlEsc(safeName) + '" sheetId="1" r:id="rId1"/></sheets></workbook>';

  // ── Workbook relationships ──
  var wbRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
    '</Relationships>';

  // ── [Content_Types].xml ──
  var ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
    '</Types>';

  // ── Root relationships ──
  var rootRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
    '</Relationships>';

  var zipped = zipStore([
    { name: '[Content_Types].xml', data: enc.encode(ct) },
    { name: '_rels/.rels',       data: enc.encode(rootRels) },
    { name: 'xl/workbook.xml',   data: enc.encode(wb) },
    { name: 'xl/_rels/workbook.xml.rels', data: enc.encode(wbRels) },
    { name: 'xl/worksheets/sheet1.xml',  data: enc.encode(sheet) }
  ]);

  return new Blob([zipped], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
