import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Divider,
  Paper,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import 'material-icons/iconfont/material-icons.css';

const OrderEditForm = ({ order, onSave, onCancel, loading }) => {
  const [editedOrder, setEditedOrder] = useState({
    orderDetails: {
      orderDetails: '',
      orderType: '',
      totalPrice: '',
      shippingPrice: '',
    },
    status: '',
    approval: '',
    shipments: [],
    customerDetails: {
      name: '',
      username: '',
      email: '',
      addressCountry: '',
      addressPostCode: '',
      addressCity: '',
      addressStreet:  '',
    },
  });

  useEffect(() => {
    if (order) {
      setEditedOrder({
        orderDetails: {
          orderDetails: order.orderDetails.orderDetails || '',
          orderType: order.orderDetails.orderType || '',
          totalPrice: order.orderDetails.totalPrice || '',
          shippingPrice: order.orderDetails.shippingPrice || '',
        },
        status: order.status || '',
        approval: order.approval || '',
        shipments: order.shipments || [],
        customerDetails: {
          name: order.customerDetails.name || '',
          username: order.customerDetails.username || '',
          email: order.customerDetails.email || '',
          addressCountry: order.customerDetails.addressCountry || '',
          addressPostCode: order.customerDetails.addressPostCode || '',
          addressCity: order.customerDetails.addressCity || '',
          addressStreet: order.customerDetails.addressStreet || '',
        },
      });
    }
  }, [order]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedOrder = {
      ...order,
      ...editedOrder,
    };
    onSave(updatedOrder);
  };

  const handleChange = (section, field, value) => {
    setEditedOrder(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleStatusChange = (newStatus) => {
    if (editedOrder.approval === 'Needed' && newStatus === 'Completed') {
      // Prevent setting status to Completed if approval is Needed
      return;
    }
    handleChange('status', newStatus);
  };

  const handleShipmentChange = (index, field, value) => {
    setEditedOrder(prev => ({
      ...prev,
      shipments: prev.shipments.map((shipment, i) => 
        i === index ? { ...shipment, [field]: value } : shipment
      )
    }));
  };

  const addShipment = () => {
    setEditedOrder(prev => ({
      ...prev,
      shipments: [
        ...prev.shipments,
        {
          name: `Shipment ${prev.shipments.length + 1}`,
          trackingNumber: '',
          method: '',
          shippingPrice: '',
          status: '',
        }
      ]
    }));
  };

  const removeShipment = (index) => {
    setEditedOrder(prev => ({
      ...prev,
      shipments: prev.shipments.filter((_, i) => i !== index)
    }));
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Alert 
        severity={editedOrder.approval === 'Needed' ? 'warning' : 'success'}
        sx={{ mb: 2 }}
      >
        Approval Status: {editedOrder.approval}
        {editedOrder.approval === 'Needed' && (
          <Typography variant="body2">
            Note: Order cannot be marked as Completed until approved.
          </Typography>
        )}
      </Alert>

      <Typography variant="h5" gutterBottom>Edit Order</Typography>
      
      <Grid container spacing={2}>
        {/* Order Details */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Order Details"
            value={editedOrder.orderDetails.orderDetails}
            onChange={(e) => handleChange('orderDetails', 'orderDetails', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Order Type</InputLabel>
            <Select
              value={editedOrder.orderDetails.orderType}
              label="Order Type"
              onChange={(e) => handleChange('orderDetails', 'orderType', e.target.value)}
            >
              <MenuItem value="CardMarket">CardMarket Order</MenuItem>
              <MenuItem value="Personal">Personal Order</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Total Price"
            type="number"
            value={editedOrder.orderDetails.totalPrice}
            onChange={(e) => handleChange('orderDetails', 'totalPrice', e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Shipping Price"
            type="number"
            value={editedOrder.orderDetails.shippingPrice}
            onChange={(e) => handleChange('orderDetails', 'shippingPrice', e.target.value)}
          />
        </Grid>
        
        {/* Shipments */}
        {editedOrder.shipments.map((shipment, index) => (
          <Grid item xs={12} key={index}>
            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {shipment.name}
                {index > 0 && (
                  <IconButton onClick={() => removeShipment(index)} sx={{ float: 'right' }}>
                    <span className="material-icons">delete</span>
                  </IconButton>
                )}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tracking Number"
                    value={shipment.trackingNumber}
                    onChange={(e) => handleShipmentChange(index, 'trackingNumber', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Shipping Method"
                    value={shipment.method}
                    onChange={(e) => handleShipmentChange(index, 'method', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Shipping Price"
                    value={shipment.shippingPrice}
                    onChange={(e) => handleShipmentChange(index, 'shippingPrice', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Status"
                    value={shipment.status}
                    onChange={(e) => handleShipmentChange(index, 'status', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
        
        <Grid item xs={12}>
          <Button startIcon={<span className="material-icons">add</span>} onClick={addShipment}>
            Add Shipment
          </Button>
        </Grid>

        {/* Order Status */}
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={editedOrder.status}
              label="Status"
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <MenuItem value="OnGoing">On Going</MenuItem>
              {editedOrder.approval !== 'Needed' && (
                <MenuItem value="Completed">Completed</MenuItem>
              )}
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Customer Details */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>Customer Details</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Name"
            value={editedOrder.customerDetails.name}
            onChange={(e) => handleChange('customerDetails', 'name', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Username"
            value={editedOrder.customerDetails.username}
            onChange={(e) => handleChange('customerDetails', 'username', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Address (Country)"
            value={editedOrder.customerDetails.addressCountry}
            onChange={(e) => handleChange('customerDetails', 'addressCountry', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Address (PostCode)"
            value={editedOrder.customerDetails.addressPostCode}
            onChange={(e) => handleChange('customerDetails', 'addressPostCode', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Address (City)"
            value={editedOrder.customerDetails.addressCity}
            onChange={(e) => handleChange('customerDetails', 'addressCity', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Address (Street and House)"
            value={editedOrder.customerDetails.addressStreet}
            onChange={(e) => handleChange('customerDetails', 'addressStreet', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={editedOrder.customerDetails.email}
            onChange={(e) => handleChange('customerDetails', 'email', e.target.value)}
          />
        </Grid>
        {/* Submit and Cancel buttons */}
        <Grid item xs={12}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Update Order"}
          </Button>
          <Button 
            onClick={onCancel} 
            variant="outlined" 
            color="secondary" 
            sx={{ ml: 2 }}
            disabled={loading}
          >
            Cancel
          </Button>
        </Grid>
        </Grid>
      </Box>
    );
  };
  

export default OrderEditForm;