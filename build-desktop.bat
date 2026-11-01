@echo off
title MindFlow — Сборка десктопного приложения
cd /d "%~dp0"
color 0A
echo.
echo ========================================
echo   Сборка MindFlow для Windows
echo ========================================
echo.

REM Проверяем Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ОШИБКА] Node.js не установлен!
    echo Скачайте с: https://nodejs.org/
    pause
    exit /b
)

echo [1/4] Проверка зависимостей...
if not exist "node_modules" (
    echo Устанавливаю зависимости...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ОШИБКА] Не удалось установить зависимости!
        pause
        exit /b
    )
)
echo [OK] Зависимости установлены
echo.

echo [2/4] Сборка веб-приложения...
call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo [ОШИБКА] Не удалось собрать веб-приложение!
    pause
    exit /b
)
echo [OK] Веб-приложение собрано
echo.

echo [3/4] Проверка иконки...
if not exist "electron\icon.png" (
    color 0E
    echo [ВНИМАНИЕ] Файл electron\icon.png не найден!
    echo Поместите PNG-иконку 512x512 в папку electron\
    echo.
    echo Продолжить без иконки? (Y/N)
    choice /c YN /n
    if errorlevel 2 exit /b
)
echo [OK] Иконка найдена
echo.

echo [4/4] Сборка Electron приложения...
echo Это может занять 5-15 минут...
echo.
call npx electron-builder --win --config electron-builder.yml

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ОШИБКА] Не удалось собрать приложение!
    echo.
    echo Возможные причины:
    echo - Нет интернета для загрузки Electron
    echo - Антивирус блокирует создание exe
    echo - Недостаточно места на диске
    pause
    exit /b
)

echo.
color 0A
echo ========================================
echo   СБОРКА ЗАВЕРШЕНА УСПЕШНО!
echo ========================================
echo.
echo Файлы установки находятся в папке:
echo   %cd%\release\
echo.
echo Найдите файл:
echo   MindFlow-Setup-1.0.0.exe
echo.
echo Запустите его для установки приложения!
echo.
echo ========================================
pause
