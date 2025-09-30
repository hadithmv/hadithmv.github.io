# SCRIPT: ADVANCED JAVASCRIPT BUILDER (COMBINED & SEPARATE MINIFICATION)
#
# PURPOSE:
# This script performs two types of JavaScript minification:
# 1. Minifies a list of individual JS files into their own '.min.js' versions.
# 2. Updates a combined JS file by minifying source files and replacing their
#    corresponding sections within the combined file.
#
# PREREQUISITES:
# - google-closure-compiler
# - terser
#
# USAGE:
# Run this script from within the directory containing the source JS files.
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

# Files to minify into their own separate '.min.js' file.
$separateFiles = @(
    "navbar.js",
    "DT-inline.js",
    "quran-navigation-objectMaps.js",
    "quran-navigation-list.js",
    "markdown-loader.js"
)

# Files whose minified content will UPDATE sections within the combined file below.
$combinedFile = "DT-COMB.min.js"
$filesToCombine = @(
    # "DT-inline.js" # Example: uncomment to also update this section in the combined file
)

# --- MINIFICATION FUNCTIONS ---

function MinifyJS($inputFile, $outputFile) {
    $tempFile = $null
    try {
        if (-not (Test-Path $inputFile)) { throw "Input file not found: $inputFile" }
        if (-not (Get-Command terser -ErrorAction SilentlyContinue)) { throw "terser is not installed." }

        $outputDir = Split-Path -Parent $outputFile
        if (-not [string]::IsNullOrEmpty($outputDir) -and -not (Test-Path $outputDir)) {
            New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
        }

        $originalSize = (Get-Item $inputFile).Length
        $terserInput = $inputFile
        
        if (Get-Command google-closure-compiler -ErrorAction SilentlyContinue) {
            $tempFile = [System.IO.Path]::GetTempFileName() + ".js"
            google-closure-compiler --js $inputFile --js_output_file $tempFile 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) { $terserInput = $tempFile }
        }

        $result = terser $terserInput -c -m --comments=false -o $outputFile 2>&1
        if ($LASTEXITCODE -ne 0) { throw "Terser failed: $result" }
        
        $newSize = (Get-Item $outputFile).Length
        return @{ Success = $true; KBSaved = [math]::Round(($originalSize - $newSize) / 1KB, 1); BytesSaved = ($originalSize - $newSize); OriginalSize = $originalSize }
    }
    catch { Write-Error "Error minifying JS file $inputFile : $_"; return @{ Success = $false } }
    finally { if ($tempFile) { Remove-Item $tempFile -Force -ErrorAction SilentlyContinue } }
}

function Minify-JsContent($content) {
    $tempInputFile = $null; $tempOutputFile = $null; $tempClosureFile = $null
    try {
        if (-not (Get-Command terser -ErrorAction SilentlyContinue)) { throw "terser is not installed." }
        
        $tempInputFile = [System.IO.Path]::GetTempFileName() + ".js"
        $content | Set-Content -Path $tempInputFile -NoNewline
        $terserInput = $tempInputFile
        
        if (Get-Command google-closure-compiler -ErrorAction SilentlyContinue) {
            $tempClosureFile = [System.IO.Path]::GetTempFileName() + ".js"
            google-closure-compiler --js $tempInputFile --js_output_file $tempClosureFile 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) { $terserInput = $tempClosureFile }
        }

        $tempOutputFile = [System.IO.Path]::GetTempFileName() + ".min.js"
        terser $terserInput -c -m --comments=false -o $tempOutputFile 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Terser content minification failed." }
        
        return Get-Content -Path $tempOutputFile -Raw
    }
    catch { Write-Error "Error minifying JS content: $_"; return $null }
    finally {
        if ($tempInputFile) { Remove-Item $tempInputFile -Force -ErrorAction SilentlyContinue }
        if ($tempOutputFile) { Remove-Item $tempOutputFile -Force -ErrorAction SilentlyContinue }
        if ($tempClosureFile) { Remove-Item $tempClosureFile -Force -ErrorAction SilentlyContinue }
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
            Output = $file -replace '\.js$', '.min.js'
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
    Write-Host "`n🔄 Starting JavaScript minification for $totalFiles files (Total Size: $([math]::Round($totalOriginalSize/1KB,1)) KB)..." -ForegroundColor Cyan
    
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
                $result = MinifyJS $op.Input $op.Output
            }
            "UpdateCombined" {
                $headerPattern = "// $($op.Input)"
                if ($combinedFileContent -match [regex]::Escape($headerPattern)) {
                    Write-Host "(Updating section...) " -NoNewline -ForegroundColor DarkCyan
                    $sourceContent = Get-Content $op.Input -Raw
                    $minifiedContent = Minify-JsContent $sourceContent
                    if ($minifiedContent) {
                        $originalSize = $sourceContent.Length
                        $pattern = "(?ms)// $($op.Input)\r?\n.*?(?=(// .*?\r?\n|\z))"
                        $replacement = "// $($op.Input)`n$($minifiedContent)`n`n"
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