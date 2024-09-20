import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  AppBar, Toolbar, Typography, Container, Grid, 
  useTheme, CircularProgress, Alert, Card, CardActionArea, CardContent,
  Dialog, DialogContent, Box
} from '@mui/material';
import roleConfig from './roleConfig';
import { useUserData } from './UserContext';
import { CheckInProvider } from './CheckInContext';
import AuthComponent from './AuthComponent';
import TaskManager from './TaskManager';

const Dashboard = () => {
  const theme = useTheme();
  const { userData, setUserData } = useUserData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openComponent, setOpenComponent] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadedComponents, setLoadedComponents] = useState([]);

  const memoizedRoleConfig = useMemo(() => 
    Object.fromEntries(
      Object.entries(roleConfig).map(([role, components]) => [
        role,
        components.map(({ component, ...rest }) => ({
          ...rest,
          component: typeof component === 'function' ? React.memo(component) : component
        }))
      ])
    ),
    []
  );

  const availableRoles = useMemo(() => Object.keys(memoizedRoleConfig), [memoizedRoleConfig]);

  useEffect(() => {
    if (userData && userData.role && !availableRoles.includes(userData.role)) {
      setError(`Invalid role: ${userData.role}. Please contact an administrator.`);
    } else {
      setError(null);
    }
  }, [userData, availableRoles]);

  useEffect(() => {
    setIsAuthenticated(!!userData);
  }, [userData]);

  const handleOpenComponent = useCallback((componentName) => {
    setOpenComponent(componentName);
  }, []);

  const handleCloseComponent = useCallback(() => {
    setOpenComponent(null);
  }, []);

  useEffect(() => {
    if (isAuthenticated && userData && userData.role && memoizedRoleConfig[userData.role]) {
      const components = memoizedRoleConfig[userData.role];
      let currentIndex = 0;

      const loadNextComponent = () => {
        if (currentIndex < components.length) {
          const currentComponent = components[currentIndex];
          setLoadedComponents(prev => [...prev, currentComponent]);
          currentIndex++;
          setTimeout(loadNextComponent, 500); // Adjust this delay as needed
        }
      };

      loadNextComponent();
    }
  }, [isAuthenticated, userData, memoizedRoleConfig]);

  const renderDashboardContent = useMemo(() => {
    if (!userData || !userData.role || !memoizedRoleConfig[userData.role]) return null;

    const cardComponents = ['Lister', 'Checkout', 'Accounting', 'TaskManager'];

    return (
      <Grid container spacing={3}>
        {loadedComponents.map(({ component: Component, gridProps, name }, index) => {
          if (!Component) {
            console.error(`Component not found for ${name}`);
            return null;
          }
          return (
            <Grid item key={index} {...gridProps}>
              {cardComponents.includes(name) ? (
                <Card>
                  <CardActionArea onClick={() => handleOpenComponent(name)}>
                    <CardContent>
                      {name === 'TaskManager' ? (
                        <Component onOpenFullApp={() => handleOpenComponent(name)} />
                      ) : (
                        <Typography variant="h5" component="div">
                          {name}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              ) : (
                <Component />
              )}
            </Grid>
          );
        })}
      </Grid>
    );
  }, [userData, handleOpenComponent, memoizedRoleConfig, loadedComponents]);

  const dialogContent = useMemo(() => {
    if (!openComponent || !userData || !userData.role || !memoizedRoleConfig[userData.role]) return null;
    
    if (openComponent === 'TaskManager') {
      return <TaskManager onClose={handleCloseComponent} />;
    }
    
    const componentConfig = memoizedRoleConfig[userData.role].find(c => c.name === openComponent);
    if (!componentConfig || !componentConfig.component) return null;
    const Component = componentConfig.component;
    return <Component onClose={handleCloseComponent} />;
  }, [openComponent, userData, handleCloseComponent, memoizedRoleConfig]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress aria-label="Loading dashboard" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <AuthComponent onAuthenticated={setIsAuthenticated} setUserData={setUserData} />;
  }

  return (
    <CheckInProvider>
      <div style={{ flexGrow: 1, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Dashboard
            </Typography>
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              Welcome, {userData?.username}
            </Typography>
            <Typography variant="subtitle1">
              Role: {userData?.role}
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {renderDashboardContent}
        </Container>
        
        <Dialog open={openComponent !== null} onClose={handleCloseComponent} maxWidth="md" fullWidth>
          <DialogContent>
            {dialogContent}
          </DialogContent>
        </Dialog>
      </div>
    </CheckInProvider>
  );
};

export default React.memo(Dashboard);