import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, CardContent, Typography, Grid, Select, MenuItem, 
  TextField, Button, Modal, Box, Chip, CircularProgress
} from '@mui/material';
import { useUserData } from './UserContext';
import apiCall from './api';

// Main App Component
const TaskManager = () => {
  const { userData } = useUserData();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [personResponsibleFilter, setPersonResponsibleFilter] = useState('');
  const [uniquePersons, setUniquePersons] = useState([]);

  const fetchTasks = useCallback(async () => {
    if (!userData || !userData.username || !userData.googleToken) {
      console.error('User data is not available');
      setLoading(false);
      return;
    }

    try {
      const scriptId = 'task_script';
      const action = 'getTasksData';
      const response = await apiCall(scriptId, action, {
        username: userData.username,
        googleToken: userData.googleToken
      });
      setTasks(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  }, [userData]);
  
    const fetchUniquePersons = useCallback(async () => {
      if (!userData || !userData.username || !userData.googleToken) {
        console.error('User data is not available');
        return;
      }
  
      try {
        const scriptId = 'task_script';
        const action = 'getUniquePersonsResponsible';
        const response = await apiCall(scriptId, action, {
          username: userData.username,
          googleToken: userData.googleToken
        });
        setUniquePersons(response);
      } catch (error) {
        console.error('Error fetching unique persons:', error);
      }
    }, [userData]);
  
    useEffect(() => {
      if (userData) {
        fetchTasks();
        fetchUniquePersons();
      }
    }, [userData, fetchTasks, fetchUniquePersons]);

  const handlePersonFilterChange = (event) => {
    setPersonResponsibleFilter(event.target.value);
  };

  const filteredTasks = personResponsibleFilter
    ? tasks.filter(task => 
        task.subtasks.some(subtask => 
          subtask.personResponsible.toLowerCase().includes(personResponsibleFilter.toLowerCase())
        )
      )
    : tasks;

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  const updateSubtaskLocal = (taskId, subtaskId, updatedFields) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.uniqueId === taskId 
          ? {
              ...task,
              subtasks: task.subtasks.map(subtask => 
                subtask.uniqueId === subtaskId 
                  ? { ...subtask, ...updatedFields }
                  : subtask
              )
            }
          : task
      )
    );
  };

  return (
    <Box className="p-4">
      <Box className="mb-4">
        <Select
          value={personResponsibleFilter}
          onChange={handlePersonFilterChange}
          displayEmpty
          fullWidth
        >
          <MenuItem value="">All</MenuItem>
          {uniquePersons.map((person, index) => (
            <MenuItem key={index} value={person}>{person}</MenuItem>
          ))}
        </Select>
      </Box>
      <Grid container spacing={2}>
        {filteredTasks.map(task => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={task.uniqueId}>
            <TaskCard 
              task={task} 
              onUpdate={fetchTasks} 
              updateSubtaskLocal={updateSubtaskLocal}
              userData={userData} 
            />
          </Grid>
        ))}
      </Grid>
      <AddTaskForm onTaskAdded={fetchTasks} userData={userData} />
    </Box>
  );
};

  const TaskCard = ({ task, onUpdate, updateSubtaskLocal, userData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const completionColor = () => {
      const completedCount = task.subtasks.filter(st => st.status === 'Completed').length;
      const totalCount = task.subtasks.length;
      const proportion = totalCount > 0 ? completedCount / totalCount : 0;
      if (proportion < 0.33) return '#FFCCCB';
      if (proportion < 0.67) return '#FFFACD';
      return '#90EE90';
    };

    const handleDelete = async () => {
      if (window.confirm('Are you sure you want to delete this task?')) {
        setIsDeleting(true);
        try {
          const scriptId = 'task_script';
          const action = 'deltask';
          const response = await apiCall(scriptId, action, {
            username: userData.username,
            googleToken: userData.googleToken,
            name: task.name,
            uniqueId: task.uniqueId
          });
          
          if (response && response.success) {
            console.log('Task deleted successfully');
            onUpdate();
          } else {
            console.error('Failed to delete task:', response ? response.message : 'No success response received');
            alert('Failed to delete task. Please try again.');
          }
        } catch (error) {
          console.error('Error deleting task:', error);
          alert('An error occurred while deleting the task. Please try again.');
        } finally {
          setIsDeleting(false);
        }
      }
    };

    return (
      <Card sx={{ 
        backgroundColor: completionColor(),
        transition: '0.3s',
        '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 }
      }}>
        <CardContent>
          <Typography variant="h6" onClick={() => setIsOpen(true)} sx={{ cursor: 'pointer', mb: 2 }}>
            {task.name}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Chip label={`${task.subtasks.length} subtasks`} size="small" />
            {isDeleting ? (
              <CircularProgress size={24} />
            ) : (
              <Button 
                onClick={handleDelete} 
                size="small" 
                color="error"
                disabled={isDeleting}
              >
                ✖
              </Button>
            )}
          </Box>
        </CardContent>
        <SubtaskModal
          open={isOpen}
          onClose={() => setIsOpen(false)}
          task={task}
          onUpdate={onUpdate}
          updateSubtaskLocal={updateSubtaskLocal}
          userData={userData}
        />
      </Card>
    );
  };
  
  // Subtask Modal Component
  const SubtaskModal = ({ open, onClose, task, onUpdate, updateSubtaskLocal, userData }) => {
    const [newSubtaskName, setNewSubtaskName] = useState('');
    const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  
    const handleAddSubtask = async () => {
      if (!newSubtaskName.trim() || isAddingSubtask) return;
      setIsAddingSubtask(true);
      try {
        const scriptId = 'task_script';
        const action = 'newtask';
        await apiCall(scriptId, action, {
          username: userData.username,
          googleToken: userData.googleToken,
          uniqueId: task.uniqueId,
          name: newSubtaskName
        });
        onUpdate();
        setNewSubtaskName('');
      } catch (error) {
        console.error('Error adding new subtask:', error);
        alert('Failed to add new subtask. Please try again.');
      } finally {
        setIsAddingSubtask(false);
      }
    };
  
    return (
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="subtask-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: 600,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          maxHeight: '80vh',
          overflow: 'auto',
          borderRadius: 2
        }}>
          <Typography id="subtask-modal-title" variant="h5" component="h2" sx={{ mb: 3 }}>
            {task.name}
          </Typography>
          
          {/* Add Subtask Form */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <TextField
              value={newSubtaskName}
              onChange={(e) => setNewSubtaskName(e.target.value)}
              placeholder="New subtask name"
              fullWidth
              variant="outlined"
              disabled={isAddingSubtask}
              sx={{ mr: 2 }}
            />
            {isAddingSubtask ? (
              <CircularProgress size={24} />
            ) : (
              <Button 
                onClick={handleAddSubtask} 
                variant="contained" 
                color="primary"
                disabled={!newSubtaskName.trim()}
              >
                Add Subtask
              </Button>
            )}
          </Box>
  
          {/* Existing Subtasks */}
          {task.subtasks.map(subtask => (
          <SubtaskCard 
            key={subtask.uniqueId} 
            subtask={subtask} 
            taskId={task.uniqueId}
            onUpdate={onUpdate} 
            updateSubtaskLocal={updateSubtaskLocal}
            userData={userData} 
          />
        ))}
          
          <Button 
            onClick={onClose} 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
          >
            Close
          </Button>
        </Box>
      </Modal>
    );
  };
  
  // Subtask Card Component
  const SubtaskCard = ({ subtask, taskId, onUpdate, updateSubtaskLocal, userData }) => {
    const [name, setName] = useState(subtask.name);
    const [details, setDetails] = useState(subtask.details);
    const [status, setStatus] = useState(subtask.status);
    const [personResponsible, setPersonResponsible] = useState(subtask.personResponsible);
    const [dueDate, setDueDate] = useState(subtask.dueDate);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
  
  
    const handleDelete = async () => {
      if (window.confirm('Are you sure you want to delete this subtask?')) {
        setIsDeleting(true);
        try {
          const scriptId = 'task_script';
          const action = 'deltask';
          await apiCall(scriptId, action, {
            username: userData.username,
            googleToken: userData.googleToken,
            uniqueId: subtask.uniqueId,
            name: subtask.name,
          });
          onUpdate();
        } catch (error) {
          console.error('Error deleting subtask:', error);
        } finally {
          setIsDeleting(false);
        }
      }
    };
  
    const getStatusColor = (status) => {
      switch (status) {
        case 'Completed': return 'success';
        case 'Abandoned': return 'error';
        case 'Ongoing': return 'warning';
        default: return 'info';
      }
    };
  
    const getStatusSymbol = (status) => {
      switch (status) {
        case 'Completed': return '✅';
        case 'Abandoned': return '❌';
        case 'Ongoing': return '▶️';
        default: return '⏳';
      }
    };
  
    const handleSubmit = async () => {
      setIsUpdating(true);
      try {
        const scriptId = 'task_script';
        const action = 'updatetasks';
        const response = await apiCall(scriptId, action, {
          username: userData.username,
          googleToken: userData.googleToken,
          subtaskUniqueId: subtask.uniqueId,
          name,
          details,
          status,
          personResponsible,
          dueDate
        });
    
        if (response && response.success) {
          // Update local state with the new data
          updateSubtaskLocal(taskId, subtask.uniqueId, {
            name,
            details,
            status,
            personResponsible,
            dueDate
          });
          setIsEditing(false);
          // Optionally refresh the whole task list
          onUpdate();
        } else {
          console.error('Update failed:', response?.message);
          alert('Failed to update task. Please try again.');
        }
      } catch (error) {
        console.error('Error updating subtask:', error);
        alert('An error occurred while updating the task. Please try again.');
      } finally {
        setIsUpdating(false);
      }
    };
  
    return (
      <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            variant="standard"
            disabled={!isEditing}
          />
          <TextField
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            fullWidth
            multiline
            variant="standard"
            disabled={!isEditing}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              size="small"
              disabled={!isEditing || isUpdating}
            >
              {['Upcoming', 'Ongoing', 'Completed', 'Abandoned'].map(s => (
                <MenuItem key={s} value={s}>
                  <Chip 
                    label={`${getStatusSymbol(s)} ${s}`} 
                    size="small" 
                    color={getStatusColor(s)} 
                  />
                </MenuItem>
              ))}
            </Select>
            
            <TextField
              value={personResponsible}
              onChange={(e) => setPersonResponsible(e.target.value)}
              placeholder="Person Responsible"
              size="small"
              disabled={!isEditing}
            />
            
            <TextField
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              size="small"
              disabled={!isEditing}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            {isEditing ? (
              <>
                <Button 
                  onClick={() => setIsEditing(false)}
                  variant="outlined"
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={isUpdating}
                >
                  {isUpdating ? <CircularProgress size={20} /> : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setIsEditing(true)}
                variant="outlined"
              >
                Edit
              </Button>
            )}
            <Button 
              onClick={handleDelete} 
              color="error" 
              disabled={isDeleting || isUpdating}
              startIcon={isDeleting ? <CircularProgress size={20} /> : null}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Card>
    );
};

    const AddTaskForm = ({ onTaskAdded, userData }) => {
      const [taskName, setTaskName] = useState('');
      const [isLoading, setIsLoading] = useState(false);
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!taskName.trim() || isLoading) return;
        setIsLoading(true);
        try {
          const scriptId = 'task_script';
          const action = 'newtask';
          await apiCall(scriptId, action, {
            username: userData.username,
            googleToken: userData.googleToken,
            uniqueId: '',
            name: taskName
          });
          onTaskAdded();
          setTaskName('');
        } catch (error) {
          console.error('Error adding new task:', error);
          // Optionally, you can add an alert here to inform the user of the error
        } finally {
          setIsLoading(false);
        }
      };
    
      return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          <TextField
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Enter task name"
            fullWidth
            variant="outlined"
            disabled={isLoading}
            sx={{ 
              backgroundColor: '#e0e0e0',  // Light grey background
              '& .MuiOutlinedInput-input': {
                color: 'black',  // Ensure text is black for contrast
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(0, 0, 0, 0.7)',  // Darker color for the label
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#bdbdbd',
                },
                '&:hover fieldset': {
                  borderColor: '#9e9e9e',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1976d2',
                },
              },
            }}
            InputProps={{
              endAdornment: (
                isLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Button type="submit" variant="contained" color="primary" sx={{ ml: 1 }} disabled={isLoading}>
                    Add
                  </Button>
                )
              ),
            }}
          />
        </Box>
      );
    };
    
    export default TaskManager;