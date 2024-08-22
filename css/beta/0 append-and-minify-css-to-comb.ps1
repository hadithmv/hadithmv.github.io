# Set the working directory to the script's location
Set-Location -Path $PSScriptRoot

# Clear the content of ALL-COMB.min.css
Clear-Content -Path "ALL-COMB.min.css"
Write-Output "Cleared content of ALL-COMB.min.css"

# Copy content from COMB-DT-CSS.min.css to ALL-COMB.min.css
Get-Content -Path "COMB-DT-CSS.min.css" | Set-Content -Path "ALL-COMB.min.css"
Write-Output "Copied content from COMB-DT-CSS.min.css to ALL-COMB.min.css"

# Minify dt-inline.css using csso and append to ALL-COMB.min.css
csso "dt-inline.css" -o "dt-inline.min.css"
Add-Content -Path "ALL-COMB.min.css" -Value "`n/* dt-inline.css */" # `n
Get-Content -Path "dt-inline.min.css" | Add-Content -Path "ALL-COMB.min.css"
Remove-Item -Path "dt-inline.min.css"
Write-Output "Minified dt-inline.css and appended to ALL-COMB.min.css"

# Minify navbar.css using csso and append to ALL-COMB.min.css
csso "navbar.css" -o "navbar.min.css"
Add-Content -Path "ALL-COMB.min.css" -Value "`n/* navbar.css */" # `n
Get-Content -Path "navbar.min.css" | Add-Content -Path "ALL-COMB.min.css"
Remove-Item -Path "navbar.min.css"
Write-Output "Minified navbar.css and appended to ALL-COMB.min.css"

Write-Output "All tasks completed successfully"