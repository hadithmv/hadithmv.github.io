# Allow specifying a custom path
param(
    [string]$Path = "."
)

# Set the path to pandoc executable
$pandocPath = "C:\Users\ashra\AppData\Local\Pandoc\pandoc.exe"

# Get all Markdown files in specified directory
$mdFiles = @(Get-ChildItem -Path $Path -Filter *.md -File)
$mdFiles += @(Get-ChildItem -Path $Path -Filter *.markdown -File)

# Check if any Markdown files were found
if ($mdFiles.Count -eq 0) {
    Write-Host "No Markdown files found in current directory." -ForegroundColor Yellow
    exit
}

# Convert each document
foreach ($file in $mdFiles) {
    $outputFile = [System.IO.Path]::ChangeExtension($file.Name, ".docx")
    
    Write-Host "Converting: $($file.Name) -> $outputFile" -ForegroundColor Cyan
    
    try {
        & $pandocPath $file.FullName -f markdown -t docx -o $outputFile
        Write-Host "✓ Successfully converted: $outputFile" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Error converting $($file.Name): $_" -ForegroundColor Red
    }
}

Write-Host "`nConversion complete!" -ForegroundColor Green