# Update and sort 02-registry-bookMeta.csv
#   - Scans data/content/ for CSV files not yet registered and adds them
#     (titles left empty — all three titles are hand-authored)
#   - Recomputes each book's version hash from its content CSV
#   - Sorts alphabetically by bookCode

$csvPath = Join-Path $PSScriptRoot "02-registry-bookMeta.csv"
$tagsPath = Join-Path $PSScriptRoot "01-registry-bookTags.csv"
$dataDir = Join-Path $PSScriptRoot "content"  # book CSVs live in the content/ subfolder

# ── Helpers for coloured output ──────────────────────────────
function Write-Section($text) {
    Write-Host "`n━━━ $text ━━━" -ForegroundColor Cyan
}
function Write-Add($text) { Write-Host "  ✅ $text" -ForegroundColor Green }
function Write-Rename($text) { Write-Host "  🔄 $text" -ForegroundColor Magenta }
function Write-Skip($text) { Write-Host "  ⏭️  $text" -ForegroundColor DarkGray }
function Write-Info($text) { Write-Host "    $text" -ForegroundColor Gray }

Write-Host "`n📚 Hadithmv — Update Book Metadata" -ForegroundColor White

# Titles (AR/DV/EN) are hand-authored — the script never derives them.

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
Write-Info "$($rows.Count) books in 02-registry-bookMeta.csv"

# ── Find new CSV files ────────────────────────────────────────
Write-Section "Scanning for new books"
$added = 0
Get-ChildItem $dataDir -Filter *.csv | Where-Object {
    $_.Name -notin @("01-registry-bookTags.csv", "02-registry-bookMeta.csv", "04-registry-quranSurahs.csv", "05-registry-quranJuz.csv", "06-registry-quranColumns.csv")
} | ForEach-Object {
    $code = $_.BaseName
    if (-not $registered.ContainsKey($code)) {
        Write-Add "$code"
        $rows += "$code,,,,,,"  # code + 6 empty fields (titles, tags, excludeColumns); the version is swapped in below
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

# ── Recompute versions for all rows ──────────────────────────
Write-Section "Updating versions"
$newRows = foreach ($row in $rows) {
    # Book code = first token only — codes never contain commas. Everything
    # after it may be quoted and comma-containing (titles, tags, excludeColumns),
    # so the row is NEVER split and rebuilt — that mangles quoted fields
    # (e.g. ", with" inside a title loses its space).
    $code = ($row -split ",")[0].Trim()
    # Version = content hash (first 12 hex chars) of the book CSV — the app
    # validates its IndexedDB cache against this; empty = don't trust cache.
    # Lowercased to match the registry's committed casing (the client compares
    # version strings case-sensitively).
    $version = ""
    $csvFile = Join-Path $dataDir "$code.csv"
    if (Test-Path $csvFile) {
        $version = (Get-FileHash $csvFile -Algorithm SHA256).Hash.Substring(0, 12).ToLower()
    }
    # Swap the freshly computed version into the LAST field (12 hex, or empty
    # for a new row). Everything else in the row is preserved verbatim. The
    # pattern cannot match inside quoted cells — a closing quote isn't hex — so
    # the match position is always the true version field.
    $row -replace ",[0-9a-fA-F]{0,12}$", ",$version"
}

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
if ($renamed -gt 0) { Write-Host "  🔄 $renamed files renamed" -ForegroundColor Magenta }
if ($missing -gt 0) { Write-Host "  ⚠️  $missing missing CSV files" -ForegroundColor Red }
if ($added -eq 0 -and $renamed -eq 0 -and $missing -eq 0) {
    Write-Host "  ✨ already up to date" -ForegroundColor Green
}
Write-Host ""
