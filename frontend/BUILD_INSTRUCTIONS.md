# Build Instructions

## Issue
The build process fails because Windows needs Developer Mode or Administrator privileges to create symbolic links when extracting signing tools.

## Solution Options

### Option 1: Enable Developer Mode (Recommended)
1. Open **Settings** → **Update & Security** → **For Developers**
2. Enable **Developer Mode**
3. Run the build again:
   ```bash
   npm run build
   ```

### Option 2: Run PowerShell as Administrator
1. Right-click PowerShell and select "Run as Administrator"
2. Navigate to the frontend folder:
   ```powershell
   cd C:\Users\pc\Desktop\EliMed\frontend
   ```
3. Run the build:
   ```powershell
   npm run build
   ```

### Option 3: Skip Installer and Use Portable Build
The current config is set to create a portable executable. After fixing the symlink issue with Option 1 or 2, the build will create:
- `release/0.0.0/EliMed-Windows-0.0.0-Portable.exe`

This is a standalone executable that doesn't require installation.

### Option 4: Just Package the App (No Installer)
If you just want to test the app without creating an installer, run:
```bash
npm run electron:build:dir
```

Add this to package.json scripts section:
```json
"electron:build:dir": "tsc && vite build && electron-builder --dir"
```

This creates an unpacked app in `release/0.0.0/win-unpacked/` that you can run directly.

## What Gets Built

After successful build, you'll find:
- **Portable App**: `release/0.0.0/EliMed-Windows-0.0.0-Portable.exe`
- **Unpacked App**: `release/0.0.0/win-unpacked/EliMed.exe`

## Current Status

✅ TypeScript compilation: PASSING (all 28 errors fixed)
✅ Vite frontend build: PASSING  
✅ Electron main process build: PASSING
❌ Electron-builder packaging: BLOCKED (symlink permission issue)

The code is ready - it's just a Windows permissions issue preventing the final packaging step.
