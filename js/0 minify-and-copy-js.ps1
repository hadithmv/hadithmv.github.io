# minify

Set-Location -Path C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js

google-closure-compiler --charset=UTF-8 --js=barbahari-script.js --js_output_file=barbahari-script.min.js

google-closure-compiler --charset=UTF-8 --js=nawawi-script.js --js_output_file=nawawi-script.min.js

google-closure-compiler --charset=UTF-8 --js=otherHadith-script.js --js_output_file=otherHadith-script.min.js

google-closure-compiler --charset=UTF-8 --js=quran-script.js --js_output_file=quran-script.min.js

google-closure-compiler --charset=UTF-8 --js=radheef-script.js --js_output_file=radheef-script.min.js

google-closure-compiler --charset=UTF-8 --js=sahihain-script.js --js_output_file=sahihain-script.js

google-closure-compiler --charset=UTF-8 --js=umdah-script.js --js_output_file=umdah-script.min.js

google-closure-compiler --charset=UTF-8 --js=radheef-script.js --js_output_file=radheef-script.min.js

google-closure-compiler --charset=UTF-8 --js=eegaal-script.js --js_output_file=eegaal-script.min.js

google-closure-compiler --charset=UTF-8 --js=bulugh-script.js --js_output_file=bulugh-script.min.js



# copy minified files

Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\barbahari-script.min.js -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\app\webview-master\app\src\main\assets\js\barbahari-script.min.js
Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\barbahari-script.min.js -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\js\barbahari-script.min.js

Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\nawawi-script.min.js -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\app\webview-master\app\src\main\assets\js\nawawi-script.min.js
Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\nawawi-script.min.js -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\js\nawawi-script.min.js

Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\otherHadith-script.min.js -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\app\webview-master\app\src\main\assets\js\otherHadith-script.min.js
Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\otherHadith-script.min.js -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\js\otherHadith-script.min.js

Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\quran-script.min.js -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\app\webview-master\app\src\main\assets\js\quran-script.min.js
Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\quran-script.min.js -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\js\quran-script.min.js

Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\sahihain-script.min.js -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\app\webview-master\app\src\main\assets\js\sahihain-script.min.js
Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\sahihain-script.min.js -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\js\sahihain-script.min.js

Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\umdah-script.min.js -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\app\webview-master\app\src\main\assets\js\umdah-script.min.js
Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\umdah-script.min.js -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\js\umdah-script.min.js

Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\radheef-script.min.js -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\app\webview-master\app\src\main\assets\js\radheef-script.min.js
Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\radheef-script.min.js -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\js\radheef-script.min.js

Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\eegaal-script.min.js -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\app\webview-master\app\src\main\assets\js\eegaal-script.min.js
Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\js\eegaal-script.min.js -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\js\eegaal-script.min.js