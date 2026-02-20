document.addEventListener("DOMContentLoaded", () => {
  // --- CONFIGURATION ---
  const INITIAL_ITEMS_TO_SHOW = 8; // Change this number to control how many cards are shown initially

  // --- DATA OBJECT ---
  const siteData = [
    {
      sectionTitle: "القرآن والتفسير",
      sectionTitleDv: "ގުރްއާނާއި ތަފްސީރު",
      sectionId: "quran",
      items: [
        // Add all your Quran books here...
        {
          titleAr: "ترجمة حديث إم في",
          titleDv: "ޙަދީޘްއެމްވީގެ ތަރުޖަމާ",
          url: "../books/quranHadithmv.html",
        },
        {
          titleAr: "الترجمة الرسمية",
          titleDv: "ރަސްމީ ތަރުޖަމާ",
          url: "../books/quranRasmee.html",
        },
        {
          titleAr: "ترجمة بكر بي",
          titleDv: "ބަކުރުބެގެ ތަރުޖަމާ",
          url: "../books/quranBakurube.html",
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
          titleAr: "تفسير السعدي",
          titleDv: "(ލިންކު)",
          url: "https://read.tafsir.one/alsidi",
          keywords: "link",
        },
        {
          titleAr: "المختصر في التفسير",
          titleDv: "(ލިންކު)",
          url: "https://read.tafsir.one/almukhtasar",
          keywords: "link",
        },
        {
          titleAr: "إعراب القرآن",
          titleDv: "(ލިންކު)",
          url: "https://surahpedia.com/ar/projects/45",
          keywords: "link",
        },
        {
          titleAr: "مصحف التجويد",
          titleDv: "ތަޖްވީދު މުސްހަފު",
          url: "https://archive.org/details/mushaf-tajwid-darul-marifa",
          status: "(PDF)",
        },
      ],
    },
    {
      sectionTitle: "الحديث والأثر",
      sectionTitleDv: "ޙަދީޘާއި އަޘަރު",
      sectionId: "hadith",
      items: [
        // Add all your Hadith books here...
        {
          titleAr: "الجامع في الأحاديث والآثار",
          titleDv: "އެއްކުރަމުންދާ ޙަދީޘާއި އަޘަރު",
          url: "../books/allAthar.html",
          keywords: "all athar جامع",
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
          titleAr: "الأربعون النووية",
          titleDv: "ނަވަވީގެ ސާޅީސް ޙަދީޘް",
          url: "../books/arbaoonNawawi.html",
          keywords: "40 nawawi arbaeen",
        },
        {
          titleAr: "بلوغ المرام*",
          titleDv: "ބުލޫޣުލް މަރާމް",
          url: "../books/bulughulMaram.html",
          status: "(މުރާޖާކުރަނީ)",
        },
      ],
    },
    // ... add other sections like Aqida, Language etc. in the same format
  ];

  const contentContainer = document.getElementById("content-container");
  const searchInput = document.getElementById("searchInput");

  // --- FUNCTION TO RENDER CONTENT ---
  const renderContent = (filter = "") => {
    contentContainer.innerHTML = "";
    const filterText = filter.toLowerCase().trim();

    siteData.forEach((section) => {
      const filteredItems = section.items.filter((item) => {
        const titleAr = item.titleAr ? item.titleAr.toLowerCase() : "";
        const titleDv = item.titleDv ? item.titleDv.toLowerCase() : "";
        const keywords = item.keywords ? item.keywords.toLowerCase() : "";
        return (
          titleAr.includes(filterText) ||
          titleDv.includes(filterText) ||
          keywords.includes(filterText)
        );
      });

      if (filteredItems.length > 0) {
        const sectionEl = document.createElement("section");
        sectionEl.className = `content-section section-${section.sectionId}`;

        sectionEl.innerHTML = `<h2 class="section-title">${section.sectionTitle} - ${section.sectionTitleDv}</h2>`;

        const gridEl = document.createElement("div");
        gridEl.className = "book-grid";

        filteredItems.forEach((item, index) => {
          const card = document.createElement("a");
          card.href = item.url;
          card.className = "book-card";
          // If the item index is greater than the initial limit, hide it
          if (index >= INITIAL_ITEMS_TO_SHOW) {
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

        // If there are more items than the initial limit, add a "Show More" button
        if (filteredItems.length > INITIAL_ITEMS_TO_SHOW) {
          const showMoreBtn = document.createElement("button");
          showMoreBtn.className = "show-more-btn";
          showMoreBtn.textContent = "Show More";
          showMoreBtn.addEventListener("click", () => {
            // Find all hidden cards within this specific section and show them
            sectionEl.querySelectorAll(".hidden-card").forEach((card) => {
              card.classList.remove("hidden-card");
            });
            // Hide the button after it's clicked
            showMoreBtn.style.display = "none";
          });
          sectionEl.appendChild(showMoreBtn);
        }

        contentContainer.appendChild(sectionEl);
      }
    });
  };

  // --- EVENT LISTENER FOR SEARCH INPUT ---
  searchInput.addEventListener("input", (e) => {
    renderContent(e.target.value);
  });

  // --- INITIAL RENDER ---
  renderContent();
});
