var hmvVersionNo = 3.15;

function createNavbar() {
  const navbarContainer = document.getElementById("navbar-container");
  const pageTitle = document.title;

  const navbarHTML = `
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
                        <li><a href="../notes/info/contact.html">ކުށެއް/ހިޔާލެއް ހުށަހެޅުމަށް</a></li>
                        <li><a href="../notes/info/helpTranslate.html">ތަރުޖަމާގައި އެހީވެދިނުމަށް</a></li>
                        <li><a href="../notes/info/FAQ.html">ތަކުރާރުކޮށް ކުރެވޭ ސުވާލުތައް</a></li>
                        <li><a href="../notes/info/contributors.html">އެހީތެރިން</a></li>
                        <li class="versionNo" onclick="openDiv()">⚙️ އިސްދާރު: v${hmvVersionNo}</li>
                        <li><a href="https://t.me/ashraafmv">ފަރުމާ ކުރީ: އަބޫ ޔަޙްޔާ، މުޙައްމަދު އަޝްރާފު އިބްރާހީމް</a></li>
                        <li style="font-size: 90%">މަދީނާގެ ޙަދީޘް ކުއްލިއްޔާގެ ދަރިވަރެއް</li>
                        <li style="cursor: pointer;" onclick="window.scrollTo({top: 0, behavior: 'smooth'});">▲ މައްޗަށް ސްކްރޯލްކުރޭ</li>

                        <li class="dropdown">
                            <a href="#">↺ ސަފުހާ ރީލޯޑު</a>
                            <div class="dropdown-content">
                                <a onclick="window.location.reload()" href="#">މަޑު ރީލޯޑު</a>
                                <a style="cursor: pointer;" onclick="window.location.href=window.location.href.split(&quot;.html&quot;)[0]+&quot;.html&quot;">ހަރު ރީލޯޑު</a>
                            </div>
                        </li>
                    </ul>
                </div>
            `;

  navbarContainer.innerHTML = navbarHTML;
}

function goToHomePage() {
  window.location.href = "/";
}

function toggleSideMenu() {
  const sideMenu = document.getElementById("sideMenu");
  sideMenu.classList.toggle("open");
}

document.addEventListener("DOMContentLoaded", createNavbar);

document.addEventListener("click", function (event) {
  const navbar = document.querySelector(".navbar");
  const sideMenu = document.getElementById("sideMenu");
  const isClickInsideNavbar = navbar.contains(event.target);
  const isClickInsideSideMenu = sideMenu.contains(event.target);
  const isSiteIconClicked = event.target.classList.contains("site-icon");

  if (isClickInsideNavbar && !isSiteIconClicked) {
    toggleSideMenu();
  } else if (!isClickInsideSideMenu && sideMenu.classList.contains("open")) {
    toggleSideMenu();
  }
});
//

// This JavaScript function will gradually reduce the font size until the title fits within its container, with a minimum font size of 10px.
/*function adjustTitleFontSize() {
  const title = document.querySelector(".page-title");
  const container = document.querySelector(".navbar-center");
  let fontSize = 20; // prev 20, Start with the maximum font size, if you change this value in css, make sure to also change it here

  title.style.fontSize = `${fontSize}px`;

  while (title.offsetWidth > container.offsetWidth && fontSize > 10) {
    fontSize -= 0.5; // prev
    title.style.fontSize = `${fontSize}px`;
  }
}*/

// Call the function initially and on window resize
window.addEventListener("load", adjustTitleFontSize);
window.addEventListener("resize", adjustTitleFontSize);

// A problem occurs because the side menu is positioned relative to the viewport, but it doesn't account for the dynamic nature of mobile browsers' address bars. Here's how we can fix this: We'll use JavaScript to dynamically adjust the height of the side menu based on the visible viewport height. We'll also need to listen for resize events to handle orientation changes and address bar appearance/disappearance.

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
