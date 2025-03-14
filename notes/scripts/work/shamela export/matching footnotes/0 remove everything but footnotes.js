/* cl: write js to remove everything except these and what is between them: <div class='footnote'> </div> input file is called "input.htm". output file should be called "output.html" Edit */

const fs = require("fs");

// Read the input file
fs.readFile("input.htm", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading input file:", err);
    return;
  }

  // Use regex to match the desired content
  const regex = /<div class='footnote'>([\s\S]*?)<\/div>/g;
  const matches = data.match(regex);

  if (!matches) {
    console.log("No matching content found.");
    return;
  }

  // Join all matches
  const result = matches.join("\n");

  // Write the result to the output file
  fs.writeFile("output.html", result, "utf8", (err) => {
    if (err) {
      console.error("Error writing output file:", err);
      return;
    }
    console.log("output.html file has been saved successfully.");
  });
});
