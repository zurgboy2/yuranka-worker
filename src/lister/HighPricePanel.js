import React, { useState, useEffect, useCallback } from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  Button, 
  Stack, 
  CircularProgress 
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import apiCall from './api';

const HighPricePanel = ({ onCardSelect, isLoading, selectedGame }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [highPriceCards, setHighPriceCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedCards, setSelectedCards] = useState(new Set());

    const handleCardClick = (card) => {
        onCardSelect(card);
    };

    const handleToggleProcessed = (cardId, event) => {
        event.stopPropagation(); // Prevent card click handler
        setSelectedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(cardId)) {
                newSet.delete(cardId);
            } else {
                newSet.add(cardId);
            }
            return newSet;
        });
    };

    const handleSubmitProcessed = async () => {
        if (selectedCards.size === 0) return;
    
        setLoading(true);
        try {
            // Convert Set to array of card objects
            const selectedCardObjects = highPriceCards.filter(card => 
                selectedCards.has(card.cardId)
            );
    
            await apiCall('cardmanager_script', 'markHighPriceCardsProcessed', {
                cards: selectedCardObjects,
                game: selectedGame
            });
            
            // Refresh the list after submission
            await fetchHighPriceCards();
            // Clear selections
            setSelectedCards(new Set());
        } catch (err) {
            setError('Failed to process cards');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    const fetchHighPriceCards = useCallback(async () => {
        setLoading(true);
        try {
          const response = await apiCall('cardmanager_script', 'getHighPriceCards', {
            game: selectedGame
          });
          
          // Debug logs
          console.log('Raw API response:', response);
          console.log('Nested data:', response.data?.data);
          
          // Get the cards array from the nested structure
          const cardsArray = response.data?.data || [];
          console.log('Cards array after extraction:', cardsArray);
          
          setHighPriceCards(cardsArray);
        } catch (err) {
          setError('Failed to fetch high price cards');
          console.error(err);
        } finally {
          setLoading(false);
        }
    }, [selectedGame]);
  
    useEffect(() => {
      fetchHighPriceCards();
    }, [fetchHighPriceCards]);
  
    return (
        <Paper
          sx={{
            position: 'fixed',
            left: 16,
            top: 100,
            width: isCollapsed ? 'auto' : 300,
            minWidth: isCollapsed ? 'auto' : 300,
            maxHeight: 'calc(100vh - 200px)',
            overflow: 'hidden',
            p: 2,
            zIndex: 1000,
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 1,
            mb: isCollapsed ? 0 : 2 
          }}>
            {!isCollapsed && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">High Price Cards</Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedCards.size > 0 ? `${selectedCards.size} selected` : ''}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              {!isCollapsed && selectedCards.size > 0 && (
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitProcessed}
                  disabled={loading}
                >
                  Mark Processed
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                onClick={fetchHighPriceCards}
                startIcon={<RefreshIcon />}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? '▼' : '▲'}
              </Button>
            </Box>
          </Box>
      
          {!isCollapsed && (
            <Stack spacing={1} sx={{ maxHeight: '500px', overflow: 'auto' }}>
              {loading && <CircularProgress size={20} sx={{ alignSelf: 'center' }} />}
              {error && (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              )}
              {!loading && highPriceCards.map((card) => (
                <Paper
                  key={card.cardId}
                  elevation={2}
                  sx={{ 
                    p: 1.5,
                    bgcolor: selectedCards.has(card.cardId) ? 'success.light' : 'warning.light',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: selectedCards.has(card.cardId) ? 'success.main' : 'warning.main',
                    },
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}
                  onClick={() => handleCardClick(card)}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">
                      {card.name}
                    </Typography>
                    <Typography variant="body2">
                      Quality: {card.quality}
                      <br />
                      Price: €{card.price}
                      <br />
                      Expansion: {card.expansionCode}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => handleToggleProcessed(card.cardId, e)}
                    sx={{ 
                      minWidth: 32,
                      height: 32,
                      p: 0.5,
                      ml: 1,
                      color: selectedCards.has(card.cardId) ? 'success.dark' : 'warning.dark',
                      borderColor: 'currentColor'
                    }}
                  >
                    {selectedCards.has(card.cardId) ? '✓' : '○'}
                  </Button>
                </Paper>
              ))}
              {!loading && highPriceCards.length === 0 && (
                <Typography variant="body2" sx={{ textAlign: 'center', py: 2 }}>
                  No high price cards to display
                </Typography>
              )}
            </Stack>
          )}
        </Paper>
    );
  };

export default HighPricePanel;