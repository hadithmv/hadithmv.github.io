# Change the current directory to the script's location
Set-Location -Path $PSScriptRoot

# Get all relevant files in the current directory
$cssFiles = Get-ChildItem -Filter *.css
# Loop through each relevant file
foreach ($file in $cssFiles) {
    # Generate the output file name
    $outputFile = $file.BaseName + "-csso.min.css"
    
    # Minify the file
    & csso $file.Name -o $outputFile
    
    # Output progress
    Write-Host "Minified $($file.Name) to $outputFile"
}

Write-Output "✅ -- ✅ -- DONE -- ✅ -- ✅"
