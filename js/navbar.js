// this was initially just navbar code, but then i added other snippets i needed on every page, but not the dt stuff

var hmvVersionNo = "6.7.39";
// changed from 4.1.43 to 6.2.88, to match number of commits

// cant be 4.0, has to be like 4.1 or 4.01, as empty zeros will get removes

// above is version no  var for hmv, shown in sidemenu and maybe main index page

console.log(
  "%c Welcome to Hadithmv",
  "font-size: 20px; font-weight: bold; color: white; background-image: linear-gradient(to right, #3f51b5, #2196f3); padding: 10px; border-radius: 5px;",
);
console.log("💻 Developer: https://t.me/ashraafmv");
console.log("🚀 GitHub: https://github.com/hadithmv/hadithmv.github.io");

/* === === ===
--- GET PAGE NAME AND DIRECTORY CODE ---
=== === === */

// moved this here in nav instead of dt-inline, so that pages could use it and not just books

// NOTE, since json name is fetched from file name, and set using a variable, changing the file name will cause the json to not be fetched

// Function to get canonical URL based on the current path
function getCanonicalUrl() {
  // Get the full path excluding the domain and start with /
  var fullPath = window.location.pathname;

  // Handle root path case (empty or just "/")
  if (fullPath === "" || fullPath === "/") {
    // If we're at root, return the base URL without trailing slash
    return window.location.origin;
  }

  // For non-root paths:
  // Get just the filename without extension (if it has one)
  var fileName = fullPath.split("/").pop();
  var hasExtension = fileName.indexOf(".") !== -1;

  if (hasExtension) {
    // If the path includes a file with extension
    var currentPage = fileName.replace(".html", "");
    var pathStructure = fullPath.substring(0, fullPath.lastIndexOf("/"));
    return window.location.origin + pathStructure + "/" + currentPage + ".html";
  } else {
    // If the path is just directories without a file extension
    return window.location.origin + fullPath;
  }
}

// Create and append canonical link
var canonicalLink = document.createElement("link");
canonicalLink.rel = "canonical";
canonicalLink.href = getCanonicalUrl();
document.head.appendChild(canonicalLink);

// Optional: Log the canonical URL for debugging
//console.log("Canonical URL:", canonicalLink.href);

// For JSON files, assuming they're always in ../js/json/ relative to the HTML file
var currentFileName = getCanonicalUrl().split("/").pop().replace(".html", "");
//var jsonPath = "../js/json/" + currentFileName + ".json";
/*
i have this html file called
arbaoonNawawi.html
it has code like so
<link
      rel="canonical"
      href="https://hadithmv.github.io/books/arbaoonNawawi.html"
    />
    <script type="text/javascript">
table = new DataTable("#tableID", {
ajax: {
          url: "../js/json/arbaoonNawawi.json",
          dataSrc: "",
        },
})
now what i want is, to not to have to write "arbaoonNawawi" in:
href="https://hadithmv.github.io/books/arbaoonNawawi.html"
and
url: "../js/json/arbaoonNawawi.json",
instead i want that to come from the name of the html file

how about a global variable

also note that the directory
hadithmv.github.io/books/${CURRENT_PAGE}
might be different for other files in other locations

for example i have
hadithmv.github.io/page/contributorList.html

there might also be directories more than one level deep
what doesnt change is the source "hadithmv.github.io" directory, and the end file "{file}.html"
but what is between can change

https://hadithmv.github.io/file.html

https://another.site.com/file.html

--moved code from dt-inline to navbar, minified with minify-navbar

this is my external js code:

// Function to get canonical URL based on current path
function getCanonicalUrl() {
  // Get the full path excluding domain and start with /
  const fullPath = window.location.pathname;

  // Handle root path case (empty or just "/")
  if (fullPath === "" || fullPath === "/") {
    // If we're at root, return the base URL without trailing slash
    return window.location.origin;
  }

  // For non-root paths:
  // Get just the filename without extension (if it has one)
  const fileName = fullPath.split("/").pop();
  const hasExtension = fileName.includes(".");

  if (hasExtension) {
    // If the path includes a file with extension
    const CURRENT_PAGE = fileName.replace(".html", "");
    const pathStructure = fullPath.substring(0, fullPath.lastIndexOf("/"));
    return `${window.location.origin}${pathStructure}/${CURRENT_PAGE}.html`;
  } else {
    // If the path is just directories without file extension
    return `${window.location.origin}${fullPath}`;
  }
}

// Create and append canonical link
const canonicalLink = document.createElement("link");
canonicalLink.rel = "canonical";
canonicalLink.href = getCanonicalUrl();
document.head.appendChild(canonicalLink);

// Optional: Log the canonical URL for debugging
console.log("Canonical URL:", canonicalLink.href);

// For JSON files, assuming they're always in ../js/json/ relative to the HTML file
const jsonPath = `../js/json/${CURRENT_PAGE}.json`;


whatever minifies it, it excludes some stuff like what is in function and if statements and variables. rewrite the code so that the code works when minified.

*/

