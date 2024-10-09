import React, { useState, useEffect } from 'react';
import { Box, Typography, Select, MenuItem, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import apiCall from './api';
import { useUserData } from './UserContext';

const StyledBox = styled(Box)(({ theme }) => ({
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#2c2c2c',
  color: '#fff',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  margin: 0,
}));

const StyledForm = styled('form')(({ theme }) => ({
  backgroundColor: '#4c0000',
  padding: theme.spacing(2),
  borderRadius: '10px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(2),
  backgroundColor: '#660000',
  color: '#fff',
  '& .MuiSelect-icon': {
    color: '#fff',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(2),
  backgroundColor: '#b30000',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#ff0000',
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: '#fff',
  backgroundColor: '#660000',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: '#590000',
  },
  '&:nth-of-type(odd)': {
    backgroundColor: '#4c0000',
  },
}));

const ScheduleForm = () => {
    const { userData } = useUserData();
    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState('');
    const [scheduleRows, setScheduleRows] = useState([]);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
        const fetchWorkers = async () => {
            try {
            const response = await apiCall('worker_script', 'getNames', {username: userData.username, googleToken: userData.googleToken});
            setWorkers(response);
            } catch (error) {
            console.error('Error fetching workers:', error);
            }
        };
        fetchWorkers();
    }, [userData.username, userData.googleToken]);
  
    const handleWorkerChange = (event) => {
      setSelectedWorker(event.target.value);
    };
  
    const addRow = () => {
      setScheduleRows([...scheduleRows, { day: '', startTime: '', endTime: '' }]);
    };
  
    const updateRow = (index, field, value) => {
      const newRows = [...scheduleRows];
      newRows[index][field] = value;
      setScheduleRows(newRows);
  
      if (field === 'startTime' || field === 'day') {
        checkAndRestrictHours(index);
      }
    };
  
    const checkAndRestrictHours = async (index) => {
      const row = scheduleRows[index];
      if (row.day && selectedWorker) {
        const worker = workers.find(w => w.name === selectedWorker);
        if (worker) {
          try {
            const maxHours = await apiCall('worker_script', 'checkBudget', {
              day: row.day,
              salary: worker.salary,
              username: userData.username,
              googleToken: userData.googleToken
            });
            
            // Update the row with the new max hours restriction
            const newRows = [...scheduleRows];
            newRows[index].maxHours = maxHours;
            setScheduleRows(newRows);
          } catch (error) {
            console.error('Error checking budget:', error);
          }
        }
      }
    };
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      setLoading(true);
  
      const worker = workers.find(w => w.name === selectedWorker);
      if (!worker) {
        alert("Worker not found");
        setLoading(false);
        return;
      }
  
      const entries = scheduleRows.filter(row => row.day && row.startTime && row.endTime)
        .map(row => ({
          name: selectedWorker,
          email: worker.email,
          day: row.day,
          startTime: row.startTime,
          endTime: row.endTime,
          indicatedSalary: calculateSalary(row.startTime, row.endTime, worker.salary),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }));
  
      if (entries.length === 0) {
        alert("No valid entries to submit");
        setLoading(false);
        return;
      }
  
      try {
        await apiCall('worker_script', 'addScheduleEntries', {entries,username: userData.username, googleToken: userData.googleToken});
        alert("Schedule added successfully");
        setSelectedWorker('');
        setScheduleRows([]);
      } catch (error) {
        alert("Failed to add schedule");
        console.error('Error adding schedule:', error);
      } finally {
        setLoading(false);
      }
    };
  
    const calculateSalary = (startTime, endTime, salary) => {
      const startHour = parseInt(startTime.split(':')[0]);
      const endHour = parseInt(endTime.split(':')[0]);
      return (endHour - startHour) * salary;
    };
  
    return (
      <StyledBox>
        <StyledForm onSubmit={handleSubmit}>
          <Typography variant="h5" component="h1" gutterBottom>
            Schedule Form
          </Typography>
  
          <StyledSelect
            value={selectedWorker}
            onChange={handleWorkerChange}
            displayEmpty
            required
          >
            <MenuItem value="" disabled>Select a worker</MenuItem>
            {workers.map((worker) => (
              <MenuItem key={worker.name} value={worker.name}>{worker.name}</MenuItem>
            ))}
          </StyledSelect>
  
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Day</StyledTableCell>
                  <StyledTableCell>Start Time</StyledTableCell>
                  <StyledTableCell>End Time</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scheduleRows.map((row, index) => (
                  <StyledTableRow key={index}>
                    <TableCell>
                      <StyledSelect
                        value={row.day}
                        onChange={(e) => updateRow(index, 'day', e.target.value)}
                        displayEmpty
                        required
                      >
                        <MenuItem value="" disabled>Select a day</MenuItem>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                          <MenuItem key={day} value={day}>{day}</MenuItem>
                        ))}
                      </StyledSelect>
                    </TableCell>
                    <TableCell>
                      <StyledSelect
                        value={row.startTime}
                        onChange={(e) => updateRow(index, 'startTime', e.target.value)}
                        displayEmpty
                        required
                      >
                        <MenuItem value="" disabled>Select start time</MenuItem>
                        {[...Array(14)].map((_, i) => {
                          const hour = i + 10;
                          return [0, 30].map(minute => {
                            const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                            return <MenuItem key={time} value={time}>{time}</MenuItem>;
                          });
                        })}
                      </StyledSelect>
                    </TableCell>
                    <TableCell>
                      <StyledSelect
                        value={row.endTime}
                        onChange={(e) => updateRow(index, 'endTime', e.target.value)}
                        displayEmpty
                        required
                      >
                        <MenuItem value="" disabled>Select end time</MenuItem>
                        {[...Array(14)].map((_, i) => {
                          const hour = i + 10;
                          return [0, 30].map(minute => {
                            const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                            return (
                              <MenuItem 
                                key={time} 
                                value={time}
                                disabled={row.maxHours && (hour - parseInt(row.startTime.split(':')[0])) > row.maxHours}
                              >
                                {time}
                              </MenuItem>
                            );
                          });
                        })}
                      </StyledSelect>
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
  
          <StyledButton onClick={addRow} variant="contained">
            Add A Day
          </StyledButton>
  
          <StyledButton type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
          </StyledButton>
        </StyledForm>
      </StyledBox>
    );
  };
  
  export default ScheduleForm;