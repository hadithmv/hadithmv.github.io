# Update and sort bookNames.csv
#   - Reads known tag codes from 02-bookTags.csv
#   - Strips prefix tags and suffix flags from bookCode to derive titleEN
#   - Converts camelCase to Title Case (e.g. "aqidahNawawi" → "Aqidah Nawawi")
#   - Scans data/ for CSV files not yet registered and adds them
#   - Sorts alphabetically by bookCode

$csvPath    = Join-Path $PSScriptRoot "01-bookNames.csv"
$tagsPath   = Join-Path $PSScriptRoot "02-bookTags.csv"
$dataDir    = $PSScriptRoot

# ── Load known tag codes from 02-bookTags.csv ────────────────
$knownTags = @{}
if (Test-Path $tagsPath) {
    Get-Content $tagsPath | Select-Object -Skip 1 | ForEach-Object {
        $line = $_.Trim()
        if ($line) {
            $code = ($line -split ",")[0].Trim()
            if ($code) { $knownTags[$code] = $true }
        }
    }
}
Write-Host "Loaded tags: $($knownTags.Keys -join ', ')"

# Known suffix flags to strip from end of bookCode
$suffixFlags = @("HDN", "DRAFT")

# ── Helper: camelCase → Title Case ───────────────────────────
function ConvertTo-TitleCase($name) {
    # Insert space before each uppercase letter that follows a lowercase letter
    $spaced = $name -creplace '(?<=[a-z])(?=[A-Z])', ' '
    # Capitalize first letter of each word
    $words = $spaced -split ' ' | Where-Object { $_ }
    $titled = ($words | ForEach-Object {
        if ($_.Length -gt 0) {
            $_.Substring(0,1).ToUpper() + $_.Substring(1).ToLower()
        } else { $_ }
    }) -join ' '
    return $titled
}

# ── Helper: extract book name from bookCode ──────────────────
function Get-BookName($code) {
    $parts = $code -split '-'
    $start = 0
    $end   = $parts.Count - 1

    # Strip known prefix tags
    while ($start -lt $parts.Count -and $knownTags.ContainsKey($parts[$start])) {
        $start++
    }

    # Strip known suffix flags
    while ($end -ge $start -and $suffixFlags -contains $parts[$end]) {
        $end--
    }

    # Join remaining parts
    if ($start -le $end) {
        $nameParts = $parts[$start..$end]
        return ($nameParts -join '')
    }
    return ""
}

# ── Clean up " - Sheet1" suffixes from CSV filenames ──────────
Get-ChildItem $dataDir -Filter "* - Sheet1.csv" | ForEach-Object {
    $newName = $_.Name -replace " - Sheet1\.csv$", ".csv"
    $newPath = Join-Path $dataDir $newName
    if (-not (Test-Path $newPath)) {
        Write-Host "  rename: $($_.Name)  →  $newName"
        Rename-Item $_.FullName $newName
    } else {
        Write-Host "  skip (target exists): $($_.Name)"
    }
}

# ── Read existing registry ────────────────────────────────────
$lines  = Get-Content $csvPath
$header = $lines[0]
$rows   = $lines[1..($lines.Count - 1)] | Where-Object { $_.Trim() -ne "" }

# Get registered book codes
$registered = @{}
foreach ($row in $rows) {
    $code = ($row -split ",")[0].Trim()
    if ($code) { $registered[$code] = $true }
}

# ── Find new CSV files ────────────────────────────────────────
$added = 0
Get-ChildItem $dataDir -Filter *.csv | Where-Object {
    $_.Name -notin @("01-bookNames.csv", "02-bookTags.csv")
} | ForEach-Object {
    $code = $_.BaseName
    if (-not $registered.ContainsKey($code)) {
        $enTitle = ConvertTo-TitleCase (Get-BookName $code)
        Write-Host "  + $code  →  $enTitle"
        $rows += "$code,,,$enTitle"
        $added++
    }
}

# ── Update titleEN for existing rows (if empty) ──────────────
$updated = 0
$newRows = foreach ($row in $rows) {
    $cols = $row -split ",", 4  # max 4 parts: code,ar,dv,en
    $code    = $cols[0].Trim()
    $titleAR = if ($cols.Count -gt 1) { $cols[1].Trim() } else { "" }
    $titleDV = if ($cols.Count -gt 2) { $cols[2].Trim() } else { "" }
    $titleEN = if ($cols.Count -gt 3) { $cols[3].Trim() } else { "" }

    if (-not $titleEN) {
        $derived = ConvertTo-TitleCase (Get-BookName $code)
        if ($derived) {
            Write-Host "  ~ $code  →  $derived"
            $titleEN = $derived
            $updated++
        }
    }

    "$code,$titleAR,$titleDV,$titleEN"
}

# ── Sort alphabetically by bookCode ───────────────────────────
$sorted = $newRows | Sort-Object { ($_ -split ",")[0].Trim() }

# ── Write back ────────────────────────────────────────────────
$output = @($header) + $sorted
$output -join "`r`n" | Out-File $csvPath -Encoding UTF8 -NoNewline

$total = $sorted.Count
Write-Host "Done. $total books ($added added, $updated titles updated), sorted by bookCode."
