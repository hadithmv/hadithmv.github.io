// =======================
// TAB CODE
// =======================

// https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_tabs_fade
/*document.body.classList.add("changeBack");*/

// Get the element with id="defaultOpen" and click on it

// https://stackoverflow.com/a/56105556
// fix "Uncaught TypeError: Cannot read property 'click' of null"
// if getting executed before the dom is ready. Try by putting it inside DOMContentLoaded event

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("tab1").style.display = "block";
});

function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

/* OLD CODE BELOW, cgpt prompt used to change below code to above:
                  this code first hides a div then shows it, then when clicking buttons, switches to other divs .i want the main div to be shown by default, and then when buttons are clicked, to switch to other divs. i dont want there to be defaultOpen on an element
                  
                  document.addEventListener("DOMContentLoaded", function () {
                  document.getElementById("defaultOpen").click();
                  });
                  
                  function openTab(evt, tabName) {
                  var i, tabcontent, tablinks;
                  tabcontent = document.getElementsByClassName("tabcontent");
                  for (i = 0; i < tabcontent.length; i++) {
                    tabcontent[i].style.display = "none";
                  }
                  tablinks = document.getElementsByClassName("tablinks");
                  for (i = 0; i < tablinks.length; i++) {
                    tablinks[i].className = tablinks[i].className.replace(
                      " active",
                      ""
                    );
                  }
                  document.getElementById(tabName).style.display = "block";
                  evt.currentTarget.className += " active";
                  }
                  */

// =======================
// scrollBack2Top
// =======================

function scrollBack2Top() {
  window.scrollTo(0, 0);
}

// =======================
// animate-table
// =======================

document.addEventListener("DOMContentLoaded", function () {
  const tables = document.querySelectorAll(".animate-table");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      } else {
        entry.target.classList.remove("visible");
      }
    });
  });

  tables.forEach((table) => {
    observer.observe(table);
  });
});

// =======================
// Copy functionality for copy-specific buttons document
// =======================

// Copy this elsewhere if needed. currently in textEditor.js and index.html
// Copy functionality for copy-specific buttons document
document
  .querySelectorAll(".copy-button, .copy-button-lit, .copy-button-other")
  .forEach((button) => {
    button.addEventListener("click", async () => {
      const text = button.dataset.text || button.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        showButtonFeedback(button, "Copied");
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    });
  });

// Generic feedback for all buttons except dropdown triggers
document.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", (event) => {
    if (button.closest(".dropdown-button")) {
      // Skip feedback for dropdown buttons
      return;
    }
    showButtonFeedback(button, "Clicked");
  });
});

// Generic feedback tooltip
function showButtonFeedback(button, message) {
  // Add feedback tooltip
  const feedback = document.createElement("span");
  feedback.textContent = message;
  feedback.className = "copy-feedback";
  button.appendChild(feedback);

  // Add visual feedback
  button.classList.add("copy-success");

  // Remove feedback elements after a delay
  setTimeout(() => {
    feedback.remove();
    button.classList.remove("copy-success");
  }, 1000);
}

// =======================
// footer
// =======================

/*
document.addEventListener("DOMContentLoaded", function () {
  //....
  document.getElementById("footer").classList.remove("hidden");
});
*/
/*
function unfade(document.getElementById("footer")) {
var op = 0.1;  // initial opacity
element.style.display = 'block';
var timer = setInterval(function () {
if (op >= 1){
    clearInterval(timer);
}
element.style.opacity = op;
element.style.filter = 'alpha(opacity=' + op * 100 + ")";
op += op * 0.1;
}, 10);

}*/

// https://stackoverflow.com/questions/807878/how-to-make-javascript-execute-after-page-load/36096571#36096571

