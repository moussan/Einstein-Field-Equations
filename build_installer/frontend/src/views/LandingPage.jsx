import React from 'react';
import { Link } from 'react-router-dom';
import { renderLatex } from '../utils/helpers';

const LandingPage = () => {
  // Einstein Field Equations in LaTeX
  const einsteinEquation = "G_{\\mu\\nu} = 8\\pi G T_{\\mu\\nu}";
  const expandedEquation = "R_{\\mu\\nu} - \\frac{1}{2}R g_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\\mu\\nu}";
  
  // Features list
  const features = [
    {
      title: "Vacuum Solutions",
      description: "Solve Einstein's field equations in vacuum, where the stress-energy tensor is zero.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
        </svg>
      )
    },
    {
      title: "Exact Metrics",
      description: "Explore exact solutions like Schwarzschild, Kerr, and FLRW metrics.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      )
    },
    {
      title: "Tensor Calculations",
      description: "Calculate Christoffel symbols, Ricci tensor, Riemann tensor, and more.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      )
    },
    {
      title: "Interactive Visualizations",
      description: "Visualize spacetime diagrams, geodesics, and black hole event horizons.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      )
    }
  ];

  return (
    <div className="bg-background">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-background to-background-light opacity-90"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight">
              Einstein Field Equations <br />
              <span className="text-primary">Computational Platform</span>
            </h1>
            
            <p className="mt-6 max-w-2xl mx-auto text-xl text-text-secondary">
              A powerful tool for solving and visualizing Einstein's field equations in general relativity.
            </p>
            
            <div className="mt-10 flex justify-center">
              <div 
                className="text-2xl md:text-3xl text-text-primary font-math p-4 bg-background-paper rounded-lg shadow-dark-md"
                dangerouslySetInnerHTML={{ __html: renderLatex(expandedEquation, true) }}
              ></div>
            </div>
            
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup" className="btn btn-primary px-8 py-3 text-lg font-medium">
                Get Started
              </Link>
              <Link to="/resources" className="btn btn-outline px-8 py-3 text-lg font-medium">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features section */}
      <div className="py-16 bg-background-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-text-primary">
              Powerful Features for General Relativity
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">
              Explore the mathematics of curved spacetime with our comprehensive suite of tools.
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-background rounded-lg p-6 shadow-dark-md hover:shadow-dark-lg transition-shadow duration-300">
                <div className="text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Call to action */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary bg-opacity-10 rounded-2xl shadow-dark-lg overflow-hidden">
            <div className="px-6 py-12 md:p-12 md:flex md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary">
                  Ready to explore general relativity?
                </h2>
                <p className="mt-3 max-w-3xl text-lg text-text-secondary">
                  Sign up now to access all features and start solving Einstein's field equations.
                </p>
              </div>
              <div className="mt-8 md:mt-0 flex flex-shrink-0">
                <Link to="/signup" className="btn btn-primary px-8 py-3 text-lg font-medium">
                  Sign Up Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 