// JavaScript code will be added here
document.addEventListener("DOMContentLoaded", () => {
  const topTabs = document.querySelectorAll(".top-tab");
  const tabContents = document.querySelectorAll(".tab-content");
  const textArea = document.getElementById("textArea");
  const fontSizeSlider = document.getElementById("fontSizeSlider");
  const fontSizeInput = document.getElementById("fontSize");
  const charCount = document.getElementById("charCount");
  const wordCount = document.getElementById("wordCount");
  const lineCount = document.getElementById("lineCount");
  const fileSize = document.getElementById("fileSize");
  const addTabButton = document.getElementById("addTab");
  const numberedTabs = document.querySelector(".numbered-tabs");

  let currentTab = 1;
  let tabs = [{ id: 1, content: "" }];

  // Top tabs functionality
  topTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      topTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      tabContents.forEach((content) => {
        content.classList.remove("active");
        if (content.id === `${tab.dataset.tab}Tab`) {
          content.classList.add("active");
        }
      });
    });
  });

  // Font size functionality
  fontSizeSlider.addEventListener("input", updateFontSize);
  fontSizeInput.addEventListener("change", updateFontSize);
  fontSizeInput.addEventListener("click", showFontSizeDropdown);

  function updateFontSize() {
    const size = this.value;
    fontSizeSlider.value = size;
    fontSizeInput.value = size;
    textArea.style.fontSize = `${size}px`;
  }

  function showFontSizeDropdown() {
    // Implement font size dropdown here
  }

  // Text area stats update
  function updateStats() {
    const text = textArea.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split("\n").length : 0;
    charCount.textContent = `Char: ${text.length}`;
    wordCount.textContent = `Wrd: ${words}`;
    lineCount.textContent = `Ln: ${lines}`;
    const bytes = new Blob([text]).size;
    fileSize.textContent =
      bytes < 1024
        ? `B: ${bytes}`
        : bytes < 1048576
        ? `KB: ${(bytes / 1024).toFixed(2)}`
        : bytes < 1073741824
        ? `MB: ${(bytes / 1048576).toFixed(2)}`
        : `GB: ${(bytes / 1073741824).toFixed(2)}`;
  }

  textArea.addEventListener("input", debounce(updateStats, 300));

  // Debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Numbered tabs functionality
  addTabButton.addEventListener("click", () => {
    const newTabId = tabs.length + 1;
    tabs.push({ id: newTabId, content: "" });
    const newTab = document.createElement("button");
    newTab.classList.add("numbered-tab");
    newTab.dataset.tab = newTabId;
    newTab.textContent = newTabId;
    numberedTabs.insertBefore(newTab, addTabButton);
    switchTab(newTabId);
  });

  numberedTabs.addEventListener("click", (e) => {
    if (e.target.classList.contains("numbered-tab")) {
      switchTab(parseInt(e.target.dataset.tab));
    }
  });

  function switchTab(tabId) {
    tabs[currentTab - 1].content = textArea.value;
    currentTab = tabId;
    textArea.value = tabs.find((tab) => tab.id === tabId).content;
    document.querySelectorAll(".numbered-tab").forEach((tab) => {
      tab.classList.toggle("active", parseInt(tab.dataset.tab) === tabId);
    });
    updateStats();
  }

  // =====================================================

  // functions within FUNCTIONS

  function ltrSwitch() {
    textArea.style.direction = "ltr";
    textArea.style.textAlign = "left";
  }

  function rtlSwitch() {
    textArea.style.direction = "rtl";
    textArea.style.textAlign = "right";
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  //

  // =====================================================

  //  JavaScript to handle the dropdown functionality:

  // Call this after your DOM is loaded
  setupDropdowns();
  //

  // Add near the top of your DOMContentLoaded event handler
  function setupDropdowns() {
    document.querySelectorAll(".dropdown-button").forEach((dropdown) => {
      const button = dropdown.querySelector(".function-button");
      const content = dropdown.querySelector(".dropdown-content");

      // Toggle dropdown on button click
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        closeAllDropdowns();
        content.classList.toggle("show");
      });

      // Prevent closing when clicking inside dropdown content
      content.addEventListener("click", (e) => {
        e.stopPropagation();

        // Only handle action if clicking a direct action button
        if (e.target.tagName === "BUTTON" && e.target.dataset.action) {
          const action = e.target.dataset.action;
          handleDropdownAction(action);
          content.classList.remove("show");
        }
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener("click", closeAllDropdowns);
  }

  function closeAllDropdowns() {
    document.querySelectorAll(".dropdown-content").forEach((content) => {
      content.classList.remove("show");
    });
  }

  // =====================================================

  function handleDropdownAction(action) {
    switch (action) {
      //  DROPDOWN FUNCTIONS BEGIN FROM HERE BELOW

      case "arabicToRegular":
        textArea.value = textArea.value.replace(/[٠١٢٣٤٥٦٧٨٩]/g, (d) =>
          "٠١٢٣٤٥٦٧٨٩".indexOf(d)
        );
        break;
      case "regularToArabic":
        textArea.value = textArea.value.replace(
          /[0-9]/g,
          (d) => "٠١٢٣٤٥٦٧٨٩"[d]
        );

      //

      case "convertNumerals":
        const numeralMappings = {
          regular: "0123456789",
          arabic: "٠١٢٣٤٥٦٧٨٩", // Arabic-Indic
          superscript: "⁰¹²³⁴⁵⁶⁷⁸⁹", // Superscript
          mathSansSerif: "𝟢𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫", // Mathematical Sans-serif
          mathSansSerifBold: "𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵", // Mathematical Sans-serif Bold
          fullWidth: "０１２３４５６７８９", // Fullwidth
          circled: "⓪①②③④⑤⑥⑦⑧⑨", // Circled
          negativeCircled: "⓿❶❷❸❹❺❻❼❽❾", // Negative Circled
        };

        const fromNumerals =
          numeralMappings[document.getElementById("numeralFrom").value];
        const toNumerals =
          numeralMappings[document.getElementById("numeralTo").value];

        textArea.value = textArea.value.replace(/[0-9]/g, (d) => {
          const index = fromNumerals.indexOf(d);
          return index !== -1 ? toNumerals[index] : d;
        });
        break;

        //

        break;
      case "removePrecedingZeros":
        textArea.value = textArea.value.replace(/\b0+(\d)/g, "$1");
        break;

      case "removeAllNumbers":
        textArea.value = textArea.value.replace(/[٠-٩0-9]/g, "");
        break;

      case "keepOnlyNumbers":
        textArea.value = textArea.value.replace(/[^٠-٩0-9]/g, "");
        break;

      // =====================================================

      case "rtlStraightToCurly":
      case "ltrStraightToCurly":
        const isRTL = action === "rtlStraightToCurly";
        textArea.value = textArea.value
          // Opening doubles
          .replace(/(\W|^)"(\S)/g, `$1${isRTL ? "\u201D" : "\u201C"}$2`)
          // Closing doubles
          .replace(
            new RegExp(
              `(${isRTL ? "\u201D" : "\u201C"}[^"]*)"([^"]*$|[^${
                isRTL ? "\u201D" : "\u201C"
              }"]*${isRTL ? "\u201D" : "\u201C"})`,
              "g"
            ),
            `$1${isRTL ? "\u201C" : "\u201D"}$2`
          )
          // Remaining double closing
          .replace(/([^0-9])"/g, `$1${isRTL ? "\u201C" : "\u201D"}`)
          // Opening singles
          .replace(/(\W|^)'(\S)/g, `$1${isRTL ? "\u2019" : "\u2018"}$2`)
          // Contractions
          .replace(/([a-z])'([a-z])/gi, "$1\u2018$2")
          // Closing singles
          .replace(
            /((\u2019[^']*)|[a-z])'([^0-9]|$)/gi,
            `$1${isRTL ? "\u2018" : "\u2019"}$3`
          )
          // Abbrev. years like '93
          .replace(
            /(\u2019)([0-9]{2}[^\u2018]*)(\u2019([^0-9]|$)|$|\u2018[a-z])/gi,
            "\u2018$2$3"
          )
          // Backwards apostrophe
          .replace(
            /(\B|^)\u2019(?=([^\u2018]*\u2018\b)*([^\u2018\u2019]*\W[\u2018\u2019]\b|[^\u2018\u2019]*$))/gi,
            "$1\u2018"
          )
          // Triple prime
          .replace(/'''/g, "\u2034")
          // Double prime
          .replace(/''/g, "\u2033")
          // Prime
          .replace(/'/g, "\u2032");
        break;

      case "curlyToStraight":
        textArea.value = textArea.value
          .replace(/[\u2018\u2019]/g, "'")
          .replace(/[\u201C\u201D]/g, '"');
        break;

      case "reverseCurlyQuotes":
        textArea.value = textArea.value
          .replace(/“|”/g, (match) => (match === "“" ? "”" : "“")) // Swap curly double quotes
          .replace(/‘|’/g, (match) => (match === "‘" ? "’" : "‘")) // Swap curly single quotes
          .replace(/❝|❞/g, (match) => (match === "❝" ? "❞" : "❝"))
          .replace(/🙶|🙷/g, (match) => (match === "🙶" ? "🙷" : "🙷"));
        break;

      //

      case "convertQuotes":
        const quoteMappings = {
          straightSingle: ["'", "'"],
          straightDouble: ['"', '"'],
          ltrCurlyDouble: ["“", "”"], // Correct LTR curly double quotes
          rtlCurlyDouble: ["”", "“"], // Correct RTL curly double quotes
          ltrCurlySingle: ["‘", "’"], // Correct LTR curly single quotes
          rtlCurlySingle: ["’", "‘"], // Correct RTL curly single quotes
          angleQuotes: ["«", "»"],
          doubleBrackets: ["((", "))"],
          heavyCommaQuotes: ["❝", "❞"],
          sansSerifHeavyCommaQuotes: ["🙶", "🙷"],
        };

        const fromQuotes =
          quoteMappings[document.getElementById("quoteFrom").value];
        const toQuotes =
          quoteMappings[document.getElementById("quoteTo").value];

        // Escape special characters for regex
        const escapedFromOpen = fromQuotes[0].replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );
        const escapedFromClose = fromQuotes[1].replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

        textArea.value = textArea.value.replace(
          new RegExp(
            `${escapedFromOpen}([^${escapedFromClose}]*)${escapedFromClose}`,
            "g"
          ),
          `${toQuotes[0]}$1${toQuotes[1]}`
        );
        break;

      /* OLD CODE
          let isSmartQuotes = false;
  document.getElementById("convertQuotes").addEventListener("click", () => {
    if (isSmartQuotes) {
      // Convert smart quotes to straight quotes
      textArea.value = textArea.value
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"');
    } else {
      // Convert straight quotes to smart quotes for RTL
      textArea.value = textArea.value
        .replace(/(\W|^)"(\S)/g, "$1\u201D$2") // opening doubles
        .replace(/(\u201D[^"]*)"([^"]*$|[^\u201D"]*\u201D)/g, "$1\u201C$2") // closing doubles
        .replace(/([^0-9])"/g, "$1\u201C") // remaining double closing
        .replace(/(\W|^)'(\S)/g, "$1\u2019$2") // opening singles
        .replace(/([a-z])'([a-z])/gi, "$1\u2018$2") // contractions
        .replace(/((\u2019[^']*)|[a-z])'([^0-9]|$)/gi, "$1\u2018$3") // closing singles
        .replace(
          /(\u2019)([0-9]{2}[^\u2018]*)(\u2019([^0-9]|$)|$|\u2018[a-z])/gi,
          "\u2018$2$3"
        ) // abbrev. years like '93
        .replace(
          /(\B|^)\u2019(?=([^\u2018]*\u2018\b)*([^\u2018\u2019]*\W[\u2018\u2019]\b|[^\u2018\u2019]*$))/gi,
          "$1\u2018"
        ) // backwards apostrophe
        .replace(/'''/g, "\u2034") // triple prime
        .replace(/''/g, "\u2033") // double prime
        .replace(/'/g, "\u2032"); // prime
    }
    isSmartQuotes = !isSmartQuotes;
    updateStats();
  });
  //
  */

      // =====================================================

      // Web Languages

      case "removeJsComments":
        textArea.value = textArea.value.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");
        ltrSwitch();
        break;

      case "removeHtmlComments":
        textArea.value = textArea.value.replace(/<!--[\s\S]*?-->/g, "");
        ltrSwitch();
        break;

      case "removeCssComments":
        textArea.value = textArea.value.replace(/\/\*[\s\S]*?\*\//g, "");
        ltrSwitch();
        break;

      //

      case "removePowershellComments":
        textArea.value = textArea.value
          .replace(/#.*$/gm, "") // Single line comments
          .replace(/<#[\s\S]*?#>/g, ""); // Multi-line comments
        ltrSwitch();
        break;

      case "removePythonComments":
        textArea.value = textArea.value
          .replace(/#.*$/gm, "") // Single line comments
          .replace(/'''[\s\S]*?'''|"""[\s\S]*?"""/g, ""); // Triple quoted strings
        ltrSwitch();
        break;

      case "removePhpComments":
        textArea.value = textArea.value.replace(
          /\/\*[\s\S]*?\*\/|\/\/.*|#.*$/gm,
          ""
        );
        ltrSwitch();
        break;

      // C-Style Languages
      case "removeCComments":
        textArea.value = textArea.value.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");
        ltrSwitch();
        break;

      case "removeCSharpComments":
        textArea.value = textArea.value.replace(
          /\/\*[\s\S]*?\*\/|\/\/\/.*|\/\/.*/g,
          ""
        ); // Includes XML doc comments
        ltrSwitch();
        break;

      case "removeJavaComments":
        textArea.value = textArea.value.replace(
          /\/\*[\s\S]*?\*\/|\/\*\*[\s\S]*?\*\/|\/\/.*/g,
          ""
        ); // Includes JavaDoc
        ltrSwitch();
        break;

      // Scripting Languages
      case "removeRubyComments":
        textArea.value = textArea.value
          .replace(/#.*$/gm, "") // Single line comments
          .replace(/^=begin[\s\S]*?^=end/gm, ""); // Multi-line comments
        ltrSwitch();
        break;

      // Shell Scripts
      case "removeBashComments":
        textArea.value = textArea.value.replace(/#.*$/gm, "");
        ltrSwitch();
        break;

      // Modern Languages
      case "removeGoComments":
        textArea.value = textArea.value.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");
        ltrSwitch();
        break;

      case "removeRustComments":
        textArea.value = textArea.value.replace(
          /\/\*[\s\S]*?\*\/|\/\/!.*|\/\/.*/g,
          ""
        ); // Includes doc comments
        ltrSwitch();
        break;

      case "removeSwiftComments":
        textArea.value = textArea.value.replace(
          /\/\*[\s\S]*?\*\/|\/\/\/.*|\/\/.*/g,
          ""
        ); // Includes doc comments
        ltrSwitch();
        break;

      case "removeKotlinComments":
        textArea.value = textArea.value.replace(
          /\/\*[\s\S]*?\*\/|\/\*\*[\s\S]*?\*\/|\/\/.*/g,
          ""
        ); // Includes KDoc
        ltrSwitch();
        break;

      case "removeDartComments":
        textArea.value = textArea.value.replace(
          /\/\*[\s\S]*?\*\/|\/\/\/.*|\/\/.*/g,
          ""
        ); // Includes doc comments
        ltrSwitch();
        break;

      // Database
      case "removeSqlComments":
        textArea.value = textArea.value.replace(/\/\*[\s\S]*?\*\/|--.*$/gm, ""); // Multi-line and single-line comments
        ltrSwitch();
        break;

      // =====================================================

      case "textToParagraphs":
        textArea.value = textArea.value
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => `<p>${line}</p>`)
          .join("\n");
        ltrSwitch();
        break;

      case "textToBrTags":
        textArea.value = textArea.value.split("\n").join("<br>\n");
        ltrSwitch();
        break;

      case "textToOrderedList":
        textArea.value =
          "<ol>\n" +
          textArea.value
            .split("\n")
            .filter((line) => line.trim())
            .map((line) => `  <li>${line}</li>`)
            .join("\n") +
          "\n</ol>";
        ltrSwitch();
        break;

      case "textToUnorderedList":
        textArea.value =
          "<ul>\n" +
          textArea.value
            .split("\n")
            .filter((line) => line.trim())
            .map((line) => `  <li>${line}</li>`)
            .join("\n") +
          "\n</ul>";
        ltrSwitch();
        break;

      case "removeHtmlTags":
        textArea.value = textArea.value.replace(/<[^>]*>/g, "");
        break;

      // =====================================================

      case "removeArabicDiacritics":
        textArea.value = textArea.value.replace(
          /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g,
          ""
        );
        break;
      case "removeDhivehiFili":
        textArea.value = textArea.value.replace(/[\u07A6-\u07B0]/g, "");
        break;

      // RMV THIKIJEHI THAANA
      case "removeThikijehiThaana":
        // Define the replacement map
        const thikijehiReplacements = {
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

        textArea.value = textArea.value.replace(
          /[ޘޙޛޜޞޠޡޢޤޥ]/g,
          (char) => thikijehiReplacements[char] || char
        );
        break;
      //

      // =====================================================

      case "saveFile":
        const blob = new Blob([textArea.value], {
          type: "text/plain;charset=utf-8",
        });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "saved_text.txt";
        a.click();
        break;

      case "loadFile":
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "text/plain";
        input.onchange = (e) => {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (event) => {
            textArea.value = event.target.result;
            updateStats();
          };
          reader.readAsText(file);
        };
        input.click();
        break;

      // =====================================================

      case "titleCase":
        textArea.value = textArea.value.replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
        break;

      case "sentenceCase":
        textArea.value = textArea.value
          .toLowerCase()
          .replace(/(^\w|\.\s+\w)/g, (letter) => letter.toUpperCase());
        break;

      case "lowercase":
        textArea.value = textArea.value.toLowerCase();
        break;

      case "UPPERCASE":
        textArea.value = textArea.value.toUpperCase();
        break;

      case "alternatingCase":
        textArea.value = textArea.value
          .split("")
          .map((char, i) =>
            i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
          )
          .join("");
        break;

      case "inverseCase":
        textArea.value = textArea.value
          .split("")
          .map((char) =>
            char === char.toUpperCase()
              ? char.toLowerCase()
              : char.toUpperCase()
          )
          .join("");
        break;

      case "randomCase":
        textArea.value = textArea.value
          .split("")
          .map((char) =>
            Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()
          )
          .join("");
        break;

      case "camelCase":
        textArea.value = textArea.value
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (match, char) => char.toUpperCase());
        break;

      case "pascalCase":
        textArea.value = textArea.value
          .toLowerCase()
          .replace(/(^|[^a-zA-Z0-9]+)(.)/g, (match, separator, char) =>
            char.toUpperCase()
          );
        break;

      case "snakeCase":
        textArea.value = textArea.value
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "");
        break;

      case "constantCase":
        textArea.value = textArea.value
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "");
        break;

      case "kebabCase":
        textArea.value = textArea.value
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        break;

      case "dotCase":
        textArea.value = textArea.value
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+/g, ".")
          .replace(/^\.+|\.+$/g, "");
        break;

      case "flatcase":
        textArea.value = textArea.value
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+/g, "");
        break;

      // =====================================================

      case "splitIntoWords":
        textArea.value = textArea.value
          .split(/\s+/)
          .filter((word) => word.length > 0)
          .join("\n");
        break;

      case "sortWordsByFrequency":
        scrollToTop();
        const text = textArea.value;
        const words = text.toLowerCase().match(/\b[\w']+\b/g) || [];
        const frequency = {};

        words.forEach((word) => {
          frequency[word] = (frequency[word] || 0) + 1;
        });

        const sortedWords = Object.entries(frequency)
          .sort((a, b) => b[1] - a[1])
          .map(([word, freq]) => `${freq}: ${word}`);

        textArea.value = sortedWords.join("\n");
        break;

      case "sortLinesByFrequency":
        scrollToTop();
        const lines = textArea.value
          .split("\n")
          .filter((line) => line.trim() !== "");
        const lineFrequency = {};

        lines.forEach((line) => {
          lineFrequency[line] = (lineFrequency[line] || 0) + 1;
        });

        const sortedLines = Object.entries(lineFrequency)
          .sort((a, b) => b[1] - a[1])
          .map(([line, freq]) => `${freq}: ${line}`);

        textArea.value = sortedLines.join("\n");
        break;

      case "sortLinesAscending":
        textArea.value = textArea.value
          .split("\n")
          .sort((a, b) => a.localeCompare(b))
          .join("\n");
        break;

      case "sortLinesDescending":
        textArea.value = textArea.value
          .split("\n")
          .sort((a, b) => b.localeCompare(a))
          .join("\n");
        break;

      case "randomizeLines":
        textArea.value = textArea.value
          .split("\n")
          .sort(() => Math.random() - 0.5)
          .join("\n");
        break;

      case "removeDuplicateLines":
        textArea.value = [...new Set(textArea.value.split("\n"))].join("\n");
        break;

      case "reverseTextHorizontal":
        textArea.value = textArea.value.split("").reverse().join("");
        break;

      case "reverseTextVertical":
        textArea.value = textArea.value.split("\n").reverse().join("\n");
        break;

      //

      // Add this to your handleDropdownAction function
      case "addLineNumbers":
        const addSeparator = document.getElementById("addNumbersWith").value;
        const textToNumber = textArea.value.split("\n");
        const withNumbers = textToNumber.map(
          (line, index) => `${index + 1}${addSeparator} ${line}`
        );
        textArea.value = withNumbers.join("\n");
        break;

      case "removeLineNumbers":
        const removeSeparator =
          document.getElementById("removeNumbersWith").value;
        const textToClean = textArea.value.split("\n");
        // Escape special characters for regex
        const escapedSeparator = removeSeparator.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );
        const pattern = new RegExp(`^\\d+${escapedSeparator}\\s+`);
        const withoutNumbers = textToClean.map((line) =>
          line.replace(pattern, "")
        );
        textArea.value = withoutNumbers.join("\n");
        break;

      // =====================================================

      case "decodeUnicode":
        textArea.value = textArea.value.replace(
          /\\u([0-9a-fA-F]{4})/g,
          function (match, group1) {
            return String.fromCharCode(parseInt(group1, 16));
          }
        );
        ltrSwitch();
        break;

      case "encodeUnicode":
        textArea.value = textArea.value.replace(/[\s\S]/g, function (char) {
          let hex = char.charCodeAt(0).toString(16);
          // Pad with zeros to ensure 4 digits
          while (hex.length < 4) hex = "0" + hex;
          return "\\u" + hex;
        });
        ltrSwitch();
        break;

      case "decodeURL":
        try {
          textArea.value = decodeURI(textArea.value);
        } catch (e) {
          alert("Invalid URL encoding");
        }
        ltrSwitch();
        break;

      case "encodeURL":
        textArea.value = encodeURI(textArea.value);
        ltrSwitch();
        break;

      case "whichUnicodeCharacter":
        const inputText = textArea.value;
        let output = "";
        for (let i = 0; i < inputText.length; i++) {
          const codePoint = inputText.codePointAt(i);
          const unicodeLink = `https://codepoints.net/U+${codePoint
            .toString(16)
            .toUpperCase()
            .padStart(4, "0")}`;
          output += `U+${codePoint
            .toString(16)
            .toUpperCase()
            .padStart(4, "0")} : ${inputText[i]} : ${unicodeLink}\n`;
          if (codePoint > 0xffff) i++; // Increment i again if surrogate pair
        }
        textArea.value = output;
        ltrSwitch();
        break;

      //

      case "textToLeet":
        const leetMap = {
          a: "4",
          e: "3",
          i: "!",
          o: "0",
          t: "7",
          l: "1",
          s: "5",
        };
        textArea.value = textArea.value
          .toLowerCase()
          .replace(/[aeiotls]/g, (char) => leetMap[char]);
        ltrSwitch();
        break;

      case "leetToText":
        const reverseLeetMap = {
          4: "a",
          3: "e",
          "!": "i",
          0: "o",
          7: "t",
          1: "l",
          5: "s",
        };
        textArea.value = textArea.value.replace(
          /[43!0715]/g,
          (char) => reverseLeetMap[char]
        );
        ltrSwitch();
        break;

      /* previously used:
  const leetMap = {
                a: "4",
                e: "3",
                l: "1",
                o: "0",
                s: "5",
                t: "7",
                a: "@",
                // 4 λ ∂ α æ Λ
                b: "8",
                // ß
                c: "€",
                // ( ¢ ζ
                d: "∂",
                // ð Ð đ δ
                e: "3",
                // £ € ə ε ξ ℇ
                f: "ƒ",
                // ʃ
                g: "9",
                // ℊ
                h: "#",
                i: "!",
                // ι
                j: "ʝ",
                // ĵ ¿
                k: "ɮ",
                // ₭
                l: "ʅ",
                // £ ℓ
                m: "ണ",
                // Պ സ ന ൩ ന ണ
                n: "π",
                // ₪ η
                o: "0",
                // ¤ Ω ø θ σ
                p: "ρ",
                // ? ₱ þ ¶
                q: "ℚ",
                //
                r: "₹",
                // Я
                s: "$",
                // §
                t: "†",
                // 7 + λ τ
                u: "µ",
                // Ü
                v: "√",
                // ▼ ѵ υ
                w: "ω",
                // Ш ɰ
                x: "×",
                // * Ж % χ א
                y: "γ",
                // Ψ ¥  Ч ψ
                z: "2",
              };
              */
      //

      // Add these cases to your switch statement
      case "textToBinary":
        // Convert each character to its ASCII value, then to binary
        textArea.value = textArea.value
          .split("")
          .map((char) => {
            // Get ASCII code for each character
            const ascii = char.charCodeAt(0);
            // Convert to 8-bit binary representation with padding
            return ascii.toString(2).padStart(8, "0");
          })
          .join(" "); // Add spaces between binary codes for readability
        break;

      case "binaryToText":
        // Split by spaces, convert each binary code back to a character
        try {
          textArea.value = textArea.value
            .trim()
            .split(" ")
            .map((binary) => {
              // Convert binary to decimal (ASCII)
              const decimal = parseInt(binary, 2);
              // Convert ASCII to character
              return String.fromCharCode(decimal);
            })
            .join("");
        } catch (e) {
          alert(
            "Error converting machine code to text. Make sure you have valid binary numbers separated by spaces."
          );
        }
        break;
      //

      // =====================================================

      case "convertBrackets":
        const bracketMappings = {
          round: ["(", ")"],
          square: ["[", "]"],
          superscript: ["⁽", "⁾"],
          corner: ["⌜", "⌝"],
        };

        const fromBrackets =
          bracketMappings[document.getElementById("bracketFrom").value];
        const toBrackets =
          bracketMappings[document.getElementById("bracketTo").value];
        const direction = document.getElementById("bracketDirection").value;
        const toType = document.getElementById("bracketTo").value;
        const fromType = document.getElementById("bracketFrom").value;

        // Create a regex that matches either opening or closing bracket
        const fromRegex = new RegExp(
          `\\${fromBrackets[0]}|\\${fromBrackets[1]}`,
          "g"
        );

        textArea.value = textArea.value.replace(fromRegex, (match) => {
          if (direction === "rtl") {
            if (toType === "corner") {
              // When converting TO corner brackets in RTL, reverse them
              return match === fromBrackets[0] ? toBrackets[1] : toBrackets[0];
            } else if (fromType === "corner") {
              // When converting FROM corner brackets in RTL, maintain direction
              return match === fromBrackets[0] ? toBrackets[0] : toBrackets[1];
            } else {
              // For other RTL conversions, maintain direction
              return match === fromBrackets[0] ? toBrackets[0] : toBrackets[1];
            }
          } else {
            // For LTR, maintain direction
            return match === fromBrackets[0] ? toBrackets[0] : toBrackets[1];
          }
        });
        break;

      case "reverseBracketDirection":
        const allBrackets = {
          "(": ")",
          ")": "(",
          "[": "]",
          "]": "[",
          "⁽": "⁾",
          "⁾": "⁽",
          "⌜": "⌝",
          "⌝": "⌜",
        };

        const bracketRegex = /[()[\]⁽⁾⌜⌝]/g;

        textArea.value = textArea.value.replace(
          bracketRegex,
          (match) => allBrackets[match]
        );
        break;

      // =====================================================

      case "convertNumberBrackets":
        const numberBracketMappings = {
          none: ["", ""],
          round: ["(", ")"],
          square: ["[", "]"],
          superscript: ["⁽", "⁾"],
        };

        // Add superscript number mappings
        const superscriptNumbers = {
          0: "⁰",
          1: "¹",
          2: "²",
          3: "³",
          4: "⁴",
          5: "⁵",
          6: "⁶",
          7: "⁷",
          8: "⁸",
          9: "⁹",
        };

        const fromNumberBrackets =
          numberBracketMappings[
            document.getElementById("numberBracketFrom").value
          ];
        const toNumberBrackets =
          numberBracketMappings[
            document.getElementById("numberBracketTo").value
          ];
        const toNumBrackType = document.getElementById("numberBracketTo").value;

        // Convert from current format to plain numbers first
        let processedText = textArea.value;
        if (fromNumberBrackets[0]) {
          const fromRegex = new RegExp(
            `\\${fromNumberBrackets[0]}\\d+\\${fromNumberBrackets[1]}`,
            "g"
          );
          processedText = processedText.replace(fromRegex, (match) =>
            match.slice(
              fromNumberBrackets[0].length,
              -fromNumberBrackets[1].length
            )
          );
        }

        // Then convert to target format
        if (toNumberBrackets[0]) {
          processedText = processedText.replace(/\d+/g, (match) => {
            const numbers =
              toNumBrackType === "superscript"
                ? match
                    .split("")
                    .map((n) => superscriptNumbers[n])
                    .join("")
                : match;
            return `${toNumberBrackets[0]}${numbers}${toNumberBrackets[1]}`;
          });
        }

        textArea.value = processedText;
        break;

      //

      // Then in your handleDropdownAction function:
      case "removeNumberBrackets":
        const removeNumberBracketMappings = {
          round: ["(", ")"],
          square: ["[", "]"],
          superscript: ["⁽", "⁾"],
          none: ["", ""],
        };
        const bracketTypeToRemove =
          removeNumberBracketMappings[
            document.getElementById("numberBracketRemove").value
          ];

        // Create regex to match numbers with the selected bracket style
        const removeRegex = new RegExp(
          `\\${bracketTypeToRemove[0]}\\d+\\${bracketTypeToRemove[1]}`,
          "g"
        );

        // Remove the entire pattern (brackets and numbers)
        textArea.value = textArea.value.replace(removeRegex, "");
        updateStats();
        break;

      // =====================================================

      // Add these cases to your handleDropdownAction function
      case "keepOnlyDhivehi":
        textArea.value = textArea.value.replace(/[^\u0780-\u07BF\s]/g, "");
        break;

      case "removeAllDhivehi":
        textArea.value = textArea.value.replace(/[\u0780-\u07BF]/g, "");
        break;

      case "keepOnlyArabic":
        //textArea.value = textArea.value.replace(/[^\u0600-\u06FF\s]/g, "");
        // https://notes.yshalsager.com/en/notes/Regex%20Match%20Arabic%20Letters/
        textArea.value = textArea.value.replace(
          /[^\u0600-\u06ff\u0750-\u077f\ufb50-\ufbc1\ufbd3-\ufd3f\ufd50-\ufd8f\ufd92-\ufdc7\ufe70-\ufefc\uFDF0-\uFDFD\s]/g,
          ""
        );
        break;

      case "removeAllArabic":
        textArea.value = textArea.value.replace(
          /[\u0600-\u06ff\u0750-\u077f\ufb50-\ufbc1\ufbd3-\ufd3f\ufd50-\ufd8f\ufd92-\ufdc7\ufe70-\ufefc\uFDF0-\uFDFD]/g,
          ""
        );
        break;

      case "keepOnlyEnglish":
        textArea.value = textArea.value.replace(/[^A-Za-z\s]/g, "");
        break;

      case "removeAllEnglish":
        textArea.value = textArea.value.replace(/[A-Za-z]/g, "");
        break;

      // =====================================================

      // Add these cases to your handleDropdownAction function
      case "removeSpacesTabsAndSingleLines":
        textArea.value = textArea.value
          .replace(/^ +| +$/gm, "") // Remove spaces at line starts/ends
          .replace(/ +/g, " ") // Multiple spaces to single
          .replace(/\t+/g, " ") // Multiple tabs to a single space
          .trim() // Trim whole text
          .replace(/\n{2,}/g, "\n"); // More than single empty line to single
        break;

      case "removeSpacesAndDoubleLines":
        textArea.value = textArea.value
          .replace(/^ +| +$/gm, "") // Remove spaces at line starts/ends
          .replace(/ +/g, " ") // Multiple spaces to single
          .trim() // Trim whole text
          .replace(/\n{3,}/g, "\n\n"); // More than double empty line to double
        break;

      case "wordWrap":
        textArea.value = textArea.value.replace(/\s+/g, " ").trim();
        break;

      case "removeExtraSpacesOnly":
        textArea.value = textArea.value
          .replace(/^ +| +$/gm, "") // Remove spaces at line starts/ends
          .replace(/ +/g, " ") // Multiple spaces to single
          .trim(); // Trim whole text
        break;

      case "convertTabsToSpaces":
        textArea.value = textArea.value
          .replace(/\t+/g, " ") // Multiple tabs to a single space
          .trim(); // Trim whole text
        break;

      case "removeSingleLinesOnly":
        textArea.value = textArea.value
          .trim() // Trim whole text
          .replace(/\n{2,}/g, "\n"); // More than single empty line to single
        break;

      case "removeDoubleLinesOnly":
        textArea.value = textArea.value
          .trim() // Trim whole text
          .replace(/\n{3,}/g, "\n\n"); // More than double empty line to double
        break;

      // =====================================================

      case "dotsToEllipsis":
        textArea.value = textArea.value.replace(/\.{3}/g, "…");
        break;

      case "ellipsisToDots":
        textArea.value = textArea.value.replace(/…/g, "...");
        break;

      // =====================================================

      case "convertDashes":
        const dashMappings = {
          hyphen: "-",
          en: "–",
          em: "—",
        };

        const fromDash =
          dashMappings[document.getElementById("dashFrom").value];
        const toDash = dashMappings[document.getElementById("dashTo").value];

        // Convert from current format to target format
        textArea.value = textArea.value.replace(
          new RegExp(fromDash, "g"),
          toDash
        );
        break;

        // =====================================================

        // Define password generator function outside switch
        function generatePassword(options) {
          const charSets = {
            uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            lowercase: "abcdefghijklmnopqrstuvwxyz",
            numbers: "0123456789",
            symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
          };

          let chars = "";
          if (options.useUppercase) chars += charSets.uppercase;
          if (options.useLowercase) chars += charSets.lowercase;
          if (options.useNumbers) chars += charSets.numbers;
          if (options.useSymbols) chars += charSets.symbols;

          if (!chars) chars = charSets.lowercase;

          let password = "";
          for (let i = 0; i < options.length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
          }

          if (options.useUppercase && !/[A-Z]/.test(password)) {
            const pos = Math.floor(Math.random() * options.length);
            password =
              password.substring(0, pos) +
              charSets.uppercase.charAt(
                Math.floor(Math.random() * charSets.uppercase.length)
              ) +
              password.substring(pos + 1);
          }
          if (options.useLowercase && !/[a-z]/.test(password)) {
            const pos = Math.floor(Math.random() * options.length);
            password =
              password.substring(0, pos) +
              charSets.lowercase.charAt(
                Math.floor(Math.random() * charSets.lowercase.length)
              ) +
              password.substring(pos + 1);
          }
          if (options.useNumbers && !/[0-9]/.test(password)) {
            const pos = Math.floor(Math.random() * options.length);
            password =
              password.substring(0, pos) +
              charSets.numbers.charAt(
                Math.floor(Math.random() * charSets.numbers.length)
              ) +
              password.substring(pos + 1);
          }
          if (
            options.useSymbols &&
            !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)
          ) {
            const pos = Math.floor(Math.random() * options.length);
            password =
              password.substring(0, pos) +
              charSets.symbols.charAt(
                Math.floor(Math.random() * charSets.symbols.length)
              ) +
              password.substring(pos + 1);
          }

          return password;
        }

      // In your switch statement:
      case "setupPasswordGenerator": {
        // Setup input validations when the dropdown is opened
        const passwordCount = document.getElementById("passwordCount");
        if (passwordCount) {
          passwordCount.addEventListener("input", () => {
            let value = parseInt(passwordCount.value);
            if (value < 1) passwordCount.value = 1;
            if (value > 100) passwordCount.value = 100;
          });
        }

        const passwordLength = document.getElementById("passwordLength");
        if (passwordLength) {
          passwordLength.addEventListener("input", () => {
            let value = parseInt(passwordLength.value);
            if (value < 4) passwordLength.value = 4;
            if (value > 128) passwordLength.value = 128;
          });
        }

        const checkboxes = document.querySelectorAll(
          '.checkbox-group input[type="checkbox"]'
        );
        checkboxes.forEach((checkbox) => {
          checkbox.addEventListener("change", () => {
            const anyChecked = Array.from(checkboxes).some((cb) => cb.checked);
            if (!anyChecked) {
              checkbox.checked = true;
            }
          });
        });
        break;
      }

      case "generatePasswords": {
        const count =
          parseInt(document.getElementById("passwordCount").value) || 1;
        const length =
          parseInt(document.getElementById("passwordLength").value) || 8;
        const options = {
          length: length,
          useUppercase: document.getElementById("useUppercase").checked,
          useLowercase: document.getElementById("useLowercase").checked,
          useNumbers: document.getElementById("useNumbers").checked,
          useSymbols: document.getElementById("useSymbols").checked,
        };

        const passwords = [];
        for (let i = 0; i < count; i++) {
          passwords.push(generatePassword(options));
        }

        textArea.value = passwords.join("\n");
        updateStats();
        closeAllDropdowns();
        break;
      }

      /* OLD CODE
  document.getElementById("genRandPass").addEventListener("click", () => {
    const length = Math.floor(Math.random() * 10) + 8; // Random length between 8 and 17
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    textArea.value += (textArea.value ? "\n" : "") + password;
    updateStats();
  });*/
      //

      // =====================================================

      case "generateSequence": {
        let seqMin =
          parseInt(document.getElementById("seqMinInput").value) || 1;
        let seqMax =
          parseInt(document.getElementById("seqMaxInput").value) || 10;

        // Swap if seqMin > seqMax
        if (seqMin > seqMax) {
          [seqMin, seqMax] = [seqMax, seqMin];
          document.getElementById("seqMinInput").value = seqMin;
          document.getElementById("seqMaxInput").value = seqMax;
        }

        // Generate sequence with options
        const options = {
          padStart: document.getElementById("seqPadStart")?.checked || false,
          padLength:
            parseInt(document.getElementById("seqPadLength")?.value) || 1,
          // Handle separator special characters
          separator:
            document.getElementById("seqSeparator").value === "\\n"
              ? "\n"
              : document.getElementById("seqSeparator").value || "\n",
          reverse: document.getElementById("seqReverse")?.checked || false,
          prefix: document.getElementById("seqPrefix")?.value || "",
          suffix: document.getElementById("seqSuffix")?.value || "",
        };

        // Create sequence array
        let sequence = Array.from({ length: seqMax - seqMin + 1 }, (_, i) => {
          let num = seqMin + i;
          // Pad with zeros if enabled
          if (options.padStart) {
            num = String(num).padStart(options.padLength, "0");
          }
          return `${options.prefix}${num}${options.suffix}`;
        });

        // Reverse if enabled
        if (options.reverse) {
          sequence.reverse();
        }

        // Join with selected separator
        textArea.value = sequence.join(options.separator);
        updateStats();
        closeAllDropdowns();
        break;
      }

      // =====================================================

      case "generateRandomNumber": {
        let randMin =
          parseInt(document.getElementById("randNoMinInput").value) || 1;
        let randMax =
          parseInt(document.getElementById("randNoMaxInput").value) || 10;
        const count =
          parseInt(document.getElementById("randNoCount").value) || 1;
        const unique = document.getElementById("randNoUnique").checked;

        // Swap if randMin > randMax
        if (randMin > randMax) {
          [randMin, randMax] = [randMax, randMin];
          document.getElementById("randNoMinInput").value = randMin;
          document.getElementById("randNoMaxInput").value = randMax;
        }

        // Validate count for unique numbers
        const possibleNumbers = randMax - randMin + 1;
        let actualCount = count;
        if (unique && count > possibleNumbers) {
          actualCount = possibleNumbers;
        }

        // Generate random numbers
        let numbers = [];
        if (unique) {
          // Create array of all possible numbers and shuffle it
          const allNumbers = Array.from(
            { length: possibleNumbers },
            (_, i) => randMin + i
          );
          for (let i = allNumbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]];
          }
          numbers = allNumbers.slice(0, actualCount);
        } else {
          // Generate random numbers without uniqueness constraint
          for (let i = 0; i < actualCount; i++) {
            numbers.push(
              Math.floor(Math.random() * (randMax - randMin + 1)) + randMin
            );
          }
        }

        textArea.value = numbers.join("\n");
        updateStats();
        closeAllDropdowns();
        break;
      }

      // =====================================================

      case "repeatText": {
        const count =
          parseInt(document.getElementById("repeatCount").value) || 2;
        const separator =
          document.getElementById("repeatSeparator").value === "\\n"
            ? "\n"
            : document.getElementById("repeatSeparator").value;

        const originalText = textArea.value;
        textArea.value = Array(count).fill(originalText).join(separator);

        updateStats();
        closeAllDropdowns();
        break;
      }

      // =====================================================

      case "addPrefixSuffix": {
        const prefix = document.getElementById("addPrefixInput").value;
        const suffix = document.getElementById("addSuffixInput").value;

        const lines = textArea.value.split("\n");
        const modifiedLines = lines.map((line) => prefix + line + suffix);
        textArea.value = modifiedLines.join("\n");

        updateStats();
        closeAllDropdowns();
        break;
      }

      case "removePrefixSuffix": {
        const prefix = document.getElementById("removePrefixInput").value;
        const suffix = document.getElementById("removeSuffixInput").value;

        const lines = textArea.value.split("\n");
        const modifiedLines = lines.map((line) => {
          let modifiedLine = line;
          if (prefix && modifiedLine.startsWith(prefix)) {
            modifiedLine = modifiedLine.slice(prefix.length);
          }
          if (suffix && modifiedLine.endsWith(suffix)) {
            modifiedLine = modifiedLine.slice(0, -suffix.length);
          }
          return modifiedLine;
        });

        textArea.value = modifiedLines.join("\n");

        updateStats();
        closeAllDropdowns();
        break;
      }

      case "removeCharsFromEnds": {
        const charsFromStart =
          parseInt(document.getElementById("removeStartChars").value) || 0;
        const charsFromEnd =
          parseInt(document.getElementById("removeEndChars").value) || 0;

        const lines = textArea.value.split("\n");
        const modifiedLines = lines.map((line) => {
          // Handle empty lines
          if (!line) return line;

          // Remove from start
          let modifiedLine = line;
          if (charsFromStart > 0) {
            modifiedLine = modifiedLine.slice(charsFromStart);
          }

          // Remove from end
          if (charsFromEnd > 0 && modifiedLine.length > 0) {
            modifiedLine = modifiedLine.slice(0, -charsFromEnd);
          }

          return modifiedLine;
        });

        textArea.value = modifiedLines.join("\n");

        updateStats();
        closeAllDropdowns();
        break;
      }

      // =====================================================

      case "convertSalawat":
        const salawatMappings = {
          plain: "صلى الله عليه وسلم",
          symbol: "ﷺ",
          tashkeel: "صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ",
        };

        const fromSalawat =
          salawatMappings[document.getElementById("salawatFrom").value];
        const toSalawat =
          salawatMappings[document.getElementById("salawatTo").value];

        // Escape special characters for regex
        const escapedFromSalawat = fromSalawat.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

        textArea.value = textArea.value.replace(
          new RegExp(escapedFromSalawat, "g"),
          toSalawat
        );
        break;

      // =====================================================

      case "removeKashidas":
        textArea.value = textArea.value.replace(/ـ/g, "");
        break;

      case "shaddaB4Haraka":
        function correctShaddaPlacement(text) {
          const diacritics = "ًٌٍَُِّْ";
          const shadda = "ّ";
          return text.replace(
            new RegExp(`([${diacritics}])(${shadda})`, "g"),
            (match, diacritic, shadda) => {
              // If the diacritic is a sukun, leave it after the shadda
              if (diacritic === "ْ") {
                return match;
              }
              // Otherwise, move the shadda before the diacritic
              return shadda + diacritic;
            }
          );
        }

        textArea.value = correctShaddaPlacement(textArea.value);
        break;

      //

      case "textToArabicDiacritics":
      case "arabicDiacriticsToText":
        const arabicPhrases = {
          "رضي الله عنهما": "رَضِيَ اللَّهُ عَنْهُمَا",
          "رضي الله عنهم": "رَضِيَ اللَّهُ عَنْهُمْ",
          "رضي الله عنها": "رَضِيَ اللَّهُ عَنْهَا",
          "رضي الله عنه": "رَضِيَ اللَّهُ عَنْهُ",
          "عليهما السلام": "عَلَيهِمَا السَّلَامُ",
          "عليهم السلام": "عَلَيهِمُ السَّلَامُ",
          "عليها السلام": "عَلَيهَا السَّلَامُ",
          "عليه السلام": "عَلَيهِ السَّلَامُ",
          "رحمهما الله": "رَحِمَهُمَا اللَّهُ",
          "رحمهم الله": "رَحِمَهُمُ اللَّهُ",
          "رحمها الله": "رَحِمَهَا اللَّهُ",
          "رحمه الله": "رَحِمَهُ اللَّهُ",
          "عز وجل": "عَزَّ وَجَلَّ",
          "جل جلاله": "جَلَّ جَلَاﻟَﻪُ",
          "تبارك وتعالى": "تَبَارَكَ وَتَعَالَى",
          تعالى: "تَعَالَى",
        };

        textArea.value = Object.entries(arabicPhrases).reduce(
          (result, [plain, diacritic]) => {
            return result.replace(
              new RegExp(
                escapeRegExp(
                  action === "textToArabicDiacritics" ? plain : diacritic
                ),
                "g"
              ),
              action === "textToArabicDiacritics" ? diacritic : plain
            );
          },
          textArea.value
        );
        break;

      //

      case "removeQuranicMarks":
        textArea.value = textArea.value
          .replace(/[ۖۗۘۙۚۛۜ۝۞ۣ۟۠ۡۢۤۥۦۧۨ۩۪ۭ۫۬﴾﴿]/g, "")
          .replace(/\s+/g, " ")
          .trim();
        break;

      case "replaceDoubleBracketsToSingle":
        textArea.value = textArea.value.replace(/\(\(([^)]*)\)\)/g, "($1)");
        break;

      //

      case "textToQuranicBrackets":
        textArea.value = textArea.value
          .replace(/\{/g, "﴾")
          .replace(/\}/g, "﴿")
          .replace(/\*/g, "۝");
        break;

      case "quranicToTextBrackets":
        textArea.value = textArea.value
          .replace(/﴾/g, "{")
          .replace(/﴿/g, "}")
          .replace(/۝/g, "*");
        break;

      // =====================================================

      case "convertPunctuation":
        const punctuationMappings = {
          colon: ":",
          fullstop: ".",
          comma: ",",
        };

        const fromPunctuation =
          punctuationMappings[document.getElementById("punctuationFrom").value];
        const toPunctuation =
          punctuationMappings[document.getElementById("punctuationTo").value];

        // Escape special characters for regex
        const escapedFromPunctuation = fromPunctuation.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

        textArea.value = textArea.value.replace(
          new RegExp(escapedFromPunctuation, "g"),
          toPunctuation
        );
        break;

      // =====================================================

      case "ltrToRtlPunc":
        textArea.value = textArea.value.replace(
          /[,;?]/g,
          (match) =>
            ({
              ",": "،",
              ";": "؛",
              "?": "؟",
            }[match] || match)
        );
        break;

      case "rtlToLtrPunc":
        textArea.value = textArea.value.replace(
          /[،؛؟]/g,
          (match) =>
            ({
              "،": ",",
              "؛": ";",
              "؟": "?",
            }[match] || match)
        );
        break;

      // =====================================================

      //     !!!  Add more cases as needed

      // =====================================================

      //

      // CASES END
    }
    updateStats();
  }

  // =====================================================

  // BUTTON FUNCTIONS

  document.getElementById("copyToClipboard").addEventListener("click", () => {
    navigator.clipboard.writeText(textArea.value);
  });
  //

  document.getElementById("clearAll").addEventListener("click", () => {
    textArea.value = "";
    tabs = [{ id: 1, content: "" }];
    numberedTabs.innerHTML =
      '<button class="numbered-tab active" data-tab="1">1</button><button id="addTab">+</button>';
    currentTab = 1;
    updateStats();
  });
  //

  let isRTL = true;
  document.getElementById("toggleDirection").addEventListener("click", () => {
    isRTL = !isRTL;
    textArea.style.direction = isRTL ? "rtl" : "ltr";
    textArea.style.textAlign = isRTL ? "right" : "left";
  });
  //

  // TRANSLITERATION
  // https://github.com/naxeem/thaana-transliterator-js/blob/main/thaana-transliterator.js

  // above is dhivehi to english only. there is a bidirectional working example on https://dhivehi.mv/tools/latin-thaana/, but its closed s, may have been based on jawish's

  // use an array of key-value pairs instead otherwise there might be issues with Unicode characters in the object literal

  // Dhivehi to English transliteration mappings
  const transliterationMappings = [
    ["އަ", "a"],
    ["އާ", "aa"],
    ["އި", "i"],
    ["އީ", "ee"],
    ["އު", "u"],
    ["އޫ", "oo"],
    ["އެ", "e"],
    ["އޭ", "ey"],
    ["އޮ", "o"],
    ["އޯ", "oa"],
    ["ުއް", "uh"],
    ["ިއް", "ih"],
    ["ެއް", "eh"],
    ["ަށް", "ah"],
    ["ައް", "ah"],
    ["ށް", "h"],
    ["ތް", "i"],
    ["ާއް", "aah"],
    ["އް", "h"],
    ["ަ", "a"],
    ["ާ", "aa"],
    ["ި", "i"],
    ["ީ", "ee"],
    ["ު", "u"],
    ["ޫ", "oo"],
    ["ެ", "e"],
    ["ޭ", "ey"],
    ["ޮ", "o"],
    ["ޯ", "oa"],
    ["ް", ""],
    ["ހ", "h"],
    ["ށ", "sh"],
    ["ނ", "n"],
    ["ރ", "r"],
    ["ބ", "b"],
    ["ޅ", "lh"],
    ["ކ", "k"],
    ["އ", "a"],
    ["ވ", "v"],
    ["މ", "m"],
    ["ފ", "f"],
    ["ދ", "dh"],
    ["ތ", "th"],
    ["ލ", "l"],
    ["ގ", "g"],
    ["ޏ", "y"],
    ["ސ", "s"],
    ["ޑ", "d"],
    ["ޒ", "z"],
    ["ޓ", "t"],
    ["ޔ", "y"],
    ["ޕ", "p"],
    ["ޖ", "j"],
    ["ޗ", "ch"],
    ["ޙ", "h"],
    ["ޚ", "kh"],
    ["ޛ‎", "z"],
    ["ޜ‎", "z"],
    ["ޝ‎", "sh"],
    ["ޝ", "sh"],
    ["ޤ", "q"],
    ["ޢ", "a"],
    ["ޞ", "s"],
    ["ޟ", "dh"],
    ["ޡ", "z"],
    ["ޠ", "t"],
    ["ާާޣ", "gh"],
    ["ޘ", "th"],
    ["ޛ", "dh"],
    ["ާާޜ", "z"],
  ];

  function transliterateDhivehi(input) {
    let output = input;

    // Remove zero-width characters
    output = output.replace(/[\u200B-\u200D\uFEFF]/g, "");

    // Apply transliteration
    for (const [dhivehi, english] of transliterationMappings) {
      output = output.replace(new RegExp(dhivehi, "g"), english);
    }

    // Capitalize first letter of each sentence
    output = output.replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());

    return output;
  }

  document
    .getElementById("transliterateDvToEn")
    .addEventListener("click", () => {
      scrollToTop();
      //
      textArea.value = transliterateDhivehi(textArea.value);
      ltrSwitch();
      updateStats();
    });
  //

  // Arabic to Dhivehi transliteration mapping
  // use an array of key-value pairs instead otherwise there might be issues with Unicode characters in the object literal
  const arabicToDhivehiMap = [
    // Remove kashida (tatweel)
    ["ـ", ""],
    // letters
    ["آ", "އާ"],
    ["ب", "ބ"],
    ["ت", "ތ"],
    ["ث", "ޘ"],
    ["ج", "ޖ"],
    ["ح", "ޙ"],
    ["خ", "ޚ"],
    ["د", "ދ"],
    ["ذ", "ޛ"],
    ["ر", "ރ"],
    ["ز", "ޒ"],
    ["س", "ސ"],
    ["ش", "ޝ"],
    ["ص", "ޞ"],
    ["ض", "ޟ"],
    ["ط", "ޠ"],
    ["ظ", "ޡ"],
    ["ع", "ޢ"],
    ["غ", "ޣ"],
    ["ف", "ފ"],
    ["ق", "ޤ"],
    ["ك", "ކ"],
    ["ل", "ލ"],
    ["م", "މ"],
    ["ن", "ނ"],
    ["ه", "ހ"],
    ["و", "ވ"],
    ["ي", "ޔ"],
    ["ة", "ތ"],
    // added additional Arabic characters
    ["ء", "އ"],
    ["أ", "އ"],
    ["ؤ", "އ"],
    ["إ", "އ"],
    ["ئ", "އ"],
    ["ى", "އ"],
    // Harakat (diacritical marks)
    ["َ", "ަ"], // fatha
    ["ِ", "ި"], // kasra
    ["ُ", "ު"], // damma
    ["ْ", "ް"], // sukun
    // Tanwin (nunation)
    ["ً", "ަން"], // tanwin fath
    ["ٍ", "ިން"], // tanwin kasr
    ["ٌ", "ުން"], // tanwin damm
    // words / multiple chars
    // alif laam
    ["ަا", "ާ"],
    ["اލ", "ލ"],
    //
    ["ލއްލަހ", "ﷲ"],
    ["ލލހ", "ﷲ"],
    // އިއްނަމާ ލއަޢްމާލު
    //["ާ ލ", "ަ ލ"],
    // ބިލއްނިއްޔާތި
    ["ލއް", "އް"],
    // ބިހަޛާ އްލަފްޡި
    ["ާ އްލަ", "ަ އްލަ"],
    //
    // ލިކުއްލި اމްރިއިން
    ["ا", ""],
    // ރަސުވލަ
    ["ުވ", "ޫ"],
    // އަތައ އްނަބިއްޔަ
    ["އ އް", " އް"],
    // ވައަބޫ ލޙުސަޔްނި
    ["ޫ ލ", "ު ލ"],
    // ޞަޙިޔޙަޔްހިމާ އްލަލޛަޔްނި
    ["އްލަލ", "އްލަ"],
    // other chars
    ["«", '"'],
    ["»", '"'],
    /*
    ["", ""],
    */
  ];

  function transliterateArabicToDhivehi(text) {
    let result = text;

    /*
    i also want the following:

when there is a ّ  character that comes after an arabic character, the output should provide a އް character before the mapped converted character that comes before it, so the outputs for the following inputs should be:                    خَطَّا;                    ޚައްޠާ;                    خَطِّي;                    ޚައްޠީ;                    خَطُّوبِ;                    ޚައްޠޫ;                    i want you to do this for this character in the code: ة if any arabic diactric apart from ْ  comes after that ة, then that ة should be replaced with a ތ, else it should be replaced by a ހ
 */

    // Handle shadda (gemination)
    //result = result.replace(/(.)\u0651/g, (match, p1) => {
    result = result.replace(/(.)ّ/g, (match, p1) => {
      // Find the Dhivehi equivalent of the Arabic character
      const dhivehiChar =
        arabicToDhivehiMap.find(([ar]) => ar === p1)?.[1] || p1;
      // Add 'އް' before the Dhivehi character to represent gemination
      return `އް${dhivehiChar}`;
    });

    // Handle taa marbuta
    // Replace with 'ތ' if followed by a diacritic (except sukun)
    result = result.replace(/ة([َِ ُ ً ٍ ٌ])/g, "ތ$1");
    // Replace with 'ހ' in all other cases
    result = result.replace(/ة(?![َِ ُ ً ٍ ٌ])/g, "ހ");

    // Apply other transliterations
    for (const [arabic, dhivehi] of arabicToDhivehiMap) {
      result = result.replace(new RegExp(arabic, "g"), dhivehi);
    }

    return result;
  }

  // Add event listener for the new button
  document
    .getElementById("transliterateArToDv")
    .addEventListener("click", () => {
      scrollToTop();
      //
      textArea.value = transliterateArabicToDhivehi(textArea.value);
      updateStats();
    });
  //

  // https://github.com/ahmedmaazin/number-to-thaana/blob/master/src/NumberToThaana.php
  // which itself is based on https://github.com/Sofwath/NumberToThaana
  // an alternative could have been https://github.com/dhivehi/DhivehiMVR_excel, but it seems closed s
  class NumberToDhivehi {
    constructor() {
      this.ehbari = [
        "ސުމެއް",
        "އެއް",
        "ދެ",
        "ތިން",
        "ހަތަރު",
        "ފަސް",
        "ހަ",
        "ހަތް",
        "އަށް",
        "ނުވަ",
        "ދިހަ",
        "އެގާރަ",
        "ބާރަ",
        "ތޭރަ",
        "ސާދަ",
        "ފަނަރަ",
        "ސޯޅަ",
        "ސަތާރަ",
        "އަށާރަ",
        "ނަވާރަ",
        "ވިހި",
        "އެކާވީސް",
        "ބާވީސް",
        "ތޭވީސް",
        "ސައުވީސް",
        "ފަންސަވީސް",
        "ސައްބީސް",
        "ހަތާވީސް",
        "އަށާވީސް",
        "ނަވާވީސް",
      ];
      this.dhihabari = [
        "ސުން",
        "ދިހަ",
        "ވިހި",
        "ތިރީސް",
        "ސާޅީސް",
        "ފަންސާސް",
        "ފަސްދޮޅަސް",
        "ހައްދިހަ",
        "އައްޑިހަ",
        "ނުވަދިހަ",
      ];
      this.sunbari = ["", "ހާސް", "މިލިޔަން", "ބިލިޔަން", "ޓްރިލިޔަން"];
    }

    convert(number) {
      if (!number) return null;

      number = parseInt(number);

      if (number < 1000) {
        return this.thousandSub(number);
      } else {
        return this.thousandUp(number);
      }
    }

    thousandSub(number) {
      let hundred = "ސަތޭކަ ";

      if (number <= 0 || number <= 29) {
        return this.ehbari[number];
      } else if (number <= 99) {
        const tens = Math.floor(number / 10);
        const ones = number % 10;
        if (ones === 0) {
          return this.dhihabari[tens];
        } else {
          return `${this.dhihabari[tens]} ${this.ehbari[ones]}`;
        }
      } else if (number <= 999) {
        const rem = number % 100;
        const dig = Math.floor(number / 100);

        if (dig === 2) {
          this.ehbari[2] = "ދުވި";
          hundred = "ސައްތަ ";
        }
        // added spaces before ${hundred}
        if (rem === 0) {
          return `${this.ehbari[dig]} ${hundred}`;
        } else {
          return `${this.ehbari[dig]} ${hundred}${this.thousandSub(rem)}`;
        }
      }

      return "";
    }

    thousandHalf(number) {
      const thousandArray = [];
      while (number !== 0) {
        thousandArray.push(number % 1000);
        number = Math.floor(number / 1000);
      }
      return thousandArray;
    }

    thousandUp(number) {
      const thousandHalfArray = this.thousandHalf(number);
      let thousandHalfArrayLength = thousandHalfArray.length - 1;
      const responseArray = [];

      for (const value of thousandHalfArray.reverse()) {
        let word = `${this.thousandSub(value)} `;
        let zap = `${this.sunbari[thousandHalfArrayLength]} `;

        if (word === " ") {
          break;
        } else if (word === "ސުން " || word === "ސުމެއް ") {
          word = "";
          zap = "";
        }

        responseArray.push(word + zap);
        thousandHalfArrayLength -= 1;
      }

      let response = responseArray.join("");

      if (response.endsWith(",")) {
        response = response.slice(0, -1);
      }

      return response.trim();
    }
  }

  // Usage
  const converter = new NumberToDhivehi();

  document.getElementById("Nos2DvTxt").addEventListener("click", () => {
    scrollToTop();
    //
    /*
this code joins new lines with comma, instead of keeping them as they are

i want commas when the a sequence of numbers are on the same line

like
123
456 789
101112

should give
one hundred twenty-three
four hundred fifty-six, seven hundred eighty-nine
one hundred one thousand one hundred twelve

i dont want output to have multiple spaces
    */
    const lines = textArea.value.split("\n");
    const convertedLines = lines.map((line) => {
      const numbers = line.match(/\d+/g);
      if (numbers) {
        return numbers
          .map((num) => converter.convert(num).replace(/\s+/g, " ").trim())
          .join("، ");
      }
      return line.trim(); // Trim any whitespace from lines without numbers
    });
    textArea.value = convertedLines
      .filter((line) => line.length > 0)
      .join("\n");

    /*const numbers = textArea.value.match(/\d+/g);
    if (numbers) {
      const convertedText = numbers
        .map((num) => converter.convert(num))
        .join(", ");
      textArea.value = convertedText;
    }*/
    updateStats(); // Assuming this function exists in your code
  });
  //

  /*
  when this button is clicked
i want to find all instances of diacritics which are repeated, in the sense that a diacritic is immediately followed by another unwanted diacritic.
the Dhivehi diacritic Unicode block is u07a6-u07b0
the Arabic diacritic Unicode block is made up of several parts like
u064b-u0650
after which is u0651 which is a shadda
which is then followed by u0652-u0656
as for the shadda, it can be followed by either u064e or u064f or u0650, which are the fatha damma and kasra, but the shadda cannot be followed by other diacritics, or even another shadda
now once these instances are found
i want a div to show under the button, which had initially display none. this div will show line by line the words where repeated diacritics occurred. in each instance, i want to see the word with repeated instance, as well as the word before and after it. but only the word with repeated instance should be blue, after which should be a new line containing the next such instance with repeated diacritics

i also want these lines of occurences to be numbered followed by a space, like
1. 2. 3.

i also want, after the 3 words shown with the middle word being the instance, i want a space after the 3 words, then a colon :, then another spaces, then i want the repeated diacritic and the diacritic and letter character before it, with a space between the repeat diacritic and the diacritic before it, all in red color after the colon

example:
1. ބިން ޢުމަރު رَضِيَ  :  ރު ި
2. اللَّهُ عََنْهُ ގެ : عَ َ
3. ގެ އަރިަހުން ރިވާވެގެންވެއެވެ. : ރި ަ

i also want it to find and show:
Letters not followed diacritics in Dhivehi
the Dhivehi letters Unicode block is: u0780-u07a5
but its okay if character u0782 is not followed by a diacritic

I also want to find and show: Diacritics without letters in both Arabic and Dhivehi
remember that a shadda can be followed by a fatha damma kasra

if a standalone issue is followed by a multiple issue, it should be shown as just a multiple issue, not a standalone and multiple issue

it shows the diacritic with issue, with the diacritic without issue before it
what i want is, i want the letter before the diacritic without issue to also show, followed by a space, followed by the diacritic with issue

i also want another space after the issue description

currently it gives:
1. عَنِْ عَبْدِ : Multiple Fili: ن ِْ
2. قَالَ ِ رَسُولُ : Standalone Fili: ِ
3. رَسُولُ اللَّهَِ ﷺ : Multiple Fili: ه َِ
4. ﷺ ޢަބްދ ﷲ : Thaana without Fili: ް ދ
5. ބިން ު ޢުމަރު : Standalone Fili: ު
6. އަރިހުން ރިަވާވެގެންވެއެވެ. ރަސޫލު : Multiple Fili: ރ ިަ
7. ﷺ ޙަދީޘްކުރެއްވިއެިވެ : Multiple Fili: އ ެި

when it should be giving:
1. عَنِْ عَبْدِ : Multiple Fili :  نْ ِ
2. قَالَ ِ رَسُولُ : Standalone Fili :  لَ  ِ 
3. رَسُولُ اللَّهَِ ﷺ : Multiple Fili:  هِ َ
4. ﷺ ޢަބްދ ﷲ : Thaana without Fili :  ް ދ
5. ބިން ު ޢުމަރު : Standalone Fili :  ން ު
6. އަރިހުން ރިަވާވެގެންވެއެވެ. ރަސޫލު : Multiple Fili :  ރި ަ
7. ﷺ ޙަދީޘްކުރެއްވިއެިވެ : Multiple Fili :  އެ ި

i want one more space after the colon that comes after the issue description

  */

  const resultsDiv = document.getElementById("filiIssuesResults");

  document.getElementById("findFiliIssues").addEventListener("click", () => {
    const text = textArea.value;
    const results = findIssues(text);
    displayResults(results);
  });

  function findIssues(text) {
    const dhivehiDiacritics = /[\u07a6-\u07b0]/;
    const arabicDiacritics = /[\u064b-\u0650\u0652-\u0656]/;
    const dhivehiLetters = /[\u0780-\u07a5]/;
    const shadda = "\u0651";
    const allowedAfterShadda = /[\u064e\u064f\u0650]/;

    const words = text.split(/\s+/);
    const results = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let issues = [];

      for (let j = 0; j < word.length; j++) {
        const current = word[j];
        const next = word[j + 1] || "";
        const prev = word[j - 1] || "";

        // Check for multiple diacritics
        if (
          (dhivehiDiacritics.test(current) && dhivehiDiacritics.test(next)) ||
          (arabicDiacritics.test(current) && arabicDiacritics.test(next)) ||
          (current === shadda && next === shadda)
        ) {
          // If the previous issue was a standalone, remove it and replace with this multiple
          if (
            issues.length > 0 &&
            issues[issues.length - 1].type === "standalone" &&
            issues[issues.length - 1].index === j - 1
          ) {
            issues.pop();
          }
          issues.push({ type: "multiple", index: j });
          j++; // Skip the next character as it's part of this multiple issue
          continue;
        }

        // Check for Dhivehi letters not followed by diacritics (except u0782)
        if (
          dhivehiLetters.test(current) &&
          current !== "\u0782" &&
          !dhivehiDiacritics.test(next)
        ) {
          issues.push({ type: "noDvFili", index: j });
        }

        // Check for standalone diacritics
        if (
          (dhivehiDiacritics.test(current) ||
            arabicDiacritics.test(current) ||
            current === shadda) &&
          !dhivehiLetters.test(prev) &&
          !/[\u0600-\u06FF]/.test(prev)
        ) {
          // Special case for shadda
          if (current === shadda && allowedAfterShadda.test(next)) {
            continue;
          }

          issues.push({ type: "standalone", index: j });
        }
      }

      if (issues.length > 0) {
        results.push({
          word,
          index: i,
          issues,
        });
      }
    }

    return results;
  }

  function displayResults(results) {
    // Check if any issues were found
    if (results.length === 0) {
      resultsDiv.innerHTML = "No issues found.";
      resultsDiv.style.display = "block";
      return;
    }

    // Calculate total number of issues
    const totalIssues = results.reduce(
      (sum, result) => sum + result.issues.length,
      0
    );

    // Split the input text into words
    const words = textArea.value.split(/\s+/);
    let html = `Found ${totalIssues} issue${totalIssues > 1 ? "s" : ""}<br>`; // :<br><br>

    // Iterate through each result (word with issues)
    results.forEach((result, index) => {
      // Get the words before and after the current word for context
      const prevWord = words[result.index - 1] || "";
      const nextWord = words[result.index + 1] || "";

      // Process each issue in the current word
      let issueDescriptions = result.issues
        .map((issue) => {
          let chars;
          // Handle different types of issues
          if (issue.type === "multiple") {
            // For multiple Fili, show the base character and both diacritics
            const baseChar = result.word[issue.index - 1] || "";
            const firstDiacritic = result.word[issue.index];
            const secondDiacritic = result.word[issue.index + 1];
            chars = `${baseChar}${firstDiacritic} ${secondDiacritic}`;
          } else if (issue.type === "standalone") {
            // For standalone Fili, show the base character and the diacritic
            const baseChar = result.word[issue.index - 1] || "";
            const diacritic = result.word[issue.index];
            chars = `${baseChar} ${diacritic}`;
          } else {
            // noDvFili
            // For Thaana without Fili, show the previous character and the current one
            const prevChar = result.word[issue.index - 1] || "";
            chars = `${prevChar} ${result.word[issue.index]}`;
          }

          // Create the description string based on the issue type
          let description;
          switch (issue.type) {
            case "multiple":
              description = `Multiple Fili :&nbsp; ${chars}`;
              break;
            case "noDvFili":
              description = `Thaana w/o Fili :&nbsp; ${chars}`;
              break;
            case "standalone":
              description = `Standalone Fili :&nbsp; ${chars}`;
              break;
          }
          return description;
        })
        .join(", ");

      // Construct the HTML for this result
      // Include the index, previous word, the word with issues (in blue), next word,
      // and the issue descriptions (in red)
      // Construct the HTML for this result
      html += `${index + 1}. ${prevWord} <span style="color: blue;">${
        result.word
      }</span> ${nextWord} : <span style="color: red;">${issueDescriptions}</span><br>`;
    });

    // Update the results div with the generated HTML and make it visible
    resultsDiv.innerHTML = html;
    resultsDiv.style.display = "block";
  }
  //

  document.getElementById("removePunctuation").addEventListener("click", () => {
    scrollToTop();
    //
    textArea.value = textArea.value.replace(/[^\w\s]/g, "");
    updateStats();
  });
  //

  document.getElementById("numerateWords").addEventListener("click", () => {
    const textArea = document.getElementById("textArea");
    const isNumberToWords = document
      .getElementById("numerateWords")
      .textContent.includes("No → Wrd");

    if (isNumberToWords) {
      // Convert numbers to words and "%" to "percent"
      textArea.value = textArea.value
        .replace(/\b\d+\b/g, (match) => numberToWords(parseInt(match))) // Numbers to words
        .replace(/%/g, "percent"); // % to percent
      document.getElementById("numerateWords").textContent = "Wrd → No";
    } else {
      // Convert words to numbers and "percent" to "%"
      textArea.value = textArea.value
        .replace(/\b(?:\w+(?:-\w+)*)\b/g, (match) =>
          wordToNumber(match.toLowerCase())
        ) // Words to numbers
        .replace(/\bpercent\b/g, "%"); // Only "percent" to "%"
      document.getElementById("numerateWords").textContent = "No → Wrd";
    }

    updateStats();
  });

  // Helper: Convert numbers to words
  function numberToWords(num) {
    const ones = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
    ];
    const tens = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];
    const teens = [
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];

    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      const remainder = num % 10;
      return (
        tens[Math.floor(num / 10)] + (remainder ? `-${ones[remainder]}` : "")
      );
    }
    return num; // Extend for larger numbers if needed
  }

  // Helper: Convert words to numbers
  function wordToNumber(word) {
    const wordsToNumbers = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
      eleven: 11,
      twelve: 12,
      thirteen: 13,
      fourteen: 14,
      fifteen: 15,
      sixteen: 16,
      seventeen: 17,
      eighteen: 18,
      nineteen: 19,
      twenty: 20,
      thirty: 30,
      forty: 40,
      fifty: 50,
      sixty: 60,
      seventy: 70,
      eighty: 80,
      ninety: 90,
      hundred: 100,
    };

    // Handle hyphenated numbers
    if (word.includes("-")) {
      const parts = word.split("-");
      const tens = wordsToNumbers[parts[0]] || 0;
      const ones = wordsToNumbers[parts[1]] || 0;
      return tens + ones;
    }

    // Handle single-word numbers
    return wordsToNumbers[word] || word;
  }
  //

  /*
two input boxes next to this button, saying "Find" and "Replace" as placeholders, which lets the user input characters, after which, clicking on the button will find and replace the characters from every line of text according to the input
  */

  const findInput = document.getElementById("findInput");
  const replaceInput = document.getElementById("replaceInput");

  document
    .getElementById("findAndReplaceText")
    .addEventListener("click", () => {
      const findText = findInput.value;
      const replaceText = replaceInput.value;

      if (findText) {
        // Create a regular expression for global case-sensitive search
        const regex = new RegExp(escapeRegExp(findText), "g");

        // Perform the find and replace operation
        textArea.value = textArea.value.replace(regex, replaceText);

        updateStats();
      }
    });

  // Function to escape special characters in the search string
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  //

  //
  //

  document.getElementById("diffCompare").addEventListener("click", () => {
    window.open("diffCompare.html", "_blank");
  });

  document.getElementById("keyboardPage").addEventListener("click", () => {
    window.open("keyboardPage.html", "_blank");
  });

  document.getElementById("qrGenerator").addEventListener("click", () => {
    window.open("qrGenerator.html", "_blank");
  });
  //

  document.getElementById("fullscreen").addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      textArea.style.height = "100vh";
    } else {
      document.exitFullscreen();
      textArea.style.height = "300px";
    }
  });
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      textArea.style.height = "300px";
    }
  });

  //
  // BUTTON FUNCTIONS END
  //

  // NEW DATE TIME CODE
  function updateDateTimeButtons() {
    const now = new Date();
    const isMilitaryTime = localStorage.getItem("militaryTime") === "true";
    const hours12 = now.getHours() % 12 || 12;
    const hours24 = String(now.getHours()).padStart(2, "0");
    const hours = isMilitaryTime ? hours24 : hours12;
    const ampm = now.getHours() >= 12 ? "PM" : "AM";
    const timeStr = isMilitaryTime
      ? `${hours}:${String(now.getMinutes()).padStart(2, "0")}`
      : `${hours}:${String(now.getMinutes()).padStart(2, "0")} ${ampm}`;

    // Gregorian Long English
    const enOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    let enDate = now.toLocaleDateString("en-GB", enOptions);
    // Add comma after weekday and fix day suffix
    enDate = enDate.replace(/^(\w+)\s+(\d+)/, (_, weekday, day) => {
      const suffix = ["th", "st", "nd", "rd"][day % 10 > 3 ? 0 : day % 10];
      return `${weekday}, ${day}${suffix}`;
    });

    document.getElementById("gregorianLongEn").textContent = `${enDate}, at ${
      isMilitaryTime ? hours24 : hours12
    }:${String(now.getMinutes()).padStart(2, "0")}${
      isMilitaryTime ? "" : " " + ampm
    }`;

    // Gregorian Long Dhivehi
    const dvWeekdays = [
      "އާދީއްތަ",
      "ހޯމަ",
      "އަންގާރަ",
      "ބުދަ",
      "ބުރާސްފަތި",
      "ހުކުރު",
      "ހޮނިހިރު",
    ];
    const dvMonths = [
      "ޖަނަވަރީ",
      "ފެބުރުވަރީ",
      "މާރިޗު",
      "އެޕްރީލް",
      "މޭ",
      "ޖޫން",
      "ޖުލައި",
      "އޮގަސްޓު",
      "ސެޕްޓެންބަރު",
      "އޮކްޓޫބަރު",
      "ނޮވެންބަރު",
      "ޑިސެންބަރު",
    ];

    const dvAmPm = isMilitaryTime
      ? ""
      : now.getHours() >= 12
      ? "މެނދުރުފަސް"
      : "މެނދުރުކުރި";
    const dvDate = `${dvWeekdays[now.getDay()]}، ${now.getDate()} ${
      dvMonths[now.getMonth()]
    } ${now.getFullYear()}، ${hours}:${String(now.getMinutes()).padStart(
      2,
      "0"
    )}${isMilitaryTime ? "" : " " + dvAmPm}`;

    document.getElementById("gregorianLongDv").textContent = dvDate;

    // Gregorian Long Arabic
    const arOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    let arDate = now.toLocaleDateString("ar", {
      ...arOptions,
      hour12: !isMilitaryTime,
    });

    arDate = arDate
      .replace(/(\d{4})\s*،?\s*في/, "$1، في")
      .replace(/\s+،/g, "،")
      .replace(
        /\d{1,2}:\d{2}\s*[صم]/,
        `${isMilitaryTime ? hours24 : hours12}:${String(
          now.getMinutes()
        ).padStart(2, "0")}${
          isMilitaryTime ? "" : now.getHours() >= 12 ? " م" : " ص"
        }`
      );
    document.getElementById("gregorianLongAr").textContent = arDate;

    // Hijri dates
    try {
      // Single mapping for Hijri months
      const hijriMonths = {
        محرم: ["Muharram", "މުޙައްރަމް"],
        صفر: ["Safar", "ޞަފަރު"],
        "ربيع الأول": ["Rabi' al-Awwal", "ރަބީޢުލްއައްވަލް"],
        "ربيع الآخر": ["Rabi' ath-Thani", "ރަބީޢުލްއާޚިރު"],
        "جمادى الأولى": ["Jumada al-Awwal", "ޖުމާދަލްއޫލާ"],
        "جمادى الآخرة": ["Jumada ath-Thani", "ޖުމާދަލްއާޚިރާ"],
        رجب: ["Rajab", "ރަޖަބު"],
        شعبان: ["Sha'ban", "ޝަޢުބާން"],
        رمضان: ["Ramadan", "ރަމަޟާން"],
        شوال: ["Shawwal", "ޝައްވާލް"],
        "ذو القعدة": ["Dhul-Qa'dah", "ޛުލްގަޢިދާ"],
        "ذو الحجة": ["Dhul-Hijjah", "ޛުލްޙިއްޖާ"],
      };

      const toEnglish = (arMonth) => hijriMonths[arMonth]?.[0] || arMonth;
      const toDhivehi = (arMonth) => hijriMonths[arMonth]?.[1] || arMonth;

      // Hijri Long Arabic
      const hijriArDate = new Intl.DateTimeFormat("ar-TN-u-ca-islamic", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        calendar: "islamic",
      }).format(now);

      const arTime = `، في ${isMilitaryTime ? hours24 : hours12}:${String(
        now.getMinutes()
      ).padStart(2, "0")}${
        isMilitaryTime ? "" : now.getHours() >= 12 ? " م" : " ص"
      }`;

      document.getElementById("hijriLongAr").textContent =
        hijriArDate
          .replace(/هـ/, "")
          .replace(/\s+،/g, "،")
          .replace(/\s+$/, "") + arTime;

      // Hijri Long English & Dhivehi
      // using en-u-ca-islamic messes up the calendar months on mobile, for some reason that shows as gregorian, so instead used actual arabic month names
      const hijriParts = new Intl.DateTimeFormat("ar-u-ca-islamic-umalqura", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        calendar: "islamic",
      }).formatToParts(now);

      //  weekday mapping
      const weekdayMap = {
        الأحد: "Sunday",
        الاثنين: "Monday",
        الثلاثاء: "Tuesday",
        الأربعاء: "Wednesday",
        الخميس: "Thursday",
        الجمعة: "Friday",
        السبت: "Saturday",
      };

      // Update the hijriParts section
      let enWeekday, enDay, enMonth, enYear;
      hijriParts.forEach((part) => {
        if (part.type === "weekday")
          enWeekday = weekdayMap[part.value] || part.value;
        if (part.type === "day") enDay = part.value;
        if (part.type === "month") enMonth = toEnglish(part.value);
        if (part.type === "year") enYear = part.value;
      });

      document.getElementById(
        "hijriLongEn"
      ).textContent = `${enWeekday}, ${parseInt(
        enDay
      )} ${enMonth} ${enYear} AH, at ${
        isMilitaryTime ? hours24 : hours12
      }:${String(now.getMinutes()).padStart(2, "0")}${
        isMilitaryTime ? "" : " " + ampm
      }`;

      let dvDay, dvMonth, dvYear;
      hijriParts.forEach((part) => {
        if (part.type === "day") dvDay = part.value;
        if (part.type === "month") dvMonth = toDhivehi(part.value);
        if (part.type === "year") dvYear = part.value;
      });

      document.getElementById("hijriLongDv").textContent = `${
        dvWeekdays[now.getDay()]
      }، ${parseInt(dvDay)} ${dvMonth} ${dvYear}، ${
        isMilitaryTime ? hours24 : hours12
      }:${String(now.getMinutes()).padStart(2, "0")}${
        isMilitaryTime ? "" : " " + dvAmPm
      }`;

      // Hijri Short
      const hijriShortDate = new Intl.DateTimeFormat("en-u-ca-islamic", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        calendar: "islamic",
      })
        .format(now)
        .replace(/[^0-9/]/g, "");

      document.getElementById("hijriShort").textContent = `${hijriShortDate} ${
        isMilitaryTime ? hours24 : hours12
      }:${String(now.getMinutes()).padStart(2, "0")}${
        isMilitaryTime ? "" : " " + ampm
      }`;
    } catch (e) {
      console.error("Error formatting Hijri dates:", e);
      ["hijriLongAr", "hijriLongEn", "hijriLongDv", "hijriShort"].forEach(
        (id) => {
          document.getElementById(id).textContent = "Hijri date unavailable";
        }
      );
    }

    // Gregorian Short
    document.getElementById("gregorianShort").textContent = `${String(
      now.getDate()
    ).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}/${now.getFullYear()} ${isMilitaryTime ? hours24 : hours12}:${String(
      now.getMinutes()
    ).padStart(2, "0")}${isMilitaryTime ? "" : " " + ampm}`;
  }

  // Update button texts every minute
  updateDateTimeButtons();
  setInterval(updateDateTimeButtons, 60000);

  // Toggle military time
  document
    .getElementById("toggleMilitaryTime")
    .addEventListener("click", () => {
      const currentSetting = localStorage.getItem("militaryTime") === "true";
      localStorage.setItem("militaryTime", !currentSetting);
      updateDateTimeButtons();
    });

  // OLD DATE TIME CODE
  // document.getElementById("getDateTime").addEventListener("click", function () {
  //   const now = new Date();
  //   const day = now.getDate();
  //   const month = now.getMonth() + 1; // getMonth() returns 0-11, so we add 1
  //   const year = now.getFullYear();
  //   const time = now.toLocaleTimeString();
  //   const dateTimeString = `${day}/${month}/${year} ${time}`;
  //   navigator.clipboard.writeText(dateTimeString);
  // });

  //
  // COPY FUNCTIONS END
  //

  // Text expander
  textArea.addEventListener("input", (e) => {
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = e.target.value.substring(0, cursorPosition);
    const lastWord = textBeforeCursor.split(/\s/).pop();

    if (lastWord === "ss-") {
      const newText =
        textBeforeCursor.replace(/ss-$/, "ﷺ") +
        e.target.value.substring(cursorPosition);
      e.target.value = newText;
      e.target.setSelectionRange(cursorPosition, cursorPosition);
    }

    // !!! complete
  });

  //

  // Copy functionality for the Copy tab

  // Copy this elsewhere if needed. currently in textEditor.js and index.html
  // Copy functionality for copy-specific buttons
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

  //

  //

  // Load saved content
  const savedTabs = JSON.parse(localStorage.getItem("editorTabs"));
  if (savedTabs) {
    tabs = savedTabs;
    tabs.forEach((tab) => {
      if (tab.id > 1) {
        const newTab = document.createElement("button");
        newTab.classList.add("numbered-tab");
        newTab.dataset.tab = tab.id;
        newTab.textContent = tab.id;
        numberedTabs.insertBefore(newTab, addTabButton);
      }
    });
    switchTab(parseInt(localStorage.getItem("currentTab")) || 1);
  }

  // Save content periodically
  setInterval(() => {
    tabs[currentTab - 1].content = textArea.value;
    localStorage.setItem("editorTabs", JSON.stringify(tabs));
    localStorage.setItem("currentTab", currentTab);
  }, 5000);

  // Initial update
  updateStats();

  // =====================================================

  // Calculator tab functionality
  const calcArea = document.getElementById("calcArea");
  const addCalcTabButton = document.getElementById("addCalcTab");
  const calcNumberedTabs = document.querySelector(".calc-numbered-tabs");

  // Check if calculator elements exist before adding functionality
  if (calcArea && addCalcTabButton && calcNumberedTabs) {
    let currentCalcTab = 1;
    let calcTabs = [{ id: 1, content: "" }];

    const sumTotalDisplay = document.getElementById("sumTotal");
    const zakatDisplay = document.getElementById("zakatAmount");
    const lineResults = document.getElementById("lineResults");
    const copyTotalBtn = document.getElementById("copyTotal");
    const clearCalcBtn = document.getElementById("clearCalc");

    function calculateLine(line) {
      const numberPattern = /[+-]?\d*\.?\d+(?:,\d{3})*(?:\d*\.?\d+)?/g;
      const operatorPattern = /[\+\-\*x\/÷]/g;

      let numbers = line.match(numberPattern) || [];
      let operators = line.match(operatorPattern) || [];

      // Convert comma-formatted numbers and handle explicit negative numbers
      numbers = numbers.map((n) => {
        // First remove commas, then parse as float
        return parseFloat(n.replace(/,/g, ""));
      });

      // Process multiplication and division first
      for (let i = 0; i < operators.length; i++) {
        if (
          operators[i] === "*" ||
          operators[i] === "x" ||
          operators[i] === "/" ||
          operators[i] === "÷"
        ) {
          const result =
            operators[i] === "*" || operators[i] === "x"
              ? numbers[i] * numbers[i + 1]
              : numbers[i] / numbers[i + 1];
          numbers.splice(i, 2, result);
          operators.splice(i, 1);
          i--;
        }
      }

      // Then process addition and subtraction
      // Start with the first number and add/subtract the rest
      return numbers.reduce((sum, num) => sum + num, 0);
    }

    function updateCalculations() {
      const lines = calcArea.value.split("\n");
      let runningTotal = 0;
      let lineResultsText = "";

      lines.forEach((line) => {
        const lineTotal = calculateLine(line);
        runningTotal += lineTotal;
        // Format the running total with 2 decimal places
        lineResultsText += `${runningTotal.toFixed(2)}\n`;
      });

      sumTotalDisplay.textContent = runningTotal.toFixed(2);
      zakatDisplay.textContent = (runningTotal * 0.025).toFixed(2);
      lineResults.textContent = lineResultsText;
    }

    // Add new calculation tab
    addCalcTabButton.addEventListener("click", () => {
      const newTabId = calcTabs.length + 1;
      calcTabs.push({ id: newTabId, content: "" });

      const newTab = document.createElement("button");
      newTab.classList.add("calc-numbered-tab");
      newTab.dataset.tab = newTabId;
      newTab.textContent = newTabId;

      calcNumberedTabs.insertBefore(newTab, addCalcTabButton);
      switchCalcTab(newTabId);
    });

    // Switch between calculation tabs
    calcNumberedTabs.addEventListener("click", (e) => {
      if (e.target.classList.contains("calc-numbered-tab")) {
        const tabId = parseInt(e.target.dataset.tab);
        switchCalcTab(tabId);
      }
    });

    function switchCalcTab(tabId) {
      calcTabs[currentCalcTab - 1].content = calcArea.value;
      currentCalcTab = tabId;
      calcArea.value = calcTabs[currentCalcTab - 1].content;

      document.querySelectorAll(".calc-numbered-tab").forEach((tab) => {
        tab.classList.toggle("active", parseInt(tab.dataset.tab) === tabId);
      });

      updateCalculations(); // Add this line to update calculations when switching tabs
    }

    calcArea.addEventListener("input", updateCalculations);

    copyTotalBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(sumTotalDisplay.textContent);
      showButtonFeedback(copyTotalBtn, "Copied");
    });

    clearCalcBtn.addEventListener("click", () => {
      // Clear the current tab's content
      calcArea.value = "";
      lineResults.textContent = "";
      sumTotalDisplay.textContent = "0.00";
      zakatDisplay.textContent = "0.00";

      // Reset to single tab
      calcTabs = [{ id: 1, content: "" }];
      currentCalcTab = 1;

      // Clear all tabs except the first one
      const tabButtons =
        calcNumberedTabs.querySelectorAll(".calc-numbered-tab");
      tabButtons.forEach((button) => {
        if (button.dataset.tab !== "1") {
          button.remove();
        }
      });

      // Make sure first tab is active
      tabButtons[0].classList.add("active");

      showButtonFeedback(clearCalcBtn, "Cleared");
    });

    // Load saved calculator content
    const savedCalcTabs = JSON.parse(localStorage.getItem("calculatorTabs"));
    if (savedCalcTabs) {
      calcTabs = savedCalcTabs;
      calcTabs.forEach((tab) => {
        if (tab.id > 1) {
          const newTab = document.createElement("button");
          newTab.classList.add("calc-numbered-tab");
          newTab.dataset.tab = tab.id;
          newTab.textContent = tab.id;
          calcNumberedTabs.insertBefore(newTab, addCalcTabButton);
        }
      });
      switchCalcTab(parseInt(localStorage.getItem("currentCalcTab")) || 1);
    }

    // Save calculator content periodically
    setInterval(() => {
      calcTabs[currentCalcTab - 1].content = calcArea.value;
      localStorage.setItem("calculatorTabs", JSON.stringify(calcTabs));
      localStorage.setItem("currentCalcTab", currentCalcTab);
    }, 5000);
  }

  // =====================================================

  // Direct Proportion Calculator functionality
  const propContainer = document.querySelector(".proportion-container");
  const addPropTabButton = document.getElementById("addPropTab");
  const propNumberedTabs = document.querySelector(".prop-numbered-tabs");

  if (propContainer && addPropTabButton && propNumberedTabs) {
    let currentPropTab = 1;
    let propTabs = [{ id: 1, content: propContainer.innerHTML }];

    function updateProportions(set) {
      const inputs = set.querySelectorAll(".prop-input");

      // Count only actual input values (not placeholders)
      const filledInputs = Array.from(inputs).filter(
        (input) => input.value !== ""
      ).length;

      // Only calculate if at least 3 inputs have values
      if (filledInputs >= 3) {
        const firstX = inputs[0].value;
        const firstY = inputs[1].value;
        const secondX = inputs[2].value;

        // Only calculate if we have the necessary values
        if (firstX && firstY && secondX) {
          // Calculate k (constant of proportionality)
          const k = firstY / firstX;

          // Update second Y based on proportion
          inputs[3].value = (secondX * k).toFixed(2);
        }
      } else {
        // Clear the result if less than 3 inputs
        inputs[3].value = "";
      }
    }

    // Add event listeners to all input fields
    function setupInputListeners() {
      document.querySelectorAll(".proportion-set").forEach((set) => {
        set.querySelectorAll(".prop-input").forEach((input) => {
          input.addEventListener("input", () => updateProportions(set));
        });
      });
    }

    // Add new proportion tab
    addPropTabButton.addEventListener("click", () => {
      const newTabId = propTabs.length + 1;
      propTabs.push({ id: newTabId, content: propContainer.innerHTML });

      const newTab = document.createElement("button");
      newTab.classList.add("prop-numbered-tab");
      newTab.dataset.tab = newTabId;
      newTab.textContent = newTabId;

      propNumberedTabs.insertBefore(newTab, addPropTabButton);
      switchPropTab(newTabId);
    });

    // Switch between proportion tabs
    propNumberedTabs.addEventListener("click", (e) => {
      if (e.target.classList.contains("prop-numbered-tab")) {
        const tabId = parseInt(e.target.dataset.tab);
        switchPropTab(tabId);
      }
    });

    function switchPropTab(tabId) {
      propTabs[currentPropTab - 1].content = propContainer.innerHTML;
      currentPropTab = tabId;
      propContainer.innerHTML = propTabs[currentPropTab - 1].content;

      document.querySelectorAll(".prop-numbered-tab").forEach((tab) => {
        tab.classList.toggle("active", parseInt(tab.dataset.tab) === tabId);
      });

      setupInputListeners();
    }

    // Initialize input listeners
    setupInputListeners();

    // Load saved proportion content
    const savedPropTabs = JSON.parse(localStorage.getItem("proportionTabs"));
    if (savedPropTabs) {
      propTabs = savedPropTabs;
      propTabs.forEach((tab) => {
        if (tab.id > 1) {
          const newTab = document.createElement("button");
          newTab.classList.add("prop-numbered-tab");
          newTab.dataset.tab = tab.id;
          newTab.textContent = tab.id;
          propNumberedTabs.insertBefore(newTab, addPropTabButton);
        }
      });
      switchPropTab(parseInt(localStorage.getItem("currentPropTab")) || 1);
    }

    // Save content periodically
    setInterval(() => {
      propTabs[currentPropTab - 1].content = propContainer.innerHTML;
      localStorage.setItem("proportionTabs", JSON.stringify(propTabs));
      localStorage.setItem("currentPropTab", currentPropTab);
    }, 5000);

    // Add inside the if (propContainer && addPropTabButton && propNumberedTabs) block
    const clearPropBtn = document.getElementById("clearProp");

    clearPropBtn.addEventListener("click", () => {
      // Clear all proportion sets
      document.querySelectorAll(".proportion-set").forEach((set) => {
        const inputs = set.querySelectorAll(".prop-input");
        inputs.forEach((input, index) => {
          if (index === 2) {
            // Keep "1" only in the first input of the second row
            input.value = "1";
          } else {
            input.value = "";
          }
        });
      });

      // Reset to single tab
      propTabs = [{ id: 1, content: propContainer.innerHTML }];
      currentPropTab = 1;

      // Clear all tabs except the first one
      const tabButtons =
        propNumberedTabs.querySelectorAll(".prop-numbered-tab");
      tabButtons.forEach((button) => {
        if (button.dataset.tab !== "1") {
          button.remove();
        }
      });

      // Make sure first tab is active
      tabButtons[0].classList.add("active");

      showButtonFeedback(clearPropBtn, "Cleared");
    });
  }

  // =====================================================

  // Add after your existing event listeners

  // Add a new state variable near the top of your code
  let nightCalcMilitaryTime =
    localStorage.getItem("nightCalcMilitaryTime") === "true";

  // Night Calculator Functions
  function calculateNightTimes() {
    const maghribInput = document.getElementById("maghribTime");
    const fajrInput = document.getElementById("fajrTime");

    if (!maghribInput.value || !fajrInput.value) return;

    // Convert input times to minutes since midnight
    const maghribTime = timeToMinutes(maghribInput.value);
    let fajrTime = timeToMinutes(fajrInput.value);

    // If Fajr is before Maghrib, add 24 hours
    if (fajrTime < maghribTime) {
      fajrTime += 24 * 60;
    }

    // Calculate total night duration
    const nightDuration = fajrTime - maghribTime;
    // First third starts at Maghrib

    // Calculate various times
    const midnight = maghribTime + nightDuration / 2;
    const secondThird = maghribTime + nightDuration / 3; // Start of second third
    const lastThird = maghribTime + (2 * nightDuration) / 3; // Start of last third

    // Update display
    document.getElementById("midnightTime").textContent =
      minutesToTime(midnight);
    document.getElementById("secondThirdTime").textContent =
      minutesToTime(secondThird);
    document.getElementById("lastThirdTime").textContent =
      minutesToTime(lastThird);
  }

  function timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  }

  function minutesToTime(totalMinutes) {
    totalMinutes = Math.round(totalMinutes);
    // Handle overflow past midnight
    totalMinutes = totalMinutes % (24 * 60);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (nightCalcMilitaryTime) {
      // 24-hour format always shows leading zeros
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}`;
    } else {
      // 12-hour format without leading zeros for hours
      const period = hours >= 12 ? "PM" : "AM";
      const hours12 = hours % 12 || 12;
      // Don't pad hours with zeros, but still pad minutes
      return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
    }
  }

  // Add event listeners for the time inputs
  document
    .getElementById("maghribTime")
    .addEventListener("change", calculateNightTimes);
  document
    .getElementById("fajrTime")
    .addEventListener("change", calculateNightTimes);

  document
    .getElementById("toggleNightCalcFormat")
    .addEventListener("click", () => {
      nightCalcMilitaryTime = !nightCalcMilitaryTime;
      localStorage.setItem("nightCalcMilitaryTime", nightCalcMilitaryTime);
      calculateNightTimes(); // Recalculate to update display
    });

  // =====================================================

  // Utility functions
  const buff_to_base64 = (buff) =>
    btoa(
      new Uint8Array(buff).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

  const base64_to_buf = (b64) =>
    Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

  const enc = new TextEncoder();
  const dec = new TextDecoder();

  // Password key generation
  const getPasswordKey = (password) =>
    window.crypto.subtle.importKey(
      "raw",
      enc.encode(password || "empty"),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

  const deriveKey = (passwordKey, salt, keyUsage) =>
    window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 250000,
        hash: "SHA-256",
      },
      passwordKey,
      { name: "AES-GCM", length: 256 },
      false,
      keyUsage
    );

  // Encryption function
  async function encryptData(secretData, password) {
    if (!secretData) {
      throw new Error("No data to encrypt");
    }

    try {
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const passwordKey = await getPasswordKey(password);
      const aesKey = await deriveKey(passwordKey, salt, ["encrypt"]);
      const encryptedContent = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        aesKey,
        enc.encode(secretData)
      );

      const encryptedContentArr = new Uint8Array(encryptedContent);
      let buff = new Uint8Array(
        salt.byteLength + iv.byteLength + encryptedContentArr.byteLength
      );
      buff.set(salt, 0);
      buff.set(iv, salt.byteLength);
      buff.set(encryptedContentArr, salt.byteLength + iv.byteLength);
      const base64Buff = buff_to_base64(buff);
      return base64Buff;
    } catch (e) {
      console.error(`Encryption error: ${e}`);
      throw e;
    }
  }

  // Decryption function
  async function decryptData(encryptedData, password) {
    if (!encryptedData) {
      throw new Error("No data to decrypt");
    }

    try {
      const encryptedDataBuff = base64_to_buf(encryptedData);
      const salt = encryptedDataBuff.slice(0, 16);
      const iv = encryptedDataBuff.slice(16, 16 + 12);
      const data = encryptedDataBuff.slice(16 + 12);
      const passwordKey = await getPasswordKey(password);
      const aesKey = await deriveKey(passwordKey, salt, ["decrypt"]);
      const decryptedContent = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        aesKey,
        data
      );
      return dec.decode(decryptedContent);
    } catch (e) {
      console.error(`Decryption error: ${e}`);
      throw e;
    }
  }

  // File handling utilities
  function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  // Modified downloadFile function
  function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.type = "application/octet-stream"; // Added explicit type
    a.setAttribute("download", filename); // Force download attribute
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // UI Event Handlers
  // Tab switching functionality
  const cryptTabs = document.querySelectorAll(".crypt-tab");
  const cryptPanels = document.querySelectorAll(".crypt-panel");

  cryptTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      cryptTabs.forEach((t) => t.classList.remove("active"));
      cryptPanels.forEach((p) => p.classList.remove("active"));

      tab.classList.add("active");
      document
        .getElementById(tab.dataset.crypttab + "Crypt")
        .classList.add("active");
    });
  });

  // Text encryption/decryption handlers
  const encryptButton = document.getElementById("encryptButton");
  const decryptButton = document.getElementById("decryptButton");
  const copyEncrypted = document.getElementById("copyEncrypted");
  const copyDecrypted = document.getElementById("copyDecrypted");

  if (encryptButton) {
    encryptButton.addEventListener("click", async () => {
      const text = document.getElementById("textToEncrypt").value;
      const password = document.getElementById("encryptPassword").value;

      if (!text) {
        showButtonFeedback(encryptButton, "Please enter text to encrypt");
        return;
      }

      try {
        const encrypted = await encryptData(text, password);
        document.getElementById("encryptedText").value = encrypted;
        showButtonFeedback(encryptButton, "Encrypted");
      } catch (error) {
        console.error("Encryption failed:", error);
        showButtonFeedback(encryptButton, "Encryption failed");
      }
    });
  }

  if (decryptButton) {
    decryptButton.addEventListener("click", async () => {
      const text = document.getElementById("textToDecrypt").value;
      const password = document.getElementById("decryptPassword").value;

      if (!text) {
        showButtonFeedback(decryptButton, "Please enter text to decrypt");
        return;
      }

      try {
        const decrypted = await decryptData(text, password);
        document.getElementById("decryptedText").value =
          decrypted || "Decryption failed";
        showButtonFeedback(decryptButton, decrypted ? "Decrypted" : "Failed");
      } catch (error) {
        console.error("Decryption failed:", error);
        showButtonFeedback(decryptButton, "Decryption failed");
        document.getElementById("decryptedText").value = "Decryption failed";
      }
    });
  }

  // Copy button handlers
  if (copyEncrypted) {
    copyEncrypted.addEventListener("click", () => {
      const text = document.getElementById("encryptedText").value;
      if (text) {
        navigator.clipboard.writeText(text);
        showButtonFeedback(copyEncrypted, "Copied");
      }
    });
  }

  if (copyDecrypted) {
    copyDecrypted.addEventListener("click", () => {
      const text = document.getElementById("decryptedText").value;
      if (text) {
        navigator.clipboard.writeText(text);
        showButtonFeedback(copyDecrypted, "Copied");
      }
    });
  }

  // File encryption/decryption handlers
  const fileToEncrypt = document.getElementById("fileToEncrypt");
  const fileToDecrypt = document.getElementById("fileToDecrypt");
  const fileEncryptButton = document.getElementById("fileEncryptButton");
  const fileDecryptButton = document.getElementById("fileDecryptButton");

  // File encryption
  fileEncryptButton?.addEventListener("click", async () => {
    const file = fileToEncrypt.files[0];
    const password = document.getElementById("fileEncryptPassword").value;

    if (!file) {
      showButtonFeedback(fileEncryptButton, "Please select a file");
      return;
    }

    try {
      showButtonFeedback(fileEncryptButton, "Encrypting...");
      const fileData = await readFileAsArrayBuffer(file);
      const encrypted = await encryptData(new Uint8Array(fileData), password);
      // Create blob with explicit type and download with forced download attribute
      const blob = new Blob([base64_to_buf(encrypted)], {
        type: "application/octet-stream", // Changed from default type
      });
      downloadFile(blob, file.name + ".encrypted");
      showButtonFeedback(fileEncryptButton, "Encrypted");
    } catch (error) {
      console.error("File encryption failed:", error);
      showButtonFeedback(fileEncryptButton, "Encryption failed");
    }
  });

  // File decryption
  fileDecryptButton?.addEventListener("click", async () => {
    const file = fileToDecrypt.files[0];
    const password = document.getElementById("fileDecryptPassword").value;

    if (!file) {
      showButtonFeedback(fileDecryptButton, "Please select a file");
      return;
    }

    try {
      showButtonFeedback(fileDecryptButton, "Decrypting...");
      const fileData = await readFileAsArrayBuffer(file);
      const decrypted = await decryptData(
        buff_to_base64(new Uint8Array(fileData)),
        password
      );
      // Create blob with explicit type and download with forced download attribute
      const blob = new Blob([new TextEncoder().encode(decrypted)], {
        type: "application/octet-stream", // Changed from default type
      });
      downloadFile(blob, file.name.replace(/\.encrypted$/, ""));
      showButtonFeedback(fileDecryptButton, "Decrypted");
    } catch (error) {
      console.error("File decryption failed:", error);
      showButtonFeedback(fileDecryptButton, "Decryption failed");
    }
  });

  // File input handling
  function updateFileLabel(input, defaultText = "Choose File") {
    const label = input.nextElementSibling;
    label.textContent = input.files[0]?.name || defaultText;
  }

  fileToEncrypt?.addEventListener("change", () => {
    updateFileLabel(fileToEncrypt);
  });

  fileToDecrypt?.addEventListener("change", () => {
    updateFileLabel(fileToDecrypt);
  });

  // Drag and drop support
  const fileLabels = document.querySelectorAll(".file-label");

  fileLabels.forEach((label) => {
    label.addEventListener("dragover", (e) => {
      e.preventDefault();
      label.classList.add("dragover");
    });

    label.addEventListener("dragleave", () => {
      label.classList.remove("dragover");
    });

    label.addEventListener("drop", (e) => {
      e.preventDefault();
      label.classList.remove("dragover");

      const input = document.getElementById(label.getAttribute("for"));
      const files = e.dataTransfer.files;

      if (files.length > 0) {
        input.files = files;
        updateFileLabel(input);
      }
    });
  });

  // =====================================================

  // END
}); // document.addEventListener("DOMContentLoaded", () => {
