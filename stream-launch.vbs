Set objShell = CreateObject("WScript.Shell")

' Launch overlay
objShell.Run "pythonw overlay.py", 0, False

' Optional external tools can be launched here.
' Update these commands to match your local setup if needed.
