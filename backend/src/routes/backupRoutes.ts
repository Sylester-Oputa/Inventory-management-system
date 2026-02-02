import { Router } from 'express';
import { exportBackupHandler, restoreBackupHandler, runBackupHandler } from '../controllers/backupController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { backupExportSchema, backupRestoreSchema } from '../validation/backupValidation';

const router = Router();

router.use(requireAuth);
router.use(requireRole('OWNER'));

/**
 * @swagger
 * /backup/run:
 *   post:
 *     summary: Run database backup (owner only)
 *     tags:
 *       - Backup
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Backup created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BackupRunResponse'
 */
router.post('/run', runBackupHandler);

/**
 * @swagger
 * /backup/export:
 *   post:
 *     summary: Copy a backup file to a target folder
 *     tags:
 *       - Backup
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BackupExportRequest'
 *     responses:
 *       200:
 *         description: Backup exported
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BackupRunResponse'
 */
router.post('/export', validateRequest(backupExportSchema), exportBackupHandler);

/**
 * @swagger
 * /backup/restore:
 *   post:
 *     summary: Restore a backup (dangerous)
 *     tags:
 *       - Backup
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BackupRestoreRequest'
 *     responses:
 *       200:
 *         description: Backup restored
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 restored:
 *                   type: boolean
 *                 path:
 *                   type: string
 */
router.post('/restore', validateRequest(backupRestoreSchema), restoreBackupHandler);

export default router;
