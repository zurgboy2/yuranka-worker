import React, { useState } from 'react';
import {
  Tabs, Tab, Box, Typography, Button, IconButton, Tooltip
} from '@mui/material';
import 'material-icons/iconfont/material-icons.css';
import ManualListingRechecking from './ManualListingRechecking.js';
import NewOrderForm from './Orders';

const ListerApp = ({ onStatusChange, onClose }) => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const helpMessage = `
  How to use this app:
  
  1. Lister Mode (Manual Listing/Rechecking):
     - Use this mode to recheck cards.
     - When rechecking, simply hit the "Submit" button for each card, whether you make changes or not.
     - If the card is in the correct location, hit "Submit". This adds the card to the CardMarket table.
     - Important: Let the admin know which sets you're working on so they can remove them from Shopify and CardMarket.
  
  2. Orders Mode:
     - Use this to add orders directly from CardMarket.
     - Copy and paste the entire table from CardMarket, starting from the 'Yu-Gi-Oh cards' heading to the bottom of the table.
     - The app will automatically process the information and update Shopify accordingly.
  
  Remember: Always communicate with the admin about which sets you're working on to avoid conflicts.
  `;

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
        <Tooltip title={helpMessage} arrow>
          <IconButton size="small" sx={{ mr: 2 }}>
            <span className="material-icons">help_outline</span>
          </IconButton>
        </Tooltip>
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