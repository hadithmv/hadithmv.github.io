Set-Location -Path $PSScriptRoot

#minify the spaces

uglifyjs allHadith.js -c -m -o allHadith.js
uglifyjs barbahari.js -c -m -o barbahari.js
uglifyjs bulugh.js -c -m -o bulugh.js
uglifyjs bulugh-full.js -c -m -o bulugh-full.js
uglifyjs eegaal.js -c -m -o eegaal.js
uglifyjs hisnulMuslim.js -c -m -o hisnulMuslim.js
uglifyjs muwatta.js -c -m -o muwatta.js
uglifyjs nawaqid.js -c -m -o nawaqid.js
uglifyjs fortyNawawi.js -c -m -o fortyNawawi.js
uglifyjs qawaid.js -c -m -o qawaid.js
uglifyjs quran.js -c -m -o quran.js
uglifyjs quranBakurube.js -c -m -o quranBakurube.js
uglifyjs radheef.js -c -m -o radheef.js
uglifyjs aqidatuRaziyain.js -c -m -o aqidatuRaziyain.js
uglifyjs umdah.js -c -m -o umdah.js
uglifyjs usooluSunnah.js -c -m -o usooluSunnah.js
uglifyjs usooluThalaatha.js -c -m -o usooluThalaatha.js
