FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Generate Prisma client
COPY prisma/ ./prisma/
RUN npx prisma generate

# Copy application code
COPY tsconfig.json ./
COPY src/ ./src/

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./
# Install only production dependencies
RUN npm ci --only=production

# Copy Prisma schema
COPY prisma ./prisma/

# Copy build artifacts from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create and use non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose API port
EXPOSE 3000

# Run the application
CMD ["node", "dist/main.js"]
