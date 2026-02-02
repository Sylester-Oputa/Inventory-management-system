import { Router } from 'express';
import {
  createProductHandler,
  getProduct,
  getProductList,
  updateProductHandler,
} from '../controllers/productController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { productCreateSchema, productUpdateSchema } from '../validation/productValidation';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: List products (Owner + Staff)
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: includeInactive
 *         in: query
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Array of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *   post:
 *     summary: Create product (owner only)
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreateRequest'
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
router.get('/', getProductList);
router.post('/', requireRole('OWNER'), validateRequest(productCreateSchema), createProductHandler);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by id
 *     tags:
 *       - Products
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
 *         description: Product detail
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *   patch:
 *     summary: Update product (owner only)
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductUpdateRequest'
 *     responses:
 *       200:
 *         description: Updated product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
router.get('/:id', getProduct);
router.patch('/:id', requireRole('OWNER'), validateRequest(productUpdateSchema), updateProductHandler);

export default router;
