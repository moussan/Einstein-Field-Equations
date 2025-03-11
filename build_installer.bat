@echo off
echo Einstein Field Equations Platform - Windows Installer Builder
echo =========================================================
echo.
echo This script will build a Windows installer for the Einstein Field Equations Platform.
echo Prerequisites:
echo - Python 3.9+
echo - Internet connection to download dependencies
echo.
echo The installer will include:
echo - Python backend with all dependencies
echo - React frontend
echo - PostgreSQL database
echo - Startup scripts
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause > nul

python build_windows_installer.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Build completed successfully!
    echo The installer can be found in the "dist" directory.
    echo.
) else if %ERRORLEVEL% EQU 2 (
    echo.
    echo Build completed with warnings!
    echo The installer was created but some components may not function correctly.
    echo The installer can be found in the "dist" directory.
    echo.
) else (
    echo.
    echo Build failed! See error messages above.
    echo.
)

pause 