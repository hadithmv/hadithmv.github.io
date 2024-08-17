/*
write js code to replace all single or double footnote digits within footnote brackets, such as: ⁽¹⁾ ⁽⁶⁾ ⁽⁹⁹⁾ to regular numbers in square brackets like the following [1] [6] [99] first input file is called "addfootnotestothis.json", its output file should be called "addfootnotestothis.json" second input file is called "footnotes.txt", its output file should be called "footnotes.txt"
*/

const fs = require("fs");

function replaceFootnotes(inputFile, outputFile) {
  // Read the input file
  fs.readFile(inputFile, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading ${inputFile}:`, err);
      return;
    }

    // Replace the footnote digits
    const replacedData = data.replace(/⁽([¹²³⁴⁵⁶⁷⁸⁹⁰]+)⁾/g, (match, p1) => {
      // Convert superscript digits to regular digits
      const normalDigits = p1.replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰]/g, (d) =>
        "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(d)
      );
      return `[${normalDigits}]`;
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
replaceFootnotes("addfootnotestothis.json", "addfootnotestothis.json");

// Process the second file
replaceFootnotes("footnotes.txt", "footnotes.txt");
