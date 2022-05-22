Set-Location -Path $PSScriptRoot

# dont delete the folders

# - - -
# COPY BOOKS
# - - -
# delete old folder in asset
# Remove-Item "../app/webview-master/app/src/main/assets/books" -Recurse -Force
# copies site minified book files to asset book files one by one
Copy-Item ../books/40nawawi.html -Destination ../app/webview-master/app/src/main/assets/books/40nawawi.html -Recurse -Force
Copy-Item ../books/allHadith.html -Destination ../app/webview-master/app/src/main/assets/books/allHadith.html -Recurse -Force
Copy-Item ../books/aqidatuRaziyain.html -Destination ../app/webview-master/app/src/main/assets/books/aqidatuRaziyain.html -Recurse -Force
Copy-Item ../books/barbahari.html -Destination ../app/webview-master/app/src/main/assets/books/barbahari.html -Recurse -Force
Copy-Item ../books/eegaal.html -Destination ../app/webview-master/app/src/main/assets/books/eegaal.html -Recurse -Force
Copy-Item ../books/hisnulMuslim.html -Destination ../app/webview-master/app/src/main/assets/books/hisnulMuslim.html -Recurse -Force
Copy-Item ../books/index.html -Destination ../app/webview-master/app/src/main/assets/books/index.html -Recurse -Force
Copy-Item ../books/nawaqidulislam.html -Destination ../app/webview-master/app/src/main/assets/books/nawaqidulislam.html -Recurse -Force
Copy-Item ../books/quran.html -Destination ../app/webview-master/app/src/main/assets/books/quran.html -Recurse -Force
Copy-Item ../books/quranBakurube.html -Destination ../app/webview-master/app/src/main/assets/books/quranBakurube.html -Recurse -Force
Copy-Item ../books/radheef.html -Destination ../app/webview-master/app/src/main/assets/books/radheef.html -Recurse -Force
Copy-Item ../books/umdah.html -Destination ../app/webview-master/app/src/main/assets/books/umdah.html -Recurse -Force
# copies minified asset book folder contents to win book folder
Copy-Item ../app/webview-master/app/src/main/assets/books/* -Destination hmv/books -Recurse -Force
# copies index from win book to win root
Copy-Item hmv/books/index.html -Destination hmv/index.html -Recurse -Force

# - - -
# COPY NOTES
# - - -
# delete old folder in asset
# Remove-Item "../app/webview-master/app/src/main/assets/notes" -Recurse -Force
Copy-Item ../notes/minimal-mod.min.css -Destination ../app/webview-master/app/src/main/assets/notes/minimal-mod.min.css -Recurse -Force
Copy-Item ../notes/third-party-libs-and-tools.txt -Destination ../app/webview-master/app/src/main/assets/notes/third-party-libs-and-tools.txt -Recurse -Force
Copy-Item ../LICENSE.txt -Destination ../app/webview-master/app/src/main/assets/LICENSE.txt -Recurse -Force
Copy-Item ../notes/how-to-use-hmv.txt -Destination ../app/webview-master/app/src/main/assets/notes/how-to-use-hmv.txt -Recurse -Force
Copy-Item ../notes/editor.css -Destination ../app/webview-master/app/src/main/assets/notes/editor.css -Recurse -Force
Copy-Item ../notes/editor.js -Destination ../app/webview-master/app/src/main/assets/notes/editor.js -Recurse -Force

# - - -
# COPY INFO
# - - -
Copy-Item ../notes/info/contributors.html -Destination ../app/webview-master/app/src/main/assets/notes/info/contributors.html -Recurse -Force
Copy-Item ../notes/info/FAQ.html -Destination ../app/webview-master/app/src/main/assets/notes/info/FAQ.html -Recurse -Force
Copy-Item ../notes/info/introFortyN.html -Destination ../app/webview-master/app/src/main/assets/notes/info/introFortyN.html -Recurse -Force
Copy-Item ../notes/info/introHmv.html -Destination ../app/webview-master/app/src/main/assets/notes/info/introHmv.html -Recurse -Force
Copy-Item ../notes/info/introUmdah.html -Destination ../app/webview-master/app/src/main/assets/notes/info/introUmdah.html -Recurse -Force
Copy-Item ../notes/info/khutba.html -Destination ../app/webview-master/app/src/main/assets/notes/info/khutba.html -Recurse -Force
Copy-Item ../notes/info/madina-info.html -Destination ../app/webview-master/app/src/main/assets/notes/info/madina-info.html -Recurse -Force
Copy-Item ../notes/info/mirror-backups.html -Destination ../app/webview-master/app/src/main/assets/notes/info/mirror-backups.html -Recurse -Force
Copy-Item ../notes/info/text-editor.html -Destination ../app/webview-master/app/src/main/assets/notes/info/text-editor.html -Recurse -Force
Copy-Item ../notes/info/umrah-travel.html -Destination ../app/webview-master/app/src/main/assets/notes/info/umrah-travel.html -Recurse -Force

# copies previous NOTES INCLUDING INFO folder contents to win notes folder
Copy-Item ../app/webview-master/app/src/main/assets/notes/* -Destination hmv/notes -Recurse -Force

# - - -
# COPY MINIFIED JS SCRIPTS
# - - -
# delete old folder in asset
# Remove-Item "../app/webview-master/app/src/main/assets/js" -Recurse -Force
Copy-Item ../js/allHadith-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/allHadith-script.min.js -Recurse -Force
Copy-Item ../js/barbahari-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/barbahari-script.min.js -Recurse -Force
Copy-Item ../js/eegaal-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/eegaal-script.min.js -Recurse -Force
Copy-Item ../js/hisnulMuslim-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/hisnulMuslim-script.min.js -Recurse -Force
Copy-Item ../js/nawaqid-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/nawaqid-script.min.js -Recurse -Force
Copy-Item ../js/nawawi-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/nawawi-script.min.js -Recurse -Force
Copy-Item ../js/quran-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/quran-script.min.js -Recurse -Force
Copy-Item ../js/quranBakurube-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/quranBakurube-script.min.js -Recurse -Force
Copy-Item ../js/radheef-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/radheef-script.min.js -Recurse -Force
Copy-Item ../js/raziyain-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/raziyain-script.min.js -Recurse -Force
Copy-Item ../js/umdah-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/umdah-script.min.js -Recurse -Force

# - - -
# COPY JS RESOURCE FILES
# - - -
Copy-Item ../js/resc/COMB-Crit.js -Destination ../app/webview-master/app/src/main/assets/js/resc/COMB-Crit.js -Recurse -Force
Copy-Item ../js/resc/COMB-nonCrit.js -Destination ../app/webview-master/app/src/main/assets/js/resc/COMB-nonCrit.js -Recurse -Force

# - - -
# COPY JSON
# - - -
Copy-Item ../js/json/allHadith.js -Destination ../app/webview-master/app/src/main/assets/js/json/allHadith.js -Recurse -Force
Copy-Item ../js/json/barbahari.js -Destination ../app/webview-master/app/src/main/assets/js/json/barbahari.js -Recurse -Force
Copy-Item ../js/json/eegaal.js -Destination ../app/webview-master/app/src/main/assets/js/json/eegaal.js -Recurse -Force
Copy-Item ../js/json/hisnulMuslim.js -Destination ../app/webview-master/app/src/main/assets/js/json/hisnulMuslim.js -Recurse -Force
Copy-Item ../js/json/nawaqid.js -Destination ../app/webview-master/app/src/main/assets/js/json/nawaqid.js -Recurse -Force
Copy-Item ../js/json/nawawi.js -Destination ../app/webview-master/app/src/main/assets/js/json/nawawi.js -Recurse -Force
Copy-Item ../js/json/quran.js -Destination ../app/webview-master/app/src/main/assets/js/json/quran.js -Recurse -Force
Copy-Item ../js/json/quranBakurube.js -Destination ../app/webview-master/app/src/main/assets/js/json/quranBakurube.js -Recurse -Force

Copy-Item ../js/json/radheef.js -Destination ../app/webview-master/app/src/main/assets/js/json/radheef.js -Recurse -Force
Copy-Item ../js/json/raziyain.js -Destination ../app/webview-master/app/src/main/assets/js/json/raziyain.js -Recurse -Force
Copy-Item ../js/json/umdah.js -Destination ../app/webview-master/app/src/main/assets/js/json/umdah.js -Recurse -Force

# copies previous JS AND JSON AND RESC folder contents to win js folder
Copy-Item ../app/webview-master/app/src/main/assets/js/* -Destination hmv/js -Recurse -Force

# - - -
# COPY MINIFIED CSS
# - - -
# delete old folder in asset
# Remove-Item "../app/webview-master/app/src/main/assets/css" -Recurse -Force
Copy-Item ../css/COMB-nonCrit.min.css -Destination ../app/webview-master/app/src/main/assets/css/COMB-nonCrit.min.css -Recurse -Force
# copies previous css folder contents to win css folder
Copy-Item ../app/webview-master/app/src/main/assets/css/* -Destination hmv/css -Recurse -Force

#
# WIN COMPILE
#

# # delete old 7z archive because that way new one is smaller
# Remove-Item "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\hadithmv_Win64.7z"

# # compile
# C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\compile.bat

# # 7za  -tzip <archive-name> <folder-name>
# # level of compression = 9 (Ultra)
# C:\Users\ashraaf\Downloads\7z2106-extra\x64\7za.exe a -mx=9 "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\hadithmv_Win64.7z" "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\hadithmv_Win64.exe"

# # delete exe to avoid binary file warning from github
# Remove-Item "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\hadithmv_Win64.exe"
