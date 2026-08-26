/**
 * Column Display Labels
 *
 * Friendly names for column selection chrome only — the advanced-search
 * column dropdown and the column toggle buttons. Table/card headers keep
 * their raw CSV identifiers (those are data identifiers, not content).
 *
 * Resolution order for a column's display label:
 *   1. Column registry (07-registry-quranColumns.csv) — QRN books only
 *   2. Derived from the raw header's camelCase tokens (tables in
 *      column-tokens.js, labels in i18n.js as col* keys)
 *   3. Raw header text (fallback — unmapped headers are caught by
 *      tools/hmv-header-scan.mjs, which reuses the same token tables)
 */

import { currentLang, t } from "./i18n.js";
import { getColumnSource, getRegistryLabel } from "./book-data.js";
import { KNOWN_COMPOUNDS, LANG_TOKENS, TOKEN_KEYS, stripHdn, tokenizeHeader } from "./column-tokens.js";

// Derive a display label from a raw header, or null when any token is
// unmapped (caller falls back to the raw header text).
export function deriveColumnLabel(header) {
  var h = stripHdn(header).trim();
  if (h === "") return "";
  var compound = KNOWN_COMPOUNDS[h.toLowerCase()];
  if (compound) return t(compound);
  if (h === "#") return t("colRowNo");
  var label = "";
  var lang = null;
  var tokens = tokenizeHeader(h);
  for (var i = 0; i < tokens.length; i++) {
    var tok = tokens[i];
    if (tok === "#") { label = t("colRowNo"); continue; }
    if (LANG_TOKENS[tok]) { lang = t(LANG_TOKENS[tok]); continue; }
    if (TOKEN_KEYS[tok]) { label = t(TOKEN_KEYS[tok]); continue; }
    return null; // unknown token — raw fallback
  }
  if (label === "") return null;
  return lang ? label + " (" + lang + ")" : label;
}

// The display label for reader column `colIndex` whose raw header is
// `rawHeader`: registry → derive → raw.
export function columnDisplayLabel(colIndex, rawHeader) {
  var src = getColumnSource(colIndex);
  if (src) {
    var reg = getRegistryLabel(src.sourceBook, src.sourceCol);
    if (reg) {
      return currentLang() === "en"
        ? (reg.displayEN || reg.displayDV)
        : (reg.displayDV || reg.displayEN);
    }
  }
  var derived = deriveColumnLabel(rawHeader);
  if (derived !== null) return derived;
  return rawHeader || "";
}
