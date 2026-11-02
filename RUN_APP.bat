@echo off
title MindFlow - Development Mode
cd /d "%~dp0"
color 0B

echo.
echo ========================================================
echo    MindFlow - Development Mode
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo   [ERROR] Node.js not found!
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo   Installing dependencies...
    call npm install
)

echo   Starting application...
echo   (Do not close this window!)
echo.

call npm run dev

pause
