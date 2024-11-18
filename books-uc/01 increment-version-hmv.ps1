<#
write a powershell script:

for the file in this directory: ..\css\COMB-nonCrit.min.css

at the very top is a single line of code which says  .versionNo::after{content:"3.15"}

every time this script is run, i want to increment that by 0.01
#>

Set-Location -Path $PSScriptRoot

$filePath = "..\css\COMB-nonCrit.css"

# Read the content of the file
$content = Get-Content $filePath -Raw

# Extract the current version number
if ($content -match '\.versionNo::after\{content:"(\d+\.\d+)"\}') {
    $currentVersion = [double]$matches[1]
    
    # Increment the version by 0.01
    $newVersion = [math]::Round($currentVersion + 0.01, 2)
    
    # Replace the old version with the new one
    $newContent = $content -replace '\.versionNo::after\{content:"\d+\.\d+"\}', ".versionNo::after{content:`"$newVersion`"}"
    
    # Write the updated content back to the file
    $newContent | Set-Content $filePath -NoNewline
    
    Write-Output "Version updated from $currentVersion to $newVersion"
} else {
    Write-Output "Version number not found in the expected format."
}

Write-Output "✅ -- ✅ -- DONE -- ✅ -- ✅"