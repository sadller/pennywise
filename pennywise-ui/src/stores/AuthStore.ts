import { makeAutoObservable, runInAction } from 'mobx';
import { jwtDecode } from 'jwt-decode';
import { apiClient } from '@/services/apiClient';

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

class AuthStore {
  user: User | null = null;
  token: string | null = null;
  isLoading = true;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    // Don't initialize auth in constructor - will be called from client side
  }

  private API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  private async fetchUserProfile() {
    try {
      const userData = await apiClient.get<User>(`${this.API_BASE_URL}/auth/me`);
      runInAction(() => {
        this.user = userData;
      });
    } catch {
      console.error('Error fetching user profile');
      this.clearAuth();
    }
  }

  private async refreshTokenAndFetchUser() {
    if (typeof window === 'undefined') {
      runInAction(() => {
        this.isLoading = false;
      });
      return;
    }
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      runInAction(() => {
        this.isLoading = false;
      });
      return;
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const tokens = await response.json();
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', tokens.access_token);
          localStorage.setItem('refresh_token', tokens.refresh_token);
        }
        runInAction(() => {
          this.token = tokens.access_token;
        });
        await this.fetchUserProfile();
      } else {
        this.clearAuth();
      }
    } catch {
      console.error('Error refreshing token');
      this.clearAuth();
    }
    runInAction(() => {
      this.isLoading = false;
    });
  }

  private clearAuth() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
    runInAction(() => {
      this.token = null;
      this.user = null;
    });
  }

  initializeAuth() {
    if (typeof window === 'undefined') {
      runInAction(() => {
        this.isLoading = false;
      });
      return;
    }
    
    // Clean up old localStorage entries
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedGroupId');
      localStorage.removeItem('selectedGroupName');
      localStorage.removeItem('sidebarCollapsed');
    }
    
    // Check for existing token on app load
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        if (decoded && typeof decoded === 'object' && 'exp' in decoded) {
          const exp = decoded.exp as number;
          if (exp * 1000 > Date.now()) {
            runInAction(() => {
              this.token = storedToken;
            });
            this.fetchUserProfile();
          } else {
            // Token is expired, try to refresh
            this.refreshTokenAndFetchUser();
          }
        }
      } catch {
        this.clearAuth();
      }
    }
    

    
    runInAction(() => {
      this.isLoading = false;
    });
  }

  async login(email: string, password: string) {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });
    
    try {
      const data = await apiClient.post<{
        access_token: string;
        refresh_token: string;
        user_id: number;
        email: string;
        full_name?: string;
      }>(`${this.API_BASE_URL}/auth/login`, { email, password });

      runInAction(() => {
        this.token = data.access_token;
        this.user = {
          id: data.user_id,
          email: data.email,
          full_name: data.full_name,
          auth_provider: 'email',
          is_active: true,
          is_superuser: false,
        };
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
      }
    } catch (error) {
      runInAction(() => {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = 'Network error occurred';
        }
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async register(email: string, password: string, fullName?: string) {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });
    
    try {
      const data = await apiClient.post<{
        access_token: string;
        refresh_token: string;
        user_id: number;
        email: string;
        full_name?: string;
      }>(`${this.API_BASE_URL}/auth/register`, { 
        email, 
        password, 
        full_name: fullName 
      });

      runInAction(() => {
        this.token = data.access_token;
        this.user = {
          id: data.user_id,
          email: data.email,
          full_name: data.full_name,
          auth_provider: 'email',
          is_active: true,
          is_superuser: false,
        };
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
      }
    } catch (error) {
      runInAction(() => {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = 'Network error occurred';
        }
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async loginWithGoogle(code: string) {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });
    
    try {
      const data = await apiClient.post<{
        access_token: string;
        refresh_token: string;
        user_id: number;
        email: string;
        full_name?: string;
      }>(`${this.API_BASE_URL}/auth/google/callback`, { code });

      runInAction(() => {
        this.token = data.access_token;
        this.user = {
          id: data.user_id,
          email: data.email,
          full_name: data.full_name,
          auth_provider: 'google',
          is_active: true,
          is_superuser: false,
        };
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
      }
    } catch (error) {
      runInAction(() => {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = 'Network error occurred';
        }
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  logout() {
    runInAction(() => {
      this.user = null;
      this.token = null;
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  }



  get isAuthenticated() {
    return !!this.token && !!this.user;
  }
}

export const authStore = new AuthStore(); 