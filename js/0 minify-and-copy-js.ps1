# minify

Set-Location -Path $PSScriptRoot #C:/Users/ashraaf/Downloads/VScode/hadithmv.github.io/js

google-closure-compiler --charset=UTF-8 --js=barbahari-script.js --js_output_file=barbahari-script.min.js

google-closure-compiler --charset=UTF-8 --js=nawawi-script.js --js_output_file=nawawi-script.min.js

google-closure-compiler --charset=UTF-8 --js=quran-script.js --js_output_file=quran-script.min.js

google-closure-compiler --charset=UTF-8 --js=radheef-script.js --js_output_file=radheef-script.min.js

google-closure-compiler --charset=UTF-8 --js=umdah-script.js --js_output_file=umdah-script.min.js

google-closure-compiler --charset=UTF-8 --js=radheef-script.js --js_output_file=radheef-script.min.js

google-closure-compiler --charset=UTF-8 --js=eegaal-script.js --js_output_file=eegaal-script.min.js

google-closure-compiler --charset=UTF-8 --js=bulugh-script.js --js_output_file=bulugh-script.min.js

google-closure-compiler --charset=UTF-8 --js=allHadith-script.js --js_output_file=allHadith-script.min.js



# copy minified files

Copy-Item barbahari-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/barbahari-script.min.js
Copy-Item barbahari-script.min.js -Destination ../win/hmv/js/barbahari-script.min.js

Copy-Item nawawi-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/nawawi-script.min.js
Copy-Item nawawi-script.min.js -Destination ../win/hmv/js/nawawi-script.min.js

Copy-Item quran-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/quran-script.min.js
Copy-Item quran-script.min.js -Destination ../win/hmv/js/quran-script.min.js

Copy-Item umdah-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/umdah-script.min.js
Copy-Item umdah-script.min.js -Destination ../win/hmv/js/umdah-script.min.js

Copy-Item radheef-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/radheef-script.min.js
Copy-Item radheef-script.min.js -Destination ../win/hmv/js/radheef-script.min.js

Copy-Item eegaal-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/eegaal-script.min.js
Copy-Item eegaal-script.min.js -Destination ../win/hmv/js/eegaal-script.min.js

Copy-Item allHadith-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/allHadith-script.min.js
Copy-Item allHadith-script.min.js -Destination ../win/hmv/js/allHadith-script.min.js