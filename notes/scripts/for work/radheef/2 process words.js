/*

write js 

there are two 2d json object array files
one of them is called  "words-colsRemoved.json" and has 4 columns
and the other is called  "meanings-colsRemoved.json" and has 12 columns


look the first columns of both jsons on a row by row basis, they should match, if meanings-colsRemoved.json has a row that matches more than once with the first column of words-colsRemoved.json, then create a duplicate row of that row of words-colsRemoved.json for each instance

output file of the processed words-colsRemoved.json should be called words-colsRemoved-processed.json

*/

const fs = require("fs");

// Read the JSON files
const wordsData = JSON.parse(fs.readFileSync("words-colsRemoved.json", "utf8"));
const meaningsData = JSON.parse(
  fs.readFileSync("meanings-colsRemoved.json", "utf8")
);

// Create a map to store the occurrences of the first column in meaningsData
const occurrencesMap = new Map();

// Iterate over meaningsData to count occurrences of the first column
meaningsData.forEach((row) => {
  const firstColumnValue = row[0];
  if (!occurrencesMap.has(firstColumnValue)) {
    occurrencesMap.set(firstColumnValue, 1);
  } else {
    occurrencesMap.set(
      firstColumnValue,
      occurrencesMap.get(firstColumnValue) + 1
    );
  }
});

// Process wordsData to create duplicate rows based on occurrences in meaningsData
const processedWordsData = wordsData.flatMap((row) => {
  const firstColumnValue = row[0];
  const occurrences = occurrencesMap.get(firstColumnValue) || 0;

  return Array.from({ length: occurrences }, () => [...row]);
});

// Write the processed data to the output file
fs.writeFileSync(
  "words-colsRemoved-processed.json",
  JSON.stringify(processedWordsData, null, 2)
);

console.log("Processing complete. Check words-colsRemoved-processed.json");
