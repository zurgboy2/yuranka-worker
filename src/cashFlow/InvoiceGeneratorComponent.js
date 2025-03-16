import React, { useState } from 'react';
import { 
  TextField, Button, Grid, Typography, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Snackbar, Alert, Link
} from '@mui/material';
import apiCall from '../api';
import { useUserData } from '../UserContext'; // Import the useUserData hook

const InvoiceGeneratorComponent = () => {
  const { userData } = useUserData();
  const [invoiceData, setInvoiceData] = useState({
    customerName: '',
    customerDetails: '',
    items: [],
    dueDate: '',
    tax: 0,
    discount: 0,
    invoiceNumber: '',
    dateOfInvoice: ''
  });
  const [newItem, setNewItem] = useState({ productService: '', quantity: 0, price: 0 });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [generatedInvoiceUrl, setGeneratedInvoiceUrl] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData({ ...invoiceData, [name]: value });
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { ...newItem, total: newItem.quantity * newItem.price }]
    });
    setNewItem({ productService: '', quantity: 0, price: 0 });
  };

  const removeItem = (index) => {
    const updatedItems = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData({ ...invoiceData, items: updatedItems });
  };

  const calculateTotal = () => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * (invoiceData.tax / 100);
    const discountAmount = subtotal * (invoiceData.discount / 100);
    return subtotal + taxAmount - discountAmount;
  };

  const formatEuro = (amount) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const generateInvoice = async () => {
    setLoading(true);
    try {
      const formData = {
        customerName: invoiceData.customerName,
        customerDetails: invoiceData.customerDetails,
        dueDate: invoiceData.dueDate,
        productItems: invoiceData.items,
        tax: invoiceData.tax,
        discount: invoiceData.discount
      };

      if (invoiceData.invoiceNumber) {
        formData.invoiceNumber = invoiceData.invoiceNumber;
      }

      if (invoiceData.dateOfInvoice) {
        formData.dateOfInvoice = invoiceData.dateOfInvoice;
      }

      const response = await apiCall('accounting_script', 'generateInvoice', {
        data: formData,
        googleToken: userData.googleToken, 
        username: userData.username 
      });
      
      // Check if the response has the expected structure
      if (response && response.pdfUrl && response.message) {
        setGeneratedInvoiceUrl(response.pdfUrl);
        setSnackbar({
          open: true,
          message: response.message,
          severity: 'success'
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error("Failed to generate invoice", error);
      setSnackbar({
        open: true,
        message: `Failed to generate invoice: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Invoice Generator</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Customer Name"
            name="customerName"
            value={invoiceData.customerName}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Customer Details"
            name="customerDetails"
            value={invoiceData.customerDetails}
            onChange={handleInputChange}
            multiline
            rows={4}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            label="Due Date"
            name="dueDate"
            value={invoiceData.dueDate}
            onChange={handleInputChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h6">Add Item</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Product/Service"
              name="productService"
              value={newItem.productService}
              onChange={handleItemChange}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Quantity"
              name="quantity"
              type="number"
              value={newItem.quantity}
              onChange={handleItemChange}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Price (€)"
              name="price"
              type="number"
              value={newItem.price}
              onChange={handleItemChange}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>€</Typography>,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="contained" onClick={addItem} fullWidth>Add</Button>
          </Grid>
        </Grid>
      </Box>

      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product/Service</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoiceData.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.productService}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">{formatEuro(item.price)}</TableCell>
                <TableCell align="right">{formatEuro(item.total)}</TableCell>
                <TableCell align="right">
                  <Button onClick={() => removeItem(index)} color="secondary">Remove</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Tax (%)"
            name="tax"
            type="number"
            value={invoiceData.tax}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Discount (%)"
            name="discount"
            type="number"
            value={invoiceData.discount}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Invoice Number"
            name="invoiceNumber"
            type="number"
            value={invoiceData.invoiceNumber}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            label="Date of Invoice"
            name="dateOfInvoice"
            value={invoiceData.dateOfInvoice}
            onChange={handleInputChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mt: 4 }}>
        Total: {formatEuro(calculateTotal())}
      </Typography>

      <Button 
        variant="contained" 
        onClick={generateInvoice} 
        sx={{ mt: 4 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Generate Invoice'}
      </Button>

      {generatedInvoiceUrl && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">
            Invoice generated successfully. 
            <Link href={generatedInvoiceUrl} target="_blank" rel="noopener noreferrer">
              View Invoice
            </Link>
          </Typography>
        </Box>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InvoiceGeneratorComponent;