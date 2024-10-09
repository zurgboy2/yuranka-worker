import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useUserData } from '../UserContext';
import apiCall from '../api.js';
import ExistingOrders from './ExistingOrders';
import OrderForm from './OrderForm';

const OrderManagement = () => {
  const { userData } = useUserData();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [orderDetails, setOrderDetails] = useState({
    orderDetails: '',
    orderType: '',
    totalPrice: '',
    shippingPrice: '',
    status: 'OnGoing',
    approval: 'Needed',
    shipments: [
      {
        name: 'Shipment 1',
        trackingNumber: '',
        method: '',
        shippingPrice: '',
        dimensions: { length: '', width: '', height: '', weight: '' }
      }
    ]
  });

  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    username: '',
    email: '',
    addressCountry: '',
    addressCity: '',
    addressPostCode: '',
    addressStreet: '',
  });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const scriptId = 'orders_script';
      const action = 'getOrders';
      
      const response = await apiCall(scriptId, action, {
        role: userData.role,
        googleToken: userData.googleToken,
        username: userData.username
      });
      
      if (response.status === "success") {
        setOrders(response.data);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error in fetchOrders:', err);
      setError(`Failed to load orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [userData.role, userData.googleToken, userData.username]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const resetForm = () => {
    setOrderDetails({
      orderDetails: '',
      orderType: '',
      totalPrice: '',
      shippingPrice: '',
      status: 'OnGoing',
      approval: 'Needed',
      shipments: [
        {
          name: 'Shipment 1',
          trackingNumber: '',
          method: '',
          shippingPrice: '',
          dimensions: { length: '', width: '', height: '', weight: '' }
        }
      ]
    });
    setCustomerDetails({
      name: '',
      username: '',
      email: '',
      addressCountry: '',
      addressCity: '',
      addressPostCode: '',
      addressStreet: '',
    });
    setSelectedOrder(null);
    setIsEditing(false);
  };


  const handleEdit = async (editedOrder) => {
    try {
      setLoading(true);
      setError(null);
      const scriptId = 'orders_script';
      const action = 'updateOrder';
      
      // The editedOrder should already be in the correct format, so we don't need to transform it
      const response = await apiCall(scriptId, action, {
        orderData: editedOrder,
        orderId: editedOrder.orderNumber, // Assuming orderNumber is used as the ID
        username: userData.username,
        googleToken: userData.googleToken
      });
      
      if (response.status === "success") {
        await fetchOrders();
        return true; // Indicate success
      } else {
        throw new Error(response.message || 'Failed to update order');
      }
    } catch (err) {
      console.error('Error in handleEdit:', err);
      setError(`Failed to update order: ${err.message}`);
      return false; // Indicate failure
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      const scriptId = 'orders_script';
      const action = 'deleteOrder';
      
      const response = await apiCall(scriptId, action, {
        orderId,
        role: userData.role,
        googleToken: userData.googleToken,
        username: userData.username
      });
      
      if (response.status === "success") {
        await fetchOrders();
      } else {
        throw new Error(response.message || 'Failed to delete order');
      }
    } catch (err) {
      console.error('Error in handleDelete:', err);
      setError(`Failed to delete order: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (section, field, value) => {
    if (section === 'orderDetails') {
      if (field === 'shipments') {
        setOrderDetails(prev => ({ ...prev, shipments: value }));
      } else if (field.startsWith('shipments.')) {
        const [, index, shipmentField, dimensionField] = field.split('.');
        setOrderDetails(prev => ({
          ...prev,
          shipments: prev.shipments.map((shipment, i) => {
            if (i === parseInt(index)) {
              if (dimensionField) {
                return {
                  ...shipment,
                  dimensions: {
                    ...shipment.dimensions,
                    [dimensionField]: value
                  }
                };
              } else {
                return { ...shipment, [shipmentField]: value };
              }
            }
            return shipment;
          })
        }));
      } else {
        setOrderDetails(prev => ({ ...prev, [field]: value }));
      }
    } else if (section === 'customerDetails') {
      setCustomerDetails(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      const scriptId = 'orders_script';
      const action = isEditing ? 'updateOrder' : 'createOrder';
      
      const formattedOrderData = {
        ...orderDetails,
        shipments: orderDetails.shipments.map(shipment => ({
          ...shipment,
          dimensions: {
            length: shipment.dimensions.length,
            width: shipment.dimensions.width,
            height: shipment.dimensions.height,
            weight: shipment.dimensions.weight
          }
        }))
      };
  
      const formattedCustomerData = Object.fromEntries(
        Object.entries(customerDetails).map(([key, value]) => [key, value])
      );
  
      const response = await apiCall(scriptId, action, {
        orderData: formattedOrderData,
        customerData: formattedCustomerData,
        orderId: isEditing ? selectedOrder.id : undefined,
        username: userData.username,
        googleToken: userData.googleToken
      });
      
      if (response.status === "success") {
        await fetchOrders();
        resetForm();
        setIsEditing(false);
      } else {
        throw new Error(response.message || 'Failed to save order');
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(`Failed to ${isEditing ? 'update' : 'add'} order: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>Order Management</Typography>
      
      <ExistingOrders 
        orders={orders}
        loading={loading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <OrderForm 
        orderDetails={orderDetails}
        customerDetails={customerDetails}
        isEditing={isEditing}
        onSubmit={handleSubmit}
        onChange={handleFormChange}
        onReset={resetForm}
      />
    </Box>
  );
};

export default OrderManagement;