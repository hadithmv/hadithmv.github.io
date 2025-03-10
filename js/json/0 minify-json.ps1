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
    
    # Calculate padding widths based on total files
    $countWidth = $totalFiles.ToString().Length
    $percentWidth = 5 # "100.0" is 5 chars

    Write-Host "`n🔄 Starting JSON minification process..." -ForegroundColor Cyan
    Write-Host "🔍 Found $totalFiles JSON files to process" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor DarkGray

    # Process each JSON file
    foreach ($file in $files) {
        $processedCount++
        $percentComplete = [math]::Round(($processedCount / $totalFiles) * 100, 1)
        
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
            $reduction = [math]::Round(100 - (($newSize / $originalSize) * 100), 1)
            
            # Show file size reduction
            Write-Host "✅ " -ForegroundColor Green -NoNewline
            Write-Host "($reduction% " -ForegroundColor Cyan -NoNewline
            Write-Host "smaller)" -ForegroundColor Cyan
            
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
    Write-Host "🕒 Total Time: " -ForegroundColor Cyan -NoNewline
    Write-Host "$([math]::Round($executionTime, 2)) seconds" -ForegroundColor White
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