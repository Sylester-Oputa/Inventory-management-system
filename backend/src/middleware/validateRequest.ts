import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

export function validateRequest(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      const err = new Error('validation-error');
      (err as any).status = 400;
      (err as any).code = 'validation-error';
      (err as any).details = (error as any)?.errors ?? error;
      next(err);
    }
  };
}
