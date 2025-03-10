# Set the working directory to the script's location
try {
    Set-Location -Path $PSScriptRoot -ErrorAction Stop
    
    # Start timing the script execution
    $startTime = Get-Date
}
catch {
    Write-Error "Failed to set working directory: $_"
    exit 1
}

# Function to minify and create temporary content
function Get-Minified-Content {
    param (
        [string]$sourceFile
    )
    
    try {
        # Check if source file exists
        if (-not (Test-Path $sourceFile)) {
            throw "Source file not found: $sourceFile"
        }

        # Check if csso is installed
        if (-not (Get-Command csso -ErrorAction SilentlyContinue)) {
            throw "csso is not installed. Please install it using 'npm install -g csso-cli'"
        }

        $minifiedFile = [System.IO.Path]::GetFileNameWithoutExtension($sourceFile) + ".temp.css"
        
        # Run csso and capture any errors
        $cssoOutput = csso $sourceFile -o $minifiedFile 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "csso failed: $cssoOutput"
        }

        $minifiedContent = Get-Content -Path $minifiedFile -Raw -ErrorAction Stop
        Remove-Item -Path $minifiedFile -ErrorAction Stop
        return $minifiedContent.Trim()
    }
    catch {
        Write-Error "Failed to minify $sourceFile : $_"
        return $null
    }
}

# Files to process for DT-COMB.min.css
$combFiles = @(
    #"DT-inline.css"
)

# Files to minify separately
$separateFiles = @(
    "base-styles.css",
    "navbar.css",
    "DT-inline.css",
    "quran-navigation-list.css"
)

try {
    # Calculate total files to process
    $totalFiles = $combFiles.Count + $separateFiles.Count
    $processedCount = 0
    $successCount = 0
    $failCount = 0
    
    # Calculate padding widths based on total files
    $countWidth = $totalFiles.ToString().Length
    $percentWidth = 5 # "100.0" is 5 chars
    
    Write-Host "`n🔄 Starting CSS minification process..." -ForegroundColor Cyan
    Write-Host "🔍 Found $totalFiles CSS files to process" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor DarkGray

    # Check if DT-COMB.min.css exists
    if (-not (Test-Path "DT-COMB.min.css")) {
        Write-Host "⚠️ DT-COMB.min.css not found. Creating new file." -ForegroundColor Yellow
        New-Item -ItemType File -Name "DT-COMB.min.css" -Force | Out-Null
    }

    # Read the entire content of DT-COMB.min.css
    $allContent = Get-Content -Path "DT-COMB.min.css" -Raw -ErrorAction Stop

    # Process files for DT-COMB.min.css
    foreach ($file in $combFiles) {
        $processedCount++
        $percentComplete = [math]::Round(($processedCount / $totalFiles) * 100, 1)
        
        # Format the count and percentage with consistent padding
        $countDisplay = "[$($processedCount.ToString().PadLeft($countWidth))/$totalFiles]"
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
        
        Write-Host "$file " -NoNewline
        
        # Create the exact header pattern that exists in the file
        $headerPattern = "/* $file */"
        
        # Check if this header exists in the content
        if ($allContent -match [regex]::Escape($headerPattern)) {
            Write-Host "(Updating) " -NoNewline -ForegroundColor Blue
            
            # Get the new minified content
            $newContent = Get-Minified-Content -sourceFile $file
            if ($null -eq $newContent) {
                Write-Host "❌" -ForegroundColor Red
                $failCount++
                continue
            }
            
            try {
                # Pattern to match the whole section (header + content until next header or end)
                $pattern = "(?ms)/\* $file \*/\r?\n.*?(?=(/\* .*?\*/\r?\n|\z))"
                
                # Create replacement with preserved header and blank line after code block
                $replacement = "/* $file */`n$newContent`n`n"
                
                # Replace the section
                $allContent = [regex]::Replace($allContent, $pattern, $replacement)
                
                Write-Host "✅" -ForegroundColor Green
                $successCount++
            }
            catch {
                Write-Host "❌" -ForegroundColor Red
                Write-Error "Failed to process regex replacement for $file : $_"
                $failCount++
                continue
            }
        }
        else {
            Write-Host "(Section not found) " -NoNewline -ForegroundColor Yellow
            Write-Host "⚠️" -ForegroundColor Yellow
            $failCount++
        }
    }

    # Process files that need separate minification
    foreach ($file in $separateFiles) {
        $processedCount++
        $percentComplete = [math]::Round(($processedCount / $totalFiles) * 100, 1)
        
        # Format the count and percentage with consistent padding
        $countDisplay = "[$($processedCount.ToString().PadLeft($countWidth))/$totalFiles]"
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
        
        Write-Host "$file " -NoNewline
        
        try {
            if (-not (Test-Path $file)) {
                Write-Host "❌ (File not found)" -ForegroundColor Red
                $failCount++
                continue
            }

            $minifiedFile = [System.IO.Path]::GetFileNameWithoutExtension($file) + ".min.css"
            $cssoOutput = csso $file -o $minifiedFile 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅" -ForegroundColor Green
                $successCount++
            }
            else {
                Write-Host "❌" -ForegroundColor Red
                Write-Error "Failed to minify $file : $cssoOutput"
                $failCount++
            }
        }
        catch {
            Write-Host "❌" -ForegroundColor Red
            Write-Error "Error processing $file : $_"
            $failCount++
            continue
        }
    }

    # Remove any potential multiple blank lines at the end of the file
    $allContent = $allContent -replace "`n{3,}$", "`n`n"

    # Write the updated content back to the file
    Set-Content -Path "DT-COMB.min.css" -Value $allContent -NoNewline -ErrorAction Stop
    
    # Calculate execution time
    $endTime = Get-Date
    $executionTime = ($endTime - $startTime).TotalSeconds

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
    Write-Host "🕒 Total Time: " -ForegroundColor Cyan -NoNewline
    Write-Host "$([math]::Round($executionTime, 2)) seconds" -ForegroundColor White
    Write-Host "───────────────────────────────────────────────────" -ForegroundColor DarkGray
    
    if ($failCount -eq 0) {
        Write-Host "✅ ALL FILES PROCESSED SUCCESSFULLY ✅" -ForegroundColor Green
    } else {
        Write-Host "⚠️ COMPLETED WITH ERRORS ⚠️" -ForegroundColor Yellow
    }
}
catch {
    Write-Error "Script execution failed: $_"
    exit 1
}