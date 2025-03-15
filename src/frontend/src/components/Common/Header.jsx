import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';

const Header = ({ toggleSidebar }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <header className="bg-background-paper shadow-dark-md z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and menu toggle */}
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="mr-4 text-text-primary hover:text-primary focus:outline-none md:hidden"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">EFECP</span>
              <span className="hidden md:inline-block ml-2 text-text-primary">Einstein Field Equations Platform</span>
            </Link>
          </div>
          
          {/* Right side - Navigation and user menu */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <Link to="/dashboard" className="hidden md:block text-text-primary hover:text-primary">
                  Dashboard
                </Link>
                <Link to="/calculate" className="hidden md:block text-text-primary hover:text-primary">
                  Calculate
                </Link>
                
                {/* User dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center text-text-primary hover:text-primary focus:outline-none"
                  >
                    <span className="hidden md:block mr-2">{currentUser.email}</span>
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                      {currentUser.email ? currentUser.email[0].toUpperCase() : 'U'}
                    </div>
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-background-paper rounded-md shadow-dark-lg py-1 z-20">
                      <Link 
                        to="/dashboard" 
                        className="block px-4 py-2 text-sm text-text-primary hover:bg-background-light"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-text-primary hover:bg-background-light"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <button 
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-light"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-text-primary hover:text-primary">
                  Sign in
                </Link>
                <Link to="/signup" className="btn btn-primary">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 