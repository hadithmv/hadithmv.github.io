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

/*
IGNORE...
... prompt was

i have text file that looks somewhat like this:

ދަންނާށެވެ! އިސްލާމްދީނަކީ ސުންނަތެވެ. އަދި ސުންނަތަކީ އިސްލާމްދީނެވެ. އެއިން އެއްކަމެއްވެސް އަނެއްކަމާއި ލައިގެން މެނުވީ ޤާއިމްނުވާހުއްޓެވެ.[5]
**
ފަހެ ސުންނަތުގެ ތެރޭގައި: ޖަމާޢަތުގައި ލާޒިމްވެހުރުން ހިމެނެއެވެ. ޖަމާޢަތް ފިޔަވައި އެހެން އެއްޗަކަށް އެދުންވެރިވެ އެޖަމާޢަތާއި ވަކިވެގަނެއްޖެމީހާ ފަހެ އިސްލާމްކަމުގެ އުޅައްގަނޑު އޭނާގެ ކަރުން މަހާ އެއްލާލައިފިއެވެ. އަދި އޭނާ ވާހުށީ މަގުފުރެދިގެންވާ މަގުފުރައްދަނިވި މީހެއްކަމުގައިއެވެ.[6]**
އަދި އެކަމެއްގެ މަތީގައި ޖަމާޢަތް ބިނާވެގެންވާ އަސާސަކީ އަދި އެޖަމާޢަތަކީ: މުޙައްމަދު صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ ގެ އަޞްޙާބުންނެވެ. -އެހުރިހާ ބޭކަލުންނަށް އެކަލާނގެ ރަޙްމަތްލައްވާށިއެވެ- އަދި އެބޭކަލުންނީ އަހުލުއްސުންނާ ވަލްޖަމާޢަތެވެ. ފަހެ އެބޭކަލުންގެ އަރިހުން (ހިދާޔަތާއި މަގު) ނުނަގާ މީހާ، ހަމަކަށަވަރުންވެސް މަގުފުރެދިގަނެ ބިދުޢަ ހަދައިފިއެވެ. އަދި ކޮންމެ ބިދުޢައަކީ މަގުފުރެދުމެކެވެ. އަދި ކޮންމެ މަގުފުރެދުމަކާއި އޭގެ އަހުލުވެރިންވަނީ ނަރަކާގައިއެވެ.[7]

every new line should join the line before and after that, with a "#" in between them
after that is done, every "**" should be replaced with a new line
input file is called "input.txt"
output file should be called "output.txt"
do it in js

*/
