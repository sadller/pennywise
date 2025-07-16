// Layout constants used across the application
export const LAYOUT_CONSTANTS = {
  HEADER_HEIGHT: 80,
  DRAWER_WIDTH: 280,
  COLLAPSED_WIDTH: 64,
  ARROW_BTN_SIZE: 32,
  MOBILE_BREAKPOINT: 900, // md breakpoint
} as const;

// API constants
export const API_CONSTANTS = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
} as const; 