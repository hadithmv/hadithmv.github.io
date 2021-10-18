#
# COPY BOOKS
#

# copies site minified book files to asset book files one by one
Copy-Item ../books/40nawawi.html -Destination ../app/webview-master/app/src/main/assets/books/40nawawi.html
Copy-Item ../books/barbahari.html -Destination ../app/webview-master/app/src/main/assets/books/barbahari.html
Copy-Item ../books/eegaal.html -Destination ../app/webview-master/app/src/main/assets/books/eegaal.html
Copy-Item ../books/index.html -Destination ../app/webview-master/app/src/main/assets/books/index.html
Copy-Item ../books/quran.html -Destination ../app/webview-master/app/src/main/assets/books/quran.html
Copy-Item ../books/radheef.html -Destination ../app/webview-master/app/src/main/assets/books/radheef.html
Copy-Item ../books/umdah.html -Destination ../app/webview-master/app/src/main/assets/books/umdah.html
Copy-Item ../books/allHadith.html -Destination ../app/webview-master/app/src/main/assets/books/allHadith.html
Copy-Item ../books/hisnulMuslim.html -Destination ../app/webview-master/app/src/main/assets/books/hisnulMuslim.html

# copies minified asset book folder contents to win book folder
Copy-Item ../app/webview-master/app/src/main/assets/books/* -Destination hmv/books

# copies index from win book to win root
Copy-Item hmv/books/index.html -Destination hmv/index.html

#
# COPY NOTES
#

Copy-Item ../notes/minimal-mod.min.css -Destination ../app/webview-master/app/src/main/assets/notes/minimal-mod.min.css
Copy-Item ../notes/third-party-libs-and-tools.txt -Destination ../app/webview-master/app/src/main/assets/notes/third-party-libs-and-tools.txt
Copy-Item ../LICENSE.txt -Destination ../app/webview-master/app/src/main/assets/LICENSE.txt
Copy-Item ../notes/how-to-use-hmv.txt -Destination ../app/webview-master/app/src/main/assets/notes/how-to-use-hmv.txt

Copy-Item ../notes/minimal-mod.min.css -Destination hmv/notes/minimal-mod.min.css
Copy-Item ../notes/third-party-libs-and-tools.txt -Destination hmv/notes/third-party-libs-and-tools.txt
Copy-Item ../LICENSE.txt -Destination hmv/LICENSE.txt
Copy-Item ../notes/how-to-use-hmv.txt -Destination hmv/notes/how-to-use-hmv.txt

#
# COPY INFO
#

Copy-Item ../notes/info/introHmv.html -Destination ../../app/webview-master/app/src/main/assets/notes/info/introHmv.html
Copy-Item ../notes/info/introFortyN.html -Destination ../../app/webview-master/app/src/main/assets/notes/info/introFortyN.html
Copy-Item ../notes/info/introUmdah.html -Destination ../../app/webview-master/app/src/main/assets/notes/info/introUmdah.html
Copy-Item ../notes/info/FAQ.html -Destination ../../app/webview-master/app/src/main/assets/notes/info/FAQ.html
Copy-Item ../notes/info/contributors.html -Destination ../../app/webview-master/app/src/main/assets/notes/info/contributors.html

Copy-Item ../notes/info/introHmv.html -Destination hmv/notes/info/introHmv.html
Copy-Item ../notes/info/introFortyN.html -Destination hmv/notes/info/introFortyN.html
Copy-Item ../notes/info/introUmdah.html -Destination hmv/notes/info/introUmdah.html
Copy-Item ../notes/info/FAQ.html -Destination hmv/notes/info/FAQ.html
Copy-Item ../notes/info/contributors.html -Destination hmv/notes/info/contributors.html


#
# COPY JSON
#

Copy-Item ../js/json/barbahari.js -Destination ../../app/webview-master/app/src/main/assets/js/json/barbahari.js
Copy-Item ../js/json/nawawi.js -Destination ../../app/webview-master/app/src/main/assets/js/json/nawawi.js
Copy-Item ../js/json/quran.js -Destination ../../app/webview-master/app/src/main/assets/js/json/quran.js
Copy-Item ../js/json/umdah.js -Destination ../../app/webview-master/app/src/main/assets/js/json/umdah.js
Copy-Item ../js/json/radheef.js -Destination ../../app/webview-master/app/src/main/assets/js/json/radheef.js
Copy-Item ../js/json/eegaal.js -Destination ../../app/webview-master/app/src/main/assets/js/json/eegaal.js
Copy-Item ../js/json/allHadith.js -Destination ../../app/webview-master/app/src/main/assets/js/json/allHadith.js
Copy-Item ../js/json/hisnulMuslim.js -Destination ../../app/webview-master/app/src/main/assets/js/json/hisnulMuslim.js

Copy-Item ../js/json/barbahari.js -Destination hmv/js/json/barbahari.js
Copy-Item ../js/json/nawawi.js -Destination hmv/js/json/nawawi.js
Copy-Item ../js/json/quran.js -Destination hmv/js/json/quran.js
Copy-Item ../js/json/umdah.js -Destination hmv/js/json/umdah.js
Copy-Item ../js/json/radheef.js -Destination hmv/js/json/radheef.js
Copy-Item ../js/json/eegaal.js -Destination hmv/js/json/eegaal.js
Copy-Item ../js/json/allHadith.js -Destination hmv/js/json/allHadith.js
Copy-Item ../js/json/hisnulMuslim.js -Destination hmv/js/json/hisnulMuslim.js

#
# COPY MINIFIED JS SCRIPTS
#

Copy-Item ../js/barbahari-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/barbahari-script.min.js
Copy-Item ../js/nawawi-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/nawawi-script.min.js
Copy-Item ../js/quran-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/quran-script.min.js
Copy-Item ../js/umdah-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/umdah-script.min.js
Copy-Item ../js/radheef-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/radheef-script.min.js
Copy-Item ../js/eegaal-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/eegaal-script.min.js
Copy-Item ../js/allHadith-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/allHadith-script.min.js
Copy-Item ../js/hisnulMuslim-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/hisnulMuslim-script.min.js

Copy-Item ../js/barbahari-script.min.js -Destination hmv/js/barbahari-script.min.js
Copy-Item ../js/nawawi-script.min.js -Destination hmv/js/nawawi-script.min.js
Copy-Item ../js/quran-script.min.js -Destination hmv/js/quran-script.min.js
Copy-Item ../js/umdah-script.min.js -Destination /hmv/js/umdah-script.min.js
Copy-Item ../js/radheef-script.min.js -Destination hmv/js/radheef-script.min.js
Copy-Item ../js/eegaal-script.min.js -Destination hmv/js/eegaal-script.min.js
Copy-Item ../js/allHadith-script.min.js -Destination hmv/js/allHadith-script.min.js
Copy-Item ../js/hisnulMuslim-script.min.js -Destination hmv/js/hisnulMuslim-script.min.js

#
# COPY MINIFIED CSS
#

Copy-Item ../css/COMB-nonCrit.min.css -Destination ../app/webview-master/app/src/main/assets/css/COMB-nonCrit.min.css

Copy-Item ../css/COMB-nonCrit.min.css -Destination hmv/css/COMB-nonCrit.min.css


#
# WIN COMPILE
#

# delete old 7z archive because that way new one is smaller
Remove-Item "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\hadithmv_Win64.7z"

# compile
C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\compile.bat

# 7za  -tzip <archive-name> <folder-name>
# level of compression = 9 (Ultra)
C:\Users\ashraaf\Downloads\7z1900-extra\x64\7za.exe a -mx=9 "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\hadithmv_Win64.7z" "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\hadithmv_Win64.exe"

# delete exe to avoid binary file warning from github
Remove-Item "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\hadithmv_Win64.exe"
