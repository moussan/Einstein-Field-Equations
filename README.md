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
- SymPy for symbolic mathematics
- NumPy and SciPy for numerical calculations

## Getting Started

### Prerequisites
- Node.js (v14+)
- Python (v3.9+)
- PostgreSQL (v13+)

### Installation

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