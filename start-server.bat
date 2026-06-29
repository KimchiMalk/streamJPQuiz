@echo off
echo Starting Kanji Quiz Overlay server on http://localhost:8080
echo Press Ctrl+C to stop.
echo.
cd /d "%~dp0ui"
python -m http.server 8080
