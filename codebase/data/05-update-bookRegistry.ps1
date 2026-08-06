# Update and sort bookNames.csv
#   - Reads known tag codes from 01-registry-bookTags.csv
#   - Strips prefix tags and suffix flags from bookCode to derive titleEN
#   - Converts camelCase to Title Case (e.g. "aqidahNawawi" → "Aqidah Nawawi")
#   - Scans data/content/ for CSV files not yet registered and adds them
#   - Sorts alphabetically by bookCode

$csvPath = Join-Path $PSScriptRoot "02-registry-bookNames.csv"
$tagsPath = Join-Path $PSScriptRoot "01-registry-bookTags.csv"
$dataDir = Join-Path $PSScriptRoot "content"  # book CSVs live in the content/ subfolder

# ── Helpers for coloured output ──────────────────────────────
function Write-Section($text) {
    Write-Host "`n━━━ $text ━━━" -ForegroundColor Cyan
}
function Write-Add($text) { Write-Host "  ✅ $text" -ForegroundColor Green }
function Write-Update($text) { Write-Host "  📝 $text" -ForegroundColor Yellow }
function Write-Rename($text) { Write-Host "  🔄 $text" -ForegroundColor Magenta }
function Write-Skip($text) { Write-Host "  ⏭️  $text" -ForegroundColor DarkGray }
function Write-Info($text) { Write-Host "    $text" -ForegroundColor Gray }

Write-Host "`n📚 Hadithmv — Update Book Metadata" -ForegroundColor White

# ── Load known tag codes from 01-registry-bookTags.csv ────────────────
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
}
else {
    Write-Skip "01-registry-bookTags.csv not found"
}

# Known suffix flags to strip from end of bookCode
$suffixFlags = @("HDN", "DSC")

# ── Helper: prefix based on tags ─────────────────────────────
function Get-TitlePrefix($code) {
    $parts = $code -split '-'
    $tags = @()
    foreach ($p in $parts) {
        if ($knownTags.ContainsKey($p)) { $tags += $p }
        else { break }
    }
    if ($tags -contains "KNSH") { return "Kunnaasha " }
    if ($tags -contains "RDF" -and $tags -notcontains "AQD") { return "Radheef " }
    return ""
}

# ── Helper: camelCase → Title Case ───────────────────────────
function ConvertTo-TitleCase($name) {
    $spaced = $name -creplace '(?<=[a-z])(?=[A-Z])', ' '
    $words = $spaced -split ' ' | Where-Object { $_ }
    $titled = ($words | ForEach-Object {
            if ($_.Length -gt 0) {
                $_.Substring(0, 1).ToUpper() + $_.Substring(1).ToLower()
            }
            else { $_ }
        }) -join ' '
    return $titled
}

