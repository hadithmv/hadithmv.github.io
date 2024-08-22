# Set the working directory to the script's location
Set-Location -Path $PSScriptRoot

# Clear the content of ALL-COMB.min.css
Clear-Content -Path "ALL-COMB.min.css"
Write-Output "Cleared content of ALL-COMB.min.css"

# Copy content from comb-DT.min.css to ALL-COMB.min.css
Get-Content -Path "comb-DT.min.css" | Set-Content -Path "ALL-COMB.min.css"
Write-Output "Copied into ALL-COMB.min.css: comb-DT.min.css"

# Minify DT-inline.css using csso and append to ALL-COMB.min.css
csso "DT-inline.css" -o "DT-inline.min.css"
Add-Content -Path "ALL-COMB.min.css" -Value "`n/* DT-inline.css */" # `n
Get-Content -Path "DT-inline.min.css" | Add-Content -Path "ALL-COMB.min.css"
Remove-Item -Path "DT-inline.min.css"
Write-Output "Minified and appended to ALL-COMB.min.css: dt-inline.css"

# Minify navbar.css using csso and append to ALL-COMB.min.css
csso "navbar.css" -o "navbar.min.css"
Add-Content -Path "ALL-COMB.min.css" -Value "`n/* navbar.css */" # `n
Get-Content -Path "navbar.min.css" | Add-Content -Path "ALL-COMB.min.css"
Remove-Item -Path "navbar.min.css"
Write-Output "Minified and appended to ALL-COMB.min.css: navbar.css"

# Minify navbar.css using csso and append to ALL-COMB.min.css
csso "nested-dropdown-button.css" -o "nested-dropdown-button.min.css"
Add-Content -Path "ALL-COMB.min.css" -Value "`n/* nested-dropdown-button.css */" # `n
Get-Content -Path "nested-dropdown-button.min.css" | Add-Content -Path "ALL-COMB.min.css"
Remove-Item -Path "nested-dropdown-button.min.css"
Write-Output "Minified and appended to ALL-COMB.min.css: nested-dropdown-button.css"

Write-Output "All tasks completed successfully"

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