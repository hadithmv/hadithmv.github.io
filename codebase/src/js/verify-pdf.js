/**
 * Tolerant PDF marker scan for the verify page.
 *
 * A print-to-PDF keeps the title page's verify link as a URI action and the
 * document title in the Info dictionary. We do NOT parse the PDF: we scan
 * the raw bytes, then Flate-decompressed streams, for the verify URL and for
 * /Title // /Producer literals. The PDF body is never inspected.
 *
 * Returns { marker, title, producer }; `marker` is "verify.html?book=…&v=…"
 * when found, else "".
 */

export async function scanPdf(buf) {
  var latin = new TextDecoder("latin1").decode(buf);
  var marker = findMarker(latin);
  var title = pdfLiteral(latin, "Title");
  var producer = pdfLiteral(latin, "Producer");

  if (!marker) {
    var streams = await inflatePdfStreams(buf);
    for (var i = 0; i < streams.length; i++) {
      var text = new TextDecoder("latin1").decode(streams[i]);
      marker = findMarker(text);
      if (!title) title = pdfLiteral(text, "Title");
      if (!producer) producer = pdfLiteral(text, "Producer");
      if (marker) break;
    }
  }
  return { marker: marker, title: title, producer: producer };
}

function findMarker(text) {
  var m = text.match(/verify\.html\?([^\s"'<>)\\]*)/);
  return m ? "verify.html?" + m[1].replace(/&amp;/g, "&") : "";
}

/** Read a /Title or /Producer literal string (nested parentheses handled). */
function pdfLiteral(text, key) {
  var needle = "/" + key;
  var from = 0;
  while (true) {
    var idx = text.indexOf(needle, from);
    if (idx < 0) return "";
    var i = idx + needle.length;
    while (i < text.length && /\s/.test(text.charAt(i))) i++;
    if (text.charAt(i) !== "(") {
      from = idx + 1;
      continue;
    }
    var out = "";
    var depth = 1;
    i++;
    while (i < text.length && depth > 0) {
      var ch = text.charAt(i);
      if (ch === "\\") {
        out += text.charAt(i + 1);
        i += 2;
        continue;
      }
      if (ch === "(") {
        depth++;
        out += ch;
      } else if (ch === ")") {
        depth--;
        if (depth > 0) out += ch;
      } else {
        out += ch;
      }
      i++;
    }
    return out;
  }
}

/** Try to inflate every "stream … endstream" chunk (PDF Flate = zlib). */
async function inflatePdfStreams(buf) {
  var out = [];
  var latin = new TextDecoder("latin1").decode(buf);
  var re = /stream\r?\n/g;
  var m;
  var count = 0;
  while ((m = re.exec(latin)) && count < 100) {
    var start = m.index + m[0].length;
    var end = latin.indexOf("endstream", start);
    if (end < 0) break;
    var dataEnd = end;
    if (dataEnd > start && latin.charAt(dataEnd - 1) === "\n") dataEnd--;
    if (dataEnd > start && latin.charAt(dataEnd - 1) === "\r") dataEnd--;
    var chunk = buf.subarray(start, dataEnd);
    if (chunk.length) {
      try {
        var ds = new DecompressionStream("deflate");
        var stream = new Blob([chunk]).stream().pipeThrough(ds);
        var arr = await new Response(stream).arrayBuffer();
        out.push(new Uint8Array(arr));
        count++;
      } catch (e) {
        /* not a Flate stream */
      }
    }
    re.lastIndex = end + 9;
  }
  return out;
}
