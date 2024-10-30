import React, { useState, useCallback } from 'react';
import { 
  Typography, Container, TextField, Button, Box, Tabs, Tab,
  Alert, CircularProgress, useTheme
} from '@mui/material';
import apiCall from './api';
import { useUserData } from './UserContext';
import { useCheckIn } from './CheckInContext';

const AuthComponent = ({ onAuthenticated }) => {
  const theme = useTheme();
  const { setUserData } = useUserData();
  const { updateStatus } = useCheckIn();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authData, setAuthData] = useState({ username: '', password: '', email: '' });
  const [authTab, setAuthTab] = useState(0);

  const handleAuth = useCallback(async (action) => {
    setLoading(true);
    setError(null);
    try {
      const scriptId = 'dashboard_script';
      const response = await apiCall(scriptId, action, authData);
      
      console.log('Auth response:', response); // Debug log
      
      if (!response.success) {
        throw new Error(response.message || 'Authentication failed');
      }
      
      if (action === 'login') {
        const newUserData = {
          username: response.username,
          role: response.role,
          googleToken: response.token,
          status: response.additionalData.status,
          additionalData: response.additionalData,
          jobDescription: response.jobDescription // Add this line
        };
        console.log('Setting user data:', newUserData); // Debug log
        setUserData(newUserData);
        updateStatus(newUserData.status);
        onAuthenticated(true);
      }
      
      return true;
    } catch (err) {
      console.error(`${action} error:`, err);
      setError(err.message || `An unexpected error occurred during ${action}.`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [authData, setUserData, updateStatus, onAuthenticated]);

  const handleAuthSubmit = useCallback(async (e) => {
    e.preventDefault();
    const success = await handleAuth(authTab === 0 ? 'login' : 'create-account');
    if (!success) {
      setAuthData(prev => ({ ...prev, password: '' }));
    }
  }, [handleAuth, authTab]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setAuthData(prev => ({ ...prev, [name]: value }));
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor={theme.palette.background.default}
    >
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom>
            {authTab === 0 ? "Sign In" : "Create Account"}
          </Typography>
          <Tabs value={authTab} onChange={(e, newValue) => setAuthTab(newValue)} sx={{ mb: 2 }}>
            <Tab label="Sign In" />
            <Tab label="Create Account" />
          </Tabs>
          {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
          <Box component="form" onSubmit={handleAuthSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={authData.username}
              onChange={handleInputChange}
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
              value={authData.password}
              onChange={handleInputChange}
            />
            {authTab === 1 && (
              <TextField
                margin="normal"
                required
                fullWidth
                name="email"
                label="Email Address"
                type="email"
                id="email"
                autoComplete="email"
                value={authData.email}
                onChange={handleInputChange}
              />
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : (authTab === 0 ? "Sign In" : "Create Account")}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthComponent;