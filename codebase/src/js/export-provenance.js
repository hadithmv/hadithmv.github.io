/**
 * Export provenance — the ASCII marker printed on every rich whole-book
 * export's title page, plus the verify URL it points at.
 *
 * The visible caption is deliberately minimal — the title page already
 * carries the site version (the brand line) and the book code (the site URL
 * directly above it), so the caption only adds the source version and rows:
 *
 *   source: v0f2711a29294 - rows: 41
 *
 * `source` is the book's 12-hex content version from the registry — the same
 * hash the app uses to validate its book cache. The full claim lives in the
 * caption's link:
 *
 *   verify.html?book=CODE&v=0f2711a29294
 *
 * The reader's whole-book exports carry it (TXT/MD as text, HTML/Word/PDF/
 * EPUB as a link). Info-pane exports don't yet: their sources are composite
 * (book + author registry + notes), so they need their own fingerprint.
 */

/** Absolute URL of the verifier page, as a sibling of the current page. */
export function verifyPageURL(bookCode, version) {
  var base =
    window.location.origin +
    window.location.pathname.replace(/\/[^/]*$/, "/verify.html");
  return (
    base +
    "?book=" +
    encodeURIComponent(bookCode || "") +
    (version ? "&v=" + encodeURIComponent(version) : "")
  );
}

export function buildProvenance(opts) {
  var code = opts.bookCode || "";
  var version = String(opts.version || "").toLowerCase();
  var rows = Number(opts.rows) || 0;
  var hasVersion = /^[0-9a-f]{12}$/.test(version);
  var line = hasVersion ? "source: v" + version : "source: unknown";
  line += " - rows: " + rows;
  return {
    line: line,
    url: verifyPageURL(code, hasVersion ? version : ""),
    bookCode: code,
    version: hasVersion ? version : "",
    rows: rows,
  };
}
