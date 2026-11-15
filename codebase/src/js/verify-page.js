/**
 * Verify-export page — reads a Hadithmv provenance claim (from a verify
 * link, a pasted provenance line, or a text export file), resolves the book
 * against the current registry, and reports whether the claimed source
 * version is the current one.
 *
 * This is the claim check, not the content comparison: the file's text is
 * not inspected yet. Everything runs locally; the only network reads are
 * the site's own registry CSVs.
 */
import { parseCSV } from "./csv.js";

var inputEl = document.getElementById("verifyInput");
var fileEl = document.getElementById("verifyFile");
var resultEl = document.getElementById("verifyResult");

var registryP = null;
var authorsP = null;
var timer = 0;

function fetchObjects(path, key) {
  return fetch(path)
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    })
    .then(function (text) {
      var rows = parseCSV(text);
      var hdr = rows.shift() || [];
      var idx = {};
      hdr.forEach(function (h, i) {
        idx[h] = i;
      });
      var out = {};
      rows.forEach(function (r) {
        var code = (r[idx[key]] || "").trim();
        if (!code) return;
        var obj = {};
        hdr.forEach(function (h, i) {
          obj[h] = r[i];
        });
        out[code] = obj;
      });
      return out;
    });
}

function loadRegistries() {
  if (!registryP) registryP = fetchObjects("../../data/03-registry-bookMeta.csv", "bookCode");
  if (!authorsP) authorsP = fetchObjects("../../data/02-registry-bookAuthors.csv", "authorCode");
  return Promise.all([registryP, authorsP]);
}

