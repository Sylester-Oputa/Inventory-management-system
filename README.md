# Pharmacy Inventory & POS System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
[![Electron](https://img.shields.io/badge/Electron-30.5-blue.svg)](https://www.electronjs.org/)

A comprehensive, offline-first desktop inventory management and point-of-sale (POS) system designed for pharmacies and small businesses. Built with Electron, React, Express, and PostgreSQL with FEFO (First-Expiry-First-Out) stock allocation.

## 📋 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [System Requirements](#-system-requirements)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Development](#-development)
- [Building for Production](#-building-for-production)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 📦 Inventory Management
- **Product catalog** with name, selling price, and reorder levels
- **Stock-in tracking** with unit costs for profit calculation
- **FEFO (First-Expiry-First-Out)** lot allocation
- **Automatic low-stock alerts** based on reorder levels
- **Expiry date management** with expiring/expired lot reports
- **Real-time inventory levels** across multiple lots

### 💰 Point of Sale (POS)
- **Fast sales processing** with automatic FEFO allocation
- **Receipt printing** with thermal printer support
- **Daily receipt numbering** (RCPT-YYYYMMDD-####)
- **Multi-item transactions** with itemized totals
- **Profit tracking** - real-time daily profit calculation
- **Sales history** with detailed transaction logs

### 📊 Reports & Analytics
- **Dashboard** with today's sales, profit, and transaction counts
- **Low stock report** for reordering
- **Expiring lots report** (items expiring within 30 days)
- **Expired lots report** for inventory cleanup
- **Top-selling products** analysis
- **Sales reports** with date range filtering

### 👥 User Management
- **Owner account** with full system access
- **Staff accounts** with limited permissions
- **Role-based access control** (Owner/Staff)
- **Password management** with bcrypt hashing
- **Active/inactive user status**
- **Audit trails** - track who made sales

### 💾 Data Management
- **Database backup** to timestamped files
- **CSV export** for external analysis
- **Database restore** from backup files
- **Offline-first** - no internet required
- **Local data storage** with PostgreSQL

### 🎨 User Interface
- **Modern, responsive design** with dark/light theme support
- **Intuitive navigation** with sidebar menu
- **Real-time updates** and feedback
- **Printer configuration** within setup wizard
- **Accessibility features** for ease of use

## 🛠️ Tech Stack

### Frontend
- **Electron** 30.5.1 - Desktop application framework
- **React** 18 - UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **TanStack Query** - Data fetching and caching

### Backend
- **Node.js** 18+ with Express - REST API server
- **PostgreSQL** - Relational database
- **Prisma** - Type-safe ORM
- **JWT** - Authentication tokens
- **Zod** - Runtime validation
- **Swagger** - API documentation
- **Pino** - Structured logging
- **bcrypt** - Password hashing

## 💻 System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.13+, or Linux (Ubuntu 18.04+)
- **RAM**: 4 GB minimum, 8 GB recommended
- **Storage**: 500 MB for application + space for database
- **Node.js**: Version 18 or higher
- **PostgreSQL**: Version 14 or higher

### Recommended Setup
- **RAM**: 8 GB or more
- **Storage**: SSD with at least 2 GB free space
- **Display**: 1920x1080 or higher resolution
- **Printer**: Thermal receipt printer (optional)

## 📥 Installation

### 1. Prerequisites

#### Install Node.js
Download and install from [nodejs.org](https://nodejs.org/) (LTS version recommended)

```bash
# Verify installation
node --version  # Should be 18 or higher
npm --version
```

#### Install PostgreSQL
Download and install from [postgresql.org](https://www.postgresql.org/download/)

**Windows**: Use the installer and remember the password you set for the `postgres` user.

**macOS**: 
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Clone or Download the Project

```bash
# If using git
git clone <repository-url>
cd <your-file-name>

# Or download and extract the ZIP file
```

### 3. Database Setup

#### Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE <your-db-name>;

# Enable pgcrypto extension for UUIDs
\c <your-db-name>
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

# Exit psql
\q
```

#### Configure Database Connection

Create a `.env` file in the `backend` directory:

```bash
cd backend
```

Create `backend/.env`:
```env
# Database
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/<your-db-name>"

# Server
PORT=4000
NODE_ENV=development

# JWT Secret (change this to a random string)
JWT_SECRET=your-secret-key-change-this-in-production

# Token Expiration
JWT_EXPIRES_IN=6h
```

**Important**: Replace `yourpassword` with your PostgreSQL password and change the `JWT_SECRET` to a random secure string.

### 4. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

### 5. Database Migration

```bash
cd ../backend

# Generate Prisma client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev
```

### 6. Start the Application

#### Development Mode

**Option 1: Start Backend and Frontend Together**

In the `backend` directory:
```bash
npm run dev
```

In a new terminal, in the `frontend` directory:
```bash
npm run dev:electron
```

**Option 2: Build and Run Production Version** (see [Building for Production](#-building-for-production))

## ⚙️ Configuration

### First-Run Setup

On first launch, you'll be guided through a setup wizard:

1. **Create Owner Account**
   - Full name
   - Username
   - Password (minimum 8 characters, must include uppercase, lowercase, number, and special character)

2. **Store Information** (optional)
   - Store name
   - Address
   - Phone number
   - For receipt printing

3. **Printer Configuration** (optional)
   - Select thermal printer
   - Configure for receipt printing

### Environment Variables

#### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/<your-db-name>
PORT=4000
NODE_ENV=production
JWT_SECRET=your-secure-secret-key
JWT_EXPIRES_IN=6h
```

#### Frontend
The frontend automatically connects to `http://localhost:4000` in development. For production builds, the backend URL is bundled.

## 🚀 Usage

### Dashboard
- View today's sales total
- See transaction count
- Monitor today's profit (revenue minus cost)
- Check low stock items

### Products
- **Add Product**: Name, selling price, reorder level
- **Edit Product**: Update pricing or reorder thresholds
- **Deactivate/Activate**: Control product availability
- Products are never deleted (data integrity)

### Stock Management
- **Stock-in**: Add inventory with:
  - Product selection
  - Quantity
  - Unit cost (for profit calculation)
  - Expiry date
- **View History**: Track all stock-in transactions
- **Lot Management**: System automatically creates lots by expiry date

### Point of Sale
1. Click "New Sale" or press hotkey
2. Add products (search by name)
3. Specify quantities
4. Review total
5. Complete sale
6. Print receipt (optional)

**Features**:
- Automatic FEFO allocation
- Real-time inventory updates
- Receipt numbering (RCPT-YYYYMMDD-####)
- Profit calculation per transaction

### Reports
- **Sales Report**: Filter by date range, view itemized sales
- **Low Stock**: Products below reorder level
- **Expiring Lots**: Items expiring in next 30 days
- **Expired Lots**: Items past expiry date
- **Top Products**: Best-selling items by quantity/revenue

### Users (Owner Only)
- **Create Staff**: Username, password, full name
- **Manage Status**: Enable/disable accounts
- **Reset Passwords**: Help staff with forgotten passwords
- **View Activity**: Track who made sales

### Backup & Restore
- **Create Backup**: Timestamped database dumps
- **Export CSV**: For external analysis
- **Restore**: From previous backup files
- **Location**: `backend/tmp/backups/`

## 📁 Project Structure

```
<your-file-name>/
├── backend/                  # Express API server
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Database migrations
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth, validation, errors
│   │   ├── routes/          # API routes
│   │   ├── validation/      # Zod schemas
│   │   ├── utils/           # Helpers (date, logger, etc.)
│   │   ├── swagger/         # API documentation
│   │   ├── config/          # Environment config
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # HTTP server entry
│   ├── tests/               # Jest tests
│   ├── tmp/                 # Backups and temp files
│   ├── package.json
│   ├── tsconfig.json
│   ├── DESIGN.md            # Architecture documentation
│   └── README.md
│
├── frontend/                # Electron + React app
│   ├── electron/
│   │   ├── main.ts          # Electron main process
│   │   └── preload.ts       # Preload scripts
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # React components
│   │   │   │   ├── pages/   # Page components
│   │   │   │   ├── setup/   # Setup wizard
│   │   │   │   ├── auth/    # Login/auth
│   │   │   │   └── ui/      # Reusable UI components
│   │   │   ├── contexts/    # React contexts (auth, theme)
│   │   │   └── lib/         # Utilities (API client, etc.)
│   │   ├── main.tsx         # React entry point
│   │   └── App.tsx          # Root component
│   ├── public/              # Static assets
│   ├── dist/                # Production build (renderer)
│   ├── dist-electron/       # Production build (main)
│   ├── release/             # Electron packaged apps
│   ├── electron-builder.json5  # Build configuration
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
│
└── README.md                # This file
```

## 📚 API Documentation

### Access Swagger UI
When the backend is running, access interactive API documentation at:
```
http://localhost:4000/docs
```

### Key Endpoints

#### Setup
- `POST /setup/owner` - Create initial owner account (first run only)
- `POST /setup/store` - Configure store information
- `GET /setup/store` - Get store information
- `GET /status/setup` - Check if setup is complete

#### Authentication
- `POST /auth/login` - Login with username/password
- `POST /auth/change-password` - Change your password
- `GET /auth/me` - Get current user info

#### Products
- `GET /products` - List all products
- `POST /products` - Create product (Owner only)
- `PATCH /products/:id` - Update product (Owner only)
- `PATCH /products/:id/toggle-active` - Activate/deactivate (Owner only)

#### Inventory
- `GET /inventory` - Get current inventory levels
- `GET /inventory/:productId/lots` - Get lots for a product

#### Stock-In
- `POST /stock-in` - Record stock-in (Owner only)
- `GET /stock-in` - List stock-in history (Owner only)
- `GET /stock-in/:id` - Get stock-in details (Owner only)

#### Sales
- `POST /sales` - Create sale
- `GET /sales` - List sales history
- `GET /sales/:id` - Get sale details

#### Reports
- `GET /reports/sales` - Sales report with date filters
- `GET /reports/low-stock` - Products below reorder level
- `GET /reports/expiring-lots` - Lots expiring within 30 days
- `GET /reports/expired-lots` - Lots past expiry date
- `GET /reports/top-products` - Best sellers by quantity/revenue

#### Dashboard
- `GET /dashboard/summary` - Dashboard metrics (sales, profit, low stock)

#### Users (Owner Only)
- `GET /users` - List all users
- `POST /users` - Create staff user
- `PATCH /users/:id/toggle-active` - Enable/disable user
- `POST /users/:id/reset-password` - Reset user password

#### Backup (Owner Only)
- `POST /backup` - Create database backup
- `POST /backup/export` - Export to CSV
- `POST /backup/restore` - Restore from backup
- `GET /backup/list` - List available backups

### Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🗄️ Database Schema

### Core Tables

#### User
- `id` (UUID) - Primary key
- `username` (String) - Unique, indexed
- `password` (String) - Bcrypt hashed
- `name` (String) - Full name
- `role` (Enum) - OWNER or STAFF
- `isActive` (Boolean) - Account status
- Timestamps: `createdAt`, `updatedAt`

#### Product
- `id` (UUID) - Primary key
- `name` (String) - Indexed
- `sellingPrice` (Decimal) - Current price
- `reorderLevel` (Int) - Low stock threshold
- `isActive` (Boolean) - Product availability
- Timestamps: `createdAt`, `updatedAt`

#### StockIn & StockInItem
- **StockIn**: Transaction header with reference number (STK-YYYYMMDD-####)
- **StockInItem**: Line items with:
  - `qtyAdded` - Quantity received
  - `unitCost` - Cost per unit (for profit calculation)
  - `expiryDate` - Expiration date

#### StockLot
- Tracks inventory by expiry date
- `qtyRemaining` - Current available quantity
- `expiryDate` - For FEFO sorting
- Indexed by `(productId, expiryDate)` for fast FEFO queries

#### Sale & SaleItem
- **Sale**: Transaction header with receipt number (RCPT-YYYYMMDD-####)
- **SaleItem**: Line items with quantities and prices
- Links to `SaleLotAllocation` for traceability

#### SaleLotAllocation
- Audit trail of lot consumption
- Records exactly which lot provided stock for each sale item
- Enables profit calculation and inventory traceability

#### DailySequence
- Generates daily counters for stock-in and receipt numbers
- Uses row-level locks for concurrency safety

### Key Relationships
- Products → StockLots (one-to-many)
- StockLots → SaleLotAllocations (one-to-many)
- Sales → SaleItems → SaleLotAllocations (one-to-many chains)
- Users → Sales (created by relationship)

## 🔧 Development

### Backend Development

```bash
cd backend

# Start dev server with hot reload
npm run dev

# Run tests
npm run test

# Generate Prisma client after schema changes
npx prisma generate

# Create new migration
npx prisma migrate dev --name description_of_change

# View database in Prisma Studio
npx prisma studio
```

### Frontend Development

```bash
cd frontend

# Start Vite dev server only
npm run dev

# Start Electron with Vite
npm run dev:electron

# Offline development (with local Electron binary)
npm run dev:electron:offline

# Type checking
npm run lint
```

### Code Quality

```bash
# Backend
cd backend
npm run lint
npm run test

# Frontend
cd frontend
npm run lint
```

## 📦 Building for Production

### Complete Build Process

#### 1. Build Backend
```bash
cd backend
npm run build
```
This creates compiled JavaScript in `backend/dist/`

#### 2. Build Electron App
```bash
cd ../frontend
npm run build
```

This will:
1. Kill any running Electron processes
2. Compile TypeScript
3. Build React app with Vite
4. Build Electron main/preload
5. Package with electron-builder

#### 3. Output Location
The packaged application will be in:
```
frontend/release/0.0.0/
├── win-unpacked/          # Unpacked Windows app
└── <your-file-name> Setup 0.0.0.exe # Windows installer
```

### Build Configuration

Edit `frontend/electron-builder.json5` to customize:
- Application name and version
- Icon (place in `public/icon.png`)
- Installer type (NSIS, Squirrel, DMG, etc.)
- Target architectures (x64, arm64, etc.)

### Distribution

The installer (`<your-file-name> Setup 0.0.0.exe`) can be distributed to users. It will:
- Install the application
- Create desktop shortcut
- Register uninstaller

**Note**: Users still need to install PostgreSQL and create the database manually.

## 🐛 Troubleshooting

### Common Issues

#### Backend won't start
**Problem**: "Cannot connect to database"
**Solution**: 
1. Check PostgreSQL is running: `pg_isready`
2. Verify credentials in `.env`
3. Ensure database exists: `psql -U postgres -l`
4. Check firewall isn't blocking port 5432

#### Profit showing ₦0
**Problem**: Older stock entries don't have `unitCost`
**Solution**: 
- Profit only calculates for items with `unitCost` set
- New stock-in entries will automatically include unit cost
- Old entries without cost won't contribute to profit

#### Electron app won't open
**Problem**: Port 4000 already in use
**Solution**:
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <pid> /F

# macOS/Linux
lsof -ti:4000 | xargs kill -9
```

#### Build fails with "file is being used"
**Problem**: App is still running during build
**Solution**:
1. Close all Electron windows
2. Run: `npm run build:clean` (kills processes and deletes release folder)
3. Then: `npm run build`

#### Database migration fails
**Problem**: Prisma client locked
**Solution**:
```bash
# Kill Node processes
taskkill /F /IM node.exe  # Windows
killall node              # macOS/Linux

# Regenerate client
npx prisma generate
```

#### Receipt printing not working
**Problem**: Printer not detected
**Solution**:
1. Check printer is connected and powered on
2. Verify printer driver is installed
3. Configure printer in Setup wizard
4. Test print from Windows/system settings first

### Debug Mode

Enable detailed logging:

**Backend** (`backend/.env`):
```env
NODE_ENV=development
LOG_LEVEL=debug
```

**Frontend**: Open DevTools in Electron (View → Toggle Developer Tools)

### Getting Help

If you encounter issues:
1. Check the logs in the terminal
2. Open browser DevTools (F12) for frontend errors
3. Check `backend/logs/` for server logs
4. Review this troubleshooting section
5. Check database connection with: `psql -U postgres -d <your-db-name>`

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly (backend tests, manual testing)
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style
- Follow existing code patterns
- Use TypeScript for type safety
- Add JSDoc comments for public APIs
- Run linters before committing

### Testing
- Add tests for new features
- Ensure all tests pass: `npm run test`
- Test manually in development mode
- Test production build before submitting

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Electron** - Desktop app framework
- **React** - UI library
- **Prisma** - Database ORM
- **Radix UI** - Accessible components
- **Tailwind CSS** - Styling framework
- All open-source contributors

## 📞 Support

For questions or support:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section

---

**Built with ❤️ for pharmacies and small businesses**

*Version 0.1.0 - February 2026*
