# SCRIPT 1 (UPDATED): HTML FOLDER MINIFIER (with ALL replacements and full summary)
#
# PURPOSE:
# Finds, filters, and minifies all .html files. Before minification, it performs
# several crucial text replacements:
# 1. Updates 'initializePage()' paths.
# 2. Updates all CSS links to their '.min.css' versions.
# 3. Updates all JS links to their '.min.js' versions.
# 4. Copies the processed '404.html' to a specified root location.
#
# PREREQUISITES:
# - html-minifier-next: Must be installed globally via npm.
#   Run: npm install -g html-minifier-next
#
# USAGE:
# 1. EDIT the configuration below.
# 2. Run from PowerShell: .\minify-html-folder.ps1
#------------------------------------------------------------------------------------

# --- CONFIGURATION ---
# Set your source and destination folders.
$SourceFolder = "."
$OutputFolder = "..\page"

# Toggle processing only files modified within N days ago.
# Set to an integer (e.g., 1, 2, 5) or 'Off' to disable. Default: 2
$ModifiedDaysOption = 2

# --- 404 PAGE CONFIGURATION ---
# Set to $true to copy the 404 page after processing.
$Copy404Enabled = $true
# The name of the 404 file inside the source folder.
$Source404FileName = "404.html"
# The final destination for the 404 file, relative to the OutputFolder.
# Example: '..\404.html' places it one level above the OutputFolder.
$Destination404Path = "..\404.html"

# ----------------------------------------------------------------------------------


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
    $tempFile = $null
    try {
        if (-not (Test-Path $inputFile)) {
            throw "Input file not found: $inputFile"
        }
        if (-not (Get-Command html-minifier-next -ErrorAction SilentlyContinue)) {
            throw "html-minifier-next is not installed. Please install it using 'npm install -g html-minifier-next'"
        }

        # Read the file content into memory
        $content = Get-Content -Path $inputFile -Raw -ErrorAction Stop

        # --- CUSTOM MODIFICATION LOGIC ---
        $content = $content -replace '(initializePage\(\s*`)(.+?\.md)(`\s*\))', '$1../page-uc/$2$3;'
        $content = $content -replace '(href="[^"]*?)(?<!\.min)\.css"', '$1.min.css"'
        $content = $content -replace '(src="[^"]*?)(?<!\.min)\.js"', '$1.min.js"'
        
        $tempFile = [System.IO.Path]::GetTempFileName()
        $content | Set-Content -Path $tempFile -NoNewline -Encoding utf8 -ErrorAction Stop

        $outputDir = Split-Path -Parent $outputFile
        if (-not (Test-Path $outputDir)) {
            New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
        }
        
        $originalSize = (Get-Item $inputFile).Length
        $minifierResult = html-minifier-next --collapse-boolean-attributes --collapse-whitespace --minify-css true --minify-js true --remove-comments --remove-optional-tags --remove-redundant-attributes --use-short-doctype $tempFile -o $outputFile 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            throw "html-minifier-next failed: $minifierResult"
        }
        $newSize = (Get-Item $outputFile).Length
        return @{
            Success      = $true
            KBSaved      = [math]::Round(($originalSize - $newSize) / 1KB, 1)
            BytesSaved   = ($originalSize - $newSize)
            OriginalSize = $originalSize
        }
    }
    catch {
        Write-Error "Error processing file $inputFile : $_"
        return @{ Success = $false; Error = $_ }
    }
    finally {
        if ($tempFile -and (Test-Path $tempFile)) {
            Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
        }
    }
}

