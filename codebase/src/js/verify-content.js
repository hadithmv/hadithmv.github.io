/**
 * Content verification for text exports — compare an uploaded export's body
 * with the current canonical text of its book.
 *
 * Supported: CSV, TSV, JSON, XML and HTML Table (parsed directly), and the
 * rich HTML Book / Word exports (the expected body is rebuilt with the app's
 * own builders, then both bodies are compared as normalized text lines).
 * TXT/MD/YAML/TOON/PDF/EPUB/XLSX fall back to the claim check.
 *
 * The comparison uses the current book CSV; an older export can legitimately
 * differ, which the claimed source version in the claim already warns about.
 */
import { parseCSV } from "./csv.js";
import { buildHtmlBook, buildWordHTML } from "./export.js";

function extOf(name) {
  var m = String(name || "").toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : "";
}

export function detectFormat(name, text) {
  var ext = extOf(name);
  if (ext === "csv") return "csv";
  if (ext === "tsv") return "tsv";
  if (ext === "json") return "json";
  if (ext === "xml") return "xml";
  if (ext === "doc") return /class="title-page"/.test(text) ? "word" : "unsupported";
  if (ext === "html" || ext === "htm") {
    if (/class="title-page"/.test(text)) return "html";
    if (/<table[\s>]/i.test(text)) return "html-table";
    return "unsupported";
  }
  if (
    ext === "txt" ||
    ext === "md" ||
    ext === "yaml" ||
    ext === "yml" ||
    ext === "toon"
  ) {
    return "unsupported";
  }
  // Unknown extension — sniff lightly.
  var head = text.slice(0, 3000);
  if (/class="title-page"/.test(head)) return "html";
  if (/<table[\s>]/i.test(head)) return "html-table";
  if (/^\s*\[/.test(head)) {
    try {
      JSON.parse(text);
      return "json";
    } catch (e) {
      /* not JSON */
    }
  }
  var first = text.split(/\r?\n/, 1)[0] || "";
  if (first.indexOf("\t") !== -1) return "tsv";
  if (first.indexOf(",") !== -1) return "csv";
  return "unsupported";
}

function rawCell(v) {
  return String(v == null ? "" : v);
}

// TSV export: every tab and newline becomes ONE space (no run collapse).
function tsvCell(v) {
  return String(v == null ? "" : v)
    .replace(/\t/g, " ")
    .replace(/\n/g, " ")
    .trim();
}

// HTML Table export: trim, then each RUN of newlines becomes the literal text
// "<br>" (the writer escapes it, so it is not an element), and the parser's
// textContent returns those same characters.
function tableCell(v) {
  return String(v == null ? "" : v)
    .trim()
    .replace(/\n+/g, "<br>");
}

function parseTSV(text) {
  var lines = text.split(/\r?\n/);
  if (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines.map(function (line) {
    return line.split("\t");
  });
}

function parseXMLRows(text) {
  var doc = new DOMParser().parseFromString(text, "application/xml");
  if (doc.getElementsByTagName("parsererror").length) return null;
  var rows = doc.getElementsByTagName("row");
  var out = [];
  for (var i = 0; i < rows.length; i++) {
    var cells = [];
    var children = rows[i].children;
    for (var k = 0; k < children.length; k++) {
      var m = /^col(\d+)$/.exec(children[k].tagName);
      if (m) cells[+m[1]] = children[k].textContent;
    }
    out.push(cells);
  }
  return out;
}

function parseHtmlTable(text) {
  var doc = new DOMParser().parseFromString(text, "text/html");
  var table = doc.querySelector("table");
  if (!table) return null;
  var headRow = table.querySelector("thead tr");
  var header = headRow
    ? Array.prototype.map.call(headRow.children, function (th) {
        return th.textContent.trim();
      })
    : [];
  var rows = Array.prototype.map.call(
    table.querySelectorAll("tbody tr"),
    function (tr) {
      return Array.prototype.map.call(tr.children, function (td) {
        var clone = td.cloneNode(true);
        var brs = clone.querySelectorAll("br");
        for (var b = 0; b < brs.length; b++) {
          brs[b].parentNode.replaceChild(document.createTextNode(" "), brs[b]);
        }
        return clone.textContent;
      });
    },
  );
  return { header: header, rows: rows };
}

/** Visible body text of a rich export, stripped of the title page/TOC. */
function bodyLines(html) {
  var doc = new DOMParser().parseFromString(html, "text/html");
  var strip = doc.querySelectorAll(".title-page, .toc, .page-break");
  for (var s = 0; s < strip.length; s++) strip[s].remove();
  var buf = [];
  function walk(node) {
    var kids = node.childNodes;
    for (var i = 0; i < kids.length; i++) {
      var ch = kids[i];
      if (ch.nodeType === 3) {
        buf.push(ch.nodeValue);
        continue;
      }
      if (ch.nodeType !== 1) continue;
      var tag = ch.tagName;
      if (tag === "SCRIPT" || tag === "STYLE") continue;
      if (tag === "BR") {
        buf.push("\n");
        continue;
      }
      var block =
        /^(P|DIV|H[1-6]|HR|LI|TR|TABLE|UL|OL)$/.test(tag);
      if (block) buf.push("\n");
      walk(ch);
      if (block) buf.push("\n");
    }
  }
  if (doc.body) walk(doc.body);
  return buf
    .join("")
    .split(/\n+/)
    .map(function (line) {
      return line.replace(/\s+/g, " ").trim();
    })
    .filter(Boolean);
}

function truncate(v) {
  var s = String(v);
  return s.length > 140 ? s.slice(0, 137) + "…" : s;
}

function structuredDiff(actualRows, canonical, opts) {
  var norm = opts.norm;
  var withHeader =
    opts.withHeader != null ? opts.withHeader : !!canonical.withHeader;
  var all = withHeader ? [canonical.header].concat(canonical.rows) : canonical.rows;
  var dataStart = withHeader ? 1 : 0;
  var startCol = opts.startCol || 0;
  var diffs = [];
  var different = 0;
  var maxRows = Math.max(all.length, actualRows.length);
  for (var i = 0; i < maxRows; i++) {
    var eRow = all[i];
    var aRow = actualRows[i];
    var rowNo = i + (withHeader ? 0 : 1);
    if (!eRow || !aRow) {
      different++;
      if (diffs.length < 12) {
        diffs.push({
          where: i === 0 && withHeader ? "Header" : "Row " + rowNo,
          expected: eRow ? "(row present)" : "(missing row)",
          actual: aRow ? "(row present)" : "(missing row)",
        });
      }
      continue;
    }
    var maxCols = Math.max(eRow.length, aRow.length);
    for (var j = startCol; j < maxCols; j++) {
      var ev = norm(eRow[j]);
      var av = norm(aRow[j]);
      if (ev === av) continue;
      different++;
      if (diffs.length < 12) {
        diffs.push({
          where:
            (i === 0 && withHeader ? "Header" : "Row " + rowNo) +
            " · " +
            (canonical.header[j] || "column " + (j + 1)),
          expected: truncate(ev),
          actual: truncate(av),
        });
      }
    }
  }
  var rowsCompared = Math.min(all.length, actualRows.length) - dataStart;
  if (!different) {
    return {
      status: "match",
      summary:
        "Content match — the body matches the current text (" +
        Math.max(0, rowsCompared) +
        " rows compared).",
      diffs: [],
    };
  }
  return {
    status: "diff",
    summary:
      "Content differs — " + different + " difference(s) from the current text.",
    diffs: diffs,
  };
}

function richDiff(text, kind, meta, canonical) {
  var cfg = {
    metadata: meta,
    rows: canonical.rows,
    headerRow: canonical.header,
    hasRowNums: canonical.hasRowNums,
  };
  var expected =
    kind === "word"
      ? buildWordHTML(cfg, "", "", "Contents")
      : buildHtmlBook(cfg, "", "", "Contents");
  var exp = bodyLines(expected);
  var act = bodyLines(text);
  var diffs = [];
  var different = 0;
  var max = Math.max(exp.length, act.length);
  for (var i = 0; i < max; i++) {
    var e = exp[i] || "";
    var a = act[i] || "";
    if (e === a) continue;
    different++;
    if (diffs.length < 12) {
      diffs.push({
        where: "Line " + (i + 1),
        expected: truncate(e || "(end)"),
        actual: truncate(a || "(end)"),
      });
    }
  }
  if (!different) {
    return {
      status: "match",
      summary:
        "Content match — the body matches the current text (" +
        exp.length +
        " lines compared).",
      diffs: [],
    };
  }
  return {
    status: "diff",
    summary:
      "Content differs — " + different + " line(s) differ from the current text.",
    diffs: diffs,
  };
}

export function compareContent(opts) {
  var text = String(opts.text || "");
  var canonical = opts.canonical;
  var format = detectFormat(opts.filename, text);
  if (format === "unsupported") {
    return {
      status: "unsupported",
      summary:
        "Content comparison isn't available for this format yet — the claim was checked.",
      diffs: [],
    };
  }
  try {
    if (format === "word" || format === "html") {
      return richDiff(text, format, opts.meta, canonical);
    }
    if (format === "csv") {
      return structuredDiff(parseCSV(text), canonical, {
        norm: rawCell,
        withHeader: true,
      });
    }
    if (format === "tsv") {
      return structuredDiff(parseTSV(text), canonical, {
        norm: tsvCell,
        withHeader: true,
      });
    }
    if (format === "json") {
      var parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("not an array");
      var rows = parsed.map(function (row) {
        return Array.isArray(row) ? row : [row];
      });
      return structuredDiff(rows, canonical, {
        norm: rawCell,
        withHeader: true,
      });
    }
    if (format === "xml") {
      var xmlRows = parseXMLRows(text);
      if (!xmlRows) throw new Error("bad xml");
      return structuredDiff(xmlRows, canonical, {
        norm: function (v) {
          return String(v == null ? "" : v).trim();
        },
        withHeader: false,
        startCol: canonical.hasRowNums ? 1 : 0,
      });
    }
    if (format === "html-table") {
      var table = parseHtmlTable(text);
      if (!table) throw new Error("no table");
      var tableRows =
        table.header.length > 0 ? [table.header].concat(table.rows) : table.rows;
      return structuredDiff(tableRows, canonical, {
        norm: tableCell,
        withHeader: table.header.length > 0,
      });
    }
  } catch (e) {
    return {
      status: "error",
      summary: "Could not parse the export — the claim was checked.",
      diffs: [],
    };
  }
  return {
    status: "unsupported",
    summary:
      "Content comparison isn't available for this format yet — the claim was checked.",
    diffs: [],
  };
}
