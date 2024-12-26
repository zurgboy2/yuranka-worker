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

const ReasonForm = ({ removedShifts, reasons, setReasons, onSubmit }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Please provide reasons for removed shifts:</Typography>
      {removedShifts.map(shift => (
        <Box key={shift.startTime} sx={{ mb: 2 }}>
          <Typography>
            {new Date(shift.startTime).toLocaleString()}
          </Typography>
          <TextField
            fullWidth
            required
            label="Reason"
            value={reasons[shift.startTime] || ''}
            onChange={(e) => setReasons(prev => ({
              ...prev,
              [shift.startTime]: e.target.value
            }))}
          />
        </Box>
      ))}
      <Button 
        variant="contained" 
        onClick={onSubmit}
        sx={{ mt: 2 }}
      >
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
  const [previousSchedule, setPreviousSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSelecting, setIsSelecting] = useState(true);
  const { userData } = useUserData();
  const [removedShifts, setRemovedShifts] = useState([]);
  const [reasons, setReasons] = useState({});
  const [showReasonForm, setShowReasonForm] = useState(false);

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
        
        setPreviousSchedule(data); // Store the original schedule
    
        const newSelected = new Set();
        data.forEach(entry => {
          const startDate = new Date(entry.startTime);
          const day = startDate.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
          const date = startDate.getDate();
          const hour = startDate.getHours();
          newSelected.add(`${day}${date}-${hour}`);
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

  const compareChanges = (newEntries) => {
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    
    console.log('Previous schedule:', previousSchedule);
    console.log('New entries:', newEntries);
    
    const removed = Array.from(previousSchedule).filter(oldEntry => {
      const oldDate = new Date(oldEntry.startTime);
      const isWithinWeek = oldDate <= oneWeekFromNow;
      const stillExists = newEntries.some(newEntry => 
        new Date(newEntry.startTime).getTime() === oldDate.getTime()
      );
      
      console.log('Checking entry:', oldEntry);
      console.log('Is within week:', isWithinWeek);
      console.log('Still exists:', stillExists);
      
      return isWithinWeek && !stillExists;
    });
  
    console.log('Removed shifts:', removed);
  
    if (removed.length > 0) {
      setRemovedShifts(removed);
      setShowReasonForm(true);
      return true;
    }
    return false;
  };


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
    if (removedShifts.some(shift => !reasons[shift.startTime])) {
      alert("Please provide reasons for all removed shifts");
      return;
    }
    
    // Proceed with submission
    await submitScheduleWithReasons();
  };

  const submitScheduleWithReasons = async () => {
    setLoading(true);
    try {
      // Generate entries from selectedCells
      const entries = Array.from(selectedCells).map(cellId => {
        const [dayDate, hour] = cellId.split('-');
        const date = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          parseInt(dayDate.match(/\d+/)[0]),
          parseInt(hour)
        );
    
        const startTime = date.toISOString();
        const endTime = new Date(date.getTime() + 60 * 60 * 1000).toISOString();
    
        return {
          startTime,
          endTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
      });
  
      await apiCall('worker_script', 'addScheduleEntries', {
        entries,
        removedEntries: removedShifts.map(shift => ({
          startTime: shift.startTime,
          reason: reasons[shift.startTime]
        })),
        username: userData.username,
        googleToken: userData.googleToken
      });
      
      // Fetch updated schedule
      const updatedSchedule = await apiCall('worker_script', 'getSchedule', {
        username: userData.username,
        googleToken: userData.googleToken,
        month: currentMonth.getMonth() + 1,
        year: currentMonth.getFullYear()
      });
      
      setPreviousSchedule(updatedSchedule);
      const newSelected = new Set();
      updatedSchedule.forEach(entry => {
        const startDate = new Date(entry.startTime);
        const day = startDate.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
        const date = startDate.getDate();
        const hour = startDate.getHours();
        newSelected.add(`${day}${date}-${hour}`);
      });
      setSelectedCells(newSelected);
      
      alert("Schedule submitted successfully");
      setShowReasonForm(false);
      setReasons({});
      setRemovedShifts([]);
    } catch (error) {
      alert("Failed to submit schedule");
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseDown = (cellId) => {
    setIsDragging(true);
    setIsSelecting(!selectedCells.has(cellId));
    toggleCell(cellId);
  };

  const handleMouseEnter = (cellId) => {
    if (isDragging) {
      if (isSelecting) {
        selectedCells.add(cellId);
      } else {
        selectedCells.delete(cellId);
      }
      setSelectedCells(new Set(selectedCells));
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

  const toggleCell = (cellId) => {
    const [dayDate] = cellId.split('-');  // Only destructure what we need
    const date = parseInt(dayDate.match(/\d+/)[0]);
    if (isDisabled(date)) return;
    
    const newSelected = new Set(selectedCells);
    if (newSelected.has(cellId)) {
      newSelected.delete(cellId);
    } else {
      newSelected.add(cellId);
    }
    setSelectedCells(newSelected);
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
    setLoading(true);
  
    const entries = Array.from(selectedCells).map(cellId => {
      const [dayDate, hour] = cellId.split('-');
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        parseInt(dayDate.match(/\d+/)[0]),
        parseInt(hour)
      );
  
      const startTime = date.toISOString();
      const endTime = new Date(date.getTime() + 60 * 60 * 1000).toISOString();
  
      return {
        startTime,
        endTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
    });
  
    if (compareChanges(entries)) {
      setLoading(false);
      return; // Will show reason form instead
    }
  
    // If no removed shifts within week, proceed with normal submission
    await submitScheduleWithReasons();
    setLoading(false);
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
          removedShifts={removedShifts}
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