FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
# ci = clean install from package-lock, --omit=dev skips devDependencies
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose the port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
