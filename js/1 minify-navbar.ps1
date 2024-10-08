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

<#
# Set the location to the script's directory
Set-Location -Path $PSScriptRoot

what i want is, i have a file called navbar.js, which i am going to minify with closure and uglify into navbar.min.js

the command to minify is something along the lines of,
google-closure-compiler --charset=UTF-8 --js sourceFile --js_output_file File1
    uglifyjs File1 -c -m -o File2

but before that, note that in navbar.js there is this kind of code:
...
...
document.getElementById("navbar-container").innerHTML = ``;
...
...

i want to replace the code there, between the first two backticks ` `

i want that code to be replaced with the minified navbar.html code i mentioned before (but dont change the content of the navbar.js file itself) rather the replaced html code should be in the navbar.min.js which should be minified with closure and uglify

do in in powershell, give full code

#>