// NAVBAR CODE below

function createNavbar() {
  const pageTitle = document.title;
  /*    Navbar 
        .Side Menu
        ..Dropdown menu item
        ...Nested dropdown
        ....Nested sub-dropdown
        */
  // Define the HTML structure for the navbar and side menu
  // MINIFY THIS HTML WITH KANGAX. if need to edit, format with something else then reminify
  // Insert the navbar HTML into the container
  // included onerror fallback for an image source
  document.getElementById("navbar-container").innerHTML = `
   <nav class="navbar">
   <div class="navbar-left">
      <a href="../books/index.html">
      <img
         alt="Site Icon"
         class="navbar-site-icon"
         src="../img/logo/logo.svg"
         onerror="this.onerror=null; this.src='../../img/logo/logo.svg';"
         title="Homepage"
         />
      </a>
   </div>
   <div class="navbar-center">
      <span class="navbar-page-title" title="Hadithmv - The Dhivehi Platform for the Sunnah
         ">${pageTitle}</span>
   </div>
   <div class="navbar-right" title="Menu">
      <span class="navbar-menu-icon hamburgerIcon"></span>
   </div>
</nav>
<div class="navbar-side-menu" id="sideMenu">
   <div class="navbar-side-menu-close" onclick="toggleSideMenu()">×</div>
   <ul>
      <li>
         <a  href="../books/index.html" title="Homepage"><span class="homeIcon"></span>މައި ސަފުހާ</a>
      </li>
      
     
      <li>
         <a href="../page/contact.html" title="Contact"><span class="contactIcon"></span>ގުޅުއްވުމަށް</a>
      </li>
      <li>
         <a href="../page/supportHadithmv.html" title="Support the Project"><span class="supportSideMenuIcon"></span>މަޝްރޫއަށް އެހީވެދިނުމަށް</a>
      </li>
      <li>
         <a href="../page/FAQ.html" title="FAQ"><span class="faqIcon"></span>ތަކުރާރު ސުވާލުތައް</a>
      </li>
      <li>
         <a href="../page/contributorList.html" title="Contributers"><span class="helpersIcon"></span>އެހީތެރިން</a>
      </li>
      <li>
         <a href="https://github.com/hadithmv/hadithmv.github.io/releases" 
            target="_blank"
            class="versionNo"><span class="versionIcon"></span>އިސްދާރު: v${hmvVersionNo}</a>
      </li>
      <li>
         <a href="https://t.me/ashraafmv" target="_blank" title="Message on Telegram"
            ><span class="authorIcon"></span>ފަރުމާކުރީ: އަބޫ ޔަޙްޔާ، މުޙައްމަދު އަޝްރާފު އިބްރާހީމް</a
            >
      </li>
      <li>
         <a style="font-size: 90%" onclick="openDiv()"
            >- މަދީނާގެ ޙަދީޘް ކުއްލިއްޔާގެ ދަރިވަރެއް</a
            >
      </li>
      <hr>
      <li class="wide-screen-toggle">
         <!-- onclick='document.querySelector(".dtWrapper").style.maxWidth="none";' -->
         <a href="#" 
            onclick='const wrapper = document.querySelector(".dtWrapper"); 
            wrapper.style.maxWidth = wrapper.style.maxWidth === "none" ? "980px" : "none"; 
            return false;'><span class="fullScreenIcon"></span>ވައިޑް ސްކްރީން</a >
      </li>
      <li>
         <a href="#"
            onclick='window.scrollTo({top:0,behavior:"smooth"})'  title="Scroll Up"
            ><span class="scrollUpIcon"></span>މައްޗަށް ސްކްރޯލްކުރޭ</a
            >
      </li>
      <li onclick="sideMenutoggleNavbarDropdown(this)" class="navbar-dropdown">
         <div class="navbar-dropdown-label" title="Reload Page">
            <span class="navbar-dropdown-arrow reloadIcon"></span>ރީލޯޑު
         </div>
         <ul class="navbar-dropdown-content">
            <li>
               <a href="#" onclick="window.location.reload()" title="Soft Reload">މަޑު ރީލޯޑު</a>
            </li>
            <li>
               <a
                  href="#"
                  onclick='window.location.href=window.location.href.split(".html")[0]+".html"' title="Hard Reload"
                  >ހަރު ރީލޯޑު</a
                  >
            </li>
         </ul>
      </li>
      <li>
         <a href="https://github.com/hadithmv/hadithmv.github.io"
            target="_blank" title="Github"><span class="githubIcon"></span>ގިޓްހަބް</a>
      </li>
   </ul>
</div>
`;
}
// the navbar.html code would be between the backticks above.

