const fs = require("fs");

// Read the JSON file
fs.readFile("addfootnotestothis.json", "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  let jsonData = JSON.parse(data);

  // Read the footnotes file
  fs.readFile("footnotes.txt", "utf8", (err, footnotesData) => {
    if (err) {
      console.error(err);
      return;
    }

    let footnotes = footnotesData.match(/\[\d+\][^\[\]]+/g);

    // Process the data
    for (let i = 0; i < jsonData.length; i++) {
      let matches = jsonData[i][0].match(/\[\d+\]/g);
      if (matches) {
        for (let j = 0; j < matches.length; j++) {
          let match = matches[j];
          let index = footnotes.findIndex((fn) => fn.startsWith(match));
          if (index !== -1) {
            let footnoteNumber = match.substring(1, match.length - 1);
            let footnoteText = footnotes[index].replace(match, "").trim();
            if (jsonData[i][1]) {
              jsonData[i][1] += "\n[" + footnoteNumber + "] " + footnoteText;
            } else {
              jsonData[i][1] = "[" + footnoteNumber + "] " + footnoteText;
            }
          }
        }
      }
    }

    // Write the output JSON file
    fs.writeFile("output.json", JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Output JSON file has been created successfully.");
    });
  });
});
