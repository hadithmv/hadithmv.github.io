const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");

// Get all files in the current directory
fs.readdir(".", (err, files) => {
  if (err) {
    console.error("Error reading directory:", err);
    return;
  }

  // Filter for only JSON files
  const jsonFiles = files.filter(
    (file) => path.extname(file).toLowerCase() === ".json"
  );

  if (jsonFiles.length === 0) {
    console.log("No JSON files found in the current directory.");
    return;
  }

  console.log(`Found ${jsonFiles.length} JSON file(s) to process...`);

  // Process each JSON file
  jsonFiles.forEach((jsonFile) => {
    fs.readFile(jsonFile, "utf8", (err, data) => {
      if (err) {
        console.error(`Error reading file ${jsonFile}:`, err);
        return;
      }

      try {
        // Remove BOM character if present
        if (data.charCodeAt(0) === 0xfeff) {
          data = data.slice(1);
        }

        const jsonData = JSON.parse(data); // Parse JSON
        const csvData = Papa.unparse(jsonData); // Convert to CSV

        // Create output filename by replacing .json extension with .csv
        const outputFile = jsonFile.replace(/\.json$/i, ".csv");

        // Write the CSV data to a file
        fs.writeFile(outputFile, csvData, (err) => {
          if (err) {
            console.error(`Error writing CSV file ${outputFile}:`, err);
          } else {
            console.log(
              `✓ Successfully converted ${jsonFile} to ${outputFile}`
            );
          }
        });
      } catch (error) {
        console.error(`Invalid JSON format in ${jsonFile}:`, error);
      }
    });
  });
});

/*
I see the issue with your JSON file. The error "Unexpected token '﻿'" suggests there's a Byte Order Mark (BOM) character at the beginning of your file that's causing the JSON parser to fail.
Here's how to fix this issue:
Fixed JSON Parser with BOM handlingClick to open codeTap to open
The problem is that your JSON file has a BOM (Byte Order Mark) character at the beginning. This is an invisible character that some text editors add to indicate the encoding of the file, especially when saving files with Unicode text (like your Dhivehi text).
The fix adds a check to remove this character if it exists before parsing the JSON. The line if (data.charCodeAt(0) === 0xFEFF) detects if the BOM character is present, and if so, removes it with data.slice(1).
Alternatively, you could:

Save your input.json file without the BOM character by using a different text editor or setting your current editor to save without BOM
Use a tool like Notepad++ which lets you explicitly save files as "UTF-8 without BOM"

Your JSON data itself looks valid - it's just that extra character at the beginning causing the issue.
*/
