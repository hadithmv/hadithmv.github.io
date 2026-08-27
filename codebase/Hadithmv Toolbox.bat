@echo off
rem Hadithmv Toolbox - double-click launcher for the node menu.
rem The menu itself lives in tools\hmv-toolbox.mjs (node - cross-platform);
rem this file only checks that node exists and hands over, so a missing
rem node shows a readable message instead of a cryptic error. The sibling
rem bats (dist-build.bat, rebuild-index.bat) remain as quick paths.
rem Run with a number argument to jump straight to an option,
rem e.g. "Hadithmv Toolbox.bat 5" opens the preview directly.
title Hadithmv Toolbox
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 goto nonode
node "%~dp0tools\hmv-toolbox.mjs" %*
if errorlevel 1 (
  pause
  exit /b %errorlevel%
)
exit /b 0

:nonode
echo.
echo Node.js was not found - the Toolbox needs it. Install it from
echo nodejs.org and run this again.
echo.
pause
exit /b 1
