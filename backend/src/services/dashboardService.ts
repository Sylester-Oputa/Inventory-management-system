import { startOfDay, endOfDay } from "../utils/date";
import prisma from "../prisma";

export async function getDashboardSummary(userId: string, role: string) {
  const today = new Date();
  const startDate = startOfDay(today);
  const endDate = endOfDay(today);

  // Base query for today's sales
  const salesWhere: any = {
    soldAt: {
      gte: startDate,
      lte: endDate,
    },
  };

  // Staff members only see their own sales
  if (role === "STAFF") {
    salesWhere.soldByUserId = userId;
  }

  // Get today's sales aggregation
  const salesAgg = await prisma.sale.aggregate({
    where: salesWhere,
    _sum: {
      totalAmount: true,
    },
    _count: {
      id: true,
    },
  });

  const totalAmount = Number(salesAgg._sum.totalAmount ?? 0);
  const transactionCount = salesAgg._count.id;

  // Calculate profit (revenue - cost)
  // Get all sales IDs for today first
  const todaysSales = await prisma.sale.findMany({
    where: salesWhere,
    select: { id: true },
  });

  const salesIds = todaysSales.map((s) => s.id);

  const saleItems = await prisma.saleItem.findMany({
    where: {
      saleId: { in: salesIds },
    },
    include: {
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
  });

  let totalCost = 0;
  for (const item of saleItems) {
    for (const allocation of item.allocations) {
      if (allocation.stockLot.stockInItem) {
        const unitCost = Number(allocation.stockLot.stockInItem.unitCost);
        if (!isNaN(unitCost)) {
          totalCost += unitCost * allocation.qtyTaken;
        }
      }
    }
  }

  const totalProfit = totalAmount - totalCost;

  console.log("=== PROFIT DEBUG ===");
  console.log("Total Revenue:", totalAmount);
  console.log("Total Cost:", totalCost);
  console.log("Total Profit:", totalProfit);
  console.log("Sale Items:", saleItems.length);
  console.log(
    "Allocations with cost:",
    saleItems
      .flatMap((i) => i.allocations)
      .filter((a) => a.stockLot.stockInItem).length,
  );
  console.log("===================");

  // Get recent transactions (limit 5)
  const recentSales = await prisma.sale.findMany({
    where: salesWhere,
    orderBy: { soldAt: "desc" },
    take: 5,
    select: {
      id: true,
      receiptNo: true,
      soldAt: true,
      totalAmount: true,
      soldBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // For owners, get low stock items count
  let lowStockCount = 0;
  let expiringCount = 0;
  let expiredCount = 0;

  if (role === "OWNER") {
    // Low stock count
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        reorderLevel: { not: null },
      },
      select: {
        id: true,
        reorderLevel: true,
      },
    });

    if (products.length > 0) {
      const productIds = products.map((p) => p.id);
      const totals = await prisma.stockLot.groupBy({
        by: ["productId"],
        _sum: { qtyRemaining: true },
        where: { productId: { in: productIds }, qtyRemaining: { gt: 0 } },
      });
      const totalMap = new Map(
        totals.map((row) => [row.productId, row._sum.qtyRemaining ?? 0]),
      );

      lowStockCount = products.filter((p) => {
        const qty = totalMap.get(p.id) ?? 0;
        return p.reorderLevel !== null && qty <= p.reorderLevel;
      }).length;
    }

    // Expiring count (next 30 days)
    const in30Days = new Date(today);
    in30Days.setDate(in30Days.getDate() + 30);

    expiringCount = await prisma.stockLot.count({
      where: {
        qtyRemaining: { gt: 0 },
        expiryDate: {
          gte: startDate,
          lte: in30Days,
        },
      },
    });

    // Expired count
    expiredCount = await prisma.stockLot.count({
      where: {
        qtyRemaining: { gt: 0 },
        expiryDate: {
          lt: startDate,
        },
      },
    });
  }

  return {
    todaysSales: {
      total: totalAmount,
      transactionCount,
      profit: totalProfit,
      cost: totalCost,
    },
    recentTransactions: recentSales.map((sale) => ({
      id: sale.receiptNo,
      receiptNo: sale.receiptNo,
      time: sale.soldAt.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      soldBy: sale.soldBy.name,
      total: Number(sale.totalAmount),
    })),
    alerts: {
      lowStockCount,
      expiringCount,
      expiredCount,
    },
  };
}
