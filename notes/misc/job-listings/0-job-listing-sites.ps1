Set-Location -Path $PSScriptRoot

# Define the file path
$filePath = "0-job-listing-sites.txt"

# Check if file exists
if (-not (Test-Path $filePath)) {
    Write-Host "File not found: $filePath" -ForegroundColor Red
    exit
}

# Start timing
$startTime = Get-Date

# Read the file
$content = Get-Content -Path $filePath -Raw

# Extract all URLs using regex
$pattern = 'https?://[^\s\)"''()]+'
$urls = [regex]::Matches($content, $pattern) | ForEach-Object { $_.Value }

$urlCount = $urls.Count
Write-Host "Found $urlCount URLs" -ForegroundColor Cyan

# Loop through each URL and open it in the default browser
$openedCount = 0
foreach ($url in $urls) {
    Write-Host "Opening URL $($openedCount+1) of $urlCount : $url" -ForegroundColor Yellow
    
    try {
        # Use the start command which works on all PowerShell versions
        Invoke-Expression "start '$url'"
        $openedCount++
        
        # Add a small delay to prevent overwhelming the system
        Start-Sleep -Milliseconds 1000
    }
    catch {
        Write-Host "Failed to open URL: $url" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
    }
}

# Calculate elapsed time
$endTime = Get-Date
$elapsedTime = $endTime - $startTime
$formattedTime = "{0:mm}:{0:ss}.{0:fff}" -f $elapsedTime

Write-Host "Process complete: Opened $openedCount out of $urlCount URLs in $formattedTime (minutes:seconds)" -ForegroundColor Green