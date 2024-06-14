/*

write js code to remove columns 2, 6 and 7 from a 2d json object, the input file is called "words.json"
the output file should be called "words-noEmptyCols.json"
//
Error parsing JSON data: TypeError: row.splice is not a function
//
in addition to that there is also another json file called meanings.json, the following columns need to be removed from it: 1, 4, 6, 14, 16, 17, 20, 21 the output of that needs to be meanings-colsRemoved.json so now we are inputting two files, and outputting two files
//
during this code, when it is processing the words.json into words-colsRemoved.json, it should replace the string "none" with ""
//
i want you to remove the first row of the meanings.json during this script

*/

const fs = require("fs");

// Function to remove specified columns from a row
const removeColumns = (row, columnsToRemove) => {
  for (let i = columnsToRemove.length - 1; i >= 0; i--) {
    const columnIndex = columnsToRemove[i];
    row.splice(columnIndex, 1);
  }
  // return row;
  // Replace null values with empty strings
  return row.map((value) => (value === null ? "" : value));
};

// Function to replace "none" with ""
const replaceNoneWithEmptyString = (value) => {
  return value === "none" ? "" : value;
};

// Process "words.json"
const processWordsFile = () => {
  const inputFile = "words.json";
  const outputFile = "words-colsRemoved.json";
  const columnsToRemove = [1, 4, 5]; // Columns 2, 6, and 7 (indexes 1, 4, 5)

  fs.readFile(inputFile, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading file ${inputFile}: ${err}`);
      return;
    }

    try {
      const jsonData = JSON.parse(data);

      // Remove specified columns and replace "none" with ""
      const modifiedData = jsonData.map((obj) => {
        const row = Object.values(obj).map(replaceNoneWithEmptyString);
        return removeColumns(row, columnsToRemove);
      });

      fs.writeFile(
        outputFile,
        JSON.stringify(modifiedData, null, 2),
        "utf8",
        (err) => {
          if (err) {
            console.error(`Error writing file ${outputFile}: ${err}`);
          } else {
            console.log(
              `Columns removed and "none" replaced successfully from ${inputFile}. Modified data saved to ${outputFile}`
            );
          }
        }
      );
    } catch (jsonError) {
      console.error(`Error parsing JSON data: ${jsonError}`);
    }
  });
};

// Process "meanings.json"
const processMeaningsFile = () => {
  const inputFile = "meanings.json";
  const outputFile = "meanings-colsRemoved.json";
  const columnsToRemove = [0, 3, 5, 13, 14, 15, 16, 19, 20]; // Columns to remove

  fs.readFile(inputFile, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading file ${inputFile}: ${err}`);
      return;
    }

    try {
      const jsonData = JSON.parse(data);

      // Remove specified columns and exclude the first row
      const modifiedData = jsonData.slice(1).map((obj) => {
        const row = Object.values(obj);
        return removeColumns(row, columnsToRemove);
      });

      fs.writeFile(
        outputFile,
        JSON.stringify(modifiedData, null, 2),
        "utf8",
        (err) => {
          if (err) {
            console.error(`Error writing file ${outputFile}: ${err}`);
          } else {
            console.log(
              `Columns removed successfully from ${inputFile}. Modified data saved to ${outputFile}`
            );
          }
        }
      );
    } catch (jsonError) {
      console.error(`Error parsing JSON data: ${jsonError}`);
    }
  });
};

// Run the processing for both files
processWordsFile();
processMeaningsFile();
