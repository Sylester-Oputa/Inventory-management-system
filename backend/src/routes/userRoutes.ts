import { Router } from 'express';
import {
  createStaffHandler,
  getUsers,
  resetPasswordHandler,
  toggleUserHandler,
} from '../controllers/userController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { createUserSchema, resetPasswordSchema, toggleUserSchema } from '../validation/userValidation';

const router = Router();

router.use(requireAuth);
router.use(requireRole('OWNER'));

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List all user accounts (owner-only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *   post:
 *     summary: Create a new staff account (owner-only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreateRequest'
 *     responses:
 *       201:
 *         description: New staff user created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/', getUsers);
router.post('/', validateRequest(createUserSchema), createStaffHandler);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Enable or disable a user account
 *     tags:
 *       - Users
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
 *             $ref: '#/components/schemas/UserToggleRequest'
 *     responses:
 *       200:
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.patch('/:id', validateRequest(toggleUserSchema), toggleUserHandler);

/**
 * @swagger
 * /users/{id}/reset-password:
 *   post:
 *     summary: Reset a staff member's password
 *     tags:
 *       - Users
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
 *             $ref: '#/components/schemas/UserResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.post('/:id/reset-password', validateRequest(resetPasswordSchema), resetPasswordHandler);

export default router;
