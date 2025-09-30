# Set the current working directory to the directory containing the script
Set-Location -Path $PSScriptRoot

# Start timing the script execution
$startTime = Get-Date

# CONFIG: Toggle processing only files modified within N days ago
# Allowed values: 1, 2, 5, 10, or 'Off' to disable. Default: 2
$ModifiedDaysOption = 2

# Define a function to minify HTML files
function MinifyHTML($inputFile, $outputFile, $embedAssets = $false) {
    try {
        # Check if input file exists
        if (-not (Test-Path $inputFile)) {
            throw "Input file not found: $inputFile"
        }

        # Check if html-minifier is installed
        if (-not (Get-Command html-minifier -ErrorAction SilentlyContinue)) {
            throw "html-minifier is not installed. Please install it using 'npm install -g html-minifier'"
        }

        # Get the original file size
        $originalSize = (Get-Item $inputFile).Length

        # Read the content of the file
        $content = Get-Content -Path $inputFile -Raw -ErrorAction Stop
        
        # If embedding assets and this is index.html, embed CSS and JS first
        if ($embedAssets -and [System.IO.Path]::GetFileName($inputFile) -eq "index.html") {
            Write-Host "   Embedding CSS and JS into index.html..." -ForegroundColor Cyan
            
            # Embed CSS
            $cssFile = "../css/index.css"
            if (Test-Path $cssFile) {
                $cssContent = Get-Content -Path $cssFile -Raw -ErrorAction Stop
                
                # Minify CSS content
                $minCssContent = MinifyCSSContent $cssContent
                
                # Replace external CSS link with embedded style
                $cssLinkPattern = '<link\s+[^>]*?href="[^"]*?index\.css"[^>]*?>'
                $cssEmbedded = "<style>$minCssContent</style>"
                $content = $content -replace $cssLinkPattern, $cssEmbedded
                
                Write-Host "   ✅ CSS embedded successfully" -ForegroundColor Green
            }
            else {
                Write-Host "   ⚠️ CSS file not found: $cssFile" -ForegroundColor Yellow
            }
            
            # Embed JS
            $jsFile = "../js/index.js"
            if (Test-Path $jsFile) {
                $jsContent = Get-Content -Path $jsFile -Raw -ErrorAction Stop
                
                # Minify JS content
                $minJsContent = MinifyJSContent $jsContent
                
                # Replace external JS script with embedded script
                $jsScriptPattern = '<script\s+[^>]*?src="[^"]*?index\.js"[^>]*?>\s*</script>'
                $jsEmbedded = "<script>$minJsContent</script>"
                $content = $content -replace $jsScriptPattern, $jsEmbedded
                
                Write-Host "   ✅ JS embedded successfully" -ForegroundColor Green
            }
            else {
                Write-Host "   ⚠️ JS file not found: $jsFile" -ForegroundColor Yellow
            }
        }
        
        # Now replace .css with .min.css and .js with .min.js for all other files
        # Replace .css with .min.css in link tags, being careful not to replace .min.css again
        $content = $content -replace '(href="[^"]*?)(?<!\.min)\.css"', '$1.min.css"'
        
        # Replace .js with .min.js in script tags, being careful not to replace .min.js again
        $content = $content -replace '(src="[^"]*?)(?<!\.min)\.js"', '$1.min.js"'
        
        # Create a temporary file for the modified content
        $tempFile = [System.IO.Path]::GetTempFileName()
        $content | Set-Content -Path $tempFile -NoNewline -ErrorAction Stop
        
        # Ensure output directory exists
        $outputDir = Split-Path -Parent $outputFile
        if (-not (Test-Path $outputDir)) {
            New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
        }

        # Use html-minifier with the temporary file
        $minifierResult = html-minifier --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype $tempFile -o $outputFile 2>&1

        if ($LASTEXITCODE -ne 0) {
            throw "html-minifier failed: $minifierResult"
        }

        # Get the new file size
        $newSize = (Get-Item $outputFile).Length
        
        # Calculate size reduction
        $sizeDiff = $originalSize - $newSize
        
        # Store size information
        return @{
            Success      = $true
            OriginalSize = $originalSize
            NewSize      = $newSize
            SizeDiff     = $sizeDiff
        }
    }
    catch {
        Write-Error "Error processing file $inputFile : $_"
        return @{
            Success      = $false
            OriginalSize = 0
            NewSize      = 0
            SizeDiff     = 0
        }
    }
    finally {
        # Clean up the temporary file if it exists
        if ($tempFile -and (Test-Path $tempFile)) {
            Remove-Item $tempFile -ErrorAction SilentlyContinue
        }
    }
}

