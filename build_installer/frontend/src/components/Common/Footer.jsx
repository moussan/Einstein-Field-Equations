import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-background-paper shadow-dark-md py-4 px-6 mt-auto">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo and copyright */}
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <span className="text-lg font-bold text-primary">EFECP</span>
              <span className="ml-2 text-text-secondary text-sm">Einstein Field Equations Computational Platform</span>
            </div>
            <p className="text-text-secondary text-xs mt-1">
              © {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
          
          {/* Links */}
          <div className="flex flex-wrap justify-center">
            <Link to="/about" className="text-text-secondary hover:text-primary text-sm mx-2 my-1">
              About
            </Link>
            <Link to="/resources" className="text-text-secondary hover:text-primary text-sm mx-2 my-1">
              Resources
            </Link>
            <Link to="/terms" className="text-text-secondary hover:text-primary text-sm mx-2 my-1">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-text-secondary hover:text-primary text-sm mx-2 my-1">
              Privacy Policy
            </Link>
            <a 
              href="https://github.com/your-repo/einstein-field-equations" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-text-secondary hover:text-primary text-sm mx-2 my-1"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 