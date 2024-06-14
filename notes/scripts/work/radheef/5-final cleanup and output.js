/*

write js code to, where there's a 2d json object array file called preFinal.json. it has 16 columns, 

change the positions of the last 3 columns as the first 3 columns

after that, remove the 14th and 16th columns as they are now in the data

then remove the current 4th column as it is now in the data

output file should be called radheefRasmee.json

*/

const fs = require("fs");

// Read the preFinal.json file
fs.readFile("preFinal.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading preFinal.json:", err);
    return;
  }

  try {
    // Parse JSON data
    const jsonData = JSON.parse(data);

    // Change positions of last 3 columns to first 3 columns
    jsonData.forEach((row) => {
      const lastThreeColumns = row.splice(-3);
      row.unshift(...lastThreeColumns);
    });

    // Remove the 14th and 16th columns
    jsonData.forEach((row) => {
      row.splice(13, 1); // Removing 14th column
      row.splice(14, 1); // Removing 16th column (as the 14th column was removed)
    });

    // Remove the current 4th column
    jsonData.forEach((row) => {
      row.splice(3, 1);
    });

    // Write the modified data to radheefRasmee.json
    fs.writeFile(
      "radheefRasmee.json",
      JSON.stringify(jsonData, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.error("Error writing radheefRasmee.json:", err);
          return;
        }
        console.log("radheefRasmee.json has been successfully created.");
      }
    );
  } catch (jsonError) {
    console.error("Error parsing JSON from preFinal.json:", jsonError);
  }
});
