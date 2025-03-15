#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ -f .env ]; then
    source .env
fi

# Check required environment variables
required_vars=(
    "SUPABASE_URL"
    "SUPABASE_ANON_KEY"
    "DATABASE_URL"
    "GRAFANA_PASSWORD"
    "DOMAIN_NAME"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: $var is not set"
        exit 1
    fi
done

# Create necessary directories
echo "Creating directories..."
mkdir -p \
    prometheus/rules \
    fluentd/conf \
    fluentd/certs \
    fluentd/scripts \
    elasticsearch/config \
    .github/workflows \
    nginx/conf.d \
    backups \
    logs

# Generate SSL certificates for Fluentd
echo "Generating SSL certificates for Fluentd..."
openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 \
    -subj "/CN=${DOMAIN_NAME}" \
    -keyout fluentd/certs/fluentd.key \
    -out fluentd/certs/fluentd.crt

# Set correct permissions
echo "Setting permissions..."
chmod 755 fluentd/scripts/cleanup_logs.sh
chmod 600 fluentd/certs/fluentd.key

# Build and push Docker images
echo "Building Docker images..."
TAG=$(git rev-parse --short HEAD)
export TAG

docker-compose -f docker-compose.prod.yml build

# Create Docker volumes if they don't exist
echo "Creating Docker volumes..."
docker volume create prometheus_data
docker volume create grafana_data
docker volume create elasticsearch_data
docker volume create fluentd_data
docker volume create redis_data

# Initialize Elasticsearch
echo "Initializing Elasticsearch..."
docker-compose -f docker-compose.prod.yml up -d elasticsearch
echo "Waiting for Elasticsearch to start..."
sleep 30

# Deploy the stack
echo "Deploying the stack..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 30

# Initialize Grafana dashboards
echo "Initializing Grafana dashboards..."
curl -X POST -H "Content-Type: application/json" \
    -d @grafana/dashboards/einstein.json \
    http://admin:${GRAFANA_PASSWORD}@localhost:3000/api/dashboards/db

# Set up log rotation
echo "Setting up log rotation..."
cat > /etc/logrotate.d/einstein << EOF
/var/log/einstein/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 www-data www-data
}
EOF

# Set up cron jobs
echo "Setting up cron jobs..."
(crontab -l 2>/dev/null || true; echo "0 0 * * * /fluentd/scripts/cleanup_logs.sh") | crontab -

# Verify deployment
echo "Verifying deployment..."
services=(
    "frontend:3000"
    "prometheus:9090"
    "grafana:3000"
    "elasticsearch:9200"
    "kibana:5601"
    "jaeger:16686"
)

for service in "${services[@]}"; do
    IFS=':' read -r -a array <<< "$service"
    name="${array[0]}"
    port="${array[1]}"
    if curl -s -f "http://localhost:${port}/health" > /dev/null; then
        echo "${name} is running"
    else
        echo "Warning: ${name} might not be running properly"
    fi
done

echo "Deployment completed successfully!"
echo "Access the services at:"
echo "- Grafana: http://localhost:3000"
echo "- Prometheus: http://localhost:9090"
echo "- Kibana: http://localhost:5601"
echo "- Jaeger: http://localhost:16686"

# Print monitoring instructions
echo "
Monitoring Instructions:
1. Access Grafana at http://localhost:3000 (admin:${GRAFANA_PASSWORD})
2. View traces in Jaeger at http://localhost:16686
3. Check logs in Kibana at http://localhost:5601
4. Monitor metrics in Prometheus at http://localhost:9090

For any issues:
1. Check service logs: docker-compose -f docker-compose.prod.yml logs [service]
2. Check health endpoints: curl http://localhost:[port]/health
3. View monitoring dashboard in Grafana
" 