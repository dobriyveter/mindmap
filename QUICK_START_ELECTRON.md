# ⚡ Быстрая настройка Electron (Шпаргалка)

## 1️⃣ Откройте package.json и добавьте:

### В начало файла (после "{"):
```json
"main": "electron/main.js",
```

### В секцию "scripts":
```json
"electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
"electron:build": "npm run build && electron-builder --win --config electron-builder.yml"
```

## 2️⃣ Установите дополнительные пакеты:

```bash
npm install --save-dev concurrently wait-on
```

## 3️⃣ Запустите в режиме разработки:

```bash
npm run electron:dev
```

Или дважды кликните: **start-desktop.bat**

## 4️⃣ Соберите установщик:

```bash
npm run electron:build
```

Или дважды кликните: **build-desktop.bat**

## 5️⃣ Найдите установщик:

Папка: `release/MindFlow-Setup-1.0.0.exe`

---

## ✅ Готово!

Запустите `MindFlow-Setup-1.0.0.exe` для установки приложения.

---

## 🐛 Если что-то не работает:

```bash
# Полная переустановка
rmdir /s /q node_modules
del package-lock.json
npm install
npm run electron:build
```
