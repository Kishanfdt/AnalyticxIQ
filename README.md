# AnalyticxIQ – Enterprise Sales Analytics Platform

**AnalyticxIQ** is a production-grade, multi-tenant SaaS Sales Analytics Platform designed to help businesses manage products, customers, and transactions, and visualize business performance through interactive BI dashboards.

This application is built using a decoupled monorepo architecture with logical tenant isolation, joint schema validation, atomic transaction safety, and production security hardening.

---

## 🚀 Key Features

- **Logical Tenant Isolation**: Multi-tenant database model where all data queries are logically isolated at the service/repository layer via a unified `tenantId` (linked to `businessId`).
- **Decoupled Architecture**: A modern React SPA communicating with an Express REST API backend, with Vercel frontend rewrite proxies and Render backend deployment.
- **Dual-Token Authentication & RBAC**: Secure JWT authentication with strict Role-Based Access Control (`requireRole('OWNER', 'ADMIN')`) protecting sensitive mutation and deletion routes.
- **Atomic Concurrency Stock Control**: Database-level atomic stock decrements (`UPDATE "Product" SET stock = stock - qty WHERE id = ? AND stock >= qty`) ensuring race-condition prevention and zero overselling under high concurrent traffic.
- **Security & Injection Protection**:
  - **Export Sanitization**: HTML entity escaping on PDF exports to prevent XSS; formula prefix sanitization (`'`, `=`, `+`, `-`, `@`) on CSV/XLSX exports to neutralize formula injection attacks.
  - **Upload Protection**: Strict 5MB file upload limits and MIME/extension type validation (`.csv`, `.xlsx`, `.xls`).
  - **Fail-Fast Secret Hardening**: Environment validation requiring minimum 32-character `JWT_SECRET` keys in production.
  - **SheetJS Security Patch**: Dependency pinned to official patched SheetJS CDN builds.
- **Joint Schema Validation**: Shared Zod constraints package used by both React client forms and Express endpoint validation middleware.
- **BI Analytics Engine**: High-performance dashboard aggregations (Gross Revenue, Net Revenue, Profit margins, Monthly trends, Region/Category sales) using optimized SQL queries with indexed database columns.
- **Case-Insensitive Uniqueness**: Case-insensitive checks for product SKU, customer Email, and category lookups to prevent duplicate entities.
- **Global Auth Interceptors**: Automatic 401 response handling on the React client with global session expiration management.
- **Data Ingestion & Export Engine**: High-throughput CSV/XLSX file parsing via PapaParse/Multer and instant multi-format data exports.

---

## 🛠️ Tech Stack

### Frontend
- **React (v18)** & **TypeScript**: Strict-type user interface.
- **Vite**: Modern frontend bundler and dev server.
- **Tailwind CSS**: Utility-first responsive design.
- **React Router Dom (v6)**: Declarative client routing.
- **TanStack Query (React Query v5)**: Network state management and caching.
- **React Hook Form & Zod**: Schema-driven form validation.
- **Recharts**: Interactive BI dashboard data visualizations.
- **Axios**: Network client with global error interceptors.

### Backend
- **Node.js** & **Express**: Scalable REST API server.
- **TypeScript**: Type-safety across the entire server layer.
- **Prisma ORM**: Modern database mapping and raw SQL query execution.
- **PostgreSQL / Neon DB**: Relational transaction storage with SSL support.
- **BcryptJS**: Salted password hashing.
- **Helmet & Express Rate Limit**: Hardened HTTP security headers and rate limiting with `trust proxy` support.

### Shared Workspace & CI/CD
- **Zod Schemas**: Shared validation models for products, sales, customers, and authentication.
- **GitHub Actions**: Automated CI matrix executing PostgreSQL service container, Prisma migrations, multi-package builds, Vitest test suites, and ESLint checks.

---

## 📐 System Architecture

```mermaid
graph TD
  subgraph Frontend [React SPA Client - Vercel / Port 3000]
    UI[React Views & UI Components]
    R[React Router]
    TQ[TanStack Query]
    Axios[Axios Client + 401 Interceptor]
  end

  subgraph Shared [Shared Library Workspace]
    ZS[Zod Validation Schemas]
    C[Error & Status Constants]
  end

  subgraph Backend [Express API Server - Render / Port 5000]
    App[Express App]
    MW[Helmet / Rate Limit / RBAC Middleware]
    Val[Request Validators]
    Ctrl[Route Controllers]
    Repo[Atomic Repositories]
  end

  subgraph Database [Storage Layer - Neon Cloud DB]
    P[Prisma Client]
    DB[(PostgreSQL Database)]
  end

  UI --> R
  UI --> TQ
  TQ --> Axios
  Axios -->|JSON HTTP / Vercel Proxy| App
  App --> MW
  MW --> Val
  Val -->|validate| ZS
  Val --> Ctrl
  Ctrl --> Repo
  Repo -->|Atomic SQL Decrements| P
  P --> DB
```

---

## 📂 Monorepo Structure

