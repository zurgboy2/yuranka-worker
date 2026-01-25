import React, { useState } from 'react';
import {
  ThemeProvider, createTheme,
  CssBaseline, Container, Typography, Box,
  Tabs, Tab, useMediaQuery
} from '@mui/material';
import ShopifyTab from './tabs/ShopifyTab';
import CardmarketTab from './tabs/CardmarketTab';
import CustomTab from './tabs/CustomTab';
import OutgoingTab from './tabs/OutgoingTab';
import AllInvoicesTab from './tabs/AllInvoicesTab';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff1744',
    },
    secondary: {
      main: '#b71c1c',
    },
    background: {
      default: '#000000',
      paper: '#121212',
    },
    text: {
      primary: '#ff1744',
      secondary: '#f44336',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          color: '#000000',
          backgroundColor: '#ff1744',
          '&:hover': {
            backgroundColor: '#b71c1c',
          },
          margin: '4px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#f44336',
          '&.Mui-selected': {
            color: '#ff1744',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#ff1744',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #b71c1c',
          whiteSpace: 'nowrap',
          padding: '8px 16px',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#ff1744',
        },
      },
    },
  },
});

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`accounting-tabpanel-${index}`}
    aria-labelledby={`accounting-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const AccountingSystem = () => {
  const [mainTab, setMainTab] = useState(0);
  const isMobile = useMediaQuery(darkTheme.breakpoints.down('sm'));

  const handleMainTabChange = (event, newValue) => {
    setMainTab(newValue);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="xl">
        <Box sx={{ my: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Accounting System
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={mainTab}
              onChange={handleMainTabChange}
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons={isMobile ? 'auto' : false}
              aria-label="accounting tabs"
            >
              <Tab label="Shopify" />
              <Tab label="Cardmarket" />
              <Tab label="Custom" />
              <Tab label="Outgoing/Labour" />
              <Tab label="All" />
            </Tabs>
          </Box>

          <TabPanel value={mainTab} index={0}>
            <ShopifyTab />
          </TabPanel>

          <TabPanel value={mainTab} index={1}>
            <CardmarketTab />
          </TabPanel>

          <TabPanel value={mainTab} index={2}>
            <CustomTab />
          </TabPanel>

          <TabPanel value={mainTab} index={3}>
            <OutgoingTab />
          </TabPanel>

          <TabPanel value={mainTab} index={4}>
            <AllInvoicesTab />
          </TabPanel>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default AccountingSystem;
