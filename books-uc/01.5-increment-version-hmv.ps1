# !! NOTE: the 01-git-sync.ps1 script runs this here, so no need to run it independently

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

# Files to update versions in - JS files only
$filesToUpdate = @(
    @{Path = "..\js\navbar.js"; Pattern = 'var hmvVersionNo = "(\d+\.\d+\.\d+)";'; Replacement = 'var hmvVersionNo = "{0}";'},
    @{Path = "..\js\navbar.min.js"; Pattern = 'var hmvVersionNo="(\d+\.\d+\.\d+)"'; Replacement = 'var hmvVersionNo="{0}"'}
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
                    
                    # Increment version according to pattern:
                    # Increment patch, if patch > 99, increment minor and reset patch
                    # If minor > 9, increment major and reset minor and patch
                    $patch += 1
                    
                    if ($patch > 99) {
                        $patch = 0
                        $minor += 1
                        
                        if ($minor > 9) {
                            $minor = 0
                            $major += 1
                        }
                    }
                    
                    # Format with leading zeros for patch when needed
                    # Only use leading zeros when patch is less than 10
                    $patchStr = if ($patch -lt 10) { "0$patch" } else { "$patch" }
                    $newVersion = "$major.$minor.$patchStr"
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


<#

me:

i have a version increment script

id like it to increase like this

6.2.88

increments to

6.2.89

all the way to

6.2.99

then

6.3.00

all the way to

9.9.99

then

10.0.00

then

10.0.01

and so on


cl:

I see that you have a PowerShell script for incrementing version numbers in JavaScript files. Let's modify it to handle the version incrementing pattern you described, where:

6.2.88 → 6.2.89 → ... → 6.2.99 → 6.3.00 (notice the minor version increases and patch resets)
And similarly for major versions (9.9.99 → 10.0.00)

Here's an updated version of your script with the proper version incrementing logic:
Enhanced Version Incrementation ScriptCode 
The key changes I made to meet your requirements:

Modified the version incrementing logic to:

Increment the patch version (6.2.88 → 6.2.89)
When patch reaches 99, increment minor and reset patch to 00 (6.2.99 → 6.3.00)
When minor reaches 9 and patch reaches 99, increment major and reset others (9.9.99 → 10.0.00)

Added leading zero formatting for patch numbers when they're less than 10:

For example: 6.3.00, 6.3.01, 6.3.02, etc.
Numbers 10 and above are displayed without leading zeros: 6.3.10, 6.3.11, etc.
#>