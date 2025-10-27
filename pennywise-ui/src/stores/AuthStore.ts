import { makeAutoObservable, runInAction } from 'mobx';
import { jwtDecode } from 'jwt-decode';
import { apiClient } from '@/services/apiClient';
import { API_CONSTANTS, ERROR_MESSAGES } from '@/constants';
import { User } from '@/types/user';
import { CookieManager } from '@/utils/cookies';

class AuthStore {
  user: User | null = null;
  token: string | null = null;
  isLoading = true;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    // Don't initialize auth in constructor - will be called from client side
  }

  private async fetchUserProfile() {
    const { rootStore } = await import('@/stores/RootStore');
    try {
      const userData = await apiClient.get<User>(API_CONSTANTS.ENDPOINTS.AUTH.ME);
      runInAction(() => {
        this.user = userData;
        rootStore.data.setCurrentUser(userData);
      });
    } catch {
      console.error('Error fetching user profile');
      this.clearAuth();
    } finally {
      // Mark loading as complete once we have attempted to fetch the user
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  private async refreshTokenAndFetchUser() {
    if (typeof window === 'undefined') {
      runInAction(() => {
        this.isLoading = false;
      });
      return;
    }
    const refreshToken = CookieManager.getRefreshToken();
    if (!refreshToken) {
      runInAction(() => {
        this.isLoading = false;
      });
      return;
    }

    try {
      const response = await fetch(`${API_CONSTANTS.BASE_URL}${API_CONSTANTS.ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        credentials: 'include', // Include cookies in requests
      });

      if (response.ok) {
        const tokens = await response.json();
        CookieManager.setAuthTokens(tokens.access_token, tokens.refresh_token);
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
      CookieManager.clearAuthTokens();
    }
    runInAction(async () => {
      const { rootStore } = await import('@/stores/RootStore');
      this.token = null;
      this.user = null;
      this.error = null;
      this.isLoading = false;
      rootStore.data.setCurrentUser(null);
    });
  }

  initializeAuth() {
    if (typeof window === 'undefined') {
      runInAction(() => {
        this.isLoading = false;
      });
      return;
    }

    // Begin loading state while we determine authentication
    runInAction(() => {
      this.isLoading = true;
    });
    
    // Check for existing token on app load
    const storedToken = CookieManager.getAuthToken();
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        if (decoded && typeof decoded === 'object' && 'exp' in decoded) {
          const exp = decoded.exp as number;
          if (exp * 1000 > Date.now()) {
            runInAction(() => {
              this.token = storedToken;
            });
            // fetchUserProfile will set isLoading to false when done
            this.fetchUserProfile();
            return; // Do not clear loading state yet
          }
          // Token is expired, try to refresh (this function will handle loading state)
          this.refreshTokenAndFetchUser();
          return;
        }
      } catch {
        this.clearAuth();
        return;
      }
    }

    // No valid token found – clear auth state and stop loading
    this.clearAuth();
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
      }>(API_CONSTANTS.ENDPOINTS.AUTH.LOGIN, { email, password });

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
        CookieManager.setAuthTokens(data.access_token, data.refresh_token);
      }
    } catch (error) {
      runInAction(() => {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = ERROR_MESSAGES.NETWORK_ERROR;
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
      }>(API_CONSTANTS.ENDPOINTS.AUTH.REGISTER, { 
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
        CookieManager.setAuthTokens(data.access_token, data.refresh_token);
      }
    } catch (error) {
      runInAction(() => {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = ERROR_MESSAGES.NETWORK_ERROR;
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
      }>(API_CONSTANTS.ENDPOINTS.AUTH.GOOGLE_CALLBACK, { code });

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
        CookieManager.setAuthTokens(data.access_token, data.refresh_token);
      }
    } catch (error) {
      runInAction(() => {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = ERROR_MESSAGES.NETWORK_ERROR;
        }
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async logout() {
    try {
      // Call logout endpoint to clear server-side cookies
      await apiClient.post(API_CONSTANTS.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always clear local auth state
      this.clearAuth();
    }
  }

  get isAuthenticated() {
    return !!this.token && !!this.user;
  }
}

export const authStore = new AuthStore(); 