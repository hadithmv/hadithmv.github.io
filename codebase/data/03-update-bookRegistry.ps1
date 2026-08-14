# Update and sort 02-registry-bookMeta.csv
#   - Scans data/content/ for CSV files not yet registered and adds them
#     (titles left empty — all three titles are hand-authored)
#   - Converts CRLF line endings in book CSVs to LF before hashing — exactly
#     git's clean filter, so versions always describe the LF bytes that GitHub
#     Pages actually serves (bare CRs inside quoted fields are data, kept)
#   - Recomputes each book's version hash from its content CSV
#   - Sorts alphabetically by bookCode; writes the registry as LF, no BOM
#   - NEVER touches 01-registry-bookTags.csv — tag order (and the
#     auto-assigned palette colours, which follow file order) is hand-controlled

$csvPath = Join-Path $PSScriptRoot "02-registry-bookMeta.csv"
$dataDir = Join-Path $PSScriptRoot "content"  # book CSVs live in the content/ subfolder
$utf8 = New-Object System.Text.UTF8Encoding($false)  # no-BOM UTF-8 for registry reads/writes (PS 5.1's -Encoding UTF8 adds a BOM)

# Virtual books: registered in 02 with a card, but no content CSV — their rows
# are assembled in memory at load (see js/radheef-merge.js). Skip the
# missing-file warning for these; keep the list in sync with that module.
$virtualBooks = @("RDF-all")

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
$lines = [System.IO.File]::ReadAllLines($csvPath, $utf8)  # handles LF or CRLF; strips any BOM
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
        $rows += "$code,,,,,,"  # code + 6 empty fields (titles, tags, excludeFromIndex); the version is swapped in below
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
    if (-not (Test-Path $csvFile) -and $virtualBooks -notcontains $code) {
        Write-Warning "  ⚠️  $code  —  registered but CSV file missing"
        $missing++
    }
}
if ($missing -eq 0) { Write-Info "all registered books have CSV files" }

# ── Normalize line endings in book CSVs ─────────────────────────
# Book blobs are LF; version hashes come from raw disk bytes — a CRLF-ized
# file (Windows editor re-save) would make the version describe bytes that
# GitHub Pages never serves, and line-ending-only re-saves would churn the
# version. Convert CRLF→LF (byte-level, encoding-agnostic — preserves UTF-8
# text, no BOM, no-trailing-newline, and bare CRs inside quoted fields, which
# several blobs legitimately contain) before hashing; skip files without CRLF
# so clean runs stay byte-identical (idempotency).
Write-Section "Normalizing line endings"
$normalized = 0
# Latin-1 (28591) maps every byte 1:1 to a char, so decode → strip → re-encode
# is byte-exact without touching the file's actual UTF-8, and Contains/Replace
# are native — no per-byte PowerShell loop (a foreach over ~40 MB of bytes
# takes minutes; this runs in seconds).
$latin1 = [System.Text.Encoding]::GetEncoding(28591)
Get-ChildItem $dataDir -Filter "*.csv" | ForEach-Object {
    $text = $latin1.GetString([System.IO.File]::ReadAllBytes($_.FullName))
    # Convert only CRLF line endings to LF — exactly what git's clean filter
    # (core.autocrlf) does. Bare CRs inside quoted fields are DATA: several
    # committed blobs contain them (RDF-ahmadFahmyDidi etc.), and a blanket
    # 0x0D strip corrupts those files (verified 2026-08-09: 10 books affected,
    # restored from the git blobs).
    if ($text.Contains("`r`n")) {
        $clean = $text.Replace("`r`n", "`n")
        [System.IO.File]::WriteAllBytes($_.FullName, $latin1.GetBytes($clean))
        Write-Add "$($_.Name) — converted $($text.Length - $clean.Length) CRLF endings to LF"
        $normalized++
    }
}
if ($normalized -eq 0) { Write-Info "all book CSVs already LF" }

# ── Recompute versions for all rows ──────────────────────────
Write-Section "Updating versions"
$newRows = foreach ($row in $rows) {
    # Book code = first token only — codes never contain commas. Everything
    # after it may be quoted and comma-containing (titles, tags, excludeFromIndex),
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
# Only the book registry is written. 01-registry-bookTags.csv is never
# rewritten: its row order is the palette slot assignment for the
# auto-generated tag colours, so the user controls it by hand.
$output = @($header) + $sorted
[System.IO.File]::WriteAllText($csvPath, ($output -join "`n"), $utf8)  # LF, no BOM, no trailing newline

$total = $sorted.Count
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "  📊 $total books total" -ForegroundColor White
if ($added -gt 0) { Write-Host "  ✅ $added added" -ForegroundColor Green }
if ($renamed -gt 0) { Write-Host "  🔄 $renamed files renamed" -ForegroundColor Magenta }
if ($missing -gt 0) { Write-Host "  ⚠️  $missing missing CSV files" -ForegroundColor Red }
if ($normalized -gt 0) { Write-Host "  ✅ $normalized files normalized to LF" -ForegroundColor Green }
if ($added -eq 0 -and $renamed -eq 0 -and $missing -eq 0 -and $normalized -eq 0) {
    Write-Host "  ✨ already up to date" -ForegroundColor Green
}
Write-Host ""
