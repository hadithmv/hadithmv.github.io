/* === === ===
--- REGULAR PAGE CODE ---
=== === === */

//

/* === === ===
--- SET MOBILE WIDTH CODE ---
=== === === */

let isMobile = window.innerWidth <= 800; // Boolean to check if the current view is mobile

/* --- */

/* === === ===
FILI AND FOOTNOTE REMOVE CODE
=== === === */

/*
this is my datatables js code
what i want is, when i click toggleFiliButton, i want the thaskeel characters shown in the table to be removed like a toggle, and if i click it again, i want the taskheel characters back again
here is a sample of my json data

i want to do it without
having something inside the table = new DataTable("#tableID", { scope
or using document.addEventListener('DOMContentLoaded', function() {

cant it be done without table.on('init', function() { originalData = table.data().toArray(); });
*/

//  implement  toggle functionality for removing and restoring tashkeel characters in  DataTable

/**
 * Removes tashkeel characters from the given string
 * @param {string} data - The input string
 * @return {string} The string with tashkeel characters removed
 */
function removeThashkeel(data) {
  return data.replace(/[َ|ً|ُ|ٌ|ِ|ٍ|ْ|ّ|~|⁽|⁾|¹²³⁴⁵⁶⁷⁸⁹⁰]/g, "");
}

// Declare global variables
let tashkeelRemoved = false;
let originalData = [];

/**
 * Toggles the visibility of tashkeel characters in the DataTable
 */
// NEW CODE, adapted to work for quran pages also
function toggleTashkeel() {
  tashkeelRemoved = !tashkeelRemoved;

  // Store the current page index
  const currentPage = table.page();

  if (tashkeelRemoved) {
    // Remove tashkeel from each cell that contains a string
    const newData = originalData.map((row) =>
      row.map((cell) =>
        typeof cell === "string" ? removeThashkeel(cell) : cell,
      ),
    );
    // Update the table with the new data
    table.clear().rows.add(newData).draw(false);
    // Update button text
    document.getElementById("toggleFiliButton").textContent =
      " ފިލިތައް ދައްކާ ";
  } else {
    // Restore original data with tashkeel
    table.clear().rows.add(originalData).draw(false);
    // Update button text
    document.getElementById("toggleFiliButton").textContent =
      " ފިލިތައް ފޮރުވާ ";
  }

  // Return to the previously stored page
  table.page(currentPage).draw("page");
}

// OLD CODE, without quran page mods
/*function toggleTashkeel() {
  tashkeelRemoved = !tashkeelRemoved;

  // Store the current page index
  const currentPage = table.page();

  if (tashkeelRemoved) {
    // Remove tashkeel from each cell that contains a string
    const newData = originalData.map((row) =>
      row.map((cell) =>
        typeof cell === "string" ? removeThashkeel(cell) : cell
      )
    );
    // Update the table with the new data
    table.clear().rows.add(newData).draw(false);
    // Update button text
    document.getElementById("toggleFiliButton").textContent =
      " ފިލިތައް ދައްކާ ";
  } else {
    // Restore original data with tashkeel
    table.clear().rows.add(originalData).draw(false);
    // Update button text
    document.getElementById("toggleFiliButton").textContent =
      " ފިލިތައް ފޮރުވާ ";
  }

  // Return to the previously stored page
  table.page(currentPage).draw("page");
}*/

/* below code goes inside the dt initialization of the page
// Removes tashkeel characters from the given string @param {string} data - The input string @return {string} The string with tashkeel characters removed
function removeThashkeel(data) {
  return data.replace(/[َ|ً|ُ|ٌ|ِ|ٍ|ْ|ّ|~|⁽|⁾|¹²³⁴⁵⁶⁷⁸⁹⁰]/g, "");
}
// Declare global variables
let tashkeelRemoved = false;
let originalData = [];
// Toggles the visibility of tashkeel characters in the DataTable
function toggleTashkeel() {
  tashkeelRemoved = !tashkeelRemoved;
  if (tashkeelRemoved) {
    // Remove tashkeel from each cell that contains a string
    const newData = originalData.map((row) =>
      row.map((cell) =>
        typeof cell === "string" ? removeThashkeel(cell) : cell
      )
    );
    // Update the table with the new data
    table.clear().rows.add(newData).draw();
    // Update button text
    document.getElementById("toggleFiliButton").textContent =
      " ފިލިތައް ދައްކާ ";
  } else {
    // Restore original data with tashkeel
    table.clear().rows.add(originalData).draw();
    // Update button text
    document.getElementById("toggleFiliButton").textContent =
      " ފިލިތައް ފޮރުވާ ";
  }
}
*/

// OLD DIACRITIC REMOVAL ON DATA
// define reusable functions for the regular expressions used in the render method. Replace the inline regex replacements with calls to these functions.
/*function removeThashkeel(data) {
  return data.replace(/[َ|ً|ُ|ٌ|ِ|ٍ|ْ|ّ|~|⁽|⁾|¹²³⁴⁵⁶⁷⁸⁹⁰]/g, "");
}*/

// CHANGE FILI BUTTON STRING
/*function filiString() {
  var button = document.getElementById("toggleFiliButton");
  if (button.innerHTML.trim() === "&nbsp; ފިލިތައް ފޮރުވާ &nbsp;") {
    button.innerHTML = "&nbsp; ފިލިތައް ދައްކާ &nbsp;";
  } else {
    button.innerHTML = "&nbsp; ފިލިތައް ފޮރުވާ &nbsp;";
  }
}*/

// removes just smallish footnotes - do i need this?
function removeSmallishFootnotes(data) {
  return data.replace(/[⁽|⁾|¹²³⁴⁵⁶⁷⁸⁹⁰]/g, "");
}
//

/* google-closure-compiler --charset=UTF-8 --js=hmv-script.js --js_output_file=hmv-script.min.js */

