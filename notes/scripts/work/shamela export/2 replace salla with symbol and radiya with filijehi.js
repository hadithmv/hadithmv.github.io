/* cl: using js replace each text with the one underneath it صلى الله عليه وسلم ﷺ رضي الله عنه رَضِيَ اللَّهُ عَنْهُ رضي الله عنها رَضِيَ اللَّهُ عَنْهَا رضي الله عنهما رَضِيَ اللَّهُ عَنْهُمَا رضي الله عنهم رَضِيَ اللَّهُ عَنْهُمْ input file is called "output.html", output file should be called "output-symbols-fili.html
    ["{", "﴿"],
    ["}", "﴾"],
    ["\u200C", ""],
 */

const fs = require("fs");

// Read the input file
fs.readFile("output.html", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  // Define the replacements
  const replacements = [
    ["صلى الله عليه وسلم", "ﷺ"],
    ["رضي الله عنه", "رَضِيَ اللَّهُ عَنْهُ"],
    ["رضي الله عنها", "رَضِيَ اللَّهُ عَنْهَا"],
    ["رضي الله عنهما", "رَضِيَ اللَّهُ عَنْهُمَا"],
    ["رضي الله عنهم", "رَضِيَ اللَّهُ عَنْهُمْ"],
    ["{", "﴿"],
    ["}", "﴾"],
    ["\u200C", ""],
    // ووي رحمه الله
  ]; // ش

  // Perform the replacements
  let modifiedData = data;
  for (const [search, replace] of replacements) {
    modifiedData = modifiedData.replace(new RegExp(search, "g"), replace);
  }

  // Write the modified content to the output file
  fs.writeFile("output-symbols-fili.html", modifiedData, "utf8", (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log(
      "Replacements completed. Output saved to output-symbols-fili.html"
    );
  });
});
