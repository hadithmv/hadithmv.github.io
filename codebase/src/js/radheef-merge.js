/**
 * Virtual Merged Radheef Book (RDF-all)
 *
 * The combined radheef dictionary is a VIRTUAL book: it has a registry row in
 * 03-registry-bookMeta.csv (card, tags, reader routing) but no content CSV.
 * Opening it loads the eight source radheef books through the normal
 * version-gated cache (fetchBookCSVCached) and assembles the combined view in
 * memory — nothing is stored, duplicated, or re-generated.
 *
 *   - Column layout: the 7 named columns MERGED_HEADERS. Every source row is
 *     projected into them BY HEADER NAME — a source column lands in the target
 *     column with the same name; columns without a same-named home (eegaal's
 *     pNo, nanfoiy's gender/approvedBy/originLang, rasmee's technical columns,
 *     ...) are simply left out. A source's column order is irrelevant.
 *   - Block order: sources concatenate in MERGED_SOURCES order, which mirrors
 *     the registry's alphabetical sort (04-update-bookRegistry.ps1).
 *   - source column: each row's 7th cell carries its book's Dhivehi title,
 *     read from the registry at load (getBookTitleSync) — derived, never
 *     stored or hardcoded.
 *   - Caching: each source is cached in IndexedDB keyed by its own version, so
 *     edits to any source book show up here automatically — nothing to re-run.
 *   - Two load paths, one promise shape: the whole-file assembly
 *     (loadMergedRadheefBook — used as the fallback) and the streaming twin
 *     (loadMergedRadheefBookStreamed — HEAD-summed progress total, sequential
 *     per-source streaming, per-batch projection; the reader's first-visit
 *     path). See their docstrings.
 *
 * Index: the merged book is excluded from the library search index
 * (excludeFromIndex = ENTIRE-BOOK, like all RDF books) — a postings index over
 * dictionaries would dwarf the rest of the site. Its search runs inside the
 * reader over the loaded rows; no index involved.
 *
 * The registry script (04) is exempted from warning about RDF-all's missing
 * content file via its $virtualBooks list — keep the two in sync.
 */

import { fetchBookCSVCached } from "./csv.js";
import { getBookVersionSync, getBookTitleSync, getCsvPath } from "./book-data.js";

var MERGED_BOOK_CODE = "RDF-all";

// The combined book's column schema — every source maps into these by name.
var MERGED_HEADERS = ["wordAR", "wordDV", "wordEN", "meanAR", "meanDV", "meanEN", "source"];

// Block order: the Rasmee dictionary leads — it's the primary Dhivehi
// dictionary, so the merged book opens on it — then the remaining seven
// sources follow registry order (02 sorts alphabetically by code,
// case-insensitive): fahmy, asma, eegaal, maniku, misc, nanfoiyComb, W2W.
// The order is deliberate, not alphabetical — change it only on purpose;
// every consumer (row indexing, ?row= deep links, the rasmee tint's
// first-block visibility) follows this array.
var MERGED_SOURCES = [
  "RDF-rasmee",
  "RDF-ahmadFahmyDidi",
  "RDF-asmaullahilHusna",
  "RDF-eegaal",
  "RDF-hassanAhmedManiku",
  "RDF-misc",
  "RDF-nanfoiyComb",
  "RDF-W2W-bakurube",
];

export function isMergedRadheefBook(bookCode) {
  return bookCode === MERGED_BOOK_CODE;
}

// The merged schema projection — every source row maps into the 7 target
// cells BY HEADER NAME (a source column lands in the target column with the
// same name; columns without a same-named home are left out). Used by both
// the whole-file assembly and the streaming path, so the two can never
// diverge. The source column (last cell) carries the source book's Dhivehi
// title, read from the registry at load — derived, never stored or hardcoded.
function projectBatch(rows, idx, title) {
  var out = [];
  for (var r = 0; r < rows.length; r++) {
    var src = rows[r];
    var tgt = [];
    for (var c = 0; c < MERGED_HEADERS.length; c++) {
      var name = MERGED_HEADERS[c];
      var i = idx[name];
      tgt.push(i !== undefined ? (src[i] || "") : "");
    }
    tgt[MERGED_HEADERS.length - 1] = title;
    out.push(tgt);
  }
  return out;
}

/**
 * Load the merged radheef book. Resolves to the same shape as
 * reader.js's loadStandardBook: { data, headerRow, hasRowNums }.
 * A source that fails or has no rows is skipped; if nothing loads, data is
 * empty and the reader's existing "No data found" path takes over.
 */