// Ensure the navbar is created once the DOM is fully loaded
document.addEventListener("DOMContentLoaded", createNavbar);

// PREV had sections dropdown in menu

/*

 <li onclick="sideMenutoggleNavbarDropdown(this)" class="navbar-dropdown">
         <div class="navbar-dropdown-label" title="Categories">
            <span class="navbar-dropdown-arrow dropdownIcon"></span>ބައިތައް
         </div>
         <ul class="navbar-dropdown-content">
            <li onclick="sideMenutoggleNavbarDropdown(this,event)" class="sub-navbar-dropdown">
               <div class="navbar-dropdown-label" title="Quran">
                  <span class="navbar-dropdown-arrow dropdownIcon"></span>ގުރްއާން
               </div>
               <ul class="sub-navbar-dropdown-content">
                  <li>
                     <a
                        href="../books/quranHadithmv.html"
                        onclick="changeBook('quranHadithmv'); return false;" title="Hadithmv Translation"
                        >1 ޙަދީޘްއެމްވީގެ ތަރުޖަމާ</a
                        >
                  </li>
                  <li>
                     <a
                        href="../books/quranRasmee.html"
                        onclick="changeBook('quranRasmee'); return false;" title="Official Translation"
                        >2 ރަސްމީ ތަރުޖަމާ</a
                        >
                  </li>
                  <li>
                     <a
                        href="../books/quranBakurube.html"
                        onclick="changeBook('quranBakurube'); return false;"title="Bakurube Translation"
                        >3 ބަކުރުބެގެ ތަރުޖަމާ</a
                        >
                  </li>
                  <li>
                     <a
                        href="../books/quranSoabuni.html"
                        onclick="changeBook('quranSoabuni'); return false;"title="S Tafsir"
                        >&nbsp;</a>
                  </li>
                  <li>
                     <a href="../books/quranUshru.html" title="Tafsir of Last 10th"
                        >6 ފަހު ދިހަބައި ކުޅަ އެއްބައިގެ ތަފްސީރު</a
                        >
                  </li>
               </ul>
            </li>
            <li onclick="sideMenutoggleNavbarDropdown(this,event)" class="sub-navbar-dropdown">
               <div class="navbar-dropdown-label" title="Hadith">
                  <span class="navbar-dropdown-arrow dropdownIcon"></span>ޙަދީޘް
               </div>
               <ul class="sub-navbar-dropdown-content">
                  <li>
                     <a href="../books/allAthar.html" title="Hadith Compilation"
                        >0 އެއްކުރަމުންދާ ޙަދީޘާއި އަޘަރު*</a
                        >
                  </li>
                  <li>
                     <a href="../books/muwattaMalik.html" title="Muwatta Malik">1 މުވައްޠައު މާލިކު*</a>
                  </li>
                  <li>
                     <a href="../books/umdathulAhkam.html" title="Umdathul Ahkam">2 ޢުމްދަތުލް އަޙްކާމް</a>
                  </li>
                  <li>
                     <a href="../books/hisnulMuslim.html" title="Hisnul Muslim">3 މުސްލިމުންގެ ކިއްލާ</a>
                  </li>
                  <li>
                     <a href="../books/arbaoonAajurry.html" title="Aajurrys’ 40 Hadith"
                        >4 އާޖުއްރީގެ ސާޅީސް ޙަދީޘް*</a
                        >
                  </li>
                  <li>
                     <a href="../books/kitabulIlmAbiKhaithama.html" title="Abu Khaithama’s Book of Knowledge"
                        >5 އަބޫ ޚައިޘަމާ ލިޔުނު އިލްމުގެ ފޮތް</a
                        >
                  </li>
                  <li>
                     <a href="../books/akhbaruShuyukh.html" title="Manners of the Sheikhs"
                        >6 ޝައިޚުންގެ ޚަބަރުތަކާއި އެބޭކަލުންގެ އަޚްލާގު</a
                        >
                  </li>
                  <li>
                     <a href="../books/akhlaqHamalathilQuran.html" title="Manners of the Quran Carriers"
                        >7 އާޖުއްރީގެ ގުރްއާން އުފުލާ މީހުންގެ އަޚްލާގު</a
                        >
                  </li>
                  <li>
                     <a href="../books/bulughulMaram.html" title="Bulughul Maram">8 ބުލޫޣުލް މަރާމް*</a>
                  </li>
                  <li>
                     <a href="../books/arbaoonNawawi.html" title="40 Nawawi">9 ނަވަވީގެ ސާޅީސް ޙަދީޘް</a>
                  </li>
               </ul>
            </li>
            <li onclick="sideMenutoggleNavbarDropdown(this,event)" class="sub-navbar-dropdown">
               <div class="navbar-dropdown-label" title="Aqida">
                  <span class="navbar-dropdown-arrow dropdownIcon"></span>އަގީދާ
               </div>
               <ul class="sub-navbar-dropdown-content">
                  <li>
                     <a href="../books/allAqida.html" title="Aqida Compilation"
                        >0 އެއްކުރަމުންދާ އަގީދާގެ ފޮތްތައް</a
                        >
                  </li>
                  <li>
                     <a href="../books/usooluSunnahAhmed.html" title="Allah’s Most Beautiful Names"
                        >1 ﷲ ގެ އެންމެ ރިވެތި އިސްމުފުޅުތައް</a
                        >
                  </li>
                  <li>
                     <a href="../books/usooluSunnahAhmed.html" title="Ahmed’s Foundations of the Sunnah"
                        >2 އަޙްމަދުގެ ސުންނަތުގެ އުސޫލުތައް*</a
                        >
                  </li>
                  <li>
                     <a href="../books/sharhuSunnahBarbahari.html" title="Barbahari’s Explanation of the Creed"
                        >3 ބަރްބަހާރީގެ ސުންނަތުގެ ޝަރަހަ*</a
                        >
                  </li>
                  <li>
                     <a href="../books/aqidatuRaziyain.html" title="Creed of the 2 Razis">4 ދެ ރާޒީންގެ އަގީދާ*</a>
                  </li>
                  <li>
                     <a href="../books/kalimathulIkhlas.html" title="Ibn Rajab’s Attainment of the Statement of Ikhlas"
                        >5 އިބްނު ރަޖަބު ލިޔުނު އިޚްލާސްގެ ކަލިމަ</a
                        >
                  </li>
                  <li>
                     <a href="../books/talkhisKitabiShariah.html" title="Summary of Aajurry’s Book of Shariah"
                        >6 އާޖުއްރީ ލިޔުނު ޝަރީއަތް ފޮތުގެ އަގީދާގެ ޚުލާސާއެއް</a
                        >
                  </li>
                  <li>
                     <a href="../books/intisarLiAshabilHadith.html" title="Giving Victory to the People of Hadith"
                        >7 ޙަދީޘްގެ އަސްހާބުންނަށް ނަސްރުދިނުން</a
                        >
                  </li>
                  <li>
                     <a href="../books/aqidatuSalafSoabuni.html" title="Soabuni’s Creed of the Salaf"
                        >8 އަބޫ ޢުޘްމާން އައްޞާބޫނީ ލިޔުނު ސަލަފުންގެ އަގީދާ</a
                        >
                  </li>
                  <li>
                     <a href="../books/kitabulEmanAbiUbaid.html" title="Abu Ubaid’s Book of Faith"
                        >9 އަބޫ ޢުބައިދުގެ އީމާންކަމުގެ ފޮތް</a
                        >
                  </li>
                  <li>
                     <a href="../books/nawaqidulIslam.html" title="Nullifiers of Islam"
                        >10 އިސްލާމްކަން ގެއްލޭ ކަންތައް</a
                        >
                  </li>
                  <li>
                     <a href="../books/qawaidulArbau.html" title="4 Fundamental Principles (of Shirk)">11 ހަތަރު ގަވާއިދު</a>
                  </li>
                  <li>
                     <a href="../books/usooluSiththa.html" title="6 Principles (of Monotheism)">12 ހަ އުސޫލު*</a>
                  </li>
                  <li>
                     <a href="../books/usooluThalaatha.html" title="3 Principles (of Monotheism)">13 ތިން އުސޫލު</a>
                  </li>
                  <li>
                     <a href="../books/quranUshru.html#tableID=:p69.html" title="Important Rulings for Muslims"
                        >14 މުސްލިމަކަށް މުހިއްމުވާ ހުކުމްތައް</a
                        >
                  </li>
                  <li>
                     <a href="../books/sharhuSunnahBarbahari-DFK.html" title="Barbahari’s Explanation of the Creed - DFK Version"
                        >ބަރްބަހާރީގެ ސުންނަތުގެ ޝަރަހަ - DFK</a
                        >
                  </li>
               </ul>
            </li>
            <li onclick="sideMenutoggleNavbarDropdown(this,event)" class="sub-navbar-dropdown">
               <div class="navbar-dropdown-label" title="Language">
                  <span class="navbar-dropdown-arrow dropdownIcon"></span>ބަސް
               </div>
               <ul class="sub-navbar-dropdown-content">
                  <li>
                     <a href="../mauhad/arabic.html" title="Madinah Arabic Books">މަދީނާ އަރަބި ފޮތްތައް</a>
                  </li>
                  <li>
                     <a
                        href="../books/radheefAll.html"
                        onclick="changeBook('radheefAll'); return false;" title="Dictionary Compilation"
                        >އެއްކުރަމުންދާ ރަދީފުތައް</a
                        >
                  </li>
                  <li>
                     <a
                        href="../books/radheefRasmee.html"
                        onclick="changeBook('radheefRasmee'); return false;" title="Official Dictionary"
                        >ރަސްމީ ރަދީފު</a
                        >
                  </li>
                  <li>
                     <a
                        href="../books/radheefEegaal.html" title="Eegaal Dictionary"
                        onclick="changeBook('radheefEegaal'); return false;"
                        >އަލްއީގާޡް</a
                        >
                  </li>
                  <li>
                     <a
                        href="../books/radheefManiku.html" title="Manik Dictionary"
                        onclick="changeBook('radheefManiku'); return false;"
                        >މަނިކުގެ ރަދީފު</a
                        >
                  </li>
                  <li>
                     <a
                        href="../books/radheefNanfoiy.html" title="Dictionary of Names"
                        onclick="changeBook('radheefNanfoiy'); return false;"
                        >ނަންފޮތް</a
                        >
                  </li>
                  <li>
                     <a href="../page/lafzuVakikohLiyumugeQawaid.html" title="Rules of Word Separation"
                        >ލަފުޒު ވަކިކޮށް ލިޔުމުގެ ގަވާއިދު (ދިވެހި)</a
                        >
                  </li>
               </ul>
            </li>
            <li>
               <a href="../tools/textEditor.html" title="Text Editor">ޓެކްސްޓު އެޑިޓަރ</a>
            </li>
         </ul>
      </li>

*/

