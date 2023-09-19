#Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\notes\scripts\default.yml -Destination C:\Users\ashraaf\AppData\Roaming\espanso\default.yml

Set-Location -Path $PSScriptRoot #C:/Users/ashraaf/Downloads/VScode/hadithmv.github.io/uc

# https://cannotdisplay.com/getting-the-path-of-appdata-using-powershell/
# $env:APPDATA = C:\Users\user\AppData\Roaming
Copy-Item base.yml -Destination $env:APPDATA\espanso\match