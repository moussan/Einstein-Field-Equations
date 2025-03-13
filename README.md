# Einstein Field Equations Web Application

A comprehensive web application for calculating, visualizing, and exploring Einstein's Field Equations in General Relativity.

## Features

- **User Authentication**: Secure login, registration, and profile management
- **Calculation Engine**: Perform various calculations related to Einstein's Field Equations
  - Vacuum solutions
  - Matter solutions
  - Schwarzschild metric
  - Kerr metric
  - Christoffel symbols
  - Ricci tensor and scalar
  - And more...
- **Interactive Visualizations**: Visualize spacetime curvature, geodesics, and other relativistic phenomena
- **Save and Share**: Save calculations, create shareable links, and export results
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Performance Optimized**: Caching, compression, and other optimizations for fast response times

## Technology Stack

### Frontend
- React.js with TypeScript
- TailwindCSS for styling
- React Router for navigation
- Redux for state management
- MathJax for mathematical notation

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- PostgreSQL database
- Redis for caching
- SymPy for symbolic mathematics
- NumPy and SciPy for numerical calculations

## Getting Started

For detailed instructions on how to run and test the application, please see the [Running and Testing Guide](RUNNING_AND_TESTING.md).

### Quick Start with Docker

The easiest way to run the application is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/yourusername/Einstein-Field-Equations.git
cd Einstein-Field-Equations

# Start the application
docker-compose up -d
```

Then open your browser and navigate to `http://localhost:3000`

### Manual Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Einstein-Field-Equations.git
   cd Einstein-Field-Equations
   ```

2. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   DATABASE_URL=postgresql://user:password@localhost/einstein_field_equations
   SECRET_KEY=your-secret-key
   ```

4. Initialize the database:
   ```bash
   cd app
   python -m uvicorn main:app --reload
   ```

5. Set up the frontend:
   ```bash
   cd ../../frontend
   npm install
   ```

6. Start the frontend development server:
   ```bash
   npm start
   ```

7. Open your browser and navigate to `http://localhost:3000`

## Performance Optimizations

This application includes several performance optimizations:

- **Database Connection Pooling**: Efficient reuse of database connections
- **Response Compression**: Gzip compression for API responses
- **Caching**: In-memory and Redis caching for frequently accessed data
- **Rate Limiting**: Protection against abuse and DoS attacks
- **Optimized Docker Images**: Multi-stage builds and minimal images
- **Static Asset Optimization**: Caching and compression of frontend assets

## API Documentation

Once the backend server is running, you can access the API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Einstein's groundbreaking work in General Relativity
- The open-source community for providing excellent tools and libraries
- All contributors to this project