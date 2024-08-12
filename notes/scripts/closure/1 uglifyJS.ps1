# Change the current directory to the script's location
Set-Location -Path $PSScriptRoot

# Get all .min.js files in the current directory
$jsFiles = Get-ChildItem -Filter *.js

# Loop through each .min.js file
foreach ($file in $jsFiles) {
    # Generate the output file name
    $outputFile = $file.BaseName + "-u.min.js"
    
    # Run Google Closure Compiler on the file
    & uglifyjs $file.Name -c -m -o $outputFile
    
    # Output progress
    Write-Host "Minified $($file.Name) to $outputFile"
}

Write-Host "Minification complete."