# ── Helper: extract book name from bookCode ──────────────────
function Get-BookName($code) {
    $parts = $code -split '-'
    $start = 0
    $end = $parts.Count - 1

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

# ── Clean up " - Sheet1" / " - Worksheet" suffixes ────────────
Write-Section "Cleaning filenames"
$renamed = 0
Get-ChildItem $dataDir -Filter "*.csv" | ForEach-Object {
    $newName = $_.Name -replace " - (Sheet|Worksheet)\d*\.csv$", ".csv"
    if ($newName -ne $_.Name) {
        $newPath = Join-Path $dataDir $newName
        if (-not (Test-Path $newPath)) {
            Write-Rename "$($_.Name)  →  $newName"
            Rename-Item $_.FullName $newName
            $renamed++
        }
        else {
            Write-Rename "$($_.Name)  →  $newName (replacing existing)"
            Remove-Item $newPath -Force
            Rename-Item $_.FullName $newName
            $renamed++
        }
    }
}
if ($renamed -eq 0) { Write-Info "nothing to rename" }

# ── Read existing registry ────────────────────────────────────
Write-Section "Reading registry"
$lines = Get-Content $csvPath
$header = $lines[0]
$rows = $lines[1..($lines.Count - 1)] | Where-Object { $_.Trim() -ne "" }

$registered = @{}
foreach ($row in $rows) {
    $code = ($row -split ",")[0].Trim()
    if ($code) { $registered[$code] = $true }
}
Write-Info "$($rows.Count) books in 02-registry-bookNames.csv"

# ── Find new CSV files ────────────────────────────────────────
Write-Section "Scanning for new books"
$added = 0
Get-ChildItem $dataDir -Filter *.csv | Where-Object {
    $_.Name -notin @("02-registry-bookNames.csv", "01-registry-bookTags.csv", "03-registry-quranColumns.csv", "04-registry-quranSurahs.csv")
} | ForEach-Object {
    $code = $_.BaseName
    if (-not $registered.ContainsKey($code)) {
        $enTitle = (Get-TitlePrefix $code) + (ConvertTo-TitleCase (Get-BookName $code))
        Write-Add "$code"
        Write-Info "titleEN → $enTitle"
        $rows += "$code,,,$enTitle,,"
        $added++
    }
}
if ($added -eq 0) { Write-Info "no new books found" }

# ── Check for orphaned registry entries ──────────────────────
Write-Section "Checking for missing CSV files"
$missing = 0
foreach ($row in $rows) {
    $code = ($row -split ",")[0].Trim()
    $csvFile = Join-Path $dataDir "$code.csv"
    if (-not (Test-Path $csvFile)) {
        Write-Warning "  ⚠️  $code  —  registered but CSV file missing"
        $missing++
    }
}
if ($missing -eq 0) { Write-Info "all registered books have CSV files" }

# ── Update titleEN for existing rows (if empty) ──────────────
Write-Section "Filling missing titleEN"
$updated = 0
$newRows = foreach ($row in $rows) {
    # No split limit — the trailing `tags` column (comma-separated codes)
    # must be preserved, not dropped on rewrite
    $cols = $row -split ","
    $code = $cols[0].Trim()
    $titleAR = if ($cols.Count -gt 1) { $cols[1].Trim() } else { "" }
    $titleDV = if ($cols.Count -gt 2) { $cols[2].Trim() } else { "" }
    $titleEN = if ($cols.Count -gt 3) { $cols[3].Trim() } else { "" }
    $tags = if ($cols.Count -gt 4) { (($cols[4..($cols.Count - 1)]) | ForEach-Object { $_.Trim() }) -join "," } else { "" }
    # Version = content hash (first 12 hex chars) of the book CSV — the app
    # validates its IndexedDB cache against this; empty = don't trust cache
    $version = ""
    $csvFile = Join-Path $dataDir "$code.csv"
    if (Test-Path $csvFile) {
        $version = (Get-FileHash $csvFile -Algorithm SHA256).Hash.Substring(0, 12)
    }

    if (-not $titleEN) {
        $derived = (Get-TitlePrefix $code) + (ConvertTo-TitleCase (Get-BookName $code))
        if ($derived) {
            Write-Update "$code  →  $derived"
            $titleEN = $derived
            $updated++
        }
    }

    "$code,$titleAR,$titleDV,$titleEN,$tags,$version"
}
if ($updated -eq 0) { Write-Info "all titles already filled" }

# ── Sort alphabetically by bookCode ───────────────────────────
$sorted = $newRows | Sort-Object { ($_ -split ",")[0].Trim() }

# ── Write back ────────────────────────────────────────────────
$output = @($header) + $sorted
$output -join "`r`n" | Out-File $csvPath -Encoding UTF8 -NoNewline

# ── Sort tag registry alphabetically by code ──────────────────
# Keeps 01-registry-bookTags.csv tidy on every run, like the book
# registry above. Note: palette slot assignment follows file order —
# sorting shifts the auto-generated colours (they are not stored anywhere).
Write-Section "Sorting tag registry"
$tagLines = Get-Content $tagsPath
$tagHeader = $tagLines[0]
$tagRows = $tagLines[1..($tagLines.Count - 1)] | Where-Object { $_.Trim() -ne "" }
$tagSorted = $tagRows | Sort-Object { ($_ -split ",")[0].Trim() }
# MUST join before Out-File -NoNewline: an array piped to Out-File with
# -NoNewline is written as one concatenated line (no separators) — the
# same pitfall the book registry avoids by joining first.
(@($tagHeader) + $tagSorted) -join "`r`n" | Out-File $tagsPath -Encoding UTF8 -NoNewline
Write-Info "$($tagSorted.Count) tags sorted"

$total = $sorted.Count
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "  📊 $total books total" -ForegroundColor White
if ($added -gt 0) { Write-Host "  ✅ $added added" -ForegroundColor Green }
if ($updated -gt 0) { Write-Host "  📝 $updated titles filled" -ForegroundColor Yellow }
if ($renamed -gt 0) { Write-Host "  🔄 $renamed files renamed" -ForegroundColor Magenta }
if ($missing -gt 0) { Write-Host "  ⚠️  $missing missing CSV files" -ForegroundColor Red }
if ($added -eq 0 -and $updated -eq 0 -and $renamed -eq 0 -and $missing -eq 0) {
    Write-Host "  ✨ already up to date" -ForegroundColor Green
}
Write-Host ""
