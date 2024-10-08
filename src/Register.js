import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, TextField, Button, Grid, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Autocomplete, Slider
} from '@mui/material';
import 'material-icons/iconfont/material-icons.css';
import apiCall from './api';
import { useUserData } from './UserContext';

const Register = ({ onOpenFullApp }) => {
  const { userData } = useUserData();
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [total, setTotal] = useState(0);
  const [membershipId, setMembershipId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [storeCredit, setStoreCredit] = useState(0);
  const [allocatedCredit, setAllocatedCredit] = useState(0);
  const [deliveryInfo, setDeliveryInfo] = useState({ country: '', postcode: '' });
  const [costData, setCostData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const scriptId = 'register_script';
      const action = 'getSpreadsheetData';
      
      const response = await apiCall(scriptId, action, {
        role: userData.role,
        googleToken: userData.googleToken,
        username: userData.username
      });
      
      if (Array.isArray(response)) {
        setAllItems(response);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(`Failed to load items: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [userData.role, userData.googleToken, userData.username]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearch = (event, newValue) => {
    setSelectedItem(newValue);
    if (newValue) {
      addItem(newValue);
    }
  };

  const addItem = (item) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.uniqueId === item.uniqueId);
      if (existingItem) {
        return prevItems.map(i => 
          i.uniqueId === item.uniqueId ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
    setSelectedItem(null);
  };

  const removeItem = (uniqueId) => {
    setItems(prevItems => prevItems.filter(item => item.uniqueId !== uniqueId));
  };

  const updateQuantity = (uniqueId, quantity) => {
    setItems(prevItems => prevItems.map(item => 
      item.uniqueId === uniqueId ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(newTotal);
  }, [items]);

  const handleMembershipSubmit = async () => {
    try {
      setLoading(true);
      const scriptId = 'register_script';
      const action = 'searchMembership';
      
      const response = await apiCall(scriptId, action, {
        role: userData.role,
        googleToken: userData.googleToken,
        username: userData.username,
        membershipId: membershipId
      });
      
      if (response) {
        setCustomerName(response.name);
        setCustomerEmail(response.email);
        setStoreCredit(response.value);
        setAllocatedCredit(0); // Reset allocated credit when new membership is loaded
      } else {
        setError('Membership not found');
      }
    } catch (err) {
      console.error('Error searching membership:', err);
      setError(`Failed to search membership: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreditAllocation = (event, newValue) => {
    setAllocatedCredit(newValue);
  };

  useEffect(() => {
    const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(itemsTotal - allocatedCredit);
  }, [items, allocatedCredit]);

  const handleSendInvoice = async () => {
    try {
      setLoading(true);
      const scriptId = 'register_script';
      const action = 'sendInvoice';
      
      const transformedItems = items.map(item => ({
        ...item,
        sold: item.quantity,
        quantity: undefined
      }));

      // Add store credit as an item if allocated
      if (allocatedCredit > 0) {
        transformedItems.push({
          uniqueId: 'store_credit',
          title: 'Store Credit',
          price: allocatedCredit,
          sold: 1
        });
      }
      
      await apiCall(scriptId, action, {
        role: userData.role,
        googleToken: userData.googleToken,
        username: userData.username,
        email: customerEmail,
        items: transformedItems
      });
      
      alert('Invoice sent successfully');
      setItems([]);
      setTotal(0);
      setAllocatedCredit(0);
      setStoreCredit(0);
      setCustomerName('');
      setCustomerEmail('');
      setMembershipId('');
    } catch (err) {
      console.error('Error sending invoice:', err);
      setError(`Failed to send invoice: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverySubmit = async () => {
    try {
      setLoading(true);
      const scriptId = 'register_script';
      const action = 'processDeliveryData';
      
      const response = await apiCall(scriptId, action, {
        role: userData.role,
        googleToken: userData.googleToken,
        username: userData.username,
        country: deliveryInfo.country,
        postcode: deliveryInfo.postcode,
        items: items
      });
      
      setCostData(response);
    } catch (err) {
      console.error('Error processing delivery data:', err);
      setError(`Failed to process delivery data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <>
      <Autocomplete
        fullWidth
        options={allItems}
        getOptionLabel={(option) => `${option.title} - €${option.price}`}
        value={selectedItem}
        onChange={handleSearch}
        isOptionEqualToValue={(option, value) => option.uniqueId === value.uniqueId}
        getOptionKey={(option) => option.uniqueId}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search for item"
            variant="outlined"
            margin="normal"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <span className="material-icons">search</span>
                  {params.InputProps.startAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.uniqueId}>
            {option.title} - €{option.price}
          </li>
        )}
      />
      
      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.uniqueId}>
                <TableCell>{item.title}</TableCell>
                <TableCell align="right">€{item.price.toFixed(2)}</TableCell>
                <TableCell align="right">
                  <TextField
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.uniqueId, parseInt(e.target.value))}
                    inputProps={{ min: 1 }}
                  />
                </TableCell>
                <TableCell align="right">€{(item.price * item.quantity).toFixed(2)}</TableCell>
                <TableCell align="right">
                  <Button onClick={() => removeItem(item.uniqueId)}>
                    <span className="material-icons">delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {allocatedCredit > 0 && (
              <TableRow>
                <TableCell>Store Credit</TableCell>
                <TableCell align="right">-€{allocatedCredit.toFixed(2)}</TableCell>
                <TableCell align="right">1</TableCell>
                <TableCell align="right">-€{allocatedCredit.toFixed(2)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" style={{ marginTop: '20px' }}>
        Total: €{total.toFixed(2)}
      </Typography>

      {items.length > 0 && (
        <>
          <TextField
            fullWidth
            label="Membership ID"
            value={membershipId}
            onChange={(e) => setMembershipId(e.target.value)}
            margin="normal"
            InputProps={{
              startAdornment: <span className="material-icons">card_membership</span>,
            }}
          />
          <Button onClick={handleMembershipSubmit} startIcon={<span className="material-icons">search</span>}>
            Submit Membership
          </Button>
          {storeCredit > 0 && (
            <>
              <Typography gutterBottom>
                Available Store Credit: €{storeCredit.toFixed(2)}
              </Typography>
              <Typography gutterBottom>
                Allocate Store Credit: €{allocatedCredit.toFixed(2)}
              </Typography>
              <Slider
                value={allocatedCredit}
                onChange={handleCreditAllocation}
                aria-labelledby="store-credit-slider"
                valueLabelDisplay="auto"
                step={0.01}
                marks
                min={0}
                max={Math.min(storeCredit, total + allocatedCredit)}
              />
            </>
          )}
          <TextField
            fullWidth
            label="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            margin="normal"
            InputProps={{
              startAdornment: <span className="material-icons">person</span>,
            }}
          />
          <TextField
            fullWidth
            label="Customer Email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            margin="normal"
            InputProps={{
              startAdornment: <span className="material-icons">email</span>,
            }}
          />
          <TextField
            fullWidth
            label="Country"
            value={deliveryInfo.country}
            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, country: e.target.value })}
            margin="normal"
            InputProps={{
              startAdornment: <span className="material-icons">public</span>,
            }}
          />
          <TextField
            fullWidth
            label="Postal Code"
            value={deliveryInfo.postcode}
            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, postcode: e.target.value })}
            margin="normal"
            InputProps={{
              startAdornment: <span className="material-icons">markunread_mailbox</span>,
            }}
          />
          <Button onClick={handleDeliverySubmit} startIcon={<span className="material-icons">local_shipping</span>}>
            Calculate Delivery Cost
          </Button>
          {costData.length > 0 && (
            <TableContainer component={Paper} style={{ marginTop: '20px' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Service Type</TableCell>
                    <TableCell align="right">Discounted Price</TableCell>
                    <TableCell align="right">Max Weight</TableCell>
                    <TableCell align="right">Delivery Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {costData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.deliveryName}</TableCell>
                      <TableCell align="right">{item.discountedPrice} EUR</TableCell>
                      <TableCell align="right">{item.maxWeight} kg</TableCell>
                      <TableCell align="right">{item.deliveryDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <Button onClick={handleSendInvoice} color="primary" startIcon={<span className="material-icons">send</span>}>
            Send Invoice
          </Button>
        </>
      )}
    </>
  );
};

export default Register;