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
    const productData = entry?.requestData?.productData || {};
    const username = entry?.requestData?.username || 'Unknown';
    
    // Calculate actual changes by direct comparison
    let actualChanges = 0;
    if (previousEntry) {
      const previousData = previousEntry?.requestData?.productData || {};
      
      // Check all fields from both entries
      const allFields = new Set([
        ...Object.keys(productData),
        ...Object.keys(previousData)
      ]);
      
      allFields.forEach(field => {
        // Skip system fields
        if (field === 'Unique_ID' || field === 'Product ID' || field === 'Variant ID' || field === 'Inventory Item ID') {
          return;
        }
        const currentValue = productData[field];
        const previousValue = previousData[field];
        
        // Convert both to strings for comparison to handle type differences
        // But handle undefined/null cases specially
        const currentStr = (currentValue === undefined || currentValue === null) ? 'undefined' : String(currentValue);
        const previousStr = (previousValue === undefined || previousValue === null) ? 'undefined' : String(previousValue);
        
        if (currentStr !== previousStr) {
          actualChanges++;
        }
      });
    }
    
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
              {actualChanges > 0 && (
                <Chip 
                  label={`${actualChanges} changes`} 
                  color="warning" 
                  size="small"
                  sx={{ ml: 2 }}
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {(() => {
                // Get all fields from both current and previous entries
                const previousData = previousEntry?.requestData?.productData || {};
                const allFields = new Set([
                  ...Object.keys(productData),
                  ...Object.keys(previousData)
                ]);
                
                return Array.from(allFields).map(field => {
                  const value = productData[field];
                  
                  // Skip comparison for certain fields that shouldn't be tracked
                  if (field === 'Unique_ID' || field === 'Product ID' || field === 'Variant ID' || field === 'Inventory Item ID') {
                    return (
                      <Box 
                        key={field}
                        sx={{ 
                          p: 1, 
                          borderRadius: 1,
                          bgcolor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid transparent'
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
                          </Box>
                        </Box>
                      </Box>
                    );
                  }

                  // Direct comparison with previous entry only
                  const previousValue = previousData[field];
                  
                  // Convert to strings for consistent comparison
                  // But handle undefined/null cases specially
                  const currentStr = (value === undefined || value === null) ? 'undefined' : String(value);
                  const previousStr = (previousValue === undefined || previousValue === null) ? 'undefined' : String(previousValue);
                  
                  const isActuallyChanged = previousEntry && (currentStr !== previousStr);
                  const isNewField = previousEntry && previousValue === undefined && value !== undefined;
                  const isDeletedField = previousEntry && previousValue !== undefined && value === undefined;
                  
                  return (
                    <Box 
                      key={field}
                      sx={{ 
                        p: 1, 
                        borderRadius: 1,
                        bgcolor: isActuallyChanged ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: isActuallyChanged ? '1px solid #4caf50' : '1px solid transparent'
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
                          {isActuallyChanged && (
                            <Box sx={{ mt: 0.5 }}>
                              {isNewField ? (
                                <Chip label="NEW FIELD" size="small" color="success" />
                              ) : isDeletedField ? (
                                <Chip label="FIELD REMOVED" size="small" color="error" />
                              ) : (
                                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                  Previous: {formatValue(previousValue)}
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  );
                });
              })()}
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
