import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import apiCall from './api';
import { useUserData } from './UserContext';

const ProductHistory = ({ open, onClose, productId, productTitle }) => {
  const { userData } = useUserData();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProductHistory = async () => {
    if (!productId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall('stocker_script', 'getProductEntries', {
        googleToken: userData.googleToken,
        username: userData.username,
        productId: productId
      });
      
      if (response && Array.isArray(response)) {
        // Sort entries by timestamp (latest first)
        const sortedEntries = response.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        setEntries(sortedEntries);
      } else {
        setEntries([]);
      }
    } catch (err) {
      console.error('Error fetching product history:', err);
      setError('Failed to fetch product history');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when dialog opens
  React.useEffect(() => {
    if (open) {
      fetchProductHistory();
    }
  }, [open, productId]);

  const compareEntries = (currentEntry, previousEntry) => {
    const changes = [];
    const currentData = currentEntry?.requestData?.productData || {};
    const previousData = previousEntry?.requestData?.productData || {};
    
    // Get all unique field names from both entries
    const allFields = new Set([
      ...Object.keys(currentData),
      ...Object.keys(previousData)
    ]);
    
    allFields.forEach(field => {
      const currentValue = currentData[field];
      const previousValue = previousData[field];
      
      // Skip comparison for certain fields that shouldn't be tracked
      if (field === 'Unique_ID' || field === 'Product ID' || field === 'Variant ID' || field === 'Inventory Item ID') {
        return;
      }
      
      if (currentValue !== previousValue) {
        changes.push({
          field,
          oldValue: previousValue,
          newValue: currentValue,
          isNew: previousValue === undefined,
          isDeleted: currentValue === undefined
        });
      }
    });
    
    return changes;
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'string' && value.length > 100) {
      return value.substring(0, 100) + '...';
    }
    return String(value);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderFieldComparison = (entry, index) => {
    const previousEntry = entries[index + 1];
    const changes = previousEntry ? compareEntries(entry, previousEntry) : [];
    const productData = entry?.requestData?.productData || {};
    const username = entry?.requestData?.username || 'Unknown';
    
    return (
      <Paper key={index} sx={{ mb: 2, bgcolor: '#2a2a2a' }}>
        <Accordion sx={{ bgcolor: '#2a2a2a', color: '#ffffff' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#ffffff' }} />}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
              <Box>
                <Typography variant="h6">
                  Entry #{index + 1}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Updated by: {username} | {formatTimestamp(entry.timestamp)}
                </Typography>
              </Box>
              {changes.length > 0 && (
                <Chip 
                  label={`${changes.length} changes`} 
                  color="warning" 
                  size="small"
                  sx={{ ml: 2 }}
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Object.entries(productData).map(([field, value]) => {
                const change = changes.find(c => c.field === field);
                const isChanged = !!change;
                const isNewField = change?.isNew;
                const isDeletedField = change?.isDeleted;
                
                return (
                  <Box 
                    key={field}
                    sx={{ 
                      p: 1, 
                      borderRadius: 1,
                      bgcolor: isChanged ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: isChanged ? '1px solid #4caf50' : '1px solid transparent'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: '150px' }}>
                        {field}:
                      </Typography>
                      <Box sx={{ flex: 1, ml: 2 }}>
                        <Typography variant="body2">
                          {formatValue(value)}
                        </Typography>
                        {isChanged && (
                          <Box sx={{ mt: 0.5 }}>
                            {isNewField ? (
                              <Chip label="NEW FIELD" size="small" color="success" />
                            ) : isDeletedField ? (
                              <Chip label="FIELD REMOVED" size="small" color="error" />
                            ) : (
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                Previous: {formatValue(change.oldValue)}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </AccordionDetails>
        </Accordion>
      </Paper>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#1a1a1a',
          color: '#ffffff',
          minHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Typography variant="h5">
          Product History
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>
          {productTitle}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ textAlign: 'center', py: 4 }}>
            {error}
          </Typography>
        ) : entries.length === 0 ? (
          <Typography sx={{ textAlign: 'center', py: 4, color: 'rgba(255, 255, 255, 0.7)' }}>
            No product history found
          </Typography>
        ) : (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              History ({entries.length} entries)
            </Typography>
            {entries.map((entry, index) => renderFieldComparison(entry, index))}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#ffffff' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductHistory;
