# Set the current working directory to the directory containing the script
Set-Location -Path $PSScriptRoot

# Start timing the script execution
$startTime = Get-Date

# Define a function to minify HTML files
function MinifyHTML($inputFile, $outputFile) {
    try {
        # Check if input file exists
        if (-not (Test-Path $inputFile)) {
            throw "Input file not found: $inputFile"
        }

        # Check if html-minifier is installed
        if (-not (Get-Command html-minifier -ErrorAction SilentlyContinue)) {
            throw "html-minifier is not installed. Please install it using 'npm install -g html-minifier'"
        }

        # Get the original file size
        $originalSize = (Get-Item $inputFile).Length

        # Read the content of the file
        $content = Get-Content -Path $inputFile -Raw -ErrorAction Stop
        
        # Replace .css with .min.css in link tags, being careful not to replace .min.css again
        $content = $content -replace '(href="[^"]*?)(?<!\.min)\.css"', '$1.min.css"'
        
        # Replace .js with .min.js in script tags, being careful not to replace .min.js again
        $content = $content -replace '(src="[^"]*?)(?<!\.min)\.js"', '$1.min.js"'
        
        # Create a temporary file for the modified content
        $tempFile = [System.IO.Path]::GetTempFileName()
        $content | Set-Content -Path $tempFile -NoNewline -ErrorAction Stop
        
        # Ensure output directory exists
        $outputDir = Split-Path -Parent $outputFile
        if (-not (Test-Path $outputDir)) {
            New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
        }

        # Use html-minifier with the temporary file
        $minifierResult = html-minifier --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype $tempFile -o $outputFile 2>&1

        if ($LASTEXITCODE -ne 0) {
            throw "html-minifier failed: $minifierResult"
        }

        # Get the new file size
        $newSize = (Get-Item $outputFile).Length
        
        # Calculate size reduction
        $sizeDiff = $originalSize - $newSize
        
        # Store size information
        return @{
            Success = $true
            OriginalSize = $originalSize
            NewSize = $newSize
            SizeDiff = $sizeDiff
        }
    }
    catch {
        Write-Error "Error processing file $inputFile : $_"
        return @{
            Success = $false
            OriginalSize = 0
            NewSize = 0
            SizeDiff = 0
        }
    }
    finally {
        # Clean up the temporary file if it exists
        if ($tempFile -and (Test-Path $tempFile)) {
            Remove-Item $tempFile -ErrorAction SilentlyContinue
        }
    }
}

# Function to format file size
function Format-FileSize($size) {
    if ($size -ge 1MB) {
        return "$([math]::Round($size / 1MB, 2)) MB"
    } else {
        return "$([math]::Round($size / 1KB, 1)) KB"
    }
}

# Get all HTML files in the current directory
try {
    $files = Get-ChildItem -Filter "*.html" -ErrorAction Stop
    $filteredFiles = $files | Where-Object { $_.Name -notmatch "(test|backup|copy)" }
    $totalFiles = $filteredFiles.Count
    
    # Calculate total size
    $totalOriginalSize = ($filteredFiles | Measure-Object -Property Length -Sum).Sum
    $totalOriginalSizeFormatted = Format-FileSize $totalOriginalSize
    
    $processedCount = 0
    $successCount = 0
    $failCount = 0
    $totalNewSize = 0
    
    # Calculate padding widths based on total files
    $countWidth = $totalFiles.ToString().Length
    $percentWidth = 3 # No decimal points now

    Write-Host "`n🔄 Starting HTML minification process..." -ForegroundColor Cyan
    Write-Host "🔍 Found $totalFiles HTML files to process (💾 $totalOriginalSizeFormatted total)" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor DarkGray

    # Loop through each HTML file
    foreach ($file in $filteredFiles) {
        $processedCount++
        $percentComplete = [math]::Round(($processedCount / $totalFiles) * 100)
        
        # Format the count and percentage with consistent padding
        $countDisplay = "[$($processedCount.ToString().PadRight($countWidth))/$totalFiles]"
        $percentDisplay = "$($percentComplete.ToString().PadRight($percentWidth))%"
        
        # Get the file name without extension
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
        
        # Construct the input and output file paths
        $inputFile = $file.FullName
        $outputFile = "../books/$($file.Name)"
        
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
        
        # Call the MinifyHTML function to process the file
        $result = MinifyHTML $inputFile $outputFile
        
        # Print appropriate message based on success
        if ($result.Success) {
            $sizeDiffFormatted = Format-FileSize $result.SizeDiff
            Write-Host "✅" -ForegroundColor Green -NoNewline
            Write-Host " (🗜 $sizeDiffFormatted)" -ForegroundColor Blue
            $successCount++
            $totalNewSize += $result.NewSize
        } else {
            Write-Host "❌" -ForegroundColor Red
            $failCount++
        }
    }

    # Copy index page over to layout index dir
    try {
        Write-Host "`nCopying index.html to layouts directory..." -ForegroundColor Cyan -NoNewline
        if (Test-Path "../books/index.html") {
            Copy-Item "../books/index.html" -Destination "../_layouts/index.html" -ErrorAction Stop
            Write-Host " ✅" -ForegroundColor Green
        } else {
            Write-Host " ⚠️ index.html not found in ../books/" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host " ❌" -ForegroundColor Red
        Write-Error "Failed to copy index.html: $_"
    }

    # Calculate execution time
    $endTime = Get-Date
    $executionTime = ($endTime - $startTime).TotalSeconds

    # Calculate total size saved
    $totalSizeSaved = $totalOriginalSize - $totalNewSize
    $totalSizeSavedFormatted = Format-FileSize $totalSizeSaved
    $totalNewSizeFormatted = Format-FileSize $totalNewSize
    $percentSaved = [math]::Round(($totalSizeSaved / $totalOriginalSize) * 100)

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
    Write-Host "$totalNewSizeFormatted from $totalOriginalSizeFormatted ($totalSizeSavedFormatted, $percentSaved% smaller)" -ForegroundColor White
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