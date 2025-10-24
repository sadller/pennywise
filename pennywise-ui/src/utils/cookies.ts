// Cookie utility functions for managing authentication tokens
export class CookieManager {
  private static readonly COOKIE_OPTIONS = {
    httpOnly: false, // We need to access from JavaScript
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'lax' as const, // CSRF protection
    path: '/', // Available across the entire site
  };

  private static readonly TOKEN_COOKIE_NAME = 'auth_token';
  private static readonly REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';

  /**
   * Set a cookie with the given name and value
   */
  static setCookie(name: string, value: string, days: number = 7): void {
    if (typeof window === 'undefined') return;

    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

    const cookieString = [
      `${name}=${value}`,
      `expires=${expires.toUTCString()}`,
      `path=${this.COOKIE_OPTIONS.path}`,
      `samesite=${this.COOKIE_OPTIONS.sameSite}`,
      ...(this.COOKIE_OPTIONS.secure ? ['secure'] : []),
    ].join('; ');

    document.cookie = cookieString;
  }

  /**
   * Get a cookie value by name
   */
  static getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null;

    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  /**
   * Remove a cookie by name
   */
  static removeCookie(name: string): void {
    if (typeof window === 'undefined') return;

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${this.COOKIE_OPTIONS.path};`;
  }

  /**
   * Set authentication token cookie
   */
  static setAuthToken(token: string): void {
    this.setCookie(this.TOKEN_COOKIE_NAME, token, 1); // 1 day for access token
  }

  /**
   * Set refresh token cookie
   */
  static setRefreshToken(token: string): void {
    this.setCookie(this.REFRESH_TOKEN_COOKIE_NAME, token, 7); // 7 days for refresh token
  }

  /**
   * Get authentication token from cookie
   */
  static getAuthToken(): string | null {
    return this.getCookie(this.TOKEN_COOKIE_NAME);
  }

  /**
   * Get refresh token from cookie
   */
  static getRefreshToken(): string | null {
    return this.getCookie(this.REFRESH_TOKEN_COOKIE_NAME);
  }

  /**
   * Remove authentication tokens
   */
  static clearAuthTokens(): void {
    this.removeCookie(this.TOKEN_COOKIE_NAME);
    this.removeCookie(this.REFRESH_TOKEN_COOKIE_NAME);
  }

  /**
   * Set both authentication tokens
   */
  static setAuthTokens(accessToken: string, refreshToken: string): void {
    this.setAuthToken(accessToken);
    this.setRefreshToken(refreshToken);
  }
}