- [`shared/`](file:///c:/Users/ckish/OneDrive/Desktop/AnalyticxIQ/shared): Common TypeScript types, validation models, schemas, and system constants.
- [`client/`](file:///c:/Users/ckish/OneDrive/Desktop/AnalyticxIQ/client): Vite + React frontend single-page application.
- [`server/`](file:///c:/Users/ckish/OneDrive/Desktop/AnalyticxIQ/server): Express.js REST API server with Prisma ORM and repository layer.
- [`.github/workflows/ci.yml`](file:///c:/Users/ckish/OneDrive/Desktop/AnalyticxIQ/.github/workflows/ci.yml): GitHub Actions automated CI workflow.

For a detailed walkthrough of the workspace structure, see the [Folder Structure Documentation](file:///c:/Users/ckish/OneDrive/Desktop/AnalyticxIQ/docs/FOLDER_STRUCTURE.md).

---

## 🏁 Getting Started

### Prerequisites

- Node.js (v20+)
- npm (v9+)
- PostgreSQL 15+ (Local or Cloud Neon PostgreSQL)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Kishanfdt/AnalyticxIQ.git
   cd AnalyticxIQ
   ```
2. Install workspace dependencies:
   ```bash
   npm ci --legacy-peer-deps
   ```
3. Compile the shared types library:
   ```bash
   npm run build:shared
   ```

---

## ⚙️ Environment Variables

Create a `.env` file in the [`server/`](file:///c:/Users/ckish/OneDrive/Desktop/AnalyticxIQ/server) directory:

```env
DATABASE_URL="postgresql://neondb_owner:password@ep-sample.aws.neon.tech/neondb?sslmode=require"
PORT=5000
NODE_ENV="development"
JWT_SECRET="ci-test-secret-please-override-in-real-envs-1234567890"
CORS_ORIGIN="http://localhost:3000"
```

---

## 💻 Running Locally

### 1. Database Setup & Prisma Migrations

Apply schema migrations to your local or Neon PostgreSQL instance:

```bash
# Generate Prisma Client
npx prisma generate --schema=server/prisma/schema.prisma

# Deploy database migrations
npx prisma migrate deploy --schema=server/prisma/schema.prisma
```

### 2. Run Application Components

```bash
# Option A: Build and test full monorepo
npm run build
npm run test --workspace=server
npm run lint

# Option B: Run concurrent dev servers
npm run dev:server    # Backend API on Port 5000
npm run dev:client    # Frontend App on Port 3000
```

---

## 🌐 Production Cloud Deployment

### Backend (Render)
- Configured via [`render.yaml`](file:///c:/Users/ckish/OneDrive/Desktop/AnalyticxIQ/render.yaml).
- Build command: `npm ci --legacy-peer-deps && npm run build:shared && npm run build:server`
- Start command: `node server/dist/server.js`
- Requires Environment Variables set on Render: `DATABASE_URL`, `JWT_SECRET` (32+ chars), `CORS_ORIGIN`.

### Frontend (Vercel)
- Configured via [`vercel.json`](file:///c:/Users/ckish/OneDrive/Desktop/AnalyticxIQ/vercel.json).
- Build command: `npm ci --legacy-peer-deps && npm run build:shared && npm run build:client`
- Output directory: `client/dist`
- API rewrites configured to point `/api/:path*` to Render backend instance.

---

## 🔌 API Endpoints Summary

| Endpoint                     |     Method     |      Auth Required      | Description                           |
| :--------------------------- | :------------: | :---------------------: | :------------------------------------ |
| `/api/v1/auth/register`      |     `POST`     |         Public          | Register new business tenant & owner  |
| `/api/v1/auth/login`         |     `POST`     |         Public          | Authenticate user and issue JWT token |
| `/api/v1/auth/me`            |     `GET`      |         Private         | Retrieve active user session info     |
| `/api/v1/products`           | `GET` / `POST` |         Private         | List or create catalog products       |
| `/api/v1/products/:id`       |    `DELETE`    | Private (`OWNER/ADMIN`) | Delete catalog product by ID          |
| `/api/v1/customers`          | `GET` / `POST` |         Private         | List or create customer records       |
| `/api/v1/customers/:id`      |    `DELETE`    | Private (`OWNER/ADMIN`) | Delete customer record by ID          |
| `/api/v1/sales`              | `GET` / `POST` |         Private         | List or record sales transactions     |
| `/api/v1/sales/:id`          |    `DELETE`    | Private (`OWNER/ADMIN`) | Void sale and restore product stock   |
| `/api/v1/analytics/advanced` |     `GET`      |         Private         | Fetch aggregate BI dashboard metrics  |
| `/api/v1/import/products`    |     `POST`     |         Private         | Batch upload products from CSV/XLSX   |
| `/api/v1/export/sales`       |     `GET`      |         Private         | Export sales records (CSV/XLSX/PDF)   |

Refer to the complete [API Documentation](file:///c:/Users/ckish/OneDrive/Desktop/AnalyticxIQ/docs/API_DOCUMENTATION.md) for full request/response payloads.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
