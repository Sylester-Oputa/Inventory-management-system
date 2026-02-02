import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma";
import { env } from "../config/env";
import { buildError } from "../utils/errors";

export interface AuthenticatedRequest extends Request {
  userId: string;
  role: string;
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const header = req.headers.authorization;
    if (!header) {
      throw buildError(401, "authorization-required");
    }
    const [, token] = header.split(" ");
    if (!token) {
      throw buildError(401, "invalid-auth-header");
    }
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      sub: string;
      role: string;
    };
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw buildError(401, "invalid-credentials");
    }
    (req as AuthenticatedRequest).userId = user.id;
    (req as AuthenticatedRequest).role = user.role;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.role || !roles.includes(authReq.role)) {
      return next(buildError(403, "forbidden"));
    }
    next();
  };
}
