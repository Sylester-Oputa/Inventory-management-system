import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(3),
    password: z.string().min(6),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(8),
  }),
});

export const resetOwnerPasswordSchema = z.object({
  body: z.object({
    username: z.string().min(3),
    recoveryCode: z.string().length(6),
    newPassword: z.string().min(8),
  }),
});
