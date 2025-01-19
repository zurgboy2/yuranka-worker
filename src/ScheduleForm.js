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

const ReasonForm = ({ removedBlocks, reasons, setReasons, onSubmit }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Please provide reasons for removed shifts:</Typography>
      {removedBlocks.map(block => {
        const startTime = new Date(block.startTime);
        const endTime = new Date(block.endTime);
        return (
          <Box key={block.startTime} sx={{ mb: 2 }}>
            <Typography>
              {startTime.toLocaleDateString()} {startTime.toLocaleTimeString()} - {endTime.toLocaleTimeString()}
            </Typography>
            <TextField
              fullWidth
              required
              label="Reason"
              value={reasons[block.startTime] || ''}
              onChange={(e) => setReasons(prev => ({
                ...prev,
                [block.startTime]: e.target.value
              }))}
            />
          </Box>
        )
      })}
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
  const [loading, setLoading] = useState(false);
  const [isSelecting, setIsSelecting] = useState(true);
  const { userData } = useUserData();
  const [removedShifts, setRemovedShifts] = useState([]);
  const [reasons, setReasons] = useState({});
  const [showReasonForm, setShowReasonForm] = useState(false);


  const [scheduleChanges, setScheduleChanges] = useState({
    toDelete: new Set(),  
    toAdd: new Set()      
  });

  const [originalCells, setOriginalCells] = useState(new Set());

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
        const originalCellsSet = new Set();
        
        data.forEach(entry => {
          const startDate = new Date(entry.startTime);
          const endDate = new Date(entry.endTime);
          
          let currentDate = new Date(startDate);
          while (currentDate < endDate) {
            const day = currentDate.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
            const date = currentDate.getDate();
            const hour = currentDate.getHours();
            const cellId = `${day}${date}-${hour}`;
            newSelected.add(cellId);
            originalCellsSet.add(cellId);
            
            currentDate = new Date(currentDate.getTime() + (60 * 60 * 1000));
          }
        });
        
        setSelectedCells(newSelected);
        setOriginalCells(originalCellsSet);
        
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
      const payload = {
        toDelete: consolidateTimeBlocks([
          ...Array.from(scheduleChanges.toDelete).map(cellId => {
            const [dayDate, hour] = cellId.split('-');
            const date = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              parseInt(dayDate.match(/\d+/)[0]),
              parseInt(hour)
            );
            return {
              startTime: date.toISOString(),
              endTime: new Date(date.getTime() + 60 * 60 * 1000).toISOString(),
              reason: reasons[date.toISOString()] // Include reason if exists
            };
          })
        ]),
        
        toAdd: consolidateTimeBlocks([
          ...Array.from(scheduleChanges.toAdd).map(cellId => {
            const [dayDate, hour] = cellId.split('-');
            const date = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              parseInt(dayDate.match(/\d+/)[0]),
              parseInt(hour)
            );
            return {
              startTime: date.toISOString(),
              endTime: new Date(date.getTime() + 60 * 60 * 1000).toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };
          })
        ]),
        
        username: userData.username,
        googleToken: userData.googleToken
      };
  
      await apiCall('worker_script', 'addScheduleEntries', payload);
      
      // Reset state after successful submission
      setScheduleChanges({ toDelete: new Set(), toAdd: new Set() });
      setShowReasonForm(false);
      setReasons({});
      setRemovedShifts([]);
      
      // Refresh the schedule display
      const updatedSchedule = await apiCall('worker_script', 'getSchedule', {
        username: userData.username,
        googleToken: userData.googleToken,
        month: currentMonth.getMonth() + 1,
        year: currentMonth.getFullYear()
      });
      
      // Update the UI with the new schedule
      const newSelected = new Set();
      updatedSchedule.forEach(entry => {
        const startDate = new Date(entry.startTime);
        const day = startDate.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
        const date = startDate.getDate();
        const hour = startDate.getHours();
        newSelected.add(`${day}${date}-${hour}`);
      });
      setSelectedCells(newSelected);
      setOriginalCells(new Set(newSelected));
      
      alert("Schedule updated successfully");
    } catch (error) {
      alert("Failed to update schedule");
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

  const consolidateTimeBlocks = (entries, reasons = {}) => {
    // Sort entries by start time
    entries.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    
    const consolidated = [];
    let currentBlock = null;
  
    entries.forEach(entry => {
      if (!currentBlock) {
        currentBlock = {...entry};
      } else {
        // Check if this entry starts right after current block ends
        const currentEnd = new Date(currentBlock.endTime);
        const nextStart = new Date(entry.startTime);
        
        if (currentEnd.getTime() === nextStart.getTime()) {
          // Extend current block
          currentBlock.endTime = entry.endTime;
        } else {
          // If we have a reason for this block, add it
          if (reasons[currentBlock.startTime]) {
            currentBlock.reason = reasons[currentBlock.startTime];
          }
          consolidated.push(currentBlock);
          currentBlock = {...entry};
        }
      }
    });
    
    if (currentBlock) {
      if (reasons[currentBlock.startTime]) {
        currentBlock.reason = reasons[currentBlock.startTime];
      }
      consolidated.push(currentBlock);
    }
  
    return consolidated;
  };

  const toggleCell = (cellId) => {
    const [dayDate] = cellId.split('-');
    const date = parseInt(dayDate.match(/\d+/)[0]);
    if (isDisabled(date)) return;
    
    const newSelected = new Set(selectedCells);
    const newChanges = { ...scheduleChanges };
    
    if (newSelected.has(cellId)) {
      // Deselecting a cell
      newSelected.delete(cellId);
      if (originalCells.has(cellId)) {
        // Find the original continuous block this cell belongs to
        const originalBlock = findContinuousBlock(cellId, originalCells);
        // Mark the entire original block for deletion
        originalBlock.forEach(cell => newChanges.toDelete.add(cell));
        
        // Only add cells that were in the original block AND are still selected
        // BUT exclude the cell that was just deselected
        originalBlock.forEach(cell => {
          if (cell !== cellId && newSelected.has(cell)) {
            newChanges.toAdd.add(cell);
          }
        });
      } else {
        // If it was a new addition, just remove it
        newChanges.toAdd.delete(cellId);
      }
    } else {
      // Selecting a cell
      newSelected.add(cellId);
      if (!originalCells.has(cellId)) {
        newChanges.toAdd.add(cellId);
      }
    }
    
    setSelectedCells(newSelected);
    setScheduleChanges(newChanges);
  };
  
  // Helper function to find continuous block of cells
  const findContinuousBlock = (cellId, cellSet) => {
    const [dayDate, hour] = cellId.split('-');
    const block = new Set();
    const baseHour = parseInt(hour);
    
    // Check backwards
    let currentHour = baseHour;
    while (currentHour >= 8) {
      const currentCellId = `${dayDate}-${currentHour}`;
      if (!cellSet.has(currentCellId)) break;
      block.add(currentCellId);
      currentHour--;
    }
    
    // Check forwards
    currentHour = baseHour + 1;
    while (currentHour <= 21) {
      const currentCellId = `${dayDate}-${currentHour}`;
      if (!cellSet.has(currentCellId)) break;
      block.add(currentCellId);
      currentHour++;
    }
    
    return block;
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
  
    const weekAheadDate = new Date();
    weekAheadDate.setDate(weekAheadDate.getDate() + 7);
    
    // Convert toDelete changes to entries and consolidate them
    const deletions = consolidateTimeBlocks(
      Array.from(scheduleChanges.toDelete).map(cellId => {
        const [dayDate, hour] = cellId.split('-');
        const date = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          parseInt(dayDate.match(/\d+/)[0]),
          parseInt(hour)
        );
        return {
          startTime: date.toISOString(),
          endTime: new Date(date.getTime() + 60 * 60 * 1000).toISOString()
        };
      })
    );
  
    // Check if any deletions are within the week ahead
    const weekAheadDeletions = deletions.filter(block => {
      const blockStart = new Date(block.startTime);
      return blockStart <= weekAheadDate;
    });
  
    if (weekAheadDeletions.length > 0) {
      setRemovedShifts(weekAheadDeletions);
      setShowReasonForm(true);
      setLoading(false);
      return;
    }
  
    // If no week-ahead deletions, proceed with normal submission
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