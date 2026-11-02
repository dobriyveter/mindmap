@echo off
title MindFlow
cd /d "%~dp0"

REM Проверяем что MindFlow.exe существует
if not exist "MindFlow.exe" (
    echo [ERROR] MindFlow.exe not found!
    echo Please run CLEAN_BUILD.bat first.
    pause
    exit /b 1
)

REM Запускаем приложение
start "" "MindFlow.exe"
exit
