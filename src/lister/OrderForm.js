import React from 'react';
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
  Paper,
  IconButton,
} from '@mui/material';
import 'material-icons/iconfont/material-icons.css';

const OrderForm = ({ orderDetails, customerDetails, isEditing, onSubmit, onChange, onReset }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(event);
  };

  const addShipment = () => {
    onChange('orderDetails', 'shipments', [
      ...orderDetails.shipments,
      {
        name: `Shipment ${orderDetails.shipments.length + 1}`,
        trackingNumber: '',
        method: '',
        shippingPrice: '',
        dimensions: { length: '', width: '', height: '', weight: '' }
      }
    ]);
  };

  const removeShipment = (index) => {
    onChange('orderDetails', 'shipments', orderDetails.shipments.filter((_, i) => i !== index));
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Paper elevation={3} sx={{ p: 2, mb: 3, bgcolor: 'black.100' }}>
        <Typography variant="h6" gutterBottom>Guide for Submitting an Order:</Typography>
        <ol>
          <li>Pack the item(s) in a box.</li>
          <li>For CardMarket items, copy and paste the order details into the Order Details field.</li>
          <li>For Shopify items, most of the details are already there.</li>
          <li>Fill in all the required information, including the package dimensions and weight.</li>
          <li>Submit the order and wait for approval from Yurate on how to proceed.</li>
        </ol>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        {isEditing ? 'Edit Order' : 'Add New Order'}
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Order Details"
            value={orderDetails.orderDetails}
            onChange={(e) => onChange('orderDetails', 'orderDetails', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Order Type</InputLabel>
            <Select
              value={orderDetails.orderType}
              label="Order Type"
              onChange={(e) => onChange('orderDetails', 'orderType', e.target.value)}
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
            value={orderDetails.totalPrice}
            onChange={(e) => onChange('orderDetails', 'totalPrice', e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Shipping Price"
            type="number"
            value={orderDetails.shippingPrice}
            onChange={(e) => onChange('orderDetails', 'shippingPrice', e.target.value)}
          />
        </Grid>
        
        {orderDetails.shipments.map((shipment, index) => (
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
                  onChange={(e) => onChange('orderDetails', `shipments.${index}.trackingNumber`, e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Shipping Method"
                  value={shipment.method}
                  onChange={(e) => onChange('orderDetails', `shipments.${index}.method`, e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Length (cm)"
                  type="text"
                  value={shipment.dimensions.length}
                  onChange={(e) => onChange('orderDetails', `shipments.${index}.dimensions.length`, e.target.value.replace(/[^0-9.]/g, ''))}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Width (cm)"
                  type="text"
                  value={shipment.dimensions.width}
                  onChange={(e) => onChange('orderDetails', `shipments.${index}.dimensions.width`, e.target.value.replace(/[^0-9.]/g, ''))}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Height (cm)"
                  type="text"
                  value={shipment.dimensions.height}
                  onChange={(e) => onChange('orderDetails', `shipments.${index}.dimensions.height`, e.target.value.replace(/[^0-9.]/g, ''))}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  type="text"
                  value={shipment.dimensions.weight}
                  onChange={(e) => onChange('orderDetails', `shipments.${index}.dimensions.weight`, e.target.value.replace(/[^0-9.]/g, ''))}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
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

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={orderDetails.status}
              label="Status"
              onChange={(e) => onChange('orderDetails', 'status', e.target.value)}
            >
              <MenuItem value="OnGoing">On Going</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Name"
            value={customerDetails.name}
            onChange={(e) => onChange('customerDetails', 'name', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Username"
            value={customerDetails.username}
            onChange={(e) => onChange('customerDetails', 'username', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Address (Country)"
            value={customerDetails.addressCountry}
            onChange={(e) => onChange('customerDetails', 'addressCountry', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Address (PostCode)"
            value={customerDetails.addressPostCode}
            onChange={(e) => onChange('customerDetails', 'addressPostCode', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Address (City)"
            value={customerDetails.addressCity}
            onChange={(e) => onChange('customerDetails', 'addressCity', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Address (Street and House)"
            value={customerDetails.addressStreet}
            onChange={(e) => onChange('customerDetails', 'addressStreet', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={customerDetails.email}
            onChange={(e) => onChange('customerDetails', 'email', e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">
            {isEditing ? 'Update Order' : 'Submit Order'}
          </Button>
          {isEditing && (
            <Button onClick={onReset} variant="outlined" color="secondary" sx={{ ml: 2 }}>
              Cancel Edit
            </Button>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderForm;