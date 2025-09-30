# Set the location to the script's directory
try {
    Set-Location -Path $PSScriptRoot -ErrorAction Stop
    
    # Start timing the script execution
    $startTime = Get-Date
}
catch {
    Write-Error "Failed to set working directory: $_"
    exit 1
}

# CONFIG: Toggle processing only files modified within N days ago
# Allowed values: 1, 2, 5, 10, or 'Off' to disable. Default: 2
$ModifiedDaysOption = 2

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

# Files to process for DT-COMB.min.js
$combFiles = @(
    # "DT-inline.js"
)

# Files to minify separately
$separateFiles = @(
    "navbar.js",
    "DT-inline.js",
    "quran-navigation-objectMaps.js",
    "quran-navigation-list.js",
    "markdown-loader.js"
)

# Apply "modified within N days ago" filter if enabled
$effectiveOption = $ModifiedDaysOption
if ($null -eq $effectiveOption -or (
        ($effectiveOption -isnot [int]) -and -not (
            $effectiveOption -is [string] -and $effectiveOption -match '^(?i)off$'
        )
    )) {
    # Fallback to default if invalid value is set
    $effectiveOption = 2
}

$activeDays = $null
if ($effectiveOption -is [int] -and @(1, 2, 5, 10) -contains [int]$effectiveOption) {
    $activeDays = [int]$effectiveOption
}

if ($activeDays) {
    $since = (Get-Date).AddDays(-$activeDays)
    $until = Get-Date
    
    # Filter combFiles
    $filteredCombFiles = @()
    foreach ($file in $combFiles) {
        if (Test-Path $file) {
            $fileInfo = Get-Item $file
            if ($fileInfo.LastWriteTime -ge $since -and $fileInfo.LastWriteTime -le $until) {
                $filteredCombFiles += $file
            }
        }
    }
    $combFiles = $filteredCombFiles
    
    # Filter separateFiles
    $filteredSeparateFiles = @()
    foreach ($file in $separateFiles) {
        if (Test-Path $file) {
            $fileInfo = Get-Item $file
            if ($fileInfo.LastWriteTime -ge $since -and $fileInfo.LastWriteTime -le $until) {
                $filteredSeparateFiles += $file
            }
        }
    }
    $separateFiles = $filteredSeparateFiles
    
    Write-Host ("🗓 Filtering files modified within last {0} days (since {1:yyyy-MM-dd HH:mm})" -f $activeDays, $since) -ForegroundColor Cyan
}
else {
    Write-Host "🗓 Modified-days filter: OFF (processing all files)" -ForegroundColor DarkGray
}

