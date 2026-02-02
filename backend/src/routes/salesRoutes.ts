import { Router } from 'express';
import {
  createSaleHandler,
  getSaleHandler,
  listSalesHandler,
  reprintSaleHandler,
} from '../controllers/salesController';
import { requireAuth } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { createSaleSchema, saleListSchema } from '../validation/salesValidation';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * /sales:
 *   post:
 *     summary: Create a sale (Owner + Staff)
 *     tags:
 *       - Sales
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SaleCreateRequest'
 *           example:
 *             paymentMethod: CASH
 *             items:
 *               - productId: 8a2a5b34-4ce2-47a0-8f21-1385f3b52f9c
 *                 qty: 2
 *     responses:
 *       201:
 *         description: Sale created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 */
router.post('/', validateRequest(createSaleSchema), createSaleHandler);

/**
 * @swagger
 * /sales:
 *   get:
 *     summary: List sales (Owner sees all, Staff sees own)
 *     tags:
 *       - Sales
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
router.get('/', validateRequest(saleListSchema), listSalesHandler);

/**
 * @swagger
 * /sales/{id}:
 *   get:
 *     summary: Get sale detail
 *     tags:
 *       - Sales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sale detail
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 */
router.get('/:id', getSaleHandler);

/**
 * @swagger
 * /sales/{id}/reprint:
 *   post:
 *     summary: Reprint receipt payload
 *     tags:
 *       - Sales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Receipt payload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 */
router.post('/:id/reprint', reprintSaleHandler);

export default router;
