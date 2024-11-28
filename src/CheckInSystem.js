import React, { useState } from 'react';
import { 
  Paper, Typography, Button, Box, CircularProgress,
  Alert, AlertTitle
} from '@mui/material';
import { useUserData } from './UserContext';
import { useCheckIn } from './CheckInContext';
import apiCall from './api';

const CheckInSystem = React.memo(() => {
  const { userData, avatarSettings, setAvatarSettings } = useUserData();
  const { status, updateStatus } = useCheckIn();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const iconData = {
    'Check In': '🟢',
    'Check Out': '🔴',
    'Going on Break': '☕',
    'Returning from Break': '🔙'
  };

  const statusActions = {
    'Checked In': [
      {label: 'Check Out', action: 'Checked Out'},
      {label: 'Going on Break', action: 'Going on Break'}
    ],
    'Checked Out': [
      {label: 'Check In', action: 'Checked In'}
    ],
    'Going on Break': [
      {label: 'Returning from Break', action: 'Returning from Break'}
    ],
    'Returning from Break': [
      {label: 'Check Out', action: 'Checked Out'},
      {label: 'Going on Break', action: 'Going on Break'}
    ],
    'default': [
      {label: 'Check In', action: 'Checked In'}
    ]
  };

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    setError(null);
    let workDone = '';
    
    if (newStatus === "Checked Out") {
      workDone = prompt("What did you do today?");
      if (workDone === null) {
        setLoading(false);
        return;
      }
    }

    try {
      const scriptId = 'dashboard_script';
      const action = 'statusChange';
      const timestamp = new Date().toISOString();
      const response = await apiCall(scriptId, action, {
        googleToken: userData.googleToken,
        username: userData.username,
        workDone: workDone,
        status: newStatus,
        timestamp: timestamp
      });

      if (response.success) {
        updateStatus(newStatus);
      } else {
        setError("Failed to change status. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStatusActions = statusActions[status] || statusActions['default'];

  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
        <Typography variant="h5" gutterBottom>Account Details</Typography>
        <Typography variant="body1" gutterBottom>Current Status: {status}</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          {currentStatusActions.map(({ label, action }) => (
            <Button
              key={label}
              variant="contained"
              onClick={() => handleStatusChange(action)}
              disabled={loading}
              startIcon={iconData[label]}
            >
              {label}
            </Button>
          ))}
        </Box>
        {loading && <CircularProgress />}
        {error && (
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}
      </Grid>
      <Grid item xs={12} md={4}>
          <PixelAvatar 
            settings={avatarSettings}
            onSettingsChange={setAvatarSettings}
            status={status}
          />
        </Grid>
    </Grid>
    </Paper>
  );
});

export default CheckInSystem;