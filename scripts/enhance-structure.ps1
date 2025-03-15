# Create additional directory structure

# Source code organization
$srcDirs = @(
    "src/frontend/components",
    "src/frontend/hooks",
    "src/frontend/utils",
    "src/frontend/styles",
    "src/frontend/pages",
    "src/frontend/services",
    "src/frontend/types",
    "src/frontend/assets",
    "src/frontend/contexts",
    "src/frontend/layouts",
    "src/edge-functions/auth",
    "src/edge-functions/calculations",
    "src/edge-functions/metrics",
    "src/edge-functions/utils",
    "src/shared/types",
    "src/shared/constants",
    "src/shared/utils",
    "src/shared/validation"
)

# Configuration organization
$configDirs = @(
    "config/prometheus/rules",
    "config/prometheus/alerts",
    "config/prometheus/dashboards",
    "config/fluentd/parsers",
    "config/fluentd/filters",
    "config/fluentd/outputs",
    "config/nginx/sites",
    "config/nginx/includes",
    "config/nginx/ssl",
    "config/otel/processors",
    "config/otel/receivers",
    "config/otel/exporters",
    "config/supabase/functions",
    "config/supabase/migrations",
    "config/supabase/seeds"
)

# Documentation organization
$docsDirs = @(
    "docs/api/rest",
    "docs/api/graphql",
    "docs/api/websockets",
    "docs/deployment/kubernetes",
    "docs/deployment/docker",
    "docs/deployment/monitoring",
    "docs/development/setup",
    "docs/development/guidelines",
    "docs/development/testing",
    "docs/architecture/diagrams",
    "docs/architecture/decisions",
    "docs/architecture/patterns",
    "docs/user-guides/calculations",
    "docs/user-guides/visualizations",
    "docs/user-guides/tutorials"
)

# Scripts organization
$scriptsDirs = @(
    "scripts/deployment/kubernetes",
    "scripts/deployment/docker",
    "scripts/deployment/database",
    "scripts/monitoring/alerts",
    "scripts/monitoring/dashboards",
    "scripts/monitoring/metrics",
    "scripts/backup/database",
    "scripts/backup/logs",
    "scripts/backup/config"
)

# Tests organization
$testsDirs = @(
    "tests/frontend/unit",
    "tests/frontend/integration",
    "tests/frontend/e2e",
    "tests/edge-functions/unit",
    "tests/edge-functions/integration",
    "tests/integration/api",
    "tests/integration/performance",
    "tests/integration/security"
)

# Create all directories
$allDirs = $srcDirs + $configDirs + $docsDirs + $scriptsDirs + $testsDirs
foreach ($dir in $allDirs) {
    New-Item -ItemType Directory -Force -Path $dir
}

# Update README files with new structure
$readmeContent = @{
    "src/frontend/README.md" = "# Frontend Application

## Directory Structure

- components/: Reusable UI components
- hooks/: Custom React hooks
- utils/: Utility functions and helpers
- styles/: Global styles and theme definitions
- pages/: Page components and routes
- services/: API and external service integrations
- types/: TypeScript type definitions
- assets/: Static assets (images, fonts, etc.)
- contexts/: React context providers
- layouts/: Page layout components"

    "src/edge-functions/README.md" = "# Edge Functions

## Directory Structure

- auth/: Authentication and authorization functions
- calculations/: Einstein Field Equations calculations
- metrics/: Performance and monitoring metrics
- utils/: Shared utilities and helpers"

    "src/shared/README.md" = "# Shared Code

## Directory Structure

- types/: Shared TypeScript types
- constants/: Shared constants and configurations
- utils/: Common utility functions
- validation/: Shared validation schemas"

    "config/prometheus/README.md" = "# Prometheus Configuration

## Directory Structure

- rules/: Recording and alerting rules
- alerts/: Alert configurations
- dashboards/: Grafana dashboard definitions
- environments/: Environment-specific configurations"

    "docs/api/README.md" = "# API Documentation

## Directory Structure

- rest/: REST API endpoints and usage
- graphql/: GraphQL schema and operations
- websockets/: WebSocket events and protocols"

    "scripts/deployment/README.md" = "# Deployment Scripts

## Directory Structure

- kubernetes/: Kubernetes deployment scripts
- docker/: Docker deployment scripts
- database/: Database migration and setup scripts"

    "tests/README.md" = "# Tests

## Directory Structure

### Frontend Tests
- frontend/unit/: Unit tests for components and utilities
- frontend/integration/: Integration tests for features
- frontend/e2e/: End-to-end tests with Cypress

### Edge Functions Tests
- edge-functions/unit/: Unit tests for functions
- edge-functions/integration/: Integration tests for APIs

### Integration Tests
- integration/api/: API integration tests
- integration/performance/: Performance and load tests
- integration/security/: Security and penetration tests"
}

