// configuration data
var siteConfig = {
  description: "The Dhivehi Platform for the Sunnah | ދިވެހިންގެ ސުންނަތުގެ މަންސަ",
  keywords: "jaufarTafsir, jaufar Tafsir",
  siteName: "jaufarTafsir",
  siteNameDv: "ޖަޢުފަރުތަފްސީރު",
  logo: "../img/logo/logo.svg",
  themeColor: "#29434e",
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

function initializePage(markdownPath) {
  marked.setOptions({
    breaks: true,
    gfm: true,
  });
  setMetadata();
  loadContent(markdownPath);
}

function setMetadata() {
  var descEl = document.querySelector('meta[name="description"]');
  if (descEl) descEl.content = siteConfig.description;
  var kwEl = document.querySelector('meta[name="keywords"]');
  if (kwEl) kwEl.content = siteConfig.keywords;
  var itemDescEl = document.querySelector('meta[itemprop="description"]');
  if (itemDescEl) itemDescEl.content = siteConfig.siteNameDv;
  var itemImgEl = document.querySelector('meta[itemprop="image"]');
  if (itemImgEl) itemImgEl.content = siteConfig.logo;
  var ogTypeEl = document.querySelector('meta[property="og:type"]');
  if (ogTypeEl) ogTypeEl.content = "website";
  var ogImgEl = document.querySelector('meta[property="og:image"]');
  if (ogImgEl) ogImgEl.content = siteConfig.logo;
  var themeEl = document.querySelector('meta[name="theme-color"]');
  if (themeEl) themeEl.content = siteConfig.themeColor;
}

function loadContent(markdownPath) {
  // 1) Try Android JS bridge first (most reliable for WebView apps)
  if (window.Android && typeof window.Android.readAsset === "function") {
    try {
      var content = window.Android.readAsset("page/" + markdownPath);
      if (content && content.length > 0) {
        processMarkdown(content);
        return;
      }
    } catch (e) {
      console.error("Android.readAsset failed:", e);
    }
  }

  // 2) Fallback to XMLHttpRequest (works with file:// protocol)
  var xhr = new XMLHttpRequest();
  xhr.open("GET", markdownPath, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if ((xhr.status === 200 || xhr.status === 0) && xhr.responseText && xhr.responseText.length > 0) {
        processMarkdown(xhr.responseText);
      } else {
        console.error("XHR failed - status:", xhr.status, "path:", markdownPath);
        document.getElementById("content").innerHTML =
          "<p style='text-align:center; padding: 20px;'>Error loading content.</p>";
        showContent();
      }
    }
  };
  xhr.send();
}

function processMarkdown(markdown) {
  updateTitle(markdown);
  renderContent(markdown);
  loadAnalytics();
  showContent();
}

function updateTitle(markdown) {
  var titleMatch = markdown.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    var pageTitle = titleMatch[1];
    document.title = pageTitle;
    var itemNameEl = document.querySelector('meta[itemprop="name"]');
    if (itemNameEl) itemNameEl.content = pageTitle;
    var ogTitleEl = document.querySelector('meta[property="og:title"]');
    if (ogTitleEl) ogTitleEl.content = pageTitle;
  }
}

function renderContent(markdown) {
  document.getElementById("content").innerHTML = marked.parse(markdown);
}

function showContent() {
  document.getElementById("skeleton").style.display = "none";
  document.getElementById("content").style.display = "block";
  document.documentElement.style.visibility = "visible";
  document.documentElement.style.opacity = "1";
}

function loadAnalytics() {
  var gtagScript = document.createElement("script");
  gtagScript.src = "https://www.googletagmanager.com/gtag/js?id=" + siteConfig.analytics.id;
  gtagScript.async = true;
  document.body.appendChild(gtagScript);
  var inlineScript = document.createElement("script");
  inlineScript.textContent = siteConfig.analytics.script;
  document.body.appendChild(inlineScript);
}
