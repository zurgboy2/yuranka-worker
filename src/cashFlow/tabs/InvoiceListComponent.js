import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Typography, Box, Button, Card, CardContent, CardHeader,
  TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,
  Select, MenuItem, InputLabel, FormControl,
  useMediaQuery, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert,
  List, ListItem, ListItemText, Divider, IconButton,
  createTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import apiCall from '../../api';
import { useUserData } from '../../UserContext';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

const InvoiceListComponent = ({ keyword, title = "Invoices" }) => {
  const { userData } = useUserData();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const isMobile = useMediaQuery(darkTheme.breakpoints.down('sm'));
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedInvoices = await apiCall('accounting_script', 'getInvoices', {
        keyword,
        googleToken: userData.googleToken,
        username: userData.username
      });
      setInvoices(fetchedInvoices || []);
      setFilteredInvoices(fetchedInvoices || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setSnackbar({ open: true, message: 'Error fetching invoices', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [userData, keyword]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const parseDate = (dateString) => {
    if (!dateString) return null;
    const parsedDate = dayjs(dateString);
    return parsedDate.isValid() ? parsedDate.toDate() : null;
  };

  const formatDate = (date) => {
    return date ? dayjs(date).format('YYYY-MM-DD') : '';
  };

  const normalizePaymentStatus = (status) => {
    if (!status) return 'UnPaid';
    const normalized = status.replace(/\s+/g, ' ').trim();
    if (normalized.toLowerCase() === 'unpaid') return 'UnPaid';
    if (normalized.toLowerCase() === 'partially paid') return 'Partially Paid';
    if (normalized.toLowerCase() === 'paid') return 'Paid';
    return normalized;
  };

  const applyFilters = useCallback(() => {
    const filtered = invoices.filter(invoice => {
      const statusMatch = statusFilter === 'All' || invoice.status === statusFilter;
      const normalizedPaymentStatus = normalizePaymentStatus(invoice.paymentStatus);
      const paymentStatusMatch = paymentStatusFilter === 'All' || normalizedPaymentStatus === paymentStatusFilter;
      const invoiceDate = parseDate(invoice.date);
      const dateMatch = (!startDate || (invoiceDate && invoiceDate >= startDate)) &&
        (!endDate || (invoiceDate && invoiceDate <= endDate));
      return statusMatch && paymentStatusMatch && dateMatch;
    });
    setFilteredInvoices(filtered);
  }, [invoices, statusFilter, paymentStatusFilter, startDate, endDate]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleInvoiceClick = (invoice) => {
    setSelectedInvoice({ ...invoice });
  };

  const sortedInvoices = useMemo(() => {
    if (!sortConfig.key) return filteredInvoices;

    return [...filteredInvoices].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'date' || sortConfig.key === 'dateofrelease') {
        aValue = parseDate(aValue);
        bValue = parseDate(bValue);
        if (!aValue && !bValue) return 0;
        if (!aValue) return 1;
        if (!bValue) return -1;
      }

      if (sortConfig.key === 'amount' || sortConfig.key === 'amountPaid' || sortConfig.key === 'invoicenumber') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredInvoices, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectedInvoiceChange = (event) => {
    const { name, value } = event.target;
    setSelectedInvoice(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectedInvoiceDateChange = (date) => {
    setSelectedInvoice(prev => ({ ...prev, date: formatDate(date) }));
  };

  const saveInvoice = async (invoice) => {
    setIsLoading(true);
    try {
      const result = await apiCall('accounting_script', 'updateInvoice', {
        originalName: invoice.nameOfInvoice,
        name: invoice.nameOfInvoice,
        amount: invoice.amount,
        amountPaid: invoice.amountPaid,
        date: invoice.date,
        dateofrelease: invoice.dateofrelease,
        invoiceNumber: invoice.invoicenumber,
        googleToken: userData.googleToken,
        username: userData.username
      });

      if (result.success) {
        fetchInvoices();
        setSnackbar({ open: true, message: 'Invoice updated successfully', severity: 'success' });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      setSnackbar({ open: true, message: 'Error updating invoice', severity: 'error' });
    } finally {
      setIsLoading(false);
      setSelectedInvoice(null);
    }
  };

  const deleteInvoice = async (invoiceId) => {
    setIsLoading(true);
    try {
      await apiCall('accounting_script', 'deleteInvoice', {
        invoiceId,
        googleToken: userData.googleToken,
        username: userData.username
      });
      fetchInvoices();
      setSnackbar({ open: true, message: 'Invoice deleted successfully', severity: 'success' });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      setSnackbar({ open: true, message: 'Error deleting invoice', severity: 'error' });
    } finally {
      setIsLoading(false);
      setSelectedInvoice(null);
    }
  };

  const clearFilters = () => {
    setStatusFilter('All');
    setPaymentStatusFilter('All');
    setStartDate(null);
    setEndDate(null);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const FilterSummary = () => {
    const totalAmount = sortedInvoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
    const totalPaid = sortedInvoices.reduce((sum, inv) => sum + (parseFloat(inv.amountPaid) || 0), 0);
    const totalRemaining = totalAmount - totalPaid;

    return (
      <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6">
          Showing {sortedInvoices.length} of {invoices.length} invoices
        </Typography>
        <Typography variant="body2">
          Total Amount: €{totalAmount.toFixed(2)} |
          Total Paid: €{totalPaid.toFixed(2)} |
          Total Remaining: €{totalRemaining.toFixed(2)}
        </Typography>
      </Box>
    );
  };

  const renderMobileInvoiceList = () => (
    <List>
      {sortedInvoices.map((invoice) => (
        <React.Fragment key={invoice.invoicenumber}>
          <ListItem button onClick={() => handleInvoiceClick(invoice)}>
            <ListItemText
              primary={invoice.nameOfInvoice}
              secondary={`Amount: €${invoice.amount} | Date: ${invoice.date} | Status: ${invoice.status}`}
            />
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  );

  const renderInvoiceDetails = () => (
    <Dialog open={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} fullWidth maxWidth="sm">
      <DialogTitle>{selectedInvoice?.nameOfInvoice}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="dense"
          label="Amount"
          type="number"
          name="amount"
          value={selectedInvoice?.amount}
          onChange={handleSelectedInvoiceChange}
          InputProps={{
            startAdornment: <Typography>€</Typography>,
          }}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Amount Paid"
          type="number"
          name="amountPaid"
          value={selectedInvoice?.amountPaid}
          onChange={handleSelectedInvoiceChange}
          InputProps={{
            startAdornment: <Typography>€</Typography>,
          }}
        />
        <Typography><strong>Amount Remaining:</strong> €{selectedInvoice?.amount - selectedInvoice?.amountPaid}</Typography>
        <Box sx={{ mt: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={selectedInvoice?.date ? dayjs(selectedInvoice.date) : null}
              onChange={(date) => handleSelectedInvoiceDateChange(date ? date.toDate() : null)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  label: "Date",
                }
              }}
            />
          </LocalizationProvider>
        </Box>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Payment Status</InputLabel>
          <Select
            name="paymentStatus"
            value={selectedInvoice?.paymentStatus}
            onChange={handleSelectedInvoiceChange}
          >
            <MenuItem value="Paid">Paid</MenuItem>
            <MenuItem value="Partially Paid">Partially Paid</MenuItem>
            <MenuItem value="UnPaid">UnPaid</MenuItem>
          </Select>
        </FormControl>
        {selectedInvoice?.docUrl && (
          <Button
            href={selectedInvoice.docUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            sx={{ mt: 2 }}
          >
            View Document
          </Button>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSelectedInvoice(null)}>Close</Button>
        <Button onClick={() => saveInvoice(selectedInvoice)} variant="contained">Save</Button>
        <Button onClick={() => deleteInvoice(selectedInvoice.invoicenumber)} variant="contained" color="error">Delete</Button>
      </DialogActions>
    </Dialog>
  );

  const renderInvoiceRow = (invoice) => {
    const amount = parseFloat(invoice.amount) || 0;
    const amountPaid = parseFloat(invoice.amountPaid) || 0;
    const amountRemaining = invoice.amountRemaining !== undefined
      ? parseFloat(invoice.amountRemaining)
      : amount - amountPaid;

    return (
      <TableRow key={invoice.invoicenumber}>
        <TableCell>{invoice.invoicenumber}</TableCell>
        <TableCell>{invoice.nameOfInvoice}</TableCell>
        <TableCell>€{amount.toFixed(2)}</TableCell>
        <TableCell>€{amountPaid.toFixed(2)}</TableCell>
        <TableCell>€{amountRemaining.toFixed(2)}</TableCell>
        <TableCell>{invoice.date}</TableCell>
        <TableCell>{invoice.status}</TableCell>
        <TableCell>{normalizePaymentStatus(invoice.paymentStatus)}</TableCell>
        <TableCell>
          {invoice.docUrl ? (
            <a href={invoice.docUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#ff1744' }}>
              View
            </a>
          ) : (
            'N/A'
          )}
        </TableCell>
        <TableCell>
          <IconButton onClick={() => handleInvoiceClick(invoice)} size="small">
            <span className="material-symbols-outlined">edit</span>
          </IconButton>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Box>
      <Card>
        <CardHeader
          title={title}
          action={
            <Button onClick={fetchInvoices} disabled={isLoading} variant="contained">
              Refresh Invoices
            </Button>
          }
        />
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexDirection: isMobile ? 'column' : 'row' }}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label">Filter by Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Filter by Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="In">In</MenuItem>
                <MenuItem value="Out">Out</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="payment-status-filter-label">Filter by Payment Status</InputLabel>
              <Select
                labelId="payment-status-filter-label"
                value={paymentStatusFilter}
                label="Filter by Payment Status"
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Partially Paid">Partially Paid</MenuItem>
                <MenuItem value="UnPaid">UnPaid</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexDirection: isMobile ? 'column' : 'row' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" gutterBottom>Start Date</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={startDate ? dayjs(startDate) : null}
                  onChange={(date) => setStartDate(date ? date.toDate() : null)}
                  slotProps={{
                    textField: { fullWidth: true }
                  }}
                />
              </LocalizationProvider>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" gutterBottom>End Date</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={endDate ? dayjs(endDate) : null}
                  onChange={(date) => setEndDate(date ? date.toDate() : null)}
                  minDate={startDate ? dayjs(startDate) : null}
                  slotProps={{
                    textField: { fullWidth: true }
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button onClick={clearFilters} variant="outlined" sx={{ mt: 2 }}>
              Clear Filters
            </Button>
          </Box>

          {!isLoading && <FilterSummary />}
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto', width: '100%' }}>
              {isMobile ? renderMobileInvoiceList() : (
                <TableContainer component={Paper}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell onClick={() => handleSort('invoicenumber')} style={{ cursor: 'pointer' }}>
                          Invoice # {sortConfig.key === 'invoicenumber' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell onClick={() => handleSort('nameOfInvoice')} style={{ cursor: 'pointer' }}>
                          Name {sortConfig.key === 'nameOfInvoice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell onClick={() => handleSort('amount')} style={{ cursor: 'pointer' }}>
                          Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell onClick={() => handleSort('amountPaid')} style={{ cursor: 'pointer' }}>
                          Paid {sortConfig.key === 'amountPaid' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell>Remaining</TableCell>
                        <TableCell onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
                          Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                          Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell onClick={() => handleSort('paymentStatus')} style={{ cursor: 'pointer' }}>
                          Payment {sortConfig.key === 'paymentStatus' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </TableCell>
                        <TableCell>Document</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedInvoices.map((invoice, index) => (
                        <React.Fragment key={`${invoice.invoicenumber}-${index}`}>
                          {renderInvoiceRow(invoice)}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
      {renderInvoiceDetails()}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InvoiceListComponent;
