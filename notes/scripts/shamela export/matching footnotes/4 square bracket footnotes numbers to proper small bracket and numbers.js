/*
now write code to do the reverse
*/

const fs = require("fs");

function reverseFootnotes(inputFile, outputFile) {
  // Read the input file
  fs.readFile(inputFile, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading ${inputFile}:`, err);
      return;
    }

    // Replace the footnote digits
    const replacedData = data.replace(/\[(\d+)\]/g, (match, p1) => {
      // Convert regular digits to superscript digits
      const superscriptDigits = p1.replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);
      return `⁽${superscriptDigits}⁾`;
    });

    // Write the output file
    fs.writeFile(outputFile, replacedData, "utf8", (err) => {
      if (err) {
        console.error(`Error writing ${outputFile}:`, err);
        return;
      }
      console.log(`Successfully processed ${inputFile} to ${outputFile}`);
    });
  });
}

// Process the first file
reverseFootnotes("output.json", "output-properFootnotes.json");

// Process the second file
// reverseFootnotes('footnotes-p.txt', 'footnotes-reversed.txt');
