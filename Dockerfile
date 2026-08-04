FROM node:20-alpine AS builder

WORKDIR /app

# Copy root monorepo files
COPY package*.json ./
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/
COPY tsconfig.json ./

# Copy monorepo workspace folders
COPY shared/ ./shared/
COPY server/ ./server/

# Install all dependencies and build libraries/server
RUN npm ci --legacy-peer-deps
RUN npm run build:shared
RUN npm run build:server

# Production Runner Stage
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/

# Extract built assets and modules
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app/server

# Run database migrations and start server
CMD ["node", "dist/server.js"]
