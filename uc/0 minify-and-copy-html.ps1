Set-Location -Path C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc

html-minifier --input-dir C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc --output-dir C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\books --file-ext html --collapse-boolean-attributes --collapse-whitespace --decode-entities --minify-css true --minify-js true --process-scripts [text/html] --remove-attribute-quotes --remove-comments --remove-empty-attributes --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-style-link-type-attributes --remove-tag-whitespace --sort-attributes --sort-class-name --trim-custom-fragments --use-short-doctype

Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\books\nawawi.html -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\_layouts\default.html

Copy-Item C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\books\eegaal-uc.html -Destination C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\books\eegaal.html