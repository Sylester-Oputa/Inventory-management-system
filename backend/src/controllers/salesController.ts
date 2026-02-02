import type { Request, Response, NextFunction } from "express";
import { parseDateParam } from "../utils/date";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { createSale, getSaleById, listSales } from "../services/salesService";
import { buildError } from "../utils/errors";

export async function createSaleHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const auth = req as AuthenticatedRequest;
    const { items, paymentMethod, note } = req.body;
    const sale = await createSale({
      userId: auth.userId,
      items,
      paymentMethod,
      note,
    });
    res.status(201).json(sale);
  } catch (error) {
    next(error);
  }
}

export async function listSalesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const auth = req as AuthenticatedRequest;
    const from = parseDateParam(req.query.from as string | undefined);
    const to = parseDateParam(req.query.to as string | undefined, {
      endOfDay: true,
    });
    const productId = req.query.productId
      ? String(req.query.productId)
      : undefined;
    const receiptNo = req.query.receiptNo
      ? String(req.query.receiptNo)
      : undefined;
    const soldByUserId = req.query.soldByUserId
      ? String(req.query.soldByUserId)
      : undefined;

    const filters: Parameters<typeof listSales>[0] = {};
    if (from) filters.from = from;
    if (to) filters.to = to;
    if (productId) filters.productId = productId;
    if (receiptNo) filters.receiptNo = receiptNo;
    if (auth.role === "OWNER") {
      if (soldByUserId) {
        filters.soldByUserId = soldByUserId;
      }
    } else {
      filters.soldByUserId = auth.userId;
    }

    const sales = await listSales(filters);
    const formattedSales = sales.map((sale) => {
      const netTotal = sale.items.reduce(
        (sum, item) => sum + Number(item.lineTotal),
        0,
      );
      const totalCost = sale.items.reduce((sum, item) => {
        const itemCost = item.allocations.reduce((allocSum, allocation) => {
          const unitCost = Number(
            allocation.stockLot.stockInItem?.unitCost ?? 0,
          );
          return allocSum + unitCost * allocation.qtyTaken;
        }, 0);
        return sum + itemCost;
      }, 0);
      const profit = netTotal - totalCost;

      return {
        id: sale.id,
        receiptNo: sale.receiptNo,
        netTotal,
        totalCost,
        profit,
        paymentMethod: sale.paymentMethod,
        createdAt: sale.soldAt.toISOString(),
        soldBy: {
          id: sale.soldBy.id,
          name: sale.soldBy.name,
          username: sale.soldBy.username,
        },
        items: sale.items.map((item) => ({
          id: item.id,
          productName: item.product.name,
          quantity: item.qty,
          unitPrice: Number(item.unitPrice),
          subtotal: Number(item.lineTotal),
        })),
      };
    });
    res.json(formattedSales);
  } catch (error) {
    next(error);
  }
}

export async function getSaleHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const auth = req as AuthenticatedRequest;
    const sale = await getSaleById(req.params.id);
    if (!sale) {
      throw buildError(404, "sale-not-found");
    }
    if (auth.role === "STAFF" && sale.soldByUserId !== auth.userId) {
      throw buildError(403, "forbidden");
    }
    res.json(sale);
  } catch (error) {
    next(error);
  }
}

export async function reprintSaleHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const auth = req as AuthenticatedRequest;
    const sale = await getSaleById(req.params.id);
    if (!sale) {
      throw buildError(404, "sale-not-found");
    }
    if (auth.role === "STAFF" && sale.soldByUserId !== auth.userId) {
      throw buildError(403, "forbidden");
    }
    res.json(sale);
  } catch (error) {
    next(error);
  }
}
