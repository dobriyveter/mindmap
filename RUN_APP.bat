@echo off
title MindFlow
cd /d "%~dp0"

REM Проверяем что MindFlow.exe существует в папке win-unpacked
if not exist "build\win-unpacked\MindFlow.exe" (
    echo [ERROR] MindFlow.exe not found!
    echo.
    echo Please run CLEAN_BUILD.bat first.
    echo.
    pause
    exit /b 1
)

REM Запускаем приложение
start "" "build\win-unpacked\MindFlow.exe"
exit
