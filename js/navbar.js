var hmvVersionNo = 3.16;

// above is version no  var for hmv, shown in sidemenu and maybe main index page

/* === === ===
--- GET PAGE NAME AND DIRECTORY CODE ---
=== === === */

// moved this here in nav instead of dt-inline, so that pages could use it and not just books

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
console.log("Canonical URL:", canonicalLink.href);

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
var table = new DataTable("#tableID", {
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
hadithmv.github.io/page/contributors.html

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
  document.getElementById("navbar-container").innerHTML = ``;
}
// the navbar.html code would be between the backticks above.

// Ensure the navbar is created once the DOM is fully loaded
document.addEventListener("DOMContentLoaded", createNavbar);

/*
  <nav class="navbar">
        <div class="navbar-left">
            <img src="../img/logo/logo.svg" 
                 title="back to homepage" alt="Site Icon" class="site-icon" onclick="goToHomePage()">
        </div>
        <div class="navbar-center">
            <span class="page-title">${pageTitle}</span>
        </div>
        <div class="navbar-right" 
             title="menu">
        <span class="menu-icon">☰</span>
        </div>
    </nav>
    
    <div class="side-menu" id="sideMenu">
        <div class="side-menu-close" onclick="toggleSideMenu()">×</div>
        <ul>
            <li><a href="../books/index.html">● މައި ސަފުހާ</a></li>
            <li class="dropdown" onclick="sideMenutoggleDropdown(this)">
                <a><span class="dropdown-arrow">◄</span>ބައިތައް</a>
                <ul class="dropdown-content">
                    <li><a href="#">ގުރްއާން</a></li>
                    <li class="sub-dropdown" onclick="sideMenutoggleDropdown(this, event)">
                        <a><span class="dropdown-arrow">◄</span>ޙަދީޘް</a>
                        <ul class="sub-dropdown-content">
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
            <li><a href="../page/helpTranslate.html">ތަރުޖަމާގައި އެހީވެދިނުމަށް</a></li>
            <li><a href="../notes/info/FAQ.html">ތަކުރާރުކޮށް ކުރެވޭ ސުވާލުތައް</a></li>
            <li><a href="../notes/info/contributors.html">އެހީތެރިން</a></li>
            <li class="versionNo" onclick="openDiv()">⚙️ އިސްދާރު: v${hmvVersionNo}</li>
            <li><a href="https://t.me/ashraafmv">ފަރުމާ ކުރީ: އަބޫ ޔަޙްޔާ، މުޙައްމަދު އަޝްރާފު އިބްރާހީމް</a></li>
            <li style="font-size: 90%">މަދީނާގެ ޙަދީޘް ކުއްލިއްޔާގެ ދަރިވަރެއް</li>
            <li style="cursor: pointer; user-select: none;"  href="#" onclick="window.scrollTo({top: 0, behavior: 'smooth'});">▲ މައްޗަށް ސްކްރޯލްކުރޭ</li>
            <li class="dropdown" onclick="sideMenutoggleDropdown(this)">
                <a>↺ ސަފުހާ ރީލޯޑު</a>
                <ul class="dropdown-content">
                    <li><a onclick="window.location.reload()" href="#">މަޑު ރީލޯޑު</a></li>
                    <li><a onclick="window.location.href=window.location.href.split('.html')[0]+'.html'">ހަރު ރީލޯޑު</a></li>
                </ul>
            </li>
        </ul>
    </div>


    ///////////////////
    
  
  <a><span class="dropdown-arrow">◄</span>↺ ސަފުހާ ރީލޯޑު</a>

  <li><a href="#">ބައި 1</a></li>
                    <li class="sub-dropdown" onclick="sideMenutoggleDropdown(this, event)">
                        <a><span class="dropdown-arrow">◄</span>ބައި 2</a>
                        <ul class="sub-dropdown-content">
                            <li><a href="#">ސަބް-ބައި 2.1</a></li>
                            <li class="sub-sub-dropdown" onclick="sideMenutoggleDropdown(this, event)">
                                <a><span class="dropdown-arrow">◄</span>ސަބް-ބައި 2.2</a>
                                <ul class="sub-sub-dropdown-content">
                                    <li><a href="#">ސަބް-ސަބް-ބައި 2.2.1</a></li>
                                    <li>ސަބް-ސަބް-ބައި 2.2.2 (ޓެކްސްޓް)</li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                    */

// Function to navigate to the homepage
function goToHomePage() {
  window.location.href = "../books/index.html";
  //window.location.href = "index.html"; // "/";
}

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
  const isSiteIconClicked = event.target.classList.contains("site-icon");

  // Check if the menu icon is clicked
  const isMenuIconClicked = event.target.classList.contains("menu-icon");

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
// Function to toggle dropdowns

function sideMenutoggleDropdown(element, event) {
  // Prevent event bubbling

  if (event) {
    event.stopPropagation();
  }
  const dropdownContent = element.querySelector(
    ".dropdown-content, .sub-dropdown-content, .sub-sub-dropdown-content"
  );
  const arrow = element.querySelector(".dropdown-arrow");
  if (dropdownContent) {
    dropdownContent.classList.toggle("show");
    // Rotate arrow when dropdown is opened/closed

    arrow.style.transform = dropdownContent.classList.contains("show")
      ? "rotate(-90deg)"
      : "";
  }

  // Close other dropdowns at the same level
  const siblings = element.parentElement.children;
  for (let sibling of siblings) {
    if (sibling !== element) {
      const siblingDropdown = sibling.querySelector(
        ".dropdown-content, .sub-dropdown-content, .sub-sub-dropdown-content"
      );
      const siblingArrow = sibling.querySelector(".dropdown-arrow");
      if (siblingDropdown) {
        siblingDropdown.classList.remove("show");
        siblingArrow.style.transform = "";
      }
    }
  }
}

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
    } else if (currentScrollTop > lastScrollTop) {
      // Scrolling down and beyond topThreshold
      navbar.classList.add("navbar-hidden"); // Hide navbar
      scrollUpDistance = 0; // Reset scroll up distance
    } else {
      // Scrolling up and beyond topThreshold
      scrollUpDistance += lastScrollTop - currentScrollTop; // Accumulate scroll up distance
      if (scrollUpDistance > scrollThreshold) {
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
        setTimeout(() => (inThrottle = false), limit);
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

//

//

// Close dropdowns when clicking outside
/*window.onclick = function (event) {
  if (!event.target.closest(".dropdown, .sub-dropdown, .sub-sub-dropdown")) {
    const dropdowns = document.getElementsByClassName("dropdown-content");
    const arrows = document.getElementsByClassName("dropdown-arrow");
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
 <div class="side-menu" id="sideMenu">
                    <div class="side-menu-close" onclick="toggleSideMenu()">×</div>
                    <ul>
                        <li><a href="#">Home</a></li>
                        <li><a href="#">About</a></li>
                        <li class="dropdown">
                            <a href="#">Services</a>
                            <div class="dropdown-content">
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
The reason you can't right-click on the <a> element to open it in a new tab is that the onclick event handler is used to trigger a JavaScript function (changeBkRadheef('radheefAll')) instead of providing a standard hyperlink (href) that directs to a URL. When an onclick event is used without an href attribute, the browser doesn't interpret the link as a regular hyperlink, and therefore, the right-click context menu for opening in a new tab or window doesn't appear.

Solution:
Add an href attribute: If possible, provide a fallback URL with the href attribute. This way, users can still open the link in a new tab.

<li>
   <a href="your_fallback_url" onclick="changeBkRadheef('radheefAll'); return false;">އެއްކުރަމުންދާ ރަދީފުތައް</a>
</li>

*/
