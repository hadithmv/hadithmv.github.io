# Set the location to the script's directory
Set-Location -Path $PSScriptRoot

# Function to minify and create temporary content
function Get-Minified-Content {
    param (
        [string]$sourceFile
    )
    
    $tempFile1 = "temp1.js"
    $tempFile2 = "temp2.js"
    
    google-closure-compiler --charset=UTF-8 --js $sourceFile --js_output_file $tempFile1
    uglifyjs $tempFile1 -c -m -o $tempFile2
    $minifiedContent = Get-Content -Path $tempFile2 -Raw
    Remove-Item -Path $tempFile1, $tempFile2
    return $minifiedContent.Trim()
}

# Files to process
$jsFiles = @(
    "navbar.min.js",
    "DT-inline.js",
    "belowPage-bab-dropdown.js",
    "quran-dropdowns.js"
)

# Read the entire content of ALL-COMB.min.js
$allContent = Get-Content -Path "ALL-COMB.min.js" -Raw

# Process each file
foreach ($file in $jsFiles) {
    Write-Output "Processing: $file"
    
    # Create the exact header pattern that exists in the file
    $headerPattern = "// $file"
    
    # Check if this header exists in the content
    if ($allContent -match [regex]::Escape($headerPattern)) {
        Write-Output "Found section for: $file"
        
        # Get the new minified content
        $newContent = Get-Minified-Content -sourceFile $file
        
        # Pattern to match the whole section (header + content until next header or end)
        $pattern = "(?ms)// $file\r?\n.*?(?=(// .*?\r?\n|\z))"
        
        # Create replacement with preserved header and blank line after code block
        $replacement = "// $file`n$newContent`n`n"
        
        # Replace the section
        $allContent = [regex]::Replace($allContent, $pattern, $replacement)
    }
    else {
        Write-Output "Warning: Section not found for $file"
    }
}

# Remove any potential multiple blank lines at the end of the file
$allContent = $allContent -replace "`n{3,}$", "`n`n"

# Write the updated content back to the file
Set-Content -Path "ALL-COMB.min.js" -Value $allContent -NoNewline
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


...

B
look at this code

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
   "navbar.min.js",
   "DT-inline.js",
   "belowPage-bab-dropdown.js",
   "quran-dropdowns.js"

)

# Process each file
foreach ($file in $jsFiles) {
    Minify-And-Append -sourceFile $file -targetFile "ALL-COMB.min.js"
}

Write-Output "✅ -- ✅ -- DONE -- ✅ -- ✅"

now what i want is
i dont want to Clear the content of ALL-COMB.min.js

i dont want to copy over comb-DT.min.js

what i want is
for the following files

   "navbar.min.js",
   "DT-inline.js",
   "belowPage-bab-dropdown.js",
   "quran-dropdowns.js"

for each of those, there will be a line of text with the file name, in the All-COMB.min.js file. below that line of text will be a block of code  relating to that file name. All i want is to update that block of code, for each of those instances

#>