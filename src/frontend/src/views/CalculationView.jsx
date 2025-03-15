import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { calculationsAPI } from '../utils/api';
import { renderLatex } from '../utils/helpers';

// Import calculation components (to be implemented)
const CalculationComponents = {
  efe: React.lazy(() => import('../components/Calculation/EinsteinFieldEquations')),
  schwarzschild: React.lazy(() => import('../components/Calculation/Schwarzschild')),
  kerr: React.lazy(() => import('../components/Calculation/Kerr')),
  reissnerNordstrom: React.lazy(() => import('../components/Calculation/ReissnerNordstrom')),
  kerrNewman: React.lazy(() => import('../components/Calculation/KerrNewman')),
  flrw: React.lazy(() => import('../components/Calculation/FLRW')),
  christoffel: React.lazy(() => import('../components/Calculation/Christoffel')),
  geodesic: React.lazy(() => import('../components/Calculation/Geodesic')),
  ricci: React.lazy(() => import('../components/Calculation/Ricci')),
  riemann: React.lazy(() => import('../components/Calculation/Riemann')),
  weyl: React.lazy(() => import('../components/Calculation/Weyl')),
  energyConditions: React.lazy(() => import('../components/Calculation/EnergyConditions')),
};

// Placeholder component for calculation types that are not yet implemented
const PlaceholderCalculation = ({ type }) => (
  <div className="bg-background-paper rounded-lg shadow-dark-md p-6">
    <h2 className="text-2xl font-bold text-text-primary mb-4">
      {type.charAt(0).toUpperCase() + type.slice(1)} Calculation
    </h2>
    <div className="bg-primary bg-opacity-10 border border-primary-dark rounded-md p-4 mb-6">
      <p className="text-text-primary">
        This calculation type is currently under development. Please check back soon!
      </p>
    </div>
    
    <div className="mt-8">
      <h3 className="text-xl font-bold text-text-primary mb-4">About this calculation</h3>
      <p className="text-text-secondary mb-4">
        This module will allow you to perform calculations related to the {type} aspect of general relativity.
      </p>
      
      {type === 'efe' && (
        <div className="mt-4">
          <h4 className="text-lg font-medium text-text-primary mb-2">Einstein Field Equations</h4>
          <div 
            className="text-xl text-text-primary font-math p-4 bg-background rounded-lg shadow-dark-sm"
            dangerouslySetInnerHTML={{ 
              __html: renderLatex("G_{\\mu\\nu} = 8\\pi G T_{\\mu\\nu}", true) 
            }}
          ></div>
          <p className="text-text-secondary mt-4">
            The Einstein field equations relate the geometry of spacetime (left side) to the distribution of matter and energy (right side).
          </p>
        </div>
      )}
      
      {type === 'schwarzschild' && (
        <div className="mt-4">
          <h4 className="text-lg font-medium text-text-primary mb-2">Schwarzschild Metric</h4>
          <div 
            className="text-xl text-text-primary font-math p-4 bg-background rounded-lg shadow-dark-sm"
            dangerouslySetInnerHTML={{ 
              __html: renderLatex("ds^2 = -\\left(1-\\frac{2GM}{rc^2}\\right)c^2dt^2 + \\left(1-\\frac{2GM}{rc^2}\\right)^{-1}dr^2 + r^2d\\Omega^2", true) 
            }}
          ></div>
          <p className="text-text-secondary mt-4">
            The Schwarzschild metric describes the spacetime geometry around a non-rotating, spherically symmetric mass.
          </p>
        </div>
      )}
    </div>
  </div>
);

const CalculationView = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calculationData, setCalculationData] = useState(null);

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const cloneId = queryParams.get('clone');

  // Determine which calculation component to render
  const getCalculationComponent = () => {
    if (!type) {
      return (
        <div className="bg-background-paper rounded-lg shadow-dark-md p-6">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Select a Calculation Type
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(CalculationComponents).map((calcType) => (
              <button
                key={calcType}
                onClick={() => navigate(`/calculate/${calcType}`)}
                className="bg-background rounded-lg p-6 shadow-dark-md hover:shadow-dark-lg transition-shadow duration-300 text-left"
              >
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {calcType.charAt(0).toUpperCase() + calcType.slice(1).replace(/([A-Z])/g, ' $1')}
                </h3>
                <p className="text-sm text-text-secondary">
                  {getCalculationDescription(calcType)}
                </p>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // For now, use the placeholder component for all calculation types
    return <PlaceholderCalculation type={type} />;

    // Once the actual components are implemented, use this:
    // const Component = CalculationComponents[type] || PlaceholderCalculation;
    // return <Component calculationData={calculationData} setCalculationData={setCalculationData} />;
  };

  // Helper function to get description for each calculation type
  const getCalculationDescription = (calcType) => {
    const descriptions = {
      efe: "Solve the Einstein Field Equations for various scenarios",
      schwarzschild: "Explore the spacetime around non-rotating black holes",
      kerr: "Analyze the spacetime around rotating black holes",
      reissnerNordstrom: "Study charged, non-rotating black holes",
      kerrNewman: "Examine charged, rotating black holes",
      flrw: "Investigate the expanding universe model",
      christoffel: "Calculate the connection coefficients for a given metric",
      geodesic: "Solve for the paths of particles and light in curved spacetime",
      ricci: "Compute the Ricci tensor and scalar curvature",
      riemann: "Evaluate the Riemann curvature tensor",
      weyl: "Calculate the Weyl tensor for conformal properties",
      energyConditions: "Check the energy conditions for physical validity"
    };
    
    return descriptions[calcType] || "Perform calculations related to general relativity";
  };

  // Load calculation data if cloning an existing calculation
  useEffect(() => {
    if (cloneId && type) {
      const fetchCalculationData = async () => {
        try {
          setLoading(true);
          const response = await calculationsAPI.getCalculation(cloneId);
          setCalculationData(response.data);
        } catch (err) {
          console.error('Error fetching calculation data:', err);
          setError('Failed to load the calculation data. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      fetchCalculationData();
    }
  }, [cloneId, type]);

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900 bg-opacity-20 border border-red-800 text-red-400 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      ) : (
        <React.Suspense fallback={
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        }>
          {getCalculationComponent()}
        </React.Suspense>
      )}
    </div>
  );
};

export default CalculationView;