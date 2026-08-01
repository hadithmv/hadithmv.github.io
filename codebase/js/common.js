/**
 * Common initialisation shared by both dashboard and reader pages.
 *
 * ── window.* conventions ──────────────────────────────────────
 * Functions on `window` used by BOTH pages MUST be defined here.
 *   window.setFocus, window.showToast, window.copyToClipboard,
 *   window.LS_KEYS, window.createModal, window.MODAL_IDS,
 *   window.openModal, window.closeModal, window.closeAllModals
 *
 * Functions on `window` used ONLY by the reader page live in reader.js:
 *   window.openDropdown, window.closeAllDropdowns, window.registerDropdown
 *
 * Functions on `window` for pins/history live in pins-history.js:
 *   window.openPinsModal, window.openHistoryModal
 *
 * Rule: before adding a new `window.X = …`, ask: does it serve both pages?
 *   YES → common.js    NO → the owning module
 */

import { initI18n, setLanguage, t } from "../js/i18n.js";

// ── Shared localStorage keys ─────────────────────────────────
window.LS_KEYS = {
  theme: "theme",
  fontSize: "fontSize",
  fontSystem: "fontSystem",
  contentWidth: "contentWidth",
  lang: "lang",
  focus: "focus",
  pinnedBooks: "pinnedBooks",
  readHistory: "readHistory",
  readerPrefix: "reader:",
  readerSearchHistory: "reader:searchHistory",
  readerHideTashkeel: "reader:hideTashkeel",
  readerHiddenColumns: "reader:hiddenColumns",
  readerQuranShowAyahNum: "reader:quranShowAyahNum",
  readerQuranShowBraces: "reader:quranShowBraces",
  readerQuranShowNumBrackets: "reader:quranShowNumBrackets",
};

// ── Theme (blocking — inline in <head>, replicated here for reader page) ─
(function () {
  var t = localStorage.getItem(window.LS_KEYS.theme);
  if (t && t !== "light")
    document.documentElement.setAttribute("data-theme", t);
})();

// ── i18n init ───────────────────────────────────────────────

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

// ── Shared toast ────────────────────────────────────────────

// Failure toast — the ⚠️ marks it as an error (success toasts stay plain)
window.showErrorToast = function (msg) {
  showToast("⚠️ " + msg);
};

