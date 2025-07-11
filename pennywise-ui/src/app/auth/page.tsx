'use client';

import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Box, Container } from '@mui/material';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { API_CONSTANTS } from '@/constants/layout';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <GoogleOAuthProvider clientId={API_CONSTANTS.GOOGLE_CLIENT_ID}>
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
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </Container>
      </Box>
    </GoogleOAuthProvider>
  );
};

export default AuthPage; 