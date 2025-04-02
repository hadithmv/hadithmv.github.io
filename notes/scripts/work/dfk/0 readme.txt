0 Note: you dont want to remove the stuff above and below body text in the doc, because that will reset the footnote starting count

1 place ** where new rows are supposed to start in the word file.
	[NOTE: if it is a numbered sequenced book, like a hadith book, rename the file to "pre-process-numbered-text.txt" and run the script:
	0.5 pre-process-numbered-text.js
	then skip the below step]

2 save word file as plain txt, unicode utf 8.

3 upload that txt file in google sheets, check if there are any columns other than first, if so resolve (usually footnote text at this point, NOTE, can copy it from unwanted column if its just one or two cells, but if its in multiple cells spanning the entire row, copy the out of place text, search in word, find the rest of it, copy the necessary, paste in first column, delete rest of the row), then remove all other columns but first

4 Remove blank rows
google sheets methods:Use your mouse to highlight/select your entire sheet 
Click the filter icon
In column A click the filter drop down
Click "Clear" to clear all values, then click (Blanks) so that it is the only item checked
Click OK
Select all empty rows with your mouse, right-click, and delete
Click the filter icon in the toolbar again to get back to your data
	[EXCEL METHOD: download as EXCEL file, find and select, go to special, blanks. then in "cells" menu, click delete, delete cells, shift cells up.] 

copy the column, paste in new text file called input.txt

5 save as plain text called input.txt

6 run processBodyText.js

...

7 upload output.txt to a google sheet
remove rows above BODY CONTENT text,
check if there are any columns other than first, if so resolve (IGNORE out of place footnote text)
then remove all other columns but first, delete extra bottom rows

8 download as csv, convert to json via powershell / online papaparse
name as input.json

9 !!! open json in vscode
replace "#" with "\n"
(without quotes, and make sure regex is OFF)

10 convert to csv
use js papaparse unparse
	[or: https://www.convertcsv.com/json-to-csv, dont include header in first row if this]

11 download, upload to google sheets
data cleanup, remove extra columns and rows, trim whitespace
save as input.csv

12 convert to json, name as:
addfootnotestothis.json

this gets you the dv body text column. move onto next step
	?SKIP FOR NOW AS NOT FINISHED: now regular copy paste (not plain without formatting) column over to final db table sheet

?if opening and checking the csv: 
?everything should fit. as for the last row, it will contain footnotes, and maybe fihristh if that was present but fihristh is not needed

...

NEXT PART

1 as for footnotes, you can find them in the initial plain text file we made in step 5: input.txt (?it should also be in the last cell of the most recently processed google sheet?)

2 look for the first footnote to know where to begin. for example, it could be [3] or (6)

3 from that number, til the end of the doc, copy the text, save it in a new text file called:
footnotes.txt (?no need for " characters)

	?4 replace "\n" with "#" (?? is this step even needed/relevant now?)

5 get just the column of dv text we made [PREV STEP 12], no extra columns, no footnote text, place in this current folder, its file name would be:
addfootnotestothis.json.

6 run 3.1 processFootnotesSquareBr.js
[NOTE: before that, look at what kind of footnote brackets it has first, after which you might need to use one of the below instead:]
//or the circularBr if thats relevant
//or the noBr
(! modified the processFootnotes script code for different instances of brackets or no brackets, had to make sure it didn't mess up the non initial numbers in the case of the no brackets at all version)

it should give output.json (!! beware of mixup with prev used name, rename this to something else later?)

7 convert json to csv
use papaparse unparse
	(or: table convert ol, in which case: dont include header in first row)

8 import to google sheets. you now have the footnotes column that correctly matches body.

copy the columns AS IS (not values only) to the main table.

remove bottom empty rows, right empty columns, ?trim whitespace

...

replace these if they exist:
ﵞ
﴾

ﵟ
﴿

صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ
ﷺ

remove all those temporary google sheets created

check whether a row break is missing, and fix. maybe you forgot to put a ** somewhere

add incremental page numbers in the google sheet if needed

maybe script a big number footnote number to ⁽¹⁾ later

[remember to add back what is above sequence number 1, if its a sequenced book]



