<#
powershell script to convert all .htm and .html files in current folder from windows 1256 encoding to utf 8
#>

Set-Location -Path $PSScriptRoot

# Define the encoding for Windows-1256
$windows1256Encoding = [System.Text.Encoding]::GetEncoding("windows-1256")

# Get all .htm and .html files in the current directory
$files = Get-ChildItem -Path . | Where-Object { $_.Extension -eq ".htm" -or $_.Extension -eq ".html" }

foreach ($file in $files) {
    # Read the content of the file using Windows-1256 encoding
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $content = $windows1256Encoding.GetString($bytes)
    
    # Write the content back to the file using UTF-8 encoding
    [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
    
    Write-Host "Converted $($file.FullName) to UTF-8"
}

