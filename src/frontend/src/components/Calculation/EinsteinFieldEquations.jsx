import React, { useState } from 'react';
import { renderLatex } from '../../utils/helpers';
import { calculationsAPI } from '../../utils/api';

const EinsteinFieldEquations = ({ calculationData, setCalculationData }) => {
  // State for form inputs
  const [formData, setFormData] = useState({
    calculationType: 'vacuum', // vacuum, matter, weak-field
    coordinates: 'spherical', // spherical, cartesian, cylindrical
    includeCosmologicalConstant: false,
    cosmologicalConstant: 0,
    mass: 1.0,
    description: '',
    ...calculationData // Merge with existing data if provided
  });
  
  // State for calculation results
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // In a real implementation, this would call the backend API
      // const response = await calculationsAPI.solveVacuumEFE(formData);
      // setResults(response.data);
      
      // For now, simulate a calculation result
      setTimeout(() => {
        const simulatedResults = {
          metric: formData.calculationType === 'vacuum' 
            ? "g_{\\mu\\nu} = \\begin{pmatrix} -\\left(1-\\frac{2GM}{rc^2}\\right) & 0 & 0 & 0 \\\\ 0 & \\left(1-\\frac{2GM}{rc^2}\\right)^{-1} & 0 & 0 \\\\ 0 & 0 & r^2 & 0 \\\\ 0 & 0 & 0 & r^2\\sin^2\\theta \\end{pmatrix}"
            : "g_{\\mu\\nu} = \\begin{pmatrix} -1 & 0 & 0 & 0 \\\\ 0 & a(t)^2 & 0 & 0 \\\\ 0 & 0 & a(t)^2 & 0 \\\\ 0 & 0 & 0 & a(t)^2 \\end{pmatrix}",
          ricciTensor: formData.calculationType === 'vacuum' 
            ? "R_{\\mu\\nu} = 0"
            : "R_{\\mu\\nu} = 8\\pi G \\left(T_{\\mu\\nu} - \\frac{1}{2}g_{\\mu\\nu}T\\right)",
          ricciScalar: formData.calculationType === 'vacuum' ? "R = 0" : "R = -8\\pi G T",
          christoffelSymbols: [
            "\\Gamma^t_{rr} = \\frac{GM}{c^2r^2}\\left(1-\\frac{2GM}{rc^2}\\right)^{-1}",
            "\\Gamma^r_{tt} = \\frac{GM}{r^2c^2}\\left(1-\\frac{2GM}{rc^2}\\right)",
            "\\Gamma^r_{\\theta\\theta} = -r\\left(1-\\frac{2GM}{rc^2}\\right)",
            "\\Gamma^r_{\\phi\\phi} = -r\\sin^2\\theta\\left(1-\\frac{2GM}{rc^2}\\right)"
          ]
        };
        
        setResults(simulatedResults);
        setSuccess(true);
        setLoading(false);
      }, 2000);
      
    } catch (err) {
      console.error('Error calculating Einstein Field Equations:', err);
      setError('Failed to perform the calculation. Please check your inputs and try again.');
      setLoading(false);
    }
  };

  // Handle saving the calculation
  const handleSave = async () => {
    if (!results) return;
    
    setLoading(true);
    try {
      // In a real implementation, this would call the backend API
      // const response = await calculationsAPI.createCalculation({
      //   type: 'efe',
      //   inputs: formData,
      //   results: results,
      //   description: formData.description
      // });
      
      // Simulate saving
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
        // Show a success message
        alert('Calculation saved successfully!');
      }, 1000);
      
    } catch (err) {
      console.error('Error saving calculation:', err);
      setError('Failed to save the calculation. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-paper rounded-lg shadow-dark-md p-6">
      <h2 className="text-2xl font-bold text-text-primary mb-6">
        Einstein Field Equations Calculator
      </h2>
      
      {/* Equation display */}
      <div className="mb-8">
        <div 
          className="text-xl text-text-primary font-math p-4 bg-background rounded-lg shadow-dark-sm"
          dangerouslySetInnerHTML={{ 
            __html: renderLatex(
              formData.includeCosmologicalConstant 
                ? "G_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = 8\\pi G T_{\\mu\\nu}" 
                : "G_{\\mu\\nu} = 8\\pi G T_{\\mu\\nu}", 
              true
            ) 
          }}
        ></div>
        <p className="text-text-secondary mt-2">
          The Einstein field equations describe how the geometry of spacetime is influenced by matter and energy.
        </p>
      </div>
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calculation Type */}
          <div>
            <label className="block text-text-primary mb-2">Calculation Type</label>
            <select
              name="calculationType"
              value={formData.calculationType}
              onChange={handleInputChange}
              className="input w-full"
            >
              <option value="vacuum">Vacuum Solution</option>
              <option value="matter">Matter-Inclusive Solution</option>
              <option value="weak-field">Weak Field Approximation</option>
            </select>
            <p className="text-text-secondary text-sm mt-1">
              {formData.calculationType === 'vacuum' 
                ? 'Solve the equations in vacuum where T_μν = 0' 
                : formData.calculationType === 'matter'
                  ? 'Include the energy-momentum tensor for matter'
                  : 'Use the linearized gravity approximation'}
            </p>
          </div>
          
          {/* Coordinate System */}
          <div>
            <label className="block text-text-primary mb-2">Coordinate System</label>
            <select
              name="coordinates"
              value={formData.coordinates}
              onChange={handleInputChange}
              className="input w-full"
            >
              <option value="spherical">Spherical (r, θ, φ)</option>
              <option value="cartesian">Cartesian (x, y, z)</option>
              <option value="cylindrical">Cylindrical (ρ, φ, z)</option>
            </select>
          </div>
          
          {/* Cosmological Constant */}
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                name="includeCosmologicalConstant"
                checked={formData.includeCosmologicalConstant}
                onChange={handleInputChange}
                className="h-4 w-4 bg-background-light border-gray-700 rounded mr-2"
              />
              <label className="text-text-primary">Include Cosmological Constant (Λ)</label>
            </div>
            
            {formData.includeCosmologicalConstant && (
              <input
                type="number"
                name="cosmologicalConstant"
                value={formData.cosmologicalConstant}
                onChange={handleInputChange}
                step="0.000000000000000001"
                className="input w-full mt-2"
                placeholder="Value of Λ (e.g., 1.1e-52 m^-2)"
              />
            )}
            <p className="text-text-secondary text-sm mt-1">
              The cosmological constant represents the energy density of space.
            </p>
          </div>
          
          {/* Mass Parameter */}
          <div>
            <label className="block text-text-primary mb-2">Mass (in solar masses)</label>
            <input
              type="number"
              name="mass"
              value={formData.mass}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              className="input w-full"
            />
          </div>
          
          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-text-primary mb-2">Description (optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="input w-full h-24"
              placeholder="Add a description for this calculation..."
            ></textarea>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-800 text-red-400 px-4 py-3 rounded-md my-6">
            {error}
          </div>
        )}
        
        {/* Success message */}
        {success && !error && (
          <div className="bg-green-900 bg-opacity-20 border border-green-800 text-green-400 px-4 py-3 rounded-md my-6">
            Calculation completed successfully!
          </div>
        )}
        
        {/* Submit button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary px-6"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating...
              </div>
            ) : (
              'Calculate'
            )}
          </button>
        </div>
      </form>
      
      {/* Results section */}
      {results && (
        <div className="mt-8 bg-background rounded-lg shadow-dark-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-text-primary">Results</h3>
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn btn-secondary"
            >
              Save Calculation
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Metric tensor */}
            <div>
              <h4 className="text-lg font-medium text-text-primary mb-2">Metric Tensor</h4>
              <div 
                className="text-lg text-text-primary font-math p-4 bg-background-paper rounded-lg shadow-dark-sm"
                dangerouslySetInnerHTML={{ __html: renderLatex(results.metric, true) }}
              ></div>
            </div>
            
            {/* Ricci tensor */}
            <div>
              <h4 className="text-lg font-medium text-text-primary mb-2">Ricci Tensor</h4>
              <div 
                className="text-lg text-text-primary font-math p-4 bg-background-paper rounded-lg shadow-dark-sm"
                dangerouslySetInnerHTML={{ __html: renderLatex(results.ricciTensor, true) }}
              ></div>
            </div>
            
            {/* Ricci scalar */}
            <div>
              <h4 className="text-lg font-medium text-text-primary mb-2">Ricci Scalar</h4>
              <div 
                className="text-lg text-text-primary font-math p-4 bg-background-paper rounded-lg shadow-dark-sm"
                dangerouslySetInnerHTML={{ __html: renderLatex(results.ricciScalar, true) }}
              ></div>
            </div>
            
            {/* Christoffel symbols */}
            <div>
              <h4 className="text-lg font-medium text-text-primary mb-2">Selected Christoffel Symbols</h4>
              <div className="space-y-2">
                {results.christoffelSymbols.map((symbol, index) => (
                  <div 
                    key={index}
                    className="text-lg text-text-primary font-math p-2 bg-background-paper rounded-lg shadow-dark-sm"
                    dangerouslySetInnerHTML={{ __html: renderLatex(symbol, true) }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EinsteinFieldEquations; 