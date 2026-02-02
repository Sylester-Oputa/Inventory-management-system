import type { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { createProduct, getProductById, listProducts, updateProduct } from '../services/productService';
import { getInventory } from '../services/inventoryService';
import { buildError } from '../utils/errors';

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product catalog management
 */

export async function getProductList(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req as AuthenticatedRequest;
    const includeInactive = auth.role === 'OWNER' && req.query.includeInactive === 'true';
    const products = await listProducts(includeInactive);
    res.json(products);
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req as AuthenticatedRequest;
    const product = await getProductById(req.params.id);
    if (!product) {
      throw buildError(404, 'product-not-found');
    }
    if (auth.role === 'STAFF' && !product.isActive) {
      throw buildError(404, 'product-not-found');
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function createProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

export async function updateProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function getInventoryList(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req as AuthenticatedRequest;
    const includeInactive = auth.role === 'OWNER' && req.query.includeInactive === 'true';
    const inventory = await getInventory(includeInactive);
    res.json(inventory);
  } catch (error) {
    next(error);
  }
}
