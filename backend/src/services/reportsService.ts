import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { addDays, startOfDay } from "../utils/date";

type ReportRange = {
  from?: Date;
  to?: Date;
};

export async function getTopProducts(range: ReportRange, limit = 10) {
  const saleWhere: Prisma.SaleWhereInput = {};
  const soldAt: Prisma.DateTimeFilter = {};
  if (range.from) {
    soldAt.gte = range.from;
  }
  if (range.to) {
    soldAt.lte = range.to;
  }
  if (Object.keys(soldAt).length) {
    saleWhere.soldAt = soldAt;
  }

  const grouped = await prisma.saleItem.groupBy({
    by: ["productId"],
    _sum: {
      qty: true,
      lineTotal: true,
    },
    where: {
      sale: saleWhere,
    },
    orderBy: {
      _sum: {
        qty: "desc",
      },
    },
    take: limit,
  });

  const productIds = grouped.map((row) => row.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });
  const productMap = new Map(products.map((product) => [product.id, product]));

  return grouped.map((row) => ({
    productId: row.productId,
    name: productMap.get(row.productId)?.name ?? null,
    totalQty: row._sum.qty ?? 0,
    totalSales: Number(row._sum.lineTotal ?? 0),
  }));
}

export async function getLowStockProducts() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      reorderLevel: { not: null },
    },
    orderBy: { name: "asc" },
  });

  if (!products.length) {
    return [];
  }

  const productIds = products.map((product) => product.id);
  const totals = await prisma.stockLot.groupBy({
    by: ["productId"],
    _sum: { qtyRemaining: true },
    where: { productId: { in: productIds }, qtyRemaining: { gt: 0 } },
  });
  const totalMap = new Map(
    totals.map((row) => [row.productId, row._sum.qtyRemaining ?? 0]),
  );

  return products
    .map((product) => ({
      ...product,
      totalQty: totalMap.get(product.id) ?? 0,
    }))
    .filter(
      (product) =>
        product.reorderLevel !== null &&
        product.totalQty <= (product.reorderLevel ?? 0),
    );
}

export async function getExpiringLots(days: number) {
  const today = startOfDay(new Date());
  const cutoff = addDays(today, days);
  const lots = await prisma.stockLot.findMany({
    where: {
      qtyRemaining: { gt: 0 },
      expiryDate: {
        gte: today,
        lte: cutoff,
      },
    },
    orderBy: { expiryDate: "asc" },
    include: {
      product: true,
    },
  });

  return lots.map((lot) => {
    const daysUntilExpiry = Math.floor(
      (lot.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return {
      id: lot.id,
      lotRefNo: lot.lotRefNo,
      expiryDate: lot.expiryDate.toISOString().split("T")[0],
      qtyRemaining: lot.qtyRemaining,
      product: {
        id: lot.product.id,
        name: lot.product.name,
      },
      daysUntilExpiry,
    };
  });
}

export async function getExpiredLots() {
  const today = startOfDay(new Date());
  const lots = await prisma.stockLot.findMany({
    where: {
      qtyRemaining: { gt: 0 },
      expiryDate: {
        lt: today,
      },
    },
    orderBy: { expiryDate: "asc" },
    include: {
      product: true,
    },
  });

  return lots.map((lot) => {
    const daysExpired = Math.floor(
      (today.getTime() - lot.expiryDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return {
      id: lot.id,
      lotRefNo: lot.lotRefNo,
      expiryDate: lot.expiryDate.toISOString().split("T")[0],
      qtyRemaining: lot.qtyRemaining,
      product: {
        id: lot.product.id,
        name: lot.product.name,
      },
      daysExpired,
    };
  });
}
