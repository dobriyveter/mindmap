@echo off
chcp 65001 >nul
title MindFlow - Create Desktop Shortcut
cd /d "%~dp0"
color 0A

echo.
echo ========================================================
echo    MindFlow - Создание ярлыка на рабочем столе
echo ========================================================
echo.

REM Проверяем что приложение собрано
if not exist "build\win-unpacked\MindFlow.exe" (
    color 0C
    echo   [ERROR] MindFlow.exe not found!
    echo   Please run CLEAN_BUILD.bat first.
    echo.
    pause
    exit /b 1
)

echo   [OK] MindFlow.exe found
echo.

REM Создаём ярлык через VBS скрипт
echo   Creating shortcut...
cscript //nologo create_shortcut.vbs

if %errorlevel% neq 0 (
    color 0C
    echo   [ERROR] Failed to create shortcut!
    pause
    exit /b 1
)

echo.
color 0A
echo ========================================================
echo   [OK] Shortcut created successfully!
echo ========================================================
echo.
echo   Ярлык создан на рабочем столе!
echo.
echo ========================================================
echo.
pause
