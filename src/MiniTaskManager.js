import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, Typography, CircularProgress, List, ListItem, ListItemText, Box } from '@mui/material';
import { useUserData } from './UserContext';
import apiCall from './api';

const MiniTaskManager = ({ onOpenFullApp }) => {
  const { userData } = useUserData();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!userData || !userData.username || !userData.googleToken) {
      console.error('User data is not available');
      setLoading(false);
      return;
    }

    try {
      const scriptId = 'task_script';
      const action = 'getFocusedData';
      const response = await apiCall(scriptId, action, {
        username: userData.username,
        googleToken: userData.googleToken
      });
      setTasks(response); // Display all tasks
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    if (userData) {
      fetchTasks();
    }
  }, [userData, fetchTasks]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card onClick={onOpenFullApp} style={{ cursor: 'pointer' }}>
      <CardContent>
        <Typography variant="h6">Recent Tasks</Typography>
        <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
          <List dense>
            {tasks.map(task => (
              <ListItem key={task.uniqueId}>
                <ListItemText 
                  primary={task.name} 
                  secondary={`Subtasks: ${task.subtasks.length}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MiniTaskManager;