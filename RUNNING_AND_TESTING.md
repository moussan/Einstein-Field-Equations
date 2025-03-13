# Running and Testing the Einstein Field Equations Application

This guide provides detailed instructions for setting up, running, and testing the Einstein Field Equations application.

## Running the Application

### Docker Deployment (Recommended)

The easiest way to run the application is using Docker Compose:

1. **Prerequisites**:
   - Docker and Docker Compose installed on your system
   - Git for cloning the repository

2. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/Einstein-Field-Equations.git
   cd Einstein-Field-Equations
   ```

3. **Start the application**:
   ```bash
   docker-compose up -d
   ```

4. **Access the application**:
   - Frontend: `http://localhost:3000`
   - API: `http://localhost:8000`
   - API Documentation: `http://localhost:8000/docs`
   - Database Admin: `http://localhost:8080` (Adminer)

5. **View logs**:
   ```bash
   docker-compose logs -f
   ```

6. **Stop the application**:
   ```bash
   docker-compose down
   ```

### Manual Setup

#### Backend Setup

1. **Set up a virtual environment and install dependencies**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Create a `.env` file** in the backend directory with the following variables:
   ```
   DATABASE_URL=postgresql://user:password@localhost/einstein_field_equations
   SECRET_KEY=your-secret-key-for-jwt
   LOG_LEVEL=INFO
   LOG_FILE=logs/efecp.log
   REDIS_URL=redis://localhost:6379/0
   ```

3. **Create the logs directory**:
   ```bash
   mkdir -p logs
   ```

4. **Start the backend server**:
   ```bash
   cd app
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   For production deployment, use multiple workers:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

#### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

   For production build:
   ```bash
   npm run build
   ```

3. **Access the application** by opening your browser and navigating to `http://localhost:3000`

## Testing the Application

### Backend Testing

1. **API Documentation**: Once the backend is running, you can explore and test the API endpoints using:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

2. **Manual API Testing**:
   - Test the health check endpoint: `http://localhost:8000/health`
   - Test the root endpoint: `http://localhost:8000/`

3. **Authentication Testing**:
   - Create a user via the `/api/auth/signup` endpoint
   - Login with the created user via the `/api/auth/login` endpoint
   - Test the token via the `/api/auth/test-token` endpoint

4. **Calculation Testing**:
   - Create a calculation via one of the specialized endpoints:
     - `/api/calculations/vacuum-efe`
     - `/api/calculations/matter-efe`
     - `/api/calculations/schwarzschild`
     - `/api/calculations/kerr`
     - `/api/calculations/christoffel`
   - Retrieve calculations via the `/api/calculations` endpoint

### Frontend Testing

1. **User Authentication**:
   - Test user registration on the signup page
   - Test user login on the login page
   - Test password reset functionality

2. **Dashboard**:
   - Verify that the dashboard displays recent calculations
   - Test navigation between different sections

3. **Calculation Views**:
   - Test creating new calculations of different types
   - Verify that calculation results are displayed correctly
   - Test saving and sharing calculations

4. **Responsive Design**:
   - Test the application on different screen sizes to ensure responsive design

## Automated Testing

For more comprehensive testing, you can run the automated tests:

### Backend Tests

```bash
cd backend
pytest
```

For coverage report:
```bash
pytest --cov=app
```

### Frontend Tests

```bash
cd frontend
npm test
```

For coverage report:
```bash
npm test -- --coverage
```

## Performance Monitoring

### Backend Performance

1. **Request Timing**:
   - Each API response includes an `X-Process-Time` header showing the processing time in seconds
   - Example: `curl -i http://localhost:8000/health` and check the headers

2. **Database Performance**:
   - Enable SQL query logging by setting `echo=True` in the database engine configuration
   - Monitor connection pool usage with PostgreSQL: `SELECT * FROM pg_stat_activity;`

3. **Redis Cache Monitoring**:
   - Monitor Redis with: `redis-cli info`
   - Check cache hit rate: `redis-cli info stats | grep hit_rate`

### Frontend Performance

1. **Chrome DevTools**:
   - Use the Performance tab to analyze rendering performance
   - Use the Network tab to analyze loading times

2. **Lighthouse**:
   - Run Lighthouse audits in Chrome DevTools for performance metrics

## Troubleshooting

- **Database Connection Issues**: Ensure your PostgreSQL server is running and the connection string in the `.env` file is correct.
- **Missing Dependencies**: If you encounter import errors, make sure all dependencies are installed with `pip install -r requirements.txt`.
- **Frontend API Connection**: If the frontend can't connect to the backend, check that CORS is properly configured and that the API URL in the frontend matches the backend URL.
- **Calculation Errors**: For calculation-related errors, check the logs in the `logs/efecp.log` file for detailed error messages.
- **Docker Issues**: If using Docker, ensure ports are not already in use and that Docker has sufficient resources allocated.

## Development Workflow

When developing new features or fixing bugs, follow these steps:

1. Create a new branch for your feature or bugfix
2. Make your changes and test them locally
3. Write tests for your changes
4. Submit a pull request

## Database Migrations

If you make changes to the database models, you'll need to create and apply migrations:

```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

## Production Deployment

For deployment to production, additional steps are required:

1. Set up a production database
2. Configure environment variables for production
3. Build the frontend for production: `cd frontend && npm run build`
4. Set up a web server (like Nginx) to serve the frontend build
5. Configure the backend to run with a production ASGI server like Uvicorn or Gunicorn
6. Set up SSL/TLS certificates for HTTPS
7. Configure proper logging and monitoring 