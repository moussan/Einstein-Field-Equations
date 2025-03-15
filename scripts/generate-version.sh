#!/bin/bash

# Create version info
VERSION=${REACT_APP_VERSION:-$(git describe --tags --always || echo 'dev')}
COMMIT=$(git rev-parse --short HEAD || echo 'unknown')
DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Create version file
cat > frontend/public/version.txt << EOL
Version: ${VERSION}
Commit: ${COMMIT}
Build Date: ${DATE}
EOL

# Update package.json version
if [ -n "${VERSION}" ] && [ "${VERSION}" != "dev" ]; then
    npm version ${VERSION} --no-git-tag-version --allow-same-version
fi 