export function loadMergedRadheefBook() {
  var fetches = MERGED_SOURCES.map(function (code) {
    return fetchBookCSVCached(code, getBookVersionSync(code) || "", getCsvPath(code))
      .then(function (rows) {
        return { code: code, rows: rows };
      });
  });
  return Promise.all(fetches).then(function (parts) {
    var data = [];
    for (var p = 0; p < parts.length; p++) {
      var code = parts[p].code;
      var rows = parts[p].rows;
      if (!rows || rows.length === 0) continue;
      var headerRow = rows.shift();
      var idx = {};
      for (var h = 0; h < headerRow.length; h++) {
        idx[headerRow[h]] = h;
      }
      data = data.concat(projectBatch(rows, idx, getBookTitleSync(code) || code));
    }
    return { data: data, headerRow: MERGED_HEADERS, hasRowNums: false };
  });
}

/**
 * Load the merged radheef book STREAMED (first visits — the merged book is
 * the library's heaviest: 8 sources, ~15 MB raw, 152,612 merged rows, and
 * it used to sit on the skeleton for the whole download). streamOpts is the
 * reader's streaming bridge contract ({ onFirstRow, onRows, onProgress }).
 *
 * Phase 0 HEADs every source (parallel) and sums the Content-Lengths — that
 * sum is the progress line's total. Any HEAD failure (network, missing
 * header, or file:// where fetch HEAD rejects) keeps the whole-file
 * assembly below, exactly like the standard path's missing-Content-Length
 * rule. Phase 1 streams the sources SEQUENTIALLY in MERGED_SOURCES order
 * (rasmee leads — the block order is deliberate; see MERGED_SOURCES),
 * projecting every batch into the merged schema BEFORE the reader sees it.
 * The merged header is static (MERGED_HEADERS) — emitted once, before the
 * first source, so the reader's bridge owns every source's rows from the
 * start. Cache-hit / sub-threshold sources never stream (fetchBookCSVCached
 * and fetchCSVStreamed's own rules) — their rows arrive whole-file through
 * the same onRows bridge; sources that fail or have no rows are skipped
 * (the whole-file rule). The aggregate fraction is (completed sources'
 * bytes + the current source's share) / total — monotonic, clamped at 1
 * (compressed vs decompressed lengths are the clamp's reason, same as
 * fetchCSVStreamed's own).
 *
 * Resolves null when stream mode engaged (the reader consumed every row via
 * the callbacks and finalizes on the bridge) or the assembled
 * { data, headerRow, hasRowNums } from the whole-file fallback — one
 * promise shape either way.
 */
export function loadMergedRadheefBookStreamed(streamOpts) {
  var sizes = {};
  return Promise.all(MERGED_SOURCES.map(function (code) {
    return fetch(getCsvPath(code), { method: "HEAD" }).then(function (res) {
      var len = parseInt(res.headers.get("content-length") || "0", 10) || 0;
      if (!res.ok || len < 1) throw new Error("no-content-length " + code);
      sizes[code] = len;
    });
  })).then(function () {
    streamOpts.onFirstRow(MERGED_HEADERS);
    var total = MERGED_SOURCES.reduce(function (s, code) { return s + sizes[code]; }, 0);
    var doneBytes = 0;
    function streamMergedSource(code) {
      var len = sizes[code];
      var title = getBookTitleSync(code) || code;
      var idx = null; // this source's header name→index map; non-null ⇒ it streamed
      var opts = {
        onFirstRow: function (header) {
          idx = {};
          for (var h = 0; h < header.length; h++) idx[header[h]] = h;
        },
        onRows: function (batch) {
          streamOpts.onRows(projectBatch(batch, idx, title));
        },
        onProgress: function (f) {
          streamOpts.onProgress(Math.min(1, (doneBytes + f * len) / total));
        },
      };
      return fetchBookCSVCached(code, getBookVersionSync(code) || "", getCsvPath(code), false, opts)
        .then(function (rows) {
          if (idx === null) {
            // Whole-file delivery (cache hit / sub-threshold / no-stream
            // fallback): the promise carried the full array, header first.
            if (!rows || rows.length === 0) return;
            var headerRow = rows.shift();
            var hIdx = {};
            for (var h = 0; h < headerRow.length; h++) hIdx[headerRow[h]] = h;
            var projected = projectBatch(rows, hIdx, title);
            if (projected.length > 0) streamOpts.onRows(projected);
          }
          doneBytes += len;
        })
        .catch(function () { doneBytes += len; }); // failed source — skipped (whole-file rule)
    }
    var chain = MERGED_SOURCES.reduce(function (p, code) {
      return p.then(function () { return streamMergedSource(code); });
    }, Promise.resolve());
    return chain.then(function () { return null; });
  }).catch(function () {
    return loadMergedRadheefBook(); // whole-file fallback — any HEAD failure
  });
}
