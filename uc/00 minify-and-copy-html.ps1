Set-Location -Path $PSScriptRoot #C:/Users/ashraaf/Downloads/VScode/hadithmv.github.io/uc

# minifies
html-minifier --input-dir $PSScriptRoot --output-dir ../books --file-ext html --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype

# copies nawawi over to layout index
Copy-Item ../books/index.html -Destination ../_layouts/index.html



# copies site minified book files to asset book files one by one
Copy-Item ../books/40nawawi.html -Destination ../app/webview-master/app/src/main/assets/books/40nawawi.html

Copy-Item ../books/barbahari.html -Destination ../app/webview-master/app/src/main/assets/books/barbahari.html

Copy-Item ../books/eegaal.html -Destination ../app/webview-master/app/src/main/assets/books/eegaal.html

Copy-Item ../books/index.html -Destination ../app/webview-master/app/src/main/assets/books/index.html

Copy-Item ../books/quran.html -Destination ../app/webview-master/app/src/main/assets/books/quran.html

Copy-Item ../books/radheef.html -Destination ../app/webview-master/app/src/main/assets/books/radheef.html

Copy-Item ../books/umdah.html -Destination ../app/webview-master/app/src/main/assets/books/umdah.html

Copy-Item ../books/allHadith.html -Destination ../app/webview-master/app/src/main/assets/books/allHadith.html

Copy-Item ../books/allHadith.html -Destination ../app/webview-master/app/src/main/assets/books/hisnulMuslim.html

# copies minified asset book folder contents to win book folder
Copy-Item -Path ../app/webview-master/app/src/main/assets/books/* -Destination ../win/hmv/books

# copies index from win book to win root
Copy-Item ../win/hmv/books/index.html -Destination ../win/hmv/index.html