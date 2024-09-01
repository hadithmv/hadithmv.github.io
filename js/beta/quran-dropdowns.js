// QURAN DROPDOWN CODE IS BELOW HERE

/**
 * Toggles the visibility of a dropdown
 * @param {string} type - The type of dropdown to toggle
 */
// Update the QtoggleDropdown function to display Surah names correctly

function QtoggleDropdown(type) {
  var dropdown = $("#" + type + "Dropdown");
  $(".q-dropdown").not(dropdown).hide();
  dropdown.toggle();

  if (dropdown.is(":visible")) {
    var currentValue = parseInt($("#" + type + "Value").text());
    var item = dropdown.find(
      '.q-dropdown-item[data-value="' + currentValue + '"]'
    );
    if (item.length) {
      item.get(0).scrollIntoView({ block: "center" });
    }
    dropdown.find(".q-dropdown-search").val("").focus();

    // Reset dropdown items visibility
    dropdown.find(".q-dropdown-item").show();

    // Remove highlight from all items
    dropdown.find(".q-dropdown-item").removeClass("highlighted");
  }
}

/**
 * Updates the value of a navigation box and navigates to the corresponding verse
 * @param {string} type - The type of value to update (surah, ayah, or juz)
 * @param {number} value - The new value
 */
// Update the updateQValue function to display Surah names correctly
function updateQValue(type, value) {
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
  initializeQDropdown("ayah", 1, maxAyah);
  $("#ayahValue").text("1");
}

/**
 * Handles navigation when arrow buttons are clicked
 * @param {string} type - The type of navigation (surah, ayah, or juz)
 * @param {string} direction - The direction of navigation ("prev" or "next")
 */
function QnavigateArrow(type, direction) {
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

  updateQValue(type, current);
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
    updateAllQValues(table.row(targetRow[0]).data());
  }

  // Reset currentJuz after navigation
  currentJuz = null;
}

/**
 * Updates all navigation box values based on the given row data
 * @param {Array} rowData - The data of the current row
 */
function updateAllQValues(rowData) {
  currentJuz = parseInt(rowData[0]);
  currentSurah = parseInt(rowData[1]);
  currentAyah = parseInt(rowData[2]);
  $("#juzValue").text(currentJuz);
  $("#surahValue").text(currentSurah + " " + surahNames[currentSurah]);
  $("#ayahValue").text(currentAyah);
}

// Additional utility functions can be added here as needed
