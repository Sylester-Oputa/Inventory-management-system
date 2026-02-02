import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';
import type { ApiError } from '../utils/errors';

function mapError(err: ApiError) {
  if (err.message === 'cors-not-allowed') {
    return { status: 403, code: 'cors-not-allowed', message: 'cors-not-allowed' };
  }
  if (err.name === 'JsonWebTokenError') {
    return { status: 401, code: 'invalid-token', message: 'invalid-token' };
  }
  if (err.name === 'TokenExpiredError') {
    return { status: 401, code: 'token-expired', message: 'token-expired' };
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return { status: 409, code: 'conflict', message: 'conflict', details: err.meta };
    }
    if (err.code === 'P2025') {
      return { status: 404, code: 'not-found', message: 'not-found', details: err.meta };
    }
    if (err.code === 'P2003') {
      return { status: 400, code: 'foreign-key-violation', message: 'foreign-key-violation', details: err.meta };
    }
  }
  return null;
}

export function errorHandler(err: ApiError, _req: Request, res: Response, _next: NextFunction) {
  const mapped = mapError(err);
  const status = mapped?.status ?? err.status ?? 500;
  const code = mapped?.code ?? err.code ?? err.message ?? 'server_error';
  const message = mapped?.message ?? err.message ?? 'internal-server-error';
  const details = mapped?.details ?? err.details ?? null;

  if (status >= 500) {
    logger.error({ err }, message);
  } else {
    logger.warn({ err }, message);
  }

  res.status(status).json({
    error: {
      message,
      code,
      details,
    },
  });
}
