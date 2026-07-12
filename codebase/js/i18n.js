/**
 * Internationalisation module.
 *
 * Stores all UI strings in Dhivehi (dv), English (en), and Arabic (ar).
 * Language preference is persisted to localStorage.
 *
 * Usage:
 *   import { t, setLanguage, currentLang, onLanguageChange } from "./i18n.js";
 *   console.log(t("searchPlaceholder")); // → މި ފޮތުން ހޯދާ…
 */

const STRINGS = {
  // ── Search ──
  searchPlaceholder:  { dv: "މި ފޮތުން ހޯދާ…",     en: "Search this book…",        ar: "…ابحث في هذا الكتاب" },
  searchClearTitle:   { dv: "ހޯދުން ފޮހެލޭ",    en: "Clear search",             ar: "مسح البحث" },

  // ── Toolbar ──
  btnCopy:            { dv: "📋 ކޮޕީ ކުރޭ",       en: "📋 Copy",                   ar: "📋 نسخ" },
  btnCopyTitle:       { dv: "ސަފްހާ ކޮޕީ ކުރޭ",  en: "Copy page to clipboard",   ar: "نسخ الصفحة إلى الحافظة" },
  btnTashkeel:        { dv: "◉ ފިލި ފޮރުވާ",      en: "◉ Hide diacritics",        ar: "◉ إخفاء التشكيل" },
  btnTashkeelTitle:   { dv: "ފިލި ފޮރުވާ/ދައްކާ", en: "Toggle Arabic diacritics", ar: "إظهار/إخفاء التشكيل" },
  btnReset:           { dv: "↺ ރީސެޓް",          en: "↺ Reset",                  ar: "↺ إعادة ضبط" },
  btnResetTitle:      { dv: "ހުރިހާ ސ�ޓިންގް ރީސެޓް ކުރޭ", en: "Reset all settings", ar: "إعادة ضبط جميع الإعدادات" },
  labelRowsPerPage:   { dv: "އެއްފަހަރާ ދައްކަންވީ ކިތައް ސަފްހާ:", en: "Show pages at once:", ar: "عرض الصفحات:" },
  labelHideColumns:   { dv: "ކޮލަމް ފޮރުވާ:",   en: "Hide columns:",            ar: "إخفاء الأعمدة:" },
  labelPageNo:        { dv: "މި ސަފްހާގެ ނަންބަރު:", en: "Current page no.:",    ar: "رقم الصفحة الحالية:" },
  colNotes:           { dv: "ނޯޓު",              en: "Notes",                    ar: "ملاحظات" },

  // ── Pagination ──
  pageOf:             { dv: "ސަފްހާ",            en: "Page",                     ar: "صفحة" },
  resultCount:        { dv: "ނަތީޖާ",            en: "match",                    ar: "نتيجة" },
  noResults:          { dv: "ނަތީޖާ 0",          en: "0 matches",                ar: "٠ نتائج" },
  noMatchesMsg:       { dv: "އެއްވެސް ނަތީޖާ ނުފެނުނު", en: "No rows match",       ar: "لا توجد نتائج" },
  andMore:            { dv: "… އަދި އިތުރު ނަތީޖާ", en: "… and more results",  ar: "… والمزيد من النتائج" },

  // ── Toast ──
  toastCopied:        { dv: "ކޮޕީ ކުރެވިއްޖެ!",   en: "Copied!",                 ar: "تم النسخ!" },
  toastCopyFailed:    { dv: "ކޮޕީ ނުކުރެވުނު",    en: "Copy failed",             ar: "فشل النسخ" },

  // ── Sidebar ──
  menuTitle:          { dv: "މެނޫ",              en: "Menu",                     ar: "القائمة" },
  sidebarTitle:       { dv: "ހަދީޘްއެމްވީ",       en: "Hadithmv",                 ar: "حديث إم في" },
  navDashboard:       { dv: "← ފޮތް ތަކުގެ ލިސްޓް", en: "← Book list",         ar: "← قائمة الكتب" },
  navContact:         { dv: "📧 ގުޅުން",          en: "📧 Contact",              ar: "📧 اتصل بنا" },
  btnWidescreen:      { dv: "📐 ފުޅާ ސްކްރީން",   en: "📐 Widescreen",           ar: "📐 شاشة عريضة" },
  labelDark:          { dv: "ޑާރކް މޯޑް",         en: "Dark mode",               ar: "الوضع الداكن" },
  labelLight:         { dv: "ލައިޓް މޯޑް",        en: "Light mode",              ar: "الوضع الفاتح" },
  btnLang:            { dv: "🌐 ބަސް",             en: "🌐 Language",             ar: "🌐 اللغة" },
  langLabel:          { dv: "ދިވެހި",              en: "English",                  ar: "العربية" },

  // ── Footer / meta ──
  appVersion:         { dv: "ވާޝަން 6.9.85 · ވެބް", en: "Version 6.9.85 · Web", ar: "الإصدار 6.9.85 · ويب" },
  appCredit:          { dv: "ހަދާފައިވަނީ: hadithmv", en: "Made by: hadithmv",   ar: "صنع بواسطة: hadithmv" },

  // ── Loading ──
  loading:            { dv: "ފޮތް ލޯޑް ކުރަނީ…",   en: "Loading book data…",      ar: "…جارٍ تحميل بيانات الكتاب" },

  // ── Dashboard ──
  dashboardTitle:     { dv: "ހަދީޘްއެމްވީ",       en: "Hadithmv",                 ar: "حديث إم في" },
};

// ── State ──────────────────────────────────────────────────
const LANG_ORDER = ["dv", "en", "ar"];
let _currentLang = "dv";

// Restore saved language
try {
  const saved = localStorage.getItem("lang");
  if (saved && LANG_ORDER.indexOf(saved) !== -1) _currentLang = saved;
} catch (_) {}

// ── Public API ─────────────────────────────────────────────

/** Return the translated string for a key in the current language. */
export function t(key) {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[_currentLang] || entry.en || key;
}

/** Get the current language code. */
export function currentLang() { return _currentLang; }

/**
 * Cycle to the next language: dv → en → ar → dv.
 * Returns the new language code.
 */
export function cycleLanguage() {
  const idx = LANG_ORDER.indexOf(_currentLang);
  const next = LANG_ORDER[(idx + 1) % LANG_ORDER.length];
  _currentLang = next;
  try { localStorage.setItem("lang", next); } catch (_) {}
  applyDocumentLang();
  return next;
}

/** Apply data-lang attribute and re-translate all [data-i18n] elements. */
function applyDocumentLang() {
  document.documentElement.setAttribute("data-lang", _currentLang);
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    const key = el.getAttribute("data-i18n");
    if (el.tagName === "INPUT" && (el.type === "search" || el.type === "text")) {
      el.placeholder = t(key);
    } else if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      // skip — value is user-entered
    } else {
      el.textContent = t(key);
    }
  });
  // Handle title attributes
  document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
    el.title = t(el.getAttribute("data-i18n-title"));
  });
  // Fire event so reader can update dynamic text
  document.dispatchEvent(new CustomEvent("languagechange"));
}

/** Call once on page load to apply initial translations. */
export function initI18n() {
  applyDocumentLang();
}
