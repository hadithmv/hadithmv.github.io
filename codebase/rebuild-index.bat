@echo off
rem Hadithmv - rebuild data/search-index-manifest.json (the manifest) + the
rem per-book search shards (data/search-index/) from the book registries + CSVs.
rem Run after adding or changing a book, or after a registry update. Chain
rem it after the registry script (04-update-bookRegistry.ps1). Requires: node.
rem Output: data/search-index-manifest.json (manifest) + data/search-index/<book>.json
rem (shards) + data/search-index-report.md.
cd /d "%~dp0"
node data/08-rebuild-searchIndex.mjs
pause
