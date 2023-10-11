Set-Location -Path $PSScriptRoot

# https://learn.microsoft.com/en-us/powershell/module/Microsoft.PowerShell.Management/Set-Content?view=powershell-7.3
# https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/add-content?view=powershell-7.3

Set-Content ../allAthar.js -Value 'const allAthar_DB='
Get-Content allAthar.json | Add-Content ../allAthar.js
# minify below
uglifyjs ../allAthar.js -c -m -o ../allAthar.js

Set-Content ../aqidatuRaziyain.js -Value 'const aqidatuRaziyain_DB='
Get-Content aqidatuRaziyain.json | Add-Content ../aqidatuRaziyain.js
uglifyjs ../aqidatuRaziyain.js -c -m -o ../aqidatuRaziyain.js

Set-Content ../aqidahNawawi.js -Value 'const aqidahNawawi_DB='
Get-Content aqidahNawawi.json | Add-Content ../aqidahNawawi.js
uglifyjs ../aqidahNawawi.js -c -m -o ../aqidahNawawi.js

Set-Content ../barbahari.js -Value 'const barbahari_DB='
Get-Content barbahari.json | Add-Content ../barbahari.js
uglifyjs ../barbahari.js -c -m -o ../barbahari.js

Set-Content ../bulugh.js -Value 'const bulugh_DB='
Get-Content bulugh.json | Add-Content ../bulugh.js
uglifyjs ../bulugh.js -c -m -o ../bulugh.js

# dont write 'const bulughFull_DB=' here
Set-Content ../bulughFull.js -Value 'const bulugh_DB='
Get-Content bulughFull.json | Add-Content ../bulughFull.js
uglifyjs ../bulughFull.js -c -m -o ../bulughFull.js

Set-Content ../eegaal.js -Value 'const eegaal_DB='
Get-Content eegaal.json | Add-Content ../eegaal.js
uglifyjs ../eegaal.js -c -m -o ../eegaal.js

Set-Content ../fortyAajurry.js -Value 'const fortyAajurry_DB='
Get-Content fortyAajurry.json | Add-Content ../fortyAajurry.js
uglifyjs ../fortyAajurry.js -c -m -o ../fortyAajurry.js

Set-Content ../fortyNawawi.js -Value 'const fortyNawawi_DB='
Get-Content fortyNawawi.json | Add-Content ../fortyNawawi.js
uglifyjs ../fortyNawawi.js -c -m -o ../fortyNawawi.js

Set-Content ../hisnulMuslim.js -Value 'const hisnulMuslim_DB='
Get-Content hisnulMuslim.json | Add-Content ../hisnulMuslim.js
uglifyjs ../hisnulMuslim.js -c -m -o ../hisnulMuslim.js

Set-Content ../muwatta.js -Value 'const muwatta_DB='
Get-Content muwatta.json | Add-Content ../muwatta.js
uglifyjs ../muwatta.js -c -m -o ../muwatta.js

Set-Content ../nawaqidulislam.js -Value 'const nawaqidulislam_DB='
Get-Content nawaqidulislam.json | Add-Content ../nawaqidulislam.js
uglifyjs ../nawaqidulislam.js -c -m -o ../nawaqidulislam.js

Set-Content ../qawaidulArbau.js -Value 'const qawaidulArbau_DB='
Get-Content qawaidulArbau.json | Add-Content ../qawaidulArbau.js
uglifyjs ../qawaidulArbau.js -c -m -o ../qawaidulArbau.js

Set-Content ../quranBakurube.js -Value 'const quran_DB='
Get-Content quranBakurube.json | Add-Content ../quranBakurube.js
uglifyjs ../quranBakurube.js -c -m -o ../quranBakurube.js

Set-Content ../quranHmv.js -Value 'const quran_DB='
Get-Content quranHmv.json | Add-Content ../quranHmv.js
uglifyjs ../quranHmv.js -c -m -o ../quranHmv.js

Set-Content ../quranJaufar.js -Value 'const quran_DB='
Get-Content quranJaufar.json | Add-Content ../quranJaufar.js
uglifyjs ../quranJaufar.js -c -m -o ../quranJaufar.js

Set-Content ../quranSoabuni.js -Value 'const quran_DB='
Get-Content quranSoabuni.json | Add-Content ../quranSoabuni.js
uglifyjs ../quranSoabuni.js -c -m -o ../quranSoabuni.js

Set-Content ../radheef.js -Value 'const radheef_DB='
Get-Content radheef.json | Add-Content ../radheef.js
uglifyjs ../radheef.js -c -m -o ../radheef.js

Set-Content ../riyadusaliheen.js -Value 'const riyadusaliheen_DB='
Get-Content riyadusaliheen.json | Add-Content ../riyadusaliheen.js
uglifyjs ../riyadusaliheen.js -c -m -o ../riyadusaliheen.js

Set-Content ../umdah.js -Value 'const umdah_DB='
Get-Content umdah.json | Add-Content ../umdah.js
uglifyjs ../umdah.js -c -m -o ../umdah.js

Set-Content ../ushrulAkheer.js -Value 'const ushrulAkheer_DB='
Get-Content ushrulAkheer.json | Add-Content ../ushrulAkheer.js
uglifyjs ../ushrulAkheer.js -c -m -o ../ushrulAkheer.js

Set-Content ../usooluSunnah.js -Value 'const usooluSunnah_DB='
Get-Content usooluSunnah.json | Add-Content ../usooluSunnah.js
uglifyjs ../usooluSunnah.js -c -m -o ../usooluSunnah.js

Set-Content ../usooluThalaatha.js -Value 'const usooluThalaatha_DB='
Get-Content usooluThalaatha.json | Add-Content ../usooluThalaatha.js
uglifyjs ../usooluThalaatha.js -c -m -o ../usooluThalaatha.js




<# OLD
# removes first array
((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\json\raw\test.js" -Raw) -replace '(\[(?:\[??[^\[]*?\]))','') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\json\raw\rawtest.js"
# cleans up spaces and comma
((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\json\raw\rawtest.js" -Raw) -replace '\[\s\s+,','[') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\json\raw\rawtest.js"
#>