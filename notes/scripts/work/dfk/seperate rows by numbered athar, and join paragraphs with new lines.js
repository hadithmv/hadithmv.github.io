const fs = require('fs');

// Read the input JSON file
fs.readFile('input.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading input file:', err);
    return;
  }

  try {
    // Parse the JSON data
    let jsonData = JSON.parse(data);

    // Modify rows that start with a number followed by a hyphen
    jsonData.forEach(row => {
      for (let key in row) {
        if (row.hasOwnProperty(key) && /^[0-9]+-/.test(row[key])) {
          row[key] = '$$' + row[key]; // Prepend "$$"
        }
      }
    });

    // Write the modified JSON to the output file
    fs.writeFile('output.json', JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Error writing output file:', err);
        return;
      }
      console.log('Output file "output.json" has been successfully created.');
    });

  } catch (error) {
    console.error('Error parsing input JSON:', error);
  }
});