# Function to minify CSS content directly
function MinifyCSSContent($cssContent) {
    try {
        # Check if csso is installed
        if (-not (Get-Command csso -ErrorAction SilentlyContinue)) {
            throw "csso is not installed. Please install it using 'npm install -g csso-cli'"
        }

        # Create a temporary file for the CSS content
        $tempInputFile = [System.IO.Path]::GetTempFileName() + ".css"
        $tempOutputFile = [System.IO.Path]::GetTempFileName() + ".min.css"
        
        # Write CSS content to temporary file
        $cssContent | Set-Content -Path $tempInputFile -NoNewline -ErrorAction Stop
        
        # Use csso for minification
        $cssoOutput = csso $tempInputFile -o $tempOutputFile 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "csso failed: $cssoOutput"
        }
        
        # Read the minified content
        $minifiedContent = Get-Content -Path $tempOutputFile -Raw -ErrorAction Stop
        
        return $minifiedContent
    }
    catch {
        Write-Error "Error minifying CSS content: $_"
        # Return the original content if minification fails
        return $cssContent
    }
    finally {
        # Clean up temporary files
        if ($tempInputFile -and (Test-Path $tempInputFile)) {
            Remove-Item $tempInputFile -ErrorAction SilentlyContinue
        }
        if ($tempOutputFile -and (Test-Path $tempOutputFile)) {
            Remove-Item $tempOutputFile -ErrorAction SilentlyContinue
        }
    }
}

# Function to minify CSS files using csso
function MinifyCSS($inputFile, $outputFile) {
    try {
        # Check if input file exists
        if (-not (Test-Path $inputFile)) {
            throw "Input file not found: $inputFile"
        }

        # Check if csso is installed
        if (-not (Get-Command csso -ErrorAction SilentlyContinue)) {
            throw "csso is not installed. Please install it using 'npm install -g csso-cli'"
        }

        # Get the original file size
        $originalSize = (Get-Item $inputFile).Length

        # Ensure output directory exists
        $outputDir = Split-Path -Parent $outputFile
        if (-not (Test-Path $outputDir)) {
            New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
        }

        # Use csso for minification
        $cssoOutput = csso $inputFile -o $outputFile 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "csso failed: $cssoOutput"
        }

        # Get the new file size
        $newSize = (Get-Item $outputFile).Length
        
        # Calculate size reduction
        $sizeDiff = $originalSize - $newSize
        
        # Store size information
        return @{
            Success      = $true
            OriginalSize = $originalSize
            NewSize      = $newSize
            SizeDiff     = $sizeDiff
        }
    }
    catch {
        Write-Error "Error processing CSS file $inputFile : $_"
        return @{
            Success      = $false
            OriginalSize = 0
            NewSize      = 0
            SizeDiff     = 0
        }
    }
}

