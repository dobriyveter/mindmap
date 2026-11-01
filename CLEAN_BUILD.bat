@echo off
title MindFlow - Clean Build
cd /d "%~dp0"
color 0A

echo.
echo ========================================================
echo    MindFlow - Clean Build (fix EBUSY error)
echo ========================================================
echo.

echo   [1/5] Stopping stuck processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im electron.exe >nul 2>&1
echo   [OK] Done
echo.

echo   [2/5] Closing Explorer...
taskkill /f /im explorer.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo   [OK] Done
echo.

echo   [3/5] Deleting old release folder...
if exist "release" (
    rmdir /s /q release >nul 2>&1
    timeout /t 3 /nobreak >nul
)
if exist "release" (
    echo   [WARN] Could not delete, trying again...
    timeout /t 5 /nobreak >nul
    rmdir /s /q release >nul 2>&1
)
echo   [OK] Done
echo.

echo   [4/5] Restarting Explorer...
start explorer.exe
timeout /t 2 /nobreak >nul
echo   [OK] Done
echo.

echo   [5/5] Starting build...
echo.
echo ========================================================
echo   Building... Please wait 5-15 minutes
echo ========================================================
echo.

call npm run electron:build

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo   [ERROR] Build failed!
    echo.
    echo   Try:
    echo   1. Close ALL Explorer windows in D:\MindFlow
    echo   2. Wait 1 minute
    echo   3. Run this script again
) else (
    color 0A
    echo.
    echo ========================================================
    echo   BUILD SUCCESSFUL!
    echo ========================================================
    echo.
    echo   Installer: D:\MindFlow\release\
    echo.
)

echo.
pause
