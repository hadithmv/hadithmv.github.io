# Set the working directory to the script's location
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

        # Check if csso is installed
        if (-not (Get-Command csso -ErrorAction SilentlyContinue)) {
            throw "csso is not installed. Please install it using 'npm install -g csso-cli'"
        }

        $minifiedFile = [System.IO.Path]::GetFileNameWithoutExtension($sourceFile) + ".temp.css"
        
        # Run csso and capture any errors
        $cssoOutput = csso $sourceFile -o $minifiedFile 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "csso failed: $cssoOutput"
        }

        $minifiedContent = Get-Content -Path $minifiedFile -Raw -ErrorAction Stop
        Remove-Item -Path $minifiedFile -ErrorAction Stop
        return $minifiedContent.Trim()
    }
    catch {
        Write-Error "Failed to minify $sourceFile : $_"
        return $null
    }
}

# Files to process for DT-COMB.min.css
$combFiles = @(
    #"DT-inline.css"
)

# Files to minify separately
$separateFiles = @(
    "base-styles.css",
    "navbar.css",
    "DT-inline.css",
    "quran-navigation-list.css"
)

try {
    # Check if DT-COMB.min.css exists
    if (-not (Test-Path "DT-COMB.min.css")) {
        Write-Warning "DT-COMB.min.css not found. Creating new file."
        New-Item -ItemType File -Name "DT-COMB.min.css" -Force | Out-Null
    }

    # Read the entire content of DT-COMB.min.css
    $allContent = Get-Content -Path "DT-COMB.min.css" -Raw -ErrorAction Stop

    # Process files for DT-COMB.min.css
    foreach ($file in $combFiles) {
        Write-Output "Processing: $file"
        
        # Create the exact header pattern that exists in the file
        $headerPattern = "/* $file */"
        
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
                # Pattern to match the whole section (header + content until next header or end)
                $pattern = "(?ms)/\* $file \*/\r?\n.*?(?=(/\* .*?\*/\r?\n|\z))"
                
                # Create replacement with preserved header and blank line after code block
                $replacement = "/* $file */`n$newContent`n`n"
                
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

            $minifiedFile = [System.IO.Path]::GetFileNameWithoutExtension($file) + ".min.css"
            $cssoOutput = csso $file -o $minifiedFile 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Output "✅ Created: $minifiedFile"
            }
            else {
                Write-Error "Failed to minify $file : $cssoOutput"
            }
        }
        catch {
            Write-Error "Error processing $file : $_"
            continue
        }
    }

    # Remove any potential multiple blank lines at the end of the file
    $allContent = $allContent -replace "`n{3,}$", "`n`n"

    # Write the updated content back to the file
    Set-Content -Path "DT-COMB.min.css" -Value $allContent -NoNewline -ErrorAction Stop
    Write-Output "✅ -- ✅ -- DONE -- ✅ -- ✅"
}
catch {
    Write-Error "Script execution failed: $_"
    exit 1
}