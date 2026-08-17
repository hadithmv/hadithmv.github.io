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

  // ── Toolbar ──
  btnAdvancedSearchText: {
    dv: "🔎 އެޑްވާންސްޑް",
    en: "🔎 Advanced",
    ar: "🔎 متقدم",
  },
  btnCopyText: { dv: "📋 ކޮޕީ", en: "📋 Copy", ar: "📋 نسخ" },
  btnTashkeelText: { dv: "◉ ފިލި", en: "◉ Diacritics", ar: "◉ تشكيل" },
  btnExportText: { dv: "📥 އެކްސްޕޯޓް", en: "📥 Export", ar: "📥 تصدير" },
  exportPreparing: {
    dv: "ތައްޔާރުވަނީ…",
    en: "Preparing…",
    ar: "…جارٍ التحضير",
  },
  btnShareText: { dv: "🔗 ޝެއަރ", en: "🔗 Share", ar: "🔗 مشاركة" },
  btnBookmarkText: { dv: "📌 ޕިން", en: "📌 Pin", ar: "📌 تثبيت" },
  btnBookmarkPinned: { dv: "📌 ޕިންވެފަ", en: "📌 Pinned", ar: "📌 مثبت" },
  toastShared: {
    dv: "ލިންކް ކޮޕީ ކުރެވިއްޖެ!",
    en: "Link copied!",
    ar: "تم نسخ الرابط!",
  },
  btnViewToggleTable: { dv: "📖 ޓޭބަލް", en: "📖 Table", ar: "📖 جدول" },
  btnViewToggleCard: { dv: "📖 ކާޑު", en: "📖 Card", ar: "📖 بطاقة" },
  btnViewMode: { dv: "📖 ފެންނަ ގޮތް", en: "📖 View", ar: "📖 عرض" },
  btnResetText: { dv: "↺ ރީސެޓް", en: "↺ Reset", ar: "↺ ضبط" },
  advancedSearchTitle: {
    dv: "އެޑްވާންސްޑް ސާޗު",
    en: "Advanced Search",
    ar: "بحث متقدم",
  },
  btnAddCondition: {
    dv: "+ ޝަރުތު އިތުރުކުރޭ",
    en: "+ Add condition",
    ar: "+ إضافة شرط",
  },
  btnApplySearch: { dv: "ހޯދާ", en: "Search", ar: "بحث" },
  advancedColumn: { dv: "ކޮލަމް", en: "Column", ar: "عمود" },
  advancedValue: { dv: "ލިޔުން", en: "Value", ar: "قيمة" },
  advancedRemove: { dv: "✕", en: "✕", ar: "✕" },
  condEquals: { dv: "= ސީދާ ހުރީ", en: "= equals", ar: "= يساوي" },
  condNot: { dv: "≠ މި ނުލާ", en: "≠ not", ar: "≠ لا يساوي" },
  condStarts: { dv: "◁ މީގެން ފެށޭ", en: "◁ starts with", ar: "◁ يبدأ بـ" },
  condNotStarts: {
    dv: "◁✕ މީގެން ނުފެށޭ",
    en: "◁✕ not start",
    ar: "◁✕ لا يبدأ بـ",
  },
  condContains: { dv: "✧ މީތި ހިމެނޭ", en: "✧ contains", ar: "✧ يحتوي" },
  condNotContains: {
    dv: "✧✕ މީތި ނުހިމެނޭ",
    en: "✧✕ not contain",
    ar: "✧✕ لا يحتوي",
  },
  condEnds: { dv: "▷ މީގެން ނިމޭ", en: "▷ ends with", ar: "▷ ينتهي بـ" },
  condNotEnds: {
    dv: "▷✕ މީގެން ނުނިމޭ",
    en: "▷✕ not end",
    ar: "▷✕ لا ينتهي بـ",
  },
  condEmpty: { dv: "∅ ހުސްކޮށް", en: "∅ empty", ar: "∅ فارغ" },
  condNotEmpty: { dv: "∅✕ ހުހެއް ނޫން", en: "∅✕ not empty", ar: "∅✕ غير فارغ" },

  btnReset: { dv: "↺ ރީސެޓް", en: "↺ Reset", ar: "↺ إعادة ضبط" },
  btnResetSettings: {
    dv: "↺ ހުރިހާ ސެޓިންގް ރީސެޓްކުރޭ",
    en: "↺ Reset all settings",
    ar: "↺ إعادة ضبط جميع الإعدادات",
  },
  confirmCancel: {
    dv: "ކެންސަލް",
    en: "Cancel",
    ar: "إلغاء",
  },
  // Generic confirm body — the dialog title names what is being cleared
  confirmAreYouSure: {
    dv: "ފޮހެލަން ބޭނުންވާކަން ޔަގީންތޯ؟ މި ކަން އަނބުރާ ނުގެނެވޭނެ.",
    en: "Are you sure? This cannot be undone.",
    ar: "هل أنت متأكد؟ لا يمكن التراجع عن هذا.",
  },
  confirmResetAll: {
    dv: "ހުރިހާ ސެޓިންގްސް، ޕިން އަދި ހިސްޓަރީ ރީސެޓްކުރަން ޔަގީންތޯ؟ މި ކަން އަނބުރާ ނުގެނެވޭނެ.",
    en: "Reset all settings, pins, and history? This cannot be undone.",
    ar: "إعادة ضبط جميع الإعدادات والعلامات والسجل؟ لا يمكن التراجع عن هذا.",
  },
  labelColumns: {
    dv: "ކޮލަމް ▾",
    en: "Columns ▾",
    ar: "أعمدة ▾",
  },
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
  sidebarTitle: { dv: "ހަދީޘްއެމްވީ", en: "Hadithmv", ar: "حديث إم في" },
  navDashboard: {
    dv: "ފޮތްތަކުގެ ލިސްޓް",
    en: "Book list",
    ar: "قائمة الكتب",
  },
  searchBooks: {
    dv: "🔎 ފޮތްތަކުގައި ހޯދާ",
    en: "🔎 Search in books",
    ar: "🔎 البحث في الكتب",
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
  labelWidth: {
    dv: "ފުޅާމިން",
    en: "Width",
    ar: "العرض",
  },
  labelWidthFull: {
    dv: "↔️ ފުލް ސްކްރީން",
    en: "↔️ Full Screen",
    ar: "↔️ ملء الشاشة",
  },
  labelTheme: { dv: "ތީމް", en: "Theme", ar: "المظهر" },
  labelSettings: { dv: "ސެޓިންގްސް", en: "Settings", ar: "الإعدادات" },
  settingsFont: { dv: "ފޮންޓް", en: "Font", ar: "الخط" },
  btnOpenFontText: {
    dv: "ފޮންޓް ސެޓިންގްސް",
    en: "Font settings",
    ar: "إعدادات الخط",
  },
  settingsLanguage: { dv: "ބަސް", en: "Language", ar: "اللغة" },
  labelFontSize: { dv: "ފޮންޓް ސައިޒު", en: "Font size", ar: "حجم الخط" },
  labelFontFamily: { dv: "ފޮންޓް ވައްތަރު", en: "Font", ar: "نوع الخط" },
  fontHadithmv: {
    dv: "ހަދީޘްއެމްވީ ފޮންޓް",
    en: "Hadithmv Font",
    ar: "خط هاديث-ام-في",
  },
  fontSystem: { dv: "ސިސްޓަމް ފޮންޓް", en: "System Font", ar: "خط النظام" },

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
    dv: "ލޯޑުވަނީ...",
    en: "Loading…",
    ar: "…جارٍ تحميل",
  },

  // ── Progress ──
  qrnCompleted: {
    dv: "ނިމުނީ",
    en: "Complete",
    ar: "اكتمل",
  },
  surahCompleted: {
    dv: "ސޫރަތް ނިމުނީ!",
    en: "Surah completed!",
    ar: "اكتملت السورة!",
  },

  // ── Quran content presets ──
  qrnNoMatch: {
    dv: "އެއްވެސް ސޫރަތެއް ނުފެނުނު",
    en: "No surahs found",
    ar: "لا توجد سور",
  },
  qrnPresetMain: { dv: "މައި", en: "Main", ar: "الأساسي" },
  qrnPresetAll: { dv: "ހުރިހާ", en: "All", ar: "الكل" },
  qrnPresetArabic: { dv: "އަރަބި", en: "Arabic", ar: "عربي" },
  qrnPresetReset: { dv: "ރީސެޓް", en: "Reset", ar: "ضبط" },

  // ── Dashboard ──
  dashboardSearchPlaceholder: {
    dv: "ފޮތް ހޯދާ…",
    en: "Search books…",
    ar: "…ابحث عن كتاب",
  },
  dashboardSortAZ: { dv: "އ ← ޒ", en: "A → Z", ar: "أ ← ز " },
  dashboardSortZA: { dv: "ޒ → އ", en: "Z ← A", ar: "ز → أ" },
  dashboardBooksLabel: { dv: "ފޮތްތައް:", en: "Books:", ar: "الكتب:" },
  tagsLabel: { dv: "ޓެގުތައް:", en: "Tags:", ar: "الوسوم:" },
  tagsShowMore: {
    dv: "އިތުރު ޓެގުތައް",
    en: "More tags",
    ar: "المزيد من الوسوم",
  },
  tagsShowFewer: { dv: "މަދު ޓެގުތައް", en: "Less tags", ar: "أقل من الوسوم" },
  tagFilterAll: { dv: "ހުރިހާ", en: "All", ar: "الكل" },
  continueReading: {
    dv: "ފަހުން ކިޔުނީ:",
    en: "Continue reading:",
    ar: "متابعة القراءة:",
  },
  dashboardNoMatch: {
    dv: "އެއްވެސް ފޮތެއް ނުފެނުނު",
    en: "No books found",
    ar: "لا توجد كتب",
  },
  libSearchPlaceholder: {
    dv: "ގިނަ ފޮތްތަކުން އެއްފަހަރާ ހޯދާ...",
    en: "Search multiple books at once…",
    ar: "ابحث في كتب متعددة في آن واحد...",
  },
  libSearching: { dv: "ހޯދަނީ...", en: "Searching…", ar: "جارٍ البحث…" },
  libSearchHint: {
    dv: "ގިނަ ފޮތްތަކުން ހޯދުމަށް ލިޔޭ",
    en: "Type to search multiple books",
    ar: "اكتب للبحث في كتب متعددة ",
  },
  libNoResults: {
    dv: "އެއްވެސް ނަތީޖާއެއް ނެތް",
    en: "No results",
    ar: "لا توجد نتائج",
  },
  libBookMatches: { dv: "{n} ނަތީޖާ", en: "{n} matches", ar: "{n} نتيجة" },
  libResultSummary: {
    dv: "{b} ފޮތެއްގައި، {a} ނަތީޖާ",
    en: "{a} matches in {b} books",
    ar: "{a} نتيجة في {b} كتاب",
  },
  libShowNext: {
    dv: "އިތުރު {n} ނަތީޖާ ދެއްކުން",
    en: "Show next {n} matches",
    ar: "عرض {n} نتيجة أخرى",
  },
  // Book-scope picker (narrow the search to specific books)
  // The button's purpose prefix — pairs with the state label ("All books" /
  // "N books"), echoing the modal title's own "search in" phrasing.
  libScopeSearchIn: { dv: "ސާޗުކުރަނީ:", en: "Search in:", ar: "البحث في:" },
  libScopeAll: { dv: "ހުރިހާ ފޮތަކުން", en: "All books", ar: "كل الكتب" },
  libScopeCount: { dv: "{n} ފޮތް", en: "{n} books", ar: "{n} كتب" },
  libScopeCountOne: { dv: "1 ފޮތް", en: "1 book", ar: "1 كتاب" },
  // ── Authors & periods (library facets) ──
  // Emoji lives INSIDE the values: data-i18n sets textContent to the
  // translation, wiping any emoji baked into the button's HTML (see
  // dashboardHistoryBtn / searchBtnLabel for the same pattern).
  libAuthors: { dv: "✍️ މުއައްލިފުން", en: "✍️ Authors", ar: "✍️ المؤلفون" },
  libPeriods: { dv: "🗓️ ޒަމާންތައް", en: "🗓️ Periods", ar: "🗓️ الفترات" },
  libAuthorsTitle: {
    dv: "މުއައްލިފުން",
    en: "Browse by author",
    ar: "تصفح حسب المؤلف",
  },
  libPeriodsTitle: {
    dv: "ޒަމާންތައް",
    en: "Browse by period",
    ar: "تصفح حسب الفترة",
  },
  libAuthorsFilter: {
    dv: "މުއައްލިފުން ހޯދާ…",
    en: "Filter authors…",
    ar: "ابحث عن المؤلفين…",
  },
  libPeriodsFilter: {
    dv: "ޒަމާންތައް ހޯދާ…",
    en: "Filter periods…",
    ar: "ابحث عن الفترات…",
  },
  libAuthorsNoMatch: {
    dv: "އެއްވެސް މުއައްލިފެއް ނުފެނުނު",
    en: "No authors match",
    ar: "لا يوجد مؤلفون مطابقون",
  },
  libPeriodsNoMatch: {
    dv: "އެއްވެސް ޒަމާނެއް ނުފެނުނު",
    en: "No periods match",
    ar: "لا توجد فترات مطابقة",
  },
  facetColAuthor: { dv: "މުއައްލިފު", en: "Author", ar: "المؤلف" },
  facetColAuthorAr: { dv: "އަރަބި ނަން", en: "Arabic name", ar: "الاسم العربي" },
  facetColCentury: { dv: "ގަރުނު", en: "Century", ar: "القرن" },
  facetColYears: { dv: "އަހަރު", en: "Years", ar: "السنوات" },
  facetColGregorian: { dv: "މީލާދީ", en: "Gregorian", ar: "ميلادي" },
  facetColBooks: { dv: "ފޮތް", en: "Books", ar: "الكتب" },
  authorDied: { dv: "ނިޔާވީ {y} ހ.", en: "d. {y} AH", ar: "ت {y}هـ" },
  authorLife: { dv: "{b}–{d} ހ.", en: "{b}–{d} AH", ar: "{b}–{d}هـ" },
  authorLifeCe: { dv: "{b}–{d} މ.", en: "{b}–{d} CE", ar: "{b}–{d}م" },
  authorDiedCe: { dv: "ނިޔާވީ {y} މ.", en: "d. {y} CE", ar: "ت {y}م" },
  // Hijri centuries of the author's death year (1–15), plus the modern
  // bucket — numeral labels ("Century 3") shared by the authors' century
  // column, the periods' name column and the chips.
  century1: { dv: "ގަރުނު 1", en: "Century 1", ar: "القرن 1" },
  century2: { dv: "ގަރުނު 2", en: "Century 2", ar: "القرن 2" },
  century3: { dv: "ގަރުނު 3", en: "Century 3", ar: "القرن 3" },
  century4: { dv: "ގަރުނު 4", en: "Century 4", ar: "القرن 4" },
  century5: { dv: "ގަރުނު 5", en: "Century 5", ar: "القرن 5" },
  century6: { dv: "ގަރުނު 6", en: "Century 6", ar: "القرن 6" },
  century7: { dv: "ގަރުނު 7", en: "Century 7", ar: "القرن 7" },
  century8: { dv: "ގަރުނު 8", en: "Century 8", ar: "القرن 8" },
  century9: { dv: "ގަރުނު 9", en: "Century 9", ar: "القرن 9" },
  century10: { dv: "ގަރުނު 10", en: "Century 10", ar: "القرن 10" },
  century11: { dv: "ގަރުނު 11", en: "Century 11", ar: "القرن 11" },
  century12: { dv: "ގަރުނު 12", en: "Century 12", ar: "القرن 12" },
  century13: { dv: "ގަރުނު 13", en: "Century 13", ar: "القرن 13" },
  century14: { dv: "ގަރުނު 14", en: "Century 14", ar: "القرن 14" },
  century15: { dv: "ގަރުނު 15", en: "Century 15", ar: "القرن 15" },
  centuryModern: { dv: "ފަހުގެ", en: "Modern", ar: "معاصر" },
  libScopeFilter: {
    dv: "ފޮތް ފިލްޓަރުކުރޭ…",
    en: "Filter books…",
    ar: "تصفية الكتب…",
  },
  libScopeFoot: {
    dv: "{m} / {n} ފޮތް ހޮވިފައި",
    en: "{n} of {m} books selected",
    ar: "تم اختيار {n} من {m} كتب",
  },
  libScopeNoMatch: {
    dv: "ފިލްޓަރަށް އެއްވެސް ފޮތެއް ނުފެނުނު",
    en: "No books match the filter",
    ar: "لا توجد كتب مطابقة للتصفية",
  },
  libScopeReset: {
    dv: "↺ ރީސެޓް",
    en: "↺ Reset",
    ar: "↺ إعادة تعيين",
  },
  libScopeTitle: {
    dv: "ސާޗުކުރާނޭ ފޮތްތައް އިޚްތިޔާރުކުރޭ",
    en: "Select books to search in",
    ar: "اختر الكتب للبحث فيها",
  },
  libScopeTypesLabel: {
    dv: "ޓެގުތައް",
    en: "Tags",
    ar: "الوسوم",
  },
  dashboardClearAll: {
    dv: "އެއްކޮށް ފޮހެލާ&nbsp;&nbsp;✕",
    en: "Clear all&nbsp;&nbsp;✕",
    ar: "مسح الكل&nbsp;&nbsp;✕",
  },
  ddColSort: { dv: "ތަރުތީބު", en: "Sort", ar: "ترتيب" },
  ddColBook: { dv: "ފޮތް", en: "Book", ar: "كتاب" },
  ddColPage: { dv: "ސަފްހާ", en: "Page", ar: "صفحة" },
  ddColPageShort: { dv: "ސ", en: "Pg", ar: "ص" },
  // Mobile drops the full words too — glyph headers keep the thin columns thin
  ddColSortShort: { dv: "⇅", en: "⇅", ar: "⇅" },
  ddColRemoveShort: { dv: "✕", en: "✕", ar: "✕" },
  ddColTime: { dv: "ވަގުތު", en: "Time", ar: "وقت" },
  ddColRemove: { dv: "ފޮހެލާ", en: "Remove", ar: "حذف" },
  ddColIdx: { dv: "#", en: "#", ar: "#" },
  advancedLogicAND: { dv: "އަދި", en: "AND", ar: "و" },
  advancedLogicOR: { dv: "ނުވަތަ", en: "OR", ar: "أو" },
  pinsEmpty: {
    dv: "ޕިންކޮށްފައިވާ ފޮތެއް ނެތް",
    en: "No pinned books",
    ar: "لا توجد كتب مثبتة",
  },
  historyEmpty: {
    dv: "ކިޔާފައިވާ ފޮތެއް ނެތް",
    en: "No reading history",
    ar: "لا يوجد سجل قراءة",
  },
  toastPinned: { dv: "ޕިން ކުރެވިއްޖެ", en: "Bookmarked", ar: "تم التثبيت" },
  toastPinReplaced: {
    dv: "ޕިންތައް ފުރިގެން އެންމެ ކުރީގެ ޕިން ފޮހެވިއްޖެ",
    en: "Pins full, oldest pin removed",
    ar: "التثبيتات ممتلئة، وتمت إزالة أقدم تثبيت",
  },
  // Pins are full and pinning would evict the oldest pin — the reader asks
  // first, naming the pin that would be dropped ({name} via confirmModal's
  // params substitution, same syntax as fillTemplate).
  confirmPinReplace: {
    dv: 'ޕިންތައް ފުރިއްޖެ — ޕިންކުރާ ނަމަ، އެންމެ ކުރީގެ ޕިން "{name}" ގެއްލޭނެ.',
    en: 'Pins are full — If you pin, the oldest pin "{name}" will be replaced.',
    ar: 'التثبيتات ممتلئة — إذا قمت بالتثبيت، سيتم استبدال أقدم تثبيت "{name}".',
  },
  confirmPinReplaceBtn: { dv: "ޕިންކުރޭ", en: "Pin it", ar: "ثبتها" },
  toastUnpinned: {
    dv: "ފޮހެވިއްޖެ",
    en: "Removed",
    ar: "تمت الإزالة",
  },
  relativeJustNow: { dv: "ދެންމެ", en: "just now", ar: "الآن" },
  relativeMinutes: { dv: "މިނެޓް ކުރިން", en: "m ago", ar: "د" },
  relativeHours: { dv: "ގަޑިއިރު ކުރިން", en: "h ago", ar: "س" },
  relativeDays: { dv: "ދުވަސް ކުރިން", en: "d ago", ar: "ي" },
  relativeMinutesShort: { dv: "މިނެޓް", en: "m", ar: "د" },
  relativeHoursShort: { dv: "ގަޑިއިރު", en: "h", ar: "س" },
  relativeDaysShort: { dv: "ދުވަސް", en: "d", ar: "ي" },
  searchClearHistory: {
    // icon AFTER the text — natural reading order in both directions
    dv: "ހިސްޓަރީ ފޮހެލާ ✕",
    en: "Clear history ✕",
    ar: "مسح السجل ✕",
  },

  // ── Search window (reader + library pages) ──
  searchWindowTitle: { dv: "ސާޗު", en: "Search", ar: "بحث" },
  // The side pane's heading — the window's analogue of libScopeTypesLabel:
  // the pane holds the tabs, options, view toggle, advanced conditions and
  // history, so it is the search's controls column.
  searchWindowSideLabel: {
    dv: "ސާޗު ކޮންޓްރޯލްތައް",
    en: "Search controls",
    ar: "عناصر التحكم",
  },
  // The magnifier button that opens the window — emoji is part of the label
  // (same pattern as the sidebar's searchBooks, so data-i18n re-renders
  // keep it). dv is the verb form, matching the replaced placeholder's
  // family ("މި ފޮތުން ހޯދާ…").
  searchBtnLabel: {
    dv: "🔍 ސާޗު",
    en: "🔍 Search",
    ar: "🔍 بحث",
  },
  searchWindowThisBook: {
    dv: "މި ފޮތުން",
    en: "This book",
    ar: "هذا الكتاب",
  },
  searchWindowAllBooks: {
    dv: "ހުރިހާ ފޮތަކުން",
    en: "All books",
    ar: "كل الكتب",
  },
  searchWindowNoHistory: {
    dv: "ހިސްޓަރީއެއް ނެތް",
    en: "No search history",
    ar: "لا يوجد سجل بحث",
  },
  searchWindowWholeWord: {
    dv: "ލަފުޒުތައް ހަމައަށް އިންގޮތަށް",
    en: "Whole Words Only",
    ar: "كلمات كاملة فقط",
  },
  searchWindowHistoryTitle: {
    dv: "ސާޗު ހިސްޓަރީ",
    en: "Search history",
    ar: "سجل البحث",
  },
  // The results pane's empty-state placeholder (history has its own
  // section in the side pane, so the results column prompts instead).
  searchWindowEmptyHint: {
    dv: "ސާޗުގައި ލިޔަން ފެށުމުން ނަތީޖާ ފެންނާނެ",
    en: "Results appear as you type in search",
    ar: "تظهر النتائج أثناء الكتابة في البحث",
  },
  searchWindowOpenPage: {
    dv: "ބޮޑު ސަފުހާއެއްގައި ހުޅުވާ",
    en: "Open in full page",
    ar: "افتح في صفحة كاملة",
  },
  searchWindowIndexLoading: {
    dv: "ފޮތްތައް ތައްޔާރުވަނީ…",
    en: "Loading book index…",
    ar: "جارٍ تحميل فهرس الكتب…",
  },
  searchWindowIndexError: {
    dv: "ފޮތްތައް ލޯޑުވެގެން ނުދެއެ",
    en: "Book index could not be loaded",
    ar: "تعذر تحميل فهرس الكتب",
  },
  searchWindowCardView: {
    dv: "ކާޑު",
    en: "Card view",
    ar: "عرض البطاقات",
  },
  searchWindowListView: {
    dv: "ލިސްޓް",
    en: "List view",
    ar: "عرض القائمة",
  },
  searchWindowOpenHint: {
    dv: "↑↓ ބަދަލުކުރުމަށް · Enter ދިޔުމަށް · Esc ލެއްޕުމަށް",
    en: "↑↓ Navigate · Enter open · Esc close",
    ar: "↑↓ تنقّل · Enter فتح · Esc إغلاق",
  },
  dashboardColTitleAR: {
    dv: "އަރަބި ނަން",
    en: "Arabic name",
    ar: "الاسم العربي",
  },
  dashboardColTitleDV: {
    dv: "ދިވެހި ނަން",
    en: "Dhivehi name",
    ar: "الاسم الديفهي",
  },
  dashboardColTitleEN: {
    dv: "އިނގިރޭސި ނަން",
    en: "English name",
    ar: "الاسم الإنجليزي",
  },
  dashboardColTags: { dv: "ޓޭގް", en: "Tags", ar: "وسوم" },

  // ── Quran navigation ──
  qrnSurah: { dv: "ސޫރަތް:", en: "Surah:", ar: "سورة:" },
  qrnAyah: { dv: "އާޔަތް:", en: "Ayah:", ar: "آية:" },
  qrnJuz: { dv: "ޖުޒް:", en: "Juz:", ar: "جزء:" },
  qrnContent: {
    dv: "އިތުރު ފޮތްތަކުން ▾",
    en: "Other content ▾",
    ar: "محتوى آخر ▾",
  },
  qrnToggleAyahNum: {
    dv: "އާޔަތް ނަންބަރު",
    en: "Ayah number",
    ar: "رقم الآية",
  },
  qrnToggleBraces: {
    dv: "ގުރުއާން ބްރެކެޓް",
    en: "Quranic braces",
    ar: "أقواس قرآنية",
  },
  qrnSurahSearch: {
    dv: "…ސޫރަތް ހޯދާ",
    en: "Search surah…",
    ar: "…ابحث عن سورة",
  },

  // ── Dashboard pins / history ──
  dashboardPinsBtn: { dv: "📌 ޕިންތައް", en: "📌 Pins", ar: "📌 دبابيس" },
  dashboardHistoryBtn: { dv: "🕐 ހިސްޓަރީ", en: "🕐 History", ar: "🕐 السجل" },
  dashboardPinsChip: { dv: "ޕިން", en: "Pins", ar: "دبابيس" },

  // ── Column display labels (selection chrome only — the advanced-search
  // column dropdown and the column toggle buttons). Table/card headers keep
  // their raw CSV identifiers; these names are for the controls that pick
  // columns. Keys are consumed by js/column-labels.js, which resolves a
  // header like "bodyDV" into colBody + colLangDV ("Body (Dhivehi)").
  colBody: { dv: "މައިލިޔުން", en: "Body", ar: "المتن" },
  colHead: { dv: "ސުރުހީ", en: "Heading", ar: "العنوان" },
  colWord: { dv: "ލަފްޒު", en: "Word", ar: "الكلمة" },
  colFoot: { dv: "ފުޓްނޯޓު", en: "Footnote", ar: "الحاشية" },
  colMatn: { dv: "މަތުނު", en: "Matn", ar: "المتن" },
  colSharh: { dv: "ޝަރަހަ", en: "Commentary", ar: "الشرح" },
  colMean: { dv: "މާނަ", en: "Meaning", ar: "المعنى" },
  colKitab: { dv: "ފޮތް", en: "Book", ar: "الكتاب" },
  colBab: { dv: "ބާބު", en: "Chapter", ar: "الباب" },
  colTakhrij: { dv: "ތަޚްރީޖު", en: "Takhrij", ar: "التخريج" },
  colSource: { dv: "މަސްދަރު", en: "Source", ar: "المصدر" },
  colPageNo: { dv: "ސަފްހާ #", en: "Page #", ar: "رقم الصفحة" },
  colRowNo: { dv: "ނަމްބަރު", en: "Row #", ar: "الرقم" },
  colDate: { dv: "ތާރީޚު", en: "Date", ar: "التاريخ" },
  colTime: { dv: "ޒަމާން", en: "Time", ar: "الزمن" },
  colNote: { dv: "ނޯޓު", en: "Note", ar: "ملاحظة" },
  colExample: { dv: "މިސާލު", en: "Example", ar: "المثال" },
  colNumber: { dv: "ނަމްބަރު", en: "Number", ar: "الرقم" },
  colTitle: { dv: "ސުރުހީ", en: "Title", ar: "العنوان" },
  colTranslation: { dv: "ތަރުޖަމާ", en: "Translation", ar: "الترجمة" },
  colTafsir: { dv: "ތަފްސީރު", en: "Tafsir", ar: "التفسير" },
  colAyah: { dv: "އާޔަތް", en: "Ayah", ar: "آية" },
  colImlai: { dv: "އިމްލާއީ ރަސްމު", en: "Imlai Script", ar: "الرسم الإملائي" },
  colUthmani: {
    dv: "އުޘްމާނީ ރަސްމު",
    en: "Uthmani Script",
    ar: "الرسم العثماني",
  },
  colJuz: { dv: "ޖުޒް", en: "Juz", ar: "الجزء" },
  colSurah: { dv: "ސޫރަތް", en: "Surah", ar: "السورة" },
  colAyahNo: { dv: "އާޔަތް #", en: "Ayah #", ar: "رقم الآية" },
  colBasmalah: { dv: "ބިސްމި", en: "Basmalah", ar: "البسملة" },
  colAuthor: { dv: "މުއައްލިފު", en: "Author", ar: "المؤلف" },
  colCategory: { dv: "ބާވަތް", en: "Category", ar: "الفئة" },
  colGender: { dv: "ޖިންސު", en: "Type", ar: "الجنس" },
  colApprovedBy: { dv: "ފާސްކުރީ", en: "Approved By", ar: "المعتمد" },
  colOriginLang: {
    dv: "އަސްލު ބަސް",
    en: "Origin Language",
    ar: "اللغة الأصلية",
  },
  colW2W: { dv: "ލަފްޒީ", en: "Word by Word", ar: "كلمة بكلمة" },
  colMainCount: { dv: "މައި ގިންތި", en: "Main Class", ar: "الطبقة الرئيسية" },
  colLiteraryCount: {
    dv: "އަދަބީ ގިންތި",
    en: "Literary Class",
    ar: "الطبقة الأدبية",
  },
  colDialect: { dv: "ބަހުރުވަ", en: "Dialect", ar: "اللهجة" },
  colDegree: { dv: "ދަރަޖަ", en: "Degree", ar: "الدرجة" },
  colArea: { dv: "ދާއިރާ", en: "Area", ar: "المنطقة" },
  colAtoll: { dv: "އަތޮޅު", en: "Atoll", ar: "الأتول" },
  colBaavaiy: { dv: "ބާވަތް", en: "Baavaiy", ar: "بافايي" },
  colLangAR: { dv: "އަރަބި", en: "Arabic", ar: "العربية" },
  colLangDV: { dv: "ދިވެހި", en: "Dhivehi", ar: "الديفهية" },
  colLangEN: { dv: "އިނގިރޭސި", en: "English", ar: "الإنجليزية" },
};

/**
 * Translate a tag code. Pass lang to override current language.
 * The per-language labels come from the tag registry — book-data.js loads
 * each tag as {dv,en,ar} and every render site threads it through as
 * `fallback`; a plain string fallback is still accepted for legacy callers.
 */
export function tagLabel(code, fallback, lang) {
  var l = lang || _currentLang;
  if (fallback && typeof fallback === "object") {
    if (fallback[l]) return fallback[l];
    if (fallback.en) return fallback.en;
    if (fallback.ar) return fallback.ar;
  }
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
  if (!entry) {
    console.warn('i18n: missing key "' + key + '"');
    return key;
  }
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

/** Apply lang + data-lang attributes and re-translate all [data-i18n] elements. */
function applyDocumentLang() {
  document.documentElement.lang = _currentLang;
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
  // Fire event so reader can update dynamic text
  document.dispatchEvent(new CustomEvent("languagechange"));
}

/** Call once on page load to apply initial translations. */
export function initI18n() {
  var sel = document.getElementById("selLanguage");
  if (sel) sel.value = _currentLang;
  applyDocumentLang();
}
