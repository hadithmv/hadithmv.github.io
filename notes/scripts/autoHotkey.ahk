 ; How do I put my hotkeys and hotstrings into effect automatically every time I start my PC? There are several ways to make a script (or any program) launch automatically every time you start your PC. The easiest is to place a shortcut to the script in the Startup folder: Find the script file, select it, and press Ctrl+C. Press Win+R to open the Run dialog, then enter shell:startup and click OK or Enter. This will open the Startup folder for the current user. To instead open the folder for all users, enter shell:common startup (however, in that case you must be an administrator to proceed). Right click inside the window, and click "Paste Shortcut". The shortcut to the script should now be in the Startup folder.

 ; C:\Users\ashraaf\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup


#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.

^+!s::
Send, ﷺ
return

^+!r::
Send, رَضِيَ اللَّهُ عَنْهُ
return
