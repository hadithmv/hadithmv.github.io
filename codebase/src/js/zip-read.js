/**
 * Minimal store-only ZIP entry reader — the inverse of export-zip.js's
 * zipStore(). The app's own EPUB/XLSX exports are stored (no compression),
 * so the verify page can read the hadithmv.txt marker without inflating.
 * External re-zipped files with compressed entries return "" for the marker.
 */

export function readZipEntry(bytes, suffix) {
  var pos = 0;
  while (pos + 30 <= bytes.length) {
    if (
      bytes[pos] !== 0x50 ||
      bytes[pos + 1] !== 0x4b ||
      bytes[pos + 2] !== 0x03 ||
      bytes[pos + 3] !== 0x04
    ) {
      break;
    }
    var method = bytes[pos + 8] | (bytes[pos + 9] << 8);
    var compSize =
      (bytes[pos + 18] |
        (bytes[pos + 19] << 8) |
        (bytes[pos + 20] << 16) |
        (bytes[pos + 21] << 24)) >>>
      0;
    var nameLen = bytes[pos + 26] | (bytes[pos + 27] << 8);
    var extraLen = bytes[pos + 28] | (bytes[pos + 29] << 8);
    var dataStart = pos + 30 + nameLen + extraLen;
    if (dataStart + compSize > bytes.length) break;
    var name = "";
    for (var i = 0; i < nameLen; i++) {
      name += String.fromCharCode(bytes[pos + 30 + i]);
    }
    if (name.slice(-suffix.length) === suffix) {
      if (method !== 0) return "";
      return new TextDecoder("utf-8").decode(
        bytes.subarray(dataStart, dataStart + compSize),
      );
    }
    pos = dataStart + compSize;
  }
  return "";
}
