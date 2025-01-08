# Purpose: This script copies necessary files from the source directory to the Android app's assets folder
# It first clears the destination directory, then creates required subdirectories, and finally copies specific files

# Set the current working directory to the directory containing the script
# This ensures relative paths work correctly regardless of where the script is called from
Set-Location -Path $PSScriptRoot

# Define base paths for source and destinations
# Source: Main project directory containing all the required files
# Destination: Android app's assets directory where files need to be copied
# Destination: Windows app's directory where files need to be copied
$sourcePath = "C:\Users\ashra\Downloads\VScode\hadithmv.github.io"
$destPathAndroid = "C:\Users\ashra\Downloads\VScode\hadithmv.github.io\androidApp-kt\app\src\main\assets"
$destPathWindows = "C:\Users\ashra\Downloads\VScode\hadithmv.github.io\windowsApp-tauri\Hadithmv\src"

# Files to preserve in Windows destination
$preserveFiles = @("index.html", "styles.css", "main.js")

try {
    # Step 1: Clear the destination directories
    if (Test-Path $destPathAndroid) {
        Remove-Item -Path "$destPathAndroid\*" -Recurse -Force -ErrorAction Stop
        Write-Output "✅ Cleared Android destination directory"
    }

    if (Test-Path $destPathWindows) {
        # Remove all files except preserved ones
        Get-ChildItem -Path $destPathWindows -Recurse |
        Where-Object { $_.Name -notin $preserveFiles } |
        Remove-Item -Recurse -Force -ErrorAction Stop
        Write-Output "✅ Cleared Windows destination directory (preserved specified files)"
    }

    # Step 2: Create the required directory structure in both destinations
    $directories = @("books", "js\json", "js", "css", "page", "font", "img\logo")
    foreach ($dir in $directories) {
        foreach ($destPath in @($destPathAndroid, $destPathWindows)) {
            New-Item -Path "$destPath\$dir" -ItemType Directory -Force -ErrorAction Stop | Out-Null
            Write-Output "✅ Created directory: $dir in $(Split-Path $destPath -Leaf)"
        }
    }

    # Step 3: Define all copy operations
    # Each operation is defined as a hashtable with:
    # - Source: The path to the source file(s)
    # - Dest: The destination directory
    # - Desc: A description of what's being copied (for logging)
    $copyOperations = @(
        # Copy HTML files from books directory
        @{Source = "$sourcePath\books\*.html"; Dest = "$destPathAndroid\books"; Desc = "HTML files from books" }
        
        # Copy JSON data files
        @{Source = "$sourcePath\js\json\*.json"; Dest = "$destPathAndroid\js\json"; Desc = "JSON files" }
        
        # Copy minified JavaScript files
        @{Source = "$sourcePath\js\*.min.js"; Dest = "$destPathAndroid\js"; Desc = "Minified JS files" }
        
        # Copy minified CSS stylesheets
        @{Source = "$sourcePath\css\*.min.css"; Dest = "$destPathAndroid\css"; Desc = "Minified CSS files" }
        
        # Copy license information
        @{Source = "$sourcePath\LICENSE.txt"; Dest = "$destPathAndroid"; Desc = "LICENSE file" }
        
        # Copy page-specific files
        @{Source = "$sourcePath\page\*"; Dest = "$destPathAndroid\page"; Desc = "Page files" }
        
        # Copy font files needed for text rendering
        @{Source = "$sourcePath\font\merged-300.woff2"; Dest = "$destPathAndroid\font"; Desc = "Font file" }
        
        # Copy logo assets
        @{Source = "$sourcePath\img\logo\logo.svg"; Dest = "$destPathAndroid\img\logo"; Desc = "Logo file" }
    )

    # Step 4: Execute all copy operations for both destinations
    $copyOperations | ForEach-Object {
        if (Test-Path $_.Source) {
            foreach ($destPath in @($destPathAndroid, $destPathWindows)) {
                Copy-Item -Path $_.Source -Destination ($_.Dest -replace [regex]::Escape($destPathAndroid), $destPath) -Force -ErrorAction Stop
                Write-Output "✅ Copied $($_.Desc) to $(Split-Path $destPath -Leaf)"
            }
        }
        else {
            Write-Warning "⚠️ Source not found: $($_.Source)"
        }
    }
}
catch {
    # If any error occurs during execution, display the error message and exit with error code 1
    Write-Error "❌ Script execution failed: $_"
    exit 1
}

# Display completion message
Write-Output "`n✅ -- ✅ -- DONE -- ✅ -- ✅"


<#

write me a powershell script that does the following

remove the contents inside this folder
C:\Users\ashra\Downloads\VScode\hadithmv.github.io\androidApp-kt\app\src\main\assets

copy the .html files inside this folder
C:\Users\ashra\Downloads\VScode\hadithmv.github.io\books

and place them in
C:\Users\ashra\Downloads\VScode\hadithmv.github.io\androidApp-kt\app\src\main\assets\books


also copy the .json files inside this folder
C:\Users\ashra\Downloads\VScode\hadithmv.github.io\js\json

and place them in 
C:\Users\ashra\Downloads\VScode\hadithmv.github.io\androidApp-kt\app\src\main\assets\js\json


also copy the files .min.js files inside this folder
C:\Users\ashra\Downloads\VScode\hadithmv.github.io\js

and place them in
C:\Users\ashra\Downloads\VScode\hadithmv.github.io\androidApp-kt\app\src\main\assets\js

also copy the files .min.css files inside this folder
C:\Users\ashra\Downloads\VScode\hadithmv.github.io\css

and place them in
C:\Users\ashra\Downloads\VScode\hadithmv.github.io\androidApp-kt\app\src\main\assets\css


also copy the LICENSE.txt file from inside this folder
C:\Users\ashra\Downloads\VScode\hadithmv.github.io

and place it in
C:\Users\ashra\Downloads\VScode\hadithmv.github.io\androidApp-kt\app\src\main\assets


also copy the files inside this folder
C:\Users\ashra\Downloads\VScode\hadithmv.github.io\page

and place them in
C:\Users\ashra\Downloads\VScode\hadithmv.github.io\androidApp-kt\app\src\main\assets\page


also copy the merged-300.woff2 file inside this folder
C:\Users\ashra\Downloads\VScode\hadithmv.github.io\font

and place them in
C:\Users\ashra\Downloads\VScode\hadithmv.github.io\androidApp-kt\app\src\main\assets\font


also copy the logo.svg file inside this folder
C:\Users\ashra\Downloads\VScode\hadithmv.github.io\img\logo

and place them in
C:\Users\ashra\Downloads\VScode\hadithmv.github.io\androidApp-kt\app\src\main\assets\img\logo


....


what about outputing steps and error handling in your previous solution?
look at this other script file for ideas on how that could be done

now the comments dont tell me as much as in your previous solution
your previous solution had stuff like
# Copy HTML files from books


i get this error

Test-Path: C:\Users\ashra\Downloads\VScode\hadithmv.github.io\win\1 NEW--copy-main-files-to-win-and-assets.ps1:48:13
Line |
  48 |          if (Test-Path $_.Source) {
     |              ~~~~~~~~~~~~~~~~~~~
     | Value cannot be null. (Parameter 'The provided Path argument was null or an empty collection.')
WARNING: ⚠️ Source not found: 

The error occurs because the script defines the copy operations as individual hashtables but doesn't collect them into the $copyOperations array that's used later. Here's the fixed version:

its not as commented as it was before



#>