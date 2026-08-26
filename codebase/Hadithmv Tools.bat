@echo off
rem Hadithmv Tools - one-click menu for the common build tasks.
rem Self-contained: each entry runs its command directly. The sibling
rem bats (dist-build.bat, rebuild-index.bat) remain as quick paths.
rem Requires: node on PATH.
title Hadithmv Tools
cd /d "%~dp0"

:menu
cls
echo =============================================
echo  Hadithmv tools
echo =============================================
echo.
echo  1. Build dist (before commit)
echo  2. Rebuild search index
echo  3. Refresh manifest (data-only commit)
echo  4. Quit
echo.
set "choice="
set /p "choice=Pick a number: "
if "%choice%"=="1" goto build
if "%choice%"=="2" goto index
if "%choice%"=="3" goto manifest
if "%choice%"=="4" goto quit
echo.
echo Not a valid choice - try again.
pause >nul
goto menu

:build
echo.
echo Building dist from src...
node tools/dist-build.mjs
goto done

:index
echo.
echo Rebuilding search index...
node data/08-rebuild-searchIndex.mjs
goto done

:manifest
echo.
echo Refreshing dist/manifest.json...
node tools/hmv-manifest.mjs
goto done

:done
echo.
pause
goto menu

:quit
echo Bye.
