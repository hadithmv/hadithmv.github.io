@echo off
rem Hadithmv Tools - one-click menu for the common site tasks.
rem Self-contained: each entry runs its command directly. The sibling
rem bats (dist-build.bat, rebuild-index.bat) remain as quick paths.
rem Requires: node on PATH (the preview option also needs Python).
title Hadithmv Tools
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 goto nonode

rem The book-registry script is BOM-less UTF-8 - Windows PowerShell 5.1
rem cannot parse it (mojibake breaks the parser). Prefer pwsh (PS 7).
set "PWR=powershell"
where pwsh >nul 2>&1
if not errorlevel 1 set "PWR=pwsh"

:menu
cls
title Hadithmv Tools
echo ============================================
echo  Hadithmv tools
echo ============================================
echo.
echo  1. Build the site        (full build - run before you commit)
echo  2. Rebuild search index  (so new books show up in search)
echo  3. Refresh freshness     (quick update for data-only changes)
echo  4. Refresh book data     (after adding or changing a book)
echo  5. Preview the site      (opens in your browser, like the live one)
echo  6. Quit
echo.
set "choice="
set /p "choice=Pick a number: "
if "%choice%"=="1" goto build
if "%choice%"=="2" goto index
if "%choice%"=="3" goto manifest
if "%choice%"=="4" goto refresh
if "%choice%"=="5" goto preview
if "%choice%"=="6" goto quit
echo.
echo Not a valid choice - try again.
pause >nul
goto menu

:build
title Hadithmv Tools - building the site
echo.
echo Building the site - the full pre-commit build. This prepares
echo the copy that visitors see (dist/) and takes about a minute.
echo.
node tools\dist-build.mjs
if errorlevel 1 goto fail
echo.
echo Build done. When you are happy with it, commit in your IDE.
pause
goto menu

:index
title Hadithmv Tools - rebuilding search index
echo.
echo Rebuilding the search index - run after adding or changing a
echo book, so it shows up in search.
echo.
node data\08-rebuild-searchIndex.mjs
if errorlevel 1 goto fail
echo.
echo Search index rebuilt.
pause
goto menu

:manifest
title Hadithmv Tools - refreshing freshness
echo.
echo Refreshing the freshness file (dist/manifest.json) - the quick
echo update for data-only changes, when you are skipping the build.
echo.
node tools\hmv-manifest.mjs
if errorlevel 1 goto fail
echo.
echo Freshness file refreshed.
pause
goto menu

:refresh
title Hadithmv Tools - refreshing book data
echo.
echo Refreshing book data - 3 steps. Make sure the book's CSV is
echo already in the content folder first.
echo.
echo Step 1 of 3 - updating the book registry (recomputes versions)...
"%PWR%" -NoProfile -ExecutionPolicy Bypass -File "data\04-update-bookRegistry.ps1"
if errorlevel 1 goto fail
echo Step 2 of 3 - rebuilding the search index...
node data\08-rebuild-searchIndex.mjs
if errorlevel 1 goto fail
echo Step 3 of 3 - refreshing the freshness file...
node tools\hmv-manifest.mjs
if errorlevel 1 goto fail
echo.
echo All three steps done.
pause
goto menu

:preview
title Hadithmv Tools - starting preview
echo.
echo Starting a local preview - a server window will open, and your
echo browser will show the built site, just like the live one.
echo Close the server window when you are done.
echo.
where python >nul 2>&1
if errorlevel 1 goto nopython
start "Hadithmv preview - close this window when done" python -m http.server 8899 --directory "%cd%"
if errorlevel 1 goto fail
start "" "http://127.0.0.1:8899/dist/books/"
echo.
echo Preview started. Close the server window when done, then press any key.
pause >nul
goto menu

:nopython
echo.
echo Python was not found - the preview needs Python. Install it from
echo python.org and try again.
pause
goto menu

:nonode
echo.
echo Node.js was not found - the build tools need it. Install it from
echo nodejs.org and run this again.
echo.
pause
exit /b 1

:fail
echo.
echo A step failed - read the error above. Nothing further was done.
pause
goto menu

:quit
echo Bye.