document.addEventListener("DOMContentLoaded", function () {
  //...
  // https://www.geeksforgeeks.org/how-to-add-fade-in-effect-using-pure-javascript/#:~:text=The%20fade%20effect%20is%20described,as%20the%20fade%2Din%20effect.
  var opacity = 0;
  var intervalID = 0;
  window.onload = fadeIn;

  function fadeIn() {
    setInterval(show, 75);
  }

  function show() {
    var body = document.getElementById("footer");
    opacity = Number(window.getComputedStyle(body).getPropertyValue("opacity"));
    if (opacity < 1) {
      opacity = opacity + 0.3;
      body.style.opacity = opacity;
    } else {
      clearInterval(intervalID);
    }
  }
  //...
});

// =======================
// supriseDiv
// =======================

var openDiv_Clicks = 0;
function openDiv() {
  openDiv_Clicks++;
  /*if (openDiv_Clicks == 1) {
                    //run first function
                  } else if (openDiv_Clicks == 2) {
                    //run second function
                  } else */ if (openDiv_Clicks == 5) {
    document.getElementById("supriseDiv").style.display = "block";
    openDiv_Clicks = 0;

    //
    /*document
                .querySelector("body > div.mm-ocd.mm-ocd--right.mm-ocd--open")
                .remove("mm-ocd--open");*/

    // closes side menu
    drawer.close();

    // scroll to div
    //supriseDiv.scrollIntoView({ behavior: "smooth" });
    // a little above that
    const rect = supriseDiv.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const offset = 50; // Adjust this value to scroll more or less above the element
    window.scrollTo({
      top: rect.top + scrollTop - offset,
      behavior: "smooth",
    });
  }
}

// =======================
// hiddenDiv JS - reminders
// =======================

// kahfReminder
// https://dhivehi.mv/prayer-times
/* claude:
               html: ...
                 <span class="hideOnPhoneOnly">ޙަދީޘްއެމްވީ – </span>
                 <span>ސުންނަތުގެ ތަރުޖަމާ މަންސަ</span>
             this shows the following text: ޙަދީޘްއެމްވީ – ސުންނަތުގެ ތަރުޖަމާ މަންސަ
             and it shows this text on mobile: ސުންނަތުގެ ތަރުޖަމާ މަންސަ
             using js, i want to change the text "ޙަދީޘްއެމްވީ – " to "hey man 1"
             and i want to i want to change the text "ސުންނަތުގެ ތަރުޖަމާ މަންސަ" to "hey man 2"
             //
             only change it from 5 am to 6 pm on a friday
             also in the order of position, bring span 2 first, with span 1 second
             also during that time, also get a hidden element with id "kahfReminder" and show it it
             */
// Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
const currentDay = new Date().getDay();

const currentTime = new Date().getHours();
// REMEMBER TO DECLARE THIS ONLY ONCE, REMOVE FROM OTHER TIME CHECKS

//
document.addEventListener("DOMContentLoaded", function () {
  // Check if the current day is Friday (5)
  // AND
  // Check if the current time is between 4 AM and 6 PM (inclusive)
  if (currentDay === 5 && currentTime >= 4 && currentTime <= 18) {
    // console.log("test");
    // Get the span elements
    const span1 = document.querySelector(".navbar-page-title");
    if (span1) {
      span1.textContent =
        "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ، وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيتَ عَلَى إِبْرَاهِيمَ، وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ";
    }

    // Get the span elements
    // const span1 = document.querySelector(".hideOnPhoneOnly");
    // const span2 = document.querySelector(".hideOnPhoneOnly + span");

    // Change the text content

    // span2.textContent = "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ";
    // span1.textContent =
    //   "، وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيتَ عَلَى إِبْرَاهِيمَ، وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ";

    // Reorder the spans
    // const parent = span1.parentNode;
    // parent.insertBefore(span2, span1);
    // }

    // Get the element with the ID and show it
    const kahfReminder = document.querySelector("#kahfReminder");
    if (kahfReminder) {
      kahfReminder.style.display = "flex";
      // block, table-row
    }

    // make alert container visible
    document.querySelectorAll(".alertContainer").forEach(function (element) {
      element.style.display = "flex";
    });
  }
});

