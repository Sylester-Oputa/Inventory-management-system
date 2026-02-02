import type { Request, Response, NextFunction } from 'express';
import { createStaff, listUsers, resetPassword, toggleUser } from '../services/userService';

export async function getUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function createStaffHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await createStaff(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

export async function toggleUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await toggleUser(req.params.id, req.body.isActive);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function resetPasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await resetPassword(req.params.id, req.body.password);
    res.json(user);
  } catch (error) {
    next(error);
  }
}
