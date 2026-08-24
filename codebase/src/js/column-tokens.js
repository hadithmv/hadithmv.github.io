/**
 * Column Token Tables
 *
 * Pure data + tokenizer shared by two consumers:
 *   - src/js/column-labels.js  — resolves reader columns to display labels
 *   - tools/hmv-header-scan.mjs — diffs every content CSV header against
 *     these tables and reports unmapped tokens
 *
 * Kept free of imports (and therefore Node-safe) so the scan can import
 * exactly the tables the mapper uses — a re-copy would drift. Labels for
 * the i18n keys below live in src/js/i18n.js as col* entries.
 */

// Exact whole-header matches (checked BEFORE tokenization). Keys are
// lowercase, -hdn already stripped.
var KNOWN_COMPOUNDS = {
  juzno: "colJuz",
  surahno: "colSurah",
  ayahno: "colAyahNo",
  pno: "colPageNo",
  originlang: "colOriginLang",
  approvedby: "colApprovedBy",
  maiginthi: "colMainCount",
  adabiginthi: "colLiteraryCount",
};

// Language/script suffixes — composed as "Label (Language)". "eng" is the
// full-word variant seen in baavaiyENG (RDF-rasmee.csv).
var LANG_TOKENS = {
  ar: "colLangAR",
  dv: "colLangDV",
  en: "colLangEN",
  eng: "colLangEN",
};

// Content tokens — the label core.
var TOKEN_KEYS = {
  body: "colBody",
  head: "colHead",
  word: "colWord",
  foot: "colFoot",
  matn: "colMatn",
  sharh: "colSharh",
  mean: "colMean",
  kitab: "colKitab",
  bab: "colBab",
  takhrij: "colTakhrij",
  source: "colSource",
  date: "colDate",
  zamaan: "colTime",
  note: "colNote",
  misaalu: "colExample",
  no: "colNumber",
  title: "colTitle",
  translation: "colTranslation",
  thafseer: "colTafsir",
  ayah: "colAyah",
  imlai: "colImlai",
  uthmani: "colUthmani",
  basmala: "colBasmalah",
  basmalah: "colBasmalah",
  author: "colAuthor",
  category: "colCategory",
  gender: "colGender",
  w2w: "colW2W",
  bahuruva: "colDialect",
  dharaja: "colDegree",
  dhaaira: "colArea",
  atolhu: "colAtoll",
  baavaiy: "colBaavaiy",
};

// The -hdn auto-hide marker is stripped case-insensitively (mirrors the
// engine's own strip in quran-ui.js).
function stripHdn(header) {
  return String(header || "").replace(/-hdn$/i, "");
}

// Split a raw header into lowercase camelCase tokens, e.g.
// "bodyDV" → ["body", "dv"], "ayahW2W" → ["ayah", "w2w"]. The
// lowercase-only lookbehind keeps all-caps suffixes together ("DV", "ENG")
// instead of splitting them letter by letter.
export function tokenizeHeader(header) {
  var h = stripHdn(header);
  if (h === "#") return ["#"];
  return h.split(/(?<=[a-z])(?=[A-Z])/).map(function (w) { return w.toLowerCase(); });
}

// The tokens a header uses that the mapper has no entry for. Empty array
// means the header derives fully. Exported for tools/hmv-header-scan.mjs.
export function unknownTokens(header) {
  var h = stripHdn(header).trim();
  if (h === "") return []; // empty header → raw fallback is deliberate
  if (KNOWN_COMPOUNDS[h.toLowerCase()]) return [];
  var unknown = [];
  tokenizeHeader(h).forEach(function (tok) {
    if (tok !== "#" && !LANG_TOKENS[tok] && !TOKEN_KEYS[tok]) unknown.push(tok);
  });
  return unknown;
}

export { KNOWN_COMPOUNDS, LANG_TOKENS, TOKEN_KEYS, stripHdn };
