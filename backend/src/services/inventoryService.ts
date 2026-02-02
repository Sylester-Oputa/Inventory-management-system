import prisma from "../prisma";

export async function getInventory(includeInactive = false) {
  const products = await prisma.product.findMany({
    where: includeInactive ? undefined : { isActive: true },
    orderBy: { name: "asc" },
  });
  if (!products.length) {
    return [];
  }
  const productIds = products.map((product) => product.id);
  const lots = await prisma.stockLot.findMany({
    where: {
      productId: { in: productIds },
      qtyRemaining: { gt: 0 },
    },
    select: {
      id: true,
      productId: true,
      lotRefNo: true,
      qtyRemaining: true,
      expiryDate: true,
    },
    orderBy: { expiryDate: "asc" },
  });

  const productLotsMap = new Map<string, typeof lots>();
  for (const product of products) {
    productLotsMap.set(product.id, []);
  }
  for (const lot of lots) {
    const existing = productLotsMap.get(lot.productId);
    if (existing) {
      existing.push(lot);
    }
  }

  return products.map((product) => {
    const productLots = productLotsMap.get(product.id) ?? [];
    const totalQty = productLots.reduce(
      (sum, lot) => sum + lot.qtyRemaining,
      0,
    );
    return {
      id: product.id,
      name: product.name,
      sellingPrice: product.sellingPrice,
      reorderLevel: product.reorderLevel,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      totalQty,
      lots: productLots.map((lot) => ({
        id: lot.id,
        lotRefNo: lot.lotRefNo,
        expiryDate: lot.expiryDate.toISOString().split("T")[0],
        qtyRemaining: lot.qtyRemaining,
      })),
    };
  });
}
