import type { Request, Response, NextFunction } from "express";
import prisma from "../prisma";

export async function getSetupStatus(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const owner = await prisma.user.findFirst({ where: { role: "OWNER" } });
    res.json({
      isSetupComplete: !!owner,
    });
  } catch (error) {
    next(error);
  }
}
