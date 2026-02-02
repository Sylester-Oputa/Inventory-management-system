import type { Request, Response, NextFunction } from "express";
import { getStoreInfo, updateStoreInfo } from "../services/storeService";

export async function getStoreInfoHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const store = await getStoreInfo();
    res.json(store);
  } catch (error) {
    next(error);
  }
}

export async function updateStoreInfoHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const store = await updateStoreInfo(req.body);
    res.json(store);
  } catch (error) {
    next(error);
  }
}