# Function to minify JS content directly
function MinifyJSContent($jsContent) {
    try {
        # Check if terser is installed
        if (-not (Get-Command terser -ErrorAction SilentlyContinue)) {
            throw "terser is not installed. Please install it using 'npm install -g terser'"
        }

        $useClosureCompiler = $false
        if (Get-Command google-closure-compiler -ErrorAction SilentlyContinue) {
            $useClosureCompiler = $true
        }

        # Create temporary files
        $tempInputFile = [System.IO.Path]::GetTempFileName() + ".js"
        $tempOutputFile = [System.IO.Path]::GetTempFileName() + ".min.js"
        $tempClosureFile = $null
        
        # Write JS content to temporary file
        $jsContent | Set-Content -Path $tempInputFile -NoNewline -ErrorAction Stop
        
        # Use Google Closure Compiler first if available
        if ($useClosureCompiler) {
            $tempClosureFile = [System.IO.Path]::GetTempFileName() + ".js"
            $compilerOutput = google-closure-compiler --charset=UTF-8 --js $tempInputFile --js_output_file $tempClosureFile 2>&1
            if ($LASTEXITCODE -ne 0) {
                throw "Closure compiler failed: $compilerOutput"
            }
            $terserInput = $tempClosureFile
        }
        else {
            $terserInput = $tempInputFile
        }

        # Use terser for minification
        $terserOutput = terser $terserInput -c -m --comments=false -o $tempOutputFile 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "terser failed: $terserOutput"
        }
        
        # Read the minified content
        $minifiedContent = Get-Content -Path $tempOutputFile -Raw -ErrorAction Stop
        
        return $minifiedContent
    }
    catch {
        Write-Error "Error minifying JS content: $_"
        # Return the original content if minification fails
        return $jsContent
    }
    finally {
        # Clean up temporary files
        if ($tempInputFile -and (Test-Path $tempInputFile)) {
            Remove-Item $tempInputFile -ErrorAction SilentlyContinue
        }
        if ($tempOutputFile -and (Test-Path $tempOutputFile)) {
            Remove-Item $tempOutputFile -ErrorAction SilentlyContinue
        }
        if ($tempClosureFile -and (Test-Path $tempClosureFile)) {
            Remove-Item $tempClosureFile -ErrorAction SilentlyContinue
        }
    }
}

# Function to minify JS files using terser (with optional closure compiler first)
function MinifyJS($inputFile, $outputFile) {
    try {
        # Check if input file exists
        if (-not (Test-Path $inputFile)) {
            throw "Input file not found: $inputFile"
        }

        # Check if terser is installed
        if (-not (Get-Command terser -ErrorAction SilentlyContinue)) {
            throw "terser is not installed. Please install it using 'npm install -g terser'"
        }

        $useClosureCompiler = $false
        if (Get-Command google-closure-compiler -ErrorAction SilentlyContinue) {
            $useClosureCompiler = $true
        }

        # Get the original file size
        $originalSize = (Get-Item $inputFile).Length

        # Create temp files
        $tempFile = $null
        if ($useClosureCompiler) {
            $tempFile = [System.IO.Path]::GetTempFileName() + ".js"
        }

        # Ensure output directory exists
        $outputDir = Split-Path -Parent $outputFile
        if (-not (Test-Path $outputDir)) {
            New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
        }

        # Use Google Closure Compiler first if available
        if ($useClosureCompiler) {
            $compilerOutput = google-closure-compiler --charset=UTF-8 --js $inputFile --js_output_file $tempFile 2>&1
            if ($LASTEXITCODE -ne 0) {
                throw "Closure compiler failed: $compilerOutput"
            }
            $terserInput = $tempFile
        }
        else {
            $terserInput = $inputFile
        }

        # Use terser for minification
        $terserOutput = terser $terserInput -c -m --comments=false -o $outputFile 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "terser failed: $terserOutput"
        }

        # Get the new file size
        $newSize = (Get-Item $outputFile).Length
        
        # Calculate size reduction
        $sizeDiff = $originalSize - $newSize
        
        # Store size information
        return @{
            Success      = $true
            OriginalSize = $originalSize
            NewSize      = $newSize
            SizeDiff     = $sizeDiff
        }
    }
    catch {
        Write-Error "Error processing JS file $inputFile : $_"
        return @{
            Success      = $false
            OriginalSize = 0
            NewSize      = 0
            SizeDiff     = 0
        }
    }
    finally {
        # Clean up the temporary file if it exists
        if ($tempFile -and (Test-Path $tempFile)) {
            Remove-Item $tempFile -ErrorAction SilentlyContinue
        }
    }
}

