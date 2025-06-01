# Multi-stage Dockerfile for Nx monorepo
# This Dockerfile is intended to be built using the build.sh script 
# which will read Node version from .nvmrc

# Define ARG before FROM so it can be used in FROM
ARG NODE_VERSION=20.10.0

# Build stage for FabReader firmware
FROM python:3.9-slim AS firmware-builder

# Install required dependencies for building firmware
RUN apt-get update && apt-get install -y \
    git \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install PlatformIO
RUN pip install platformio

# Set working directory
WORKDIR /firmware

# Copy firmware source
COPY ./apps/fabreader-firmware ./

# Make build script executable
RUN chmod +x build_firmwares.py

# Build all firmware environments
RUN ./build_firmwares.py

# Single-stage Dockerfile that only copies pre-built artifacts
FROM node:${NODE_VERSION}-alpine

# Set working directory
WORKDIR /app

# Copy the pre-built application (these will be built in the CI pipeline)
COPY ./dist/apps/api ./dist/apps/api
COPY ./dist/apps/frontend ./dist/apps/frontend
COPY ./docs ./docs

# Copy firmware files from builder stage
COPY --from=firmware-builder /firmware/firmware_output/ ./dist/apps/frontend/_fabreader_assets/

COPY package.json package.json

# Set environment variable to tell API about frontend location
ENV STATIC_FRONTEND_FILE_PATH=/app/dist/apps/frontend

# Set environment variable to tell API about docs location
ENV STATIC_DOCS_FILE_PATH=/app/docs

# Set environment variable to tell API about plugins location
RUN mkdir -p /app/storage/plugins
ENV STORAGE_ROOT=/app/storage
ENV PLUGIN_DIR=/app/storage/plugins

# Install dependencies directly from the Nx-generated package.json
WORKDIR /app/dist/apps/api
RUN corepack enable && corepack prepare && \
    pnpm install # --frozen-lockfile

# Back to app root for consistent starting dir
WORKDIR /app

# Expose the API port
EXPOSE 3000

# Start the API using the launch script
CMD ["node", "dist/apps/api/main.js"]
