# copy, rename strings and delete

Copy-Item "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\01 liteScript-nawawi.ps1" -Destination "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\01 liteScript-eegaal-intermediate.ps1"


((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\01 liteScript-eegaal-intermediate.ps1"-Raw) -replace 'nawawi','eegaal') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\01 liteScript-eegaal-intermediate.ps1"


Powershell.exe -File "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\01 liteScript-eegaal-intermediate.ps1"

# delete json to html mid file
    Remove-Item "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\01 liteScript-eegaal-intermediate.ps1"

