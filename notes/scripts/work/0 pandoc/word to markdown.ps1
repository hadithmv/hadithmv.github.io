# Allow specifying a custom path
param(
    [string]$Path = "."
)

# Set the path to pandoc executable
$pandocPath = "C:\Users\ashra\AppData\Local\Pandoc\pandoc.exe"

# Get all Word documents in specified directory
$wordDocs = @(Get-ChildItem -Path $Path -Filter *.docx -File)
$wordDocs += @(Get-ChildItem -Path $Path -Filter *.doc -File)

# Check if any Word documents were found
if ($wordDocs.Count -eq 0) {
    Write-Host "No Word documents found in current directory." -ForegroundColor Yellow
    exit
}

# Convert each document
foreach ($doc in $wordDocs) {
    $outputFile = [System.IO.Path]::ChangeExtension($doc.Name, ".md")
    
    Write-Host "Converting: $($doc.Name) -> $outputFile" -ForegroundColor Cyan
    
    try {
        & $pandocPath $doc.FullName -f docx -t markdown -o $outputFile
        Write-Host "✓ Successfully converted: $outputFile" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Error converting $($doc.Name): $_" -ForegroundColor Red
    }
}

Write-Host "`nConversion complete!" -ForegroundColor Green