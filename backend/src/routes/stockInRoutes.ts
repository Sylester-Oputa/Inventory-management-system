import { Router } from 'express';
import { restockProducts, getStockInEntry, getStockInList } from '../controllers/stockInController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { stockInSchema } from '../validation/stockValidation';

const router = Router();

router.use(requireAuth);
router.use(requireRole('OWNER'));

/**
 * @swagger
 * /stock-in:
 *   post:
 *     summary: Record a stock-in operation (owner only)
 *     tags:
 *       - StockIn
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockInCreateRequest'
 *           example:
 *             note: Initial stock
 *             items:
 *               - productId: 8a2a5b34-4ce2-47a0-8f21-1385f3b52f9c
 *                 qtyAdded: 5
 *                 unitCost: 8.5
 *                 expiryDate: 2026-06-30
 *     responses:
 *       201:
 *         description: Stock-in recorded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StockIn'
 */
router.post('/', validateRequest(stockInSchema), restockProducts);

/**
 * @swagger
 * /stock-in:
 *   get:
 *     summary: List all stock-in entries (owner only)
 *     tags:
 *       - StockIn
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of stock-in records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StockIn'
 */
router.get('/', getStockInList);

/**
 * @swagger
 * /stock-in/{id}:
 *   get:
 *     summary: Get stock-in entry detail
 *     tags:
 *       - StockIn
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
 *         description: Stock-in detail
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StockIn'
 */
router.get('/:id', getStockInEntry);

export default router;
