/* cl: write js code to replace all single or double digits within curved brackets, such as: (1) (6) (99) to footnote like characters like the following ⁽¹⁾ ⁽⁶⁾ ⁽⁹⁹⁾ input file is called "output-symbols-fili.html", output file should be called "output-footnote-numbers.html"
 */

const fs = require("fs");

// Read the input file
fs.readFile("output-symbols-fili.html", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  // Define the replacement function
  const replaceDigits = (match, p1) => {
    const superscriptMap = {
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

    return (
      "⁽" +
      p1
        .split("")
        .map((digit) => superscriptMap[digit] || digit)
        .join("") +
      "⁾"
    );
  };

  // Perform the replacement
  const result = data.replace(/\((\d{1,2})\)/g, replaceDigits);

  // Write the result to the output file
  fs.writeFile("output-footnote-numbers.html", result, "utf8", (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("File has been successfully processed and saved.");
  });
});