/*
  <nav class="navbar">
        <div class="navbar-left">
            <img src="../img/logo/logo.svg" 
                 title="back to homepage" alt="Site Icon" class="navbar-site-icon" onclick="goToHomePage()">
        </div>
        <div class="navbar-center">
            <span class="navbar-page-title">${pageTitle}</span>
        </div>
        <div class="navbar-right" 
             title="menu">
        <span class="navbar-menu-icon">☰</span>
        </div>
    </nav>
    
    <div class="navbar-side-menu" id="sideMenu">
        <div class="navbar-side-menu-close" onclick="toggleSideMenu()">×</div>
        <ul>
            <li><a href="../books/index.html">● މައި ސަފުހާ</a></li>
            <li class="navbar-dropdown" onclick="sideMenutoggleNavbarDropdown(this)">
                <a><span class="navbar-dropdown-arrow">📍</span>ބައިތައް</a>
                <ul class="navbar-dropdown-content">
                    <li><a href="#">ގުރްއާން</a></li>
                    <li class="sub-navbar-dropdown" onclick="sideMenutoggleNavbarDropdown(this, event)">
                        <a><span class="navbar-dropdown-arrow">📍</span>ޙަދީޘް</a>
                        <ul class="sub-navbar-dropdown-content">
                            <li><a href="allAthar.html">އެއްކުރަމުންދާ ޙަދީޘާއި އަޘަރު*</a></li>
                            <li><a href="muwattaMalik.html">މުވައްޠައު މާލިކު*</a></li>
                            <li><a href="umdathulAhkam.html">ޢުމްދަތުލް އަޙްކާމް</a></li>
                            <li><a href="hisnulMuslim.html">މުސްލިމުންގެ ކިއްލާ</a></li>
                            <li><a href="arbaoonAajurry.html">އާޖުއްރީގެ ސާޅީސް ޙަދީޘް*</a></li>
                            <li><a href="akhbaruShuyukh.html">ޝައިޚުންގެ ޚަބަރުތަކާއި އެބޭކަލުންގެ އަޚްލާގު</a></li>
                            <li><a href="akhlaqHamalathilQuran.html">އާޖުއްރީގެ ގުރްއާން އުފުލާ މީހުންގެ އަޚްލާގު</a></li>
                            <li><a href="bulughulMaram.html">ބުލޫޣުލް މަރާމް*</a></li>
                            <li><a href="arbaoonNawawi.html">ނަވަވީގެ ސާޅީސް ޙަދީޘް</a></li>
                            <li><a href="riyaduSaliheen.html">ރިޔާޟުއްޞާލިޙީން*</a></li>
                        </ul>
                    </li>
                </ul>
            </li>
            <li><a href="../notes/info/contact.html">ކުށެއް/ހިޔާލެއް ހުށަހެޅުމަށް</a></li>
            <li><a href="../page/supportHadithmv.html">ތަރުޖަމާގައި އެހީވެދިނުމަށް</a></li>
            <li><a href="../notes/info/FAQ.html">ތަކުރާރުކޮށް ކުރެވޭ ސުވާލުތައް</a></li>
            <li><a href="../notes/info/contributorList.html">އެހީތެރިން</a></li>
            <li class="versionNo" onclick="openDiv()">⚙️ އިސްދާރު: v${hmvVersionNo}</li>
            <li><a href="https://t.me/ashraafmv">ފަރުމާ ކުރީ: އަބޫ ޔަޙްޔާ، މުޙައްމަދު އަޝްރާފު އިބްރާހީމް</a></li>
            <li style="font-size: 90%">މަދީނާގެ ޙަދީޘް ކުއްލިއްޔާގެ ދަރިވަރެއް</li>
            <li style="cursor: pointer; user-select: none;"  href="#" onclick="window.scrollTo({top: 0, behavior: 'smooth'});">▲ މައްޗަށް ސްކްރޯލްކުރޭ</li>
            <li class="navbar-dropdown" onclick="sideMenutoggleNavbarDropdown(this)">
                <a>↺ ސަފުހާ ރީލޯޑު</a>
                <ul class="navbar-dropdown-content">
                    <li><a onclick="window.location.reload()" href="#">މަޑު ރީލޯޑު</a></li>
                    <li><a onclick="window.location.href=window.location.href.split('.html')[0]+'.html'">ހަރު ރީލޯޑު</a></li>
                </ul>
            </li>
        </ul>
    </div>


    ///////////////////
    
  
  <a><span class="navbar-dropdown-arrow">📍</span>↺ ސަފުހާ ރީލޯޑު</a>

  <li><a href="#">ބައި 1</a></li>
                    <li class="sub-navbar-dropdown" onclick="sideMenutoggleNavbarDropdown(this, event)">
                        <a><span class="navbar-dropdown-arrow">📍</span>ބައި 2</a>
                        <ul class="sub-navbar-dropdown-content">
                            <li><a href="#">ސަބް-ބައި 2.1</a></li>
                            <li class="sub-sub-navbar-dropdown" onclick="sideMenutoggleNavbarDropdown(this, event)">
                                <a><span class="navbar-dropdown-arrow">📍</span>ސަބް-ބައި 2.2</a>
                                <ul class="sub-sub-navbar-dropdown-content">
                                    <li><a href="#">ސަބް-ސަބް-ބައި 2.2.1</a></li>
                                    <li>ސަބް-ސަބް-ބައި 2.2.2 (ޓެކްސްޓް)</li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                    */

