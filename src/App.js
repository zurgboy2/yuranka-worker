import React from 'react';
import { CssBaseline, ThemeProvider, createTheme, GlobalStyles } from '@mui/material';
import Dashboard from './Dashboard';
import { UserProvider } from './UserContext';
import { CheckInProvider } from './CheckInContext';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8B0000', // blood red
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

const globalStyles = {
  '*::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '*::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '*::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
  },
  '*::-webkit-scrollbar-thumb:hover': {
    background: 'rgba(255, 255, 255, 0.3)',
  },
  'body': {
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
  },
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={globalStyles} />
      <UserProvider>
        <CheckInProvider>
          <Dashboard />
        </CheckInProvider>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;