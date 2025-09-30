# SCRIPT: DEDICATED HTML MINIFIER
#
# PURPOSE:
# This script minifies a predefined list of HTML files using a specific set of
# html-minifier-next options.
#
# PREREQUISITES:
# - html-minifier-next: npm install -g html-minifier-next
#
# USAGE:
# Run this script from its directory. Configure the files to process in the
# CONFIGURATION section below.
#------------------------------------------------------------------------------------

# Set the current location to the directory containing the script
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
$ModifiedDaysOption = 10

# Define the default set of minification options
$defaultHtmlOptions = @(
    "--collapse-boolean-attributes",
    "--collapse-whitespace",
    "--decode-entities",
    "--minify-css", "true",
    "--minify-js", "true",
    "--process-scripts", "[text/html]",
    "--remove-attribute-quotes",
    "--remove-comments",
    "--remove-empty-attributes",
    "--remove-optional-tags",
    "--remove-redundant-attributes",
    "--remove-script-type-attributes",
    "--remove-style-link-type-attributes",
    "--remove-tag-whitespace",
    "--sort-attributes",
    "--sort-class-name",
    "--trim-custom-fragments",
    "--use-short-doctype"
)

# Define the files to process
$operations = @(
    @{
        InputFile  = "index-uc.html"
        OutputFile = "index.html"
        Options    = $defaultHtmlOptions
        Name       = "index-uc.html -> index.html"
    }
    # Add more files here as needed, for example:
    # @{
    #     InputFile = "about-uc.html"
    #     OutputFile = "about.html"
    #     Options = $defaultHtmlOptions
    #     Name = "about-uc.html -> about.html"
    # }
)

# --- MINIFICATION FUNCTION ---

function MinifyHTML($inputFile, $outputFile, $options) {
    try {
        if (-not (Test-Path $inputFile)) { throw "Input file not found: $inputFile" }
        if (-not (Get-Command html-minifier-next -ErrorAction SilentlyContinue)) { throw "html-minifier-next is not installed." }

        $originalSize = (Get-Item $inputFile).Length
        
        # Build the arguments for the command using splatting for robustness
        $splatArgs = $options + @($inputFile, "-o", $outputFile)
        
        $result = & html-minifier-next @splatArgs 2>&1
        if ($LASTEXITCODE -ne 0) { throw "html-minifier-next failed: $result" }
        
        $newSize = (Get-Item $outputFile).Length
        return @{
            Success      = $true
            KBSaved      = [math]::Round(($originalSize - $newSize) / 1KB, 1)
            BytesSaved   = ($originalSize - $newSize)
            OriginalSize = $originalSize
        }
    }
    catch {
        Write-Error "Error processing HTML file $inputFile : $_"
        return @{ Success = $false }
    }
}

try {
    # =========================================================================
    # 1. FILTER AND PREPARE FOR PROCESSING
    # =========================================================================
    if ($ModifiedDaysOption -is [int] -and $ModifiedDaysOption -gt 0) {
        $since = (Get-Date).AddDays(-$ModifiedDaysOption)
        Write-Host "🗓️  Filtering for files modified in the last $ModifiedDaysOption days..." -ForegroundColor Cyan
        $operations = $operations | Where-Object { (Test-Path $_.InputFile) -and (Get-Item $_.InputFile).LastWriteTime -ge $since }
    }
    else {
        Write-Host "🗓️  Modified-days filter is OFF." -ForegroundColor DarkGray
    }

    $totalFiles = $operations.Count
    if ($totalFiles -eq 0) { Write-Host "`nNo files matched criteria to process."; exit 0 }
    
    $totalOriginalSize = 0; $totalBytesSaved = 0
    $operations | ForEach-Object { if (Test-Path $_.InputFile) { $totalOriginalSize += (Get-Item $_.InputFile).Length } }

    # =========================================================================
    # 2. PROCESS ALL OPERATIONS
    # =========================================================================
    $processedCount = 0; $successCount = 0; $failCount = 0
    Write-Host "`n🔄 Starting HTML minification for $totalFiles files (Total Size: $([math]::Round($totalOriginalSize/1KB,1)) KB)..." -ForegroundColor Cyan
    
    foreach ($op in $operations) {
        if (-not (Test-Path $op.InputFile)) {
            Write-Warning "Skipping $($op.Name): Input file not found at $($op.InputFile)"
            continue
        }

        $processedCount++
        Write-Host "[$processedCount/$totalFiles] Processing $($op.Name)... " -NoNewline
        
        $result = MinifyHTML $op.InputFile $op.OutputFile $op.Options

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
    # 3. DISPLAY SUMMARY
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