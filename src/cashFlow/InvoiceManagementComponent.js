import React, { useState, useEffect, useCallback } from 'react';
import { 
  ThemeProvider, createTheme, 
  CssBaseline, Container, Typography, Box, 
  Button, Card, CardContent, CardHeader,
  TextField, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper,
  Select, MenuItem, InputLabel, FormControl,
  useMediaQuery, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert
} from '@mui/material';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, parse, isValid } from 'date-fns';
import apiCall from '../api';
import { useUserData } from '../UserContext';

const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#ff1744',
      },
      secondary: {
        main: '#b71c1c',
      },
      background: {
        default: '#000000',
        paper: '#121212',
      },
      text: {
        primary: '#ff1744',
        secondary: '#f44336',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            color: '#000000',
            backgroundColor: '#ff1744',
            '&:hover': {
              backgroundColor: '#b71c1c',
            },
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            zIndex: 9999, // Ensure popover (including date picker) appears above other elements
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: '1px solid #b71c1c',
            whiteSpace: 'nowrap',
            padding: '8px 16px',
          },
        },
      },
    },
  });

  const datePickerStyles = `
    .react-datepicker-popper {
        z-index: 9999 !important;
    }
    `;


    const InvoiceManagementComponent = () => {
        const { userData } = useUserData(); // Use the userData context
        const [invoices, setInvoices] = useState([]);
        const [filteredInvoices, setFilteredInvoices] = useState([]);
        const [statusFilter, setStatusFilter] = useState('All');
        const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
        const [startDate, setStartDate] = useState(null);
        const [endDate, setEndDate] = useState(null);
        const [isLoading, setIsLoading] = useState(false);
        const [isAddInvoiceDialogOpen, setIsAddInvoiceDialogOpen] = useState(false);
        const [newInvoice, setNewInvoice] = useState({
          nameOfInvoice: '',
          amount: '',
          date: new Date(),
          status: 'In', // Default status
        });
        const isMobile = useMediaQuery(darkTheme.breakpoints.down('sm'));
        const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
    const fetchInvoices = useCallback(async () => {
      setIsLoading(true);
      try {
        const fetchedInvoices = await apiCall('accounting_script', 'getInvoices', {
          googleToken: userData.googleToken, 
          username: userData.username 
        });
        setInvoices(fetchedInvoices);
        setFilteredInvoices(fetchedInvoices);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setIsLoading(false);
      }
    }, [userData]);
  
    useEffect(() => {
      fetchInvoices();
    }, [fetchInvoices]);
  
    const parseDate = (dateString) => {
      if (!dateString) return null;
      const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
      return isValid(parsedDate) ? parsedDate : null;
    };
  
    const formatDate = (date) => {
      return date ? format(date, 'yyyy-MM-dd') : '';
    };
  
    const applyFilters = useCallback(() => {
      const filtered = invoices.filter(invoice => {
        const statusMatch = statusFilter === 'All' || invoice.status === statusFilter;
        const paymentStatusMatch = paymentStatusFilter === 'All' || invoice.paymentStatus === paymentStatusFilter;
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
  
    const handleAmountPaidChange = (index, value) => {
      const updatedInvoices = [...filteredInvoices];
      updatedInvoices[index].amountPaid = parseFloat(value) || 0;
      setFilteredInvoices(updatedInvoices);
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
          console.log(result.message);
          fetchInvoices(); // Refresh the invoices after saving
        } else {
          console.error(result.message);
          // Handle the error, maybe show a message to the user
        }
      } catch (error) {
        console.error("Error saving invoice:", error);
        // Handle the error, maybe show a message to the user
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleAddInvoiceOpen = () => {
        setIsAddInvoiceDialogOpen(true);
      };
    
      const handleAddInvoiceClose = () => {
        setIsAddInvoiceDialogOpen(false);
        setNewInvoice({
          nameOfInvoice: '',
          amount: '',
          date: new Date(),
          status: 'In',
        });
      };
    
      const handleNewInvoiceChange = (event) => {
        const { name, value } = event.target;
        setNewInvoice(prev => ({ ...prev, [name]: value }));
      };
    
      const handleNewInvoiceDateChange = (date) => {
        setNewInvoice(prev => ({ ...prev, date }));
      };
    
      const handleAddInvoiceSubmit = async () => {
        setIsLoading(true);
        try {
          const response = await apiCall('accounting_script', 'AddingInvoice', {
            ...newInvoice,
            date: formatDate(newInvoice.date),
            googleToken: userData.googleToken, 
            username: userData.username 
          });
          
          if (response.success) {
            console.log('Invoice added:', response);
            setSnackbar({ open: true, message: `Invoice added successfully. Invoice number: ${response.invoiceNumber}`, severity: 'success' });
            handleAddInvoiceClose();
            fetchInvoices(); // Refresh the invoice list
          } else {
            throw new Error(response.error || 'Failed to add invoice');
          }
        } catch (error) {
          console.error("Error adding invoice:", error);
          setSnackbar({ open: true, message: `Error adding invoice: ${error.message}`, severity: 'error' });
        } finally {
          setIsLoading(false);
        }
      };
    
      const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setSnackbar({ ...snackbar, open: false });
      };

      const deleteInvoice = async (invoiceId) => {
        setIsLoading(true);
        try {
          await apiCall('accounting_script', 'deleteInvoice', { 
            invoiceId,           
            googleToken: userData.googleToken, 
            username: userData.username });
          fetchInvoices(); // Refresh the invoices after deleting
        } catch (error) {
          console.error("Error deleting invoice:", error);
          // You might want to show an error message to the user here
        } finally {
          setIsLoading(false);
        }
      };
  
    const renderInvoiceRow = (invoice, index) => (
      <TableRow key={invoice.invoicenumber}>
        <TableCell>{invoice.nameOfInvoice}</TableCell>
        <TableCell>{invoice.amount}</TableCell>
        <TableCell>
          <TextField
            type="number"
            value={invoice.amountPaid}
            onChange={(e) => handleAmountPaidChange(index, e.target.value)}
            variant="outlined"
            size="small"
          />
        </TableCell>
        <TableCell>{invoice.amountRemaining}</TableCell>
        <TableCell>{invoice.date}</TableCell>
        <TableCell>{invoice.paymentStatus}</TableCell>
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
          <Button onClick={() => saveInvoice(invoice)} variant="contained" size="small">
            Save
          </Button>
          <Button onClick={() => deleteInvoice(invoice.invoicenumber)} variant="contained" color="error" size="small">
          Delete
        </Button>
        </TableCell>
      </TableRow>
    );
  
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <style>{datePickerStyles}</style>
        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>            
            <Card>
              <CardHeader 
                title="Invoices" 
                action={
                  <Box>
                    <Button onClick={fetchInvoices} disabled={isLoading} variant="contained" sx={{ mr: 2 }}>
                      Refresh Invoices
                    </Button>
                    <Button onClick={handleAddInvoiceOpen} variant="contained">
                    Add New Invoice
                  </Button>
                  </Box>
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
                  <div style={{ flex: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>Start Date</Typography>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      dateFormat="yyyy-MM-dd"
                      customInput={<TextField fullWidth />}
                      popperProps={{ strategy: "fixed" }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>End Date</Typography>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate}
                      dateFormat="yyyy-MM-dd"
                      customInput={<TextField fullWidth />}
                      popperProps={{ strategy: "fixed" }}
                    />
                  </div>
                </Box>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box sx={{ overflowX: 'auto', width: '100%' }}>
                    <TableContainer component={Paper}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Name of Invoice</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Amount Paid</TableCell>
                            <TableCell>Amount Remaining</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Payment Status</TableCell>
                            <TableCell>Document</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredInvoices.map(renderInvoiceRow)}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Container>
            <Dialog open={isAddInvoiceDialogOpen} onClose={handleAddInvoiceClose}>
            <DialogTitle>Add New Invoice</DialogTitle>
            <DialogContent>
            <TextField
                autoFocus
                margin="dense"
                name="nameOfInvoice"
                label="Name of Invoice"
                type="text"
                fullWidth
                variant="outlined"
                value={newInvoice.nameOfInvoice}
                onChange={handleNewInvoiceChange}
            />
            <TextField
                margin="dense"
                name="amount"
                label="Amount"
                type="number"
                fullWidth
                variant="outlined"
                value={newInvoice.amount}
                onChange={handleNewInvoiceChange}
            />
            <Box sx={{ mt: 2 }}>
                <DatePicker
                selected={newInvoice.date}
                onChange={handleNewInvoiceDateChange}
                dateFormat="yyyy-MM-dd"
                customInput={<TextField fullWidth label="Date" />}
                />
            </Box>
            <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="invoice-status-label">Status</InputLabel>
                <Select
                labelId="invoice-status-label"
                name="status"
                value={newInvoice.status}
                onChange={handleNewInvoiceChange}
                label="Status"
                >
                <MenuItem value="In">In</MenuItem>
                <MenuItem value="Out">Out</MenuItem>
                </Select>
            </FormControl>
            </DialogContent>
            <DialogActions>
            <Button onClick={handleAddInvoiceClose}>Cancel</Button>
            <Button onClick={handleAddInvoiceSubmit} variant="contained">Add Invoice</Button>
            </DialogActions>
        </Dialog>
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      </ThemeProvider>
    );
  };
  
  export default InvoiceManagementComponent;