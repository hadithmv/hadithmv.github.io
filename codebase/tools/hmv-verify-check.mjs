// Verify-export battery — the Tools group's Verify link, the claim parser
// (pasted caption + URL, legacy line, verify URL), the query mode (current,
// different, unknown), the content comparison (CSV, JSON, TSV, HTML Table,
// XML, HTML Book and Word — matching and one-cell-diff fixtures), the PDF,
// PNG, EPUB and XLSX marker scans (plus the writers' own marker output), and
// LTR/page errors.
// Run: node tools/hmv-verify-check.mjs  (from codebase/, or anywhere — paths
// resolve relative to this script). Requires Node 20.11+ and Microsoft Edge.
// Env overrides: HMV_VERIFY_PORT (default 9366), HMV_VERIFY_PROFILE.
import fs from "fs";
import path from "path";
import { spawn, execSync } from "child_process";
import { pathToFileURL } from "url";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const baseDir = import.meta.dirname.replace(/\\/g, "/");
const IS_DIST = process.argv.includes("--dist");
const ROOT = baseDir + (IS_DIST ? "/../dist/books/" : "/../src/books/");
const PORT = process.env.HMV_VERIFY_PORT ? parseInt(process.env.HMV_VERIFY_PORT, 10) : 9366;
const PROFILE = process.env.HMV_VERIFY_PROFILE || process.env.TEMP + "\\hmv-verify-profile-" + Date.now();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
let checksRun = 0;
function check(name, cond, detail) {
  console.log((cond ? "PASS  " : "FAIL  ") + name + (detail !== undefined ? "   [" + String(detail).slice(0, 200) + "]" : ""));
  checksRun++;
  if (!cond) failures++;
}

const SRC_JS = path.join(import.meta.dirname, "..", "src", "js");
const { parseCSV, unparseCSV } = await import(pathToFileURL(path.join(SRC_JS, "csv.js")));
const { tIn } = await import(pathToFileURL(path.join(SRC_JS, "i18n.js")));
const { buildHtmlBook, buildWordHTML } = await import(pathToFileURL(path.join(SRC_JS, "export.js")));
const { escapeHTML } = await import(pathToFileURL(path.join(SRC_JS, "search-utils.js")));
const { insertPngText } = await import(pathToFileURL(path.join(SRC_JS, "png-text.js")));
const { zipStore } = await import(pathToFileURL(path.join(SRC_JS, "export-zip.js")));
const { readZipEntry } = await import(pathToFileURL(path.join(SRC_JS, "zip-read.js")));
const { createXLSX } = await import(pathToFileURL(path.join(SRC_JS, "export-xlsx.js")));
const DATA = baseDir + "/../data/";
const REG = parseCSV(fs.readFileSync(DATA + "03-registry-bookMeta.csv", "utf8"));
const HDR = REG.shift();
const IDX = {};
HDR.forEach((h, i) => (IDX[h] = i));
const BOOK = "HDT-muwattaMalik";
const ENTRY = REG.find((r) => r[IDX.bookCode] === BOOK);
if (!ENTRY) throw new Error("fixture book missing from the registry");
const VERSION = (ENTRY[IDX.version] || "").toLowerCase();
const TITLE = ENTRY[IDX.titleEN] || BOOK;
const APP_VERSION = tIn("appVersion", "en").replace(/ \(.*\)/, "");
const NAV_VERIFY = tIn("navVerifyTool", "dv");
const READER_URL = "https://example.test/books/reader.html?book=" + BOOK;
const CAPTION = "source: v" + VERSION + " - rows: 123";
const LEGACY_LINE = "Hadithmv " + APP_VERSION + " - book " + BOOK + " - source v" + VERSION + " - 123 rows";
const VERIFY_URL = "https://example.test/books/verify.html?book=" + BOOK + "&v=" + VERSION;

