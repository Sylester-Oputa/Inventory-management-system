import { Router } from "express";
import { setupOwner } from "../controllers/setupController";
import {
  getStoreInfoHandler,
  updateStoreInfoHandler,
} from "../controllers/storeController";
import { validateRequest } from "../middleware/validateRequest";
import { setupOwnerSchema } from "../validation/setupValidation";
import { storeInfoSchema } from "../validation/storeValidation";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * /setup/owner:
 *   post:
 *     summary: Create the initial owner account (only once)
 *     tags:
 *       - Setup
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SetupOwnerRequest'
 *           example:
 *             name: Owner Person
 *             username: owner@example.com
 *             password: StrongPass#1
 *     responses:
 *       201:
 *         description: Owner created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SetupOwnerResponse'
 *       409:
 *         description: Owner already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/owner", validateRequest(setupOwnerSchema), setupOwner);

/**
 * @swagger
 * /setup/store:
 *   get:
 *     summary: Get store information
 *     tags:
 *       - Setup
 *     responses:
 *       200:
 *         description: Store information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 address:
 *                   type: string
 *                 phone:
 *                   type: string
 *       404:
 *         description: Store not found
 */
router.get("/store", getStoreInfoHandler);

/**
 * @swagger
 * /setup/store:
 *   put:
 *     summary: Update store information
 *     tags:
 *       - Setup
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *           example:
 *             name: EliMed Pharmacy
 *             address: 123 Main Street
 *             phone: +1234567890
 *     responses:
 *       200:
 *         description: Store updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 address:
 *                   type: string
 *                 phone:
 *                   type: string
 */
router.put(
  "/store",
  requireAuth,
  validateRequest(storeInfoSchema),
  updateStoreInfoHandler,
);

export default router;
