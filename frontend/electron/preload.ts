import { ipcRenderer, contextBridge } from "electron";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args),
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },

  // You can expose other APTs you need here.
  // ...
});

// Expose dialog API for file/folder selection
contextBridge.exposeInMainWorld("electron", {
  dialog: {
    showOpenDialog: (options: any) =>
      ipcRenderer.invoke("dialog:showOpenDialog", options),
  },
  printer: {
    getList: () => ipcRenderer.invoke("printer:getList"),
    print: (printerName: string, htmlContent: string) =>
      ipcRenderer.invoke("printer:print", printerName, htmlContent),
  },
});
