Set-Location -Path C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc

# minifies
html-minifier --input-dir C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc --output-dir C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\books --file-ext html --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype

# copies nawawi over to layout index
Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\books\index.html -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\_layouts\index.html



# copies site minified book files to asset book files one by one
Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\books\barbahari.html -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\app\webview-master\app\src\main\assets\books\barbahari.html

Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\books\eegaal.html -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\app\webview-master\app\src\main\assets\books\eegaal.html

Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\books\index.html -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\app\webview-master\app\src\main\assets\books\index.html

Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\books\otherHadith.html -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\app\webview-master\app\src\main\assets\books\otherHadith.html

Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\books\quran.html -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\app\webview-master\app\src\main\assets\books\quran.html

Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\books\radheef.html -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\app\webview-master\app\src\main\assets\books\radheef.html

Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\books\sahihain.html -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\app\webview-master\app\src\main\assets\books\sahihain.html

Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\books\umdah.html -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\app\webview-master\app\src\main\assets\books\umdah.html

Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\books\allHadith.html -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\app\webview-master\app\src\main\assets\books\allHadith.html


# copies minified asset book folder contents to win book folder
Copy-Item -Path C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\app\webview-master\app\src\main\assets\books\* -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\books

# copies index from win book to win root
Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\books\index.html -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\index.html