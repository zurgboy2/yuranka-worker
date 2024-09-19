import React, { useState } from 'react';
import {
  Tabs, Tab, Box, Typography, Button
} from '@mui/material';
import ManualListingRechecking from './ManualListingRechecking.js';
import NewOrderForm from './Orders';

const ListerApp = ({ onStatusChange, onClose }) => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '80vh',
      width: '100%',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider'
      }}>
        <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
          Lister App
        </Typography>
        <Button onClick={onClose} size="small">
          Close
        </Button>
      </Box>
      
      <Tabs 
        value={currentTab} 
        onChange={handleTabChange} 
        aria-label="lister app sections"
        variant="fullWidth"
      >
        <Tab label="Manual Listing/Rechecking" />
        <Tab label="Orders" />
      </Tabs>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
        {currentTab === 0 && <ManualListingRechecking onStatusChange={onStatusChange} />}
        {currentTab === 1 && <NewOrderForm onStatusChange={onStatusChange} />}
      </Box>
    </Box>
  );
};

export default ListerApp;