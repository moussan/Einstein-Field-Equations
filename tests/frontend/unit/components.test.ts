import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Login } from '../../../src/frontend/components/Auth/Login';
import { CalculationForm } from '../../../src/frontend/components/Calculation/CalculationForm';
import { ResultsVisualization } from '../../../src/frontend/components/Visualization/ResultsVisualization';

describe('Auth Components', () => {
  describe('Login Component', () => {
    it('renders login form correctly', () => {
      render(<Login />);
      expect(screen.getByRole('heading')).toHaveTextContent('Sign in');
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('Sign in');
    });

    it('handles form submission', async () => {
      const mockSubmit = jest.fn();
      render(<Login onSubmit={mockSubmit} />);
      
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button'));
      
      expect(mockSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('displays validation errors', async () => {
      render(<Login />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });
});

describe('Calculation Components', () => {
  describe('CalculationForm Component', () => {
    it('renders calculation form correctly', () => {
      render(<CalculationForm />);
      expect(screen.getByRole('heading')).toHaveTextContent('Einstein Field Equations');
      expect(screen.getByLabelText('Metric Type')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('Calculate');
    });

    it('handles form submission with valid inputs', async () => {
      const mockCalculate = jest.fn();
      render(<CalculationForm onCalculate={mockCalculate} />);
      
      fireEvent.change(screen.getByLabelText('Metric Type'), {
        target: { value: 'schwarzschild' },
      });
      fireEvent.click(screen.getByRole('button'));
      
      expect(mockCalculate).toHaveBeenCalledWith({
        type: 'schwarzschild',
      });
    });

    it('validates required fields', async () => {
      render(<CalculationForm />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByText('Metric type is required')).toBeInTheDocument();
    });
  });
});

describe('Visualization Components', () => {
  describe('ResultsVisualization Component', () => {
    const mockData = {
      metric: 'schwarzschild',
      components: {
        g00: '-1',
        g11: '1/(1-2M/r)',
      },
    };

    it('renders visualization correctly', () => {
      render(<ResultsVisualization data={mockData} />);
      expect(screen.getByRole('heading')).toHaveTextContent('Results');
      expect(screen.getByText('Metric: schwarzschild')).toBeInTheDocument();
    });

    it('displays metric components', () => {
      render(<ResultsVisualization data={mockData} />);
      expect(screen.getByText('g₀₀ = -1')).toBeInTheDocument();
      expect(screen.getByText('g₁₁ = 1/(1-2M/r)')).toBeInTheDocument();
    });

    it('handles empty data gracefully', () => {
      render(<ResultsVisualization data={null} />);
      expect(screen.getByText('No results available')).toBeInTheDocument();
    });
  });
}); 