// Content-comparison fixtures: the canonical book, a matching CSV, and a
// one-cell-edited pair (CSV + HTML Book) generated with the app's own writer/
// builder, so the "diff" is a real content difference rather than formatting.
const CONTENT_ROWS = parseCSV(fs.readFileSync(DATA + "content/" + BOOK + ".csv", "utf8"));
const HEADER = CONTENT_ROWS.shift();
const DATA_ROWS = CONTENT_ROWS;
const HAS_ROWNUMS = !HEADER[0] || String(HEADER[0]).trim() === "#";
const META = {
  bookCode: BOOK,
  titleDV: ENTRY[IDX.titleDV],
  titleAR: ENTRY[IDX.titleAR],
  titleEN: ENTRY[IDX.titleEN],
};
const CSV_MATCH = unparseCSV([HEADER].concat(DATA_ROWS));
const DIFF_ROWS = DATA_ROWS.map((r) => r.slice());
let editedCell = false;
for (let r = 0; r < DIFF_ROWS.length && !editedCell; r++) {
  for (let c = HAS_ROWNUMS ? 1 : 0; c < DIFF_ROWS[r].length; c++) {
    if (DIFF_ROWS[r][c] && String(DIFF_ROWS[r][c]).trim()) {
      DIFF_ROWS[r][c] = DIFF_ROWS[r][c] + " EDITED FOR VERIFY TEST";
      editedCell = true;
      break;
    }
  }
}
if (!editedCell) throw new Error("no non-empty cell available for the content fixture");
const CSV_DIFF = unparseCSV([HEADER].concat(DIFF_ROWS));
const BOOK_CFG = { metadata: META, headerRow: HEADER, hasRowNums: HAS_ROWNUMS };
const HTML_MATCH = buildHtmlBook(
  Object.assign({ rows: DATA_ROWS }, BOOK_CFG),
  READER_URL,
  "v6.9.85",
  "Contents",
);
const HTML_DIFF = buildHtmlBook(
  Object.assign({ rows: DIFF_ROWS }, BOOK_CFG),
  READER_URL,
  "v6.9.85",
  "Contents",
);
const WORD_MATCH = buildWordHTML(
  Object.assign({ rows: DATA_ROWS }, BOOK_CFG),
  READER_URL,
  "v6.9.85",
  "Contents",
);
const WORD_DIFF = buildWordHTML(
  Object.assign({ rows: DIFF_ROWS }, BOOK_CFG),
  READER_URL,
  "v6.9.85",
  "Contents",
);

// Other structured formats: generated from the same canonical rows with the
// same shapes the export writers produce.
const JSON_MATCH = JSON.stringify([HEADER].concat(DATA_ROWS));
const JSON_DIFF = JSON.stringify([HEADER].concat(DIFF_ROWS));
function tsvFor(rows) {
  return rows
    .map((row) =>
      row
        .map((cell) =>
          String(cell == null ? "" : cell)
            .replace(/\t/g, " ")
            .replace(/\n/g, " "),
        )
        .join("\t"),
    )
    .join("\n");
}
const TSV_MATCH = tsvFor([HEADER].concat(DATA_ROWS));
const TSV_DIFF = tsvFor([HEADER].concat(DIFF_ROWS));
function tableFor(rows) {
  let html =
    '<!doctype html><html><head><meta charset="utf-8"></head><body><table><thead><tr>';
  for (const h of HEADER) html += "<th>" + escapeHTML(h || "") + "</th>";
  html += "</tr></thead><tbody>";
  for (const row of rows) {
    html += "<tr>";
    for (const cell of row) {
      const v = cell == null ? "" : String(cell).trim().replace(/\n+/g, "<br>");
      html += "<td>" + escapeHTML(v) + "</td>";
    }
    html += "</tr>";
  }
  html += "</tbody></table></body></html>";
  return html;
}
const TABLE_MATCH = tableFor(DATA_ROWS);
const TABLE_DIFF = tableFor(DIFF_ROWS);
function xmlFor(rows) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<book>\n  <rows>\n';
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    xml += '    <row id="' + (HAS_ROWNUMS ? row[0] || i + 1 : i + 1) + '">\n';
    for (let j = HAS_ROWNUMS ? 1 : 0; j < row.length; j++) {
      const v = row[j] == null ? "" : String(row[j]).trim();
      if (v) xml += "      <col" + j + ">" + escapeHTML(v) + "</col" + j + ">\n";
    }
    xml += "    </row>\n";
  }
  xml += "  </rows>\n</book>";
  return xml;
}
const XML_MATCH = xmlFor(DATA_ROWS);
const XML_DIFF = xmlFor(DIFF_ROWS);
// A minimal PDF carrying the verify link annotation + an Info dictionary —
// enough for the tolerant marker scan (no body/font/xref needed).
const PDF_MARKER = [
  "%PDF-1.4",
  "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
  "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
  "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Annots [4 0 R] >> endobj",
  "4 0 obj << /Type /Annot /Subtype /Link /Rect [0 0 100 100] /A << /S /URI /URI (" + VERIFY_URL + ") >> >> endobj",
  "5 0 obj << /Title ([Hadithmv] Test) /Producer (Skia/PDF test) >> endobj",
  "trailer << /Root 1 0 R /Info 5 0 R >>",
  "%%EOF",
].join("\n");
// A minimal PNG (signature + IEND) carrying the same marker in a tEXt chunk.
const PNG_BASE = Uint8Array.from([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
]);
const PNG_MARKER = insertPngText(
  PNG_BASE,
  "Hadithmv",
  VERIFY_URL + "&row=7\n" + CAPTION,
);
// Minimal store-only ZIPs shaped like the EPUB/XLSX exports.
const ENC = new TextEncoder();
function zipTextBytes(entries) {
  return zipStore(
    entries.map((e) => ({ name: e.name, data: ENC.encode(e.text) })),
  );
}
const EPUB_MARKER = zipTextBytes([
  { name: "mimetype", text: "application/epub+zip" },
  { name: "OEBPS/hadithmv.txt", text: VERIFY_URL + "\n" + CAPTION },
]);
const XLSX_MARKER = zipTextBytes([
  { name: "[Content_Types].xml", text: "<Types/>" },
  { name: "hadithmv.txt", text: VERIFY_URL + "\n" + CAPTION },
]);
// The app's own writers must emit the marker (the golden EPUB is captured by
// hmv-golden-capture.mjs; the XLSX writer is called directly).
const goldenEpub = fs.readFileSync(
  path.join(import.meta.dirname, "golden", "reader-epub.epub"),
);
check("EPUB export carries the marker",
  readZipEntry(goldenEpub, "hadithmv.txt").indexOf("verify.html?book=AQD-usooluSiththa") !== -1);
