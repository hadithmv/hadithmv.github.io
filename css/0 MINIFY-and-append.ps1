# SCRIPT: ADVANCED CSS BUILDER (COMBINED & SEPARATE MINIFICATION)
#
# PURPOSE:
# This script performs two types of CSS minification:
# 1. Minifies a list of individual CSS files into their own '.min.css' versions.
# 2. Updates a combined CSS file by minifying source files and replacing their
#    corresponding sections within the combined file.
#
# PREREQUISITES:
# - csso-cli: npm install -g csso-cli
#
# USAGE:
# Run this script from within the directory containing the source CSS files.
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

# Files to minify into their own separate '.min.css' file.
$separateFiles = @(
    "base-styles.css",
    "DT-inline.css",
    "markdown-page.css",
    "navbar.css",
    "quran-navigation-list.css"
)
# note that index css is NOT included here as it is part of the combined file on the minified index html itself.

# Files whose minified content will UPDATE sections within the combined file below.
$combinedFile = "DT-COMB.min.css"
$filesToCombine = @(
    #"DT-inline.css" # Example: uncomment to also update this section in the combined file
)

# --- MINIFICATION FUNCTIONS ---

function MinifyCSS($inputFile, $outputFile) {
    try {
        if (-not (Test-Path $inputFile)) { throw "Input file not found: $inputFile" }
        if (-not (Get-Command csso -ErrorAction SilentlyContinue)) { throw "csso-cli is not installed." }

        $outputDir = Split-Path -Parent $outputFile
        
        # --- FIX: Only try to create a directory if the path is not empty ---
        if (-not [string]::IsNullOrEmpty($outputDir) -and -not (Test-Path $outputDir)) {
            New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
        }
        
        $originalSize = (Get-Item $inputFile).Length
        $result = csso $inputFile -o $outputFile 2>&1
        if ($LASTEXITCODE -ne 0) { throw "CSSO failed: $result" }
        
        $newSize = (Get-Item $outputFile).Length
        return @{ Success = $true; KBSaved = [math]::Round(($originalSize - $newSize) / 1KB, 1); BytesSaved = ($originalSize - $newSize); OriginalSize = $originalSize }
    }
    catch { Write-Error "Error minifying CSS file $inputFile : $_"; return @{ Success = $false } }
}

function Minify-CssContent($content) {
    $tempInputFile = $null; $tempOutputFile = $null
    try {
        if (-not (Get-Command csso -ErrorAction SilentlyContinue)) { throw "csso-cli is not installed." }
        $tempInputFile = [System.IO.Path]::GetTempFileName() + ".css"
        $tempOutputFile = [System.IO.Path]::GetTempFileName() + ".min.css"
        $content | Set-Content -Path $tempInputFile -NoNewline
        csso $tempInputFile -o $tempOutputFile 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "CSSO content minification failed." }
        return Get-Content -Path $tempOutputFile -Raw
    }
    catch { Write-Error "Error minifying CSS content: $_"; return $null }
    finally {
        if ($tempInputFile) { Remove-Item $tempInputFile -Force -ErrorAction SilentlyContinue }
        if ($tempOutputFile) { Remove-Item $tempOutputFile -Force -ErrorAction SilentlyContinue }
    }
}

