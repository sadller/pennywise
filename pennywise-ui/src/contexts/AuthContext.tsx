'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { apiClient } from '@/services/apiClient';
import { API_CONSTANTS, STORAGE_KEYS } from '@/constants/layout';

interface User {
  id: number;
  email: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  auth_provider: string;
  is_active: boolean;
  is_superuser: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  loginWithGoogle: (code: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  // Sidebar state management
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
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
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);



  const fetchUserProfile = useCallback(async () => {
    try {
      const userData = await apiClient.get<User>(`${API_CONSTANTS.BASE_URL}/auth/me`);
      setUser(userData);
    } catch {
      console.error('Error fetching user profile');
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      // Clear group selection data when authentication fails
      localStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP_ID);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP_NAME);
      setToken(null);
      setUser(null);
    }
  }, []);

  const refreshTokenAndFetchUser = useCallback(async () => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_CONSTANTS.BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const tokens = await response.json();
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, tokens.access_token);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
        setToken(tokens.access_token);
        await fetchUserProfile();
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        // Clear group selection data when authentication fails
        localStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP_ID);
        localStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP_NAME);
      }
    } catch {
      console.error('Error refreshing token');
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      // Clear group selection data when authentication fails
      localStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP_ID);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP_NAME);
    }
    setIsLoading(false);
  }, [fetchUserProfile]);

  useEffect(() => {
    // Check for existing token on app load
    const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        if (decoded && typeof decoded === 'object' && 'exp' in decoded) {
          const exp = decoded.exp as number;
          if (exp * 1000 > Date.now()) {
            setToken(storedToken);
            fetchUserProfile();
          } else {
            // Token is expired, try to refresh
            refreshTokenAndFetchUser();
          }
        }
      } catch {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      }
    }
    
    // Load sidebar collapsed state from localStorage
    const savedSidebarCollapsed = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
    if (savedSidebarCollapsed !== null) {
      setSidebarCollapsed(JSON.parse(savedSidebarCollapsed));
    }
    
    setIsLoading(false);
  }, [fetchUserProfile, refreshTokenAndFetchUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    // Clear any existing group data to ensure clean state
    localStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP_ID);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP_NAME);
    
    try {
      const data = await apiClient.post<{
        access_token: string;
        refresh_token: string;
        user_id: number;
        email: string;
        full_name?: string;
      }>(`${API_CONSTANTS.BASE_URL}/auth/login`, { email, password });

      setToken(data.access_token);
      setUser({
        id: data.user_id,
        email: data.email,
        full_name: data.full_name,
        auth_provider: 'email',
        is_active: true,
        is_superuser: false,
      });
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access_token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Network error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName?: string) => {
    setIsLoading(true);
    setError(null);
    
    // Clear any existing group data to ensure clean state
    localStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP_ID);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP_NAME);
    
    try {
      const data = await apiClient.post<{
        access_token: string;
        refresh_token: string;
        user_id: number;
        email: string;
        full_name?: string;
      }>(`${API_CONSTANTS.BASE_URL}/auth/register`, { 
        email, 
        password, 
        full_name: fullName 
      });

      setToken(data.access_token);
      setUser({
        id: data.user_id,
        email: data.email,
        full_name: data.full_name,
        auth_provider: 'email',
        is_active: true,
        is_superuser: false,
      });
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access_token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Network error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (code: string) => {
    setIsLoading(true);
    setError(null);
    
    // Clear any existing group data to ensure clean state
    localStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP_ID);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP_NAME);
    
    try {
      const data = await apiClient.post<{
        access_token: string;
        refresh_token: string;
        user_id: number;
        email: string;
        full_name?: string;
      }>(`${API_CONSTANTS.BASE_URL}/auth/google/callback`, { code });

      setToken(data.access_token);
      setUser({
        id: data.user_id,
        email: data.email,
        full_name: data.full_name,
        auth_provider: 'google',
        is_active: true,
        is_superuser: false,
      });
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access_token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Network error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    // Clear group selection data to prevent data leakage between users
    localStorage.removeItem('selectedGroupId');
    localStorage.removeItem('selectedGroupName');
  };

  const handleSetSidebarCollapsed = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, JSON.stringify(collapsed));
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    loginWithGoogle,
    logout,
    isLoading,
    error,
    sidebarCollapsed,
    setSidebarCollapsed: handleSetSidebarCollapsed,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 