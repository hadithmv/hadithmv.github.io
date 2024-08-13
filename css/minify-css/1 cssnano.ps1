# Change the current directory to the script's location
Set-Location -Path $PSScriptRoot

# Define the target directory
$targetDir = "C:\Users\ashra\AppData\Roaming\npm\node_modules"

# Get all .css files in the current directory
$cssFiles = Get-ChildItem -Filter *.css

# Loop through each .css file
foreach ($file in $cssFiles) {
    # Define the target path for copying
    $targetPath = Join-Path -Path $targetDir -ChildPath $file.Name
    
    # Copy the .css file to the target directory
    Copy-Item -Path $file.FullName -Destination $targetPath
    
    # Generate the output file name
    $outputFile = $file.BaseName + "-nano.min.css"
    $outputFilePath = Join-Path -Path $PSScriptRoot -ChildPath $outputFile
    
    # Run postcss on the copied file
    & postcss $targetPath > $outputFilePath
    
    # Delete the original .css file in the target directory
    Remove-Item -Path $targetPath
    
    # Output progress
    Write-Host "Minified $($file.Name) to $outputFile and cleaned up the original file in the target directory."
}

Write-Host "Minification complete."
