# Production Deployment Guide – AnalyticxIQ

This document provides step-by-step instructions for deploying the AnalyticxIQ platform components in production environments.

---

## 1. Database Configuration (Neon PostgreSQL)

We recommend using **Neon Serverless PostgreSQL** for production.

1. **Sign up**: Create an account on [Neon.tech](https://neon.tech) and set up a new project.
2. **Retrieve Connection String**: Copy the connection string. It should look like:
   ```env
   DATABASE_URL="postgresql://[user]:[password]@[host]/neondb?sslmode=require"
   ```
3. **Run Migrations**: Apply the schema and index migrations to the Neon database by running the following command from the root of the project:
   ```bash
   DATABASE_URL="your-neon-connection-string" npx prisma migrate deploy --schema=server/prisma/schema.prisma
   ```

---

## 2. Backend Deployment (Railway or Render)

### Railway Deployment (Recommended)
1. **Connect Repository**: Link your GitHub repository in your Railway project workspace.
2. **Build Configuration**:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start --workspace=server`
3. **Environment Variables**: Configure the following variables in the Railway console:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `DATABASE_URL`: `postgresql://...` (Neon DB URL)
   - `JWT_SECRET`: `your-random-secure-string-key`

---

## 3. Frontend Deployment (Vercel)

1. **New Project**: Import your repository on [Vercel](https://vercel.com).
2. **Framework Preset**: Choose `Vite`.
3. **Build & Development Settings**:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**:
   - `VITE_API_URL`: Set this to your production backend URL (e.g. `https://analyticiq-backend.up.railway.app/api/v1`).

---

## 4. Local Container Orchestration (Docker Compose)

To spin up the production configuration locally:

```bash
# Build and run containers in detached mode
docker-compose up --build -d

# Check process logs
docker-compose logs -f server

# Tear down services and retain database volumes
docker-compose down
```
