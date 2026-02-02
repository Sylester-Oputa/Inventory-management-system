/**
 * Get saved printer preference from localStorage
 */
export function getSavedPrinter(): string | null {
  return localStorage.getItem("elimed_default_printer");
}

/**
 * Save printer preference to localStorage
 */
export function savePrinter(printerName: string) {
  localStorage.setItem("elimed_default_printer", printerName);
}

/**
 * Get list of available printers
 */
export async function getPrinters(): Promise<Printer[]> {
  if (!window.electron?.printer) {
    console.warn("Printer API not available");
    return [];
  }

  try {
    const printers = await window.electron.printer.getList();
    return printers;
  } catch (error) {
    console.error("Failed to get printers:", error);
    return [];
  }
}

/**
 * Print directly to a specific printer (bypasses Windows dialog)
 */
export async function printToDefaultPrinter(
  receiptElement: HTMLElement,
): Promise<boolean> {
  const savedPrinter = getSavedPrinter();

  if (!savedPrinter) {
    // No saved printer, fall back to browser print dialog
    printReceipt(receiptElement);
    return true;
  }

  if (!window.electron?.printer) {
    console.warn("Electron printer API not available, using browser dialog");
    printReceipt(receiptElement);
    return true;
  }

  // Generate HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @page {
          size: 80mm auto;
          margin: 0;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          .thermal-receipt {
            width: 80mm !important;
            padding: 5mm !important;
          }
        }
        
        body {
          margin: 0;
          padding: 0;
          background: white;
        }
      </style>
    </head>
    <body>
      ${receiptElement.outerHTML}
    </body>
    </html>
  `;

  try {
    const result = await window.electron.printer.print(
      savedPrinter,
      htmlContent,
    );
    if (!result.success) {
      console.error("Print failed:", result.error);
      // Fall back to browser dialog
      printReceipt(receiptElement);
    }
    return result.success;
  } catch (error) {
    console.error("Print error:", error);
    // Fall back to browser dialog
    printReceipt(receiptElement);
    return false;
  }
}

/**
 * Print a receipt by rendering it to a hidden iframe and triggering browser print
 */
export function printReceipt(receiptElement: HTMLElement) {
  // Create hidden iframe for printing
  const printFrame = document.createElement("iframe");
  printFrame.style.position = "absolute";
  printFrame.style.width = "0";
  printFrame.style.height = "0";
  printFrame.style.border = "none";
  document.body.appendChild(printFrame);

  const printDocument =
    printFrame.contentDocument || printFrame.contentWindow?.document;
  if (!printDocument) {
    console.error("Could not access print frame document");
    document.body.removeChild(printFrame);
    return;
  }

  // Write receipt content to iframe
  printDocument.open();
  printDocument.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @page {
          size: 80mm auto;
          margin: 0;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          .thermal-receipt {
            width: 80mm !important;
            padding: 5mm !important;
          }
        }
        
        body {
          margin: 0;
          padding: 0;
          background: white;
        }
      </style>
    </head>
    <body>
      ${receiptElement.outerHTML}
    </body>
    </html>
  `);
  printDocument.close();

  // Wait for content to load, then print
  printFrame.contentWindow?.focus();

  setTimeout(() => {
    printFrame.contentWindow?.print();

    // Clean up after printing
    setTimeout(() => {
      document.body.removeChild(printFrame);
    }, 100);
  }, 250);
}

/**
 * Auto-print receipt to saved printer or show dialog
 */
export async function autoPrintReceipt(receiptElement: HTMLElement) {
  await printToDefaultPrinter(receiptElement);
}
