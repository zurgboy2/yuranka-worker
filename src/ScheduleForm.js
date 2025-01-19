import React, { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,TextField, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import apiCall from './api';
import { useUserData } from './UserContext';
import 'material-icons/iconfont/material-icons.css';
import { useEffect } from 'react';
import { IconButton } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

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

const ReasonForm = ({ daysNeedingReasons, reasons, setReasons, onSubmit }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Please provide reasons for schedule changes:</Typography>
      {daysNeedingReasons.map(({ dayId }) => (
        <Box key={dayId} sx={{ mb: 2 }}>
          <Typography>
            {new Date(dayId).toLocaleDateString()}
          </Typography>
          <TextField
            fullWidth
            required
            label="Reason"
            value={reasons[dayId] || ''}
            onChange={(e) => setReasons(prev => ({
              ...prev,
              [dayId]: e.target.value
            }))}
          />
        </Box>
      ))}
      <Button variant="contained" onClick={onSubmit}>
        Submit Changes
      </Button>
    </Box>
  );
};

const LoadingOverlay = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}
  >
    <CircularProgress sx={{ color: '#fff' }} size={60} />
  </Box>
);

const ScheduleForm = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const { userData } = useUserData();
  const [reasons, setReasons] = useState({});
  const [showReasonForm, setShowReasonForm] = useState(false);
  const [dayChanges, setDayChanges] = useState(new Map());
  const [daysNeedingReasons, setDaysNeedingReasons] = useState([]);

  const getDayId = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };



  const getDaySchedule = (dayId) => {
    const selectedHours = new Set();
    for (let hour = 8; hour <= 21; hour++) {
      const date = new Date(dayId);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
      const cellId = `${day}${date.getDate()}-${hour}`;
      if (selectedCells.has(cellId)) {
        selectedHours.add(cellId);
      }
    }
    return selectedHours;
  };

  const disabledDate = new Date();
  disabledDate.setDate(disabledDate.getDate() + 7);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const data = await apiCall('worker_script', 'getSchedule', {
          username: userData.username,
          googleToken: userData.googleToken,
          month: currentMonth.getMonth() + 1,
          year: currentMonth.getFullYear()
        });
        
        const newSelected = new Set();
        
        data.forEach(entry => {
          const startDate = new Date(entry.startTime);
          const endDate = new Date(entry.endTime);
          
          // Get all hours between start and end
          const currentDate = new Date(startDate);
          while (currentDate < endDate) {
            const day = currentDate.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
            const date = currentDate.getDate();
            const hour = currentDate.getHours();
            const cellId = `${day}${date}-${hour}`;
            newSelected.add(cellId);
            
            // Increment by one hour
            currentDate.setHours(currentDate.getHours() + 1);
          }
        });
        
        setSelectedCells(newSelected);
        
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchSchedule();
  }, [currentMonth, userData]);



  const changeMonth = (increment) => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + increment);
      return newMonth;
    });
  };

  const handleReasonSubmit = async (event) => {
    event.preventDefault();
    // Validate all reasons are filled
    if (daysNeedingReasons.some(day => !reasons[day.dayId])) {
      alert("Please provide reasons for all schedule changes");
      return;
    }
    
    // Proceed with submission
    await submitChanges();
  };


  const handleMouseDown = (cellId) => {
    setIsDragging(true);
    toggleCell(cellId);
  };
  

  const handleCellToggle = (cellId) => {
    const [dayDate, hour] = cellId.split('-');
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      parseInt(dayDate.match(/\d+/)[0])
    );
    const dayId = getDayId(date);
  
    // Get or create day changes
    const currentDayChanges = dayChanges.get(dayId) || {
      original: new Set(getDaySchedule(dayId)),
      new: new Set(getDaySchedule(dayId))
    };
  
    // Update the new schedule
    const cellKey = `${dayDate}-${hour}`;
    if (currentDayChanges.new.has(cellKey)) {
      currentDayChanges.new.delete(cellKey);
      setSelectedCells(prev => {
        const newSet = new Set(prev);
        newSet.delete(cellKey);
        return newSet;
      });
    } else {
      currentDayChanges.new.add(cellKey);
      setSelectedCells(prev => {
        const newSet = new Set(prev);
        newSet.add(cellKey);
        return newSet;
      });
    }
  
    // Update state
    setDayChanges(new Map(dayChanges.set(dayId, currentDayChanges)));
  };

  const submitChanges = async () => {
    setLoading(true);
    try {
      const payload = {
        changes: Array.from(dayChanges.entries()).map(([dayId, change]) => ({
          dayId,
          original: Array.from(change.original),
          new: Array.from(change.new),
          reason: reasons[dayId]
        })),
        username: userData.username,
        googleToken: userData.googleToken
      };
  
      await apiCall('worker_script', 'addScheduleEntries', payload);
      
      // Reset states
      setDayChanges(new Map());
      setReasons({});
      setShowReasonForm(false);
      
      // Refresh schedule
      const updatedSchedule = await apiCall('worker_script', 'getSchedule', {
        username: userData.username,
        googleToken: userData.googleToken,
        month: currentMonth.getMonth() + 1,
        year: currentMonth.getFullYear()
      });
      
      // Update UI
      const newSelected = new Set();
      updatedSchedule.forEach(entry => {
        const startDate = new Date(entry.startTime);
        const day = startDate.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
        const date = startDate.getDate();
        const hour = startDate.getHours();
        newSelected.add(`${day}${date}-${hour}`);
      });
      setSelectedCells(newSelected);
      
      alert("Schedule updated successfully");
    } catch (error) {
      alert("Failed to update schedule");
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const isDisabled = (date) => {
    const cellDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      parseInt(date)
    );
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return cellDate < tomorrow;
  };


  const handleMouseEnter = (cellId) => {
    if (isDragging) {
      handleCellToggle(cellId, true);
    }
  };
  
  const toggleCell = (cellId) => {
    handleCellToggle(cellId, false);
  };
  


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


  const handleSubmit = async (event) => {
    event.preventDefault();
    const weekAheadDate = new Date();
    weekAheadDate.setDate(weekAheadDate.getDate() + 7);
  
    const daysNeedingReasons = [];
    
    for (const [dayId, changes] of dayChanges) {
      const dayDate = new Date(dayId);
      if (dayDate <= weekAheadDate && changes.original.size !== changes.new.size) {
        daysNeedingReasons.push({
          dayId,
          original: changes.original,
          new: changes.new
        });
      }
    }
  
    if (daysNeedingReasons.length > 0) {
      setDaysNeedingReasons(daysNeedingReasons);
      setShowReasonForm(true);
      return;
    }
  
    await submitChanges();
  };


  return (
    <StyledBox>
      {loading && <LoadingOverlay />}
      <StyledForm onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <IconButton onClick={() => changeMonth(-1)} sx={{ color: '#fff' }}>
            <ArrowBackIosIcon />
          </IconButton>
          <Typography variant="h5">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Typography>
          <IconButton onClick={() => changeMonth(1)} sx={{ color: '#fff' }}>
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>

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
                      onMouseDown={() => handleMouseDown(`${day}${date}-${hour}`)}
                      onMouseEnter={() => handleMouseEnter(`${day}${date}-${hour}`)}
                      sx={{
                        opacity: isDisabled(date) ? 0.5 : 1,
                        cursor: isDisabled(date) ? 'not-allowed' : 'pointer',
                      }}
                    />
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>

        {showReasonForm ? (
        <ReasonForm
          daysNeedingReasons={daysNeedingReasons}
          reasons={reasons}
          setReasons={setReasons}
          onSubmit={handleReasonSubmit}
        />
      ) : (
        <StyledButton type="submit" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Submit'}
        </StyledButton>
      )}
    </StyledForm>
    </StyledBox>
  );
};

export default ScheduleForm;