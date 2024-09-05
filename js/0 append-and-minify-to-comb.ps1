# Set the location to the script's directory
Set-Location -Path $PSScriptRoot

# Function to minify and append files
function Minify-And-Append {
    param (
        [string]$sourceFile,
        [string]$targetFile
    )
    
    $tempFile1 = "temp1.js"
    $tempFile2 = "temp2.js"
    
    google-closure-compiler --charset=UTF-8 --js $sourceFile --js_output_file $tempFile1
    uglifyjs $tempFile1 -c -m -o $tempFile2
    Add-Content -Path $targetFile -Value "`n// $sourceFile"
    Get-Content -Path $tempFile2 | Add-Content -Path $targetFile
    Remove-Item -Path $tempFile1, $tempFile2
    Write-Output "Minified and copied: $sourceFile"
}

# Function to minify navbar.js
function Minify-Navbar {
    $sourceFile = "navbar.js"
    $tempFile1 = "temp1.js"
    $tempFile2 = "temp2.js"
    
    google-closure-compiler --charset=UTF-8 --js $sourceFile --js_output_file $tempFile1
    uglifyjs $tempFile1 -c -m -o $tempFile2
    
    $minifiedCode = Get-Content -Path $tempFile2 -Raw
    Remove-Item -Path $tempFile1, $tempFile2
    
    return $minifiedCode
}

# Function to insert or update minified navbar.js in HTML files
function Insert-Or-Update-Navbar-In-Html {
    param (
        [string]$minifiedCode,
        [string]$htmlFilePath
    )
    
    $htmlContent = Get-Content -Path $htmlFilePath -Raw
    
    # Check if the placeholder comment exists
    if ($htmlContent -match '<!-- INSERT NAV JS MIN CODE UNDER HERE -->') {
        # Update existing script
        $pattern = '(?s)<!-- INSERT NAV JS MIN CODE UNDER HERE -->\s*<script>.*?</script>'
        $replacement = "<!-- INSERT NAV JS MIN CODE UNDER HERE -->`n<script>$minifiedCode</script>"
        $updatedContent = $htmlContent -replace $pattern, $replacement
    }
    else {
        # Insert new script before closing body tag
        $insertion = "`n<!-- INSERT NAV JS MIN CODE UNDER HERE -->`n<script>$minifiedCode</script>`n"
        $updatedContent = $htmlContent -replace '</body>', "$insertion</body>"
    }
    
    Set-Content -Path $htmlFilePath -Value $updatedContent
    Write-Output "Inserted or updated minified navbar.js in $htmlFilePath"
}

# Clear the content of ALL-COMB.min.js
Clear-Content -Path "ALL-COMB.min.js"
Write-Output "Cleared ALL-COMB.min.js"

# Copy the content of comb-DT.min.js into ALL-COMB.min.js
Get-Content -Path "comb-DT.min.js" | Set-Content -Path "ALL-COMB.min.js"
Write-Output "Copied: comb-DT.min.js"

# List of JavaScript files to minify and append
$jsFiles = @(
    "DT-inline.js",
    "navbar.js",
    "belowPage-bab-dropdown.js",
    "quran-dropdowns.js"
)

# Process each file
foreach ($file in $jsFiles) {
    Minify-And-Append -sourceFile $file -targetFile "ALL-COMB.min.js"
}

# Minify navbar.js
$minifiedNavbarCode = Minify-Navbar

# Get all HTML files in the ..\page-uc\ directory
$htmlFiles = Get-ChildItem -Path "..\page-uc\" -Filter "*.html" -File | Select-Object -ExpandProperty FullName

# Add ..\books-uc\index.html to the list of HTML files
$htmlFiles += "..\books-uc\index.html"

# Insert or update minified navbar.js in each HTML file
foreach ($htmlFile in $htmlFiles) {
    Insert-Or-Update-Navbar-In-Html -minifiedCode $minifiedNavbarCode -htmlFilePath $htmlFile
}

Write-Output "✅ -- ✅ -- DONE -- ✅ -- ✅"

<#
insert at end of html files where navbar needed:

<!-- INSERT NAV JS MIN CODE UNDER HERE -->
<script></script>

