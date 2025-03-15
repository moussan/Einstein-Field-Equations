# Einstein Field Equations Calculator

A web application for calculating and visualizing Einstein Field Equations and related metrics in General Relativity.

## Features

- Calculate Schwarzschild metric components
- Calculate Kerr metric components
- Interactive 3D visualization of spacetime geometry
- RESTful API for metric calculations

## Tech Stack

### Frontend
- Next.js
- Three.js for 3D visualization
- Material-UI for components
- TypeScript

### Backend
- FastAPI
- NumPy and SciPy for calculations
- Poetry for dependency management
- Docker for containerization

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/einstein-field-equations.git
   cd einstein-field-equations
   ```

2. Start the application using Docker Compose:
   ```bash
   docker-compose up --build
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Local Development

1. Install frontend dependencies:
   ```bash
   cd src/frontend
   npm install
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   poetry install
   ```

3. Start the development servers:
   ```bash
   # Terminal 1 - Frontend
   cd src/frontend
   npm run dev

   # Terminal 2 - Backend
   cd backend
   poetry run uvicorn app.main:app --reload
   ```

## API Endpoints

### Health Check
```
GET /health
```

### Calculate Schwarzschild Metric
```
POST /api/v1/calculate/schwarzschild
{
    "mass": float,
    "radius": float,
    "theta": float
}
```

### Calculate Kerr Metric
```
POST /api/v1/calculate/kerr
{
    "mass": float,
    "angular_momentum": float,
    "radius": float,
    "theta": float
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
