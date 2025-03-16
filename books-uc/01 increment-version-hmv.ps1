<#
powershell script:
for the file in this directory: ..\js\navbar.js
at the very top is a single line of code which says  var hmvVersionNo = 3.15;
every time this script is run, increment that by 0.01
#>

# Simplified Version Increment Script
# This script increments version numbers across multiple project files

# Set the location to the script's directory
try {
    Set-Location -Path $PSScriptRoot -ErrorAction Stop
    $startTime = Get-Date
}
catch {
    Write-Error "Failed to initialize script: $_"
    exit 1
}

# Files to update versions in
$filesToUpdate = @(
    @{Path = "..\js\navbar.js"; Pattern = 'var hmvVersionNo = "(\d+\.\d+\.\d+)";'; Replacement = 'var hmvVersionNo = "{0}";'},
    @{Path = "..\windowsApp-tauri\Hadithmv\src-tauri\tauri.conf.json"; Pattern = '"version": "(\d+\.\d+\.\d+)"'; Replacement = '"version": "{0}"'},
    @{Path = "..\androidApp-kt\app\build.gradle"; Pattern = 'versionName\s+"([^"]+)"'; Replacement = 'versionName "{0}"'}
)

try {
    Write-Host "`n🔄 Starting Version Update Process..." -ForegroundColor Cyan
    Write-Host "🔍 Found $($filesToUpdate.Count) files to update" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor DarkGray
    
    $totalFiles = $filesToUpdate.Count
    $processedCount = 0
    $successCount = 0
    $failCount = 0
    $currentVersion = $null
    $newVersion = $null
    
    # Process each file
    foreach ($file in $filesToUpdate) {
        $processedCount++
        $percentComplete = [math]::Round(($processedCount / $totalFiles) * 100)
        
        $filePath = $file.Path
        $fileName = Split-Path $filePath -Leaf
        
        Write-Host "[$processedCount/$totalFiles] $percentComplete% " -NoNewline
        Write-Host "$fileName " -NoNewline
        
        try {
            # Check if file exists
            if (-not (Test-Path $filePath)) {
                Write-Host "❌ (File not found)" -ForegroundColor Red
                $failCount++
                continue
            }
            
            # Read the content of the file
            $content = Get-Content $filePath -Raw -ErrorAction Stop
            
            # Extract the current version number
            if ($content -match $file.Pattern) {
                $fileVersion = $matches[1]
                
                # Store the version from the first file to use in all files
                if ($null -eq $currentVersion) {
                    $currentVersion = $fileVersion
                    
                    # Parse semver components
                    $versionParts = $currentVersion.Split('.')
                    $major = [int]$versionParts[0]
                    $minor = [int]$versionParts[1]
                    $patch = [int]$versionParts[2]
                    
                    # Increment the patch version
                    $patch += 1
                    $newVersion = "$major.$minor.$patch"
                }
                
                # Replace the version in the file
                $replacement = $file.Replacement -f $newVersion
                $newContent = $content -replace $file.Pattern, $replacement
                
                if ($newContent -eq $content) {
                    Write-Host "❌ (Version replacement failed)" -ForegroundColor Red
                    $failCount++
                    continue
                }
                
                # Write the new content
                $newContent | Set-Content $filePath -NoNewline -ErrorAction Stop
                
                # Success message
                Write-Host "✅ " -ForegroundColor Green -NoNewline
                Write-Host "($fileVersion → $newVersion)" -ForegroundColor Cyan
                $successCount++
            }
            else {
                Write-Host "❌ (Version pattern not found)" -ForegroundColor Red
                $failCount++
            }
        }
        catch {
            Write-Host "❌" -ForegroundColor Red
            Write-Error "Error processing $fileName : $_"
            $failCount++
        }
    }
    
    # Calculate execution time
    $endTime = Get-Date
    $executionTime = ($endTime - $startTime).TotalSeconds
    
    # Display summary
    Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host "📊 SUMMARY" -ForegroundColor Cyan
    Write-Host "───────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "📌 New Version: " -ForegroundColor Blue -NoNewline
    Write-Host "$newVersion" -ForegroundColor White
    Write-Host "✅ Successful: " -ForegroundColor Green -NoNewline
    Write-Host "$successCount files" -ForegroundColor White
    Write-Host "❌ Failed: " -ForegroundColor Red -NoNewline
    Write-Host "$failCount files" -ForegroundColor White
    Write-Host "🕒 Total Time: " -ForegroundColor Cyan -NoNewline
    Write-Host "$([math]::Round($executionTime, 2)) seconds" -ForegroundColor White
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