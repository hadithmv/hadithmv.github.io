// QURAN DROPDOWNS FUNCTIONS

/**
 * Updates the navigation boxes with values from the first row of the current page
 */
function updateNavigationBoxes() {
  var firstRow = table.row({ page: "current" }).data();
  if (firstRow) {
    updateAllValues(firstRow);
  }
}

function removeDiacritics(text) {
  return text.replace(/[َُِّْٰۡۚٓـًٌٍّٔ]/g, "");
}

/**
 * Initializes a dropdown with given range of values
 * @param {string} type - The type of dropdown (surah, ayah, or juz)
 * @param {number} min - The minimum value for the dropdown
 * @param {number} max - The maximum value for the dropdown
 */
function initializeDropdown(type, min, max) {
  var dropdown = $("#" + type + "Dropdown");
  dropdown.empty();
  dropdown.append(
    '<input type="text" class="dropdown-search" placeholder="ލިޔޭ ނޫނީ ތިރިއަށް ފިތާ">'
  );
  for (var i = min; i <= max; i++) {
    var displayText = i;
    if (type === "surah" && surahNames[i]) {
      displayText = i + " " + surahNames[i];
    }
    dropdown.append(
      '<div class="dropdown-item" data-value="' +
        i +
        '">' +
        displayText +
        "</div>"
    );
  }

  // Event listener for dropdown item clicks
  dropdown.on("click", ".dropdown-item", function () {
    var value = $(this).data("value");
    updateValue(type, value);
    dropdown.hide();
  });

  // Event listener for search input
  dropdown.find(".dropdown-search").on("input", function () {
    var searchValue = removeDiacritics($(this).val().toLowerCase());
    var matchingItems = [];

    dropdown.find(".dropdown-item").each(function () {
      var $item = $(this);
      var itemValue = removeDiacritics($item.text().toLowerCase());
      var itemNumericValue = $item.data("value").toString();

      if (!isNaN(searchValue) && searchValue.trim() !== "") {
        if (itemNumericValue.startsWith(searchValue)) {
          matchingItems.push($item);
        }
        $item.hide();
      } else {
        $item.toggle(itemValue.includes(searchValue));
      }
    });

    if (!isNaN(searchValue) && searchValue.trim() !== "") {
      matchingItems
        .sort(function (a, b) {
          return a.data("value") - b.data("value");
        })
        .forEach(function ($item) {
          $item.show().appendTo(dropdown);
        });
    }
  });

  // Event listener for search input enter key and arrow keys
  dropdown.find(".dropdown-search").on("keydown", function (e) {
    var visibleItems = dropdown.find(".dropdown-item:visible");
    var currentIndex = visibleItems.index(
      dropdown.find(".dropdown-item.highlighted")
    );

    switch (e.which) {
      case 13: // Enter key
        e.preventDefault();
        var highlightedItem = dropdown.find(".dropdown-item.highlighted");
        if (highlightedItem.length) {
          updateValue(type, highlightedItem.data("value"));
        } else {
          var firstVisible = visibleItems.first();
          if (firstVisible.length) {
            updateValue(type, firstVisible.data("value"));
          }
        }
        dropdown.hide();
        break;
      case 38: // Up arrow
        e.preventDefault();
        if (currentIndex > 0) {
          visibleItems.removeClass("highlighted");
          visibleItems
            .eq(currentIndex - 1)
            .addClass("highlighted")
            .get(0)
            .scrollIntoView({ block: "nearest" });
        }
        break;
      case 40: // Down arrow
        e.preventDefault();
        if (currentIndex < visibleItems.length - 1) {
          visibleItems.removeClass("highlighted");
          visibleItems
            .eq(currentIndex + 1)
            .addClass("highlighted")
            .get(0)
            .scrollIntoView({ block: "nearest" });
        }
        break;
    }
  });
}

/**
 * Toggles the visibility of a dropdown
 * @param {string} type - The type of dropdown to toggle
 */
// Update the toggleDropdown function to display Surah names correctly

