import prisma from "../prisma";
import { buildError } from "../utils/errors";

export type ProductInput = {
  name: string;
  sellingPrice: number;
  reorderLevel?: number | null;
  isActive?: boolean;
};

export async function listProducts(includeInactive = false) {
  const products = await prisma.product.findMany({
    where: includeInactive ? undefined : { isActive: true },
    orderBy: { name: "asc" },
  });

  if (!products.length) {
    return [];
  }

  const productIds = products.map((p) => p.id);
  const lots = await prisma.stockLot.findMany({
    where: {
      productId: { in: productIds },
      qtyRemaining: { gt: 0 },
    },
    select: {
      productId: true,
      qtyRemaining: true,
    },
  });

  const totals = new Map<string, number>();
  for (const product of products) {
    totals.set(product.id, 0);
  }
  for (const lot of lots) {
    const existing = totals.get(lot.productId) ?? 0;
    totals.set(lot.productId, existing + lot.qtyRemaining);
  }

  return products.map((product) => ({
    ...product,
    totalQty: totals.get(product.id) ?? 0,
  }));
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

export async function createProduct(payload: ProductInput) {
  return prisma.product.create({
    data: {
      name: payload.name,
      sellingPrice: payload.sellingPrice,
      reorderLevel: payload.reorderLevel ?? null,
      isActive: payload.isActive ?? true,
    },
  });
}

export async function updateProduct(
  id: string,
  payload: Partial<ProductInput>,
) {
  const data: Record<string, unknown> = {};
  if (payload.name !== undefined) {
    data.name = payload.name;
  }
  if (payload.sellingPrice !== undefined) {
    data.sellingPrice = payload.sellingPrice;
  }
  if (payload.reorderLevel !== undefined) {
    data.reorderLevel = payload.reorderLevel;
  }
  if (payload.isActive !== undefined) {
    data.isActive = payload.isActive;
  }
  if (!Object.keys(data).length) {
    throw buildError(400, "nothing-to-update");
  }
  return prisma.product.update({ where: { id }, data });
}