// ── Shared clipboard ────────────────────────────────────────
window.copyToClipboard = function (text, successKey, failKey) {
  var done = function () { showToast(t(successKey)); };
  var fail = function () { showErrorToast(t(failKey || "toastCopyFailed")); };
  navigator.clipboard.writeText(text).then(done).catch(function () {
    // Fallback for older browsers / non-HTTPS
    var ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.left = "-9999px";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (_) { fail(); }
    document.body.removeChild(ta);
  });
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

// Create a modal overlay dynamically (for modals not in static HTML).
// Returns the overlay element. Registers with MODAL_IDS and wires close handlers.
window.createModal = function (id, titleId, bodyId, extraClass) {
  if (document.getElementById(id)) return document.getElementById(id);
  var overlay = document.createElement("div");
  overlay.id = id;
  overlay.className = "modal-overlay";
  overlay.innerHTML = '<div class="modal' + (extraClass ? " " + extraClass : "") + '" role="dialog">' +
    '<div class="modal-header">' +
      '<h2 id="' + titleId + '" class="modal-title"></h2>' +
      '<button class="modal-close" title="Close (Escape key)">✕</button>' +
    '</div>' +
    '<div id="' + bodyId + '" class="modal-body pins-history-body"></div>' +
    '</div>';
  document.body.appendChild(overlay);
  window.MODAL_IDS.push(id);
  wireModal(id);
  return overlay;
};

// Reusable confirm dialog on the unified modal layer.
// Title/message/confirm-button come from i18n keys; onConfirm runs only
// when the user presses the confirm button (Escape / backdrop / Cancel = no).
window.confirmModal = function (titleKey, messageKey, confirmKey, onConfirm) {
  var overlay = window.createModal("confirmOverlay", "confirmModalTitle", "confirmModalBody", "confirm-modal");
  document.getElementById("confirmModalTitle").textContent = t(titleKey);
  document.getElementById("confirmModalBody").innerHTML =
    '<p class="confirm-message">' + t(messageKey) + "</p>" +
    '<div class="confirm-actions">' +
      '<button type="button" class="confirm-btn confirm-cancel" id="confirmCancel">' + t("confirmCancel") + "</button>" +
      '<button type="button" class="confirm-btn confirm-yes" id="confirmYes">' + t(confirmKey) + "</button>" +
    "</div>";
  document.getElementById("confirmYes").addEventListener("click", function () {
    window.closeModal("confirmOverlay");
    onConfirm();
  });
  document.getElementById("confirmCancel").addEventListener("click", function () {
    window.closeModal("confirmOverlay");
  });
  window.openModal("confirmOverlay");
};

// ── Shared focus mode ───────────────────────────────────────
// Toggles data-focus on <html>, updates btnFocus, persists to LS.
// Dispatches "focuschange" event so pages can react (e.g. recalc layout).
window.setFocus = function (on) {
  var html = document.documentElement;
  var btn = document.getElementById("btnFocus");
  if (on) {
    html.setAttribute("data-focus", "");
    if (btn) { btn.classList.add("active"); btn.textContent = "▼"; }
  } else {
    html.removeAttribute("data-focus");
    if (btn) { btn.classList.remove("active"); btn.textContent = "↕"; }
  }
  try { localStorage.setItem("focus", on ? "1" : "0"); } catch (_) {}
  window.dispatchEvent(new CustomEvent("focuschange", { detail: { on: on } }));
};

// Restore focus state on load
(function () {
  try { if (localStorage.getItem("focus") === "1") window.setFocus(true); } catch (_) {}
})();

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

  // Content width dropdown
  (function () {
    var sel = document.getElementById("selWidth");
    if (!sel) return;
    var html = document.documentElement;
    function apply(val) {
      html.style.setProperty("--content-width", val);
      if (val === "none") {
        html.setAttribute("data-widescreen", "");
      } else {
        html.removeAttribute("data-widescreen");
      }
    }
    // Restore saved or use default
    var saved = (function () { try { return localStorage.getItem("contentWidth"); } catch (_) { return null; } })();
    if (saved) { sel.value = saved; apply(saved); }
    sel.addEventListener("change", function () {
      var val = this.value;
      apply(val);
      try { localStorage.setItem("contentWidth", val); } catch (_) {}
    });
  })();

  // Reset settings — delegates to font/reader resets, then adds its own
  document.getElementById("btnResetSettings").addEventListener("click", function () {
    var html = document.documentElement;
    html.removeAttribute("data-theme");
    localStorage.setItem("theme", "");
    var thSel = document.getElementById("selTheme");
    if (thSel) thSel.value = "light";
    html.removeAttribute("data-widescreen");
    html.style.removeProperty("--content-width");
    localStorage.removeItem("contentWidth");
    var wsSel = document.getElementById("selWidth");
    if (wsSel) wsSel.value = "800px";
    // Delegate font + reader resets
    var btnRF = document.getElementById("btnResetFont");
    if (btnRF) btnRF.click();
    var btnRR = document.getElementById("btnResetReader");
    if (btnRR) btnRR.click();
    // Clear LS keys that the delegated buttons don't touch
    localStorage.removeItem("reader:searchHistory");
    localStorage.removeItem("focus");
    // NOTE: pins & history are NOT cleared here — they only clear via the
    // explicit "Clear pins & history" button below (with confirmation).
    document.dispatchEvent(new CustomEvent("dashboardReset"));
    localStorage.removeItem("lang");
    var sel = document.getElementById("selLanguage");
    if (sel) sel.value = "dv";
    window.closeModal("settingsOverlay");
  });

  // ── Clear pins & history (destructive — confirm first) ──
  var btnClearPH = document.getElementById("btnClearPinsHistory");
  if (btnClearPH) {
    btnClearPH.addEventListener("click", function () {
      window.confirmModal("settingsPinsHistory", "confirmAreYouSure", "dashboardClearAll", function () {
        try { localStorage.removeItem(window.LS_KEYS.pinnedBooks); } catch (_) {}
        try { localStorage.removeItem(window.LS_KEYS.readHistory); } catch (_) {}
        document.dispatchEvent(new CustomEvent("dashboardReset"));
      });
    });
  }
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
    document.dispatchEvent(new CustomEvent("readerReset"));
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

// ── Shared typing-target guard ───────────────────────────────
// True when the event target is an editable element. Shortcut handlers
// must not fire while the user is typing (Escape/arrows/Enter are
// handled case-by-case where input-appropriate).
window.isTypingTarget = function (e) {
  var tag = ((e.target && e.target.tagName) || "").toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    (e.target && e.target.isContentEditable)
  );
};

// ── Keyboard shortcuts (global) ─────────────────────────────
document.addEventListener("keydown", function (e) {
  // Combos below must never hijack keys while typing in an input;
  // Escape stays active (closing a modal is wanted even mid-typing).
  var typing = window.isTypingTarget(e);
  if (e.key === "," && !typing && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    var so = document.getElementById("settingsOverlay");
    if (so) so.classList.add("open");
  }
  if (e.key === "b" && !typing && (e.ctrlKey || e.metaKey)) {
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
