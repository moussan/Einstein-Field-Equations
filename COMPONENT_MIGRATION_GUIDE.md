# Component Migration Guide: Integrating Supabase

This guide provides step-by-step instructions for migrating your React components to use Supabase in the Einstein Field Equations Platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Authentication Components](#authentication-components)
3. [Calculation Components](#calculation-components)
4. [Visualization Components](#visualization-components)
5. [Profile Components](#profile-components)
6. [Common Patterns](#common-patterns)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before migrating your components, ensure you have:

1. Installed Supabase dependencies:
   ```bash
   npm install @supabase/supabase-js
   ```

2. Set up environment variables in your `.env` file:
   ```
   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Added the Supabase client configuration file at `src/utils/supabase.js`

4. Wrapped your app with the `AuthProvider` in your `App.js`:
   ```jsx
   import { AuthProvider } from './utils/auth';
   
   function App() {
     return (
       <AuthProvider>
         <div className="App">
           {/* Your app content */}
         </div>
       </AuthProvider>
     );
   }
   ```

## Authentication Components

### Login Component

**Before:**
```jsx
import React, { useState } from 'react';
import { login } from '../services/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect or update state
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

**After:**
```jsx
import React, { useState } from 'react';
import { useAuth } from '../utils/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
    }
    // Redirect handled by AuthProvider
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Signup Component

**Before:**
```jsx
import React, { useState } from 'react';
import { register } from '../services/auth';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(email, password, name);
      // Redirect or update state
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

**After:**
```jsx
import React, { useState } from 'react';
import { useAuth } from '../utils/auth';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const { signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await signUp(email, password, { name });
    if (error) {
      setError(error.message);
    }
    // Redirect or confirmation message
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### User Profile Component

**Before:**
```jsx
import React, { useEffect, useState } from 'react';
import { getUserProfile, updateUserProfile } from '../services/user';

function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getUserProfile();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleUpdate = async (updatedData) => {
    try {
      const updated = await updateUserProfile(updatedData);
      setProfile(updated);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Profile display and edit form */}
    </div>
  );
}
```

**After:**
```jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/auth';

function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, getProfile, updateProfile } = useAuth();

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        const { data, error } = await getProfile();
        if (!error) {
          setProfile(data);
        }
      }
      setLoading(false);
    }
    fetchProfile();
  }, [user, getProfile]);

  const handleUpdate = async (updatedData) => {
    const { data, error } = await updateProfile(updatedData);
    if (!error) {
      setProfile(data);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in to view your profile</div>;

  return (
    <div>
      {/* Profile display and edit form */}
    </div>
  );
}
```

## Calculation Components

### Calculation Form

**Before:**
```jsx
import React, { useState } from 'react';
import { performCalculation } from '../services/calculations';

function CalculationForm() {
  const [type, setType] = useState('schwarzschild');
  const [inputs, setInputs] = useState({ mass: 1, radius: 10 });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await performCalculation(type, inputs);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
      </form>
      {results && (
        <div>
          {/* Display results */}
        </div>
      )}
    </div>
  );
}
```

**After:**
```jsx
import React, { useState } from 'react';
import { performCalculation } from '../utils/calculations';

function CalculationForm() {
  const [type, setType] = useState('schwarzschild');
  const [inputs, setInputs] = useState({ mass: 1, radius: 10 });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { data, error: calculationError } = await performCalculation(type, inputs);
    
    if (calculationError) {
      setError(calculationError.message);
    } else if (data) {
      setResults(data);
    }
    
    setLoading(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
      </form>
      {error && <div className="error">{error}</div>}
      {results && (
        <div>
          {/* Display results */}
        </div>
      )}
    </div>
  );
}
```

### Calculation History

**Before:**
```jsx
import React, { useEffect, useState } from 'react';
import { getUserCalculations } from '../services/calculations';

