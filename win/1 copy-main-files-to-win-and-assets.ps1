Set-Location -Path $PSScriptRoot

# dont delete the folders

# - - -
# COPY BOOKS to android
# - - -
# delete old folder in asset
# Remove-Item "../app/webview-master/app/src/main/assets/books" -Recurse -Force
# copies site minified book files to asset book files one by one
Copy-Item ../books/akhbaruShuyukh.html -Destination ../app/webview-master/app/src/main/assets/books/akhbaruShuyukh.html -Recurse -Force
Copy-Item ../books/akhlaqHamalathilQuran.html -Destination ../app/webview-master/app/src/main/assets/books/akhlaqHamalathilQuran.html -Recurse -Force
Copy-Item ../books/allAqida.html -Destination ../app/webview-master/app/src/main/assets/books/allAqida.html -Recurse -Force
Copy-Item ../books/allAthar.html -Destination ../app/webview-master/app/src/main/assets/books/allAthar.html -Recurse -Force
Copy-Item ../books/aqidahNawawi.html -Destination ../app/webview-master/app/src/main/assets/books/aqidahNawawi.html -Recurse -Force
Copy-Item ../books/aqidatuRaziyain.html -Destination ../app/webview-master/app/src/main/assets/books/aqidatuRaziyain.html -Recurse -Force
Copy-Item ../books/barbahari.html -Destination ../app/webview-master/app/src/main/assets/books/barbahari.html -Recurse -Force
Copy-Item ../books/barbahariDFK.html -Destination ../app/webview-master/app/src/main/assets/books/barbahariDFK.html -Recurse -Force
Copy-Item ../books/bulugh.html -Destination ../app/webview-master/app/src/main/assets/books/bulugh.html -Recurse -Force
Copy-Item ../books/fortyAajurry.html -Destination ../app/webview-master/app/src/main/assets/books/fortyAajurry.html -Recurse -Force
Copy-Item ../books/fortyNawawi.html -Destination ../app/webview-master/app/src/main/assets/books/fortyNawawi.html -Recurse -Force
Copy-Item ../books/hisnulMuslim.html -Destination ../app/webview-master/app/src/main/assets/books/hisnulMuslim.html -Recurse -Force
Copy-Item ../books/kitabulEman.html -Destination ../app/webview-master/app/src/main/assets/books/kitabulEman.html -Recurse -Force
Copy-Item ../books/kunnaasha.html -Destination ../app/webview-master/app/src/main/assets/books/kunnaasha.html -Recurse -Force
Copy-Item ../books/index.html -Destination ../app/webview-master/app/src/main/assets/books/index.html -Recurse -Force
Copy-Item ../books/muwatta.html -Destination ../app/webview-master/app/src/main/assets/books/muwatta.html -Recurse -Force
Copy-Item ../books/radheefNanfoiy.html -Destination ../app/webview-master/app/src/main/assets/books/radheefNanfoiy.html -Recurse -Force
Copy-Item ../books/nawaqidulislam.html -Destination ../app/webview-master/app/src/main/assets/books/nawaqidulislam.html -Recurse -Force
Copy-Item ../books/qawaidulArbau.html -Destination ../app/webview-master/app/src/main/assets/books/qawaidulArbau.html -Recurse -Force
Copy-Item ../books/quranBakurube.html -Destination ../app/webview-master/app/src/main/assets/books/quranBakurube.html -Recurse -Force
Copy-Item ../books/quranBetaqat.html -Destination ../app/webview-master/app/src/main/assets/books/quranBetaqat.html -Recurse -Force
Copy-Item ../books/quranHadithmv.html -Destination ../app/webview-master/app/src/main/assets/books/quranHadithmv.html -Recurse -Force
Copy-Item ../books/quranJaufar.html -Destination ../app/webview-master/app/src/main/assets/books/quranJaufar.html -Recurse -Force
Copy-Item ../books/quranMukhtasar.html -Destination ../app/webview-master/app/src/main/assets/books/quranMukhtasar.html -Recurse -Force
Copy-Item ../books/quranMuyassar.html -Destination ../app/webview-master/app/src/main/assets/books/quranMuyassar.html -Recurse -Force
Copy-Item ../books/quranMuyassarGhareeb.html -Destination ../app/webview-master/app/src/main/assets/books/quranMuyassarGhareeb.html -Recurse -Force
Copy-Item ../books/quranQiraaath.html -Destination ../app/webview-master/app/src/main/assets/books/quranQiraaath.html -Recurse -Force
Copy-Item ../books/quranRasmee.html -Destination ../app/webview-master/app/src/main/assets/books/quranRasmee.html -Recurse -Force
Copy-Item ../books/quranSadi.html -Destination ../app/webview-master/app/src/main/assets/books/quranSadi.html -Recurse -Force
Copy-Item ../books/quranSoabuni.html -Destination ../app/webview-master/app/src/main/assets/books/quranSoabuni.html -Recurse -Force
Copy-Item ../books/radheefAll.html -Destination ../app/webview-master/app/src/main/assets/books/radheefAll.html -Recurse -Force
Copy-Item ../books/radheefEegaal.html -Destination ../app/webview-master/app/src/main/assets/books/radheefEegaal.html -Recurse -Force
Copy-Item ../books/radheefManiku.html -Destination ../app/webview-master/app/src/main/assets/books/radheefManiku.html -Recurse -Force
Copy-Item ../books/radheefRasmee.html -Destination ../app/webview-master/app/src/main/assets/books/radheefRasmee.html -Recurse -Force
Copy-Item ../books/umdah.html -Destination ../app/webview-master/app/src/main/assets/books/umdah.html -Recurse -Force
Copy-Item ../books/quranUshru.html -Destination ../app/webview-master/app/src/main/assets/books/quranUshru.html -Recurse -Force
Copy-Item ../books/usooluSiththa.html -Destination ../app/webview-master/app/src/main/assets/books/usooluSiththa.html -Recurse -Force
Copy-Item ../books/usooluThalaatha.html -Destination ../app/webview-master/app/src/main/assets/books/usooluThalaatha.html -Recurse -Force
Copy-Item ../books/usooluSunnah.html -Destination ../app/webview-master/app/src/main/assets/books/usooluSunnah.html -Recurse -Force

