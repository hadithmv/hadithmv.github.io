# removes first array

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\json\eegaal.js" -Raw) -replace 'const eegaal_dataSet=','') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\eegaal-Lite.html"

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\eegaal-Lite.html"-Raw) -replace '\[\[','<br>\[') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\eegaal-Lite.html" -force

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\eegaal-Lite.html"-Raw) -replace '"  \] \]','</p><br><br>') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\eegaal-Lite.html" -force

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\eegaal-Lite.html"-Raw) -replace '\["','<p>') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\eegaal-Lite.html" -force

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\eegaal-Lite.html"-Raw) -replace '","','</p><p>') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\eegaal-Lite.html" -force

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\eegaal-Lite.html"-Raw) -replace '"  \],','</p>') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\eegaal-Lite.html" -force

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\eegaal-Lite.html"-Raw) -replace '</p><p>','<hr><p>') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\eegaal-Lite.html" -force

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\eegaal-Lite.html"-Raw) -replace '\n','') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\eegaal-Lite.html" -force

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\eegaal-Lite.html"-Raw) -replace '<p>#','<p class="B">#') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\eegaal-Lite.html" -force

((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\eegaal-Lite.html"-Raw) -replace '<br><br>','<br>') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\eegaal-Lite.html" -force
