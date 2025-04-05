# Combined script for version increment and Git sync
try {
    # Store the initial location to return to it at the end if needed
    $initialLocation = Get-Location
    Set-Location -Path $PSScriptRoot -ErrorAction Stop
    $startTime = Get-Date
    $newVersion = $null
}
catch {
    Write-Error "Failed to initialize script: $_"
    exit 1
}

function Run-GitCommand {
    param (
        [string]$Command
    )
    
    try {
        Write-Host "DEBUG: Running Git command: $Command" -ForegroundColor Gray
        
        # Split the command into an array
        $cmdArgs = $Command.Split()
        
        # Create process info
        $pinfo = New-Object System.Diagnostics.ProcessStartInfo
        $pinfo.FileName = "git"
        $pinfo.RedirectStandardError = $true
        $pinfo.RedirectStandardOutput = $true
        $pinfo.UseShellExecute = $false
        $pinfo.Arguments = $cmdArgs
        
        # Create and start the process
        $p = New-Object System.Diagnostics.Process
        $p.StartInfo = $pinfo
        $p.Start() | Out-Null
        
        # Wait for the process to exit and capture output
        $output = $p.StandardOutput.ReadToEnd()
        $errorOutput = $p.StandardError.ReadToEnd()
        $p.WaitForExit()
        
        if ($p.ExitCode -ne 0) {
            Write-Host "Error executing git command: $Command" -ForegroundColor Red
            Write-Host "Error output: $errorOutput" -ForegroundColor Red
            exit 1
        }
        return $output
    }
    catch {
        Write-Host "Exception occurred: $_" -ForegroundColor Red
        exit 1
    }
}

