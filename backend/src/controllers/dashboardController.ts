import type { Request, Response, NextFunction } from "express";
import { getDashboardSummary } from "../services/dashboardService";

export async function getDashboardSummaryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user?.id;
    const role = (req as any).user?.role;
    const summary = await getDashboardSummary(userId, role);
    res.json(summary);
  } catch (error) {
    next(error);
  }
}
