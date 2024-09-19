import React, { useState } from 'react';
import { 
  ThemeProvider, createTheme, 
  CssBaseline, Container, Typography, Box, 
  Button,
  useMediaQuery
} from '@mui/material';
import InvoiceManagementComponent from './InvoiceManagementComponent'; // Adjust the import path as necessary
import PurchaseAdderComponent from './purchaseAdder'; // Import the new PurchaseAdderComponent
import InvoiceGeneratorComponent from './InvoiceGeneratorComponent'; // Adjust the import path as necessary

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
        },
      },
    },
  },
});

const CashFlowSuperApp = () => {
  const [activeSection, setActiveSection] = useState(null);
  const isMobile = useMediaQuery(darkTheme.breakpoints.down('sm'));

  const toggleSection = (sectionId) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Accounting
          </Typography>
          <Box sx={{ mb: 4, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
            <Button onClick={() => toggleSection('invoiceGenerator')} variant="contained" fullWidth={isMobile}>
              Invoice Generator
            </Button>
            <Button onClick={() => toggleSection('invoiceManagement')} variant="contained" fullWidth={isMobile}>
              Invoice Management
            </Button>
            <Button onClick={() => toggleSection('purchaseAdder')} variant="contained" fullWidth={isMobile}>
              Purchase Adder
            </Button>
          </Box>

          {activeSection === 'invoiceGenerator' && (
            <InvoiceGeneratorComponent />
          )}

          {activeSection === 'invoiceManagement' && (
            <InvoiceManagementComponent />
          )}

          {activeSection === 'purchaseAdder' && (
            <PurchaseAdderComponent />
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default CashFlowSuperApp;