//
//

// nightQuranReminder
// https://dhivehi.mv/prayer-times
/* claude: see the code above, it executes changes to the elements, but only from 5 am to 6 pm on a friday. i want you to make it so it changes the elements from 7pm to 2am, everyday */
// Get the current hour
// const currentTime = new Date().getHours();

// Check if the current time is between 7 PM and 2 AM (inclusive)
if (currentTime >= 19 || currentTime <= 2) {
  /*// Get the span elements
            const span1 = document.querySelector(".hideOnPhoneOnly");
            const span2 = document.querySelector(".hideOnPhoneOnly + span");
    
            // Change the text content
            span2.textContent = "ނިދުމުގެ ކުރިން ގުރްއާން ކިޔަވާ";
            span1.textContent = " - ސުންނަތުގައި ހިފައިގެން ރައްކާތެރިކަން ހޯދާ";
    
            // Reorder the spans
            const parent = span1.parentNode;
            parent.insertBefore(span2, span1);*/

  // Get the element with the ID and show it
  // document.querySelector("#nightQuranReminder").style.display =
  ("flex");
  // block, table-row

  // make alert container visible
  document.querySelectorAll(".alertContainer").forEach(function (element) {
    element.style.display = "flex";
  });
  //
}

//
//

// morningQuranReminder
// https://dhivehi.mv/prayer-times
/* claude: see the code above, it executes changes to the elements, but only from 5 am to 6 pm on a friday. i want you to make it so it changes the elements from 7pm to 2am, everyday */
// Get the current hour
// const currentTime = new Date().getHours();

// Check if the current time is between 4 AM and 8 AM (inclusive)
if (currentTime >= 4 && currentTime <= 8) {
  /*// Get the span elements
            const span1 = document.querySelector(".hideOnPhoneOnly");
            const span2 = document.querySelector(".hideOnPhoneOnly + span");
    
            // Change the text content
            span2.textContent = "ހޭލައިގެން ގުރްއާން ކިޔަވާ";
            span1.textContent = " - ހެނދުނުގެ ޒިކުރުތައްވެސް ކިޔާ";
    
            // Reorder the spans
            const parent = span1.parentNode;
            parent.insertBefore(span2, span1);*/

  // Change background color and content of .azkarBook element
  const azkarBook = document.querySelector(".azkarBook");
  if (azkarBook) {
    azkarBook.style.backgroundColor = "#b03b45"; // Change this to your desired color
    azkarBook.style.color = "#eee";
    azkarBook.innerHTML = `
            <p><span class="pulsateThis">⚠️</span> أذكار الصباح والمساء</p>
            <p>🤲 ހެނދުނާއި ހަވީރުގެ ޒިކުރުތައް</p>
          `;
  }

  // Get the element with the ID and show it
  document.querySelector("#morningQuranReminder").style.display = "flex";
  // block, table-row

  // make alert container visible
  document.querySelectorAll(".alertContainer").forEach(function (element) {
    element.style.display = "flex";
  });
  //
}

// =======================
// toggleview code
// =======================

// Retrieve the saved view state from localStorage
const savedViewState = localStorage.getItem("viewState");
let isListView = savedViewState === "list";

// Select all elements with the class "toggleView"
const toggleButtons = document.querySelectorAll(".toggleView");

// Function to update the view based on the global state
function updateView() {
  // Find all tabcontent elements
  const tabContents = document.querySelectorAll(".tabcontent");

  // Update all containers based on the global state
  tabContents.forEach((tabContent) => {
    const containers = tabContent.querySelectorAll(".bookContainer");
    containers.forEach((container) => {
      // Toggle class for the current container
      container.classList.toggle("list-view", isListView);

      // Toggle list-item class on all books in this container
      const books = container.querySelectorAll(".book");
      books.forEach((book) => {
        book.classList.toggle("list-item", isListView);
      });
    });
  });

  // Update the text of all toggle buttons
  toggleButtons.forEach((button) => {
    if (window.innerWidth <= 599) {
      // Mobile view
      button.innerHTML = isListView
        ? "≡<span class='hiddenOnMobile'>&nbsp;ލިސްޓު</span>"
        : "⊞<span class='hiddenOnMobile'>&nbsp;ގްރިޑް</span>";
    } else {
      // Desktop view
      button.innerHTML = isListView
        ? "≡<span class='hiddenOnMobile'>&nbsp;ލިސްޓު</span>"
        : "⊞<span class='hiddenOnMobile'>&nbsp;ގްރިޑް</span>";
    }
  });
}

