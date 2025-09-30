# SCRIPT: POSTCSS MINIFIER
#
# PURPOSE:
# This script finds all .css files in the current directory (excluding previously
# minified ones), optionally filters them by modification date, and minifies them
# using PostCSS and cssnano, creating '-nano.min.css' output files.
#
# PREREQUISITES:
# - PostCSS, PostCSS CLI, and cssnano must be installed.
#   Run: npm install -g postcss postcss-cli cssnano
# - A 'postcss.config.js' file should exist in your project root with at least:
#   module.exports = { plugins: [require('cssnano')] };
#
# USAGE:
# Run this script from within the directory containing the CSS files.
#------------------------------------------------------------------------------------

# Set the working directory to the script's location
try {
    Set-Location -Path $PSScriptRoot -ErrorAction Stop
    $startTime = Get-Date
}
catch {
    Write-Error "Failed to set working directory: $_"
    exit 1
}

# --- CONFIGURATION ---
# Toggle processing only files modified within N days ago.
# Allowed values: 1, 2, 5, 10, or 'Off' to disable. Default: 2
$ModifiedDaysOption = 2

# --- MINIFICATION FUNCTION ---

function MinifyCssWithPostcss($inputFile, $outputFile) {
    try {
        if (-not (Test-Path $inputFile)) { throw "Input file not found: $inputFile" }
        if (-not (Get-Command postcss -ErrorAction SilentlyContinue)) { throw "postcss-cli is not installed. Run 'npm install -g postcss-cli'" }

        $originalSize = (Get-Item $inputFile).Length
        
        # Use -o for output file. Redirect stderr to capture error messages.
        $result = postcss $inputFile -o $outputFile 2>&1
        if ($LASTEXITCODE -ne 0) { throw "PostCSS failed: $result" }
        
        $newSize = (Get-Item $outputFile).Length
        return @{
            Success      = $true
            KBSaved      = [math]::Round(($originalSize - $newSize) / 1KB, 1)
            BytesSaved   = ($originalSize - $newSize)
            OriginalSize = $originalSize
        }
    }
    catch {
        Write-Error "Error processing CSS file $inputFile : $_"
        return @{ Success = $false }
    }
}

try {
    # =========================================================================
    # 1. FIND AND FILTER FILES
    # =========================================================================
    # Find all CSS files, excluding any that we've already minified with this script.
    $files = Get-ChildItem -Filter "*.css" | Where-Object { $_.Name -notlike "*-nano.min.css" }
    
    if ($ModifiedDaysOption -is [int] -and $ModifiedDaysOption -gt 0) {
        $since = (Get-Date).AddDays(-$ModifiedDaysOption)
        Write-Host "🗓️  Filtering for files modified in the last $ModifiedDaysOption days..." -ForegroundColor Cyan
        $files = $files | Where-Object { $_.LastWriteTime -ge $since }
    }
    else {
        Write-Host "🗓️  Modified-days filter is OFF." -ForegroundColor DarkGray
    }

    $totalFiles = $files.Count
    if ($totalFiles -eq 0) { Write-Host "`nNo CSS files matched the criteria to be processed."; exit 0 }
    
    # =========================================================================
    # 2. PREPARE FOR PROCESSING
    # =========================================================================
    $totalOriginalSize = ($files | Measure-Object -Property Length -Sum).Sum
    $totalBytesSaved = 0
    $processedCount = 0
    $successCount = 0
    $failCount = 0

    Write-Host "`n🔄 Starting PostCSS minification for $totalFiles files (Total Size: $([math]::Round($totalOriginalSize/1KB,1)) KB)..." -ForegroundColor Cyan
    
    # =========================================================================
    # 3. PROCESS ALL FILES
    # =========================================================================
    foreach ($file in $files) {
        $processedCount++
        $outputFile = $file.BaseName + "-nano.min.css"
        
        Write-Host "[$processedCount/$totalFiles] Processing $($file.Name)... " -NoNewline
        
        $result = MinifyCssWithPostcss $file.FullName $outputFile

        if ($result.Success) {
            Write-Host "✅ Success" -ForegroundColor Green -NoNewline
            Write-Host " (Saved $($result.KBSaved) KB)" -ForegroundColor Cyan
            $totalBytesSaved += $result.BytesSaved
            $successCount++
        }
        else {
            Write-Host "❌ FAILED" -ForegroundColor Red
            $failCount++
        }
    }

    # =========================================================================
    # 4. DISPLAY SUMMARY
    # =========================================================================
    $endTime = Get-Date
    $executionTime = [math]::Round(($endTime - $startTime).TotalSeconds, 2)
    $totalKBSaved = [math]::Round($totalBytesSaved / 1KB, 1)
    $totalPercentSaved = 0
    if ($totalOriginalSize -gt 0) { $totalPercentSaved = [math]::Round(($totalBytesSaved / $totalOriginalSize) * 100) }

    Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host "📊 SUMMARY" -ForegroundColor Cyan
    Write-Host "───────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "✅ Successful: $successCount files" -ForegroundColor Green
    Write-Host "❌ Failed:     $failCount files" -ForegroundColor Red
    Write-Host "💾 Total Space Saved: $totalKBSaved KB ($totalPercentSaved% smaller)" -ForegroundColor Yellow
    Write-Host "🕒 Total Time: $executionTime seconds" -ForegroundColor Cyan
    Write-Host "───────────────────────────────────────────────────" -ForegroundColor DarkGray
    if ($failCount -eq 0) { Write-Host "✅ ALL FILES PROCESSED SUCCESSFULLY ✅" -ForegroundColor Green }
    else { Write-Host "⚠️ COMPLETED WITH ERRORS ⚠️" -ForegroundColor Yellow }
}
catch {
    Write-Error "Script execution failed: $_"
    exit 1
}