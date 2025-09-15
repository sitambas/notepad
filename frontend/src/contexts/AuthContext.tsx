import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, notepadAPI } from '@/utils/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
          setToken(storedToken);
          const response = await notepadAPI.getCurrentUser(storedToken);
          if (response.success && response.user) {
            setUser(response.user);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('auth_token');
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('auth_token');
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await notepadAPI.login(email, password);
      
      if (response.success && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('auth_token', response.token);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await notepadAPI.register(userData);
      
      if (response.success && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('auth_token', response.token);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    notepadAPI.logout(); // Call logout API (though it's not strictly necessary with JWT)
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      setIsLoading(true);
      const response = await notepadAPI.updateProfile(token, userData);
      
      if (response.success && response.user) {
        setUser(response.user);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Profile update failed' };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Profile update failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
