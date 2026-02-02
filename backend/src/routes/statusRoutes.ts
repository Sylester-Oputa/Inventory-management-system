import { Router } from "express";
import { getSetupStatus } from "../controllers/statusController";

const router = Router();

/**
 * @swagger
 * /status/setup:
 *   get:
 *     summary: Check if initial setup is complete
 *     tags:
 *       - Status
 *     responses:
 *       200:
 *         description: Setup status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSetupComplete:
 *                   type: boolean
 */
router.get("/setup", getSetupStatus);

export default router;
