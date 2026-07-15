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
  searchPlaceholder: {
    dv: "މި ފޮތުން ހޯދާ…",
    en: "Search this book…",
    ar: "…ابحث في هذا الكتاب",
  },
  searchClearTitle: {
    dv: "ހޯދުން ފޮހެލޭ",
    en: "Clear search",
    ar: "مسح البحث",
  },

  // ── Toolbar ──
  btnCopyText: { dv: "ކޮޕީ ކުރޭ", en: "Copy", ar: "نسخ" },
  btnTashkeelText: {
    dv: "ފިލި ފޮރުވާ",
    en: "Hide diacritics",
    ar: "إخفاء التشكيل",
  },
  btnResetText: { dv: "ރީސެޓް", en: "Reset", ar: "إعادة ضبط" },
  btnFocusText: { dv: "ފޯކަސް", en: "Focus", ar: "تركيز" },
  btnAdvancedSearchText: {
    dv: "🔎 އެޑްވާންސްޑް",
    en: "🔎 Advanced",
    ar: "🔎 متقدم",
  },
  btnCopyText: { dv: "📋 ކޮޕީ", en: "📋 Copy", ar: "📋 نسخ" },
  btnTashkeelText: { dv: "◉ ފިލި", en: "◉ Diacritics", ar: "◉ تشكيل" },
  btnExportText: { dv: "📥 އެކްސްޕޯޓް", en: "📥 Export", ar: "📥 تصدير" },
  btnShareText: { dv: "🔗 ޝެއަރ", en: "🔗 Share", ar: "🔗 مشاركة" },
  toastShared: { dv: "ލިންކް ކޮޕީ ކުރެވިއްޖެ!", en: "Link copied!", ar: "تم نسخ الرابط!" },
  btnViewToggleText: { dv: "📖 ޓޭބަލް", en: "📖 Table", ar: "📖 جدول" },
  btnViewToggleCard: { dv: "📖 ކާޑް", en: "📖 Card", ar: "📖 بطاقة" },
  btnResetText: { dv: "↺ ރީސެޓް", en: "↺ Reset", ar: "↺ ضبط" },
  btnTashkeelTitle: {
    dv: "ފިލި ފޮރުވާ/ދައްކާ",
    en: "Toggle Arabic diacritics",
    ar: "إظهار/إخفاء التشكيل",
  },
  btnFocusIn: { dv: "ފޯކަސް ▲", en: "Focus ▲", ar: "تركيز ▲" },
  btnFocusOut: { dv: "ފޯކަސް ▼", en: "Full ▼", ar: "كامل ▼" },
  btnFocusExpand: {
    dv: "ފޯކަސް ▼",
    en: "Focus ▼",
    ar: "تركيز ▼",
  },
  btnAdvancedSearch: {
    dv: "🔎 އެޑްވާންސްޑް ހޯދުން",
    en: "🔎 Advanced",
    ar: "🔎 بحث متقدم",
  },
  advancedSearchTitle: {
    dv: "އެޑްވާންސްޑް ހޯދުން",
    en: "Advanced Search",
    ar: "بحث متقدم",
  },
  btnAddCondition: {
    dv: "+ ޝަރުތު އިތުރު ކުރޭ",
    en: "+ Add condition",
    ar: "+ إضافة شرط",
  },
  btnApplySearch: { dv: "ހޯދާ", en: "Search", ar: "بحث" },
  advColumn: { dv: "ކޮލަމް", en: "Column", ar: "عمود" },
  advCondition: { dv: "ޝަރުތު", en: "Condition", ar: "شرط" },
  advValue: { dv: "ލިޔުން", en: "Value", ar: "قيمة" },
  advRemove: { dv: "✕", en: "✕", ar: "✕" },
  condEquals: { dv: "އެއްވައްތަރު", en: "equals", ar: "يساوي" },
  condNot: { dv: "ނޫން", en: "not", ar: "لا يساوي" },
  condStarts: { dv: "ފެށޭ", en: "starts with", ar: "يبدأ بـ" },
  condNotStarts: { dv: "ނުފެށޭ", en: "not start with", ar: "لا يبدأ بـ" },
  condContains: { dv: "ހިމެނޭ", en: "contains", ar: "يحتوي" },
  condNotContains: { dv: "ނުހިމެނޭ", en: "not contain", ar: "لا يحتوي" },
  condEnds: { dv: "ނިމޭ", en: "ends with", ar: "ينتهي بـ" },
  condNotEnds: { dv: "ނުނިމޭ", en: "not end with", ar: "لا ينتهي بـ" },
  condEmpty: { dv: "ހުސް", en: "empty", ar: "فارغ" },
  condNotEmpty: { dv: "ހުސްނޫން", en: "not empty", ar: "غير فارغ" },

  btnReset: { dv: "↺ ރީސެޓް", en: "↺ Reset", ar: "↺ إعادة ضبط" },
  btnResetSettings: {
    dv: "↺ ހުރިހާ ސެޓިންގް ރީސެޓް ކުރޭ",
    en: "↺ Reset all settings",
    ar: "↺ إعادة ضبط جميع الإعدادات",
  },
  btnResetTitle: {
    dv: "ހުރިހާ ސ�ޓިންގް ރީސެޓް ކުރޭ",
    en: "Reset all settings",
    ar: "إعادة ضبط جميع الإعدادات",
  },
  labelRowsPerPage: {
    dv: "އެއްފަހަރާ ދައްކަންވީ ކިތައް ސަފްހާ:",
    en: "Show pages at once:",
    ar: "عرض الصفحات:",
  },
  labelHideColumns: {
    dv: "ކޮލަމް ▾",
    en: "Columns ▾",
    ar: "أعمدة ▾",
  },
  labelPageNo: {
    dv: "މި ސަފްހާގެ ނަންބަރު:",
    en: "Current page no.:",
    ar: "رقم الصفحة الحالية:",
  },
  // ── Pagination ──
  pageOf: { dv: "ސަފްހާ:", en: "Page:", ar: "صفحة:" },
  resultCount: { dv: "ނަތީޖާ", en: "match", ar: "نتيجة" },
  noResults: { dv: "ނަތީޖާ 0", en: "0 matches", ar: "٠ نتائج" },
  noMatchesMsg: {
    dv: "އެއްވެސް ނަތީޖާ ނުފެނުނު",
    en: "No rows match",
    ar: "لا توجد نتائج",
  },
  andMore: {
    dv: "… އަދި އިތުރު ނަތީޖާ",
    en: "… and more results",
    ar: "… والمزيد من النتائج",
  },

  // ── Toast ──
  toastCopied: { dv: "ކޮޕީ ކުރެވިއްޖެ!", en: "Copied!", ar: "تم النسخ!" },
  toastCopyFailed: {
    dv: "ކޮޕީ ނުކުރެވުނު",
    en: "Copy failed",
    ar: "فشل النسخ",
  },

  // ── Sidebar ──
  menuTitle: { dv: "މެނޫ", en: "Menu", ar: "القائمة" },
  sidebarTitle: { dv: "ހަދީޘްއެމްވީ", en: "Hadithmv", ar: "حديث إم في" },
  navDashboard: {
    dv: "ފޮތްތަކުގެ ލިސްޓް",
    en: "Book list",
    ar: "قائمة الكتب",
  },
  navScrollTop: {
    dv: "⬆ މައްޗަށް",
    en: "⬆ Scroll to top",
    ar: "⬆ أعلى الصفحة",
  },
  navGitHub: { dv: "🐙 ގިޓްހަބް", en: "🐙 GitHub", ar: "🐙 غيت هب" },
  navFaq: { dv: "❓ ސުވާލުތައް", en: "❓ FAQ", ar: "❓ الأسئلة الشائعة" },
  navHelp: { dv: "🛟 އެހީ", en: "🛟 Help", ar: "🛟 مساعدة" },
  navContact: { dv: "📧 ގުޅުން", en: "📧 Contact", ar: "📧 اتصل بنا" },
  btnWidescreen: {
    dv: "📐 ފުޅާ ސްކްރީން",
    en: "📐 Widescreen",
    ar: "📐 شاشة عريضة",
  },
  labelTheme: { dv: "ތީމް", en: "Theme", ar: "المظهر" },
  btnLang: { dv: "🌐 ބަސް", en: "🌐 Language", ar: "🌐 اللغة" },
  labelSettings: { dv: "ސެޓިންގްސް", en: "Settings", ar: "الإعدادات" },
  settingsAppearance: { dv: "ދިރުން", en: "Appearance", ar: "المظهر" },
  settingsFont: { dv: "ފޮންޓް", en: "Font", ar: "الخط" },
  settingsLanguage: { dv: "ބަސް", en: "Language", ar: "اللغة" },
  labelFontSize: { dv: "ފޮންޓް ސައިޒު", en: "Font size", ar: "حجم الخط" },
  labelFontFamily: { dv: "ފޮންޓް ވައްތަރު", en: "Font", ar: "نوع الخط" },

  // ── Footer / meta ──
  appVersion: {
    dv: "v6.9.85 (Web)",
    en: "v6.9.85 (Web)",
    ar: "v6.9.85 (Web)",
  },
  appCredit: {
    dv: "ހަދާފައިވަނީ: hadithmv",
    en: "Made by: hadithmv",
    ar: "صنع بواسطة: hadithmv",
  },

  // ── Loading ──
  loading: {
    dv: "ފޮތް ލޯޑް ކުރަނީ…",
    en: "Loading book data…",
    ar: "…جارٍ تحميل بيانات الكتاب",
  },

  // ── Tag labels ──
  tagAQD: { dv: "އަގީދާ", en: "Aqidah", ar: "عقيدة" },
  tagHDT: { dv: "ޙަދީޘް", en: "Hadith", ar: "حديث" },
  tagQRN: { dv: "ގުރްއާން", en: "Quran", ar: "قرآن" },
  tagRDF: { dv: "ރަދީފް", en: "Dictionary", ar: "معجم" },
  tagDFK: { dv: "ދފކ", en: "DFK", ar: "دفك" },
  tagIH: { dv: "އިސްލާމް ހައުސް", en: "Islamhouse", ar: "بيت الإسلام" },

  // ── Dashboard ──
  dashboardTitle: { dv: "ހަދީޘްއެމްވީ", en: "Hadithmv", ar: "حديث إم في" },
};

