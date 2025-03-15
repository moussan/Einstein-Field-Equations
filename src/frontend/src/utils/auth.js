import { useState, useEffect, createContext, useContext } from 'react';
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
      redirectTo: `${window.location.origin}/reset-password`,
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
};

// Authentication utility functions
const SESSION_KEY = 'user_session';

// Helper to get current session
const getSession = () => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
};

// Helper to set session
const setSession = (session) => {
    if (session) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
};

/**
 * Get the current user session
 */
export const getCurrentSession = async () => {
    try {
        const session = getSession();
        return { data: { session }, error: null };
    } catch (error) {
        return { data: null, error };
    }
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (callback) => {
    const handleStorageChange = (e) => {
        if (e.key === SESSION_KEY) {
            const session = e.newValue ? JSON.parse(e.newValue) : null;
            callback('SIGNED_IN', session);
        }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return {
        data: { subscription: { unsubscribe: () => window.removeEventListener('storage', handleStorageChange) } }
    };
};

/**
 * Sign up a new user
 */
export const signUp = async ({ email, password }) => {
    try {
        // Here you would typically make an API call to your backend
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        setSession(data.session);
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
};

/**
 * Sign in a user
 */
export const signIn = async ({ email, password }) => {
    try {
        // Here you would typically make an API call to your backend
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        setSession(data.session);
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
};

/**
 * Sign in with OAuth provider
 */
export const signInWithOAuth = async ({ provider }) => {
    try {
        // Here you would typically redirect to your OAuth provider
        window.location.href = `/api/auth/${provider}`;
        return { data: null, error: null };
    } catch (error) {
        return { data: null, error };
    }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
    try {
        setSession(null);
        return { error: null };
    } catch (error) {
        return { error };
    }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
    try {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
};

/**
 * Update user profile
 */
export const updateProfile = async (updates) => {
    try {
        const session = getSession();
        if (!session) throw new Error('No session found');
        
        const response = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify(updates)
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        setSession({ ...session, user: { ...session.user, ...updates } });
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
};

/**
 * Get user profile
 */
export const getProfile = async () => {
    try {
        const session = getSession();
        if (!session) throw new Error('No session found');
        
        const response = await fetch('/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${session.access_token}`
            }
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
};

/**
 * Update user password
 */
export const updatePassword = async (password) => {
    try {
        const session = getSession();
        if (!session) throw new Error('No session found');
        
        const response = await fetch('/api/auth/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ password })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
}; 