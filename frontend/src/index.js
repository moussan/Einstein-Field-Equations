import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { reportWebVitals } from './utils/performance';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// Register the service worker for production builds
if (process.env.NODE_ENV === 'production') {
  serviceWorkerRegistration.register({
    onUpdate: (registration) => {
      // When a new version is available, show a notification
      const updateAvailable = window.confirm(
        'A new version of the app is available. Load the new version?'
      );
      
      if (updateAvailable && registration.waiting) {
        // Send a message to the service worker to skip waiting
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Reload the page to load the new version
        window.location.reload();
      }
    },
  });
} else {
  // For development, use unregister to avoid caching issues
  serviceWorkerRegistration.unregister();
}

// Report web vitals for performance monitoring
reportWebVitals(({ name, delta, id }) => {
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Web Vital: ${name} - ${Math.round(delta)}ms`);
  }
  
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production' && window.gtag) {
    window.gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? delta * 1000 : delta),
      non_interaction: true,
      metric_name: name,
    });
  }
}); 