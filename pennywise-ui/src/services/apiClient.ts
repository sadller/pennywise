import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface TokenPayload {
  exp: number;
  sub: string;
  type?: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

interface QueueItem<T> {
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

class ApiClient {
  private isRefreshing = false;
  private failedQueue: QueueItem<unknown>[] = [];

  private processQueue(error: Error | null, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private async refreshToken(): Promise<AuthTokens | null> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const tokens = await response.json();
        localStorage.setItem('auth_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        return tokens;
      } else {
        // Refresh token is invalid, clear storage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        return null;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return {};
    }

    // Check if token is expired
    if (this.isTokenExpired(token)) {
      // Token is expired, try to refresh
      this.refreshToken().then((tokens) => {
        if (tokens) {
          // Token refreshed successfully, retry the request
          this.processQueue(null, tokens.access_token);
        } else {
          // Refresh failed, redirect to login
          this.processQueue(new Error('Authentication failed'));
          window.location.href = '/auth';
        }
      });
      
      // Return current token for now, the request will be retried
      return {
        'Authorization': `Bearer ${token}`,
      };
    }

    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const config: RequestInit = {
      ...options,
      headers,
    };

    // Construct the full URL
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

    try {
      const response = await fetch(fullUrl, config);

      if (response.status === 401 && !this.isRefreshing) {
        this.isRefreshing = true;

        const tokens = await this.refreshToken();
        
        if (tokens) {
          // Retry the original request with new token
          const newHeaders = {
            ...headers,
            'Authorization': `Bearer ${tokens.access_token}`,
          };
          
          const retryResponse = await fetch(fullUrl, {
            ...config,
            headers: newHeaders,
          });

          this.isRefreshing = false;
          this.processQueue(null, tokens.access_token);

          if (retryResponse.ok) {
            return retryResponse.json();
          } else {
            throw new Error(`Request failed: ${retryResponse.status}`);
          }
        } else {
          this.isRefreshing = false;
          this.processQueue(new Error('Authentication failed'));
          window.location.href = '/auth';
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (this.isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise<T>((resolve, reject) => {
          this.failedQueue.push({ resolve: resolve as (value: unknown) => void, reject });
        });
      }
      throw error;
    }
  }

  async get<T>(url: string): Promise<T> {
    return this.request<T>(url);
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const headers: Record<string, string> = {};
    if (data) {
      headers['Content-Type'] = 'application/json';
    }
    
    return this.request<T>(url, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const headers: Record<string, string> = {};
    if (data) {
      headers['Content-Type'] = 'application/json';
    }
    
    return this.request<T>(url, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>(url, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(); 