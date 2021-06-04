# delete old 7z archive because that way new one is smaller
Remove-Item "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\hadithmv_Win64.7z"

# compile
C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\compile.bat

# 7za  -tzip <archive-name> <folder-name>
# level of compression = 9 (Ultra)
C:\Users\ashraaf\Downloads\7z1900-extra\x64\7za.exe a -mx=9 "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\hadithmv_Win64.7z" "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\hadithmv_Win64.exe"

# delete exe to avoid binary file warning from github
Remove-Item "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hmv\hadithmv_Win64.exe"
