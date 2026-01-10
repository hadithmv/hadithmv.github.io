# Allow specifying a custom path
param(
    [string]$Path = "."
)

# Get all PDF files in specified directory
$pdfFiles = Get-ChildItem -Path $Path -Filter *.pdf -File

# Check if any PDF files were found
if ($pdfFiles.Count -eq 0) {
    Write-Host "No PDF files found in current directory." -ForegroundColor Yellow
    exit
}

foreach ($file in $pdfFiles) {

    $txtFile = [System.IO.Path]::ChangeExtension($file.FullName, ".txt")

    Write-Host "Extracting text: $($file.Name) → $([System.IO.Path]::GetFileName($txtFile))" -ForegroundColor Cyan

    # Poppler (from PATH)
    pdftotext `
        -layout `
        -enc UTF-8 `
        $file.FullName `
        $txtFile

    if (Test-Path $txtFile) {
        Write-Host "✓ Successfully created: $txtFile" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Text extraction failed" -ForegroundColor Red
    }
}

Write-Host "`nConversion complete!" -ForegroundColor Green
