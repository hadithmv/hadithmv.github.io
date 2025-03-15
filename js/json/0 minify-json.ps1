# Set the current location to the directory containing the script
try {
    Set-Location -Path $PSScriptRoot -ErrorAction Stop
    
    # Start timing the script execution
    $startTime = Get-Date
}
catch {
    Write-Error "Failed to set working directory: $_"
    exit 1
}

try {
    # Get all JSON files in the current directory
    $files = Get-ChildItem -Filter "*.json" -ErrorAction Stop
    $totalFiles = $files.Count
    $processedCount = 0
    $successCount = 0
    $failCount = 0
    $totalBytesSaved = 0
    $totalOriginalSize = 0
    
    # Calculate padding widths based on total files
    $countWidth = $totalFiles.ToString().Length
    $percentWidth = 3 # "100" is 3 chars
    
    # Calculate total size of files
    foreach ($file in $files) {
        $totalOriginalSize += (Get-Item $file.FullName).Length
    }
    
    # Display total files and size
    $totalKB = [math]::Round($totalOriginalSize / 1KB, 1)
    $totalMB = [math]::Round($totalOriginalSize / 1MB, 2)

    Write-Host "`n🔄 Starting JSON minification process..." -ForegroundColor Cyan
    
    # For the total files and size display:
    if ($totalMB -ge 1) {
        Write-Host "🔍 Found $totalFiles JSON files to process (💾 $totalMB MB total)" -ForegroundColor Cyan
    }
    else {
        Write-Host "🔍 Found $totalFiles JSON files to process (💾 $totalKB KB total)" -ForegroundColor Cyan
    }
    
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor DarkGray

    # Process each JSON file
    foreach ($file in $files) {
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
        
        Write-Host "$($file.Name) " -NoNewline
        
        try {
            # Get file size before minification for comparison
            $originalSize = (Get-Item $file.FullName).Length
            
            # Read the content of the JSON file
            $content = Get-Content $file.FullName -Raw -ErrorAction Stop
            
            # Parse and convert back to JSON to minify
            $jsonObject = $content | ConvertFrom-Json
            $minifiedJson = $jsonObject | ConvertTo-Json -Compress
            
            # Write the minified content back to the same file
            $minifiedJson | Set-Content $file.FullName -ErrorAction Stop
            
            # Get file size after minification
            $newSize = (Get-Item $file.FullName).Length
            $bytesSaved = $originalSize - $newSize
            $totalBytesSaved += $bytesSaved
            $kbSaved = [math]::Round($bytesSaved / 1KB, 1)
            
            # Show file size reduction
            Write-Host "✅ " -ForegroundColor Green -NoNewline
            Write-Host "(🗜 $kbSaved KB)" -ForegroundColor Cyan
            
            $successCount++
        }
        catch {
            Write-Host "❌ " -ForegroundColor Red -NoNewline
            Write-Host "$_" -ForegroundColor Red
            $failCount++
            continue
        }
    }

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
    } else {
        Write-Host "⚠️ COMPLETED WITH ERRORS ⚠️" -ForegroundColor Yellow
    }
}
catch {
    Write-Error "Script execution failed: $_"
    exit 1
}