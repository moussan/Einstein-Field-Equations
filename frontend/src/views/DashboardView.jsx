import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { calculationsAPI } from '../utils/api';
import { formatDate } from '../utils/helpers';

const DashboardView = () => {
  const { currentUser } = useAuth();
  const [recentCalculations, setRecentCalculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Calculation types for quick access
  const calculationTypes = [
    {
      title: 'Einstein Field Equations',
      description: 'Solve the vacuum and matter-inclusive Einstein field equations',
      path: '/calculate/efe',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: 'Schwarzschild Metric',
      description: 'Explore the spacetime around non-rotating black holes',
      path: '/calculate/exact-solutions/schwarzschild',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
      )
    },
    {
      title: 'Kerr Metric',
      description: 'Analyze the spacetime around rotating black holes',
      path: '/calculate/exact-solutions/kerr',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      title: 'FLRW Metric',
      description: 'Study the expanding universe with the Friedmann-Lemaître-Robertson-Walker metric',
      path: '/calculate/exact-solutions/flrw',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Christoffel Symbols',
      description: 'Calculate the connection coefficients for a given metric',
      path: '/calculate/tensors/christoffel',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'Geodesic Equations',
      description: 'Solve for the paths of particles and light in curved spacetime',
      path: '/calculate/tensors/geodesic',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ];

  // Fetch recent calculations
  useEffect(() => {
    const fetchRecentCalculations = async () => {
      try {
        setLoading(true);
        const response = await calculationsAPI.getCalculations(1, 5);
        setRecentCalculations(response.data.calculations || []);
      } catch (err) {
        console.error('Error fetching recent calculations:', err);
        setError('Failed to load recent calculations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentCalculations();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome section */}
      <div className="bg-background-paper rounded-lg shadow-dark-md p-6 mb-8">
        <h1 className="text-2xl font-bold text-text-primary">
          Welcome back, {currentUser?.displayName || currentUser?.email || 'User'}
        </h1>
        <p className="text-text-secondary mt-2">
          Continue your exploration of general relativity with the Einstein Field Equations Computational Platform.
        </p>
      </div>

      {/* Quick access grid */}
      <h2 className="text-xl font-bold text-text-primary mb-4">Quick Access</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {calculationTypes.map((type, index) => (
          <Link 
            key={index} 
            to={type.path}
            className="bg-background-paper rounded-lg shadow-dark-md p-6 hover:shadow-dark-lg transition-shadow duration-300"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 text-primary">
                {type.icon}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-text-primary">{type.title}</h3>
                <p className="text-sm text-text-secondary mt-1">{type.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent calculations */}
      <div className="bg-background-paper rounded-lg shadow-dark-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-text-primary">Recent Calculations</h2>
          <Link to="/calculations" className="text-primary hover:text-primary-light text-sm">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900 bg-opacity-20 border border-red-800 text-red-400 px-4 py-3 rounded-md">
            {error}
          </div>
        ) : recentCalculations.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <p>You haven't performed any calculations yet.</p>
            <Link to="/calculate" className="btn btn-primary mt-4">
              Start a New Calculation
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {recentCalculations.map((calculation) => (
                  <tr key={calculation.id} className="hover:bg-background-light">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {calculation.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {calculation.description || 'No description'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {formatDate(calculation.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link 
                        to={`/calculations/${calculation.id}`}
                        className="text-primary hover:text-primary-light mr-4"
                      >
                        View
                      </Link>
                      <Link 
                        to={`/calculate/${calculation.type.toLowerCase()}?clone=${calculation.id}`}
                        className="text-primary hover:text-primary-light"
                      >
                        Clone
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView; 