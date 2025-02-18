//====================================================

// MISC PART OF CODE
// not very much related to the other part, but makes use of some references to it
// This is just showAyahNumbers and showQuranBrackets buttons functionality
// brought into the quran navigation js file because both will only be in the quran pages as well

// State variables to track visibility of ayah numbers and brackets
let showAyahNumbers = true;
let showQuranBrackets = true;

// Event listener for toggling ayah numbers visibility

//
document.addEventListener("DOMContentLoaded", function () {
  // without it; JavaScript can't find the elements with IDs "toggleAyahNumbers" and "toggleQuranBrackets" in your HTML document. The error message suggests that document.getElementById() is returning null, which means those elements don't exist when the code tries to attach the event listeners. Your JavaScript might be running before the DOM is fully loaded. Try wrapping your code in a DOMContentLoaded event listener:
  //
  document
    .getElementById("toggleAyahNumbers")
    .addEventListener("click", function () {
      // Toggle the state
      showAyahNumbers = !showAyahNumbers;
      const cells = document.querySelectorAll("td");

      cells.forEach((cell) => {
        const text = cell.textContent;
        // Check if cell contains ayah numbers within brackets
        if (text.match(/﴿.*﴾/)) {
          if (showAyahNumbers) {
            // Restore original text with numbers if it was stored
            if (cell.dataset.originalText) {
              cell.textContent = cell.dataset.originalText;
            }
          } else {
            // Store original text and remove numbers while keeping brackets
            const match = text.match(/﴿(.*?)\s[\u0660-\u0669]+﴾/);
            if (match) {
              cell.dataset.originalText = text;
              // Remove only the numbers before the closing bracket
              cell.textContent = text.replace(/\s[\u0660-\u0669]+﴾/, "﴾");
            }
          }
        }
      });

      // Update button text to reflect current state
      this.innerHTML = `&nbsp; އާޔަތް ނަމްބަރު ${
        showAyahNumbers ? "ފޮރުވާ" : "ދައްކާ"
      } &nbsp;`;
    });

  // Event listener for toggling Quran brackets visibility
  document
    .getElementById("toggleQuranBrackets")
    .addEventListener("click", function () {
      // Toggle the state
      showQuranBrackets = !showQuranBrackets;
      const cells = document.querySelectorAll("td");

      cells.forEach((cell) => {
        const text = cell.textContent;
        // Check if cell has brackets or stored content
        if (text.match(/﴿.*﴾/) || cell.dataset.originalWithBrackets) {
          if (showQuranBrackets) {
            // Restore text with brackets
            const textToWrap = cell.textContent;
            cell.textContent = `﴿${textToWrap}﴾`;
          } else {
            // Store current text and remove brackets
            cell.dataset.originalWithBrackets = text;
            cell.textContent = text.replace(/[﴿﴾]/g, "");
          }
        }
      });

      // Update button text to reflect current state
      this.innerHTML = `&nbsp; އާޔަތް ބްރެކެޓް ${
        showQuranBrackets ? "ފޮރުވާ" : "ދައްކާ"
      } &nbsp;`;
    });
  //
});

// ACTUAL PART OF QURAN NAV CODE
// This is the actual quran navigation code below

//
// STATE VARIABLES - for tracking current position and UI state
//

let // Current position within the Quran page
  currentSurah = 1, // Tracks which surah (chapter) is currently selected (1-114)
  currentAyah = 1, // Tracks which ayah (verse) is currently selected within the surah
  currentJuz = 1, // Tracks which juz (part) is currently selected (1-30)
  // UI state for dropdown navigation
  currentFocus = -1, // Tracks which item is focused in dropdown lists (-1 means no focus)
  // Columns management
  additionalColumns = [], // Keeps track of which additional translation columns have been loaded
  defaultColumns = [0], // Default value for which columns to load as additional columns, to be overwritten in HTML later
  // Translation visibility states
  translationStates = {}, // Tracks current visibility state of each translation
  initialTranslationStates = {}, // Stores initial visibility settings for reset functionality
  // UI interaction memory
  lastFocusedItems = {
    // Remembers last focused items in each dropdown
    surah: -1, // Last focused surah in dropdown
    ayah: -1, // Last focused ayah in dropdown
    juz: -1, // Last focused juz in dropdown
  },
  // Search state management
  searchInputValues = {
    // Stores search input values for each dropdown
    surah: "", // Current search text for surah dropdown
    ayah: "", // Current search text for ayah dropdown
    juz: "", // Current search text for juz dropdown
  };

