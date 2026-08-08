# Deployment Guide – AnalyticxIQ

AnalyticxIQ is deployed as two independent services:

| Layer | Platform | URL |
|---|---|---|
| **Frontend** | Vercel | `https://your-app.vercel.app` |
| **Backend API** | Render | `https://analyticxiq-backend.onrender.com` |
| **Database** | Neon PostgreSQL | `ep-xxxx.region.aws.neon.tech` |

---

## Prerequisites

- GitHub repository with this codebase pushed
- Accounts on [Neon](https://neon.tech), [Render](https://render.com), and [Vercel](https://vercel.com)

---

## Step 1 — Neon PostgreSQL Database

1. Log in to [neon.tech](https://neon.tech) and create a new **Project**.
2. Choose region **ap-southeast-1 (Singapore)** (matches the Render region).
3. Copy the **Connection String** from the dashboard. It looks like:
   ```
   postgresql://neondb_owner:xxxx@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Run Prisma migrations against Neon from your local machine:
   ```bash
   DATABASE_URL="your-neon-connection-string" npx prisma migrate deploy --schema=server/prisma/schema.prisma
   ```
   > You only need to run this once. Future schema changes also use `prisma migrate deploy`.

---

## Step 2 — Backend Deployment (Render)

### Option A — Blueprint (Recommended)

This repo includes a `render.yaml` file at the root.

1. Go to [render.com](https://render.com) → **New** → **Blueprint**.
2. Connect your GitHub repository.
3. Render will auto-detect `render.yaml` and create the `analyticxiq-backend` service.
4. After the service is created, go to its **Environment** tab and set:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Your Neon connection string |
   | `JWT_SECRET` | A strong random string (run `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`) |
   | `CORS_ORIGIN` | Your Vercel URL, e.g. `https://your-app.vercel.app` |

5. Trigger a **Manual Deploy** after setting env vars.

### Option B — Manual Service

1. **New** → **Web Service** → connect your repo.
2. Set the following in the service settings:
   - **Build Command**: `npm ci --legacy-peer-deps && npm run build:shared && npm run build:server`
   - **Start Command**: `node server/dist/server.js`
   - **Health Check Path**: `/health`
3. Add the env vars from the table above.

### Verify Backend

Once deployed, open `https://analyticxiq-backend.onrender.com/health` — it should return:
```json
{ "success": true, "status": "UP" }
```

---

## Step 3 — Frontend Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo.
2. In **Configure Project**, set:
   - **Root Directory**: `. ` (repo root — leave blank / dot)
   - **Framework Preset**: `Vite`
   - **Build Command**: *(leave blank — picked up from `client/vercel.json`)*
   - **Output Directory**: `client/dist`
3. Add the following **Environment Variable**:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://analyticxiq-backend.onrender.com/api/v1` |

4. Click **Deploy**.

> **Note**: The `client/vercel.json` already contains the correct build command  
> (`npm ci --legacy-peer-deps && npm run build:shared && npm run build:client`)  
> and SPA rewrite rules — no manual Vercel dashboard overrides needed.

---

## Step 4 — Connect Frontend → Backend

After both are live:

1. Copy your **Render backend URL** (e.g. `https://analyticxiq-backend.onrender.com`).
2. In your Vercel project → **Settings** → **Environment Variables**, update:
   ```
   VITE_API_URL = https://analyticxiq-backend.onrender.com/api/v1
   ```
3. In your Render service → **Environment**, update:
   ```
   CORS_ORIGIN = https://your-app.vercel.app
   ```
4. Redeploy both services.

---

## Environment Variables Reference

### Backend (Render)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Strong random secret for JWT signing |
| `CORS_ORIGIN` | ✅ | Comma-separated list of allowed frontend origins |
| `NODE_ENV` | ✅ | Set to `production` |
| `PORT` | ✅ | `5000` (Render also auto-injects `PORT`) |

See [`server/.env.example`](./server/.env.example) for a template.

### Frontend (Vercel)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Full URL to backend API (e.g. `https://xxx.onrender.com/api/v1`) |

See [`client/.env.example`](./client/.env.example) for a template.

---

## Local Development (No Change)

Local dev is unchanged — the Vite dev server proxy forwards `/api/*` to `localhost:5000`:

```bash
# Terminal 1 — Backend
npm run dev:server

# Terminal 2 — Frontend
npm run dev:client
```

The `VITE_API_URL` env var is **not needed** locally; it falls back to the Vite proxy automatically.

---

## Docker (Optional / Local Only)

```bash
# Build and run containers locally
docker-compose up --build -d

# View logs
docker-compose logs -f server

# Tear down
docker-compose down
```
