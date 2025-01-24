import React, { useState, useRef } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  TextField,
  Button,
  Box,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import apiCall from '../api';
import { useUserData } from '../UserContext';

const PurchaseAdderComponent = () => {
  const { userData } = useUserData();
  const [purchase, setPurchase] = useState({
    invoiceValue: '',
    nameofpurchase: '',
    dateofpayment: null,
    dateofrelease: null,
    invoiceFile: null
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const fileInputRef = useRef(null);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setPurchase(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, name) => {
    setPurchase(prev => ({ ...prev, [name]: date }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setPurchase(prev => ({ ...prev, invoiceFile: file }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (purchase.invoiceFile && purchase.invoiceValue && purchase.nameofpurchase && purchase.dateofpayment) {
      const reader = new FileReader();
      reader.onloadend = async function() {
        const base64String = reader.result.split(',')[1];
        const data = {
          invoiceFile: base64String,
          mimeType: purchase.invoiceFile.type,
          invoiceValue: purchase.invoiceValue,
          nameofpurchase: purchase.nameofpurchase,
          dateofpayment: dayjs(purchase.dateofpayment).format('YYYY-MM-DD'),
          dateofrelease: purchase.dateofrelease ? dayjs(purchase.dateofrelease).format('YYYY-MM-DD') : ''
        };
  
        try {
          const response = await apiCall('accounting_script', 'trackPurchase', {
            data,
            googleToken: userData.googleToken, 
            username: userData.username 
          });
          
          if (response === "Success") {
            setSnackbar({ open: true, message: "Invoice uploaded and tracked successfully.", severity: 'success' });
            setPurchase({
              invoiceValue: '',
              nameofpurchase: '',
              dateofpayment: null,
              dateofrelease: null,
              invoiceFile: null
            });
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          } else {
            throw new Error(response);
          }
        } catch (error) {
          console.error("Failed to upload and track invoice:", error);
          setSnackbar({ open: true, message: `Failed to upload and track invoice: ${error.message}`, severity: 'error' });
        }
      };
      reader.readAsDataURL(purchase.invoiceFile);
    } else {
      setSnackbar({ open: true, message: "Please fill in all fields.", severity: 'warning' });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card>
        <CardHeader title="Track Purchase" />
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="nameofpurchase"
              label="Name of Purchase"
              value={purchase.nameofpurchase}
              onChange={handleInputChange}
              required
              fullWidth
            />
            <TextField
              name="invoiceValue"
              label="Invoice Value"
              type="number"
              value={purchase.invoiceValue}
              onChange={handleInputChange}
              required
              fullWidth
            />
            <DatePicker
              label="Date of Payment"
              value={purchase.dateofpayment}
              onChange={(date) => handleDateChange(date, 'dateofpayment')}
              format="YYYY-MM-DD"
              slotProps={{ textField: { fullWidth: true, required: true } }}
            />
            <DatePicker
              label="Date of Release (Optional)"
              value={purchase.dateofrelease}
              onChange={(date) => handleDateChange(date, 'dateofrelease')}
              format="YYYY-MM-DD"
              slotProps={{ textField: { fullWidth: true } }}
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx"
              required
            />
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth
            >
              Track Purchase
            </Button>
          </Box>
        </CardContent>
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Card>
    </LocalizationProvider>
  );
};

export default PurchaseAdderComponent;