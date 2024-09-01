# Set the working directory to the script's location
Set-Location -Path $PSScriptRoot

# Function to minify and append files
function Minify-And-Append {
    param (
        [string]$sourceFile,
        [string]$targetFile
    )
    
    $minifiedFile = [System.IO.Path]::GetFileNameWithoutExtension($sourceFile) + ".min.css"
    
    csso $sourceFile -o $minifiedFile
    Add-Content -Path $targetFile -Value "`n/* $sourceFile */"
    Get-Content -Path $minifiedFile | Add-Content -Path $targetFile
    Remove-Item -Path $minifiedFile
    Write-Output "Minified and copied: $sourceFile"
}

# Clear the content of ALL-COMB.min.css
Clear-Content -Path "ALL-COMB.min.css"
Write-Output "Cleared ALL-COMB.min.css"

# Copy content from comb-DT.min.css to ALL-COMB.min.css
Get-Content -Path "comb-DT.min.css" | Set-Content -Path "ALL-COMB.min.css"
Write-Output "Copied: comb-DT.min.css"

# List of CSS files to minify and append
$cssFiles = @(
    "DT-inline.css",
    "navbar.css",
    "belowPage-bab-dropdown.css",
    "quran-dropdowns.css"
)

# Process each file
foreach ($file in $cssFiles) {
    Minify-And-Append -sourceFile $file -targetFile "ALL-COMB.min.css"
}

Write-Output "✅ -- ✅ -- DONE -- ✅ -- ✅"

<# claude:
write powershell script to

in this folder
Set-Location -Path $PSScriptRoot

there is are css files

one of them is called
ALL-COMB.min.css
clear the content of that file

then in the folder there is another file called
comb-DT.min.css
copy the content of this file, and place it into ALL-COMB.min.css

then there is another file called dt-inline.css
minify its content with csso:
csso [file] -o [file]

and place the content at the end of ALL-COMB.min.css, after a new line and a commented out line that says "dt-inline.css"

then in the folder there is another file called
navbar.css
minify its content with csso
and place the content at the end of ALL-COMB.min.css, after a new line and a commented out line that says "navbar.css"

print what you do
#>