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
    charCount.textContent = `Chars: ${text.length}`;
    wordCount.textContent = `Words: ${words}`;
    lineCount.textContent = `Lines: ${lines}`;
    const bytes = new Blob([text]).size;
    fileSize.textContent =
      bytes < 1024
        ? `Bytes: ${bytes}`
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

  // BUTTON FUNCTIONS

  function ltrSwitch() {
    textArea.style.direction = "ltr";
    textArea.style.textAlign = "left";
  }
  //

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

  document.getElementById("arabicDigits").addEventListener("click", () => {
    textArea.value = textArea.value.replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
    updateStats();
  });
  //

  document.getElementById("regularDigits").addEventListener("click", () => {
    textArea.value = textArea.value.replace(/[٠١٢٣٤٥٦٧٨٩]/g, (d) =>
      "٠١٢٣٤٥٦٧٨٩".indexOf(d)
    );
    updateStats();
  });
  //

  document.getElementById("removeDiacritics").addEventListener("click", () => {
    textArea.value = textArea.value.replace(
      /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g,
      ""
    );
    updateStats();
  });
  //

  document.getElementById("saveFile").addEventListener("click", () => {
    const blob = new Blob([textArea.value], {
      type: "text/plain;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "saved_text.txt";
    a.click();
  });
  //

  document.getElementById("loadFile").addEventListener("click", () => {
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
  });
  //

  let isRTL = true;
  document.getElementById("toggleDirection").addEventListener("click", () => {
    isRTL = !isRTL;
    textArea.style.direction = isRTL ? "rtl" : "ltr";
    textArea.style.textAlign = isRTL ? "right" : "left";
  });
  //

  const caseFunctions = [
    {
      name: "Title Case",
      func: (str) =>
        str.replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        ),
    },
    {
      name: "Sentence case",
      func: (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),
    },
    { name: "lower case", func: (str) => str.toLowerCase() },
    { name: "UPPER CASE", func: (str) => str.toUpperCase() },
  ];
  let currentCaseIndex = 0;
  document.getElementById("changeCase").addEventListener("click", () => {
    textArea.value = caseFunctions[currentCaseIndex].func(textArea.value);
    currentCaseIndex = (currentCaseIndex + 1) % caseFunctions.length;
    document.getElementById("changeCase").textContent =
      caseFunctions[currentCaseIndex].name;
    updateStats();
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

  document.getElementById("keepOnlyNumbers").addEventListener("click", () => {
    textArea.value = textArea.value.replace(/[^0-9\n]/g, "");
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

  document.getElementById("removeAllNumbers").addEventListener("click", () => {
    textArea.value = textArea.value.replace(/[0-9]/g, "");
    updateStats();
  });
  //

  document.getElementById("keepOnlyAr").addEventListener("click", () => {
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

  document
    .getElementById("whichUnicodeCharacter")
    .addEventListener("click", () => {
      ltrSwitch();

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
      updateStats();
    });
  //

  document.getElementById("rmvHtmlTags").addEventListener("click", () => {
    textArea.value = textArea.value.replace(/<[^>]*>/g, "");
    updateStats();
  });
  //

  let isDecoded = false;

  document
    .getElementById("decodeEncodeUnicode")
    .addEventListener("click", () => {
      ltrSwitch();

      if (isDecoded) {
        const input = textArea.value;
        let output = "";

        for (let i = 0; i < input.length; i++) {
          const charCode = input.charCodeAt(i);
          output += "\\u" + charCode.toString(16).padStart(4, "0");
        }

        textArea.value = output;
        //
        document.getElementById("decodeEncodeUnicode").textContent =
          "Decode \\unicode";
      } else {
        // Decode: Convert Unicode escape sequences to characters
        textArea.value = textArea.value.replace(
          /\\u([0-9a-fA-F]{4})/g,
          (match, p1) => {
            return String.fromCharCode(parseInt(p1, 16));
          }
        );
        document.getElementById("decodeEncodeUnicode").textContent =
          "Encode unicode";
      }
      isDecoded = !isDecoded;
      updateStats();
    });
  //

  let isURLDecoded = false;

  document.getElementById("decodeEncodeURL").addEventListener("click", () => {
    ltrSwitch();

    if (isURLDecoded) {
      // Encode: Convert text to URL-encoded format
      textArea.value = encodeURI(textArea.value);
      document.getElementById("decodeEncodeURL").textContent = "Decode URL";
    } else {
      // Decode: Convert URL-encoded text back to regular text
      textArea.value = decodeURI(textArea.value);
      document.getElementById("decodeEncodeURL").textContent = "Encode URL";
    }
    isURLDecoded = !isURLDecoded;
    updateStats();
  });
  //

  document
    .getElementById("sortWordsByFrequency")
    .addEventListener("click", () => {
      const words = textArea.value.split(/\s+/);
      const frequency = {};
      words.forEach((word) => {
        frequency[word] = (frequency[word] || 0) + 1;
      });
      const sortedWords = Object.entries(frequency).sort((a, b) => b[1] - a[1]);
      textArea.value = sortedWords
        .map(([word, freq]) => `${word}: ${freq}`)
        .join("\n");
      updateStats();
    });
  //

  document
    .getElementById("sortLinesByFrequency")
    .addEventListener("click", () => {
      const lines = textArea.value.split("\n");
      const frequency = {};
      lines.forEach((line) => {
        frequency[line] = (frequency[line] || 0) + 1;
      });
      const sortedLines = Object.entries(frequency).sort((a, b) => b[1] - a[1]);
      textArea.value = sortedLines
        .map(([line, freq]) => `${line} (${freq})`)
        .join("\n");
      updateStats();
    });
  //

  let lineNumbersAdded = false;
  document.getElementById("toggleLineNumbers").addEventListener("click", () => {
    const lines = textArea.value.split("\n");
    if (!lineNumbersAdded) {
      textArea.value = lines
        .map((line, index) => `${index + 1} ${line}`)
        .join("\n");
      document.getElementById("toggleLineNumbers").textContent =
        "Remove Line Numbers";
      lineNumbersAdded = true;
    } else {
      textArea.value = lines
        .map((line) => line.replace(/^\d+\s/, ""))
        .join("\n");
      document.getElementById("toggleLineNumbers").textContent =
        "Add Line Numbers";
      lineNumbersAdded = false;
    }
    updateStats();
  });
  //

  let sortOrder = "asc";
  document.getElementById("toggleSortLines").addEventListener("click", () => {
    const lines = textArea.value.split("\n");
    if (sortOrder === "asc") {
      textArea.value = lines.sort().join("\n");
      document.getElementById("toggleSortLines").textContent = "Sort Lines ↓";
      sortOrder = "desc";
    } else if (sortOrder === "desc") {
      textArea.value = lines.sort().reverse().join("\n");
      document.getElementById("toggleSortLines").textContent = "Reset Sorting";
      sortOrder = "reset";
    } else {
      // Reset to original order
      document.getElementById("toggleSortLines").textContent = "Sort Lines ↑";
      sortOrder = "asc";
    }
    updateStats();
  });
  //

  document.getElementById("randomizeLines").addEventListener("click", () => {
    const lines = textArea.value.split("\n");
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lines[i], lines[j]] = [lines[j], lines[i]];
    }
    textArea.value = lines.join("\n");
    updateStats();
  });
  //

  let reverseState = "horizontal";
  document.getElementById("reverseText").addEventListener("click", () => {
    if (reverseState === "horizontal") {
      textArea.value = textArea.value.split("").reverse().join("");
      document.getElementById("reverseText").textContent =
        "Revrs verti lines ↕️";
      reverseState = "vertical";
    } else {
      textArea.value = textArea.value.split("\n").reverse().join("\n");
      document.getElementById("reverseText").textContent = "Revrs hori txt ⏪";
      reverseState = "horizontal";
    }
    updateStats();
  });
  //

  document.getElementById("generatePassword").addEventListener("click", () => {
    const length = Math.floor(Math.random() * 10) + 8; // Random length between 8 and 17
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    textArea.value += (textArea.value ? "\n" : "") + password;
    updateStats();
  });
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

  document
    .getElementById("removePrecedingZeros")
    .addEventListener("click", () => {
      textArea.value = textArea.value.replace(/\b0+(\d+)/g, "$1");
      updateStats();
    });
  //

  document
    .getElementById("removeDhivehiDiacritics")
    .addEventListener("click", () => {
      textArea.value = textArea.value.replace(/[\u07A6-\u07B0]/g, "");
      updateStats();
    });
  //

  document.getElementById("removePunctuation").addEventListener("click", () => {
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
      textArea.value = textArea.value.replace(
        /\(\d+\)|\[\d+\]|⁽[⁰¹²³⁴⁵⁶⁷⁸⁹]+⁾/g,
        ""
      );
      updateStats();
    });
  //

  document
    .getElementById("removeDuplicateLines")
    .addEventListener("click", () => {
      const lines = textArea.value.split("\n");
      const uniqueLines = [...new Set(lines)];
      textArea.value = uniqueLines.join("\n");
      updateStats();
    });
  //

  document.getElementById("splitIntoWords").addEventListener("click", () => {
    const words = textArea.value.match(/\S+/g) || [];
    textArea.value = words.join("\n");
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

  const numberStyles = [
    ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    ["𝟢", "𝟣", "𝟤", "𝟥", "𝟦", "𝟧", "𝟨", "𝟩", "𝟪", "𝟫"],
    ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"],
    ["𝟬", "𝟭", "𝟮", "𝟯", "𝟰", "𝟱", "𝟲", "𝟳", "𝟴", "𝟵"],
    ["⓪", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"],
    ["⓿", "❶", "❷", "❸", "❹", "❺", "❻", "❼", "❽", "❾"],
  ];
  let currentStyleIndex = 0;
  document.getElementById("convertNumbers").addEventListener("click", () => {
    const currentStyle = numberStyles[currentStyleIndex];
    const nextStyle =
      numberStyles[(currentStyleIndex + 1) % numberStyles.length];
    let newText = textArea.value;
    for (let i = 0; i < 10; i++) {
      const regex = new RegExp(currentStyle[i], "g");
      newText = newText.replace(regex, nextStyle[i]);
    }
    textArea.value = newText;
    currentStyleIndex = (currentStyleIndex + 1) % numberStyles.length;
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
    textArea.value = textArea.value.replace(/ـ/g, "");
    updateStats();
  });
  //

  document.getElementById("shaddaB4Haraka").addEventListener("click", () => {
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
    .getElementById("replaceColonFullstop")
    .addEventListener("click", () => {
      textArea.value = textArea.value.replace(/:/g, ".");
      updateStats();
    });
  //

  //
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
