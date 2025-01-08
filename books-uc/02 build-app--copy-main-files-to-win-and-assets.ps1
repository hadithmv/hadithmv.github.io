# Purpose: This script copies necessary files from the source directory to the Android app's assets folder
# It first clears the destination directory, then creates required subdirectories, and finally copies specific files

# Set the current working directory to the directory containing the script
# This ensures relative paths work correctly regardless of where the script is called from
Set-Location -Path $PSScriptRoot

# Define base paths
$sourcePath = "C:\Users\ashra\Downloads\VScode\hadithmv.github.io"
$destPathAssets = "C:\Users\ashra\Downloads\VScode\hadithmv.github.io\androidApp-kt\app\src\main\assets"
$destPathWin = "C:\Users\ashra\Downloads\VScode\hadithmv.github.io\win"

# Protected files in win directory
$protectedFiles = @("index.html", "styles.css", "main.js")

try {
    # Step 1: Clear the destination directories
    foreach ($destPath in @($destPathAssets, $destPathWin)) {
        if (Test-Path $destPath) {
            if ($destPath -eq $destPathWin) {
                # For win directory, preserve protected files
                Get-ChildItem -Path $destPath -Exclude $protectedFiles | Remove-Item -Recurse -Force
                Write-Output "✅ Cleared win directory (preserved protected files)"
            }
            else {
                Remove-Item -Path "$destPath\*" -Recurse -Force
                Write-Output "✅ Cleared assets directory"
            }
        }
    }

    # Step 2: Create directory structure in both locations
    $directories = @("books", "js\json", "js", "css", "page", "font", "img\logo")
    foreach ($destPath in @($destPathAssets, $destPathWin)) {
        foreach ($dir in $directories) {
            New-Item -Path "$destPath\$dir" -ItemType Directory -Force | Out-Null
        }
        Write-Output "✅ Created directories in $(Split-Path $destPath -Leaf)"
    }

    # Step 3: Define all copy operations
    # Each operation is defined as a hashtable with:
    # - Source: The path to the source file(s)
    # - Dest: The destination directory
    # - Desc: A description of what's being copied (for logging)
    $copyOperations = @(
        # Copy HTML files from books directory
        @{Source = "$sourcePath\books\*.html"; Dest = "$destPathAssets\books"; Desc = "HTML files from books" }
        
        # Copy JSON data files
        @{Source = "$sourcePath\js\json\*.json"; Dest = "$destPathAssets\js\json"; Desc = "JSON files" }
        
        # Copy minified JavaScript files
        @{Source = "$sourcePath\js\*.min.js"; Dest = "$destPathAssets\js"; Desc = "Minified JS files" }
        
        # Copy minified CSS stylesheets
        @{Source = "$sourcePath\css\*.min.css"; Dest = "$destPathAssets\css"; Desc = "Minified CSS files" }
        
        # Copy license information
        @{Source = "$sourcePath\LICENSE.txt"; Dest = "$destPathAssets"; Desc = "LICENSE file" }
        
        # Copy page-specific files
        @{Source = "$sourcePath\page\*"; Dest = "$destPathAssets\page"; Desc = "Page files" }
        
        # Copy font files needed for text rendering
        @{Source = "$sourcePath\font\merged-300.woff2"; Dest = "$destPathAssets\font"; Desc = "Font file" }
        
        # Copy logo assets
        @{Source = "$sourcePath\img\logo\logo.svg"; Dest = "$destPathAssets\img\logo"; Desc = "Logo file" }
    )

    # Step 4: Execute copy operations for both destinations
    $copyOperations | ForEach-Object {
        if (Test-Path $_.Source) {
            foreach ($destPath in @($destPathAssets, $destPathWin)) {
                $actualDest = $_.Dest -replace [regex]::Escape($destPathAssets), $destPath
                Copy-Item -Path $_.Source -Destination $actualDest -Force
            }
            Write-Output "✅ Copied $($_.Desc) to both locations"
        }
        else {
            Write-Warning "⚠️ Source not found: $($_.Source)"
        }
    }
}
catch {
    Write-Error "❌ Script execution failed: $_"
    exit 1
}

Write-Output "`n✅ -- ✅ -- DONE -- ✅ -- ✅"