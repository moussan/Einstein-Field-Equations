#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.cyan}
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   Einstein Field Equations Platform - Frontend Update Script  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}`);

// Check if frontend directory exists
function checkFrontendDirectory() {
  if (fs.existsSync('frontend')) {
    console.log(`${colors.green}✓ Frontend directory found${colors.reset}`);
    return true;
  } else {
    console.log(`${colors.red}✗ Frontend directory not found${colors.reset}`);
    console.log(`${colors.yellow}Please run this script from the root of your project${colors.reset}`);
    return false;
  }
}

// Install Supabase dependencies
function installDependencies() {
  try {
    console.log(`${colors.yellow}Installing Supabase dependencies...${colors.reset}`);
    execSync('cd frontend && npm install @supabase/supabase-js', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Installed Supabase dependencies${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Failed to install Supabase dependencies${colors.reset}`);
    console.log(`${colors.yellow}Error: ${error.message}${colors.reset}`);
    return false;
  }
}

// Create utils directory if it doesn't exist
function createUtilsDirectory() {
  const utilsDir = 'frontend/src/utils';
  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
    console.log(`${colors.green}✓ Created utils directory${colors.reset}`);
  } else {
    console.log(`${colors.yellow}! Utils directory already exists${colors.reset}`);
  }
}

