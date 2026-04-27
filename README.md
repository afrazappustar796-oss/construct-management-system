# ConstructPro

**Global Construction Management & Cost Intelligence System**

A production-ready SaaS platform for construction companies to manage projects, materials, labor, and budgets in real-time.

## Features

- **Project Management** - Create and track multiple construction projects with detailed budgets
- **Site Management** - Manage multiple sites per project with location tracking
- **Inventory Control** - Track materials with stock IN/OUT transactions and low stock alerts
- **Labor Management** - Manage workers, track attendance, and calculate wages
- **Cost Intelligence** - Budget vs actual tracking, expense categorization, and comprehensive reporting
- **Analytics Dashboard** - Visual charts and analytics for data-driven decisions
- **Role-Based Access** - Admin, Manager, Accountant, and Worker roles
- **Audit Logs** - Track all actions for complete visibility

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT Authentication
- REST API

### Frontend
- React (Vite)
- Tailwind CSS
- Axios
- Recharts

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Backend Setup

```bash
cd backend
npm install
```

Configure your database URL in `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/constructpro
JWT_SECRET=your_secret_key
```

Generate Prisma client and push schema:
```bash
npx prisma generate
npx prisma db push
```

Start the server:
```bash
npm start
```

API runs on http://localhost:5000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## Deployment

### Backend (Render)
1. Connect your GitHub repository
2. Set environment variables:
   - PORT=5000
   - DATABASE_URL=your_postgres_url
   - JWT_SECRET=your_secret
3. Set build command: npm install
4. Set start command: npm start

### Frontend (Vercel)
1. Connect your GitHub repository
2. Set Framework Preset: Vite
3. Set Build Command: npm run build
4. Set Output Directory: dist
5. Deploy

## API Endpoints

- `/api/auth` - Authentication (register, login, me)
- `/api/projects` - Project CRUD
- `/api/sites` - Site CRUD
- `/api/materials` - Material CRUD
- `/api/inventory` - Stock IN/OUT
- `/api/workers` - Worker CRUD
- `/api/attendance` - Attendance tracking
- `/api/payments` - Payment management
- `/api/expenses` - Expense tracking
- `/api/dashboard` - Analytics data
- `/api/audit` - Audit logs

## Roles

- **ADMIN** - Full access to all features
- **MANAGER** - Manage projects, sites, workers
- **ACCOUNTANT** - Manage expenses, materials
- **WORKER** - Basic access

## License

MIT