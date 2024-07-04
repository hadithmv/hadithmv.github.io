function MinifyHTML($inputFile, $outputFile) {
    html-minifier --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype $inputFile -o $outputFile
}

Set-Location -Path $PSScriptRoot

MinifyHTML "akhbaruShuyukh.html" "../books/akhbaruShuyukh.html"
MinifyHTML "akhlaqHamalathulQuran.html" "../books/akhlaqHamalathulQuran.html"
MinifyHTML "allAqida.html" "../books/allAqida.html"
MinifyHTML "allAthar.html" "../books/allAthar.html"
MinifyHTML "aqidatuRaziyain.html" "../books/aqidatuRaziyain.html"
MinifyHTML "aqidahNawawi.html" "../books/aqidahNawawi.html"
MinifyHTML "barbahari.html" "../books/barbahari.html"
MinifyHTML "barbahariDFK.html" "../books/barbahariDFK.html"
MinifyHTML "bulugh.html" "../books/bulugh.html"
MinifyHTML "bulughFull.html" "../books/bulughFull.html"
MinifyHTML "fortyNawawi.html" "../books/fortyNawawi.html"
MinifyHTML "fortyAajurry.html" "../books/fortyAajurry.html"
MinifyHTML "hisnulMuslim.html" "../books/hisnulMuslim.html"
MinifyHTML "kitabulEman.html" "../books/kitabulEman.html"
MinifyHTML "kunnaasha.html" "../books/kunnaasha.html"
MinifyHTML "index.html" "../books/index.html"
MinifyHTML "muwatta.html" "../books/muwatta.html"
MinifyHTML "radheefNanfoiy.html" "../books/radheefNanfoiy.html"
MinifyHTML "nawaqidulislam.html" "../books/nawaqidulislam.html"
MinifyHTML "qawaidulArbau.html" "../books/qawaidulArbau.html"
MinifyHTML "quranBakurube.html" "../books/quranBakurube.html"
MinifyHTML "quranBetaqat.html" "../books/quranBetaqat.html"
MinifyHTML "quranHmv.html" "../books/quranHmv.html"
MinifyHTML "quranJaufar.html" "../books/quranJaufar.html"
MinifyHTML "quranMuhammad.html" "../books/quranMuhammad.html"
MinifyHTML "quranMukhtasar.html" "../books/quranMukhtasar.html"
MinifyHTML "quranMuyassar.html" "../books/quranMuyassar.html"
MinifyHTML "quranMuyassarGhareeb.html" "../books/quranMuyassarGhareeb.html"
MinifyHTML "quranQiraaath.html" "../books/quranQiraaath.html"
MinifyHTML "quranRasmee.html" "../books/quranRasmee.html"
MinifyHTML "quranSadi.html" "../books/quranSadi.html"
MinifyHTML "quranSoabuni.html" "../books/quranSoabuni.html"
MinifyHTML "radheefAll.html" "../books/radheefAll.html"
MinifyHTML "radheefEegaal.html" "../books/radheefEegaal.html"
MinifyHTML "radheefManiku.html" "../books/radheefManiku.html"
MinifyHTML "radheefRasmee.html" "../books/radheefRasmee.html"
MinifyHTML "riyadusaliheen.html" "../books/riyadusaliheen.html"
MinifyHTML "umdah.html" "../books/umdah.html"
MinifyHTML "quranUshru.html" "../books/quranUshru.html"
MinifyHTML "usooluSiththa.html" "../books/usooluSiththa.html"
MinifyHTML "usooluSunnah.html" "../books/usooluSunnah.html"
MinifyHTML "usooluThalaatha.html" "../books/usooluThalaatha.html"

# copies index page over to layout index dir
Copy-Item "../books/index.html" -Destination "../_layouts/index.html"


# OLD:
# Set-Location -Path $PSScriptRoot #C:/Users/ashraaf/Downloads/VScode/hadithmv.github.io/uc
# html-minifier --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype akhbaruShuyukh.html -o ../books/akhbaruShuyukh.html


# minifies (commented out below line because it copies over the whole dir, including test files)
# html-minifier --input-dir $PSScriptRoot --output-dir ../books --file-ext html --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype