import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  AppBar, Toolbar, Typography, Container, Grid, 
  useTheme, CircularProgress, Alert, Card, CardActionArea, CardContent,
  Dialog, DialogContent, Box, Button, DialogTitle, DialogActions, List, ListItem, ListItemText
} from '@mui/material';
import roleConfig from './roleConfig';
import { useUserData } from './UserContext';
import { CheckInProvider } from './CheckInContext';
import AuthComponent from './AuthComponent';
import TaskManager from './TaskManager';
import Approvals from './Approvals';

const Dashboard = () => {
  const theme = useTheme();
  const { userData, setUserData } = useUserData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openComponent, setOpenComponent] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadedComponents, setLoadedComponents] = useState([]);
  const [jobDescription, setJobDescription] = useState(null);
  const [showJobDescription, setShowJobDescription] = useState(false);

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
    if (userData && userData.jobDescription) {
      try {
        const parsedJobDescription = JSON.parse(userData.jobDescription);
        setJobDescription(parsedJobDescription);
      } catch (error) {
        console.error('Error parsing job description:', error);
        setJobDescription(null);
      }
    }
  }, [userData]);

  const handleOpenComponent = useCallback((componentName) => {
    setOpenComponent(componentName);
  }, []);

  const handleCloseComponent = useCallback(() => {
    setOpenComponent(null);
  }, []);

  const renderJobDescription = (description) => {
    if (!description) return null;

    return (
      <>
        <Typography variant="h4" gutterBottom>{description.title}</Typography>
        {description.sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <Typography variant="h5" gutterBottom>{section.title}</Typography>
            {section.subsections.map((subsection, subsectionIndex) => (
              <div key={subsectionIndex}>
                {subsection.title && (
                  <Typography variant="h6" gutterBottom>{subsection.title}</Typography>
                )}
                <List>
                  {subsection.items.map((item, itemIndex) => (
                    <ListItem key={itemIndex}>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </div>
            ))}
          </div>
        ))}
      </>
    );
  };

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

    const cardComponents = ['Lister', 'Checkout', 'Accounting', 'TaskManager', 'Register', 'EventManager','StoreSearch', 'QrCodeGenerator', 'LoyaltyDashboard', 'ScheduleForm','CardSearch', 'testUser'];

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
                      {name === 'TaskManager' || name === 'Approvals' ? (
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
    
    if (openComponent === 'Approvals') {
      return <Approvals onClose={handleCloseComponent} />;
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
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              Role: {userData?.role}
            </Typography>
            <Button color="inherit" onClick={() => setShowJobDescription(true)}>
              View Job Description
            </Button>
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

      <Dialog open={showJobDescription} onClose={() => setShowJobDescription(false)} maxWidth="md" fullWidth>
        <DialogTitle>Job Description</DialogTitle>
        <DialogContent>
          {jobDescription ? renderJobDescription(jobDescription) : <Typography>No job description available.</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowJobDescription(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      </div>
    </CheckInProvider>
  );
};

export default React.memo(Dashboard);