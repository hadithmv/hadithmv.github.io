# Change the current directory to the script's location
Set-Location -Path $PSScriptRoot

# Get all relevant files in the current directory
$jsFiles = Get-ChildItem -Filter *.js
# Loop through each relevant file
foreach ($file in $jsFiles) {
    # Generate the output file name
    $outputFile = $file.BaseName + "-closure.min.js"
    
    # Minify the file
    & google-closure-compiler --charset=UTF-8 --js $file.Name --js_output_file $outputFile
    
    # Output progress
    Write-Host "Minified $($file.Name) to $outputFile"
}

Write-Output "✅ -- ✅ -- DONE -- ✅ -- ✅"