import { Router } from "express";
import { getDashboardSummaryHandler } from "../controllers/dashboardController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Get dashboard summary (Owner sees all, Staff sees own)
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 todaysSales:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     transactionCount:
 *                       type: integer
 *                     profit:
 *                       type: number
 *                 recentTransactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       receiptNo:
 *                         type: string
 *                       time:
 *                         type: string
 *                       soldBy:
 *                         type: string
 *                       total:
 *                         type: number
 *                 alerts:
 *                   type: object
 *                   properties:
 *                     lowStockCount:
 *                       type: integer
 *                     expiringCount:
 *                       type: integer
 *                     expiredCount:
 *                       type: integer
 */
router.get("/summary", getDashboardSummaryHandler);

export default router;
