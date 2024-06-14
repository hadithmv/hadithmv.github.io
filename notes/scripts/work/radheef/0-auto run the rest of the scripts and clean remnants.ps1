<# info first:

mv.edu.dhivehiacademy.radheef

radheefRasmee isnt kept as a google sheet, because its built with date from the source instead

--- INSTRUCTIONS

get base apk, unzip
assets\flutter_assets\assets\data
unzip words and meanings zip files to json

copy them over to this here radheef scripts folder
"words.json" "meanings.json"

NOW RUN THIS FILE

next, just copy over "radheefRasmee.json" to where you need it
and remove "words.json" "meanings.json"
update version no, and db dates on radheef page.

that is all.

#>

#

<# PROMPT:

run the following js files one by one (with numbers and hyphens
):

1-removeUnwantedCols.js
2-create additional rows for words.js
3-merge words and meanings.js
4-eng check and combine.js
5-final cleanup and output.js

next, delete the following files:

words-colsRemoved.json
meanings-colsRemoved.json
words-colsRemoved-processed.json
combineTables.json
preFinal.json

#>

Set-Location -Path $PSScriptRoot

# Run JS files
$jsFiles = @("1-removeUnwantedCols.js", "2-create additional rows for words.js", "3-merge words and meanings.js", "4-eng check and combine.js", "5-final cleanup and output.js")

foreach ($file in $jsFiles) {
    Write-Host "Running $file"
    node $file
}

# Delete files
$filesToDelete = @("words-colsRemoved.json", "meanings-colsRemoved.json", "words-colsRemoved-processed.json", "combineTables.json", "preFinal.json")

# ", "words.json", "meanings.json

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file
        Write-Host "Deleted $file"
    } else {
        Write-Host "$file not found"
    }
}
