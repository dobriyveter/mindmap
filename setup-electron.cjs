const fs = require('fs');
const path = require('path');

console.log('');
console.log('========================================================');
console.log('   MindFlow - Electron Setup');
console.log('========================================================');
console.log('');

// Step 1: Modify package.json
console.log('[1/3] Updating package.json...');

const packagePath = path.join(__dirname, 'package.json');
let packageJson;

try {
  packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
} catch (e) {
  console.error('[ERROR] Failed to read package.json');
  console.error(e.message);
  process.exit(1);
}

// Add main field
packageJson.name = 'mindflow';
packageJson.version = '1.0.0';
packageJson.description = 'Mind mapping application';
packageJson.main = 'electron/main.js';
packageJson.author = 'MindFlow';

// Move electron packages from dependencies to devDependencies
const electronPackages = ['electron', 'electron-builder', 'electron-is-dev', 'concurrently', 'wait-on'];
if (!packageJson.devDependencies) packageJson.devDependencies = {};

for (const pkg of electronPackages) {
  if (packageJson.dependencies && packageJson.dependencies[pkg]) {
    packageJson.devDependencies[pkg] = packageJson.dependencies[pkg];
    delete packageJson.dependencies[pkg];
    console.log(`   [OK] Moved ${pkg} to devDependencies`);
  }
}

// Add electron scripts
packageJson.scripts = {
  ...packageJson.scripts,
  'electron:dev': 'concurrently "npm run dev" "wait-on http://localhost:5173 && electron ."',
  'electron:build': 'npm run build && electron-builder --win --config electron-builder.yml',
  'electron:build-portable': 'npm run build && electron-builder --win portable --config electron-builder.yml',
};

// Save
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2), 'utf8');
console.log('   [OK] package.json updated');

// Step 2: Check files
console.log('');
console.log('[2/3] Checking files...');

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
    console.log(`   [OK] ${file}`);
  } else {
    console.log(`   [ERROR] ${file} - NOT FOUND!`);
    allFilesExist = false;
  }
}

// Check icon
const iconPath = path.join(__dirname, 'electron', 'icon.png');
if (!fs.existsSync(iconPath)) {
  console.log('   [WARN] electron/icon.png - not found (will use default icon)');
}

// Step 3: Check dependencies
console.log('');
console.log('[3/3] Checking dependencies...');

const requiredDeps = ['electron', 'electron-builder', 'concurrently', 'wait-on'];
const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

for (const dep of requiredDeps) {
  if (allDeps[dep]) {
    console.log(`   [OK] ${dep}`);
  } else {
    console.log(`   [ERROR] ${dep} - NOT INSTALLED! Run: npm install ${dep}`);
    allFilesExist = false;
  }
}

// Result
console.log('');
console.log('========================================================');
console.log('');

if (allFilesExist) {
  console.log('[OK] READY TO BUILD!');
  console.log('');
  console.log('Next steps:');
  console.log('');
  console.log('   Run in development mode:');
  console.log('      npm run electron:dev');
  console.log('');
  console.log('   Build installer:');
  console.log('      npm run electron:build');
  console.log('');
  console.log('   Result will be in: release/');
  console.log('');
  console.log('========================================================');
} else {
  console.log('[ERROR] Problems detected! See errors above.');
  console.log('');
  console.log('Try:');
  console.log('   npm install');
  console.log('   npm install --save-dev concurrently wait-on');
  console.log('');
  console.log('Then run this script again.');
  console.log('========================================================');
  process.exit(1);
}