function CalculationHistory() {
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCalculations() {
      try {
        const data = await getUserCalculations();
        setCalculations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCalculations();
  }, []);

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {calculations.map(calc => (
            <li key={calc.id}>
              {/* Calculation details */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

**After:**
```jsx
import React, { useEffect, useState } from 'react';
import { getUserCalculations } from '../utils/calculations';

function CalculationHistory() {
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchCalculations() {
      const { data, error, count, pageSize } = await getUserCalculations(page);
      
      if (error) {
        setError(error.message);
      } else if (data) {
        setCalculations(data);
        setTotalPages(Math.ceil(count / pageSize));
      }
      
      setLoading(false);
    }
    
    fetchCalculations();
  }, [page]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <ul>
        {calculations.map(calc => (
          <li key={calc.id}>
            {/* Calculation details */}
          </li>
        ))}
      </ul>
      
      <div className="pagination">
        <button onClick={handlePrevPage} disabled={page === 1}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={handleNextPage} disabled={page === totalPages}>Next</button>
      </div>
    </div>
  );
}
```

## Visualization Components

### Visualization Creator

**Before:**
```jsx
import React, { useState, useRef } from 'react';
import { saveVisualization } from '../services/visualizations';

function VisualizationCreator({ calculationResults }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const canvasRef = useRef(null);

  const handleSave = async () => {
    try {
      // Generate thumbnail from canvas
      const canvas = canvasRef.current;
      const thumbnailUrl = canvas.toDataURL();
      
      // Save visualization
      await saveVisualization({
        title,
        description,
        isPublic,
        thumbnailUrl,
        parameters: calculationResults
      });
      
      // Success message or redirect
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Visualization canvas and form */}
      <canvas ref={canvasRef} />
      <button onClick={handleSave}>Save Visualization</button>
    </div>
  );
}
```

**After:**
```jsx
import React, { useState, useRef } from 'react';
import { saveVisualization, generateThumbnail } from '../utils/visualizations';

function VisualizationCreator({ calculationResults }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      // Save visualization first to get the ID
      const { data: visualization, error: saveError } = await saveVisualization(
        title,
        description,
        'calculation_result', // visualization_type
        calculationResults,
        isPublic
      );
      
      if (saveError) {
        throw saveError;
      }
      
      // Generate and upload thumbnail
      const canvas = canvasRef.current;
      if (canvas && visualization) {
        const { error: thumbnailError } = await generateThumbnail(canvas, visualization.id);
        if (thumbnailError) {
          console.error('Thumbnail upload error:', thumbnailError);
          // Continue even if thumbnail fails
        }
      }
      
      // Success message or redirect
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Visualization canvas and form */}
      <canvas ref={canvasRef} />
      {error && <div className="error">{error}</div>}
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Visualization'}
      </button>
    </div>
  );
}
```

### Visualization Gallery

**Before:**
```jsx
import React, { useEffect, useState } from 'react';
import { getPublicVisualizations } from '../services/visualizations';

function VisualizationGallery() {
  const [visualizations, setVisualizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVisualizations() {
      try {
        const data = await getPublicVisualizations();
        setVisualizations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchVisualizations();
  }, []);

  return (
    <div className="gallery">
      {loading ? (
        <div>Loading...</div>
      ) : (
        visualizations.map(viz => (
          <div key={viz.id} className="gallery-item">
            {/* Visualization thumbnail and details */}
          </div>
        ))
      )}
    </div>
  );
}
```

**After:**
```jsx
import React, { useEffect, useState } from 'react';
import { getPublicVisualizations, filterVisualizationsByType } from '../utils/visualizations';

function VisualizationGallery() {
  const [visualizations, setVisualizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState(null);

  useEffect(() => {
    async function fetchVisualizations() {
      setLoading(true);
      
      let result;
      if (filter) {
        result = await filterVisualizationsByType(filter, page);
      } else {
        result = await getPublicVisualizations(page);
      }
      
      const { data, error, count, pageSize } = result;
      
      if (error) {
        setError(error.message);
      } else if (data) {
        setVisualizations(data);
        setTotalPages(Math.ceil(count / pageSize));
      }
      
      setLoading(false);
    }
    
    fetchVisualizations();
  }, [page, filter]);

  const handleFilterChange = (type) => {
    setFilter(type);
    setPage(1); // Reset to first page when changing filter
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="filters">
        <button onClick={() => handleFilterChange(null)}>All</button>
        <button onClick={() => handleFilterChange('calculation_result')}>Calculations</button>
        <button onClick={() => handleFilterChange('spacetime_diagram')}>Spacetime Diagrams</button>
        {/* Add more filter buttons as needed */}
      </div>
      
      <div className="gallery">
        {visualizations.map(viz => (
          <div key={viz.id} className="gallery-item">
            <img src={viz.thumbnail_url || '/placeholder.png'} alt={viz.title} />
            <h3>{viz.title}</h3>
            <p>By {viz.profiles?.display_name || 'Anonymous'}</p>
            {/* More visualization details */}
          </div>
        ))}
      </div>
      
      <div className="pagination">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
```

## Profile Components

### User Settings

**Before:**
```jsx
import React, { useEffect, useState } from 'react';
import { getUserPreferences, updateUserPreferences } from '../services/user';

function UserSettings() {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPreferences() {
      try {
        const data = await getUserPreferences();
        setPreferences(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPreferences();
  }, []);

  const handleUpdate = async (updatedPreferences) => {
    try {
      const updated = await updateUserPreferences(updatedPreferences);
      setPreferences(updated);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Preferences form */}
    </div>
  );
}
```

**After:**
```jsx
import React, { useEffect, useState } from 'react';
import supabase from '../utils/supabase';
import { useAuth } from '../utils/auth';

function UserSettings() {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchPreferences() {
      if (!user) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        setError(error.message);
      } else if (data) {
        setPreferences(data);
      }
      
      setLoading(false);
    }
    
    fetchPreferences();
  }, [user]);

  const handleUpdate = async (updatedPreferences) => {
    if (!user) return;
    
    setError(null);
    
    const { data, error } = await supabase
      .from('user_preferences')
      .update(updatedPreferences)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      setError(error.message);
    } else if (data) {
      setPreferences(data);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in to view your settings</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Preferences form */}
      <form onSubmit={(e) => {
        e.preventDefault();
        handleUpdate({
          theme: e.target.theme.value,
          default_coordinate_system: e.target.coordinate_system.value,
          // Other preferences
        });
      }}>
        <div>
          <label htmlFor="theme">Theme</label>
          <select id="theme" name="theme" defaultValue={preferences.theme}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="coordinate_system">Default Coordinate System</label>
          <select 
            id="coordinate_system" 
            name="coordinate_system" 
            defaultValue={preferences.default_coordinate_system}
          >
            <option value="cartesian">Cartesian</option>
            <option value="spherical">Spherical</option>
            <option value="cylindrical">Cylindrical</option>
            {/* Other coordinate systems */}
          </select>
        </div>
        
        <button type="submit">Save Preferences</button>
      </form>
    </div>
  );
}
```

## Common Patterns

### Protected Routes

**Before:**
```jsx
import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';

function ProtectedRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated() ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
}
```

**After:**
```jsx
import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuth } from '../utils/auth';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Usage:
// <ProtectedRoute>
//   <YourComponent />
// </ProtectedRoute>
```

### Real-time Updates

**Before:**
```jsx
import React, { useEffect, useState } from 'react';
import { getCalculation } from '../services/calculations';

function CalculationDetail({ calculationId }) {
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchCalculation() {
      try {
        const data = await getCalculation(calculationId);
        setCalculation(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCalculation();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchCalculation, 5000);
    
    return () => clearInterval(interval);
  }, [calculationId]);
  
  // Component rendering
}
```

**After:**
```jsx
import React, { useEffect, useState } from 'react';
import supabase from '../utils/supabase';
import { getCalculation } from '../utils/calculations';

function CalculationDetail({ calculationId }) {
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchCalculation() {
      const { data, error } = await getCalculation(calculationId);
      
      if (error) {
        setError(error.message);
      } else if (data) {
        setCalculation(data);
      }
      
      setLoading(false);
    }
    
    fetchCalculation();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('public:calculations')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'calculations',
          filter: `id=eq.${calculationId}`
        }, 
        (payload) => {
          setCalculation(payload.new);
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [calculationId]);
  
  // Component rendering
}
```

## Troubleshooting

### Common Issues

1. **Authentication Issues**
   - Ensure you've wrapped your app with `AuthProvider`
   - Check that environment variables are correctly set
   - Verify that the user has the correct permissions in Supabase

2. **Data Access Issues**
   - Check Row Level Security (RLS) policies in Supabase
   - Ensure you're using the correct table names
   - Verify that your queries include the necessary fields

3. **Edge Function Issues**
   - Check that the Edge Function is deployed
   - Verify that the function has the correct permissions
   - Check for CORS issues if calling from the browser

### Debugging Tips

1. **Use the Supabase Dashboard**
   - Monitor real-time database changes
   - Check authentication logs
   - View Edge Function logs

2. **Enable Debug Mode**
   ```jsx
   const supabase = createClient(supabaseUrl, supabaseAnonKey, {
     auth: {
       persistSession: true,
       autoRefreshToken: true,
       detectSessionInUrl: true,
     },
     debug: true, // Enable debug mode
   });
   ```

3. **Check Network Requests**
   - Use browser developer tools to monitor network requests
   - Look for error responses from Supabase

4. **Test with Postman**
   - Test API endpoints directly to isolate frontend issues

For more help, refer to the [Supabase documentation](https://supabase.com/docs) or reach out to the project maintainers. 