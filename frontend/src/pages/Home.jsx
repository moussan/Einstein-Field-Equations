import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container">
      <div className="card">
        <h1>Einstein Field Equations Platform</h1>
        <p className="lead">
          Explore, calculate, and visualize the fundamental equations of general relativity
        </p>
        <div className="grid" style={{ marginTop: '2rem' }}>
          <div className="card">
            <h3>Calculator</h3>
            <p>
              Solve Einstein Field Equations for various spacetime metrics and physical scenarios.
            </p>
            <Link to="/calculator" className="btn btn-primary">
              Try Calculator
            </Link>
          </div>
          <div className="card">
            <h3>Visualizer</h3>
            <p>
              Visualize gravitational fields, spacetime curvature, and solutions to the Einstein Field Equations.
            </p>
            <Link to="/visualizer" className="btn btn-primary">
              Explore Visualizer
            </Link>
          </div>
          <div className="card">
            <h3>Documentation</h3>
            <p>
              Learn about the theory behind Einstein Field Equations and how to use this platform.
            </p>
            <Link to="/documentation" className="btn btn-primary">
              Read Docs
            </Link>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2>What are Einstein Field Equations?</h2>
        <p>
          The Einstein Field Equations (EFE) are a set of 10 equations in Albert Einstein's general theory of relativity 
          that describe the fundamental interaction of gravitation as a result of spacetime being curved by mass and energy.
        </p>
        <p>
          The equations are written as: G<sub>μν</sub> = 8πG/c<sup>4</sup> T<sub>μν</sub>
        </p>
        <p>
          Where G<sub>μν</sub> is the Einstein tensor describing spacetime curvature, and T<sub>μν</sub> is the 
          stress-energy tensor describing the energy and momentum of matter and radiation.
        </p>
      </div>
    </div>
  );
};

export default Home; 