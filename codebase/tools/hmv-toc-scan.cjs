// TOC freshness scan for reader.js: every TOC entry must match a #region
// whose start line == entry start and whose end == last non-empty line
// before the region's #endregion.
// Run: node tools/hmv-toc-scan.cjs [path-to-js-file]  (default: ../js/reader.js
// relative to this script, so it works from any cwd).
const fs = require("fs");
const path = require("path");
const target = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, "..", "js", "reader.js");
const lines = fs.readFileSync(target, "utf8").split(/\r?\n/);

const toc = [];
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^\s*\/\/\s+(.+?)\s+L(\d+)-(\d+)/);
  if (m) toc.push({ text: m[1].trim(), start: +m[2], end: +m[3], line: i + 1 });
}

const regions = [];
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^\s*\/\/\s*#region\s+(.+)$/);
  if (m) regions.push({ text: m[1].trim(), start: i + 1 });
}
const endRe = /^\s*\/\/\s*#endregion/;
function regionEnd(idx) {
  for (let j = regions[idx].start + 1; j < lines.length; j++) {
    if (endRe.test(lines[j])) {
      let k = j - 1;
      while (k >= 0 && lines[k].trim() === "") k--;
      return { end: k + 1, endMarker: j + 1 };
    }
  }
  return null;
}

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
let missing = 0, fake = 0, offStart = 0, offEnd = 0;
const tocNorm = new Set(toc.map((t) => norm(t.text)));

for (let i = 0; i < regions.length; i++) {
  const r = regions[i];
  const e = regionEnd(i);
  const entry = toc.find((t) => norm(t.text) === norm(r.text));
  if (!entry) { console.log("MISSING TOC entry for region: " + r.text + " @" + r.start); missing++; continue; }
  if (entry.start !== r.start) { console.log("OFF-START: " + r.text + " toc=" + entry.start + " file=" + r.start); offStart++; }
  if (entry.end !== e.end) { console.log("OFF-END: " + r.text + " toc=" + entry.end + " file=" + e.end); offEnd++; }
}
for (const t of toc) {
  if (!regions.some((r) => norm(r.text) === norm(t.text))) { console.log("FAKE entry (no region): " + t.text + " @" + t.line); fake++; }
}
console.log("---");
console.log("regions=" + regions.length + " toc=" + toc.length + " missing=" + missing + " fake=" + fake + " offStart=" + offStart + " offEnd=" + offEnd);