/*// Function to navigate to the homepage
function goToHomePage() {
  window.location.href = "../books/index.html";
  //window.location.href = "index.html"; // "/";
}*/

// Function to toggle the side menu's visibility
function toggleSideMenu() {
  const sideMenu = document.getElementById("sideMenu");
  sideMenu.classList.toggle("open");
}

document.addEventListener("click", function (event) {
  const navbar = document.querySelector(".navbar");
  const sideMenu = document.getElementById("sideMenu");

  // Check if the click is inside the navbar
  const isClickInsideNavbar = navbar.contains(event.target);

  // Check if the click is inside the side menu
  const isClickInsideSideMenu = sideMenu.contains(event.target);

  // Check if the site icon is clicked (prevents the side menu from opening)
  const isSiteIconClicked = event.target.classList.contains("navbar-site-icon");

  // Check if the menu icon is clicked
  const isMenuIconClicked = event.target.classList.contains("navbar-menu-icon");

  // If the menu icon is clicked, toggle the side menu
  if (isMenuIconClicked) {
    toggleSideMenu();
  }
  // If any part of the navbar except the site icon is clicked, toggle the side menu
  else if (isClickInsideNavbar && !isSiteIconClicked) {
    toggleSideMenu();
  }
  // If a click outside the side menu occurs while it's open, close the side menu
  else if (!isClickInsideSideMenu && sideMenu.classList.contains("open")) {
    toggleSideMenu();
  }
});
//

