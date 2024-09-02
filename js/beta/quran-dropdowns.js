// QURAN OBJECT MAPS
// this part is not the navigation arrows at the top

// makes ayah numbers arabic
function replaceDigitsWithArabic(data) {
  return data.replace(/[0-9]/g, function (match) {
    return arabicDigits[match];
  });
}
const arabicDigits = {
  0: "٠",
  1: "١",
  2: "٢",
  3: "٣",
  4: "٤",
  5: "٥",
  6: "٦",
  7: "٧",
  8: "٨",
  9: "٩",
};
//

// makes numbers into MATHEMATICAL SANS-SERIF DIGIT, Object mapping regular digits to their mathematical sans-serif equivalents
const sansSerifDigits = {
  0: "𝟢",
  1: "𝟣",
  2: "𝟤",
  3: "𝟥",
  4: "𝟦",
  5: "𝟧",
  6: "𝟨",
  7: "𝟩",
  8: "𝟪",
  9: "𝟫",
};

// makes surah numbers into names, Object mapping surah numbers to their Arabic names
const surahNames = {
  1: "الفَاتِحَة",
  2: "البَقَرَة",
  3: "آل عِمرَان",
  4: "النِّسَاء",
  5: "المَائِدَة",
  6: "الأَنعَام",
  7: "الأَعرَاف",
  8: "الأَنفَال",
  9: "التَّوبَة",
  10: "يُونُس",
  11: "هُود",
  12: "يُوسُف",
  13: "الرَّعد",
  14: "إِبرَاهِيم",
  15: "الحِجر",
  16: "النَّحل",
  17: "الإِسرَاء",
  18: "الكَهف",
  19: "مَريَم",
  20: "طه",
  21: "الأَنبِيَاء",
  22: "الحَجّ",
  23: "المُؤمِنُون",
  24: "النُّور",
  25: "الفُرقَان",
  26: "الشُّعَرَاء",
  27: "النَّمل",
  28: "القَصَص",
  29: "العَنكَبُوت",
  30: "الرُّوم",
  31: "لُقمَان",
  32: "السَّجدَة",
  33: "الأَحزَاب",
  34: "سَبَإ",
  35: "فَاطِر",
  36: "يسٓ",
  37: "الصَّافَّات",
  38: "صٓ",
  39: "الزُّمَر",
  40: "غَافِر",
  41: "فُصِّلَت",
  42: "الشُّورَى",
  43: "الزُّخرُف",
  44: "الدُّخَان",
  45: "الجَاثِيَة",
  46: "الأَحقَاف",
  47: "مُحَمَّد",
  48: "الفَتح",
  49: "الحُجُرَات",
  50: "قٓ",
  51: "الذَّارِيَات",
  52: "الطُّور",
  53: "النَّجم",
  54: "القَمَر",
  55: "الرَّحمٰن",
  56: "الوَاقِعَة",
  57: "الحَدِيد",
  58: "المُجَادِلَة",
  59: "الحَشر",
  60: "المُمتَحَنَة",
  61: "الصَّف",
  62: "الجُمعَة",
  63: "المُنَافِقُون",
  64: "التَّغَابُن",
  65: "الطَّلَاق",
  66: "التَّحرِيم",
  67: "المُلك",
  68: "القَلَم",
  69: "الحَاقَّة",
  70: "المَعَارِج",
  71: "نُوح",
  72: "الجِنّ",
  73: "المُزَّمِّل",
  74: "المُدَّثِّر",
  75: "القِيَامَة",
  76: "الإِنسَان",
  77: "المُرسَلَات",
  78: "النَّبَإ",
  79: "النَّازِعَات",
  80: "عَبَس",
  81: "التَّكوِير",
  82: "الانفِطَار",
  83: "المُطَفِّفِين",
  84: "الانشِقَاق",
  85: "البُرُوج",
  86: "الطَّارِق",
  87: "الأَعلَى",
  88: "الغَاشِيَة",
  89: "الفَجر",
  90: "البَلَد",
  91: "الشَّمس",
  92: "اللَّيل",
  93: "الضُّحَى",
  94: "الشَّرح",
  95: "التِّين",
  96: "العَلَق",
  97: "القَدر",
  98: "البَيِّنَة",
  99: "الزَّلزَلَة",
  100: "العَادِيَات",
  101: "القَارِعَة",
  102: "التَّكَاثُر",
  103: "العَصر",
  104: "الهُمَزَة",
  105: "الفِيل",
  106: "قُرَيش",
  107: "المَاعُون",
  108: "الكَوثَر",
  109: "الكَافِرُون",
  110: "النَّصر",
  111: "المَسَد",
  112: "الإِخلَاص",
  113: "الفَلَق",
  114: "النَّاس",
};
//

// QURAN DROPDOWN CODE IS BELOW HERE
// this part is the navigation arrows at the top

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
