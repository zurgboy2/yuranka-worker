import React, { useState, useEffect, useCallback } from 'react';
import { 
  Paper, Typography, Box, List, ListItem, ListItemText,
  CircularProgress, Divider, useTheme, Chip, Button
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useUserData } from './UserContext';
import apiCall from './api';

const WorkerActivityDisplay = () => {
  const { userData } = useUserData();
  const [workerData, setWorkerData] = useState([]);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();

  const fetchWorkerActivity = useCallback(async () => {
    try {
      setLoading(true);
      const scriptId = 'dashboard_script';
      const action = 'getWorkerActivity';
      
      const response = await apiCall(scriptId, action, {
        googleToken: userData.googleToken,
        username: userData.username
      });
      
      if (Array.isArray(response)) {
        setWorkerData(response);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Failed to fetch worker activity:', error);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    fetchWorkerActivity();
  }, [fetchWorkerActivity]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Checked In':
        return '#4caf50';
      case 'Checked Out':
        return '#f44336';
      case 'Going on Break':
        return '#ff9800';
      case 'Returning from Break':
        return '#2196f3';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return <CircularProgress sx={{ color: '#8b0000' }} />;
  }

  return (
    <Paper elevation={3} sx={{ 
      height: '100%',
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '800px',
      overflow: 'hidden',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Typography variant="h6" sx={{ color: '#ffffff' }}>Worker Activity</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={fetchWorkerActivity}
          sx={{ color: '#ffffff', borderColor: '#4a4a4a' }}
        >
          Refresh
        </Button>
      </Box>
      <Box sx={{ flexGrow: 1, overflow: 'auto', overflowX: 'hidden' }}>
        <List>
          {workerData.map((worker, index) => (
            <React.Fragment key={index}>
              <ListItem
                alignItems="flex-start"
                sx={{
                  '&:hover': {
                    backgroundColor: '#2a2a2a',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography color="#ffffff">{worker.name}</Typography>
                      <Chip 
                        label={worker.status}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(worker.status),
                          color: '#ffffff',
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography component="span" variant="body2" color="#cccccc">
                        Hours Worked: {worker.hoursWorked.toFixed(2)}
                      </Typography>
                      <Typography component="span" variant="body2" color="#cccccc" sx={{ ml: 2 }}>
                        Unique Cards: {worker.uniqueCards}
                      </Typography>
                      <Typography component="span" variant="body2" color="#cccccc" sx={{ ml: 2 }}>
                        Total Cards: {worker.totalCards}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < workerData.length - 1 && <Divider variant="inset" component="li" sx={{ backgroundColor: '#333333' }} />}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default WorkerActivityDisplay;