/** Translate a tag code. Pass lang to override current language. Falls back to the CSV label. */
export function tagLabel(code, fallback, lang) {
  var l = lang || _currentLang;
  var key = "tag" + code;
  var entry = STRINGS[key];
  if (entry && entry[l]) return entry[l];
  if (entry && entry.en) return entry.en;
  return fallback || code;
}

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
export function currentLang() {
  return _currentLang;
}

/** Set the language directly. Fires languagechange event. */
export function setLanguage(lang) {
  if (LANG_ORDER.indexOf(lang) === -1) return;
  _currentLang = lang;
  try {
    localStorage.setItem("lang", lang);
  } catch (_) {}
  applyDocumentLang();
}

/**
 * Cycle to the next language: dv → en → ar → dv.
 * Returns the new language code.
 */
export function cycleLanguage() {
  const idx = LANG_ORDER.indexOf(_currentLang);
  const next = LANG_ORDER[(idx + 1) % LANG_ORDER.length];
  _currentLang = next;
  try {
    localStorage.setItem("lang", next);
  } catch (_) {}
  applyDocumentLang();
  return next;
}

/** Apply data-lang attribute and re-translate all [data-i18n] elements. */
function applyDocumentLang() {
  document.documentElement.setAttribute("data-lang", _currentLang);
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    const key = el.getAttribute("data-i18n");
    if (
      el.tagName === "INPUT" &&
      (el.type === "search" || el.type === "text")
    ) {
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
  var sel = document.getElementById("selLanguage");
  if (sel) sel.value = _currentLang;
  applyDocumentLang();
}
