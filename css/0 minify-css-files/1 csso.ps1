# SCRIPT: CSSO MINIFIER
#
# PURPOSE:
# This script finds all .css files in the current directory (excluding previously
# minified ones), optionally filters them by modification date, and minifies them
# using csso, creating '-csso.min.css' output files.
#
# PREREQUISITES:
# - csso-cli: Must be installed globally via npm.
#   Run: npm install -g csso-cli
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

function MinifyCssWithCsso($inputFile, $outputFile) {
    try {
        if (-not (Test-Path $inputFile)) { throw "Input file not found: $inputFile" }
        if (-not (Get-Command csso -ErrorAction SilentlyContinue)) { throw "csso-cli is not installed. Run 'npm install -g csso-cli'" }

        $originalSize = (Get-Item $inputFile).Length
        
        $result = csso $inputFile -o $outputFile 2>&1
        if ($LASTEXITCODE -ne 0) { throw "CSSO failed: $result" }
        
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
    $files = Get-ChildItem -Filter "*.css" | Where-Object { $_.Name -notlike "*-csso.min.css" }
    
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

    Write-Host "`n🔄 Starting CSSO minification for $totalFiles files (Total Size: $([math]::Round($totalOriginalSize/1KB,1)) KB)..." -ForegroundColor Cyan
    
    # =========================================================================
    # 3. PROCESS ALL FILES
    # =========================================================================
    foreach ($file in $files) {
        $processedCount++
        $outputFile = $file.BaseName + "-csso.min.css"
        
        Write-Host "[$processedCount/$totalFiles] Processing $($file.Name)... " -NoNewline
        
        $result = MinifyCssWithCsso $file.FullName $outputFile

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