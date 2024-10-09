import React, { useState } from 'react';
import { 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton, 
  CircularProgress,
  Modal,
  Box
} from '@mui/material';
import OrderEditForm from './OrderEditForm';
import 'material-icons/iconfont/material-icons.css';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 800,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflow: 'auto'
};

const ExistingOrders = ({ orders, loading, error, onEdit, onDelete }) => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedOrder(null);
  };

  const handleSaveEdit = async (editedOrder) => {
    setEditLoading(true);
    const success = await onEdit(editedOrder);
    setEditLoading(false);
    if (success) {
      handleCloseModal();
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  const getOrderNumber = (order) => {
    return order.orderNumber || 'N/A';
  };

  const getOrderType = (order) => {
    return order.orderDetails?.orderType || 'N/A';
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      {orders.length === 0 ? (
        <Typography variant="body1" align="center">There are no orders to display.</Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order Number</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Order Type</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {orders.map((order) => (
              <TableRow key={getOrderNumber(order)}>
                <TableCell>{getOrderNumber(order)}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>{getOrderType(order)}</TableCell>
                <TableCell>
                    <IconButton onClick={() => handleOpenModal(order)}>
                      <span className="material-icons">edit</span>
                    </IconButton>
                    {getOrderType(order) !== 'Shopify' && (
                      <IconButton onClick={() => onDelete(getOrderNumber(order))}>
                        <span className="material-icons">delete</span>
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="edit-order-modal"
      >
        <Box sx={modalStyle}>
          {selectedOrder && (
            <OrderEditForm
              order={selectedOrder}
              onSave={handleSaveEdit}
              onCancel={handleCloseModal}
              loading={editLoading}
            />
          )}
        </Box>
      </Modal>
    </Paper>
  );
};

export default ExistingOrders;