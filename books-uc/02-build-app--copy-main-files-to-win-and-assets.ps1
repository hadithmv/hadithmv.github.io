# asset files are not committed to github, since they are just the copied files from the main web folder

# Purpose: This script copies necessary files from the source directory to the Android and Windows app folders

# Set the current working directory to the directory containing the script
try {
    Set-Location -Path $PSScriptRoot -ErrorAction Stop
    $startTime = Get-Date
}
catch {
    Write-Error "Failed to initialize script: $_"
    exit 1
}

# Define base paths for source and destinations
$sourcePath = "C:\Users\ashra\Downloads\VScode\hadithmv.github.io"
$destPathAndroid = "C:\Users\ashra\Downloads\VScode\hadithmv.github.io\androidApp-kt\app\src\main\assets"
$destPathWindows = "C:\Users\ashra\Downloads\VScode\hadithmv.github.io\windowsApp-tauri\Hadithmv\src"

# Files to preserve in Windows destination
$preserveFiles = @("index.html", "styles.css", "main.js")

# Files to update versions in
$filesToUpdate = @(
    @{Path = "..\windowsApp-tauri\Hadithmv\src-tauri\tauri.conf.json"; Pattern = '"version": "(\d+\.\d+\.\d+)"'; Replacement = '"version": "{0}"'},
    @{Path = "..\androidApp-kt\app\build.gradle"; Pattern = 'versionName\s+"([^"]+)"'; Replacement = 'versionName "{0}"'}
)

