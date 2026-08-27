@echo off
rem Hadithmv Toolbox - one-click menu for the common site tasks.
rem Self-contained: each entry runs its command directly. The sibling
rem bats (dist-build.bat, rebuild-index.bat) remain as quick paths.
rem Requires: node on PATH (the preview option also needs Python).
rem Colours need an ANSI console (Windows 10 or later); on older
rem consoles they degrade to harmless [92m-style text.
rem Run with a number argument to jump straight to an option,
rem e.g. "Hadithmv Toolbox.bat 5" opens the preview directly.
rem The sound setting lives in %USERPROFILE%\.hadithmv-tools -
rem outside the repo on purpose, so it never shows in git status.
title Hadithmv Toolbox
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

rem Read the site version from the same file the sidebar shows
rem (via tools\hmv-version.mjs), so the menu can never drift from
rem the site. VER = source version, VERD = built copy (dist) version.
set "VER="
set "VERD="
rem Tokens: source version | dist version | branch padding | git branch
rem (the branch and its right-aligned padding come from hmv-version.mjs, so
rem no branch characters ever travel through cmd's parser).
for /f "tokens=1,2,3,4 delims=|" %%v in ('node tools\hmv-version.mjs') do set "VER=%%v"&set "VERD=%%w"&set "BRPAD=%%x"&set "BRANCH=%%y"

rem The sound on/off flag, kept in the user profile.
set "MUTE="
if exist "%USERPROFILE%\.hadithmv-tools" for /f "usebackq delims=" %%m in ("%USERPROFILE%\.hadithmv-tools") do set "MUTE=%%m"

rem A number argument jumps straight to that option.
if not "%~1"=="" set "choice=%~1"
if not "%~1"=="" goto dispatch

:menu
cls
title Hadithmv Toolbox
echo %C_TITLE%+--------------------------------------------------+%C_OFF%
rem Version in cyan (C_ITEM - meta info), branch right-aligned in plain
rem white (BRPAD comes from hmv-version.mjs; the pad spaces inherit the
rem green title colour, which is invisible - only the branch is coloured).
if defined VER if defined BRANCH echo %C_TITLE%^|  Hadithmv Toolbox - %C_ITEM%%VER%%C_TITLE%%BRPAD%%C_OFF%%BRANCH%%C_TITLE%^|%C_OFF%
if defined VER if not defined BRANCH echo %C_TITLE%^|  Hadithmv Toolbox - %C_ITEM%%VER%%C_TITLE%                      ^|%C_OFF%
if not defined VER echo %C_TITLE%^|  Hadithmv Toolbox                                ^|%C_OFF%
echo %C_TITLE%+--------------------------------------------------+%C_OFF%
if not "%VER%"=="" if "%VERD%"=="" echo %C_WARN%Warning: no built copy (dist) yet - run option 1.%C_OFF%
if not "%VER%"=="" if not "%VERD%"=="" if not "%VER%"=="%VERD%" echo %C_WARN%Warning: the built copy (dist) is behind the source (%VERD% vs %VER%) - run option 1 before you commit.%C_OFF%
echo.
echo  %C_ITEM%1.%C_OFF% Build the site        (full build - run before you commit)
echo  %C_ITEM%2.%C_OFF% Rebuild search index  (so new books show up in search)
echo  %C_ITEM%3.%C_OFF% Refresh freshness     (quick update for data-only changes)
echo  %C_ITEM%4.%C_OFF% Refresh book data     (after adding or changing a book)
echo  %C_ITEM%5.%C_OFF% Preview the site      (opens in your browser, like the live one)
echo  %C_ITEM%6.%C_OFF% What's changed        (what git would put in your next commit)
echo  %C_ITEM%7.%C_OFF% Tidy build reports    (undo the report changes from a build)
echo  %C_ITEM%8.%C_OFF% Open the folder       (the codebase folder in Explorer)
echo  %C_ITEM%9.%C_OFF% Build and preview     (build, then open the preview)
echo  %C_ITEM%10.%C_OFF% Run the checks       (the pre-commit verification battery)
echo  %C_ITEM%11.%C_OFF% About / health check (versions and tools on this machine)
echo  %C_ITEM%12.%C_OFF% Check the live site  (is the published site up to date?)
echo  %C_ITEM%13.%C_OFF% Quit
echo.
set "choice="
set /p "choice=%C_WARN%Pick a number: %C_OFF%"
:dispatch
if "%choice%"=="1" goto build
if "%choice%"=="2" goto index
if "%choice%"=="3" goto manifest
if "%choice%"=="4" goto refresh
if "%choice%"=="5" goto preview
if "%choice%"=="6" goto changed
if "%choice%"=="7" goto tidy
if "%choice%"=="8" goto openfolder
if "%choice%"=="9" goto buildpreview
if "%choice%"=="10" goto checks
if "%choice%"=="11" goto about
if "%choice%"=="12" goto livecheck
if "%choice%"=="13" goto quit
echo.
echo %C_ERR%Not a valid choice - try again.%C_OFF%
pause >nul
goto menu

:build
title Hadithmv Toolbox - building the site
set "FAILSTEP=build"
echo.
echo Building the site - the full pre-commit build. This prepares
echo the copy that visitors see (dist/) and takes about a minute.
echo.
for /f %%t in ('node -e "process.stdout.write(String(Math.round(Date.now()/1000)))"') do set "T0=%%t"
node tools\dist-build.mjs
if errorlevel 1 goto fail
if not "%MUTE%"=="1" node -e "process.stdout.write(String.fromCharCode(7,7))"
for /f %%t in ('node -e "process.stdout.write(String(Math.round(Date.now()/1000)))"') do set "T1=%%t"
if defined T0 if defined T1 set /a ELAPSED=%T1%-%T0
echo.
if defined ELAPSED (echo Build done in %ELAPSED% seconds. Size summary:) else (echo Build done. Size summary:)
for /f "tokens=4,6,8,10,12 delims=*" %%a in ('type dist-build-report.md ^| findstr /c:"**Total**"') do echo   Files: %%a   Input: %%b   Output: %%c   Saved: %%d   Gzip: %%e
echo.
echo When you are happy with it, commit in your IDE.
echo %C_WARN%Tip: option 6 shows what git would put in your next commit.%C_OFF%
pause
goto menu

:buildpreview
title Hadithmv Toolbox - building and previewing
set "FAILSTEP=build"
echo.
echo Building the site, then opening the preview...
echo.
for /f %%t in ('node -e "process.stdout.write(String(Math.round(Date.now()/1000)))"') do set "T0=%%t"
node tools\dist-build.mjs
if errorlevel 1 goto fail
if not "%MUTE%"=="1" node -e "process.stdout.write(String.fromCharCode(7,7))"
for /f %%t in ('node -e "process.stdout.write(String(Math.round(Date.now()/1000)))"') do set "T1=%%t"
if defined T0 if defined T1 set /a ELAPSED=%T1%-%T0
echo.
if defined ELAPSED (echo Build done in %ELAPSED% seconds - opening the preview now.) else (echo Build done - opening the preview now.)
goto preview

:index
title Hadithmv Toolbox - rebuilding search index
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
title Hadithmv Toolbox - refreshing freshness
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
title Hadithmv Toolbox - refreshing book data
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
title Hadithmv Toolbox - starting preview
set "FAILSTEP=preview"
echo.
echo Starting a local preview - a server window will open, and your
echo browser will show the built site, just like the live one.
echo Close the server window when you are done.
echo.
where python >nul 2>&1
if errorlevel 1 goto nopython
netstat -ano | findstr ":8897" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 goto previewrunning
netstat -ano | findstr ":8898" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 goto previewrunning
netstat -ano | findstr ":8899" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 goto previewrunning
set "PORT=8899"
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
:previewrunning
echo.
echo A preview server is already running on one of the preview ports.
echo If that is the preview from earlier, just press F5 in that tab
echo to see the newest build. If it is something else, close it
echo first, then try again.
pause
goto menu

:changed
title Hadithmv Toolbox - what's changed
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

:tidy
title Hadithmv Toolbox - tidying the build reports
echo.
echo Tidy the build reports (dist-build-report.md and
echo font-build-report.md) to their committed state - handy when
echo the build itself was not the point of your change.
echo.
where git >nul 2>&1
if errorlevel 1 goto nogit
git status --porcelain -- dist-build-report.md font-build-report.md | findstr "." >nul 2>&1
if errorlevel 1 (
  echo The build reports are already clean - nothing to tidy.
) else (
  git checkout -- dist-build-report.md font-build-report.md
  echo Reports restored - they no longer show in "what's changed".
)
pause
goto menu

:openfolder
title Hadithmv Toolbox - opening the folder
echo.
echo Opening the codebase folder in Explorer...
start "" explorer "%cd%"
echo.
echo Done - press any key to go back to the menu.
pause >nul
goto menu

:checks
title Hadithmv Toolbox - running the checks
echo.
echo Running the pre-commit checks - each opens an invisible browser
echo and clicks through a part of the site. This takes a few minutes.
echo.
set "CHECKS_FAILED="
set "FAILED_LIST="
set "RPT=%~dp0checks-report.txt"
set "T0="
set "T1="
set "ELAPSED="
for /f %%t in ('node -e "process.stdout.write(String(Math.round(Date.now()/1000)))"') do set "T0=%%t"
del "%RPT%" >nul 2>&1
(
  echo Hadithmv Toolbox - checks report
  echo Run date: %date% %time%
  echo Source: %VER%   Built copy: %VERD%   Branch: %BRANCH%
  echo ============================================================
) > "%RPT%"
echo  1/7 - the reader smoke test (clicks through the Quran reader)...
node tools\hmv-qrn-smoke.mjs > "%TEMP%\hmv-check1.log" 2>&1
set "R1=PASS"
if errorlevel 1 (set "CHECKS_FAILED=1"&set "FAILED_LIST=%FAILED_LIST% reader"&set "R1=FAIL")
type "%TEMP%\hmv-check1.log"
echo.
echo  2/7 - the info modal battery...
node tools\hmv-info-check.mjs > "%TEMP%\hmv-check2.log" 2>&1
set "R2=PASS"
if errorlevel 1 (set "CHECKS_FAILED=1"&set "FAILED_LIST=%FAILED_LIST% info"&set "R2=FAIL")
type "%TEMP%\hmv-check2.log"
echo.
echo  3/7 - the authors and periods battery...
node tools\hmv-authors-check.mjs > "%TEMP%\hmv-check3.log" 2>&1
set "R3=PASS"
if errorlevel 1 (set "CHECKS_FAILED=1"&set "FAILED_LIST=%FAILED_LIST% authors"&set "R3=FAIL")
type "%TEMP%\hmv-check3.log"
echo.
echo  4/7 - the library scope battery...
node tools\hmv-libscope-check.mjs > "%TEMP%\hmv-check4.log" 2>&1
set "R4=PASS"
if errorlevel 1 (set "CHECKS_FAILED=1"&set "FAILED_LIST=%FAILED_LIST% library"&set "R4=FAIL")
type "%TEMP%\hmv-check4.log"
echo.
echo  5/7 - the service worker battery...
node tools\hmv-sw-check.mjs > "%TEMP%\hmv-check5.log" 2>&1
set "R5=PASS"
if errorlevel 1 (set "CHECKS_FAILED=1"&set "FAILED_LIST=%FAILED_LIST% service-worker"&set "R5=FAIL")
type "%TEMP%\hmv-check5.log"
echo.
echo  6/7 - the table-of-contents scan...
node tools\hmv-toc-scan.cjs > "%TEMP%\hmv-check6.log" 2>&1
set "R6=PASS"
if errorlevel 1 (set "CHECKS_FAILED=1"&set "FAILED_LIST=%FAILED_LIST% contents"&set "R6=FAIL")
type "%TEMP%\hmv-check6.log"
echo.
where python >nul 2>&1
if errorlevel 1 goto nofontcheck
echo  7/7 - the font coverage check (the webfont vs the site's text)...
python tools\hmv-font-subset.py --check > "%TEMP%\hmv-check7.log" 2>&1
set "R7=PASS"
if errorlevel 1 (set "CHECKS_FAILED=1"&set "FAILED_LIST=%FAILED_LIST% font"&set "R7=FAIL")
type "%TEMP%\hmv-check7.log"
echo.
goto checksdone
:nofontcheck
echo  7/7 - the font coverage check skipped - python not found.
set "R7=SKIP"
echo Skipped: python not found. > "%TEMP%\hmv-check7.log"
:checksdone
for /f %%t in ('node -e "process.stdout.write(String(Math.round(Date.now()/1000)))"') do set "T1=%%t"
if defined T0 if defined T1 set /a ELAPSED=%T1%-%T0
set "RUNTIME="
if defined ELAPSED set "RUNTIME=%ELAPSED% seconds"
(
  echo.
  echo === 1/7 reader smoke test - %R1% ===
  type "%TEMP%\hmv-check1.log"
  echo.
  echo === 2/7 info modal battery - %R2% ===
  type "%TEMP%\hmv-check2.log"
  echo.
  echo === 3/7 authors and periods battery - %R3% ===
  type "%TEMP%\hmv-check3.log"
  echo.
  echo === 4/7 library scope battery - %R4% ===
  type "%TEMP%\hmv-check4.log"
  echo.
  echo === 5/7 service worker battery - %R5% ===
  type "%TEMP%\hmv-check5.log"
  echo.
  echo === 6/7 table-of-contents scan - %R6% ===
  type "%TEMP%\hmv-check6.log"
  echo.
  echo === 7/7 font coverage check - %R7% ===
  type "%TEMP%\hmv-check7.log"
  echo.
  echo ============================================================
  if defined RUNTIME echo Total run time: %RUNTIME%
  if defined CHECKS_FAILED (
    echo Verdict: SOME CHECKS FAILED - %FAILED_LIST:~1%
  ) else (
    echo Verdict: ALL CHECKS PASSED
  )
) >> "%RPT%"
del "%TEMP%\hmv-check1.log" "%TEMP%\hmv-check2.log" "%TEMP%\hmv-check3.log" "%TEMP%\hmv-check4.log" "%TEMP%\hmv-check5.log" "%TEMP%\hmv-check6.log" "%TEMP%\hmv-check7.log" >nul 2>&1
echo.
if defined CHECKS_FAILED (
  if not "%MUTE%"=="1" "%PWR%" -NoProfile -Command "[console]::beep(180,450); Start-Sleep -m 120; [console]::beep(180,450)"
  echo %C_ERR%Some checks failed:%C_OFF% %FAILED_LIST:~1%
  echo %C_WARN%The full report is in checks-report.txt - opening it now.%C_OFF%
  start "" notepad "%RPT%"
) else (
  if not "%MUTE%"=="1" node -e "process.stdout.write(String.fromCharCode(7,7))"
  echo %C_ITEM%All checks passed.%C_OFF%
  echo %C_ITEM%Report saved to checks-report.txt.%C_OFF%
)
pause
goto menu

:about
title Hadithmv Toolbox - about
set "NODEV="
where node >nul 2>&1
if not errorlevel 1 for /f "delims=" %%n in ('node --version 2^>nul') do set "NODEV=%%n"
set "PYV="
where python >nul 2>&1
if not errorlevel 1 for /f "delims=" %%p in ('python --version 2^>^&1') do set "PYV=%%p"
set "GITV="
where git >nul 2>&1
if not errorlevel 1 for /f "delims=" %%g in ('git --version 2^>nul') do set "GITV=%%g"
echo.
echo  Site version (source):  %C_ITEM%%VER%%C_OFF%
echo  Built copy (dist):      %C_ITEM%%VERD%%C_OFF%
if not "%VER%"=="" if "%VERD%"=="" echo  %C_WARN%There is no dist yet - run option 1.%C_OFF%
if not "%VER%"=="" if not "%VERD%"=="" if not "%VER%"=="%VERD%" echo  %C_WARN%dist is behind source - run option 1.%C_OFF%
echo  Folder:                 %cd%
if defined BRANCH echo  Branch:                 %BRANCH%
if "%MUTE%"=="1" (echo  Sound:                  off) else (echo  Sound:                  on)
echo.
echo  Tools on this machine:
if defined NODEV (echo   %C_ITEM%%NODEV%%C_OFF%   node - needed for options 1-4 and 9) else (echo   %C_ERR%node not found%C_OFF% - install from nodejs.org)
if defined PYV (echo   %C_ITEM%%PYV%%C_OFF%   python - needed for option 5) else (echo   %C_ERR%python not found%C_OFF% - install from python.org)
if defined GITV (echo   %C_ITEM%%GITV%%C_OFF%   git - needed for options 6, 7 and 12) else (echo   %C_ERR%git not found%C_OFF% - install from git-scm.com)
echo   %C_ITEM%%PWR%%C_OFF%   shell - used for option 4
echo.
echo  Press S to switch the sound on or off, any other key for the menu.
set "AK="
set /p "AK=%C_WARN%> %C_OFF%"
if /i "%AK%"=="S" goto togglesound
goto menu
:togglesound
if "%MUTE%"=="1" (set "MUTE=0") else (set "MUTE=1")
> "%USERPROFILE%\.hadithmv-tools" echo %MUTE%
goto about

:livecheck
title Hadithmv Toolbox - checking the live site
echo.
echo Checking the published site (needs internet)...
set "LIVEVER="
for /f "delims=" %%l in ('node tools\hmv-version.mjs live') do set "LIVEVER=%%l"
echo.
if "%LIVEVER%"=="" (
  echo %C_ERR%Could not reach the live site - check the internet connection.%C_OFF%
) else if "%LIVEVER%"=="%VER%" (
  echo %C_ITEM%The live site is up to date: %LIVEVER%.%C_OFF%
) else (
  echo %C_WARN%The live site is behind: live %LIVEVER%, local %VER%.%C_OFF%
  echo %C_WARN%Have you pushed, and did the GitHub Pages build finish?%C_OFF%
)
echo.
pause
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
if not "%MUTE%"=="1" "%PWR%" -NoProfile -Command "[console]::beep(180,450); Start-Sleep -m 120; [console]::beep(180,450)"
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
