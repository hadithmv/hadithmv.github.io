/* cl: with js, change all numbers with dashes at the beginning of any new line to Arabic numbers, such as "1 - " should be "١ - " and "414 - " should be "٤١٤ - ". input file is called "input.html". output file should be called "output.html"
your code is deleting any text that comes after a new line that does not start with a number followed by a space then a dash then a space
*/

const fs = require("fs");

// Function to convert Western Arabic numerals to Eastern Arabic numerals
function toArabicNumerals(num) {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num.replace(/\d/g, (d) => arabicNumerals[d]);
}

// Read the input file
fs.readFile("input.html", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading input file:", err);
    return;
  }

  // Add "###" to the beginning of lines that don't start with a number followed by " - "
  let modifiedData = data.replace(/^(?!\d+ - )/gm, "###$&");

  // Replace numbers at the beginning of lines with Arabic numerals
  modifiedData = modifiedData.replace(/^(\d+)\s*-/gm, (match, number) => {
    return toArabicNumerals(number) + " -";
  });

  // Write the modified content to the output file
  fs.writeFile("output.html", modifiedData, "utf8", (err) => {
    if (err) {
      console.error("Error writing output file:", err);
      return;
    }
    console.log("Conversion completed. Output written to output.html");
  });
});
