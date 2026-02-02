import type { Request, Response, NextFunction } from 'express';
import { exportBackup, restoreBackup, runBackup } from '../services/backupService';

export async function runBackupHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await runBackup();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function exportBackupHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { targetPath, sourcePath } = req.body;
    const result = await exportBackup(targetPath, sourcePath);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function restoreBackupHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { backupPath, confirmation } = req.body;
    const result = await restoreBackup(backupPath, confirmation);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
