FROM node:20-slim as base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Development stage
FROM base as development
ENV NODE_ENV=development

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Start development server
CMD ["npm", "run", "dev"]

# Build stage
FROM base as build
ENV NODE_ENV=production

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine as production
ENV NODE_ENV=production

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 