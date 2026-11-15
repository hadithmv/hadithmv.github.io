/**
 * PNG tEXt marker — insert/read a Hadithmv verify marker without decoding
 * the image. Used by the reader's PNG export (insert) and the verify page
 * (read).
 *
 * The tEXt chunk holds keyword "Hadithmv" + NUL + the marker text (the verify
 * URL plus the source caption); everything is Latin-1, so the ASCII URL
 * survives. The PNG itself is untouched apart from the extra ancillary chunk;
 * platforms that re-encode images may strip it.
 */

var SIG = [137, 80, 78, 71, 13, 10, 26, 10];
var CRC_TABLE = (function () {
  var t = [];
  for (var n = 0; n < 256; n++) {
    var c = n;
    for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes) {
  var crc = 0xffffffff;
  for (var i = 0; i < bytes.length; i++)
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function readU32(bytes, off) {
  return (
    ((bytes[off] << 24) |
      (bytes[off + 1] << 16) |
      (bytes[off + 2] << 8) |
      bytes[off + 3]) >>>
    0
  );
}

function latin(bytes, start, len) {
  var s = "";
  for (var i = 0; i < len; i++) s += String.fromCharCode(bytes[start + i]);
  return s;
}

function makeTextChunk(keyword, text) {
  var data = [];
  var kw = String(keyword);
  for (var i = 0; i < kw.length; i++) data.push(kw.charCodeAt(i) & 0xff);
  data.push(0);
  var t = String(text);
  for (var j = 0; j < t.length; j++) {
    var code = t.charCodeAt(j);
    data.push(code < 256 ? code : 63); // Latin-1 only; non-Latin → '?'
  }
  var type = [116, 69, 88, 116]; // "tEXt"
  var chunk = new Uint8Array(12 + data.length);
  var view = new DataView(chunk.buffer);
  view.setUint32(0, data.length, false);
  chunk.set(type, 4);
  chunk.set(data, 8);
  var crcInput = new Uint8Array(4 + data.length);
  crcInput.set(type, 0);
  crcInput.set(data, 4);
  view.setUint32(8 + data.length, crc32(crcInput), false);
  return chunk;
}

/** Return a copy of the PNG with the tEXt chunk inserted before IEND. */
export function insertPngText(png, keyword, text) {
  if (png.length < 8) return png;
  for (var s = 0; s < 8; s++) if (png[s] !== SIG[s]) return png;
  var chunks = [];
  var pos = 8;
  var inserted = false;
  while (pos + 8 <= png.length) {
    var len = readU32(png, pos);
    if (pos + 12 + len > png.length) break;
    var type = latin(png, pos + 4, 4);
    if (type === "IEND" && !inserted) {
      chunks.push(makeTextChunk(keyword, text));
      inserted = true;
    }
    chunks.push(png.subarray(pos, pos + 12 + len));
    pos += 12 + len;
    if (type === "IEND") break;
  }
  if (!inserted) chunks.push(makeTextChunk(keyword, text));
  var total = 8;
  for (var c = 0; c < chunks.length; c++) total += chunks[c].length;
  var out = new Uint8Array(total);
  out.set(SIG, 0);
  var off = 8;
  for (var d = 0; d < chunks.length; d++) {
    out.set(chunks[d], off);
    off += chunks[d].length;
  }
  return out;
}

/** Return the marker text from the Hadithmv tEXt chunk ("" when absent). */
export function readPngText(png) {
  if (png.length < 8) return "";
  for (var s = 0; s < 8; s++) if (png[s] !== SIG[s]) return "";
  var pos = 8;
  while (pos + 8 <= png.length) {
    var len = readU32(png, pos);
    if (pos + 12 + len > png.length) return "";
    var type = latin(png, pos + 4, 4);
    if (type === "tEXt") {
      var data = png.subarray(pos + 8, pos + 8 + len);
      var z = data.indexOf(0);
      if (z > 0 && latin(data, 0, z) === "Hadithmv") {
        return latin(data, z + 1, data.length - z - 1);
      }
    }
    if (type === "IEND") break;
    pos += 12 + len;
  }
  return "";
}
