import React, { useState, useEffect } from 'react';
import {
  Card, CardActionArea, CardContent, Typography, Dialog, DialogTitle,
  DialogContent, List, Box, CircularProgress, Accordion, AccordionSummary, 
  AccordionDetails, Button, TextField, Select, MenuItem, Modal,
  ListItem, ListItemText
} from '@mui/material';
import { styled } from '@mui/system';
import apiCall from './api';
import { useUserData } from './UserContext';
import 'material-icons/iconfont/material-icons.css';

const FileUpload = ({ onFileSelect }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        onFileSelect(base64String, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <input
        accept="image/*,application/pdf"
        style={{ display: 'none' }}
        id="raised-button-file"
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="raised-button-file">
        <Button variant="outlined" component="span" sx={{ color: '#ffffff', borderColor: '#ffffff' }}>
          Upload Delivery Sticker
        </Button>
      </label>
    </Box>
  );
};

const ApprovalStatus = ({ status, onChange }) => {
  const color = status === 'Needed' ? 'error' : status === 'Approved' ? 'success' : 'warning';
  return (
    <Select
      value={status}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      sx={{ color: '#ffffff', bgcolor: color }}
    >
      <MenuItem value="Needed">Needed</MenuItem>
      <MenuItem value="Approved">Approved</MenuItem>
    </Select>
  );
};

