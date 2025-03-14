# Deployment Guide for Einstein Field Equations Platform

This guide outlines the steps to deploy the Einstein Field Equations Platform as a SaaS solution using Docker and Supabase.

## Architecture Overview

The platform uses a hybrid deployment model:
- **Frontend**: Containerized with Docker, deployed to a cloud provider
- **Backend**: Hosted on Supabase's cloud platform

## Prerequisites

- A Supabase account and project
- A cloud provider account (Digital Ocean, AWS, GCP, etc.)
- Docker installed on your local machine
- GitHub account with repository access
- Domain name (optional but recommended)

## Step 1: Set Up Supabase Project

1. **Create a Supabase Project**:
   - Go to [Supabase Dashboard](https://app.supabase.io/)
   - Click "New Project"
   - Enter project details and create

2. **Get Supabase Credentials**:
   - From your project dashboard, go to Settings > API
   - Copy the URL, anon key, and service role key
   - Note your project reference ID from the URL

3. **Deploy Database Schema**:
   - Install Supabase CLI: `npm install -g supabase`
   - Login: `supabase login`
   - Push schema: `cd supabase && supabase db push --project-ref your-project-ref`

4. **Deploy Edge Functions**:
   - Deploy calculate function: `supabase functions deploy calculate --project-ref your-project-ref`
   - Deploy health check: `supabase functions deploy health --project-ref your-project-ref`

## Step 2: Configure GitHub Repository

1. **Add GitHub Secrets**:
   - Go to your repository Settings > Secrets > Actions
   - Add the following secrets:
     - `SUPABASE_ACCESS_TOKEN`: Your Supabase access token
     - `SUPABASE_PROJECT_REF`: Your Supabase project reference
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_ANON_KEY`: Your Supabase anon key
     - `DEPLOY_HOST`: Your server IP address
     - `DEPLOY_USERNAME`: Your server username
     - `DEPLOY_KEY`: Your SSH private key for deployment

## Step 3: Set Up Cloud Server

1. **Create a Server**:
   - Create a server on your preferred cloud provider (e.g., Digital Ocean Droplet)
   - Recommended specs: 2GB RAM, 2 vCPUs, 50GB SSD

2. **Install Docker**:
   ```bash
   # Update packages
   sudo apt update
   sudo apt upgrade -y

   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh

   # Add your user to the docker group
   sudo usermod -aG docker $USER
   ```

3. **Configure Firewall**:
   ```bash
   # Allow SSH, HTTP, and HTTPS
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

4. **Set Up Domain (Optional)**:
   - Point your domain to your server's IP address
   - Install Certbot for SSL:
     ```bash
     sudo apt install certbot python3-certbot-nginx
     sudo certbot --nginx -d yourdomain.com
     ```

## Step 4: Local Development

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/einstein-field-equations.git
   cd einstein-field-equations
   ```

2. **Create .env File**:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Run Locally with Docker Compose**:
   ```bash
   docker-compose up
   ```

4. **Access the Application**:
   - Frontend: http://localhost:3000

## Step 5: Continuous Deployment

The GitHub Actions workflow will automatically:
1. Run tests for frontend and Edge Functions
2. Build and push the Docker image to GitHub Container Registry
3. Deploy Edge Functions and database migrations to Supabase
4. Deploy the Docker container to your cloud server

To trigger a deployment, simply push to the main branch:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

## Step 6: Monitoring and Maintenance

1. **Health Checks**:
   - Access the health endpoint: `https://<your-supabase-url>/functions/v1/health`
   - Set up monitoring with Uptime Robot or similar service

2. **Database Backups**:
   - Supabase automatically handles backups
   - You can also manually export data from the Supabase dashboard

3. **Logs**:
   - View Docker container logs: `docker logs einstein-app`
   - View Supabase logs from the dashboard

## Troubleshooting

### Common Issues

1. **Docker Container Not Starting**:
   ```bash
   # Check container status
   docker ps -a
   
   # View logs
   docker logs einstein-app
   ```

2. **Edge Function Errors**:
   - Check Supabase dashboard > Edge Functions > Logs
   - Verify environment variables are correctly set

3. **Database Connection Issues**:
   - Ensure RLS policies are correctly configured
   - Check network access rules in Supabase dashboard

## Scaling Considerations

As your user base grows, consider:

1. **Horizontal Scaling**:
   - Deploy multiple instances behind a load balancer

2. **Database Optimization**:
   - Implement the materialized views from `supabase/migrations/20230602000000_add_materialized_views.sql`
   - Monitor query performance in Supabase dashboard

3. **CDN Integration**:
   - Add a CDN like Cloudflare for static assets

## Security Best Practices

1. **Regular Updates**:
   ```bash
   # Update server packages
   sudo apt update && sudo apt upgrade -y
   
   # Update Docker images
   docker pull ghcr.io/yourusername/einstein-field-equations:latest
   ```

2. **Audit Logs**:
   - Regularly review access logs
   - Set up alerts for suspicious activities

3. **Backup Strategy**:
   - Implement automated backups
   - Test restoration procedures 