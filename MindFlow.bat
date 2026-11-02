@echo off
title MindFlow
cd /d "%~dp0"

if not exist "build\win-unpacked\MindFlow.exe" (
    echo [ERROR] MindFlow.exe not found!
    echo Please run CLEAN_BUILD.bat first.
    pause
    exit /b 1
)

start "" "build\win-unpacked\MindFlow.exe"
exit