//
// CONSTANTS - for constant data
//

// Base URL for JSON data files
const baseJsonUrl = "../js/json/";
//

// Object mappings

// Note: These objects are not defined in this file, but they are used in the code below. Rather the object maps have been moved to a seperate file "quran-navigation-objectMaps.js" for better organization and readability.

// Object mapping western digits (0-9) to their Arabic numeral equivalents
// const arabicDigits = {
//   0: "٠",
//   1: "١",
//   2: "٢",...

// Object containing the number of verses (ayahs) in each surah
// Key: Surah number (1-114)
// Value: Number of verses in that surah
// const ayahCounts = {
//   1: 7,
//   2: 286,
//   3: 200,

// Object containing the Arabic names of each surah
// Key: Surah number (1-114)
// Value: Arabic name with diacritical marks
// const arabicSurahNames = {
//   1: "الفَاتِحَة",
//   2: "البَقَرَة",
//   3: "آل عِمرَان",

// Object containing Dhivehi transliterations of surah names
// const dhivehiSurahNames = {
//   1: "ފާތިޙާ",
//   2: "ބަގަރާ",
//   3: "އާލްޢިމްރާން",

// Object containing English transliterations of surah names
// const englishSurahNames = {
//   1: "Fatihah",
//   2: "Baqarah",
//   3: "AalImran",

// Constants for maximum values
const maxSurah = 114; // Total number of surahs in Quran
const maxJuz = 30; // Total number of juz (parts) in Quran

// Base columns configuration
// Base columns configuration for the DataTable
const baseColumns = [
  { data: "0", title: "ޖުޒް", visible: !1 }, // Juz column (hidden by default)
  { data: "1", title: "ސޫރަތް", visible: !1 }, // Surah column (hidden by default)
  { data: "2", title: "އާޔަތް #", visible: !1 }, // Ayah number column (hidden by default)
  { data: "3", title: "ބިސްމި", visible: !0 }, // Bismillah column (visible by default)
  {
    data: "4",
    title: "އާޔަތް (އިމްލާއީ)", // Ayah text column (Imlai script)
    visible: !0,
    render: function (a, e, t) {
      // Render function to format ayah text with Arabic numerals and brackets
      return replaceDigitsWithArabic(
        (a =
          "﴿" + (a = a.replace(/\s([\u0660-\u0669]+)/, " ")) + " " + t[2] + "﴾")
      );
    },
  },
  {
    data: "5",
    title: "ރަސްމު އުޘްމާނީ", // Uthmani script column
    visible: !1,
    render: function (a, e, t) {
      // Similar render function for Uthmani script
      return replaceDigitsWithArabic(
        (a =
          "﴿" + (a = a.replace(/\s([\u0660-\u0669]+)/, " ")) + " " + t[2] + "﴾")
      );
    },
  },
];

// Configuration for additional JSON translations/tafsirs
const additionalJsons = [
  {
    name: "quranHadithmv",
    columns: [0],
    title: "ޙަދީޘްއެމްވީ ތަރުޖަމާ:",
  },
  { name: "quranRasmee", columns: [0, 1], title: "ރަސްމީ ތަރުޖަމާ:" },
  {
    name: "quranBakurube",
    columns: [0, 1],
    title: "ބަކުރުބެގެ ތަރުޖަމާ:",
  },
  { name: "quranJaufar", columns: [0, 1], title: "ޖަޢުފަރުގެ ތަފްސީރު:" },
  { name: "quranSoabuni", columns: [0, 1, 2, 3], title: "ޞގެ ތަފްސީރު:" },
  { name: "quranMukhtasar", columns: [0], title: "مختصر التفسير:" },
  { name: "quranMuyassar", columns: [0], title: "التفسير الميسر:" },
];

