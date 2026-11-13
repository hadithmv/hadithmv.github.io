#!/usr/bin/env node
/**
 * Hadithmv integrity check — the files and structures that must never change
 * silently.
 *
 *   node tools/hmv-integrity-check.mjs            verify against the baseline
 *   node tools/hmv-integrity-check.mjs --update   re-bless the current state
 *   node tools/hmv-integrity-check.mjs --help
 *
 * Two layers:
 *
 *  - FROZEN (FAIL when changed): full SHA-256 baselines for the canonical
 *    Quran text (QRN-DATA-ayahImlai / ayahUthmani), the Quran structure
 *    registries (surahs, juz, the QRN column map) and the tag registry (its
 *    row order assigns the palette slots). A mismatch is never routine:
 *    revert it, or accept it deliberately with --update — the baseline diff
 *    in git is the audit trail.
 *
 *  - BOOKS: every book's data-row count plus a prefix hash (header + first
 *    N rows when the baseline was written). An append keeps the prefix and
 *    is INFO; an insert or delete inside the old range moves every later
 *    position (pins, history, ?row= links) — WARN for ordinary books, FAIL
 *    for QRN books, whose rows merge into the 6,236-slot skeleton by row
 *    index, so one shifted row puts translations under the wrong ayahs.
 *    Editing cells, filling empty rows and appending chapters trigger
 *    nothing. Same-count edits in ordinary books are not detectable by
 *    design (git review is their record).
 *
 * Plus structural invariants (Quran math, QRN-DATA shape, registry ↔ file ↔
 * version consistency, CSV hygiene) and search-index freshness (the index
 * manifest's per-book source versions vs the files on disk).
 *
 * Severities: FAIL exits 1; WARN is printed but exits 0; INFO records routine
 * events (appends, new books) until --update records them.
 *
 * Hashes and versions describe the LF bytes GitHub Pages serves: CRLF pairs
 * are converted to LF first, byte-level, exactly like 04-update-bookRegistry
 * .ps1 (bare CRs inside quoted fields are data and stay).
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { parseCSV } from "../src/js/csv.js";
import {
  contentVersionBytes,
  normalizeLineEndings,
} from "./hmv-content-version.mjs";

const HELP = `Hadithmv integrity check

  node tools/hmv-integrity-check.mjs            verify the repo against the baseline
  node tools/hmv-integrity-check.mjs --update   record the current state as the new baseline
  node tools/hmv-integrity-check.mjs --help     this text

Exit code 0 = no failures (warnings/info may still be printed), 1 = failures.
The baseline lives at data/integrity-baseline.json and is committed: a line
changing there is the deliberate acknowledgement of a frozen change.`;

const TOOLS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(TOOLS);
const DATA = path.join(ROOT, "data");
const CONTENT = path.join(DATA, "content");
const BASELINE = path.join(DATA, "integrity-baseline.json");

// Files whose bytes are the product's ground truth. See the header comment.
const FROZEN = [
  "data/content/QRN-DATA-ayahImlai.csv",
  "data/content/QRN-DATA-ayahUthmani.csv",
  "data/01-registry-bookTags.csv",
  "data/05-registry-quranSurahs.csv",
  "data/06-registry-quranJuz.csv",
  "data/07-registry-quranColumns.csv",
];

// Registered books assembled in memory at load (no content CSV). Mirrors the
// PS1's $virtualBooks and src/js/radheef-merge.js — keep the three in sync.
const VIRTUAL_BOOKS = new Set(["RDF-all"]);

const QRN_DATA = [
  { code: "QRN-DATA-ayahImlai", header: "ayahImlai" },
  { code: "QRN-DATA-ayahUthmani", header: "ayahUthmani" },
];

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(HELP);
  process.exit(0);
}
const unknown = args.filter((a) => a !== "--update");
if (unknown.length) {
  console.error("Unknown argument(s): " + unknown.join(" "));
  console.error("Run with --help for usage.");
  process.exit(2);
}
const UPDATE = args.includes("--update");

// ── Shared helpers ───────────────────────────────────────────

let failures = 0;
let warnings = 0;
let infos = 0;

function pass(msg) {
  console.log("PASS  " + msg);
}
function fail(msg, detail) {
  failures++;
  console.log("FAIL  " + msg + (detail ? "  [" + detail + "]" : ""));
}
function warn(msg, detail) {
  warnings++;
  console.log("WARN  " + msg + (detail ? "  [" + detail + "]" : ""));
}
function note(msg, detail) {
  infos++;
  console.log("INFO  " + msg + (detail ? "  [" + detail + "]" : ""));
}
function section(name) {
  console.log("\n== " + name + " ==");
}
function fmt(n) {
  return Number(n).toLocaleString("en-US");
}
function relPathOf(absPath) {
  return path.relative(ROOT, absPath).split(path.sep).join("/");
}

function readCSV(filePath) {
  return parseCSV(fs.readFileSync(filePath, "utf8"));
}

function loadRegistry() {
  const rows = readCSV(path.join(DATA, "03-registry-bookMeta.csv"));
  const header = rows[0];
  const codeIdx = header.indexOf("bookCode");
  const verIdx = header.indexOf("version");
  const exclIdx = header.indexOf("excludeFromIndex");
  const entries = [];
  for (const row of rows.slice(1)) {
    const code = (row[codeIdx] || "").trim();
    if (!code) continue;
    entries.push({
      code: code,
      version: verIdx === -1 ? "" : (row[verIdx] || "").trim(),
      exclude: exclIdx === -1 ? "" : (row[exclIdx] || "").trim(),
    });
  }
  return entries;
}

// Parsed book cache — parsing all 82 books is the expensive part.
const _bookInfo = new Map();
function bookInfo(code) {
  if (_bookInfo.has(code)) return _bookInfo.get(code);
  const file = path.join(CONTENT, code + ".csv");
  let info = null;
  if (fs.existsSync(file)) {
    const buf = fs.readFileSync(file);
    // Same parse the app uses: QRN books keep empty rows (untranslated ayah
    // slots); ordinary books drop blank lines.
    const rows = parseCSV(buf.toString("utf8"), code.indexOf("QRN-") === 0);
    const width = rows[0] ? rows[0].length : 0;
    let ragged = 0;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].length !== width) ragged++;
    }
    info = {
      code: code,
      file: file,
      rows: rows,
      width: width,
      ragged: ragged,
      dataRows: Math.max(0, rows.length - 1),
      version: contentVersionBytes(buf),
    };
  }
  _bookInfo.set(code, info);
  return info;
}

function frozenHash(filePath) {
  return crypto
    .createHash("sha256")
    .update(normalizeLineEndings(fs.readFileSync(filePath)))
    .digest("hex");
}

function prefixHash(rows, dataRows) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(rows.slice(0, dataRows + 1)), "utf8")
    .digest("hex");
}

function readBaseline() {
  try {
    return JSON.parse(fs.readFileSync(BASELINE, "utf8"));
  } catch (e) {
    return null;
  }
}

function writeBaseline(frozen, books) {
  const sortedFrozen = {};
  for (const k of Object.keys(frozen).sort()) sortedFrozen[k] = frozen[k];
  const sortedBooks = {};
  for (const k of Object.keys(books).sort()) sortedBooks[k] = books[k];
  const out = {
    note:
      "Hadithmv integrity baseline. Frozen entries are full SHA-256 of the " +
      "LF bytes GitHub Pages serves; books carry data-row counts plus a " +
      "prefix hash (header + first N rows). Regenerate deliberately with: " +
      "node tools/hmv-integrity-check.mjs --update",
    version: 1,
    frozen: sortedFrozen,
    books: sortedBooks,
  };
  fs.writeFileSync(BASELINE, JSON.stringify(out, null, 2) + "\n", "utf8");
}

// ── --update ─────────────────────────────────────────────────

function runUpdate() {
  console.log("Hadithmv integrity baseline update");
  const old = readBaseline();

  const frozen = {};
  for (const relPath of FROZEN) {
    const abs = path.join(ROOT, relPath);
    if (!fs.existsSync(abs)) {
      console.log("MISSING  frozen  " + relPath + "  (not recorded — the check will fail until it returns)");
      continue;
    }
    frozen[relPath] = frozenHash(abs);
  }

  const books = {};
  const registry = loadRegistry();
  for (const entry of registry) {
    const info = bookInfo(entry.code);
    if (!info) continue;
    books[entry.code] = {
      rows: info.dataRows,
      prefix: prefixHash(info.rows, info.dataRows),
    };
  }

  let changed = 0;
  const oldFrozen = (old && old.frozen) || {};
  for (const k of Object.keys(frozen)) {
    if (!(k in oldFrozen)) {
      console.log("ADDED    frozen  " + k);
      changed++;
    } else if (oldFrozen[k] !== frozen[k]) {
      console.log(
        "CHANGED  frozen  " + k + "  " +
        oldFrozen[k].slice(0, 12) + "… → " + frozen[k].slice(0, 12) + "…",
      );
      changed++;
    }
  }
  for (const k of Object.keys(oldFrozen)) {
    if (!(k in frozen)) {
      console.log("REMOVED  frozen  " + k);
      changed++;
    }
  }

  const oldBooks = (old && old.books) || {};
  for (const k of Object.keys(books)) {
    const nb = books[k];
    const ob = oldBooks[k];
    if (!ob) {
      console.log("ADDED    book    " + k + "  (" + fmt(nb.rows) + " rows)");
      changed++;
    } else if (ob.rows !== nb.rows) {
      console.log("CHANGED  book    " + k + "  rows " + fmt(ob.rows) + " → " + fmt(nb.rows));
      changed++;
    } else if (ob.prefix !== nb.prefix) {
      console.log("CHANGED  book    " + k + "  (content within the baseline rows)");
      changed++;
    }
  }
  for (const k of Object.keys(oldBooks)) {
    if (!(k in books)) {
      console.log("REMOVED  book    " + k);
      changed++;
    }
  }

  writeBaseline(frozen, books);
  console.log("");
  console.log(changed ? changed + " baseline change(s) written." : "Baseline already current.");
  console.log(
    "Wrote " + relPathOf(BASELINE) +
    " — review the diff before committing; it is the audit trail.",
  );
  process.exit(0);
}

// ── Check ────────────────────────────────────────────────────

function runCheck() {
  console.log("Hadithmv integrity check");
  const baseline = readBaseline();
  if (!baseline) {
    console.log("Baseline: data/integrity-baseline.json (missing)");
  } else {
    console.log("Baseline: data/integrity-baseline.json");
  }

  // ── Frozen content ──
  section("Frozen content");
  if (!baseline) {
    fail("no baseline", "run node tools/hmv-integrity-check.mjs --update to create it");
  } else {
    for (const relPath of FROZEN) {
      const abs = path.join(ROOT, relPath);
      if (!fs.existsSync(abs)) {
        fail(relPath + ": missing", "a frozen file cannot be deleted silently");
        continue;
      }
      const expected = baseline.frozen && baseline.frozen[relPath];
      if (!expected) {
        warn(relPath + ": not in the baseline", "run --update to record it");
        continue;
      }
      const got = frozenHash(abs);
      if (got === expected) {
        pass(relPath);
      } else {
        fail(
          relPath + ": changed since the baseline",
          expected.slice(0, 12) + "… → " + got.slice(0, 12) +
          "… if intentional: --update",
        );
      }
    }
  }

  // ── Quran structure ──
  section("Quran structure");
  const surahPath = path.join(DATA, "05-registry-quranSurahs.csv");
  const juzPath = path.join(DATA, "06-registry-quranJuz.csv");
  let surahRows = [];
  let surahCounts = [];
  if (!fs.existsSync(surahPath)) {
    fail("05-registry-quranSurahs.csv: missing");
  } else {
    const rows = readCSV(surahPath).slice(1);
    const issues = [];
    let ayahSum = 0;
    rows.forEach((r, i) => {
      if ((r[0] || "").trim() !== String(i + 1)) {
        issues.push("row " + (i + 2) + ": surahNo " + JSON.stringify(r[0]) + " ≠ " + (i + 1));
      }
      const n = parseInt(r[4], 10);
      if (!isFinite(n) || n <= 0) {
        issues.push("surah " + (i + 1) + ": invalid ayahCount " + JSON.stringify(r[4]));
        surahCounts.push(0);
      } else {
        ayahSum += n;
        surahCounts.push(n);
      }
    });
    if (rows.length !== 114) issues.push(rows.length + " surah rows, expected 114");
    if (ayahSum !== 6236) issues.push("ayah counts sum to " + fmt(ayahSum) + ", expected 6,236");
    surahRows = rows;
    if (issues.length) {
      fail("surah registry", issues.slice(0, 4).join("; ") + (issues.length > 4 ? " …" : ""));
    } else {
      pass("surah registry: 114 surahs, ayah counts sum to 6,236");
    }
  }

  if (!fs.existsSync(juzPath)) {
    fail("06-registry-quranJuz.csv: missing");
  } else {
    const rows = readCSV(juzPath).slice(1);
    const issues = [];
    let prevAbs = -1;
    rows.forEach((r, i) => {
      const no = parseInt(r[0], 10);
      const s = parseInt(r[1], 10);
      const a = parseInt(r[2], 10);
      if (no !== i + 1) issues.push("row " + (i + 2) + ": juzNo " + r[0] + " ≠ " + (i + 1));
      if (!(s >= 1 && s <= surahRows.length)) {
        issues.push("juz " + (i + 1) + ": invalid surah " + r[1]);
        return;
      }
      const count = surahCounts[s - 1] || 0;
      if (!(a >= 1 && a <= count)) {
        issues.push("juz " + (i + 1) + ": ayah " + r[2] + " outside surah " + s);
        return;
      }
      let abs = 0;
      for (let k = 0; k < s - 1; k++) abs += surahCounts[k];
      abs += a - 1;
      if (abs <= prevAbs) issues.push("juz " + (i + 1) + ": start is not after juz " + i);
      prevAbs = abs;
    });
    if (rows.length !== 30) issues.push(rows.length + " juz rows, expected 30");
    if (issues.length) {
      fail("juz registry", issues.slice(0, 4).join("; ") + (issues.length > 4 ? " …" : ""));
    } else {
      pass("juz registry: 30 ordered starts across the 6,236 ayahs");
    }
  }

  for (const target of QRN_DATA) {
    const info = bookInfo(target.code);
    if (!info) {
      fail(target.code + ": no content file");
      continue;
    }
    const issues = [];
    const header = (info.rows[0] || [])[0];
    if (header !== target.header) {
      issues.push("header " + JSON.stringify(header) + " ≠ " + JSON.stringify(target.header));
    }
    if (info.width !== 1) issues.push(info.width + " columns, expected 1");
    if (info.dataRows !== 6236) issues.push(fmt(info.dataRows) + " rows, expected 6,236");
    let empties = 0;
    let firstEmpty = -1;
    for (let i = 1; i < info.rows.length; i++) {
      for (const cell of info.rows[i]) {
        if (!String(cell).trim()) {
          empties++;
          if (firstEmpty < 0) firstEmpty = i;
        }
      }
    }
    if (empties) issues.push(empties + " empty cell(s), first at data row " + firstEmpty);
    if (issues.length) fail(target.code, issues.join("; "));
    else pass(target.code + ": 6,236 rows, no empty cells");
  }

  const colPath = path.join(DATA, "07-registry-quranColumns.csv");
  if (!fs.existsSync(colPath)) {
    fail("07-registry-quranColumns.csv: missing");
  } else {
    const rows = readCSV(colPath).slice(1);
    const issues = [];
    let resolved = 0;
    for (const r of rows) {
      const src = (r[0] || "").trim();
      const idx = parseInt(r[1], 10);
      if (!src) {
        issues.push("a row has an empty sourceBook");
        continue;
      }
      if (!Number.isInteger(idx) || idx < 0) {
        issues.push(src + ": invalid sourceCol " + JSON.stringify(r[1]));
        continue;
      }
      if (src === "QRN-BASE-STRUCT") {
        if (idx > 4) issues.push(src + ": sourceCol " + idx + " beyond the 5 base columns");
        else resolved++;
        continue;
      }
      const info = bookInfo(src);
      if (!info) {
        issues.push(src + ": no content file");
        continue;
      }
      if (idx >= info.width) issues.push(src + ": sourceCol " + idx + " ≥ " + info.width + " columns");
      else resolved++;
    }
    if (issues.length) warn("column registry", issues.join("; "));
    else pass("column registry: " + resolved + " mappings resolve to real columns");
  }

  // ── Book row counts ──
  section("Book row counts");
  const registry = loadRegistry();
  const registryCodes = new Set();
  let matchedBooks = 0;
  for (const entry of registry) {
    const code = entry.code;
    registryCodes.add(code);
    if (VIRTUAL_BOOKS.has(code)) continue;
    const info = bookInfo(code);
    if (!info) {
      warn("registered book has no content file: " + code, "add the file or remove the registry row");
      continue;
    }
    if (info.ragged) {
      warn(code + ": " + info.ragged + " row(s) do not match the " + info.width + "-column header", "ragged rows break column mapping");
    }
    const isQrn = code.indexOf("QRN-") === 0;
    if (isQrn && info.dataRows > 6236) {
      fail(code + ": " + fmt(info.dataRows) + " rows, beyond the 6,236-ayah skeleton", "rows past the base are dropped and the merge misaligns");
      continue;
    }
    const relPath = "data/content/" + code + ".csv";
    if (FROZEN.indexOf(relPath) !== -1) continue; // the frozen hash covers it
    if (!baseline) continue;
    const old = baseline.books && baseline.books[code];
    if (!old) {
      note(code + ": new book (" + fmt(info.dataRows) + " rows) not in the baseline", "--update to record it");
      continue;
    }
    if (info.dataRows === old.rows) {
      matchedBooks++;
      continue;
    }
    const grew = info.dataRows > old.rows;
    const appendOnly = grew && prefixHash(info.rows, old.rows) === old.prefix;
    const msg = code + ": rows " + fmt(old.rows) + " → " + fmt(info.dataRows);
    if (appendOnly) {
      note(msg + " (append-only — existing rows unchanged)", "--update to record the new count");
    } else if (isQrn) {
      fail(
        msg + (grew ? " with changes inside the old rows" : " (rows removed)"),
        "QRN rows merge by position — translations may now sit under the wrong ayahs; inspect, then --update if intended",
      );
    } else {
      warn(
        msg + (grew ? " with changes inside the old rows" : " (rows removed)"),
        "pins, history and ?row= links after the change may point elsewhere",
      );
    }
  }
  if (matchedBooks) pass(fmt(matchedBooks) + " books match their baseline row counts");
  if (baseline && baseline.books) {
    for (const code of Object.keys(baseline.books)) {
      if (!registryCodes.has(code)) {
        note(code + ": in the baseline but no longer registered", "--update to drop it");
      }
    }
  }

  // ── CSV hygiene ──
  section("CSV hygiene");
  const contentFiles = fs
    .readdirSync(CONTENT)
    .filter((f) => f.endsWith(".csv"))
    .sort();
  let hygieneIssues = 0;
  for (const f of contentFiles) {
    const where = "data/content/" + f;
    const buf = fs.readFileSync(path.join(CONTENT, f));
    if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
      warn(where + ": UTF-8 BOM", "data files are BOM-less UTF-8");
      hygieneIssues++;
    }
    if (buf.toString("latin1").indexOf("\r\n") !== -1) {
      warn(where + ": CRLF line endings", "data files are LF (the registry hashes the LF bytes)");
      hygieneIssues++;
    }
    if (buf.length && buf[buf.length - 1] === 10) {
      warn(where + ": trailing newline", "data files end without a newline");
      hygieneIssues++;
    }
  }
  if (!hygieneIssues) {
    pass(contentFiles.length + " content files clean (no BOM, LF, no trailing newline)");
  }

  // ── Registry consistency ──
  section("Registry consistency");
  let versionsMatched = 0;
  for (const entry of registry) {
    if (VIRTUAL_BOOKS.has(entry.code)) continue;
    const info = bookInfo(entry.code);
    if (!info) continue; // already warned above
    if (!/^[0-9a-f]{12}$/.test(entry.version)) {
      warn(entry.code + ": registry version " + JSON.stringify(entry.version) + " is not 12 lowercase hex", "run option 4 (Refresh book data)");
      continue;
    }
    if (entry.version !== info.version) {
      warn(entry.code + ": registry version " + entry.version + " but the file hashes to " + info.version, "run option 4 (Refresh book data)");
      continue;
    }
    versionsMatched++;
  }
  if (versionsMatched) pass(fmt(versionsMatched) + " registry versions match their content files");
  for (const f of contentFiles) {
    const code = f.slice(0, -4);
    if (!registryCodes.has(code)) {
      warn("data/content/" + f + " is not registered", "invisible to the app — run option 4");
    }
  }

  // ── Search index ──
  section("Search index");
  const manifestPath = path.join(DATA, "search-index-manifest.json");
  let meta = null;
  if (!fs.existsSync(manifestPath)) {
    warn("search index: manifest missing", "run the index rebuild (option 2)");
  } else {
    try {
      meta = JSON.parse(fs.readFileSync(manifestPath, "utf8")).meta;
    } catch (e) {
      warn("search index: manifest is not valid JSON", "rebuild it (option 2)");
    }
  }
  if (meta && !meta.shards) {
    warn("search index: manifest has no shards map", "rebuild it (option 2)");
    meta = null;
  }
  if (meta) {
    // The manifest's per-shard hashes are the client's cache-busting contract:
    // every shard file on disk must be byte-for-byte the one it describes.
    // A partial copy or a manually reverted shard cannot hide behind fresh
    // source stamps.
    const shardDir = path.join(DATA, "search-index");
    let shardIssues = 0;
    let shardsChecked = 0;
    for (const code of Object.keys(meta.shards)) {
      const file = path.join(shardDir, code + ".json");
      if (!fs.existsSync(file)) {
        fail(code + ": shard file missing", "rebuild the index (option 2)");
        shardIssues++;
        continue;
      }
      const got = crypto
        .createHash("sha256")
        .update(fs.readFileSync(file))
        .digest("hex")
        .slice(0, 16);
      if (got !== meta.shards[code]) {
        fail(code + ": shard file does not match the manifest hash", "rebuild the index (option 2)");
        shardIssues++;
      } else {
        shardsChecked++;
      }
    }
    if (fs.existsSync(shardDir)) {
      for (const f of fs.readdirSync(shardDir)) {
        if (!f.endsWith(".json")) continue;
        if (!(f.slice(0, -5) in meta.shards)) {
          warn("data/search-index/" + f + ": shard not referenced by the manifest", "rebuild the index (option 2)");
        }
      }
    }
    if (!shardIssues && shardsChecked) {
      pass(fmt(shardsChecked) + " shard files match the manifest hashes");
    }
  }
  if (meta && !meta.sourceVersions) {
    warn("search index: manifest has no source-version stamps", "rebuild the index (option 2) to enable freshness checks");
  } else if (meta) {
    let indexedChecked = 0;
    let stale = 0;
    for (const code of Object.keys(meta.sourceVersions)) {
      const info = bookInfo(code);
      if (!info) {
        warn(code + ": stamped in the search index but has no content file", "rebuild the index (option 2)");
        continue;
      }
      const stamp = meta.sourceVersions[code];
      if (info.version !== stamp) {
        fail(
          code + ": stale search index",
          "built from " + stamp + ", file is " + info.version + " — rebuild (option 2)",
        );
        stale++;
      } else {
        indexedChecked++;
      }
    }
    // Registered, indexable books absent from the stamps. (A book with no
    // postings has no shard; that is rare but not an error — hence WARN.)
    for (const entry of registry) {
      if (VIRTUAL_BOOKS.has(entry.code)) continue;
      const excluded = entry.exclude
        .toLowerCase()
        .split(",")
        .map((s) => s.trim());
      if (excluded.indexOf("entire-book") !== -1) continue;
      if (!bookInfo(entry.code)) continue; // no file: warned above
      if (!(entry.code in meta.sourceVersions)) {
        warn(entry.code + ": missing from the search index", "rebuild the index (option 2)");
      }
    }
    if (!stale && indexedChecked) {
      pass(fmt(indexedChecked) + " indexed books built from their current content");
    }
  }

  // ── Result ──
  section("Result");
  console.log(
    (failures
      ? "FAILED"
      : warnings
        ? "PASSED WITH WARNINGS"
        : "ALL PASS") +
      " — " + failures + " failure(s), " + warnings + " warning(s), " + infos + " info",
  );
  process.exit(failures ? 1 : 0);
}

if (UPDATE) runUpdate();
else runCheck();
