// =======================
// INDEX.JS - JAUFAR TAFSIR HOME PAGE
// =======================

// Fade in the page smoothly after load
document.addEventListener("DOMContentLoaded", function () {
  // Make the page visible with a smooth transition
  document.documentElement.style.transition = "opacity 0.5s ease, visibility 0s";
  document.documentElement.style.visibility = "visible";
  document.documentElement.style.opacity = "1";
});

// =======================
// Interactive particle enhancement
// =======================

document.addEventListener("DOMContentLoaded", function () {
  const main = document.querySelector(".home-main");
  if (!main) return;

  // Subtle mouse-following glow effect (desktop only)
  if (window.matchMedia("(min-width: 600px)").matches) {
    let mouseGlow = document.createElement("div");
    mouseGlow.style.cssText = `
      position: fixed;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(78,168,222,0.04) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
      transform: translate(-50%, -50%);
      transition: left 0.3s ease-out, top 0.3s ease-out;
    `;
    main.appendChild(mouseGlow);

    main.addEventListener("mousemove", function (e) {
      mouseGlow.style.left = e.clientX + "px";
      mouseGlow.style.top = e.clientY + "px";
    });
  }
});

// =======================
// Button ripple effect
// =======================

document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".home-btn");

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        border-radius: 50%;
        background: rgba(78, 168, 222, 0.15);
        transform: scale(0);
        animation: rippleEffect 0.6s ease-out;
        pointer-events: none;
        z-index: 0;
      `;

      btn.appendChild(ripple);

      setTimeout(function () {
        ripple.remove();
      }, 600);
    });
  });

  // Add ripple animation keyframe
  const style = document.createElement("style");
  style.textContent = `
    @keyframes rippleEffect {
      to {
        transform: scale(2.5);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
});
