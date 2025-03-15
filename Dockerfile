# syntax=docker/dockerfile:1.4
FROM node:18-alpine as deps

# Add build metadata
LABEL org.opencontainers.image.source="https://github.com/yourusername/einstein-field-equations"
LABEL org.opencontainers.image.description="Einstein Field Equations Platform Frontend"
LABEL org.opencontainers.image.licenses="MIT"

# Set working directory
WORKDIR /app

# Install dependencies with cache mount
COPY src/frontend/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install --prefer-offline --no-audit --production && \
    npm cache clean --force

# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY src/frontend/ ./

# Set build arguments and environment variables
ARG REACT_APP_VERSION
ARG BUILD_DATE
ARG GIT_COMMIT
ENV REACT_APP_VERSION=${REACT_APP_VERSION:-dev}
ENV BUILD_DATE=${BUILD_DATE:-unknown}
ENV GIT_COMMIT=${GIT_COMMIT:-unknown}
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false

# Build the app with production optimization
RUN --mount=type=cache,target=/root/.npm \
    npm run build && \
    rm -rf node_modules

# Production stage
FROM nginx:alpine as runner

# Install security updates and tools
RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache \
    curl \
    tzdata \
    ca-certificates \
    && rm -rf /var/cache/apk/* && \
    # Add nginx user
    adduser -D -H -u 101 -s /sbin/nologin nginx && \
    # Create cache directories owned by nginx
    mkdir -p /var/cache/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    # Remove default nginx static assets
    rm -rf /usr/share/nginx/html/* && \
    # Create nginx cache directories
    mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/proxy_temp && \
    mkdir -p /var/cache/nginx/fastcgi_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp && \
    mkdir -p /var/cache/nginx/scgi_temp && \
    chown -R nginx:nginx /var/cache/nginx && \
    # Create logging directory
    mkdir -p /var/log/nginx && \
    chown -R nginx:nginx /var/log/nginx

# Copy built assets from build stage
COPY --from=builder --chown=nginx:nginx /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Add security headers
RUN echo "add_header X-Frame-Options 'SAMEORIGIN';" >> /etc/nginx/conf.d/security.conf && \
    echo "add_header X-XSS-Protection '1; mode=block';" >> /etc/nginx/conf.d/security.conf && \
    echo "add_header X-Content-Type-Options 'nosniff';" >> /etc/nginx/conf.d/security.conf && \
    echo "add_header Referrer-Policy 'strict-origin-when-cross-origin';" >> /etc/nginx/conf.d/security.conf && \
    echo "add_header Strict-Transport-Security 'max-age=31536000; includeSubDomains' always;" >> /etc/nginx/conf.d/security.conf && \
    echo "add_header Content-Security-Policy \"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-src 'self';\";" >> /etc/nginx/conf.d/security.conf

# Add version info
COPY --from=builder /app/build/version.txt /usr/share/nginx/html/version.txt

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Switch to non-root user
USER nginx

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VERSION=1.7.1 \
    POETRY_HOME="/opt/poetry" \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_NO_INTERACTION=1 \
    PYSETUP_PATH="/opt/pysetup" \
    VENV_PATH="/opt/pysetup/.venv"

# Add Poetry to PATH
ENV PATH="$POETRY_HOME/bin:$VENV_PATH/bin:$PATH"

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

# Copy only requirements to cache them in docker layer
WORKDIR $PYSETUP_PATH
COPY poetry.lock pyproject.toml ./

# Development stage
FROM base as development
ENV FASTAPI_ENV=development

# Install dependencies
RUN poetry install --no-root

# Copy application code
COPY . .

# Start development server
CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Production stage
FROM base as production
ENV FASTAPI_ENV=production

# Install dependencies
RUN poetry install --no-root --no-dev

# Copy application code
COPY . .

# Start production server
CMD ["poetry", "run", "gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "app.main:app", "--bind", "0.0.0.0:8000"] 