# Einstein Field Equations Platform - Deployment Guide

This README provides a summary of the deployment process for the Einstein Field Equations Platform, a SaaS solution built with React and Supabase.

## Quick Start

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/einstein-field-equations.git
   cd einstein-field-equations
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Run with Docker Compose**:
   ```bash
   docker-compose up
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000

### Production Deployment

We use a hybrid deployment model:
- **Frontend**: Containerized with Docker, deployed to a cloud provider
- **Backend**: Hosted on Supabase's cloud platform

## Deployment Files

This repository includes several files to help with deployment:

- `docker-compose.yml` - For local development
- `docker-compose.prod.yml` - For production deployment
- `Dockerfile` - For building the frontend container
- `nginx/nginx.conf` - Nginx configuration for the frontend
- `server-setup.sh` - Script to set up a production server
- `DEPLOYMENT_GUIDE.md` - Comprehensive deployment guide

## Deployment Process

### 1. Set Up Supabase

1. Create a Supabase project at [app.supabase.io](https://app.supabase.io)
2. Get your project URL, anon key, and project reference
3. Deploy the database schema and Edge Functions:
   ```bash
   npm install -g supabase
   supabase login
   cd supabase
   supabase db push --project-ref your-project-ref
   supabase functions deploy calculate --project-ref your-project-ref
   supabase functions deploy health --project-ref your-project-ref
   ```

### 2. Configure GitHub Repository

Add the following secrets to your GitHub repository:
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `DEPLOY_HOST`
- `DEPLOY_USERNAME`
- `DEPLOY_KEY`

### 3. Set Up Cloud Server

1. Create a server on your preferred cloud provider
2. Copy `server-setup.sh` to your server and run it:
   ```bash
   scp server-setup.sh user@your-server-ip:~/
   ssh user@your-server-ip
   chmod +x server-setup.sh
   ./server-setup.sh
   ```

3. Configure the environment:
   ```bash
   cd ~/einstein-app
   cp .env.example .env
   # Edit .env with your values
   ```

4. Deploy the application:
   ```bash
   ./deploy.sh
   ```

### 4. Continuous Deployment

The GitHub Actions workflow will automatically:
1. Run tests
2. Build and push the Docker image
3. Deploy Edge Functions and database migrations to Supabase
4. Deploy the Docker container to your cloud server

## Monitoring and Maintenance

- **Health Checks**: Access `https://<your-supabase-url>/functions/v1/health`
- **Logs**: 
  - Docker: `docker logs einstein-app`
  - Supabase: View in the Supabase dashboard

## Additional Resources

- [Supabase Documentation](https://supabase.io/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)

## Troubleshooting

See `DEPLOYMENT_GUIDE.md` for detailed troubleshooting steps. 