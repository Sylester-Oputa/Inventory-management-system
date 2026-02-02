import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { buildSequenceNumber } from "../utils/sequence";
import { buildError } from "../utils/errors";
import { getNextDailySequence } from "./sequenceService";

type SaleItemInput = {
  productId: string;
  qty: number;
};

type SalePayload = {
  userId: string;
  items: SaleItemInput[];
  paymentMethod?: string;
  note?: string;
};

type ListSalesOptions = {
  from?: Date;
  to?: Date;
  soldByUserId?: string;
  productId?: string;
  receiptNo?: string;
};

type StockLotRow = {
  id: string;
  qtyRemaining: number;
  expiryDate: Date;
  lotRefNo: string;
};

async function allocateLotsForSaleItem(
  tx: Prisma.TransactionClient,
  saleId: string,
  saleItemId: string,
  productId: string,
  qty: number,
) {
  const lots = await tx.$queryRaw<StockLotRow[]>(
    Prisma.sql`
      SELECT "id", "qtyRemaining", "expiryDate", "lotRefNo"
      FROM "StockLot"
      WHERE "productId" = ${productId}
        AND "qtyRemaining" > 0
      ORDER BY "expiryDate" ASC, "createdAt" ASC
    `,
  );

  let remaining = qty;

  // DEBUG: Log allocation start
  console.log(`=== ALLOCATING ${qty} units of product ${productId} ===`);
  console.log(`Found ${lots.length} lots with stock`);

  for (const lot of lots) {
    if (remaining <= 0) {
      break;
    }
    const take = Math.min(remaining, lot.qtyRemaining);
    if (take <= 0) {
      continue;
    }

    // DEBUG: Log each lot deduction
    console.log(
      `Lot ${lot.id}: Taking ${take} from ${lot.qtyRemaining} (Lot: ${lot.lotRefNo})`,
    );

    await tx.stockLot.update({
      where: { id: lot.id },
      data: { qtyRemaining: { decrement: take } },
    });
    await tx.saleLotAllocation.create({
      data: {
        saleId,
        saleItemId,
        stockLotId: lot.id,
        qtyTaken: take,
      },
    });
    remaining -= take;

    console.log(`  -> Remaining to allocate: ${remaining}`);
  }

  console.log("=== ALLOCATION COMPLETE ===");

  if (remaining > 0) {
    throw buildError(400, "stock-too-low", `stock-too-low:${productId}`);
  }
}

export async function createSale(payload: SalePayload) {
  if (!payload.items.length) {
    throw buildError(400, "sale-items-required");
  }
  for (const item of payload.items) {
    if (!Number.isInteger(item.qty) || item.qty <= 0) {
      throw buildError(400, "invalid-qty", "invalid-qty");
    }
  }

  return prisma.$transaction(
    async (tx) => {
      const productIds = payload.items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });
      const productMap = new Map(
        products.map((product) => [product.id, product]),
      );

      const requestedTotals = new Map<string, number>();
      for (const item of payload.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw buildError(
            400,
            "product-not-found",
            `product-not-found:${item.productId}`,
          );
        }
        if (!product.isActive) {
          throw buildError(
            400,
            "product-inactive",
            `product-inactive:${product.name}`,
          );
        }
        const current = requestedTotals.get(item.productId) ?? 0;
        requestedTotals.set(item.productId, current + item.qty);
      }

      const totals = await tx.stockLot.groupBy({
        by: ["productId"],
        _sum: { qtyRemaining: true },
        where: {
          productId: { in: productIds },
          qtyRemaining: { gt: 0 },
        },
      });
      const totalMap = new Map(
        totals.map((row) => [row.productId, row._sum.qtyRemaining ?? 0]),
      );

      for (const [productId, requestedQty] of requestedTotals.entries()) {
        const available = totalMap.get(productId) ?? 0;
        if (available < requestedQty) {
          throw buildError(400, "stock-too-low", `stock-too-low:${productId}`);
        }
      }

      const { seq, dateKey } = await getNextDailySequence(tx, "RCPT");
      const receiptNo = buildSequenceNumber("RCPT", dateKey, seq);

      let totalAmount = 0;
      const saleItemsData = payload.items.map((item) => {
        const product = productMap.get(item.productId)!;
        const unitPrice = Number(product.sellingPrice);
        const lineTotal = unitPrice * item.qty;
        totalAmount = totalAmount + lineTotal;
        return {
          productId: item.productId,
          qty: item.qty,
          unitPrice,
          lineTotal,
        };
      });

      const sale = await tx.sale.create({
        data: {
          receiptNo,
          soldByUserId: payload.userId,
          totalAmount,
          paymentMethod: payload.paymentMethod ?? null,
          note: payload.note ?? null,
        },
      });

      for (const saleItemData of saleItemsData) {
        const saleItem = await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: saleItemData.productId,
            qty: saleItemData.qty,
            unitPrice: saleItemData.unitPrice,
            lineTotal: saleItemData.lineTotal,
          },
        });
        await allocateLotsForSaleItem(
          tx,
          sale.id,
          saleItem.id,
          saleItem.productId,
          saleItem.qty,
        );
      }

      return getSaleById(sale.id, tx);
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function listSales(options?: ListSalesOptions) {
  const where: Prisma.SaleWhereInput = {};
  if (options?.from || options?.to) {
    where.soldAt = {};
    if (options.from) {
      where.soldAt.gte = options.from;
    }
    if (options.to) {
      where.soldAt.lte = options.to;
    }
  }
  if (options?.soldByUserId) {
    where.soldByUserId = options.soldByUserId;
  }
  if (options?.productId) {
    where.items = { some: { productId: options.productId } };
  }
  if (options?.receiptNo) {
    where.receiptNo = options.receiptNo;
  }
  return prisma.sale.findMany({
    where,
    orderBy: { soldAt: "desc" },
    include: {
      items: {
        include: {
          product: true,
          allocations: {
            include: {
              stockLot: {
                include: {
                  stockInItem: true,
                },
              },
            },
          },
        },
      },
      soldBy: {
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function getSaleById(id: string, tx?: Prisma.TransactionClient) {
  const client = tx ?? prisma;
  return client.sale.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
          allocations: {
            include: {
              stockLot: {
                include: {
                  stockInItem: true,
                },
              },
            },
          },
        },
      },
      soldBy: {
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      },
    },
  });
}
