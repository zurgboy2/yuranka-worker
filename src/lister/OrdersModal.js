// OrdersModal.jsx
import React, { useState } from 'react';
import {
  Modal,
  Paper,
  Typography,
  Button,
  Box,
  IconButton,
  TextField,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  CircularProgress
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import apiCall from '../api';

const OrdersModal = ({ open, onClose }) => {
  const [value, setValue] = useState(0);
  const [cardmarketOrders, setCardmarketOrders] = useState('');
  const [shopifyOrders, setShopifyOrders] = useState([]); // This would be populated from your API
  const [parsedOrder, setParsedOrder] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [showCards, setShowCards] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOrderDataChange = (field, value) => {
    setParsedOrder(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClear = () => {
    setCardmarketOrders('');  // Clear the input textarea
    setParsedOrder(null);     // Clear the parsed data
    setValidationError('');   // Clear any validation errors
  };
  
  const handleShippingAddressChange = (field, value) => {
    setParsedOrder(prev => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [field]: value
      }
    }));
  };
  
  const handleItemChange = (index, field, value) => {
    setParsedOrder(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSummaryChange = (field, value) => {
    setParsedOrder(prev => ({
      ...prev,
      orderSummary: {
        ...prev.orderSummary,
        [field]: value
      }
    }));
  };

  const handleSubmitOrder = async (parsedOrder) => {
    setLoading(true);
    try {
      const response = await apiCall('cardmanager_script', 'processOrder', {
        orderData: parsedOrder,
        platform: 'cardmarket',
        orderType: 'BULK'
      });

      if (response.status === 200) {
        // Show success message
        setValidationError('');
        onClose();
      }
    } catch (error) {
      console.error('Failed to process order:', error);
      setValidationError('Failed to submit order. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const removeItem = (index) => {
    setParsedOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
      orderSummary: {
        ...prev.orderSummary,
        articleCount: prev.orderSummary.articleCount - prev.items[index].quantity
      }
    }));
  };
  
  const addNewItem = () => {
    setParsedOrder(prev => ({
      ...prev,
      items: [...prev.items, {
        quantity: 1,
        name: '',
        cardNumber: '',
        set: '',
        condition: 'NM',
        details: '',
        price: 0
      }]
    }));
  };

  const parseAndValidateOrder = () => {
    const lines = cardmarketOrders.split('\n').map(line => line.trim());
    let orderData = {
      orderNumber: '',
      platform: '',
      shippingAddress: {
        name: '',
        street: '',
        postalCode: '',
        city: '',
        country: ''
      },
      orderSummary: {
        articleCount: 0,
        articleValue: 0,
        shippingCost: 0,
        total: 0
      },
      tcg: '',
      items: []
    };

    try {
      // Validate order number and get it (first line should start with "Sale #")
      const saleMatch = lines[0].match(/Sale #(\d+)/);
      if (!saleMatch) throw new Error('Invalid order number format');
      orderData.orderNumber = saleMatch[1];

      // Get platform (second line)
      orderData.platform = lines[1];

      // Find shipping address section
      const shippingAddressStart = lines.findIndex(line => line === 'Shipping address');
      const shippingMethodStart = lines.findIndex(line => line === 'Shipping Method:');
      
      if (shippingAddressStart === -1 || shippingMethodStart === -1) {
        throw new Error('Could not locate shipping address section');
      }

      // Extract shipping address (knowing the structure)
      orderData.shippingAddress = {
        name: lines[shippingAddressStart + 1],
        street: lines[shippingAddressStart + 2],
        postalCode: lines[shippingAddressStart + 3].split(' ')[0],
        city: lines[shippingAddressStart + 3].split(' ').slice(1).join(' '),
        country: lines[shippingAddressStart + 4]
      };

      // Find and parse order summary
      const summaryStart = lines.findIndex(line => line === 'Summary');
      if (summaryStart === -1) throw new Error('Could not locate order summary');

      // Extract summary values
      orderData.orderSummary = {
        articleCount: parseInt(lines[summaryStart + 2].split(' ')[0]),
        articleValue: parseFloat(lines[summaryStart + 4].replace(',', '.').replace(' €', '')),
        shippingCost: parseFloat(lines[summaryStart + 6].replace(',', '.').replace(' €', '')),
        total: parseFloat(lines[summaryStart + 8].replace(',', '.').replace(' €', ''))
      };

      // Get TCG type
      const tcgLine = lines.find(line => line.includes('Singles'));
      if (tcgLine) {
        orderData.tcg = tcgLine.split(' ')[0];
      }

      // Parse items
      const itemsStartIndex = lines.findIndex(line => line === 'Sort by...');
      if (itemsStartIndex === -1) throw new Error('Could not locate items section');

      let currentItem = null;
      for (let i = itemsStartIndex + 2; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;

        if (line.includes('x\t')) {
          // New item starts
          if (currentItem) orderData.items.push(currentItem);
          const [quantity, name] = line.split('\t').filter(Boolean);
          currentItem = {
            quantity: parseInt(quantity),
            name: name,
            cardNumber: '',
            set: '',
            condition: '',
            details: '',
            price: 0
          };
        } else if (line.startsWith('#')) {
          currentItem.cardNumber = line;
        } else if (/^[A-Z0-9]{3,4}$/.test(line)) {
          currentItem.set = line;
        } else if (['NM', 'EX', 'GD', 'LP', 'MP', 'HP'].includes(line)) {
          currentItem.condition = line;
        } else if (line.includes('set:')) {
          currentItem.details = line;
        } else if (line.includes('€')) {
          currentItem.price = parseFloat(line.replace(',', '.').replace(' €', ''));
        }
      }
      if (currentItem) orderData.items.push(currentItem);

      // Set parsed data
      setParsedOrder(orderData);
      setValidationError('');
      
      // Log the parsed data for debugging
      console.log('Parsed Order Data:', orderData);

    } catch (error) {
      setValidationError(error.message);
      setParsedOrder(null);
    }
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="orders-modal"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Paper
        sx={{
          position: 'relative',
          width: '80%',
          maxWidth: 1200,
          maxHeight: '90vh',
          overflow: 'auto',
          p: 4
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Orders Management</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
  
        <Alert severity="info" sx={{ mb: 3 }}>
          For single card orders, please use the main app's unlisting feature instead.
        </Alert>
  
        <Tabs value={value} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Cardmarket Orders" />
          <Tab label="Shopify Orders" />
        </Tabs>
  
        {value === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Cardmarket Bulk Orders
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={10}
              value={cardmarketOrders}
              onChange={(e) => {
                setCardmarketOrders(e.target.value);
                setValidationError(''); // Clear validation error when input changes
              }}
              placeholder={`Please copy and paste the entire Cardmarket sale details, starting from "Sale #..." through the last card price.

            Example format:
            Sale #1193180604
            Fiercetuna
            Unpaid: 24.01.2025 23:20
            ...
            [Include all shipping details and card list]
            ...
            Last card with price

            Make sure to include:
            - Sale number and buyer name
            - Payment status and dates
            - Shipping address and method
            - Complete list of cards with all details
            - All price information`}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            {validationError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {validationError}
              </Alert>
            )}
            {parsedOrder && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Alert severity="success">
                  Order successfully parsed! Please verify and edit the details if needed:
                </Alert>
                <Paper sx={{ p: 2, mt: 2 }}>
                  {/* Basic Order Info */}
                  <Box sx={{ mb: 2 }}>
                    <TextField 
                      label="Order #"
                      value={parsedOrder.orderNumber}
                      onChange={(e) => handleOrderDataChange('orderNumber', e.target.value)}
                      sx={{ mr: 2 }}
                    />
                    <TextField 
                      label="Platform"
                      value={parsedOrder.platform}
                      onChange={(e) => handleOrderDataChange('platform', e.target.value)}
                      sx={{ mr: 2 }}
                    />
                    <TextField 
                      label="TCG"
                      value={parsedOrder.tcg}
                      onChange={(e) => handleOrderDataChange('tcg', e.target.value)}
                    />
                  </Box>

                  {/* Shipping Address Section */}
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Shipping Address</Typography>
                  <Box sx={{ pl: 2, mb: 2 }}>
                    <TextField 
                      fullWidth
                      label="Name"
                      value={parsedOrder.shippingAddress.name}
                      onChange={(e) => handleShippingAddressChange('name', e.target.value)}
                      sx={{ mb: 1 }}
                    />
                    <TextField 
                      fullWidth
                      label="Street"
                      value={parsedOrder.shippingAddress.street}
                      onChange={(e) => handleShippingAddressChange('street', e.target.value)}
                      sx={{ mb: 1 }}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField 
                        label="Postal Code"
                        value={parsedOrder.shippingAddress.postalCode}
                        onChange={(e) => handleShippingAddressChange('postalCode', e.target.value)}
                      />
                      <TextField 
                        fullWidth
                        label="City"
                        value={parsedOrder.shippingAddress.city}
                        onChange={(e) => handleShippingAddressChange('city', e.target.value)}
                      />
                    </Box>
                    <TextField 
                      fullWidth
                      label="Country"
                      value={parsedOrder.shippingAddress.country}
                      onChange={(e) => handleShippingAddressChange('country', e.target.value)}
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  {/* Order Summary Section */}
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Order Summary</Typography>
                  <Box sx={{ pl: 2, mb: 2, display: 'flex', gap: 2 }}>
                    <TextField 
                      type="number"
                      label="Article Count"
                      value={parsedOrder.orderSummary.articleCount}
                      onChange={(e) => handleSummaryChange('articleCount', e.target.value)}
                    />
                    <TextField 
                      type="number"
                      label="Article Value (€)"
                      value={parsedOrder.orderSummary.articleValue}
                      onChange={(e) => handleSummaryChange('articleValue', e.target.value)}
                    />
                    <TextField 
                      type="number"
                      label="Shipping Cost (€)"
                      value={parsedOrder.orderSummary.shippingCost}
                      onChange={(e) => handleSummaryChange('shippingCost', e.target.value)}
                    />
                    <TextField 
                      type="number"
                      label="Total (€)"
                      value={parsedOrder.orderSummary.total}
                      onChange={(e) => handleSummaryChange('total', e.target.value)}
                    />
                  </Box>

                  {/* Cards Section */}
                  <Typography variant="subtitle1">
                    Cards ({parsedOrder.items.length})
                    <IconButton onClick={() => setShowCards(!showCards)} size="small">
                      <ExpandMoreIcon />
                    </IconButton>
                  </Typography>
                  
                  <Collapse in={showCards}>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Qty</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Set</TableCell>
                            <TableCell>Card #</TableCell>
                            <TableCell>Condition</TableCell>
                            <TableCell>Details</TableCell>
                            <TableCell>Price (€)</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {parsedOrder.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <TextField 
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <TextField 
                                  value={item.name}
                                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <TextField 
                                  value={item.set}
                                  onChange={(e) => handleItemChange(index, 'set', e.target.value)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <TextField 
                                  value={item.cardNumber}
                                  onChange={(e) => handleItemChange(index, 'cardNumber', e.target.value)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <TextField 
                                  value={item.condition}
                                  onChange={(e) => handleItemChange(index, 'condition', e.target.value)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <TextField 
                                  value={item.details}
                                  onChange={(e) => handleItemChange(index, 'details', e.target.value)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <TextField 
                                  type="number"
                                  value={item.price}
                                  onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <IconButton onClick={() => removeItem(index)} size="small">
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addNewItem}
                      sx={{ mt: 1 }}
                    >
                      Add Card
                    </Button>
                  </Collapse>
                </Paper>
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                color="error"
                onClick={handleClear}
                disabled={loading}
                startIcon={<ClearIcon />}
              >
                Clear All
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                disabled={!cardmarketOrders || loading}
                onClick={parseAndValidateOrder}
              >
                Validate Order
              </Button>
              {parsedOrder && (
                <Button 
                  variant="contained" 
                  color="success"
                  onClick={() => handleSubmitOrder(parsedOrder)}
                  disabled={!!validationError || loading}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Processing...
                    </>
                  ) : (
                    'Confirm & Process Order'
                  )}
                </Button>
              )}
            </Box>
          </Box>
        )}
  
        {value === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Active Shopify Orders
            </Typography>
            <List>
              {shopifyOrders.length > 0 ? (
                shopifyOrders.map((order, index) => (
                  <ListItem 
                    key={index}
                    divider
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <ListItemText
                      primary={`Order #${order.id}`}
                      secondary={`${order.items.length} items • ${order.date}`}
                    />
                    <Button 
                      variant="outlined"
                      onClick={() => {
                        console.log('View order details...');
                      }}
                    >
                      View Details
                    </Button>
                  </ListItem>
                ))
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
                  No active Shopify orders
                </Typography>
              )}
            </List>
          </Box>
        )}
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default OrdersModal;