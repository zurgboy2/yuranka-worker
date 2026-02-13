import React, { useState, useRef } from 'react';
import {
  Box, Typography, Button, Card, CardContent,
  CircularProgress, Snackbar, Alert, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, FormControlLabel
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import apiCall from '../../api';
import { useUserData } from '../../UserContext';

const BulkOrderUploadComponent = () => {
  const { userData } = useUserData();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [orderType, setOrderType] = useState(''); // 'sales' or 'purchased'
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const isValidExtension = ['csv', 'xls', 'xlsx'].includes(fileExtension);

      if (validTypes.includes(file.type) || isValidExtension) {
        setSelectedFile(file);
        // Parse CSV for preview
        if (fileExtension === 'csv') {
          parseCSVPreview(file);
        } else {
          setPreviewData(null); // Can't preview Excel files easily
        }
      } else {
        setSnackbar({
          open: true,
          message: 'Please select a valid CSV or Excel file',
          severity: 'error'
        });
      }
    }
  };

  const parseCSVPreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim());
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index] || '';
          return obj;
        }, {});
      });
      setPreviewData({ headers, rows, totalRows: lines.length - 1 });
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setSnackbar({ open: true, message: 'Please select a file first', severity: 'warning' });
      return;
    }

    // Ensure order type is selected
    if (!orderType) {
      setSnackbar({ open: true, message: 'Please select Order Type: Sales or Purchase', severity: 'warning' });
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result.split(',')[1];
        
        const response = await apiCall('accounting_script', 'uploadCSV', {
          fileBlob: base64String, // backend expects fileBlob
          fileName: selectedFile.name,
          mimeType: selectedFile.type,
          orderType, // 'sales' or 'purchase'
          googleToken: userData.googleToken,
          username: userData.username
        });

        if (response && response.success) {
          setSnackbar({
            open: true,
            message: response.message || `Successfully uploaded ${response.ordersProcessed || 0} orders`,
            severity: 'success'
          });
          setSelectedFile(null);
          setPreviewData(null);
          setOrderType('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          throw new Error(response?.message || 'Upload failed');
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Error uploading file:', error);
      setSnackbar({
        open: true,
        message: `Error uploading file: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setOrderType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Bulk Order Upload
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload a CSV or Excel file containing Cardmarket orders for bulk processing.
          </Typography>

          <Box
            sx={{
              border: '2px dashed',
              borderColor: 'primary.main',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              mb: 3,
              '&:hover': {
                bgcolor: 'rgba(255, 23, 68, 0.08)'
              }
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.xls,.xlsx"
              style={{ display: 'none' }}
            />
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="body1">
              {selectedFile ? selectedFile.name : 'Click to select or drag and drop a file'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supported formats: CSV, XLS, XLSX
            </Typography>
          </Box>

          {previewData && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Preview (showing first 5 of {previewData.totalRows} rows)
              </Typography>
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {previewData.headers.map((header, index) => (
                        <TableCell key={index}>{header}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewData.rows.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {previewData.headers.map((header, cellIndex) => (
                          <TableCell key={cellIndex}>{row[header]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Order Type selection - required */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Order Type (required)</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={orderType === 'sales'}
                    onChange={(e) => setOrderType(e.target.checked ? 'sales' : '')}
                    disabled={uploading}
                    color="primary"
                  />
                }
                label="Sales"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={orderType === 'purchased'}
                    onChange={(e) => setOrderType(e.target.checked ? 'purchased' : '')}
                    disabled={uploading}
                    color="primary"
                  />
                }
                label="Purchased"
              />
            </Box>
            <Typography variant="caption" color="text.secondary">Select exactly one option. Checking one will select it; uncheck to clear.</Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleClear}
              disabled={!selectedFile || uploading}
            >
              Clear
            </Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
            >
              {uploading ? 'Uploading...' : 'Upload Orders'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BulkOrderUploadComponent;