/** Parse a provenance caption, a full (legacy) line, or a URL out of text. */
function parseClaim(text) {
  var s = String(text || "");
  var out = { site: "", book: "", version: "", rows: "" };

  // The book code travels in the title-page URL (or a verify link), so it
  // can be recovered even when only the caption is visible in the export.
  var bu = s.match(/[?&]book=([A-Za-z0-9_-]+)/);
  if (bu) out.book = bu[1];

  // Legacy/full line: Hadithmv vX - book CODE - source v... - N rows.
  // Accept the middle-dot separators and both row forms.
  var m = s.match(
    /Hadithmv\s+(\S+)\s*[·-]\s*book:?\s*([A-Za-z0-9_-]+)(?:\s*[·-]\s*source:?\s*v([0-9a-fA-F]{12}))?(?:\s*[·-]\s*(?:rows:?\s*([\d,]+)|([\d,]+)\s+rows))?/,
  );
  if (m) {
    out.site = m[1];
    out.book = out.book || m[2];
    out.version = (m[3] || "").toLowerCase();
    out.rows = (m[4] || m[5] || "").replace(/,/g, "");
    return out;
  }

  // Current caption: source: v... - rows: N. The book comes from the URL.
  var c = s.match(/source:\s*(?:v([0-9a-fA-F]{12})|unknown)\s*[·-]\s*rows:\s*([\d,]+)/);
  if (c) {
    out.version = (c[1] || "").toLowerCase();
    out.rows = c[2].replace(/,/g, "");
    return out;
  }

  // A verify link on its own.
  var u = s.match(/verify\.html\?([^\s"'<>)]+)/);
  if (u) {
    var q = new URLSearchParams(u[1].replace(/&amp;/g, "&"));
    if (q.get("book")) {
      out.book = q.get("book");
      out.version = (q.get("v") || "").toLowerCase();
      return out;
    }
  }

  // A title-page URL on its own: the book, no source version.
  if (out.book) return out;
  return null;
}

function addRow(dl, label, value) {
  var dt = document.createElement("dt");
  dt.textContent = label;
  var dd = document.createElement("dd");
  dd.textContent = value;
  dl.appendChild(dt);
  dl.appendChild(dd);
}

function showEmpty(message) {
  resultEl.innerHTML = "";
  var p = document.createElement("p");
  p.className = "verify-empty";
  p.textContent = message;
  resultEl.appendChild(p);
}

function showBookMissing(claim) {
  resultEl.innerHTML = "";
  var st = document.createElement("p");
  st.className = "verify-status warn";
  st.textContent = claim.version
    ? "Could not identify the book from source v" + claim.version +
      " — include the title-page URL or open the verify link."
    : "Book code not found in that text — include the title-page URL or open the verify link.";
  resultEl.appendChild(st);
  if (claim.version || claim.rows) {
    var dl0 = document.createElement("dl");
    dl0.className = "verify-dl";
    if (claim.version) addRow(dl0, "Claimed source", "v" + claim.version);
    if (claim.rows) addRow(dl0, "Claimed rows", claim.rows);
    resultEl.appendChild(dl0);
  }
}

function renderWithRegistries(claim, maps) {
  var reg = maps[0];
  var authors = maps[1];
  var entry = reg[claim.book];
  var status;
  if (!entry) {
    status = ["bad", "Unknown book — no book with that code is registered."];
  } else if (!claim.version) {
    status = ["warn", "The claim does not name a source version."];
  } else if (!entry.version) {
    status = ["warn", "The registry has no source version for this book."];
  } else if (entry.version.toLowerCase() === claim.version) {
    status = ["ok", "This export claims the current source version."];
  } else {
    status = ["warn", "The export claims a different source version — the book has changed since it was exported (or the claim is not current)."];
  }

  resultEl.innerHTML = "";
  var statusEl = document.createElement("p");
  statusEl.className = "verify-status " + status[0];
  statusEl.textContent = status[1];
  resultEl.appendChild(statusEl);

  var dl = document.createElement("dl");
  dl.className = "verify-dl";
  var title = entry ? entry.titleEN || entry.titleDV || entry.bookCode : "";
  var author =
    entry && entry.authorCode && authors[entry.authorCode]
      ? authors[entry.authorCode].nameEN || entry.authorCode
      : "";
  addRow(dl, "Book", entry ? claim.book + " — " + title : claim.book);
  if (author) addRow(dl, "Author", author);
  addRow(dl, "Claimed source", claim.version ? "v" + claim.version : "not stated");
  addRow(dl, "Claimed rows", claim.rows ? claim.rows : "not stated");
  addRow(dl, "Current source", entry && entry.version ? "v" + entry.version.toLowerCase() : "unknown");
  if (claim.site) addRow(dl, "Site version", claim.site);
  resultEl.appendChild(dl);
}

function renderClaim(claim) {
  if (!claim) {
    showEmpty("No Hadithmv provenance found in that text.");
    return;
  }
  if (!claim.book) {
    // The caption alone can still identify the book: its source version is
    // the content hash of exactly one current book (or none for an older
    // export). Only a unique match is accepted.
    if (!claim.version) {
      showBookMissing(claim);
      return;
    }
    showEmpty("Looking up the source version…");
    loadRegistries()
      .then(function (maps) {
        var reg = maps[0];
        var matches = Object.keys(reg).filter(function (code) {
          return (reg[code].version || "").toLowerCase() === claim.version;
        });
        if (matches.length === 1) {
          claim.book = matches[0];
          renderWithRegistries(claim, maps);
        } else {
          showBookMissing(claim);
        }
      })
      .catch(function () {
        showEmpty("Could not load the book registry — check your connection and try again.");
      });
    return;
  }
  showEmpty("Looking up the registry…");
  loadRegistries()
    .then(function (maps) {
      renderWithRegistries(claim, maps);
    })
    .catch(function () {
      showEmpty("Could not load the book registry — check your connection and try again.");
    });
}

function checkText(text) {
  if (!String(text || "").trim()) {
    showEmpty("Paste a provenance line or open a verify link to see the claim.");
    return;
  }
  renderClaim(parseClaim(text));
}

inputEl.addEventListener("input", function () {
  clearTimeout(timer);
  timer = setTimeout(function () {
    checkText(inputEl.value);
  }, 150);
});

fileEl.addEventListener("change", function () {
  var f = fileEl.files && fileEl.files[0];
  if (!f) return;
  f.text()
    .then(function (text) {
      checkText(text.slice(0, 200000));
    })
    .catch(function () {
      showEmpty("Could not read that file.");
    });
});

var params = new URLSearchParams(location.search);
var queryBook = params.get("book");
if (queryBook) {
  renderClaim({
    site: "",
    book: queryBook,
    version: (params.get("v") || "").toLowerCase(),
    rows: "",
  });
} else {
  showEmpty("Paste a provenance line or open a verify link to see the claim.");
}
