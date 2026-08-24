/**
 * Export ZIP Module
 *
 * Minimal store-only ZIP writer (~1.5 KB) shared by the XLSX and EPUB
 * writers — EPUB is a ZIP of XHTML + XML metadata.
 * Lazy-loaded only when the user exports to Excel or EPUB.
 *
 * ZIP uses store (no compression) — fast to build, small enough for
 * text-heavy spreadsheets and e-books.
 */

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
