import type { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import {
  authenticate,
  changePassword,
  resetOwnerPasswordWithRecoveryCode,
} from "../services/authService";

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { username, password } = req.body;
    const result = await authenticate(username, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function changePasswordHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const auth = req as AuthenticatedRequest;
    const { currentPassword, newPassword } = req.body;
    const result = await changePassword(
      auth.userId,
      currentPassword,
      newPassword,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function resetOwnerPasswordHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { username, recoveryCode, newPassword } = req.body;
    const result = await resetOwnerPasswordWithRecoveryCode(
      username,
      recoveryCode,
      newPassword,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}
