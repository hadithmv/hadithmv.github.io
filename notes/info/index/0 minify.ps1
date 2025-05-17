# HTML Minification Script
# This script can be run from any directory
try {
    # Store the initial location to return to it at the end if needed
    $initialLocation = Get-Location
    Set-Location -Path $PSScriptRoot -ErrorAction Stop
    $startTime = Get-Date
    $processedFiles = 0
    $successfulFiles = 0
    $failedFiles = 0
}
catch {
    Write-Error "Failed to initialize script: $_"
    exit 1
}

function Run-MinifierCommand {
    param (
        [string]$InputFile,
        [string]$OutputFile,
        [string[]]$Options
    )
    
    try {
        # Process is running
        
        # Create process info
        $pinfo = New-Object System.Diagnostics.ProcessStartInfo
        $pinfo.FileName = "html-minifier.cmd"
        $pinfo.RedirectStandardError = $true
        $pinfo.RedirectStandardOutput = $true
        $pinfo.UseShellExecute = $false
        
        # Build arguments
        $args = $Options + @($InputFile, "-o", $OutputFile)
        $pinfo.Arguments = $args
        
        # Create and start the process
        $p = New-Object System.Diagnostics.Process
        $p.StartInfo = $pinfo
        $p.Start() | Out-Null
        
        # Wait for the process to exit and capture output
        $output = $p.StandardOutput.ReadToEnd()
        $errorOutput = $p.StandardError.ReadToEnd()
        $p.WaitForExit()
        
        if ($p.ExitCode -ne 0) {
            Write-Host "Error executing html-minifier command" -ForegroundColor Red
            Write-Host "Error output: $errorOutput" -ForegroundColor Red
            return $false
        }
        
        # Check file sizes for reporting
        $originalSize = (Get-Item $InputFile).Length
        $minifiedSize = (Get-Item $OutputFile).Length
        $savingsBytes = $originalSize - $minifiedSize
        $savingsPercent = if ($originalSize -gt 0) { [math]::Round(($savingsBytes / $originalSize) * 100, 2) } else { 0 }
        
        # Store info for reporting
        $script:fileStats += @{
            InputFile      = $InputFile
            OutputFile     = $OutputFile
            OriginalSize   = $originalSize
            MinifiedSize   = $minifiedSize
            SavingsBytes   = $savingsBytes
            SavingsPercent = $savingsPercent
        }
        
        return $true
    }
    catch {
        Write-Host "Exception occurred: $_" -ForegroundColor Red
        return $false
    }
}

function Process-Files {
    param (
        [array]$FilesToProcess
    )
    
    try {
        Write-Host "`n🔄 Processing $($FilesToProcess.Count) files..." -ForegroundColor Cyan
        
        $script:fileStats = @()
        $totalFiles = $FilesToProcess.Count
        $script:processedFiles = 0
        $script:successfulFiles = 0
        $script:failedFiles = 0
        
        # Process each file
        foreach ($file in $FilesToProcess) {
            $script:processedFiles++
            $percentComplete = [math]::Round(($script:processedFiles / $totalFiles) * 100)
            
            $inputFile = $file.InputFile
            $outputFile = $file.OutputFile
            $options = $file.Options
            
            $fileName = Split-Path $inputFile -Leaf
            
            Write-Host "[$script:processedFiles/$totalFiles] $fileName " -NoNewline
            
            try {
                # Check if file exists
                if (-not (Test-Path $inputFile)) {
                    Write-Host "❌ (File not found)" -ForegroundColor Red
                    $script:failedFiles++
                    continue
                }
                
                # Run minifier command
                $success = Run-MinifierCommand -InputFile $inputFile -OutputFile $outputFile -Options $options
                
                if ($success) {
                    Write-Host "✅ " -ForegroundColor Green -NoNewline
                    
                    # Get the last added stats
                    $stats = $script:fileStats[-1]
                    Write-Host "(Saved $($stats.SavingsPercent)%, $($stats.SavingsBytes) bytes)" -ForegroundColor Cyan
                    $script:successfulFiles++
                }
                else {
                    Write-Host "❌ (Minification failed)" -ForegroundColor Red
                    $script:failedFiles++
                }
            }
            catch {
                Write-Host "❌" -ForegroundColor Red
                Write-Error "Error processing $fileName : $_"
                $script:failedFiles++
            }
        }
        
        # Display summary for minification
        Write-Host "`n📊 Summary:" -ForegroundColor Cyan
        
        # Overall statistics
        $totalOriginalSize = ($script:fileStats | Measure-Object -Property OriginalSize -Sum).Sum
        $totalMinifiedSize = ($script:fileStats | Measure-Object -Property MinifiedSize -Sum).Sum
        $totalSavings = $totalOriginalSize - $totalMinifiedSize
        $overallSavingsPercent = if ($totalOriginalSize -gt 0) { [math]::Round(($totalSavings / $totalOriginalSize) * 100, 2) } else { 0 }
        
        Write-Host "💾 Saved: $([math]::Round($totalSavings / 1KB, 2)) KB ($overallSavingsPercent%)" -ForegroundColor Green
        Write-Host "✅ Files: $script:successfulFiles successful" -NoNewline -ForegroundColor $(if ($script:failedFiles -eq 0) { "Green" } else { "Yellow" })
        if ($script:failedFiles -gt 0) {
            Write-Host ", ❌ $script:failedFiles failed" -ForegroundColor Red
        }
        else {
            Write-Host "" # Just for newline
        }
        
        # Add status message
        if ($script:failedFiles -eq 0 -and $script:successfulFiles -gt 0) {
            Write-Host "✅ HTML MINIFICATION COMPLETED SUCCESSFULLY" -ForegroundColor Green
            return $true
        }
        elseif ($script:failedFiles -gt 0 -and $script:successfulFiles -gt 0) {
            Write-Host "⚠️ COMPLETED WITH ERRORS" -ForegroundColor Yellow
            return $true
        }
        else {
            Write-Host "❌ MINIFICATION FAILED" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Error "HTML minification failed: $_"
        return $false
    }
}

# Main execution block
try {
    # Define the files to process with their options
    $filesToProcess = @(
        @{
            InputFile  = (Join-Path $PSScriptRoot "index-uc.html")
            OutputFile = (Join-Path $PSScriptRoot "index.html")
            Options    = @(
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
        }
        # Add more files here as needed, for example:
        # @{
        #     InputFile = (Join-Path $PSScriptRoot "about-uc.html")
        #     OutputFile = (Join-Path $PSScriptRoot "about.html")
        #     Options = @( ... same options ... )
        # }
    )
    
    # Process the files
    $success = Process-Files -FilesToProcess $filesToProcess
    
    # Calculate execution time
    $endTime = Get-Date
    $executionTime = ($endTime - $startTime).TotalSeconds
    
    # Display just the completion time
    Write-Host "`n🕒 Completed in $([math]::Round($executionTime, 2)) seconds" -ForegroundColor Cyan
    
    # Return to initial location
    Set-Location -Path $initialLocation
}
catch {
    Write-Host "`n❌ Script execution failed: $_" -ForegroundColor Red
    
    # Try to return to initial location
    try {
        Set-Location -Path $initialLocation
    }
    catch {
        # Ignore errors when returning to initial location
    }
    
    exit 1
}