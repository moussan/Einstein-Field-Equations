import React, { useState } from 'react';

const Calculator = () => {
  const [metric, setMetric] = useState('schwarzschild');
  const [parameters, setParameters] = useState({
    mass: 1.0,
    radius: 10.0,
    theta: Math.PI / 2,
    phi: 0
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleMetricChange = (e) => {
    setMetric(e.target.value);
    // Reset results when changing metric
    setResults(null);
  };

  const handleParameterChange = (e) => {
    const { name, value } = e.target;
    setParameters({
      ...parameters,
      [name]: parseFloat(value)
    });
    // Reset results when changing parameters
    setResults(null);
  };

  const calculateResults = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real application, this would be an API call to the backend
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let simulatedResults;
      
      if (metric === 'schwarzschild') {
        const { mass, radius } = parameters;
        const G = 6.67430e-11; // Gravitational constant
        const c = 299792458; // Speed of light
        
        // Schwarzschild metric components
        const g_tt = -(1 - (2 * G * mass) / (c * c * radius));
        const g_rr = 1 / (1 - (2 * G * mass) / (c * c * radius));
        const g_theta_theta = radius * radius;
        const g_phi_phi = radius * radius * Math.sin(parameters.theta) * Math.sin(parameters.theta);
        
        simulatedResults = {
          metricComponents: {
            g_tt,
            g_rr,
            g_theta_theta,
            g_phi_phi
          },
          ricciscalar: (2 * G * mass) / (c * c * radius * radius * radius),
          eventHorizon: (2 * G * mass) / (c * c)
        };
      } else if (metric === 'kerr') {
        // Simplified Kerr metric calculation (not physically accurate)
        simulatedResults = {
          metricComponents: {
            g_tt: -0.8,
            g_rr: 1.2,
            g_theta_theta: parameters.radius * parameters.radius,
            g_phi_phi: parameters.radius * parameters.radius * Math.sin(parameters.theta) * Math.sin(parameters.theta)
          },
          ricciscalar: 0.05,
          eventHorizon: parameters.mass * 2
        };
      } else {
        // FLRW metric (simplified)
        simulatedResults = {
          metricComponents: {
            g_tt: -1,
            g_rr: parameters.radius * parameters.radius,
            g_theta_theta: parameters.radius * parameters.radius,
            g_phi_phi: parameters.radius * parameters.radius * Math.sin(parameters.theta) * Math.sin(parameters.theta)
          },
          ricciscalar: 0.1,
          hubbleParameter: 70 // km/s/Mpc
        };
      }
      
      setResults(simulatedResults);
    } catch (err) {
      setError('Error calculating results. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Einstein Field Equations Calculator</h1>
        <p>
          Calculate metric components, curvature tensors, and other quantities for various spacetime metrics.
        </p>
        
        <div className="form-group">
          <label htmlFor="metric">Select Metric:</label>
          <select
            id="metric"
            className="form-control"
            value={metric}
            onChange={handleMetricChange}
          >
            <option value="schwarzschild">Schwarzschild Metric</option>
            <option value="kerr">Kerr Metric</option>
            <option value="flrw">FLRW Metric</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="mass">Mass (M☉):</label>
          <input
            type="number"
            id="mass"
            name="mass"
            className="form-control"
            value={parameters.mass}
            onChange={handleParameterChange}
            step="0.1"
            min="0.1"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="radius">Radius (km):</label>
          <input
            type="number"
            id="radius"
            name="radius"
            className="form-control"
            value={parameters.radius}
            onChange={handleParameterChange}
            step="0.1"
            min="0.1"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="theta">Theta (radians):</label>
          <input
            type="number"
            id="theta"
            name="theta"
            className="form-control"
            value={parameters.theta}
            onChange={handleParameterChange}
            step="0.1"
            min="0"
            max={Math.PI}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phi">Phi (radians):</label>
          <input
            type="number"
            id="phi"
            name="phi"
            className="form-control"
            value={parameters.phi}
            onChange={handleParameterChange}
            step="0.1"
            min="0"
            max={2 * Math.PI}
          />
        </div>
        
        <button
          className="btn btn-primary"
          onClick={calculateResults}
          disabled={loading}
        >
          {loading ? 'Calculating...' : 'Calculate'}
        </button>
        
        {error && (
          <div className="card" style={{ marginTop: '20px', backgroundColor: '#ff6b6b', color: 'white' }}>
            <p>{error}</p>
          </div>
        )}
        
        {results && (
          <div className="card" style={{ marginTop: '20px' }}>
            <h2>Results</h2>
            <h3>Metric Components</h3>
            <div className="grid">
              <div>
                <p>g<sub>tt</sub> = {results.metricComponents.g_tt.toExponential(4)}</p>
                <p>g<sub>rr</sub> = {results.metricComponents.g_rr.toExponential(4)}</p>
              </div>
              <div>
                <p>g<sub>θθ</sub> = {results.metricComponents.g_theta_theta.toExponential(4)}</p>
                <p>g<sub>φφ</sub> = {results.metricComponents.g_phi_phi.toExponential(4)}</p>
              </div>
            </div>
            
            <h3>Derived Quantities</h3>
            <p>Ricci Scalar: {results.ricciscalar.toExponential(4)}</p>
            
            {metric === 'schwarzschild' && (
              <p>Event Horizon: {results.eventHorizon.toExponential(4)} km</p>
            )}
            
            {metric === 'kerr' && (
              <p>Event Horizon: {results.eventHorizon.toExponential(4)} km</p>
            )}
            
            {metric === 'flrw' && (
              <p>Hubble Parameter: {results.hubbleParameter} km/s/Mpc</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Calculator; 