# AnalyticxIQ – Enterprise Sales Analytics Platform

**AnalyticxIQ** is a production-grade, multi-tenant SaaS Sales Analytics Platform designed to help businesses manage products, customers, and transactions, and visualize business performance through interactive BI dashboards.

This application is built using a decoupled monorepo architecture with logical tenant isolation, joint schema validation, and database transaction safety.

---

## 🚀 Key Features

- **Logical Tenant Isolation**: Multi-tenant database model where all data queries are logically isolated at the service/repository layer via a unified `tenantId` (linked to `businessId`).
- **Decoupled Architecture**: A modern React SPA communicating with an Express REST API backend, using Vite dev server proxies.
- **Dual-Token Authentication**: Secure JWT structure using short-lived memory access tokens and long-lived HTTP-only cookies for refresh tokens.
- **Joint Schema Validation**: Shared Zod constraints package used by both the React client forms and Express endpoint validation middleware.
- **BI Analytics Engine**: High-performance dashboard aggregations (Gross Revenue, Net Revenue, Profit margins, Monthly trends, Region/Category sales) using raw SQL queries with indexes.
- **Stream-Based CSV Ingestion**: High-throughput CSV file parsing using PapaParse and Multer, with row-level validation and atomic database transaction safety.
- **Data Export Engine**: Instant exports of Sales, Customers, and Products to CSV or Excel formats.
- **Automatic Stock Control**: Transaction-safe catalog inventory updates. Sales transactions automatically decrement available product stock. Insufficient stock rejects the sale, and modifications/deletions revert and adjust stock levels accordingly.

---

## 🛠️ Tech Stack

### Frontend

- **React (v18)** & **TypeScript**: Strict-type user interface.
- **Vite**: Frontend bundler.
- **Tailwind CSS**: Modern styling.
- **React Router Dom (v6)**: Declarative client routing.
- **TanStack Query (React Query v5)**: Query caching and network state management.
- **React Hook Form & Zod**: Form validation.
- **Recharts**: Interactive responsive data charting.
- **Axios**: Network client.

### Backend

- **Node.js** & **Express**: Scalable REST API server.
- **TypeScript**: Type-safety throughout the backend.
- **Prisma ORM**: Modern database access layer.
- **PostgreSQL**: relational transaction storage.
- **BcryptJS**: Password hashing.
- **Helmet & Express Rate Limit**: Production security hardening.

### Shared Workspace

- **Zod Schemas**: Reusable validation rules for products, sales, customers, and authentication.
- **Constants**: System-wide pagination limits and error code constants.

---

## 📐 System Architecture

```mermaid
graph TD
  subgraph Frontend [React SPA Client - Port 3000]
    UI[React Views & UI Components]
    R[React Router]
    TQ[TanStack Query]
    RHF[React Hook Form]
  end

  subgraph Shared [Shared Library Workspace]
    ZS[Zod Validation Schemas]
    C[Error & Status Constants]
  end

  subgraph Backend [Express API Server - Port 5000]
    App[Express App]
    MW[Helmet / Rate Limit / Auth Middleware]
    Val[Request Validators]
    Ctrl[Route Controllers]
    Repo[Repository Queries]
  end

  subgraph Database [Storage Layer]
    P[Prisma Client]
    DB[(PostgreSQL)]
  end

  UI --> R
  UI --> TQ
  TQ -->|Axios JSON HTTP| App
  RHF -->|validate| ZS
  Val -->|validate| ZS
  App --> MW
  MW --> Val
  Val --> Ctrl
  Ctrl --> Repo
  Repo --> P
  P --> DB
```

---

## 📂 Monorepo Structure

