# Cleanup script for remaining organizational issues

# Consolidate documentation directories
if (Test-Path "docs/user_guides") {
    if (Test-Path "docs/user-guides") {
        Get-ChildItem "docs/user_guides" | Move-Item -Destination "docs/user-guides" -Force
    }
    Remove-Item "docs/user_guides" -Recurse -Force
}

if (Test-Path "docs/design") {
    if (-not (Test-Path "docs/architecture/design")) {
        New-Item -ItemType Directory -Force -Path "docs/architecture/design"
    }
    Get-ChildItem "docs/design" | Move-Item -Destination "docs/architecture/design" -Force
    Remove-Item "docs/design" -Recurse -Force
}

if (Test-Path "docs/requirements") {
    if (-not (Test-Path "docs/architecture/requirements")) {
        New-Item -ItemType Directory -Force -Path "docs/architecture/requirements"
    }
    Get-ChildItem "docs/requirements" | Move-Item -Destination "docs/architecture/requirements" -Force
    Remove-Item "docs/requirements" -Recurse -Force
}

# Reorganize config directory
$envDirs = @("dev", "staging", "prod")
foreach ($env in $envDirs) {
    if (Test-Path "config/$env") {
        $configTypes = @("prometheus", "fluentd", "nginx", "otel", "supabase")
        foreach ($type in $configTypes) {
            if (Test-Path "config/$env/$type") {
                if (-not (Test-Path "config/$type/environments")) {
                    New-Item -ItemType Directory -Force -Path "config/$type/environments"
                }
                if (-not (Test-Path "config/$type/environments/$env")) {
                    New-Item -ItemType Directory -Force -Path "config/$type/environments/$env"
                }
                Get-ChildItem "config/$env/$type" | Move-Item -Destination "config/$type/environments/$env" -Force
            }
        }
        Remove-Item "config/$env" -Recurse -Force
    }
}

# Create README files for each major directory
$readmeContent = @{
    "src/README.md" = @"
# Source Code

This directory contains all source code for the Einstein Field Equations Platform:

- `frontend/`: React frontend application
- `edge-functions/`: Supabase Edge Functions
- `shared/`: Shared utilities and types
"@

    "config/README.md" = @"
# Configuration

This directory contains all configuration files:

- `prometheus/`: Prometheus monitoring configuration
- `fluentd/`: Fluentd logging configuration
- `nginx/`: Nginx web server configuration
- `otel/`: OpenTelemetry configuration
- `supabase/`: Supabase configuration

Each service directory contains:
- `environments/`: Environment-specific configurations (dev, staging, prod)
- `defaults/`: Default configuration files
- `templates/`: Configuration templates
"@

    "scripts/README.md" = @"
# Scripts

This directory contains utility scripts:

- `deployment/`: Deployment and setup scripts
- `monitoring/`: Monitoring and observability scripts
- `backup/`: Backup and recovery scripts
"@

    "tests/README.md" = @"
# Tests

This directory contains all test files:

- `frontend/`: Frontend unit and component tests
- `edge-functions/`: Edge Functions unit tests
- `integration/`: End-to-end and integration tests
"@
}

foreach ($readme in $readmeContent.GetEnumerator()) {
    Set-Content -Path $readme.Key -Value $readme.Value
}

Write-Host "Cleanup completed successfully!" 