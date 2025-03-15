#!/bin/bash

# Create new directory structure
mkdir -p \
    src/frontend \
    src/edge-functions \
    src/shared \
    config/prometheus \
    config/fluentd \
    config/nginx \
    config/otel \
    config/supabase \
    scripts/deployment \
    scripts/monitoring \
    scripts/backup \
    docs/api \
    docs/deployment \
    docs/development \
    docs/architecture \
    docs/user-guides \
    .github/workflows \
    tests/frontend \
    tests/edge-functions \
    tests/integration

# Move frontend code
mv frontend/* src/frontend/

# Move edge functions
mv supabase/functions/* src/edge-functions/

# Move configuration files
mv prometheus/* config/prometheus/
mv fluentd/* config/fluentd/
mv nginx/* config/nginx/
mv otel-collector-config.yaml config/otel/
mv supabase/config/* config/supabase/

# Move documentation
mv API_DOCUMENTATION.md docs/api/rest-api.md
mv DEPLOYMENT_GUIDE.md docs/deployment/production.md
mv DEPLOYMENT_ENHANCEMENTS.md docs/deployment/enhancements.md
mv MONITORING_SETUP.md docs/deployment/monitoring.md
mv LOGGING_ENHANCEMENTS.md docs/deployment/logging.md
mv RUNNING_AND_TESTING.md docs/development/setup.md
mv COMPONENT_MIGRATION_GUIDE.md docs/development/migration.md
mv PERFORMANCE_OPTIMIZATION.md docs/development/performance.md
mv "Tech Stack.md" docs/architecture/tech-stack.md
mv "Features List.md" docs/architecture/features.md
mv "Project Structure.md" docs/architecture/structure.md

# Move scripts
mv deploy.sh scripts/deployment/
mv server-setup.sh scripts/deployment/
mv setup_supabase.js scripts/deployment/
mv update_frontend.js scripts/deployment/

# Move tests
mv tests/* tests/integration/

# Clean up empty directories
rm -rf \
    backend \
    prometheus \
    fluentd \
    nginx \
    supabase \
    auth \
    visualizations \
    computation \
    deployment \
    logs

# Remove duplicate files
rm -f \
    DEPLOYMENT_README.md \
    MONITORING_ENHANCEMENTS.md \
    PERFORMANCE_SUMMARY.md \
    SUPABASE_README.md \
    SUPABASE_DEPLOYMENT_GUIDE.md \
    SUPABASE_MIGRATION.md

# Create new .gitignore
cat > .gitignore << EOL
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
EOL

# Update docker-compose files to reflect new structure
sed -i 's|./frontend|./src/frontend|g' docker-compose.yml
sed -i 's|./frontend|./src/frontend|g' docker-compose.prod.yml
sed -i 's|./prometheus|./config/prometheus|g' docker-compose.prod.yml
sed -i 's|./fluentd|./config/fluentd|g' docker-compose.prod.yml
sed -i 's|./nginx|./config/nginx|g' docker-compose.prod.yml

echo "Project structure reorganized successfully!" 