# NOTE: NO LONGER USING "MIN" SUFFIX IN FILENAMES

# Set the current working directory to the directory containing the script
try {
    Set-Location -Path $PSScriptRoot -ErrorAction Stop
    
    # Start timing the script execution
    $startTime = Get-Date
}
catch {
    Write-Error "Failed to set working directory: $_"
    exit 1
}

# Define a function to minify HTML files
function MinifyHTML($inputFile, $outputFile) {
    try {
        # Check if input file exists
        if (-not (Test-Path $inputFile)) {
            throw "Input file not found: $inputFile"
        }

        # Check if html-minifier is installed
        if (-not (Get-Command html-minifier -ErrorAction SilentlyContinue)) {
            throw "html-minifier is not installed. Please install it using 'npm install -g html-minifier'"
        }

        # Read the content of the file
        $content = Get-Content -Path $inputFile -Raw -ErrorAction Stop
        
        # Create a temporary file for the modified content
        $tempFile = [System.IO.Path]::GetTempFileName()
        $content | Set-Content -Path $tempFile -NoNewline -ErrorAction Stop
        
        # Ensure output directory exists
        $outputDir = Split-Path -Parent $outputFile
        if (-not (Test-Path $outputDir)) {
            New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
        }

        # Get file size before minification
        $originalSize = (Get-Item $inputFile).Length

        # Use html-minifier with the temporary file
        $minifierResult = html-minifier --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype $tempFile -o $outputFile 2>&1

        if ($LASTEXITCODE -ne 0) {
            throw "html-minifier failed: $minifierResult"
        }
        
        # Get file size after minification
        $newSize = (Get-Item $outputFile).Length
        $reduction = [math]::Round(100 - (($newSize / $originalSize) * 100))
        $kbSaved = [math]::Round(($originalSize - $newSize) / 1KB, 1)
        
        return @{
            Success      = $true
            Reduction    = $reduction
            KBSaved      = $kbSaved
            BytesSaved   = ($originalSize - $newSize)
            OriginalSize = $originalSize
        }
    }
    catch {
        Write-Error "Error processing file $inputFile : $_"
        return @{
            Success = $false
            Error   = $_
        }
    }
    finally {
        # Clean up temp file if it exists
        if ($tempFile -and (Test-Path $tempFile)) {
            Remove-Item $tempFile -ErrorAction SilentlyContinue
        }
    }
}

# Function to minify JS using Google Closure Compiler and Terser
function MinifyJS($inputFile, $outputFile) {
    try {
        # Check if input file exists
        if (-not (Test-Path $inputFile)) {
            throw "Input file not found: $inputFile"
        }

        # Check if required tools are installed
        if (-not (Get-Command google-closure-compiler -ErrorAction SilentlyContinue)) {
            throw "google-closure-compiler is not installed. Please install it using 'npm install -g google-closure-compiler'"
        }
        if (-not (Get-Command terser -ErrorAction SilentlyContinue)) {
            throw "terser is not installed. Please install it using 'npm install -g terser'"
        }

        # Get file size before minification
        $originalSize = (Get-Item $inputFile).Length

        $tempFile = [System.IO.Path]::GetTempFileName()
        $closureOutput = [System.IO.Path]::GetTempFileName()

        # Run Google Closure Compiler
        $closureResult = google-closure-compiler --charset=UTF-8 --js $inputFile --js_output_file $closureOutput 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Closure Compiler failed: $closureResult"
        }

        # Run Terser on the output from Closure Compiler
        $terserResult = terser $closureOutput -c -m --comments=false -o $outputFile 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Terser failed: $terserResult"
        }
        
        # Get file size after minification
        $newSize = (Get-Item $outputFile).Length
        $reduction = [math]::Round(100 - (($newSize / $originalSize) * 100))
        $kbSaved = [math]::Round(($originalSize - $newSize) / 1KB, 1)
        
        return @{
            Success      = $true
            Reduction    = $reduction
            KBSaved      = $kbSaved
            BytesSaved   = ($originalSize - $newSize)
            OriginalSize = $originalSize
        }
    }
    catch {
        Write-Error "Error minifying JS file $inputFile : $_"
        return @{
            Success = $false
            Error   = $_
        }
    }
    finally {
        # Clean up temp files if they exist
        if ($tempFile -and (Test-Path $tempFile)) {
            Remove-Item $tempFile -ErrorAction SilentlyContinue
        }
        if ($closureOutput -and (Test-Path $closureOutput)) {
            Remove-Item $closureOutput -ErrorAction SilentlyContinue
        }
    }
}

