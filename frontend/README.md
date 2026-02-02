# EliMed Frontend (Electron + Vite)

This frontend is a desktop Electron app with a React renderer built by Vite. The UI already lives in `src/`.

## Requirements

- Node.js 18+
- Windows/macOS/Linux

## Install

```bash
npm install
```

## Development

Run Electron + Vite together:

```bash
npm run dev:electron
```

If Electron fails to download (offline/blocked), download the zip manually and use the offline script:

1) Download `electron-v30.5.1-win32-x64.zip` from one of:
   - `https://npmmirror.com/mirrors/electron/v30.5.1/`
   - `https://github.com/electron/electron/releases/tag/v30.5.1`
2) Extract to `frontend/electron-bin/electron-v30.5.1-win32-x64` so `electron.exe` is inside that folder.
3) Run:

```bash
npm run dev:electron:offline
```

If you want just the renderer:

```bash
npm run dev
```

## Build

```bash
npm run build
```

Outputs:
- `dist/` (renderer)
- `dist-electron/` (main/preload)
- `release/` (installer)

## Notes

- Electron main entry: `electron/main.ts`
- Preload: `electron/preload.ts`
- Vite config: `vite.config.ts`
- Main process uses `VITE_DEV_SERVER_URL` for dev, and `dist/index.html` for production.
