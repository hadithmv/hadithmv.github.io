const numberStyles = {
  regular: "0123456789",
  mathSansSerif: "𝟢𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫",
  fullWidth: "０１２３４５６７８９",
  mathSansSerifBold: "𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵",
  circled: "⓪①②③④⑤⑥⑦⑧⑨",
  negativeCircled: "⓿❶❷❸❹❺❻❼❽❾",
};

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

      // Handle dropdown option clicks
      content.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") {
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

  //  DROPDOWN FUNCTIONS BEGIN FROM HERE BELOW

  function handleDropdownAction(action) {
    switch (action) {
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

      // =====================================================

      //     !!!  Add more cases as needed
      //   }
      //   updateStats();
      // }

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

        // =====================================================

        // had to place: const numberStyles = [, outside case, as global variable
        function convertNumbers(targetStyle) {
          let text = textArea.value;

          // First convert everything to regular numbers
          Object.values(numberStyles).forEach((style) => {
            [...style].forEach((digit, index) => {
              const regex = new RegExp(digit, "g");
              text = text.replace(regex, index);
            });
          });

          // Then convert to target style
          const targetDigits = [...numberStyles[targetStyle]];
          for (let i = 0; i < 10; i++) {
            const regex = new RegExp(i.toString(), "g");
            text = text.replace(regex, targetDigits[i]);
          }

          textArea.value = text;
        }

      case "toRegularNumbers":
        convertNumbers("regular");
        break;
      case "toMathSansSerif":
        convertNumbers("mathSansSerif");
        break;
      case "toFullWidth":
        convertNumbers("fullWidth");
        break;
      case "toMathSansSerifBold":
        convertNumbers("mathSansSerifBold");
        break;
      case "toCircled":
        convertNumbers("circled");
        break;
      case "toNegativeCircled":
        convertNumbers("negativeCircled");
        break;

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

  document.getElementById("wordWrap").addEventListener("click", () => {
    textArea.value = textArea.value.replace(/\s+/g, " ").trim();
    updateStats();
  });
  //

  const newlineStates = [
    {
      // Remove extra lines, keeping up to double empty lines
      func: (str) => str.trim().replace(/\n{3,}/g, "\n\n"),
    },
    {
      // Remove all extra lines, keeping only single empty lines
      func: (str) => str.trim().replace(/\n{2,}/g, "\n"),
    },
    {
      // Remove all empty lines
      func: (str) =>
        str
          .trim()
          .split("\n")
          .filter((line) => line.trim() !== "")
          .join("\n"),
    },
    {
      // No changes (original text)
      func: (str) => str,
    },
  ];

  let currentNewlineState = 0;

  document.getElementById("removeNewlines").addEventListener("click", () => {
    // Apply the current state's function to the text
    textArea.value = newlineStates[currentNewlineState].func(textArea.value);

    // Move to the next state, wrapping around to 0 if we reach the end
    currentNewlineState = (currentNewlineState + 1) % newlineStates.length;

    // Update stats (assuming this function exists elsewhere in your code)
    updateStats();
  });
  //

  document.getElementById("removeExtraSpace").addEventListener("click", () => {
    textArea.value = textArea.value
      // Remove spaces at the beginning and end of each line
      .replace(/^ +| +$/gm, "")
      // Replace multiple spaces with a single space
      .replace(/ +/g, " ")
      // Replace multiple newlines with a single newline
      //.replace(/\n+/g, "\n")
      // Trim leading and trailing whitespace from the entire text
      .trim();
    updateStats();
  });
  //

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

  let cycleState = 0;
  document.getElementById("cycleBrackets").addEventListener("click", () => {
    const transformations = [
      {
        from: /[()[\]]/g,
        to: (match) => (match === "(" || match === "[" ? "⌜" : "⌝"),
        next: "⌜⌝ → ⌝⌜",
      },
      {
        from: /[⌜⌝]/g,
        to: (match) => (match === "⌜" ? "⌝" : "⌜"),
        next: "⌝⌜ → ()",
      },
      {
        from: /[⌝⌜]/g,
        to: (match) => (match === "⌝" ? "(" : ")"),
        next: "() [] → ⌜⌝",
      },
    ];

    textArea.value = textArea.value.replace(
      transformations[cycleState].from,
      transformations[cycleState].to
    );

    document.getElementById("cycleBrackets").textContent =
      transformations[cycleState].next;
    cycleState = (cycleState + 1) % 3;

    updateStats();
  });
  //

  let isEllipsis = false;

  document.getElementById("dotsToEllipsis").addEventListener("click", () => {
    if (isEllipsis) {
      // Convert ellipsis to three dots
      textArea.value = textArea.value.replace(/…/g, "...");
    } else {
      // Convert three dots to ellipsis
      textArea.value = textArea.value.replace(/\.{3}/g, "…");
    }

    isEllipsis = !isEllipsis;
    updateStats();
  });
  //

  let dashState = 0;

  document
    .getElementById("hyphenToEnThenEmDash")
    .addEventListener("click", () => {
      const transformations = [
        { from: /-/g, to: "–" },
        { from: /–/g, to: "—" },
        { from: /—/g, to: "-" },
      ];

      textArea.value = textArea.value.replace(
        transformations[dashState].from,
        transformations[dashState].to
      );

      dashState = (dashState + 1) % 3;

      updateStats();
    });
  //

  let isRTLtoLTR = true;

  document
    .getElementById("reverseCurlyQuotes")
    .addEventListener("click", () => {
      const textArea = document.getElementById("textArea");
      const quoteMap = isRTLtoLTR
        ? { "‘": "’", "’": "‘", "“": "”", "”": "“" }
        : { "’": "‘", "‘": "’", "”": "“", "“": "”" };

      textArea.value = textArea.value.replace(
        /[’‘”“]/g,
        (match) => quoteMap[match] || match
      );

      isRTLtoLTR = !isRTLtoLTR;
      updateStats();
    });
  //

  document.getElementById("keepOnlyAr").addEventListener("click", () => {
    scrollToTop();
    //
    //textArea.value = textArea.value.replace(/[^\u0600-\u06FF\s]/g, "");
    // https://notes.yshalsager.com/en/notes/Regex%20Match%20Arabic%20Letters/
    textArea.value = textArea.value.replace(
      /[^\u0600-\u06ff\u0750-\u077f\ufb50-\ufbc1\ufbd3-\ufd3f\ufd50-\ufd8f\ufd92-\ufdc7\ufe70-\ufefc\uFDF0-\uFDFD\s]/g,
      ""
    );
    updateStats();
  });
  //

  document.getElementById("text2HtmlP").addEventListener("click", () => {
    ltrSwitch();
    scrollToTop();
    //

    // Split the input text by one or more line breaks
    let paragraphs = textArea.value.split(/\n{1,}/);

    // Remove empty paragraphs and trim whitespace
    paragraphs = paragraphs.filter((p) => p.trim() !== "");

    // Wrap each paragraph with <p> tags and join them
    textArea.value = paragraphs
      .map((para) => `<p>${para.trim()}</p>`)
      .join("\n");

    /* Wrap each line with <p> tags and join them back into a single string
  let formattedText = paragraphs.map(line => `<p>${line.trim()}</p>`).join('');*/

    updateStats();
  });
  //

  document.getElementById("rmvHtmlTags").addEventListener("click", () => {
    scrollToTop();
    //
    textArea.value = textArea.value.replace(/<[^>]*>/g, "");
    updateStats();
  });
  //

  let lineNumbersAdded = false;

  document.getElementById("toggleLineNumbers").addEventListener("click", () => {
    const lines = textArea.value.split("\n");
    if (!lineNumbersAdded) {
      textArea.value = lines
        .map((line, index) => `${index + 1}. ${line}`)
        .join("\n");
      document.getElementById("toggleLineNumbers").textContent =
        "Rmv Line Numbers";
      lineNumbersAdded = true;
    } else {
      textArea.value = lines
        .map((line) => line.replace(/^\d+\.\s/, ""))
        .join("\n");
      document.getElementById("toggleLineNumbers").textContent =
        "Add Line Numbers";
      lineNumbersAdded = false;
    }
    updateStats();
  });
  //

  document.getElementById("genRandPass").addEventListener("click", () => {
    const minLength = 8;
    const maxLength = 16;
    const length =
      Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

    let password = "";
    for (let i = 0; i < length; i++) {
      const randomCharCode = Math.floor(Math.random() * (127 - 33) + 33);
      password += String.fromCharCode(randomCharCode);
    }

    // Ensure the password contains at least one lowercase, one uppercase, one digit, and one special character
    const ensureCharTypes = (pwd) => {
      const charTypes = [
        { regex: /[a-z]/, range: [97, 122] },
        { regex: /[A-Z]/, range: [65, 90] },
        { regex: /[0-9]/, range: [48, 57] },
        { regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/, range: [33, 47] },
      ];

      charTypes.forEach((type) => {
        if (!type.regex.test(pwd)) {
          const randomIndex = Math.floor(Math.random() * pwd.length);
          const randomChar = String.fromCharCode(
            Math.floor(Math.random() * (type.range[1] - type.range[0] + 1)) +
              type.range[0]
          );
          pwd =
            pwd.substring(0, randomIndex) +
            randomChar +
            pwd.substring(randomIndex + 1);
        }
      });

      return pwd;
    };

    //password = ensureCharTypes(password);
    //textArea.value += (textArea.value ? "\n" : "") + password;
    textArea.value = ensureCharTypes(password); //otherwise a new pass is made on every new line
    updateStats();
  });

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

  let listState = "none";
  document.getElementById("toggleListTags").addEventListener("click", () => {
    const lines = textArea.value.split("\n");
    if (listState === "none") {
      textArea.value =
        "<ol>\n" +
        lines.map((line) => `  <li>${line}</li>`).join("\n") +
        "\n</ol>";
      document.getElementById("toggleListTags").textContent = "HTML U List";
      listState = "ordered";
    } else if (listState === "ordered") {
      textArea.value =
        "<ul>\n" +
        lines
          .map((line) => line.replace(/<li>(.*)<\/li>/, "  <li>$1</li>"))
          .join("\n") +
        "\n</ul>";
      document.getElementById("toggleListTags").textContent = "Remove Tags";
      listState = "unordered";
    } else {
      textArea.value = lines
        .map((line) => line.replace(/<li>(.*)<\/li>/, "$1"))
        .join("\n")
        .replace(/<\/?[ou]l>\n?/g, "");
      document.getElementById("toggleListTags").textContent = "HTML O List";
      listState = "none";
    }
    updateStats();
  });
  //

  // RMV THIKIJEHI THAANA
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

  // Function to remove Thikijehi Thaana
  function removeThikijehiThaana(text) {
    scrollToTop();
    //
    return text.replace(
      /[ޘޙޛޜޞޠޡޢޤޥ]/g,
      (char) => thikijehiReplacements[char] || char
    );
  }
  //

  document.getElementById("keepOnlyDv").addEventListener("click", () => {
    scrollToTop();
    //
    textArea.value = textArea.value.replace(/[^\u0780-\u07BF\s]/g, "");
    updateStats();
  });

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

  document
    .getElementById("removeThikijehiThaana")
    .addEventListener("click", () => {
      textArea.value = removeThikijehiThaana(textArea.value);
      updateStats();
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
1. ބިން ޢުމަރުި رَضِيَ  :  ރު ި
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

  let footnoteClickCount = 0;
  function updateFootnoteButtonText() {
    const texts = ["(1)/[1] → ⁽¹⁾", "⁽¹⁾ → (1)", "(1) → [1]"];
    convertFootnotesBtn.textContent = texts[footnoteClickCount % 3];
  }
  //

  convertFootnotesBtn.addEventListener("click", () => {
    switch (footnoteClickCount % 3) {
      case 0: // Convert to superscript
        textArea.value = textArea.value.replace(
          /\((\d+)\)|\[(\d+)\]/g,
          (match, p1, p2) => {
            const num = p1 || p2;
            return `⁽${num
              .split("")
              .map((d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d])
              .join("")}⁾`;
          }
        );
        break;
      case 1: // Convert to parentheses
        textArea.value = textArea.value.replace(
          /⁽([⁰¹²³⁴⁵⁶⁷⁸⁹]+)⁾/g,
          (match, p1) => {
            const num = p1
              .split("")
              .map((d) => "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(d))
              .join("");
            return `(${num})`;
          }
        );
        break;
      case 2: // Convert to square brackets
        textArea.value = textArea.value.replace(/\((\d+)\)/g, (match, p1) => {
          return `[${p1}]`;
        });
        break;
    }

    footnoteClickCount++;
    updateFootnoteButtonText();

    updateStats();
  });
  //

  let bracketClickCount = 0;

  document.getElementById("bracketNumbers").addEventListener("click", () => {
    if (bracketClickCount % 2 === 0) {
      // Remove brackets
      textArea.value = textArea.value.replace(/\((\d+)\)|\[(\d+)\]/g, "$1$2");
    } else {
      // Add brackets
      textArea.value = textArea.value.replace(/(\d+)(?!\))/g, "($1)");
    }

    bracketClickCount++;
    updateStats();
  });
  //

  document
    .getElementById("removeNumbersInBrackets")
    .addEventListener("click", () => {
      scrollToTop();
      //
      textArea.value = textArea.value.replace(
        /\(\d+\)|\[\d+\]|⁽[⁰¹²³⁴⁵⁶⁷⁸⁹]+⁾/g,
        ""
      );
      updateStats();
    });
  //

  let convertSalawatclickCount = 0;
  document.getElementById("convertSalawat").addEventListener("click", () => {
    convertSalawatclickCount++;
    if (convertSalawatclickCount % 2 === 1) {
      // Odd clicks: convert to ligature
      textArea.value = textArea.value.replace(
        /صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ|صلى الله عليه وسلم/g,
        "ﷺ"
      );
    } else {
      // Even clicks: convert to full phrase
      textArea.value = textArea.value.replace(
        /ﷺ/g,
        "صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ"
      );
    }

    updateStats();
  });
  //

  let isLeetSpeak = false;

  const leetMap = {
    a: "4",
    e: "3",
    i: "!",
    o: "0",
    t: "7",
    l: "1",
    s: "5",
  };

  const reverseLeetMap = Object.fromEntries(
    Object.entries(leetMap).map(([key, value]) => [value, key])
  );

  document.getElementById("toggleLeetSpeak").addEventListener("click", () => {
    if (isLeetSpeak) {
      // Convert leet speak back to regular text (lowercase)
      textArea.value = textArea.value.replace(
        /[43!0715]/g,
        (char) => reverseLeetMap[char]
      );
    } else {
      // Convert regular text to leet speak (all lowercase)
      textArea.value = textArea.value
        .toLowerCase()
        .replace(/[aeiotls]/g, (char) => leetMap[char]);
    }

    isLeetSpeak = !isLeetSpeak;
    updateStats();
    ltrSwitch();
  });

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

  document.getElementById("removeKashidas").addEventListener("click", () => {
    scrollToTop();
    //
    textArea.value = textArea.value.replace(/ـ/g, "");
    updateStats();
  });
  //

  document.getElementById("shaddaB4Haraka").addEventListener("click", () => {
    scrollToTop();
    //
    textArea.value = correctShaddaPlacement(textArea.value);
  });

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
  //

  document
    .getElementById("removeQuranicMarks")
    .addEventListener("click", () => {
      scrollToTop();
      //
      textArea.value = textArea.value
        .replace(/[ۖۗۘۙۚۛۜ۝۞ۣ۟۠ۡۢۤۥۦۧۨ۩۪ۭ۫۬﴾﴿]/g, "")
        .replace(/\s+/g, " ")
        .trim();
      updateStats();
    });
  //

  let quoteState = 0; // 0: double quotes, 1: angular quotes, 2: double parentheses

  document
    .getElementById("replaceQuoteToDoubleAngleBrackets")
    .addEventListener("click", () => {
      scrollToTop();
      //
      switch (quoteState) {
        case 0: // Convert to angular quotes
          textArea.value = textArea.value
            .replace(/"([^"]*)"/g, "«$1»")
            .replace(/\(\(([^)]*)\)\)/g, "«$1»");
          document.getElementById(
            "replaceQuoteToDoubleAngleBrackets"
          ).textContent = "« » → (( ))";
          quoteState = 1;
          break;
        case 1: // Convert to double parentheses
          textArea.value = textArea.value.replace(/«([^»]*)»/g, "(($1))");
          document.getElementById(
            "replaceQuoteToDoubleAngleBrackets"
          ).textContent = '(( )) → " "';
          quoteState = 2;
          break;
        case 2: // Convert to double quotes
          textArea.value = textArea.value.replace(/\(\(([^)]*)\)\)/g, '"$1"');
          document.getElementById(
            "replaceQuoteToDoubleAngleBrackets"
          ).textContent = '" " / (( )) → « »';
          quoteState = 0;
          break;
      }

      updateStats();
    });

  //

  document
    .getElementById("replaceDoubleBracketsToSingle")
    .addEventListener("click", () => {
      textArea.value = textArea.value.replace(/\(\(([^)]*)\)\)/g, "($1)");
      updateStats();
    });
  //

  let isLatinBr = true;
  document
    .getElementById("replaceQuranicBrackets")
    .addEventListener("click", () => {
      const replacements = isLatinBr
        ? { "{": "﴿", "}": "﴾", "*": "۝" }
        : { "﴿": "{", "﴾": "}", "۝": "*" };
      textArea.value = textArea.value.replace(
        /[﴾﴿۝{}*]/g,
        (match) => replacements[match] || match
      );
      isLatinBr = !isLatinBr;
      updateStats();
    });
  //

  let isPuncRTL = true;
  document.getElementById("replaceRtlPunc").addEventListener("click", () => {
    const replacements = isPuncRTL
      ? { "،": ",", "؛": ";", "؟": "?" }
      : { ",": "،", ";": "؛", "?": "؟" };
    textArea.value = textArea.value.replace(
      /[،؛؟,;?]/g,
      (match) => replacements[match] || match
    );
    isPuncRTL = !isPuncRTL;
    updateStats();
  });
  //

  document
    .getElementById("replaceColon2Fullstop")
    .addEventListener("click", () => {
      scrollToTop();
      //
      textArea.value = textArea.value.replace(/:/g, ".");
      updateStats();
    });
  //

  const seqMinInput = document.getElementById("seqMinInput");
  const seqMaxInput = document.getElementById("seqMaxInput");

  let seqMin = 1;
  let seqMax = 10;

  function generateSequence(min, max) {
    let sequence = "";
    for (let i = min; i <= max; i++) {
      sequence += i + "\n";
    }
    return sequence.trim();
  }

  document
    .getElementById("generateNumSequence")
    .addEventListener("click", () => {
      if (seqMinInput.style.display === "none") {
        // First click: show input fields and generate sequence
        seqMinInput.style.display = "inline-block";
        seqMaxInput.style.display = "inline-block";
        seqMinInput.value = seqMin;
        //seqMaxInput.value = seqMax;
      } else {
        // Subsequent clicks: update range from input fields
        seqMin = parseInt(seqMinInput.value);
        seqMax = parseInt(seqMaxInput.value);

        // Check if inputs are valid numbers
        if (isNaN(seqMin)) seqMin = 0;
        if (isNaN(seqMax)) seqMax = 10;

        if (seqMin > seqMax) {
          [seqMin, seqMax] = [seqMax, seqMin]; // Swap if min > max
          seqMinInput.value = seqMin;
          seqMaxInput.value = seqMax;
        }
      }
      // Generate and display sequence
      textArea.value = generateSequence(seqMin, seqMax);
    });

  // Update range when input values change
  seqMinInput.addEventListener("change", () => {
    seqMin = parseInt(seqMinInput.value);
    if (isNaN(seqMin)) seqMin = 0;
  });
  seqMaxInput.addEventListener("change", () => {
    seqMax = parseInt(seqMaxInput.value);
    if (isNaN(seqMax)) seqMax = 10;
  });
  //

  /* generate a random number up to ten when the button is first clicked, also clicking this button should show two input boxes saying max and min respectively as placeholders, which lets the user input a custom range of values, within which, further clicks on the button will generate random numbers within the range of those given input numbers

the input boxes should not show before the button has been clicked

the textarea text should be replaced each time the button is clicked
 */

  const RandNoMinInput = document.getElementById("RandNoMinInput");
  const RandNoMaxInput = document.getElementById("RandNoMaxInput");

  let minRange = 1;
  let maxRange = 10;

  function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  document.getElementById("randomNum").addEventListener("click", () => {
    if (RandNoMinInput.style.display === "none") {
      // First click: show input fields and generate number
      RandNoMinInput.style.display = "inline-block";
      RandNoMaxInput.style.display = "inline-block";
      RandNoMinInput.value = minRange;
      //RandNoMaxInput.value = maxRange;
    } else {
      // Subsequent clicks: update range from input fields
      minRange = parseInt(RandNoMinInput.value) || 1;
      maxRange = parseInt(RandNoMaxInput.value) || 10;

      if (minRange > maxRange) {
        [minRange, maxRange] = [maxRange, minRange]; // Swap if min > max
        RandNoMinInput.value = minRange;
        RandNoMaxInput.value = maxRange;
      }
    }

    // Generate and display random number
    const randomNum = generateRandomNumber(minRange, maxRange);
    textArea.value = randomNum.toString();
    updateStats();
  });

  // Update range when input values change
  RandNoMinInput.addEventListener("change", () => {
    minRange = parseInt(RandNoMinInput.value) || 1;
  });

  RandNoMaxInput.addEventListener("change", () => {
    maxRange = parseInt(RandNoMaxInput.value) || 10;
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
when the button is first clicked, show an input boxes saying "How many?" placeholder, which lets the user input a number, after which, further clicks on the button will repeat the lines of text according to the number given in the input
the input boxes should not show before the button has been clicked
  */
  const repeatInput = document.getElementById("repeatInput");

  // New Repeat Lines functionality
  document.getElementById("repeatLines").addEventListener("click", () => {
    if (repeatInput.style.display === "none") {
      repeatInput.style.display = "inline-block";
      //repeatInput.value = "2";
    } else {
      const repeatCount = parseInt(repeatInput.value) || 1;
      const originalText = textArea.value;
      textArea.value = Array(repeatCount).fill(originalText).join("\n");
      updateStats();
    }
  });
  //

  /*
when this button is first clicked, show two input boxes saying Prefix and Suffix as placeholder, which lets the user input characters, after which, further clicks on the button will add prefix or suffix to every line of text with the characters given in the input
the input boxes should not show before the button has been clicked
  */

  const prefixInput = document.getElementById("prefixInput");
  const suffixInput = document.getElementById("suffixInput");

  document
    .getElementById("prefixSuffixToLine")
    .addEventListener("click", () => {
      if (prefixInput.style.display === "none") {
        // First click: show input fields
        prefixInput.style.display = "inline-block";
        suffixInput.style.display = "inline-block";
      } else {
        // Subsequent clicks: apply prefix and suffix
        const prefix = prefixInput.value;
        const suffix = suffixInput.value;

        // Split the text into lines, apply prefix and suffix, then join back
        const lines = textArea.value.split("\n");
        const modifiedLines = lines.map((line) => prefix + line + suffix);
        textArea.value = modifiedLines.join("\n");

        updateStats();
      }
    });
  //

  /*
  when this button is first clicked, show two input boxes saying "From Start" and "From End" as placeholder, which lets the user input numbers, after which, further clicks on the button will remove the given number of characters from every line of text according to the input
the input boxes should not show before the button has been clicked
*/

  const removeFromStartInput = document.getElementById("removeFromStart");
  const removeFromEndInput = document.getElementById("removeFromEnd");

  document
    .getElementById("rmvNoOfCharsPerLine")
    .addEventListener("click", () => {
      if (removeFromStartInput.style.display === "none") {
        // First click: show input fields
        removeFromStartInput.style.display = "inline-block";
        removeFromEndInput.style.display = "inline-block";
      } else {
        // Subsequent clicks: remove characters from each line
        const removeFromStart = parseInt(removeFromStartInput.value) || 0;
        const removeFromEnd = parseInt(removeFromEndInput.value) || 0;

        // Split the text into lines, remove characters, then join back
        const lines = textArea.value.split("\n");
        const modifiedLines = lines.map((line) => {
          if (line.length <= removeFromStart + removeFromEnd) {
            return ""; // Line is shorter than or equal to total characters to remove
          }
          return line.slice(removeFromStart, line.length - removeFromEnd);
        });
        textArea.value = modifiedLines.join("\n");

        updateStats();
      }
    });
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

  document.getElementById("getDateTime").addEventListener("click", function () {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1; // getMonth() returns 0-11, so we add 1
    const year = now.getFullYear();
    const time = now.toLocaleTimeString();

    const dateTimeString = `${day}/${month}/${year} ${time}`;
    navigator.clipboard.writeText(dateTimeString);
  });

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
  });

  // Copy functionality for the Copy tab
  document.querySelectorAll(".copy-button").forEach((button) => {
    button.addEventListener("click", () => {
      navigator.clipboard.writeText(button.dataset.text);
    });
  });

  document.querySelectorAll(".copy-button-lit").forEach((button) => {
    button.addEventListener("click", () => {
      navigator.clipboard.writeText(button.textContent);
    });
  });

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
});
