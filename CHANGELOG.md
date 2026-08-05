# Changelog – AnalyticxIQ

All notable changes to this project are documented in this file. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] – 2026-08-05

This is the initial production-ready release of AnalyticxIQ, compiling all sprint deliverables into a unified, secure, and validated platform.

### Added

#### Sprint 9: Production Readiness & Hardening

- Added multi-stage production build configuration in `Dockerfile`.
- Added local container orchestration support via `docker-compose.yml`.
- Added Helmet security headers and IP rate-limiter middleware.
- Added Vitest integration testing suite for backend routes and validations.
- Added index optimization constraints on key database columns (`businessId`, `saleDate`, `customerId`, `region`).

#### Sprint 8: Advanced Data Operations & Ingestion

- Added PapaParse batch CSV parser stream pipeline in the import service.
- Added atomicity guarantees during ingestion via database transactions (rolling back all inserts if any row is invalid).
- Added download utilities for exporting Sales, Customers, and Products to CSV or Excel.

#### Sprint 7: Interactive BI Dashboard

- Added responsive charts (Revenue trend, sales by category, sales by region) powered by Recharts.
- Added dark-mode themes.
- Added interactive date-range calendar picker filters.

#### Sprint 6: Business Intelligence SQL Engine

- Added raw SQL query sets for performance-optimized aggregations (Gross Revenue, Net Revenue, Profit margins, MoM growth rates, customer frequency, best sellers).

#### Sprint 5: Sales Management Module

- Added Sales CRUD controller endpoints.
- Added transaction logic and backend discount/price checks to prevent client-side modifications.

#### Sprint 4: Customer Directory & Isolation

- Added Customer CRUD controller endpoints.
- Added logical isolation via matching `businessId` checks.

#### Sprint 3: Product Inventory Module

- Added Product CRUD controller endpoints.
- Added Zod schema validations for forms.

#### Sprint 2: Core Authentication

- Added JWT authentication.
- Added password hashing via `bcryptjs`.
- Added standardized global error handler and logger.

#### Sprint 1 & 0: Base Monorepo

- Added relational database models in Prisma PostgreSQL schema.
- Added monorepo workspace configurations (`shared`, `client`, `server`).

### Fixed

- Fixed PostgreSQL raw SQL query case-sensitivity crash where camelCase column names like `si.unitPrice` were unquoted, folding to lowercase and raising exceptions. Quoting it as `si."unitPrice"` resolved the crash on the analytics dashboard.
- Fixed Vite proxy configurations to route frontend requests on port 3000 to backend API on port 5000.
- Fixed ESM startup loader crashes in the development backend script.
