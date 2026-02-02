import { Router } from "express";
import {
  changePasswordHandler,
  loginHandler,
  resetOwnerPasswordHandler,
} from "../controllers/authController";
import { requireAuth } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import {
  changePasswordSchema,
  loginSchema,
  resetOwnerPasswordSchema,
} from "../validation/authValidation";

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and obtain a JWT
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLoginRequest'
 *           example:
 *             username: owner@example.com
 *             password: StrongPass#1
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthLoginResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/login", validateRequest(loginSchema), loginHandler);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change current user's password
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updated:
 *                   type: boolean
 */
router.post(
  "/change-password",
  requireAuth,
  validateRequest(changePasswordSchema),
  changePasswordHandler,
);

/**
 * @swagger
 * /auth/reset-owner-password:
 *   post:
 *     summary: Reset owner password using recovery code
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               recoveryCode:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updated:
 *                   type: boolean
 */
router.post(
  "/reset-owner-password",
  validateRequest(resetOwnerPasswordSchema),
  resetOwnerPasswordHandler,
);

export default router;
