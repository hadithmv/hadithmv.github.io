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
    'quranHmv-script.js',
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
    'radheefEegaal-script.js',
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