foreach ($readme in $readmeContent.GetEnumerator()) {
    Set-Content -Path $readme.Key -Value $readme.Value
}

# Update main README.md
$mainReadme = Get-Content -Path "README.md" -Raw
$mainReadme = $mainReadme -replace "(?ms)^## Project Structure.*?(?=^##)", @"
## Project Structure

```
.
├── src/                              # Source code
│   ├── frontend/                     # React frontend application
│   │   ├── components/              # Reusable UI components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── utils/                   # Utility functions
│   │   ├── styles/                  # Global styles
│   │   ├── pages/                   # Page components
│   │   ├── services/               # API integrations
│   │   ├── types/                   # TypeScript types
│   │   ├── assets/                 # Static assets
│   │   ├── contexts/               # React contexts
│   │   └── layouts/                # Page layouts
│   ├── edge-functions/              # Supabase Edge Functions
│   │   ├── auth/                   # Authentication functions
│   │   ├── calculations/           # EFE calculations
│   │   ├── metrics/                # Performance metrics
│   │   └── utils/                  # Shared utilities
│   └── shared/                      # Shared code
│       ├── types/                  # Shared types
│       ├── constants/              # Shared constants
│       ├── utils/                  # Common utilities
│       └── validation/             # Validation schemas
├── config/                          # Configuration files
│   ├── prometheus/                  # Prometheus config
│   │   ├── rules/                 # Recording rules
│   │   ├── alerts/                # Alert rules
│   │   └── dashboards/            # Grafana dashboards
│   ├── fluentd/                    # Fluentd config
│   │   ├── parsers/               # Log parsers
│   │   ├── filters/               # Log filters
│   │   └── outputs/               # Output configs
│   ├── nginx/                      # Nginx config
│   │   ├── sites/                 # Site configs
│   │   ├── includes/              # Shared configs
│   │   └── ssl/                   # SSL certificates
│   ├── otel/                       # OpenTelemetry config
│   │   ├── processors/            # Data processors
│   │   ├── receivers/             # Data receivers
│   │   └── exporters/             # Data exporters
│   └── supabase/                   # Supabase config
│       ├── functions/             # Function configs
│       ├── migrations/            # DB migrations
│       └── seeds/                 # Seed data
├── docs/                           # Documentation
│   ├── api/                        # API docs
│   │   ├── rest/                  # REST API
│   │   ├── graphql/               # GraphQL
│   │   └── websockets/            # WebSocket
│   ├── deployment/                 # Deployment guides
│   │   ├── kubernetes/            # K8s deployment
│   │   ├── docker/                # Docker deployment
│   │   └── monitoring/            # Monitoring setup
│   ├── development/                # Dev guides
│   │   ├── setup/                 # Setup guides
│   │   ├── guidelines/            # Coding standards
│   │   └── testing/               # Testing guides
│   └── user-guides/                # User documentation
│       ├── calculations/          # Calculation guides
│       ├── visualizations/        # Visualization guides
│       └── tutorials/             # Step-by-step guides
├── scripts/                        # Utility scripts
│   ├── deployment/                 # Deployment scripts
│   │   ├── kubernetes/            # K8s scripts
│   │   ├── docker/                # Docker scripts
│   │   └── database/              # DB scripts
│   ├── monitoring/                 # Monitoring scripts
│   │   ├── alerts/                # Alert setup
│   │   ├── dashboards/            # Dashboard setup
│   │   └── metrics/               # Metrics setup
│   └── backup/                     # Backup scripts
│       ├── database/              # DB backups
│       ├── logs/                  # Log backups
│       └── config/                # Config backups
├── tests/                          # Test files
│   ├── frontend/                   # Frontend tests
│   │   ├── unit/                 # Unit tests
│   │   ├── integration/          # Integration tests
│   │   └── e2e/                  # End-to-end tests
│   ├── edge-functions/            # Edge Function tests
│   │   ├── unit/                 # Unit tests
│   │   └── integration/          # Integration tests
│   └── integration/                # Integration tests
│       ├── api/                   # API tests
│       ├── performance/           # Performance tests
│       └── security/              # Security tests
├── docker-compose.yml              # Dev environment
├── docker-compose.prod.yml         # Prod environment
├── Dockerfile                      # Main Dockerfile
└── .env.example                    # Environment template
```

"@

Set-Content -Path "README.md" -Value $mainReadme

Write-Host "Enhanced directory structure created successfully!" 