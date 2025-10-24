'use client';

import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/stores/StoreProvider';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigationLoading } from '@/hooks/useNavigationLoading';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Divider,
  Container,
  Paper,
  IconButton,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  isGoogleOAuthConfigured?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = observer(({ onSwitchToRegister, isGoogleOAuthConfigured = true }) => {
  const { auth } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { startNavigation } = useNavigationLoading();

  // Redirect to transactions if user is logged in
  React.useEffect(() => {
    if (auth.user) {
      startNavigation();
      router.replace('/transactions');
    }
  }, [auth.user, router, startNavigation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await auth.login(email, password);
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (credentialResponse.credential) {
      try {
        await auth.loginWithGoogle(credentialResponse.credential);
      } catch (error) {
        console.error('Google login error:', error);
      }
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, position: 'relative' }}>
        {/* Cancel Button */}
        <IconButton
          onClick={handleCancel}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
            },
          }}
        >
          <ArrowBack />
        </IconButton>

        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Welcome Back
        </Typography>
        
        {auth.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {auth.error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={auth.isLoading}
          >
            {auth.isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Box>

        {isGoogleOAuthConfigured && (
          <>
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Or continue with
              </Typography>
            </Divider>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
              />
            </Box>
          </>
        )}

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don&apos;t have an account?{' '}
            <Button
              onClick={onSwitchToRegister}
              sx={{ textTransform: 'none' }}
            >
              Sign up
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
});

export default LoginForm; 