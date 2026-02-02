import { Request, Response, NextFunction } from "express";
import * as exportService from "../services/excelExportService";

export async function generateExport(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { targetPath } = req.body;
    const filepath = await exportService.generateDailyExport(targetPath);
    res.json({
      success: true,
      message: "Excel export generated successfully",
      filepath: filepath,
    });
  } catch (error) {
    next(error);
  }
}

export async function listExports(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const exports = await exportService.getExportsList();
    res.json(exports);
  } catch (error) {
    next(error);
  }
}

export async function downloadExport(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { filename } = req.params;
    const filepath = exportService.getExportPath(filename);
    res.download(filepath);
  } catch (error) {
    next(error);
  }
}

export async function deleteExport(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { filename } = req.params;
    await exportService.deleteExport(filename);
    res.json({ success: true, message: "Export deleted successfully" });
  } catch (error) {
    next(error);
  }
}
