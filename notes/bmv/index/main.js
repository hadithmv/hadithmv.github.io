/* ============================================================
   BirruMv — Main JavaScript
   ============================================================ */

// ----- Product Card Carousels -----
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".carousel").forEach(function (carousel) {
    var track = carousel.querySelector(".carousel-track");
    var prevBtn = carousel.querySelector(".carousel-prev");
    var nextBtn = carousel.querySelector(".carousel-next");
    var dots = carousel.querySelectorAll(".carousel-dots span");
    var images = track.querySelectorAll("img");
    var index = 0;
    var autoTimer = null;

    // Initialize: first image visible, others hidden
    images.forEach(function (img, i) {
      if (i === 0) img.classList.add("active");
    });

    function goTo(i) {
      if (i < 0) i = images.length - 1;
      if (i >= images.length) i = 0;
      if (i === index) return;
      // Remove active from current, add to target
      images[index].classList.remove("active");
      index = i;
      images[index].classList.add("active");
      dots.forEach(function (d, j) {
        d.classList.toggle("active", j === index);
      });
    }

    function next() {
      goTo(index + 1);
    }
    function prev() {
      goTo(index - 1);
    }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(next, 3000);
    }

    function stopAuto() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    if (prevBtn)
      prevBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        prev();
        startAuto();
      });

    if (nextBtn)
      nextBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        next();
        startAuto();
      });

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function (e) {
        e.stopPropagation();
        goTo(i);
        startAuto();
      });
    });

    carousel.addEventListener("mouseenter", stopAuto);
    carousel.addEventListener("mouseleave", startAuto);

    if (images.length > 1) {
      startAuto();
    }
  });
});

// ----- Tab System -----
document.addEventListener("DOMContentLoaded", function () {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  function openTab(tabId) {
    tabContents.forEach(function (content) {
      content.classList.remove("active");
    });

    tabBtns.forEach(function (btn) {
      btn.classList.remove("active");
      btn.setAttribute("aria-selected", "false");
    });

    const selectedContent = document.getElementById(tabId);
    if (selectedContent) {
      selectedContent.classList.add("active");
    }

    const selectedBtn = document.querySelector('[data-tab="' + tabId + '"]');
    if (selectedBtn) {
      selectedBtn.classList.add("active");
      selectedBtn.setAttribute("aria-selected", "true");
    }
  }

  tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const tabId = this.getAttribute("data-tab");
      openTab(tabId);
      setTimeout(function () {
        document.querySelector(".tab-nav").scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    });
  });

  const defaultBtn = document.getElementById("defaultOpen");
  if (defaultBtn) {
    defaultBtn.click();
  } else if (tabBtns.length > 0) {
    tabBtns[0].click();
  }
});

// ----- Modal -----
const modal = document.getElementById("myModal");

function openModal() {
  modal.classList.add("open");
}

function closeModal() {
  modal.classList.remove("open");
}

modal.addEventListener("click", function (event) {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && modal.classList.contains("open")) {
    closeModal();
  }
});

// ----- Expandable Sections (loads content from markdown files) -----
function toggleExpand(id) {
  const el = document.getElementById(id);
  const btn = el.previousElementSibling;
  if (el.classList.contains("open")) {
    el.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    return;
  }
  // If content already loaded, just open
  if (el.dataset.loaded) {
    el.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
    return;
  }
  // Fetch markdown content
  const file = id.replace("Info", "");
  fetch("info/" + file + ".md")
    .then(function (res) {
      if (!res.ok) throw new Error("Failed to load");
      return res.text();
    })
    .then(function (text) {
      // Convert plain text to paragraphs
      var html = text
        .split("\n\n")
        .filter(function (p) {
          return p.trim().length > 0;
        })
        .map(function (p) {
          return "<p>" + p.trim().replace(/\n/g, "<br>") + "</p>";
        })
        .join("\n");
      el.innerHTML = html;
      el.dataset.loaded = "1";
      el.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
    })
    .catch(function () {
      el.innerHTML = "<p>Content could not be loaded.</p>";
      el.dataset.loaded = "1";
      el.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
    });
}

// ----- Aqiqah Date Calculator -----
function setSecondDate() {
  const days = document.getElementById("selectDays").value;
  const date = new Date(document.getElementById("date1").value);

  date.setDate(date.getDate() + parseInt(days));
  document.getElementById("b4Maghrib").innerHTML = date.toDateString();

  date.setDate(date.getDate() + 1);
  document.getElementById("afterMaghrib").innerHTML = date.toDateString();
}

document.addEventListener("DOMContentLoaded", function () {
  const dateInput = document.getElementById("date1");
  if (dateInput) {
    dateInput.valueAsDate = new Date();
    setSecondDate();
  }
});

// ----- Jump to Calculator -----
function jumpCalc() {
  document.getElementById("jumpCalcHere").scrollIntoView({
    behavior: "smooth",
  });
}

// ----- Scroll to Top Button -----
const scrollTopBtn = document.getElementById("scrollTop");

if (scrollTopBtn) {
  window.addEventListener("scroll", function () {
    if (window.pageYOffset > 200) {
      scrollTopBtn.classList.add("visible");
    } else {
      scrollTopBtn.classList.remove("visible");
    }
  });

  scrollTopBtn.addEventListener("click", function () {
    var startY = window.pageYOffset;
    var startTime = null;

    function easeInOut(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function scrollStep(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var duration = 600; // ms — slower, gentler scroll
      var progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY * (1 - easeInOut(progress)));
      if (progress < 1) {
        requestAnimationFrame(scrollStep);
      }
    }

    requestAnimationFrame(scrollStep);
  });
}

// ----- Dynamic Copyright Year -----
const copyYear = document.getElementById("copyRyear");
if (copyYear) {
  copyYear.innerText = new Date().getFullYear();
}

// ----- Google Analytics -----
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("js", new Date());
gtag("config", "G-Z11MZ9CV54");
