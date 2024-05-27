Set-Location -Path $PSScriptRoot

# List of directories to be emptied before copying files
$directoriesToEmpty = @("../app/webview-master/app/src/main/assets/books",
                        "../app/webview-master/app/src/main/assets/notes",
                        "../app/webview-master/app/src/main/assets/font",
                        "../app/webview-master/app/src/main/assets/img",
                        "../app/webview-master/app/src/main/assets/js/resc",
                        "../app/webview-master/app/src/main/assets/js/json",
                        "hmv/books",
                        "hmv/notes",
                        "hmv/font",
                        "hmv/img",
                        "hmv/resc",
                        "hmv/json")

# Empty the destination folders
foreach ($directory in $directoriesToEmpty) {
    Get-ChildItem -Path $directory -Recurse | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}

# Function to copy files from a source directory to a destination directory
function Copy-Files ($sourceDir, $destinationDir) {
    Copy-Item -Path "$sourceDir\*" -Destination $destinationDir -Recurse -Force
}

# Copy all files from books directory
Copy-Files "../books" "../app/webview-master/app/src/main/assets/books"
# copies minified asset book folder contents to WIN book folder
Copy-Files "../app/webview-master/app/src/main/assets/books" "hmv/books"
# copies index from WIN book to WIN root
Copy-Item "hmv/books/index.html" -Destination "hmv/index.html" -Recurse -Force

# Copy specific notes files
Copy-Files "../notes" "../app/webview-master/app/src/main/assets/notes"
Copy-Item "../LICENSE.txt" -Destination "../app/webview-master/app/src/main/assets/notes/LICENSE.txt" -Recurse -Force

# Copy notes info files
$infoFiles = @("contributors.html", "FAQ.html", "helpTranslate.html", "introFortyN.html",
               "introHmv.html", "introUmdah.html", "khutba.html", "lafzuVakikohLiyumugeQawaid.html",
               "madina-info.html", "mirror-backups.html", "nawawiSiyar.html","NukuthaajehiAkuruthahBeynunkuraaneHama.html", "other-links.html",
               "privacy.html", "text-editor.html", "umrah-travel.html", "contact.html")

foreach ($file in $infoFiles) {
    Copy-Item "../notes/info/$file" -Destination "../app/webview-master/app/src/main/assets/notes/info/$file" -Recurse -Force
}
Copy-Item "../notes/info/mirror-backups.html" -Destination "../404.html" -Recurse -Force
Copy-Files "../app/webview-master/app/src/main/assets/notes" "hmv/notes"

# Copy fonts
Copy-Files "../font" "../app/webview-master/app/src/main/assets/font"
Copy-Files "../app/webview-master/app/src/main/assets/font" "hmv/font"

# Copy images
Copy-Files "../img/logo" "../app/webview-master/app/src/main/assets/img/logo"
Copy-Files "../app/webview-master/app/src/main/assets/img" "hmv/img"

# Copy JS scripts
$jsFiles = @("akhbaruShuyukh-script.min.js", "allAqida-script.min.js", "allAthar-script.min.js", "aqidahNawawi-script.min.js",
             "barbahari-script.min.js", "barbahariDFK-script.min.js", "bulugh-script.min.js", "hisnulMuslim-script.min.js",
             "kitabulEman-script.min.js", "kunnaasha-script.min.js", "muwatta-script.min.js", "radheefNanfoiy-script.min.js",
             "nawaqidulislam-script.min.js", "qawaidulArbau-script.min.js", "fortyNawawi-script.min.js", "fortyAajurry-script.min.js",
             "quranBakurube-script.min.js", "quranBetaqat-script.min.js", "quranHmv-script.min.js", "quranJaufar-script.min.js",
             "quranMukhtasar-script.min.js", "quranMuyassar-script.min.js", "quranQiraaath-script.min.js", "quranRasmee-script.min.js",
             "quranSadi-script.min.js", "quranSoabuni-script.min.js", "radheefAll-script.min.js", "radheefEegaal-script.min.js",
             "radheefManiku-script.min.js", "radheefRasmee-script.min.js", "aqidatuRaziyain-script.min.js", "umdah-script.min.js",
             "quranUshru-script.min.js", "usooluSiththa-script.min.js", "usooluThalaatha-script.min.js", "usooluSunnah-script.min.js")

foreach ($file in $jsFiles) {
    Copy-Item "../js/$file" -Destination "../app/webview-master/app/src/main/assets/js/$file" -Recurse -Force
}

# Copy JS resource files
Copy-Files "../js/resc" "../app/webview-master/app/src/main/assets/js/resc"

# Copy JSON files
Copy-Files "../js/json" "../app/webview-master/app/src/main/assets/js/json"

#
#

# WIN COMPILE

# # delete old 7z archive because that way new one is smaller
# Remove-Item "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\hadithmv_Win64.7z"

# # compile
# C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\compile.bat

# # 7za  -tzip <archive-name> <folder-name>
# # level of compression = 9 (Ultra)
# C:\Users\ashraaf\Downloads\7z2106-extra\x64\7za.exe a -mx=9 "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\hadithmv_Win64.7z" "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\hadithmv_Win64.exe"

# # delete exe to avoid binary file warning from github
# Remove-Item "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\hadithmv_Win64.exe"