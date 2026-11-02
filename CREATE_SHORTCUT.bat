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

REM Получаем путь к рабочему столу
set "DESKTOP=%USERPROFILE%\Desktop"

REM Создаём ярлык
echo   Creating shortcut...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP%\MindFlow.lnk'); $Shortcut.TargetPath = '%cd%\build\win-unpacked\MindFlow.exe'; $Shortcut.WorkingDirectory = '%cd%\build\win-unpacked'; $Shortcut.IconLocation = '%cd%\build\win-unpacked\MindFlow.exe,0'; $Shortcut.Description = 'MindFlow - Mind Mapping Application'; $Shortcut.Save()"

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
echo   Location: %DESKTOP%\MindFlow.lnk
echo.
echo   You can now launch MindFlow from the desktop shortcut!
echo.
echo ========================================================
echo.
pause
