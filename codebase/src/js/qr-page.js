/**
 * QR tool page — text/URL → QR, previewed on a white card and downloadable
 * as SVG (print) or PNG (chat). Everything runs locally; nothing is sent
 * anywhere.
 */
import { qrCreate, qrSvg, qrPngDataUrl } from "./qr.js";

var EMPTY_TEXT = "Type something to generate a code.";
var TOO_LONG_TEXT =
  "Too long for this error-correction level — shorten the text or choose a lower level.";
var ERROR_TEXT = "Could not generate the code.";
var PLACEHOLDER = "https://… or any text";

var textEl = document.getElementById("qrText");
var eccEl = document.getElementById("qrEcc");
var previewEl = document.getElementById("qrPreview");
var metaEl = document.getElementById("qrMeta");
var errorEl = document.getElementById("qrError");
var svgBtn = document.getElementById("qrDownloadSvg");
var pngBtn = document.getElementById("qrDownloadPng");

var current = null; // { enc, svg }
var timer = 0;

function disableDownloads() {
  current = null;
  svgBtn.disabled = true;
  pngBtn.disabled = true;
}

function showEmpty() {
  disableDownloads();
  previewEl.innerHTML = "";
  var p = document.createElement("p");
  p.className = "qr-empty";
  p.textContent = EMPTY_TEXT;
  previewEl.appendChild(p);
  metaEl.textContent = "";
  errorEl.hidden = true;
}

function showError(message) {
  disableDownloads();
  previewEl.innerHTML = "";
  metaEl.textContent = "";
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function render() {
  var text = textEl.value;
  if (!text) {
    showEmpty();
    return;
  }
  try {
    var enc = qrCreate(text, eccEl.value);
    var svg = qrSvg(enc.qr, { size: 512, label: "QR code" });
    current = { enc: enc, svg: svg };
    // qrSvg interpolates coordinates only, never the input text.
    previewEl.innerHTML = svg;
    metaEl.textContent =
      enc.bytes +
      " bytes · version " +
      enc.version +
      " · " +
      enc.size +
      "×" +
      enc.size +
      " modules";
    errorEl.hidden = true;
    svgBtn.disabled = false;
    pngBtn.disabled = false;
  } catch (e) {
    showError(e && e.name === "RangeError" ? TOO_LONG_TEXT : ERROR_TEXT);
  }
}

function download(blob, filename) {
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 0);
}

textEl.addEventListener("input", function () {
  clearTimeout(timer);
  timer = setTimeout(render, 120);
});

eccEl.addEventListener("change", render);

svgBtn.addEventListener("click", function () {
  if (!current) return;
  download(
    new Blob([current.svg], { type: "image/svg+xml" }),
    "hadithmv-qr.svg",
  );
});

pngBtn.addEventListener("click", function () {
  if (!current) return;
  var dataUrl = qrPngDataUrl(current.enc.qr, { size: 1024 });
  fetch(dataUrl)
    .then(function (r) {
      return r.blob();
    })
    .then(function (blob) {
      download(blob, "hadithmv-qr.png");
    })
    .catch(function () {
      showError(ERROR_TEXT);
    });
});

textEl.placeholder = PLACEHOLDER;
showEmpty();
