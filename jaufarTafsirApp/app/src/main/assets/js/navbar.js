var hmvVersionNo = "1.0.60";

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
         src="../img/logo/logo-noText.svg"
         onerror="this.onerror=null; this.src='../../img/logo/logo.svg';"
         title="Homepage"
         />
      </a>
   </div>
   <div class="navbar-center">
      <span class="navbar-page-title" title="Jaufar Tafsir - ޖަޢުފަރުގެ ތަފްސީރު">${pageTitle}</span>
   </div>
   <div class="navbar-right" title="Menu">
      <span class="navbar-menu-icon hamburgerIcon"></span>
   </div>
</nav>
<div class="navbar-overlay" id="navOverlay" onclick="toggleSideMenu()"></div>
<div class="navbar-side-menu" id="sideMenu">
   <div class="navbar-side-menu-close" onclick="toggleSideMenu()">×</div>
   <ul>
      <li>
         <a href="../books/index.html" title="Homepage"><span class="homeIcon"></span>މައި ސަފުހާ</a>
      </li>
      <li>
         <a href="../books/jaufarTafsir.html" title="Open Tafsir"><span class="bookIcon"></span>ތަފްސީރު ހުޅުވާ</a>
      </li>
      <li>
         <a href="../page/forewordAuthor.html" title="ForewordAuthor"><span class="supportSideMenuIcon"></span>މުއައްލިފުގެ މުގައްދިމާ</a>
      </li>
      <li>
         <a href="../page/forewordFounder.html" title="ForewordFounder"><span class="helpersIcon"></span>މުއައްސިސުގެ ބަސް</a>
      </li>
      <li>
         <a href="../page/about.html" title="About the Project"><span class="faqIcon"></span>މަޝްރޫއާ ބެހޭ</a>
      </li>
      <li>
         <a href="../page/contact.html" title="Contact"><span class="contactIcon"></span>ގުޅުއްވުމަށް</a>
      </li>
      <hr>
      <li>
         <a href="#"
            onclick='window.scrollTo({top:0,behavior:"smooth"})'  title="Scroll Up"
            ><span class="scrollUpIcon"></span>މައްޗަށް ސްކްރޯލްކުރޭ</a
            >
      </li>
      <li>
        <a href="#" onclick="window.location.reload()" title="Soft Reload"> <span class="navbar-dropdown-arrow reloadIcon"></span>ރީލޯޑު</a>
      </li>
      
      <li class="versionNo">
         <a ><span class="versionIcon"></span>v${hmvVersionNo}</a>
      </li>
   </ul>
</div>
`;
}
// the navbar.html code would be between the backticks above.

// Ensure the navbar is created once the DOM is fully loaded
document.addEventListener("DOMContentLoaded", createNavbar);

// Function to toggle the side menu's visibility
function toggleSideMenu() {
  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("navOverlay");
  const hamburger = document.querySelector(".hamburgerIcon");
  sideMenu.classList.toggle("open");
  if (overlay) overlay.classList.toggle("active");
  if (hamburger) {
    if (sideMenu.classList.contains("open")) {
      hamburger.classList.add("hidden");
    } else {
      hamburger.classList.remove("hidden");
    }
  }
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
