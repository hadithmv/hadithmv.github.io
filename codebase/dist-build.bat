@echo off
rem Hadithmv - rebuild dist/ from src/ (run before committing).
rem Shrinks the JS, CSS and HTML into dist/ so the website serves the
rem small files. Rule: build before every commit - see
rem docs/ARCHITECTURE.md "Build".
cd /d "%~dp0"
node tools/build.mjs
pause
