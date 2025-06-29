# Automatic Token Refresh Implementation

This document describes the automatic token refresh functionality implemented in the Pennywise application.

## Overview

The application now includes automatic token refresh to handle 401 (Unauthorized) errors gracefully without requiring users to manually log out or reload the page.

## Backend Changes

### 1. Configuration Updates
- Added `REFRESH_TOKEN_EXPIRE_DAYS` setting (default: 7 days)
- Access tokens expire in 30 minutes, refresh tokens in 7 days

### 2. New Endpoints
- `POST /api/v1/auth/refresh` - Refresh access token using refresh token

### 3. Updated Endpoints
- All authentication endpoints now return both `access_token` and `refresh_token`
- Login, register, and Google OAuth callback endpoints updated

### 4. Token Management
- Added `create_refresh_token()` and `verify_refresh_token()` functions
- Refresh tokens include a `type: "refresh"` claim for validation

## Frontend Changes

### 1. API Client (`src/services/apiClient.ts`)
- Automatic token expiration detection
- Automatic refresh token requests on 401 errors
- Request queuing during token refresh
- Automatic retry of failed requests with new tokens
- Automatic redirect to login page if refresh fails

### 2. Authentication Context (`src/contexts/AuthContext.tsx`)
- Stores both access and refresh tokens in localStorage
- Automatic token refresh on app initialization
- Updated login/register methods to handle refresh tokens

### 3. Service Updates
- All service methods now use the new API client
- Removed manual token parameter passing
- Automatic authentication handling

## How It Works

### Token Refresh Flow
1. **Request Made**: Any API request is made through the API client
2. **Token Check**: Client checks if access token is expired
3. **401 Response**: If server returns 401, client attempts token refresh
4. **Refresh Request**: Client sends refresh token to `/auth/refresh`
5. **New Tokens**: Server returns new access and refresh tokens
6. **Request Retry**: Original request is retried with new access token
7. **Queue Processing**: Any requests made during refresh are processed

### Error Handling
- If refresh token is invalid/expired, user is redirected to login
- If refresh fails due to network issues, user is redirected to login
- All tokens are cleared from localStorage on authentication failure

## Benefits

1. **Seamless User Experience**: No more manual logouts or page reloads
2. **Automatic Recovery**: Failed requests are automatically retried
3. **Security**: Short-lived access tokens with longer-lived refresh tokens
4. **Concurrent Request Handling**: Multiple requests during refresh are queued and processed

## Usage

### For Developers
- Use `apiClient.get()`, `apiClient.post()`, etc. instead of direct fetch calls
- No need to manually pass tokens or handle 401 errors
- The API client handles all authentication automatically

### Example
```typescript
// Before (manual token handling)
const response = await fetch('/api/endpoint', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// After (automatic token handling)
const data = await apiClient.get('/api/endpoint');
```

## Security Considerations

1. **Token Storage**: Tokens are stored in localStorage (consider httpOnly cookies for production)
2. **Token Expiration**: Access tokens expire quickly (30 minutes) for security
3. **Refresh Token Rotation**: Each refresh generates new refresh tokens
4. **Automatic Cleanup**: Invalid tokens are automatically removed from storage

## Testing

To test the token refresh functionality:

1. Login to the application
2. Wait for the access token to expire (30 minutes) or manually expire it
3. Make any API request (e.g., navigate to dashboard, create a transaction)
4. The request should automatically refresh the token and succeed
5. Check browser network tab to see the refresh request

## Troubleshooting

### Common Issues
1. **Infinite Refresh Loop**: Check if refresh token endpoint is working correctly
2. **401 Still Occurring**: Verify refresh token is valid and not expired
3. **Request Queue Issues**: Check if multiple requests are being made simultaneously

### Debug Mode
Enable console logging in the API client to see token refresh operations:
```typescript
// Add to apiClient.ts for debugging
console.log('Token refresh initiated');
console.log('Request queued during refresh');
``` 