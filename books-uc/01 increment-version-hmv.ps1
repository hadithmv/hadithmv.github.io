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
            $newVersion = $newVersion.ToString("F2")
            
            # Validate new version is greater than current version
            if ([double]$newVersion -le $currentVersion) {
                throw "New version ($newVersion) is not greater than current version ($currentVersion)"
            }

            # Update navbar.js
            $newContent = $content -replace 'var hmvVersionNo = \d+\.\d+;', "var hmvVersionNo = $newVersion;"
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
                Write-Output "✅ tauri.conf.json version updated to $newVersion"
            }
            else {
                Write-Warning "⚠️ tauri.conf.json not found at $tauriPath"
            }

            # Update build.gradle
            $gradlePath = "..\androidApp-kt\app\build.gradle"
            if (Test-Path $gradlePath) {
                $gradleContent = Get-Content $gradlePath -Raw
                
                # Extract and increment versionCode
                if ($gradleContent -match 'versionCode\s+(\d+)') {
                    $versionCode = [int]$matches[1]
                    $newVersionCode = $versionCode + 1
                    $gradleContent = $gradleContent -replace 'versionCode\s+\d+', "versionCode $newVersionCode"
                }

                # Update versionName (keeping the decimal point)
                $gradleContent = $gradleContent -replace 'versionName\s+"[^"]+"', "versionName `"$newVersion`""
                $gradleContent | Set-Content $gradlePath -NoNewline
                Write-Output "✅ build.gradle updated (versionName: $newVersion, versionCode: $newVersionCode)"
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