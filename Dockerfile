# Use Node.js 20 LTS as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for better security and performance
RUN apk add --no-cache \
    dumb-init \
    && addgroup -g 1001 -S nodejs \
    && adduser -S inboxed -u 1001

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies and source files to reduce image size
RUN rm -rf src/ node_modules/ && \
    npm ci --only=production && \
    npm cache clean --force

# Create uploads directory with proper permissions
RUN mkdir -p /tmp/uploads && \
    chown -R inboxed:nodejs /tmp/uploads && \
    chmod 755 /tmp/uploads

# Switch to non-root user for security
USER inboxed

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]
