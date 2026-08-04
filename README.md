# AnalyticxIQ - Sales Analytics Platform

**AnalyticxIQ** is an enterprise-grade, multi-tenant SaaS Sales Analytics Platform designed to help businesses manage products, customers, transactions, and visualize business analytics through interactive dashboards.

This project is built from scratch utilizing a decoupled monorepo architecture with logical tenant isolation, ensuring security, scalability, and high performance.

---

## 🚀 Key Features

- **Multi-Tenant Isolation**: Shared database with logical isolation via unified `tenantId` checking across all resources.
- **Decoupled Client-Server**: A React Single Page Application (SPA) communicating with an Express REST API.
- **Shared Schema Validation**: Joint validation constraints defined using Zod, shared between client inputs and server endpoints.
- **Transaction Ingestion Engine**: Robust CSV file processor with row-level error reporting and database transaction safety.
- **Analytical Dashboards**: Beautiful data visualizations built using Recharts with support for dark mode.

---

## 🛠️ Tech Stack

### Frontend

- **React & TypeScript**: Interactive UI layer.
- **Vite**: Next-generation frontend bundler.
- **Tailwind CSS**: Utility-first CSS styling (with Dark Mode support).
- **React Router**: Declarative client-side routing.
- **TanStack Query (React Query)**: State cache and data-fetching layer.
- **React Hook Form & Zod**: Fast, type-safe validation schema forms.
- **Recharts**: Custom responsive data charting.

### Backend

- **Node.js & Express**: Extensible REST API backend.
- **TypeScript**: Type-safety throughout the server.
- **Prisma ORM**: Relational schema database management.
- **PostgreSQL**: High-reliability transaction storage.
- **JWT Authentication**: Dual-token structure (Access Token in memory, Refresh Token in HttpOnly cookie).
- **PapaParse & Multer**: Stream-based CSV file parsing.

---

## 📂 Project Structure

```text
AnalyticxIQ/
├── package.json               # Root workspaces configuration
├── tsconfig.json              # Shared TypeScript base configuration
├── eslint.config.js           # Flat ESLint workspace configurations
├── .prettierrc                # Prettier styling rules
├── shared/                    # Validation schemas and constants library
│   ├── src/
│   │   ├── constants/         # Shared pagination and error codes
│   │   └── validation/        # Zod request validation definitions
│   └── tsconfig.json
├── client/                    # Vite + React Single Page App
│   ├── src/
│   │   ├── components/        # Reusable global UI widgets
│   │   ├── features/          # Domain features (auth, sales, products)
│   │   ├── layouts/           # Page structural components
│   │   └── App.tsx
│   └── vite.config.ts
└── server/                    # Node.js + Express REST API
    ├── prisma/
    │   └── schema.prisma      # Relational database models
    ├── src/
    │   ├── config/            # Schema-verified environment settings
    │   ├── controllers/       # HTTP route handlers
    │   ├── prisma/            # Prisma Client Singleton
    │   └── app.ts
    └── tsconfig.json
```

---

## ⚙️ Configuration & Standards

- **TypeScript Strict Mode**: Fully enabled across all workspaces.
- **Absolute Imports**: Configured using `@/*` mapping pointing to `src/` in the client and server.
- **ESLint Flat Config**: Root-level linting across all files.
- **Prettier Formatting**: Unified formatting rules (semi-colons, single quotes, double spaces).

---

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+)
- npm (v7+) or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Kishanfdt/AnalyticxIQ.git
   cd AnalyticxIQ
   ```
2. Install workspace dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

### Development Scripts

- **Compile Shared Package**:
  ```bash
  npm run build:shared
  ```
- **Run Backend API Server (Port 5000)**:
  ```bash
  npm run dev:server
  ```
- **Run Frontend Vite Dev Server (Port 3000)**:
  ```bash
  npm run dev:client
  ```
- **Compile Full Monorepo**:
  ```bash
  npm run build
  ```
- **Format Codebase**:
  ```bash
  npm run format
  ```
- **Lint Codebase**:
  ```bash
  npm run lint
  ```

---

## 🗺️ Development Roadmap

- [x] **Sprint 0**: Project Foundation & Monorepo Setup
- [x] **Sprint 1**: Database Foundation (PostgreSQL & Prisma models)
- [x] **Sprint 2**: Authentication Module (JWT, Password Hashing, Centralized Error Handling)
- [x] **Sprint 3**: Products & Customers CRUD
- [ ] **Sprint 4**: Sales Data Ingestion Engine (PapaParse & Transactions)
- [ ] **Sprint 5**: Dashboards & Analytics Aggregations
- [ ] **Sprint 6**: UI Visualization & Polish (Dark mode, Recharts)
- [ ] **Sprint 7**: Deployment & Production Readiness
