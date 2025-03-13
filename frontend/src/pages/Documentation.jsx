import React, { useState } from 'react';

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('introduction');

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Einstein Field Equations Documentation</h1>
        <p>
          Comprehensive documentation on the theory behind Einstein Field Equations and how to use this platform.
        </p>
        
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <div style={{ width: '250px', flexShrink: 0 }}>
            <div className="card">
              <h3>Contents</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li>
                  <button
                    className={`btn ${activeSection === 'introduction' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ width: '100%', marginBottom: '10px', textAlign: 'left' }}
                    onClick={() => handleSectionChange('introduction')}
                  >
                    Introduction
                  </button>
                </li>
                <li>
                  <button
                    className={`btn ${activeSection === 'theory' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ width: '100%', marginBottom: '10px', textAlign: 'left' }}
                    onClick={() => handleSectionChange('theory')}
                  >
                    Theoretical Background
                  </button>
                </li>
                <li>
                  <button
                    className={`btn ${activeSection === 'calculator' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ width: '100%', marginBottom: '10px', textAlign: 'left' }}
                    onClick={() => handleSectionChange('calculator')}
                  >
                    Using the Calculator
                  </button>
                </li>
                <li>
                  <button
                    className={`btn ${activeSection === 'visualizer' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ width: '100%', marginBottom: '10px', textAlign: 'left' }}
                    onClick={() => handleSectionChange('visualizer')}
                  >
                    Using the Visualizer
                  </button>
                </li>
                <li>
                  <button
                    className={`btn ${activeSection === 'api' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ width: '100%', marginBottom: '10px', textAlign: 'left' }}
                    onClick={() => handleSectionChange('api')}
                  >
                    API Documentation
                  </button>
                </li>
                <li>
                  <button
                    className={`btn ${activeSection === 'references' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ width: '100%', marginBottom: '10px', textAlign: 'left' }}
                    onClick={() => handleSectionChange('references')}
                  >
                    References
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <div className="card">
              {activeSection === 'introduction' && (
                <div>
                  <h2>Introduction to Einstein Field Equations</h2>
                  <p>
                    The Einstein Field Equations (EFE) are a set of 10 equations in Albert Einstein's general theory of relativity 
                    that describe the fundamental interaction of gravitation as a result of spacetime being curved by mass and energy.
                  </p>
                  <p>
                    The equations are written as:
                  </p>
                  <div style={{ textAlign: 'center', margin: '20px 0', fontSize: '1.2rem' }}>
                    G<sub>μν</sub> = 8πG/c<sup>4</sup> T<sub>μν</sub>
                  </div>
                  <p>
                    Where:
                  </p>
                  <ul>
                    <li>G<sub>μν</sub> is the Einstein tensor, which describes the curvature of spacetime</li>
                    <li>G is Newton's gravitational constant</li>
                    <li>c is the speed of light in vacuum</li>
                    <li>T<sub>μν</sub> is the stress-energy tensor, which describes the energy and momentum of matter and radiation</li>
                  </ul>
                  <p>
                    This platform provides tools to explore, calculate, and visualize solutions to the Einstein Field Equations
                    for various spacetime metrics and physical scenarios.
                  </p>
                </div>
              )}
              
              {activeSection === 'theory' && (
                <div>
                  <h2>Theoretical Background</h2>
                  <h3>General Relativity</h3>
                  <p>
                    General relativity is Albert Einstein's theory of gravitation, published in 1915. The theory describes 
                    gravity not as a force, but as a consequence of the curvature of spacetime caused by the uneven distribution 
                    of mass and energy.
                  </p>
                  <h3>Spacetime and Metrics</h3>
                  <p>
                    In general relativity, spacetime is represented as a four-dimensional manifold with a metric tensor g<sub>μν</sub> 
                    that defines the geometry of spacetime. The metric tensor determines how distances and angles are measured in spacetime.
                  </p>
                  <h3>Einstein Tensor</h3>
                  <p>
                    The Einstein tensor G<sub>μν</sub> is defined as:
                  </p>
                  <div style={{ textAlign: 'center', margin: '20px 0', fontSize: '1.2rem' }}>
                    G<sub>μν</sub> = R<sub>μν</sub> - (1/2)Rg<sub>μν</sub>
                  </div>
                  <p>
                    Where:
                  </p>
                  <ul>
                    <li>R<sub>μν</sub> is the Ricci curvature tensor</li>
                    <li>R is the Ricci scalar (the trace of the Ricci tensor)</li>
                    <li>g<sub>μν</sub> is the metric tensor</li>
                  </ul>
                  <h3>Stress-Energy Tensor</h3>
                  <p>
                    The stress-energy tensor T<sub>μν</sub> describes the density and flux of energy and momentum in spacetime. 
                    It includes contributions from all forms of energy and matter, including electromagnetic fields, fluids, and particles.
                  </p>
                  <h3>Common Metrics</h3>
                  <p>
                    Several important metrics are used to describe different spacetime geometries:
                  </p>
                  <ul>
                    <li><strong>Schwarzschild Metric:</strong> Describes the spacetime geometry around a non-rotating, spherically symmetric mass.</li>
                    <li><strong>Kerr Metric:</strong> Describes the spacetime geometry around a rotating mass.</li>
                    <li><strong>FLRW Metric:</strong> Describes a homogeneous, isotropic expanding or contracting universe.</li>
                  </ul>
                </div>
              )}
              
              {activeSection === 'calculator' && (
                <div>
                  <h2>Using the Calculator</h2>
                  <p>
                    The Einstein Field Equations Calculator allows you to compute metric components, curvature tensors, 
                    and other quantities for various spacetime metrics.
                  </p>
                  <h3>Step 1: Select a Metric</h3>
                  <p>
                    Choose from one of the available metrics:
                  </p>
                  <ul>
                    <li><strong>Schwarzschild Metric:</strong> For non-rotating, spherically symmetric masses like non-rotating black holes or stars.</li>
                    <li><strong>Kerr Metric:</strong> For rotating masses like rotating black holes or stars.</li>
                    <li><strong>FLRW Metric:</strong> For cosmological calculations in an expanding universe.</li>
                  </ul>
                  <h3>Step 2: Set Parameters</h3>
                  <p>
                    Adjust the parameters according to the physical scenario you want to model:
                  </p>
                  <ul>
                    <li><strong>Mass:</strong> The mass of the central object in solar masses (M☉).</li>
                    <li><strong>Radius:</strong> The distance from the central object in kilometers.</li>
                    <li><strong>Theta:</strong> The polar angle in spherical coordinates (in radians).</li>
                    <li><strong>Phi:</strong> The azimuthal angle in spherical coordinates (in radians).</li>
                  </ul>
                  <h3>Step 3: Calculate Results</h3>
                  <p>
                    Click the "Calculate" button to compute the results. The calculator will display:
                  </p>
                  <ul>
                    <li><strong>Metric Components:</strong> The components of the metric tensor g<sub>μν</sub>.</li>
                    <li><strong>Ricci Scalar:</strong> A measure of the curvature of spacetime.</li>
                    <li><strong>Event Horizon:</strong> For black hole metrics, the radius of the event horizon.</li>
                    <li><strong>Hubble Parameter:</strong> For cosmological metrics, the rate of expansion of the universe.</li>
                  </ul>
                </div>
              )}
              
              {activeSection === 'visualizer' && (
                <div>
                  <h2>Using the Visualizer</h2>
                  <p>
                    The Einstein Field Equations Visualizer provides interactive visualizations of spacetime curvature, 
                    gravitational fields, and geodesic paths.
                  </p>
                  <h3>Visualization Types</h3>
                  <p>
                    Choose from one of the available visualization types:
                  </p>
                  <ul>
                    <li>
                      <strong>Spacetime Curvature:</strong> Visualizes how mass curves spacetime according to Einstein's General Relativity. 
                      The grid represents spacetime, and the curvature shows how the presence of mass affects the geometry of spacetime.
                    </li>
                    <li>
                      <strong>Gravitational Field:</strong> Visualizes the gravitational field around a massive object. 
                      The arrows represent the direction and strength of the gravitational force at different points.
                    </li>
                    <li>
                      <strong>Geodesic Paths:</strong> Visualizes geodesic paths around a massive object. 
                      Geodesics are the paths that objects follow when moving through curved spacetime.
                    </li>
                  </ul>
                  <h3>Adjusting Parameters</h3>
                  <p>
                    Use the sliders to adjust the parameters of the visualization:
                  </p>
                  <ul>
                    <li><strong>Mass:</strong> Controls the mass of the central object, affecting the strength of spacetime curvature.</li>
                    <li><strong>Grid Resolution/Arrow Density:</strong> Controls the detail level of the visualization.</li>
                    <li><strong>Initial Radius:</strong> For geodesic paths, controls the starting distance from the central mass.</li>
                  </ul>
                  <h3>Interpreting the Visualization</h3>
                  <p>
                    The blue circle at the center represents the massive object. For black holes, the red circle represents the event horizon, 
                    where the escape velocity equals the speed of light. The curvature of the grid or the direction of arrows shows how 
                    spacetime is curved by the presence of mass.
                  </p>
                </div>
              )}
              
              {activeSection === 'api' && (
                <div>
                  <h2>API Documentation</h2>
                  <p>
                    The Einstein Field Equations Platform provides a RESTful API for programmatic access to calculations and visualizations.
                  </p>
                  <h3>Authentication</h3>
                  <p>
                    API requests require authentication using an API key. Include the API key in the request header:
                  </p>
                  <pre style={{ background: '#2a2a2a', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
                    {`Authorization: Bearer YOUR_API_KEY`}
                  </pre>
                  <h3>Endpoints</h3>
                  <h4>Calculate Metric</h4>
                  <pre style={{ background: '#2a2a2a', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
                    {`POST /api/calculate
Content-Type: application/json

{
  "metric": "schwarzschild",
  "parameters": {
    "mass": 1.0,
    "radius": 10.0,
    "theta": 1.5708,
    "phi": 0
  }
}`}
                  </pre>
                  <h4>Generate Visualization</h4>
                  <pre style={{ background: '#2a2a2a', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
                    {`POST /api/visualize
Content-Type: application/json

{
  "type": "spacetime",
  "parameters": {
    "mass": 1.0,
    "resolution": 50
  },
  "format": "png",
  "width": 800,
  "height": 800
}`}
                  </pre>
                  <h3>Rate Limits</h3>
                  <p>
                    API requests are limited to 100 requests per hour per API key. If you exceed this limit, 
                    you will receive a 429 Too Many Requests response.
                  </p>
                </div>
              )}
              
              {activeSection === 'references' && (
                <div>
                  <h2>References</h2>
                  <h3>Books</h3>
                  <ul>
                    <li>Einstein, A. (1916). "The Foundation of the General Theory of Relativity"</li>
                    <li>Misner, C. W., Thorne, K. S., & Wheeler, J. A. (1973). "Gravitation"</li>
                    <li>Wald, R. M. (1984). "General Relativity"</li>
                    <li>Carroll, S. M. (2004). "Spacetime and Geometry: An Introduction to General Relativity"</li>
                  </ul>
                  <h3>Papers</h3>
                  <ul>
                    <li>Einstein, A. (1915). "Die Feldgleichungen der Gravitation"</li>
                    <li>Schwarzschild, K. (1916). "Über das Gravitationsfeld eines Massenpunktes nach der Einsteinschen Theorie"</li>
                    <li>Kerr, R. P. (1963). "Gravitational Field of a Spinning Mass as an Example of Algebraically Special Metrics"</li>
                    <li>Friedmann, A. (1922). "Über die Krümmung des Raumes"</li>
                  </ul>
                  <h3>Online Resources</h3>
                  <ul>
                    <li><a href="https://en.wikipedia.org/wiki/Einstein_field_equations" target="_blank" rel="noopener noreferrer">Wikipedia: Einstein Field Equations</a></li>
                    <li><a href="https://physics.stackexchange.com/" target="_blank" rel="noopener noreferrer">Physics Stack Exchange</a></li>
                    <li><a href="https://arxiv.org/archive/gr-qc" target="_blank" rel="noopener noreferrer">arXiv: General Relativity and Quantum Cosmology</a></li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation; 