# Use Node.js 20 LTS
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Install remix-serve for production runtime
RUN pnpm add -D @remix-run/serve

# Copy source code
COPY . .

# Build the application
RUN pnpm run build:render

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Start the application
CMD ["pnpm", "run", "start"]