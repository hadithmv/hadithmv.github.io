/*

write js code to join two 2d json object array files
one of them is called  "meanings-colsRemoved.json" and has 12 columns, this is the primary data

the other json to be appended is called "words-colsRemoved-processed.json" and has 4 columns

merge the rows of words-colsRemoved-processed.json, to the rows of meanings-colsRemoved.json, by appending each row of words-colsRemoved-processed.json that has a matching first column with meanings-colsRemoved, to each row of meanings-colsRemoved. the same row of words-colsRemoved-processed.json can match more than once with the rows of meanings-colsRemoved, even if that happens, still append them again more than once if need be

after that, any rows of meanings-colsRemoved.json that do not match with words-colsRemoved-processed.json, should have "" values where otherwise words-colsRemoved-processed values would have been, so as not to lose any date from meanings-colsRemoved.json

the combined json should have 15 columns at the end of this merge

output file should be:
combineTables.json

*/

const fs = require("fs");

// Load JSON files
const meaningsData = require("./meanings-colsRemoved.json");
const wordsData = require("./words-colsRemoved-processed.json");

// Create a map for faster lookup
const wordsMap = new Map(wordsData.map((row) => [row[0], row]));

// Merge the rows
const combinedData = meaningsData.map((meaningRow) => {
  const wordRow = wordsMap.get(meaningRow[0]) || Array(4).fill(""); // Filling with "" for non-matching rows
  return [...meaningRow, ...wordRow.slice(1)]; // Append columns from wordsData excluding the first column
});

// Write the combined data to a new file
const outputFileName = "combineTables.json";
fs.writeFileSync(outputFileName, JSON.stringify(combinedData, null, 2));

console.log(`Combined data written to ${outputFileName}`);