// Default translation to load
defaultAdditionalJson = currentFileName;
//defaultAdditionalJson = "quranHadithmv";
//defaultAdditionalJson = "quranBakurube";
//defaultColumns = [0];

//
// UTILITIES - for helper functions
//

// Replaces western numerals (0-9) with their Arabic numeral equivalents
function replaceDigitsWithArabic(a) {
  return a.replace(/[0-9]/g, function (a) {
    return arabicDigits[a];
  });
}

// Removes Arabic diacritical marks from text for easier searching/matching
function removeDiacritics(a) {
  return a.replace(/[َُِّْٰۡۚٓـًٌٍّٔ]/g, "");
}

// Add this new utility function that:
// Removes diacritics
// Removes both "سورة" and "سوره" variations
// Removes the "ال" prefix from the beginning of words
// Normalizes characters
// Trims whitespace
function prepareArabicText(text) {
  // Remove diacritics first
  text = removeDiacritics(text);

  // Handle common variations
  text = text
    .replace(/سورة|سوره/g, "") // Remove both سورة and سوره
    .replace(/^ال/g, "") // Remove ال prefix
    .trim();

  return normalizeChars(text);
}

// Add this to your utilities section
const charNormalizationMap = {
  // Arabic
  أ: "ا",
  آ: "ا",
  إ: "ا",
  ٱ: "ا",
  ؤ: "و",
  ة: "ه",
  ئ: "ى",
  // Thaana
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
};

// Add this new utility function
function normalizeChars(text) {
  return text
    .split("")
    .map((char) => charNormalizationMap[char] || char)
    .join("");
}

//
// QURAN NAVIGATION - for quran navigation-related functions
//

// Handles dropdown toggle functionality
function QtoggleDropdown(a) {
  var dropdown = $(`#${a}Dropdown`);

  // Hide all other dropdowns first
  $(".q-dropdown").not(dropdown).hide();

  // If dropdown becomes visible after toggle
  if (dropdown.toggle().is(":visible")) {
    // Get current value and dropdown items
    const currentValue = parseInt($(`#${a}Value`).text());
    const items = dropdown.find(".q-dropdown-item");

    // Find the currently selected item
    const currentItem = items.filter(`[data-value="${currentValue}"]`);

    if (currentItem.length) {
      // Update focus to current item's position
      currentFocus = items.index(currentItem);

      // Scroll current item into view
      currentItem[0].scrollIntoView({ block: "center" });

      // Highlight current item
      removeActive(items);
      currentItem.addClass("active");
    }

    // Focus the search input and restore any previous search value
    const searchInput = dropdown.find(".q-dropdown-search");
    searchInput.val(searchInputValues[a]).focus();
  }
}

// Handles navigation using arrow buttons
function QnavigateArrow(a, e) {
  // Set navigation limits based on type (surah, ayah, or juz)
  if ("surah" === a) {
    var t = currentSurah,
      n = 114; // Max surah number
  } else if ("ayah" === a) {
    t = currentAyah;
    n = ayahCounts[currentSurah] || 1; // Max ayah for current surah
  } else if ("juz" === a) {
    t = currentJuz;
    n = 30; // Max juz number
  }

  // Handle previous navigation
  if ("prev" === e) {
    t--;
    if (t < 1) {
      if ("ayah" === a) {
        // Move to previous surah's last ayah
        currentSurah--;
        if (currentSurah < 1) currentSurah = 114;
        updateAyahDropdown();
        t = ayahCounts[currentSurah] || 1;
      } else {
        // Wrap around to maximum value
        t = n;
      }
    }
  }
  // Handle next navigation
  else {
    t++;
    if (t > n) {
      if ("ayah" === a) {
        // Move to next surah's first ayah
        currentSurah++;
        if (currentSurah > 114) currentSurah = 1;
        updateAyahDropdown();
      }
      t = 1;
    }
  }

  // Update the display value
  updateQValue(a, t);
}

