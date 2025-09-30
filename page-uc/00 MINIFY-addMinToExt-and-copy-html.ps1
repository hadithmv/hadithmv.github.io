# SCRIPT 1: GENERIC HTML FOLDER MINIFIER
#
# PURPOSE:
# This script finds all .html files in a specified source folder (recursively),
# minifies them, and saves them to a specified output folder while preserving
# the directory structure.
#
# PREREQUISITES:
# - html-minifier: Must be installed globally via npm.
#   Run: npm install -g html-minifier
#
# USAGE:
# .\minify-html-folder.ps1 -SourceFolder ".\src" -OutputFolder ".\dist"
#------------------------------------------------------------------------------------

param(
    [Parameter(Mandatory = $true, HelpMessage = "The source folder containing the HTML files to minify.")]
    [string]$SourceFolder,

    [Parameter(Mandatory = $true, HelpMessage = "The destination folder for the minified HTML files.")]
    [string]$OutputFolder
)

# Set the current working directory to the directory containing the script for consistency
try {
    Set-Location -Path $PSScriptRoot -ErrorAction Stop
    $startTime = Get-Date
}
catch {
    Write-Error "Failed to set working directory: $_"
    exit 1
}

# Define a function to minify a single HTML file
function MinifyHTML($inputFile, $outputFile) {
    try {
        if (-not (Test-Path $inputFile)) {
            throw "Input file not found: $inputFile"
        }
        if (-not (Get-Command html-minifier -ErrorAction SilentlyContinue)) {
            throw "html-minifier is not installed. Please install it using 'npm install -g html-minifier'"
        }

        # Ensure output directory exists
        $outputDir = Split-Path -Parent $outputFile
        if (-not (Test-Path $outputDir)) {
            New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
        }

        $originalSize = (Get-Item $inputFile).Length

        # Use html-minifier
        $minifierResult = html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --use-short-doctype $inputFile -o $outputFile 2>&1

        if ($LASTEXITCODE -ne 0) {
            throw "html-minifier failed: $minifierResult"
        }
        
        $newSize = (Get-Item $outputFile).Length
        $reduction = [math]::Round(100 - (($newSize / $originalSize) * 100))
        $kbSaved = [math]::Round(($originalSize - $newSize) / 1KB, 1)
        
        return @{
            Success   = $true
            Reduction = $reduction
            KBSaved   = $kbSaved
        }
    }
    catch {
        Write-Error "Error processing file $inputFile : $_"
        return @{ Success = $false; Error = $_ }
    }
}

try {
    # Resolve full paths to avoid ambiguity
    $resolvedSource = (Resolve-Path -Path $SourceFolder).Path
    $resolvedOutput = (Resolve-Path -Path $OutputFolder -ErrorAction SilentlyContinue).Path
    if (-not $resolvedOutput) {
        New-Item -ItemType Directory -Path $OutputFolder -Force | Out-Null
        $resolvedOutput = (Resolve-Path -Path $OutputFolder).Path
    }

    Write-Host "🔍 Source: $resolvedSource" -ForegroundColor Cyan
    Write-Host "🎯 Output: $resolvedOutput" -ForegroundColor Cyan
    Write-Host "----------------------------------------------------"

    # Find all HTML files recursively
    $htmlFiles = Get-ChildItem -Path $resolvedSource -Filter "*.html" -Recurse
    $totalFiles = $htmlFiles.Count

    if ($totalFiles -eq 0) {
        Write-Host "No HTML files found in the source directory." -ForegroundColor Yellow
        exit 0
    }

    $processedCount = 0
    $successCount = 0
    $failCount = 0

    Write-Host "`n🔄 Starting minification of $totalFiles HTML files..." -ForegroundColor Cyan

    # Process each file
    foreach ($file in $htmlFiles) {
        $processedCount++

        # Construct the output path while preserving the sub-directory structure
        $outputFile = $file.FullName.Replace($resolvedSource, $resolvedOutput)
        
        Write-Host "[$processedCount/$totalFiles] Processing $($file.Name)... " -NoNewline

        $result = MinifyHTML $file.FullName $outputFile

        if ($result.Success) {
            Write-Host "✅ Success" -ForegroundColor Green -NoNewline
            Write-Host " (Saved $($result.KBSaved) KB)" -ForegroundColor Cyan
            $successCount++
        }
        else {
            Write-Host "❌ FAILED" -ForegroundColor Red
            $failCount++
        }
    }

    # Final summary
    $executionTime = [math]::Round((Get-Date - $startTime).TotalSeconds, 2)
    Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host "📊 SUMMARY" -ForegroundColor Cyan
    Write-Host "───────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "✅ Successful: $successCount files" -ForegroundColor Green
    Write-Host "❌ Failed:     $failCount files" -ForegroundColor Red
    Write-Host "🕒 Total Time: $executionTime seconds" -ForegroundColor Cyan
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