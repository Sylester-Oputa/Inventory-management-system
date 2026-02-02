import { z } from 'zod';

export const productCreateSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    sellingPrice: z.number().positive(),
    reorderLevel: z.number().int().nonnegative().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const productUpdateSchema = z.object({
  body: z
    .object({
      name: z.string().min(1).optional(),
      sellingPrice: z.number().positive().optional(),
      reorderLevel: z.number().int().nonnegative().nullable().optional(),
      isActive: z.boolean().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, { message: 'no-fields' }),
  params: z.object({
    id: z.string().uuid(),
  }),
});
