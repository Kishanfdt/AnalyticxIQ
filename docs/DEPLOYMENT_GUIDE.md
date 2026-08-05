# Production Deployment Guide – AnalyticxIQ

This document provides step-by-step instructions for deploying the AnalyticxIQ platform in production environments.

---

## 🗄️ 1. Database Deployment (Neon PostgreSQL)

We recommend using **Neon Serverless PostgreSQL** for production.

1.  **Sign up**: Create an account on [Neon.tech](https://neon.tech) and set up a new project.
2.  **Retrieve Connection String**: Copy the PostgreSQL connection string. Ensure you append `?sslmode=require` for secure transit.
    ```env
    DATABASE_URL="postgresql://[user]:[password]@[host]/neondb?sslmode=require"
    ```
3.  **Run Migrations**: Apply the schema migrations directly from your local terminal to the production Neon database:
    ```bash
    DATABASE_URL="your-neon-connection-string" npx prisma migrate deploy --schema=server/prisma/schema.prisma
    ```

---

## 💻 2. Backend API Deployment (Railway or Render)

### Railway Deployment (Recommended)

1.  **Connect Repository**: Link your GitHub repository in your Railway project workspace.
2.  **Build Settings**:
    - **Build Command**: `npm run build`
    - **Start Command**: `npm run start --workspace=server`
3.  **Environment Variables**: Configure the following variables in the Railway environment settings tab:
    - `NODE_ENV`: `production`
    - `PORT`: `5000`
    - `DATABASE_URL`: `postgresql://...` (your Neon DB URL)
    - `JWT_SECRET`: `your-random-secure-string-key`

---

## 🖥️ 3. Frontend Deployment (Vercel)

1.  **Create Project**: Import the repository on [Vercel](https://vercel.com).
2.  **Framework Preset**: Select `Vite`.
3.  **Build Settings**:
    - **Root Directory**: `client`
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
4.  **Environment Variables**:
    - `VITE_API_URL`: Set this to your production backend URL (e.g. `https://analyticiq-backend.up.railway.app/api/v1`).
5.  **Router Configuration**: Create a `vercel.json` file inside the [`client/`](file:///c:/Users/ckish/OneDrive/Desktop/AnalyticxIQ/client) folder to route all client-side navigation requests to `index.html` (supporting React Router SPA navigation):
    ```json
    {
      "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
    }
    ```

---

## 🐳 4. Local Container Orchestration (Docker Compose)

To run the full stack locally inside production-hardened Docker containers:

1.  **Build & Run Services**:
    ```bash
    # Build and start services in detached mode
    docker-compose up --build -d
    ```
2.  **Access App**:
    - Frontend Client: `http://localhost:3000`
    - Backend API Server: `http://localhost:5000`
3.  **Check Logs**:
    ```bash
    docker-compose logs -f server
    ```
4.  **Tear Down Services**:
    ```bash
    docker-compose down
    ```

---

## 🔒 5. Production Hardening Checklist

- [ ] **HTTPS Enforcement**: Ensure the backend API is only served over HTTPS. Helmet middleware will automatically set `Strict-Transport-Security` headers.
- [ ] **Rate Limiting**: The backend rate limiter allows up to 100 requests per 15 minutes per IP. Adjust this in `server/src/app.ts` if your integration clients require higher throughput.
- [ ] **Cors Restrictions**: Change the wildcard or open CORS middleware to explicitly list your production frontend origin:
  ```typescript
  // Inside server/src/app.ts
  app.use(cors({ origin: 'https://your-production-app.vercel.app', credentials: true }));
  ```
- [ ] **JWT Secrets**: Always use strong, 256-bit keys generated via cryptographically secure generators for your production `JWT_SECRET`.
  ```bash
  # Generate secure key in terminal
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
