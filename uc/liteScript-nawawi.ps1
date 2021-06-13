# .*?       single line
# (.*?(\n))+.*?     multiple lines
((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\json\nawawi.js" -Raw) -replace 'const.*?=','') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"-Raw) -replace '\[\[','<br>[') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"-Raw) -replace '\[\[','<br>[') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"-Raw) -replace '\["#','<p>#') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"-Raw) -replace ',"','<p>') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"-Raw) -replace '"<p>','</p><p>') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"-Raw) -replace '",','<\p>') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"-Raw) -replace '"],','<br><hr>') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"-Raw) -replace '\\n\\n','<br><br>') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"-Raw) -replace '<br><br>','<br>') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"-Raw) -replace '\\n','') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"-Raw) -replace '"]]','') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"


(Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"-Raw) | Foreach {$_.Trim()} | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"


# <!--### INSERT REPLACED JSON TO HTML HERE ###-->
# <!--### INSERT REPLACED JSON TO HTML HERE ### - END-->

