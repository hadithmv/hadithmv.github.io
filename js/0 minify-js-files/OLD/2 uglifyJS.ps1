# Change the current directory to the script's location
Set-Location -Path $PSScriptRoot

# Get all relevant files in the current directory
$jsFiles = Get-ChildItem -Filter *.js

# Loop through each relevant file
foreach ($file in $jsFiles) {
    # Generate the output file name
    $outputFile = $file.BaseName + "-uglify.min.js"
    
    # Minify the file
    & uglifyjs $file.Name -c -m -o $outputFile
    
    # Output progress
    Write-Host "Minified $($file.Name) to $outputFile"
}

Write-Output "✅ -- ✅ -- DONE -- ✅ -- ✅"
