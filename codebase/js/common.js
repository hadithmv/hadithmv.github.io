/**
 * Common initialisation shared by both dashboard and reader pages.
 * - Theme, font, i18n, sidebar, settings modal, keyboard shortcuts.
 */

// ── Theme (blocking — inline in <head>, replicated here for reader page) ─
(function () {
  var t = localStorage.getItem("theme");
  if (t && t !== "light")
    document.documentElement.setAttribute("data-theme", t);
})();

// ── i18n init ───────────────────────────────────────────────
import { initI18n, setLanguage, t } from "../js/i18n.js";

initI18n();

// ── Font controls ───────────────────────────────────────────
var FONT_SIZES = [
  "0.7rem", "0.8rem", "0.9rem", "1rem", "1.1rem", "1.2rem", "1.25rem", "1.3rem", "1.4rem",
  "1.5rem", "1.65rem", "1.8rem", "2rem",
];
var DEFAULT_FONT_SIZE = "1.25rem";
var html = document.documentElement;

function getFontSizeIdx() {
  var cur = html.style.getPropertyValue("--reader-font-size") || DEFAULT_FONT_SIZE;
  var idx = FONT_SIZES.indexOf(cur);
  return idx === -1 ? FONT_SIZES.indexOf(DEFAULT_FONT_SIZE) : idx;
}

function applyFontSize(idx) {
  var size = FONT_SIZES[idx];
  html.style.setProperty("--reader-font-size", size);
  // Mobile reader = 88% of desktop reader (readable on narrow screens)
  var readerPx = parseFloat(size);
  var mobileReaderPx = Math.round(readerPx * 0.88 * 100) / 100;
  html.style.setProperty("--reader-font-size-mobile", mobileReaderPx + "rem");
  // Panel chrome = 68% of reader size (0.85rem / 1.25rem default)
  var panelPx = Math.round(readerPx * 0.68 * 100) / 100;
  html.style.setProperty("--panel-font-size", panelPx + "rem");
  // Mobile panel = 90% of desktop panel (fits toolbar buttons on small screens)
  var mobilePanelPx = Math.round(panelPx * 0.9 * 100) / 100;
  html.style.setProperty("--panel-font-size-mobile", mobilePanelPx + "rem");
  var val = document.getElementById("fontSizeVal");
  if (val) val.textContent = size;
  try { localStorage.setItem("fontSize", size); } catch (_) {}
}

(function () {
  var saved = (function () { try { return localStorage.getItem("fontSize"); } catch (_) { return null; } })();
  var val = document.getElementById("fontSizeVal");
  var size = (saved && FONT_SIZES.indexOf(saved) !== -1) ? saved : DEFAULT_FONT_SIZE;
  html.style.setProperty("--reader-font-size", size);
  var readerPx = parseFloat(size);
  var mobileReaderPx = Math.round(readerPx * 0.88 * 100) / 100;
  html.style.setProperty("--reader-font-size-mobile", mobileReaderPx + "rem");
  var panelPx = Math.round(readerPx * 0.68 * 100) / 100;
  html.style.setProperty("--panel-font-size", panelPx + "rem");
  var mobilePanelPx = Math.round(panelPx * 0.9 * 100) / 100;
  html.style.setProperty("--panel-font-size-mobile", mobilePanelPx + "rem");
  if (val) val.textContent = size;
})();

// ── Font family dropdown ────────────────────────────────────
(function () {
  var sel = document.getElementById("selFontFamily");
  if (!sel) return;
  var saved = (function () {
    try { return localStorage.getItem("fontSystem") === "1" ? "system" : "hadithmv"; }
    catch (_) { return "hadithmv"; }
  })();
  sel.value = saved;
  if (saved === "system") html.setAttribute("data-font-system", "");
  sel.addEventListener("change", function () {
    var val = this.value;
    if (val === "system") {
      html.setAttribute("data-font-system", "");
      localStorage.setItem("fontSystem", "1");
    } else {
      html.removeAttribute("data-font-system");
      localStorage.setItem("fontSystem", "0");
    }
  });
})();

// ── Font size buttons ───────────────────────────────────────
(function () {
  var down = document.getElementById("btnFontDown");
  var up   = document.getElementById("btnFontUp");
  if (!down || !up) return;
  down.addEventListener("click", function () {
    var idx = getFontSizeIdx();
    if (idx > 0) applyFontSize(idx - 1);
  });
  up.addEventListener("click", function () {
    var idx = getFontSizeIdx();
    if (idx < FONT_SIZES.length - 1) applyFontSize(idx + 1);
  });
})();

