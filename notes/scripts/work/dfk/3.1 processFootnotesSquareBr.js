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
      console.log("output.json file has been created successfully.");
    });
  });
});

/*

i have a json file 2d array file called "addfootnotestothis.json"
it looks somewhat like this:
  [
    "އަދި (ސުންނަތުގެ ތެރޭގައި) ޤިޔާމަތްދުވަހު ﷲ ތަޢާލާ ފެންނާނޭކަމަށް އީމާންވުންވެއެވެ. (މުއުމިނުން)ގެ ބޯތަކުގައިވާ ލޯތަކުން ސީދާ އެކަލާނގެ ފެންނަހުއްޓެވެ. އަދި އެއްވެސް ފަރްދާއެއް ތަރްޖަމާނެއްނެތި އެކަލާނގެ އެބައިމީހުންގެ ޙިސާބު ބައްލަވާނެތެވެ.[23]",
    "column2 row1 data"
  ],
  [
    "އަދި ޤިޔާމަތްދުވަހުގައިވާ ތިލަފަތަށް އީމާންވުމެވެ. އެތިލަފަތުގައި ހެޔޮކަންތަކާއި ނުބައިކަންތައް މިނެކިރޭހުއްޓެވެ. އެތިލަފަތަށް ދެކިބައާއި މެދުދަނޑި ލިބިގެންވެއެވެ.[24]",
    ""
  ],
  [
    "އަދި ޤަބުރުގެ ޢަޛާބާއި މުންކަރުއާއި ނަކީރު ދެމަލާއިކަތުންނަށް އީމާންވުންވެއެވެ.[25]",
    ""
  ],

i also have a txt file called "footnotes.txt"
it has data similar to the following:
[1] تاريخ بغداد: 13/534 [2] البداية والنهاية: 11/227 [3] طبقات الحنابلة: 2/44-45، المنتظم: 14/14 [4] المنتظم: 14/15

now what i want you to do is, using js, check the first row of the first column in addfootnotestothis.json, if it has a number like so "[4]" then look for that same number within the same brackets in the footnotes.txt, and copy all the text (from that number in the footnotes.txt to right before start of the next such number in footnotes.txt) to the  second column of the corresponding row in addfootnotes.json.
note that a row in the first column can have multiple such numbers. in which case, copy over the first instance of that number and its text from footnotes.txt, and after that, copy the next such number to the same row in the second column, but after the previous copied over number, seperating them with a new line
output should be called "output.json"

that does copy over the text into the second column, but not the number
the output i am getting is:
[
    "ޢީސާ ބްނު މަރްޔަމް عَلَيْهَا السَّلَام ފައިބާވަޑައިގެންފުމަށް ދާންދެން ޚިލާފަތްވަނީ ޤުރައިޝުވަންހައިގެ ތެރޭގައިއެވެ.[41]",
    "ހުރިހާ މުސްލިމުން ކިޔަމަންވާ އެއް ވެރިޔަކުކަމުގައި ޚަލީފާއެއް ކަނޑައެޅުމަކީ ބޮޑުވެގެންވާ ވާޖިބެކެވެ. އަދި އެއްޒަމާނެއްގައި ދެޚަލީފާއިން ތިބުން ހުއްދަވެގެން",
]

when i should be getting:
[
    "ޢީސާ ބްނު މަރްޔަމް عَلَيْهَا السَّلَام ފައިބާވަޑައިގެންފުމަށް ދާންދެން ޚިލާފަތްވަނީ ޤުރައިޝުވަންހައިގެ ތެރޭގައިއެވެ.[41]",
    "[41] ހުރިހާ މުސްލިމުން ކިޔަމަންވާ އެއް ވެރިޔަކުކަމުގައި ޚަލީފާއެއް ކަނޑައެޅުމަކީ ބޮޑުވެގެންވާ ވާޖިބެކެވެ. އަދި އެއްޒަމާނެއްގައި ދެޚަލީފާއިން ތިބުން ހުއްދަވެގެން",
]

*/
