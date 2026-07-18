# Update and sort bookNames.csv
#   - Reads known tag codes from 02-bookTags.csv
#   - Strips prefix tags and suffix flags from bookCode to derive titleEN
#   - Converts camelCase to Title Case (e.g. "aqidahNawawi" → "Aqidah Nawawi")
#   - Scans data/ for CSV files not yet registered and adds them
#   - Sorts alphabetically by bookCode

$csvPath    = Join-Path $PSScriptRoot "01-bookNames.csv"
$tagsPath   = Join-Path $PSScriptRoot "02-bookTags.csv"
$dataDir    = $PSScriptRoot

# ── Helpers for coloured output ──────────────────────────────
function Write-Section($text) {
    Write-Host "`n━━━ $text ━━━" -ForegroundColor Cyan
}
function Write-Add($text)    { Write-Host "  ✅ $text" -ForegroundColor Green }
function Write-Update($text) { Write-Host "  📝 $text" -ForegroundColor Yellow }
function Write-Rename($text) { Write-Host "  🔄 $text" -ForegroundColor Magenta }
function Write-Skip($text)   { Write-Host "  ⏭️  $text" -ForegroundColor DarkGray }
function Write-Info($text)   { Write-Host "    $text" -ForegroundColor Gray }

Write-Host "`n📚 Hadithmv — Update Book Metadata" -ForegroundColor White

# ── Load known tag codes from 02-bookTags.csv ────────────────
Write-Section "Loading tags"
$knownTags = @{}
if (Test-Path $tagsPath) {
    $tagList = @()
    Get-Content $tagsPath | Select-Object -Skip 1 | ForEach-Object {
        $line = $_.Trim()
        if ($line) {
            $code = ($line -split ",")[0].Trim()
            if ($code) { $knownTags[$code] = $true; $tagList += $code }
        }
    }
    Write-Info "$($tagList.Count) tags: $($tagList -join ', ')"
} else {
    Write-Skip "02-bookTags.csv not found"
}

# Known suffix flags to strip from end of bookCode
$suffixFlags = @("HDN", "DRAFT")

# ── Helper: camelCase → Title Case ───────────────────────────
function ConvertTo-TitleCase($name) {
    $spaced = $name -creplace '(?<=[a-z])(?=[A-Z])', ' '
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

    while ($start -lt $parts.Count -and $knownTags.ContainsKey($parts[$start])) {
        $start++
    }
    while ($end -ge $start -and $suffixFlags -contains $parts[$end]) {
        $end--
    }

    if ($start -le $end) {
        $nameParts = $parts[$start..$end]
        return ($nameParts -join '')
    }
    return ""
}

# ── Clean up " - Sheet1" suffixes ────────────────────────────
Write-Section "Cleaning filenames"
$renamed = 0
Get-ChildItem $dataDir -Filter "* - Sheet1.csv" | ForEach-Object {
    $newName = $_.Name -replace " - Sheet1\.csv$", ".csv"
    $newPath = Join-Path $dataDir $newName
    if (-not (Test-Path $newPath)) {
        Write-Rename "$($_.Name)  →  $newName"
        Rename-Item $_.FullName $newName
        $renamed++
    } else {
        Write-Rename "$($_.Name)  →  $newName (replacing existing)"
        Remove-Item $newPath -Force
        Rename-Item $_.FullName $newName
        $renamed++
    }
}
if ($renamed -eq 0) { Write-Info "nothing to rename" }

# ── Read existing registry ────────────────────────────────────
Write-Section "Reading registry"
$lines  = Get-Content $csvPath
$header = $lines[0]
$rows   = $lines[1..($lines.Count - 1)] | Where-Object { $_.Trim() -ne "" }

$registered = @{}
foreach ($row in $rows) {
    $code = ($row -split ",")[0].Trim()
    if ($code) { $registered[$code] = $true }
}
Write-Info "$($rows.Count) books in 01-bookNames.csv"

# ── Find new CSV files ────────────────────────────────────────
Write-Section "Scanning for new books"
$added = 0
Get-ChildItem $dataDir -Filter *.csv | Where-Object {
    $_.Name -notin @("01-bookNames.csv", "02-bookTags.csv")
} | ForEach-Object {
    $code = $_.BaseName
    if (-not $registered.ContainsKey($code)) {
        $enTitle = ConvertTo-TitleCase (Get-BookName $code)
        Write-Add "$code"
        Write-Info "titleEN → $enTitle"
        $rows += "$code,,,$enTitle"
        $added++
    }
}
if ($added -eq 0) { Write-Info "no new books found" }

# ── Update titleEN for existing rows (if empty) ──────────────
Write-Section "Filling missing titleEN"
$updated = 0
$newRows = foreach ($row in $rows) {
    $cols = $row -split ",", 4
    $code    = $cols[0].Trim()
    $titleAR = if ($cols.Count -gt 1) { $cols[1].Trim() } else { "" }
    $titleDV = if ($cols.Count -gt 2) { $cols[2].Trim() } else { "" }
    $titleEN = if ($cols.Count -gt 3) { $cols[3].Trim() } else { "" }

    if (-not $titleEN) {
        $derived = ConvertTo-TitleCase (Get-BookName $code)
        if ($derived) {
            Write-Update "$code  →  $derived"
            $titleEN = $derived
            $updated++
        }
    }

    "$code,$titleAR,$titleDV,$titleEN"
}
if ($updated -eq 0) { Write-Info "all titles already filled" }

# ── Sort alphabetically by bookCode ───────────────────────────
$sorted = $newRows | Sort-Object { ($_ -split ",")[0].Trim() }

# ── Write back ────────────────────────────────────────────────
$output = @($header) + $sorted
$output -join "`r`n" | Out-File $csvPath -Encoding UTF8 -NoNewline

$total = $sorted.Count
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "  📊 $total books total" -ForegroundColor White
if ($added -gt 0)   { Write-Host "  ✅ $added added" -ForegroundColor Green }
if ($updated -gt 0) { Write-Host "  📝 $updated titles filled" -ForegroundColor Yellow }
if ($renamed -gt 0) { Write-Host "  🔄 $renamed files renamed" -ForegroundColor Magenta }
if ($added -eq 0 -and $updated -eq 0 -and $renamed -eq 0) {
    Write-Host "  ✨ already up to date" -ForegroundColor Green
}
Write-Host ""
