import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import { styled } from '@mui/system';
import apiCall from './api';
import { useUserData } from './UserContext';

// Update the StyledCard component definition
const StyledCard = styled(Card)(({ theme }) => ({
  border: '1px solid #b22222',
  borderRadius: '5px',
  margin: '16px',
  display: 'inline-block',
  verticalAlign: 'top',
  backgroundColor: '#333',
  color: '#fff',
  cursor: 'pointer',
  // Responsive width
  [theme.breakpoints.down('sm')]: {
    width: 'calc(100% - 32px)', // One card per row on mobile
  },
  [theme.breakpoints.up('sm')]: {
    width: 'calc(50% - 32px)', // Two cards per row on tablet
  },
  [theme.breakpoints.up('md')]: {
    width: 'calc(33.33% - 32px)', // Three cards per row on medium screens
  },
  [theme.breakpoints.up('lg')]: {
    width: 'calc(25% - 32px)', // Four cards per row on large screens
  },
}));

const StyledButton = styled(Button)({
  backgroundColor: '#b22222',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#ff6347',
  },
});

const LoyaltyDashboard = () => {
  const { userData } = useUserData();
  const [loyaltyData, setLoyaltyData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [changeValueOpen, setChangeValueOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [currentPerson, setCurrentPerson] = useState(null);
  const [valueChange, setValueChange] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [newSubscriptionTier, setNewSubscriptionTier] = useState('0');
  const [monthsToAdd, setMonthsToAdd] = useState('');
  const [subscriptionCost, setSubscriptionCost] = useState('');
  const [changeRafflePointsOpen, setChangeRafflePointsOpen] = useState(false);
  const [rafflePointsChange, setRafflePointsChange] = useState('');
  const [rafflePointsChangeReason, setRafflePointsChangeReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValueChangeLoading, setIsValueChangeLoading] = useState(false);
  const [isRafflePointsLoading, setIsRafflePointsLoading] = useState(false);
  
  const fetchLoyaltyData = useCallback(async () => {
    setIsLoading(true);
    try {
      const scriptId = 'loyalty_script';
      const action = 'getLoyaltyData';
      const response = await apiCall(scriptId, action, { 
        username: userData.username, 
        googleToken: userData.googleToken
      });
      
      // Sort the response data alphabetically by Name
      const sortedData = response.sort((a, b) => {
        return a.Name.localeCompare(b.Name);
      });
      
      setLoyaltyData(sortedData);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      alert('Error loading data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userData.username, userData.googleToken]);
  
  useEffect(() => {
    fetchLoyaltyData();
  }, [fetchLoyaltyData]);


  const handleOpenProfile = (person) => {
    setCurrentPerson(person);
    setProfileOpen(true);
  };

  const handleCloseProfile = () => {
    if (isLoading) return;
    setProfileOpen(false);
    setCurrentPerson(null);
};

const handleCloseChangeValue = () => {
    if (isValueChangeLoading) return;  // Check valueChange-specific loading
    setChangeValueOpen(false);
    setValueChange('');
    setChangeReason('');
};

const handleCloseChangeRafflePoints = () => {
    if (isRafflePointsLoading) return;  // Check rafflePoints-specific loading
    setChangeRafflePointsOpen(false);
    setRafflePointsChange('');
    setRafflePointsChangeReason('');
};

const handleCloseSubscription = () => {
    if (isLoading) return;
    setSubscriptionOpen(false);
    setNewSubscriptionTier('0');
    setMonthsToAdd('');
    setSubscriptionCost('');
};

  const handleOpenChangeValue = () => {
    setChangeValueOpen(true);
  };


  const handleOpenSubscription = () => {
    setSubscriptionOpen(true);
  };


  const handleOpenChangeRafflePoints = () => {
    setChangeRafflePointsOpen(true);
  };

  

  const handleEditField = async (field, value) => {
    try {
      const scriptId = 'loyalty_script';
      const action = 'updateLoyaltyData';
      await apiCall(scriptId, action, {id: currentPerson.Username, field, value ,googleToken: userData.googleToken , username: userData.username });
      fetchLoyaltyData();
    } catch (error) {
      console.error('Error updating field:', error);
    }
  };

  const handleSubmitChange = async () => {
    if (!valueChange || !changeReason) {
      alert('Please fill out both fields before submitting.');
      return;
    }
  
    setIsValueChangeLoading(true);
    try {
      const scriptId = 'loyalty_script';
      const action = 'changeValue';
      await apiCall(scriptId, action, {
        id: currentPerson.Username, 
        valueChange, 
        changeReason, 
        googleToken: userData.googleToken, 
        username: userData.username 
      });
      handleCloseChangeValue(); // Move this before fetchLoyaltyData
      await fetchLoyaltyData();
      alert('Change has been made');
    } catch (error) {
      console.error('Error submitting change:', error);
      alert('Error making change. Please try again.');
    } finally {
      setIsValueChangeLoading(false);
    }
  };
  
  const handleSubmitRafflePointsChange = async () => {
    if (!rafflePointsChange || !rafflePointsChangeReason) {
      alert('Please fill out both fields before submitting.');
      return;
    }
  
    setIsRafflePointsLoading(true);
    try {
      const scriptId = 'loyalty_script';
      const action = 'changeRafflePoints';
      await apiCall(scriptId, action, {
        id: currentPerson.Username,
        valueChange: rafflePointsChange,
        changeReason: rafflePointsChangeReason,
        googleToken: userData.googleToken,
        username: userData.username
      });
      handleCloseChangeRafflePoints(); // Move this before fetchLoyaltyData
      await fetchLoyaltyData();
      alert('Change has been made');
    } catch (error) {
      console.error('Error submitting raffle points change:', error);
      alert('Error making change. Please try again.');
    } finally {
      setIsRafflePointsLoading(false);
    }
  };

  const calculateSubscriptionCost = () => {
    const costPerMonth = getTierCost(newSubscriptionTier);
    const totalCost = costPerMonth * parseInt(monthsToAdd);
    setSubscriptionCost(`Cost: ${totalCost}`);
  };

  const handleSubmitSubscriptionChange = async () => {
    if (!currentPerson.Email) {
      alert('Email is required to proceed.');
      return;
    }

    const currentSubscriptionTier = currentPerson.Subscription;
    const currentExpiryDate = new Date(currentPerson['Expiry Date']);
    const today = new Date();

    if (currentSubscriptionTier !== '0' && today <= currentExpiryDate) {
      alert(`Cannot change the subscription until the current subscription expires on ${currentPerson['Expiry Date']}.`);
      return;
    }

    today.setMonth(today.getMonth() + parseInt(monthsToAdd));
    const expiryDate = today.toISOString().split('T')[0];

    const tierCost = getTierCost(newSubscriptionTier) * parseInt(monthsToAdd);

    if (window.confirm(`The cost for the new subscription is ${tierCost} euros. Do you want to proceed?`)) {
      try {
        const scriptId = 'loyalty_script';
        const actionUpdateEmail = 'updateLoyaltyData';
        const actionUpdateSubscription = 'updateSubscription';
        const actionSendInvoice = 'sendInvoice';

        await apiCall(scriptId, actionUpdateEmail, {id: currentPerson.Username, field: 'Email', value: currentPerson.Email, googleToken: userData.googleToken , username: userData.username  });
        await apiCall(scriptId, actionUpdateSubscription, {id: currentPerson.Username, newTier: newSubscriptionTier, expiryDate, googleToken: userData.googleToken , username: userData.username  });
        await apiCall(scriptId, actionSendInvoice, {email: currentPerson.Email, newTier: newSubscriptionTier, tierCost, googleToken: userData.googleToken , username: userData.username  });

        handleCloseSubscription();
        fetchLoyaltyData();
      } catch (error) {
        console.error('Error updating subscription:', error);
      }
    }
  };

  const getTierCost = (tier) => {
    const tierCosts = { '0': 0, '1': 10, '2': 20, '3': 30, '4': 50 };
    return tierCosts[tier] || 0;
  };

  const filteredData = loyaltyData.filter(person => 
    person.Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ backgroundColor: '#000', color: '#fff', padding: '20px', position: 'relative' }}>
      {/* Loading Overlay */}
      {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <Box
            sx={{
              backgroundColor: '#333',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}
          >
            <Typography variant="h6" sx={{ color: '#fff', marginBottom: '10px' }}>
              Loading Data...
            </Typography>
            <Box
              sx={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '4px solid #b22222',
                borderTop: '4px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': {
                    transform: 'rotate(0deg)',
                  },
                  '100%': {
                    transform: 'rotate(360deg)',
                  },
                },
              }}
            />
          </Box>
        </Box>
      )}
  
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search for names..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        sx={{ 
          marginBottom: '16px',
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#b22222' },
            '&:hover fieldset': { borderColor: '#b22222' },
            '&.Mui-focused fieldset': { borderColor: '#b22222' },
          },
          '& .MuiInputBase-input': { color: '#fff' },
        }}
      />
      <StyledButton 
        onClick={fetchLoyaltyData}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Refresh'}
      </StyledButton>
      
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        pointerEvents: isLoading ? 'none' : 'auto',
        opacity: isLoading ? 0.7 : 1
      }}>
        {filteredData.map((person, index) => (
          <StyledCard 
            key={index} 
            onClick={() => handleOpenProfile(person)}
            sx={{ cursor: isLoading ? 'default' : 'pointer' }}
          >
            <CardContent>
              <Typography variant="h6">{person.Name}</Typography>
            </CardContent>
          </StyledCard>
        ))}
      </Box>
  
      <Dialog 
        open={profileOpen} 
        onClose={handleCloseProfile}
        disableEscapeKeyDown={isLoading}
      >
        <DialogTitle>{currentPerson?.Name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Store Credit Section */}
            <Box>
              <Typography variant="h6" gutterBottom>Store Credit</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography>{currentPerson?.Value}</Typography>
                <StyledButton 
                  onClick={handleOpenChangeValue}
                  disabled={isLoading}
                >
                  Change
                </StyledButton>
              </Box>
            </Box>
  
            {/* Raffle Points Section */}
            <Box>
              <Typography variant="h6" gutterBottom>Raffle Points</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography>{currentPerson?.RafflePoints}</Typography>
                <StyledButton 
                  onClick={handleOpenChangeRafflePoints}
                  disabled={isLoading}
                >
                  Change
                </StyledButton>
              </Box>
            </Box>
  
            {/* Details Section */}
            <Box>
              <Typography variant="h6" gutterBottom>Details</Typography>
              <TextField
                fullWidth
                defaultValue={currentPerson?.Details}
                onBlur={(e) => handleEditField('Details', e.target.value)}
                disabled={isLoading}
              />
            </Box>
  
            {/* Subscription Section */}
            <Box>
              <Typography variant="h6" gutterBottom>Subscription Details</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography>Current Tier: {currentPerson?.Subscription}</Typography>
                <Typography>Expiry Date: {currentPerson?.['Expiry Date']}</Typography>
                <StyledButton 
                  onClick={handleOpenSubscription}
                  disabled={isLoading}
                >
                  Change Subscription
                </StyledButton>
              </Box>
            </Box>
  
            {/* Member Info Section */}
            <Box>
              <Typography variant="h6" gutterBottom>Member Information</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography>Member ID: {currentPerson?.Username}</Typography>
                <TextField
                  label="Email"
                  fullWidth
                  defaultValue={currentPerson?.Email}
                  onBlur={(e) => handleEditField('Email', e.target.value)}
                  disabled={isLoading}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <StyledButton 
            onClick={handleCloseProfile}
            disabled={isLoading}
          >
            Close
          </StyledButton>
        </DialogActions>
      </Dialog>
  
      <Dialog 
        open={changeValueOpen} 
        onClose={handleCloseChangeValue}
        disableEscapeKeyDown={isValueChangeLoading}
      >
        <DialogTitle>Change Value</DialogTitle>
        <DialogContent>
          <TextField
            label="Value Change"
            type="number"
            value={valueChange}
            onChange={(e) => setValueChange(e.target.value)}
            fullWidth
            margin="normal"
            disabled={isValueChangeLoading}
          />
          <TextField
            label="Reason"
            multiline
            rows={8}  // Increased from 4 to 8 rows
            value={changeReason}
            onChange={(e) => setChangeReason(e.target.value)}
            fullWidth
            margin="normal"
            disabled={isValueChangeLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                minHeight: '200px',  // Add minimum height
              },
              '& .MuiInputBase-input': {
                overflowY: 'auto',   // Add scrolling for overflow
                lineHeight: '1.5',   // Improve line spacing for readability
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <StyledButton 
            onClick={handleSubmitChange} 
            disabled={isValueChangeLoading}
          >
            {isValueChangeLoading ? 'Loading...' : 'Submit'}
          </StyledButton>
          <StyledButton 
            onClick={handleCloseChangeValue}
            disabled={isValueChangeLoading}
          >
            Cancel
          </StyledButton>
        </DialogActions>
      </Dialog>
  
      <Dialog 
        open={subscriptionOpen} 
        onClose={handleCloseSubscription}
        disableEscapeKeyDown={isLoading}
      >
        <DialogTitle>Change Subscription</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>New Subscription Tier</InputLabel>
            <Select
              value={newSubscriptionTier}
              onChange={(e) => setNewSubscriptionTier(e.target.value)}
              disabled={isLoading}
            >
              <MenuItem value="0">Tier 0</MenuItem>
              <MenuItem value="1">Tier 1</MenuItem>
              <MenuItem value="2">Tier 2</MenuItem>
              <MenuItem value="3">Tier 3</MenuItem>
              <MenuItem value="4">Tier 4</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Months to Add"
            type="number"
            value={monthsToAdd}
            onChange={(e) => setMonthsToAdd(e.target.value)}
            fullWidth
            margin="normal"
            disabled={isLoading}
          />
          <TextField
            label="Email"
            value={currentPerson?.Email || ''}
            disabled
            fullWidth
            margin="normal"
          />
          <StyledButton 
            onClick={calculateSubscriptionCost}
            disabled={isLoading}
          >
            Calculate Cost
          </StyledButton>
          <Typography>{subscriptionCost}</Typography>
        </DialogContent>
        <DialogActions>
          <StyledButton 
            onClick={handleSubmitSubscriptionChange}
            disabled={isLoading}
          >
            Submit
          </StyledButton>
          <StyledButton 
            onClick={handleCloseSubscription}
            disabled={isLoading}
          >
            Cancel
          </StyledButton>
        </DialogActions>
      </Dialog>
  
      <Dialog 
        open={changeRafflePointsOpen} 
        onClose={handleCloseChangeRafflePoints}
        disableEscapeKeyDown={isRafflePointsLoading}
      >
        <DialogTitle>Change Raffle Points</DialogTitle>
        <DialogContent>
          <TextField
            label="Points Change"
            type="number"
            value={rafflePointsChange}
            onChange={(e) => setRafflePointsChange(e.target.value)}
            fullWidth
            margin="normal"
            disabled={isRafflePointsLoading}
          />
          <TextField
            label="Reason"
            multiline
            rows={4}
            value={rafflePointsChangeReason}
            onChange={(e) => setRafflePointsChangeReason(e.target.value)}
            fullWidth
            margin="normal"
            disabled={isRafflePointsLoading}
          />
        </DialogContent>
        <DialogActions>
          <StyledButton 
            onClick={handleSubmitRafflePointsChange}
            disabled={isRafflePointsLoading}
          >
            {isRafflePointsLoading ? 'Loading...' : 'Submit'}
          </StyledButton>
          <StyledButton 
            onClick={handleCloseChangeRafflePoints}
            disabled={isRafflePointsLoading}
          >
            Cancel
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoyaltyDashboard;