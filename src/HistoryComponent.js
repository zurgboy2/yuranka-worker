import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Paper, Typography, IconButton, List, ListItem, ListItemText, 
  CircularProgress, Alert, Box
} from '@mui/material';
import { useUserData } from './UserContext';
import apiCall from './api';

const HistoryComponent = () => {
  const { userData } = useUserData();
  const [allHistory, setAllHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const scriptId = 'dashboard_script';
      const action = 'getWorkHistory';
      const response = await apiCall(scriptId, action, {
        username: userData.username,
        googleToken: userData.googleToken
      });

      if (response && response.success && Array.isArray(response.history)) {
        setAllHistory(response.history);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      setError("An error occurred while fetching history: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleMonthChange = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + direction);
      return newDate;
    });
  };

  const filteredHistory = useMemo(() => {
    return allHistory.filter(entry => 
      parseInt(entry.month) === currentDate.getMonth() + 1 &&
      parseInt(entry.year) === currentDate.getFullYear()
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [allHistory, currentDate]);

  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => handleMonthChange(-1)} aria-label="Previous month">
          &lt;
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Typography>
        <IconButton onClick={() => handleMonthChange(1)} aria-label="Next month">
          &gt;
        </IconButton>
      </Box>
      
      {loading && <CircularProgress sx={{ alignSelf: 'center', my: 2 }} />}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {!loading && !error && (
        <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {filteredHistory.length > 0 ? (
            filteredHistory.map((entry, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={`${entry.year}-${entry.month}-${entry.day}`}
                  secondary={`Work Done: ${entry.workDone || 'N/A'}, Amount: ${entry.amount || 'N/A'}€`}
                />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No work history found for this month." />
            </ListItem>
          )}
        </List>
      )}
    </Paper>
  );
};

export default HistoryComponent;