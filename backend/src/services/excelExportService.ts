import ExcelJS from "exceljs";
import path from "path";
import fs from "fs-extra";
import prisma from "../prisma";

const EXPORT_DIR = path.join(process.cwd(), "exports");

// Date formatting helper
function formatDate(date: Date, formatString: string): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
  if (formatString === 'yyyy-MM-dd_HHmmss') {
    return `${year}-${month}-${day}_${hours}${minutes}${seconds}`;
  } else if (formatString === 'MM/dd/yyyy') {
    return `${month}/${day}/${year}`;
  } else if (formatString === 'MM/dd/yyyy HH:mm') {
    return `${month}/${day}/${year} ${hours}:${minutes}`;
  } else if (formatString === 'MMMM dd, yyyy HH:mm:ss') {
    return `${monthNames[date.getMonth()]} ${day}, ${year} ${hours}:${minutes}:${seconds}`;
  }
  return date.toISOString();
}

// Ensure exports directory exists
fs.ensureDirSync(EXPORT_DIR);

export async function generateDailyExport(targetPath?: string): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const timestamp = formatDate(new Date(), "yyyy-MM-dd_HHmmss");
  const filename = `EliMed_Export_${timestamp}.xlsx`;
  
  // Use provided target path or default EXPORT_DIR
  const exportDir = targetPath || EXPORT_DIR;
  fs.ensureDirSync(exportDir);
  const filepath = path.join(exportDir, filename);

  // Add metadata
  workbook.creator = "EliMed System";
  workbook.created = new Date();
  workbook.modified = new Date();

  // Sheet 1: Products
  await createProductsSheet(workbook);

  // Sheet 2: Current Inventory
  await createInventorySheet(workbook);

  // Sheet 3: Sales Summary
  await createSalesSheet(workbook);

  // Sheet 4: Low Stock Alert
  await createLowStockSheet(workbook);

  // Sheet 5: Expiring Soon
  await createExpiringSheet(workbook);

  // Sheet 6: Store Information
  await createStoreInfoSheet(workbook);

  // Save the workbook
  await workbook.xlsx.writeFile(filepath);

  return filepath;
}

async function createProductsSheet(workbook: ExcelJS.Workbook) {
  const sheet = workbook.addWorksheet("Products");

  // Define columns with better widths
  sheet.columns = [
    { header: "Product Code", key: "code", width: 15 },
    { header: "Product Name", key: "name", width: 35 },
    { header: "Generic Name", key: "genericName", width: 30 },
    { header: "Category", key: "category", width: 20 },
    { header: "Unit", key: "unit", width: 12 },
    { header: "Price", key: "price", width: 15 },
    { header: "Stock Level", key: "stockLevel", width: 15 },
    { header: "Reorder Point", key: "reorderPoint", width: 15 },
    { header: "Status", key: "status", width: 12 },
  ];

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.height = 25;
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4472C4" },
  };
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.border = {
    bottom: { style: "thick", color: { argb: "FF2E5090" } }
  };

  // Fetch products with inventory
  const products = await prisma.product.findMany({include: {
      stockLots: {
        where: { qtyRemaining: { gt: 0 } },
      },
    },
  });

  // Add data with formatting
  products.forEach((product, index) => {
    const totalStock = product.stockLots.reduce(
      (sum: number, lot: any) => sum + lot.qtyRemaining,
      0,
    );
    const row = sheet.addRow({
      code: product.id.substring(0, 8),
      name: product.name,
      genericName: "N/A",
      category: "General",
      unit: "pcs",
      price: product.sellingPrice,
      stockLevel: totalStock,
      reorderPoint: product.reorderLevel || 0,
      status: product.isActive ? "Active" : "Inactive",
    });
    
    // Alternating row colors
    if (index % 2 === 0) {
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF5F8FA" },
      };
    }
    
    // Add borders to all cells
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFD0D5DD" } },
        left: { style: "thin", color: { argb: "FFD0D5DD" } },
        bottom: { style: "thin", color: { argb: "FFD0D5DD" } },
        right: { style: "thin", color: { argb: "FFD0D5DD" } },
      };
      cell.alignment = { vertical: "middle" };
    });
    
    // Low stock highlighting
    if (totalStock <= (product.reorderLevel || 0) && totalStock > 0) {
      row.getCell("stockLevel").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFEF3C7" },
      };
      row.getCell("stockLevel").font = { bold: true, color: { argb: "FF92400E" } };
    } else if (totalStock === 0) {
      row.getCell("stockLevel").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFEE2E2" },
      };
      row.getCell("stockLevel").font = { bold: true, color: { argb: "FF991B1B" } };
    }
  });

  // Format price column
  sheet.getColumn("price").numFmt = "₱#,##0.00";
  sheet.getColumn("price").alignment = { horizontal: "right" };
  
  // Freeze header row
  sheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];
}