/* copyURL BUTTON */
// https://stackoverflow.com/questions/33855641/copy-output-of-a-javascript-variable-to-the-clipboard/48542290#48542290
// https://stackoverflow.com/questions/10568815/replace-all-text-before-a-certain-point
function copyURLToClipButton() {
  let dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.value = window.location.href;

  // Replace text preceding "/books/"
  dummy.value = dummy.value
    .replace(/^.*\/books\//, "https://hadithmv.github.io/books/")
    .replace(/^.*\/uc\//, "https://hadithmv.github.io/books/");

  // Replace text preceding "/uc/"

  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);

  // change copy page url button text
  let button = document.getElementById("copyPageLink");
  let originalText = button.innerHTML;
  let originalStyle = window.getComputedStyle(button);

  function changeButtonText(newText, duration) {
    let originalWidth = button.offsetWidth;
    //var originalTextAlign = originalStyle.textAlign;

    button.style.width = originalWidth + "px";
    button.style.textAlign = "center"; // originalTextAlign
    button.innerHTML = newText;

    setTimeout(function () {
      button.innerHTML = originalText;
      button.style.width = "";
      //button.style.textAlign = "";
    }, duration);
  }

  // Usage example:
  changeButtonText("📋 ކޮޕީ ވެއްޖެ", 1000); // ✓
}

//

// SCROLL TO TOP

function scrollUpTop() {
  // scroll to top
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// SHOW OR HIDE AYAT FILI
/*function toggleQuranFili() {
  // https://datatables.net/forums/discussion/61291/how-to-implement-the-data-table-column-visibility-and-order-dynamically
  var isVisible = $(".dataTable").DataTable().column(5).visible();
  $(".dataTable").DataTable().column(5).visible(!isVisible);
  var isVisible = $(".dataTable").DataTable().column(6).visible();
  $(".dataTable").DataTable().column(6).visible(!isVisible);
}*/

// SHOW OR HIDE SURAH NAME
/*
          <button
            id="toggleSurahButton"
            class="customButtons"
            onclick="toggleSurahName();scrollUpTop()"
          >
            &nbsp; ސޫރަތުގެ ނަތް ފޮރުވާ &nbsp;
          </button>
*/
/*function toggleSurahName() {
  var isVisible = $(".dataTable").DataTable().column(2).visible();
  $(".dataTable").DataTable().column(2).visible(!isVisible);
  //
  var button = document.getElementById("toggleSurahButton");
  if (button.innerHTML.trim() === "&nbsp; ސޫރަތުގެ ނަތް ފޮރުވާ &nbsp;") {
    button.innerHTML = "&nbsp; ސޫރަތުގެ ނަތް ދައްކާ &nbsp;";
  } else {
    button.innerHTML = "&nbsp; ސޫރަތުގެ ނަތް ފޮރުވާ &nbsp;";
  }
}*/

// SWITCH BETWEEN IMLAI AND UTHMANI TEXT FOR AYAT
/*<button
            id="toggleUthmaniImlai"
            class="customButtons"
            onclick="uthmaniImlai();loadRasmFont();scrollUpTop()"
          >
            &nbsp; ރަސްމު އުޘްމާނީއަށް &nbsp;
          </button>*/
/*function uthmaniImlai() {
  var isVisible = $(".dataTable").DataTable().column(5).visible();
  $(".dataTable").DataTable().column(5).visible(!isVisible);
  var isVisible = $(".dataTable").DataTable().column(7).visible();
  $(".dataTable").DataTable().column(7).visible(!isVisible);
  //
  var button = document.getElementById("toggleUthmaniImlai");
  if (button.innerHTML.trim() === "&nbsp; ރަސްމު އުޘްމާނީއަށް &nbsp;") {
    button.innerHTML = "&nbsp; ރަސްމު އިމްލާއީއަށް &nbsp;";
  } else {
    button.innerHTML = "&nbsp; ރަސްމު އުޘްމާނީއަށް &nbsp;";
  }
}*/

// LOAD UTHMANI FONT FOR QURAN ONLY ON BUTTON CLICK
// Dynamically Load And Apply Fonts With JavaScript
// https://awik.io/dynamically-load-apply-fonts-javascript/
/*const fontVar = new FontFace("mergedFont", "url(../font/hafs-400.woff)"); // Your font goes here
function loadRasmFont() {
  // Function which loads the font and applies it
  //console.log("Loading font...");
  fontVar
    .load()
    .then(function (loadedFont) {
      document.fonts.add(loadedFont);
      //html.style.fontFamily = '"mergedFont"';
    })
    .catch(function (error) {
      console.log("Failed to load font: " + error);
    });
}*/

// COMBINED QURAN AND RADHEEF CHANGE BOOK
// Function to change the book in the URL
function changeBook(newBook) {
  let currentUrl = window.location.toString();
  let bookType, bookRegex, searchString;

  if (newBook.startsWith("quran")) {
    bookType = "quran";
    searchString = "quran";
    bookRegex =
      /quranHadithmv|quranBakurube|quranSoabuni|quranRasmee|quranUshru/g;
  } else if (newBook.startsWith("radheef")) {
    bookType = "radheef";
    searchString = "radheef";
    bookRegex =
      /radheefAll|radheefRasmee|radheefEegaal|radheefManiku|radheefNanfoiy/g;
  } else {
    console.error("Invalid book type");
    return;
  }

  if (currentUrl.includes(searchString) || currentUrl.includes("quranUshru")) {
    // Handle transition from quranUshru to other books
    if (currentUrl.includes("quranUshru") && newBook !== "quranUshru") {
      let newUrl = currentUrl.replace("quranUshru", newBook).split("#")[0];
      window.location = newUrl.endsWith(".html") ? newUrl : newUrl + ".html";
    } else {
      window.location = currentUrl
        .replace(bookRegex, newBook)
        .replace(/\:v.*$/, "");
    }
  } else {
    window.location =
      window.location.origin +
      window.location.pathname.replace(/[^\/]*$/, newBook + ".html");
  }
}

// OLD SEPARATE Q AND R CODE:
// QURAN CHANGE BOOK
/*function changeBkQuran(newBook) {
  let currentUrl = window.location.toString();
  if (currentUrl.includes("quran")) {
    window.location = currentUrl
      .replace(
        /quranHadithmv|quranBakurube|quranSoabuni|quranRasmee/g,
        newBook
      )
      .replace(/\:v.*$/, "");
  } else {
    window.location =
      window.location.origin +
      window.location.pathname.replace(/[^\/]*$/, newBook + ".html");
  }
}

// Radheef CHANGE BOOK
// Change URL to another book while preserving query terms if "radheef" is in the initial URL
function changeBkRadheef(newBook) {
  // Get the current URL as a string
  let currentUrl = window.location.toString();

  // Check if the current URL contains the string "radheef"
  if (currentUrl.includes("radheef")) {
    // If "radheef" is present, replace the current book name with the new book name
    // and remove any part of the URL that comes after ":v" (e.g., ":vf1")
    window.location = currentUrl
      .replace(
        /radheefAll|radheefRasmee|radheefEegaal|radheefManiku|radheefNanfoiy/g,
        newBook
      )
      .replace(/\:v.*$/, "");
  } else {
    // If "radheef" is not present, change the URL to the new book
    // without preserving any query or hash parameters
    window.location =
      window.location.origin +
      window.location.pathname.replace(/[^\/]*$/, newBook + ".html");
  }
}*/

/* OLDER Q CODE
function changeBookQuran(newBook) {
  window.location = window.location
    .toString()
    .replace(
      /quranUshru|quranHadithmv|quranBakurube|quranSoabuni|quranRasmee|quranMuyassarGhareeb|quranMukhtasar|quranMuyassar|quranSadi|quranBetaqat|quranQiraaath/g,
      newBook
    )
    .replace(/\:v.*$/, "");
}*/
/* OLDER R CODE
// change url to change to another book while preserving query terms
function changeBkRadheef(newBook) {
  window.location = window.location
    .toString()
    .replace(
      /radheefAll|radheefRasmee|radheefEegaal|radheefManiku|radheefNanfoiy/g,
      newBook
    )
    .replace(/\:v.*$/, "");
}*/

//

// dont really need this in books right now, it was only meant for editor or notes content that didnt go back a page after having scrolled down or something
/* https://stackoverflow.com/questions/3664381/force-page-scroll-position-to-top-at-page-refresh-in-html/60994204#60994204
  function scrollToTopFully() {
    history.scrollRestoration = "manual";
    window.addEventListener("beforeunload", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }
  
  // scrapped below this in favor of inline onclick function, prompt:
  // write an inline js onclick function, to reload the window, upto and including ".html" in the url, removing the rest of the url that comes after that
  
  // HARD RELOAD BUTTON - doesnt work for some reason
  /*function reloadUpToHtml() {
    // Get the current URL
    var currentUrl = window.location.href;
    // Find the index of ".html" in the URL
    var htmlIndex = currentUrl.indexOf(".html");
    // If ".html" is found, reload the page up to that point
    //if (htmlIndex !== -1) {
    var newUrl = currentUrl.substring(0, htmlIndex + 5); // Add 5 to include ".html"
    window.location.href = newUrl;
    //} else {
    // ".html" not found, simply reload the page
    //location.reload();
    //}
  }-*
  
  
  /* not using below code anymore, and changed above code using cgpt cuz it didnt work
  // same code above is below triggered on keypress
  
  // http://gcctech.org/csc/javascript/javascript_keycodes.htm
  // https://melwinalm.medium.com/crcreating-keyboard-shortcuts-in-javascripteating-keyboard-shortcuts-in-javascript-763ca19beb9e
  // https://stackoverflow.com/questions/31392863/load-external-javascript-on-desktop-only/31392945#31392945
  if (window.innerWidth > 600) {
    //
    document.onkeyup = function (e) {
      if (e.shiftKey && e.which == 76) {
        // 76 is letter L
        //alert("Ctrl + Alt + Shift + U shortcut combination was pressed");
        var dummy = document.createElement("textarea");
        document.body.appendChild(dummy);
        dummy.value = window.location;
        // added line below
        dummy.value = dummy.value.replace(/^.+hadithmv\./, "https://hadithmv.");
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
      }
    };
    //
  }
  */

// DATE UPDATE SCRIPT?

/*<script>
  window.ga =
    window.ga ||
    function () {
      (ga.q = ga.q || []).push(arguments);
    };
  ga.l = +new Date();
  ga("create", "UA-112777351-1", "auto");
  ga("send", "pageview");
  </script>*/

//

// DESKTOP ONLY KEYBOARD NAV HELP ALERT

/*function myHelp() {
    alert(
      "Keyboard Controls: \n\n [Tab] =Tab Navigation \n [Arrow Keys] = Keyboard Navigation \n [Shift + s] = Show columns \n [Shift + c] = Copy"
    );
  } */
/* \n [Shift + x] = Excel \n [Shift + v] = Csv \n [Shift + p] = Print' */

//////////////////////////////////////

//////////////////////////////////////
/* === === ===
NESTED BELOWPAGE DROPDOWN CODE
=== === === */

// Wait for the DOM to be fully loaded before executing the script
document.addEventListener("DOMContentLoaded", function () {
  // Select the main bab dropdown container
  const babDropdown = document.querySelector(".belowPage-bab-dropdown");

  // Only proceed if the bab dropdown exists on the page
  if (babDropdown) {
    // Add a click event listener to the bab dropdown for event delegation
    babDropdown.addEventListener("click", function (e) {
      // Prevent the default anchor tag behavior
      e.preventDefault();
      // Get the clicked element
      const target = e.target;

      // Check if the clicked element is an anchor tag
      if (target.tagName === "A") {
        // Get the parent list item of the clicked anchor
        const parent = target.parentElement;

        // Handle different click scenarios
        if (target.classList.contains("open-all")) {
          // If "open all" is clicked, open all bab dropdowns
          openAllBabDropdowns(babDropdown);
        } else if (target.classList.contains("collapse-all")) {
          // If "collapse all" is clicked, collapse only sub-sub-bab-dropdowns
          collapseSubSubBabDropdowns(babDropdown);
        } else if (parent.querySelector("ul")) {
          // If the clicked item has a nested list, toggle its visibility
          parent.classList.toggle("active");
        } else if (target.hasAttribute("data-value")) {
          // If the clicked item has a data-value attribute, update URL and reload
          const value = target.getAttribute("data-value");

          // old code
          // Update the URL hash
          // window.location.hash = "#tableID=l1:p" + value;
          // l1: was resetting 10 row length pages like radheefs

          // new code
          // Get current URL hash
          const currentHash = window.location.hash;
          // Extract the current page length value using regex
          const lengthMatch = currentHash.match(/l(\d+)/);
          // Use the existing length value if found, otherwise default to 1
          const pageLength = lengthMatch ? lengthMatch[1] : "1";
          // Update hash while preserving the page length
          window.location.hash = `#tableID=l${pageLength}:p${value}`;
          //

          // Smoothly scroll to the top before reloading
          window.scrollTo({ top: 0, behavior: "smooth" });
          // Delay reload until after the smooth scroll completes
          setTimeout(() => {
            location.reload();
          }, 150); // Adjust the delay as needed
        }
      }
    });

    // Function to open all bab dropdowns
    function openAllBabDropdowns(rootElement) {
      // Select all list items in the bab dropdown
      const allItems = rootElement.querySelectorAll("li");
      allItems.forEach((item) => {
        // If the item contains a nested list, make it visible
        if (item.querySelector("ul")) {
          item.classList.add("active");
        }
      });
    }

    // Function to collapse only sub-sub-bab-dropdowns
    function collapseSubSubBabDropdowns(rootElement) {
      // Select only the active sub-sub-bab-dropdown items
      const subSubBabDropdowns = rootElement.querySelectorAll(
        "li > ul > li.active",
      );
      subSubBabDropdowns.forEach((item) => {
        // Remove the active class to collapse the sub-sub-bab-dropdown
        item.classList.remove("active");
      });
    }
  }

  // Ensure the page is smoothly scrolled to the top after reload
  // This runs regardless of whether the bab dropdown exists
  window.scrollTo({ top: 0, behavior: "smooth" });
});

//
/* === === ===
 DT CUSTOM JS BELOW
=== === === */
//

//
let table; // Variable to store the DataTable instance
//

// CUSTOM columnDefs CONFIGURATION
// remember to place ...columnDefsconfig at the very end of columnDefs: [], right before it is closed, otherwise overwrites and nonapplies will occur
let columnDefsconfig = [
  // settings for all book tables
  {
    targets: "_all",
    // hides panes for all other columns
    searchPanes: {
      show: false,
    },
    /*},
  {
    targets: "_all",*/
    // if \r\n|\n|\r occurs more than once, i dont want <br class="dtBr"> to occure more than once

    render: (data) => {
      return (
        data
          // double newlines
          .replace(
            /(\r\n\r\n|\n\n|\r\r)+/g,
            '\t<br class="dtBr">\t<br class="dtBr">',
          )
          // single newlines
          .replace(/(\r\n|\n|\r)+/g, '\t<br class="dtBr">')
      );
    },

    // data.replace(/\r\n|\n|\r/g, '\t<br class="dtBr">');
    // data.replace(/\r\n|\n|\r/g, '\t<br class="dtBr">');
    // data.replace(/\r\n|\n|\r/g, "\t<br><br>");
    // data.replace(/\r\n|\n|\r/g, "\t<p><p>");

    // for some reason, without the \n replaced above, the single new lines in between same language paragraphs show in console as a single space, and therefore clipboard cannot be customized to show it
    // added space before br, otherwise clipboard copy export has no space
    // leave off applying '<br class="dtBr">' in the divider replacements ـــــــــــــــــــــــــــ in order to have footnotes close together
    // it seems without \t, clipboard copy will not have newlines

    /* PREV
     render: function (data, type, row) {
      return data.replace(/(\r\n|\n|\r)+/g, '\t<br class="dtBr">'); // remember to update quran-navigation-list.js with this as well
    }, */
  },
];
//

// CUSTOM DT CONFIGURATION
let DTconfig = {
  // can enable this to use globally via spread, but need to disable it if im going to do things like merging multiple js arrays
  //data: data,

  // keytable option is set to !isMobile, which means that it will be true if the user is not on a mobile device (i.e., isMobile is false), and false if the user is on a mobile device (i.e., isMobile is true).
  keys: !isMobile,

  // https://www.gyrocode.com/articles/jquery-datatables-save-and-restore-table-state-using-unique-url/
  keepConditions: true,

  // https://datatables.net/reference/option/columns
  // columns: [null, null, null, null, null, null, null],

  //columnDefs: [],

  layout: {
    top: [
      "search",
      // "inputPaging",
      "search",

      {
        buttons: [
          {
            extend: "copy",
            // https://datatables.net/forums/discussion/comment/234022/#Comment_234022
            // removes copied to clipboard notification
            copySuccess: false,

            key: {
              key: "c",
              altKey: true,
            },

            titleAttr: "copy",
            text: "ކޮޕީކުރޭ",

            // Shown at the very top of the exported document
            // title: * (default) - Use the HTML page's title value.

            footer: false,
            header: false,

            fieldSeparator: "\n\n",
            exportOptions: {
              columns: ":visible",

              modifier: {
                page: "current",
              },
            },
            customize: function (data) {
              // Replace different newlines with \n
              data = data.replace(/\r\n|\n|\r/g, "\n");
              // Replace tabs with double newlines
              data = data.replace(/\t/g, "\n\n");
              //data = data.replace(/\t/g, "\n");
              // Replace more than 2 consecutive newlines with just 2 newlines
              data = data.replace(/\n{3,}/g, "\n\n");
              //
              // Convert sans-serif digits to regular digits
              // First, replace sans-serif digits with regular digits
              /*Object.entries(sansSerifDigits).forEach(
                ([regularDigit, sansSerifDigit]) => {
                  const regex = new RegExp(sansSerifDigit, "g");
                  data = data.replace(regex, regularDigit);
                }
              );*/

              //

              //  REPLACE quran page title with surah number and name
              // Only proceed if currentSurah is defined
              if (typeof currentSurah !== "undefined" && currentSurah) {
                // Split the data into rows
                var rows = data.split("\n");
                // Get the current Surah number and name
                var currentSurahNumber = currentSurah;
                var currentSurahName = arabicSurahNames[currentSurahNumber];
                // Define the lines we want to replace
                var linesToReplace = [
                  "الترجمة الرسمية – ރަސްމީ ގުރްއާން ތަރުޖަމާ",
                ];
                // Replace the specified lines with Surah number and name
                rows = rows.map(function (row) {
                  if (linesToReplace.includes(row.trim())) {
                    return `${currentSurahNumber} ${currentSurahName}`;
                  }
                  return row;
                });
                // Join the rows back together
                data = rows.join("\n");
              }
              //

              //
              // NOTE that the below newline reduction will reduce even wanted newlines where footnotes come above other content, like in dfk
              // Split the data at the line of dashes
              let parts = data.split("\n\nـــــــــــــــــــــــــــ\n\n");
              if (parts.length > 1) {
                // Replace all double newlines with single newlines in the part after the line of dashes
                parts[1] = parts[1].replace(/\n\n/g, "\n");
                // Ensure there's a double newline at the very end
                parts[1] = parts[1].replace(/\n$/, "\n\n");
                // Join the parts back together with only a single newline after the dashes
                data =
                  parts[0] + "\n\nـــــــــــــــــــــــــــ\n" + parts[1];
              }
              //

              // print to console
              //console.log(JSON.stringify(data));
              return data;
            },
          },

          // {
          //   extend: "collection",
          //   key: {
          //     key: "m",
          //     altKey: true,
          //   },
          //   text: "⌥ އިތުރު",
          //   background: false,

          //   buttons: [
          //     {
          //       extend: "colvis",
          //       key: {
          //         key: "s",
          //         altKey: true,
          //       },

          //       text: "☰ ދައްކާ/ފޮރުވާ",
          //       background: false,
          //       postfixButtons: [
          //         // https://datatables.net/forums/discussion/36516
          //         {
          //           extend: "colvisGroup",
          //           text: "ހުރިހާ ދައްކާ &nbsp; +",
          //           show: ":hidden",
          //           titleAttr: "show all",
          //         },
          //         // https://datatables.net/extensions/buttons/examples/column_visibility/restore.html
          //         {
          //           extend: "colvisRestore",
          //           text: "ރީސެޓްކުރޭ &nbsp; ↺",
          //           titleAttr: "reset toggle",
          //         },
          //       ],
          //     },
          //     {
          //       extend: "searchBuilder",
          //       key: {
          //         key: "b",
          //         altKey: true,
          //       },
          //       titleAttr: "custom search",
          //     },
          //     {
          //       extend: "searchPanes",
          //       key: {
          //         key: "v",
          //         altKey: true,
          //       },

          //       config: {
          //         cascadePanes: true,

          //         viewTotal: true,

          //         collapse: false,
          //         dtOpts: {
          //           select: {
          //             style: "multi+shift",
          //           },
          //         },
          //       },
          //     },
          //     {
          //       extend: "pageLength",
          //       key: {
          //         key: "p",
          //         altKey: true,
          //       },
          //       background: false,
          //     },
          //     //

          //     // https://stackoverflow.com/questions/53600956/how-to-add-custom-button-in-r-shiny-datatable
          //     // https://datatables.net/extensions/buttons/examples/initialisation/customHTMLButtons.html

          //     "<h3></h3>",
          //     //'<h3 class="not-top-heading">Column Visibility</h3>',
          //     // places css in DT inline css file

          //     {
          //       text: "ސަފުހާގެ ލިންކު ކޮޕީކުރޭ", // Button label
          //       action: function (e, dt, node, config) {
          //         // Click handler. what should happen when the button is clicked
          //         // e: The click event. when and where the click happened
          //         // dt: The DataTable API instance. the DataTable table
          //         // node: The button element itself that was clicked
          //         // config: The button configuration. its settings
          //         //
          //         copyURLToClipButton(); // This will run

          //         // alert("Button activated");
          //         // dt.ajax.reload();
          //       },
          //     },
          //     // https://datatables.net/extensions/buttons/custom

          //     {
          //       text: "ފިލިތައް ފޮރުވާ/ދައްކާ",
          //       action: function (e, dt, node, config) {
          //         toggleTashkeel();
          //       },
          //     },

              

          //     "<h3></h3>",

          //     //
          //   ],
          // },

          /*{
            extend: "pageLength",

            background: false,
          },*/
        ],
      },
    ],

    bottom: ["inputPaging", "info"],
  }, // layout: { END
}; // var DTconfig = { END

// Remove the defaults
DataTable.defaults.layout = {
  topStart: null,
  topEnd: null,
  bottomStart: null,
  bottomEnd: null,
};
//

// DataTable.defaults.layout = { };
// DataTable.defaults.language = { };

//
Object.assign(DataTable.defaults, {
  // https://datatables.net/reference/option/layout

  // cant have input paging here as default config, otherwise shows up inside searchpanes for some reason

  /*
          layout: {
            top: [
             "search",
              "inputPaging",
        ] }        */

  // https://datatables.net/reference/option/language
  // LANGUAGE SET DEFAULTS
  language: {
    emptyTable: "– ނުފެނުނު 🗨️ –",
    info: "_TOTAL_ ގެ ތެރެއިން _START_ އިން _END_ އަށް",
    infoFiltered: "(ޖުމްލަ ބެލުނީ _MAX_)",
    infoEmpty: "– ނުފެނުނު 🗨️ –",
    //lengthMenu: "ބަރި ދައްކާ _MENU_",
    loadingRecords: "ތައްޔާރުވަނީ... ⏳",
    search: "",
    searchPlaceholder: "ސާޗްކުރުމަށް...",
    // searchPlaceholder: 'ސީދާ ލަފްޒު "މިހެން ހޯދާ"، !މިލަފްޒު ނުލާ ހޯދާ',
    zeroRecords: "– ނުފެނުނު 🗨️ –",
    paginate: {
      first: "<< ",
      last: " >>",
      next: " >",
      previous: "< ",
    },
    /*
            paginate: {
              first: "<< ފުރަތަމަ",
              last: "ފަހު >>",
              next: "ކުރިއަށް >",
              previous: "< ފަހަތަށް",
            }, */

    entries: {
      _: "",
      1: "",
    },

    // https://datatables.net/reference/option/buttons.buttons.text
    buttons: {
      // https://datatables.net/reference/button/pageLength
      pageLength: {
        _: "%d ބަރި ދައްކާ",
        "-1": "ހުރިހާ",
      },
      //colvis: "☰ ފޮރުވާ/ދައްކާ",
      // https://datatables.net/reference/button/copyHtml5
      copyTitle: "&nbsp; ކޮޕީ 📋",
      // copySuccess: {
      //   1: "1 ކޮޕީވެއްޖެ",
      //   _: "%d ކޮޕީވެއްޖެ",
      // },
    },
    searchBuilder: {
      button: "🔍 ކަސްޓަމް ސާޗް",
      data: "Column",
      // data: "ބަރި",
      //
      // add: "+ އިތުރުކުރޭ",
      // condition: "ޝަރުތު",
      // clearAll: "ރީސެޓް",
      // //delete: "Delete",
      // //right: "Right",
      // //left: "Left",
      // logicAnd: "އަދި &",
      // logicOr: "ނޫނީ |",
      // title: {
      //   0: "ސާޗް ޝަރުތުތައް",
      //   _: "ސާޗް ޝަރުތުތައް (%d)",
      // },
      // value: "ލިޔުން",
      // valueJoiner: "އަދި",
    },
    searchPanes: {
      // https://datatables.net/reference/option/language.searchPanes.collapse
      // looks like i wont need text: "⧩ ފިލްޓާ" with this
      collapse: { 0: "⧩ ބަރި ފިލްޓާ", _: "⧩ ބަރި ފިލްޓާ (%d)" },
      title: {
        _: "%d ފިލްޓާ ކުރެވިފާ",
        0: "0 ފިލްޓާ ކުރެވިފާ",
        1: "1 ފިލްޓާ ކުރެވިފާ",
      },
      count: "{total}",
      countFiltered: "{shown} ({total})",
      emptyMessage: "— ވަކި އެއްޗެއް ނުޖަހާ —",
      clearMessage: "ފިލްޓާތައް ދުއްވާލާ",
    },
  }, // language END
  //

  //
  // https://datatables.net/examples/basic_init/state_save.html
  stateSave: true,
  // currently" above works
  // above seems to break table, use the one below
  //bstateSave: true,

  // prevents state save from saving colvis / column visibility. else stuff like quran additional translations mess up the table on reload
  // https://datatables.net/reference/option/stateSaveParams
  stateSaveParams: function (settings, data) {
    //data.search.search = ""; // Remove a saved filter, so filtering is never saved:
    // delete data.search;
    //
    // https://datatables.net/reference/option/stateSaveCallback
    // https://datatables.net/forums/discussion/27259/selective-state-saving-only-on-colvis-plugin
    for (var i = 0; i < data.columns.length; i++) {
      // delete data.columns[i].search;
      delete data.columns[i].visible;
    }
  },
  //

  // https://datatables.net/reference/option/stateDuration
  // default is 2 hours, now set to 1 day
  stateDuration: 86400,
  //
  // https://datatables.net/reference/option/ordering
  ordering: false,
  //
  // https://datatables.net/reference/option/orderClasses
  orderClasses: false,
  //
  // https://datatables.net/reference/option/searchDelay
  searchDelay: 350,
  //
  // https://datatables.net/reference/option/autoWidth
  autoWidth: false,
  //
  //

  // https://datatables.net/blog/2017/search-highlighting-with-markjs
  // https://markjs.io
  // Synonyms
  //mark: true,
  // remember to repeat in:
  /* Normalize the string by replacing specific Arabic characters
            var normalized = str
              .replace(/[أآإ]/g, "ا")*/

  mark: {
    // pair whats needed between arabic diacritic normalization and markjs search highlight

    // ignorePunctuation is actually supposed to be used for making matches with or without punctuation characters, like ["'"]
    // i repurposed it as a arabic diacritic thaskeel remove
    // \u064B-\u065F

    ignorePunctuation: ["ًٌٍَُِّْٕٖٜٟٗ٘ٙٚٛٝٞ"],
    //
    synonyms: {
      // arabic
      أ: "ا",
      آ: "ا",
      إ: "ا",
      ٱ: "ا",
      //
      ؤ: "و",
      ة: "ه",
      ئ: "ى",

      // thaskeel \u064B-\u065F
      // مَ: "م",
      // كَ: "ك",

      // thikijehi thaana
      ޘ: "ސ",
      ޙ: "ހ",
      ޛ: "ޒ",
      ޜ: "ޒ",
      ޞ: "ސ",
      ޠ: "ތ",
      ޡ: "ޒ",
      ޢ: "އ",
      ޤ: "ގ",
      ޥ: "ވ",
    },
  },

  // https://datatables.net/blog/2014/search-highlighting#:~:text=DataTables'%20built%20in%20search%20features,what%20they%20are%20looking%20for
  // searchHighlight: true,
  //

  // https://datatables.net/blog/2019/scroll-to-top
  // instead of getting the external file, just have the code directly in here
  // scrollToTop: true,

  //

  //
  lengthMenu: [1, 2, 3, 4, 5, 10, 20, 30, 40, 50],
  /*[
    [1, 2, 3, 4, 5, 10, 20, 30, 40, 50, -1],
    [1, 2, 3, 4, 5, 10, 20, 30, 40, 50, "ހުރިހާ"],
  ],*/
  // this sets the default value on table load. make sure the value is available above too
  displayLength: 1,
  //
  /*buttons: [
    {
      // https://datatables.net/reference/button/copy
      extend: "copy",
      // https://datatables.net/reference/option/buttons.buttons.titleAttr
      titleAttr: "copy",
      text: "⧉ &nbsp; ކޮޕީ",
      //https://datatables.net/reference/api/buttons.exportInfo()
      //title: "" // default: html page title, prev was: "hadithmv.com",
      // https://datatables.net/reference/button/copy
      footer: false, // if not set to false, leaves an empty blank line
      header: false,
      //newline: "\n",
      // fieldBoundary: "\n", // this creates extra blank lines even where footer and header are set to false
      fieldSeparator: "\n\n", // \t
      exportOptions: {
        // https://datatables.net/extensions/buttons/examples/html5/columns.html this on its own selects all data on all pages
        columns: ":visible",
        // https://datatables.net/reference/button/copy this on its own selects even column hidden data
        modifier: {
          page: "current",
        },
        // FOR DESKTOP - https://datatables.net/extensions/buttons/examples/initialisation/keys.html
        key: {
          shiftKey: true,
          key: "c",
        },
      },
      customize: function (data) {
        // <br>
        data = data.replace(/\t/g, "\n"); // \n\n
        console.log(JSON.stringify(data));
        return data; // without this, custom data wont be in clipboard
      },
    },
    // https://datatables.net/reference/button/colvis
    {
      extend: "colvis",
      titleAttr: "toggle columns",
      //text: "☰ ފޮރުވާ/ދައްކާ",
      // https://datatables.net/reference/button/collection
      background: false,
      key: {
        shiftKey: true,
        key: "s",
      },
    },
    // https://datatables.net/extensions/searchbuilder/
    // will not work with dates without another plugin
    {
      extend: "searchBuilder",
      titleAttr: "custom search",
      // wont work here, need to set in language it seems
      //text: "🔍 ކަސްޓަމް ސާރޗް",
      key: {
        shiftKey: true,
        key: "b",
      },
    },
    // https://datatables.net/reference/feature/searchPanes
    {
      extend: "searchPanes",
      //text: "⧩ ފިލްޓާ",
      titleAttr: "filter",
      key: {
        shiftKey: true,
        key: "p",
      },
      config: {
        // https://datatables.net/forums/discussion/comment/216621/#Comment_216621 the viewTotal / viewCount / cascade options in SearchPanes really slow things down, particularly when server-side processing is enabled.

        // https://datatables.net/reference/feature/searchPanes.cascadePanes
        cascadePanes: true,
        // https://datatables.net/reference/feature/searchPanes.viewTotal
        viewTotal: true,
        // https://datatables.net/reference/feature/searchPanes.collapse
        collapse: false,
        //orderable: false,
        // https://datatables.net/extensions/searchpanes/examples/initialisation/speedTest.html
        //columns: [0, 1],
        //controls: false,
        // https://datatables.net/reference/feature/searchPanes.initCollapsed
        //initCollapsed: true,
        // https://datatables.net/reference/feature/searchPanes.order
        // order: [[1, 'desc']]
        //searching: false,
        //paging: true,
        dtOpts: {
          // https://datatables.net/extensions/select/examples/initialisation/multi.html
          select: {
            //style: "multi",
            style: "multi+shift",
          },
        },
      },
    },
  ],*/ // buttons: [ END
  /*columnDefs: [
                  {
                    // https://datatables.net/reference/option/columns.searchPanes.show
                    // force all cols to show searchpanes by default
                    searchPanes: {
                      show: true,
                      //controls: false,
                    },
                    //targets: [0]
                    targets: "_all",
                  },
                ],*/
  //
  // https://datatables.net/examples/basic_init/scroll_y_dynamic.html
  /*paging: false,
                     scrollCollapse: true,
                     scrollY: "50vh",*/
  // also consider https://datatables.net/extensions/scroller/

  // https://datatables.net/examples/basic_init/hidden_columns.html
  /*columnDefs: [
                     {
                         target: 2,
                         visible: false,
                         searchable: false
                     },
                     {
                         target: 3,
                         visible: false
                     }
                 ]*/

  // https://datatables.net/examples/advanced_init/column_render.html
}); // Object.assign(DataTable.defaults, { END
//

// Desktop configuration
/*var desktopConfig = {
          // DESKTOP LAYOUT
          // https://datatables.net/extensions/keytable/
          keys: true,
        }; // const desktopConfig  = { END
        //*/

// Function to initialize or reinitialize the DataTable
// function initializeDataTable() {
// Initialize DataTable with chosen config
//new DataTable("#example", {
table = new DataTable("#tableID", {
  //
  //...config
  ...DTconfig,

  // Add any additional options here

  // Data source for the table //data: dataSet,
  //data: data,
  //

  //
}); // new DataTable("#example", { END

//

// https://medium.com/@kashmiry/datatables-arabic-search-normalization-575949b0453c
// https://gist.github.com/kashmiry/ba35115ba23e8b6f034c2562dbd4042c#file-datatables-diacriticsarabic-js

// DataTables Arabic Search Normalization Function
// Extend diacritics to support Arabic characters

// pair whats needed between arabic diacritic normalization and markjs search highlight
$(function () {
  // Check if DataTable is defined
  if (typeof DataTable !== "undefined") {
    // Define a function to normalize Arabic text
    DataTable.util.diacritics(function (str, both) {
      // If the input is not a string, return it as is
      if (typeof str !== "string") {
        return str;
      }
      // Normalize the string by replacing specific Arabic characters
      var normalized = str
        .normalize("NFD") // Normalize the string to decompose characters
        // remember to repeat in 'mark: { synonyms: { } }'
        // added ٱ
        .replace(/[أآإٱ ٰ]/g, "ا") // Replace different forms of alef with a single form
        .replace("ؤ", "و") // Replace waw with its alternative form
        .replace(/ة/g, "ه") // Replace taa marbota with ha
        .replace(/[\u064B-\u065F]/g, "") // Remove diacritics (tashkeel)
        // added
        .replace("ئ", "ى") // Replace waw with its alternative form
        // thikijehi thaana
        .replace(/ޘ/g, "ސ")
        .replace(/ޙ/g, "ހ")
        .replace(/ޛ/g, "ޒ")
        .replace(/ޜ/g, "ޒ")
        .replace(/ޞ/g, "ސ")
        .replace(/ޠ/g, "ތ")
        .replace(/ޡ/g, "ޒ")
        .replace(/ޢ/g, "އ")
        .replace(/ޤ/g, "ގ")
        .replace(/ޥ/g, "ވ");

      // Return the normalized string, appending the original if lengths differ
      // Check if the length of the normalized string is different from the original
      return normalized.length !== str.length
        ? (both === true ? str + " " : "") + // If 'both' is true, append the original string
            normalized.replace(/[\u0300-\u036f]/g, "") // Remove (non arabic) diacritics from the normalized string
        : // "ًٌٍَُِّْٕٖٜٟٗ٘ٙٚٛٝٞ"
          normalized; // If lengths are the same, return the normalized string as is
    });
  }
});
//

// This ensures that the code runs after the entire DOM has been fully loaded.
document.addEventListener("DOMContentLoaded", function () {
  //
  //
  // Focus on search input for desktop view
  // IF DESKTOP, NOT MOBILE
  if (!isMobile) {
    // https://datatables.net/forums/discussion/comment/124081/#Comment_124081
    $("div.dt-search .dt-input").focus();

    // scrollToTop scroll to top on desktop https://datatables.net/blog/2019/scroll-to-top
    // instead of using the plugin externally, place the code here directly
    // it seems this does the same thing as the mobile version of the scroll
    table.on("page", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      // previously it would go to top of table, but now it goes to top of page
      /*window.scrollTo({
        top: 0,
        behavior: "smooth",
        // window.scrollTo({
        //    top: $(table.table().container()).offset().top,
        //    behavior: "smooth",
      });*/
      /*setTimeout(function () {
                  $(document).scrollTop($(table.table().container()).offset().top);
                }, 10);*/
    }); // table.on("page", function () { END
    //
    // IF MOBILE
  } else {
    // scroll to top of table row on mobile
    table.on("page", function () {
      //setTimeout(function () {
      // https://datatables.net/forums/discussion/comment/175697/#Comment_175697
      // CURRENTLY MOST UP TO DATE CODE USED
      // other code works too, but navbar hides the top of tr, so this code calculates the height of navbar and scrolls to where it ends
      const scrollToElement = document.querySelector("tbody");
      // const scrollToElement = document.querySelector("tbody tr");
      const navbarHeight = document.querySelector(".navbar").offsetHeight;

      const scrollToPosition =
        scrollToElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = scrollToPosition - navbarHeight;

      window.scrollTo({
        // top: offsetPosition,
        top: offsetPosition + 25, // scroll 25 pixels further down than the calculated position of the target
        behavior: "smooth",
      });

      // PREVIOUS MOST UP TO DATE CODE
      //document.querySelector("tbody tr").scrollIntoView({ behavior: "smooth" });

      //console.log("Hello world!");
      // added this to hide navbar if it is at a point where it is shown, otherwise it covers first row. but then again, doing this makes it hard to have the navbar shown when needed like when taking screenshots with title
      //document.querySelector(".navbar").classList.add("navbar-hidden");
      //
      //$(document).scrollTop($(table.table().container()).offset().top);
      //$(table.querySelector("tbody tr")).offset().top; // not quite working as is, but the selecters with scrollintoview does work
      //}, 10);
      // OLD SWIPE CODE PART 1
      // moved this swipe enable up here, and disabled it where it was originally from
      //enableSwipe(); // Enable swipe for mobile view
      //
    }); // table.on("page", function () { END

    // NEW SWIPE CODE
    //
    // Set touch-action: auto for tableID https://hammerjs.github.io/touch-action/
    // https://stackoverflow.com/questions/1601933/how-do-i-stop-a-web-page-from-scrolling-to-the-top-when-a-link-is-clicked-that-t
    //document.getElementById("tableID").style.touchAction = "auto";
    // “I can’t select my text anymore!” https://hammerjs.github.io/tips/
    delete Hammer.defaults.cssProps.userSelect;
    //
    // Hammer(tableID).on("swipeleft", function () {
    Hammer(document.querySelector(".dataTable")).on("swipeleft", function () {
      //event.preventDefault(); // Prevent default behavior
      table.page("previous").draw("page");
    });
    //  Hammer(document.getElementById("tableID")).on("swiperight", function () {
    Hammer(document.querySelector(".dataTable")).on("swiperight", function () {
      //event.preventDefault(); // Prevent default behavior
      table.page("next").draw("page");
    });

    //
  } // if (!isMobile) { } else { END

  //
  // changes <input type="text"> type to search type, so that delete icon appears
  // adds a placeholder to the input
  $(".dt-paging-input input")
    .prop("type", "search")
    .attr("placeholder", "ސަފުހާ");
  // add more width, or make text smaller later?
  //

  /*
  this is my code

it uses the row().show() pluging to work
This plugin jumps to the right page of the DataTable to show the required row
i'd rather use scrollIntoView() instead
*/

  $("tbody").on("dblclick", "tr", function () {
    // Clear any existing search
    if (table.search() !== "") {
      table.search("").draw();
    }

    // Get the index of the clicked row
    var clickedRowIndex = table.row(this).index();

    // Check if the row index is valid
    if (clickedRowIndex !== undefined) {
      // Get the page info
      var pageInfo = table.page.info();
      var targetPage = Math.floor(clickedRowIndex / pageInfo.length);

      // Navigate to the target page
      table.page(targetPage).draw(false);

      // Get the row node after the page change
      var rowNode = table.row(clickedRowIndex).node();
      if (rowNode) {
        /*// Scroll the row into view
        rowNode.scrollIntoView({ behavior: "smooth", block: "start" });
        // block: "start" ? / center*/

        /* code modified to incorporate navbar height consideration: */

        // Get navbar height
        const navbarHeight =
          document.querySelector(".navbar")?.offsetHeight || 0;

        // Get the row's position
        const rowPosition =
          rowNode.getBoundingClientRect().top + window.pageYOffset;

        // Calculate offset position to account for navbar
        const offsetPosition = rowPosition - navbarHeight;

        // Scroll to the calculated position
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
  });

  // upon double click, jump to the page the double clicked entry was on and select it, with rowshowjs
  /*$("tbody").on("dblclick", "tr", function () {
    if (table.search() !== "") {
      table.search("").draw();
    }
    table.row(this).draw().show().select().draw(false);
  });*/
  //

  // OLD DIACRITIC REMOVAL ON INPUT
  // https://datatables.net/reference/api/search()
  // removes diacritics and punctuation on key up for search
  /*$(".dt-search .dt-input").on("keyup click", function () {
    var str = $(this).val();
    str = str.replace(
      /[َ|ً|ُ|ٌ|ِ|ٍ|ْ|ّ|~|.|،|؟|-|ـ|’|”|:|؛|/{|/}|/(|/)|/[|/]|«|»|]/g,
      ""
    );
    $(this).val(str);
    //table.search(str).draw();
    // commenting above out allows searchdelay to work with stringreplace
  });*/
  //
  //
  //
}); // document.addEventListener("DOMContentLoaded", function () { END

//
//} // function initializeDataTable() { END

// Function to add swipe event listeners
/*function enableSwipe() {
       var tableElement = document.querySelector("#example");
       tableElement.addEventListener("touchstart", handleTouchStart, false);
       tableElement.addEventListener("touchend", handleTouchEnd, false);
     }
     // Function to remove swipe event listeners
     /*function disableSwipe() {
          var tableElement = document.querySelector("#example");
          tableElement.removeEventListener("touchstart", handleTouchStart, false);
          tableElement.removeEventListener("touchend", handleTouchEnd, false);
        }
     // Handle the start of a touch event
     function handleTouchStart(e) {
       touchStartX = e.changedTouches[0].screenX;
     }
     // Handle the end of a touch event
     function handleTouchEnd(e) {
       touchEndX = e.changedTouches[0].screenX;
       handleSwipe();
     }
   
     // Process the swipe gesture
     function handleSwipe() {
       var swipeThreshold = 40; // 50 - Minimum distance traveled to be considered a swipe
       var swipeDistance = touchEndX - touchStartX;
   
       if (swipeDistance > swipeThreshold) {
         table.page("next").draw("page");
       } else if (swipeDistance < -swipeThreshold) {
         // Swipe right: go to previous page
         table.page("previous").draw("page");
         // Swipe left: go to next page
       }
     }*/

// Debounce function to limit the rate at which a function can fire
/*function debounce(func, wait) {
          let timeout;
          return function executedFunction(...args) {
            const later = () => {
              clearTimeout(timeout);
              func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
          };
        }*/

// Handle window resize events
/*function handleResize() {
          var newIsMobile = window.innerWidth <= 800;
          if (newIsMobile !== isMobile) {
            isMobile = newIsMobile;
            if (isMobile) {
              enableSwipe(); // Enable swipe for mobile view
            } else {
              disableSwipe(); // Disable swipe for desktop view
            }
            //table.destroy(); // Destroy existing table
            //initializeDataTable(); // Reinitialize table with new configuration
          }
        }*/

// Add event listener for window resize, using debounce for performance
//window.addEventListener("resize", debounce(handleResize, 250));

// Initialize the DataTable
//initializeDataTable();
//

//
// BOTTOM