try {
    # Initialize counters for summary
    $processedCount = 0; $successCount = 0; $failCount = 0

    # Check if the source folder exists
    if (-not (Test-Path $SourceFolder)) {
        Write-Error "Configuration Error: The SourceFolder '$SourceFolder' does not exist."
        exit 1
    }

    # Resolve full paths
    $resolvedSource = (Resolve-Path -Path $SourceFolder).Path
    $resolvedOutput = $OutputFolder
    if (-not (Test-Path $resolvedOutput)) {
        New-Item -ItemType Directory -Path $resolvedOutput -Force | Out-Null
    }
    $resolvedOutput = (Resolve-Path -Path $resolvedOutput).Path

    Write-Host "🔍 Source: $resolvedSource" -ForegroundColor Cyan
    Write-Host "🎯 Output: $resolvedOutput" -ForegroundColor Cyan
    Write-Host "----------------------------------------------------"

    # Find all HTML files recursively
    $htmlFiles = Get-ChildItem -Path $resolvedSource -Filter "*.html" -Recurse

    # --- APPLY MODIFIED-DAYS FILTER ---
    if ($ModifiedDaysOption -is [int] -and $ModifiedDaysOption -gt 0) {
        $since = (Get-Date).AddDays(-$ModifiedDaysOption)
        Write-Host "🗓️  Filtering for files modified in the last $ModifiedDaysOption days..." -ForegroundColor Cyan
        
        $originalCount = $htmlFiles.Count
        $htmlFiles = $htmlFiles | Where-Object { $_.LastWriteTime -ge $since }
        Write-Host "   -> Found $($htmlFiles.Count) files out of $originalCount that match the filter." -ForegroundColor Cyan
    }
    else {
        Write-Host "🗓️  Modified-days filter is OFF. Processing all files." -ForegroundColor DarkGray
    }
    
    $totalFiles = $htmlFiles.Count

    if ($totalFiles -eq 0) {
        Write-Host "`nNo HTML files matched the criteria to be processed." -ForegroundColor Yellow
        # Proceed anyway in case we only need to copy the 404 file
    }
    else {
        # Initialize size counters for summary
        $totalOriginalSize = 0
        $totalBytesSaved = 0
        $htmlFiles | ForEach-Object { $totalOriginalSize += $_.Length }

        Write-Host "`n🔄 Starting minification of $totalFiles HTML files (Total Size: $([math]::Round($totalOriginalSize/1KB,1)) KB)..." -ForegroundColor Cyan

        # Process each file
        foreach ($file in $htmlFiles) {
            $processedCount++
            $outputFile = $file.FullName.Replace($resolvedSource, $resolvedOutput)
            
            Write-Host "[$processedCount/$totalFiles] Processing $($file.Name)... " -NoNewline
            $result = MinifyHTML $file.FullName $outputFile

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
    }

    # --- COPY 404 PAGE (NEW SECTION) ---
    if ($Copy404Enabled) {
        $source404File = Join-Path -Path $resolvedOutput -ChildPath $Source404FileName
        
        # Resolve the destination path relative to the output folder
        $destination404File = $null
        try {
            $destination404File = Resolve-Path -Path (Join-Path -Path $resolvedOutput -ChildPath $Destination404Path) -ErrorAction Stop
        }
        catch {
            # This catch handles cases where the path is syntactically invalid
        }

        Write-Host "`n🔗 Attempting to copy 404 page..." -ForegroundColor Cyan
        
        if (-not $destination404File) {
            Write-Host "   -> ❌ FAILED: Could not resolve destination path '$Destination404Path'." -ForegroundColor Red
            $failCount++
        }
        elseif (Test-Path $source404File) {
            try {
                Copy-Item -Path $source404File -Destination $destination404File -Force -ErrorAction Stop
                Write-Host "   -> ✅ Copied '$($Source404FileName)' to '$destination404File'" -ForegroundColor Green
                $successCount++ # Increment success count for the copy operation
            }
            catch {
                Write-Host "   -> ❌ FAILED to copy 404 page: $_" -ForegroundColor Red
                $failCount++
            }
        }
        else {
            Write-Host "   -> ⚠️  Source file not found at '$source404File'. Was '$Source404FileName' processed? Skipping." -ForegroundColor Yellow
        }
    }


    # --- FINAL SUMMARY ---
    $endTime = Get-Date
    $executionTime = [math]::Round(($endTime - $startTime).TotalSeconds, 2)
    $totalKBSaved = [math]::Round($totalBytesSaved / 1KB, 1)
    $totalPercentSaved = 0
    if ($totalOriginalSize -gt 0) {
        $totalPercentSaved = [math]::Round(($totalBytesSaved / $totalOriginalSize) * 100)
    }

    Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host "📊 SUMMARY" -ForegroundColor Cyan
    Write-Host "───────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "✅ Successful operations: $successCount" -ForegroundColor Green
    Write-Host "❌ Failed operations:     $failCount" -ForegroundColor Red
    if ($totalOriginalSize -gt 0) {
        Write-Host "💾 Total Space Saved:   $totalKBSaved KB ($totalPercentSaved% smaller)" -ForegroundColor Yellow
    }
    Write-Host "🕒 Total Time:          $executionTime seconds" -ForegroundColor Cyan
    Write-Host "───────────────────────────────────────────────────" -ForegroundColor DarkGray

    if ($failCount -eq 0) {
        Write-Host "✅ ALL OPERATIONS COMPLETED SUCCESSFULLY ✅" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ COMPLETED WITH ERRORS ⚠️" -ForegroundColor Yellow
    }
}
catch {
    Write-Error "Script execution failed: $_"
    exit 1
}