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
# WIN ONLY COMPILE
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