# copies minified asset book folder contents to WIN book folder
Copy-Item ../app/webview-master/app/src/main/assets/books/* -Destination hmv/books -Recurse -Force
# copies index from WIN book to WIN root
Copy-Item hmv/books/index.html -Destination hmv/index.html -Recurse -Force

# - - -
# COPY NOTES to android
# - - -
# delete old folder in asset
# Remove-Item "../app/webview-master/app/src/main/assets/notes" -Recurse -Force
Copy-Item ../notes/minimal-mod.min.css -Destination ../app/webview-master/app/src/main/assets/notes/minimal-mod.min.css -Recurse -Force
Copy-Item ../notes/third-party-libs-and-tools.txt -Destination ../app/webview-master/app/src/main/assets/notes/third-party-libs-and-tools.txt -Recurse -Force
Copy-Item ../LICENSE.txt -Destination ../app/webview-master/app/src/main/assets/LICENSE.txt -Recurse -Force
Copy-Item ../notes/how-to-use-hmv.txt -Destination ../app/webview-master/app/src/main/assets/notes/how-to-use-hmv.txt -Recurse -Force
Copy-Item ../notes/editorResc.min.css -Destination ../app/webview-master/app/src/main/assets/notes/editorResc.min.css -Recurse -Force
Copy-Item ../notes/editorResc.min.js -Destination ../app/webview-master/app/src/main/assets/notes/editorResc.min.js -Recurse -Force

# - - -
# COPY INFO to android
# - - -
Copy-Item ../notes/info/contributors.html -Destination ../app/webview-master/app/src/main/assets/notes/info/contributors.html -Recurse -Force
Copy-Item ../notes/info/FAQ.html -Destination ../app/webview-master/app/src/main/assets/notes/info/FAQ.html -Recurse -Force
Copy-Item ../page/helpTranslate.html -Destination ../app/webview-master/app/src/main/assets/page/helpTranslate.html -Recurse -Force
Copy-Item ../notes/info/introFortyN.html -Destination ../app/webview-master/app/src/main/assets/notes/info/introFortyN.html -Recurse -Force
Copy-Item ../notes/info/introHmv.html -Destination ../app/webview-master/app/src/main/assets/notes/info/introHmv.html -Recurse -Force
Copy-Item ../notes/info/introUmdah.html -Destination ../app/webview-master/app/src/main/assets/notes/info/introUmdah.html -Recurse -Force
Copy-Item ../notes/info/khutba.html -Destination ../app/webview-master/app/src/main/assets/notes/info/khutba.html -Recurse -Force
Copy-Item ../notes/info/lafzuVakikohLiyumugeQawaid.html -Destination ../app/webview-master/app/src/main/assets/notes/info/lafzuVakikohLiyumugeQawaid.html -Recurse -Force
Copy-Item ../notes/info/madina-info.html -Destination ../app/webview-master/app/src/main/assets/notes/info/madina-info.html -Recurse -Force
Copy-Item ../notes/info/mirror-backups.html -Destination ../app/webview-master/app/src/main/assets/notes/info/mirror-backups.html -Recurse -Force
# below copies the mirror html to where 404 is and overwrites/renames it
Copy-Item ../notes/info/mirror-backups.html -Destination ../404.html -Recurse -Force
#
Copy-Item ../notes/info/nawawiSiyar.html -Destination ../app/webview-master/app/src/main/assets/notes/info/nawawiSiyar.html -Recurse -Force
Copy-Item ../notes/info/NukuthaajehiAkuruthahBeynunkuraaneHama.html -Destination ../app/webview-master/app/src/main/assets/notes/info/NukuthaajehiAkuruthahBeynunkuraaneHama.html -Recurse -Force
Copy-Item ../notes/info/other-links.html -Destination ../app/webview-master/app/src/main/assets/notes/info/other-links.html -Recurse -Force
Copy-Item ../notes/info/privacy.html -Destination ../app/webview-master/app/src/main/assets/notes/info/privacy.html -Recurse -Force
Copy-Item ../notes/info/text-editor.html -Destination ../app/webview-master/app/src/main/assets/notes/info/text-editor.html -Recurse -Force
Copy-Item ../notes/info/umrah-travel.html -Destination ../app/webview-master/app/src/main/assets/notes/info/umrah-travel.html -Recurse -Force
Copy-Item ../notes/info/contact.html -Destination ../app/webview-master/app/src/main/assets/notes/info/contact.html -Recurse -Force

# copies previous NOTES INCLUDING INFO folder contents to WIN notes folder
Copy-Item ../app/webview-master/app/src/main/assets/notes/* -Destination hmv/notes -Recurse -Force

# - - -
# COPY fonts to android
# - - -
Copy-Item ../font/merged-300.woff2 -Destination ../app/webview-master/app/src/main/assets/font/merged-300.woff2 -Recurse -Force
Copy-Item ../font/hafs-400.woff2 -Destination ../app/webview-master/app/src/main/assets/font/hafs-400.woff2 -Recurse -Force

# copies previous font to WIN font folder
Copy-Item  ../app/webview-master/app/src/main/assets/font/* -Destination hmv/font -Recurse -Force


# - - -
# COPY imgs to android
# - - -
Copy-Item ../img/logo/logo.svg -Destination ../app/webview-master/app/src/main/assets/img/logo/logo.svg -Recurse -Force

# copies previous imgs to WIN font folder
Copy-Item  ../app/webview-master/app/src/main/assets/img/* -Destination hmv/img -Recurse -Force

#
#
#

# - - -
# COPY MINIFIED JS SCRIPTS to android
# - - -
# delete old folder in asset
# Remove-Item "../app/webview-master/app/src/main/assets/js" -Recurse -Force
Copy-Item ../js/akhbaruShuyukh-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/akhbaruShuyukh-script.min.js -Recurse -Force
Copy-Item ../js/akhlaqHamalathilQuran-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/akhlaqHamalathilQuran-script.min.js -Recurse -Force
Copy-Item ../js/allAqida-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/allAqida-script.min.js -Recurse -Force
Copy-Item ../js/allAthar-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/allAthar-script.min.js -Recurse -Force
Copy-Item ../js/aqidahNawawi-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/aqidahNawawi-script.min.js -Recurse -Force
Copy-Item ../js/barbahari-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/barbahari-script.min.js -Recurse -Force
Copy-Item ../js/barbahariDFK-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/barbahariDFK-script.min.js -Recurse -Force
Copy-Item ../js/bulugh-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/bulugh-script.min.js -Recurse -Force
Copy-Item ../js/hisnulMuslim-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/hisnulMuslim-script.min.js -Recurse -Force
Copy-Item ../js/kitabulEman-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/kitabulEman-script.min.js -Recurse -Force
Copy-Item ../js/kunnaasha-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/kunnaasha-script.min.js -Recurse -Force
Copy-Item ../js/muwatta-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/muwatta-script.min.js -Recurse -Force
Copy-Item ../js/radheefNanfoiy-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/radheefNanfoiy-script.min.js -Recurse -Force
Copy-Item ../js/nawaqidulislam-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/nawaqidulislam-script.min.js -Recurse -Force
Copy-Item ../js/qawaidulArbau-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/qawaidulArbau-script.min.js -Recurse -Force
Copy-Item ../js/fortyNawawi-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/fortyNawawi-script.min.js -Recurse -Force
Copy-Item ../js/fortyAajurry-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/fortyAajurry-script.min.js -Recurse -Force
Copy-Item ../js/quranBakurube-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/quranBakurube-script.min.js -Recurse -Force
Copy-Item ../js/quranBetaqat-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/quranBetaqat-script.min.js -Recurse -Force
Copy-Item ../js/quranHadithmv-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/quranHadithmv-script.min.js -Recurse -Force
Copy-Item ../js/quranJaufar-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/quranJaufar-script.min.js -Recurse -Force
Copy-Item ../js/quranMukhtasar-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/quranMukhtasar-script.min.js -Recurse -Force
Copy-Item ../js/quranMuyassar-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/quranMuyassar-script.min.js -Recurse -Force
Copy-Item ../js/quranQiraaath-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/quranQiraaath-script.min.js -Recurse -Force
Copy-Item ../js/quranRasmee-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/quranRasmee-script.min.js -Recurse -Force
Copy-Item ../js/quranSadi-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/quranSadi-script.min.js -Recurse -Force
Copy-Item ../js/quranSoabuni-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/quranSoabuni-script.min.js -Recurse -Force
Copy-Item ../js/radheefAll-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/radheefAll-script.min.js -Recurse -Force
Copy-Item ../js/radheefEegaal-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/radheefEegaal-script.min.js -Recurse -Force
Copy-Item ../js/radheefManiku-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/radheefManiku-script.min.js -Recurse -Force
Copy-Item ../js/radheefRasmee-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/radheefRasmee-script.min.js -Recurse -Force
Copy-Item ../js/aqidatuRaziyain-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/aqidatuRaziyain-script.min.js -Recurse -Force
Copy-Item ../js/umdah-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/umdah-script.min.js -Recurse -Force
Copy-Item ../js/quranUshru-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/quranUshru-script.min.js -Recurse -Force
Copy-Item ../js/usooluSiththa-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/usooluSiththa-script.min.js -Recurse -Force
Copy-Item ../js/usooluThalaatha-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/usooluThalaatha-script.min.js -Recurse -Force
Copy-Item ../js/usooluSunnah-script.min.js -Destination ../app/webview-master/app/src/main/assets/js/usooluSunnah-script.min.js -Recurse -Force

# - - -
# COPY JS RESOURCE FILES to android
# - - -
Copy-Item ../js/resc/COMB-Crit.min.js -Destination ../app/webview-master/app/src/main/assets/js/resc/COMB-Crit.min.js -Recurse -Force
Copy-Item ../js/resc/COMB-nonCrit.min.js -Destination ../app/webview-master/app/src/main/assets/js/resc/COMB-nonCrit.min.js -Recurse -Force

# - - -
# COPY JSON to android
# - - -
Copy-Item ../js/json/akhbaruShuyukh.js -Destination ../app/webview-master/app/src/main/assets/js/json/akhbaruShuyukh.js -Recurse -Force
Copy-Item ../js/json/akhlaqHamalathilQuran.js -Destination ../app/webview-master/app/src/main/assets/js/json/akhlaqHamalathilQuran.js -Recurse -Force
Copy-Item ../js/json/allAthar.js -Destination ../app/webview-master/app/src/main/assets/js/json/allAthar.js -Recurse -Force
Copy-Item ../js/json/aqidahNawawi.js -Destination ../app/webview-master/app/src/main/assets/js/json/aqidahNawawi.js -Recurse -Force
Copy-Item ../js/json/barbahari.js -Destination ../app/webview-master/app/src/main/assets/js/json/barbahari.js -Recurse -Force
Copy-Item ../js/json/barbahariDFK.js -Destination ../app/webview-master/app/src/main/assets/js/json/barbahariDFK.js -Recurse -Force
Copy-Item ../js/json/bulugh.js -Destination ../app/webview-master/app/src/main/assets/js/json/bulugh.js -Recurse -Force
Copy-Item ../js/json/bulughFull.js -Destination ../app/webview-master/app/src/main/assets/js/json/bulughFull.js -Recurse -Force
Copy-Item ../js/json/hisnulMuslim.js -Destination ../app/webview-master/app/src/main/assets/js/json/hisnulMuslim.js -Recurse -Force
Copy-Item ../js/json/kitabulEman.js -Destination ../app/webview-master/app/src/main/assets/js/json/kitabulEman.js -Recurse -Force
Copy-Item ../js/json/kunnaasha.js -Destination ../app/webview-master/app/src/main/assets/js/json/kunnaasha.js -Recurse -Force
Copy-Item ../js/json/muwatta.js -Destination ../app/webview-master/app/src/main/assets/js/json/muwatta.js -Recurse -Force
Copy-Item ../js/json/radheefNanfoiy.js -Destination ../app/webview-master/app/src/main/assets/js/json/radheefNanfoiy.js -Recurse -Force
Copy-Item ../js/json/nawaqidulislam.js -Destination ../app/webview-master/app/src/main/assets/js/json/nawaqidulislam.js -Recurse -Force
Copy-Item ../js/json/qawaidulArbau.js -Destination ../app/webview-master/app/src/main/assets/js/json/qawaidulArbau.js -Recurse -Force
Copy-Item ../js/json/fortyNawawi.js -Destination ../app/webview-master/app/src/main/assets/js/json/fortyNawawi.js -Recurse -Force
Copy-Item ../js/json/fortyAajurry.js -Destination ../app/webview-master/app/src/main/assets/js/json/fortyAajurry.js -Recurse -Force
Copy-Item ../js/json/quranBakurube.js -Destination ../app/webview-master/app/src/main/assets/js/json/quranBakurube.js -Recurse -Force
Copy-Item ../js/json/quranBetaqat.js -Destination ../app/webview-master/app/src/main/assets/js/json/quranBetaqat.js -Recurse -Force
Copy-Item ../js/json/quranHadithmv.js -Destination ../app/webview-master/app/src/main/assets/js/json/quranHadithmv.js -Recurse -Force
Copy-Item ../js/json/quranJaufar.js -Destination ../app/webview-master/app/src/main/assets/js/json/quranJaufar.js -Recurse -Force
Copy-Item ../js/json/quranMukhtasar.js -Destination ../app/webview-master/app/src/main/assets/js/json/quranMukhtasar.js -Recurse -Force
Copy-Item ../js/json/quranMuyassar.js -Destination ../app/webview-master/app/src/main/assets/js/json/quranMuyassar.js -Recurse -Force
Copy-Item ../js/json/quranQiraaath.js -Destination ../app/webview-master/app/src/main/assets/js/json/quranQiraaath.js -Recurse -Force
Copy-Item ../js/json/quranRasmee.js -Destination ../app/webview-master/app/src/main/assets/js/json/quranRasmee.js -Recurse -Force
Copy-Item ../js/json/quranSadi.js -Destination ../app/webview-master/app/src/main/assets/js/json/quranSadi.js -Recurse -Force
Copy-Item ../js/json/quranSoabuni.js -Destination ../app/webview-master/app/src/main/assets/js/json/quranSoabuni.js -Recurse -Force
Copy-Item ../js/json/radheefAll.js -Destination ../app/webview-master/app/src/main/assets/js/json/radheefAll.js -Recurse -Force
Copy-Item ../js/json/radheefEegaal.js -Destination ../app/webview-master/app/src/main/assets/js/json/radheefEegaal.js -Recurse -Force
Copy-Item ../js/json/radheefManiku.js -Destination ../app/webview-master/app/src/main/assets/js/json/radheefManiku.js -Recurse -Force
Copy-Item ../js/json/radheefRasmee.js -Destination ../app/webview-master/app/src/main/assets/js/json/radheefRasmee.js -Recurse -Force
Copy-Item ../js/json/aqidatuRaziyain.js -Destination ../app/webview-master/app/src/main/assets/js/json/aqidatuRaziyain.js -Recurse -Force
Copy-Item ../js/json/surah-juz-ayahNo-basmalah-ayah-uthmani.js -Destination ../app/webview-master/app/src/main/assets/js/json/surah-juz-ayahNo-basmalah-ayah-uthmani.js -Recurse -Force
Copy-Item ../js/json/umdah.js -Destination ../app/webview-master/app/src/main/assets/js/json/umdah.js -Recurse -Force
Copy-Item ../js/json/quranUshru.js -Destination ../app/webview-master/app/src/main/assets/js/json/quranUshru.js -Recurse -Force
Copy-Item ../js/json/usooluSiththa.js -Destination ../app/webview-master/app/src/main/assets/js/json/usooluSiththa.js -Recurse -Force
Copy-Item ../js/json/usooluThalaatha.js -Destination ../app/webview-master/app/src/main/assets/js/json/usooluThalaatha.js -Recurse -Force
Copy-Item ../js/json/usooluSunnah.js -Destination ../app/webview-master/app/src/main/assets/js/json/usooluSunnah.js -Recurse -Force

# copies previous JS AND JSON AND RESC folder contents to WIN js folder
Copy-Item ../app/webview-master/app/src/main/assets/js/* -Destination hmv/js -Recurse -Force

# - - -
# COPY MINIFIED CSS to android
# - - -
# delete old folder in asset
# Remove-Item "../app/webview-master/app/src/main/assets/css" -Recurse -Force
Copy-Item ../css/COMB-nonCrit.min.css -Destination ../app/webview-master/app/src/main/assets/css/COMB-nonCrit.min.css -Recurse -Force

# copies previous css folder contents to WIN css folder
Copy-Item ../app/webview-master/app/src/main/assets/css/* -Destination hmv/css -Recurse -Force

#
#
#

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
