# Create new directory structure
$dirs = @(
    "src/frontend",
    "src/edge-functions",
    "src/shared",
    "config/prometheus",
    "config/fluentd",
    "config/nginx",
    "config/otel",
    "config/supabase",
    "scripts/deployment",
    "scripts/monitoring",
    "scripts/backup",
    "docs/api",
    "docs/deployment",
    "docs/development",
    "docs/architecture",
    "docs/user-guides",
    ".github/workflows",
    "tests/frontend",
    "tests/edge-functions",
    "tests/integration"
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path $dir
}

# Move frontend code
if (Test-Path frontend) {
    Move-Item -Force frontend/* src/frontend/
}

# Move edge functions
if (Test-Path "supabase/functions") {
    Move-Item -Force supabase/functions/* src/edge-functions/
}

# Move configuration files
if (Test-Path prometheus) {
    Move-Item -Force prometheus/* config/prometheus/
}
if (Test-Path fluentd) {
    Move-Item -Force fluentd/* config/fluentd/
}
if (Test-Path nginx) {
    Move-Item -Force nginx/* config/nginx/
}
if (Test-Path "otel-collector-config.yaml") {
    Move-Item -Force otel-collector-config.yaml config/otel/
}
if (Test-Path "supabase/config") {
    Move-Item -Force supabase/config/* config/supabase/
}

# Move documentation
$docMoves = @{
    "API_DOCUMENTATION.md" = "docs/api/rest-api.md"
    "DEPLOYMENT_GUIDE.md" = "docs/deployment/production.md"
    "DEPLOYMENT_ENHANCEMENTS.md" = "docs/deployment/enhancements.md"
    "MONITORING_SETUP.md" = "docs/deployment/monitoring.md"
    "LOGGING_ENHANCEMENTS.md" = "docs/deployment/logging.md"
    "RUNNING_AND_TESTING.md" = "docs/development/setup.md"
    "COMPONENT_MIGRATION_GUIDE.md" = "docs/development/migration.md"
    "PERFORMANCE_OPTIMIZATION.md" = "docs/development/performance.md"
    "Tech Stack.md" = "docs/architecture/tech-stack.md"
    "Features List.md" = "docs/architecture/features.md"
    "Project Structure.md" = "docs/architecture/structure.md"
}

foreach ($move in $docMoves.GetEnumerator()) {
    if (Test-Path $move.Key) {
        Move-Item -Force $move.Key $move.Value
    }
}

# Move scripts
$scriptMoves = @{
    "deploy.sh" = "scripts/deployment/"
    "server-setup.sh" = "scripts/deployment/"
    "setup_supabase.js" = "scripts/deployment/"
    "update_frontend.js" = "scripts/deployment/"
}

foreach ($move in $scriptMoves.GetEnumerator()) {
    if (Test-Path $move.Key) {
        Move-Item -Force $move.Key $move.Value
    }
}

# Move tests
if (Test-Path tests) {
    Move-Item -Force tests/* tests/integration/
}

# Clean up empty directories
$dirsToRemove = @(
    "backend",
    "prometheus",
    "fluentd",
    "nginx",
    "supabase",
    "auth",
    "visualizations",
    "computation",
    "deployment",
    "logs"
)

foreach ($dir in $dirsToRemove) {
    if (Test-Path $dir) {
        Remove-Item -Recurse -Force $dir
    }
}

# Remove duplicate files
$filesToRemove = @(
    "DEPLOYMENT_README.md",
    "MONITORING_ENHANCEMENTS.md",
    "PERFORMANCE_SUMMARY.md",
    "SUPABASE_README.md",
    "SUPABASE_DEPLOYMENT_GUIDE.md",
    "SUPABASE_MIGRATION.md"
)

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Remove-Item -Force $file
    }
}

# Create new .gitignore
$gitignoreContent = @"
# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
coverage/

# Production
build/
dist/
.next/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Build
*.tsbuildinfo

# Cache
.cache/
.npm/

# Temporary files
*.tmp
*.temp
"@

Set-Content -Path ".gitignore" -Value $gitignoreContent

# Update docker-compose files
if (Test-Path "docker-compose.yml") {
    (Get-Content "docker-compose.yml") `
        -replace './frontend', './src/frontend' |
    Set-Content "docker-compose.yml"
}

if (Test-Path "docker-compose.prod.yml") {
    (Get-Content "docker-compose.prod.yml") `
        -replace './frontend', './src/frontend' `
        -replace './prometheus', './config/prometheus' `
        -replace './fluentd', './config/fluentd' `
        -replace './nginx', './config/nginx' |
    Set-Content "docker-compose.prod.yml"
}

Write-Host "Project structure reorganized successfully!" 