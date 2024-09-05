# Set the current working directory to the directory containing the script
Set-Location -Path $PSScriptRoot

# Define a function to minify HTML files
function MinifyHTML($inputFile, $outputFile) {
 # Use html-minifier with various options to minify the HTML file
 html-minifier --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype $inputFile -o $outputFile
}

# Define an array of file names to be processed (without the .html extension)
$files = @(
"lafzuVakikohLiyumugeQawaid"
)

# "add more",

# Loop through each file in the array
foreach ($file in $files) {
 # Construct the input file path by adding .html to the file name
 $inputFile = "$file.html"
 # Construct the output file path, placing the file in the ../books/ directory
 $outputFile = "../page/$file.html"
 # Call the MinifyHTML function to process the file
 MinifyHTML $inputFile $outputFile
 # Print a message indicating that the file has been processed
 Write-Output "Processed: $file.html"
}

# SEPARATE

# copies index page over to layout index dir
Copy-Item "../books/index.html" -Destination "../_layouts/index.html"

Write-Output "✅ -- ✅ -- DONE -- ✅ -- ✅"
