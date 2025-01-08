import React, { useState } from 'react';
import { 
  TextField, Button, Grid, Tabs, Tab, Box, Typography, 
  Avatar, Paper, ToggleButton, ToggleButtonGroup, Chip
} from '@mui/material';
import { useUserData } from '../UserContext';
import tcgConfig  from './tcgConfig';
import apiCall from '../api';
import CardTableDirectory from './CardTableDirectory';

const ManualListingRechecking = () => {
  const { userData } = useUserData();
  const [currentTcg, setCurrentTcg] = useState('mtg'); // Default to MTG
  const [cardCode, setCardCode] = useState('');
  const [mode, setMode] = useState('add');
  const [returnedCards, setReturnedCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingStockCollectionName, setStockCollectionName] = useState('');

  const getTcgEntries = () => Object.entries(tcgConfig.games).map(([key, game]) => ({
    key,
    ...game
  }));

  const processCardData = (cardData) => {
    return Array.isArray(cardData) ? cardData : [cardData];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setReturnedCards([]);

    try {
      const action = 'getCard';
      const currentGame = tcgConfig.games[currentTcg];
      const currentStockCollectionName = mode === 'add' 
        ? currentGame.collectionNames.stock 
        : currentGame.collectionNames.existing;

      setStockCollectionName(currentGame.collectionNames.existing);

      const data = {
        tcg: currentGame.name,
        cardCode,
        stockCollectionName: currentStockCollectionName,
        username: userData.username,
        role: userData.role,
        googleToken: userData.googleToken
      };

      const response = await apiCall('cardmanager_script', action, data);
      const processedCards = processCardData(response.data);
      setReturnedCards(processedCards);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTcgChange = (event, newValue) => {
    setCurrentTcg(newValue);
    resetForm();
  };

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
      resetForm();
    }
  };

  const resetForm = () => {
    setCardCode('');
    setReturnedCards([]);
    setError('');
    setStockCollectionName('');
  };

  const getBackgroundStyle = () => {
    const background = tcgConfig.games[currentTcg].display.background;
    if (background.type === 'image') {
      return {
        backgroundImage: `url(${background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    } else {
      return {
        backgroundColor: background.value,
      };
    }
  };

  const getCurrentHeaders = () => {
    const game = tcgConfig.games[currentTcg];
    return [
      ...tcgConfig.commonFields.required,
      { name: 'rarity', type: 'selection', options: game.rarity.options },
      ...game.variantFields,
      { name: 'language', type: 'selection', options: game.language.options },
      ...tcgConfig.commonFields.variants
    ];
  };


  return (
    <Box>
      <Tabs
        value={currentTcg}
        onChange={handleTcgChange}
        aria-label="TCG tabs"
        variant="scrollable"
        scrollButtons="auto"
      >
        {getTcgEntries().map((tcg) => (
          <Tab 
            key={tcg.key}
            value={tcg.key}
            label={tcg.name} 
            icon={<Avatar src={tcg.display.imageUrl} />}
            iconPosition="start"
          />
        ))}
      </Tabs>

      <Paper 
        elevation={3} 
        sx={{
          p: 3,
          mt: 2,
          ...getBackgroundStyle(),
          transition: 'background-image 0.5s ease-in-out, background-color 0.5s ease-in-out'
        }}
      >

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <ToggleButtonGroup
            color="primary"
            value={mode}
            exclusive
            onChange={handleModeChange}
            aria-label="Platform"
          >
            <ToggleButton value="add">Add New</ToggleButton>
            <ToggleButton value="check">Check Old</ToggleButton>
          </ToggleButtonGroup>
          <Chip 
            label={mode === 'add' ? 'Adding New Cards' : 'Checking Existing Cards'}
            color={mode === 'add' ? 'success' : 'info'}
            variant="outlined"
            sx={{ 
              fontSize: '1rem', 
              fontWeight: 'bold',
              padding: '20px 10px',
              borderWidth: 2,
            }}
          />
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Card Code"
                value={cardCode}
                onChange={(e) => setCardCode(e.target.value)}
                variant="filled"
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  '& .MuiFilledInput-input': {
                    color: 'white',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiFilledInput-root': {
                    '&:hover, &.Mui-focused': {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" disabled={loading}>
                {mode === 'add' ? 'Add Card' : 'Check Card'}
              </Button>
            </Grid>
          </Grid>
        </form>

        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

        {returnedCards.length > 0 && (
          <CardTableDirectory
            cards={returnedCards}
            headers={getCurrentHeaders()}
            mode={mode}
            collectionName={existingStockCollectionName}
          />
        )}
      </Paper>
    </Box>
  );
};

export default ManualListingRechecking;