// Copy utility files
function copyUtilityFiles() {
  const files = [
    { src: 'supabase/frontend/src/utils/supabase.js', dest: 'frontend/src/utils/supabase.js' },
    { src: 'supabase/frontend/src/utils/auth.js', dest: 'frontend/src/utils/auth.js' },
    { src: 'supabase/frontend/src/utils/calculations.js', dest: 'frontend/src/utils/calculations.js' },
    { src: 'supabase/frontend/src/utils/visualizations.js', dest: 'frontend/src/utils/visualizations.js' }
  ];

  // Check if source files exist
  const sourceFiles = files.map(file => file.src);
  const missingFiles = sourceFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    console.log(`${colors.red}✗ Some source files are missing:${colors.reset}`);
    missingFiles.forEach(file => {
      console.log(`${colors.yellow}  - ${file}${colors.reset}`);
    });
    
    // Create the files from the existing files in the project
    console.log(`${colors.yellow}Creating utility files from existing files in the project...${colors.reset}`);
    
    // Copy from the files we've already created
    if (fs.existsSync('frontend/src/utils/supabase.js')) {
      fs.copyFileSync('frontend/src/utils/supabase.js', 'frontend/src/utils/supabase.js.bak');
      console.log(`${colors.green}✓ Backed up existing supabase.js${colors.reset}`);
    }
    
    // Create the files with the content from our migration
    const utilsDir = path.join(__dirname, 'frontend', 'src', 'utils');
    
    // supabase.js
    const supabaseContent = `import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;`;
    
    fs.writeFileSync('frontend/src/utils/supabase.js', supabaseContent);
    console.log(`${colors.green}✓ Created supabase.js${colors.reset}`);
    
    // Check if we have the other utility files in the project
    if (fs.existsSync('supabase/migrations/20250314_initial_schema.sql')) {
      console.log(`${colors.green}✓ Found schema file, using it as reference for utility files${colors.reset}`);
      
      // auth.js
      const authContent = `import { useState, useEffect, createContext, useContext } from 'react';
import supabase from './supabase';

// Create an authentication context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the current session
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error.message);
      }
      
      setSession(data?.session || null);
      setUser(data?.session?.user || null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with email and password
  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    return { data, error };
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  };

  // Sign in with OAuth provider
  const signInWithProvider = async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
    });

    return { data, error };
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // Reset password
  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: \`\${window.location.origin}/reset-password\`,
    });

    return { data, error };
  };

  // Update password
  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return { data, error };
  };

  // Update user profile
  const updateProfile = async (updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    return { data, error };
  };

  // Get user profile
  const getProfile = async () => {
    if (!user) return { data: null, error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { data, error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    getProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};`;
      
      fs.writeFileSync('frontend/src/utils/auth.js', authContent);
      console.log(`${colors.green}✓ Created auth.js${colors.reset}`);
      
      // calculations.js
      const calculationsContent = `import supabase from './supabase';

// Get all calculations for the current user
export const getUserCalculations = async (page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('calculations')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(start, end);

  return { data, error, count, page, pageSize };
};

// Get public calculations
export const getPublicCalculations = async (page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('calculations')
    .select('*, profiles(display_name)', { count: 'exact' })
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(start, end);

  return { data, error, count, page, pageSize };
};

// Get a specific calculation by ID
export const getCalculation = async (id) => {
  const { data, error } = await supabase
    .from('calculations')
    .select('*, profiles(display_name)')
    .eq('id', id)
    .single();

  return { data, error };
};

// Create a new calculation
export const createCalculation = async (calculationData) => {
  const { data, error } = await supabase
    .from('calculations')
    .insert(calculationData)
    .select()
    .single();

  return { data, error };
};

// Update an existing calculation
export const updateCalculation = async (id, updates) => {
  const { data, error } = await supabase
    .from('calculations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

// Delete a calculation
export const deleteCalculation = async (id) => {
  const { error } = await supabase
    .from('calculations')
    .delete()
    .eq('id', id);

  return { error };
};

// Search calculations by type or description
export const searchCalculations = async (query, page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('calculations')
    .select('*', { count: 'exact' })
    .or(\`type.ilike.%\${query}%,description.ilike.%\${query}%\`)
    .order('created_at', { ascending: false })
    .range(start, end);

  return { data, error, count, page, pageSize };
};

// Filter calculations by type
export const filterCalculationsByType = async (type, page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('calculations')
    .select('*', { count: 'exact' })
    .eq('type', type)
    .order('created_at', { ascending: false })
    .range(start, end);

  return { data, error, count, page, pageSize };
};

// Perform a calculation (this would typically call a serverless function)
export const performCalculation = async (calculationType, inputs) => {
  // Create a record of the calculation
  const calculationRecord = {
    type: calculationType,
    inputs: inputs,
    is_public: false,
  };
  
  const { data: createdCalculation, error: creationError } = await createCalculation(calculationRecord);
  
  if (creationError) {
    return { data: null, error: creationError };
  }
  
  // Call the Edge Function to perform the calculation
  const { data, error } = await supabase.functions.invoke('calculate', {
    body: { type: calculationType, inputs },
  });
  
  if (error) {
    return { data: null, error };
  }
  
  // Update the calculation with results
  const { data: updatedCalculation, error: updateError } = await updateCalculation(createdCalculation.id, {
    results: data.results,
    calculation_time: data.calculation_time,
  });
  
  return { data: updatedCalculation, error: updateError };
};`;
      
      fs.writeFileSync('frontend/src/utils/calculations.js', calculationsContent);
      console.log(`${colors.green}✓ Created calculations.js${colors.reset}`);
      
      // visualizations.js
      const visualizationsContent = `import supabase from './supabase';

// Get all visualizations for the current user
export const getUserVisualizations = async (page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('saved_visualizations')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(start, end);

  return { data, error, count, page, pageSize };
};

// Get public visualizations
export const getPublicVisualizations = async (page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('saved_visualizations')
    .select('*, profiles(display_name)', { count: 'exact' })
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(start, end);

  return { data, error, count, page, pageSize };
};

// Get a specific visualization by ID
export const getVisualization = async (id) => {
  const { data, error } = await supabase
    .from('saved_visualizations')
    .select('*, profiles(display_name)')
    .eq('id', id)
    .single();

  return { data, error };
};

// Create a new visualization
export const createVisualization = async (visualizationData) => {
  const { data, error } = await supabase
    .from('saved_visualizations')
    .insert(visualizationData)
    .select()
    .single();

  return { data, error };
};

// Update an existing visualization
export const updateVisualization = async (id, updates) => {
  const { data, error } = await supabase
    .from('saved_visualizations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

// Delete a visualization
export const deleteVisualization = async (id) => {
  const { error } = await supabase
    .from('saved_visualizations')
    .delete()
    .eq('id', id);

  return { error };
};

// Search visualizations by title or description
export const searchVisualizations = async (query, page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('saved_visualizations')
    .select('*', { count: 'exact' })
    .or(\`title.ilike.%\${query}%,description.ilike.%\${query}%\`)
    .order('created_at', { ascending: false })
    .range(start, end);

  return { data, error, count, page, pageSize };
};

// Filter visualizations by type
export const filterVisualizationsByType = async (type, page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('saved_visualizations')
    .select('*', { count: 'exact' })
    .eq('visualization_type', type)
    .order('created_at', { ascending: false })
    .range(start, end);

  return { data, error, count, page, pageSize };
};

// Upload a visualization thumbnail
export const uploadThumbnail = async (file, visualizationId) => {
  const fileExt = file.name.split('.').pop();
  const fileName = \`\${visualizationId}.\${fileExt}\`;
  const filePath = \`visualization_thumbnails/\${fileName}\`;

  const { data, error } = await supabase.storage
    .from('visualizations')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    return { data: null, error };
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('visualizations')
    .getPublicUrl(filePath);

  // Update the visualization with the thumbnail URL
  const { data: updatedVisualization, error: updateError } = await updateVisualization(
    visualizationId,
    { thumbnail_url: publicUrl }
  );

  return { data: updatedVisualization, error: updateError };
};

// Save the current visualization state
export const saveVisualization = async (title, description, visualizationType, parameters, isPublic = false) => {
  // Create the visualization record
  const visualizationData = {
    title,
    description,
    visualization_type: visualizationType,
    parameters,
    is_public: isPublic,
  };

  const { data, error } = await createVisualization(visualizationData);

  return { data, error };
};

// Generate a thumbnail from canvas
export const generateThumbnail = async (canvas, visualizationId) => {
  // Convert canvas to blob
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      // Create a file from the blob
      const file = new File([blob], \`thumbnail-\${visualizationId}.png\`, { type: 'image/png' });
      
      // Upload the file
      const result = await uploadThumbnail(file, visualizationId);
      resolve(result);
    }, 'image/png');
  });
};`;
      
      fs.writeFileSync('frontend/src/utils/visualizations.js', visualizationsContent);
      console.log(`${colors.green}✓ Created visualizations.js${colors.reset}`);
    } else {
      console.log(`${colors.yellow}! Schema file not found, skipping utility file creation${colors.reset}`);
      return false;
    }
    
    return true;
  }
  
  // Copy files
  try {
    files.forEach(file => {
      fs.copyFileSync(file.src, file.dest);
      console.log(`${colors.green}✓ Copied ${file.src} to ${file.dest}${colors.reset}`);
    });
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Failed to copy utility files${colors.reset}`);
    console.log(`${colors.yellow}Error: ${error.message}${colors.reset}`);
    return false;
  }
}

// Update App.js to use Supabase
function updateAppJs() {
  const appJsPath = 'frontend/src/App.js';
  
  if (!fs.existsSync(appJsPath)) {
    console.log(`${colors.yellow}! App.js not found, skipping update${colors.reset}`);
    return false;
  }
  
  try {
    // Backup the original file
    fs.copyFileSync(appJsPath, `${appJsPath}.bak`);
    console.log(`${colors.green}✓ Backed up App.js${colors.reset}`);
    
    // Read the original file
    let appJsContent = fs.readFileSync(appJsPath, 'utf8');
    
    // Check if AuthProvider is already imported
    if (appJsContent.includes('AuthProvider')) {
      console.log(`${colors.yellow}! App.js already includes AuthProvider, skipping update${colors.reset}`);
      return true;
    }
    
    // Add AuthProvider import
    appJsContent = appJsContent.replace(
      /import React.*/,
      `import React from 'react';
import { AuthProvider } from './utils/auth';`
    );
    
    // Wrap the app with AuthProvider
    appJsContent = appJsContent.replace(
      /<div.*>/,
      `<AuthProvider>\n      <div className="App">`
    );
    
    appJsContent = appJsContent.replace(
      /<\/div>\s*$/,
      `</div>\n    </AuthProvider>`
    );
    
    // Write the updated file
    fs.writeFileSync(appJsPath, appJsContent);
    console.log(`${colors.green}✓ Updated App.js to use AuthProvider${colors.reset}`);
    
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Failed to update App.js${colors.reset}`);
    console.log(`${colors.yellow}Error: ${error.message}${colors.reset}`);
    return false;
  }
}

// Main function
async function main() {
  // Check frontend directory
  if (!checkFrontendDirectory()) {
    rl.close();
    return;
  }
  
  // Install dependencies
  if (!installDependencies()) {
    rl.close();
    return;
  }
  
  // Create utils directory
  createUtilsDirectory();
  
  // Copy utility files
  if (!copyUtilityFiles()) {
    console.log(`${colors.yellow}! Some utility files could not be copied${colors.reset}`);
  }
  
  // Update App.js
  if (!updateAppJs()) {
    console.log(`${colors.yellow}! App.js could not be updated${colors.reset}`);
  }
  
  console.log(`${colors.bright}${colors.green}
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   Frontend update completed!                                  ║
║                                                               ║
║   Next steps:                                                 ║
║   1. Update your components to use the Supabase utilities     ║
║   2. Test your application with Supabase                      ║
║   3. Deploy your application                                  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  rl.close();
}

// Run the script
main().catch(error => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  rl.close();
}); 