import os
import pyautogui
import time

# Open Notepad for testing
os.system('start notepad.exe')
time.sleep(2)

# Type some text in Notepad
pyautogui.write("Hello, this is a test from pyautogui!")
pyautogui.press('enter')
pyautogui.write("It works!")