// Navigates to a specific verse in the table and updates the display
function navigateToVerse() {
  // Find matching rows based on current position
  const a = table
    .rows()
    .indexes()
    .filter(
      (a) => (
        (a = table.row(a).data()),
        // Check if we're navigating by juz or by surah/ayah combination
        null !== currentJuz
          ? parseInt(a[0]) === currentJuz
          : null !== currentSurah &&
            null !== currentAyah &&
            parseInt(a[1]) === currentSurah &&
            parseInt(a[2]) === currentAyah
      )
    );

  if (0 < a.length) {
    // Get current page info and navigate to correct page
    var e = table.page.info();
    table.page(Math.floor(a[0] / e.length)).draw(!1);

    // Scroll the row into view if found
    (e = table.row(a[0]).node()) &&
      e.scrollIntoView({ behavior: "smooth", block: "center" });

    // Update all navigation values based on the new position
    updateAllQValues(table.row(a[0]).data());
  }
}

// Updates a single navigation value (surah, ayah, or juz)
function updateQValue(a, e) {
  e = parseInt(e);
  const t = $(`#${a}Value`);

  switch (a) {
    case "surah":
      // Update surah display and reset ayah to 1
      t.text(`${e} ${arabicSurahNames[e]}`);
      currentSurah = e;
      currentAyah = 1;
      // Reinitialize ayah dropdown with new surah's verse count
      initializeQDropdown("ayah", 1, ayahCounts[currentSurah]);
      $("#ayahValue").text(currentAyah);
      currentJuz = null;
      break;

    case "ayah":
      // Update ayah display
      currentAyah = e;
      t.text(e);
      currentJuz = null;
      break;

    case "juz":
      // Update juz display
      currentJuz = e;
      t.text(e);
      currentAyah = currentSurah = null;
  }

  // Navigate to the new position and update focus
  navigateToVerse();
  a = $(`#${a}Dropdown`).find(".q-dropdown-item");
  currentFocus = a.index(a.filter(`[data-value="${e}"]`));
}

// Updates all navigation values based on provided data
function updateAllQValues(data) {
  // Parse and update current position
  currentJuz = parseInt(data[0]);
  currentSurah = parseInt(data[1]);
  currentAyah = parseInt(data[2]);

  // Update display values
  $("#juzValue").text(currentJuz);
  $("#surahValue").text(`${currentSurah} ${arabicSurahNames[currentSurah]}`);
  $("#ayahValue").text(currentAyah);
}

// Updates the ayah dropdown for the current surah
function updateAyahDropdown() {
  // Initialize ayah dropdown with verse count of current surah
  initializeQDropdown("ayah", 1, ayahCounts[currentSurah] || 1);
  $("#ayahValue").text("1");
}