function Generate-CommitMessage {
    param (
        [string[]]$ChangedFiles,
        [string]$NewVersion
    )
    
    $added = @()
    $modified = @()
    $deleted = @()
    
    foreach ($fileInfo in $ChangedFiles) {
        if ([string]::IsNullOrWhiteSpace($fileInfo)) {
            continue
        }
        
        $statusCode = $fileInfo.Substring(0, 2).Trim()
        $filename = $fileInfo.Substring(2).Trim()
        
        if ($statusCode -eq "??" -or $statusCode.StartsWith("A")) {
            $added += $filename
        }
        elseif ($statusCode.StartsWith("M")) {
            $modified += $filename
        }
        elseif ($statusCode.StartsWith("D")) {
            $deleted += $filename
        }
        else {
            # Handle renamed, copied files, etc.
            if ($statusCode.StartsWith("R")) {
                # Typical format for renamed: R100 old-name -> new-name
                if ($fileInfo -match 'R\d*\s+(.*?)\s+->\s+(.*)') {
                    $deleted += $matches[1]
                    $added += $matches[2]
                }
                else {
                    $modified += $filename # Fallback
                }
            }
            else {
                $modified += $filename # Default to modified for other codes
            }
        }
    }
    
    # Create a summary line with version info if available
    $versionInfo = if ($NewVersion) { "Update to v$NewVersion, " } else { "" }
    
    $summaryParts = @()
    if ($added.Count -gt 0) {
        $suffix = if ($added.Count -gt 1) { "s" } else { "" }
        $summaryParts += "Add $($added.Count) file$suffix"
    }
    if ($modified.Count -gt 0) {
        $suffix = if ($modified.Count -gt 1) { "s" } else { "" }
        $summaryParts += "Update $($modified.Count) file$suffix"
    }
    if ($deleted.Count -gt 0) {
        $suffix = if ($deleted.Count -gt 1) { "s" } else { "" }
        $summaryParts += "Remove $($deleted.Count) file$suffix"
    }
    
    $summary = if ($summaryParts.Count -gt 0) { "$versionInfo$($summaryParts -join ", ")" } else { "${versionInfo}Update files" }
    
    # Create the details section
    $details = @()
    foreach ($file in ($added | Sort-Object)) {
        $details += "- Add: $file"
    }
    foreach ($file in ($modified | Sort-Object)) {
        $details += "- Update: $file"
    }
    foreach ($file in ($deleted | Sort-Object)) {
        $details += "- Remove: $file"
    }
    
    # Format with timestamp
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $commitMsg = "$summary`n`n$timestamp`n`n$($details -join "`n")"
    
    return $commitMsg
}

function Increment-Version {
    # Files to update versions in - JS files only
    $filesToUpdate = @(
        @{Path = "..\js\navbar.js"; Pattern = 'var hmvVersionNo = "(\d+\.\d+\.\d+)";'; Replacement = 'var hmvVersionNo = "{0}";' },
        @{Path = "..\js\navbar.min.js"; Pattern = 'var hmvVersionNo="(\d+\.\d+\.\d+)"'; Replacement = 'var hmvVersionNo="{0}"' }
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
        $script:newVersion = $null
        
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
                        
                        # Increment version according to pattern
                        $patch += 1
                        if ($patch -ge 100) {
                            $patch = 0
                            $minor += 1
                            
                            if ($minor -ge 10) {
                                $minor = 0
                                $major += 1
                            }
                        }
                        
                        # Format with leading zeros for patch when needed
                        $patchStr = if ($patch -lt 10) { "0$patch" } else { "$patch" }
                        $script:newVersion = "$major.$minor.$patchStr"
                    }
                    
                    # Replace the version in the file
                    $replacement = $file.Replacement -f $script:newVersion
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
                    Write-Host "($fileVersion → $script:newVersion)" -ForegroundColor Cyan
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
        
        # Display summary for version update
        Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor DarkGray
        Write-Host "📊 VERSION UPDATE SUMMARY" -ForegroundColor Cyan
        Write-Host "───────────────────────────────────────────────────" -ForegroundColor DarkGray
        Write-Host "📌 New Version: " -ForegroundColor Blue -NoNewline
        Write-Host "$script:newVersion" -ForegroundColor White
        Write-Host "✅ Successful: " -ForegroundColor Green -NoNewline
        Write-Host "$successCount files" -ForegroundColor White
        Write-Host "❌ Failed: " -ForegroundColor Red -NoNewline
        Write-Host "$failCount files" -ForegroundColor White
        Write-Host "───────────────────────────────────────────────────" -ForegroundColor DarkGray
        
        if ($failCount -eq 0) {
            Write-Host "✅ VERSION UPDATE COMPLETED SUCCESSFULLY ✅" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "⚠️ VERSION UPDATE COMPLETED WITH ERRORS ⚠️" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Error "Version update failed: $_"
        return $false
    }
}

function Sync-Git {
    param (
        [string]$repoPath = "C:\Users\ashra\Downloads\VScode\hadithmv.github.io"
    )
    
    try {
        # Set the repository path
        Set-Location -Path $repoPath -ErrorAction Stop
        
        # Debug: Check for 99 file before Git operations
        $file99Path = Join-Path $repoPath "99"
        if (Test-Path $file99Path) {
            Write-Host "  🔍 Found existing '99' file with content: $(Get-Content $file99Path)" -ForegroundColor Yellow
        }
        
        # Run git commands
        Write-Host "  🔄 Running Git commands..." -ForegroundColor Cyan
        Run-GitCommand "add ."
        
        # Use a simpler commit approach with inline message
        $commitMsg = "Version update and sync - Incremented version numbers and synced changes with Git"
        Write-Host "  🔍 Running commit command with inline message" -ForegroundColor Gray
        Run-GitCommand "commit -m `"$commitMsg`""
        
        Run-GitCommand "push"
        
        Write-Host "  ✅ Git sync completed successfully" -ForegroundColor Green
        
        # Debug: Check for 99 file after Git operations
        if (Test-Path $file99Path) {
            Write-Host "  🔍 Found '99' file after Git operations with content: $(Get-Content $file99Path)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Error "Git sync failed: $_"
        throw
    }
}

