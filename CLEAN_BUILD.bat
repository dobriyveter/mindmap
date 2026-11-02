@echo off
title MindFlow - Clean Build
cd /d "%~dp0"
color 0A

echo.
echo ========================================================
echo    MindFlow - Clean Build
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo   [ERROR] Node.js not found!
    echo   Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo   [OK] Node.js found:
node --version
echo.

echo ========================================================
echo   [1/4] Installing dependencies...
echo ========================================================
echo.

if not exist "node_modules" (
    call npm install
)
call npm install --save-dev concurrently wait-on electron electron-builder 2>nul

echo   [OK] Done
echo.

echo ========================================================
echo   [2/4] Setting up Electron...
echo ========================================================
echo.

if exist "setup-electron.cjs" (
    node setup-electron.cjs
)

echo   [OK] Done
echo.

echo ========================================================
echo   [3/4] Building web application...
echo ========================================================
echo.

call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo   [ERROR] Build failed!
    pause
    exit /b 1
)

echo   [OK] Done
echo.

echo ========================================================
echo   [4/4] Creating desktop application...
echo   Please wait 2-5 minutes...
echo ========================================================
echo.

taskkill /f /im explorer.exe >nul 2>&1
timeout /t 1 /nobreak >nul

if exist "build" (
    rmdir /s /q build 2>nul
    timeout /t 3 /nobreak >nul
)

start explorer.exe

call npx electron-builder --win --config electron-builder.yml

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo   [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
color 0A
echo ========================================================
echo   BUILD SUCCESSFUL!
echo ========================================================
echo.
echo   Location: %cd%\build\
echo.
echo ========================================================
pause
