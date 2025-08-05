'use client';

import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Box, Container } from '@mui/material';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { API_CONSTANTS } from '@/constants';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  // Check if Google OAuth is configured (non-empty client ID)
  const isGoogleOAuthConfigured: boolean = !!API_CONSTANTS.GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={API_CONSTANTS.GOOGLE_CLIENT_ID || 'dummy-client-id'}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Container maxWidth="sm">
          {isLogin ? (
            <LoginForm 
              onSwitchToRegister={() => setIsLogin(false)} 
              isGoogleOAuthConfigured={isGoogleOAuthConfigured}
            />
          ) : (
            <RegisterForm 
              onSwitchToLogin={() => setIsLogin(true)} 
              isGoogleOAuthConfigured={isGoogleOAuthConfigured}
            />
          )}
        </Container>
      </Box>
    </GoogleOAuthProvider>
  );
};

export default AuthPage; 