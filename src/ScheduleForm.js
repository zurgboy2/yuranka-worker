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

const StyledTableContainer = styled(TableContainer)({
  maxHeight: '80vh',
  maxWidth: '95vw',
  overflowX: 'auto',
  '& .MuiTable-root': {
    tableLayout: 'fixed'
  }
});

const StyledTableCell = styled(TableCell)(({ theme, selected }) => ({
  color: '#fff',
  backgroundColor: selected ? '#800000' : '#660000', 
  padding: '4px',
  minWidth: '40px',
  maxWidth: '40px',
  cursor: 'pointer',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  '&:hover': {
    backgroundColor: '#990000',
  }
}));

// Update StyledForm
const StyledForm = styled('form')(({ theme }) => ({
  backgroundColor: '#4c0000',
  padding: theme.spacing(2),
  borderRadius: '10px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
  width: '95vw', // Add this
  maxWidth: '1400px' // Add this
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



const ScheduleForm = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const { userData } = useUserData();

  // Change days array
  const days = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];

  const timeSlots = [...Array(14)].map((_, i) => i + 8);

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = [];
    const date = new Date(year, month, 1);
    
    while (date.getMonth() === month) {
      days.push({
        date: date.getDate(),
        day: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)
      });
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  // Update handleSubmit entries mapping
  const entries = Array.from(selectedCells).map(cellId => {
  const [day, hour] = cellId.split('-');
  return {
    day: day,
    startTime: `${hour}:00`,
    endTime: `${parseInt(hour) + 1}:00`,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  });

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
      const [dayInfo, hour] = cellId.split('-');
      return {
        day: dayInfo,
        startTime: `${hour}:00`,
        endTime: `${parseInt(hour) + 1}:00`,
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
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Typography>

        <StyledTableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell sx={{ position: 'sticky', left: 0, zIndex: 3 }}>
                  Day
                </StyledTableCell>
                {timeSlots.map(hour => (
                  <StyledTableCell key={hour}>{hour}</StyledTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {getDaysInMonth().map(({ day, date }) => (
                <TableRow key={`${day}${date}`}>
                  <StyledTableCell sx={{ position: 'sticky', left: 0, zIndex: 2 }}>
                    {`${day}:${date}`}
                  </StyledTableCell>
                  {timeSlots.map(hour => (
                    <StyledTableCell 
                      key={`${day}${date}-${hour}`}
                      selected={selectedCells.has(`${day}${date}-${hour}`)}
                      onClick={() => toggleCell(`${day}${date}`, hour)}
                    />
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>

        <StyledButton type="submit" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Submit'}
        </StyledButton>
      </StyledForm>
    </StyledBox>
  );
};

export default ScheduleForm;