import type { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { createStockIn, getStockInById, listStockIns } from '../services/stockInService';
import { buildError } from '../utils/errors';

export async function restockProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req as AuthenticatedRequest;
    const { items, note } = req.body;
    const stockIn = await createStockIn({ userId: auth.userId, items, note });
    res.status(201).json(stockIn);
  } catch (error) {
    next(error);
  }
}

export async function getStockInList(_req: Request, res: Response, next: NextFunction) {
  try {
    const stockIns = await listStockIns();
    res.json(stockIns);
  } catch (error) {
    next(error);
  }
}

export async function getStockInEntry(req: Request, res: Response, next: NextFunction) {
  try {
    const entry = await getStockInById(req.params.id);
    if (!entry) {
      throw buildError(404, 'stock-in-not-found');
    }
    res.json(entry);
  } catch (error) {
    next(error);
  }
}
