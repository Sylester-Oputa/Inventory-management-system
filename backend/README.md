# EliMed Local Backend

Offline-first pharmacy inventory and POS backend for an Electron desktop app. Runs locally on Windows, exposes a REST API on localhost, uses PostgreSQL + Prisma, JWT auth, Zod validation, Swagger docs, FEFO allocation, and backup tooling.

## Requirements

- Node.js 18+
- PostgreSQL (local service)
- `pg_dump` and `psql` available on PATH for backup/restore

## Quick start

1) Install dependencies

```bash
npm install
```

2) Configure PostgreSQL

- Create a database (example: `elimed`).
- Enable `pgcrypto` extension (for UUIDs):

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

- Copy `.env.example` to `.env` and update values.

3) Generate Prisma client and apply migrations

```bash
npx prisma generate
npx prisma migrate dev
```

4) Start the backend

```bash
npm run dev
```

API: `http://localhost:4000`
Swagger UI: `http://localhost:4000/docs`
Health check: `http://localhost:4000/health`

## Scripts

- `npm run dev` - run TS server with hot reload
- `npm run build` - compile TypeScript to `dist`
- `npm start` - run compiled server
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:migrate` - run Prisma migrations
- `npm run test` - run Jest + Supertest (requires Postgres and migrated schema)

## Swagger

Swagger is auto-generated with swagger-jsdoc and served at `/docs`. It includes Bearer auth, request/response schemas, and tags for Setup, Auth, Users, Products, Inventory, StockIn, Sales, Reports, and Backup.

## Sample curl flow

### 1) Setup owner

```bash
curl -X POST http://localhost:4000/setup/owner \
  -H "Content-Type: application/json" \
  -d '{"name":"Owner","username":"admin","password":"Secret#123"}'
```

### 2) Login

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Secret#123"}'
```

### 3) Create product (Owner only)

```bash
curl -X POST http://localhost:4000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Pain Relief","sellingPrice":12.5,"reorderLevel":10}'
```

### 4) Stock-in with expiry lots (Owner only)

```bash
curl -X POST http://localhost:4000/stock-in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"items":[{"productId":"<prod-id>","qtyAdded":10,"expiryDate":"2026-06-30"}]}'
```

### 5) Make a sale (Owner/Staff)

```bash
curl -X POST http://localhost:4000/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"items":[{"productId":"<prod-id>","qty":2}],"paymentMethod":"CASH"}'
```

### 6) Expiring lots report (Owner only)

```bash
curl -X GET "http://localhost:4000/reports/expiring?days=30" \
  -H "Authorization: Bearer <token>"
```

## Error response format

All errors use a consistent shape:

```json
{
  "error": {
    "message": "validation-error",
    "code": "validation-error",
    "details": { }
  }
}
```

## Testing

Tests use Jest + Supertest and assume a Postgres database pointed to by `DATABASE_URL`. Run migrations first:

```bash
npx prisma migrate dev
npm run test
```

## Backups

- `POST /backup/run` runs `pg_dump` and writes a timestamped `.sql` file to `BACKUP_DIR`.
- `POST /backup/export` copies a backup file to a user-provided folder (must already exist).
- `POST /backup/restore` restores a backup and requires `"confirmation": true`.

## Notes

- The setup endpoint allows a single OWNER. A second call returns HTTP 409.
- Sales allocation is FEFO (First-Expiry-First-Out) across lots.
- Staff cannot restock or create products.
- CORS allows localhost and file origins for Electron.
