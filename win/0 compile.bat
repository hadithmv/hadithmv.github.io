@ECHO OFF
CLS

REM Set our app file in APP variable
SET APP="C:\Users\ashraaf\Downloads\VScode\hadithmv.github.io\win\hadithmv.dhc"

REM Set Compiler CLI path
SET COMPILER="C:\Program Files\DecSoft\HtmlCompiler\HtmlCompilerCLI.exe"

REM Call the compiler with the app file
%COMPILER% %APP%

REM Pause the script execution to see the results
PAUSE

