/**
 * Common initialisation shared by both dashboard and reader pages.
 *
 * ── window.* conventions ──────────────────────────────────────
 * Functions on `window` used by BOTH pages MUST be defined here.
 *   window.setFocus, window.showToast, window.copyToClipboard,
 *   window.LS_KEYS, window.createModal, window.MODAL_IDS,
 *   window.openModal, window.closeModal, window.closeAllModals,
 *   window.openDropdown, window.closeAllDropdowns, window.registerDropdown
 *
 * Functions on `window` for pins/history live in pins-history.js:
 *   window.openPinsModal, window.openHistoryModal
 *
 * Rule: before adding a new `window.X = …`, ask: does it serve both pages?
 *   YES → common.js    NO → the owning module
 */

import { initI18n, setLanguage, t, tagLabel } from "./i18n.js";

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
  // One search-history store shared by the reader's search window and the
  // library-search page (this-book, all-books and page searches all commit
  // to it); the dashboard keeps its own — title-search, different semantics.
  searchHistory: "searchHistory",
  dashSearchHistory: "dash:searchHistory",
  readerHideTashkeel: "reader:hideTashkeel",
  // NOTE: hidden columns are per-book (reader:hiddenColumns:{bookCode}),
  // built dynamically in reader.js — no static constant
  readerQuranShowAyahNum: "reader:quranShowAyahNum",
  readerQuranShowBraces: "reader:quranShowBraces",
  readerQuranShowNumBrackets: "reader:quranShowNumBrackets",
};

// ── Shared constants ────────────────────────────────────────
// The mobile breakpoint — sync pair with the CSS `@media (max-width: 600px)`
// literals (docs/ARCHITECTURE.md "Responsive"): custom properties cannot be
// used in media conditions, so the two must match by convention.
window.MOBILE_BP = 600;
window.TAG_ALL = "__all__"; // the "All tags" chip's data-tag value

// ── Shared dropdown helpers (reader + library-search pages) ──
var _ddIds = [];

/** Close every registered dropdown (columns, export, Quran nav, search history). */
window.closeAllDropdowns = function () {
  _ddIds.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
};

/** Position a dropdown below its anchor (fixed) and show it. */
window.openDropdown = function (dd, anchorEl, gap) {
  window.closeAllDropdowns();
  var r = anchorEl.getBoundingClientRect();
  dd.style.position = "fixed";
  dd.style.top = r.bottom + (gap || 4) + "px";
  dd.style.left = r.left + "px";
  dd.style.display = "block";
};

/** Track a dropdown id for closeAllDropdowns (the element may not exist yet). */
window.registerDropdownId = function (id) {
  if (_ddIds.indexOf(id) === -1) _ddIds.push(id);
};

/** Track a dropdown + wire outside-click-to-close. */
window.registerDropdown = function (id, dd, anchor) {
  window.registerDropdownId(id);
  document.addEventListener("click", function (e) {
    if (!dd.contains(e.target) && e.target !== anchor) {
      dd.style.display = "none";
    }
  });
};

// ── Tag chip markup (shared by dashboard + library-search pages) ──
// Both pages render the same filter-chip row; the templates must not drift.
window.tagAllChipHtml = function (tagsActive, count) {
  return (
    '<span class="tag-chip' +
    (tagsActive ? "" : " active") +
    '" data-tag="' + window.TAG_ALL + '" title="' +
    (tagsActive ? "Clear all tag filters" : "Showing all books") +
    '">' +
    t("tagFilterAll") +
    " <small>(" +
    count +
    ")</small></span>"
  );
};
window.tagChipHtml = function (code, label, palette, active, count) {
  // label is the tag's trilingual definition ({dv,en,ar}) — tooltips are
  // English-only house style, so the title always reads the English label.
  var chipTitle = active
    ? "Remove filter: " + tagLabel(code, label, "en")
    : "Filter by " + tagLabel(code, label, "en");
  // Every tag carries a palette slot (0-based, file order) — no negative case.
  var palClass = " tag-palette-" + palette;
  return (
    '<span class="tag-chip' +
    (active ? " active" : "") +
    palClass +
    '" data-tag="' +
    code +
    '" title="' +
    chipTitle +
    '">' +
    // The ✕ span is always present so the chip's width never changes when
    // it becomes active — a growing pill would reflow the whole chip row.
    // CSS hides the slot while the chip is inactive (visibility, not
    // display: the layout box must stay reserved).
    '<span class="chip-x">✕</span>' +
    tagLabel(code, label) +
    " <small>(" +
    count +
    ")</small></span>"
  );
};

