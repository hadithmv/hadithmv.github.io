const fs = require("fs");
const Papa = require("papaparse");

// Read the input CSV file
fs.readFile("input.csv", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading the file:", err);
    return;
  }

  // Parse CSV properly to handle multiline fields and quoted content
  const parsed = Papa.parse(data, {
    header: false,
    skipEmptyLines: false,
    quoteChar: '"',
    escapeChar: '"',
    delimiter: ",",
    newline: "", // Auto-detect newlines
    keepEmptyRows: true,
  });

  if (parsed.errors.length > 0) {
    console.error("CSV parsing errors:", parsed.errors);
  }

  // Regular expression to match numbers within square brackets
  const regex = /\[(\d+)\]/g;

  // Process each cell in the CSV
  const processedData = parsed.data.map((row) => {
    return row.map((cell) => {
      if (typeof cell === "string") {
        // Replace function to increment the number by 7 (as per your comment)
        return cell.replace(regex, (match, number) => {
          const incrementedNumber = parseInt(number, 10) + 7;
          return `[${incrementedNumber}]`;
        });
      }
      return cell;
    });
  });

  // Convert back to CSV format
  const csvOutput = Papa.unparse(processedData, {
    quotes: false, // Only quote when necessary
    quoteChar: '"',
    escapeChar: '"',
    delimiter: ",",
    header: false,
    newline: "\n",
  });

  // Write the updated content to the output CSV file
  fs.writeFile("output.csv", csvOutput, "utf8", (err) => {
    if (err) {
      console.error("Error writing the file:", err);
      return;
    }
    console.log("File has been processed and saved as output.csv");
  });
});
