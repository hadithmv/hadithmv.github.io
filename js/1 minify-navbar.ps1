# Set the location to the script's directory
Set-Location -Path $PSScriptRoot

# Read the content of navbar.js
$navbarJs = Get-Content -Path "navbar.js" -Raw -Encoding UTF8

# Read and minify the content of navbar.html
$navbarHtml = Get-Content -Path "navbar.html" -Raw -Encoding UTF8
$minifiedHtml = $navbarHtml -replace "`r`n", "" -replace "\s+", " "

# Replace the content between backticks in navbar.js
$modifiedJs = $navbarJs -replace '(?<=document\.getElementById\("navbar-container"\)\.innerHTML = `).*?(?=`)', $minifiedHtml

# Save the modified JS to a temporary file
$tempFile = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($tempFile, $modifiedJs, [System.Text.Encoding]::UTF8)

# Run Google Closure Compiler
$closureOutput = [System.IO.Path]::GetTempFileName()
& google-closure-compiler --charset=UTF-8 --js $tempFile --js_output_file $closureOutput

# Check if Closure Compiler was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Google Closure Compiler failed. Check the compiler output for details."
    exit 1
}

# Run UglifyJS
& uglifyjs $closureOutput -c -m -o "navbar.min.js"

# Check if UglifyJS was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: UglifyJS failed. Check the UglifyJS output for details."
    exit 1
}

# Clean up temporary files
Remove-Item -Path $tempFile
Remove-Item -Path $closureOutput

Write-Host "Minification complete. Output saved to navbar.min.js"