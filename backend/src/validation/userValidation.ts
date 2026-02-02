import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    username: z.string().min(3),
    password: z.string().min(8),
  }),
});

export const toggleUserSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(8),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});
