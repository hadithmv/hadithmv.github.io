# Sync and sort bookNames.csv
#   - Scans data/ for CSV files not yet registered
#   - Adds missing books with empty title columns
#   - Sorts alphabetically by bookCode

$csvPath  = Join-Path $PSScriptRoot "01-bookNames.csv"
$dataDir  = $PSScriptRoot

# Read existing registry
$lines = Get-Content $csvPath
$header = $lines[0]
$rows   = $lines[1..($lines.Count - 1)] | Where-Object { $_.Trim() -ne "" }

# Get registered book codes
$registered = @{}
foreach ($row in $rows) {
    $code = ($row -split ",")[0].Trim()
    if ($code) { $registered[$code] = $true }
}

# Find CSV files in data/ not yet registered
$added = 0
Get-ChildItem $dataDir -Filter *.csv | Where-Object { $_.Name -ne "01-bookNames.csv" } | ForEach-Object {
    $code = $_.BaseName
    if (-not $registered.ContainsKey($code)) {
        Write-Host "  + $code"
        $rows += "$code,,,"
        $added++
    }
}

# Sort
$sorted = $rows | Sort-Object { ($_ -split ",")[0].Trim() }

# Write back
$output = @($header) + $sorted
$output -join "`r`n" | Out-File $csvPath -Encoding UTF8 -NoNewline

$total = $sorted.Count
Write-Host "Done. $total books ($added added), sorted by bookCode."