// ── Sidebar ─────────────────────────────────────────────────
(function () {
  var sidebar = document.getElementById("sidebar");
  var overlay = document.getElementById("sidebarOverlay");
  var openBtn  = document.getElementById("menuBtn");
  var closeBtn = document.getElementById("sidebarClose");
  if (!sidebar || !openBtn) return;

  function open()  { sidebar.classList.add("open"); overlay.classList.add("open"); }
  function close() { sidebar.classList.remove("open"); overlay.classList.remove("open"); }

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", close);

  var scrollTop = document.getElementById("btnScrollTop");
  if (scrollTop) scrollTop.addEventListener("click", function () {
    close();
    // Delay scroll slightly so sidebar close doesn't interfere
    setTimeout(function () {
      var start = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      var duration = 400;
      var startTime = null;
      function ease(k) { return 1 - Math.pow(1 - k, 3); }
      function step(t) {
        if (!startTime) startTime = t;
        var elapsed = t - startTime;
        var k = Math.min(elapsed / duration, 1);
        var pos = start * (1 - ease(k));
        window.scrollTo(0, pos);
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }, 50);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sidebar.classList.contains("open")) close();
  });
})();

// ── Shared toast ────────────────────────────────────────────
window.showToast = function (msg) {
  var el = document.querySelector(".copy-toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "copy-toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._timeout);
  el._timeout = setTimeout(function () { el.classList.remove("show"); }, 2500);
};

// ── Unified modal layer ────────────────────────────────────
// All modals use the same open/close/escape pattern.
// Each modal registers its overlay ID here.
window.MODAL_IDS = ["settingsOverlay", "fontModalOverlay"];

window.closeAllModals = function () {
  window.MODAL_IDS.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove("open");
  });
};

window.closeModal = function (id) {
  var el = document.getElementById(id);
  if (el) el.classList.remove("open");
};

window.openModal = function (id) {
  window.closeAllModals();
  var el = document.getElementById(id);
  if (el) el.classList.add("open");
};

// Shared backdrop + close-button wiring for any modal
function wireModal(id) {
  var overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) window.closeModal(id);
  });
  var closeBtn = overlay.querySelector(".modal-close");
  if (closeBtn) closeBtn.addEventListener("click", function () { window.closeModal(id); });
}
window.MODAL_IDS.forEach(wireModal);

// ── Settings modal ──────────────────────────────────────────
(function () {
  var overlay = document.getElementById("settingsOverlay");
  if (!overlay) return;

  document.getElementById("btnSettings").addEventListener("click", function () {
    window.closeAllModals();
    overlay.classList.add("open");
  });

  // Theme select
  (function () {
    var sel = document.getElementById("selTheme");
    if (!sel) return;
    var current = document.documentElement.getAttribute("data-theme") || "light";
    sel.value = current;
    sel.addEventListener("change", function () {
      var val = this.value;
      if (val === "light") document.documentElement.removeAttribute("data-theme");
      else document.documentElement.setAttribute("data-theme", val);
      localStorage.setItem("theme", val === "light" ? "" : val);
    });
  })();

  // Widescreen toggle
  (function () {
    var btn = document.getElementById("btnWidescreen");
    if (!btn) return;
    var html = document.documentElement;
    function set(on) {
      if (on) {
        html.setAttribute("data-widescreen", "");
        btn.classList.add("active"); btn.textContent = "☑";
      } else {
        html.removeAttribute("data-widescreen");
        btn.classList.remove("active"); btn.textContent = "☐";
      }
    }
    if (localStorage.getItem("widescreen")) set(true); else btn.textContent = "☐";
    btn.addEventListener("click", function () {
      var on = !html.hasAttribute("data-widescreen");
      set(on);
      if (on) localStorage.setItem("widescreen", "1");
      else localStorage.removeItem("widescreen");
    });
  })();

  // Reset settings
  document.getElementById("btnResetSettings").addEventListener("click", function () {
    var html = document.documentElement;
    html.removeAttribute("data-theme");
    localStorage.setItem("theme", "");
    var thSel = document.getElementById("selTheme");
    if (thSel) thSel.value = "light";
    html.removeAttribute("data-widescreen");
    localStorage.removeItem("widescreen");
    var wsBtn = document.getElementById("btnWidescreen");
    if (wsBtn) { wsBtn.classList.remove("active"); wsBtn.textContent = "☐"; }
    html.style.setProperty("--reader-font-size", DEFAULT_FONT_SIZE);
    html.style.setProperty("--reader-font-size-mobile", Math.round(parseFloat(DEFAULT_FONT_SIZE) * 0.88 * 100) / 100 + "rem");
    html.style.setProperty("--panel-font-size", Math.round(parseFloat(DEFAULT_FONT_SIZE) * 0.68 * 100) / 100 + "rem");
    html.style.setProperty("--panel-font-size-mobile", Math.round(parseFloat(DEFAULT_FONT_SIZE) * 0.68 * 0.9 * 100) / 100 + "rem");
    localStorage.removeItem("fontSize");
    var fsv = document.getElementById("fontSizeVal");
    if (fsv) fsv.textContent = DEFAULT_FONT_SIZE;
    html.removeAttribute("data-font-system");
    localStorage.setItem("fontSystem", "0");
    var ffSel = document.getElementById("selFontFamily");
    if (ffSel) ffSel.value = "hadithmv";
    ["reader:hideTashkeel","reader:hiddenColumns","reader:searchHistory"].forEach(function (k) {
      localStorage.removeItem(k);
    });
    localStorage.removeItem("focus");
    localStorage.removeItem("pinnedBooks");
    localStorage.removeItem("readHistory");
    document.dispatchEvent(new CustomEvent("readerset"));
    document.dispatchEvent(new CustomEvent("catalogreset"));
    localStorage.removeItem("lang");
    var sel = document.getElementById("selLanguage");
    if (sel) sel.value = "dv";
    window.closeModal("settingsOverlay");
  });
})();

