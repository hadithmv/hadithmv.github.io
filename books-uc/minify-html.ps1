# HTML Minifier PowerShell Script
# This script minifies an HTML file using the html-minifier npm package
# Make sure Node.js and npm are installed before running this script

# Define the input and output file paths
$inputFile = Join-Path -Path $PWD -ChildPath "testHTML.html"
$outputFile = Join-Path -Path $PWD -ChildPath "minified.html"

# Check if the input file exists
if (-not (Test-Path $inputFile)) {
    Write-Error "Error: Input file 'testHTML.html' not found in the current directory."
    exit 1
}

# Check if html-minifier is installed globally
$htmlMinifierInstalled = $null
try {
    $htmlMinifierInstalled = npm list -g html-minifier
}
catch {
    $htmlMinifierInstalled = $null
}

# Install html-minifier if not already installed
if (-not ($htmlMinifierInstalled -match "html-minifier")) {
    Write-Host "Installing html-minifier npm package globally..."
    try {
        npm install -g html-minifier
    }
    catch {
        Write-Error "Error installing html-minifier. Make sure Node.js and npm are installed."
        exit 1
    }
}

# Minification options for html-minifier
$minifyOptions = @(
    "--collapse-whitespace",
    "--remove-comments",
    "--remove-optional-tags",
    "--remove-redundant-attributes",
    "--remove-script-type-attributes",
    "--remove-tag-whitespace",
    "--use-short-doctype",
    "--minify-css true",
    "--minify-js true"
)

# Create the minify command
$minifyCommand = "html-minifier $($minifyOptions -join ' ') -o `"$outputFile`" `"$inputFile`""

# Execute the minify command using Node.js
Write-Host "Minifying HTML file..."
try {
    Invoke-Expression "cmd /c $minifyCommand"
    
    if (Test-Path $outputFile) {
        $originalSize = (Get-Item $inputFile).Length
        $minifiedSize = (Get-Item $outputFile).Length
        $savingsPercent = [math]::Round(100 - ($minifiedSize / $originalSize * 100), 2)
        
        Write-Host "Minification completed successfully!"
        Write-Host "Original file size: $originalSize bytes"
        Write-Host "Minified file size: $minifiedSize bytes"
        Write-Host "Size reduction: $savingsPercent%"
    }
    else {
        Write-Error "Error: Minification process failed to create output file."
        exit 1
    }
}
catch {
    Write-Error "Error during minification: $_"
    exit 1
}