# SCRIPT: ADVANCED HTML BUILDER WITH ASSET EMBEDDING
#
# PURPOSE:
# This script processes HTML files, with a special rule for 'index.html' where it
# minifies and embeds 'index.css' and 'index.js' directly into the HTML for
# optimal performance. It then minifies all other assets and provides a detailed summary.
#
# PREREQUISITES:
# - html-minifier-next: npm install -g html-minifier-next
# - csso-cli:           npm install -g csso-cli
# - google-closure-compiler
# - terser
#
# USAGE:
# Run this script from the directory containing the source HTML files.
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

# --- CONFIGURATION ---
# Toggle processing only files modified within N days ago.
# Allowed values: 1, 2, 5, 10, or 'Off' to disable. Default: 2
$ModifiedDaysOption = 2

# --- MINIFICATION FUNCTIONS ---

function MinifyHTML($inputFile, $outputFile, $embedAssets = $false) {
    $tempFile = $null
    try {
        if (-not (Test-Path $inputFile)) { throw "Input file not found: $inputFile" }
        if (-not (Get-Command html-minifier-next -ErrorAction SilentlyContinue)) { throw "html-minifier-next is not installed." }

        $originalSize = (Get-Item $inputFile).Length
        $content = Get-Content -Path $inputFile -Raw

        # If embedding, read pre-minified assets and inject them
        if ($embedAssets) {
            Write-Host " (Embedding assets...)" -ForegroundColor DarkCyan -NoNewline
            
            # Embed CSS
            $minCssFile = "../css/index.min.css"
            if (Test-Path $minCssFile) {
                $minCssContent = Get-Content -Path $minCssFile -Raw
                $content = $content -replace '<link\s+[^>]*?href="[^"]*?index\.css"[^>]*?>', "<style>$minCssContent</style>"
            }
            
            # Embed JS
            $minJsFile = "../js/index.min.js"
            if (Test-Path $minJsFile) {
                $minJsContent = Get-Content -Path $minJsFile -Raw
                $content = $content -replace '<script\s+[^>]*?src="[^"]*?index\.js"[^>]*?>\s*</script>', "<script>$minJsContent</script>"
            }
        }
        
        # General updates for all files
        $content = $content -replace '(href="[^"]*?)(?<!\.min)\.css"', '$1.min.css"'
        $content = $content -replace '(src="[^"]*?)(?<!\.min)\.js"', '$1.min.js"'
        
        $tempFile = [System.IO.Path]::GetTempFileName()
        $content | Set-Content -Path $tempFile -NoNewline -Encoding utf8
        
        $outputDir = Split-Path -Parent $outputFile
        if (-not (Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir -Force | Out-Null }

        $minifierResult = html-minifier-next --collapse-boolean-attributes --collapse-whitespace --minify-css true --minify-js true --remove-comments --remove-optional-tags --use-short-doctype $tempFile -o $outputFile 2>&1
        if ($LASTEXITCODE -ne 0) { throw "html-minifier-next failed: $minifierResult" }

        $newSize = (Get-Item $outputFile).Length
        return @{ Success = $true; KBSaved = [math]::Round(($originalSize - $newSize) / 1KB, 1); BytesSaved = ($originalSize - $newSize); OriginalSize = $originalSize }
    }
    catch { Write-Error "Error processing HTML file $inputFile : $_"; return @{ Success = $false } }
    finally { if ($tempFile -and (Test-Path $tempFile)) { Remove-Item $tempFile -Force } }
}

function MinifyCSS($inputFile, $outputFile) {
    try {
        if (-not (Test-Path $inputFile)) { throw "Input file not found: $inputFile" }
        if (-not (Get-Command csso -ErrorAction SilentlyContinue)) { throw "csso-cli is not installed." }
        
        $outputDir = Split-Path -Parent $outputFile
        if (-not (Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir -Force | Out-Null }
        
        $originalSize = (Get-Item $inputFile).Length
        $result = csso $inputFile -o $outputFile 2>&1
        if ($LASTEXITCODE -ne 0) { throw "CSSO failed: $result" }
        
        $newSize = (Get-Item $outputFile).Length
        return @{ Success = $true; KBSaved = [math]::Round(($originalSize - $newSize) / 1KB, 1); BytesSaved = ($originalSize - $newSize); OriginalSize = $originalSize }
    }
    catch { Write-Error "Error minifying CSS file $inputFile : $_"; return @{ Success = $false } }
}

function MinifyJS($inputFile, $outputFile) {
    $tempFile = $null
    try {
        if (-not (Test-Path $inputFile)) { throw "Input file not found: $inputFile" }
        if (-not (Get-Command terser -ErrorAction SilentlyContinue)) { throw "terser is not installed." }

        $outputDir = Split-Path -Parent $outputFile
        if (-not (Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir -Force | Out-Null }

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
    finally { if ($tempFile -and (Test-Path $tempFile)) { Remove-Item $tempFile -Force } }
}

try {
    # =========================================================================
    # 1. DEFINE ALL BUILD OPERATIONS
    # =========================================================================
    $operations = @()

    # --- Add asset files first so they are minified before embedding ---
    $operations += @{ Type = "CSS"; Input = "../css/index.css"; Output = "../css/index.min.css"; Name = "index.css" }
    $operations += @{ Type = "JS"; Input = "../js/index.js"; Output = "../js/index.min.js"; Name = "index.js" }

    # --- Add all HTML files in the current directory ---
    $htmlFiles = Get-ChildItem -Filter "*.html" | Where-Object { $_.Name -notmatch "(test|backup|copy)" }
    foreach ($file in $htmlFiles) {
        $isIndexFile = ($file.Name -eq "index.html")
        $operations += @{ 
            Type        = "HTML"
            Input       = $file.FullName
            Output      = "../books/$($file.Name)"
            Name        = $file.Name
            EmbedAssets = $isIndexFile 
        }
    }

    # --- Add final copy operation ---
    $operations += @{ Type = "Copy"; Input = "../books/index.html"; Output = "../_layouts/index.html"; Name = "Copy index.html to layouts" }

    # =========================================================================
    # 2. FILTER AND PREPARE FOR PROCESSING
    # =========================================================================
    if ($ModifiedDaysOption -is [int] -and $ModifiedDaysOption -gt 0) {
        $since = (Get-Date).AddDays(-$ModifiedDaysOption)
        Write-Host "🗓️  Filtering for files modified in the last $ModifiedDaysOption days..." -ForegroundColor Cyan
        $operations = $operations | Where-Object { (-not $_.Input) -or (-not (Test-Path $_.Input)) -or (Get-Item $_.Input).LastWriteTime -ge $since }
    }
    else {
        Write-Host "🗓️  Modified-days filter is OFF." -ForegroundColor DarkGray
    }

    $totalFiles = $operations.Count
    if ($totalFiles -eq 0) { Write-Host "`nNo files matched criteria to process."; exit 0 }
    
    $totalOriginalSize = 0; $totalBytesSaved = 0
    $operations | ForEach-Object { if ($_.Type -ne "Copy" -and (Test-Path $_.Input)) { $totalOriginalSize += (Get-Item $_.Input).Length } }

    # =========================================================================
    # 3. PROCESS ALL OPERATIONS
    # =========================================================================
    $processedCount = 0; $successCount = 0; $failCount = 0
    Write-Host "`n🔄 Starting build process for $totalFiles operations (Total Size: $([math]::Round($totalOriginalSize/1KB,1)) KB)..." -ForegroundColor Cyan
    
    foreach ($op in $operations) {
        if ($op.Input -and -not (Test-Path $op.Input)) {
            Write-Warning "Skipping $($op.Name): Input file not found at $($op.Input)"
            continue
        }

        $processedCount++
        Write-Host "[$processedCount/$totalFiles] Processing $($op.Name)... " -NoNewline
        $result = $null

        switch ($op.Type) {
            "HTML" { $result = MinifyHTML $op.Input $op.Output $op.EmbedAssets }
            "CSS" { $result = MinifyCSS $op.Input $op.Output }
            "JS" { $result = MinifyJS $op.Input $op.Output }
            "Copy" { 
                try { Copy-Item $op.Input -Destination $op.Output -Force; $result = @{ Success = $true } }
                catch { $result = @{ Success = $false } }
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