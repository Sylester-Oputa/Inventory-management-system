# Backend Design Overview (Express + PostgreSQL + FEFO)

This backend runs locally inside Electron, exposes REST endpoints on localhost, and persists data in PostgreSQL via Prisma. Stock is tracked per-expiry lots and sales allocate by FEFO (First-Expiry-First-Out). All critical writes use transactions.

## Data Model Highlights (see `prisma/schema.prisma`)
- **User** - Owner/Staff accounts with bcrypt-hashed passwords. Only one OWNER is allowed.
- **Product** - Catalog with selling price, reorder level, and active flag (no barcode fields).
- **StockIn / StockInItem** - Restock headers and items. Each item records an expiry date.
- **StockLot** - Per-expiry lots with `qtyRemaining`, indexed by `(productId, expiryDate)` for FEFO.
- **Sale / SaleItem** - POS receipts with daily receipt numbers and itemized totals.
- **SaleLotAllocation** - Records exactly which lots were consumed by each sale item.
- **DailySequence** - Concurrency-safe daily counters for `STK-YYYYMMDD-####` and `RCPT-YYYYMMDD-####`.

## Services

| Module | Responsibilities |
| --- | --- |
| `setupService` | First-run owner creation (single owner only). |
| `authService` | Login, JWT creation, password change, active-user enforcement. |
| `userService` | Owner-only staff CRUD (create/list/enable/disable/reset password). |
| `productService` | Product catalog mutations and reads. |
| `inventoryService` | Inventory totals (sum of lots) + nearest expiry per product. |
| `stockInService` | Restocks with lot creation (transactional). |
| `salesService` | Sales with FEFO allocation, receipt numbers, and allocations (transactional). |
| `reportsService` | Sales reports, top products, low stock, expiring/expired lots. |
| `backupService` | `pg_dump` / `psql` based backup/export/restore. |
| `sequenceService` | Daily sequence generation using row locks. |

## Express REST API

- Routes live under `src/routes` and are wired in `src/app.ts`.
- Owner-only routes are protected by role middleware.
- The renderer talks to `http://localhost:4000` and uses JWT Bearer tokens for auth.
- Errors are centralized and returned as:
  `{ "error": { "message": "...", "code": "...", "details": ... } }`

## Key behaviors

- **FEFO**: lots are consumed by earliest expiry date first.
- **Atomic writes**: stock-in and sales are fully transactional.
- **Auditability**: owner can see who sold what and when via sales history/reporting.
- **Offline-first**: no external dependencies required after setup.
