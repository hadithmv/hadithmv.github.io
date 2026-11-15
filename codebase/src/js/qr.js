/**
 * QR wrapper — the app's one entry point to the vendored encoder.
 *
 * The encoder is Nayuki's qrcodegen (MIT — see vendor-qrcodegen.js).
 * Text is encoded in byte mode as UTF-8, so Dhivehi and Arabic work in
 * phone scanners. `qrCreate` throws RangeError("Data too long") when the
 * text exceeds the chosen error-correction level's capacity.
 *
 * Everything here is DOM-free except qrPngDataUrl, which creates a canvas
 * only when called.
 */
import { qrcodegen } from "./vendor-qrcodegen.js";

var ECC = {
  L: qrcodegen.QrCode.Ecc.LOW,
  M: qrcodegen.QrCode.Ecc.MEDIUM,
  Q: qrcodegen.QrCode.Ecc.QUARTILE,
  H: qrcodegen.QrCode.Ecc.HIGH,
};

function eccOf(key) {
  return ECC[String(key || "Q").toUpperCase()] || ECC.Q;
}

function utf8Length(text) {
  return new TextEncoder().encode(String(text)).length;
}

/** Encode text → { qr, version, size, bytes }. Throws on overflow. */
export function qrCreate(text, eclKey) {
  var qr = qrcodegen.QrCode.encodeText(String(text), eccOf(eclKey));
  return {
    qr: qr,
    version: qr.version,
    size: qr.size,
    bytes: utf8Length(text),
  };
}

function escAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Render an encoded QR as SVG — a white background with the quiet zone, a
 * single path of dark modules, and no text interpolated from the input
 * (only coordinates), so it is safe to insert with innerHTML.
 */
export function qrSvg(qr, opts) {
  opts = opts || {};
  var border = opts.border == null ? 4 : opts.border;
  var size = opts.size || 512;
  var label = opts.label || "QR code";
  var n = qr.size + border * 2;
  var d = "";
  for (var y = 0; y < qr.size; y++) {
    for (var x = 0; x < qr.size; x++) {
      if (qr.getModule(x, y)) {
        d += "M" + (x + border) + "," + (y + border) + "h1v1h-1z";
      }
    }
  }
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="' +
    size +
    '" height="' +
    size +
    '" viewBox="0 0 ' +
    n +
    " " +
    n +
    '" shape-rendering="crispEdges" role="img" aria-label="' +
    escAttr(label) +
    '">' +
    '<rect width="' +
    n +
    '" height="' +
    n +
    '" fill="#ffffff"/>' +
    '<path d="' +
    d +
    '" fill="#000000"/></svg>'
  );
}

/** Canvas PNG data URL (browser only), integer-scaled for crisp modules. */
export function qrPngDataUrl(qr, opts) {
  opts = opts || {};
  var border = opts.border == null ? 4 : opts.border;
  var target = opts.size || 1024;
  var n = qr.size + border * 2;
  var scale = Math.max(1, Math.floor(target / n));
  var px = n * scale;
  var canvas = document.createElement("canvas");
  canvas.width = px;
  canvas.height = px;
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, px, px);
  ctx.fillStyle = "#000000";
  for (var y = 0; y < qr.size; y++) {
    for (var x = 0; x < qr.size; x++) {
      if (qr.getModule(x, y)) {
        ctx.fillRect((x + border) * scale, (y + border) * scale, scale, scale);
      }
    }
  }
  return canvas.toDataURL("image/png");
}
