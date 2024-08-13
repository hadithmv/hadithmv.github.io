# Change the current directory to the script's location
Set-Location -Path $PSScriptRoot

# Get all .js files in the current directory
$jsFiles = Get-ChildItem -Filter *.js
# Loop through each .js file
foreach ($file in $jsFiles) {
    # Generate the output file name
    $outputFile = $file.BaseName + "-c.min.js"
    
    # Run Google Closure Compiler on the file
    & google-closure-compiler --charset=UTF-8 --js $file.Name --js_output_file $outputFile
    
    # Output progress
    Write-Host "Minified $($file.Name) to $outputFile"
}

Write-Host "Minification complete."