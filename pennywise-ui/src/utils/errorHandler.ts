import { ERROR_MESSAGES } from '@/constants';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export class ErrorHandler {
  static parseError(error: unknown): ApiError {
    if (error instanceof Error) {
      return {
        message: error.message,
      };
    }
    
    if (typeof error === 'string') {
      return {
        message: error,
      };
    }
    
    return {
      message: ERROR_MESSAGES.NETWORK_ERROR,
    };
  }

  static isNetworkError(error: unknown): boolean {
    const parsedError = this.parseError(error);
    return parsedError.message.includes('Network') || 
           parsedError.message.includes('fetch') ||
           parsedError.message.includes('Failed to fetch');
  }

  static isAuthError(error: unknown): boolean {
    const parsedError = this.parseError(error);
    return parsedError.message.includes('401') || 
           parsedError.message.includes('Unauthorized') ||
           parsedError.message.includes('Authentication');
  }

  static isPermissionError(error: unknown): boolean {
    const parsedError = this.parseError(error);
    return parsedError.message.includes('403') || 
           parsedError.message.includes('Forbidden') ||
           parsedError.message.includes('not a member');
  }

  static getErrorMessage(error: unknown): string {
    const parsedError = this.parseError(error);
    
    if (this.isAuthError(error)) {
      return ERROR_MESSAGES.AUTHENTICATION_FAILED;
    }
    
    if (this.isPermissionError(error)) {
      return ERROR_MESSAGES.PERMISSION_DENIED;
    }
    
    if (this.isNetworkError(error)) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    
    return parsedError.message || ERROR_MESSAGES.NETWORK_ERROR;
  }
} 