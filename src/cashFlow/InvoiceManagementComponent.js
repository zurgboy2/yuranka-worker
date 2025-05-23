import React, { useState, useEffect, useCallback } from 'react';
import { 
  ThemeProvider, createTheme, 
  CssBaseline, Container, Typography, Box, 
  Button, Card, CardContent, CardHeader,
  TextField, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper,
  Select, MenuItem, InputLabel, FormControl,
  useMediaQuery, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert,
  List, ListItem, ListItemText, Divider, IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import apiCall from '../api';
import { useUserData } from '../UserContext';

// Add Material Symbols font
const materialSymbolsFont = `
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100');
`;

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
          margin: '4px', // Add some margin for better mobile spacing
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          zIndex: 9999,
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
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#ff1744',
        },
      },
    },
  },
});

const InvoiceManagementComponent = () => {
  const { userData } = useUserData();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddInvoiceDialogOpen, setIsAddInvoiceDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [newInvoice, setNewInvoice] = useState({
    nameOfInvoice: '',
    amount: '',
    date: new Date(),
    status: 'In',
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
      setSnackbar({ open: true, message: 'Error fetching invoices', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [userData]);
  
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
  
  const handleInvoiceClick = (invoice) => {
    setSelectedInvoice({...invoice});
  };

  const sortedInvoices = useMemo(() => {
  if (!sortConfig.key) return filteredInvoices;
  
  return [...filteredInvoices].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    
    // Handle date sorting
    if (sortConfig.key === 'date') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    // Handle numeric sorting
    if (sortConfig.key === 'amount' || sortConfig.key === 'amountPaid' || sortConfig.key === 'invoicenumber') {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    }
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
  }, [filteredInvoices, sortConfig]);

  // Add clickable headers
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
        console.log(result.message);
        fetchInvoices(); // Refresh the invoices after saving
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
      fetchInvoices(); // Refresh the invoices after deleting
      setSnackbar({ open: true, message: 'Invoice deleted successfully', severity: 'success' });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      setSnackbar({ open: true, message: 'Error deleting invoice', severity: 'error' });
    } finally {
      setIsLoading(false);
      setSelectedInvoice(null);
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

    const renderMobileInvoiceList = () => (
      <List>
        {filteredInvoices.map((invoice) => (
          <React.Fragment key={invoice.invoicenumber}>
            <ListItem button onClick={() => handleInvoiceClick(invoice)}>
              <ListItemText 
                primary={invoice.nameOfInvoice} 
                secondary={`Amount: €${invoice.amount}`} 
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
                    InputLabelProps: { style: { color: '#ffffff' } },
                    InputProps: {
                      style: { color: '#ffffff' },
                      sx: { 
                        bgcolor: 'rgba(74, 74, 74, 0.8)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#4a4a4a'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#8b0000'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#8b0000'
                        }
                      }
                    }
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
    
    const renderInvoiceRow = (invoice) => (
      <TableRow key={invoice.invoicenumber}>
        <TableCell>{invoice.nameOfInvoice}</TableCell>
        <TableCell>€{invoice.amount}</TableCell>
        <TableCell>€{invoice.amountPaid}</TableCell>
        <TableCell>€{invoice.amountRemaining}</TableCell>
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
          <IconButton onClick={() => handleInvoiceClick(invoice)} size="small">
            <span className="material-symbols-outlined">edit</span>
          </IconButton>
        </TableCell>
      </TableRow>
    );
    
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

      return (
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <style>{materialSymbolsFont}</style>
          <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>            
              <Card>
                <CardHeader 
                  title="Invoices" 
                  action={
                    <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
                      <Button onClick={fetchInvoices} disabled={isLoading} variant="contained" sx={{ mb: isMobile ? 1 : 0, mr: isMobile ? 0 : 1 }}>
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
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" gutterBottom>Start Date</Typography>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          value={startDate ? dayjs(startDate) : null}
                          onChange={(date) => setStartDate(date ? date.toDate() : null)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              InputLabelProps: { style: { color: '#ffffff' } },
                              InputProps: {
                                style: { color: '#ffffff' },
                                sx: { 
                                  bgcolor: 'rgba(74, 74, 74, 0.8)',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#4a4a4a'
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#8b0000'
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#8b0000'
                                  }
                                }
                              }
                            }
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
                            textField: {
                              fullWidth: true,
                              InputLabelProps: { style: { color: '#ffffff' } },
                              InputProps: {
                                style: { color: '#ffffff' },
                                sx: { 
                                  bgcolor: 'rgba(74, 74, 74, 0.8)',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#4a4a4a'
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#8b0000'
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#8b0000'
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </LocalizationProvider>
                    </Box>
                  </Box>
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
                              {sortedInvoices.map(renderInvoiceRow)}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Container>
          {renderInvoiceDetails()}
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
                InputProps={{
                  startAdornment: <Typography>€</Typography>,
                }}
              />
              <Box sx={{ mt: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={newInvoice.date ? dayjs(newInvoice.date) : null}
                    onChange={(date) => handleNewInvoiceDateChange(date ? date.toDate() : null)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        label: "Date",
                        InputLabelProps: { style: { color: '#ffffff' } },
                        InputProps: {
                          style: { color: '#ffffff' },
                          sx: { 
                            bgcolor: 'rgba(74, 74, 74, 0.8)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#4a4a4a'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#8b0000'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#8b0000'
                            }
                          }
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
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