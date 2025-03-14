#!/bin/bash

# Exit on error
set -e

# Update system packages
echo "Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install required packages
echo "Installing required packages..."
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    ufw \
    git

# Install Docker
echo "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Configure firewall
echo "Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Create application directory
echo "Creating application directory..."
mkdir -p ~/einstein-app
cd ~/einstein-app

# Create directories for SSL certificates
mkdir -p certbot/conf
mkdir -p certbot/www

# Create .env file template
echo "Creating .env file template..."
cat > .env.example << EOL
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# GitHub Configuration
GITHUB_USERNAME=your_github_username

# Domain Configuration
DOMAIN_NAME=your_domain_name
ADMIN_EMAIL=your_email@example.com
EOL

# Copy docker-compose file
echo "Creating docker-compose file..."
cat > docker-compose.yml << EOL
version: '3.8'

services:
  app:
    image: ghcr.io/\${GITHUB_USERNAME}/einstein-field-equations:latest
    container_name: einstein-app
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    environment:
      - REACT_APP_SUPABASE_URL=\${SUPABASE_URL}
      - REACT_APP_SUPABASE_ANON_KEY=\${SUPABASE_ANON_KEY}
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    networks:
      - app-network

  certbot:
    image: certbot/certbot
    container_name: certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    command: certonly --webroot -w /var/www/certbot --force-renewal --email \${ADMIN_EMAIL} -d \${DOMAIN_NAME} --agree-tos
    depends_on:
      - app
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
EOL

# Create deployment script
echo "Creating deployment script..."
cat > deploy.sh << EOL
#!/bin/bash

# Exit on error
set -e

# Pull the latest image
echo "Pulling the latest Docker image..."
docker pull ghcr.io/\${GITHUB_USERNAME}/einstein-field-equations:latest

# Stop and remove existing containers
echo "Stopping existing containers..."
docker-compose down || true

# Start the new containers
echo "Starting new containers..."
docker-compose up -d

# Clean up old images
echo "Cleaning up old images..."
docker image prune -af
EOL

chmod +x deploy.sh

echo "========================================"
echo "Server setup complete!"
echo "========================================"
echo "Next steps:"
echo "1. Copy .env.example to .env and update with your values"
echo "2. Run the deployment script: ./deploy.sh"
echo "========================================" 