async function createInventorySheet(workbook: ExcelJS.Workbook) {
  const sheet = workbook.addWorksheet("Current Inventory");

  sheet.columns = [
    { header: "Product Code", key: "code", width: 15 },
    { header: "Product Name", key: "name", width: 35 },
    { header: "Lot Number", key: "lotNumber", width: 20 },
    { header: "Expiry Date", key: "expiryDate", width: 15 },
    { header: "Quantity", key: "quantity", width: 15 },
    { header: "Cost", key: "cost", width: 15 },
    { header: "Total Value", key: "totalValue", width: 18 },
  ];

  // Style header
  const headerRow = sheet.getRow(1);
  headerRow.height = 25;
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF70AD47" },
  };
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.border = {
    bottom: { style: "thick", color: { argb: "FF4A7729" } }
  };

  // Fetch inventory lots
  const lots = await prisma.stockLot.findMany({
    where: { qtyRemaining: { gt: 0 } },
    include: { product: true },
    orderBy: [{ expiryDate: "asc" }],
  });

  // Add data
  lots.forEach((lot: any) => {
    sheet.addRow({
      code: lot.product.id.substring(0, 8),
      name: lot.product.name,
      lotNumber: lot.lotRefNo,
      expiryDate: formatDate(new Date(lot.expiryDate), "MM/dd/yyyy"),
      quantity: lot.qtyRemaining,
      cost: 0,
      totalValue: 0,
    });
  });

  // Format columns
  sheet.getColumn("cost").numFmt = "₱#,##0.00";
  sheet.getColumn("totalValue").numFmt = "₱#,##0.00";

  // Add total row
  const lastRow = sheet.rowCount + 2;
  sheet.getCell(`F${lastRow}`).value = "TOTAL VALUE:";
  sheet.getCell(`F${lastRow}`).font = { bold: true };
  sheet.getCell(`G${lastRow}`).value = {
    formula: `SUM(G2:G${lastRow - 2})`,
  };
  sheet.getCell(`G${lastRow}`).numFmt = "₱#,##0.00";
  sheet.getCell(`G${lastRow}`).font = { bold: true };
}

async function createSalesSheet(workbook: ExcelJS.Workbook) {
  const sheet = workbook.addWorksheet("Sales Details");

  sheet.columns = [
    { header: "Receipt No", key: "receiptNo", width: 18 },
    { header: "Date & Time", key: "date", width: 22 },
    { header: "Product Sold", key: "product", width: 35 },
    { header: "Quantity", key: "quantity", width: 12 },
    { header: "Unit Price", key: "unitPrice", width: 15 },
    { header: "Subtotal", key: "subtotal", width: 15 },
    { header: "Sold By", key: "soldBy", width: 22 },
    { header: "Payment Method", key: "payment", width: 18 },
  ];

  // Style header
  const headerRow = sheet.getRow(1);
  headerRow.height = 25;
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFC000" },
  };
  headerRow.font = { bold: true, color: { argb: "FF000000" }, size: 12 };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.border = {
    bottom: { style: "thick", color: { argb: "FFD97706" } }
  };

  // Fetch sales (last 30 days) with detailed items
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sales = await prisma.sale.findMany({
    where: {
      soldAt: { gte: thirtyDaysAgo },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      soldBy: true,
    },
    orderBy: { soldAt: "desc" },
  });

  // Add data - one row per item
  sales.forEach((sale: any) => {
    sale.items.forEach((item: any, index: number) => {
      sheet.addRow({
        receiptNo: sale.receiptNo,
        date: formatDate(new Date(sale.soldAt), "MM/dd/yyyy HH:mm"),
        product: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        soldBy: sale.soldBy.name,
        payment: sale.paymentMethod || "Cash",
      });
    });
  });

  // Format columns
  sheet.getColumn("unitPrice").numFmt = "₱#,##0.00";
  sheet.getColumn("subtotal").numFmt = "₱#,##0.00";

  // Add grand total
  const lastRow = sheet.rowCount + 2;
  sheet.getCell(`E${lastRow}`).value = "GRAND TOTAL:";
  sheet.getCell(`E${lastRow}`).font = { bold: true };
  sheet.getCell(`F${lastRow}`).value = {
    formula: `SUM(F2:F${lastRow - 2})`,
  };
  sheet.getCell(`F${lastRow}`).numFmt = "₱#,##0.00";
  sheet.getCell(`G${lastRow}`).font = { bold: true };
}

