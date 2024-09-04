# Set the current working directory to the directory containing the script
Set-Location -Path $PSScriptRoot

# Define a function to minify HTML files
function MinifyHTML($inputFile, $outputFile) {
 # Use html-minifier with various options to minify the HTML file
 html-minifier --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype $inputFile -o $outputFile
}

# Define an array of file names to be processed (without the .html extension)
$files = @(
"akhbaruShuyukh",
"akhlaqHamalathilQuran",
"allAqida",
"allAthar",
"akhbaruShuyukh",
"akhlaqHamalathilQuran",
"allAqida",
"allAthar",
"aqidatuRaziyain",
"aqidahNawawi",
"sharhuSunnahBarbahari",
"sharhuSunnahBarbahari-DFK",
"bulughulMaram",
"bulughulMaramFull",
"arbaoonNawawi",
"arbaoonAajurry",
"hisnulMuslim",
"kitabulEmanAbiUbaid",
"kunnaasha",
"index",
"muwattaMalik",
"radheefNanfoiy",
"nawaqidulislam",
"qawaidulArbau",
"quranBakurube",
"quranHadithmv",
"quranJaufar",
"quranSoabuni",
"radheefAll",
"radheefEegaal",
"radheefManiku",
"radheefRasmee",
"riyaduSaliheen",
"umdathulAhkam",
"quranUshru",
"usooluSiththa",
"usooluSunnahAhmed",
"usooluThalaatha"
)

# "quranMuhammad",
# "quranBetaqat",
# "quranMukhtasar",
# "quranMuyassar",
# "quranMuyassarGhareeb",
# "quranQiraaath",
# "quranRasmee",
# "quranSadi",

# Loop through each file in the array
foreach ($file in $files) {
 # Construct the input file path by adding .html to the file name
 $inputFile = "$file.html"
 # Construct the output file path, placing the file in the ../books/ directory
 $outputFile = "../books/$file.html"
 # Call the MinifyHTML function to process the file
 MinifyHTML $inputFile $outputFile
 # Print a message indicating that the file has been processed
 Write-Output "Processed: $file.html"
}

# SEPARATE

# copies index page over to layout index dir
Copy-Item "../books/index.html" -Destination "../_layouts/index.html"

Write-Output "✅ -- ✅ -- DONE -- ✅ -- ✅"

#

#

# OLD:

<#
function MinifyHTML($inputFile, $outputFile) {
 html-minifier --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype $inputFile -o $outputFile
}

MinifyHTML "akhbaruShuyukh.html" "../books/akhbaruShuyukh.html"
MinifyHTML "akhlaqHamalathilQuran.html" "../books/akhlaqHamalathilQuran.html"
MinifyHTML "allAqida.html" "../books/allAqida.html"...

# OLDER

# copies index page over to layout index dir
#>
# Set-Location -Path $PSScriptRoot #C:/Users/ashraaf/Downloads/VScode/hadithmv.github.io/uc
# html-minifier --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype akhbaruShuyukh.html -o ../books/akhbaruShuyukh.html


# minifies (commented out below line because it copies over the whole dir, including test files)
# html-minifier --input-dir $PSScriptRoot --output-dir ../books --file-ext html --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype