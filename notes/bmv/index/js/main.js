/* ============================================================
   BirruMv — Main JavaScript
   ============================================================ */

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

// ----- Expandable Sections -----
function toggleExpand(id) {
  const el = document.getElementById(id);
  const btn = el.previousElementSibling;
  if (el.classList.contains("open")) {
    el.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  } else {
    el.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
  }
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
