0 Note: you dont want to remove the stuff above and below body text in the doc, because that will reset the footnote starting count

1 place ** where new rows are supposed to start in the word file.

2 save word file as plain txt, unicode utf 8.

3 upload that txt file in google sheets, check if there are any columns other than first, if so resolve (usually footnote text at this point, NOTE, can copy it from unwanted column if its just one or two cells, but if its in multiple cells spanning the entire row, copy the out of place text, search in word, find the rest of it, copy the necessary, paste in first column, delete rest of the row), then remove all other columns but first

4 download as EXCEL file, find and select, go to special, blanks. then in "cells" menu, click delete, delete cells, shift cells up. 

copy the excel column, paste in new text file called input.txt

5 save as plain text called input.txt

6 run processBodyText.js

ignore...
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

...

7 upload output.txt to a google sheet
remove rows above BODY CONTENT text,
check if there are any columns other than first, if so resolve (IGNORE out of place footnote text)
then remove all other columns but first, delete extra bottom rows

8 download as csv, convert to json via papaparse.

9 !!! open json content in vscode, replace "#" with "\n" (without quotes, and make sure regex is OFF)
save as input.json

10 convert to csv
use either papaparse unparse, or below:
	/ https://www.convertcsv.com/json-to-csv.htmdont include header in first row

11 download, upload to google sheets
data cleanup, remove extra columns and rows, trim whitespace

this gets you the dv body text column. now regular copy paste (not plain without formatting) column over to final db table sheet

check whether a row is missing, and fix. maybe you forgot to put a ** somewhere

everything should fit. as for the last row, it will contain footnotes, and maybe fihristh if that was present but fihristh is not needed

...

NEXT PART

1 as for footnotes, you can find them in the initial plain text file we made in step 5: input.txt (?it should also be in the last cell of the most recently processed google sheet?)

2 look for the first footnote to know where to begin. for example, it could be [3] or (6)

3 from that number, til the end of the doc, copy the text, save it in a new text file called footnotes.txt (no need for " characters)

4 ?replace "\n" with "#" (?? is this step even needed/relevant now?)

5 get just the column of dv text we made, no extra columns, no footnote text, convert just that data to json, and save as addfootnotestothis.json.

6 run processFootnotesSquareBr.js
//or the circularBr if thats relevant
//or the noBr
(! modified the processFootnotes script code for different instances of brackets or no brackets, had to make sure it didn't mess up the non initial numbers in the case of the no brackets at all version)

it should give output.json

ignore...
... prompt was

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

...END PROMPT


7 convert json to csv
use papaparse unparse, or:
	table convert (in which case: dont include header in first row)
remove bottom empty rows
trim whitespace

8 import to google sheets. you now have the footnotes column that correctly matches body. copy the footnotes column as is to the main table.

replace these if necessary:
ﵞ
﴾

ﵟ
﴿

صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ


remove all those temporary google sheets created

maybe script a big number footnote number to ⁽¹⁾ later



