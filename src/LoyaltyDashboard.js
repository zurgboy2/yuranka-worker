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

const StyledCard = styled(Card)({
  border: '1px solid #b22222',
  borderRadius: '5px',
  margin: '16px',
  display: 'inline-block',
  verticalAlign: 'top',
  width: 'calc(25% - 32px)',
  backgroundColor: '#333',
  color: '#fff',
  cursor: 'pointer',
});

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

  const fetchLoyaltyData = useCallback(async () => {
    try {
      const scriptId = 'loyalty_script';
      const action = 'getLoyaltyData';
      const response = await apiCall(scriptId, action, { 
        username: userData.username, 
        googleToken: userData.googleToken
      });
      setLoyaltyData(response);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
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
    setProfileOpen(false);
    setCurrentPerson(null);
  };

  const handleOpenChangeValue = () => {
    setChangeValueOpen(true);
  };

  const handleCloseChangeValue = () => {
    setChangeValueOpen(false);
    setValueChange('');
    setChangeReason('');
  };

  const handleOpenSubscription = () => {
    setSubscriptionOpen(true);
  };

  const handleCloseSubscription = () => {
    setSubscriptionOpen(false);
    setNewSubscriptionTier('0');
    setMonthsToAdd('');
    setSubscriptionCost('');
  };

  const handleOpenChangeRafflePoints = () => {
    setChangeRafflePointsOpen(true);
  };
  
  const handleCloseChangeRafflePoints = () => {
    setChangeRafflePointsOpen(false);
    setRafflePointsChange('');
    setRafflePointsChangeReason('');
  };
  
  const handleSubmitRafflePointsChange = async () => {
    if (!rafflePointsChange || !rafflePointsChangeReason) {
      alert('Please fill out both fields before submitting.');
      return;
    }
  
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
      alert('Change has been made');
      handleCloseChangeRafflePoints();
      fetchLoyaltyData();
    } catch (error) {
      console.error('Error submitting raffle points change:', error);
    }
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

    try {
      const scriptId = 'loyalty_script';
      const action = 'changeValue';
      await apiCall(scriptId, action, {id: currentPerson.Username, valueChange, changeReason, googleToken: userData.googleToken , username: userData.username });
      alert('Change has been made');
      handleCloseChangeValue();
      fetchLoyaltyData();
    } catch (error) {
      console.error('Error submitting change:', error);
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
    <Box sx={{ backgroundColor: '#000', color: '#fff', padding: '20px' }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search for names..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
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
      <StyledButton onClick={fetchLoyaltyData}>Refresh</StyledButton>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        {filteredData.map((person, index) => (
          <StyledCard key={index} onClick={() => handleOpenProfile(person)}>
            <CardContent>
              <Typography variant="h6">{person.Name}</Typography>
            </CardContent>
          </StyledCard>
        ))}
      </Box>

      <Dialog open={profileOpen} onClose={handleCloseProfile}>
        <DialogTitle>{currentPerson?.Name}</DialogTitle>
        <DialogContent>
          <Typography>Store Credit: {currentPerson?.Value}</Typography>
          <StyledButton onClick={handleOpenChangeValue}>Change</StyledButton>

          <Typography>Raffle Points: {currentPerson?.RafflePoints}</Typography>
          <StyledButton onClick={handleOpenChangeRafflePoints}>Change</StyledButton>

          <Typography>
            Details: 
            <TextField
              defaultValue={currentPerson?.Details}
              onBlur={(e) => handleEditField('Details', e.target.value)}
            />
          </Typography>
          <Typography>Subscription: {currentPerson?.Subscription}</Typography>
          <StyledButton onClick={handleOpenSubscription}>Change Subscription</StyledButton>
          <Typography>Expiry Date: {currentPerson?.['Expiry Date']}</Typography>
          <Typography>Member ID: {currentPerson?.Username}</Typography>
          <TextField
            label="Email"
            defaultValue={currentPerson?.Email}
            onBlur={(e) => handleEditField('Email', e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleCloseProfile}>Close</StyledButton>
        </DialogActions>
      </Dialog>

      <Dialog open={changeValueOpen} onClose={handleCloseChangeValue}>
        <DialogTitle>Change Value</DialogTitle>
        <DialogContent>
          <TextField
            label="Value Change"
            type="number"
            value={valueChange}
            onChange={(e) => setValueChange(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Reason"
            multiline
            rows={4}
            value={changeReason}
            onChange={(e) => setChangeReason(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleSubmitChange}>Submit</StyledButton>
          <StyledButton onClick={handleCloseChangeValue}>Cancel</StyledButton>
        </DialogActions>
      </Dialog>

      <Dialog open={subscriptionOpen} onClose={handleCloseSubscription}>
        <DialogTitle>Change Subscription</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>New Subscription Tier</InputLabel>
            <Select
              value={newSubscriptionTier}
              onChange={(e) => setNewSubscriptionTier(e.target.value)}
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
          />
          <TextField
            label="Email"
            value={currentPerson?.Email || ''}
            disabled
            fullWidth
            margin="normal"
          />
          <StyledButton onClick={calculateSubscriptionCost}>Calculate Cost</StyledButton>
          <Typography>{subscriptionCost}</Typography>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleSubmitSubscriptionChange}>Submit</StyledButton>
          <StyledButton onClick={handleCloseSubscription}>Cancel</StyledButton>
        </DialogActions>
      </Dialog>

      <Dialog open={changeRafflePointsOpen} onClose={handleCloseChangeRafflePoints}>
      <DialogTitle>Change Raffle Points</DialogTitle>
      <DialogContent>
        <TextField
          label="Points Change"
          type="number"
          value={rafflePointsChange}
          onChange={(e) => setRafflePointsChange(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Reason"
          multiline
          rows={4}
          value={rafflePointsChangeReason}
          onChange={(e) => setRafflePointsChangeReason(e.target.value)}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <StyledButton onClick={handleSubmitRafflePointsChange}>Submit</StyledButton>
        <StyledButton onClick={handleCloseChangeRafflePoints}>Cancel</StyledButton>
      </DialogActions>
    </Dialog>
    </Box>
  );
};

export default LoyaltyDashboard;