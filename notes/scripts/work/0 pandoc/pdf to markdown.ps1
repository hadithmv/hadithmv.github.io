# Allow specifying a custom path
param(
    [string]$Path = "."
)

# Paths to executables
$pandocPath = "C:\Users\ashra\AppData\Local\Pandoc\pandoc.exe"
$pdftotextPath = "D:\hadithmv\hadithmv.github.io\notes\scripts\work\0 pandoc\poppler-25.12.0\Library\bin\pdftotext.exe"

# Get all PDF files in specified directory
$pdfFiles = Get-ChildItem -Path $Path -Filter *.pdf -File

# Check if any PDF files were found
if ($pdfFiles.Count -eq 0) {
    Write-Host "No PDF files found in current directory." -ForegroundColor Yellow
    exit
}

foreach ($file in $pdfFiles) {

    $txtFile = [System.IO.Path]::ChangeExtension($file.FullName, ".txt")
    $mdFile = [System.IO.Path]::ChangeExtension($file.FullName, ".md")

    Write-Host "Extracting text: $($file.Name)" -ForegroundColor Cyan

    & $pdftotextPath `
        -layout `
        -enc UTF-8 `
        $file.FullName `
        $txtFile

    if (!(Test-Path $txtFile)) {
        Write-Host "✗ Failed to extract text from PDF" -ForegroundColor Red
        continue
    }

    Write-Host "Converting to Markdown: $($file.Name)" -ForegroundColor Cyan

    & $pandocPath `
        $txtFile `
        -f plain `
        -t markdown `
        --wrap=none `
        -o $mdFile

    if (Test-Path $mdFile) {
        Write-Host "✓ Successfully created: $mdFile" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Markdown conversion failed" -ForegroundColor Red
    }
}

Write-Host "`nConversion complete!" -ForegroundColor Green
