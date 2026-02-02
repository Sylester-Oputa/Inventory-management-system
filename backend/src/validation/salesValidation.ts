import { z } from 'zod';

const saleItemSchema = z.object({
  productId: z.string().uuid(),
  qty: z.number().int().positive(),
});

export const createSaleSchema = z.object({
  body: z.object({
    items: z.array(saleItemSchema).nonempty(),
    paymentMethod: z.string().optional(),
    note: z.string().optional(),
  }),
});

export const saleListSchema = z.object({
  query: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    soldByUserId: z.string().uuid().optional(),
    productId: z.string().uuid().optional(),
    receiptNo: z.string().optional(),
  }),
});
