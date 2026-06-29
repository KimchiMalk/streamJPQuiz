@echo off
title Kanji Quiz - Stream Launcher
echo ============================================
echo   Kanji Quiz Overlay - Stream Launcher
echo ============================================
echo.

:: Launch desktop overlay (starts its own server + background listener)
echo [1/3] Starting quiz overlay ...
cd /d "%~dp0"
start "" pythonw overlay.py
echo       Overlay started.

:: Optional external tools can be launched here.
:: Update these commands to match your local setup if needed.
echo [2/3] Skipping external launcher steps.
echo       Configure any additional tools locally.

echo [3/3] Stream launcher ready.
echo.
echo ============================================
echo   All ready! The quiz popup will appear
echo   when !quiz is typed in chat or every
echo   15 minutes.
echo.
echo   Keep this window open while streaming.
echo ============================================
echo.
pause