// ── Font modal ───────────────────────────────────────────────
(function () {
  var overlay = document.getElementById("fontModalOverlay");
  if (!overlay) return;

  document.getElementById("btnOpenFontModal").addEventListener("click", function () {
    var sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.remove("open");
    var sOverlay = document.getElementById("sidebarOverlay");
    if (sOverlay) sOverlay.classList.remove("open");
    window.openModal("fontModalOverlay");
  });
  document.getElementById("btnResetFont").addEventListener("click", function () {
    var html = document.documentElement;
    html.style.setProperty("--reader-font-size", DEFAULT_FONT_SIZE);
    html.style.setProperty("--reader-font-size-mobile", Math.round(parseFloat(DEFAULT_FONT_SIZE) * 0.88 * 100) / 100 + "rem");
    html.style.setProperty("--panel-font-size", Math.round(parseFloat(DEFAULT_FONT_SIZE) * 0.68 * 100) / 100 + "rem");
    html.style.setProperty("--panel-font-size-mobile", Math.round(parseFloat(DEFAULT_FONT_SIZE) * 0.68 * 0.9 * 100) / 100 + "rem");
    localStorage.removeItem("fontSize");
    var fsv = document.getElementById("fontSizeVal");
    if (fsv) fsv.textContent = DEFAULT_FONT_SIZE;
    html.removeAttribute("data-font-system");
    localStorage.setItem("fontSystem", "0");
    var ffSel = document.getElementById("selFontFamily");
    if (ffSel) ffSel.value = "hadithmv";
    document.dispatchEvent(new CustomEvent("readerset"));
  });
  // Backdrop click + Escape handled by unified wireModal
})();

// ── Language select ─────────────────────────────────────────
(function () {
  var sel = document.getElementById("selLanguage");
  if (!sel) return;
  // Restore saved
  try {
    var saved = localStorage.getItem("lang");
    if (saved) sel.value = saved;
  } catch (_) {}
  sel.addEventListener("change", function () {
    setLanguage(this.value);
  });
})();

// ── Keyboard shortcuts (global) ─────────────────────────────
document.addEventListener("keydown", function (e) {
  if (e.key === "," && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    var so = document.getElementById("settingsOverlay");
    if (so) so.classList.add("open");
  }
  if (e.key === "b" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    window.location.href = "index.html";
  }
  if (e.key === "Escape") {
    // Close any open modal (order matters: close innermost first)
    for (var i = window.MODAL_IDS.length - 1; i >= 0; i--) {
      var el = document.getElementById(window.MODAL_IDS[i]);
      if (el && el.classList.contains("open")) { el.classList.remove("open"); return; }
    }
  }
});

// ── Modal scroll lock ───────────────────────────────────────
// (already handled by CSS body:has(.modal-overlay.open) { overflow: hidden })