try {
    Write-Host "`n🔄 Starting File Copy and Version Update Process..." -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor DarkGray
    
    # Step 1: Get current version from navbar.js and update app files
    Write-Host "[1/4] 🔄 Updating version in app configuration files" -ForegroundColor Yellow
    
    $totalVersionFiles = $filesToUpdate.Count
    $processedVersionCount = 0
    $versionSuccessCount = 0
    $versionFailCount = 0
    $currentVersion = $null
    
    # Get the current version from navbar.js file
    $navbarJsPath = "$sourcePath\js\navbar.js"
    if (Test-Path $navbarJsPath) {
        $navbarContent = Get-Content $navbarJsPath -Raw -ErrorAction Stop
        if ($navbarContent -match 'var hmvVersionNo = "(\d+\.\d+\.\d+)";') {
            $currentVersion = $matches[1]
            Write-Host "  ℹ️ Using version: $currentVersion from navbar.js" -ForegroundColor Cyan
        }
        else {
            Write-Host "  ⚠️ Could not extract version from navbar.js" -ForegroundColor Yellow
            Write-Host "  ⚠️ Version update will be skipped" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "  ⚠️ navbar.js not found at $navbarJsPath" -ForegroundColor Yellow
        Write-Host "  ⚠️ Version update will be skipped" -ForegroundColor Yellow
    }
    
    # Process each version file if we have a version to use
    if ($null -ne $currentVersion) {
        foreach ($file in $filesToUpdate) {
            $processedVersionCount++
            $percentComplete = [math]::Round(($processedVersionCount / $totalVersionFiles) * 100)
            
            $filePath = $file.Path
            $fileName = Split-Path $filePath -Leaf
            
            Write-Host "  [$processedVersionCount/$totalVersionFiles] $percentComplete% " -NoNewline
            Write-Host "$fileName " -NoNewline
            
            try {
                # Check if file exists
                if (-not (Test-Path $filePath)) {
                    Write-Host "❌ (File not found)" -ForegroundColor Red
                    $versionFailCount++
                    continue
                }
                
                # Read the content of the file
                $content = Get-Content $filePath -Raw -ErrorAction Stop
                
                # Extract the current version number
                if ($content -match $file.Pattern) {
                    $fileVersion = $matches[1]
                    
                    # Replace the version in the file with the one from navbar.js
                    $replacement = $file.Replacement -f $currentVersion
                    $newContent = $content -replace $file.Pattern, $replacement
                    
                    if ($newContent -eq $content) {
                        Write-Host "❌ (Version replacement failed)" -ForegroundColor Red
                        $versionFailCount++
                        continue
                    }
                    
                    # Write the new content
                    $newContent | Set-Content $filePath -NoNewline -ErrorAction Stop
                    
                    # Success message
                    Write-Host "✅ " -ForegroundColor Green -NoNewline
                    Write-Host "($fileVersion → $currentVersion)" -ForegroundColor Cyan
                    $versionSuccessCount++
                }
                else {
                    Write-Host "❌ (Version pattern not found)" -ForegroundColor Red
                    $versionFailCount++
                }
            }
            catch {
                Write-Host "❌" -ForegroundColor Red
                Write-Error "Error processing $fileName : $_"
                $versionFailCount++
            }
        }
    }
    else {
        Write-Host "  ⚠️ Skipping version updates due to missing version information" -ForegroundColor Yellow
    }
    
    # Step 2: Clear the destination directories
    Write-Host "`n[2/4] 📂 Clearing destination directories" -ForegroundColor Yellow
    
    if (Test-Path $destPathAndroid) {
        Remove-Item -Path "$destPathAndroid\*" -Recurse -Force -ErrorAction Stop
        Write-Host "  ✅ Cleared Android destination directory" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ Android destination directory not found" -ForegroundColor Yellow
    }

    if (Test-Path $destPathWindows) {
        Get-ChildItem -Path $destPathWindows -Recurse |
        Where-Object { $_.Name -notin $preserveFiles } |
        Remove-Item -Recurse -Force -ErrorAction Stop
        Write-Host "  ✅ Cleared Windows destination directory (preserved specified files)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ Windows destination directory not found" -ForegroundColor Yellow
    }
    
    # Step 3: Create the required directory structure in both destinations
    Write-Host "`n[3/4] 📂 Creating directory structure" -ForegroundColor Yellow
    
    $directories = @("books", "js\json", "js", "css", "page", "font", "img\logo")
    $dirCount = 0
    $totalDirs = $directories.Count * 2  # For both Android and Windows
    
    foreach ($dir in $directories) {
        foreach ($destPath in @($destPathAndroid, $destPathWindows)) {
            $dirCount++
            $destType = if ($destPath -eq $destPathAndroid) { "Android" } else { "Windows" }
            
            try {
                New-Item -Path "$destPath\$dir" -ItemType Directory -Force -ErrorAction Stop | Out-Null
                Write-Host "  ✅ [$dirCount/$totalDirs] Created $dir in $destType" -ForegroundColor Green
            }
            catch {
                $errorMsg = $_.Exception.Message
                Write-Host "  ❌ [$dirCount/$totalDirs] Failed to create $dir in $destType" -ForegroundColor Red
            }
        }
    }
    
    # Step 4: Define all copy operations
    Write-Host "`n[4/4] 📋 Copying files" -ForegroundColor Yellow
    
    $copyOperations = @(
        @{Source = "$sourcePath\books\*.html"; Dest = "$destPathAndroid\books"; Desc = "HTML files from books" }
        @{Source = "$sourcePath\js\json\*.json"; Dest = "$destPathAndroid\js\json"; Desc = "JSON files" }
        @{Source = "$sourcePath\js\*.min.js"; Dest = "$destPathAndroid\js"; Desc = "Minified JS files" }
        @{Source = "$sourcePath\css\*.min.css"; Dest = "$destPathAndroid\css"; Desc = "Minified CSS files" }
        @{Source = "$sourcePath\LICENSE.txt"; Dest = "$destPathAndroid"; Desc = "LICENSE file" }
        @{Source = "$sourcePath\page\*"; Dest = "$destPathAndroid\page"; Desc = "Page files" }
        @{Source = "$sourcePath\font\merged-300.woff2"; Dest = "$destPathAndroid\font"; Desc = "Font file" }
        @{Source = "$sourcePath\img\logo\logo.svg"; Dest = "$destPathAndroid\img\logo"; Desc = "Logo file" }
    )
    
    $opCount = 0
    $totalOps = $copyOperations.Count * 2  # For both Android and Windows
    $successCount = 0
    $failCount = 0
    
    # Execute all copy operations for both destinations
    $copyOperations | ForEach-Object {
        if (Test-Path $_.Source) {
            foreach ($destPath in @($destPathAndroid, $destPathWindows)) {
                $opCount++
                $destType = if ($destPath -eq $destPathAndroid) { "Android" } else { "Windows" }
                $targetDest = $_.Dest -replace [regex]::Escape($destPathAndroid), $destPath
                
                try {
                    Copy-Item -Path $_.Source -Destination $targetDest -Force -ErrorAction Stop
                    Write-Host "  ✅ [$opCount/$totalOps] Copied $($_.Desc) to $destType" -ForegroundColor Green
                    $successCount++
                }
                catch {
                    Write-Host "  ❌ [$opCount/$totalOps] Failed to copy $($_.Desc) to $destType" -ForegroundColor Red
                    $failCount++
                }
            }
        }
        else {
            $opCount += 2  # Count as 2 operations (Android and Windows)
            Write-Host "  ⚠️ Source not found: $($_.Source)" -ForegroundColor Yellow
            $failCount += 2
        }
    }
    
    # Calculate execution time
    $endTime = Get-Date
    $executionTime = ($endTime - $startTime).TotalSeconds
    
    # Display summary
    Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host "📊 SUMMARY" -ForegroundColor Cyan
    Write-Host "───────────────────────────────────────────────────" -ForegroundColor DarkGray
    if ($null -ne $currentVersion) {
        Write-Host "📌 App Version: " -ForegroundColor Blue -NoNewline
        Write-Host "$currentVersion" -ForegroundColor White
        Write-Host "✅ Version Updates: " -ForegroundColor Green -NoNewline
        Write-Host "$versionSuccessCount files" -ForegroundColor White
    }
    Write-Host "✅ File Operations: " -ForegroundColor Green -NoNewline
    Write-Host "$successCount successful" -ForegroundColor White
    Write-Host "❌ Failed Operations: " -ForegroundColor Red -NoNewline
    Write-Host "$($versionFailCount + $failCount) total" -ForegroundColor White
    Write-Host "🕒 Total Time: " -ForegroundColor Cyan -NoNewline
    Write-Host "$([math]::Round($executionTime, 2)) seconds" -ForegroundColor White
    Write-Host "───────────────────────────────────────────────────" -ForegroundColor DarkGray
    
    if (($versionFailCount + $failCount) -eq 0) {
        Write-Host "✅ ALL OPERATIONS COMPLETED SUCCESSFULLY ✅" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ COMPLETED WITH ERRORS ⚠️" -ForegroundColor Yellow
    }
}
catch {
    Write-Error "❌ Script execution failed: $_"
    exit 1
}


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