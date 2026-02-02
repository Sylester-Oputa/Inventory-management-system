import { z } from 'zod';

export const backupExportSchema = z.object({
  body: z.object({
    targetPath: z.string().min(1),
    sourcePath: z.string().optional(),
  }),
});

export const backupRestoreSchema = z.object({
  body: z.object({
    backupPath: z.string().min(1),
    confirmation: z.literal(true),
  }),
});
