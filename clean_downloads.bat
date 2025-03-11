@echo off
echo Einstein Field Equations Platform - Download Cleanup Tool
echo =========================================================
echo.
echo This script will clean up downloaded installer files to force a fresh download.
echo.

if not exist build_installer\downloads (
    echo No downloads directory found.
    goto :end
)

echo Removing downloaded files...
del /F /Q build_installer\downloads\*.* 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Downloads cleaned successfully.
) else (
    echo Failed to clean downloads. You may need to delete them manually.
    echo Directory: build_installer\downloads
)

echo.
echo Please run build_installer.bat again to download fresh copies of all prerequisites.
echo.

:end
pause 