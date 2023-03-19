# (..) represents the parent directory of your current location.

Set-Location -Path ..

#minify the spaces
uglifyjs allHadith.js -c -m -o allHadith.js
uglifyjs barbahari.js -c -m -o barbahari.js
uglifyjs bulugh.js -c -m -o bulugh.js
uglifyjs bulughFull.js -c -m -o bulughFull.js
uglifyjs eegaal.js -c -m -o eegaal.js
uglifyjs hisnulMuslim.js -c -m -o hisnulMuslim.js
uglifyjs muwatta.js -c -m -o muwatta.js
uglifyjs nawaqidulislam.js -c -m -o nawaqidulislam.js
uglifyjs fortyNawawi.js -c -m -o fortyNawawi.js
uglifyjs qawaidulArbau.js -c -m -o qawaidulArbau.js
uglifyjs quran.js -c -m -o quran.js
uglifyjs quranBakurube.js -c -m -o quranBakurube.js
uglifyjs quranJaufar.js -c -m -o quranJaufar.js
uglifyjs radheef.js -c -m -o radheef.js
uglifyjs aqidatuRaziyain.js -c -m -o aqidatuRaziyain.js
uglifyjs riyadusaliheen.js -c -m -o riyadusaliheen.js
uglifyjs umdah.js -c -m -o umdah.js
uglifyjs usooluSunnah.js -c -m -o usooluSunnah.js
uglifyjs usooluThalaatha.js -c -m -o usooluThalaatha.js


<# tried the way below but didnt work, and powershell's ConvertTo-Json -Compress is too slow
# https://shellgeek.com/powershell-replace-string-in-multiple-files
# https://vexx32.github.io/2019/03/20/PowerShell-Replace-Operator/
# https://stackoverflow.com/questions/3403217/how-to-replace-multiple-strings-in-a-file-using-powershell
# https://stackoverflow.com/questions/60540956/minify-js-with-regex

Set-Location -Path $PSScriptRoot

## $filePath = "D:\ps\Config\*.config"
# Get the files from the folder and iterate using Foreach
Get-ChildItem *.json -Recurse | ForEach-Object {
# Read the file and use replace()
(Get-Content $_) -replace '\r\n|\n|\r','' ` -replace '\s+"','"' | Set-Content $_
}
#>