//--------------------
// NAVBAR DROPDOWNS
//--------------------
// Function to toggle navbar dropdowns

function sideMenutoggleNavbarDropdown(element, event) {
  // Prevent event bubbling

  if (event) {
    event.stopPropagation();
  }
  const dropdownNavbarContent = element.querySelector(
    ".navbar-dropdown-content, .sub-navbar-dropdown-content, .sub-sub-navbar-dropdown-content",
  );
  const arrow = element.querySelector(".navbar-dropdown-arrow");
  if (dropdownNavbarContent) {
    dropdownNavbarContent.classList.toggle("show");
    // Rotate arrow when dropdown is opened/closed

    arrow.style.transform = dropdownNavbarContent.classList.contains("show")
      ? "rotate(90deg)"
      : "";
    // now turns right
    // previously turned left: ? "rotate(-90deg)"
  }

  // Close other navbar dropdowns at the same level
  const siblings = element.parentElement.children;
  for (let sibling of siblings) {
    if (sibling !== element) {
      const siblingNavbarDropdown = sibling.querySelector(
        ".navbar-dropdown-content, .sub-navbar-dropdown-content, .sub-sub-navbar-dropdown-content",
      );
      const siblingArrow = sibling.querySelector(".navbar-dropdown-arrow");
      if (siblingNavbarDropdown) {
        siblingNavbarDropdown.classList.remove("show");
        siblingArrow.style.transform = "";
      }
    }
  }
}

