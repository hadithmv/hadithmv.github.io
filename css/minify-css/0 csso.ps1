# Change the current directory to the script's location
Set-Location -Path $PSScriptRoot

# Get all .css files in the current directory
$cssFiles = Get-ChildItem -Filter *.css
# Loop through each .css file
foreach ($file in $cssFiles) {
    # Generate the output file name
    $outputFile = $file.BaseName + "-o.min.css"
    
    # Run CSSO on the file
    & csso $file.Name -o $outputFile
    
    # Output progress
    Write-Host "Minified $($file.Name) to $outputFile"
}

Write-Host "Minification complete."
