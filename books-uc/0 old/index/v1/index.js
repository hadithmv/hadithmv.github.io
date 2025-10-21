document.addEventListener('DOMContentLoaded', () => {

    // --- DATA OBJECT ---
    // All your website content goes here. To add a new book, just add a new object to the appropriate 'items' array.
    const siteData = [
        {
            sectionTitle: "القرآن والتفسير",
            sectionTitleDv: "ގުރްއާނާއި ތަފްސީރު",
            sectionId: "quran",
            items: [
                { titleAr: "ترجمة حديث إم في", titleDv: "ޙަދީޘްއެމްވީގެ ތަރުޖަމާ", url: "../books/quranHadithmv.html" },
                { titleAr: "الترجمة الرسمية", titleDv: "ރަސްމީ ތަރުޖަމާ", url: "../books/quranRasmee.html", note: "(ރައީސުލްޖުމްހޫރިއްޔާގެ އޮފީސް)" },
                { titleAr: "ترجمة بكر بي", titleDv: "ބަކުރުބެގެ ތަރުޖަމާ", url: "../books/quranBakurube.html" },
                { titleAr: "تفسير القرآن لجعفر", titleDv: "ޖަޢުފަރުގެ ގުރްއާން ތަފްސީރު*", url: "../books/quranJaufar.html" },
                { titleAr: "تفسير العشر الأخير", titleDv: "ގުރްއާނުގެ ފަހު ދިހަބައި ކުޅަ އެއްބައިގެ ތަފްސީރު", url: "../books/quranUshru.html" },
                { titleAr: "معجم ألفاظ القرآن", titleDv: "ގުރްއާން ލަފްޒުތަކުގެ ރަދީފު", url: "../books/radheefQuran.html" },
                { titleAr: "ترجمة التفسير الميسر", titleDv: "ތަފްސީރު އަލްމުޔައްސަރުގެ ތަރުޖަމާ", url: "#", status: "(ތައްޔާރުވަނީ...)" },
            ]
        },
        {
            sectionTitle: "الحديث والأثر",
            sectionTitleDv: "ޙަދީޘާއި އަޘަރު",
            sectionId: "hadith",
            items: [
                { titleAr: "الجامع في الأحاديث والآثار", titleDv: "އެއްކުރަމުންދާ ޙަދީޘާއި އަޘަރު", url: "../books/allAthar.html", keywords: "all athar جامع" },
                { titleAr: "موطأ مالك*", titleDv: "މުވައްޠައު މާލިކު", url: "../books/muwattaMalik.html", status: "(ނިމެނީ)" },
                { titleAr: "عمدة الأحكام", titleDv: "ޢުމްދަތުލް އަޙްކާމް", url: "../books/umdathulAhkam.html" },
                { titleAr: "حصن المسلم", titleDv: "މުސްލިމުންގެ ކިއްލާ", url: "../books/hisnulMuslim.html", keywords: "dua dhikr zikr" },
                { titleAr: "الأربعون النووية", titleDv: "ނަވަވީގެ ސާޅީސް ޙަދީޘް", url: "../books/arbaoonNawawi.html", keywords: "40 nawawi arbaeen" },
                { titleAr: "بلوغ المرام*", titleDv: "ބުލޫޣުލް މަރާމް", url: "../books/bulughulMaram.html", status: "(މުރާޖާކުރަނީ)" },
            ]
        },
        {
            sectionTitle: "العقيدة والمنهج",
            sectionTitleDv: "އަގީދާއާއި މަންހަޖު",
            sectionId: "aqida",
            items: [
                { titleAr: "أسماء الله الحسنى", titleDv: "ﷲ ގެ އެންމެ ރިވެތި އިސްމުފުޅުތައް", url: "../books/asmaullahilHusna.html", keywords: "names of Allah" },
                { titleAr: "أصول السنة لأحمد", titleDv: "އަޙްމަދު ލިޔުނު ސުންނަތުގެ އުސޫލުތައް", url: "../books/usooluSunnahAhmed.html" },
                { titleAr: "شرح السنة للبربهاري", titleDv: "ބަރްބަހާރީ ލިޔުނު ސުންނަތުގެ ޝަރަހަ", url: "../books/sharhuSunnahBarbahari.html" },
                { titleAr: "نواقض الإسلام", titleDv: "އިސްލާމްކަން ގެއްލޭ ކަންކަން", url: "../books/nawaqidulIslam.html" },
                { titleAr: "‌‌القواعد الأربع", titleDv: "ހަތަރު ގަވާއިދު", url: "../books/qawaidulArbau.html" },
                { titleAr: "الأصول الثلاثة", titleDv: "ތިން އުސޫލު", url: "../books/usooluThalaatha.html" },
            ]
        },
        {
            sectionTitle: "اللغة والكتابة",
            sectionTitleDv: "ބަހާއި ލިޔުންތެރިކަން",
            sectionId: "language",
            items: [
                { titleAr: "الجامع في المعاجم", titleDv: "އެއްކުރަމުންދާ ރަދީފުތައް", url: "../books/radheefAll.html" },
                { titleAr: "معجم اللغة الديفهية", titleDv: "ދިވެހިބަހުގެ ރަދީފު (ރަސްމީ)", url: "../books/radheefRasmee.html" },
                { titleAr: "معجم الأسماء", titleDv: "އެއްކުރަމުންދާ ނަންފޮތް", url: "../books/radheefNanfoiy.html" },
            ]
        }
    ];

    const contentContainer = document.getElementById('content-container');
    const searchInput = document.getElementById('searchInput');

    // --- FUNCTION TO RENDER CONTENT ---
    const renderContent = (filter = '') => {
        contentContainer.innerHTML = ''; // Clear existing content
        const filterText = filter.toLowerCase();

        siteData.forEach(section => {
            // Filter items based on search query
            const filteredItems = section.items.filter(item => {
                const titleAr = item.titleAr ? item.titleAr.toLowerCase() : '';
                const titleDv = item.titleDv ? item.titleDv.toLowerCase() : '';
                const keywords = item.keywords ? item.keywords.toLowerCase() : '';
                
                return titleAr.includes(filterText) || 
                       titleDv.includes(filterText) || 
                       keywords.includes(filterText) ||
                       filterText.includes(titleAr) || // Also check if search term is part of the title
                       filterText.includes(titleDv);
            });

            // Only render the section if it has items that match the filter
            if (filteredItems.length > 0) {
                const sectionEl = document.createElement('section');
                sectionEl.className = `content-section section-${section.sectionId}`;
                
                const titleEl = document.createElement('h2');
                titleEl.className = 'section-title';
                titleEl.innerHTML = `${section.sectionTitle} - ${section.sectionTitleDv}`;
                sectionEl.appendChild(titleEl);

                const gridEl = document.createElement('div');
                gridEl.className = 'book-grid';

                filteredItems.forEach(item => {
                    const card = document.createElement('a');
                    card.href = item.url;
                    card.className = 'book-card';
                    
                    let cardHTML = `<h3 class="book-title-ar">${item.titleAr}</h3>`;
                    if (item.titleDv) {
                        cardHTML += `<p class="book-title-dv">${item.titleDv}</p>`;
                    }
                    if (item.status) {
                        cardHTML += `<p class="book-status">${item.status}</p>`;
                    }
                     if (item.note) {
                        cardHTML += `<p class="book-status">${item.note}</p>`;
                    }
                    
                    card.innerHTML = cardHTML;
                    gridEl.appendChild(card);
                });
                
                sectionEl.appendChild(gridEl);
                contentContainer.appendChild(sectionEl);
            }
        });
    };

    // --- EVENT LISTENER FOR SEARCH INPUT ---
    searchInput.addEventListener('input', (e) => {
        renderContent(e.target.value);
    });

    // --- INITIAL RENDER ---
    renderContent(); 
});