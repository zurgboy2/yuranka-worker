import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Typography, Button, TextField, Select, MenuItem,
  FormControl, InputLabel, Grid, Paper, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Tabs, Tab, IconButton
} from '@mui/material';
import 'material-icons/iconfont/material-icons.css';
import apiCall from '../api';
import { useUserData } from '../UserContext';


const EventManager = ({ onClose }) => {
  const { userData } = useUserData();
  const [events, setEvents] = useState([]);
  const [tcgTypes, setTcgTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [newEvent, setNewEvent] = useState({
    name: '',
    datetime: '',
    description: '',
    messageToBuyer: '',
    price: '',
    reader_info: '',
    tcgType: '',
    image: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newPoster, setNewPoster] = useState(null);
  const [editingAttendee, setEditingAttendee] = useState(null);


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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const blob = await fileToBlob(file);
      setNewEvent(prev => ({ ...prev, image: blob }));
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
      
      const eventData = {
        name: newEvent.name,
        datetime: newEvent.datetime,
        description: newEvent.description,
        messageToBuyer: newEvent.messageToBuyer,
        price: newEvent.price,
        reader_info: newEvent.reader_info,
        tcgType: newEvent.tcgType,
      };
      
      if (newEvent.image) {
        const base64Image = await blobToBase64(newEvent.image);
        eventData.image = base64Image;
      }
  
      const response = await apiCall(scriptId, action, {
        googleToken: userData.googleToken,
        username: userData.username,
        formData: eventData
      });
  
      if (response.error) {
        throw new Error(response.error);
      }
  
      // If we reach here, it means the call was successful
      handleSuccessfulSubmission();
    } catch (error) {
      console.error('Error during event creation:', error);
      if (error.message.includes('Request to script time out')) {
        // Treat timeout as success
        console.log('Timeout occurred, but treating as success');
        handleSuccessfulSubmission();
      } else {
        setError(error.message || 'Failed to create event. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSuccessfulSubmission = async () => {
    await fetchEvents();
    setNewEvent({
      name: '',
      datetime: '',
      description: '',
      messageToBuyer: '',
      price: '',
      reader_info: '',
      tcgType: '',
      image: null,
    });
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
    if (new Date(event.Date) >= new Date()) {
      setEditingEvent({
        ...event,
        Date: formatDateForInput(event.Date) // Format the date when setting editingEvent
      });
    } else {
      setEditingEvent(null);
    }
    setOpenDialog(true);
  };

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: "YYYY-MM-DDTHH:mm"
  };

  // New function to format date for API
  const formatDateForAPI = (dateString) => {
    const date = new Date(dateString);
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
      const scriptId = 'admin_tournament_script';
      const action = 'updateEvent';
      
      let updatedEventData = { 
        ...editingEvent,
        Date: formatDateForAPI(editingEvent.Date) // Format the date for API
      };

      if (newPoster) {
        const base64Poster = await blobToBase64(newPoster);
        updatedEventData.Poster = base64Poster;
      }

      await apiCall(scriptId, action, {
        googleToken: userData.googleToken,
        username: userData.username,
        eventData: updatedEventData
      });

      setSelectedEvent(updatedEventData);
      setEditingEvent(null);
      setNewPoster(null);
      await fetchEvents();
    } catch (error) {
      console.error('Failed to update event:', error);
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
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Event Name"
            name="name"
            value={newEvent.name}
            onChange={handleInputChange}
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
          <TextField
            fullWidth
            label="Date and Time"
            name="datetime"
            type="datetime-local"
            value={newEvent.datetime}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true, style: { color: '#ffffff' } }}
            InputProps={{
              style: { color: '#ffffff' },
            }}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={newEvent.description}
            onChange={handleInputChange}
            multiline
            rows={3}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Message to Buyer"
            name="messageToBuyer"
            value={newEvent.messageToBuyer}
            onChange={handleInputChange}
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
            value={newEvent.price}
            onChange={handleInputChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>TCG Type</InputLabel>
            <Select
              name="tcgType"
              value={newEvent.tcgType}
              onChange={handleInputChange}
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
          <TextField
            fullWidth
            label="Reader Info"
            name="reader_info"
            value={newEvent.reader_info}
            onChange={handleInputChange}
            multiline
            rows={2}
          />
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
          {newEvent.image && (
            <Typography variant="body2" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
              {newEvent.image.name}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12}>
        <Button 
        type="submit" 
        variant="contained" 
        style={{ backgroundColor: '#8b0000', color: '#ffffff' }}
        disabled={isSubmitting}
      >
        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Create Event'}
      </Button>
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
                  .filter(event => new Date(event.Date) >= new Date())
                  .map((event) => (
                    <TableRow key={event['Event ID']}>
                      <TableCell style={{ color: '#ffffff' }}>{event.Name}</TableCell>
                      <TableCell style={{ color: '#ffffff' }}>{new Date(event.Date).toLocaleString()}</TableCell>
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
                    .filter(event => new Date(event.Date) < new Date())
                    .map((event) => (
                      <TableRow key={event['Event ID']}>
                        <TableCell style={{ color: '#ffffff' }}>{event.Name}</TableCell>
                        <TableCell style={{ color: '#ffffff' }}>{new Date(event.Date).toLocaleString()}</TableCell>
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
                    <TextField
                      fullWidth
                      label="Date"
                      name="Date"
                      type="datetime-local"
                      value={editingEvent.Date}
                      onChange={handleEditChange}
                      InputLabelProps={{ shrink: true, style: { color: '#ffffff' } }}
                      InputProps={{ 
                        style: { color: '#ffffff' },
                        sx: { backgroundColor: 'rgba(74, 74, 74, 0.8)' }
                      }}
                    />
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
                        sx: { backgroundColor: 'rgba(74, 74, 74, 0.8)' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="Description"
                      value={editingEvent.Description}
                      onChange={handleEditChange}
                      multiline
                      rows={3}
                      InputLabelProps={{ style: { color: '#ffffff' } }}
                      InputProps={{ 
                        style: { color: '#ffffff' },
                        sx: { backgroundColor: 'rgba(74, 74, 74, 0.8)' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Price"
                      name="Price"
                      type="number"
                      value={editingEvent.Price}
                      onChange={handleEditChange}
                      InputLabelProps={{ style: { color: '#ffffff' } }}
                      InputProps={{ 
                        style: { color: '#ffffff' },
                        sx: { backgroundColor: 'rgba(74, 74, 74, 0.8)' }
                      }}
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
                        sx: { backgroundColor: 'rgba(74, 74, 74, 0.8)' }
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
                        sx: { backgroundColor: 'rgba(74, 74, 74, 0.8)' }
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
                        sx: { backgroundColor: 'rgba(74, 74, 74, 0.8)' }
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
                        sx: { backgroundColor: 'rgba(74, 74, 74, 0.8)' }
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
                    Date: {new Date(selectedEvent.Date).toLocaleString()}
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
            <DialogActions sx={{ backgroundColor: 'rgba(26, 26, 26, 0.7)' }}>
              {editingEvent ? (
                <Button onClick={handleUpdateEvent} style={{ color: '#8b0000' }}>
                  Update
                </Button>
              ) : null}
              <Button onClick={handleCloseDialog} style={{ color: '#8b0000' }}>
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