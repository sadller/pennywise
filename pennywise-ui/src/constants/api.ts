// API constants used across the application
export const API_CONSTANTS = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
      GOOGLE_CALLBACK: '/auth/google/callback',
    },
    TRANSACTIONS: {
      BASE: '/transactions',
      BULK: '/transactions/bulk',
    },
    GROUPS: {
      BASE: '/groups',
      MEMBERS: (groupId: number) => `/groups/${groupId}/members`,
      INVITE: (groupId: number) => `/groups/${groupId}/invite`,
    },
    NOTIFICATIONS: {
      BASE: '/notifications',
      UNREAD_COUNT: '/notifications/unread-count',
    },
    DASHBOARD: {
      OVERVIEW: '/dashboard/overview',
    },
  },
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const; 