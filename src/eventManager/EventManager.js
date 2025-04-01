import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Typography, Button, TextField, Select, MenuItem,
  FormControl, InputLabel, Grid, Paper, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Tabs, Tab, IconButton,FormControlLabel, Checkbox
} from '@mui/material';
import 'material-icons/iconfont/material-icons.css';
import apiCall from '../api';
import { useUserData } from '../UserContext';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const EventManager = ({ onClose }) => {
  const { userData } = useUserData();
  const [events, setEvents] = useState([]);
  const [tcgTypes, setTcgTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [eventPanels, setEventPanels] = useState([{
    name: '',
    tcgType: '',
    image: null,
    prizes: '',
    rules: '',
    preReleaseBundle: '',
    startDateTime: '',
    endDateTime: '',   
    description: '',
    messageToBuyer: '',
    price: '',
    reader_info: '',
    isOneTime: true,
    inventoryQuantity: ''
  }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newPoster, setNewPoster] = useState(null);
  const [editingAttendee, setEditingAttendee] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);



  const fileInputRef = useRef(null);

  const fetchEvents = useCallback(async () => {
    try {
      const scriptId = 'admin_tournament_script';
      const action = 'getEvents';
      const response = await apiCall(scriptId, action, {
        googleToken: userData.googleToken, 
        username: userData.username
      });
      
      if (Array.isArray(response)) {
        setEvents(response);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const fetchTcgTypes = useCallback(async () => {
    try {
      const scriptId = 'admin_tournament_script';
      const action = 'getTcgTypes';
      
      const response = await apiCall(scriptId, action, {
        googleToken: userData.googleToken, 
        username: userData.username
      });
      
      if (Array.isArray(response)) {
        setTcgTypes(response);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Failed to fetch TCG types:', error);
    }
  }, [userData]);

  useEffect(() => {
    fetchEvents();
    fetchTcgTypes();
  }, [fetchEvents, fetchTcgTypes]);

  const handleInputChange = (e, panelIndex = 0) => {
    const { name, value } = e.target;

    setEventPanels(prev => {
      const updated = [...prev];
      updated[panelIndex] = { ...updated[panelIndex], [name]: value };
      
      // Validate dates if both are set
      if (name === 'startDateTime' || name === 'endDateTime') {
        if (updated[panelIndex].startDateTime && updated[panelIndex].endDateTime) {
          const start = new Date(updated[panelIndex].startDateTime);
          const end = new Date(updated[panelIndex].endDateTime);

        }
      }
      
      setError(null);
      return updated;
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const blob = await fileToBlob(file);
      setEventPanels(prev => prev.map((panel) => ({ ...panel, image: blob })));
    }
  };

  const fileToBlob = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const blob = new Blob([reader.result], { type: file.type });
        resolve(blob);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const scriptId = 'admin_tournament_script';
      const action = 'createEvent';
      
      for (const panel of eventPanels) {
        const eventData = {
          name: panel.name,
          startDateTime: panel.startDateTime,
          endDateTime: panel.endDateTime,   
          description: panel.description,
          messageToBuyer: panel.messageToBuyer,
          price: panel.price,
          reader_info: panel.reader_info,
          tcgType: panel.tcgType,
          prizes: panel.prizes,
          rules: panel.rules,
          preReleaseBundle: panel.preReleaseBundle,
          isOneTime: eventPanels.length === 1,
          inventoryQuantity: panel.inventoryQuantity || null
        };
                
        if (panel.image) {
          const base64Image = await blobToBase64(panel.image);
          eventData.image = base64Image;
        }
        
        const response = await apiCall(scriptId, action, {
          googleToken: userData.googleToken,
          username: userData.username,
          formData: eventData
      });


      if (!response || response.error) {
          console.error('Invalid webhook request or error in response:', response);
          throw new Error('One of the event submissions failed.');
      }

      // Optional delay before the next request
      await delay(100);
      }
      
    } catch (error) {
      console.error('Error during event creation:', error);
      setError(error.message || 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
      handleSuccessfulSubmission();

    }
  };
  
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  const handleSuccessfulSubmission = async () => {
    await fetchEvents();
    setEventPanels(prev => prev.map((panel) => ({
      ...panel,
      name: '',
      startDateTime: '',
      endDateTime: '',
      description: '',
      messageToBuyer: '',
      price: '',
      reader_info: '',
      tcgType: '',
      image: null,
      prizes:'',
      inventoryQuantity:'',
      preReleaseBundle:'',
      rules:'',

    })));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Optionally, you can add a success message here
    console.log('Event created successfully');
  };
  
  // Helper function to convert blob to base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    
    setEditingEvent({
      ...event,
    });

    setOpenDialog(true);
  };

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: "YYYY-MM-DDTHH:mm"
  };

  // New function to format date for API
  const formatDateForAPI = (dateString) => {
    if (!dateString) return null; // Handle null or undefined dates

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString);
        return null; // Prevents crash
    }
    return date.toISOString(); // Format: "YYYY-MM-DDTHH:mm:ss.sssZ"
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingEvent(prev => ({ ...prev, [name]: value }));
  };

  const handlePosterChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const blob = await fileToBlob(file);
      setNewPoster(blob);
    }
  };

  const handleUpdateEvent = async () => {
    try {
      setIsUpdating(true);
      const scriptId = 'admin_tournament_script';
      const action = 'updateEvent';
      
      let updatedEventData = { 
        ...editingEvent,
        Date: formatDateForAPI(editingEvent.Date),
        startDateTime: formatDateForAPI(editingEvent["Start Date"]),
        endDateTime: formatDateForAPI(editingEvent["End Date"]),
        inventoryQuantity: editingEvent.inventoryQuantity || null
      };

      if (newPoster) {
        const base64Poster = await blobToBase64(newPoster);
        updatedEventData.Poster = base64Poster;
      }
      

      const respone =await apiCall(scriptId, action, {
        googleToken: userData.googleToken,
        username: userData.username,
        eventData: updatedEventData
      });


      setSelectedEvent(updatedEventData);
      //setEditingEvent(null);
      setNewPoster(null);
      await fetchEvents();
    } catch (error) {
      console.error('Failed to update event:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAttendeeEdit = (attendee) => {
    setEditingAttendee({ ...attendee });
  };

  const handleAttendeeChange = (field, value) => {
    setEditingAttendee(prev => ({ ...prev, [field]: value }));
  };

  const handleAttendeeSave = async () => {
    if (!editingAttendee) return;
  
    try {
      const scriptId = 'admin_tournament_script';
      const action = 'updateAttendee';
      
      const response = await apiCall(scriptId, action, {
        googleToken: userData.googleToken,
        username: userData.username,
        eventId: selectedEvent['Event ID'],
        attendeeData: editingAttendee
      });
  
      if (response.success) {
        // Update the local state
        setSelectedEvent(prevEvent => ({
          ...prevEvent,
          Attendees: prevEvent.Attendees.map(attendee => 
            attendee.uniqueCode === editingAttendee.uniqueCode ? editingAttendee : attendee
          )
        }));
  
        // If we're editing the event, update the editing state as well
        if (editingEvent) {
          setEditingEvent(prevEvent => ({
            ...prevEvent,
            Attendees: prevEvent.Attendees.map(attendee => 
              attendee.uniqueCode === editingAttendee.uniqueCode ? editingAttendee : attendee
            )
          }));
        }
  
        setEditingAttendee(null);
        // You can add a success message here if you want
        console.log(response.message);
      } else {
        // Handle the case where the update was not successful
        console.error(response.message);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error('Failed to update attendee:', error);
      // You might want to show an error message to the user here
    }
  };


  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
    setEditingEvent(null);
  };

  const removeEvent = async (eventId) => {
    setLoading(true);
    try {
      const scriptId = 'admin_tournament_script';
      const action = 'removeEvent';
      
      await apiCall(scriptId, action, {
        googleToken: userData.googleToken,
        username: userData.username,
        eventId: eventId
      });

      await fetchEvents();
    } catch (error) {
      console.error('Failed to remove event:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  if (loading) {
    return <CircularProgress sx={{ color: '#8b0000' }} />;
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '80vh',
      width: '100%',
      overflow: 'hidden',
      bgcolor: '#1a1a1a',
      color: '#ffffff'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider'
      }}>
        <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
          Event Manager
        </Typography>
        <Button onClick={onClose} size="small" sx={{ color: '#8b0000' }}>
          Close
        </Button>
      </Box>
      
      <Tabs 
        value={currentTab} 
        onChange={handleTabChange} 
        aria-label="event manager sections"
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Create Event" />
        <Tab label="Upcoming Events" />
        <Tab label="Past Events" />
      </Tabs>

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
      {currentTab === 0 && (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Top section with name, type and image */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Event Name"
                name="name"
                value={eventPanels[0].name}
                onChange={(e) => handleInputChange(e, 0)}
                required
                InputLabelProps={{
                  style: { color: '#ffffff' },
                }}
                InputProps={{
                  style: { color: '#ffffff' },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>TCG Type</InputLabel>
                <Select
                  name="tcgType"
                  value={eventPanels[0].tcgType}
                  onChange={(e) => handleInputChange(e, 0)}
                  required
                >
                  {tcgTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="contained"
                  component="span"
                  style={{ backgroundColor: '#4a4a4a', color: '#ffffff', marginRight: '10px' }}
                >
                  Upload image
                </Button>
              </label>
              {eventPanels[0].image && (
                <Typography variant="body2" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                  {eventPanels[0].image.name}
                </Typography>
              )}
            </Grid>

            {/* Event panels */}
            {eventPanels.map((panel, index) => (
              <Grid item xs={12} key={index}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(74, 74, 74, 0.8)', mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Event Details {index + 1}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                          label="Start Date and Time"
                          value={panel.startDateTime}
                          onChange={(newValue) => handleInputChange({
                            target: {
                              name: 'startDateTime',
                              value: newValue
                            }
                          }, index)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              required: true,
                              InputLabelProps: { style: { color: '#ffffff' } },
                              InputProps: {
                                style: { color: '#ffffff' },
                                sx: { 
                                  bgcolor: 'rgba(74, 74, 74, 0.8)',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#4a4a4a'
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#8b0000'
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#8b0000'
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                          label="End Date and Time"
                          value={panel.endDateTime}
                          onChange={(newValue) => handleInputChange({
                            target: {
                              name: 'endDateTime',
                              value: newValue
                            }
                          }, index)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              required: true,
                              InputLabelProps: { style: { color: '#ffffff' } },
                              InputProps: {
                                style: { color: '#ffffff' },
                                sx: { 
                                  bgcolor: 'rgba(74, 74, 74, 0.8)',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#4a4a4a'
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#8b0000'
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#8b0000'
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={panel.description}
                        onChange={(e) => handleInputChange(e, index)}
                        multiline
                        rows={3}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Message to Buyer"
                        name="messageToBuyer"
                        value={panel.messageToBuyer}
                        onChange={(e) => handleInputChange(e, index)}
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Prizes"
                        name="prizes"
                        value={panel.prizes}
                        onChange={(e) => handleInputChange(e, index)}
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Rules"
                        name="rules"
                        value={panel.rules}
                        onChange={(e) => handleInputChange(e, index)}
                        multiline
                        rows={3}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Pre-release Bundle Includes"
                        name="preReleaseBundle"
                        value={panel.preReleaseBundle}
                        onChange={(e) => handleInputChange(e, index)}
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Price"
                        name="price"
                        type="number"
                        value={panel.price}
                        onChange={(e) => handleInputChange(e, index)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Inventory Quantity (1-50)"
                        name="inventoryQuantity"
                        type="number"
                        value={panel.inventoryQuantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value >= 1 && value <= 50) {
                            handleInputChange(e, index);
                          }
                        }}
                        inputProps={{ min: 1, max: 50 }}                     
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Reader Info"
                        name="reader_info"
                        value={panel.reader_info}
                        onChange={(e) => handleInputChange(e, index)}
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      style={{ backgroundColor: '#8b0000', color: '#ffffff' }}
                      onClick={() => {
                        setEventPanels(prev => {
                          const newPanel = {
                            ...prev[index],                            
                            // startDateTime: prev[index].startDateTime,
                            // endDateTime: prev[index].endDateTime,
                            isOneTime: false
                          };
                          const updatedPanels = [...prev, newPanel];
                          // Update isOneTime for all panels when there's more than one
                          if (updatedPanels.length > 1) {
                            return updatedPanels.map(panel => ({ ...panel, isOneTime: false }));
                          }
                          return updatedPanels;
                        });
                      }}
                    >
                      Duplicate Event
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}

            {/* Buttons at the bottom */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  style={{ backgroundColor: '#8b0000', color: '#ffffff' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Create Event'}
                </Button>
              </Box>
              {error && <Typography color="error">{error}</Typography>}
            </Grid>
          </Grid>
        </form>
      )}
      {currentTab === 1 && (
        <>
          <Typography variant="h5" gutterBottom>Upcoming Events</Typography>
          <TableContainer component={Paper} sx={{ bgcolor: '#2a2a2a', color: '#ffffff' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#ffffff' }}>Name</TableCell>
                  <TableCell sx={{ color: '#ffffff' }}>Date & Time</TableCell>
                  <TableCell sx={{ color: '#ffffff' }}>TCG Type</TableCell>
                  <TableCell sx={{ color: '#ffffff' }}>Price</TableCell>
                  <TableCell sx={{ color: '#ffffff' }}>Attendees</TableCell>
                  <TableCell sx={{ color: '#ffffff' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events
                  .filter(event => new Date(event['Start Date']) >= new Date())
                  .map((event) => (
                    <TableRow key={event['Event ID']}>
                      <TableCell style={{ color: '#ffffff' }}>{event.Name}</TableCell>
                      <TableCell style={{ color: '#ffffff' }}>
                        {new Date(event['Start Date']).toLocaleString()} - 
                        {new Date(event['End Date']).toLocaleString()}
                      </TableCell>
                      <TableCell style={{ color: '#ffffff' }}>{event['Type of event']}</TableCell>
                      <TableCell style={{ color: '#ffffff' }}>€{event.Price}</TableCell>
                      <TableCell style={{ color: '#ffffff' }}>{event.Attendees ? event.Attendees.length : 0}</TableCell>
                      <TableCell>
                        <Button onClick={() => handleEventClick(event)}>
                          <span className="material-icons" style={{ color: '#ffffff' }}>info</span>
                        </Button>
                        <Button onClick={() => removeEvent(event['Event ID'])}>
                          <span className="material-icons" style={{ color: '#ffffff' }}>delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
        {currentTab === 2 && (
          <>
            <Typography variant="h5" gutterBottom>Past Events</Typography>
            <TableContainer component={Paper} sx={{ bgcolor: '#2a2a2a', color: '#ffffff' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#ffffff' }}>Name</TableCell>
                    <TableCell sx={{ color: '#ffffff' }}>Date & Time</TableCell>
                    <TableCell sx={{ color: '#ffffff' }}>TCG Type</TableCell>
                    <TableCell sx={{ color: '#ffffff' }}>Price</TableCell>
                    <TableCell sx={{ color: '#ffffff' }}>Attendees</TableCell>
                    <TableCell sx={{ color: '#ffffff' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events
                    .filter(event => new Date(event['Start Date']) < new Date())
                    .map((event) => (
                      <TableRow key={event['Event ID']}>
                        <TableCell style={{ color: '#ffffff' }}>{event.Name}</TableCell>
                        <TableCell style={{ color: '#ffffff' }}>
                        {new Date(event['Start Date']).toLocaleString()} - 
                        {new Date(event['End Date']).toLocaleString()}
                        </TableCell>
                        <TableCell style={{ color: '#ffffff' }}>{event['Type of event']}</TableCell>
                        <TableCell style={{ color: '#ffffff' }}>€{event.Price}</TableCell>
                        <TableCell style={{ color: '#ffffff' }}>{event.Attendees ? event.Attendees.length : 0}</TableCell>
                        <TableCell>
                          <Button onClick={() => handleEventClick(event)}>
                            <span className="material-icons" style={{ color: '#ffffff' }}>info</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>

      <Dialog 
      open={openDialog} 
      onClose={handleCloseDialog} 
      PaperProps={{
        style: {
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          backgroundImage: selectedEvent?.Poster ? `url(${selectedEvent.Poster})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        },
      }}
    >
      {selectedEvent && (
        <>
          <DialogTitle sx={{ backgroundColor: 'rgba(26, 26, 26, 0.7)' }}>
            {selectedEvent.Name}
          </DialogTitle>
          <DialogContent sx={{ 
            backgroundColor: 'rgba(26, 26, 26, 0.7)', 
            backdropFilter: 'blur(5px)'
            }}>
              {editingEvent ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="Name"
                      value={editingEvent.Name}
                      onChange={handleEditChange}
                      InputLabelProps={{ style: { color: '#ffffff' } }}
                      InputProps={{ 
                        style: { color: '#ffffff' },
                        sx: { backgroundColor: 'rgba(74, 74, 74, 0.8)' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={editingEvent.isOneTime}
                          onChange={(e) => handleEditChange({ target: { name: 'isOneTime', value: e.target.checked }})}
                          sx={{ color: '#ffffff' }}
                        />
                      }
                      label="One Time Event"
                      sx={{ color: '#ffffff' }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker
                        label="Start Date and Time"
                        value={editingEvent["Start Date"] ? dayjs(editingEvent["Start Date"]) : null} 
                        onChange={(newValue) => handleEditChange({ target: { name: 'Start Date', value: newValue }})}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                        InputLabelProps={{ style: { color: '#ffffff' } }}
                        InputProps={{
                          style: { color: '#ffffff' },
                          sx: { 
                            bgcolor: 'rgba(74, 74, 74, 0.8)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#4a4a4a'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#8b0000'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#8b0000'
                            }
                          }
                        }}
                      />
                    </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                          label="End Date and Time"
                          value={editingEvent["End Date"] ? dayjs(editingEvent["End Date"]) : null}
                          onChange={(newValue) => handleEditChange({ target: { name: 'End Date', value: newValue }})}
                          renderInput={(params) => <TextField {...params} fullWidth />}
                          InputLabelProps={{ style: { color: '#ffffff' } }}
                          InputProps={{
                            style: { color: '#ffffff' },
                            sx: { 
                              bgcolor: 'rgba(74, 74, 74, 0.8)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4a4a4a'
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#8b0000'
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#8b0000'
                              }
                            }
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="TCG Type"
                      name="Type of event"
                      value={editingEvent['Type of event']}
                      onChange={handleEditChange}
                      InputLabelProps={{ style: { color: '#ffffff' } }}
                      InputProps={{
                        style: { color: '#ffffff' },
                        sx: { 
                          bgcolor: 'rgba(74, 74, 74, 0.8)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#4a4a4a'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b0000'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b0000'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="Description"
                      value={editingEvent["Description"]}
                      onChange={handleEditChange}
                      multiline
                      rows={3}
                      InputLabelProps={{ style: { color: '#ffffff' } }}
                      InputProps={{
                        style: { color: '#ffffff' },
                        sx: { 
                          bgcolor: 'rgba(74, 74, 74, 0.8)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#4a4a4a'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b0000'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b0000'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Price"
                      name="Price"
                      type="number"
                      value={editingEvent["Price"]}
                      onChange={handleEditChange}
                      InputLabelProps={{ style: { color: '#ffffff' } }}
                      InputProps={{
                        style: { color: '#ffffff' },
                        sx: { 
                          bgcolor: 'rgba(74, 74, 74, 0.8)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#4a4a4a'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b0000'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b0000'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Inventory Quantity (1-50)"
                      name="Inventory Quantity"
                      type="number"
                      value={editingEvent["Inventory Quantity"] || ''}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 1 && value <= 50) {
                          handleEditChange(e);
                        }
                      }}
                      inputProps={{ min: 1, max: 50 }}                             
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Artist Fees"
                      name="Artist Fees"
                      type="string"
                      value={editingEvent["Artist Fees"]}
                      onChange={handleEditChange}
                      InputLabelProps={{ style: { color: '#ffffff' } }}
                      InputProps={{
                        style: { color: '#ffffff' },
                        sx: { 
                          bgcolor: 'rgba(74, 74, 74, 0.8)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#4a4a4a'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b0000'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b0000'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Set up time"
                      name="SETUP_TIME"
                      type="string"
                      value={editingEvent["SETUP_TIME"]}
                      onChange={handleEditChange}
                      InputLabelProps={{ style: { color: '#ffffff' } }}
                      InputProps={{
                        style: { color: '#ffffff' },
                        sx: { 
                          bgcolor: 'rgba(74, 74, 74, 0.8)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#4a4a4a'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b0000'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b0000'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Start time"
                      name="START_TIME"
                      type="string"
                      value={editingEvent["START_TIME"]}
                      onChange={handleEditChange}
                      InputLabelProps={{ style: { color: '#ffffff' } }}
                      InputProps={{
                        style: { color: '#ffffff' },
                        sx: { 
                          bgcolor: 'rgba(74, 74, 74, 0.8)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#4a4a4a'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b0000'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b0000'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Take down time"
                      name="TAKE_DOWN_TIME"
                      type="string"
                      value={editingEvent["TAKE_DOWN_TIME"]}
                      onChange={handleEditChange}
                      InputLabelProps={{ style: { color: '#ffffff' } }}
                      InputProps={{
                        style: { color: '#ffffff' },
                        sx: { 
                          bgcolor: 'rgba(74, 74, 74, 0.8)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#4a4a4a'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b0000'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b0000'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message to Buyer"
                      name="Message for the email"
                      value={editingEvent["Message for the email"]}
                      onChange={handleEditChange}
                      multiline
                      rows={2}
                      InputLabelProps={{ style: { color: '#ffffff' } }}
                      InputProps={{
                        style: { color: '#ffffff' },
                        sx: { 
                          bgcolor: 'rgba(74, 74, 74, 0.8)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#4a4a4a'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b0000'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b0000'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Reader Info"
                      name="Message for the reader"
                      value={editingEvent["Message for the reader"]}
                      onChange={handleEditChange}
                      multiline
                      rows={2}
                      InputLabelProps={{ style: { color: '#ffffff' } }}
                      InputProps={{
                        style: { color: '#ffffff' },
                        sx: { bgcolor: 'rgba(74, 74, 74, 0.8)' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Prizes"
                      name="Prizes"
                      value={editingEvent["Prizes"] }
                      onChange={handleEditChange}
                      multiline
                      rows={2}
                      InputLabelProps={{ style: { color: '#ffffff' } }}
                      InputProps={{
                        style: { color: '#ffffff' },
                        sx: { bgcolor: 'rgba(74, 74, 74, 0.8)' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Rules"
                      name="Rules"
                      value={editingEvent["Rules"]}
                      onChange={handleEditChange}
                      multiline
                      rows={3}
                      InputLabelProps={{ style: { color: '#ffffff' } }}
                      InputProps={{
                        style: { color: '#ffffff' },
                        sx: { bgcolor: 'rgba(74, 74, 74, 0.8)' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Pre-release Bundle Includes"
                      name="Pre-Release Bundle Includes"
                      value={editingEvent["Pre-Release Bundle Includes"] }
                      onChange={handleEditChange}
                      multiline
                      rows={2}
                      InputLabelProps={{ style: { color: '#ffffff' } }}
                      InputProps={{
                        style: { color: '#ffffff' },
                        sx: { bgcolor: 'rgba(74, 74, 74, 0.8)' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="poster-upload"
                    type="file"
                    onChange={handlePosterChange}
                  />
                  <label htmlFor="poster-upload">
                    <Button
                      variant="contained"
                      component="span"
                      style={{ backgroundColor: '#4a4a4a', color: '#ffffff', marginRight: '10px' }}
                    >
                      Change Poster
                    </Button>
                  </label>
                  {newPoster && (
                    <Typography variant="body2" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                      New poster selected
                    </Typography>
                  )}
                </Grid>
              </Grid>
              ) : (
                <>
                  <Typography sx={{ backgroundColor: 'rgba(74, 74, 74, 0.8)', padding: '5px' }}>
                    Start: {new Date(selectedEvent["Start Date"]).toLocaleString()}
                  </Typography>
                  <Typography sx={{ backgroundColor: 'rgba(74, 74, 74, 0.8)', padding: '5px', mt: 1 }}>
                    End: {new Date(selectedEvent["End Date"]).toLocaleString()}
                  </Typography>
                  <Typography sx={{ backgroundColor: 'rgba(74, 74, 74, 0.8)', padding: '5px', mt: 1 }}>
                    TCG Type: {selectedEvent['Type of event']}
                  </Typography>
                  <Typography sx={{ backgroundColor: 'rgba(74, 74, 74, 0.8)', padding: '5px', mt: 1 }}>
                    Description: {selectedEvent.Description}
                  </Typography>
                  <Typography sx={{ backgroundColor: 'rgba(74, 74, 74, 0.8)', padding: '5px', mt: 1 }}>
                    Price: €{selectedEvent.Price}
                  </Typography>
                </>
              )}
              
              <Typography variant="h6" style={{ marginTop: '20px' }}>Attendees</Typography>
                <TableContainer component={Paper} sx={{ 
                  bgcolor: 'rgba(42, 42, 42, 0.8)', 
                  color: '#ffffff', 
                  marginTop: '10px' 
                }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#ffffff' }}>Name</TableCell>
                        <TableCell sx={{ color: '#ffffff' }}>Status</TableCell>
                        <TableCell sx={{ color: '#ffffff' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(editingEvent || selectedEvent).Attendees.map((attendee) => (
                        <TableRow key={attendee.uniqueCode}>
                          <TableCell style={{ color: '#ffffff' }}>
                            {editingAttendee?.uniqueCode === attendee.uniqueCode ? (
                              <TextField
                                value={editingAttendee.name}
                                onChange={(e) => handleAttendeeChange('name', e.target.value)}
                                InputProps={{
                                  style: { color: '#ffffff' },
                                  sx: { backgroundColor: 'rgba(74, 74, 74, 0.8)' }
                                }}
                              />
                            ) : (
                              attendee.name
                            )}
                          </TableCell>
                          <TableCell style={{ color: '#ffffff' }}>
                            {editingAttendee?.uniqueCode === attendee.uniqueCode ? (
                              <Select
                                value={editingAttendee.status}
                                onChange={(e) => handleAttendeeChange('status', e.target.value)}
                                style={{ color: '#ffffff' }}
                                sx={{ backgroundColor: 'rgba(74, 74, 74, 0.8)' }}
                              >
                                <MenuItem value="Paid">Paid</MenuItem>
                                <MenuItem value="Pending">Pending</MenuItem>
                                <MenuItem value="Sent">Sent</MenuItem>
                              </Select>
                            ) : (
                              attendee.status
                            )}
                          </TableCell>
                          <TableCell>
                            {editingAttendee?.uniqueCode === attendee.uniqueCode ? (
                              <IconButton onClick={handleAttendeeSave} size="small">
                                <span className="material-icons" style={{ color: '#ffffff' }}>save</span>
                              </IconButton>
                            ) : (
                              <IconButton onClick={() => handleAttendeeEdit(attendee)} size="small">
                                <span className="material-icons" style={{ color: '#ffffff' }}>edit</span>
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: 'rgba(26, 26, 26, 0.7)', padding: '16px' }}>
  {editingEvent && (
    <Button
      onClick={handleUpdateEvent}
      variant="contained"
      sx={{
        backgroundColor: '#8b0000',
        color: '#ffffff',
        borderRadius: '8px',
        padding: '8px 16px',
        textTransform: 'none',
        '&:hover': {
          backgroundColor: '#a10000'
        }
      }}
      disabled={isUpdating}
    >

       {isUpdating ? (
        <>
          <CircularProgress size={20} sx={{ color: '#ffffff', marginRight: '8px' }} />
          Updating...
        </>
      ) : (
        "Update"
      )}
    </Button>
  )}
  
  <Button
    onClick={handleCloseDialog}
    variant="outlined"
    sx={{
      borderColor: '#8b0000',
      color: '#8b0000',
      backgroundColor:'rgb(255, 255, 255)',
      borderRadius: '8px',
      padding: '8px 16px',
      textTransform: 'none',
      '&:hover': {
        backgroundColor: 'rgb(255, 255, 255)',
        borderColor: '#a10000'
      }
    }}
    disabled={isUpdating}
  >
    Close
  </Button>
</DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default EventManager;