try {
    # =========================================================================
    # 1. DEFINE ALL BUILD OPERATIONS
    # =========================================================================
    $operations = @()
    foreach ($file in $separateFiles) {
        $operations += @{
            Type   = "MinifySeparate"
            Input  = $file
            Output = $file -replace '\.css$', '.min.css'
            Name   = $file
        }
    }
    foreach ($file in $filesToCombine) {
        $operations += @{
            Type  = "UpdateCombined"
            Input = $file
            Name  = "$file -> (combined)"
        }
    }

    # =========================================================================
    # 2. FILTER AND PREPARE FOR PROCESSING
    # =========================================================================
    if ($ModifiedDaysOption -is [int] -and $ModifiedDaysOption -gt 0) {
        $since = (Get-Date).AddDays(-$ModifiedDaysOption)
        Write-Host "🗓️  Filtering for files modified in the last $ModifiedDaysOption days..." -ForegroundColor Cyan
        $operations = $operations | Where-Object { (Test-Path $_.Input) -and (Get-Item $_.Input).LastWriteTime -ge $since }
    }
    else {
        Write-Host "🗓️  Modified-days filter is OFF." -ForegroundColor DarkGray
    }

    $totalFiles = $operations.Count
    if ($totalFiles -eq 0) { Write-Host "`nNo files matched criteria to process."; exit 0 }
    
    $totalOriginalSize = 0; $totalBytesSaved = 0
    $operations | ForEach-Object { if (Test-Path $_.Input) { $totalOriginalSize += (Get-Item $_.Input).Length } }

    # =========================================================================
    # 3. PROCESS ALL OPERATIONS
    # =========================================================================
    $processedCount = 0; $successCount = 0; $failCount = 0
    Write-Host "`n🔄 Starting CSS minification for $totalFiles files (Total Size: $([math]::Round($totalOriginalSize/1KB,1)) KB)..." -ForegroundColor Cyan
    
    # Read the combined file content ONCE if needed
    $combinedFileContent = ""
    if (($operations | Where-Object { $_.Type -eq 'UpdateCombined' }).Count -gt 0) {
        if (Test-Path $combinedFile) {
            $combinedFileContent = Get-Content -Path $combinedFile -Raw
        }
        else {
            Write-Warning "'$combinedFile' not found. Sections cannot be updated."
        }
    }
    
    foreach ($op in $operations) {
        if (-not(Test-Path $op.Input)) {
            Write-Warning "Skipping $($op.Name): Input file not found at $($op.Input)"
            continue
        }

        $processedCount++
        Write-Host "[$processedCount/$totalFiles] Processing $($op.Name)... " -NoNewline
        $result = $null

        switch ($op.Type) {
            "MinifySeparate" {
                $result = MinifyCSS $op.Input $op.Output
            }
            "UpdateCombined" {
                $headerPattern = "/* $($op.Input) */"
                if ($combinedFileContent -match [regex]::Escape($headerPattern)) {
                    Write-Host "(Updating section...) " -NoNewline -ForegroundColor DarkCyan
                    $sourceContent = Get-Content $op.Input -Raw
                    $minifiedContent = Minify-CssContent $sourceContent
                    if ($minifiedContent) {
                        $originalSize = $sourceContent.Length
                        $pattern = "(?ms)/\* $($op.Input) \*/\r?\n.*?(?=(/\* .*?\*/\r?\n|\z))"
                        $replacement = "/* $($op.Input) */`n$($minifiedContent)`n`n"
                        $combinedFileContent = [regex]::Replace($combinedFileContent, $pattern, $replacement)
                        $result = @{ Success = $true; BytesSaved = $originalSize - $minifiedContent.Length; KBSaved = [math]::Round(($originalSize - $minifiedContent.Length) / 1KB, 1) }
                    }
                }
                else {
                    Write-Host "(Section not found in combined file) " -NoNewline -ForegroundColor Yellow
                    $result = @{ Success = $false }
                }
            }
        }

        if ($result.Success) {
            Write-Host "✅ Success" -ForegroundColor Green -NoNewline
            if ($result.ContainsKey('KBSaved')) {
                Write-Host " (Saved $($result.KBSaved) KB)" -ForegroundColor Cyan
                $totalBytesSaved += $result.BytesSaved
            }
            else { Write-Host "" }
            $successCount++
        }
        else {
            Write-Host "❌ FAILED" -ForegroundColor Red
            $failCount++
        }
    }

    # Write the updated combined file content back to disk ONCE
    if (($operations | Where-Object { $_.Type -eq 'UpdateCombined' }).Count -gt 0 -and (Test-Path $combinedFile)) {
        Write-Host "`nWriting updated content to $combinedFile..." -NoNewline
        $combinedFileContent = $combinedFileContent -replace "`n{3,}$", "`n`n" # Clean up trailing newlines
        $combinedFileContent | Set-Content -Path $combinedFile -NoNewline
        Write-Host " ✅" -ForegroundColor Green
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
    Write-Host "✅ Successful: $successCount operations" -ForegroundColor Green
    Write-Host "❌ Failed:     $failCount operations" -ForegroundColor Red
    Write-Host "💾 Total Space Saved: $totalKBSaved KB ($totalPercentSaved% smaller)" -ForegroundColor Yellow
    Write-Host "🕒 Total Time: $executionTime seconds" -ForegroundColor Cyan
    Write-Host "───────────────────────────────────────────────────" -ForegroundColor DarkGray
    if ($failCount -eq 0) { Write-Host "✅ BUILD COMPLETED SUCCESSFULLY ✅" -ForegroundColor Green }
    else { Write-Host "⚠️ BUILD COMPLETED WITH ERRORS ⚠️" -ForegroundColor Yellow }
}
catch {
    Write-Error "Script execution failed: $_"
    exit 1
}