function toggleDropdown(type) {
  var dropdown = $("#" + type + "Dropdown");
  $(".dropdown").not(dropdown).hide();
  dropdown.toggle();

  if (dropdown.is(":visible")) {
    var currentValue = parseInt($("#" + type + "Value").text());
    var item = dropdown.find(
      '.dropdown-item[data-value="' + currentValue + '"]'
    );
    if (item.length) {
      item.get(0).scrollIntoView({ block: "center" });
    }
    dropdown.find(".dropdown-search").val("").focus();

    // Reset dropdown items visibility
    dropdown.find(".dropdown-item").show();

    // Remove highlight from all items
    dropdown.find(".dropdown-item").removeClass("highlighted");
  }
}

/**
 * Updates the value of a navigation box and navigates to the corresponding verse
 * @param {string} type - The type of value to update (surah, ayah, or juz)
 * @param {number} value - The new value
 */
// Update the updateValue function to display Surah names correctly
function updateValue(type, value) {
  value = parseInt(value);
  if (type === "surah" && surahNames[value]) {
    $("#" + type + "Value").text(value + " " + surahNames[value]);
  } else {
    $("#" + type + "Value").text(value);
  }
  if (type === "surah") {
    currentSurah = value;
    currentAyah = 1;
    currentJuz = null;
    updateAyahDropdown();
  } else if (type === "ayah") {
    currentAyah = value;
    currentJuz = null;
  } else if (type === "juz") {
    currentJuz = value;
  }
  navigateToVerse();
}
/**
 * Updates the ayah dropdown based on the current surah
 */
function updateAyahDropdown() {
  var maxAyah = ayahCounts[currentSurah] || 1;
  initializeDropdown("ayah", 1, maxAyah);
  $("#ayahValue").text("1");
}

/**
 * Handles navigation when arrow buttons are clicked
 * @param {string} type - The type of navigation (surah, ayah, or juz)
 * @param {string} direction - The direction of navigation ("prev" or "next")
 */
function navigateArrow(type, direction) {
  var current,
    max,
    min = 1;
  if (type === "surah") {
    current = currentSurah;
    max = maxSurah;
    currentJuz = null;
  } else if (type === "ayah") {
    current = currentAyah;
    max = ayahCounts[currentSurah] || 1;
    currentJuz = null;
  } else if (type === "juz") {
    current = parseInt($("#juzValue").text());
    max = maxJuz;
  }

  if (direction === "prev") {
    current--;
    if (current < min) {
      if (type === "ayah") {
        currentSurah--;
        if (currentSurah < 1) currentSurah = maxSurah;
        updateAyahDropdown();
        current = ayahCounts[currentSurah] || 1;
      } else {
        current = max;
      }
    }
  } else {
    current++;
    if (current > max) {
      if (type === "ayah") {
        currentSurah++;
        if (currentSurah > maxSurah) currentSurah = 1;
        updateAyahDropdown();
        current = 1;
      } else {
        current = min;
      }
    }
  }

  updateValue(type, current);
}

// Navigates to the selected verse in the DataTable
function navigateToVerse() {
  var targetRow;

  if (currentJuz !== null) {
    // If a Juz is selected, find the first row with that Juz number
    targetRow = table
      .rows()
      .indexes()
      .filter(function (value, index) {
        var rowData = table.row(value).data();
        return parseInt(rowData[0]) == currentJuz;
      });
  } else {
    // Otherwise, find the row with the current Surah and Ayah
    targetRow = table
      .rows()
      .indexes()
      .filter(function (value, index) {
        var rowData = table.row(value).data();
        return (
          parseInt(rowData[1]) == currentSurah &&
          parseInt(rowData[2]) == currentAyah
        );
      });
  }

  if (targetRow.length > 0) {
    // Show the target row and update navigation values
    table.row(targetRow[0]).show().draw(false);
    updateAllValues(table.row(targetRow[0]).data());
  }

  // Reset currentJuz after navigation
  currentJuz = null;
}

/**
 * Updates all navigation box values based on the given row data
 * @param {Array} rowData - The data of the current row
 */
function updateAllValues(rowData) {
  currentJuz = parseInt(rowData[0]);
  currentSurah = parseInt(rowData[1]);
  currentAyah = parseInt(rowData[2]);
  $("#juzValue").text(currentJuz);
  $("#surahValue").text(currentSurah + " " + surahNames[currentSurah]);
  $("#ayahValue").text(currentAyah);
}

// Additional utility functions can be added here as needed
