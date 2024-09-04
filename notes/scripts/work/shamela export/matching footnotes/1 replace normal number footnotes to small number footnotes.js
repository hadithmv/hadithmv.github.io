/* cg: write js code to replace all single or double digits within curved brackets only at the start of a line, such as: (1) (6) (99) to footnote like characters like the following ⁽¹⁾ ⁽⁶⁾ ⁽⁹⁹⁾ input file is called "output-text.html", output file should be called "actual-footnotes.txt"
 */

const fs = require("fs");

// Read the input file
fs.readFile("output-text.html", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  // Define the replacement function
  const replaceNumbers = (match, p1) => {
    const superscriptDigits = "⁰¹²³⁴⁵⁶⁷⁸⁹";
    return (
      "⁽" +
      p1
        .split("")
        .map((d) => superscriptDigits[parseInt(d)])
        .join("") +
      "⁾"
    );
  };

  // Perform the replacement
  const result = data.replace(/^\((\d{1,2})\)/gm, replaceNumbers);

  // Write the result to the output file
  fs.writeFile("footnotes.txt", result, "utf8", (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("File has been successfully processed and saved.");
  });
});
