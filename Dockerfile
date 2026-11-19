# ---------- Stage 1: install everything and build the web app ----------
FROM node:22-slim AS build
WORKDIR /app

# Copy only the package manifests first, so the npm ci layer is cached
COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/
COPY apps/cli/package.json apps/cli/
COPY apps/web/package.json apps/web/
COPY apps/server/package.json apps/server/
RUN npm ci

COPY . .
RUN npm run build

# ---------- Stage 2: the small image we actually run ----------
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/
COPY apps/cli/package.json apps/cli/
COPY apps/web/package.json apps/web/
COPY apps/server/package.json apps/server/
RUN npm ci --omit=dev && npm cache clean --force

COPY packages/core/src packages/core/src
COPY apps/server/src apps/server/src
COPY --from=build /app/apps/web/dist apps/web/dist

USER node
EXPOSE 3001
CMD ["node", "--import", "tsx", "apps/server/src/main.ts"]