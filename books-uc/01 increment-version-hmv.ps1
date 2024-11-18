<#
powershell script:
for the file in this directory: ..\js\navbar.js
at the very top is a single line of code which says  var hmvVersionNo = 3.15;
every time this script is run, increment that by 0.01
#>

try {
    # Set working directory
    Set-Location -Path $PSScriptRoot -ErrorAction Stop
}
catch {
    Write-Error "Failed to set working directory: $_"
    exit 1
}

$filePath = "..\js\navbar.js"

try {
    # Check if file exists
    if (-not (Test-Path $filePath)) {
        throw "File not found: $filePath"
    }

    # Read the content of the file
    $content = Get-Content $filePath -Raw -ErrorAction Stop

    # Check if content is empty
    if ([string]::IsNullOrWhiteSpace($content)) {
        throw "File is empty"
    }

    # Extract the current version number
    if ($content -match 'var hmvVersionNo = (\d+\.\d+);') {
        $currentVersion = [double]$matches[1]
        
        try {
            # Increment the version by 0.01
            $newVersion = [math]::Round($currentVersion + 0.01, 2)
            
            # Format to ensure two decimal places
            $newVersion = $newVersion.ToString("F2")
            
            # Validate new version is greater than current version
            if ([double]$newVersion -le $currentVersion) {
                throw "New version ($newVersion) is not greater than current version ($currentVersion)"
            }
            
            # Replace the old version with the new one
            $newContent = $content -replace 'var hmvVersionNo = \d+\.\d+;', "var hmvVersionNo = $newVersion;"
            
            # Verify the replacement occurred
            if ($newContent -eq $content) {
                throw "Version replacement failed - content unchanged"
            }
            
            # Create backup of original file
            $backupPath = "$filePath.backup"
            Copy-Item -Path $filePath -Destination $backupPath -ErrorAction Stop
            
            try {
                # Write the updated content back to the file
                $newContent | Set-Content $filePath -NoNewline -ErrorAction Stop
                
                Write-Output "✅ Version updated from $currentVersion to $newVersion"
                
                # Remove backup if write was successful
                Remove-Item -Path $backupPath -ErrorAction SilentlyContinue
            }
            catch {
                # Restore from backup if write failed
                Copy-Item -Path $backupPath -Destination $filePath -Force -ErrorAction Stop
                throw "Failed to write new content, restored from backup: $_"
            }
        }
        catch {
            throw "Version update failed: $_"
        }
    } 
    else {
        throw "Version number not found in the expected format"
    }

    Write-Output "✅ -- ✅ -- DONE -- ✅ -- ✅"
}
catch {
    Write-Error "Script execution failed: $_"
    exit 1
}