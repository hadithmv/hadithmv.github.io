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

    # Extract the current version number (now handling quoted semver format)
    if ($content -match 'var hmvVersionNo = "(\d+\.\d+\.\d+)";') {
        $currentVersion = $matches[1]
        
        try {
            # Parse semver components
            $versionParts = $currentVersion.Split('.')
            $major = [int]$versionParts[0]
            $minor = [int]$versionParts[1]
            $patch = [int]$versionParts[2]

            # Increment the patch version
            $patch += 1
            $newVersion = "$major.$minor.$patch"
            
            # Update navbar.js with semver format (including quotes)
            $newContent = $content -replace 'var hmvVersionNo = "\d+\.\d+\.\d+";', "var hmvVersionNo = `"$newVersion`";"
            if ($newContent -eq $content) {
                throw "Version replacement failed in navbar.js"
            }
            
            $newContent | Set-Content $filePath -NoNewline -ErrorAction Stop
            Write-Output "✅ navbar.js updated from $currentVersion to $newVersion"

            # Update tauri.conf.json
            $tauriPath = "..\windowsApp-tauri\Hadithmv\src-tauri\tauri.conf.json"
            if (Test-Path $tauriPath) {
                $tauriContent = Get-Content $tauriPath -Raw
                $newTauriContent = $tauriContent -replace '"version": "\d+\.\d+\.\d+"', "`"version`": `"$newVersion`""
                $newTauriContent | Set-Content $tauriPath -NoNewline
                Write-Output "✅ tauri.conf.json version updated to version: $newVersion"
            }
            else {
                Write-Warning "⚠️ tauri.conf.json not found at $tauriPath"
            }

            # Update build.gradle
            $gradlePath = "..\androidApp-kt\app\build.gradle"
            if (Test-Path $gradlePath) {
                $gradleContent = Get-Content $gradlePath -Raw
                
                # Update versionName with semver
                $gradleContent = $gradleContent -replace 'versionName\s+"[^"]+"', "versionName `"$newVersion`""
                $gradleContent | Set-Content $gradlePath -NoNewline
                Write-Output "✅ build.gradle updated to versionName: $newVersion"
            }
            else {
                Write-Warning "⚠️ build.gradle not found at $gradlePath"
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