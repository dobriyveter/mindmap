@echo off
title MindFlow - Development Mode
cd /d "%~dp0"
color 0B

echo.
echo ========================================================
echo    MindFlow - Development Mode (Electron)
echo ========================================================
echo.
echo   Starting application in development mode...
echo   (Electron window will open automatically)
echo.
echo ========================================================
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo   [ERROR] Node.js not found!
    echo   Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo   Installing dependencies...
    call npm install
    call npm install --save-dev concurrently wait-on
)

REM Setup project
node setup-electron.cjs

echo.
echo ========================================================
echo   Starting application...
echo   (Do not close this window!)
echo ========================================================
echo.

call npm run electron:dev

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo   [ERROR] Application failed!
)

echo.
pause