/* DONT WANT
//--------------------
// HIDE NAVBAR ON SCROLL DOWN
//--------------------
document.addEventListener("DOMContentLoaded", function () {
  // Initialize variables
  let lastScrollTop = 0;
  const navbar = document.querySelector(".navbar");
  const topThreshold = 50; // Show navbar when within 50px of the top
  const scrollThreshold = 200; // Amount to scroll up before showing navbar
  let scrollUpDistance = 0;

  function handleScroll() {
    if (!navbar) return; // Exit if navbar doesn't exist

    // Get current scroll position
    let currentScrollTop =
      window.pageYOffset || document.documentElement.scrollTop;

    if (currentScrollTop <= topThreshold) {
      // When scroll is within topThreshold of the top, always show navbar
      navbar.classList.remove("navbar-hidden");
      scrollUpDistance = 0; // Reset scroll up distance
    } else if (currentScrollTop >lastScrollTop) {
      // Scrolling down and beyond topThreshold
      navbar.classList.add("navbar-hidden"); // Hide navbar
      scrollUpDistance = 0; // Reset scroll up distance
    } else {
      // Scrolling up and beyond topThreshold
      scrollUpDistance += lastScrollTop - currentScrollTop; // Accumulate scroll up distance
      if (scrollUpDistance >scrollThreshold) {
        // If scrolled up more than the scrollThreshold
        navbar.classList.remove("navbar-hidden"); // Show navbar
        scrollUpDistance = 0; // Reset scroll up distance
      }
    }

    // Update lastScrollTop for next scroll event
    lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
  }

  // Throttle function to limit how often the scroll event fires
  function throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() =>(inThrottle = false), limit);
      }
    };
  }

  // Function to check if the device is mobile
  function isMobile() {
    return window.matchMedia("(max-width: 599px)").matches;
  }

  if (isMobile()) {
    // Add the scroll event listener only for mobile devices
    window.addEventListener("scroll", throttle(handleScroll, 100));
  }
});
//
*/

