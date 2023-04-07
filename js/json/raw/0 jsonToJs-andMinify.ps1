Set-Location -Path $PSScriptRoot

# https://learn.microsoft.com/en-us/powershell/module/Microsoft.PowerShell.Management/Set-Content?view=powershell-7.3
# https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/add-content?view=powershell-7.3

Set-Content ../allHadith.js -Value 'const allHadith_DB='
Get-Content allHadith.json | Add-Content ../allHadith.js
# minify below
uglifyjs ../allHadith.js -c -m -o ../allHadith.js

Set-Content ../aqidatuRaziyain.js -Value 'const aqidatuRaziyain_DB='
Get-Content aqidatuRaziyain.json | Add-Content ../aqidatuRaziyain.js
# minify below
uglifyjs ../aqidatuRaziyain.js -c -m -o ../aqidatuRaziyain.js

Set-Content ../barbahari.js -Value 'const barbahari_DB='
Get-Content barbahari.json | Add-Content ../barbahari.js
# minify below
uglifyjs ../barbahari.js -c -m -o ../barbahari.js

Set-Content ../bulugh.js -Value 'const bulugh_DB='
Get-Content bulugh.json | Add-Content ../bulugh.js
# minify below
uglifyjs ../bulugh.js -c -m -o ../bulugh.js

# dont write 'const bulughFull_DB=' here
Set-Content ../bulughFull.js -Value 'const bulugh_DB='
Get-Content bulughFull.json | Add-Content ../bulughFull.js
# minify below
uglifyjs ../bulughFull.js -c -m -o ../bulughFull.js

Set-Content ../eegaal.js -Value 'const eegaal_DB='
Get-Content eegaal.json | Add-Content ../eegaal.js
# minify below
uglifyjs ../eegaal.js -c -m -o ../eegaal.js

Set-Content ../fortyAajurry.js -Value 'const fortyAajurry_DB='
Get-Content fortyAajurry.json | Add-Content ../fortyAajurry.js
# minify below
uglifyjs ../fortyAajurry.js -c -m -o ../fortyAajurry.js

Set-Content ../fortyNawawi.js -Value 'const fortyNawawi_DB='
Get-Content fortyNawawi.json | Add-Content ../fortyNawawi.js
# minify below
uglifyjs ../fortyNawawi.js -c -m -o ../fortyNawawi.js

Set-Content ../muharrar.js -Value 'const muharrar_DB='
Get-Content muharrar.json | Add-Content ../muharrar.js
# minify below
uglifyjs ../muharrar.js -c -m -o ../muharrar.js

Set-Content ../muwatta.js -Value 'const muwatta_DB='
Get-Content muwatta.json | Add-Content ../muwatta.js
# minify below
uglifyjs ../muwatta.js -c -m -o ../muwatta.js

Set-Content ../nawaqidulislam.js -Value 'const nawaqidulislam_DB='
Get-Content nawaqidulislam.json | Add-Content ../nawaqidulislam.js
# minify below
uglifyjs ../nawaqidulislam.js -c -m -o ../nawaqidulislam.js

Set-Content ../qawaidulArbau.js -Value 'const qawaidulArbau_DB='
Get-Content qawaidulArbau.json | Add-Content ../qawaidulArbau.js
# minify below
uglifyjs ../qawaidulArbau.js -c -m -o ../qawaidulArbau.js

Set-Content ../quran.js -Value 'const quran_DB='
Get-Content quran.json | Add-Content ../quran.js
# minify below
uglifyjs ../quran.js -c -m -o ../quran.js

Set-Content ../quranBakurube.js -Value 'const quranBakurube_DB='
Get-Content quranBakurube.json | Add-Content ../quranBakurube.js
# minify below
uglifyjs ../quranBakurube.js -c -m -o ../quranBakurube.js

Set-Content ../quranJaufar.js -Value 'const quranJaufar_DB='
Get-Content quranJaufar.json | Add-Content ../quranJaufar.js
# minify below
uglifyjs ../quranJaufar.js -c -m -o ../quranJaufar.js

Set-Content ../radheef.js -Value 'const radheef_DB='
Get-Content radheef.json | Add-Content ../radheef.js
# minify below
uglifyjs ../radheef.js -c -m -o ../radheef.js

Set-Content ../riyadusaliheen.js -Value 'const riyadusaliheen_DB='
Get-Content riyadusaliheen.json | Add-Content ../riyadusaliheen.js
# minify below
uglifyjs ../riyadusaliheen.js -c -m -o ../riyadusaliheen.js

Set-Content ../umdah.js -Value 'const umdah_DB='
Get-Content umdah.json | Add-Content ../umdah.js
# minify below
uglifyjs ../umdah.js -c -m -o ../umdah.js

Set-Content ../ushrulAkheer.js -Value 'const ushrulAkheer_DB='
Get-Content ushrulAkheer.json | Add-Content ../ushrulAkheer.js
# minify below
uglifyjs ../usooluSunnah.js -c -m -o ../usooluSunnah.js

Set-Content ../usooluSunnah.js -Value 'const usooluSunnah_DB='
Get-Content usooluSunnah.json | Add-Content ../usooluSunnah.js
# minify below
uglifyjs ../usooluSunnah.js -c -m -o ../usooluSunnah.js

Set-Content ../usooluThalaatha.js -Value 'const usooluThalaatha_DB='
Get-Content usooluThalaatha.json | Add-Content ../usooluThalaatha.js
# minify below
uglifyjs ../usooluThalaatha.js -c -m -o ../usooluThalaatha.js




<# OLD
# removes first array
((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\json\raw\test.js" -Raw) -replace '(\[(?:\[??[^\[]*?\]))','') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\json\raw\rawtest.js"
# cleans up spaces and comma
((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\json\raw\rawtest.js" -Raw) -replace '\[\s\s+,','[') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\json\raw\rawtest.js"
#>