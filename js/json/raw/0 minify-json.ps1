Set-Location -Path $PSScriptRoot

#minify the spaces

uglifyjs allHadith.json -c -m -o allHadith.json
uglifyjs barbahari.json -c -m -o barbahari.json
uglifyjs bulugh.json -c -m -o bulugh.json
uglifyjs bulugh-full.json -c -m -o bulugh-full.json
uglifyjs eegaal.json -c -m -o eegaal.json
uglifyjs hisnulMuslim.json -c -m -o hisnulMuslim.json
uglifyjs muwatta.json -c -m -o muwatta.json
uglifyjs nawaqidulislam.json -c -m -o nawaqidulislam.json
uglifyjs fortyNawawi.json -c -m -o fortyNawawi.json
uglifyjs qawaidulArbau.json -c -m -o qawaidulArbau.json
uglifyjs quran.json -c -m -o quran.json
uglifyjs quranBakurube.json -c -m -o quranBakurube.json
uglifyjs radheef.json -c -m -o radheef.json
uglifyjs aqidatuRaziyain.json -c -m -o aqidatuRaziyain.json
uglifyjs umdah.json -c -m -o umdah.json
uglifyjs usooluSunnah.json -c -m -o usooluSunnah.json
uglifyjs usooluThalaatha.json -c -m -o usooluThalaatha.json
