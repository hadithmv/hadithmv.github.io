const fs = require("fs");

// Read the input file
fs.readFile("input.html", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading the input file:", err);
    return;
  }

  // Updated regex to include <sup><font color=#be0000>...</sup> if it appears after </span>
  const regex =
    /<span data-type='title'[^>]*>.*?<\/span>(\s*<sup><font color=#be0000>.*?<\/sup>)?/g;
  const result = data.match(regex);

  // Join the matched results with a <br> after each </span> (and <sup> if present)
  const output = result ? result.join("</span><br>") : "";

  // Write the output to the output file
  fs.writeFile("output.html", output, "utf8", (err) => {
    if (err) {
      console.error("Error writing to the output file:", err);
      return;
    }
    console.log("Output saved to output.html");
  });
});