const xlsxBytes = new Uint8Array(
  await createXLSX([HEADER].concat(DATA_ROWS.slice(0, 3)), "Sheet1", {
    provenance: { url: VERIFY_URL, line: CAPTION },
  }).arrayBuffer(),
);
check("XLSX export carries the marker",
  readZipEntry(xlsxBytes, "hadithmv.txt").indexOf(VERIFY_URL) !== -1);

function killLeftover() {
  try {
    const out = execSync('netstat -ano | findstr ":' + PORT + '"', { encoding: "utf8" });
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      if (line.indexOf("LISTENING") !== -1) {
        const pid = line.trim().split(/\s+/).pop();
        if (pid && /^\d+$/.test(pid)) pids.add(pid);
      }
    }
    for (const pid of pids) {
      try { execSync("taskkill /PID " + pid + " /F /T", { stdio: "ignore" }); } catch (e) { /* gone */ }
    }
  } catch (e) { /* no listener */ }
}

async function main() {
  killLeftover();
  fs.rmSync(PROFILE, { recursive: true, force: true });
  const edge = spawn(EDGE, [
    "--headless=new", "--disable-gpu", "--no-first-run",
    "--allow-file-access-from-files",
    "--user-data-dir=" + PROFILE,
    "--remote-debugging-port=" + PORT,
    "about:blank",
  ], { stdio: "ignore" });

  try {
    let target = null;
    for (let i = 0; i < 60; i++) {
      try {
        const list = JSON.parse(await (await fetch("http://127.0.0.1:" + PORT + "/json")).text());
        target = list.find((t) => t.type === "page");
        if (target) break;
      } catch (e) { /* not up yet */ }
      await sleep(200);
    }
    if (!target) { console.log("NO_TARGET"); return; }

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let id = 0;
    const pending = new Map();
    const pageErrors = [];
    ws.onmessage = (ev) => {
      const mm = JSON.parse(ev.data);
      if (mm.id && pending.has(mm.id)) { pending.get(mm.id)(mm); pending.delete(mm.id); }
      if (mm.method === "Runtime.exceptionThrown") {
        pageErrors.push((mm.params.exceptionDetails.exception && mm.params.exceptionDetails.exception.description || mm.params.exceptionDetails.text || "?").split("\n")[0]);
      }
      if (mm.method === "Runtime.consoleAPICalled" && mm.params.type === "error") {
        pageErrors.push("console.error: " + mm.params.args.map((a) => a.value || a.description || "").join(" ").slice(0, 200));
      }
    };
    await new Promise((r) => (ws.onopen = r));
    const send = (method, params = {}) =>
      new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
    await send("Runtime.enable");

    async function evalJS(expr) {
      const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
      if (r.result && r.result.exceptionDetails) {
        const d = r.result.exceptionDetails.exception;
        throw new Error("EXC: " + (d && d.description ? d.description : r.result.exceptionDetails.text));
      }
      return r.result.result.value;
    }
    async function waitFor(expr, timeoutMs = 15000) {
      const t0 = Date.now();
      while (Date.now() - t0 < timeoutMs) {
        if (await evalJS(expr)) return true;
        await sleep(150);
      }
      return false;
    }
    async function goto(url, width, height) {
      await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
      await send("Page.navigate", { url });
      await evalJS(`new Promise((res) => {
        const t0 = Date.now();
        (function poll() {
          if (document.readyState === 'complete' && document.body && document.body.children.length > 2) return res(true);
          if (Date.now() - t0 > 20000) return res(false);
          setTimeout(poll, 100);
        })();
      })`);
      await sleep(300);
      await send("Page.bringToFront").catch(function () {});
      await sleep(300);
    }
    const setInput = (v) => evalJS(`(function () {
      var el = document.getElementById('verifyInput');
      el.value = ${JSON.stringify(v)};
      el.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    const uploadText = (text, name) => evalJS(`(function () {
      var dt = new DataTransfer();
      dt.items.add(new File([${JSON.stringify(text)}], ${JSON.stringify(name)}, { type: "text/plain" }));
      var el = document.getElementById('verifyFile');
      el.files = dt.files;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    const uploadBytes = (bytes, name) => evalJS(`(function () {
      var arr = ${JSON.stringify(Array.from(bytes))};
      var dt = new DataTransfer();
      dt.items.add(new File([new Uint8Array(arr)], ${JSON.stringify(name)}, { type: "image/png" }));
      var el = document.getElementById('verifyFile');
      el.files = dt.files;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    async function checkFormat(label, matchText, diffText, ext) {
      await uploadText(matchText, "match." + ext);
      check(label + " content matches the canonical text",
        await waitFor(`document.querySelector('#verifyContent .verify-status.ok') !== null && document.getElementById('verifyContent').textContent.indexOf('Content match') !== -1`, 60000),
        await evalJS(`document.getElementById('verifyContent').textContent.slice(0, 160)`));
      await uploadText(diffText, "diff." + ext);
      check(label + " content difference is reported",
        await waitFor(`document.querySelector('#verifyContent .verify-status.bad') !== null`, 60000),
        await evalJS(`document.getElementById('verifyContent').textContent.slice(0, 160)`));
    }
    const verifyURL = pathToFileURL(ROOT + "verify.html").href;

    // ── Sidebar: Verify link inside the collapsed Tools group ──
    await goto(pathToFileURL(ROOT + "index.html").href, 1280, 900);
    const side = await evalJS(`(function () {
      var d = document.querySelector('details.sidebar-tools');
      var a = d ? d.querySelector('a[href="verify.html"]') : null;
      return d && a ? { href: a.getAttribute('href'), text: a.textContent.trim(), open: d.open } : null;
    })()`);
    check("sidebar Tools group carries the Verify link (current language)",
      side && side.href === "verify.html" && side.text.indexOf(NAV_VERIFY) !== -1 && side.open === false,
      side ? JSON.stringify(side) : "missing");
    await evalJS(`document.querySelector('details.sidebar-tools summary').click()`);
    await waitFor(`document.querySelector('details.sidebar-tools').open === true`);
    await evalJS(`document.querySelector('a[href="verify.html"]').click()`);
    check("sidebar Verify link opens verify.html", await waitFor(`location.pathname.endsWith("/verify.html")`), await evalJS("location.pathname"));
    check("verify page starts empty", await waitFor(`document.documentElement.getAttribute('data-verify-ready') === '1' && document.querySelector('.verify-empty') !== null && document.querySelector('.verify-status') === null`));

    pageErrors.length = 0;
    const dir = await evalJS(`getComputedStyle(document.body).direction`);
    check("verify page is LTR", dir === "ltr", dir);

    // ── Paste: the title-page URL + caption, a verify URL, a legacy line,
    //    and the caption alone ──
    await setInput(READER_URL + "\n" + CAPTION);
    check("title-page paste is parsed", await waitFor(`document.querySelector('.verify-status.ok') !== null`),
      await evalJS(`document.getElementById('verifyResult').textContent.slice(0, 160)`));
    const claimText = await evalJS(`document.getElementById('verifyResult').textContent`);
    check("claim shows the book title and rows", claimText.indexOf(TITLE) !== -1 && claimText.indexOf("123") !== -1, claimText.slice(0, 160));
    await setInput(VERIFY_URL);
    check("pasted verify URL is parsed", await waitFor(`document.querySelector('.verify-dl') !== null && document.getElementById('verifyResult').textContent.indexOf(${JSON.stringify("v" + VERSION)}) !== -1`),
      await evalJS(`document.getElementById('verifyResult').textContent.slice(0, 160)`));
    await setInput(LEGACY_LINE);
    check("legacy full line still parses", await waitFor(`document.querySelector('.verify-status.ok') !== null`),
      await evalJS(`document.getElementById('verifyResult').textContent.slice(0, 160)`));
    await setInput(CAPTION);
    check("caption alone identifies the current book",
      await waitFor(`document.querySelector('.verify-status.ok') !== null && document.getElementById('verifyResult').textContent.indexOf(${JSON.stringify(TITLE)}) !== -1`),
      await evalJS(`document.getElementById('verifyResult').textContent.slice(0, 160)`));
    await setInput("source: v000000000000 - rows: 123");
    check("caption with an unknown version asks for the URL",
      await waitFor(`document.querySelector('.verify-status.warn') !== null && document.getElementById('verifyResult').textContent.indexOf('Could not identify the book from source') !== -1`),
      await evalJS(`document.getElementById('verifyResult').textContent.slice(0, 160)`));

    // ── Query mode: current, different, unknown ──
    await goto(verifyURL + "?book=" + encodeURIComponent(BOOK) + "&v=" + VERSION, 1280, 900);
    check("query link reports the current version", await waitFor(`document.querySelector('.verify-status.ok') !== null`),
      await evalJS(`document.getElementById('verifyResult').textContent.slice(0, 160)`));
    check("query result names the book", (await evalJS(`document.getElementById('verifyResult').textContent`)).indexOf(TITLE) !== -1);
    await goto(verifyURL + "?book=" + encodeURIComponent(BOOK) + "&v=000000000000", 1280, 900);
    check("a different version warns", await waitFor(`document.querySelector('.verify-status.warn') !== null`),
      await evalJS(`document.getElementById('verifyResult').textContent.slice(0, 160)`));
    await goto(verifyURL + "?book=NO-suchBook&v=000000000000", 1280, 900);
    check("an unknown book is rejected", await waitFor(`document.querySelector('.verify-status.bad') !== null`),
      await evalJS(`document.getElementById('verifyResult').textContent.slice(0, 160)`));

    // ── Content comparison: CSV + HTML Book, match and one-cell diff ──
    await goto(verifyURL, 1280, 900);
    await evalJS(`(function () {
      var el = document.getElementById('verifyBook');
      el.value = ${JSON.stringify(BOOK)};
      el.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    await uploadText(CSV_MATCH, "match.csv");
    check("CSV content matches the canonical text", await waitFor(`document.querySelector('#verifyContent .verify-status.ok') !== null`, 60000),
      await evalJS(`document.getElementById('verifyContent').textContent.slice(0, 160)`));
    await uploadText(CSV_DIFF, "diff.csv");
    check("CSV content difference is reported", await waitFor(`document.querySelector('#verifyContent .verify-status.bad') !== null`, 60000),
      await evalJS(`document.getElementById('verifyContent').textContent.slice(0, 160)`));
    check("CSV diff names the edited value", (await evalJS(`document.getElementById('verifyContent').textContent`)).indexOf("EDITED FOR VERIFY TEST") !== -1);
    await uploadText(HTML_MATCH, "match.html");
    check("HTML Book content matches the canonical text", await waitFor(`document.querySelector('#verifyContent .verify-status.ok') !== null && document.getElementById('verifyContent').textContent.indexOf('Content match') !== -1`, 60000),
      await evalJS(`document.getElementById('verifyContent').textContent.slice(0, 160)`));
    await uploadText(HTML_DIFF, "diff.html");
    check("HTML Book content difference is reported", await waitFor(`document.querySelector('#verifyContent .verify-status.bad') !== null`, 60000),
      await evalJS(`document.getElementById('verifyContent').textContent.slice(0, 160)`));
    await uploadText(WORD_MATCH, "match.doc");
    check("Word content matches the canonical text", await waitFor(`document.querySelector('#verifyContent .verify-status.ok') !== null && document.getElementById('verifyContent').textContent.indexOf('Content match') !== -1`, 60000),
      await evalJS(`document.getElementById('verifyContent').textContent.slice(0, 160)`));
    await uploadText(WORD_DIFF, "diff.doc");
    check("Word content difference is reported", await waitFor(`document.querySelector('#verifyContent .verify-status.bad') !== null`, 60000),
      await evalJS(`document.getElementById('verifyContent').textContent.slice(0, 160)`));
    await uploadText("A plain note without provenance.\nSecond line.", "notes.txt");
    check("unsupported content formats are stated", await waitFor(`document.querySelector('#verifyContent .verify-status.warn') !== null && document.getElementById('verifyContent').textContent.indexOf("isn't available for this format") !== -1`, 15000),
      await evalJS(`document.getElementById('verifyContent').textContent.slice(0, 160)`));

    await checkFormat("JSON", JSON_MATCH, JSON_DIFF, "json");
    await checkFormat("TSV", TSV_MATCH, TSV_DIFF, "tsv");
    await checkFormat("HTML Table", TABLE_MATCH, TABLE_DIFF, "html");
    await checkFormat("XML", XML_MATCH, XML_DIFF, "xml");

    await uploadText(PDF_MARKER, "marker.pdf");
    check("PDF marker is found and the claim checked",
      await waitFor(`document.querySelector('#verifyResult .verify-status.ok') !== null`, 15000),
      await evalJS(`document.getElementById('verifyResult').textContent.slice(0, 160)`));
    check("PDF body is reported as uninspected",
      await waitFor(`document.querySelector('#verifyContent .verify-status.warn') !== null && document.getElementById('verifyContent').textContent.indexOf('PDF body is not inspected') !== -1`, 15000),
      await evalJS(`document.getElementById('verifyContent').textContent.slice(0, 160)`));
    await uploadBytes(PNG_MARKER, "marker.png");
    check("PNG marker is found and the claim checked",
      await waitFor(`document.querySelector('#verifyResult .verify-status.ok') !== null`, 15000),
      await evalJS(`document.getElementById('verifyResult').textContent.slice(0, 160)`));
    check("PNG image is reported as uninspected",
      await waitFor(`document.querySelector('#verifyContent .verify-status.warn') !== null && document.getElementById('verifyContent').textContent.indexOf('image content is not inspected') !== -1`, 15000),
      await evalJS(`document.getElementById('verifyContent').textContent.slice(0, 160)`));
    await uploadBytes(EPUB_MARKER, "marker.epub");
    check("EPUB marker is found and the claim checked",
      await waitFor(`document.querySelector('#verifyResult .verify-status.ok') !== null && document.getElementById('verifyContent').textContent.indexOf('not inspected') !== -1`, 15000),
      await evalJS(`document.getElementById('verifyResult').textContent.slice(0, 160)`));
    await uploadBytes(XLSX_MARKER, "marker.xlsx");
    check("XLSX marker is found and the claim checked",
      await waitFor(`document.querySelector('#verifyResult .verify-status.ok') !== null && document.getElementById('verifyContent').textContent.indexOf('not inspected') !== -1`, 15000),
      await evalJS(`document.getElementById('verifyResult').textContent.slice(0, 160)`));

    check("verify page logs no errors", pageErrors.length === 0, pageErrors.join(" | "));

    console.log("\n== " + (checksRun - failures) + " / " + checksRun + " checks passed ==");
    console.log(failures ? "== FAIL ==" : "== ALL PASS ==");
  } finally {
    try { edge.kill(); } catch (e) { /* gone */ }
    await sleep(500);
    try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) { /* Edge may still hold it */ }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
