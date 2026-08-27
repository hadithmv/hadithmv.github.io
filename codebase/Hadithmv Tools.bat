@echo off
rem Hadithmv Tools - one-click menu for the common site tasks.
rem Self-contained: each entry runs its command directly. The sibling
rem bats (dist-build.bat, rebuild-index.bat) remain as quick paths.
rem Requires: node on PATH (the preview option also needs Python).
rem Colours need an ANSI console (Windows 10 or later); on older
rem consoles they degrade to harmless [92m-style text.
title Hadithmv Tools
cd /d "%~dp0"

rem Grab the escape character for ANSI colours - this keeps the file
rem itself plain ASCII; the colour byte is made at run time.
for /f %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "C_OFF=%ESC%[0m"
set "C_TITLE=%ESC%[92m"
set "C_ITEM=%ESC%[96m"
set "C_WARN=%ESC%[93m"
set "C_ERR=%ESC%[91m"

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
echo %C_TITLE%+----------------------------------------------+%C_OFF%
echo %C_TITLE%^|  Hadithmv tools                              ^|%C_OFF%
echo %C_TITLE%+----------------------------------------------+%C_OFF%
echo.
echo  %C_ITEM%1.%C_OFF% Build the site        (full build - run before you commit)
echo  %C_ITEM%2.%C_OFF% Rebuild search index  (so new books show up in search)
echo  %C_ITEM%3.%C_OFF% Refresh freshness     (quick update for data-only changes)
echo  %C_ITEM%4.%C_OFF% Refresh book data     (after adding or changing a book)
echo  %C_ITEM%5.%C_OFF% Preview the site      (opens in your browser, like the live one)
echo  %C_ITEM%6.%C_OFF% What's changed        (what git would put in your next commit)
echo  %C_ITEM%7.%C_OFF% Open the folder       (the codebase folder in Explorer)
echo  %C_ITEM%8.%C_OFF% Quit
echo.
set "choice="
set /p "choice=%C_WARN%Pick a number: %C_OFF%"
if "%choice%"=="1" goto build
if "%choice%"=="2" goto index
if "%choice%"=="3" goto manifest
if "%choice%"=="4" goto refresh
if "%choice%"=="5" goto preview
if "%choice%"=="6" goto changed
if "%choice%"=="7" goto openfolder
if "%choice%"=="8" goto quit
echo.
echo %C_ERR%Not a valid choice - try again.%C_OFF%
pause >nul
goto menu

:build
title Hadithmv Tools - building the site
set "FAILSTEP=build"
echo.
echo Building the site - the full pre-commit build. This prepares
echo the copy that visitors see (dist/) and takes about a minute.
echo.
node tools\dist-build.mjs
if errorlevel 1 goto fail
echo.
echo Build done. Size summary:
for /f "tokens=4,6,8,10,12 delims=*" %%a in ('type dist-build-report.md ^| findstr /c:"**Total**"') do echo   Files: %%a   Input: %%b   Output: %%c   Saved: %%d   Gzip: %%e
echo.
echo When you are happy with it, commit in your IDE.
echo %C_WARN%Tip: option 6 shows what git would put in your next commit.%C_OFF%
pause
goto menu

:index
title Hadithmv Tools - rebuilding search index
set "FAILSTEP=index"
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
set "FAILSTEP=manifest"
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
set "FAILSTEP=registry"
"%PWR%" -NoProfile -ExecutionPolicy Bypass -File "data\04-update-bookRegistry.ps1"
if errorlevel 1 goto fail
echo Step 2 of 3 - rebuilding the search index...
set "FAILSTEP=index"
node data\08-rebuild-searchIndex.mjs
if errorlevel 1 goto fail
echo Step 3 of 3 - refreshing the freshness file...
set "FAILSTEP=manifest"
node tools\hmv-manifest.mjs
if errorlevel 1 goto fail
echo.
echo All three steps done.
pause
goto menu

:preview
title Hadithmv Tools - starting preview
set "FAILSTEP=preview"
echo.
echo Starting a local preview - a server window will open, and your
echo browser will show the built site, just like the live one.
echo Close the server window when you are done.
echo.
where python >nul 2>&1
if errorlevel 1 goto nopython
set "PORT=8899"
netstat -ano | findstr ":8899" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 set "PORT=8898"
netstat -ano | findstr ":8898" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 set "PORT=8897"
netstat -ano | findstr ":8897" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 goto allbusy
echo.
echo Opening on http://127.0.0.1:%PORT%/dist/books/ (port %PORT% is free).
start "Hadithmv preview (port %PORT%) - close this window when done" python -m http.server %PORT% --directory "%cd%"
set "TRIES=0"
:waitport
ping -n 2 127.0.0.1 >nul
netstat -ano | findstr ":%PORT%" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 goto previewok
set /a TRIES+=1
if %TRIES% LSS 3 goto waitport
goto fail
:previewok
start "" "http://127.0.0.1:%PORT%/dist/books/"
echo.
echo Preview started. Close the server window when done, then press any key.
pause >nul
goto menu

:allbusy
echo.
echo %C_ERR%All three preview ports (8897-8899) are busy - close the other%C_OFF%
echo %C_ERR%preview window first, then try again.%C_OFF%
pause
goto menu

:changed
title Hadithmv Tools - what's changed
echo.
echo Here is what git would put in your next commit:
echo.
where git >nul 2>&1
if errorlevel 1 goto nogit
set "FAILSTEP=git"
set "ANYCHANGED="
git status --porcelain | findstr "." >nul 2>&1
if not errorlevel 1 set "ANYCHANGED=1"
if not defined ANYCHANGED goto clean
git status --porcelain
if errorlevel 1 goto fail
set "SRCCHANGED="
git status --porcelain -- src static | findstr "." >nul 2>&1
if not errorlevel 1 set "SRCCHANGED=1"
set "DISTCHANGED="
git status --porcelain -- dist | findstr "." >nul 2>&1
if not errorlevel 1 set "DISTCHANGED=1"
set "DATACHANGED="
git status --porcelain -- data | findstr "." >nul 2>&1
if not errorlevel 1 set "DATACHANGED=1"
echo.
if defined SRCCHANGED if not defined DISTCHANGED echo %C_WARN%Hint: you changed source files but did not build - run option 1 first.%C_OFF%
if defined DATACHANGED echo %C_WARN%Hint: you changed book data - run option 4 to refresh it.%C_OFF%
echo.
pause
goto menu

:clean
echo.
echo Nothing changed - the tree is clean.
echo.
pause
goto menu

:nogit
echo.
echo %C_ERR%Git was not found - this option needs git. Install it from%C_OFF%
echo %C_ERR%git-scm.com and try again.%C_OFF%
pause
goto menu

:openfolder
title Hadithmv Tools - opening the folder
echo.
echo Opening the codebase folder in Explorer...
start "" explorer "%cd%"
echo.
echo Done - press any key to go back to the menu.
pause >nul
goto menu

:nopython
echo.
echo %C_ERR%Python was not found - the preview needs Python. Install it from%C_OFF%
echo %C_ERR%python.org and try again.%C_OFF%
pause
goto menu

:nonode
echo.
echo %C_ERR%Node.js was not found - the build tools need it. Install it from%C_OFF%
echo %C_ERR%nodejs.org and run this again.%C_OFF%
echo.
pause
exit /b 1

:fail
echo.
echo %C_ERR%A step failed - read the error above. Nothing further was done.%C_OFF%
if "%FAILSTEP%"=="build" echo %C_WARN%Hint: the error above names the file - usually a syntax error.%C_OFF%
if "%FAILSTEP%"=="index" echo %C_WARN%Hint: the error above names the data file causing trouble.%C_OFF%
if "%FAILSTEP%"=="manifest" echo %C_WARN%Hint: this step is very quick - the error above is the whole story.%C_OFF%
if "%FAILSTEP%"=="registry" echo %C_WARN%Hint: is the book's CSV already in the content folder?%C_OFF%
if "%FAILSTEP%"=="preview" echo %C_WARN%Hint: check that Python is installed and that the port is free.%C_OFF%
if "%FAILSTEP%"=="git" echo %C_WARN%Hint: git reported the error above itself.%C_OFF%
pause
goto menu

:quit
echo %C_TITLE%Bye.%C_OFF%
