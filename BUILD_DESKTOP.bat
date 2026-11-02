@echo off
title MindFlow - Desktop Build
cd /d "%~dp0"
color 0A

echo.
echo ========================================================
echo    MindFlow - Desktop Application Builder
echo ========================================================
echo.
echo   This script will:
echo     1. Setup project for Electron
echo     2. Build web application
echo     3. Create Windows installer (.exe)
echo.
echo   Time: 5-15 minutes
echo.
echo ========================================================
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo   [ERROR] Node.js not found!
    echo.
    echo   Download from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo   [OK] Node.js found:
node --version
echo.

REM Step 1: Install dependencies
echo ========================================================
echo   [1/4] Installing dependencies...
echo ========================================================
echo.

if not exist "node_modules" (
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo   [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
)

call npm install --save-dev concurrently wait-on 2>nul

echo   [OK] Dependencies installed
echo.

REM Step 2: Setup project
echo ========================================================
echo   [2/4] Setting up Electron...
echo ========================================================
echo.

node setup-electron.cjs
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo   [ERROR] Setup failed!
    pause
    exit /b 1
)

echo.

REM Step 3: Build web app
echo ========================================================
echo   [3/4] Building web application...
echo ========================================================
echo.

call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo   [ERROR] Web build failed!
    pause
    exit /b 1
)

echo   [OK] Web app built
echo.

REM Step 4: Build Electron
echo ========================================================
echo   [4/4] Creating desktop application...
echo   Please wait 2-5 minutes...
echo ========================================================
echo.

REM Close Explorer windows that might lock files
taskkill /f /im explorer.exe >nul 2>&1
timeout /t 1 /nobreak >nul

REM Clean build folder to avoid EBUSY errors
if exist "build" (
    echo   Cleaning old build files...
    rmdir /s /q build 2>nul
    timeout /t 3 /nobreak >nul
)

REM Restart Explorer
start explorer.exe

call npx electron-builder --win --config electron-builder.yml

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo   [ERROR] Electron build failed!
    echo.
    echo   Possible reasons:
    echo   - No internet connection
    echo   - Antivirus blocking
    echo   - Not enough disk space
    echo.
    pause
    exit /b 1
)

echo.
color 0A
echo ========================================================
echo   BUILD SUCCESSFUL!
echo ========================================================
echo.
echo   Installer location:
echo     %cd%\build\
echo.
echo   Find file:
echo     MindFlow-Setup-1.0.0.exe
echo.
echo   Run it to install the application!
echo.
echo ========================================================
echo.
echo   Press any key to exit...
pause >nul
