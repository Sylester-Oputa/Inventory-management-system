import { z } from 'zod';

export const setupOwnerSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    username: z.string().min(3),
    password: z.string().min(8),
  }),
});
