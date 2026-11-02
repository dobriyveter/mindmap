@echo off
title MindFlow - Rebuild
cd /d "%~dp0"
color 0A

echo.
echo ========================================================
echo    MindFlow - Пересборка приложения
echo ========================================================
echo.

echo   [1/2] Сборка веб-приложения...
call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo   [ERROR] Build failed!
    pause
    exit /b 1
)
echo   [OK] Done
echo.

echo   [2/2] Копирование файлов...
if exist "build\win-unpacked\resources\app\dist" (
    rmdir /s /q "build\win-unpacked\resources\app\dist" >nul 2>&1
)
xcopy /e /i /q "dist" "build\win-unpacked\resources\app\dist" >nul 2>&1
echo   [OK] Done
echo.

echo ========================================================
echo   [OK] Пересборка завершена!
echo ========================================================
echo.
echo   Запустите RUN_APP.bat для проверки
echo.
pause
