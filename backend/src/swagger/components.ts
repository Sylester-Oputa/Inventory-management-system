/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *             code:
 *               type: string
 *             details:
 *               nullable: true
 *       example:
 *         error:
 *           message: forbidden
 *           code: forbidden
 *           details: null
 *     SetupOwnerRequest:
 *       type: object
 *       required: [name, username, password]
 *       properties:
 *         name:
 *           type: string
 *         username:
 *           type: string
 *         password:
 *           type: string
 *       example:
 *         name: Owner Person
 *         username: owner@example.com
 *         password: StrongPass#1
 *     SetupOwnerResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         username:
 *           type: string
 *         role:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *       example:
 *         id: 9c4e5f44-3a61-4c6f-9a30-0fd2c7f0f45f
 *         name: Owner Person
 *         username: owner@example.com
 *         role: OWNER
 *         isActive: true
 *         createdAt: 2026-01-29T00:00:00.000Z
 *     AuthLoginRequest:
 *       type: object
 *       required: [username, password]
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *       example:
 *         username: owner@example.com
 *         password: StrongPass#1
 *     AuthLoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *     ChangePasswordRequest:
 *       type: object
 *       required: [currentPassword, newPassword]
 *       properties:
 *         currentPassword:
 *           type: string
 *         newPassword:
 *           type: string
 *       example:
 *         currentPassword: OldPass#1
 *         newPassword: NewPass#1
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         username:
 *           type: string
 *         role:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *       example:
 *         id: 4c0c9b0e-7ec4-4f5b-9c0a-8a39a48d2cb8
 *         name: Staff User
 *         username: staff@example.com
 *         role: STAFF
 *         isActive: true
 *         createdAt: 2026-01-29T00:00:00.000Z
 *     UserCreateRequest:
 *       type: object
 *       required: [name, username, password]
 *       properties:
 *         name:
 *           type: string
 *         username:
 *           type: string
 *         password:
 *           type: string
 *       example:
 *         name: Staff User
 *         username: staff@example.com
 *         password: Password#1
 *     UserToggleRequest:
 *       type: object
 *       required: [isActive]
 *       properties:
 *         isActive:
 *           type: boolean
 *       example:
 *         isActive: false
 *     UserResetPasswordRequest:
 *       type: object
 *       required: [password]
 *       properties:
 *         password:
 *           type: string
 *       example:
 *         password: Password#1
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         sellingPrice:
 *           type: number
 *         reorderLevel:
 *           type: integer
 *           nullable: true
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *       example:
 *         id: 8a2a5b34-4ce2-47a0-8f21-1385f3b52f9c
 *         name: Paracetamol 500mg
 *         sellingPrice: 12.5
 *         reorderLevel: 10
 *         isActive: true
 *         createdAt: 2026-01-29T00:00:00.000Z
 *         updatedAt: 2026-01-29T00:00:00.000Z
 *     ProductCreateRequest:
 *       type: object
 *       required: [name, sellingPrice]
 *       properties:
 *         name:
 *           type: string
 *         sellingPrice:
 *           type: number
 *         reorderLevel:
 *           type: integer
 *           nullable: true
 *         isActive:
 *           type: boolean
 *       example:
 *         name: Paracetamol 500mg
 *         sellingPrice: 12.5
 *         reorderLevel: 10
 *     ProductUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         sellingPrice:
 *           type: number
 *         reorderLevel:
 *           type: integer
 *           nullable: true
 *         isActive:
 *           type: boolean
 *       example:
 *         sellingPrice: 13
 *     InventoryItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         sellingPrice:
 *           type: number
 *         reorderLevel:
 *           type: integer
 *           nullable: true
 *         isActive:
 *           type: boolean
 *         totalQty:
 *           type: integer
 *         nearestExpiryDate:
 *           type: string
 *           nullable: true
 *       example:
 *         id: 8a2a5b34-4ce2-47a0-8f21-1385f3b52f9c
 *         name: Paracetamol 500mg
 *         sellingPrice: 12.5
 *         reorderLevel: 10
 *         isActive: true
 *         totalQty: 42
 *         nearestExpiryDate: 2026-03-01T00:00:00.000Z
 *     StockInItemInput:
 *       type: object
 *       required: [productId, qtyAdded, unitCost, expiryDate]
 *       properties:
 *         productId:
 *           type: string
 *         qtyAdded:
 *           type: integer
 *         unitCost:
 *           type: number
 *         expiryDate:
 *           type: string
 *       example:
 *         productId: 8a2a5b34-4ce2-47a0-8f21-1385f3b52f9c
 *         qtyAdded: 50
 *         unitCost: 8.5
 *         expiryDate: 2026-06-30
 *     StockInCreateRequest:
 *       type: object
 *       required: [items]
 *       properties:
 *         note:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StockInItemInput'
 *       example:
 *         note: Initial stock
 *         items:
 *           - productId: 8a2a5b34-4ce2-47a0-8f21-1385f3b52f9c
 *             qtyAdded: 50
 *             unitCost: 8.5
 *             expiryDate: 2026-06-30
 *     StockLot:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         lotRefNo:
 *           type: string
 *         expiryDate:
 *           type: string
 *         qtyRemaining:
 *           type: integer
 *       example:
 *         id: 5b7a1d4f-5f13-4b24-9a4d-1c92b9e5c301
 *         lotRefNo: STK-20260129-0001
 *         expiryDate: 2026-06-30
 *         qtyRemaining: 50
 *     StockInItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         qtyAdded:
 *           type: integer
 *         unitCost:
 *           type: number
 *         expiryDate:
 *           type: string
 *         product:
 *           $ref: '#/components/schemas/Product'
 *         stockLots:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StockLot'
 *     StockIn:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         refNo:
 *           type: string
 *         createdAt:
 *           type: string
 *         note:
 *           type: string
 *           nullable: true
 *         createdBy:
 *           $ref: '#/components/schemas/User'
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StockInItem'
 *       example:
 *         id: 4f3a1a2c-b4aa-4f87-9f54-bad8d2e9f44e
 *         refNo: STK-20260129-0001
 *         createdAt: 2026-01-29T10:15:00.000Z
 *         note: Initial stock
 *         createdBy:
 *           id: 9c4e5f44-3a61-4c6f-9a30-0fd2c7f0f45f
 *           name: Owner Person
 *           username: owner@example.com
 *           role: OWNER
 *           isActive: true
 *           createdAt: 2026-01-29T00:00:00.000Z
 *         items:
 *           - id: 0d6c2c0f-6f6c-4d83-8809-1b02a9ea47b3
 *             qtyAdded: 50
 *             expiryDate: 2026-06-30
 *             product:
 *               id: 8a2a5b34-4ce2-47a0-8f21-1385f3b52f9c
 *               name: Paracetamol 500mg
 *               sellingPrice: 12.5
 *               reorderLevel: 10
 *               isActive: true
 *               createdAt: 2026-01-29T00:00:00.000Z
 *               updatedAt: 2026-01-29T00:00:00.000Z
 *             stockLots:
 *               - id: 5b7a1d4f-5f13-4b24-9a4d-1c92b9e5c301
 *                 lotRefNo: STK-20260129-0001
 *                 expiryDate: 2026-06-30
 *                 qtyRemaining: 50
 *     SaleItemInput:
 *       type: object
 *       required: [productId, qty]
 *       properties:
 *         productId:
 *           type: string
 *         qty:
 *           type: integer
 *       example:
 *         productId: 8a2a5b34-4ce2-47a0-8f21-1385f3b52f9c
 *         qty: 2
 *     SaleCreateRequest:
 *       type: object
 *       required: [items]
 *       properties:
 *         paymentMethod:
 *           type: string
 *         note:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SaleItemInput'
 *       example:
 *         paymentMethod: CASH
 *         items:
 *           - productId: 8a2a5b34-4ce2-47a0-8f21-1385f3b52f9c
 *             qty: 2
 *     SaleLotAllocation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         qtyTaken:
 *           type: integer
 *         stockLot:
 *           $ref: '#/components/schemas/StockLot'
 *     SaleItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         qty:
 *           type: integer
 *         unitPrice:
 *           type: number
 *         lineTotal:
 *           type: number
 *         product:
 *           $ref: '#/components/schemas/Product'
 *         allocations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SaleLotAllocation'
 *     Sale:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         receiptNo:
 *           type: string
 *         soldByUserId:
 *           type: string
 *         soldAt:
 *           type: string
 *         totalAmount:
 *           type: number
 *         paymentMethod:
 *           type: string
 *           nullable: true
 *         note:
 *           type: string
 *           nullable: true
 *         soldBy:
 *           $ref: '#/components/schemas/User'
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SaleItem'
 *       example:
 *         id: d4e5f6b1-1f3f-4bb4-90f1-07c2dce10f93
 *         receiptNo: RCPT-20260129-0001
 *         soldByUserId: 4c0c9b0e-7ec4-4f5b-9c0a-8a39a48d2cb8
 *         soldAt: 2026-01-29T11:30:00.000Z
 *         totalAmount: 25
 *         paymentMethod: CASH
 *         note: null
 *         soldBy:
 *           id: 4c0c9b0e-7ec4-4f5b-9c0a-8a39a48d2cb8
 *           name: Staff User
 *           username: staff@example.com
 *           role: STAFF
 *           isActive: true
 *           createdAt: 2026-01-29T00:00:00.000Z
 *         items:
 *           - id: 7b3a5cd0-9d51-4f7e-9f1b-2f7a2a5f7a78
 *             qty: 2
 *             unitPrice: 12.5
 *             lineTotal: 25
 *             product:
 *               id: 8a2a5b34-4ce2-47a0-8f21-1385f3b52f9c
 *               name: Paracetamol 500mg
 *               sellingPrice: 12.5
 *               reorderLevel: 10
 *               isActive: true
 *               createdAt: 2026-01-29T00:00:00.000Z
 *               updatedAt: 2026-01-29T00:00:00.000Z
 *             allocations:
 *               - id: 95b1a0ef-3d37-4e50-8c7c-2f6f7abf9d77
 *                 qtyTaken: 2
 *                 stockLot:
 *                   id: 5b7a1d4f-5f13-4b24-9a4d-1c92b9e5c301
 *                   lotRefNo: STK-20260129-0001
 *                   expiryDate: 2026-06-30
 *                   qtyRemaining: 48
 *     TopProduct:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *         name:
 *           type: string
 *           nullable: true
 *         totalQty:
 *           type: integer
 *         totalSales:
 *           type: number
 *       example:
 *         productId: 8a2a5b34-4ce2-47a0-8f21-1385f3b52f9c
 *         name: Paracetamol 500mg
 *         totalQty: 12
 *         totalSales: 150
 *     LowStockItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         sellingPrice:
 *           type: number
 *         reorderLevel:
 *           type: integer
 *           nullable: true
 *         totalQty:
 *           type: integer
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *       example:
 *         id: 8a2a5b34-4ce2-47a0-8f21-1385f3b52f9c
 *         name: Paracetamol 500mg
 *         sellingPrice: 12.5
 *         reorderLevel: 10
 *         totalQty: 5
 *         isActive: true
 *         createdAt: 2026-01-29T00:00:00.000Z
 *         updatedAt: 2026-01-29T00:00:00.000Z
 *     ExpiringLot:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         lotRefNo:
 *           type: string
 *         expiryDate:
 *           type: string
 *         qtyRemaining:
 *           type: integer
 *         product:
 *           $ref: '#/components/schemas/Product'
 *       example:
 *         id: 5b7a1d4f-5f13-4b24-9a4d-1c92b9e5c301
 *         lotRefNo: STK-20260129-0001
 *         expiryDate: 2026-02-15
 *         qtyRemaining: 12
 *         product:
 *           id: 8a2a5b34-4ce2-47a0-8f21-1385f3b52f9c
 *           name: Paracetamol 500mg
 *           sellingPrice: 12.5
 *           reorderLevel: 10
 *           isActive: true
 *           createdAt: 2026-01-29T00:00:00.000Z
 *           updatedAt: 2026-01-29T00:00:00.000Z
 *     BackupRunResponse:
 *       type: object
 *       properties:
 *         path:
 *           type: string
 *       example:
 *         path: C:\\Users\\pc\\Desktop\\EliMed\\backend\\backups\\backup-2026-01-29T12-00-00-000Z.sql
 *     BackupExportRequest:
 *       type: object
 *       required: [targetPath]
 *       properties:
 *         targetPath:
 *           type: string
 *         sourcePath:
 *           type: string
 *           nullable: true
 *       example:
 *         targetPath: C:\\backups\\export
 *     BackupRestoreRequest:
 *       type: object
 *       required: [backupPath, confirmation]
 *       properties:
 *         backupPath:
 *           type: string
 *         confirmation:
 *           type: boolean
 *           enum: [true]
 *       example:
 *         backupPath: C:\\Users\\pc\\Desktop\\EliMed\\backend\\backups\\backup-2026-01-29T12-00-00-000Z.sql
 *         confirmation: true
 */
export {};