//

//

// Close navbar dropdowns when clicking outside
/*window.onclick = function (event) {
  if (!event.target.closest(".navbar-dropdown, .sub-navbar-dropdown, .sub-sub-navbar-dropdown")) {
    const dropdowns = document.getElementsByClassName("navbar-dropdown-content");
    const arrows = document.getElementsByClassName("navbar-dropdown-arrow");
    for (let dropdown of dropdowns) {
      dropdown.classList.remove("show");
    }
    for (let arrow of arrows) {
      arrow.style.transform = "";
    }
  }
};*/

//

//

//

/*
 <div class="navbar-side-menu" id="sideMenu">
                    <div class="navbar-side-menu-close" onclick="toggleSideMenu()">×</div>
                    <ul>
                        <li><a href="#">Home</a></li>
                        <li><a href="#">About</a></li>
                        <li class="navbar-dropdown">
                            <a href="#">Services</a>
                            <div class="navbar-dropdown-content">
                                <a href="#">Service 1</a>
                                <a href="#">Service 2</a>
                                <a href="#">Service 3</a>
                            </div>
                        </li>
                        <li><a href="#">Contact</a></li>
                    </ul>
                </div>
*/

//

//

//

/*
The reason you can't right-click on the <a>element to open it in a new tab is that the onclick event handler is used to trigger a JavaScript function (changeBkRadheef('radheefAll')) instead of providing a standard hyperlink (href) that directs to a URL. When an onclick event is used without an href attribute, the browser doesn't interpret the link as a regular hyperlink, and therefore, the right-click context menu for opening in a new tab or window doesn't appear.

Solution:
Add an href attribute: If possible, provide a fallback URL with the href attribute. This way, users can still open the link in a new tab.

<li>
   <a href="your_fallback_url" onclick="changeBkRadheef('radheefAll'); return false;">އެއްކުރަމުންދާ ރަދީފުތައް</a>
</li>

*/
