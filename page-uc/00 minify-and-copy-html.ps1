# Set the current working directory to the directory containing the script
Set-Location -Path $PSScriptRoot

# Define a function to minify HTML files
function MinifyHTML($inputFile, $outputFile) {
    html-minifier --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype $inputFile -o $outputFile
}

# Get all HTML files in the current directory
$files = Get-ChildItem -Filter "*.html"

# Loop through each HTML file
foreach ($file in $files) {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    $inputFile = $file.FullName
    $outputFile = "../page/$($file.Name)"
    MinifyHTML $inputFile $outputFile
    Write-Output "Processed HTML: $($file.Name)"
}

# Function to minify JS using Google Closure Compiler and UglifyJS
function MinifyJS($inputFile, $outputFile) {
    $tempFile = [System.IO.Path]::GetTempFileName()
    $closureOutput = [System.IO.Path]::GetTempFileName()

    # Run Google Closure Compiler
    google-closure-compiler --charset=UTF-8 --js $inputFile --js_output_file $closureOutput

    # Run UglifyJS on the output from Closure Compiler
    uglifyjs $closureOutput -c -m -o $outputFile

    # Clean up temp files
    Remove-Item $tempFile
    Remove-Item $closureOutput
}

# Minify and copy textEditor.js
$textEditorInput = "textEditor.js"
$textEditorOutput = "../page/textEditor.js"

if (Test-Path $textEditorInput) {
    MinifyJS $textEditorInput $textEditorOutput
    Write-Output "Processed JS: textEditor.js"
} else {
    Write-Output "Warning: textEditor.js not found"
}

# Copy 404 to root
Copy-Item "../page/404.html" -Destination "../404.html"

Write-Output "✅ -- ✅ -- DONE -- ✅ -- ✅"