// Reserve the widest of the given strings on an element (min-width) so it
// never changes size when its text swaps between them — the neighbors stay
// put. Restores the current text; re-call after language/font changes so the
// measurements stay current (the normal re-render paths do this). For a
// native <select> the strings are optional — the helper cycles the options
// themselves by index, so the option elements are never touched.
// Every reservation is also re-measured once the webfonts settle
// (document.fonts.ready): with font-display: swap the labels swap from the
// fallback font to the wider webfont, so a fallback-measured min-width goes
// stale. Elements still hidden (offsetWidth 0) at that moment keep their old
// reservation and re-measure on their next visible call instead.
var _reservedWidest = [];
var _reservedFontsDone = false;
window.reserveWidestText = function (el, strings) {
  if (!el) return;
  var sel = el.tagName === "SELECT";
  if (!sel && (!strings || !strings.length)) return;
  var i, known = false;
  for (i = 0; i < _reservedWidest.length; i++) {
    if (_reservedWidest[i].el === el) { known = true; break; }
  }
  if (!known) _reservedWidest.push({ el: el, strings: strings, sel: sel });
  var cur = sel ? el.selectedIndex : el.textContent;
  var max = 0;
  var n = sel ? el.options.length : strings.length;
  for (i = 0; i < n; i++) {
    if (sel) el.selectedIndex = i;
    else el.textContent = strings[i];
    if (el.offsetWidth > max) max = el.offsetWidth;
  }
  el.style.minWidth = max + "px";
  if (sel) el.selectedIndex = cur;
  else el.textContent = cur;
  if (!_reservedFontsDone && document.fonts && document.fonts.ready) {
    _reservedFontsDone = true;
    document.fonts.ready.then(function () {
      for (var j = 0; j < _reservedWidest.length; j++) {
        var r = _reservedWidest[j];
        if (r.el.offsetWidth > 0) window.reserveWidestText(r.el, r.strings);
      }
    });
  }
};

/**
 * Collapsible chip row — shared by the dashboard and library-search pages.
 * Clamps the chip row to one line and shows a chevron toggle only when the
 * chips overflow; the toggle expands/collapses and lives in-flow right before
 * the "Tags:" label, so it never moves when the row grows. Returns a
 * refresh() that re-measures after the chips re-render. The expanded state
 * lives on the collapse element's class, so it survives re-renders (the
 * chips' innerHTML is rewritten, the box is not) and resets on reload.
 */
window.initTagsCollapse = function (collapseId, toggleId) {
  var collapse = document.getElementById(collapseId);
  var toggle = document.getElementById(toggleId);
  if (!collapse || !toggle) return null;
  var label = toggle.querySelector(".tags-toggle-label");
  // The toggle is a normal flow item inside the box, right before the Tags:
  // label (which the pages render as the box's first child). Being at the
  // start of the rows means it never relocates when the box expands — line 1
  // is toggle + label + chips, the rows below span the full width.

  function syncLabel() {
    var expanded = collapse.classList.contains("expanded");
    toggle.title = expanded ? "Less tags" : "More tags";
    if (!label) return;
    // More ↔ Less swap — reserve the wider string so the button never changes
    // width and the chips don't shift.
    window.reserveWidestText(label, [t("tagsShowMore"), t("tagsShowFewer")]);
    label.textContent = t(expanded ? "tagsShowFewer" : "tagsShowMore");
  }

  function refresh() {
    // Chip re-renders (innerHTML) wipe the toggle — re-insert it right before
    // the label if needed. (With no chips there is no label; the toggle then
    // stays where the HTML put it and stays hidden below.)
    var tagLabel = collapse.querySelector(".tags-label");
    if (tagLabel && toggle.parentElement !== collapse)
      collapse.insertBefore(toggle, tagLabel);
    // Overflow = the chips' content height exceeds one row. scrollHeight is
    // the full content height whether the box is clamped or expanded (it
    // includes the clipped rows), so this needs no class dance — measuring
    // never touches max-height, so no transition can kick in, and the read
    // can't race an animation. (The old dance — remove .expanded, read
    // clientHeight, restore — misjudged mid-transition AND its snap to the
    // clamped height made the engine animate the panel on every re-render.)
    var chip = collapse.querySelector(".tag-chip");
    var oneRow = chip ? chip.offsetHeight : 0;
    var overflows = oneRow > 0 && collapse.scrollHeight > oneRow + 2;
    toggle.style.display = overflows ? "" : "none";
    toggle.classList.toggle("expanded", overflows && collapse.classList.contains("expanded"));
    syncLabel();
  }

  toggle.addEventListener("click", function () {
    collapse.classList.toggle("expanded");
    toggle.classList.toggle("expanded");
    syncLabel();
  });
  window.addEventListener("resize", refresh);
  refresh();
  return refresh;
};

