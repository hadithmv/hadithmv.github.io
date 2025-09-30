# SCRIPT: PROJECT BUILDER FOR 'TOOLS-UC'
#
# PURPOSE:
# This script automates the process of building the 'tools' directory.
# It takes specific source files from 'tools-uc', minifies them, renames them,
# performs necessary text replacements, and places the final assets in '..\..\tools'.
#
# PREREQUISITES:
# - html-minifier-next: npm install -g html-minifier-next
# - google-closure-compiler
# - terser
#
# USAGE:
# Run this script from within the 'tools-uc' directory:
# .\build-specific-project.ps1
#------------------------------------------------------------------------------------

# Set the current working directory to the directory containing the script
try {
    Set-Location -Path $PSScriptRoot -ErrorAction Stop
    $startTime = Get-Date
}
catch {
    Write-Error "Failed to set working directory: $_"
    exit 1
}

# --- MINIFICATION FUNCTIONS (HTML, JS) ---

function MinifyHTML($inputFile, $outputFile) {
    try {
        if (-not (Test-Path $inputFile)) { throw "Input file not found: $inputFile" }
        if (-not (Get-Command html-minifier-next -ErrorAction SilentlyContinue)) { throw "html-minifier-next is not installed." }
        
        $content = Get-Content -Path $inputFile -Raw
        
        # --- GENERAL MODIFICATIONS FOR ALL HTML FILES ---
        # 1. Correct relative paths for the new flat directory structure.
        $content = $content -replace '((?:href|src)=["''])\.\./\.\./', '$1../'
        
        # 2. Generic update: change .css to .min.css and .js to .min.js
        $content = $content -replace '(href="[^"]*?)(?<!\.min)\.css"', '$1.min.css"'
        $content = $content -replace '(src="[^"]*?)(?<!\.min)\.js"', '$1.min.js"'
        
        $tempFile = [System.IO.Path]::GetTempFileName()
        $content | Set-Content -Path $tempFile -NoNewline -Encoding utf8
        
        $outputDir = Split-Path -Parent $outputFile
        if (-not (Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir -Force | Out-Null }
        
        $originalSize = (Get-Item $inputFile).Length
        $minifierResult = html-minifier-next --collapse-boolean-attributes --collapse-whitespace --minify-css true --minify-js true --remove-comments --remove-optional-tags --remove-redundant-attributes --use-short-doctype $tempFile -o $outputFile 2>&1
        
        if ($LASTEXITCODE -ne 0) { throw "html-minifier-next failed: $minifierResult" }
        $newSize = (Get-Item $outputFile).Length
        return @{ Success = $true; KBSaved = [math]::Round(($originalSize - $newSize) / 1KB, 1) }
    }
    catch { Write-Error "Error processing HTML file $inputFile : $_"; return @{ Success = $false; Error = $_ } }
    finally { if ($tempFile -and (Test-Path $tempFile)) { Remove-Item $tempFile -Force } }
}

function MinifyJS($inputFile, $outputFile) {
    try {
        if (-not (Test-Path $inputFile)) { throw "Input file not found: $inputFile" }
        if (-not (Get-Command google-closure-compiler -ErrorAction SilentlyContinue)) { throw "google-closure-compiler is not installed." }
        if (-not (Get-Command terser -ErrorAction SilentlyContinue)) { throw "terser is not installed." }
        
        $outputDir = Split-Path -Parent $outputFile
        if (-not (Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir -Force | Out-Null }
        
        $originalSize = (Get-Item $inputFile).Length
        $closureOutput = [System.IO.Path]::GetTempFileName()
        $closureResult = google-closure-compiler --js $inputFile --js_output_file $closureOutput 2>&1
        if ($LASTEXITCODE -ne 0) { throw "Closure Compiler failed: $closureResult" }
        $terserResult = terser $closureOutput -c -m --comments=false -o $outputFile 2>&1
        if ($LASTEXITCODE -ne 0) { throw "Terser failed: $terserResult" }
        $newSize = (Get-Item $outputFile).Length
        return @{ Success = $true; KBSaved = [math]::Round(($originalSize - $newSize) / 1KB, 1) }
    }
    catch { Write-Error "Error minifying JS file $inputFile : $_"; return @{ Success = $false; Error = $_ } }
    finally { if ($closureOutput -and (Test-Path $closureOutput)) { Remove-Item $closureOutput -Force } }
}

try {
    # =========================================================================
    # CONFIG: Define all file build operations here
    # =========================================================================
    $OutputFolder = "..\tools"
    $operations = @()

    # --- diffCompare ---
    $operations += @{
        Type          = "CustomHTML"
        Input         = "diffCompare/cdn-custom.html"
        Output        = Join-Path $OutputFolder "diffCompare.html"
        Name          = "diffCompare HTML"
        Modifications = {
            param($content)
            # Specifically replace mergely.js with the new minified filename
            $content -replace 'src="mergely.js"', 'src="diffCompare.min.js"'
        }
    }
    $operations += @{ Type = "JS"; Input = "diffCompare/mergely.js"; Output = Join-Path $OutputFolder "diffCompare.min.js"; Name = "diffCompare JS" }

    # --- keyboardPage ---
    $operations += @{ Type = "HTML"; Input = "keyboardPage/index-custom.html"; Output = Join-Path $OutputFolder "keyboardPage.html"; Name = "keyboardPage HTML" }

    # --- qrCode ---
    $operations += @{ Type = "HTML"; Input = "qrCode/qrcodegen-input-custom.html"; Output = Join-Path $OutputFolder "qrCode.html"; Name = "qrCode HTML" }

    # --- textEditor ---
    $operations += @{ Type = "HTML"; Input = "textEditor/textEditor.html"; Output = Join-Path $OutputFolder "textEditor.html"; Name = "textEditor HTML" }
    $operations += @{ Type = "JS"; Input = "textEditor/textEditor.js"; Output = Join-Path $OutputFolder "textEditor.min.js"; Name = "textEditor.js" }
    $operations += @{ Type = "JS"; Input = "textEditor/textEditor-noFiliExceptions.js"; Output = Join-Path $OutputFolder "textEditor-noFiliExceptions.min.js"; Name = "textEditor-noFiliExceptions.js" }

    # --- travelAndUmrahChecklist ---
    $operations += @{ Type = "HTML"; Input = "travelAndUmrahChecklist/travelAndUmrahChecklist.html"; Output = Join-Path $OutputFolder "travelAndUmrahChecklist.html"; Name = "travelAndUmrahChecklist HTML" }

    # --- unitConverter ---
    $operations += @{
        Type          = "CustomHTML"
        Input         = "unitConverter/index.html"
        Output        = Join-Path $OutputFolder "unitConverter.html"
        Name          = "unitConverter HTML"
        Modifications = {
            param($content)
            # Specifically replace UnitOf.js with the new minified filename
            $content -replace 'src="UnitOf.js"', 'src="unitConverter.min.js"'
        }
    }
    $operations += @{ Type = "JS"; Input = "unitConverter/UnitOf.js"; Output = Join-Path $OutputFolder "unitConverter.min.js"; Name = "unitConverter JS" }


    # =========================================================================
    # --- PROCESSING ENGINE ---
    # =========================================================================
    $totalFiles = $operations.Count
    if ($totalFiles -eq 0) { Write-Host "No operations defined."; exit 0 }

    $processedCount = 0; $successCount = 0; $failCount = 0
    Write-Host "`n🔄 Starting build process for $totalFiles files..." -ForegroundColor Cyan
    Write-Host "🎯 Outputting to: $((Resolve-Path $OutputFolder).Path)" -ForegroundColor Cyan
    Write-Host "----------------------------------------------------"

    foreach ($op in $operations) {
        if (-not (Test-Path $op.Input)) {
            Write-Warning "Skipping $($op.Name): Input file not found at $($op.Input)"
            continue
        }

        $processedCount++
        Write-Host "[$processedCount/$totalFiles] Processing $($op.Name)... " -NoNewline
        $result = $null

        switch ($op.Type) {
            "HTML" {
                $result = MinifyHTML $op.Input $op.Output
            }
            "JS" {
                $result = MinifyJS $op.Input $op.Output
            }
            "CustomHTML" {
                $tempFile = [System.IO.Path]::GetTempFileName()
                try {
                    $content = Get-Content -Path $op.Input -Raw
                    # Apply special modifications for this file
                    $modifiedContent = & $op.Modifications $content
                    # Write the specially modified content to the temp file
                    $modifiedContent | Set-Content -Path $tempFile -NoNewline -Encoding utf8
                    # Pass the temp file to the standard HTML minifier, which applies GENERAL modifications
                    $result = MinifyHTML $tempFile $op.Output
                }
                finally { if (Test-Path $tempFile) { Remove-Item $tempFile -Force } }
            }
        }

        if ($result.Success) {
            Write-Host "✅ Success" -ForegroundColor Green -NoNewline
            if ($result.ContainsKey('KBSaved')) { Write-Host " (Saved $($result.KBSaved) KB)" -ForegroundColor Cyan } else { Write-Host "" }
            $successCount++
        }
        else {
            Write-Host "❌ FAILED" -ForegroundColor Red
            $failCount++
        }
    }

    # --- FINAL SUMMARY ---
    $endTime = Get-Date
    $executionTime = [math]::Round(($endTime - $startTime).TotalSeconds, 2)
    Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host "📊 SUMMARY" -ForegroundColor Cyan
    Write-Host "───────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "✅ Successful: $successCount files" -ForegroundColor Green
    Write-Host "❌ Failed:     $failCount files" -ForegroundColor Red
    Write-Host "🕒 Total Time: $executionTime seconds" -ForegroundColor Cyan
    Write-Host "───────────────────────────────────────────────────" -ForegroundColor DarkGray
    if ($failCount -eq 0) { Write-Host "✅ BUILD COMPLETED SUCCESSFULLY ✅" -ForegroundColor Green }
    else { Write-Host "⚠️ BUILD COMPLETED WITH ERRORS ⚠️" -ForegroundColor Yellow }
}
catch {
    Write-Error "Script execution failed: $_"
    exit 1
}