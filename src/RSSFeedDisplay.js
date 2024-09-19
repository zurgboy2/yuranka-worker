import React, { useState, useEffect, useCallback } from 'react';
import { 
  Paper, Typography, Tabs, Tab, Box, List, ListItem, ListItemText,
  CircularProgress, Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, useTheme, useMediaQuery
} from '@mui/material';
import DOMPurify from 'dompurify';
import apiCall from './api';
import { useUserData } from './UserContext';

const RSSFeedDisplay = () => {
  const { userData } = useUserData();
  const [feeds, setFeeds] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const fetchRSSFeeds = useCallback(async () => {
    try {
      const scriptId = 'dashboard_script';
      const action = 'getRSSFeeds';
      
      const response = await apiCall(scriptId, action, {
        googleToken: userData.googleToken, 
        username: userData.username
      });
      
      if (typeof response === 'object' && response !== null) {
        setFeeds(response);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Failed to fetch RSS feeds:', error);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    fetchRSSFeeds();
  }, [fetchRSSFeeds]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const truncateDescription = (description, maxLength = 150) => {
    const strippedText = description.replace(/<[^>]+>/g, '');
    return strippedText.length <= maxLength ? strippedText : `${strippedText.substr(0, maxLength)}...`;
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  if (loading) {
    return <CircularProgress sx={{ color: '#8b0000' }} />;
  }

  const feedTitles = Object.keys(feeds);

  return (
    <Paper elevation={3} sx={{ 
      height: '100%', 
      backgroundColor: '#1a1a1a', 
      color: '#ffffff', 
      display: 'flex', 
      flexDirection: 'column',
      maxHeight: '800px',
      overflow: 'hidden',
    }}>
      <Typography variant="h6" sx={{ p: 2, color: '#ffffff' }}>RSS Feeds</Typography>
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          '& .MuiTabs-indicator': {
            backgroundColor: '#8b0000',
          },
          '& .MuiTab-root': {
            color: '#ffffff',
            '&.Mui-selected': {
              color: '#8b0000',
            },
          },
        }}
      >
        {feedTitles.map((title, index) => (
          <Tab label={title} key={index} />
        ))}
      </Tabs>
      <Box sx={{ flexGrow: 1, overflow: 'auto', overflowX: 'hidden' }}>
        {feedTitles.map((title, index) => (
          <TabPanel value={activeTab} index={index} key={index}>
            <List>
              {feeds[title].map((item, itemIndex) => (
                <React.Fragment key={itemIndex}>
                  <ListItem 
                    alignItems="flex-start" 
                    button 
                    onClick={() => handleItemClick(item)}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#2a2a2a',
                      },
                    }}
                  >
                    <ListItemText 
                      primary={<Typography color="#ffffff" noWrap>{item.title}</Typography>}
                      secondary={
                        <>
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="#cccccc"
                          >
                            {formatDate(item.pubDate)}
                          </Typography>
                          <Typography
                            component="span"
                            variant="body2"
                            color="#a0a0a0"
                            sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          >
                            {truncateDescription(item.description)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {itemIndex < feeds[title].length - 1 && <Divider variant="inset" component="li" sx={{ backgroundColor: '#333333' }} />}
                </React.Fragment>
              ))}
            </List>
          </TabPanel>
        ))}
      </Box>
      <Dialog
        fullScreen={fullScreen}
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="responsive-dialog-title"
        PaperProps={{
          style: {
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            maxHeight: '90vh',
            maxWidth: '90vw',
            width: '100%',
          },
        }}
      >
        {selectedItem && (
          <>
            <DialogTitle id="responsive-dialog-title" sx={{ color: '#ffffff' }}>{selectedItem.title}</DialogTitle>
            <DialogContent dividers>
              <Typography variant="subtitle1" gutterBottom sx={{ color: '#cccccc' }}>
                Published on: {formatDate(selectedItem.pubDate)}
              </Typography>
              <Box 
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedItem.description) }}
                sx={{ 
                  color: '#ffffff',
                  '& a': { color: '#8b0000' },
                  '& img': { maxWidth: '100%', height: 'auto' },
                  overflowWrap: 'break-word',
                  wordWrap: 'break-word',
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} sx={{ color: '#8b0000' }} autoFocus>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`rss-tabpanel-${index}`}
    aria-labelledby={`rss-tab-${index}`}
    {...other}
  >
    {value === index && (
      <Box sx={{ width: '100%' }}>
        {children}
      </Box>
    )}
  </div>
);

export default RSSFeedDisplay;