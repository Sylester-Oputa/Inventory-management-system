import { Router } from 'express';
import {
  expiredLotsHandler,
  expiringLotsHandler,
  lowStockHandler,
  salesReportHandler,
  topProductsHandler,
} from '../controllers/reportsController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { expiringReportSchema, salesReportSchema, topProductsSchema } from '../validation/reportsValidation';

const router = Router();

router.use(requireAuth);
router.use(requireRole('OWNER'));

/**
 * @swagger
 * /reports/sales:
 *   get:
 *     summary: Sales report (owner only)
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: from
 *         in: query
 *         schema:
 *           type: string
 *       - name: to
 *         in: query
 *         schema:
 *           type: string
 *       - name: soldByUserId
 *         in: query
 *         schema:
 *           type: string
 *       - name: productId
 *         in: query
 *         schema:
 *           type: string
 *       - name: receiptNo
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sales array
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sale'
 */
router.get('/sales', validateRequest(salesReportSchema), salesReportHandler);

/**
 * @swagger
 * /reports/top-products:
 *   get:
 *     summary: Top selling products (owner only)
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: from
 *         in: query
 *         schema:
 *           type: string
 *       - name: to
 *         in: query
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Top products list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TopProduct'
 */
router.get('/top-products', validateRequest(topProductsSchema), topProductsHandler);

/**
 * @swagger
 * /reports/low-stock:
 *   get:
 *     summary: Products below reorder level (owner only)
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Low stock products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LowStockItem'
 */
router.get('/low-stock', lowStockHandler);

/**
 * @swagger
 * /reports/expiring:
 *   get:
 *     summary: Lots expiring within X days (owner only)
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: days
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Expiring lots
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExpiringLot'
 */
router.get('/expiring', validateRequest(expiringReportSchema), expiringLotsHandler);

/**
 * @swagger
 * /reports/expired:
 *   get:
 *     summary: Lots already expired (owner only)
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expired lots
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExpiringLot'
 */
router.get('/expired', expiredLotsHandler);

export default router;
