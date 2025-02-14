import React, { useState } from 'react';
import apiCall from './api';
import CardDisplay from './CardDisplay';
import { useUserData } from './userContext'; 
import { 
  TextField, Box, 
  CircularProgress, Typography, Button, Modal, Paper, Stack
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import HighPricePanel from './HighPricePanel';
import OrdersModal from './OrdersModal';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const TrackerPanel = ({ 
  modifiedCards, 
  onRefresh, 
  setResponseData, 
  setOpenModal,
  batches,
  isLoading
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleRefresh = async () => {
    await onRefresh();
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        right: 16,
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
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: isCollapsed ? 0 : 2 
      }}>
        {!isCollapsed && (
          <Typography variant="h6">Active Updates</Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
            size="small"
            variant="outlined"
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
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
        <Stack spacing={1}>
          {/* Current modification card if there are pending changes */}
          {modifiedCards.activeCount > 0 && (
            <Paper 
              elevation={2}
              sx={{ p: 1.5, bgcolor: 'primary.light', color: 'primary.contrastText' }}
            >
              <Typography variant="subtitle2">
                Current Changes
              </Typography>
              <Typography variant="body2">
                {modifiedCards.activeCount} cards will be submitted
                ({modifiedCards.items.length} modified)
              </Typography>
            </Paper>
          )}
          
          {/* Batch update cards */}
          {batches.map((batch) => (
            <Paper
              key={batch.batchId}
              elevation={2}
              sx={{ 
                p: 1.5,
                bgcolor: batch.status === 'PENDING' ? 'warning.light' : 
                        batch.status === 'COMPLETED' ? 'success.light' : 
                        'error.light',
                cursor: 'pointer'
              }}
              onClick={() => {
                if (batch.state) {
                  setResponseData({
                    batchId: batch.batchId,
                    message: `Results for batch ${batch.batchId}`,
                    state: batch.state,  // Pass the full state
                    highPrices: batch.state.results?.flatMap(r => r.highPrices || []) || []
                  });
                  setOpenModal(true);
                }
              }}
            >
              <Typography variant="subtitle2">
                Batch: {batch.batchId.slice(0, 8)}...
              </Typography>
              <Typography variant="body2">
                Status: {batch.status}
                <br />
                {new Date(batch.timestamp).toLocaleString()}
              </Typography>
              
              {/* Add processing details */}
              {batch.state?.message && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 1,
                    fontStyle: 'italic',
                    color: 'text.secondary'
                  }}
                >
                  {batch.state.message}
                </Typography>
              )}
              
              {/* Show success summaries if completed */}
              {batch.status === 'COMPLETED' && batch.state?.results && (
                <Box sx={{ mt: 1 }}>
                  {batch.state.results.map((result, idx) => (
                    <Typography 
                      key={idx} 
                      variant="body2"
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: '0.8rem'
                      }}
                    >
                      • {result.message}
                    </Typography>
                  ))}
                  {batch.state.results.some(r => r.highPrices?.length > 0) && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mt: 0.5,
                        color: 'warning.main',
                        fontWeight: 'bold'
                      }}
                    >
                      ⚠️ Contains high-price cards
                    </Typography>
                  )}
                </Box>
              )}

              {/* Show error message if failed */}
              {batch.status === 'ERROR' && batch.state?.error && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 1,
                    color: 'error.main'
                  }}
                >
                  Error: {batch.state.error}
                </Typography>
              )}
            </Paper>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

