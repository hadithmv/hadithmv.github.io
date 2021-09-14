Set-Location -Path $PSScriptRoot #C:/Users/ashraaf/Downloads/VScode/hadithmv.github.io/notes/info

html-minifier --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype introHmv-uc.html -o introHmv.html

html-minifier --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype introFortyN-uc.html -o introFortyN.html

html-minifier --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype introUmdah-uc.html -o introUmdah.html

html-minifier --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype shop-uc.html -o ../../shop.html

html-minifier --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype FAQ-uc.html -o ../../FAQ.html




Copy-Item introHmv.html -Destination ../../app/webview-master/app/src/main/assets/notes/info/introHmv.html

Copy-Item introFortyN.html -Destination ../../app/webview-master/app/src/main/assets/notes/info/introFortyN.html

Copy-Item introUmdah.html -Destination ../../app/webview-master/app/src/main/assets/notes/info/introUmdah.html

Copy-Item FAQ.html -Destination ../../app/webview-master/app/src/main/assets/notes/info/FAQ.html




Copy-Item introHmv.html -Destination ../../win/hmv/notes/info/introHmv.html

Copy-Item introFortyN.html -Destination ../../win/hmv/notes/info/introFortyN.html

Copy-Item introUmdah.html -Destination ../../win/hmv/notes/info/introUmdah.html

Copy-Item FAQ.html -Destination ../../win/hmv/notes/info/FAQ.html