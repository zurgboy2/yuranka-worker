import React, { useState } from 'react';
import { TextField, Button, Grid, Select, MenuItem, FormControl, InputLabel, Typography, Box } from '@mui/material';
import { useUserData } from '../UserContext'; // Import the useUserData hook

const NewOrderForm = ({ onSave }) => {
  const { userData } = useUserData(); // Use the userData context
  const [orderDetails, setOrderDetails] = useState('');
  const [orderType, setOrderType] = useState('');
  const [dimensions, setDimensions] = useState({ length: '', width: '', height: '' });
  const [totalPrice, setTotalPrice] = useState('');
  const [shippingPrice, setShippingPrice] = useState('');
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    username: '',
    email: '',
    address: '',
    orderNumber: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const orderData = {
      orderDetails,
      orderType,
      dimensions,
      totalPrice,
      shippingPrice,
      customerDetails,
      createdBy: userData.username, // Add the user who created the order
      role: userData.role // Add the user's role
    };
    onSave(orderData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Order Details"
            value={orderDetails}
            onChange={(e) => setOrderDetails(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Order Type</InputLabel>
            <Select
              value={orderType}
              label="Order Type"
              onChange={(e) => setOrderType(e.target.value)}
            >
              <MenuItem value="CardMarket">CardMarket Order</MenuItem>
              <MenuItem value="Shopify">Shopify Order</MenuItem>
              <MenuItem value="Personal">Personal Order</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <TextField
            fullWidth
            label="Length"
            type="number"
            value={dimensions.length}
            onChange={(e) => setDimensions({ ...dimensions, length: e.target.value })}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            fullWidth
            label="Width"
            type="number"
            value={dimensions.width}
            onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            fullWidth
            label="Height"
            type="number"
            value={dimensions.height}
            onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Total Price"
            type="number"
            value={totalPrice}
            onChange={(e) => setTotalPrice(e.target.value)}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Shipping Price"
            type="number"
            value={shippingPrice}
            onChange={(e) => setShippingPrice(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Customer Details
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Name"
            value={customerDetails.name}
            onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
          />
        </Grid>
        {orderType === 'CardMarket' && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Username"
              value={customerDetails.username}
              onChange={(e) => setCustomerDetails({ ...customerDetails, username: e.target.value })}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={customerDetails.email}
            onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            multiline
            rows={2}
            value={customerDetails.address}
            onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Order Number"
            value={customerDetails.orderNumber}
            onChange={(e) => setCustomerDetails({ ...customerDetails, orderNumber: e.target.value })}
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">
            Submit Order
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NewOrderForm;