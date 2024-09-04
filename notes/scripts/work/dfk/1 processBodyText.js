const fs = require("fs");

// Read the input file
fs.readFile("input.txt", "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  // Join lines with "#"
  let joined = data.replace(/\r?\n/g, "#");

  // Replace "**" with newline
  let result = joined.replace(/\*\*/g, "\n");

  // Write the result to output.txt
  fs.writeFile("output.txt", result, "utf8", (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Output saved to output.txt");
  });
});
