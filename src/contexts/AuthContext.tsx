import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthState, LoginCredentials, UserRole } from '@/types';
import { authService } from '@/services/authService';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

    const initializeAuth = async () => {
    try {
      const token = apiService.getAuthToken();
      const user = authService.getStoredUser();

      if (token && user) {
        // Set temporary auth state while verifying
        setAuthState({
          user: user,
          token: token,
          isAuthenticated: true,
          isLoading: true,
        });

        // Verify token is still valid by fetching current user
        try {
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            setAuthState({
              user: response.data,
              token: token,
              isAuthenticated: true,
              isLoading: false,
            });
            // Update stored user data with fresh data
            localStorage.setItem('user_data', JSON.stringify(response.data));
          } else {
            // Token invalid, clear auth
            console.warn('Token verification failed:', response.message);
            apiService.removeAuthToken();
            setAuthState({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          // Network error - keep existing auth if stored data exists
          console.warn('Auth verification failed, keeping stored auth:', error);
          setAuthState({
            user: user,
            token: token,
            isAuthenticated: true,
            isLoading: false,
          });
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        setAuthState({
          user: { 
            id: response.data.userId,
            username: response.data.username,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            email: response.data.email,
            role: response.data.role as UserRole,
          },
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
        });
        
        toast.success('Successfully logged in!');
        return true;
      } else {
        toast.error(response.message || 'Login failed');
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      // Still proceed with logout on client side
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        setAuthState(prev => ({ 
          ...prev, 
          user: response.data,
        }));
        localStorage.setItem('user_data', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 