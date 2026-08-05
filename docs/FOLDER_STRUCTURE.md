# AnalyticxIQ Folder Structure Documentation

This document explains the organization and responsibilities of directories and files inside the AnalyticxIQ monorepo workspace.

---

## 📂 Root Workspace Overview

The project is structured as an npm workspaces monorepo containing three core packages:

```text
AnalyticxIQ/
├── package.json               # Root workspaces configuration
├── tsconfig.json              # Shared TypeScript base configuration
├── eslint.config.js           # Flat ESLint configurations
├── .prettierrc                # Prettier styling rules
├── .prettierignore            # Files to ignore in formatting
├── .editorconfig              # Consistency rules across IDEs
├── Dockerfile                 # Multi-stage production container build
├── docker-compose.yml         # Local database and server orchestration container config
├── DEPLOYMENT.md              # Deployment summary instructions
├── products_import.csv        # Local CSV test template file
├── shared/                    # Validation schemas and constants library
├── client/                    # Vite + React Single Page App
└── server/                    # Node.js + Express REST API
```

---

## 📂 Shared Workspace (`shared/`)

The `shared/` package contains utilities, constants, and validation schemas compiled to ES modules that are used by both the backend server and the frontend client.

```text
shared/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts               # Primary export registry
    ├── constants/
    │   └── index.ts           # Shared error codes, pagination bounds, status strings
    └── validation/
        ├── index.ts           # Re-exports Zod schemas
        ├── auth.ts            # Login and Registration form schemas
        ├── customer.ts        # Customer creation/edit validation rules
        ├── product.ts         # Product catalog forms validation rules
        └── sale.ts            # Sales transaction and line items validations
```

---

## 📂 Backend Workspace (`server/`)

The `server/` workspace is the Express.js API server. It is built in strict TypeScript and compiled to JavaScript (`dist/`) for production runtime.

```text
server/
├── package.json
├── tsconfig.json
├── vitest.config.ts           # Vitest configuration for unit/integration tests
├── prisma/
│   ├── schema.prisma          # Database models definitions, relations, and indexes
│   └── migrations/            # SQL delta migrations tracking database state history
└── src/
    ├── server.ts              # Server startup script (spins up Express app)
    ├── app.ts                 # Express app initialization, routing mounting, global middleware
    ├── config/
    │   └── index.ts           # Environment schema parser (zod-validated environment)
    ├── prisma/
    │   └── index.ts           # Singleton instance of Prisma Client
    ├── middleware/
    │   ├── auth.ts            # JWT authentication and user role verification middleware
    │   ├── validate.ts        # Zod request validation interceptor middleware
    │   ├── errorHandler.ts    # Centralized global error handling middleware
    │   └── logging.middleware.ts # Custom console request logger
    ├── controllers/
    │   ├── index.ts
    │   ├── auth.controller.ts # Login/register endpoints handlers
    │   ├── product.controller.ts # Products CRUD
    │   ├── customer.controller.ts # Customers CRUD
    │   ├── sale.controller.ts    # Sales transactions CRUD
    │   ├── analytics.controller.ts # BI Dashboard metrics and trend widgets
    │   ├── export.controller.ts    # CSV/Excel document rendering and download
    │   └── import.controller.ts    # Ingestion stream processors
    ├── repositories/
    │   ├── index.ts
    │   ├── product.repository.ts
    │   ├── customer.repository.ts
    │   ├── sale.repository.ts
    │   └── analytics.repository.ts # Raw SQL query definitions for aggregations
    ├── services/
    │   ├── auth.service.ts         # Password hashing, user creation, JWT signing
    │   └── import.service.ts       #PapaParse parsing, transaction rollback ingestion logic
    ├── types/
    │   └── express.d.ts            # Global Express Request context extensions (attaching user)
    ├── utils/
    │   ├── errors.ts               # Custom application error classes (AppError)
    │   └── logger.ts               # Custom logger formatter utility
    └── tests/
        ├── api.integration.test.ts # Endpoint routing and Helmet header tests
        ├── auth.service.test.ts    # Registration and authentication mocks
        └── import.service.test.ts  # CSV validation parser tests
```

---

## 📂 Frontend Workspace (`client/`)

The `client/` workspace contains the React Single Page Application (SPA), styled with Tailwind CSS, built with Vite, and fetched using TanStack Query.

```text
client/
├── package.json
├── tsconfig.json
├── index.html                 # App entry point template
├── vite.config.ts             # Vite server config and API proxies
├── src/
    ├── main.tsx               # Client mounting bootstrap
    ├── App.tsx                # Client Routing, Auth and Query client wrappers
    ├── index.css              # Main stylesheet and Tailwind configuration imports
    ├── assets/                # Images, logo assets
    ├── components/            # Reusable UI components
    ├── layouts/
    │   ├── index.ts
    │   └── DashboardLayout.tsx # Page structural wrapper (sidebar navigation, responsive toggle)
    ├── features/
    │   ├── index.ts
    │   └── auth/
    │       └── AuthContext.tsx # Context provider tracking active token, login, logout, register
    ├── hooks/                 # Global UI utilities (e.g., useDarkMode)
    ├── routes/                # Client route configuration and navigation guards
    ├── services/
    │   ├── index.ts
    │   └── api.ts             # Axios HTTP client configuration with authorization request interceptor
    ├── types/                 # Custom client-specific interfaces
    ├── utils/                 # Formatting helper scripts (currency, date calculations)
    └── pages/
        ├── index.ts           # Lazy loading registry
        ├── LoginPage.tsx      # Login form
        ├── RegisterPage.tsx   # Registration form
        ├── DashboardPage.tsx  # BI analytics dashboard
        ├── ProductListPage.tsx # Inventory table view
        ├── AddProductPage.tsx  # Product creation form
        ├── EditProductPage.tsx # Product editing form
        ├── CustomerListPage.tsx # Customer tables and detail panels
        ├── AddCustomerPage.tsx  # Customer creation form
        ├── EditCustomerPage.tsx # Customer editing form
        ├── SalesListPage.tsx    # Sales transaction history log
        ├── CreateSalePage.tsx   # Multi-item transaction creator form
        └── EditSalePage.tsx     # Sale transaction editing form
```
