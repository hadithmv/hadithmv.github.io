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
"quranBetaqat",
"quranHmv",
"quranJaufar",
"quranMuhammad",
"quranMukhtasar",
"quranMuyassar",
"quranMuyassarGhareeb",
"quranQiraaath",
"quranRasmee",
"quranSadi",
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

#

#

# OLD:

<#
function MinifyHTML($inputFile, $outputFile) {
 html-minifier --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype $inputFile -o $outputFile
}

MinifyHTML "akhbaruShuyukh.html" "../books/akhbaruShuyukh.html"
MinifyHTML "akhlaqHamalathilQuran.html" "../books/akhlaqHamalathilQuran.html"
MinifyHTML "allAqida.html" "../books/allAqida.html"
MinifyHTML "allAthar.html" "../books/allAthar.html"
MinifyHTML "aqidatuRaziyain.html" "../books/aqidatuRaziyain.html"
MinifyHTML "aqidahNawawi.html" "../books/aqidahNawawi.html"
MinifyHTML "sharhuSunnahBarbahari.html" "../books/sharhuSunnahBarbahari.html"
MinifyHTML "sharhuSunnahBarbahari-DFK.html" "../books/sharhuSunnahBarbahari-DFK.html"
MinifyHTML "bulughulMaram.html" "../books/bulughulMaram.html"
MinifyHTML "bulughulMaramFull.html" "../books/bulughulMaramFull.html"
MinifyHTML "arbaoonNawawi.html" "../books/arbaoonNawawi.html"
MinifyHTML "arbaoonAajurry.html" "../books/arbaoonAajurry.html"
MinifyHTML "hisnulMuslim.html" "../books/hisnulMuslim.html"
MinifyHTML "kitabulEmanAbiUbaid.html" "../books/kitabulEmanAbiUbaid.html"
MinifyHTML "kunnaasha.html" "../books/kunnaasha.html"
MinifyHTML "index.html" "../books/index.html"
MinifyHTML "muwattaMalik.html" "../books/muwattaMalik.html"
MinifyHTML "radheefNanfoiy.html" "../books/radheefNanfoiy.html"
MinifyHTML "nawaqidulislam.html" "../books/nawaqidulislam.html"
MinifyHTML "qawaidulArbau.html" "../books/qawaidulArbau.html"
MinifyHTML "quranBakurube.html" "../books/quranBakurube.html"
MinifyHTML "quranBetaqat.html" "../books/quranBetaqat.html"
MinifyHTML "quranHmv.html" "../books/quranHmv.html"
MinifyHTML "quranJaufar.html" "../books/quranJaufar.html"
MinifyHTML "quranMuhammad.html" "../books/quranMuhammad.html"
MinifyHTML "quranMukhtasar.html" "../books/quranMukhtasar.html"
MinifyHTML "quranMuyassar.html" "../books/quranMuyassar.html"
MinifyHTML "quranMuyassarGhareeb.html" "../books/quranMuyassarGhareeb.html"
MinifyHTML "quranQiraaath.html" "../books/quranQiraaath.html"
MinifyHTML "quranRasmee.html" "../books/quranRasmee.html"
MinifyHTML "quranSadi.html" "../books/quranSadi.html"
MinifyHTML "quranSoabuni.html" "../books/quranSoabuni.html"
MinifyHTML "radheefAll.html" "../books/radheefAll.html"
MinifyHTML "radheefEegaal.html" "../books/radheefEegaal.html"
MinifyHTML "radheefManiku.html" "../books/radheefManiku.html"
MinifyHTML "radheefRasmee.html" "../books/radheefRasmee.html"
MinifyHTML "riyaduSaliheen.html" "../books/riyaduSaliheen.html"
MinifyHTML "umdathulAhkam.html" "../books/umdathulAhkam.html"
MinifyHTML "quranUshru.html" "../books/quranUshru.html"
MinifyHTML "usooluSiththa.html" "../books/usooluSiththa.html"
MinifyHTML "usooluSunnahAhmed.html" "../books/usooluSunnahAhmed.html"
MinifyHTML "usooluThalaatha.html" "../books/usooluThalaatha.html"

# OLDER

# copies index page over to layout index dir
#>
# Set-Location -Path $PSScriptRoot #C:/Users/ashraaf/Downloads/VScode/hadithmv.github.io/uc
# html-minifier --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype akhbaruShuyukh.html -o ../books/akhbaruShuyukh.html


# minifies (commented out below line because it copies over the whole dir, including test files)
# html-minifier --input-dir $PSScriptRoot --output-dir ../books --file-ext html --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype