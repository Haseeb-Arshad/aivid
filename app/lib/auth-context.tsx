import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, APIError } from './api-client';
import { wsClient, enableAutoConnect, disableAutoConnect } from './websocket-client';
import type { AuthContextType, UserResponse } from './types';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  initialToken?: string;
}

export function AuthProvider({ children, initialToken }: AuthProviderProps) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(initialToken || null);
  const [isLoading, setIsLoading] = useState(!!initialToken);

  // Initialize auth state on mount
  useEffect(() => {
    if (initialToken) {
      initializeAuth(initialToken);
    }
  }, [initialToken]);

  // Update API client and WebSocket when token changes
  useEffect(() => {
    apiClient.setToken(token);
    wsClient.setToken(token);
    
    if (token) {
      enableAutoConnect();
      wsClient.connect().catch(console.error);
    } else {
      disableAutoConnect();
    }
  }, [token]);

  const initializeAuth = async (authToken: string) => {
    try {
      setIsLoading(true);
      apiClient.setToken(authToken);
      
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
      setToken(authToken);
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      // Clear invalid token
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const tokenResponse = await apiClient.login(email, password);
      const authToken = tokenResponse.access_token;
      
      // Set token and get user info
      apiClient.setToken(authToken);
      const userData = await apiClient.getCurrentUser();
      
      setToken(authToken);
      setUser(userData);
      
      // Store token in localStorage for persistence
      localStorage.setItem('auth_token', authToken);
      
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Register user
      await apiClient.register(email, password);
      
      // Auto-login after registration
      await login(email, password);
      
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    apiClient.setToken(null);
    
    // Clear stored token
    localStorage.removeItem('auth_token');
    
    // Disconnect WebSocket
    wsClient.disconnect();
  };

  const contextValue: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for checking if user is authenticated
export function useIsAuthenticated(): boolean {
  const { user, token } = useAuth();
  return !!(user && token);
}

// Hook for requiring authentication
export function useRequireAuth(): AuthContextType {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.isLoading && !auth.user) {
      // Redirect to login or show login modal
      console.warn('Authentication required');
    }
  }, [auth.isLoading, auth.user]);
  
  return auth;
}