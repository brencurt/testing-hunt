# Backend Dockerfile
# Uses a single-stage Node.js image — no build step needed for Express.

FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy dependency manifests first (better layer caching:
# if package.json doesn't change, Docker reuses the npm install layer)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the source code
COPY . .

# Expose the port the server listens on
EXPOSE 3001

# Health check — Docker will mark the container unhealthy if this fails
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

# Start the server
CMD ["node", "server.js"]
