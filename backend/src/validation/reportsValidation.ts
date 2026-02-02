import { z } from 'zod';

export const salesReportSchema = z.object({
  query: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    soldByUserId: z.string().uuid().optional(),
    productId: z.string().uuid().optional(),
    receiptNo: z.string().optional(),
  }),
});

export const topProductsSchema = z.object({
  query: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    limit: z.preprocess((value) => (value ? Number(value) : undefined), z.number().int().positive().optional()),
  }),
});

export const expiringReportSchema = z.object({
  query: z.object({
    days: z.preprocess((value) => (value ? Number(value) : undefined), z.number().int().positive()),
  }),
});
