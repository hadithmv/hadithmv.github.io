# https://stackoverflow.com/questions/41086814/making-commits-simpler-in-git-using-powershell

param ( [string]$mes = "u")

git add .
git commit -m $mes
git push

# https://stackoverflow.com/questions/19595067/git-add-commit-and-push-commands-in-one
# git add . && git commit -m "u" && git push 
