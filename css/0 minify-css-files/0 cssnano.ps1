# Change the current directory to the script's location
Set-Location -Path $PSScriptRoot

# Get all CSS files in the current directory
$cssFiles = Get-ChildItem -Filter *.css

foreach ($file in $cssFiles) {
    # Generate the output file name
    $outputFile = $file.BaseName + "-nano.min.css"
    
    # Run postcss command for each file
    Write-Output "Minifying $($file.Name)..."
    postcss $file.Name > $outputFile
}

Write-Output "✅ -- ✅ -- DONE -- ✅ -- ✅"


<# OLD CODE

# Change the current directory to the script's location
Set-Location -Path $PSScriptRoot

# Define the target directory
$targetDir = "C:\Users\ashra\AppData\Roaming\npm\node_modules"

# Get all relevant files in the current directory
$cssFiles = Get-ChildItem -Filter *.css

# Loop through each relevant file
foreach ($file in $cssFiles) {
    # Define the target path for copying
    $targetPath = Join-Path -Path $targetDir -ChildPath $file.Name
    
    # Copy the relevant file to the target directory
    Copy-Item -Path $file.FullName -Destination $targetPath
    
    # Generate the output file name
    $outputFile = $file.BaseName + "-nano.min.css"
    $outputFilePath = Join-Path -Path $PSScriptRoot -ChildPath $outputFile
    
    # Minify the copied file
    & postcss $targetPath > $outputFilePath
    
    # Delete the original relevant file in the target directory
    Remove-Item -Path $targetPath
    
    # Output progress
    Write-Host "Minified $($file.Name) to $outputFile and cleaned up the original file in the target directory."
}

Write-Output "✅ -- ✅ -- DONE -- ✅ -- ✅"

#>