#>
<#

look at my initial code:
# Set the location to the script's directory
Set-Location -Path $PSScriptRoot
# Function to minify and append files
function Minify-And-Append {
    param (
        [string]$sourceFile,
        [string]$targetFile
    )

    $tempFile1 = "temp1.js"
    $tempFile2 = "temp2.js"

    google-closure-compiler --charset=UTF-8 --js $sourceFile --js_output_file $tempFile1
    uglifyjs $tempFile1 -c -m -o $tempFile2
    Add-Content -Path $targetFile -Value "n// $sourceFile"
    Get-Content -Path $tempFile2 | Add-Content -Path $targetFile
    Remove-Item -Path $tempFile1, $tempFile2
    Write-Output "Minified and copied: $sourceFile"
}
# Clear the content of ALL-COMB.min.js
Clear-Content -Path "ALL-COMB.min.js"
Write-Output "Cleared ALL-COMB.min.js"
# Copy the content of comb-DT.min.js into ALL-COMB.min.js
Get-Content -Path "comb-DT.min.js" | Set-Content -Path "ALL-COMB.min.js"
Write-Output "Copied: comb-DT.min.js"
# List of JavaScript files to minify and append
$jsFiles = @(
    "DT-inline.js",
    "navbar.js",
    "belowPage-bab-dropdown.js"
    "quran-dropdowns.js"
)
# Process each file
foreach ($file in $jsFiles) {
    Minify-And-Append -sourceFile $file -targetFile "ALL-COMB.min.js"
}
Write-Output "✅ -- ✅ -- DONE -- ✅ -- ✅"
...
now what i want is, for the code to do what is supposed to do above, but in addition
i want to minify the code of "navbar.js" with google-closure-compiler and uglifyjs, and place itand between the script tags here:
...
</div>
  </body>
</html>
<!-- INSERT NAV JS MIN CODE UNDER HERE -->
<script></script>
these script tags are in a file called index.html, at the very bottom of that file, the index.html file is one directory back and inside a directory called "uc" from where this script is run
"..\uc\index.html"
every time i run the script i want to erase the previous code that placed there, as in, when it is like this:
<!-- INSERT NAV JS MIN CODE UNDER HERE -->
<script>
navbar.js code inserted here
</script>
running the script should make it like this:
<!-- INSERT NAV JS MIN CODE UNDER HERE -->
<script>
previous navbar.js code erased and replaced with current navbar.js code
</script>

that minifying navbar js and inserting it at the end of "..\uc\index.html"
i also want to do that in other multiple places
like "..\page\lafzuVakikohLiyumugeQawaid.html"
...another directory, etc

what would be the best way to do this
i manually added a 
<!-- INSERT NAV JS MIN CODE UNDER HERE -->
<script></script>
at the end of docs where i want the navbar js there, but is there a better way to do such


#>


<# claude:
Here's a comparison of the two scripts:

1. Variable usage:
   - First script: Uses variables for file paths, making it easier to maintain and update.
   - Second script: Uses hardcoded file names throughout the script.

2. Minification approach:
   - First script: Minifies files in-place, overwriting the original files.
   - Second script: Creates temporary minified files and then deletes them.

3. Comment style:
   - First script: Uses more descriptive comments for each section.
   - Second script: Uses briefer comments.

4. Output messages:
   - First script: More detailed output messages, including file names.
   - Second script: Slightly more concise output messages.

5. Newline handling:
   - First script: Adds a newline before the comment, but not after.
   - Second script: Adds a newline before and after the comment.

6. Error handling:
   - Both scripts lack explicit error handling.

7. Final output:
   - First script: No final "completed" message.
   - Second script: Includes a final "All tasks completed successfully" message.

8. Code structure:
   - Both scripts follow a similar logical flow and structure.

Main differences:
1. The first script is more flexible due to variable usage.
2. The second script creates and deletes temporary files for minification.
3. The first script modifies original files directly, while the second preserves them.
4. The second script has a final completion message.

Both scripts accomplish the same task, but the first one is slightly more maintainable due to variable usage, while the second one preserves original files at the cost of additional file operations.
#>