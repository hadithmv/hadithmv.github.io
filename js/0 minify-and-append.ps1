# Set the location to the script's directory
try {
    Set-Location -Path $PSScriptRoot -ErrorAction Stop
}
catch {
    Write-Error "Failed to set working directory: $_"
    exit 1
}

# Function to minify and create temporary content
function Get-Minified-Content {
    param (
        [string]$sourceFile
    )
    
    try {
        # Check if source file exists
        if (-not (Test-Path $sourceFile)) {
            throw "Source file not found: $sourceFile"
        }

        # Check if required tools are installed
        if (-not (Get-Command google-closure-compiler -ErrorAction SilentlyContinue)) {
            throw "google-closure-compiler is not installed"
        }
        if (-not (Get-Command terser -ErrorAction SilentlyContinue)) {
            throw "terser is not installed"
        }

        $tempFile1 = [System.IO.Path]::GetTempFileName() + ".js"
        $tempFile2 = [System.IO.Path]::GetTempFileName() + ".js"
        
        try {
            # Run Google Closure Compiler
            $compilerOutput = google-closure-compiler --charset=UTF-8 --js $sourceFile --js_output_file $tempFile1 2>&1
            if ($LASTEXITCODE -ne 0) {
                throw "Closure compiler failed: $compilerOutput"
            }

            # Run Terser
            $terserOutput = terser $tempFile1 -c -m --comments=false -o $tempFile2 2>&1
            if ($LASTEXITCODE -ne 0) {
                throw "Terser failed: $terserOutput"
            }

            $minifiedContent = Get-Content -Path $tempFile2 -Raw -ErrorAction Stop
            return $minifiedContent.Trim()
        }
        finally {
            # Clean up temp files
            if (Test-Path $tempFile1) { Remove-Item -Path $tempFile1 -ErrorAction SilentlyContinue }
            if (Test-Path $tempFile2) { Remove-Item -Path $tempFile2 -ErrorAction SilentlyContinue }
        }
    }
    catch {
        Write-Error "Failed to minify $sourceFile : $_"
        return $null
    }
}

# Files to process for ALL-COMB.min.js
$combFiles = @(
    "DT-inline.js"
)

# Files to minify separately
$separateFiles = @(
    "navbar.js",
    "quran-navigation-list.js"
)

try {
    # Check if ALL-COMB.min.js exists
    if (-not (Test-Path "ALL-COMB.min.js")) {
        throw "ALL-COMB.min.js not found"
    }

    # Read the entire content of ALL-COMB.min.js
    $allContent = Get-Content -Path "ALL-COMB.min.js" -Raw -ErrorAction Stop

    # Process ALL-COMB.min.js updates
    foreach ($file in $combFiles) {
        Write-Output "Processing: $file"
        
        # Create the exact header pattern that exists in the file
        $headerPattern = "// $file"
        
        # Check if this header exists in the content
        if ($allContent -match [regex]::Escape($headerPattern)) {
            Write-Output "Found section for: $file"
            
            # Get the new minified content
            $newContent = Get-Minified-Content -sourceFile $file
            if ($null -eq $newContent) {
                Write-Warning "Skipping $file due to minification error"
                continue
            }
            
            try {
                # Pattern to match the whole section
                $pattern = "(?ms)// $file\r?\n.*?(?=(// .*?\r?\n|\z))"
                
                # Create replacement with preserved header and blank line
                $replacement = "// $file`n$newContent`n`n"
                
                # Replace the section
                $allContent = [regex]::Replace($allContent, $pattern, $replacement)
            }
            catch {
                Write-Error "Failed to process regex replacement for $file : $_"
                continue
            }
        }
        else {
            Write-Warning "Section not found for $file"
        }
    }

    # Process files that need separate minification
    foreach ($file in $separateFiles) {
        Write-Output "Processing separately: $file"
        try {
            if (-not (Test-Path $file)) {
                Write-Warning "File not found: $file"
                continue
            }

            $minifiedFile = [System.IO.Path]::GetFileNameWithoutExtension($file) + ".min.js"
            $minifiedContent = Get-Minified-Content -sourceFile $file
            
            if ($null -ne $minifiedContent) {
                Set-Content -Path $minifiedFile -Value $minifiedContent -NoNewline -ErrorAction Stop
                Write-Output "✅ Created: $minifiedFile"
            }
        }
        catch {
            Write-Error "Error processing $file : $_"
            continue
        }
    }

    # Clean up the content
    $allContent = $allContent -replace "`n{3,}$", "`n`n"

    # Write the updated content back to the file
    Set-Content -Path "ALL-COMB.min.js" -Value $allContent -NoNewline -ErrorAction Stop
    Write-Output "✅ -- ✅ -- DONE -- ✅ -- ✅"
}
catch {
    Write-Error "Script execution failed: $_"
    exit 1
}

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