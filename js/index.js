document.addEventListener("DOMContentLoaded", () => {
  const INITIAL_ITEMS_TO_SHOW = 12;

  // === FULL SITE DATA ===
  const siteData = [
    {
      id: "quick-links",
      titleAr: "روابط سريعة",
      titleDv: "ފަސޭހަ ލިންކުތައް",
      items: [
        {
          titleAr: "دعم المشروع",
          titleDv: "މަޝްރޫއަށް އެހީވެދިނުމަށް",
          url: "../page/supportHadithmv.html",
          keywords: "donation",
        },
        {
          titleAr: "محرر النصوص",
          titleDv: "ޓެކްސްޓު އެޑިޓަރ",
          url: "../tools/textEditor.html",
          keywords: "editor",
        },
        {
          titleAr: "حصن المسلم",
          titleDv: "ހެނދުނާއި ހަވީރުގެ ޒިކުރުތައް",
          url: "../books/hisnulMuslim.html",
          keywords: "azkaar adhkar hisnul muslim",
        },
        {
          titleAr: "العقيقة والآبار",
          titleDv: "އަގީގާއާއި ވަޅުހެދުން",
          url: "https://birrumv.com",
          keywords: "aqiqa birru",
        },
      ],
    },
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
          titleDv:
            "އަހަރެން އުފެއްދެވީ ކޮން ފަރާތަކުން އަދި ކޮން މަގުސަދަކަށް؟",
          url: "../books/manKhalaqaniWaLimaza.html",
        },
        {
          titleAr: "الإسلام رسالة موجزة",
          titleDv: "އިސްލާމް ދީނާ ބެހޭ ލުއި ފޮތެއް",
          url: "../books/nubzaAnilIslam.html",
        },
        {
          titleAr: "الإسلام دين رسل الله",
          titleDv: "އިސްލާމް ދީނަކީ الله ގެ ރަސޫލުންގެ ދީނެވެ.",
          url: "../books/islamDeenRusulullah.html",
        },
      ],
    },
    // ... (other sections) ...
  ];

  const contentContainer = document.getElementById("content-container");
  const searchInput = document.getElementById("searchInput");

  const renderContent = (filter = "") => {
    contentContainer.innerHTML = "";
    const filterText = filter.toLowerCase().trim();
    const isSearching = filterText.length > 0;

    siteData.forEach((section) => {
      const filteredItems = section.items.filter((item) => {
        const ar = (item.titleAr || "").toLowerCase();
        const dv = (item.titleDv || "").toLowerCase();
        const kw = (item.keywords || "").toLowerCase();
        // --- NEW --- Add the URL to the searchable fields
        const url = (item.url || "").toLowerCase();

        return (
          ar.includes(filterText) ||
          dv.includes(filterText) ||
          kw.includes(filterText) ||
          url.includes(filterText)
        ); // --- NEW --- Check the URL
      });

      if (filteredItems.length > 0) {
        const sectionEl = document.createElement("section");
        sectionEl.className = `content-section section-${section.id}`;

        const itemCount = filteredItems.length;
        const headerEl = document.createElement("div");
        headerEl.className = "section-header";
        headerEl.innerHTML = `<h2 class="section-title">${section.titleAr} | ${section.titleDv} <span class="section-item-count">(${itemCount}) ލިޔުން</span></h2>`;
        sectionEl.appendChild(headerEl);

        const gridEl = document.createElement("div");
        gridEl.className = "book-grid";

        filteredItems.forEach((item, index) => {
          const card = document.createElement("a");
          card.href = item.url;
          card.className = "book-card";

          if (!isSearching && index >= INITIAL_ITEMS_TO_SHOW) {
            card.classList.add("hidden-card");
          }

          card.innerHTML = `
                        <h3 class="book-title-ar">${item.titleAr}</h3>
                        ${
                          item.titleDv
                            ? `<p class="book-title-dv">${item.titleDv}</p>`
                            : ""
                        }
                        ${
                          item.status
                            ? `<p class="book-status">${item.status}</p>`
                            : ""
                        }
                    `;
          gridEl.appendChild(card);
        });

        sectionEl.appendChild(gridEl);

        if (!isSearching && filteredItems.length > INITIAL_ITEMS_TO_SHOW) {
          const showMoreContainer = document.createElement("div");
          showMoreContainer.className = "show-more-container";
          showMoreContainer.innerHTML = `<button class="show-more-btn">އިތުރަށް ދައްކާ (${
            filteredItems.length - INITIAL_ITEMS_TO_SHOW
          }+)</button>`;

          showMoreContainer
            .querySelector("button")
            .addEventListener("click", () => {
              sectionEl.querySelectorAll(".hidden-card").forEach((card) => {
                card.classList.remove("hidden-card");
              });
              showMoreContainer.remove();
            });

          sectionEl.appendChild(showMoreContainer);
        }

        contentContainer.appendChild(sectionEl);
      }
    });

    if (contentContainer.children.length === 0 && isSearching) {
      contentContainer.innerHTML = `<p style="text-align:center; font-size: 1.2rem; color: var(--text-muted); padding: 2rem;">ހޯދަމުންދާ ތަކެއްޗެއް ނުފެނުނު</p>`;
    }
  };

  searchInput.addEventListener("input", (e) => renderContent(e.target.value));

  renderContent();
});
