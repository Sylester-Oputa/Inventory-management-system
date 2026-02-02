import { Router } from 'express';
import { getInventoryList } from '../controllers/productController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * /inventory:
 *   get:
 *     summary: List product inventory levels (Owner + Staff)
 *     tags:
 *       - Inventory
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InventoryItem'
 */
router.get('/', getInventoryList);

export default router;
