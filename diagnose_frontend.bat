@echo off
echo Einstein Field Equations Platform - Frontend Diagnostic Tool
echo =========================================================
echo.
echo This script will help diagnose issues with the frontend build.
echo.

REM Check if frontend directory exists
if not exist frontend (
    echo ERROR: Frontend directory not found!
    echo Please run this script from the root of the project.
    goto :end
)

echo Checking Node.js installation...
node --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    goto :end
)

echo Node.js version:
node --version

echo NPM version:
npm --version

echo.
echo Checking frontend package.json...
if not exist frontend\package.json (
    echo ERROR: package.json not found in frontend directory!
    goto :end
)

echo package.json found. Checking build script...
findstr "\"build\"" frontend\package.json
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: No build script found in package.json.
    echo The package.json should contain a "build" script.
)

echo.
echo Checking for node_modules...
if not exist frontend\node_modules (
    echo node_modules not found. Running npm install...
    cd frontend
    npm install
    cd ..
) else (
    echo node_modules found.
)

echo.
echo Attempting to build frontend...
cd frontend
echo Running: npm run build
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Frontend build failed!
    echo.
    echo Possible solutions:
    echo 1. Check for errors in your React components
    echo 2. Make sure all dependencies are installed
    echo 3. Check if the build script in package.json is correct
    echo 4. Try running 'npm install' manually
    echo.
) else (
    echo.
    echo SUCCESS: Frontend build completed successfully!
    echo The build files are in frontend\build
    echo.
)

cd ..

:end
pause 