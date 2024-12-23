import React, { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import apiCall from './api';
import { useUserData } from './UserContext';
import 'material-icons/iconfont/material-icons.css';

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

const StyledButton = styled(Button)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(2),
  backgroundColor: '#b30000',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#ff0000',
  },
}));


const StyledTableCell = styled(TableCell)(({ theme, selected }) => ({
  color: '#fff',
  backgroundColor: selected ? '#800000' : '#660000',
  padding: '8px',
  minWidth: '80px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#990000',
  }
}));

const ScheduleForm = () => {
  const { userData } = useUserData();
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const timeSlots = [...Array(28)].map((_, i) => {
    const hour = Math.floor(i/2) + 8;
    const minute = i%2 === 0 ? '00' : '30';
    return `${hour}:${minute}`;
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleCell = (day, time) => {
    const cellId = `${day}-${time}`;
    const newSelected = new Set(selectedCells);
    if (newSelected.has(cellId)) {
      newSelected.delete(cellId);
    } else {
      newSelected.add(cellId);
    }
    setSelectedCells(newSelected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const entries = Array.from(selectedCells).map(cellId => {
      const [day, time] = cellId.split('-');
      const hour = parseInt(time.split(':')[0]);
      return {
        day,
        startTime: time,
        endTime: `${hour + 1}:${time.split(':')[1]}`,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    });

    try {
      await apiCall('worker_script', 'addScheduleEntries', {
        entries,
        username: userData.username,
        googleToken: userData.googleToken
      });
      alert("Schedule submitted successfully");
      setSelectedCells(new Set());
    } catch (error) {
      alert("Failed to submit schedule");
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledBox>
      <StyledForm onSubmit={handleSubmit}>
        <Typography variant="h5" gutterBottom>
          Monthly Schedule
        </Typography>

        <TableContainer sx={{ maxHeight: '80vh', position: 'relative' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell 
                  sx={{ 
                    position: 'sticky', 
                    left: 0, 
                    zIndex: 3,
                    backgroundColor: '#2c2c2c'
                  }}
                >
                  Day/Time
                </StyledTableCell>
                {timeSlots.map(time => (
                  <StyledTableCell key={time}>{time}</StyledTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {days.map(day => (
                <TableRow key={day}>
                  <StyledTableCell 
                    sx={{ 
                      position: 'sticky', 
                      left: 0, 
                      zIndex: 2,
                      backgroundColor: '#4c0000'
                    }}
                  >
                    {day}
                  </StyledTableCell>
                  {timeSlots.map(time => (
                    <StyledTableCell 
                      key={`${day}-${time}`}
                      selected={selectedCells.has(`${day}-${time}`)}
                      onClick={() => toggleCell(day, time)}
                    />
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <StyledButton 
          type="submit" 
          variant="contained" 
          disabled={loading || selectedCells.size === 0}
          sx={{ marginTop: 2 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Schedule'}
        </StyledButton>
      </StyledForm>
    </StyledBox>
  );
};

export default ScheduleForm;