// ── Theme (blocking — inline in <head>, replicated here for reader page) ─
(function () {
  var theme = localStorage.getItem(window.LS_KEYS.theme);
  if (theme && theme !== "light")
    document.documentElement.setAttribute("data-theme", theme);
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
  // The panel chrome tiers (--panel-font-size / --panel-font-size-mobile)
  // are computed in CSS from --reader-font-size (common.css token block) —
  // no inline styles here, so the global ≤600px panel swap can redefine
  // the panel tier without fighting an inline style.
  var val = document.getElementById("fontSizeVal");
  if (val) val.textContent = size;
  try { localStorage.setItem(window.LS_KEYS.fontSize, size); } catch (_) {}
}

(function () {
  var saved = (function () { try { return localStorage.getItem(window.LS_KEYS.fontSize); } catch (_) { return null; } })();
  var val = document.getElementById("fontSizeVal");
  var size = (saved && FONT_SIZES.indexOf(saved) !== -1) ? saved : DEFAULT_FONT_SIZE;
  html.style.setProperty("--reader-font-size", size);
  var readerPx = parseFloat(size);
  var mobileReaderPx = Math.round(readerPx * 0.88 * 100) / 100;
  html.style.setProperty("--reader-font-size-mobile", mobileReaderPx + "rem");
  // Panel chrome tiers come from CSS (see applyFontSize) — no inline writes.
  if (val) val.textContent = size;
})();

// ── Font family dropdown ────────────────────────────────────
(function () {
  var sel = document.getElementById("selFontFamily");
  if (!sel) return;
  var saved = (function () {
    try { return localStorage.getItem(window.LS_KEYS.fontSystem) === "1" ? "system" : "hadithmv"; }
    catch (_) { return "hadithmv"; }
  })();
  sel.value = saved;
  if (saved === "system") html.setAttribute("data-font-system", "");
  sel.addEventListener("change", function () {
    var val = this.value;
    if (val === "system") {
      html.setAttribute("data-font-system", "");
      localStorage.setItem(window.LS_KEYS.fontSystem, "1");
    } else {
      html.removeAttribute("data-font-system");
      localStorage.setItem(window.LS_KEYS.fontSystem, "0");
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
  var el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
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
  // Fallback for older browsers / non-HTTPS: hidden textarea + execCommand.
  // When navigator.clipboard is undefined the modern call would throw before
  // its .catch could ever run — check the API exists so this path is actually
  // reachable in the case it exists for.
  function legacyCopy() {
    var ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.left = "-9999px";
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (_) { ok = false; }
    document.body.removeChild(ta);
    // execCommand reports success with a boolean — don't claim a copy that
    // didn't happen (it returns false when no user activation is present)
    if (ok) done(); else fail();
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(legacyCopy);
  } else {
    legacyCopy();
  }
};

// ── Unified modal layer ────────────────────────────────────
// All modals use the same open/close/escape pattern.
// Each modal registers its overlay ID here.
window.MODAL_IDS = ["settingsOverlay", "fontModalOverlay"];

window.closeAllModals = function () {
  _modalStack.length = 0;
  window.MODAL_IDS.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove("open");
  });
};

// Element that had focus before the current modal opened — restored on close
// so keyboard/screen-reader users land back where they started.
var _modalLastFocused = null;

// Stacked modals (openModalOnTop): a modal opened over another without
// closing it. Entries are {id, prevFocused} — the element that was focused
// inside the modal below, restored when the stacked modal closes (Escape
// closes innermost first, so the top entry is always the one closing).
var _modalStack = [];

window.closeModal = function (id) {
  var el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("open");
  // A stacked modal closes back onto the modal below it, not onto the page:
  // restore the element focused when it opened, else the below modal's first
  // focusable. The base modal keeps its own _modalLastFocused untouched for
  // when IT closes back onto the page.
  for (var i = _modalStack.length - 1; i >= 0; i--) {
    if (_modalStack[i].id !== id) continue;
    _modalStack.splice(i, 1);
    var below = _modalStack.length > 0 ? _modalStack[_modalStack.length - 1] : null;
    var belowEl = below ? document.getElementById(below.id) : null;
    if (below && belowEl) {
      if (below.prevFocused && document.contains(below.prevFocused)) {
        try { below.prevFocused.focus(); } catch (_) {}
      } else {
        focusFirstInModal(belowEl);
      }
      return;
    }
    break; // was stacked, nothing below — fall through to the page restore
  }
  if (_modalLastFocused && document.contains(_modalLastFocused)) {
    try { _modalLastFocused.focus(); } catch (_) {}
  }
  _modalLastFocused = null;
};

function focusablesIn(overlay) {
  return overlay.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
}

// Focus the first focusable (the modal's close ✕ is first in the header) —
// opening must move focus INTO the dialog, not leave it on the trigger.
function focusFirstInModal(overlay) {
  var focusables = focusablesIn(overlay);
  if (focusables.length > 0) {
    try { focusables[0].focus(); } catch (_) {}
  }
}

// Tab/Shift+Tab cycle within the topmost open modal instead of wandering
// behind the overlay.
document.addEventListener("keydown", function (e) {
  if (e.key !== "Tab") return;
  for (var i = window.MODAL_IDS.length - 1; i >= 0; i--) {
    var overlay = document.getElementById(window.MODAL_IDS[i]);
    if (!overlay || !overlay.classList.contains("open")) continue;
    var focusables = focusablesIn(overlay);
    if (focusables.length === 0) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    var active = document.activeElement;
    if (e.shiftKey) {
      if (active === first || !overlay.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else if (active === last || !overlay.contains(active)) {
      e.preventDefault();
      first.focus();
    }
    return;
  }
});

window.openModal = function (id) {
  window.closeAllModals();
  var el = document.getElementById(id);
  if (!el) return;
  _modalLastFocused = document.activeElement;
  openModalPop(id, el);
};

// Open a modal over the currently open one instead of replacing it (e.g. the
// search window's scope summary opens the libScope modal while the window
// stays underneath). openModal stays exclusive — only surfaces that need
// stacking call this. Same pop-transition focus deferral as openModal.
window.openModalOnTop = function (id) {
  var el = document.getElementById(id);
  if (!el) return;
  _modalStack.push({ id: id, prevFocused: document.activeElement });
  openModalPop(id, el);
};

function openModalPop(id, el) {
  el.classList.add("open");
  // The overlay's pop transition leaves the modal computed as
  // visibility:hidden for its whole duration — focus() calls in that window
  // fail silently. Defer the focus-first until the transition flips it
  // visible (and skip if the modal was already closed again).
  var pop = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--t-pop")) || 0.2;
  window.setTimeout(function () {
    if (el.classList.contains("open")) focusFirstInModal(el);
  }, pop * 1000 + 10);
}

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
// Title/message/confirm-button come from i18n keys; params (optional)
// substitutes {k} placeholders in the message (same syntax as fillTemplate);
// onConfirm runs only when the user presses the confirm button
// (Escape / backdrop / Cancel = no).
window.confirmModal = function (titleKey, messageKey, confirmKey, onConfirm, params) {
  var overlay = window.createModal("confirmOverlay", "confirmModalTitle", "confirmModalBody", "confirm-modal");
  document.getElementById("confirmModalTitle").textContent = t(titleKey);
  var msg = t(messageKey);
  if (params) {
    for (var k in params) msg = msg.replace("{" + k + "}", params[k]);
  }
  document.getElementById("confirmModalBody").innerHTML =
    '<p class="confirm-message">' + msg + "</p>" +
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
// Toggles data-focus on <html>, flips btnFocus's active state (glyph rotation is pure CSS), persists to LS.
// Dispatches "focuschange" event so pages can react (e.g. recalc layout).
window.setFocus = function (on) {
  var html = document.documentElement;
  var btn = document.getElementById("btnFocus");
  if (on) {
    html.setAttribute("data-focus", "");
    if (btn) { btn.classList.add("active"); }
  } else {
    html.removeAttribute("data-focus");
    if (btn) { btn.classList.remove("active"); }
  }
  try { localStorage.setItem(window.LS_KEYS.focus, on ? "1" : "0"); } catch (_) {}
  window.dispatchEvent(new CustomEvent("focuschange", { detail: { on: on } }));
};

// Restore focus state on load
(function () {
  try { if (localStorage.getItem(window.LS_KEYS.focus) === "1") window.setFocus(true); } catch (_) {}
})();

// ── Settings modal ──────────────────────────────────────────
(function () {
  var overlay = document.getElementById("settingsOverlay");
  if (!overlay) return;

  document.getElementById("btnSettings").addEventListener("click", function () {
    window.openModal("settingsOverlay");
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
      localStorage.setItem(window.LS_KEYS.theme, val === "light" ? "" : val);
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
    var saved = (function () { try { return localStorage.getItem(window.LS_KEYS.contentWidth); } catch (_) { return null; } })();
    if (saved) { sel.value = saved; apply(saved); }
    sel.addEventListener("change", function () {
      var val = this.value;
      apply(val);
      try { localStorage.setItem(window.LS_KEYS.contentWidth, val); } catch (_) {}
    });
  })();

  // Reset settings — delegates to font/reader resets, then adds its own
  // Factory reset: settings + pins + history, confirmed first (destructive)
  document.getElementById("btnResetSettings").addEventListener("click", function () {
    window.confirmModal("btnResetSettings", "confirmResetAll", "btnReset", function () {
      var html = document.documentElement;
      html.removeAttribute("data-theme");
      localStorage.setItem(window.LS_KEYS.theme, "");
      var themeSelect = document.getElementById("selTheme");
      if (themeSelect) themeSelect.value = "light";
      html.removeAttribute("data-widescreen");
      html.style.removeProperty("--content-width");
      localStorage.removeItem(window.LS_KEYS.contentWidth);
      var widthSelect = document.getElementById("selWidth");
      if (widthSelect) widthSelect.value = "800px";
      // Delegate font + reader resets
      var resetFontBtn = document.getElementById("btnResetFont");
      if (resetFontBtn) resetFontBtn.click();
      var resetReaderBtn = document.getElementById("btnResetReader");
      if (resetReaderBtn) resetReaderBtn.click();
      // Clear LS keys that the delegated buttons don't touch
      localStorage.removeItem(window.LS_KEYS.searchHistory);
      localStorage.removeItem(window.LS_KEYS.dashSearchHistory);
      localStorage.removeItem(window.LS_KEYS.focus);
      // Pins & history — part of the full reset (confirmed above)
      try { localStorage.removeItem(window.LS_KEYS.pinnedBooks); } catch (_) {}
      try { localStorage.removeItem(window.LS_KEYS.readHistory); } catch (_) {}
      document.dispatchEvent(new CustomEvent("dashboardReset"));
      localStorage.removeItem(window.LS_KEYS.lang);
      var sel = document.getElementById("selLanguage");
      if (sel) sel.value = "dv";
      window.closeModal("settingsOverlay");
    });
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
    // Panel chrome tiers recompute from --reader-font-size in CSS
    // (common.css token block) — nothing to reset inline here.
    localStorage.removeItem(window.LS_KEYS.fontSize);
    var fontSizeVal = document.getElementById("fontSizeVal");
    if (fontSizeVal) fontSizeVal.textContent = DEFAULT_FONT_SIZE;
    html.removeAttribute("data-font-system");
    localStorage.setItem(window.LS_KEYS.fontSystem, "0");
    var fontFamilySelect = document.getElementById("selFontFamily");
    if (fontFamilySelect) fontFamilySelect.value = "hadithmv";
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
    var saved = localStorage.getItem(window.LS_KEYS.lang);
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
    window.openModal("settingsOverlay");
  }
  if (e.key === "b" && !typing && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    window.location.href = "index.html";
  }
  if (e.key === "Escape") {
    // Close any open modal via closeModal (order matters: innermost first)
    // so focus is restored to whatever opened it
    for (var i = window.MODAL_IDS.length - 1; i >= 0; i--) {
      var el = document.getElementById(window.MODAL_IDS[i]);
      if (el && el.classList.contains("open")) { window.closeModal(window.MODAL_IDS[i]); return; }
    }
  }
});

// ── Modal scroll lock ───────────────────────────────────────
// (already handled by CSS body:has(.modal-overlay.open) { overflow: hidden })
