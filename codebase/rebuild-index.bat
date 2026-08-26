@echo off
rem Hadithmv - rebuild data/search-index.json from the book registries + CSVs.
rem Run after adding or changing a book, or after a registry update. Chain
rem it after the registry script (04-update-bookRegistry.ps1). Requires: node.
rem Output: data/search-index.json + data/search-index-report.md.
cd /d "%~dp0"
node data/08-rebuild-searchIndex.mjs
pause
