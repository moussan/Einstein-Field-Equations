import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import styles
import './styles/main.css';
import './styles/theme.css';

// Import components
import Header from './components/Common/Header';
import Footer from './components/Common/Footer';
import Sidebar from './components/Common/Sidebar';

// Import views
import LandingPage from './views/LandingPage';
import DashboardView from './views/DashboardView';
import CalculationView from './views/CalculationView';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import PasswordReset from './components/Auth/PasswordReset';

// Auth context
import { AuthProvider, useAuth } from './utils/AuthContext';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <Router>
      <div className="flex h-screen bg-background text-text-primary">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header toggleSidebar={toggleSidebar} />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<PasswordReset />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/calculate/:type?" 
                element={
                  <ProtectedRoute>
                    <CalculationView />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App; 