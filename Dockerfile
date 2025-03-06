# Multi-stage Dockerfile for Nx monorepo
# This Dockerfile is intended to be built using the build.sh script 
# which will read Node version from .nvmrc

# Define ARG before FROM so it can be used in FROM
ARG NODE_VERSION=20.10.0

# Single-stage Dockerfile that only copies pre-built artifacts
FROM node:${NODE_VERSION}-alpine

# Set working directory
WORKDIR /app

# Copy the pre-built application (these will be built in the CI pipeline)
COPY ./dist ./dist

# Set environment variable to tell API about frontend location
ENV STATIC_FRONTEND_FILE_PATH=/app/dist/apps/frontend

# Install dependencies directly from the Nx-generated package.json
WORKDIR /app/dist/apps/api
RUN corepack enable && corepack prepare && \
    pnpm install --frozen-lockfile

# Back to app root for consistent starting dir
WORKDIR /app

# Expose the API port
EXPOSE 3000

# Create a launch script to help with debugging
RUN echo '#!/bin/sh\necho "Starting API from $(pwd)"\necho "Contents of dist/apps/api:"\nls -la dist/apps/api\necho "API node_modules:"\nls -la dist/apps/api/node_modules | head -n 5\necho "Starting API..."\nexec node dist/apps/api/main.js' > /app/start.sh && \
    chmod +x /app/start.sh

# Start the API using the launch script
CMD ["/app/start.sh"]
