import { Router } from "express";
import * as exportController from "../controllers/exportController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * /export/generate:
 *   post:
 *     summary: Generate daily Excel export
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Export generated successfully
 */
router.post("/generate", requireAuth, exportController.generateExport);

/**
 * @swagger
 * /export/list:
 *   get:
 *     summary: List all exports
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of exports
 */
router.get("/list", requireAuth, exportController.listExports);

/**
 * @swagger
 * /export/download/{filename}:
 *   get:
 *     summary: Download an export file
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File downloaded
 */
router.get("/download/:filename", requireAuth, exportController.downloadExport);

/**
 * @swagger
 * /export/delete/{filename}:
 *   delete:
 *     summary: Delete an export file
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Export deleted
 */
router.delete("/delete/:filename", requireAuth, exportController.deleteExport);

export default router;