# Function to minify CSS using csso
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

        # Get file size before minification
        $originalSize = (Get-Item $inputFile).Length

        $result = csso $inputFile -o $outputFile 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "CSSO failed: $result"
        }
        
        # Get file size after minification
        $newSize = (Get-Item $outputFile).Length
        $reduction = [math]::Round(100 - (($newSize / $originalSize) * 100))
        $kbSaved = [math]::Round(($originalSize - $newSize) / 1KB, 1)
        
        return @{
            Success      = $true
            Reduction    = $reduction
            KBSaved      = $kbSaved
            BytesSaved   = ($originalSize - $newSize)
            OriginalSize = $originalSize
        }
    }
    catch {
        Write-Error "Error minifying CSS file $inputFile : $_"
        return @{
            Success = $false
            Error   = $_
        }
    }
}

try {
    # Initialize counters
    $totalFiles = 0
    $processedCount = 0
    $successCount = 0
    $failCount = 0
    $totalBytesSaved = 0
    $totalOriginalSize = 0
    
    # Collect all file operations to process
    $operations = @()
    
    # Add diffCompare files
    $diffCompareHtmlInput = "diffCompare/cdn-custom.html"
    $diffCompareHtmlOutput = "../page/diffCompare.html"
    $diffCompareJsInput = "diffCompare/mergely.js"
    $diffCompareJsOutput = "../page/diffCompare.js"
    
    if (Test-Path $diffCompareHtmlInput) {
        $operations += @{
            Type          = "CustomHTML"
            Input         = $diffCompareHtmlInput
            Output        = $diffCompareHtmlOutput
            Name          = "diffCompare HTML"
            Modifications = {
                param($content)
                $content = $content -replace '../../', '../'
                $content = $content -replace '<script src="mergely.js"></script>', '<script src="diffCompare.js"></script>'
                return $content
            }
        }
    }
    
    if (Test-Path $diffCompareJsInput) {
        $operations += @{
            Type   = "JS"
            Input  = $diffCompareJsInput
            Output = $diffCompareJsOutput
            Name   = "diffCompare JS"
        }
    }
    
    # Add regular HTML files
    $htmlFiles = Get-ChildItem -Filter "*.html" -ErrorAction Stop
    foreach ($file in $htmlFiles) {
        $operations += @{
            Type   = "HTML"
            Input  = $file.FullName
            Output = "../page/$($file.Name)"
            Name   = $file.Name
        }
    }
    
    # Add JS files
    $jsFiles = @(
        "textEditor.js",
        "noFiliExceptions.js",
        @{
            Input  = "unitConverter/UnitOf.js"
            Output = "../page/unitConverter.js"
        }
    )
    
    foreach ($jsFile in $jsFiles) {
        if ($jsFile -is [string]) {
            $inputFile = $jsFile
            $outputFile = "../page/$([System.IO.Path]::GetFileNameWithoutExtension($jsFile)).js"
            $jsName = $jsFile
        }
        else {
            $inputFile = $jsFile.Input
            $outputFile = $jsFile.Output
            $jsName = $jsFile.Input
        }

        if (Test-Path $inputFile) {
            $operations += @{
                Type   = "JS"
                Input  = $inputFile
                Output = $outputFile
                Name   = $jsName
            }
        }
    }
    
    # Add custom HTML files
    $customFileMap = @{
        "qrCode/qrcodegen-input-custom.html" = "../page/qrGenerator.html"
        "keyboardPage/index-custom.html"     = "../page/keyboardPage.html"
        "unitConverter/index.html"           = "../page/unitConverter.html"
    }
    
    foreach ($mapping in $customFileMap.GetEnumerator()) {
        $inputFile = $mapping.Key
        $outputFile = $mapping.Value
        
        if (Test-Path $inputFile) {
            $operations += @{
                Type          = "CustomHTML"
                Input         = $inputFile
                Output        = $outputFile
                Name          = $inputFile
                Modifications = {
                    param($content)
                    $content = $content -replace '(src=["''])../../', '$1../'
                    $content = $content -replace '(href=["''])../../', '$1../'
                    
                    # Add specific replacement for unitConverter
                    if ($inputFile -eq "unitConverter/index.html") {
                        $content = $content -replace 'src="UnitOf.js"', 'src="unitConverter.js"'
                    }
                    
                    return $content
                }
            }
        }
    }
    
    # Add 404 copy operation
    $operations += @{
        Type   = "Copy"
        Input  = "../page/404.html"
        Output = "../404.html"
        Name   = "404.html to root"
    }
    
    # Calculate total files
    $totalFiles = $operations.Count
    $countWidth = $totalFiles.ToString().Length
    $percentWidth = 3 # "100" is 3 chars
    
    # Calculate total size of files
    foreach ($op in $operations) {
        if (($op.Type -eq "HTML" -or $op.Type -eq "JS" -or $op.Type -eq "CSS" -or $op.Type -eq "CustomHTML") -and (Test-Path $op.Input)) {
            $totalOriginalSize += (Get-Item $op.Input).Length
        }
    }
    
    # Display banner
    Write-Host "`n🔄 Starting file minification process..." -ForegroundColor Cyan
    
    # Display total files and size
    $totalKB = [math]::Round($totalOriginalSize / 1KB, 1)
    $totalMB = [math]::Round($totalOriginalSize / 1MB, 2)
    
    # For the total files and size display:
    if ($totalMB -ge 1) {
        Write-Host "🔍 Found $totalFiles files to process (💾 $totalMB MB total)" -ForegroundColor Cyan
    }
    else {
        Write-Host "🔍 Found $totalFiles files to process (💾 $totalKB KB total)" -ForegroundColor Cyan
    }
    
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor DarkGray
    
    # Process all operations
    foreach ($op in $operations) {
        $processedCount++
        $percentComplete = [math]::Round(($processedCount / $totalFiles) * 100)
        
        # Format the count and percentage with consistent padding
        $countDisplay = "[$($processedCount.ToString().PadRight($countWidth))/$totalFiles]"
        $percentDisplay = "$($percentComplete.ToString().PadRight($percentWidth))%"
        
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
        
        # Display operation name
        Write-Host "$($op.Name) " -NoNewline
        
        # Process based on type
        $result = $null
        
        switch ($op.Type) {
            "HTML" {
                $result = MinifyHTML $op.Input $op.Output
            }
            "JS" {
                $result = MinifyJS $op.Input $op.Output
            }
            "CSS" {
                $result = MinifyCSS $op.Input $op.Output
            }
            "CustomHTML" {
                # Create temp file with modifications
                $tempFile = [System.IO.Path]::GetTempFileName()
                try {
                    $content = Get-Content -Path $op.Input -Raw
                    $content = & $op.Modifications $content
                    $content | Set-Content -Path $tempFile -NoNewline
                    
                    $result = MinifyHTML $tempFile $op.Output
                }
                finally {
                    if (Test-Path $tempFile) {
                        Remove-Item $tempFile -ErrorAction SilentlyContinue
                    }
                }
            }
            "Copy" {
                try {
                    if (Test-Path $op.Input) {
                        Copy-Item $op.Input -Destination $op.Output -ErrorAction Stop
                        $result = @{ Success = $true }
                    }
                    else {
                        $result = @{ Success = $false; Error = "File not found" }
                    }
                }
                catch {
                    $result = @{ Success = $false; Error = $_ }
                }
            }
        }
        
        # Display result
        if ($result.Success) {
            Write-Host "✅ " -ForegroundColor Green -NoNewline
    
            # Show reduction if available
            if ($result.ContainsKey('KBSaved')) {
                Write-Host "(🗜 $($result.KBSaved) KB)" -ForegroundColor Cyan
        
                # Add to total bytes saved
                $totalBytesSaved += $result.BytesSaved
            }
            else {
                Write-Host ""
            }
    
            $successCount++
        }
        else {
            Write-Host "❌" -ForegroundColor Red
            $failCount++
        }
    }
    
    # Calculate execution time
    $endTime = Get-Date
    $executionTime = ($endTime - $startTime).TotalSeconds
    $executionTime = [math]::Round($executionTime, 2)  # Round to 2 decimal places

    
    # Calculate total size saved
    $totalKBSaved = [math]::Round($totalBytesSaved / 1KB, 1)
    $totalMBSaved = [math]::Round($totalBytesSaved / 1MB, 2)
    $totalPercentSaved = [math]::Round(($totalBytesSaved / $totalOriginalSize) * 100)

    # Calculate new total size
    $newTotalSize = $totalOriginalSize - $totalBytesSaved
    $newTotalKB = [math]::Round($newTotalSize / 1KB, 1)
    $newTotalMB = [math]::Round($newTotalSize / 1MB, 2)
    $originalTotalMB = [math]::Round($totalOriginalSize / 1MB, 2)




    # Display summary
    Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host "📊 SUMMARY" -ForegroundColor Cyan
    Write-Host "───────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "✅ Successful: " -ForegroundColor Green -NoNewline
    Write-Host "$successCount files" -ForegroundColor White
    Write-Host "❌ Failed: " -ForegroundColor Red -NoNewline
    Write-Host "$failCount files" -ForegroundColor White
    Write-Host "📈 Completion: " -ForegroundColor Magenta -NoNewline
    Write-Host "$([math]::Round(($successCount / $totalFiles) * 100))% of files" -ForegroundColor White
    Write-Host "💾 Total Space Saved: " -ForegroundColor Yellow -NoNewline

    if ($newTotalMB -ge 1) {
        Write-Host "$newTotalMB MB from $originalTotalMB MB ($totalKBSaved KB, $totalPercentSaved% smaller)" -ForegroundColor White
    }
    else {
        Write-Host "$newTotalKB KB from $originalTotalMB MB ($totalKBSaved KB, $totalPercentSaved% smaller)" -ForegroundColor White
    }
    
    Write-Host "🕒 Total Time: " -ForegroundColor Cyan -NoNewline
    Write-Host "$executionTime seconds" -ForegroundColor White
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