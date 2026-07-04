/* ============================================================
   BirruMv — Main JavaScript
   ============================================================ */

// ----- Tab System -----
let initialClickDone = false;

function openTab(event, tabId) {
  const tabContents = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabContents.length; i++) {
    tabContents[i].style.display = "none";
  }

  const tabLinks = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tabLinks.length; i++) {
    tabLinks[i].className = tabLinks[i].className.replace(" active", "");
  }

  document.getElementById(tabId).style.display = "block";
  event.currentTarget.className += " active";

  if (initialClickDone) {
    afterClickFunction();
  }
}

function afterClickFunction() {
  console.log("Tab opened successfully!");
  window.scrollTo({ top: 650, behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("defaultOpen").click();
  initialClickDone = true;
});

// ----- Modal -----
const modal = document.getElementById("myModal");
const span = document.getElementsByClassName("close")[0];

function openModal() {
  modal.style.display = "block";
}

span.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// ----- Expandable Sections -----
function showhide() {
  document.getElementById("hiddenPost").classList.toggle("showOnClick");
}

function showhide2() {
  document.getElementById("hiddenPost2").classList.toggle("showOnClick2");
}

// ----- Aqiqah Date Calculator -----
function setSecondDate() {
  const days = document.getElementById("selectDays").value;
  const date = new Date(document.getElementById("date1").value);

  date.setDate(date.getDate() + parseInt(days));
  document.getElementById("date2").valueAsDate = date;
  document.getElementById("b4Maghrib").innerHTML = date.toDateString();

  date.setDate(date.getDate() + 1);
  document.getElementById("date3").valueAsDate = date;
  document.getElementById("afterMaghrib").innerHTML = date.toDateString();
}

// Initialize calculator on page load
document.addEventListener("DOMContentLoaded", function () {
  const dateInput = document.getElementById("date1");
  if (dateInput) {
    dateInput.valueAsDate = new Date();
    setSecondDate();
  }
});

// ----- Scroll to Top Button -----
const toTop = document.querySelector(".toTop");
window.addEventListener("scroll", function () {
  if (window.pageYOffset > 100) {
    toTop.classList.add("active_toTop");
  } else {
    toTop.classList.remove("active_toTop");
  }
});

// ----- Dynamic Copyright Year -----
document.querySelector("#copyRyear").innerText = new Date().getFullYear();

// ----- Google Analytics -----
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("js", new Date());
gtag("config", "G-Z11MZ9CV54");
