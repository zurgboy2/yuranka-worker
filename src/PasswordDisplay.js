import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, CircularProgress, Alert, 
  Card, CardContent, List, ListItem, ListItemText,
  Button, Collapse, Box, Stack
} from '@mui/material';
import apiCall from './api';
import { useUserData } from './UserContext'; // Import the useUserData hook

const PasswordDisplay = () => {
  const { userData } = useUserData(); // Use the userData context
  const [passwords, setPasswords] = useState([]);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [copySuccess, setCopySuccess] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPasswords = useCallback(async () => {
    try {
      setLoading(true);
      const scriptId = 'dashboard_script';
      const action = 'getUserPassforrole';
      const response = await apiCall(scriptId, action, { 
        role: userData.role, 
        googleToken: userData.googleToken, 
        username: userData.username 
      });
      
      if (response && Array.isArray(response)) {
        setPasswords(response);
      } else {
        throw new Error('Failed to fetch passwords');
      }
    } catch (err) {
      console.error('Error fetching passwords:', err);
      setError('Failed to load passwords. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    if (userData) {
      fetchPasswords();
    }
  }, [fetchPasswords, userData]);


  const handleTogglePasswordVisibility = useCallback((index) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  }, []);

  const handleCopyPassword = useCallback((password, index) => {
    navigator.clipboard.writeText(password).then(() => {
      setCopySuccess(prev => ({
        ...prev,
        [index]: true
      }));
      setTimeout(() => {
        setCopySuccess(prev => ({
          ...prev,
          [index]: false
        }));
      }, 3000);
    }, (err) => {
      console.error('Failed to copy password:', err);
      setError('Failed to copy password. Please try again.');
      setTimeout(() => setError(null), 3000);
    });
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 0 }}>
        <Typography variant="h6" gutterBottom>
          Passwords for {userData.role}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}
      </CardContent>
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2 }}>
        <List sx={{ width: '100%' }}>
          {passwords.map((entry, index) => (
            <ListItem 
              key={index} 
              divider 
              sx={{ 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                py: 2
              }}
            >
              <ListItemText 
                primary={entry.website}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="textPrimary">
                      Username: {entry.username}
                    </Typography>
                    <br />
                    <Typography component="span" variant="body2" color="textPrimary">
                      Password: {visiblePasswords[index] ? entry.password : '••••••••'}
                    </Typography>
                  </>
                }
                sx={{ mb: 1 }}
              />
              <Stack direction="row" spacing={1}>
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => handleTogglePasswordVisibility(index)}
                >
                  {visiblePasswords[index] ? 'Hide' : 'Show'}
                </Button>
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => handleCopyPassword(entry.password, index)}
                >
                  Copy
                </Button>
              </Stack>
              <Collapse in={copySuccess[index]} timeout="auto" unmountOnExit sx={{ width: '100%', mt: 1 }}>
                <Alert severity="success">Password copied!</Alert>
              </Collapse>
            </ListItem>
          ))}
        </List>
      </Box>
    </Card>
  );
};

export default PasswordDisplay;