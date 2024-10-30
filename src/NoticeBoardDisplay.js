import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, CircularProgress, Alert,
  Card, CardContent, List, ListItem, ListItemText,
  Box
} from '@mui/material';
import apiCall from './api';
import { useUserData } from './UserContext';

const NoticeBoardDisplay = () => {
  const { userData } = useUserData();
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const scriptId = 'dashboard_script';
      const action = 'getNoticeBoardMessages';
      const response = await apiCall(scriptId, action, {
        role: userData.role,
        googleToken: userData.googleToken,
        username: userData.username
      });
      
      if (response && Array.isArray(response)) {
        setMessages(response);
      } else {
        throw new Error('Failed to fetch noticeboard messages');
      }
    } catch (err) {
      console.error('Error fetching noticeboard messages:', err);
      setError('Failed to load noticeboard messages. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    if (userData) {
      fetchMessages();
    }
  }, [fetchMessages, userData]);

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
          Noticeboard
        </Typography>
        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}
      </CardContent>
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2 }}>
        <List sx={{ width: '100%' }}>
          {messages.map((message, index) => (
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
                primary={message.title}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="textPrimary">
                      {message.content}
                    </Typography>
                    <br />
                    <Typography component="span" variant="caption" color="textSecondary">
                      Posted on: {new Date(message.date).toLocaleString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Card>
  );
};

export default NoticeBoardDisplay;