// Initializes a dropdown menu (surah, ayah, or juz)
function initializeQDropdown(a, e, t) {
  const n = $(`#${a}Dropdown`);

  // Clear dropdown and add search input, also show placeholder text
  n.empty();
  n.append(
    `<input type="text" class="q-dropdown-search" placeholder="${
      n.closest(".q-nav-box").find(".q-nav-label").text() === "ސޫރަތް:"
        ? "ސޫރަތުގެ ނަން ނުވަތަ ނަމްބަރު ލިޔޭ"
        : n.closest(".q-nav-box").find(".q-nav-label").text() === "އާޔަތް:"
        ? "އާޔަތް ނަމްބަރު ލިޔޭ"
        : "ޖުޒް ނަމްބަރު ލިޔޭ"
    }">`
  );

  // For ayah dropdown, get verse count from current surah
  "ayah" === a && (t = ayahCounts[currentSurah]);

  // Add dropdown items
  for (; e <= t; e++) {
    let t = e;
    // For surah dropdown, include names in multiple languages
    "surah" === a &&
      (t = `${e} ${arabicSurahNames[e]} ${dhivehiSurahNames[e]} ${englishSurahNames[e]}`);
    n.append(`<div class="q-dropdown-item" data-value="${e}">${t}</div>`);
  }

  // Continue from initializeQDropdown...

  // Add event listeners for dropdown items and search
  n.on("click", ".q-dropdown-item", function () {
    // Handle click on dropdown item
    const e = $(this).data("value");
    updateQValue(a, e);
    // Store last focused item
    lastFocusedItems[a] = n.find(".q-dropdown-item").index(this);
    n.hide();
  });

  // Set up search functionality

  // Update the search functionality in initializeQDropdown
  t = n.find(".q-dropdown-search");
  t.on("input", function () {
    const value = this.value.toLowerCase();
    const searchTerms = prepareArabicText(value).split(/\s+/);

    n.find(".q-dropdown-item").each(function () {
      const item = $(this);
      const itemText = prepareArabicText(item.text().toLowerCase());

      // Match if all search terms are found in the item text
      const isMatch = searchTerms.every((term) => itemText.includes(term));

      // Debug logging (remove in production)
      // console.log('Search terms:', searchTerms);
      // console.log('Item text:', itemText);
      // console.log('Match:', isMatch);

      if (isMatch) {
        item.show();
      } else {
        item.hide();
      }
    });

    // Reset focus when searching
    currentFocus = -1;
  });

  // Handle keyboard navigation in search
  t.on("keydown", function (e) {
    const visibleItems = n.find(".q-dropdown-item:visible");
    const itemCount = visibleItems.length;

    if (itemCount === 0) return;

    switch (e.keyCode) {
      case 40: // Down arrow
        e.preventDefault();
        currentFocus =
          currentFocus < 0 ? 0 : Math.min(currentFocus + 1, itemCount - 1);
        break;

      case 38: // Up arrow
        e.preventDefault();
        currentFocus = Math.max(currentFocus - 1, 0);
        break;

      case 13: // Enter
        e.preventDefault();
        if (currentFocus < 0 && itemCount > 0) {
          // If no item is focused but there are visible items, select the first one
          currentFocus = 0;
        }
        if (currentFocus >= 0 && currentFocus < itemCount) {
          visibleItems.eq(currentFocus).click();
        }
        return;
    }

    // Update visual focus
    removeActive(visibleItems);
    if (currentFocus >= 0) {
      visibleItems.eq(currentFocus).addClass("active");
      visibleItems[currentFocus].scrollIntoView({ block: "nearest" });
    }
  });
}

// Adds active class to currently focused item and scrolls it into view
function addActive(a) {
  if (!a) return !1;
  removeActive(a);
  $(a[currentFocus]).addClass("active");
  $(a[currentFocus])[0].scrollIntoView({
    block: "nearest",
    inline: "nearest",
  });
}

// Removes active class from all items
function removeActive(a) {
  a.removeClass("active");
}

// Initializes the navigation boxes (surah, ayah, juz selectors)
function initializeNavigationBoxes() {
  // Initialize dropdowns
  initializeQDropdown("surah", 1, 114);
  initializeQDropdown("juz", 1, 30);
  updateAyahDropdown();

  // Set up click handlers for navigation elements
  $(".q-nav-value").on("click", function () {
    QtoggleDropdown($(this).attr("id").replace("Value", ""));
  });

  $(".q-nav-arrow").on("click", function () {
    QnavigateArrow($(this).data("type"), $(this).data("direction"));
  });

  // Close dropdowns when clicking outside
  $(document).on("click", function (a) {
    $(a.target).closest(".q-nav-box").length || $(".q-dropdown").hide();
  });

  // Save search input values when hiding dropdowns
  $(".q-dropdown").on("hide", function () {
    var a = $(this).attr("id").replace("Dropdown", "");
    searchInputValues[a] = $(this).find(".q-dropdown-search").val();
  });
}

