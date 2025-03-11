import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setError('');
      setMessage('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your email for password reset instructions');
    } catch (err) {
      setError('Failed to reset password. Please check if your email is correct.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-background-paper p-8 rounded-lg shadow-dark-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-text-primary">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>
        
        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-800 text-red-400 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-green-900 bg-opacity-20 border border-green-800 text-green-400 px-4 py-3 rounded-md">
            {message}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email-address" className="sr-only">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input w-full rounded-md"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full flex justify-center"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Reset Password'
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <Link to="/login" className="text-primary hover:text-primary-light text-sm">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset; 