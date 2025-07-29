const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");

// Get all files in the current directory
fs.readdir(".", (err, files) => {
  if (err) {
    console.error("Error reading directory:", err);
    return;
  }

  // Filter for only CSV files
  const csvFiles = files.filter(
    (file) => path.extname(file).toLowerCase() === ".csv"
  );

  if (csvFiles.length === 0) {
    console.log("No CSV files found in the current directory.");
    return;
  }

  console.log(`Found ${csvFiles.length} CSV file(s) to process...`);

  // Process each CSV file
  csvFiles.forEach((csvFile) => {
    fs.readFile(csvFile, "utf8", (err, data) => {
      if (err) {
        console.error(`Error reading file ${csvFile}:`, err);
        return;
      }

      try {
        // Remove BOM character if present
        if (data.charCodeAt(0) === 0xfeff) {
          data = data.slice(1);
        }

        // Parse CSV to JSON without treating first row as headers
        Papa.parse(data, {
          header: false, // Don't treat the first row as headers
          complete: (results) => {
            if (results.errors.length > 0) {
              console.error(`Parsing errors in ${csvFile}:`, results.errors);
              return;
            }

            const jsonData = results.data;
            // Create output filename by replacing .csv extension with .json
            const outputFile = csvFile.replace(/\.csv$/i, ".json");

            // Write the JSON data to a file
            fs.writeFile(
              outputFile,
              JSON.stringify(jsonData, null, 2), // Pretty-print with 2-space indentation
              (err) => {
                if (err) {
                  console.error(`Error writing JSON file ${outputFile}:`, err);
                } else {
                  console.log(
                    `✓ Successfully converted ${csvFile} to ${outputFile}`
                  );
                }
              }
            );
          },
          error: (error) => {
            console.error(`Error parsing ${csvFile}:`, error);
          },
        });
      } catch (error) {
        console.error(`Error processing ${csvFile}:`, error);
      }
    });
  });
});
