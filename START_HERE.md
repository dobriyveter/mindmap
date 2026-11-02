# MindFlow - Desktop Application Setup

## Quick Start (For Beginners)

### What to do:

**1.** Find this file in the project folder:

```
BUILD_DESKTOP.bat
```

**2.** Double-click on it

**3.** Wait 5-15 minutes

**4.** Done! In the `release/` folder you'll find:

```
MindFlow-Setup-1.0.0.exe
```

**5.** Run it - the application will install like a regular Windows program!

---

## Want to test first?

Double-click on:

```
RUN_DEV.bat
```

This will open the desktop application window (without building).

---

## Project Structure

```
your-folder/
|
+-- BUILD_DESKTOP.bat      <-- DOUBLE-CLICK to build installer
+-- RUN_DEV.bat            <-- DOUBLE-CLICK to test
+-- setup-electron.cjs     <-- Automatic setup
|
+-- electron/              <-- Electron files
|   +-- main.js
|   +-- preload.js
|   +-- icon.png
|
+-- electron-builder.yml   <-- Build settings
+-- package.json           <-- Project config
|
+-- src/                   <-- React source code
+-- dist/                  <-- Built web project
+-- release/               <-- Installer will appear here!
```

---

## Troubleshooting

### Error "Node.js not found"
Download Node.js: https://nodejs.org/ (LTS button)

### Build error
Check your internet connection and try again

### Antivirus deletes .exe
Add the `release/` folder to antivirus exceptions

### Large installer size (~100 MB)
This is normal for Electron applications

---

## Summary

| Action | File |
|--------|------|
| Create installer | `BUILD_DESKTOP.bat` |
| Test application | `RUN_DEV.bat` |

**That's it! Nothing else to do.**
