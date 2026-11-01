@echo off
chcp 65001 >nul
title 🧠 MindFlow — Режим разработки (Electron)
cd /d "%~dp0"
color 0B

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║                                                      ║
echo ║   🧠  MINDFLOW — Режим разработки                    ║
echo ║                                                      ║
echo ╚══════════════════════════════════════════════════════╝
echo.
echo   Запускаю приложение в режиме разработки...
echo   (окно Electron откроется автоматически)
echo.
echo ══════════════════════════════════════════════════════
echo.

REM Проверяем Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo   ❌ Node.js не найден!
    echo   Скачайте с: https://nodejs.org/
    pause
    exit /b 1
)

REM Устанавливаем зависимости если нужно
if not exist "node_modules" (
    echo   📦 Устанавливаю зависимости...
    call npm install
    call npm install --save-dev concurrently wait-on
)

REM Настраиваем проект
node setup-electron.js

echo.
echo ══════════════════════════════════════════════════════
echo   🚀 Запускаю...
echo   (не закрывайте это окно!)
echo ══════════════════════════════════════════════════════
echo.

call npm run electron:dev

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo   ❌ Ошибка!
)

echo.
pause
