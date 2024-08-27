# ALL DONE TOGETHER SCRIPT

# minify

Set-Location -Path $PSScriptRoot

# Using a function
function Compress-File {
    param (
        [Parameter(Mandatory=$true)]
        [string]$InputFile
    )

    $outputFile = "$($InputFile.Replace('.js', '.min.js'))"
    google-closure-compiler --charset=UTF-8 --js="$InputFile" --js_output_file="$outputFile"
}

$files = @(
    'akhbaruShuyukh-script.js',
    'allAqida-script.js',
    'allAthar-script.js',
    'aqidahNawawi-script.js',
    'aqidatuRaziyain-script.js',
    'barbahari-script.js',
    'barbahariDFK-script.js',
    'bulugh-script.js',
    'fortyAajurry-script.js',
    'fortyNawawi-script.js',
    'hisnulMuslim-script.js',
    'kitabulEman-script.js',
    'kunnaasha-script.js',
    'muwatta-script.js',
    'radheefNanfoiy-script.js',
    'nawaqidulislam-script.js',
    'qawaidulArbau-script.js',
    'quranBakurube-script.js',
    'quranBetaqat-script.js',
    'quranHadithmv-script.js',
    'quranJaufar-script.js',
    'quranMuhammad-script.js',
    'quranMukhtasar-script.js',
    'quranMuyassar-script.js',
    'quranMuyassarGhareeb-script.js',
    'quranQiraaath-script.js',
    'quranRasmee-script.js',
    'quranSadi-script.js',
    'quranSoabuni-script.js',
    'radheefAll-script.js',
    'radheefEegaal-script.js',# minify

Set-Location -Path $PSScriptRoot #C:/Users/ashraaf/Downloads/VScode/hadithmv.github.io/js

google-closure-compiler --charset=UTF-8 --js=akhbaruShuyukh-script.js --js_output_file=akhbaruShuyukh-script.min.js

google-closure-compiler --charset=UTF-8 --js=allAqida-script.js --js_output_file=allAqida-script.min.js

google-closure-compiler --charset=UTF-8 --js=allAthar-script.js --js_output_file=allAthar-script.min.js

google-closure-compiler --charset=UTF-8 --js=aqidahNawawi-script.js --js_output_file=aqidahNawawi-script.min.js

google-closure-compiler --charset=UTF-8 --js=aqidatuRaziyain-script.js --js_output_file=aqidatuRaziyain-script.min.js

google-closure-compiler --charset=UTF-8 --js=barbahari-script.js --js_output_file=barbahari-script.min.js

google-closure-compiler --charset=UTF-8 --js=barbahariDFK-script.js --js_output_file=barbahariDFK-script.min.js

google-closure-compiler --charset=UTF-8 --js=bulugh-script.js --js_output_file=bulugh-script.min.js

google-closure-compiler --charset=UTF-8 --js=fortyAajurry-script.js --js_output_file=fortyAajurry-script.min.js

google-closure-compiler --charset=UTF-8 --js=fortyNawawi-script.js --js_output_file=fortyNawawi-script.min.js

google-closure-compiler --charset=UTF-8 --js=hisnulMuslim-script.js --js_output_file=hisnulMuslim-script.min.js

google-closure-compiler --charset=UTF-8 --js=kitabulEman-script.js --js_output_file=kitabulEman-script.min.js

google-closure-compiler --charset=UTF-8 --js=kunnaasha-script.js --js_output_file=kunnaasha-script.min.js

google-closure-compiler --charset=UTF-8 --js=muwatta-script.js --js_output_file=muwatta-script.min.js

google-closure-compiler --charset=UTF-8 --js=radheefNanfoiy-script.js --js_output_file=radheefNanfoiy-script.min.js

google-closure-compiler --charset=UTF-8 --js=nawaqidulislam-script.js --js_output_file=nawaqidulislam-script.min.js

google-closure-compiler --charset=UTF-8 --js=qawaidulArbau-script.js --js_output_file=qawaidulArbau-script.min.js

google-closure-compiler --charset=UTF-8 --js=quranBakurube-script.js --js_output_file=quranBakurube-script.min.js

google-closure-compiler --charset=UTF-8 --js=quranBetaqat-script.js --js_output_file=quranBetaqat-script.min.js

google-closure-compiler --charset=UTF-8 --js=quranHadithmv-script.js --js_output_file=quranHadithmv-script.min.js

google-closure-compiler --charset=UTF-8 --js=quranJaufar-script.js --js_output_file=quranJaufar-script.min.js

google-closure-compiler --charset=UTF-8 --js=quranMuhammad-script.js --js_output_file=quranMuhammad-script.min.js

google-closure-compiler --charset=UTF-8 --js=quranMukhtasar-script.js --js_output_file=quranMukhtasar-script.min.js

google-closure-compiler --charset=UTF-8 --js=quranMuyassar-script.js --js_output_file=quranMuyassar-script.min.js

google-closure-compiler --charset=UTF-8 --js=quranMuyassarGhareeb-script.js --js_output_file=quranMuyassarGhareeb-script.min.js

google-closure-compiler --charset=UTF-8 --js=quranQiraaath-script.js --js_output_file=quranQiraaath-script.min.js

google-closure-compiler --charset=UTF-8 --js=quranRasmee-script.js --js_output_file=quranRasmee-script.min.js

google-closure-compiler --charset=UTF-8 --js=quranSadi-script.js --js_output_file=quranSadi-script.min.js

google-closure-compiler --charset=UTF-8 --js=quranSoabuni-script.js --js_output_file=quranSoabuni-script.min.js

google-closure-compiler --charset=UTF-8 --js=radheefAll-script.js --js_output_file=radheefAll-script.min.js

google-closure-compiler --charset=UTF-8 --js=radheefEegaal-script.js --js_output_file=radheefEegaal-script.min.js

google-closure-compiler --charset=UTF-8 --js=radheefManiku-script.js --js_output_file=radheefManiku-script.min.js

google-closure-compiler --charset=UTF-8 --js=radheefRasmee-script.js --js_output_file=radheefRasmee-script.min.js

google-closure-compiler --charset=UTF-8 --js=riyadusaliheen-script.js --js_output_file=riyadusaliheen-script.min.js

google-closure-compiler --charset=UTF-8 --js=umdah-script.js --js_output_file=umdah-script.min.js

google-closure-compiler --charset=UTF-8 --js=quranUshru-script.js --js_output_file=quranUshru-script.min.js

google-closure-compiler --charset=UTF-8 --js=usooluSiththa-script.js --js_output_file=usooluSiththa-script.min.js

google-closure-compiler --charset=UTF-8 --js=usooluSunnah-script.js --js_output_file=usooluSunnah-script.min.js

google-closure-compiler --charset=UTF-8 --js=usooluThalaatha-script.js --js_output_file=usooluThalaatha-script.min.js
    'radheefManiku-script.js',
    'radheefRasmee-script.js',
    'riyadusaliheen-script.js',
    'umdah-script.js',
    'quranUshru-script.js',
    'usooluSiththa-script.js',
    'usooluSunnah-script.js',
    'usooluThalaatha-script.js'
)

foreach ($file in $files) {
    Compress-File -InputFile $file
}

# OLD"
# Set-Location -Path $PSScriptRoot #C:/Users/ashraaf/Downloads/VScode/hadithmv.github.io/js

#google-closure-compiler --charset=UTF-8 --js=akhbaruShuyukh-script.js --js_output_file=akhbaruShuyukh-script.min.js