// Initialize view based on saved state
updateView();

// Add click event listener to each toggle button
toggleButtons.forEach((button) => {
  button.addEventListener("click", function () {
    // Toggle the global state
    isListView = !isListView;

    // Save the new view state to localStorage
    localStorage.setItem("viewState", isListView ? "list" : "grid");

    // Update the view
    updateView();
  });
});

// =======================
// URL JUMP / CHECK CODE
// =======================

function redirectToUrl() {
  const inputElement = document.getElementById("urlInput");
  const input = inputElement.value;
  const currentUrl = window.location.href;
  let newUrl = "";

  if (input.includes("/books/")) {
    const inputAfterBooks = input.split("/books/")[1];
    const currentBase = currentUrl.split("/uc/")[0].split("/books/")[0];
    newUrl = currentBase + "/books/" + inputAfterBooks;
  } else if (input.includes("/uc/")) {
    const inputAfterUc = input.split("/uc/")[1];
    const currentBase = currentUrl.split("/books/")[0].split("/uc/")[0];
    newUrl = currentBase + "/uc/" + inputAfterUc;
  } else {
    inputElement.value = "";
    inputElement.classList.add("incorrect");
    inputElement.setAttribute("placeholder", "ލިންކު ރަނގަޅެއް ނޫން");
    inputElement.style.setProperty("--placeholder-color", "red");
    inputElement.style.setProperty("--border-color", "red");

    /* write html code for a input that has a placeholder too long for its width, so it slides across animating
        the placeholder should disappear when text is typed in the input, reappear when no text is typed in the input
        after the second red placeholder text shown, the initial placeholder text should show, just not in red, when cursor is placed, but typing hasnt happened. right now the initial placeholder text is gone as well
        */
    setTimeout(() => {
      inputElement.classList.add("incorrect-fade");
      setTimeout(() => {
        inputElement.setAttribute(
          "placeholder",
          "ބޭނުންކުރަން ދަސްކުރެވޭނެ އެންމެ ތިރިން"
        );
        inputElement.classList.remove("incorrect-fade");
      }, 500); // Match this duration to the CSS transition duration, this is transition: opacity 0.5s ease-in-out; time
    }, 1000); // new text appears after this time

    // Add focus event listener to reset styles
    inputElement.addEventListener(
      "focus",
      () => {
        inputElement.classList.remove("incorrect");
        inputElement.classList.remove("incorrect-fade");
        inputElement.removeAttribute("style");
        inputElement.setAttribute(
          "placeholder",
          "ސޭވްކުރި ސަފުހާގެ ސަފުހާގެ ލިންކު ޕޭސްޓްކުރޭ"
        ); // Set to default or new placeholder text if needed
      },
      { once: true }
    );
    return;
  }

  window.location.href = newUrl;
}

document
  .getElementById("urlInput")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      redirectToUrl();
    }
  });

// Remove incorrect class on focus
document.getElementById("urlInput").addEventListener("focus", function () {
  const inputElement = document.getElementById("urlInput");
  inputElement.classList.remove("incorrect");
  inputElement.setAttribute(
    "placeholder",
    "ސޭވްކުރި ސަފުހާގެ ލިންކު ޕޭސްޓްކުރޭ"
  );
  inputElement.style.removeProperty("--placeholder-color");
  inputElement.style.removeProperty("--border-color");
});

// =======================
//
// =======================
