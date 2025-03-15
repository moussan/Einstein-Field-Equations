import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  logout: () => api.post('/auth/logout'),
  resetPassword: (email) => api.post('/auth/reset-password', { email }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Calculations API calls
export const calculationsAPI = {
  // General calculations
  getCalculations: (page = 1, limit = 10) => 
    api.get(`/calculations?page=${page}&limit=${limit}`),
  getCalculation: (id) => api.get(`/calculations/${id}`),
  createCalculation: (data) => api.post('/calculations', data),
  updateCalculation: (id, data) => api.put(`/calculations/${id}`, data),
  deleteCalculation: (id) => api.delete(`/calculations/${id}`),
  
  // Specific EFE solvers
  solveVacuumEFE: (data) => api.post('/calculations/vacuum', data),
  solveMatterEFE: (data) => api.post('/calculations/matter', data),
  solveWeakFieldEFE: (data) => api.post('/calculations/weak-field', data),
  
  // Exact solutions
  solveSchwarzschildMetric: (data) => api.post('/calculations/schwarzschild', data),
  solveKerrMetric: (data) => api.post('/calculations/kerr', data),
  solveReissnerNordstromMetric: (data) => api.post('/calculations/reissner-nordstrom', data),
  solveKerrNewmanMetric: (data) => api.post('/calculations/kerr-newman', data),
  solveFLRWMetric: (data) => api.post('/calculations/flrw', data),
  
  // Tensor calculations
  calculateGeodesic: (data) => api.post('/calculations/geodesic', data),
  calculateChristoffelSymbols: (data) => api.post('/calculations/christoffel', data),
  calculateRicciTensor: (data) => api.post('/calculations/ricci-tensor', data),
  calculateRiemannTensor: (data) => api.post('/calculations/riemann-tensor', data),
  calculateWeylTensor: (data) => api.post('/calculations/weyl-tensor', data),
  evaluateEnergyConditions: (data) => api.post('/calculations/energy-conditions', data),
};

// Visualization API calls
export const visualizationsAPI = {
  getSpacetimeDiagram: (data) => api.post('/visualizations/spacetime-diagram', data),
  getGeodesicPlot: (data) => api.post('/visualizations/geodesic-plot', data),
  getBlackHoleVisualization: (data) => api.post('/visualizations/black-hole', data),
  getTensorFieldVisualization: (data) => api.post('/visualizations/tensor-field', data),
  exportVisualization: (id, format) => api.get(`/visualizations/${id}/export?format=${format}`),
};

// Export API calls
export const exportAPI = {
  exportToLatex: (id) => api.get(`/export/${id}/latex`),
  exportToJSON: (id) => api.get(`/export/${id}/json`),
  exportToCSV: (id) => api.get(`/export/${id}/csv`),
  exportToXML: (id) => api.get(`/export/${id}/xml`),
};

// Default export
export default {
  auth: authAPI,
  calculations: calculationsAPI,
  visualizations: visualizationsAPI,
  export: exportAPI,
}; 