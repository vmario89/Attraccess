# Multi-stage Dockerfile for Nx monorepo
# This Dockerfile is intended to be built using the build.sh script 
# which will read Node version from .nvmrc

# Define ARG before FROM so it can be used in FROM
ARG NODE_VERSION=20.10.0

# Build stage
FROM node:${NODE_VERSION}-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml first
COPY package.json pnpm-lock.yaml ./
COPY .npmrc ./

# Install pnpm using corepack (it will read version from package.json)
RUN corepack enable && corepack prepare

# Install dependencies (using --frozen-lockfile to stick to lockfile)
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the API and frontend projects
# Mount NX_CLOUD_ACCESS_TOKEN as a secret during build time
# To use this, build with: docker build --secret id=nx_token ...
RUN --mount=type=secret,id=nx_token \
    export NX_CLOUD_ACCESS_TOKEN=$(cat /run/secrets/nx_token) && \
    pnpm nx run-many --target=build --projects=api,frontend --prod

# Production stage - reuse Node version from first stage
# ARG must be redeclared in each stage where it's used
ARG NODE_VERSION
FROM node:${NODE_VERSION}-alpine AS production

# Set working directory
WORKDIR /app

# Copy API dist files from builder
COPY --from=builder /app/dist/apps/api ./

# Copy frontend dist files
COPY --from=builder /app/dist/apps/frontend /app/public

# Set environment variable to tell API about frontend location
ENV STATIC_FRONTEND_FILE_PATH=/app/public

# -- Actually not needed, because nx adds a package.json and pnpm-lock.yaml to the dist folder --
# Install only production dependencies for API
# COPY package.json pnpm-lock.yaml ./

# Use corepack to automatically install the correct pnpm version
RUN corepack enable && corepack prepare && \
    pnpm install --prod --frozen-lockfile

# Expose the API port (update this if your API uses a different port)
EXPOSE 3000

# Start the API
CMD ["node", "main.js"]
