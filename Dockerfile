# Stage 1: Base Image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first to leverage caching
COPY package*.json ./

# Install dependencies only for production
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user for security
RUN adduser -D appuser
USER appuser

# Health Check (Optional but good practice)
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD wget -qO /dev/null http://localhost:3000/ || exit 1

# Expose the application port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]