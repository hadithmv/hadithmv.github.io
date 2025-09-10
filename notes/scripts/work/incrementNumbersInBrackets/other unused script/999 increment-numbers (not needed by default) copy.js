/*
using js:

i have a csv file called "input"

it has numbers within square brackets like so
[1]

i want you to increment each such number by 5

for example
[1]

becomes
[6]

and so on

output file should be called "output"
*/
const fs = require("fs");

// Read the input CSV file
fs.readFile("input.csv", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading the file:", err);
    return;
  }

  // Regular expression to match numbers within square brackets
  const regex = /\[(\d+)\]/g;

  // Replace function to increment the number by 5
  const updatedData = data.replace(regex, (match, number) => {
    // !!
    const incrementedNumber = parseInt(number, 10) + 7;
    // CHANGE 5 TO WHATEVER NUMBER YOU WANT TO INCREMENT BY

    return `[${incrementedNumber}]`;
  });

  // Write the updated content to the output CSV file
  fs.writeFile("output.csv", updatedData, "utf8", (err) => {
    if (err) {
      console.error("Error writing the file:", err);
      return;
    }
    console.log("File has been processed and saved as output.csv");
  });
});