//
// TRANSLATIONS - for  translation-related functions
//

// Gets all column definitions for the DataTable
function getAllColumnDefinitions() {
  // Map additional JSON translations to column definitions
  const a = additionalJsons.flatMap((a) => [
    // Title column for each translation
    {
      title: `<strong>${a.title}</strong>`,
      data: null,
      name: `${a.name}-title`,
      visible: !1,
      render: function (e, t, n) {
        return `<strong>${a.title}</strong>`;
      },
    },
    // Data columns for each translation
    ...a.columns.map((e, t) => ({
      title: `${t + 1}`,
      data: null,
      name: `${a.name}-${e}`,
      visible: !1,
      render: function (t, n, r) {
        // Check if the translation data exists
        if (r[a.name] && r[a.name][e] !== undefined) {
          // Return empty string if it's empty, otherwise replace newlines
          return r[a.name][e] === "" ? "" : r[a.name][e].replace(/\n/g, "<br>");
        }
        return "ތައްޔާރުވަނީ..."; // Only show loading when data is undefined
      },
    })),
  ]);

  // Combine base columns with additional translation columns
  return [...baseColumns, ...a];
}

// Toggles visibility of a specific translation column
function toggleTranslation(a, e) {
  // Find the translation configuration
  var t = additionalJsons.find((e) => e.name === a);
  const n = getColumnIndices(a),
    r = n[0], // Title column index
    i = n[e + 1], // Data column index
    l = table.page(); // Current page number

  // If translation is already loaded
  if (additionalColumns.includes(a)) {
    // Check which columns are visible
    t = t.columns.filter((a, e) => table.column(n[e + 1]).visible());
    // Toggle title column visibility based on content columns
    table.column(r).visible(!(1 === t.length && e === t[0] - 1));
    // Toggle content column visibility
    table.column(i).visible(!table.column(i).visible());
    table.draw();
    table.page(l).draw("page");
  }
  // If translation needs to be loaded
  else {
    additionalColumns.push(a);
    // Load translation data from JSON file
    $.getJSON(`${baseJsonUrl}${a}.json`, function (e) {
      const t = table.data().toArray();
      // Add translation data to existing table data
      t.forEach((t, n) => {
        t[a] = e[n];
      });

      // Update originalData to include the new translation data
      originalData = originalData.map((row, index) => {
        const newRow = Array.isArray(row) ? [...row] : Object.values(row);
        newRow[a] = e[index];
        return newRow;
      });

      // Update table with new data
      table.clear().rows.add(t).draw();
      table.column(r).visible(!0);
      table.column(i).visible(!0);
      table.page(l).draw("page");
    }).fail(function (a, e, t) {
      console.error("Error loading translation:", t);
    });
  }
}

// Gets column indices for a specific translation
function getColumnIndices(a) {
  let e = baseColumns.length;
  // Calculate offset based on previous translations
  for (
    let t = 0;
    t < additionalJsons.length && additionalJsons[t].name !== a;
    t++
  ) {
    e += additionalJsons[t].columns.length + 1;
  }
  // Return array of indices [titleIndex, ...contentIndices]
  return [
    e,
    ...additionalJsons
      .find((e) => e.name === a)
      .columns.map((a, t) => e + t + 1),
  ];
}

// Shows all available translations
function showAllTranslations() {
  document
    .querySelectorAll('#translationList input[type="checkbox"]')
    .forEach((a) => {
      a.checked = !0;
      translationStates[a.value] = !0;
    });
}

