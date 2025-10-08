# SCRIPT: DEDICATED HTML & CSS BUILD SCRIPT
#
# PURPOSE:
# This script processes a predefined list of HTML and CSS files. It minifies assets
# and performs custom modifications, like updating stylesheet links.
#
# PREREQUISITES:
# - html-minifier-next: npm install -g html-minifier-next
# - csso-cli:           npm install -g csso-cli
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

# Define the default set of minification options for HTML
$defaultHtmlOptions = @(
    "--collapse-boolean-attributes", "--collapse-whitespace", "--decode-entities",
    "--minify-css", "true", "--minify-js", "true", "--process-scripts", "[text/html]",
    "--remove-attribute-quotes", "--remove-comments", "--remove-empty-attributes",
    "--remove-optional-tags", "--remove-redundant-attributes", "--remove-script-type-attributes",
    "--remove-style-link-type-attributes", "--remove-tag-whitespace", "--sort-attributes",
    "--sort-class-name", "--trim-custom-fragments", "--use-short-doctype"
)

# Define all operations to be performed. Order matters!
$operations = @(
    # 1. Minify the CSS file first.
    @{
        Type       = "CSS"
        InputFile  = "minimal-mod.css"
        OutputFile = "minimal-mod.min.css"
        Name       = "Minify minimal-mod.css"
    },
    # 2. Process the HTML, which will link to the newly created .min.css file.
    @{
        Type          = "CustomHTML"
        InputFile     = "index-uc.html"
        OutputFile    = "index.html"
        Options       = $defaultHtmlOptions
        Name          = "Process index-uc.html -> index.html"
        Modifications = {
            param($content)
            # This replacement will be applied BEFORE minification
            $content -replace 'minimal-mod.css', 'minimal-mod.min.css'
        }
    }
)

# --- MINIFICATION FUNCTIONS ---

function MinifyHTML($inputFile, $outputFile, $options) {
    try {
        if (-not (Test-Path $inputFile)) { throw "Input file not found: $inputFile" }
        if (-not (Get-Command html-minifier-next -ErrorAction SilentlyContinue)) { throw "html-minifier-next is not installed." }

        $originalSize = (Get-Item $inputFile).Length
        $splatArgs = $options + @($inputFile, "-o", $outputFile)
        
        $result = & html-minifier-next @splatArgs 2>&1
        if ($LASTEXITCODE -ne 0) { throw "html-minifier-next failed: $result" }
        
        $newSize = (Get-Item $outputFile).Length
        return @{ Success = $true; KBSaved = [math]::Round(($originalSize - $newSize) / 1KB, 1); BytesSaved = ($originalSize - $newSize); OriginalSize = $originalSize }
    }
    catch { Write-Error "Error processing HTML file $inputFile : $_"; return @{ Success = $false } }
}

function MinifyCSS($inputFile, $outputFile) {
    try {
        if (-not (Test-Path $inputFile)) { throw "Input file not found: $inputFile" }
        if (-not (Get-Command csso -ErrorAction SilentlyContinue)) { throw "csso-cli is not installed." }
        
        $originalSize = (Get-Item $inputFile).Length
        $result = csso $inputFile -o $outputFile 2>&1
        if ($LASTEXITCODE -ne 0) { throw "CSSO failed: $result" }
        
        $newSize = (Get-Item $outputFile).Length
        return @{ Success = $true; KBSaved = [math]::Round(($originalSize - $newSize) / 1KB, 1); BytesSaved = ($originalSize - $newSize); OriginalSize = $originalSize }
    }
    catch { Write-Error "Error minifying CSS file $inputFile : $_"; return @{ Success = $false } }
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
    Write-Host "`n🔄 Starting build process for $totalFiles operations (Total Size: $([math]::Round($totalOriginalSize/1KB,1)) KB)..." -ForegroundColor Cyan
    
    foreach ($op in $operations) {
        if (-not (Test-Path $op.InputFile)) {
            Write-Warning "Skipping $($op.Name): Input file not found at $($op.InputFile)"
            continue
        }

        $processedCount++
        Write-Host "[$processedCount/$totalFiles] Processing $($op.Name)... " -NoNewline
        $result = $null
        
        switch ($op.Type) {
            "CSS" {
                $result = MinifyCSS $op.InputFile $op.OutputFile
            }
            "CustomHTML" {
                $tempFile = [System.IO.Path]::GetTempFileName()
                try {
                    $content = Get-Content -Path $op.InputFile -Raw
                    $modifiedContent = & $op.Modifications $content
                    $modifiedContent | Set-Content -Path $tempFile -NoNewline -Encoding utf8
                    $result = MinifyHTML $tempFile $op.OutputFile $op.Options
                }
                finally {
                    if ($tempFile -and (Test-Path $tempFile)) { Remove-Item $tempFile -Force }
                }
            }
        }

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