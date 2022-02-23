# https://stackoverflow.com/questions/41086814/making-commits-simpler-in-git-using-powershell

param ( [string]$mes = "u")

git add .
git commit -m $mes
git push

# git commit -a -m "u"
# git push
# git commit -am "u" && git push 
