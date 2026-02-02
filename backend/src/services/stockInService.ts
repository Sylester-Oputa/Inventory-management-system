import prisma from "../prisma";
import { buildSequenceNumber } from "../utils/sequence";
import { parseDateOnly } from "../utils/date";
import { buildError } from "../utils/errors";
import { getNextDailySequence } from "./sequenceService";

type StockInItemInput = {
  productId: string;
  qtyAdded: number;
  unitCost: number;
  expiryDate: string;
};

type StockInPayload = {
  userId: string;
  items: StockInItemInput[];
  note?: string;
};

export async function createStockIn(payload: StockInPayload) {
  if (!payload.items.length) {
    throw buildError(400, "stock-in-items-required");
  }

  // DEBUG: Log the exact payload received
  console.log("=== STOCK-IN DEBUG ===");
  console.log("Payload:", JSON.stringify(payload, null, 2));
  console.log("Items count:", payload.items.length);
  payload.items.forEach((item, index) => {
      console.log(`Item ${index}:`, {
        productId: item.productId,
        qtyAdded: item.qtyAdded,
        unitCost: item.unitCost,
        expiryDate: item.expiryDate,
      });
  });
  console.log("====================");

  return prisma.$transaction(async (tx) => {
    const { seq, dateKey } = await getNextDailySequence(tx, "STK");
    const refNo = buildSequenceNumber("STK", dateKey, seq);

    const productIds = payload.items.map((item) => item.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

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
    }

    const parsedItems = payload.items.map((item) => ({
      productId: item.productId,
      qtyAdded: item.qtyAdded,
      unitCost: item.unitCost,
      expiryDate: parseDateOnly(item.expiryDate),
    }));

    const stockIn = await tx.stockIn.create({
      data: {
        refNo,
        createdByUserId: payload.userId,
        note: payload.note ?? null,
        items: {
          create: parsedItems,
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    await tx.stockLot.createMany({
      data: stockIn.items.map((item) => ({
        productId: item.productId,
        stockInItemId: item.id,
        lotRefNo: refNo,
        expiryDate: item.expiryDate,
        qtyRemaining: item.qtyAdded,
        createdByUserId: payload.userId,
      })),
    });

    // DEBUG: Log what lots were created
    console.log("=== LOTS CREATED ===");
    stockIn.items.forEach((item) => {
      console.log(
        `Lot for product ${item.productId}: qtyRemaining = ${item.qtyAdded}`,
      );
    });
    console.log("===================");

    return tx.stockIn.findUnique({
      where: { id: stockIn.id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
        items: {
          include: {
            product: true,
            stockLots: {
              select: {
                id: true,
                lotRefNo: true,
                expiryDate: true,
                qtyRemaining: true,
              },
            },
          },
        },
      },
    });
  });
}

export async function listStockIns() {
  return prisma.stockIn.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      },
      items: {
        include: {
          product: true,
          stockLots: {
            select: {
              id: true,
              lotRefNo: true,
              expiryDate: true,
              qtyRemaining: true,
            },
          },
        },
      },
    },
  });
}

export async function getStockInById(id: string) {
  return prisma.stockIn.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      },
      items: {
        include: {
          product: true,
          stockLots: {
            select: {
              id: true,
              lotRefNo: true,
              expiryDate: true,
              qtyRemaining: true,
            },
          },
        },
      },
    },
  });
}
