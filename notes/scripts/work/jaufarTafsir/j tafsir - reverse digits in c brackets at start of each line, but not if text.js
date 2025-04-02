/*
cgpt

This script now specifically matches and reverses digits enclosed by circular brackets at the start of each line while preserving the rest of the content. Please replace 'input.csv' and 'output.csv' with your actual file paths.

This JavaScript code is designed to process a CSV file, where each line may contain numbers enclosed by circular brackets at the start of the line. It reverses the digits within these circular brackets and saves the modified data to an output CSV file.

Here's a breakdown of what the code does:

It includes the Node.js fs module, which provides file system functions for reading and writing files.

You specify the paths to the input and output CSV files using the inputFilePath and outputFilePath variables. You should replace the placeholders with your actual file paths.

The regular expression pattern regexPattern is defined as ^\((\d+)\). This pattern matches digits enclosed by circular brackets at the start of each line.

The reverseNumbersInText function takes a text input as an argument and uses the replace method to find and reverse the digits within circular brackets at the start of a line. The match parameter in the callback function represents the matched text, which is the entire portion enclosed by circular brackets. It slices off the brackets, reverses the digits, and adds the brackets back to return the modified text.

The processCSV function is the main processing function. It reads the input CSV file using fs.readFile with 'utf8' encoding. If there is an error while reading the file, it logs an error message to the console.

If there are no errors while reading the input CSV file, it splits the data into lines using data.split('\n'). Each line represents a row in the CSV file.

It uses the map method to iterate over each line. For each line, it calls the reverseNumbersInText function to reverse the numbers within circular brackets and then stores the modified line in an array called reversedLines.

After processing all lines, it joins the modified lines back together into a single string, separated by newline characters. This forms the reversedCSV.

Finally, the code writes the reversedCSV to the output CSV file using fs.writeFile with 'utf8' encoding. If there is an error during writing, it logs an error message to the console. Otherwise, it confirms that the modified CSV file has been saved.

The processCSV function is called at the end of the script to start the processing.

The result is that numbers enclosed by circular brackets at the beginning of each line are reversed, and the modified data is saved to the specified output CSV file.
*/

const fs = require("fs");

const inputFilePath = "input.csv"; // Replace with your input file path
const outputFilePath = "output.csv"; // Replace with your output file path

const regexPattern = /^\((\d+)\)/; // Match digits enclosed by circular brackets at the start of each line

function reverseNumbersInText(text) {
  return text.replace(regexPattern, (match) => {
    const reversedNumber = match.slice(1, -1).split("").reverse().join("");
    return `(${reversedNumber})`;
  });
}

function processCSV() {
  fs.readFile(inputFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the input file:", err);
      return;
    }

    const lines = data.split("\n");
    const reversedLines = lines.map((line) => reverseNumbersInText(line));

    const reversedCSV = reversedLines.join("\n");

    fs.writeFile(outputFilePath, reversedCSV, "utf8", (err) => {
      if (err) {
        console.error("Error writing to the output file:", err);
      } else {
        console.log("Modified CSV file saved to", outputFilePath);
      }
    });
  });
}

processCSV();