# Function to format file size
function Format-FileSize($size) {
    if ($size -ge 1MB) {
        return "$([math]::Round($size / 1MB, 2)) MB"
    }
    else {
        return "$([math]::Round($size / 1KB, 1)) KB"
    }
}

# Get all HTML files in the current directory
try {
    $files = Get-ChildItem -Filter "*.html" -ErrorAction Stop
    $filteredFiles = $files | Where-Object { $_.Name -notmatch "(test|backup|copy)" }

    # Apply "modified within N days ago" filter if enabled
    $effectiveOption = $ModifiedDaysOption
    if ($null -eq $effectiveOption -or (
            ($effectiveOption -isnot [int]) -and -not (
                $effectiveOption -is [string] -and $effectiveOption -match '^(?i)off$'
            )
        )) {
        # Fallback to default if invalid value is set
        $effectiveOption = 2
    }

    $activeDays = $null
    if ($effectiveOption -is [int] -and @(1, 2, 5, 10) -contains [int]$effectiveOption) {
        $activeDays = [int]$effectiveOption
    }

    if ($activeDays) {
        $since = (Get-Date).AddDays(-$activeDays)
        $until = Get-Date
        $filteredFiles = $filteredFiles | Where-Object { $_.LastWriteTime -ge $since -and $_.LastWriteTime -le $until }
        Write-Host ("🗓 Filtering files modified within last {0} days (since {1:yyyy-MM-dd HH:mm})" -f $activeDays, $since) -ForegroundColor Cyan
    }
    else {
        Write-Host "🗓 Modified-days filter: OFF (processing all files)" -ForegroundColor DarkGray
    }
    $totalFiles = $filteredFiles.Count
    
    # Calculate total size
    $totalOriginalSize = ($filteredFiles | Measure-Object -Property Length -Sum).Sum
    $totalOriginalSizeFormatted = Format-FileSize $totalOriginalSize
    
    $processedCount = 0
    $successCount = 0
    $failCount = 0
    $totalNewSize = 0
    
    # Calculate padding widths based on total files
    $countWidth = $totalFiles.ToString().Length
    $percentWidth = 3 # No decimal points now

    Write-Host "`n🔄 Starting HTML minification process..." -ForegroundColor Cyan
    Write-Host "🔍 Found " -ForegroundColor Cyan -NoNewline
    Write-Host "$totalFiles" -ForegroundColor White -NoNewline
    Write-Host " files to process (💾 " -ForegroundColor Cyan -NoNewline
    Write-Host "$totalOriginalSizeFormatted" -ForegroundColor White -NoNewline
    Write-Host " total)" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor DarkGray

    if ($totalFiles -eq 0) {
        Write-Host "No HTML files matched the modified-days filter." -ForegroundColor Yellow
        return
    }

    # Loop through each HTML file
    foreach ($file in $filteredFiles) {
        $processedCount++
        $percentComplete = [math]::Round(($processedCount / $totalFiles) * 100)
        
        # Format the count and percentage with consistent padding
        $countDisplay = "[$($processedCount.ToString().PadRight($countWidth))/$totalFiles]"
        $percentDisplay = "$($percentComplete.ToString().PadRight($percentWidth))%"
        
        # Get the file name without extension
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
        
        # Construct the input and output file paths
        $inputFile = $file.FullName
        $outputFile = "../books/$($file.Name)"
        
        # Show progress with uniform alignment
        Write-Host $countDisplay -ForegroundColor Yellow -NoNewline
        Write-Host " " -NoNewline
        Write-Host $percentDisplay -ForegroundColor Magenta -NoNewline
        
        # Create progress bar
        $progressBarWidth = 20
        $filledWidth = [math]::Round(($percentComplete / 100) * $progressBarWidth)
        $emptyWidth = $progressBarWidth - $filledWidth
        
        Write-Host " [" -NoNewline -ForegroundColor DarkGray
        if ($filledWidth -gt 0) {
            Write-Host ("■" * $filledWidth) -NoNewline -ForegroundColor Cyan
        }
        if ($emptyWidth -gt 0) {
            Write-Host ("□" * $emptyWidth) -NoNewline -ForegroundColor DarkGray
        }
        Write-Host "] " -NoNewline -ForegroundColor DarkGray
        
        Write-Host "$($file.Name) " -NoNewline
        
        # Determine if this is the index.html file (for embedding assets)
        $isIndexFile = ($file.Name -eq "index.html")
        
        # Call the MinifyHTML function to process the file
        # For index.html, we'll embed CSS and JS
        $result = MinifyHTML $inputFile $outputFile $isIndexFile
        
        # Print appropriate message based on success
        if ($result.Success) {
            $sizeDiffFormatted = Format-FileSize $result.SizeDiff
            Write-Host "✅" -ForegroundColor Green -NoNewline
            Write-Host " (🗜 $sizeDiffFormatted)" -ForegroundColor Blue
            $successCount++
            $totalNewSize += $result.NewSize
        }
        else {
            Write-Host "❌" -ForegroundColor Red
            $failCount++
        }
    }

    # Copy index page over to layout index dir
    try {
        Write-Host "`nCopying index.html to layouts directory..." -ForegroundColor Cyan -NoNewline
        if (Test-Path "../books/index.html") {
            Copy-Item "../books/index.html" -Destination "../_layouts/index.html" -ErrorAction Stop
            Write-Host " ✅" -ForegroundColor Green
        }
        else {
            Write-Host " ⚠️ index.html not found in ../books/" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host " ❌" -ForegroundColor Red
        Write-Error "Failed to copy index.html: $_"
    }

    # Minify CSS and JS files (still useful for other pages that might reference them)
    Write-Host "`n🔄 Starting CSS/JS minification process..." -ForegroundColor Cyan
    
    # Define asset files to minify
    $cssFile = "../css/index.css"
    $jsFile = "../js/index.js"
    $assetFiles = @(
        @{Path = $cssFile; Type = "CSS" },
        # @{Path = $cssFile; Type = "CSS"; OutputPath = $cssFile -replace '\.css$', '.min.css'},
        @{Path = $jsFile; Type = "JS" }
        # @{Path = $jsFile; Type = "JS"; OutputPath = $jsFile -replace '\.js$', '.min.js'}
    )
    
    $totalAssetFiles = $assetFiles.Count
    $assetProcessed = 0
    $assetSuccess = 0
    $assetFail = 0
    $totalAssetOriginalSize = 0
    $totalAssetNewSize = 0
    
    # Process each asset file
    foreach ($asset in $assetFiles) {
        $assetProcessed++
        
        Write-Host "[$assetProcessed/$totalAssetFiles] Processing $($asset.Type) file: $($asset.Path) " -NoNewline
        
        if (-not (Test-Path $asset.Path)) {
            Write-Host "❌ (File not found)" -ForegroundColor Red
            $assetFail++
            continue
        }
        
        # Get original file size
        $originalSize = (Get-Item $asset.Path).Length
        $totalAssetOriginalSize += $originalSize
        
        # Minify content
        $minifiedContent = $null
        if ($asset.Type -eq "CSS") {
            $minifiedContent = MinifyCSSContent (Get-Content -Path $asset.Path -Raw -ErrorAction Stop)
        }
        elseif ($asset.Type -eq "JS") {
            $minifiedContent = MinifyJSContent (Get-Content -Path $asset.Path -Raw -ErrorAction Stop)
        }
        
        if ($minifiedContent) {
            $newSize = [System.Text.Encoding]::UTF8.GetByteCount($minifiedContent)
            $totalAssetNewSize += $newSize
            Write-Host "✅" -ForegroundColor Green -NoNewline
            Write-Host " (🗜 $(Format-FileSize ($originalSize - $newSize)))" -ForegroundColor Blue
            $assetSuccess++
        }
        else {
            Write-Host "❌" -ForegroundColor Red
            $assetFail++
        }
    }

    # Calculate execution time
    $endTime = Get-Date
    $executionTime = ($endTime - $startTime).TotalSeconds

    # Calculate total size saved for HTML
    $totalSizeSaved = $totalOriginalSize - $totalNewSize
    $totalSizeSavedFormatted = Format-FileSize $totalSizeSaved
    $totalNewSizeFormatted = Format-FileSize $totalNewSize
    $percentSaved = [math]::Round(($totalSizeSaved / $totalOriginalSize) * 100)
    
    # Calculate total size saved for assets
    $totalAssetSizeSaved = $totalAssetOriginalSize - $totalAssetNewSize
    $totalAssetSizeSavedFormatted = Format-FileSize $totalAssetSizeSaved
    $totalAssetNewSizeFormatted = Format-FileSize $totalAssetNewSize
    $assetPercentSaved = 0
    if ($totalAssetOriginalSize -gt 0) {
        $assetPercentSaved = [math]::Round(($totalAssetSizeSaved / $totalAssetOriginalSize) * 100)
    }

    # Display summary
    Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host "📊 SUMMARY" -ForegroundColor Cyan
    Write-Host "───────────────────────────────────────────────────" -ForegroundColor DarkGray
    
    # HTML summary
    Write-Host "📄 HTML FILES:" -ForegroundColor Yellow
    Write-Host "  ✅ Successful: " -ForegroundColor Green -NoNewline
    Write-Host "$successCount files" -ForegroundColor White
    Write-Host "  ❌ Failed: " -ForegroundColor Red -NoNewline
    Write-Host "$failCount files" -ForegroundColor White
    Write-Host "  📈 Completion: " -ForegroundColor Magenta -NoNewline
    Write-Host "$([math]::Round(($successCount / $totalFiles) * 100))% of files" -ForegroundColor White
    Write-Host "  💾 Space Saved: " -ForegroundColor Blue -NoNewline
    Write-Host "$totalNewSizeFormatted from $totalOriginalSizeFormatted ($totalSizeSavedFormatted, $percentSaved% smaller)" -ForegroundColor White
    Write-Host "  📝 Note: CSS and JS have been embedded into index.html" -ForegroundColor Cyan
    
    # CSS/JS summary
    Write-Host "`n🎨 CSS/JS FILES:" -ForegroundColor Yellow
    Write-Host "  ✅ Successful: " -ForegroundColor Green -NoNewline
    Write-Host "$assetSuccess files" -ForegroundColor White
    Write-Host "  ❌ Failed: " -ForegroundColor Red -NoNewline
    Write-Host "$assetFail files" -ForegroundColor White
    if ($totalAssetFiles -gt 0) {
        Write-Host "  📈 Completion: " -ForegroundColor Magenta -NoNewline
        Write-Host "$([math]::Round(($assetSuccess / $totalAssetFiles) * 100))% of files" -ForegroundColor White
        if ($totalAssetOriginalSize -gt 0) {
            Write-Host "  💾 Space Saved: " -ForegroundColor Blue -NoNewline
            Write-Host "$totalAssetNewSizeFormatted from $(Format-FileSize $totalAssetOriginalSize) ($totalAssetSizeSavedFormatted, $assetPercentSaved% smaller)" -ForegroundColor White
        }
    }
    
    # Overall summary
    $totalOverallSaved = $totalSizeSaved + $totalAssetSizeSaved
    $totalOverallOriginal = $totalOriginalSize + $totalAssetOriginalSize
    
    Write-Host "`n📊 OVERALL:" -ForegroundColor Cyan
    Write-Host "  🕒 Total Time: " -ForegroundColor Cyan -NoNewline
    Write-Host "$([math]::Round($executionTime, 2)) seconds" -ForegroundColor White
    Write-Host "  💾 Total Space Saved: " -ForegroundColor Yellow -NoNewline
    Write-Host "$(Format-FileSize $totalOverallSaved) from $(Format-FileSize $totalOverallOriginal) ($([math]::Round(($totalOverallSaved / $totalOverallOriginal) * 100))% smaller)" -ForegroundColor White
    Write-Host "───────────────────────────────────────────────────" -ForegroundColor DarkGray
    
    if ($failCount + $assetFail -eq 0) {
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
