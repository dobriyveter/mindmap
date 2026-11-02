@echo off
title MindFlow
cd /d "%~dp0"

REM Проверяем существование exe
if not exist "build\win-unpacked\MindFlow.exe" (
    echo [ERROR] MindFlow.exe not found!
    echo Please run CLEAN_BUILD.bat first.
    pause
    exit /b 1
)

REM Запускаем приложение
start "" "build\win-unpacked\MindFlow.exe"
exit
