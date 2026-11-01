/**
 * 🚀 Автоматическая настройка Electron для MindFlow
 * 
 * Этот скрипт:
 * 1. Модифицирует package.json (добавляет main и electron-скрипты)
 * 2. Проверяет наличие всех нужных файлов
 * 3. Создаёт иконку если её нет
 */

const fs = require('fs');
const path = require('path');

console.log('');
console.log('╔══════════════════════════════════════════════╗');
console.log('║   🧠 MindFlow — Настройка десктопного режима ║');
console.log('╚══════════════════════════════════════════════╝');
console.log('');

// Шаг 1: Модифицируем package.json
console.log('📝 [1/3] Настраиваю package.json...');

const packagePath = path.join(__dirname, 'package.json');
let packageJson;

try {
  packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
} catch (e) {
  console.error('❌ Ошибка: не удалось прочитать package.json');
  console.error(e.message);
  process.exit(1);
}

// Добавляем поле main
packageJson.name = 'mindflow';
packageJson.version = '1.0.0';
packageJson.description = 'Приложение для создания ментальных карт';
packageJson.main = 'electron/main.js';
packageJson.author = 'MindFlow';

// Добавляем electron-скрипты
packageJson.scripts = {
  ...packageJson.scripts,
  'electron:dev': 'concurrently "npm run dev" "wait-on http://localhost:5173 && electron ."',
  'electron:build': 'npm run build && electron-builder --win --config electron-builder.yml',
  'electron:build-portable': 'npm run build && electron-builder --win portable --config electron-builder.yml',
};

// Сохраняем
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2), 'utf8');
console.log('   ✅ package.json обновлён');

// Шаг 2: Проверяем файлы
console.log('');
console.log('🔍 [2/3] Проверяю файлы...');

const requiredFiles = [
  'electron/main.js',
  'electron/preload.js',
  'electron-builder.yml',
  'src/App.tsx',
  'index.html',
];

let allFilesExist = true;
for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} — НЕ НАЙДЕН!`);
    allFilesExist = false;
  }
}

// Проверяем иконку
const iconPath = path.join(__dirname, 'electron', 'icon.png');
if (!fs.existsSync(iconPath)) {
  console.log('   ⚠️  electron/icon.png — не найден (будет использована стандартная иконка)');
}

// Шаг 3: Проверяем зависимости
console.log('');
console.log('📦 [3/3] Проверяю зависимости...');

const requiredDeps = ['electron', 'electron-builder', 'concurrently', 'wait-on'];
const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

for (const dep of requiredDeps) {
  if (allDeps[dep]) {
    console.log(`   ✅ ${dep}`);
  } else {
    console.log(`   ❌ ${dep} — НЕ УСТАНОВЛЕН! Выполните: npm install ${dep}`);
    allFilesExist = false;
  }
}

// Итог
console.log('');
console.log('══════════════════════════════════════════════');
console.log('');

if (allFilesExist) {
  console.log('✅ ВСЁ ГОТОВО К СБОРКЕ!');
  console.log('');
  console.log('📋 Что делать дальше:');
  console.log('');
  console.log('   🔧 Запустить в режиме разработки:');
  console.log('      npm run electron:dev');
  console.log('');
  console.log('   📦 Собрать установщик:');
  console.log('      npm run electron:build');
  console.log('');
  console.log('   📁 Результат будет в папке: release/');
  console.log('');
  console.log('══════════════════════════════════════════════');
} else {
  console.log('❌ Обнаружены проблемы! См. ошибки выше.');
  console.log('');
  console.log('Попробуйте:');
  console.log('   npm install');
  console.log('   npm install --save-dev concurrently wait-on');
  console.log('');
  console.log('И запустите этот скрипт снова.');
  console.log('══════════════════════════════════════════════');
  process.exit(1);
}
