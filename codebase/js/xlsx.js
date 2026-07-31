/**
 * Tiny XLSX writer (~2.5 KB)
 *
 * Generates valid .xlsx (Office Open XML) spreadsheets with zero dependencies.
 * Lazy-loaded only when the user exports to Excel — never loaded otherwise.
 *
 * XLSX is a ZIP of XML files:
 *   [Content_Types].xml  _rels/.rels  xl/workbook.xml
 *   xl/_rels/workbook.xml.rels  xl/worksheets/sheet1.xml
 *
 * ZIP uses store (no compression) — fast to build, small enough for
 * text-heavy spreadsheets.  Inline strings avoid a shared-strings table.
 */

import { escapeXML as xmlEsc } from "./search.js";

// ── CRC-32 (table-driven) ────────────────────────────────────────
function crc32(data) {
  var table = [];
  for (var i = 0; i < 256; i++) {
    var c = i;
    for (var j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  var crc = 0xFFFFFFFF;
  for (var i = 0; i < data.length; i++) crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// ── Store-only ZIP writer ────────────────────────────────────────
// files: [{name: string, data: Uint8Array}]
// Exported so epub.js can reuse it.
export function zipStore(files) {
  var enc = new TextEncoder();
  var now = new Date();
  var dt = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  var dd = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  var centralEntries = [], offset = 0;
  var localsAndData = [];
  for (var f = 0; f < files.length; f++) {
    var nameBytes = enc.encode(files[f].name);
    var data = files[f].data;
    var crc = crc32(data);
    // Local file header  (30 + name length)
    var lh = new Uint8Array(30 + nameBytes.length);
    var lv = new DataView(lh.buffer);
    lv.setUint32(0, 0x04034b50, true);       // signature
    lv.setUint16(4, 20, true);               // version needed 2.0
    lv.setUint16(6, 0x0800, true);           // general purpose flag: UTF-8
    lv.setUint16(8, 0, true);                // compression: store
    lv.setUint16(10, dt, true);              // last mod file time
    lv.setUint16(12, dd, true);              // last mod file date
    lv.setUint32(14, crc, true);             // crc-32
    lv.setUint32(18, data.length, true);     // compressed size
    lv.setUint32(22, data.length, true);     // uncompressed size
    lv.setUint16(26, nameBytes.length, true);// file name length
    lv.setUint16(28, 0, true);               // extra field length
    lh.set(nameBytes, 30);
    localsAndData.push(lh, data);

    // Central directory entry  (46 + name length)
    var cd = new Uint8Array(46 + nameBytes.length);
    var cv = new DataView(cd.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);               // version made by
    cv.setUint16(6, 20, true);               // version needed
    cv.setUint16(8, 0x0800, true);           // UTF-8
    cv.setUint16(10, 0, true);               // store
    cv.setUint16(12, dt, true);
    cv.setUint16(14, dd, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);               // extra field length
    cv.setUint16(32, 0, true);               // file comment length
    cv.setUint16(34, 0, true);               // disk number start
    cv.setUint16(36, 0, true);               // internal file attrs
    cv.setUint32(38, 0, true);               // external file attrs
    cv.setUint32(42, offset, true);          // relative offset of local header
    cd.set(nameBytes, 46);
    centralEntries.push(cd);
    offset += lh.length + data.length;
  }

  // End of central directory record  (22 bytes)
  var cdSize = 0;
  for (var i = 0; i < centralEntries.length; i++) cdSize += centralEntries[i].length;
  var eocd = new Uint8Array(22);
  var ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);                  // disk number
  ev.setUint16(6, 0, true);                  // disk with central directory
  ev.setUint16(8, files.length, true);       // entries on this disk
  ev.setUint16(10, files.length, true);      // total entries
  ev.setUint32(12, cdSize, true);            // size of central directory
  ev.setUint32(16, offset, true);            // offset of central directory
  ev.setUint16(20, 0, true);                 // comment length

  // Combine
  var total = offset + cdSize + 22;
  var result = new Uint8Array(total);
  var pos = 0;
  for (var i = 0; i < localsAndData.length; i++) { result.set(localsAndData[i], pos); pos += localsAndData[i].length; }
  for (var i = 0; i < centralEntries.length; i++) { result.set(centralEntries[i], pos); pos += centralEntries[i].length; }
  result.set(eocd, pos);
  return result;
}

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
