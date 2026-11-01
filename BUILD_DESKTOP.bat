@echo off
chcp 65001 >nul
title 🧠 MindFlow — Создание десктопного приложения
cd /d "%~dp0"
color 0A

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║                                                      ║
echo ║   🧠  MINDFLOW — Создание десктопного приложения    ║
echo ║                                                      ║
echo ╚══════════════════════════════════════════════════════╝
echo.
echo   Этот скрипт автоматически:
echo     1. Настроит проект для Electron
echo     2. Соберёт веб-приложение
echo     3. Создаст установщик .exe
echo.
echo   Время выполнения: 5-15 минут
echo.
echo ══════════════════════════════════════════════════════
echo.

REM Проверяем Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo   ❌ [ОШИБКА] Node.js не найден!
    echo.
    echo   Скачайте и установите Node.js:
    echo   https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo   ✅ Node.js найден:
node --version
echo.

REM Проверяем npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo   ❌ [ОШИБКА] npm не найден!
    pause
    exit /b 1
)

echo   ✅ npm найден:
npm --version
echo.

REM Шаг 1: Устанавливаем зависимости
echo ══════════════════════════════════════════════════════
echo   📦 [1/4] Устанавливаю зависимости...
echo ══════════════════════════════════════════════════════
echo.

if not exist "node_modules" (
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo   ❌ Ошибка установки зависимостей!
        pause
        exit /b 1
    )
)

REM Устанавливаем Electron-зависимости
call npm install --save-dev concurrently wait-on 2>nul

echo   ✅ Зависимости установлены
echo.

REM Шаг 2: Настраиваем проект
echo ══════════════════════════════════════════════════════
echo   ⚙️  [2/4] Настраиваю проект для Electron...
echo ══════════════════════════════════════════════════════
echo.

node setup-electron.js
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo   ❌ Ошибка настройки!
    pause
    exit /b 1
)

echo.

REM Шаг 3: Собираем веб-приложение
echo ══════════════════════════════════════════════════════
echo   🏗️  [3/4] Собираю веб-приложение...
echo ══════════════════════════════════════════════════════
echo.

call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo   ❌ Ошибка сборки веб-приложения!
    pause
    exit /b 1
)

echo   ✅ Веб-приложение собрано
echo.

REM Шаг 4: Собираем Electron
echo ══════════════════════════════════════════════════════
echo   🖥️  [4/4] Создаю десктопное приложение...
echo   ⏳ Это может занять 5-15 минут...
echo ══════════════════════════════════════════════════════
echo.

call npx electron-builder --win --config electron-builder.yml

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo   ❌ Ошибка сборки Electron!
    echo.
    echo   Возможные причины:
    echo   • Нет интернета
    echo   • Антивирус блокирует
    echo   • Недостаточно места на диске
    echo.
    pause
    exit /b 1
)

echo.
color 0A
echo ╔══════════════════════════════════════════════════════╗
echo ║                                                      ║
echo ║   ✅  СБОРКА ЗАВЕРШЕНА УСПЕШНО!                      ║
echo ║                                                      ║
echo ╚══════════════════════════════════════════════════════╝
echo.
echo   📁 Папка с установщиком:
echo      %cd%\release\
echo.
echo   📦 Найдите файл:
echo      MindFlow-Setup-1.0.0.exe
echo.
echo   🚀 Запустите его для установки приложения!
echo.
echo ══════════════════════════════════════════════════════
echo.
echo   Нажмите любую клавишу для выхода...
pause >nul