const Approvals = ({ onOpenFullApp }) => {
  const { userData } = useUserData();
  const [approvals, setApprovals] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingApproval, setEditingApproval] = useState(null);
  const [calculatingCost, setCalculatingCost] = useState(false);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [expandedPanel, setExpandedPanel] = useState(false);
  const [currentApprovalIndex, setCurrentApprovalIndex] = useState(null);

  const handleFileUpload = async (approvalIndex, shipmentIndex, base64String, fileName) => {
    const updatedApprovals = [...approvals];
    updatedApprovals[approvalIndex].shipments[shipmentIndex].stickerBase64 = base64String;
    updatedApprovals[approvalIndex].shipments[shipmentIndex].stickerFileName = fileName;
    updatedApprovals[approvalIndex].shipments[shipmentIndex].stickerUploaded = true;
    setApprovals(updatedApprovals);
    setEditingApproval(approvalIndex);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setLoading(true);
        const scriptId = 'approvals_script';
        const action = 'getRequests';
        
        const response = await apiCall(scriptId, action, {
          role: userData.role,
          username: userData.username,
          googleToken: userData.googleToken
        });
        
        if (response && response.status === 'success' && Array.isArray(response.data)) {
          setApprovals(response.data);
        } else {
          throw new Error('Unexpected response format');
        }
      } catch (err) {
        console.error('Error in fetchApprovals:', err);
        setError(`Failed to load approvals: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchApprovals();
    }
  }, [userData]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
    if (onOpenFullApp) onOpenFullApp();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingApproval(null);
  };

  const handleEdit = (index) => {
    setEditingApproval(index);
  };

  const handleApprovalChange = (index, newStatus) => {
    const updatedApprovals = [...approvals];
    updatedApprovals[index].approval = newStatus;
    setApprovals(updatedApprovals);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const scriptId = 'approvals_script';
      const action = 'updateApprovals';
      
      const response = await apiCall(scriptId, action, {
        role: userData.role,
        username: userData.username,
        googleToken: userData.googleToken,
        approvals: approvals.map(approval => ({
          ...approval,
          shipments: approval.shipments.map(shipment => ({
            ...shipment,
            stickerBase64: shipment.stickerBase64 || null,
            stickerFileName: shipment.stickerFileName || null
          }))
        }))
      });
      
      if (response && response.status === 'success') {
        console.log('Approvals updated successfully');
        setEditingApproval(null);
      } else {
        throw new Error('Failed to update approvals');
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(`Failed to update approvals: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateCost = async (approvalIndex, shipmentIndex) => {
    try {
      setCalculatingCost(true);
      setCurrentApprovalIndex(approvalIndex);
      const scriptId = 'approvals_script';
      const action = 'calculateShippingCost';
      
      const approval = approvals[approvalIndex];
      const shipment = approval.shipments[shipmentIndex];
      
      const response = await apiCall(scriptId, action, {
        role: userData.role,
        username: userData.username,
        googleToken: userData.googleToken,
        customerDetails: approval.customerDetails,
        orderDetails: approval.orderDetails,
        shipments: {
          dimensions: shipment.dimensions
        }
      });
      
      if (response && response.status === 'success' && Array.isArray(response.data)) {
        setShippingOptions(response.data.map(option => ({ ...option, shipmentIndex })));
      } else {
        throw new Error('Failed to calculate shipping cost');
      }
    } catch (err) {
      console.error('Error in handleCalculateCost:', err);
      setError(`Failed to calculate shipping cost: ${err.message}`);
    } finally {
      setCalculatingCost(false);
    }
  };

  const handleSelectShippingOption = (option) => {
    if (currentApprovalIndex === null) {
      console.error('No approval selected');
      return;
    }

    setApprovals(prevApprovals => {
      const updatedApprovals = [...prevApprovals];
      const approval = { ...updatedApprovals[currentApprovalIndex] };
      const shipment = { ...approval.shipments[option.shipmentIndex] };

      shipment.method = option.deliveryName;
      shipment.shippingPrice = option.discountedPrice;

      approval.shipments[option.shipmentIndex] = shipment;
      updatedApprovals[currentApprovalIndex] = approval;
      return updatedApprovals;
    });

    setShippingOptions([]);
    setEditingApproval(currentApprovalIndex);
  };


  const handleShipmentChange = (approvalIndex, shipmentIndex, field, value) => {
    setApprovals(prevApprovals => {
      const updatedApprovals = [...prevApprovals];
      const approval = { ...updatedApprovals[approvalIndex] };
      const shipment = { ...approval.shipments[shipmentIndex] };
      shipment[field] = value;
      approval.shipments[shipmentIndex] = shipment;
      updatedApprovals[approvalIndex] = approval;
      return updatedApprovals;
    });
  };

  return (
    <>
      <Card sx={{ bgcolor: '#1a1a1a', color: '#ffffff' }}>
        <CardActionArea onClick={handleOpenDialog}>
          <CardContent>
            <Typography variant="h5" component="div">
              Approvals
            </Typography>
            {loading ? (
              <CircularProgress size={20} sx={{ color: '#8b0000' }} />
            ) : error ? (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {approvals.length} pending approvals
              </Typography>
            )}
          </CardContent>
        </CardActionArea>
      </Card>
      
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1a1a1a', color: '#ffffff' }}>Your Pending Approvals</DialogTitle>
        <DialogContent sx={{ bgcolor: '#1a1a1a', color: '#ffffff' }}>
          {loading ? (
            <CircularProgress sx={{ color: '#8b0000' }} />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : approvals.length === 0 ? (
            <Typography sx={{ color: '#cccccc' }}>No pending approvals.</Typography>
          ) : (
            <List>
              {approvals.map((approval, index) => (
                <Accordion 
                  key={index} 
                  expanded={expandedPanel === `panel${index}`}
                  onChange={handleAccordionChange(`panel${index}`)}
                  sx={{ bgcolor: '#2a2a2a', color: '#ffffff', mb: 2 }}
                >
                  <AccordionSummary
                    expandIcon={<span className="material-icons" style={{ color: '#ffffff' }}>expand_more</span>}
                    aria-controls={`panel${index}bh-content`}
                    id={`panel${index}bh-header`}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                      <Typography>Order #{approval.orderNumber}</Typography>
                      <ApprovalStatus 
                        status={approval.approval} 
                        onChange={(newStatus) => handleApprovalChange(index, newStatus)}
                      />
                    </Box>
                  </AccordionSummary>
              <AccordionDetails>
                    <Typography variant="subtitle2" sx={{ color: '#cccccc', mb: 1 }}>Order Details:</Typography>
                    <Typography variant="body2" sx={{ color: '#cccccc' }}>
                      Created by: {approval.orderDetails.createdBy}<br />
                      Total Price: €{approval.orderDetails.totalPrice}<br />
                      Shipping Price: €{approval.orderDetails.shippingPrice}<br />
                      Order Type: {approval.orderDetails.orderType}<br />
                      Status: {approval.status}<br />
                      Person Responsible: {approval.personRes}<br />
                      Created At: {new Date(approval.createdAt).toLocaleString()}<br />
                      Order Details: {approval.orderDetails.orderDetails}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: '#cccccc', mt: 2, mb: 1 }}>Customer Details:</Typography>
                    <Typography variant="body2" sx={{ color: '#cccccc' }}>
                      Name: {approval.customerDetails.name}<br />
                      Username: {approval.customerDetails.username}<br />
                      Email: {approval.customerDetails.email}<br />
                      Address (City): {approval.customerDetails.addressCity}<br />
                      Address (PostCode): {approval.customerDetails.addressPostCode}<br />
                      Address (Street): {approval.customerDetails.addressStreet}<br />
                      Address (Country): {approval.customerDetails.addressCountry}<br />
                    </Typography>
                    {approval.shipments.map((shipment, shipmentIndex) => {
                    const allDimensionsFilled = shipment.dimensions &&
                      shipment.dimensions.length &&
                      shipment.dimensions.width &&
                      shipment.dimensions.height &&
                      shipment.dimensions.weight;

                    if (!allDimensionsFilled) return null;

                    return (
                      <Box key={shipmentIndex} sx={{ mt: 2, p: 2, border: '1px solid #444', borderRadius: '4px' }}>
                        <Typography variant="subtitle2" sx={{ color: '#cccccc', mb: 1 }}>{shipment.name || `Shipment ${shipmentIndex + 1}`}:</Typography>
                        <TextField
                          label="Method"
                          value={shipment.method || ''}
                          onChange={(e) => handleShipmentChange(index, shipmentIndex, 'method', e.target.value)}
                          fullWidth
                          margin="dense"
                          variant="outlined"
                          sx={{ input: { color: '#ffffff' }, label: { color: '#cccccc' } }}
                        />
                        <TextField
                          label="Shipping Price"
                          value={shipment.shippingPrice || ''}
                          onChange={(e) => handleShipmentChange(index, shipmentIndex, 'shippingPrice', e.target.value)}
                          fullWidth
                          margin="dense"
                          variant="outlined"
                          sx={{ input: { color: '#ffffff' }, label: { color: '#cccccc' } }}
                        />
                        <TextField
                          label="Tracking Number"
                          value={shipment.trackingNumber || ''}
                          onChange={(e) => handleShipmentChange(index, shipmentIndex, 'trackingNumber', e.target.value)}
                          fullWidth
                          margin="dense"
                          variant="outlined"
                          sx={{ input: { color: '#ffffff' }, label: { color: '#cccccc' } }}
                        />
                        <Typography variant="body2" sx={{ color: '#cccccc', mt: 1 }}>
                          Dimensions: {shipment.dimensions.length} x {shipment.dimensions.width} x {shipment.dimensions.height}, Weight: {shipment.dimensions.weight}kg
                        </Typography>
                        <FileUpload onFileSelect={(base64String, fileName) => handleFileUpload(index, shipmentIndex, base64String, fileName)} />
                        {shipment.stickerUploaded && (
                          <Typography variant="body2" sx={{ color: '#4caf50', mt: 1 }}>
                            Delivery sticker uploaded: {shipment.stickerFileName}
                          </Typography>
                        )}
                        {!shipment.method && (
                          <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => handleCalculateCost(index, shipmentIndex)}
                            sx={{ mt: 2 }}
                          >
                            Calculate Shipping Cost
                          </Button>
                        )}
                      </Box>
                    );
                  })}
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => handleEdit(index)}
                    sx={{ mt: 2, mr: 1 }}
                  >
                    Edit
                  </Button>
                  {editingApproval === index && (
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      onClick={handleSubmit}
                      sx={{ mt: 2 }}
                    >
                      Submit Changes
                    </Button>
                  )}
                  </AccordionDetails>
                </Accordion>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      <Modal
        open={calculatingCost}
        aria-labelledby="calculating-cost-modal"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: '#1a1a1a',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          color: '#ffffff'
        }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Calculating Shipping Cost
          </Typography>
          <CircularProgress sx={{ color: '#8b0000', mt: 2 }} />
        </Box>
      </Modal>

      <Dialog open={shippingOptions.length > 0} onClose={() => setShippingOptions([])}>
        <DialogTitle sx={{ bgcolor: '#1a1a1a', color: '#ffffff' }}>Select Shipping Option</DialogTitle>
        <DialogContent sx={{ bgcolor: '#1a1a1a', color: '#ffffff' }}>
          <List>
            {shippingOptions.map((option, index) => (
              <ListItem key={index} button onClick={() => handleSelectShippingOption(option)}>
                <ListItemText
                  primary={option.deliveryName}
                  secondary={`Price: €${option.discountedPrice} | Max Weight: ${option.maxWeight}kg | Delivery Date: ${new Date(option.deliveryDate).toLocaleDateString()}`}
                  sx={{ color: '#ffffff', '.MuiListItemText-secondary': { color: '#cccccc' } }}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Approvals;