const ResultModal = ({ open, onClose, onClearAndClose, data }) => {
  if (!data) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="result-modal"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Paper
        sx={{
          position: 'relative',
          maxWidth: 800,  // Increased for more content
          p: 4,
          maxHeight: '80vh',
          overflow: 'auto'
        }}
      >
        <Typography variant="h6" gutterBottom>
          Batch Processing Results
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom>
          Batch ID: {data.batchId}
        </Typography>

        {/* Processing Summary */}
        {data.state?.results?.map((result, index) => (
          <Box key={index} sx={{ mt: 3, mb: 2 }}>
            <Typography variant="h6" color={result.status === 'success' ? 'success.main' : 'error.main'}>
              Batch Result {index + 1}
            </Typography>
            <Typography>{result.message}</Typography>

            {/* Successful Uploads */}
            {result.successfulUploads?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Successfully Processed Cards:</Typography>
                {result.successfulUploads.map((upload, idx) => (
                  <Paper key={idx} sx={{ p: 1, mt: 1, bgcolor: 'background.default' }}>
                    <Typography variant="body2">
                      {upload.name} ({upload.rarity})
                      <br />
                      Expansion: {upload.expansion}
                      <br />
                      Languages: {upload.languages.join(', ')}
                      <br />
                      Total Quantity: {upload.totalQuantity}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}

            {/* High Price Cards */}
            {result.highPrices?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="warning.main">
                  High Price Cards in this Batch:
                </Typography>
                {result.highPrices.map((card, idx) => (
                  <Paper key={idx} sx={{ p: 1, mt: 1, bgcolor: 'warning.light' }}>
                    <Typography variant="body2">
                      {card.cardName}
                      <br />
                      Quality: {card.quality}
                      <br />
                      Price: €{card.price}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}

            {/* Errors if any */}
            {result.errors?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="error">Errors:</Typography>
                {result.errors.map((error, idx) => (
                  <Typography key={idx} variant="body2" color="error.main">
                    • {error}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        ))}

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button variant="contained" onClick={onClose}>
            Close
          </Button>
          <Button 
            variant="outlined" 
            onClick={onClearAndClose}
          >
            Clear Results & Close
          </Button>
        </Stack>
      </Paper>
    </Modal>
  );
};

const SearchPanel = ({ onSearch, searchTerm, setSearchTerm, searchMode, onClear, onOpenOrders }) => {
  return (
    <Box 
      sx={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000, 
        backgroundColor: 'background.paper', 
        boxShadow: 1, 
        borderBottom: '1px solid', 
        borderColor: 'divider', 
        p: 2, 
        mb: 2 
      }}
    >
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {searchMode && (
              <Typography variant="subtitle2" color="text.secondary">
                Current mode: {
                  searchMode === 'set' ? 'Set Search' : 
                  searchMode === 'card' ? 'Card Search' : 
                  searchMode === 'location' ? 'Location Search' :
                  'Search' 
                }
              </Typography>
            )}
            <Button
              variant="contained"
              color="secondary"
              onClick={onOpenOrders}
              startIcon={<ShoppingCartIcon />}
            >
              Orders
            </Button>
          </Box>
          <form onSubmit={onSearch} style={{ width: '100%' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchMode === 'set' ? 
                  "Enter set code (e.g., DMU)" : 
                  searchMode === 'card' ? 
                  "Enter card code" :
                  searchMode === 'location' ? "Enter location (e.g., BROWN BINDER)" :
                  "Enter set code, card code, or location"
                }
                variant="outlined"
              />
              <Button 
                type="submit" 
                variant="contained"
                disabled={!searchTerm.trim()}
              >
                Search
              </Button>
              {searchMode && (
                <Button 
                  variant="outlined"
                  color="warning"
                  onClick={onClear}
                >
                  Clear All
                </Button>
              )}
            </Box>
          </form>
        </Box>
      </Paper>
    </Box>
  );
};


const Lister = ({ selectedGame }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modifiedCards, setModifiedCards] = useState({ 
    items: [], 
    activeCount: 0, 
    hasChanges: false 
  });
  const [openModal, setOpenModal] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const { userData } = useUserData();
  const [searchMode, setSearchMode] = useState(null);
  const [trackerBatches, setTrackerBatches] = useState([]);
  const canViewHighPrices = userData?.role === 'admin' || userData?.role === 'cashier';
  const canEditPrices = userData?.role === 'admin' || userData?.role === 'cashier';
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [modifiedItems, setModifiedItems] = useState({});
  

  const handleOpenOrders = () => {
    setOrdersModalOpen(true);
  };
  
  const handleCloseOrders = () => {
    setOrdersModalOpen(false);
  };
  



  const handleHighPriceCardSelect = (card) => {
    // Since the card data is already in the correct format,
    // we can add it directly to results
    setResults(prevResults => {
      // Check if card already exists
      if (!prevResults.find(r => r.cardId === card.cardId)) {
        return [...prevResults, card];
      }
      return prevResults;
    });
    setSearchMode('card');
  };

  const handleClearAll = () => {
    if (results.length > 0) {
      if (window.confirm('Are you sure you want to clear all results? This will remove all current items.')) {
        setResults([]);
        setSearchMode(null);
        setSearchTerm('');
        setModifiedCards({ items: [], activeCount: 0, hasChanges: false });
        // Clear localStorage
        localStorage.removeItem('cardSearchResults');
        localStorage.removeItem('searchMode');
        localStorage.removeItem('selectedGame');
      }
    }
  };

  React.useEffect(() => {
    const storedResults = localStorage.getItem('cardSearchResults');
    const storedMode = localStorage.getItem('searchMode');
    const storedGame = localStorage.getItem('selectedGame');

    // Only restore if it's for the same game
    if (storedResults && storedMode === 'card' && storedGame === selectedGame) {
      setResults(JSON.parse(storedResults));
      setSearchMode('card');
    }
  }, [selectedGame]);


  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const searchTermTrimmed = searchTerm.trim();
    const isBox = searchTermTrimmed.toUpperCase() === 'BOX';
    const isCardCode = /^[A-Za-z0-9]+-[0-9]+/.test(searchTermTrimmed);
    const isSetCode = !isCardCode && /^[A-Za-z0-9]{3,4}$/.test(searchTermTrimmed);
    const isLocation = isBox || (!isSetCode && !isCardCode);
  
    try {
      setLoading(true);
      setError(null);
  
      if (isSetCode) {
        const response = await searchByExpansionCode(searchTerm.trim().toUpperCase());
        setResults(response);
        setSearchMode('set');
      } else if (isLocation) {
        const response = await searchByLocation(searchTerm.trim());
        setResults(response);
        setSearchMode('location');
      } else {
        const response = await searchByCardCode(searchTerm.trim());
        let newResults;
        if (searchMode === 'card') {
          newResults = [...results, ...response];
        } else {
          newResults = response;
        }
        setResults(newResults);
        setSearchMode('card');
      }
      // Handle localStorage...
    } catch (err) {
      setError('Search failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshTracker = async () => {
    if (!userData?.username) return;
    
    setLoading(true);
    try {
      const response = await apiCall('cardmanager_script', 'refreshCards', {
        username: userData.username
      });
      
      if (response.data) {
        // Sort updates by timestamp, newest first
        const sortedUpdates = response.data.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setTrackerBatches(sortedUpdates);
        return sortedUpdates;
      }
    } catch (err) {
      setError('Failed to refresh card status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleClearAndClose = () => {
    setOpenModal(false);
    setResults([]);
    setModifiedCards([]);
    setSearchTerm('');
    localStorage.removeItem('cardSearchResults');
    localStorage.removeItem('searchMode');
    localStorage.removeItem('selectedGame');
  };

  
  const searchByExpansionCode = async (expansionCode) => {
    const response = await apiCall('cardmanager_script', 'searchByExpansionCode', {
      expansionCode,
      game: selectedGame
    });
    return preprocessItems(response.data);
  };
  
  const searchByCardCode = async (cardCode) => {
    const response = await apiCall('cardmanager_script', 'searchByCardCode', {
      cardCode,
      game: selectedGame
    });
    return preprocessItems(response.data);
  };


  const initiateLocationSearch = async (location) => {
    const response = await apiCall('cardmanager_script', 'initiateSearchByLocation', {
      location: location.toUpperCase(),
      game: selectedGame,
      username: userData.username
    });
    
    return {
      searchKey: response.data.searchKey,
      status: response.data.status
    };
  };
  
  const searchByLocation = async (location) => {
    let allResults = [];
    
    // First, initiate the search
    await initiateLocationSearch(location);
    
    // Poll until results are ready
    let response;
    do {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between checks
      response = await apiCall('cardmanager_script', 'getLocationSearchResults', {
        location: location.toUpperCase(),
        username: userData.username
      });
    } while (response.data.status === 'processing');
  
    // Once we have initial results, start gathering all data
    allResults = allResults.concat(response.data.results);
  
    while (response.data.hasMore) {
      response = await apiCall('cardmanager_script', 'getLocationSearchResults', {
        location: location.toUpperCase(),
        username: userData.username,
        fileId: response.data.fileId,
        startIndex: allResults.length
      });
      
      allResults = allResults.concat(response.data.results);
    }
  
    return preprocessItems(allResults);
  };


  const handleCardModification = (modificationInfo) => {
    setModifiedCards(modificationInfo);
  };

  const handleSubmitChanges = async () => {
    if (modifiedCards.activeCount === 0) {
      setError('No items with quantity to submit');
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
  
      // Combine original items with modifications
      const cardsToSubmit = results
        .map(item => {
          const modifiedItem = modifiedItems[item.cardId];
          if (modifiedItem) {
            return {
              ...item,
              ...modifiedItem
            };
          }
          return item;
        })
        .filter(item => !item._deleted && item.quantity > 0);
  
      const response = await apiCall('cardmanager_script', 'updateCards', {
        cards: cardsToSubmit,
        username: userData.username,
        email: userData.email,
        game: selectedGame,
        role: userData.role
      });
  
      if (response.status === 200) {
        setTrackerBatches(prev => [{
          batchId: response.data.batchId,
          timestamp: new Date().toISOString(),
          status: 'PENDING',
          state: null
        }, ...prev]);
        
        setResponseData({
          message: response.data.message,
          batchId: response.data.batchId
        });
        setOpenModal(true);
      }
    } catch (err) {
      setError('Failed to submit changes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };
  
  const preprocessItems = (items) => {
    const existingItems = new Map(results.map(item => [item.cardId, item]));
    
    const newItems = items.filter(item => {
        if (item.cardId) {
            return !existingItems.has(item.cardId);
        }
        return !existingItems.has(item.full_id) && 
               !Array.from(existingItems.keys()).some(key => key.startsWith(item.full_id + '_'));
    });
    
    if (newItems.length === 0) {
        return [];
    }

    const groupedByBaseId = newItems.reduce((acc, item) => {
        const baseFullId = item.full_id;
        acc[baseFullId] = acc[baseFullId] || [];
        acc[baseFullId].push(item);
        return acc;
    }, {});

    return Object.entries(groupedByBaseId).flatMap(([baseFullId, group]) => {
        const sortedGroup = [...group].sort((a, b) => 
            (a.duplicate_number || 0) - (b.duplicate_number || 0)
        );

        return sortedGroup.map((item, index) => {
            const cardId = index === 0 ? baseFullId : `${baseFullId}_${index}`;
            return {
                ...item,
                cardId: cardId
            };
        });
    });
  };

  const handleDuplicate = (item) => {
    // Get existing results
    const relatedItems = results.filter(i => 
        i.cardId === item.cardId || 
        i.cardId?.startsWith(item.cardId + '_')
    );
    
    // Find highest index
    const maxIndex = relatedItems.reduce((max, i) => {
        const match = i.cardId?.match(/_(\d+)$/);
        const num = match ? parseInt(match[1]) : 0;
        return num > max ? num : max;
    }, 0);
    
    const newIndex = maxIndex + 1;
    const newCardId = `${item.cardId}_${newIndex}`;
    
    const newItem = {
        ...item,
        cardId: newCardId,
        duplicate_number: newIndex,
        quantity: 0,
        price: 0
    };

    // Add to results array, preserving existing items' state
    setResults(prevResults => {
        const originalIndex = prevResults.findIndex(i => i.cardId === item.cardId);
        return [
            ...prevResults.slice(0, originalIndex + 1),
            newItem,
            ...prevResults.slice(originalIndex + 1)
        ];
    });
  };

  const handleDelete = (cardId) => {
    setResults(prevResults => {
        return prevResults.map(item => 
            item.cardId === cardId 
                ? { ...item, _deleted: true, _isModified: true }
                : item
        );
    });
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', p: 2 }}>
      <SearchPanel 
        onSearch={handleSearch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchMode={searchMode}
        onClear={handleClearAll}
        onOpenOrders={handleOpenOrders}
      />

      <OrdersModal 
        open={ordersModalOpen}
        onClose={handleCloseOrders}
      />
  
      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}
  
      {/* Main content area */}
      <Box sx={{ display: 'flex', gap: 2, position: 'relative' }}>
        {/* Left side - Cards display */}
        <Box sx={{ flex: 1 }}>
          {results.length > 0 && (
            <CardDisplay 
              items={results} 
              selectedGame={selectedGame}
              onCardModification={handleCardModification}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              canEditPrices={canEditPrices}
              modifiedItems={modifiedItems}
              setModifiedItems={setModifiedItems}
            />
          )}
        </Box>
  
        {/* Right side - Panels */}
        <Box>
          <TrackerPanel 
            modifiedCards={modifiedCards}
            onRefresh={handleRefreshTracker}
            setResponseData={setResponseData}
            setOpenModal={setOpenModal}
            batches={trackerBatches}
            isLoading={loading}
          />
  
          {canViewHighPrices && (
            <HighPricePanel
              onCardSelect={handleHighPriceCardSelect}
              isLoading={loading}
              selectedGame={selectedGame}
            />
          )}
        </Box>
      </Box>
  
      {/* Bottom submit button */}
      {results.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 2,
            backgroundColor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <ResultModal 
            open={openModal}
            onClose={handleCloseModal}
            onClearAndClose={handleClearAndClose}
            data={responseData}
          />
          <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitChanges}
              disabled={loading || (
                  !modifiedCards.hasChanges && 
                  !results.some(item => 
                      !item._deleted && 
                      (item.quantity > 0 || modifiedItems[item.cardId]?.quantity > 0)
                  )
              )}
          >
              {loading ? 'Submitting...' : `Submit Changes (${results.filter(item => 
                  !item._deleted && 
                  (item.quantity > 0 || modifiedItems[item.cardId]?.quantity > 0)
              ).length})`}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Lister;