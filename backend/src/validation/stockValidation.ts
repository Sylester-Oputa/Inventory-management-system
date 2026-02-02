import { z } from 'zod';

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: 'invalid-date',
  });

const stockInItemSchema = z.object({
  productId: z.string().uuid(),
  qtyAdded: z.number().int().positive(),
  unitCost: z.number().positive(),
  expiryDate: dateString,
});

export const stockInSchema = z.object({
  body: z.object({
    items: z.array(stockInItemSchema).nonempty(),
    note: z.string().optional(),
  }),
});
