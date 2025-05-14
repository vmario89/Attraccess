# Docker Compose Deployment Guide

This guide walks you through setting up Attraccess using Docker Compose, which simplifies the management of Docker containers.

## What is Docker Compose?

Docker Compose is a tool that allows you to define and manage multi-container Docker applications. Even though Attraccess runs in a single container, Docker Compose makes it easier to manage the configuration, startup, and shutdown of your Attraccess instance.

> 💡 **Benefit**: Using Docker Compose means you don't have to remember long Docker commands - all your settings are stored in a simple configuration file.

## Prerequisites

- Docker installed on your system ([Installation Guide](https://docs.docker.com/get-docker/))
- Docker Compose installed ([Installation Guide](https://docs.docker.com/compose/install/))
- Basic familiarity with text editors

## Step-by-Step Deployment

### Step 1: Create a Project Directory

First, create a dedicated directory for your Attraccess deployment:

```bash
# Create a main directory for Attraccess
mkdir -p ~/attraccess

# Navigate to this directory
cd ~/attraccess
```

### Step 2: Create Docker Compose Configuration

Create a file named `docker-compose.yml` in your Attraccess directory:

```bash
touch docker-compose.yml
```

Open this file in a text editor and add the following configuration:

```yaml
version: '3'

services:
  attraccess:
    image: fabaccess/attraccess:latest
    container_name: attraccess
    restart: unless-stopped
    ports:
      - '3000:3000'
    environment:
      # Authentication & Security
      - AUTH_JWT_ORIGIN=ENV
      - AUTH_JWT_SECRET=replace_with_a_long_random_string
      - AUTH_SESSION_SECRET=replace_with_another_long_random_string
      - VITE_ATTRACCESS_URL=http://localhost:3000

      # Email Configuration
      - SMTP_SERVICE=SMTP
      - SMTP_FROM=your-email@example.com
      - SMTP_HOST=smtp.example.com
      - SMTP_PORT=587
      - SMTP_USER=your-email-username
      - SMTP_PASS=your-email-password

      # Logging level
      - LOG_LEVELS=error,warn,log
    volumes:
      - ./storage:/app/storage
      - ./plugins:/app/plugins
```

> ⚠️ **Security Note**: Replace the placeholder values for `AUTH_JWT_SECRET` and `AUTH_SESSION_SECRET` with strong, random strings. You can generate secure random strings with: `openssl rand -base64 32`

### Step 3: Create Storage Directories

Create directories for Attraccess data that will be mapped to the Docker container:

```bash
mkdir -p storage plugins
```

### Step 4: Customizing Your Configuration

#### Email Configuration

Update the email settings in your `docker-compose.yml` file with your actual SMTP details:

**For Gmail:**

```yaml
# Email Configuration
- SMTP_SERVICE=SMTP
- SMTP_FROM=your-gmail@gmail.com
- SMTP_HOST=smtp.gmail.com
- SMTP_PORT=587
- SMTP_USER=your-gmail@gmail.com
- SMTP_PASS=your-app-password
```

**For Outlook/Office 365:**

```yaml
# Email Configuration
- SMTP_SERVICE=Outlook365
- SMTP_FROM=your-email@outlook.com
- SMTP_USER=your-email@outlook.com
- SMTP_PASS=your-password
```

#### URL Configuration

If you're deploying Attraccess to be accessible from other computers, update the `VITE_ATTRACCESS_URL` with your actual domain or IP address:

```yaml
- VITE_ATTRACCESS_URL=https://attraccess.yourdomain.com
```

or

```yaml
- VITE_ATTRACCESS_URL=http://your-server-ip:3000
```

### Step 5: Start Attraccess

Once you've configured your `docker-compose.yml` file, start Attraccess with:

```bash
docker-compose up -d
```

This command:

- `-d`: Runs containers in the background (detached mode)

### Step 6: Verify Deployment

Check if Attraccess is running properly:

```bash
docker-compose ps
```

You should see your Attraccess container listed as running.

### Step 7: Access the Application

Open your web browser and go to:

- `http://localhost:3000` (if accessing from the same computer)
- `http://your-server-ip:3000` (if accessing from another computer)

### Managing Your Attraccess Instance

#### View Logs

To see the logs from your Attraccess container:

```bash
docker-compose logs
```

For continuous log monitoring:

```bash
docker-compose logs -f
```

#### Stop Attraccess

To stop your Attraccess instance:

```bash
docker-compose down
```

#### Restart Attraccess

To restart your Attraccess instance:

```bash
docker-compose restart
```

#### Update to the Latest Version

To update Attraccess to the latest version:

```bash
# Pull the latest image
docker-compose pull

# Restart with the new image
docker-compose up -d
```

## Using Environment Files (Alternative Approach)

Instead of putting your environment variables directly in the `docker-compose.yml` file, you can use a separate `.env` file for better security and organization:

1. Create a `.env` file:

```bash
touch .env
```

2. Add your environment variables to this file:

```
# Authentication & Security
AUTH_JWT_ORIGIN=ENV
AUTH_JWT_SECRET=your_secure_jwt_secret
AUTH_SESSION_SECRET=your_secure_session_secret
VITE_ATTRACCESS_URL=http://localhost:3000

# Email Configuration
SMTP_SERVICE=SMTP
SMTP_FROM=your-email@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email-username
SMTP_PASS=your-email-password

# Logging level
LOG_LEVELS=error,warn,log
```

3. Update your `docker-compose.yml` to use this file:

```yaml
version: '3'

services:
  attraccess:
    image: fabaccess/attraccess:latest
    container_name: attraccess
    restart: unless-stopped
    ports:
      - '3000:3000'
    env_file:
      - .env
    volumes:
      - ./storage:/app/storage
      - ./plugins:/app/plugins
```

## Troubleshooting

### Common Issues

1. **Container fails to start**:

   - Check your `docker-compose.yml` for syntax errors
   - Verify all required environment variables are set correctly
   - Check if port 3000 is already in use by another application

2. **Can't access Attraccess in browser**:

   - Verify the container is running with `docker-compose ps`
   - Check if your firewall is blocking port 3000
   - Make sure you're using the correct URL

3. **Email sending fails**:
   - Double-check your SMTP settings
   - Some email providers require allowing "less secure apps" or creating app passwords

### Viewing Detailed Logs

For more detailed troubleshooting, increase the log levels in your configuration:

```yaml
- LOG_LEVELS=error,warn,log,debug,verbose
```

Then restart your container and check the logs:

```bash
docker-compose restart
docker-compose logs -f
```

## Next Steps

After successfully deploying Attraccess, you can:

1. Create an account (the first account is automatically Admin)
2. Enjoy Attraccess!

For more information on using Attraccess, refer to our [User Guide](/user/getting-started.md).
