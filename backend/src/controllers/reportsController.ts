import type { Request, Response, NextFunction } from 'express';
import { parseDateParam } from '../utils/date';
import { getExpiredLots, getExpiringLots, getLowStockProducts, getTopProducts } from '../services/reportsService';
import { listSales } from '../services/salesService';
import { buildError } from '../utils/errors';

export async function salesReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const from = parseDateParam(req.query.from as string | undefined);
    const to = parseDateParam(req.query.to as string | undefined, { endOfDay: true });
    const soldByUserId = req.query.soldByUserId ? String(req.query.soldByUserId) : undefined;
    const productId = req.query.productId ? String(req.query.productId) : undefined;
    const receiptNo = req.query.receiptNo ? String(req.query.receiptNo) : undefined;
    const sales = await listSales({ from, to, soldByUserId, productId, receiptNo });
    res.json(sales);
  } catch (error) {
    next(error);
  }
}

export async function topProductsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const from = parseDateParam(req.query.from as string | undefined);
    const to = parseDateParam(req.query.to as string | undefined, { endOfDay: true });
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const topProducts = await getTopProducts({ from, to }, limit);
    res.json(topProducts);
  } catch (error) {
    next(error);
  }
}

export async function lowStockHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const lowStock = await getLowStockProducts();
    res.json(lowStock);
  } catch (error) {
    next(error);
  }
}

export async function expiringLotsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const daysRaw = req.query.days ? Number(req.query.days) : NaN;
    if (!Number.isFinite(daysRaw) || daysRaw <= 0) {
      throw buildError(400, 'invalid-days');
    }
    const lots = await getExpiringLots(daysRaw);
    res.json(lots);
  } catch (error) {
    next(error);
  }
}

export async function expiredLotsHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const lots = await getExpiredLots();
    res.json(lots);
  } catch (error) {
    next(error);
  }
}
