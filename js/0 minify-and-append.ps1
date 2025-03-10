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
    "quran-navigation-list.js"
)

try {
    # Calculate total files to process
    $totalFiles = $combFiles.Count + $separateFiles.Count
    $processedCount = 0
    $successCount = 0
    $failCount = 0
    
    # Calculate padding widths based on total files
    $countWidth = $totalFiles.ToString().Length
    $percentWidth = 5 # "100.0" is 5 chars
    
    Write-Host "`n🔄 Starting JavaScript minification process..." -ForegroundColor Cyan
    Write-Host "🔍 Found $totalFiles JavaScript files to process" -ForegroundColor Cyan
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
        
        Write-Host "$file " -NoNewline
        
        # Create the exact header pattern that exists in the file
        $headerPattern = "// $file"
        
        # Check if this header exists in the content
        if ($allContent -match [regex]::Escape($headerPattern)) {
            Write-Host "(Updating) " -NoNewline -ForegroundColor Blue
            
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
                
                # Replace the section
                $allContent = [regex]::Replace($allContent, $pattern, $replacement)
                
                Write-Host "✅" -ForegroundColor Green
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
                $reduction = [math]::Round(100 - (($newSize / $originalSize) * 100), 1)
                
                Write-Host "✅ " -ForegroundColor Green -NoNewline
                Write-Host "($reduction% " -ForegroundColor Cyan -NoNewline
                Write-Host "smaller)" -ForegroundColor Cyan
                
                $successCount++
            } else {
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