# Main execution block
try {
    # First run version increment
    $versionSuccess = Increment-Version
    
    # Then run git sync if version increment was successful
    if ($versionSuccess) {
        $gitSuccess = Sync-Git
    }
    else {
        Write-Host "`n⚠️ Skipping Git sync due to version update errors" -ForegroundColor Yellow
        $gitSuccess = $false
    }
    
    # Calculate execution time
    $endTime = Get-Date
    $executionTime = ($endTime - $startTime).TotalSeconds
    
    # Display final summary
    Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host "📊 FINAL SUMMARY" -ForegroundColor Cyan
    Write-Host "───────────────────────────────────────────────────" -ForegroundColor DarkGray
    
    if ($versionSuccess) {
        Write-Host "🚀 Updated to version: " -ForegroundColor Green -NoNewline
        Write-Host "v$newVersion ✨" -ForegroundColor Yellow
    }
    else {
        Write-Host "⚠️ Version update: " -ForegroundColor Yellow -NoNewline
        Write-Host "FAILED" -ForegroundColor Red
    }
    
    if ($gitSuccess) {
        Write-Host "📤 Git sync: " -ForegroundColor Green -NoNewline
        Write-Host "SUCCESS" -ForegroundColor Green
    }
    else {
        Write-Host "📤 Git sync: " -ForegroundColor Yellow -NoNewline
        if (!$versionSuccess) {
            Write-Host "SKIPPED" -ForegroundColor Yellow
        }
        else {
            Write-Host "FAILED" -ForegroundColor Red
        }
    }
    
    Write-Host "🕒 Total time: " -ForegroundColor Cyan -NoNewline
    Write-Host "$([math]::Round($executionTime, 2)) seconds" -ForegroundColor White
    Write-Host "───────────────────────────────────────────────────" -ForegroundColor DarkGray
    
    if ($versionSuccess -and $gitSuccess) {
        Write-Host "✅ SUCCESSFULLY UPDATED TO VERSION v$newVersion AND SYNCED WITH GIT ✅" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ COMPLETED WITH ERRORS OR WARNINGS ⚠️" -ForegroundColor Yellow
    }
    
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

<#

I'll combine these two scripts into a single PowerShell script that first increments the version numbers and then performs the Git sync operation. I'll also ensure the output shows the updated version number at the end with colors and emojis.
Combined Version Increment and Git Sync ScriptCode 
This combined script does the following:

Starts by setting up the environment and storing the initial directory location
Defines helper functions:

Run-GitCommand: Executes Git commands safely with error handling
Generate-CommitMessage: Creates detailed commit messages including version information
Increment-Version: Handles the version updating process
Sync-Git: Manages the Git operations (status, add, commit, pull, push)


Performs version incrementation:
Finds and updates version numbers in your JS files
Uses the same versioning logic from your original script
Shows progress and results with colored output


Performs Git sync operations:
Identifies changed files
Generates a commit message that includes the new version number
Handles the Git workflow (add, commit, pull, push)


Provides comprehensive output:
Shows a clear summary of both operations
At the end, shows a prominent "Updated to version v{version number}" message with colors and emojis
Includes execution time and success/failure status

The script makes these improvements:

Makes the repo path configurable
Includes the new version number in commit messages
Returns to the original directory after execution
Uses consistent formatting and colors throughout
Has better error handling throughout the process

...

old prompts:

for the file in this directory: ..\js\navbar.js
at the very top is a single line of code which says  var hmvVersionNo = 3.15;
every time this script is run, increment that by 0.01

...

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

...

# Simplified Version Increment Script
# This script increments version numbers across multiple project files

...

write me a python script that will commit changes write commit messages and sync changes

id like
Generate detailed commit messages based on file changes, Detailed messages listing types of changes and affected files
in my script

...

# Git Sync PowerShell Script
# This script automates adding, committing with detailed messages, and pushing Git changes

#>