- [`shared/`](file:///c:/Users/ckish/OneDrive/Desktop/AnalyticxIQ/shared): Common models, schemas, and error definitions.
- [`client/`](file:///c:/Users/ckish/OneDrive/Desktop/AnalyticxIQ/client): Vite + React frontend code.
- [`server/`](file:///c:/Users/ckish/OneDrive/Desktop/AnalyticxIQ/server): Express.js + Prisma backend code.

For a detailed walkthrough of the directories, see the [Folder Structure Documentation](file:///c:/Users/ckish/OneDrive/Desktop/AnalyticxIQ/docs/FOLDER_STRUCTURE.md).

---

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+)
- npm (v8+)
- PostgreSQL 15+

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Kishanfdt/AnalyticxIQ.git
   cd AnalyticxIQ
   ```
2. Install workspace dependencies:
   ```bash
   npm install
   ```
3. Compile the shared types library:
   ```bash
   npm run build:shared
   ```

---

## ⚙️ Environment Variables

Create a `.env` file in the [`server/`](file:///c:/Users/ckish/OneDrive/Desktop/AnalyticxIQ/server) directory.

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/analyticiq?schema=public"
PORT=5000
NODE_ENV="development"
JWT_SECRET="your-super-secure-jwt-key"
```

---

## 💻 Running Locally

### 1. Run PostgreSQL Server

Ensure PostgreSQL is running locally on port 5432.

### 2. Apply Migrations & Generate Client

Apply schema migrations and generate the Prisma client:

```bash
# Run migrations in development (interactive)
npm run prisma:migrate --workspace=server

# Or deploy existing migrations directly to a new/production database (non-interactive)
npx prisma migrate deploy --schema=server/prisma/schema.prisma

# Or reset development database and apply all migrations from scratch
npx prisma migrate reset --force --schema=server/prisma/schema.prisma
```

### 3. Run Applications

Run the client and server concurrently in development mode:

```bash
# Terminal 1: Run Backend (Port 5000)
npm run dev:server

# Terminal 2: Run Frontend (Port 3000)
npm run dev:client
```

---

## 🖥️ Screen Views

_Visual walkthroughs of key components inside AnalyticxIQ:_

|                 Dashboard Overview                  |                  Sales Ingestion (CSV)                  |
| :-------------------------------------------------: | :-----------------------------------------------------: |
| ![Dashboard Mockup](docs/screenshots/dashboard.png) | ![CSV Ingestion Mockup](docs/screenshots/ingestion.png) |

_(Real application view captures are available in the [Walkthrough report](file:///C:/Users/ckish/.gemini/antigravity-ide/brain/3617fae0-0c70-44ba-aacf-e2756bc68892/walkthrough.md))_

---

## 🔌 API Endpoints Summary

| Endpoint                     |     Method     |  Auth   | Description                           |
| :--------------------------- | :------------: | :-----: | :------------------------------------ |
| `/api/v1/auth/register`      |     `POST`     | Public  | Register new tenant and owner         |
| `/api/v1/auth/login`         |     `POST`     | Public  | Authenticate user and return token    |
| `/api/v1/auth/me`            |     `GET`      | Private | Retrieve active user session info     |
| `/api/v1/products`           | `GET` / `POST` | Private | List or create products               |
| `/api/v1/customers`          | `GET` / `POST` | Private | List or create customers              |
| `/api/v1/sales`              | `GET` / `POST` | Private | List or create sales transactions     |
| `/api/v1/analytics/advanced` |     `GET`      | Private | Fetch aggregate business intelligence |
| `/api/v1/import/products`    |     `POST`     | Private | Batch upload products from CSV        |
| `/api/v1/export/sales`       |     `GET`      | Private | Download sales logs                   |

Refer to the complete [API Documentation](file:///c:/Users/ckish/OneDrive/Desktop/AnalyticxIQ/docs/API_DOCUMENTATION.md) for request/response schemas.

---

## 🔮 Future Improvements

1.  **Granular Role-Based Access Control (RBAC)**: Support separate permissions for `MEMBER` and `ADMIN` roles.
2.  **Multi-Currency Support**: Dynamic currency conversions for global sales pipelines.
3.  **Real-time Live Charts**: Integrating Socket.io to sync dashboard data on new sales without manual page refresh.
4.  **Webhooks**: Build automated endpoints to notify third-party shipping or accounting services on transaction completions.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
