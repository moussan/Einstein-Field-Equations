@echo off
cd "%~dp0build"
start "" http://localhost:3000
python -m http.server 3000
