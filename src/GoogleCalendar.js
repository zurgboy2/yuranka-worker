import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Paper, Typography, CircularProgress, Modal, Box, List, ListItem, ListItemText } from '@mui/material';
import apiCall from './api';
import { useUserData } from './UserContext'; // Import the useUserData hook

const GoogleCalendar = () => {
  const { userData } = useUserData(); // Use the userData context
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const scriptId = 'dashboard_script';
        const action = 'getCalendarEvents';
        
        const response = await apiCall(scriptId, action, {
          roles: userData.roles,
          googleToken: userData.googleToken,
          username: userData.username
        });
        
        if (Array.isArray(response)) {
          setEvents(response);
        } else {
          throw new Error('Unexpected response format');
        }
      } catch (err) {
        console.error('Error in fetchEvents:', err);
        setError(`Failed to load calendar events: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchEvents();
    }
  }, [userData]);

  const handleDateClick = (arg) => {
    const clickedDate = arg.date;
    const eventsOnDay = events.filter(event => 
      new Date(event.start).toDateString() === clickedDate.toDateString()
    );
    setSelectedDate(clickedDate);
    setSelectedEvents(eventsOnDay);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const calendarStyle = {
    '.fc': { 
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
    },
    '.fc-theme-standard': {
      backgroundColor: '#1a1a1a',
    },
    '.fc-theme-standard .fc-scrollgrid, .fc th, .fc td': {
      borderColor: '#333333',
    },
    '.fc .fc-daygrid-day-frame': {
      borderRadius: '8px',
      transition: 'all 0.3s ease',
    },
    '.fc .fc-daygrid-day-top': {
      justifyContent: 'center',
      padding: '5px',
    },
    '.fc .fc-daygrid-day-number': {
      fontSize: '1em',
      fontWeight: 'bold',
      color: '#ffffff',
    },
    '.fc .fc-day-today': {
      backgroundColor: '#3a0000 !important',
    },
    '.fc .fc-button-primary': {
      backgroundColor: '#8b0000',
      borderColor: '#8b0000',
      borderRadius: '20px',
      transition: 'all 0.3s ease',
    },
    '.fc .fc-button-primary:hover': {
      backgroundColor: '#a50000',
    },
    '.fc-day-sat, .fc-day-sun': {
      backgroundColor: '#2a2a2a',
    },
    '.fc-daygrid-day-events': {
      padding: '2px',
      fontSize: '0.8em',
    },
    '.fc-event': {
      borderRadius: '4px',
      padding: '2px 4px',
    },
    '.fc .fc-daygrid-day:hover': {
      cursor: 'pointer',
      backgroundColor: '#2a2a2a',
    },
    '.fc .fc-toolbar-title': {
      color: '#ffffff',
    },
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', borderRadius: '12px', backgroundColor: '#1a1a1a', color: '#ffffff' }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#ffffff' }}>Calendar Events</Typography>
      {error ? (
        <Typography color="error">{error}</Typography>
      ) : loading ? (
        <CircularProgress sx={{ color: '#8b0000' }} />
      ) : (
        <>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            height="auto"
            dateClick={handleDateClick}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek'
            }}
            buttonText={{
              today: 'Today',
              month: 'Month',
              week: 'Week'
            }}
            eventContent={(eventInfo) => (
              <Box sx={{ 
                backgroundColor: '#8b0000', 
                color: 'white', 
                padding: '2px 4px', 
                borderRadius: '4px', 
                fontSize: '0.8em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {eventInfo.event.title}
              </Box>
            )}
            dayMaxEvents={2}
            moreLinkContent={(args) => `+${args.num} more`}
            sx={calendarStyle}
          />
          <Modal
            open={modalOpen}
            onClose={handleCloseModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: '#1a1a1a',
              color: '#ffffff',
              boxShadow: 24,
              p: 4,
              borderRadius: '12px',
            }}>
              <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ fontWeight: 'bold', color: '#ffffff', mb: 2 }}>
                Events on {selectedDate && selectedDate.toDateString()}
              </Typography>
              <List>
                {selectedEvents.map((event, index) => (
                  <ListItem key={index} sx={{ 
                    backgroundColor: '#2a2a2a', 
                    mb: 1, 
                    borderRadius: '8px',
                    '&:last-child': { mb: 0 } 
                  }}>
                    <ListItemText 
                      primary={<Typography sx={{ fontWeight: 'bold', color: '#ffffff' }}>{event.title}</Typography>}
                      secondary={
                        <Typography sx={{ fontSize: '0.9em', color: '#cccccc' }}>
                          {`${new Date(event.start).toLocaleTimeString()} - ${new Date(event.end).toLocaleTimeString()}`}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              {selectedEvents.length === 0 && (
                <Typography sx={{ color: '#cccccc', fontStyle: 'italic' }}>No events on this day.</Typography>
              )}
            </Box>
          </Modal>
        </>
      )}
    </Paper>
  );
};

export default GoogleCalendar;
