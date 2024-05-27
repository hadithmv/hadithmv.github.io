Set-Location -Path $PSScriptRoot

# List of file names
$files = @(
    "akhbaruShuyukh", "allAthar", "aqidatuRaziyain", "aqidahNawawi", "barbahari", "barbahariDFK", 
    "bulugh", "bulughFull", "radheefEegaal", "fortyAajurry", "fortyNawawi", "hisnulMuslim", 
    "kitabulEman", "kunnaasha", "muwatta", "radheefNanfoiy", "nawaqidulislam", "qawaidulArbau", 
    "quranBakurube", "quranBetaqat", "quranHmv", "quranJaufar", "quranMuhammad", "quranMukhtasar", 
    "quranMuyassar", "quranMuyassarGhareeb", "quranQiraaath", "quranRasmee", "quranSadi", 
    "quranSoabuni", "radheefAll", "radheefManiku", "radheefRasmee", "riyadusaliheen", 
    "surah-juz-ayahNo-basmalah-ayah-uthmani", "umdah", "quranUshru", "usooluSiththa", 
    "usooluSunnah", "usooluThalaatha"
)

foreach ($file in $files) {
    # Special case for bulughFull
    if ($file -eq "bulughFull") {
        $constValue = "const bulugh_DB="
    } elseif ($file -like "quran*") {
        $constValue = "const quran_DB="
    } else {
        $constValue = "const ${file}_DB="
    }
    
    # Create JavaScript file content
    Set-Content -Path "../$file.js" -Value $constValue
    Get-Content -Path "$file.json" | Add-Content -Path "../$file.js"
    
    # Minify the JavaScript file
    uglifyjs "../$file.js" -c -m -o "../$file.js"
}

# OLD CODE

# Set-Content ../akhbaruShuyukh.js -Value 'const akhbaruShuyukh_DB='
# Get-Content akhbaruShuyukh.json | Add-Content ../akhbaruShuyukh.js
# uglifyjs ../akhbaruShuyukh.js -c -m -o ../akhbaruShuyukh.js