// Sets up the translation selector UI
function initializeTranslationSelector() {
  // Get UI elements
  const a = document.getElementById("translationList"),
    e = document.getElementById("translationToggleBtn"),
    t = document.getElementById("translationDropdown"),
    n = document.getElementById("applyTranslations"),
    r = document.getElementById("resetTranslations"),
    i = document.getElementById("showAllTranslations");

  if (e && t) {
    // Add base columns to translation list
    baseColumns.forEach((e, t) => {
      addTranslationItem(a, e.title, t, e.visible);
    });

    // Add additional translations to list
    additionalJsons.forEach((e) => {
      e.columns.forEach((t, n) => {
        addTranslationItem(
          a,
          `${e.title} ${n + 1}`,
          `${e.name}-${t}`,
          e.name === defaultAdditionalJson && 0 === n
        );
      });
    });

    // Set up event listeners
    e.addEventListener("click", (a) => {
      a.stopPropagation();
      t.style.display = "block" === t.style.display ? "none" : "block";
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (a) => {
      if (
        !a.target.closest(".translation-selector") &&
        "block" === t.style.display
      ) {
        applyTranslations();
        t.style.display = "none";
      }
    });

    // Set up button event listeners
    n.addEventListener("click", () => {
      applyTranslations();
      t.style.display = "none";
    });
    r.addEventListener("click", resetTranslations);
    i.addEventListener("click", showAllTranslations);
  } else {
    console.error("Toggle button or dropdown not found");
  }
}

// Adds a translation item to the translation selector UI
function addTranslationItem(a, e, t, n) {
  const r = document.createElement("div");
  r.className = "translation-item";

  // Skip title columns
  if (!String(t).includes("-title")) {
    // Check if this is a default column for the default translation
    let isDefaultColumn = false;
    if (typeof t === "string" && t.includes("-")) {
      const [jsonName, colNum] = t.split("-");
      isDefaultColumn =
        jsonName === defaultAdditionalJson &&
        defaultColumns.includes(parseInt(colNum));
    }

    // Create checkbox and label for translation
    r.innerHTML = `
      <input type="checkbox" id="trans-${t}" value="${t}" ${
      n || isDefaultColumn ? "checked" : ""
    }>
      <label for="trans-${t}">${e}</label>
    `;
    a.appendChild(r);

    // Store initial states
    translationStates[t] = n || isDefaultColumn;
    initialTranslationStates[t] = n || isDefaultColumn;
  }
}

// Applies the selected translation visibility settings
function applyTranslations() {
  const currentPage = table.page();

  // First, handle all checkboxes and their corresponding columns
  document
    .querySelectorAll('#translationList input[type="checkbox"]')
    .forEach((checkbox) => {
      const value = checkbox.value;
      const isChecked = checkbox.checked;

      // Handle JSON-based translations
      if (typeof value === "string" && value.includes("-")) {
        const [jsonName, colNum] = value.split("-");
        if (
          isChecked !==
          table
            .column(getColumnIndices(jsonName)[parseInt(colNum) + 1])
            .visible()
        ) {
          toggleTranslation(jsonName, parseInt(colNum));
        }
      } else {
        // Handle base columns
        table.column(parseInt(value)).visible(isChecked);
      }
      translationStates[value] = isChecked;
    });

  // Then handle title columns visibility
  additionalJsons.forEach((json) => {
    const columnIndices = getColumnIndices(json.name);
    const titleColumnIndex = columnIndices[0];
    const contentColumns = columnIndices.slice(1);

    // Check if any content columns are visible
    const hasVisibleColumns = contentColumns.some((idx) =>
      table.column(idx).visible()
    );

    // Set title column visibility based on content columns
    table.column(titleColumnIndex).visible(hasVisibleColumns);
  });

  // Redraw table and maintain page position
  table.draw();
  table.page(currentPage).draw("page");
  scrollUpTop();
}

// Resets translations to their initial state
function resetTranslations() {
  document
    .querySelectorAll('#translationList input[type="checkbox"]')
    .forEach((a) => {
      a.checked = initialTranslationStates[a.value] || !1;
    });
}

// Toggles visibility of a base column
function toggleBaseColumn(a) {
  const e = table.column(a);
  e.visible(translationStates[a]);
  baseColumns[a].visible = e.visible();
}

//
