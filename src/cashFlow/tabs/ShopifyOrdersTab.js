import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Button, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Pagination, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Snackbar, Alert, Chip, Grid, Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import apiCall from '../../api';
import { useUserData } from '../../UserContext';

const ShopifyOrdersTab = () => {
  const { userData } = useUserData();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Invoice generation states
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(dayjs());
  const [dueDate, setDueDate] = useState(dayjs().add(30, 'day'));
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  };

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiCall('accounting_script', 'getAllShopifyOrders', {
        googleToken: userData.googleToken,
        username: userData.username
      });

      setOrders(Array.isArray(response) ? response : []);
      console.log("Fetched Shopify orders:", response);
    } catch (error) {
      console.error("Error fetching Shopify orders:", error);
      setSnackbar({ open: true, message: 'Error fetching orders', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const paginatedOrders = orders.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleGenerateInvoiceClick = (order) => {
    setSelectedOrder(order);
    setInvoiceNumber(`SH-${order.orderNumber || order.id || ''}`);
    setInvoiceDate(dayjs());
    setDueDate(dayjs().add(30, 'day'));
    setDuplicateWarning(false);
    setInvoiceDialogOpen(true);
  };

  const checkDuplicateInvoice = async () => {
    try {
      const response = await apiCall('accounting_script', 'hasDuplicateInvoiceNo', {
        invoiceNumber,
        type: 'SH',
        googleToken: userData.googleToken,
        username: userData.username
      });
      return response;
    } catch (error) {
      console.error("Error checking duplicate:", error);
      return false;
    }
  };

  const handleGenerateInvoice = async () => {
    setGeneratingInvoice(true);
    
    try {
      // Check for duplicates first
      const isDuplicate = await checkDuplicateInvoice();
      
      if (isDuplicate) {
        setDuplicateWarning(true);
        setGeneratingInvoice(false);
        return;
      }

      await generateInvoice();
    } catch (error) {
      console.error("Error:", error);
      setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
      setGeneratingInvoice(false);
    }
  };

  const handleProceedWithDuplicate = async () => {
    setDuplicateWarning(false);
    await generateInvoice();
  };

  const generateInvoice = async () => {
    try {
      const formData = {
        customerName: selectedOrder.customer,
        customerDetails: `${selectedOrder.address}\nEmail: ${selectedOrder.email}`,
        dueDate: dueDate.format('YYYY-MM-DD'),
        productItems: selectedOrder.items.map(item => ({
          productService: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price
        })),
        tax: selectedOrder.tax || 0,
        discount: selectedOrder.discount || 0,
        invoiceNumber,
        dateOfInvoice: invoiceDate.format('YYYY-MM-DD'),
        type: 'SH'
      };

      const response = await apiCall('accounting_script', 'generateInvoice', {
        data: formData,
        googleToken: userData.googleToken,
        username: userData.username
      });

      if (response && response.pdfUrl) {
        setSnackbar({
          open: true,
          message: response.message || 'Invoice generated successfully!',
          severity: 'success'
        });
        setInvoiceDialogOpen(false);
        fetchOrders(); // Refresh orders
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error("Failed to generate invoice:", error);
      setSnackbar({
        open: true,
        message: `Failed to generate invoice: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Shopify Orders</Typography>
            <Button onClick={fetchOrders} disabled={isLoading} variant="contained">
              Refresh Orders
            </Button>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order #</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Payment Status</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Items</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedOrders.map((order, index) => (
                      <TableRow key={order.orderNumber || index}>
                        <TableCell>#{order.orderNumber}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={order.paymentStatus}
                            color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                        <TableCell>{order.items?.length || 0} items</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleGenerateInvoiceClick(order)}
                          >
                            Generate Invoice
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={Math.ceil(orders.length / rowsPerPage)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Invoice Generation Dialog */}
      <Dialog open={invoiceDialogOpen} onClose={() => setInvoiceDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Generate Invoice for Order #{selectedOrder?.orderNumber}</DialogTitle>
        <DialogContent>
          {duplicateWarning && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              A duplicate invoice number exists. You can change it or proceed anyway.
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Invoice Number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Invoice Date"
                  value={invoiceDate}
                  onChange={(date) => setInvoiceDate(date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Due Date"
                  value={dueDate}
                  onChange={(date) => setDueDate(date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>Customer Details</Typography>
          <Typography variant="body2">Name: {selectedOrder?.customer}</Typography>
          <Typography variant="body2">Email: {selectedOrder?.email}</Typography>
          <Typography variant="body2">Address: {selectedOrder?.address}</Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>Order Items</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedOrder?.items?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.quantity * item.price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">Tax: {formatCurrency(selectedOrder?.tax || 0)}</Typography>
            <Typography variant="body2">Discount: {formatCurrency(selectedOrder?.discount || 0)}</Typography>
            <Typography variant="h6">Total: {formatCurrency(selectedOrder?.totalPrice)}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInvoiceDialogOpen(false)}>Cancel</Button>
          {duplicateWarning ? (
            <Button onClick={handleProceedWithDuplicate} variant="contained" color="warning">
              Proceed Anyway
            </Button>
          ) : (
            <Button
              onClick={handleGenerateInvoice}
              variant="contained"
              disabled={generatingInvoice}
            >
              {generatingInvoice ? <CircularProgress size={24} /> : 'Generate Invoice'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ShopifyOrdersTab;
