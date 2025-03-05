# Release Process

This document outlines the release process for the Attraccess application, explaining how we build and deploy Docker containers.

## Overview

We use a release-based workflow for building and publishing Docker containers. Instead of creating a new container on every push to the main branch, we use GitHub Releases to trigger container builds.

## Release Flow

1. **Development & Testing**
   - All code is developed in feature branches
   - Pull requests are submitted to merge into the main branch
   - The CI workflow runs tests on every PR
   - After approval and passing tests, code is merged to main

2. **Release Preparation**
   - When ready to release, a team member creates a new GitHub Release
   - The release should follow semantic versioning (e.g., v1.0.0, v1.1.0, v2.0.0)
   - Each release should include detailed release notes

3. **Container Build & Push**
   - When a release is published, the release workflow automatically:
      - Runs final tests
      - Builds the Docker container image
      - Tags the image with the release version, major.minor version, and latest (for stable releases)
      - Pushes the image to GitHub Container Registry (GHCR)
      - Generates build attestation for security

4. **Deployment**
   - After the container is built and pushed, it can be deployed to production
   - Currently, deployment needs to be handled manually, but the workflow includes a placeholder for automation

## Manual Workflow Trigger

For testing purposes, the release workflow can be manually triggered via GitHub Actions:

1. Go to Actions > Release workflow
2. Click "Run workflow"
3. Enter a tag name (e.g., "test" or a version number)
4. Click "Run workflow"

This will build and push a container with the specified tag, but won't trigger the deployment step.

## Container Tags

Each release generates multiple tags for the container:

- Full version (e.g., `v1.2.3`)
- Major.minor version (e.g., `1.2`)
- `latest` tag (only for stable releases, not pre-releases)

## Accessing the Container

The container is available at:
```
ghcr.io/[your-github-username]/attraccess:[tag]
```

Replace `[your-github-username]` with your actual GitHub username/organization and `[tag]` with the desired version tag.

## Security Features

The release process includes several security features:

1. **SLSA Attestation**: Supply-chain Levels for Software Artifacts attestation for enhanced security and provenance tracking.

2. **Secure Secret Handling**: Sensitive data like the NX_CLOUD_ACCESS_TOKEN is passed to the build process using Docker BuildKit's secret mounting feature, ensuring secrets are not stored in image layers.

3. **Minimal Production Image**: The multi-stage build ensures only necessary files are included in the final production image.

4. **Permission Scoping**: GitHub Actions workflows use the principle of least privilege with scoped permissions. 