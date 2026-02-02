import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { fork, ChildProcess } from "node:child_process";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const userDataDir = path.join(app.getPath("appData"), "EliMed");
app.setPath("userData", userDataDir);
app.setPath("cache", path.join(userDataDir, "cache"));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const DEV_SERVER_URL =
  process.env["VITE_DEV_SERVER_URL"] ||
  (!app.isPackaged ? "http://localhost:5173" : undefined);
export const VITE_DEV_SERVER_URL = DEV_SERVER_URL;
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;
let backendProcess: ChildProcess | null = null;

// Start backend server
function startBackendServer() {
  if (!app.isPackaged) {
    // In development, backend runs separately
    console.log("Development mode: backend should be running separately");
    return;
  }

  const resourcesPath = process.resourcesPath;
  const backendPath = path.join(resourcesPath, "backend");
  const serverPath = path.join(backendPath, "dist", "server.js");
  const dataDir = path.join(userDataDir, "data");

  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Set environment variables for backend
  const env = {
    ...process.env,
    DATABASE_URL: `file:${path.join(dataDir, "elimed.db")}`,
    JWT_SECRET: "elimed-secret-key-change-in-production",
    BACKUP_DIR: path.join(userDataDir, "backups"),
    PORT: "4000",
    NODE_ENV: "production",
    NODE_PATH: path.join(backendPath, "node_modules"),
  };

  console.log("Starting backend server from:", serverPath);

  // Use fork to run with Electron's Node.js
  backendProcess = fork(serverPath, [], {
    cwd: backendPath,
    env,
    stdio: ["ignore", "pipe", "pipe", "ipc"],
  });

  backendProcess.stdout?.on("data", (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr?.on("data", (data) => {
    console.error(`Backend Error: ${data}`);
  });

  backendProcess.on("close", (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    resizable: true,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Set Content Security Policy
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          VITE_DEV_SERVER_URL
            ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* ws://localhost:* data: blob:; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:;"
            : "default-src 'self' data: blob:; script-src 'self'; style-src 'self' 'unsafe-inline'; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:;",
        ],
      },
    });
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  // Kill backend process
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }

  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  startBackendServer();
  // Wait a bit for backend to start before creating window
  setTimeout(createWindow, app.isPackaged ? 2000 : 0);
});

ipcMain.handle("dialog:showOpenDialog", async (_event, options) => {
  const result = await dialog.showOpenDialog(win!, options);
  return result;
});

ipcMain.handle("dialog:openDirectory", async () => {
  const result = await dialog.showOpenDialog(win!, {
    properties: ["openDirectory", "createDirectory"],
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

// Get list of available printers
ipcMain.handle("printer:getList", async () => {
  if (!win) return [];
  const printers = (win.webContents as any).getPrinters();
  return printers.map((p: any) => ({
    name: p.name,
    displayName: p.displayName,
    description: p.description,
    status: p.status,
    isDefault: p.isDefault,
  }));
});

// Print directly to a specific printer
ipcMain.handle(
  "printer:print",
  async (_event, printerName: string, htmlContent: string) => {
    if (!win) return { success: false, error: "No window available" };

    try {
      const printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      await printWindow.loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`,
      );

      const options = {
        silent: true,
        deviceName: printerName,
        margins: {
          marginType: "none" as const,
        },
        pageSize: {
          width: 80000, // 80mm in microns
          height: 297000, // A4 height, but will auto-fit content
        },
      };

      return new Promise((resolve) => {
        printWindow.webContents.print(options, (success, failureReason) => {
          if (!success && failureReason) {
            console.error("Print failed:", failureReason);
            resolve({ success: false, error: failureReason });
          } else {
            resolve({ success: true });
          }
          printWindow.close();
        });
      });
    } catch (error) {
      console.error("Print error:", error);
      return { success: false, error: String(error) };
    }
  },
);
