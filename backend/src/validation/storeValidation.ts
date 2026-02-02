import { z } from "zod";

export const storeInfoSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Store name is required"),
    address: z.string().min(1, "Store address is required"),
    phone: z.string().min(1, "Store phone is required"),
  }),
});