async function createLowStockSheet(workbook: ExcelJS.Workbook) {
  const sheet = workbook.addWorksheet("Low Stock Alert");

  sheet.columns = [
    { header: "Product Code", key: "code", width: 15 },
    { header: "Product Name", key: "name", width: 30 },
    { header: "Current Stock", key: "currentStock", width: 15 },
    { header: "Reorder Point", key: "reorderPoint", width: 15 },
    { header: "Status", key: "status", width: 15 },
  ];

  // Style header
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFF0000" },
  };
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  // Fetch products with stock levels
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      stockLots: {
        where: { qtyRemaining: { gt: 0 } },
      },
    },
  });

  // Filter and add low stock items
  products.forEach((product: any) => {
    const totalStock = product.stockLots.reduce(
      (sum: number, lot: any) => sum + lot.qtyRemaining,
      0,
    );
    const reorderPoint = product.reorderLevel || 0;
    if (totalStock <= reorderPoint) {
      const status = totalStock === 0 ? "OUT OF STOCK" : "LOW STOCK";
      sheet.addRow({
        code: product.id.substring(0, 8),
        name: product.name,
        currentStock: totalStock,
        reorderPoint: reorderPoint,
        status: status,
      });
    }
  });
}

async function createExpiringSheet(workbook: ExcelJS.Workbook) {
  const sheet = workbook.addWorksheet("Expiring Soon");

  sheet.columns = [
    { header: "Product Code", key: "code", width: 15 },
    { header: "Product Name", key: "name", width: 30 },
    { header: "Lot Number", key: "lotNumber", width: 20 },
    { header: "Expiry Date", key: "expiryDate", width: 15 },
    { header: "Days Until Expiry", key: "daysLeft", width: 18 },
    { header: "Quantity", key: "quantity", width: 12 },
    { header: "Alert", key: "alert", width: 15 },
  ];

  // Style header
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFF6600" },
  };
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  // Fetch lots expiring in next 90 days
  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

  const lots = await prisma.stockLot.findMany({
    where: {
      qtyRemaining: { gt: 0 },
      expiryDate: { lte: ninetyDaysFromNow },
    },
    include: { product: true },
    orderBy: { expiryDate: "asc" },
  });

  // Add data
  const today = new Date();
  lots.forEach((lot: any) => {
    const expiryDate = new Date(lot.expiryDate);
    const daysLeft = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    let alert = "Expiring Soon";
    if (daysLeft < 0) alert = "EXPIRED";
    else if (daysLeft <= 30) alert = "CRITICAL";
    else if (daysLeft <= 60) alert = "WARNING";

    sheet.addRow({
      code: lot.product.id.substring(0, 8),
      name: lot.product.name,
      lotNumber: lot.lotRefNo,
      expiryDate: formatDate(expiryDate, "MM/dd/yyyy"),
      daysLeft: daysLeft,
      quantity: lot.qtyRemaining,
      alert: alert,
    });
  });
}

async function createStoreInfoSheet(workbook: ExcelJS.Workbook) {
  const sheet = workbook.addWorksheet("Store Information");

  // Style as info sheet
  sheet.getColumn(1).width = 25;
  sheet.getColumn(2).width = 50;

  // Fetch store info
  const store = await prisma.store.findFirst();
  const productsCount = await prisma.product.count({
    where: { isActive: true },
  });
  const salesCount = await prisma.sale.count();

  // Add data
  const exportDate = formatDate(new Date(), "MMMM dd, yyyy HH:mm:ss");

  sheet.addRow(["Export Information", ""]);
  sheet.addRow(["Export Date:", exportDate]);
  sheet.addRow(["", ""]);

  if (store) {
    sheet.addRow(["Store Information", ""]);
    sheet.addRow(["Store Name:", store.name]);
    sheet.addRow(["Address:", store.address]);
    sheet.addRow(["Phone:", store.phone]);
    sheet.addRow(["", ""]);
  }

  sheet.addRow(["Statistics", ""]);
  sheet.addRow(["Total Active Products:", productsCount]);
  sheet.addRow(["Total Sales Records:", salesCount]);

  // Style headers
  sheet.getCell("A1").font = { bold: true, size: 14 };
  sheet.getCell("A4").font = { bold: true, size: 14 };
  sheet.getCell("A9").font = { bold: true, size: 14 };
}

export async function getExportsList(): Promise<
  Array<{ filename: string; size: number; created: Date }>
> {
  const files = await fs.readdir(EXPORT_DIR);
  const exports = [];

  for (const file of files) {
    if (file.endsWith(".xlsx")) {
      const filepath = path.join(EXPORT_DIR, file);
      const stats = await fs.stat(filepath);
      exports.push({
        filename: file,
        size: stats.size,
        created: stats.birthtime,
      });
    }
  }

  return exports.sort((a, b) => b.created.getTime() - a.created.getTime());
}

export async function deleteExport(filename: string): Promise<void> {
  const filepath = path.join(EXPORT_DIR, filename);
  await fs.remove(filepath);
}

export function getExportPath(filename: string): string {
  return path.join(EXPORT_DIR, filename);
}
