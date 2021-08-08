Set-Location -Path $PSScriptRoot

#compress

uglifyjs nawawi.js -c -m -o nawawi.js
uglifyjs barbahari.js -c -m -o barbahari.js
uglifyjs eegaal.js -c -m -o eegaal.js
uglifyjs quran.js -c -m -o quran.js
uglifyjs radheef.js -c -m -o radheef.js
uglifyjs umdah.js -c -m -o umdah.js
uglifyjs bulugh.js -c -m -o bulugh.js
uglifyjs allHadith.js -c -m -o allHadith.js



# copy

Copy-Item barbahari.js -Destination ../../app/webview-master/app/src/main/assets/js/json/barbahari.js
Copy-Item barbahari.js -Destination ../../win/hmv/js/json/barbahari.js

Copy-Item nawawi.js -Destination ../../app/webview-master/app/src/main/assets/js/json/nawawi.js
Copy-Item nawawi.js -Destination ../../win/hmv/js/json/nawawi.js

Copy-Item quran.js -Destination ../../app/webview-master/app/src/main/assets/js/json/quran.js
Copy-Item quran.js -Destination ../../win/hmv/js/json/quran.js

Copy-Item umdah.js -Destination ../../app/webview-master/app/src/main/assets/js/json/umdah.js
Copy-Item umdah.js -Destination ../../win/hmv/js/json/umdah.js

Copy-Item radheef.js -Destination ../../app/webview-master/app/src/main/assets/js/json/radheef.js
Copy-Item radheef.js -Destination ../../win/hmv/js/json/radheef.js

Copy-Item eegaal.js -Destination ../../app/webview-master/app/src/main/assets/js/json/eegaal.js
Copy-Item eegaal.js -Destination ../../win/hmv/js/json/eegaal.js

Copy-Item allHadith.js -Destination ../../app/webview-master/app/src/main/assets/js/json/allHadith.js
Copy-Item allHadith.js -Destination ../../win/hmv/js/json/allHadith.js

Copy-Item hisnulMuslim.js -Destination ../../app/webview-master/app/src/main/assets/js/json/hisnulMuslim.js
Copy-Item hisnulMuslim.js -Destination ../../win/hmv/js/json/hisnulMuslim.js