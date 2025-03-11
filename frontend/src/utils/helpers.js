import katex from 'katex';

/**
 * Format a date string to a more readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Truncate a string to a specified length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated string
 */
export const truncateString = (str, length = 50) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

/**
 * Render LaTeX equations using KaTeX
 * @param {string} equation - LaTeX equation string
 * @param {boolean} displayMode - Whether to render in display mode
 * @returns {string} HTML string with rendered equation
 */
export const renderLatex = (equation, displayMode = false) => {
  try {
    return katex.renderToString(equation, {
      displayMode: displayMode,
      throwOnError: false,
      output: 'html'
    });
  } catch (error) {
    console.error('Error rendering LaTeX:', error);
    return equation;
  }
};

/**
 * Convert tensor notation to LaTeX
 * @param {string} tensor - Tensor notation
 * @returns {string} LaTeX representation
 */
export const tensorToLatex = (tensor) => {
  // This is a simplified implementation
  // A real implementation would handle more complex tensor notations
  return tensor
    .replace(/\^(\w+)/g, '^{$1}')
    .replace(/_(\w+)/g, '_{$1}')
    .replace(/Gamma/g, '\\Gamma')
    .replace(/Phi/g, '\\Phi')
    .replace(/Psi/g, '\\Psi')
    .replace(/Theta/g, '\\Theta')
    .replace(/Lambda/g, '\\Lambda')
    .replace(/Delta/g, '\\Delta')
    .replace(/Omega/g, '\\Omega')
    .replace(/mu/g, '\\mu')
    .replace(/nu/g, '\\nu')
    .replace(/alpha/g, '\\alpha')
    .replace(/beta/g, '\\beta')
    .replace(/gamma/g, '\\gamma')
    .replace(/delta/g, '\\delta')
    .replace(/epsilon/g, '\\epsilon')
    .replace(/zeta/g, '\\zeta')
    .replace(/eta/g, '\\eta')
    .replace(/theta/g, '\\theta')
    .replace(/iota/g, '\\iota')
    .replace(/kappa/g, '\\kappa')
    .replace(/lambda/g, '\\lambda')
    .replace(/rho/g, '\\rho')
    .replace(/sigma/g, '\\sigma')
    .replace(/tau/g, '\\tau')
    .replace(/upsilon/g, '\\upsilon')
    .replace(/phi/g, '\\phi')
    .replace(/chi/g, '\\chi')
    .replace(/psi/g, '\\psi')
    .replace(/omega/g, '\\omega');
};

/**
 * Format a number with appropriate precision
 * @param {number} num - Number to format
 * @param {number} precision - Number of decimal places
 * @returns {string} Formatted number
 */
export const formatNumber = (num, precision = 4) => {
  if (num === undefined || num === null) return '';
  if (typeof num !== 'number') return num;
  
  // Handle very small numbers close to zero
  if (Math.abs(num) < Math.pow(10, -precision) && num !== 0) {
    return num.toExponential(precision);
  }
  
  // Handle very large numbers
  if (Math.abs(num) >= Math.pow(10, precision + 2)) {
    return num.toExponential(precision);
  }
  
  return num.toFixed(precision).replace(/\.?0+$/, '');
};

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Deep clone an object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if an object is empty
 * @param {object} obj - Object to check
 * @returns {boolean} Whether the object is empty
 */
export const isEmptyObject = (obj) => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
}; 