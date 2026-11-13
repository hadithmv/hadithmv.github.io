/**
 * The book content version contract — SHA-256 of the LF bytes GitHub Pages
 * serves, first 12 hex, lowercase.
 *
 * Shared by data/08-rebuild-searchIndex.mjs (the index manifest's per-book
 * source stamps) and tools/hmv-integrity-check.mjs (the freshness compare),
 * so both sides always compute identical versions. 04-update-bookRegistry.ps1
 * implements the same rule in PowerShell: convert CRLF pairs to LF at the
 * byte level (bare CRs inside quoted fields are data and stay), then hash.
 * The app compares version strings case-sensitively, hence lowercase.
 */
import crypto from "node:crypto";
import fs from "node:fs";

/**
 * CRLF → LF, byte-level. Latin-1 maps bytes 1:1 to code units, so the edit
 * cannot re-encode UTF-8 text; files without CRLF are returned untouched.
 */
export function normalizeLineEndings(buf) {
  const s = buf.toString("latin1");
  if (s.indexOf("\r\n") === -1) return buf;
  return Buffer.from(s.replace(/\r\n/g, "\n"), "latin1");
}

export function contentVersionBytes(buf) {
  return crypto
    .createHash("sha256")
    .update(normalizeLineEndings(buf))
    .digest("hex")
    .slice(0, 12);
}

export function contentVersionOf(filePath) {
  return contentVersionBytes(fs.readFileSync(filePath));
}
