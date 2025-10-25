// UI constants used across the application
export const UI_CONSTANTS = {
  LAYOUT: {
    HEADER_HEIGHT: 80,
    HEADER_HEIGHT_MOBILE: 60,
    DRAWER_WIDTH: 280,
    COLLAPSED_WIDTH: 64,
    ARROW_BTN_SIZE: 32,
    MOBILE_BREAKPOINT: 900, // md breakpoint
  },
  ANIMATION: {
    TRANSITION_DURATION: 300,
    TRANSITION_EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  FILE_UPLOAD: {
    MAX_FILES: 20,
    ACCEPTED_TYPES: '.csv',
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  },
} as const;

// Common error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred',
  AUTHENTICATION_FAILED: 'Authentication failed',
  PERMISSION_DENIED: 'You do not have permission to perform this action',
  RESOURCE_NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Please check your input and try again',
  FILE_UPLOAD_ERROR: 'Error uploading file',
  CSV_PARSE_ERROR: 'Error parsing CSV file',
} as const;

 