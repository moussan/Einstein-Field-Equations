import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Einstein Field Equations Platform</h3>
          <p>
            Explore, calculate, and visualize the fundamental equations of general relativity.
          </p>
        </div>
        
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/calculator">Calculator</Link></li>
            <li><Link to="/visualizer">Visualizer</Link></li>
            <li><Link to="/documentation">Documentation</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Contact</h3>
          <p>
            Email: contact@einsteinequations.org<br />
            Twitter: @EinsteinEqns<br />
            GitHub: github.com/einstein-field-equations
          </p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Einstein Field Equations Platform. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 