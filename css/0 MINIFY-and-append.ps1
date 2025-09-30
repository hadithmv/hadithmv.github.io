# Set the working directory to the script's location
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

# Function to format file size
function Format-FileSize($size) {
    if ($size -ge 1MB) {
        return "$([math]::Round($size / 1MB, 2)) MB"
    }
    else {
        return "$([math]::Round($size / 1KB, 1)) KB"
    }
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

        # Get the original file size
        $originalSize = (Get-Item $sourceFile).Length

        $minifiedFile = [System.IO.Path]::GetFileNameWithoutExtension($sourceFile) + ".temp.css"
        
        # Run csso and capture any errors
        $cssoOutput = csso $sourceFile -o $minifiedFile 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "csso failed: $cssoOutput"
        }

        $minifiedContent = Get-Content -Path $minifiedFile -Raw -ErrorAction Stop
        
        # Get the minified file size
        $minifiedSize = (Get-Item $minifiedFile).Length
        
        # Calculate size difference
        $sizeDiff = $originalSize - $minifiedSize
        
        Remove-Item -Path $minifiedFile -ErrorAction Stop
        
        return @{
            Content      = $minifiedContent.Trim()
            OriginalSize = $originalSize
            MinifiedSize = $minifiedSize
            SizeDiff     = $sizeDiff
        }
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
    "quran-navigation-list.css",
    "markdown-page.css"
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
        Write-Host "No CSS files matched the modified-days filter." -ForegroundColor Yellow
        return
    }
    $processedCount = 0
    $successCount = 0
    $failCount = 0
    $totalOriginalSize = 0
    $totalMinifiedSize = 0
    
    # Calculate padding widths based on total files
    $countWidth = $totalFiles.ToString().Length
    $percentWidth = 3 # No decimal points now
    
    # Calculate total original size
    foreach ($file in ($combFiles + $separateFiles)) {
        if (Test-Path $file) {
            $totalOriginalSize += (Get-Item $file).Length
        }
    }
    
    $totalOriginalSizeFormatted = Format-FileSize $totalOriginalSize
    
    Write-Host "`n🔄 Starting CSS minification process..." -ForegroundColor Cyan
    Write-Host "🔍 Found " -ForegroundColor Cyan -NoNewline
    Write-Host "$totalFiles" -ForegroundColor White -NoNewline
    Write-Host " files to process (💾 " -ForegroundColor Cyan -NoNewline
    Write-Host "$totalOriginalSizeFormatted" -ForegroundColor White -NoNewline
    Write-Host " total)" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor DarkGray

    # Check if DT-COMB.min.css exists
    $combFileExists = Test-Path "DT-COMB.min.css"
    if (-not $combFileExists) {
        Write-Host "⚠️ DT-COMB.min.css not found. Creating new file." -ForegroundColor Yellow
        New-Item -ItemType File -Name "DT-COMB.min.css" -Force | Out-Null
    }
    else {
        $combOriginalSize = (Get-Item "DT-COMB.min.css").Length
    }

    # Read the entire content of DT-COMB.min.css
    $allContent = Get-Content -Path "DT-COMB.min.css" -Raw -ErrorAction Stop

    # Process files for DT-COMB.min.css
    foreach ($file in $combFiles) {
        $processedCount++
        $percentComplete = [math]::Round(($processedCount / $totalFiles) * 100)
        
        # Format the count and percentage with consistent padding
        $countDisplay = "[$($processedCount.ToString().PadRight($countWidth))/$totalFiles]"
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
        $headerPattern = "/* $file */"
        
        # Check if this header exists in the content
        if ($allContent -match [regex]::Escape($headerPattern)) {
            Write-Host "(Updating) " -NoNewline -ForegroundColor Blue
            
            # Get the new minified content
            $result = Get-Minified-Content -sourceFile $file
            if ($null -eq $result) {
                Write-Host "❌" -ForegroundColor Red
                $failCount++
                continue
            }
            
            try {
                # Pattern to match the whole section (header + content until next header or end)
                $pattern = "(?ms)/\* $file \*/\r?\n.*?(?=(/\* .*?\*/\r?\n|\z))"
                
                # Create replacement with preserved header and blank line after code block
                $replacement = "/* $file */`n$($result.Content)`n`n"
                
                # Replace the section
                $allContent = [regex]::Replace($allContent, $pattern, $replacement)
                
                $sizeDiffFormatted = Format-FileSize $result.SizeDiff
                Write-Host "✅ " -ForegroundColor Green -NoNewline
                Write-Host "(🗜 $sizeDiffFormatted)" -ForegroundColor Blue
                
                $totalOriginalSize += $result.OriginalSize
                $totalMinifiedSize += $result.MinifiedSize
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
        $countDisplay = "[$($processedCount.ToString().PadRight($countWidth))/$totalFiles]"
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

            # Get original file size
            $originalSize = (Get-Item $file).Length
            
            $minifiedFile = [System.IO.Path]::GetFileNameWithoutExtension($file) + ".min.css"
            $cssoOutput = csso $file -o $minifiedFile 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                # Get minified file size
                $minifiedSize = (Get-Item $minifiedFile).Length
                $sizeDiff = $originalSize - $minifiedSize
                $sizeDiffFormatted = Format-FileSize $sizeDiff
                
                Write-Host "✅ " -ForegroundColor Green -NoNewline
                Write-Host "(🗜 $sizeDiffFormatted)" -ForegroundColor Blue
                
                $totalOriginalSize += $originalSize
                $totalMinifiedSize += $minifiedSize
                $successCount++
            }
            else {
                Write-Host "❌" -ForegroundColor Red
                Write-Error "Failed to minify $file : $cssoOutput"
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

    # Remove any potential multiple blank lines at the end of the file
    $allContent = $allContent -replace "`n{3,}$", "`n`n"

    # Write the updated content back to the file
    Set-Content -Path "DT-COMB.min.css" -Value $allContent -NoNewline -ErrorAction Stop
    
    # Get final combined file size
    $combFinalSize = (Get-Item "DT-COMB.min.css").Length
    $combSizeDiff = 0
    if ($combFileExists) {
        $combSizeDiff = $combOriginalSize - $combFinalSize
    }
    
    # Calculate execution time
    $endTime = Get-Date
    $executionTime = ($endTime - $startTime).TotalSeconds
    
    # Calculate total space saved
    $totalSizeSaved = $totalOriginalSize - $totalMinifiedSize
    $totalSizeSavedFormatted = Format-FileSize $totalSizeSaved
    $totalMinifiedSizeFormatted = Format-FileSize $totalMinifiedSize
    $percentSaved = 0
    if ($totalOriginalSize -gt 0) {
        $percentSaved = [math]::Round(($totalSizeSaved / $totalOriginalSize) * 100)
    }

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
    Write-Host "$totalMinifiedSizeFormatted from $totalOriginalSizeFormatted ($totalSizeSavedFormatted, $percentSaved% smaller)" -ForegroundColor White
    Write-Host "🕒 Total Time: " -ForegroundColor Cyan -NoNewline
    Write-Host "$([math]::Round($executionTime, 2)) seconds" -ForegroundColor White
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
