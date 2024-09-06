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