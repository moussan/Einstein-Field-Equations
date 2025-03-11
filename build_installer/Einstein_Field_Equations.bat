@echo off
echo Starting Einstein Field Equations Platform...

REM Start PostgreSQL if not running
sc query postgresql-x64-14 | find "RUNNING" > nul
if errorlevel 1 (
    echo Starting PostgreSQL...
    net start postgresql-x64-14
)

REM Start backend
start cmd /k "%~dp0backend\start_backend.bat"

REM Wait for backend to start
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

REM Start frontend
start cmd /k "%~dp0frontend\start_frontend.bat"

REM Open browser
start http://localhost:3000
