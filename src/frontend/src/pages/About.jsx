import React from 'react';

const About = () => {
  return (
    <div className="container">
      <div className="card">
        <h1>About the Einstein Field Equations Platform</h1>
        <p>
          The Einstein Field Equations Platform is a comprehensive tool for exploring, calculating, and visualizing 
          the fundamental equations of general relativity. This platform is designed for physicists, astronomers, 
          students, and anyone interested in understanding the mathematical framework that describes gravity as a 
          geometric property of spacetime.
        </p>
        
        <h2>Our Mission</h2>
        <p>
          Our mission is to make the complex mathematics of general relativity more accessible and intuitive through 
          interactive tools and visualizations. We aim to bridge the gap between theoretical physics and practical 
          understanding by providing a platform that allows users to explore the implications of Einstein's revolutionary 
          theory in a hands-on way.
        </p>
        
        <h2>Features</h2>
        <div className="grid">
          <div className="card">
            <h3>Calculator</h3>
            <p>
              Our calculator allows users to compute metric components, curvature tensors, and other quantities for 
              various spacetime metrics, including Schwarzschild, Kerr, and FLRW metrics. Users can adjust parameters 
              to model different physical scenarios and see how the mathematics of general relativity describes them.
            </p>
          </div>
          
          <div className="card">
            <h3>Visualizer</h3>
            <p>
              The visualizer provides interactive representations of spacetime curvature, gravitational fields, and 
              geodesic paths. These visualizations help users develop an intuitive understanding of how mass and energy 
              curve spacetime and how this curvature affects the motion of objects.
            </p>
          </div>
          
          <div className="card">
            <h3>Documentation</h3>
            <p>
              Our comprehensive documentation includes theoretical background, step-by-step guides for using the platform, 
              API documentation for programmatic access, and references to further resources for those who want to deepen 
              their understanding of general relativity.
            </p>
          </div>
        </div>
        
        <h2>The Team</h2>
        <div className="grid">
          <div className="card">
            <h3>Dr. Jane Smith</h3>
            <p>
              <strong>Lead Physicist</strong><br />
              Ph.D. in Theoretical Physics from MIT<br />
              Specializes in general relativity and quantum gravity
            </p>
          </div>
          
          <div className="card">
            <h3>Dr. Michael Johnson</h3>
            <p>
              <strong>Lead Developer</strong><br />
              Ph.D. in Computer Science from Stanford<br />
              Expert in scientific visualization and computational physics
            </p>
          </div>
          
          <div className="card">
            <h3>Dr. Sarah Chen</h3>
            <p>
              <strong>Educational Director</strong><br />
              Ph.D. in Physics Education from Harvard<br />
              Specializes in making complex physics concepts accessible
            </p>
          </div>
        </div>
        
        <h2>Technical Details</h2>
        <p>
          The Einstein Field Equations Platform is built using modern web technologies:
        </p>
        <ul>
          <li><strong>Frontend:</strong> React, Three.js for 3D visualizations</li>
          <li><strong>Backend:</strong> Python with FastAPI, NumPy, and SciPy for calculations</li>
          <li><strong>Database:</strong> PostgreSQL for storing user data and calculation results</li>
        </ul>
        <p>
          All calculations are performed using high-precision numerical methods to ensure accuracy. The visualizations 
          are based on simplified models that capture the essential features of general relativity while remaining 
          computationally efficient for interactive use.
        </p>
        
        <h2>Contact Us</h2>
        <p>
          We welcome feedback, suggestions, and questions about the Einstein Field Equations Platform. Please contact us at:
        </p>
        <p>
          <strong>Email:</strong> contact@einsteinequations.org<br />
          <strong>Twitter:</strong> @EinsteinEqns<br />
          <strong>GitHub:</strong> github.com/einstein-field-equations
        </p>
        
        <h2>Acknowledgments</h2>
        <p>
          We would like to thank the following organizations for their support:
        </p>
        <ul>
          <li>The National Science Foundation</li>
          <li>The American Physical Society</li>
          <li>The International Center for Theoretical Physics</li>
        </ul>
        <p>
          We also acknowledge the countless physicists and mathematicians whose work over the past century has deepened 
          our understanding of general relativity, from Einstein himself to contemporary researchers pushing the boundaries 
          of our knowledge of spacetime and gravity.
        </p>
      </div>
    </div>
  );
};

export default About; 