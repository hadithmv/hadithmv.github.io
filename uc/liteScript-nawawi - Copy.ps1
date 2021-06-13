# delete current content between comments
((Get-Content -path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite-NEW.html" -Raw) -replace '<!--### INSERT REPLACED JSON TO HTML HERE ###-->(.*?(\n))+.*?<!--### INSERT REPLACED JSON TO HTML HERE ### - END-->','<!--### INSERT REPLACED JSON TO HTML HERE ###--><!--### INSERT REPLACED JSON TO HTML HERE ### - END-->') | Set-Content -Path "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite-NEW.html"


# Original text
$inputFile1 = "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite-NEW.html"
# Text to be inserted
$inputFile2 = "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-LiteTEST.html"
# Output file
$outputFile = "C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\uc\nawawi-Lite-NEW-NEW.html"
# Find where the last </location> tag is
if ((Select-String -Pattern "HERE ###-->" -Path $inputFile1 |
    select -last 1) -match ":(\d+):")
{
    $insertPoint = $Matches[1]
    # Build up the output from the various parts
    Get-Content -Path $inputFile1 | select -First $insertPoint | Out-File $outputFile
    Get-Content -Path $inputFile2 | Out-File $outputFile -Append
    Get-Content -Path $inputFile1 | select -Skip $insertPoint | Out-File $outputFile -Append
}