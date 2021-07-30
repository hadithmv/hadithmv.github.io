Set-Location -Path $PSScriptRoot #C:/Users/ashraaf/Downloads/VScode/hadithmv.github.io/notes

csso --input minimal-mod.css --output minimal-mod.min.css

Copy-Item minimal-mod.min.css -Destination ../app/webview-master/app/src/main/assets/notes/minimal-mod.min.css

Copy-Item minimal-mod.min.css -Destination ../win/hmv/notes/minimal-mod.min.css


Copy-Item third-party-libs-and-tools.txt -Destination ../app/webview-master/app/src/main/assets/notes/third-party-libs-and-tools.txt

Copy-Item third-party-libs-and-tools.txt -Destination ../win/hmv/notes/third-party-libs-and-tools.txt



Copy-Item ../LICENSE.txt -Destination ../app/webview-master/app/src/main/assets/LICENSE.txt

Copy-Item ../LICENSE.txt -Destination ../win/hmv/LICENSE.txt



Copy-Item how-to-use-hmv.txt -Destination ../app/webview-master/app/src/main/assets/notes/how-to-use-hmv.txt

Copy-Item how-to-use-hmv.txt -Destination ../win/hmv/notes/how-to-use-hmv.txt


