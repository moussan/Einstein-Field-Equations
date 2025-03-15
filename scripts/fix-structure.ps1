# Fix directory structure issues

# 1. Fix edge-functions directory structure
Write-Host "Fixing edge-functions directory structure..."
if (Test-Path "src/edge-functions/types") {
    Move-Item -Force "src/edge-functions/types/*" "src/shared/types/" -ErrorAction SilentlyContinue
    Remove-Item "src/edge-functions/types" -Force -Recurse
}
if (Test-Path "src/edge-functions/constants") {
    Move-Item -Force "src/edge-functions/constants/*" "src/shared/constants/" -ErrorAction SilentlyContinue
    Remove-Item "src/edge-functions/constants" -Force -Recurse
}

# 2. Create missing directories
Write-Host "Creating missing directories..."
New-Item -ItemType Directory -Force -Path "config/prometheus/environments"

# 3. Create missing README files
Write-Host "Creating missing README files..."

# Fluentd README
$fluentdReadme = @"
# Fluentd Configuration

## Directory Structure

- parsers/: Log parsing configurations
- filters/: Log filtering rules
- outputs/: Output destination configurations

## Overview

This directory contains Fluentd configurations for log aggregation and processing.
Each subdirectory serves a specific purpose in the log processing pipeline.
"@
Set-Content -Path "config/fluentd/README.md" -Value $fluentdReadme

# Nginx README
$nginxReadme = @"
# Nginx Configuration

## Directory Structure

- sites/: Site-specific configurations
- includes/: Shared configuration snippets
- ssl/: SSL certificates and configurations

## Overview

This directory contains Nginx web server configurations.
Each subdirectory contains specific aspects of the server configuration.
"@
Set-Content -Path "config/nginx/README.md" -Value $nginxReadme

# OpenTelemetry README
$otelReadme = @"
# OpenTelemetry Configuration

## Directory Structure

- processors/: Data processing configurations
- receivers/: Data receiver configurations
- exporters/: Data exporter configurations

## Overview

This directory contains OpenTelemetry configurations for distributed tracing
and metrics collection across the application.
"@
Set-Content -Path "config/otel/README.md" -Value $otelReadme

# Deployment README
$deploymentReadme = @"
# Deployment Documentation

## Directory Structure

- kubernetes/: Kubernetes deployment guides
- docker/: Docker deployment instructions
- monitoring/: Monitoring setup guides

## Overview

This directory contains comprehensive deployment documentation for
different environments and deployment strategies.
"@
Set-Content -Path "docs/deployment/README.md" -Value $deploymentReadme

# Development README
$developmentReadme = @"
# Development Documentation

## Directory Structure

- setup/: Development environment setup guides
- guidelines/: Coding standards and best practices
- testing/: Testing procedures and guidelines

## Overview

This directory contains documentation for developers working on the project,
including setup instructions, coding standards, and testing procedures.
"@
Set-Content -Path "docs/development/README.md" -Value $developmentReadme

# User Guides README
$userGuidesReadme = @"
# User Documentation

## Directory Structure

- calculations/: Einstein Field Equations calculation guides
- visualizations/: Data visualization tutorials
- tutorials/: Step-by-step guides for common tasks

## Overview

This directory contains end-user documentation, including guides for
performing calculations, understanding visualizations, and following tutorials.
"@
Set-Content -Path "docs/user-guides/README.md" -Value $userGuidesReadme

Write-Host "Directory structure fixes completed successfully!" 