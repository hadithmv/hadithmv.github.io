<#C:\Users\ashraaf\Downloads\libwebp-1.2.0-windows-x64\bin\cwebp.exe C:\Users\ashraaf\Downloads\libwebp-1.2.0-windows-x64\bin\img.png -o C:\Users\ashraaf\Downloads\libwebp-1.2.0-windows-x64\bin\img.webp
#>

# https://www.mindfulmodeler.com/snips/png-to-webp/

$loc = "C:\Users\hadit\Desktop\webConvert"

# get all files in the loc directory
$images = Get-ChildItem $loc

# loop through every images
foreach ($img in $images) {
  # output file will have .webp extension instead of old extension
  $outputName = $img.DirectoryName + "\" + $img.BaseName + ".webp"

  # copy-paste the path to where you extracted the cwebp program 
  C:\Users\hadit\Downloads\libwebp-1.2.2-windows-x64\bin\cwebp.exe $img.FullName -o $outputName
}