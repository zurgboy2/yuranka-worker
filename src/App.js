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
  '@import': 'url(https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200)',
  '.material-symbols-outlined': {
    fontFamily: 'Material Symbols Outlined',
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontSize: '24px',
    lineHeight: 1,
    letterSpacing: 'normal',
    textTransform: 'none',
    display: 'inline-block',
    whiteSpace: 'nowrap',
    wordWrap: 'normal',
    direction: 'ltr',
    fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24',
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