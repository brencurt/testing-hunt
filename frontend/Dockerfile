# Frontend Dockerfile — multi-stage build
#
# Why two stages?
#   Stage 1 (builder): Node.js installs deps and compiles React → static HTML/JS/CSS
#   Stage 2 (server):  Nginx serves those static files, no Node needed
#
# Result: final image is tiny (~25MB vs ~400MB if Node stayed in).
# This is the standard production pattern for React apps.

# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests (cached separately from source for faster rebuilds)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Accept VITE_API_URL as a build argument.
# Vite bakes env vars into the JS bundle at build time (not runtime),
# so they must be available here as ENV variables during `npm run build`.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build
# Output is in /app/dist

# ── Stage 2: Serve ───────────────────────────────────────────────────────────
FROM nginx:alpine

# Copy the built React app from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Use our custom nginx config (SPA routing + API proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

# nginx starts automatically as the container's CMD
