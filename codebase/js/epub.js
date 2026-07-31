/**
 * Tiny EPUB 3 writer (~4 KB)
 *
 * Generates valid .epub e-books. Imports zipStore from xlsx.js,
 * escapeXML from search.js, and column helpers from quran-ui.js.
 * Lazy-loaded only when the user exports to EPUB.
 *
 * EPUB is a ZIP of XHTML + XML metadata.  Reuses zipStore() from xlsx.js.
 * Each book row becomes a chapter.  Font can be embedded for offline reading.
 */

import { zipStore } from "./xlsx.js";
import { escapeXML as xmlEsc } from "./search.js";
import { isFootnoteColumn, isArDvTransition, isMatnSharhTransition } from "./quran-ui.js";

var enc = new TextEncoder();

/**
 * Create an EPUB 3 e-book Blob.
 * @param {Array<Array<*>>} rows      — 2D array of cell values (null/undefined → empty)
 * @param {{bookCode,titleEN,titleDV,titleAR}} meta — book metadata
 * @param {{siteURL,fontData?:Uint8Array,headerRow?:Array<string>}} opts
 * @returns {Blob}  application/epub+zip
 */
export function createEPUB(rows, meta, opts) {
  var bookTitle = meta.titleEN || meta.bookCode || "Hadithmv Book";
  var uniqueId = "hadithmv-" + (meta.bookCode || Date.now());
  var nowISO = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  var lang = "dv";  // Dhivehi primary; Arabic text auto-detected in XHTML
  var epubFirstCol = (opts.headerRow && opts.headerRow[0]) ? opts.headerRow[0].trim() : "";
  var epubHasRowNums = (epubFirstCol === "#" || epubFirstCol === "");

  // ── Build chapter XHTML files ──────────────────────────────────
  var chapters = [];
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var chapId = "ch" + pad(i + 1, 3);
    // Chapter title: first non-empty column value (skip row-num col)
    var chapTitle = null;
    var chapStart = epubHasRowNums ? 1 : 0;
    for (var j = chapStart; j < row.length; j++) {
      if (row[j] != null && String(row[j]).trim()) {
        chapTitle = String(row[j]).trim();
        break;
      }
    }
    if (!chapTitle) chapTitle = (epubHasRowNums ? "#" : "") + (epubHasRowNums ? (row[0] || (i + 1)) : (i + 1));
    // Truncate long titles
    if (chapTitle.length > 80) chapTitle = chapTitle.slice(0, 77) + "…";

    // Build chapter body
    var body = "";
    var nonEmpty = [];
    var bodyStart = epubHasRowNums ? 1 : 0;
    for (var j = bodyStart; j < row.length; j++) {
      if (row[j] != null && String(row[j]).trim()) nonEmpty.push(j);
    }
    var prevNonEmpty = -1;
    for (var j = 0; j < row.length; j++) {
      if (epubHasRowNums && j === 0) continue; // skip row number for chapter content
      var val = row[j] != null ? String(row[j]).trim() : "";
      if (!val) continue;
      var lines = val.split(/\n+/);
      // Column header starts with "foot" (case-insensitive) → divider before it
      var colHeader = (opts.headerRow && opts.headerRow[j]) ? opts.headerRow[j].toLowerCase() : "";
      // AR→DV break: blank line between last AR-ending col and first DV-ending col
      if (prevNonEmpty >= 0) {
        var prevHdrE = (opts.headerRow && opts.headerRow[prevNonEmpty]) ? opts.headerRow[prevNonEmpty].toLowerCase() : "";
        if (isArDvTransition(prevHdrE, colHeader)) { body += '<p class="spacer">&nbsp;</p>\n'; }
      }
      if (isFootnoteColumn(colHeader) && nonEmpty.length > 1) {
        body += '<div class="divider">ــــــــــــــــــــــــــــــــــــــــــــ</div>\n';
      }
      // Matn → Sharh separator
      if (prevNonEmpty >= 0) {
        var prevHdrM = (opts.headerRow && opts.headerRow[prevNonEmpty]) ? opts.headerRow[prevNonEmpty].toLowerCase() : "";
        if (isMatnSharhTransition(prevHdrM, colHeader)) { body += '<div class="ms-sep">· · ·</div>\n'; }
      }
      // Heading hierarchy for header/kitab/bab/matn/sharh columns
      var tag = "p";
      var cls = "";
      if (!isFootnoteColumn(colHeader)) {
        if (colHeader.startsWith("head")) { tag = "p"; cls = ' class="header"'; }
        else if (colHeader.startsWith("kitab")) { tag = "p"; cls = ' class="kitab"'; }
        else if (colHeader.startsWith("bab"))  { tag = "p"; cls = ' class="bab"'; }
        else if (colHeader.startsWith("matn"))  { tag = "p"; cls = ' class="matn"'; }
        else if (colHeader.startsWith("sharh"))  { tag = "p"; cls = ' class="sharh"'; }
      }
      for (var l = 0; l < lines.length; l++) {
        body += "<" + tag + cls + ">" + xmlEsc(lines[l]) + "</" + tag + ">\n";
      }
      prevNonEmpty = j;
    }

    chapters.push({ id: chapId, title: chapTitle, body: body });
  }

  // ── Cover XHTML ────────────────────────────────────────────────
  var cover = '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="' + lang + '"><head>'
    + '<title>' + xmlEsc(bookTitle) + '</title>'
    + '<link rel="stylesheet" type="text/css" href="styles.css"/>'
    + '</head><body class="cover">'
    + '<h1 class="cover-title">' + xmlEsc(meta.titleDV || meta.titleEN || "") + '</h1>';
  if (meta.titleAR) cover += '<p class="cover-ar">' + xmlEsc(meta.titleAR) + '</p>';
  if (meta.titleEN && meta.titleDV) cover += '<p class="cover-en">' + xmlEsc(meta.titleEN) + '</p>';
  cover += '<p class="cover-brand">Hadithmv</p>'
    + '<p class="cover-url">' + xmlEsc(opts.siteURL || "") + '</p>'
    + '</body></html>';

  // ── Navigation XHTML  (EPUB 3 nav doc) ─────────────────────────
  var nav = '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="' + lang + '"><head>'
    + '<title>' + xmlEsc(bookTitle) + '</title>'
    + '<link rel="stylesheet" type="text/css" href="styles.css"/>'
    + '</head><body><nav epub:type="toc"><h1>' + xmlEsc(bookTitle) + '</h1><ol>';
  for (var i = 0; i < chapters.length; i++) {
    nav += '<li><a href="' + chapters[i].id + '.xhtml">' + xmlEsc(chapters[i].title) + '</a></li>';
  }
  nav += '</ol></nav></body></html>';

  // ── OPF (package document) ─────────────────────────────────────
  var manifestItems = "";
  var spineItems = "";
  // Cover
  manifestItems += '<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml" properties="svg"/>';
  manifestItems += '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>';
  spineItems += '<itemref idref="cover"/>';
  spineItems += '<itemref idref="nav"/>';
  // Chapters
  for (var i = 0; i < chapters.length; i++) {
    manifestItems += '<item id="' + chapters[i].id + '" href="' + chapters[i].id + '.xhtml" media-type="application/xhtml+xml"/>';
    spineItems += '<itemref idref="' + chapters[i].id + '"/>';
  }
  // CSS
  manifestItems += '<item id="css" href="styles.css" media-type="text/css"/>';
  // Font (if embedded)
  var hasFont = !!(opts.fontData && opts.fontData.length);
  if (hasFont) {
    manifestItems += '<item id="font" href="fonts/hadithmv.woff2" media-type="font/woff2"/>';
  }

  var opf = '<?xml version="1.0" encoding="UTF-8"?>'
    + '<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="book-id" version="3.0">'
    + '<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">'
    + '<dc:title>' + xmlEsc(bookTitle) + '</dc:title>'
    + '<dc:creator>Hadithmv</dc:creator>'
    + '<dc:language>' + lang + '</dc:language>'
    + '<dc:identifier id="book-id">' + xmlEsc(uniqueId) + '</dc:identifier>'
    + '<dc:date>' + nowISO + '</dc:date>'
    + '<dc:publisher>Hadithmv</dc:publisher>'
    + '<dc:description>' + xmlEsc((meta.titleDV || "") + " — " + (meta.titleAR || "")) + '</dc:description>';
  opf += '<meta property="dcterms:modified">' + nowISO + '</meta>'
    + '</metadata>'
    + '<manifest>' + manifestItems + '</manifest>'
    + '<spine>' + spineItems + '</spine>'
    + '</package>';

  // ── Stylesheet ─────────────────────────────────────────────────
  var css = '/* Hadithmv EPUB */\n';
  if (hasFont) {
    css += '@font-face { font-family: Hadithmv; src: url("fonts/hadithmv.woff2") format("woff2"); font-weight: 300; }\n';
  }
  css += 'body { font-family: ' + (hasFont ? 'Hadithmv, ' : '') + '"Traditional Arabic", "Scheherazade New", serif; font-size: 1rem; line-height: 1.9; direction: rtl; text-align: right; margin: 0; padding: 0.5em; }\n'
    + 'h1 { font-size: 1.3rem; text-align: center; margin: 1em 0 0.5em; }\n'
    + 'p { margin: 0.5em 0; }\n'
    + '.divider { text-align: center; color: #888; margin: 1em 0; direction: ltr; }\n'
    + '.header { font-size: 1.25rem; font-weight: 700; margin: 0.8em 0 0.3em; }\n'
    + '.kitab { font-weight: 600; font-size: 1.05rem; margin: 0.6em 0 0.2em; }\n'
    + '.bab { font-weight: 600; margin: 0.4em 0 0.2em; }\n'
    + '.matn { margin: 0.5em 0; }\n'
    + '.sharh { font-size: 0.9em; margin: 0.4em 0; }\n'
    + '.ms-sep { text-align: center; color: #aaa; margin: 0.8em 0; font-size: 0.6em; letter-spacing: 0.3em; direction: ltr; }\n'
    + '/* Cover */\n'
    + 'body.cover { text-align: center; padding: 2em 1em; }\n'
    + '.cover-title { font-size: 1.6rem; margin-bottom: 0.3em; }\n'
    + '.cover-ar { font-size: 1.2rem; color: #555; margin: 0.2em 0; }\n'
    + '.cover-en { font-size: 1rem; color: #888; margin: 0.2em 0; }\n'
    + '.cover-brand { font-size: 0.85rem; color: #999; margin: 2em 0 0; }\n'
    + '.cover-url { font-size: 0.75rem; color: #aaa; margin: 0.2em 0; }\n'
    + '/* Nav */\n'
    + 'nav ol { padding-right: 1.5em; }\n'
    + 'nav li { margin: 0.3em 0; }\n'
    + 'nav a { text-decoration: none; }\n';

  // ── Container.xml ──────────────────────────────────────────────
  var container = '<?xml version="1.0" encoding="UTF-8"?>'
    + '<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">'
    + '<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>'
    + '</rootfiles></container>';

  // ── Assemble ZIP ───────────────────────────────────────────────
  // mimetype MUST be first and uncompressed (store is our default)
  var zipFiles = [
    { name: "mimetype",                  data: enc.encode("application/epub+zip") },
    { name: "META-INF/container.xml",    data: enc.encode(container) },
    { name: "OEBPS/content.opf",         data: enc.encode(opf) },
    { name: "OEBPS/nav.xhtml",           data: enc.encode(nav) },
    { name: "OEBPS/cover.xhtml",         data: enc.encode(cover) },
    { name: "OEBPS/styles.css",          data: enc.encode(css) }
  ];
  for (var i = 0; i < chapters.length; i++) {
    zipFiles.push({ name: "OEBPS/" + chapters[i].id + ".xhtml", data: enc.encode(chapterHTML(chapters[i])) });
  }
  if (hasFont) {
    zipFiles.push({ name: "OEBPS/fonts/hadithmv.woff2", data: opts.fontData });
  }

  var zipped = zipStore(zipFiles);
  return new Blob([zipped], { type: "application/epub+zip" });

  // ── Chapter XHTML builder (nested helper) ──────────────────────
  function chapterHTML(ch) {
    return '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="' + lang + '"><head>'
      + '<title>' + xmlEsc(ch.title) + '</title>'
      + '<link rel="stylesheet" type="text/css" href="styles.css"/>'
      + '</head><body>'
      + '<h1>' + xmlEsc(ch.title) + '</h1>\n'
      + ch.body
      + '</body></html>';
  }
}

// ── Zero-pad helper ──────────────────────────────────────────────
function pad(n, width) {
  var s = String(n);
  while (s.length < width) s = "0" + s;
  return s;
}
