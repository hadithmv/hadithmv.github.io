place ** where new rows are supposed to start in the word file.

save word file as plain txt, unicode utf 8.

open in google sheets, remove columns after first column, check if they have text first

download as excel file, find and select, go to special, blanks. then in "cells" menu, click delete. save as plain text called input

...

i have text file that looks somewhat like this:

ދަންނާށެވެ! އިސްލާމްދީނަކީ ސުންނަތެވެ. އަދި ސުންނަތަކީ އިސްލާމްދީނެވެ. އެއިން އެއްކަމެއްވެސް އަނެއްކަމާއި ލައިގެން މެނުވީ ޤާއިމްނުވާހުއްޓެވެ.[5]
**
ފަހެ ސުންނަތުގެ ތެރޭގައި: ޖަމާޢަތުގައި ލާޒިމްވެހުރުން ހިމެނެއެވެ. ޖަމާޢަތް ފިޔަވައި އެހެން އެއްޗަކަށް އެދުންވެރިވެ އެޖަމާޢަތާއި ވަކިވެގަނެއްޖެމީހާ ފަހެ އިސްލާމްކަމުގެ އުޅައްގަނޑު އޭނާގެ ކަރުން މަހާ އެއްލާލައިފިއެވެ. އަދި އޭނާ ވާހުށީ މަގުފުރެދިގެންވާ މަގުފުރައްދަނިވި މީހެއްކަމުގައިއެވެ.[6]**
އަދި އެކަމެއްގެ މަތީގައި ޖަމާޢަތް ބިނާވެގެންވާ އަސާސަކީ އަދި އެޖަމާޢަތަކީ: މުޙައްމަދު صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ ގެ އަޞްޙާބުންނެވެ. -އެހުރިހާ ބޭކަލުންނަށް އެކަލާނގެ ރަޙްމަތްލައްވާށިއެވެ- އަދި އެބޭކަލުންނީ އަހުލުއްސުންނާ ވަލްޖަމާޢަތެވެ. ފަހެ އެބޭކަލުންގެ އަރިހުން (ހިދާޔަތާއި މަގު) ނުނަގާ މީހާ، ހަމަކަށަވަރުންވެސް މަގުފުރެދިގަނެ ބިދުޢަ ހަދައިފިއެވެ. އަދި ކޮންމެ ބިދުޢައަކީ މަގުފުރެދުމެކެވެ. އަދި ކޮންމެ މަގުފުރެދުމަކާއި އޭގެ އަހުލުވެރިންވަނީ ނަރަކާގައިއެވެ.[7]

...

every new line should join the line before and after that, with a "#" in between them

after that is done, every "**" should be replaced with a new line

input file is called "input.txt"

output file should be called "output.txt"

do it in js

...


open output text in excel. check if any data is in another column. if that data is from footnote, it doesnt matter.

copy plain paste the first column onto google sheets.

download as csv, convert to json via papaparse.

open json in vscode, replace "#" with "\n" (make sure regex is off)

convert to csv
https://www.convertcsv.com/json-to-csv.htm
dont include header in first row

import to google sheets
data cleaup, trim whitespace

regular copy paste (not plain paste) column over to final db table sheet

check whether a row is missing, and fix. maybe you forgot to put a ** somewhere

everything should fit. as for the last row, it will contain footnotes, and maybe fihristh if that was present

...

as for footnotes, you can find them in the initial plain text file we made

look for "[1]" to know where it begins

copy that text over to a new text file called footnotes.txt

replace "\n" with "#"

...

i have a json file 2d array file called "input.json"

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

...

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

...

remove the

column2 row1 data
it might exist in more than 1 place

at the beginning

convert json to csv
dont include header in first row

import to google sheets



