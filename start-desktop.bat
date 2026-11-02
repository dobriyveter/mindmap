@echo off
title MindFlow — Режим разработки (Electron)
cd /d "%~dp0"
color 0A
echo.
echo ========================================
echo   MindFlow — Режим разработки
echo ========================================
echo.

REM Проверяем Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ОШИБКА] Node.js не установлен!
    pause
    exit /b
)

echo [1/2] Проверка зависимостей...
if not exist "node_modules" (
    echo Устанавливаю зависимости...
    call npm install
)

echo [2/2] Запуск в режиме разработки...
echo.
echo ========================================
echo   Приложение откроется автоматически
echo   Для остановки: Ctrl+C
echo ========================================
echo.

call npm run electron:dev

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ОШИБКА] Приложение завершилось с ошибкой!
)

pause
