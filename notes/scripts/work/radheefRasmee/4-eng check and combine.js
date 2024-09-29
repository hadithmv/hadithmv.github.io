/*

write js code to, where there's a 2d json object array file called combineTables.json. it has 15 columns, 

remove trailing spaces fom the 11th and 13th columns

then i want you to create a new column at the end, and compare the values of the 11th and 13th column, if they are the same, then copy either of those values into the new column at the same row, but if they are different values, then concatenate them with ", ". if one of the values is an empty string and the other is not an empty string, only keep the one that is not empty

output file should be called preFinal.json

//

i want you to remove the first column

the following should only be done after the previous concatenation process is done:
after the creation of the 16th column as instructed is finished, you should then remove the 2nd and 14th columns, as well as the 1st column, also switch the places of the last two columns with each other
*/

const fs = require("fs");

const inputFileName = "combineTables.json";
const outputFileName = "preFinal.json";

// Read the JSON file
fs.readFile(inputFileName, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading input file:", err);
    return;
  }

  // Parse the JSON data
  const jsonData = JSON.parse(data);

  // Process the data
  jsonData.forEach((row) => {
    // Remove trailing spaces from the 11th and 13th columns
    row[10] = row[10].trim();
    row[12] = row[12].trim();

    // Compare values of the 11th and 13th columns
    if (row[10] === row[12]) {
      // If they are the same, copy either value to a new column
      row.push(row[10]);
    } else {
      // If they are different, concatenate with ", "
      if (row[10] !== "" && row[12] !== "") {
        row.push(row[10] + ", " + row[12]);
      } else {
        // If one is empty, keep the non-empty one
        row.push(row[10] || row[12]);
      }
    }
  });

  // Convert the processed data back to JSON
  const processedJsonData = JSON.stringify(jsonData, null, 2);

  // Write the processed data to a new JSON file
  fs.writeFile(outputFileName, processedJsonData, "utf8", (err) => {
    if (err) {
      console.error("Error writing output file:", err);
    } else {
      console.log("Processing complete. Output written to", outputFileName);
    }
  });
});
