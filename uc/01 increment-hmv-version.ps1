<#
write powershell script:

the file in this directory:
C:\Users\ashra\Downloads\VScode\hadithmv.github.io\css\COMB-nonCrit.min.css

has a line of code the top when opened, which says

.versionNo::after{content:"3.15"}

every time this script is run, i want to increment that by 0.01

#>

# Define the path to the CSS file
$filePath = "..\css\COMB-nonCrit.min.css"

# Read the contents of the file
$fileContent = Get-Content -Path $filePath

# Define the regex pattern to find the version number
$pattern = '(?<=\.versionNo::after{content:").*?(?="})'

# Extract the current version number
$currentVersion = [regex]::Match($fileContent, $pattern).Value

if ($currentVersion) {
    # Convert the current version to a float and increment by 0.01
    $newVersion = [math]::Round([float]$currentVersion + 0.01, 2)
    $newVersionString = "{0:F2}" -f $newVersion

    # Replace the current version number with the new version number in the file content
    $updatedContent = [regex]::Replace($fileContent, $pattern, $newVersionString)

    # Write the updated content back to the file
    Set-Content -Path $filePath -Value $updatedContent

    Write-Output "Version number updated from $currentVersion to $newVersionString"
} else {
    Write-Output "Version number pattern not found in the file."
}
