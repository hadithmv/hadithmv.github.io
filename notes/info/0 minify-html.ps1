function MinifyHTML($inputFile, $outputFile) {
    html-minifier --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype $inputFile -o $outputFile
}

Set-Location -Path $PSScriptRoot #C:/Users/ashraaf/Downloads/VScode/hadithmv.github.io/notes/info

MinifyHTML "introHmv-uc.html" "introHmv.html"
MinifyHTML "introFortyN-uc.html" "introFortyN.html"
MinifyHTML "introUmdah-uc.html" "introUmdah.html"
MinifyHTML "FAQ-uc.html" "FAQ.html"
MinifyHTML "contributors-uc.html" "contributors.html"
MinifyHTML "khutba-uc.html" "khutba.html"
MinifyHTML "text-editor-uc.html" "text-editor.html"
MinifyHTML "umrah-travel-uc.html" "umrah-travel.html"
MinifyHTML "madina-info-uc.html" "madina-info.html"
MinifyHTML "contact-uc.html" "contact.html"
# MinifyHTML "index/index-uc.html" "index/index.html"

# OLD:
# Set-Location -Path $PSScriptRoot #C:/Users/ashraaf/Downloads/VScode/hadithmv.github.io/notes/info
 
# html-minifier --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype introHmv-uc.html -o introHmv.html