try {
    # Calculate total files to process
    $totalFiles = $combFiles.Count + $separateFiles.Count
    
    if ($totalFiles -eq 0) {
        Write-Host "No JavaScript files matched the modified-days filter." -ForegroundColor Yellow
        return
    }
    
    $processedCount = 0
    $successCount = 0
    $failCount = 0
    $totalBytesSaved = 0
    $totalOriginalSize = 0
    
    # Calculate padding widths based on total files
    $countWidth = $totalFiles.ToString().Length
    $percentWidth = 3 # "100" is 3 chars
    
    # Calculate total size of files
    foreach ($file in $combFiles + $separateFiles) {
        if (Test-Path $file) {
            $totalOriginalSize += (Get-Item $file).Length
        }
    }
    
    # Display total files and size
    $totalKB = [math]::Round($totalOriginalSize / 1KB, 1)
    $totalMB = [math]::Round($totalOriginalSize / 1MB, 2)
    
    Write-Host "`n🔄 Starting JavaScript minification process..." -ForegroundColor Cyan
    
    # For the total files and size display:
    if ($totalMB -ge 1) {
        Write-Host "🔍 Found " -ForegroundColor Cyan -NoNewline
        Write-Host "$totalFiles" -ForegroundColor White -NoNewline
        Write-Host " files to process (💾 " -ForegroundColor Cyan -NoNewline
        Write-Host "$totalMB MB" -ForegroundColor White -NoNewline
        Write-Host " total)" -ForegroundColor Cyan
    }
    else {
        Write-Host "🔍 Found " -ForegroundColor Cyan -NoNewline
        Write-Host "$totalFiles" -ForegroundColor White -NoNewline
        Write-Host " files to process (💾 " -ForegroundColor Cyan -NoNewline
        Write-Host "$totalKB KB" -ForegroundColor White -NoNewline
        Write-Host " total)" -ForegroundColor Cyan
    }
    
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor DarkGray

    # Check if DT-COMB.min.js exists
    if (-not (Test-Path "DT-COMB.min.js")) {
        Write-Host "⚠️ DT-COMB.min.js not found. Creating new file." -ForegroundColor Yellow
        New-Item -ItemType File -Name "DT-COMB.min.js" -Force | Out-Null
    }

    # Read the entire content of DT-COMB.min.js
    $allContent = Get-Content -Path "DT-COMB.min.js" -Raw -ErrorAction Stop

    # Process files for DT-COMB.min.js updates
    foreach ($file in $combFiles) {
        $processedCount++
        $percentComplete = [math]::Round(($processedCount / $totalFiles) * 100)
        
        # Format the count and percentage with consistent padding
        $countDisplay = "[$($processedCount.ToString().PadLeft($countWidth))/$totalFiles]"
        $percentDisplay = "$($percentComplete.ToString().PadRight($percentWidth))%"
        
        # Show progress with uniform alignment
        Write-Host $countDisplay -ForegroundColor Yellow -NoNewline
        Write-Host " " -NoNewline
        Write-Host $percentDisplay -ForegroundColor Magenta -NoNewline
        
        # Create progress bar
        $progressBarWidth = 20
        $filledWidth = [math]::Round(($percentComplete / 100) * $progressBarWidth)
        $emptyWidth = $progressBarWidth - $filledWidth
        
        Write-Host " [" -NoNewline -ForegroundColor DarkGray
        if ($filledWidth -gt 0) {
            Write-Host ("■" * $filledWidth) -NoNewline -ForegroundColor Cyan
        }
        if ($emptyWidth -gt 0) {
            Write-Host ("□" * $emptyWidth) -NoNewline -ForegroundColor DarkGray
        }
        Write-Host "] " -NoNewline -ForegroundColor DarkGray
        
        Write-Host "$file " -NoNewline
        
        # Create the exact header pattern that exists in the file
        $headerPattern = "// $file"
        
        # Check if this header exists in the content
        if ($allContent -match [regex]::Escape($headerPattern)) {
            Write-Host "(Updating) " -NoNewline -ForegroundColor Blue
            
            # Get original file size
            $originalSize = (Get-Item $file).Length
            
            # Get the new minified content
            $newContent = Get-Minified-Content -sourceFile $file
            if ($null -eq $newContent) {
                Write-Host "❌" -ForegroundColor Red
                $failCount++
                continue
            }
            
            try {
                # Pattern to match the whole section
                $pattern = "(?ms)// $file\r?\n.*?(?=(// .*?\r?\n|\z))"
                
                # Create replacement with preserved header and blank line
                $replacement = "// $file`n$newContent`n`n"
                
                # Calculate size difference
                $newContentSize = [System.Text.Encoding]::UTF8.GetByteCount($newContent)
                
                # Get the current content for the section
                $currentSectionMatch = [regex]::Match($allContent, $pattern)
                $currentSectionSize = 0
                if ($currentSectionMatch.Success) {
                    $currentSectionSize = [System.Text.Encoding]::UTF8.GetByteCount($currentSectionMatch.Value)
                }
                
                # Calculate bytes saved
                $bytesSaved = $currentSectionSize - $newContentSize
                $totalBytesSaved += $bytesSaved
                $kbSaved = [math]::Round($bytesSaved / 1KB, 1)
                
                # Replace the section
                $allContent = [regex]::Replace($allContent, $pattern, $replacement)
                
                Write-Host "✅ " -ForegroundColor Green -NoNewline
                Write-Host "(🗜 $kbSaved KB)" -ForegroundColor Cyan
                
                $successCount++
            }
            catch {
                Write-Host "❌" -ForegroundColor Red
                Write-Error "Failed to process regex replacement for $file : $_"
                $failCount++
                continue
            }
        }
        else {
            Write-Host "(Section not found) " -NoNewline -ForegroundColor Yellow
            Write-Host "⚠️" -ForegroundColor Yellow
            $failCount++
        }
    }

    # Process files that need separate minification
    foreach ($file in $separateFiles) {
        $processedCount++
        $percentComplete = [math]::Round(($processedCount / $totalFiles) * 100)
        
        # Format the count and percentage with consistent padding
        $countDisplay = "[$($processedCount.ToString().PadLeft($countWidth))/$totalFiles]"
        $percentDisplay = "$($percentComplete.ToString().PadRight($percentWidth))%"
        
        # Show progress with uniform alignment
        Write-Host $countDisplay -ForegroundColor Yellow -NoNewline
        Write-Host " " -NoNewline
        Write-Host $percentDisplay -ForegroundColor Magenta -NoNewline
        
        # Create progress bar
        $progressBarWidth = 20
        $filledWidth = [math]::Round(($percentComplete / 100) * $progressBarWidth)
        $emptyWidth = $progressBarWidth - $filledWidth
        
        Write-Host " [" -NoNewline -ForegroundColor DarkGray
        if ($filledWidth -gt 0) {
            Write-Host ("■" * $filledWidth) -NoNewline -ForegroundColor Cyan
        }
        if ($emptyWidth -gt 0) {
            Write-Host ("□" * $emptyWidth) -NoNewline -ForegroundColor DarkGray
        }
        Write-Host "] " -NoNewline -ForegroundColor DarkGray
        
        Write-Host "$file " -NoNewline
        
        try {
            if (-not (Test-Path $file)) {
                Write-Host "❌ (File not found)" -ForegroundColor Red
                $failCount++
                continue
            }

            # Get file size before minification
            $originalSize = (Get-Item $file).Length

            # Create output filename
            $minifiedFile = [System.IO.Path]::GetFileNameWithoutExtension($file) + ".min.js"
            $minifiedContent = Get-Minified-Content -sourceFile $file
            
            if ($null -ne $minifiedContent) {
                Set-Content -Path $minifiedFile -Value $minifiedContent -NoNewline -ErrorAction Stop
                
                # Get file size after minification
                $newSize = (Get-Item $minifiedFile).Length
                $bytesSaved = $originalSize - $newSize
                $totalBytesSaved += $bytesSaved
                $kbSaved = [math]::Round($bytesSaved / 1KB, 1)
                
                Write-Host "✅ " -ForegroundColor Green -NoNewline
                Write-Host "(🗜 $kbSaved KB)" -ForegroundColor Cyan
                
                $successCount++
            }
            else {
                Write-Host "❌" -ForegroundColor Red
                $failCount++
            }
        }
        catch {
            Write-Host "❌" -ForegroundColor Red
            Write-Error "Error processing $file : $_"
            $failCount++
            continue
        }
    }

    # Clean up the content
    $allContent = $allContent -replace "`n{3,}$", "`n`n"

    # Write the updated content back to the file
    Set-Content -Path "DT-COMB.min.js" -Value $allContent -NoNewline -ErrorAction Stop
    
    # Calculate execution time
    $endTime = Get-Date
    $executionTime = ($endTime - $startTime).TotalSeconds
    $executionTime = [math]::Round($executionTime, 2)  # Round to 2 decimal places
    
    # Calculate total size saved
    $totalKBSaved = [math]::Round($totalBytesSaved / 1KB, 1)
    $totalMBSaved = [math]::Round($totalBytesSaved / 1MB, 2)
    $totalPercentSaved = [math]::Round(($totalBytesSaved / $totalOriginalSize) * 100)
    
    # Calculate new total size
    $newTotalSize = $totalOriginalSize - $totalBytesSaved
    $newTotalKB = [math]::Round($newTotalSize / 1KB, 1)
    $newTotalMB = [math]::Round($newTotalSize / 1MB, 2)
    $originalTotalMB = [math]::Round($totalOriginalSize / 1MB, 2)

    # Display summary
    Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host "📊 SUMMARY" -ForegroundColor Cyan
    Write-Host "───────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "✅ Successful: " -ForegroundColor Green -NoNewline
    Write-Host "$successCount files" -ForegroundColor White
    Write-Host "❌ Failed: " -ForegroundColor Red -NoNewline
    Write-Host "$failCount files" -ForegroundColor White
    Write-Host "📈 Completion: " -ForegroundColor Magenta -NoNewline
    Write-Host "$([math]::Round(($successCount / $totalFiles) * 100))% of files" -ForegroundColor White
    Write-Host "💾 Total Space Saved: " -ForegroundColor Yellow -NoNewline
    
    if ($newTotalMB -ge 1) {
        Write-Host "$newTotalMB MB from $originalTotalMB MB ($totalKBSaved KB, $totalPercentSaved% smaller)" -ForegroundColor White
    }
    else {
        Write-Host "$newTotalKB KB from $originalTotalMB MB ($totalKBSaved KB, $totalPercentSaved% smaller)" -ForegroundColor White
    }
    
    Write-Host "🕒 Total Time: " -ForegroundColor Cyan -NoNewline
    Write-Host "$executionTime seconds" -ForegroundColor White
    Write-Host "───────────────────────────────────────────────────" -ForegroundColor DarkGray
    
    if ($failCount -eq 0) {
        Write-Host "✅ ALL FILES PROCESSED SUCCESSFULLY ✅" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ COMPLETED WITH ERRORS ⚠️" -ForegroundColor Yellow
    }
}
catch {
    Write-Error "Script execution failed: $_"
    exit 1
}
