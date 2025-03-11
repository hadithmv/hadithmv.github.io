// uses npm papaparse, install it

const fs = require("fs");
const Papa = require("papaparse");

// Read the JSON file
fs.readFile("input.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  try {
    const jsonData = JSON.parse(data); // Parse JSON
    const csvData = Papa.unparse(jsonData); // Convert to CSV

    // Write the CSV data to a file
    fs.writeFile("output.csv", csvData, (err) => {
      if (err) {
        console.error("Error writing CSV file:", err);
      } else {
        console.log("CSV file successfully created: output.csv");
      }
    });
  } catch (error) {
    console.error("Invalid JSON format:", error);
  }
});
