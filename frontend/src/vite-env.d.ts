/// <reference types="vite/client" />

interface Printer {
  name: string;
  displayName: string;
  description: string;
  status: number;
  isDefault: boolean;
}

interface Window {
  electron?: {
    dialog: {
      showOpenDialog: (
        options: any,
      ) => Promise<{ canceled: boolean; filePaths: string[] }>;
    };
    printer: {
      getList: () => Promise<Printer[]>;
      print: (
        printerName: string,
        htmlContent: string,
      ) => Promise<{ success: boolean; error?: string }>;
    };
  };
  ipcRenderer?: any;
}
