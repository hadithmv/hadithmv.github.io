# replace json bits with html tags

# .*?       single line
# (.*?(\n))+.*?     multiple lines
((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\json\nawawi.js" -Raw) -replace 'const.*?=','') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite--jsonToHtml.html"


((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite--jsonToHtml.html"-Raw) -replace '\[\["','<br><p>') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite--jsonToHtml.html"

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite--jsonToHtml.html"-Raw) -replace '","','</p><p>') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite--jsonToHtml.html"

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite--jsonToHtml.html"-Raw) -replace '"\],\["','</p><hr><p>') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite--jsonToHtml.html"

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite--jsonToHtml.html"-Raw) -replace '\\n','') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite--jsonToHtml.html"

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite--jsonToHtml.html"-Raw) -replace '"\]\];|"\]\]','') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite--jsonToHtml.html"



# remove empty lines
(Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite--jsonToHtml.html"-Raw) | Foreach {$_.Trim()} | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite--jsonToHtml.html"


# <!--### INSERT REPLACED JSON TO HTML HERE ###-->
# <!--### INSERT REPLACED JSON TO HTML HERE ### - END-->


# delete current content between comments for later insertion
((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite.html" -Raw) -replace '<!--### INSERT REPLACED JSON TO HTML HERE ###-->(.*?(\n))+.*?<!--### INSERT REPLACED JSON TO HTML HERE ### - END-->','<!--### INSERT REPLACED JSON TO HTML HERE ###--><!--### INSERT REPLACED JSON TO HTML HERE ### - END-->') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite.html"


# insertion
$srcFile = "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite.html"  # source file that has the insert marker
$dstFile = "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite-inserted.html"  # destination file for combined input
$insFile = "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite--jsonToHtml.html"  # file that is to be inserted
 
# pattern to be found and inserted on
$pattern = [regex]'<!--### INSERT REPLACED JSON TO HTML HERE ###--><!--### INSERT REPLACED JSON TO HTML HERE ### - END-->'
$lineNum = (Select-String -Pattern $pattern -Path $srcFile).LineNumber
Write-Verbose "Inserting at line number:  $lineNum"
 
Get-Content -Path $srcFile | select -First ($lineNum - 1) |
    Set-Content -Path $dstFile -Force
Add-Content -Path $dstFile -Value '<!--### INSERT REPLACED JSON TO HTML HERE ###-->' # between this
Add-Content -Path $dstFile -Value (Get-Content -Path $insFile)
Add-Content -Path $dstFile -Value '<!--### INSERT REPLACED JSON TO HTML HERE ### - END-->' # ending with this
Get-Content -Path $srcFile | select -Skip $lineNum |
    Add-Content -Path $dstFile


# rename for existing files
    Move-Item -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite-inserted.html" -Destination "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite.html" -Force

# delete json to html mid file
    Remove-Item "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite--jsonToHtml.html"

