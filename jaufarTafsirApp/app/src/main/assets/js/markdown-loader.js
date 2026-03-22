// configuration data
/* SITE CONFIGURATION
   Previously in config.js, now integrated here for simplicity
   Contains all site-wide constants and settings */
export const siteConfig = {
  // Site meta description - shown in search results and social shares
  description:
    "The Dhivehi Platform for the Sunnah | ދިވެހިންގެ ސުންނަތުގެ މަންސަ",

  // SEO keywords for search engines
  keywords: "hadithmv, hadith mv, hadeeth mv...", // truncated for brevity

  // Site branding elements
  siteName: "Hadithmv",
  siteNameDv: "ޙަދީޘްއެމްވީ", // Dhivehi name
  logo: "https://hadithmv.github.io/img/logo/NewLogo7/hadithmv-logo-7.0-whiteBack-512px.png",

  // Theme color for browser UI
  themeColor: "#29434e",

  // Google Analytics configuration
  analytics: {
    id: "G-HL24Q9NN24",
    script: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-HL24Q9NN24');
    `,
  },
};

/* MARKDOWN PAGE INITIALIZATION
   Main export function that sets up the markdown page */
export function initializePage(markdownPath) {
  // Configure Marked.js parser options
  marked.setOptions({
    breaks: true, // Convert \n to <br>
    gfm: true, // Enable GitHub Flavored Markdown
  });

  // Set meta tags and other page metadata
  setMetadata();

  // Begin content loading process
  loadContent(markdownPath);
}

/* METADATA SETUP
   Sets all the meta tags for SEO and social sharing */
function setMetadata() {
  // Set basic meta tags
  document.querySelector('meta[name="description"]').content =
    siteConfig.description;
  document.querySelector('meta[name="keywords"]').content = siteConfig.keywords;

  // Set schema.org metadata (for rich snippets)
  document.querySelector('meta[itemprop="description"]').content =
    siteConfig.siteNameDv;
  document.querySelector('meta[itemprop="image"]').content = siteConfig.logo;

  // Set OpenGraph meta tags (for social sharing)
  document.querySelector('meta[property="og:type"]').content = "website";
  document.querySelector('meta[property="og:image"]').content = siteConfig.logo;

  // Set theme color for browser UI
  document.querySelector('meta[name="theme-color"]').content =
    siteConfig.themeColor;
}

/* CONTENT LOADING
   Fetches and processes markdown content */
function loadContent(markdownPath) {
  fetch(markdownPath)
    .then((response) => response.text())
    .then((markdown) => {
      updateTitle(markdown); // Set page title from markdown
      renderContent(markdown); // Convert and display markdown
      loadAnalytics(); // Initialize analytics
      showContent(); // Make content visible
    })
    .catch((error) => {
      console.error("Error loading markdown:", error);
      document.getElementById("content").innerHTML =
        "<p>Error loading content.</p>";
      showContent(); // Show error message if load fails
    });
}

/* TITLE UPDATING 
   Extracts and sets page title from markdown H1 */
function updateTitle(markdown) {
  // Look for first H1 header in markdown
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    const pageTitle = titleMatch[1];
    // Update title in various locations
    document.title = pageTitle;
    document.querySelector('meta[itemprop="name"]').content = pageTitle;
    document.querySelector('meta[property="og:title"]').content = pageTitle;
  }
}

/* CONTENT RENDERING
   Converts markdown to HTML and inserts into page */
function renderContent(markdown) {
  document.getElementById("content").innerHTML = marked.parse(markdown);
}

/* CONTENT DISPLAY
   Handles transition from loading to displaying content */
function showContent() {
  // Hide loading skeleton
  document.getElementById("skeleton").style.display = "none";
  // Show main content
  document.getElementById("content").style.display = "block";

  // Make page visible (prevents FOUC)
  document.documentElement.style.visibility = "visible";
  document.documentElement.style.opacity = "1";
}

/* ANALYTICS SETUP
   Initializes Google Analytics */
function loadAnalytics() {
  // Add gtag.js script
  const gtagScript = document.createElement("script");
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${siteConfig.analytics.id}`;
  gtagScript.async = true;
  document.body.appendChild(gtagScript);

  // Add initialization code
  const inlineScript = document.createElement("script");
  inlineScript.textContent = siteConfig.analytics.script;
  document.body.appendChild(inlineScript);
}

// Add skeleton styles to your markdown-page.css
