import { getCLS, getFID, getLCP, getTTFB, getFCP } from 'web-vitals';

/**
 * Report Web Vitals metrics to analytics
 * @param {Function} onPerfEntry - Callback function to handle performance entries
 */
export function reportWebVitals(onPerfEntry) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    getCLS(onPerfEntry); // Cumulative Layout Shift
    getFID(onPerfEntry); // First Input Delay
    getLCP(onPerfEntry); // Largest Contentful Paint
    getTTFB(onPerfEntry); // Time to First Byte
    getFCP(onPerfEntry); // First Contentful Paint
  }
}

/**
 * Simple in-memory cache for API responses
 */
class ApiCache {
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) { // Default 5 minutes TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  /**
   * Get an item from cache
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if not found/expired
   */
  get(key) {
    if (!this.cache.has(key)) return null;
    
    const { value, expires } = this.cache.get(key);
    
    // Check if expired
    if (Date.now() > expires) {
      this.cache.delete(key);
      return null;
    }
    
    return value;
  }

  /**
   * Set an item in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} [customTtl] - Optional custom TTL in milliseconds
   */
  set(key, value, customTtl) {
    // If cache is at max size, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    const expires = Date.now() + (customTtl || this.ttl);
    this.cache.set(key, { value, expires });
  }

  /**
   * Clear the entire cache or a specific key
   * @param {string} [key] - Optional specific key to clear
   */
  clear(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

// Create shared cache instance
export const apiCache = new ApiCache();

/**
 * Wrap a function with performance tracking
 * @param {string} name - Name of the operation for tracking
 * @param {Function} fn - Function to wrap
 * @returns {Function} - Wrapped function
 */
export function withPerformanceTracking(name, fn) {
  return async (...args) => {
    const startTime = performance.now();
    try {
      const result = await fn(...args);
      const duration = performance.now() - startTime;
      
      // Log performance data
      logPerformanceMetric(name, duration, { args: JSON.stringify(args).length });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      // Log error performance data
      logPerformanceMetric(`${name}_error`, duration, { 
        error: error.message,
        args: JSON.stringify(args).length 
      });
      
      throw error;
    }
  };
}

/**
 * Log a performance metric to analytics
 * @param {string} name - Metric name
 * @param {number} duration - Duration in milliseconds
 * @param {Object} [attributes] - Additional attributes
 */
export function logPerformanceMetric(name, duration, attributes = {}) {
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Performance: ${name} - ${duration.toFixed(2)}ms`, attributes);
  }
  
  // Send to Google Analytics if available
  if (window.gtag) {
    window.gtag('event', 'performance_metric', {
      metric_name: name,
      duration_ms: Math.round(duration),
      ...attributes
    });
  }
}

/**
 * Debounce a function call
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle a function call
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} - Throttled function
 */
export function throttle(fn, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Memoize a function (cache results)
 * @param {Function} fn - Function to memoize
 * @returns {Function} - Memoized function
 */
export function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Measure component render time
 * @param {string} componentName - Name of the component
 * @returns {Object} - Object with start and end methods
 */
export function measureRenderTime(componentName) {
  let startTime;
  
  return {
    start: () => {
      startTime = performance.now();
    },
    end: () => {
      if (!startTime) return;
      const duration = performance.now() - startTime;
      logPerformanceMetric(`render_${componentName}`, duration);
      startTime = null;
    }
  };
}

/**
 * Create a cached API request function
 * @param {Function} requestFn - Original request function
 * @param {Function} getCacheKey - Function to generate cache key from args
 * @param {number} [ttl] - Cache TTL in milliseconds
 * @returns {Function} - Cached request function
 */
export function createCachedRequest(requestFn, getCacheKey, ttl) {
  return async (...args) => {
    const cacheKey = getCacheKey(...args);
    
    // Check cache first
    const cachedResult = apiCache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    
    // Make actual request
    const result = await requestFn(...args);
    
    // Cache successful results
    if (result && !result.error) {
      apiCache.set(cacheKey, result, ttl);
    }
    
    return result;
  };
} 