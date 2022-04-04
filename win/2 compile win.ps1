#
# WIN COMPILE
#

# delete old 7z archive because that way new one is smaller
Remove-Item "C:\Users\hadit\Downloads\VScode\hadithmv.github.io\win\hmv\hadithmv_Win64.7z" -Recurse -Force

# compile
C:\Users\hadit\Downloads\VScode\hadithmv.github.io\win\compile.bat

# 7za  -tzip <archive-name> <folder-name>
# level of compression = 9 (Ultra)
C:\Users\hadit\Downloads\7z2107-extra\7za.exe a -mx=9 "C:\Users\hadit\Desktop\hadithmv_Win64.7z" "C:\Users\hadit\Downloads\VScode\hadithmv.github.io\win\hmv\hadithmv_Win64.exe"

# delete exe to avoid binary file warning from github
Remove-Item "C:\Users\hadit\Downloads\VScode\hadithmv.github.io\win\hmv\hadithmv_Win64.exe"
