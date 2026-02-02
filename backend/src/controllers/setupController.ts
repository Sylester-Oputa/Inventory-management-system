import type { Request, Response, NextFunction } from 'express';
import { createOwner } from '../services/setupService';

export async function setupOwner(req: Request, res: Response, next: NextFunction) {
  try {
    const owner = await createOwner(req.body);
    res.status(201).json(owner);
  } catch (error) {
    next(error);
  }
}
