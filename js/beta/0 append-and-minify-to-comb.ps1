# Set the location to the script's directory
Set-Location -Path $PSScriptRoot

# Define file paths
$allCombFile = "ALL-COMB.min.js"
$combDtFile = "comb-DT.min.js"
$dtInlineFile = "dt-inline.js"
$navbarFile = "navbar.js"

# Clear the content of ALL-COMB.min.js
Clear-Content -Path $allCombFile
Write-Output "Cleared the content of $allCombFile"

# Copy the content of comb-DT.min.js into ALL-COMB.min.js
Get-Content -Path $combDtFile | Set-Content -Path $allCombFile
Write-Output "Copied the content of $combDtFile into $allCombFile"

# Minify dt-inline.js with Closure Compiler and UglifyJS, then append to ALL-COMB.min.js
google-closure-compiler --charset=UTF-8 --js $dtInlineFile --js_output_file "temp1.js"
uglifyjs "temp1.js" -c -m -o "temp2.js"
Add-Content -Path $allCombFile -Value "`n// dt-inline.js"
Get-Content -Path "temp2.js" | Add-Content -Path $allCombFile
Remove-Item -Path "temp1.js", "temp2.js"
Write-Output "Minified $dtInlineFile and appended to $allCombFile"

# Minify navbar.js with Closure Compiler and UglifyJS, then append to ALL-COMB.min.js
google-closure-compiler --charset=UTF-8 --js $navbarFile --js_output_file "temp1.js"
uglifyjs "temp1.js" -c -m -o "temp2.js"
Add-Content -Path $allCombFile -Value "`n// navbar.js"
Get-Content -Path "temp2.js" | Add-Content -Path $allCombFile
Remove-Item -Path "temp1.js", "temp2.js"
Write-Output "Minified $navbarFile and appended to $allCombFile"

Write-Output "All tasks completed successfully"

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