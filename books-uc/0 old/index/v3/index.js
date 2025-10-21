document.addEventListener("DOMContentLoaded", () => {
  // Configuration
  const INITIAL_ITEMS_TO_SHOW = 12; // Increased slightly for better desktop view

  // === FULL SITE DATA ===
  // Transcribed from original index.html
  const siteData = [
    {
      id: "quran",
      titleAr: "القرآن والتفسير",
      titleDv: "ގުރްއާނާއި ތަފްސީރު",
      items: [
        {
          titleAr: "ترجمة حديث إم في",
          titleDv: "ޙަދީޘްއެމްވީގެ ތަރުޖަމާ",
          url: "../books/quranHadithmv.html",
        },
        {
          titleAr: "الترجمة الرسمية",
          titleDv: "ރަސްމީ ތަރުޖަމާ",
          url: "../books/quranRasmee.html",
          status: "(ރައީސުލްޖުމްހޫރިއްޔާގެ އޮފީސް)",
        },
        {
          titleAr: "ترجمة بكر بي",
          titleDv: "ބަކުރުބެގެ ތަރުޖަމާ",
          url: "../books/quranBakurube.html",
        },
        {
          titleAr: "تفسير القرآن لجعفر",
          titleDv: "ޖަޢުފަރުގެ ގުރްއާން ތަފްސީރު*",
          url: "../books/quranJaufar.html",
        },
        {
          titleAr: "تفسير العشر الأخير",
          titleDv: "ގުރްއާނުގެ ފަހު ދިހަބައި ކުޅަ އެއްބައިގެ ތަފްސީރު",
          url: "../books/quranUshru.html",
        },
        {
          titleAr: "معجم ألفاظ القرآن",
          titleDv: "ގުރްއާން ލަފްޒުތަކުގެ ރަދީފު",
          url: "../books/radheefQuran.html",
        },
        {
          titleAr: "ترجمة التفسير الميسر",
          titleDv: "ތަފްސީރު އަލްމުޔައްސަރުގެ ތަރުޖަމާ",
          url: "#",
          status: "(ތައްޔާރުވަނީ...)",
        },
        {
          titleAr: "ترجمة ملنجي حسين ديدي",
          titleDv: "މަލިންގޭ ޙުސައިންދީދީގެ ތަރުޖަމާއާއި ތަފްސީރު",
          url: "https://archive.org/details/malinge-hussain-didi-quran-tharujamaa-aai-thafseer",
          status: "(PDF)",
          keywords: "malinge hussain didi",
        },
        {
          titleAr: "التفسير الميسر (النص)",
          titleDv: "(އަރަބި ނައްސުގެ ލިންކު)",
          url: "https://read.tafsir.one/almuyassar",
        },
        {
          titleAr: "المختصر في التفسير",
          titleDv: "(ލިންކު)",
          url: "https://read.tafsir.one/almukhtasar",
        },
        {
          titleAr: "تفسير السعدي",
          titleDv: "(ލިންކު)",
          url: "https://read.tafsir.one/alsidi",
        },
        {
          titleAr: "الميسر في غريب القرآن",
          titleDv: "(ލިންކު)",
          url: "https://read.tafsir.one/almuyassar-g",
        },
        {
          titleAr: "إعراب القرآن",
          titleDv: "(ލިންކު)",
          url: "https://surahpedia.com/ar/projects/45",
        },
        {
          titleAr: "الإعراب المرسوم",
          titleDv: "(ލިންކު)",
          url: "https://tafsir.app/iraab-graphs/1/1",
        },
        {
          titleAr: "بطاقات تعريف السور",
          titleDv: "(ލިންކު)",
          url: "https://albitaqat.com",
        },
        {
          titleAr: "موسوعة القراءات",
          titleDv: "(ލިންކު)",
          url: "https://shamela.ws/book/23610/1916",
        },
        {
          titleAr: "مصحف التجويد",
          titleDv: "ތަޖްވީދު މުސްހަފު",
          url: "https://archive.org/details/mushaf-tajwid-darul-marifa",
          status: "(PDF)",
        },
        {
          titleAr: "جهود علماء المالديف في ترجمة معاني القرآن",
          titleDv:
            "ގުރްއާން ތަރުޖަމާކުރުމުގައި ދިވެހި އިލްމުވެރިން ކުރި މަސައްކަތް",
          url: "https://archive.org/details/juhud-ulama-al-maldif-fi-tarjamati-maanil-quran-wa-tafsirihi",
          status: "(އަރަބި PDF)",
        },
        {
          titleAr: "الروايات التفسيرية في فتح الباري",
          titleDv: "(ފަތްޙުލް ބާރީގައި ހުރި ތަފްސީރީ ރިވާޔަތްތައް)",
          url: "https://shamela.ws/book/7447",
          status: "(އަރަބި)",
        },
        {
          titleAr: "القرآن في صفحة واحدة",
          titleDv: "މުޅި ގުރްއާން އެއް ސަފުހާއެއްގައި",
          url: "https://archive.org/details/entire-quran-on-one-page",
          status: "(PDF)",
        },
      ],
    },
    {
      id: "hadith",
      titleAr: "الحديث والأثر",
      titleDv: "ޙަދީޘާއި އަޘަރު",
      items: [
        {
          titleAr: "الجامع في الأحاديث والآثار",
          titleDv: "އެއްކުރަމުންދާ ޙަދީޘާއި އަޘަރު",
          url: "../books/allAthar.html",
          keywords: "jami athar full collection",
        },
        {
          titleAr: "موطأ مالك*",
          titleDv: "މުވައްޠައު މާލިކު",
          url: "../books/muwattaMalik.html",
          status: "(ނިމެނީ)",
        },
        {
          titleAr: "عمدة الأحكام",
          titleDv: "ޢުމްދަތުލް އަޙްކާމް",
          url: "../books/umdathulAhkam.html",
        },
        {
          titleAr: "حصن المسلم",
          titleDv: "މުސްލިމުންގެ ކިއްލާ",
          url: "../books/hisnulMuslim.html",
          keywords: "dua dhikr zikr",
        },
        {
          titleAr: "الأربعون للآجري*",
          titleDv: "އާޖުއްރީގެ ސާޅީސް ޙަދީޘް",
          url: "../books/arbaoonAajurry.html",
          status: "(އެކުލަވާ ނުނިމޭ)",
        },
        {
          titleAr: "كتاب العلم لأبي خيثمة",
          titleDv: "އަބޫ ޚައިޘަމާ ލިޔުނު އިލްމުގެ ފޮތް",
          url: "../books/kitabulIlmAbiKhaithama.html",
        },
        {
          titleAr: "أخبار الشيوخ وأخلاقهم للمروذي",
          titleDv: "ޝައިޚުންގެ ޚަބަރުތަކާއި އެ ބޭކަލުންގެ އަޚްލާގު",
          url: "../books/akhbaruShuyukh.html",
        },
        {
          titleAr: "أخلاق حملة القرآن للآجري",
          titleDv: "އާޖުއްރީ ލިޔުނު ގުރްއާން އުފުލާ މީހުންގެ އަޚްލާގު",
          url: "../books/akhlaqHamalathilQuran.html",
        },
        {
          titleAr: "بلوغ المرام*",
          titleDv: "ބުލޫޣުލް މަރާމް",
          url: "../books/bulughulMaram.html",
          status: "(މުރާޖާކުރަނީ)",
        },
        {
          titleAr: "الأربعون النووية",
          titleDv: "ނަވަވީގެ ސާޅީސް ޙަދީޘް",
          url: "../books/arbaoonNawawi.html",
          keywords: "40 nawawi",
        },
        {
          titleAr: "تيسير مصطلح الحديث",
          titleDv: "ޙަދީޘް މުސްޠަލަޙު ފަސޭހަކުރުން",
          url: "https://archive.org/details/uloomul-hadith-dv-ahmed-faruq-mohamed",
          status: "(PDF)",
        },
      ],
    },
    {
      id: "aqida",
      titleAr: "العقيدة والمنهج",
      titleDv: "އަގީދާއާއި މަންހަޖު",
      items: [
        {
          titleAr: "الجامع في العقائد",
          titleDv: "އެއްކުރަމުންދާ އަގީދާގެ ފޮތްތައް",
          url: "../books/allAqida.html",
        },
        {
          titleAr: "أسماء الله الحسنى",
          titleDv: "ﷲ ގެ އެންމެ ރިވެތި އިސްމުފުޅުތައް",
          url: "../books/asmaullahilHusna.html",
          status: "(މުރާޖާކުރަނީ)",
        },
        {
          titleAr: "أصول السنة لأحمد",
          titleDv: "އަޙްމަދު ލިޔުނު ސުންނަތުގެ އުސޫލުތައް",
          url: "../books/usooluSunnahAhmed.html",
          status: "(މުރާޖާކުރަނީ)",
        },
        {
          titleAr: "شرح السنة للبربهاري",
          titleDv: "ބަރްބަހާރީ ލިޔުނު ސުންނަތުގެ ޝަރަހަ",
          url: "../books/sharhuSunnahBarbahari.html",
        },
        {
          titleAr: "عقيدة الرازيين",
          titleDv: "ދެ ރާޒީންގެ އަގީދާ",
          url: "../books/aqidatuRaziyain.html",
        },
        {
          titleAr: "كلمة الإخلاص لابن رجب",
          titleDv: "އިބްނު ރަޖަބު ލިޔުނު އިޚްލާސްގެ ކަލިމަ",
          url: "../books/kalimathulIkhlas.html",
        },
        {
          titleAr: "تلخيص العقيدة من كتاب الشريعة",
          titleDv: "އާޖުއްރީގެ ޝަރީއަތް ފޮތުގެ އަގީދާގެ ޚުލާސާއެއް",
          url: "../books/talkhisKitabiShariah.html",
        },
        {
          titleAr: "الانتصار لأصحاب الحديث",
          titleDv: "ޙަދީޘްގެ އަސްހާބުންނަށް ނަސްރުދިނުން",
          url: "../books/intisarLiAshabilHadith.html",
        },
        {
          titleAr: "عقيدة السلف للصابوني",
          titleDv: "އައްޞާބޫނީ ލިޔުނު ސަލަފުންގެ އަގީދާ",
          url: "../books/aqidatuSalafSoabuni.html",
        },
        {
          titleAr: "كتاب الإيمان لأبي عبيد",
          titleDv: "އަބޫ ޢުބައިދު ލިޔުނު އީމާންކަމުގެ ފޮތް",
          url: "../books/kitabulEmanAbiUbaid.html",
        },
        {
          titleAr: "نواقض الإسلام",
          titleDv: "އިސްލާމްކަން ގެއްލޭ ކަންކަން",
          url: "../books/nawaqidulIslam.html",
        },
        {
          titleAr: "‌‌القواعد الأربع",
          titleDv: "ހަތަރު ގަވާއިދު",
          url: "../books/qawaidulArbau.html",
        },
        {
          titleAr: "الأصول الستة",
          titleDv: "ހަ އުސޫލު",
          url: "../books/usooluSiththa.html",
        },
        {
          titleAr: "الأصول الثلاثة",
          titleDv: "ތިން އުސޫލު",
          url: "../books/usooluThalaatha.html",
        },
        {
          titleAr: "أحكام تهم المسلم",
          titleDv: "މުސްލިމަކަށް މުހިއްމުވާ ހުކުމްތައް",
          url: "../books/quranUshru.html#tableID=:p69",
        },
        {
          titleAr: "مختصر في توحيد الأسماء والصفات",
          titleDv: "އިސްމުފުޅުތަކާއި ސިފަފުޅުތަކުގެ ޚުލާޞާ",
          url: "../books/mukhtasarTauhidilAsmaWaSifat.html",
        },
        {
          titleAr: "حقوق دعت إليها الفطرة",
          titleDv: "ފިތުރަތުން އެ ކަންކަމަށް ގޮވާލާ ހައްގުތައް",
          url: "../books/huquqDaathIlaihalFitra.html",
        },
        {
          titleAr: "من خلقني ولماذا؟",
          titleDv: "އަހަރެން އުފެއްދެވީ ކާކު؟ އަދި ކީއްވެ؟",
          url: "../books/manKhalaqaniWaLimaza.html",
        },
      ],
    },
    {
      id: "language",
      titleAr: "اللغة والكتابة",
      titleDv: "ބަހާއި ލިޔުންތެރިކަން",
      items: [
        {
          titleAr: "الجامع في المعاجم",
          titleDv: "އެއްކުރަމުންދާ ރަދީފުތައް",
          url: "../books/radheefAll.html",
        },
        {
          titleAr: "مناهج معهد تعليم اللغة العربية",
          titleDv: "މަދީނާ އަރަބި ފޮތްތައް",
          url: "https://hadithmv.github.io/mauhad/arabic.html",
        },
        {
          titleAr: "معجم اللغة الديفهية",
          titleDv: "ދިވެހިބަހުގެ ރަދީފު (ރަސްމީ)",
          url: "../books/radheefRasmee.html",
        },
        {
          titleAr: "معجم الأسماء",
          titleDv: "އެއްކުރަމުންދާ ނަންފޮތް",
          url: "../books/radheefNanfoiy.html",
        },
        {
          titleAr: "معجم ألفاظ القرآن",
          titleDv: "ގުރްއާން ލަފްޒުތަކުގެ ރަދީފު",
          url: "../books/radheefQuran.html",
        },
        {
          titleAr: "معجم الإيقاظ",
          titleDv: "އަލްއީގާޡް (އަރަބި ދިވެހި ރަދީފު)",
          url: "../books/radheefEegaal.html",
        },
        {
          titleAr: "معجم مانِك",
          titleDv: "މަނިކުގެ ދިވެހި އިނގިރޭސި ރަދީފު",
          url: "../books/radheefManiku.html",
          keywords: "manik etymological",
        },
        {
          titleAr: "معجم أحمد فهمي",
          titleDv: "އަޙްމަދު ފަހްމީގެ ރަދީފު",
          url: "../books/radheefAhmadFahmy.html",
        },
        {
          titleAr: "استخدام اللغة الديفيهية وفقا لقواعدها",
          titleDv: "ބަހުގެ ހަމަތަކާ އެއްގޮތަށް ދިވެހިބަސް ބޭނުންކުރުން",
          url: "../page/bahugeHamathakaEggothahDhivehibasBeynunkurun.html",
        },
        {
          titleAr: "مهارة الإلقاء",
          titleDv: "ތަޤްރީރުކުރުމުގެ ހުނަރު",
          url: "../page/taqrirukurumugeHunaru.html",
        },
        {
          titleAr: "قواعد فصل الكلمات",
          titleDv: "ލަފުޒު ވަކިކޮށް ލިޔުމުގެ ގަވާއިދު",
          url: "../page/lafzuVakikohLiyumugeQawaid.html",
        },
        {
          titleAr: "دي فهرست",
          titleDv: "ދިފިހުރިސްތު (PDF)",
          url: "https://archive.org/details/dhifihuristhu",
        },
        {
          titleAr: "أصول استخدام النقت في الديفهية",
          titleDv: "ތާނައިގައި ހުރި ނުކުތާޖެހި އަކުރުތައް",
          url: "../page/nukuthaajehiAkuruthah.html",
        },
        {
          titleAr: "قواعد اللغة الديفهية",
          titleDv: "ދިވެހިބަހުގެ ގަވާއިދު (PDF)",
          url: "https://archive.org/details/dhivehi_bahuge_qawaidhu",
        },
        {
          titleAr: "قواعد كتابة التانا",
          titleDv: "ތާނަލިޔުމުގެ ގަވާއިދު (PDF)",
          url: "https://archive.org/details/latin_akurun_liyumuge_qawaidhu",
        },
        {
          titleAr: "قواعد كتابة الحروف اللاتينية",
          titleDv: "ލެޓިން އަކުރުން ލިޔުމުގެ ގަވާއިދު (PDF)",
          url: "https://archive.org/details/latin_akurun_liyumuge_qawaidhu",
        },
      ],
    },
    {
      id: "night_quran",
      titleAr: "قراءة القرآن قبل النوم",
      titleDv: "ނިދުމުގެ ކުރިން ގުރްއާން ކިޔެވުން",
      items: [
        {
          titleAr: "سورة السجدة",
          titleDv: "ސަޖިދަ ސޫރަތް",
          url: "../books/quranHadithmv.html#tableID=p3503",
        },
        {
          titleAr: "سورة الملك",
          titleDv: "މުލްކު ސޫރަތް",
          url: "../books/quranHadithmv.html#tableID=p5241",
        },
        {
          titleAr: "سورة الإسراء",
          titleDv: "އިސްރާ ސޫރަތް",
          url: "../books/quranHadithmv.html#tableID=p2029",
        },
        {
          titleAr: "سورة الزمر",
          titleDv: "ޒުމަރު ސޫރަތް",
          url: "../books/quranHadithmv.html#tableID=p4058",
        },
        {
          titleAr: "المعوذات",
          titleDv: "އިޚްލާޞް ފަލަގި ނާސް",
          url: "../books/quranHadithmv.html#tableID=p6221",
        },
        {
          titleAr: "سورة الكافرون",
          titleDv: "ކާފިރޫން ސޫރަތް",
          url: "../books/quranHadithmv.html#tableID=p6207",
        },
        {
          titleAr: "آية الكرسي",
          titleDv: "އާޔަތުލް ކުރްސި",
          url: "../books/quranHadithmv.html#tableID=p261",
        },
        {
          titleAr: "آخر آيتين من البقرة",
          titleDv: "ބަގަރާގެ ފަހު ދެ އާޔަތް",
          url: "../books/quranHadithmv.html#tableID=p291",
        },
        {
          titleAr: "سورة الحديد",
          titleDv: "ޙަދީދު ސޫރަތް",
          url: "../books/quranHadithmv.html#tableID=p5075",
        },
        {
          titleAr: "سورة الحشر",
          titleDv: "ޙަޝްރު ސޫރަތް",
          url: "../books/quranHadithmv.html#tableID=p5126",
        },
        {
          titleAr: "سورة الصف",
          titleDv: "ޞައްފު ސޫރަތް",
          url: "../books/quranHadithmv.html#tableID=p5163",
        },
        {
          titleAr: "سورة الجمعة",
          titleDv: "ޖުމުޢާ ސޫރަތް",
          url: "../books/quranHadithmv.html#tableID=p5177",
        },
        {
          titleAr: "سورة التغابن",
          titleDv: "ތަޣާބުން ސޫރަތް",
          url: "../books/quranHadithmv.html#tableID=p5199",
        },
        {
          titleAr: "سورة الأعلى",
          titleDv: "އަޢުލާ ސޫރަތް",
          url: "../books/quranHadithmv.html#tableID=p5948",
        },
      ],
    },
    {
      id: "kahf",
      titleAr: "دار فتية الكهف",
      titleDv: "ދާރު ފިތްޔަތިލް ކަހްފި",
      items: [
        {
          titleAr: "الجامع في الكهف",
          titleDv: "އެއްކުރަމުންދާ ކަހްފުގެ ފޮތްތައް",
          url: "../books/allKahf.html",
        },
        {
          titleAr: "تلخيص العقيدة من كتاب الشريعة",
          titleDv: "އާޖުއްރީގެ ޝަރީއަތް ފޮތުގެ އަގީދާގެ ޚުލާސާއެއް",
          url: "../books/talkhisKitabiShariah.html",
        },
        {
          titleAr: "شرح السنة للبربهاري",
          titleDv: "ބަރްބަހާރީ ލިޔުނު ސުންނަތުގެ ޝަރަހަ (DFK)",
          url: "../books/sharhuSunnahBarbahari-DFK.html",
        },
        {
          titleAr: "كتاب الإيمان لأبي عبيد",
          titleDv: "އަބޫ ޢުބައިދު ލިޔުނު އީމާންކަމުގެ ފޮތް",
          url: "../books/kitabulEmanAbiUbaid.html",
        },
        {
          titleAr: "أخلاق حملة القرآن للآجري",
          titleDv: "އާޖުއްރީ ލިޔުނު ގުރްއާން އުފުލާ މީހުންގެ އަޚްލާގު",
          url: "../books/akhlaqHamalathilQuran.html",
        },
        {
          titleAr: "أخبار الشيوخ وأخلاقهم للمروذي",
          titleDv: "ޝައިޚުންގެ ޚަބަރުތަކާއި އެ ބޭކަލުންގެ އަޚްލާގު",
          url: "../books/akhbaruShuyukh.html",
        },
        {
          titleAr: "الانتصار لأصحاب الحديث",
          titleDv: "ޙަދީޘްގެ އަސްހާބުންނަށް ނަސްރުދިނުން",
          url: "../books/intisarLiAshabilHadith.html",
        },
        {
          titleAr: "كلمة الإخلاص لابن رجب",
          titleDv: "އިބްނު ރަޖަބު ލިޔުނު އިޚްލާސްގެ ކަލިމަ",
          url: "../books/kalimathulIkhlas.html",
        },
        {
          titleAr: "كتاب العلم لأبي خيثمة",
          titleDv: "އަބޫ ޚައިޘަމާ ލިޔުނު އިލްމުގެ ފޮތް",
          url: "../books/kitabulIlmAbiKhaithama.html",
        },
        {
          titleAr: "عقيدة السلف للصابوني",
          titleDv: "އައްޞާބޫނީ ލިޔުނު ސަލަފުންގެ އަގީދާ",
          url: "../books/aqidatuSalafSoabuni.html",
        },
      ],
    },
    {
      id: "academy",
      titleAr: "أكاديمية حديث إم في",
      titleDv: "ޙަދީޘްއެމްވީ އެކެޑެމީ",
      items: [
        {
          titleAr: "مناهج معهد تعليم اللغة العربية",
          titleDv: "މަދީނާ އަރަބި ފޮތްތައް",
          url: "https://hadithmv.github.io/mauhad/arabic.html",
        },
        {
          titleAr: "متون طالب العلم - م1",
          titleDv:
            "ފުރަތަމަ ފިޔަވަހި: ނަވާޤިޟް، ޤަވާޢިދުލް އަރްބަޢު، އުޞޫލުޘް ޘަލާޘާ، އަރްބަޢޫން ނަވަވީ",
          url: "#",
          keywords: "level 1 mutun",
        },
        {
          titleAr: "متون طالب العلم - م5",
          titleDv: "ފަސްވަނަ ފިޔަވަހި: ބުލޫޣުލް މަރާމް",
          url: "../books/bulughulMaram.html",
          keywords: "level 5 bulugh",
        },
        {
          titleAr: "متون طالب العلم - إضافية",
          titleDv:
            "އިތުރު މަތުނުތައް: ޢުމްދަތުލް އަޙްކާމް، އަލްއުޞޫލުއް ސިއްތާ",
          url: "#",
          keywords: "extra mutun umdah usool sitta",
        },
      ],
    },
    {
      id: "misc",
      titleAr: "المتنوعات",
      titleDv: "އެހެނިހެން",
      items: [
        {
          titleAr: "إرسال الملاحظات والآراء",
          titleDv: "ކުށެއް/ހިޔާލެއް ހުށަހެޅުމަށް",
          url: "../page/contact.html",
        },
        {
          titleAr: "دعم المشروع",
          titleDv: "މަޝްރޫއަށް އެހީވެދިނުމަށް",
          url: "../page/supportHadithmv.html",
        },
        {
          titleAr: "الأسئلة المتكررة",
          titleDv: "ތަކުރާރުކޮށް ކުރެވޭ ސުވާލުތައް",
          url: "../page/FAQ.html",
        },
        {
          titleAr: "المساعدون",
          titleDv: "އެހީތެރިން",
          url: "../page/contributorList.html",
        },
        {
          titleAr: "مقارنة التغييرات",
          titleDv: "ތަފާތު އަޅާބެލުން",
          url: "../tools/diffCompare.html",
        },
        {
          titleAr: "العمرة والسفر",
          titleDv: "އުމްރާއާއި ދަތުރު",
          url: "../tools/travelAndUmrahChecklist.html",
        },
        {
          titleAr: "معلومات عن المدينة",
          titleDv: "މަދީނާގެ މައުލޫމާތު",
          url: "../page/madinaInfo.html",
        },
        {
          titleAr: "خطبة الحاجة",
          titleDv: "ޚުޠުބަތުލް ޙާޖާ",
          url: "../page/khutbatulHaajah.html",
        },
        {
          titleAr: "المواقع الإحتياطية",
          titleDv: "ބެކްއަޕް ސައިޓުތައް",
          url: "../page/404.html",
        },
        {
          titleAr: "كيفية الاستخدام",
          titleDv: "ޙަދީޘްއެމްވީ ބޭނުންކުރާ ގޮތް",
          url: "../page/howToUse.html",
        },
        {
          titleAr: "مصادر الأدوات",
          titleDv: "ހަދަން ބޭނުންކުރި ތަކެތި",
          url: "../page/thirdPartyTools.html",
        },
        {
          titleAr: "سياسة الخصوصية",
          titleDv: "ޕްރައިވެސީ ޕޮލިސީ",
          url: "../page/privacyPolicy.html",
        },
        {
          titleAr: "رخصة البرمجية",
          titleDv: "ލައިސެންސް",
          url: "../LICENSE.txt",
        },
        {
          titleAr: "روابط أخرى",
          titleDv: "އެހެނިހެން ލިންކުތައް",
          url: "../page/otherLinks.html",
        },
        {
          titleAr: "لوحة المفاتيح",
          titleDv: "ކީބޯޑުތައް",
          url: "../tools/keyboardPage.html",
        },
        {
          titleAr: "رمز استجابة سريعة",
          titleDv: "ކިއޫ އާރް ކޯޑު",
          url: "../tools/qrCode.html",
        },
        {
          titleAr: "محول الوحدات",
          titleDv: "ޔުނިޓް ކޮންވާޓަރ",
          url: "../tools/unitConverter.html",
        },
        {
          titleAr: "غيت هاب",
          titleDv: "ގިޓްހަބް",
          url: "https://github.com/hadithmv/hadithmv.github.io",
        },
        {
          titleAr: "كناشة محمد المالديفي",
          titleDv: "މުޙައްމަދު އަލްމާލްދީފީގެ ނޯޓުފޮތް",
          url: "../books/kunnaashaMuhammedMaldheefi.html",
        },
        {
          titleAr: "كناشة حديث إم في",
          titleDv: "ޙަދީޘްއެމްވީގެ ނޯޓުފޮތް",
          url: "../books/kunnaashaHadithmv.html",
        },
        {
          titleAr: "روابط أرشيف الإنترنت",
          titleDv: "އިންޓަނެޓް އާކައިވް ލިންކުތައް",
          url: "https://archive.org/details/@hadithmv",
        },
        {
          titleAr: "العقيقة والآبار",
          titleDv: "އަގީގާއާއި ވަޅުހެދުން (BirruMV)",
          url: "https://birrumv.com",
        },
        {
          titleAr: "محرر النصوص",
          titleDv: "ޓެކްސްޓު އެޑިޓަރ",
          url: "../tools/textEditor.html",
        },
      ],
    },
  ];

  // --- DOM ELEMENTS ---
  const contentContainer = document.getElementById("content-container");
  const searchInput = document.getElementById("searchInput");

  // --- RENDER FUNCTION ---
  const renderContent = (filter = "") => {
    contentContainer.innerHTML = "";
    const filterText = filter.toLowerCase().trim();
    const isSearching = filterText.length > 0;

    siteData.forEach((section) => {
      // Advanced filtering that checks titles and keywords
      const filteredItems = section.items.filter((item) => {
        const ar = item.titleAr ? item.titleAr.toLowerCase() : "";
        const dv = item.titleDv ? item.titleDv.toLowerCase() : "";
        const kw = item.keywords ? item.keywords.toLowerCase() : "";
        return (
          ar.includes(filterText) ||
          dv.includes(filterText) ||
          kw.includes(filterText)
        );
      });

      // Only render section if it has matching items
      if (filteredItems.length > 0) {
        const sectionEl = document.createElement("section");
        sectionEl.className = `content-section section-${section.id}`;

        // Section Header
        const headerEl = document.createElement("div");
        headerEl.className = "section-header";
        headerEl.innerHTML = `<h2 class="section-title">${section.titleAr} <span style="opacity: 0.7;">|</span> ${section.titleDv}</h2>`;
        sectionEl.appendChild(headerEl);

        // Grid Container
        const gridEl = document.createElement("div");
        gridEl.className = "book-grid";

        filteredItems.forEach((item, index) => {
          const card = document.createElement("a");
          card.href = item.url;
          card.className = "book-card";

          // Handle "Show More" logic:
          // If NOT searching AND index exceeds limit, hide the card initially.
          if (!isSearching && index >= INITIAL_ITEMS_TO_SHOW) {
            card.classList.add("hidden-card");
          }

          // Build Card HTML
          let cardHTML = `<h3 class="book-title-ar">${item.titleAr}</h3>`;
          if (item.titleDv) {
            cardHTML += `<p class="book-title-dv">${item.titleDv}</p>`;
          }
          if (item.status) {
            cardHTML += `<p class="book-status">${item.status}</p>`;
          }

          card.innerHTML = cardHTML;
          gridEl.appendChild(card);
        });

        sectionEl.appendChild(gridEl);

        // "Show More" Button Logic
        // Only show if NOT searching AND there are more items than the limit
        if (!isSearching && filteredItems.length > INITIAL_ITEMS_TO_SHOW) {
          const showMoreContainer = document.createElement("div");
          showMoreContainer.className = "show-more-container";

          const showMoreBtn = document.createElement("button");
          showMoreBtn.className = "show-more-btn";
          showMoreBtn.textContent = `އިތުރަށް ދައްކާ (${
            filteredItems.length - INITIAL_ITEMS_TO_SHOW
          }+)`;

          showMoreBtn.addEventListener("click", () => {
            // Reveal all hidden cards in this section
            sectionEl.querySelectorAll(".hidden-card").forEach((card) => {
              card.classList.remove("hidden-card");
              // Optional: Add a simplified fade-in animation class here if desired
            });
            showMoreContainer.remove(); // Remove the button after clicking
          });

          showMoreContainer.appendChild(showMoreBtn);
          sectionEl.appendChild(showMoreContainer);
        }

        contentContainer.appendChild(sectionEl);
      }
    });

    // Show "No results" message if needed
    if (contentContainer.children.length === 0 && isSearching) {
      contentContainer.innerHTML = `<p style="text-align:center; font-size: 1.2rem; color: var(--text-muted); padding: 2rem;">ހޯދަމުންދާ ތަކެއްޗެއް ނުފެނުނު</p>`;
    }
  };

  // --- EVENT LISTENERS ---
  searchInput.addEventListener("input", (e) => renderContent(e.target.value));

  // --- INITIAL LOAD ---
  renderContent();
});
